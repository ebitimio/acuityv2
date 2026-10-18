/* eslint-disable @typescript-eslint/no-explicit-any */
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { createClient } from "./client";
import type { Account, AjoGroup, Asset, Bill, Fund, HomeMetrics, Txn } from "@/lib/types";

const toMinor = (n: number) => Math.round(n * 100);
const TX_SELECT = "id,amount_minor,direction,description_clean,description_raw,category_name,date,parent_id,account_id,account:accounts(name,institution)";
const TX_FLAT = "id,amount_minor,direction,description_clean,description_raw,category_name,date,account_id";
const NOT_SPLIT = 'category_name.is.null,category_name.neq."Split Parent"';
const KEY = "acuity:activeWorkspace";

let cache: { userId: string; workspaceId: string } | null = null;
export function clearDataCache() { cache = null; }

async function ctx() {
  const sb = createClient();
  const { data: { session } } = await sb.auth.getSession();
  const user = session?.user;
  if (!user) { cache = null; throw new Error("Not logged in"); }

  // localStorage is the source of truth for active workspace
  let stored: string | null = null;
  try { stored = typeof window !== "undefined" ? localStorage.getItem(KEY) : null; } catch {}

  const cacheKey = `${user.id}|${stored ?? ""}`;
  if (cache && `${cache.userId}|${cache.workspaceId}` === cacheKey) {
    return { sb, user, workspaceId: cache.workspaceId };
  }

  if (stored) {
    const { data } = await sb.from("workspaces").select("id").eq("id", stored).eq("owner_id", user.id).maybeSingle();
    if (data) {
      cache = { userId: user.id, workspaceId: data.id };
      return { sb, user, workspaceId: data.id };
    }
    try { localStorage.removeItem(KEY); } catch {}
  }

  const { data: ws, error } = await sb.from("workspaces").select("id").eq("owner_id", user.id).order("created_at").limit(1).single();
  if (error || !ws) throw new Error("Workspace not found");
  cache = { userId: user.id, workspaceId: ws.id };
  try { if (typeof window !== "undefined") localStorage.setItem(KEY, ws.id); } catch {}
  return { sb, user, workspaceId: ws.id };
}

async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: any[] | null; error: any }>): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < 30; i++) {
    const { data, error } = await build(i * 1000, i * 1000 + 999);
    if (error) throw error;
    out.push(...((data ?? []) as T[]));
    if (!data || data.length < 1000) break;
  }
  return out;
}

async function list<T>(table: string, order = "created_at", asc = true): Promise<T[]> {
  const { sb, workspaceId } = await ctx();
  const { data, error } = await sb.from(table).select("*").eq("workspace_id", workspaceId).order(order, { ascending: asc });
  if (error) throw error;
  return (data ?? []) as T[];
}

async function insertRow(table: string, row: Record<string, unknown>) {
  const { sb, workspaceId } = await ctx();
  const { error } = await sb.from(table).insert({ ...row, workspace_id: workspaceId });
  if (error) throw error;
}

async function patchRow(table: string, id: string, row: Record<string, unknown>) {
  const { sb } = await ctx();
  const { error } = await sb.from(table).update(row).eq("id", id);
  if (error) throw error;
}

async function removeRow(table: string, id: string) {
  const { sb } = await ctx();
  const { error } = await sb.from(table).delete().eq("id", id);
  if (error) throw error;
}

export async function getHomeMetrics(): Promise<HomeMetrics> {
  const { sb } = await ctx();
  const { data, error } = await sb.rpc("get_home_metrics");
  if (error) throw error;
  return data as HomeMetrics;
}

export async function getRecentTransactions(limit = 20): Promise<Txn[]> {
  const { sb } = await ctx();
  const { data, error } = await sb.from("transactions").select(TX_SELECT).or(NOT_SPLIT).order("date", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as Txn[];
}

export async function getTransactions(o: { search?: string; category?: string; direction?: "debit" | "credit"; limit?: number; offset?: number } = {}): Promise<{ rows: Txn[]; count: number }> {
  const { sb } = await ctx();
  const limit = o.limit ?? 30;
  const offset = o.offset ?? 0;
  let q = sb.from("transactions").select(TX_SELECT, { count: "exact" }).or(NOT_SPLIT);
  if (o.category) q = q.eq("category_name", o.category);
  if (o.direction) q = q.eq("direction", o.direction);
  const s = o.search?.replace(/[,()%*]/g, " ").trim();
  if (s) q = q.or(`description_clean.ilike.%${s}%,description_raw.ilike.%${s}%`);
  const { data, error, count } = await q.order("date", { ascending: false }).range(offset, offset + limit - 1);
  if (error) throw error;
  return { rows: (data ?? []) as unknown as Txn[], count: count ?? 0 };
}

export async function getTransactionsSince(sinceISO: string): Promise<Txn[]> {
  const { sb } = await ctx();
  return fetchAll<Txn>((f, t) => sb.from("transactions").select(TX_FLAT).or(NOT_SPLIT).gte("date", sinceISO).order("date", { ascending: false }).range(f, t));
}

export async function getAllTransactions(): Promise<Txn[]> {
  const { sb } = await ctx();
  return fetchAll<Txn>((f, t) => sb.from("transactions").select(TX_SELECT).or(NOT_SPLIT).order("date", { ascending: false }).range(f, t));
}

export async function createTransaction(i: { account_id: string; amount: number; direction: "debit" | "credit"; description: string; category: string; date: string }) {
  const { sb } = await ctx();
  const { error } = await sb.from("transactions").insert({ account_id: i.account_id, amount_minor: toMinor(i.amount), direction: i.direction, description_raw: i.description, description_clean: i.description, category_name: i.category, date: i.date });
  if (error) throw error;
}

export async function updateTransaction(id: string, patch: { description_clean?: string; category_name?: string }) { await patchRow("transactions", id, patch); }

export async function bulkSetCategory(ids: string[], category: string) {
  if (!ids.length) return;
  const { sb } = await ctx();
  const { error } = await sb.from("transactions").update({ category_name: category }).in("id", ids);
  if (error) throw error;
}

export async function deleteTransaction(id: string) { await removeRow("transactions", id); }

export async function splitTransaction(parent: Pick<Txn, "id" | "account_id" | "direction" | "description_raw" | "description_clean" | "date">, parts: { category: string; amount: number }[]) {
  const { sb } = await ctx();
  const { error: e1 } = await sb.from("transactions").insert(parts.map((p) => ({ account_id: parent.account_id, amount_minor: toMinor(p.amount), direction: parent.direction, description_raw: parent.description_raw, description_clean: `${parent.description_clean ?? "Transaction"} (split)`, category_name: p.category, date: parent.date, parent_id: parent.id })));
  if (e1) throw e1;
  const { error: e2 } = await sb.from("transactions").update({ category_name: "Split Parent" }).eq("id", parent.id);
  if (e2) throw e2;
}

export async function getAccounts(): Promise<Account[]> {
  const { sb, workspaceId } = await ctx();
  const [{ data: accs, error }, { data: bal }] = await Promise.all([sb.from("accounts").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: true }), sb.rpc("get_account_balances")]);
  if (error) throw error;
  const map = new Map<string, number>(((bal ?? []) as { account_id: string; current_minor: number }[]).map((b) => [b.account_id, Number(b.current_minor)]));
  return ((accs ?? []) as Account[]).map((a) => ({ ...a, current_minor: map.get(a.id) ?? a.balance_minor }));
}

export async function createAccount(name: string, institution: string, type: string, openingBalance: number) { await insertRow("accounts", { name, institution, type, balance_minor: toMinor(openingBalance) }); }
export async function updateAccount(id: string, p: { name: string; institution: string; type: string; openingBalance: number }) { await patchRow("accounts", id, { name: p.name, institution: p.institution, type: p.type, balance_minor: toMinor(p.openingBalance) }); }
export async function deleteAccount(id: string) { await removeRow("accounts", id); }

export const getAssets = () => list<Asset>("assets");
export const addAsset = (name: string, type: "asset" | "liability", value: number) => insertRow("assets", { name, type, value_minor: toMinor(value) });
export const deleteAsset = (id: string) => removeRow("assets", id);

export async function updateBudgetLimit(newLimit: number) {
  const { sb, workspaceId } = await ctx();
  const { error } = await sb.from("workspaces").update({ budget_limit_minor: toMinor(newLimit) }).eq("id", workspaceId);
  if (error) throw error;
}

export async function getCategoryBudgets(): Promise<Record<string, number>> {
  const { sb, workspaceId } = await ctx();
  const { data, error } = await sb.from("workspaces").select("category_budgets").eq("id", workspaceId).single();
  if (error) throw error;
  return ((data?.category_budgets ?? {}) as Record<string, number>) || {};
}

export async function setCategoryBudgets(b: Record<string, number>) {
  const { sb, workspaceId } = await ctx();
  const { error } = await sb.from("workspaces").update({ category_budgets: b }).eq("id", workspaceId);
  if (error) throw error;
}

export const getBills = async () => (await list<Bill>("bills", "due_day")) as Bill[];
export const addBill = (name: string, amount: number, dueDay: number) => insertRow("bills", { name, amount_minor: toMinor(amount), due_day: dueDay });
export const setBillPaid = (id: string, paid: boolean) => patchRow("bills", id, { last_paid_at: paid ? new Date().toISOString() : null });
export const deleteBill = (id: string) => removeRow("bills", id);

export const getFunds = () => list<Fund>("sinking_funds");
export const addFund = (name: string, target: number, saved: number, targetDate: string | null) => insertRow("sinking_funds", { name, target_minor: toMinor(target), saved_minor: toMinor(saved), target_date: targetDate || null });
export const addToFund = (fund: Fund, amount: number) => patchRow("sinking_funds", fund.id, { saved_minor: fund.saved_minor + toMinor(amount) });
export const deleteFund = (id: string) => removeRow("sinking_funds", id);

export async function getFamilySupport() {
  const { sb, workspaceId } = await ctx();
  const { data, error } = await sb.from("workspaces").select("family_support_minor,family_support_label").eq("id", workspaceId).single();
  if (error) throw error;
  return { amount_minor: Number(data?.family_support_minor ?? 0), label: (data?.family_support_label as string) ?? "" };
}

export async function setFamilySupport(amount: number, label: string) {
  const { sb, workspaceId } = await ctx();
  const { error } = await sb.from("workspaces").update({ family_support_minor: toMinor(amount), family_support_label: label }).eq("id", workspaceId);
  if (error) throw error;
}

export const getAjoGroups = () => list<AjoGroup>("ajo_groups");
export const addAjoGroup = (g: { name: string; contribution: number; frequency: "weekly" | "monthly"; members: number; position: number }) => insertRow("ajo_groups", { name: g.name, contribution_minor: toMinor(g.contribution), frequency: g.frequency, members: g.members, my_position: g.position });
export const recordAjoPayment = (g: AjoGroup) => patchRow("ajo_groups", g.id, { paid_cycles: Math.min(g.paid_cycles + 1, g.members) });
export const deleteAjoGroup = (id: string) => removeRow("ajo_groups", id);

export async function importStatement(file: File, accountId?: string): Promise<{ inserted: number; skipped: number }> {
  const { sb, workspaceId } = await ctx();
  let accId = accountId;
  if (!accId) {
    const { data: accs } = await sb.from("accounts").select("id").eq("workspace_id", workspaceId).order("created_at").limit(1);
    accId = accs?.[0]?.id;
    if (!accId) {
      const { data: created, error } = await sb.from("accounts").insert({ workspace_id: workspaceId, name: "Imported Account", institution: "Bank Statement", type: "checking" }).select("id").single();
      if (error) throw error;
      accId = created.id;
    }
  }
  const targetAccount = accId as string;

  const name = file.name.toLowerCase();
  let rows: Record<string, any>[];

  if (name.endsWith(".csv")) {
    rows = await new Promise<Record<string, any>[]>((resolve, reject) =>
      Papa.parse<Record<string, any>>(file, { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim(), complete: (r) => resolve(r.data), error: (e) => reject(e) })
    );
  } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    if (!sheet) throw new Error("The Excel file has no sheets.");
    const raw = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
    rows = raw.map((r) => {
      const out: Record<string, any> = {};
      for (const k of Object.keys(r)) out[k.trim()] = r[k];
      return out;
    });
  } else {
    throw new Error("Please upload a .csv, .xlsx, or .xls file.");
  }

  if (!rows || rows.length === 0) throw new Error("The file is empty or unreadable.");

  const parsed = rows.map((r) => rowToTxn(r, targetAccount)).filter((t): t is NonNullable<typeof t> => t !== null);
  if (parsed.length === 0) throw new Error("No valid transactions found. Check the column names in your statement.");

  const times = parsed.map((p) => p.date).sort();
  const existing = await fetchAll<{ date: string; amount_minor: number; direction: string; description_raw: string | null }>((f, t) =>
    sb.from("transactions").select("date,amount_minor,direction,description_raw").eq("account_id", targetAccount).gte("date", times[0]).lte("date", times[times.length - 1]).range(f, t)
  );
  const key = (d: string, a: number, dir: string, raw: string | null) => `${new Date(d).getTime()}|${a}|${dir}|${(raw ?? "").trim()}`;
  const seen = new Set(existing.map((e) => key(e.date, e.amount_minor, e.direction, e.description_raw)));
  const fresh = parsed.filter((p) => !seen.has(key(p.date, p.amount_minor, p.direction, p.description_raw)));

  for (let i = 0; i < fresh.length; i += 500) {
    const { error } = await sb.from("transactions").insert(fresh.slice(i, i + 500));
    if (error) throw error;
  }
  return { inserted: fresh.length, skipped: parsed.length - fresh.length };
}

export const importCsvStatement = importStatement;

function rowToTxn(row: Record<string, any>, accountId: string) {
  const pick = (...keys: string[]) => { for (const k of keys) if (row[k] !== undefined && row[k] !== "") return row[k]; return undefined; };
  const rawDate = pick("Date/Time", "Date", "Trans Date", "Transaction Date", "Value Date", "Posted Date", "date");
  const desc = pick("Description", "To/From", "Narration", "Narrative", "Details", "Transaction Details", "Remarks", "Particulars", "description");
  const clean = (v: any) => (v ? parseFloat(v.toString().replace(/[₦,\s]/g, "")) || 0 : 0);
  const moneyIn = clean(pick("Money In", "Credit", "Credits"));
  const moneyOut = clean(pick("Money Out", "Debit", "Debits"));
  const general = clean(pick("Amount", "Value"));
  let amount = 0;
  if (moneyIn > 0) amount = moneyIn;
  else if (moneyOut > 0) amount = -moneyOut;
  else if (general !== 0) amount = general;
  if (!amount || isNaN(amount)) return null;
  const raw = desc ? String(desc) : "Unknown Transaction";
  return { account_id: accountId, amount_minor: Math.abs(Math.round(amount * 100)), direction: amount > 0 ? "credit" : "debit", description_raw: raw, description_clean: cleanMerchantName(raw), category_name: autoCategorize(raw), date: parseDate(rawDate) };
}

function parseDate(dateString: any): string {
  if (!dateString) return new Date().toISOString();
  const str = String(dateString).trim();
  const [datePart, timePart = "00:00:00"] = str.split(" ");
  const [h = 0, m = 0, s = 0] = timePart.split(":").map((x) => parseInt(x) || 0);
  const dmy = datePart.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmy) { let year = parseInt(dmy[3]); if (year < 100) year += 2000; const d = new Date(year, parseInt(dmy[2]) - 1, parseInt(dmy[1]), h, m, s); if (!isNaN(d.getTime())) return d.toISOString(); }
  const ymd = datePart.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymd) { const d = new Date(parseInt(ymd[1]), parseInt(ymd[2]) - 1, parseInt(ymd[3]), h, m, s); if (!isNaN(d.getTime())) return d.toISOString(); }
  const fallback = new Date(str);
  return !isNaN(fallback.getTime()) ? fallback.toISOString() : new Date().toISOString();
}

function cleanMerchantName(raw: string) {
  const clean = raw.replace(/NIP\/FRM\//g, "").replace(/\/[A-Z0-9]{10,}\//g, " ").replace(/POS PURCHASE/g, "").replace(/TRF\//g, "").replace(/\s+/g, " ").trim();
  return (clean || raw).split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function autoCategorize(description: string): string {
  const d = description.toUpperCase();
  const has = (...k: string[]) => k.some((x) => d.includes(x));
  if (has("STAMP DUTY", "SMS ALERT", "SMS CHARGE", "COMMISSION", "MAINTENANCE FEE", "VAT ", "BANK CHARGE", "TRANSFER FEE")) return "Bank Charges";
  if (has("SALARY", "PAYROLL")) return "Income";
  if (has("SHOPRITE", "MARKET", "GROCERY", "SPAR ", "JUSTRITE")) return "Groceries";
  if (has("UBER", "BOLT", "TAXIFY", "INDRIVE")) return "Transport";
  if (has("NETFLIX", "SPOTIFY", "APPLE", "YOUTUBE", "SHOWMAX", "DSTV", "GOTV")) return "Subscriptions";
  if (has("NNPC", "FUEL", "TOTAL ENERGIES", "OANDO", "MRS ")) return "Fuel";
  if (has("KFC", "DOMINO", "CHICKEN REPUBLIC", "RESTAURANT", "MR BIGGS", "EATERY", "FOODCO")) return "Food & Dining";
  if (has("MTN", "AIRTEL", "GLO ", "9MOBILE", "AIRTIME", "DATA ", "IKEDC", "EKEDC", "ELECTRIC", "PHCN", "PREPAID")) return "Bills & Utilities";
  if (has("TRANSFER", "TRF")) return "Transfers";
  return "Uncategorized";
}