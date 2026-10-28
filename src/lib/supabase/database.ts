/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "./client";
import type {
  Account, AjoGroup, Asset, Budget, CustomCategory, CategoryRule, Fund,
  HomeMetrics, RecurringItem, Txn,
} from "@/lib/types";

const toMinor = (n: number) => Math.round(n * 100);
const KEY = "acuity:activeWorkspace";

const TX_SELECT =
  "id,amount_minor,direction,description_clean,description_raw,category_name,date,parent_id,account_id,source,status,recurring_id,notes,account:accounts(name,institution)";
const TX_FLAT =
  "id,amount_minor,direction,description_clean,description_raw,category_name,date,account_id";
const NOT_SPLIT = 'category_name.is.null,category_name.neq."Split Parent"';

export function clearDataCache() {
  // No-op. Workspace is always read fresh from localStorage.
}

async function ctx() {
  const sb = createClient();
  const { data: { session } } = await sb.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("Not logged in");

  let stored: string | null = null;
  try { stored = typeof window !== "undefined" ? localStorage.getItem(KEY) : null; } catch {}

  if (stored) {
    const { data } = await sb.from("workspaces").select("id").eq("id", stored).eq("owner_id", user.id).maybeSingle();
    if (data) return { sb, user, workspaceId: data.id };
    try { localStorage.removeItem(KEY); } catch {}
  }

  const { data: ws, error } = await sb.from("workspaces").select("id").eq("owner_id", user.id).order("created_at").limit(1).single();
  if (error || !ws) throw new Error("Workspace not found");
  
  try { if (typeof window !== "undefined") localStorage.setItem(KEY, ws.id); } catch {}
  return { sb, user, workspaceId: ws.id };
}

// Helper to get all account IDs for the active workspace
async function getWorkspaceAccountIds(sb: any, workspaceId: string): Promise<string[]> {
  const { data, error } = await sb.from("accounts").select("id").eq("workspace_id", workspaceId);
  if (error) throw error;
  return (data ?? []).map((a: { id: string }) => a.id);
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

/* ---------- metrics ---------- */

export async function getHomeMetrics(): Promise<HomeMetrics> {
  const { sb, workspaceId } = await ctx();
  const { data, error } = await sb.rpc("get_home_metrics", { p_workspace_id: workspaceId });
  if (error) throw error;
  return data as HomeMetrics;
}

/* ---------- transactions ---------- */

export async function getRecentTransactions(limit = 20): Promise<Txn[]> {
  const { sb, workspaceId } = await ctx();
  const accountIds = await getWorkspaceAccountIds(sb, workspaceId);
  if (accountIds.length === 0) return [];

  const { data, error } = await sb.from("transactions")
    .select(TX_SELECT)
    .in("account_id", accountIds)
    .or(NOT_SPLIT)
    .eq("status", "posted")
    .order("date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as Txn[];
}

export async function getTransactions(o: { search?: string; category?: string; direction?: "debit" | "credit"; limit?: number; offset?: number } = {}): Promise<{ rows: Txn[]; count: number }> {
  const { sb, workspaceId } = await ctx();
  const accountIds = await getWorkspaceAccountIds(sb, workspaceId);
  if (accountIds.length === 0) return { rows: [], count: 0 };

  const limit = o.limit ?? 30;
  const offset = o.offset ?? 0;
  let q = sb.from("transactions").select(TX_SELECT, { count: "exact" }).in("account_id", accountIds).or(NOT_SPLIT);
  if (o.category) q = q.eq("category_name", o.category);
  if (o.direction) q = q.eq("direction", o.direction);
  const s = o.search?.replace(/[,()%*]/g, " ").trim();
  if (s) q = q.or(`description_clean.ilike.%${s}%,description_raw.ilike.%${s}%`);
  const { data, error, count } = await q.order("date", { ascending: false }).range(offset, offset + limit - 1);
  if (error) throw error;
  return { rows: (data ?? []) as unknown as Txn[], count: count ?? 0 };
}

export async function getTransactionsSince(sinceISO: string): Promise<Txn[]> {
  const { sb, workspaceId } = await ctx();
  const accountIds = await getWorkspaceAccountIds(sb, workspaceId);
  if (accountIds.length === 0) return [];

  return fetchAll<Txn>((f, t) =>
    sb.from("transactions").select(TX_FLAT).in("account_id", accountIds).or(NOT_SPLIT).eq("status", "posted").gte("date", sinceISO)
      .order("date", { ascending: false }).range(f, t)
  );
}

export async function getAllTransactions(): Promise<Txn[]> {
  const { sb, workspaceId } = await ctx();
  const accountIds = await getWorkspaceAccountIds(sb, workspaceId);
  if (accountIds.length === 0) return [];

  return fetchAll<Txn>((f, t) =>
    sb.from("transactions").select(TX_SELECT).in("account_id", accountIds).or(NOT_SPLIT).eq("status", "posted")
      .order("date", { ascending: false }).range(f, t)
  );
}

export async function createTransaction(i: {
  account_id: string;
  amount: number;
  direction: "debit" | "credit";
  description: string;
  category: string;
  date: string;
  source?: "manual" | "recurring" | "alert" | "adjustment";
  status?: "posted" | "pending";
  notes?: string;
}) {
  const { sb } = await ctx();
  const { error } = await sb.from("transactions").insert({
    account_id: i.account_id,
    amount_minor: toMinor(i.amount),
    direction: i.direction,
    description_raw: i.description,
    description_clean: i.description,
    category_name: i.category,
    date: i.date,
    source: i.source ?? "manual",
    status: i.status ?? "posted",
    notes: i.notes ?? null,
  });
  if (error) throw error;
}

export async function updateTransaction(id: string, patch: { description_clean?: string; category_name?: string; notes?: string }) {
  await patchRow("transactions", id, patch);
}

export async function bulkSetCategory(ids: string[], category: string) {
  if (!ids.length) return;
  const { sb } = await ctx();
  const { error } = await sb.from("transactions").update({ category_name: category }).in("id", ids);
  if (error) throw error;
}

export async function deleteTransaction(id: string) {
  await removeRow("transactions", id);
}

export async function splitTransaction(
  parent: Pick<Txn, "id" | "account_id" | "direction" | "description_raw" | "description_clean" | "date">,
  parts: { category: string; amount: number }[]
) {
  const { sb } = await ctx();
  const { error: e1 } = await sb.from("transactions").insert(
    parts.map((p) => ({
      account_id: parent.account_id,
      amount_minor: toMinor(p.amount),
      direction: parent.direction,
      description_raw: parent.description_raw,
      description_clean: `${parent.description_clean ?? "Transaction"} (split)`,
      category_name: p.category,
      date: parent.date,
      parent_id: parent.id,
      source: "manual",
      status: "posted",
    }))
  );
  if (e1) throw e1;
  const { error: e2 } = await sb.from("transactions").update({ category_name: "Split Parent" }).eq("id", parent.id);
  if (e2) throw e2;
}

/* ---------- TRANSFERS ---------- */

export async function transferFunds(fromAccountId: string, toAccountId: string, amountMinor: number, note: string, dateISO: string) {
  const { sb } = await ctx();
  
  const { data: accs } = await sb.from("accounts").select("id, name").in("id", [fromAccountId, toAccountId]);
  const fromName = accs?.find(a => a.id === fromAccountId)?.name || "Account";
  const toName = accs?.find(a => a.id === toAccountId)?.name || "Account";
  
  const desc = note ? `${note} (${fromName} to ${toName})` : `Transfer from ${fromName} to ${toName}`;

  const { error: e1 } = await sb.from("transactions").insert({
    account_id: fromAccountId,
    amount_minor: amountMinor,
    direction: "debit",
    description_clean: desc,
    description_raw: desc,
    category_name: "Transfer",
    date: dateISO,
    status: "posted",
  });
  if (e1) throw e1;

  const { error: e2 } = await sb.from("transactions").insert({
    account_id: toAccountId,
    amount_minor: amountMinor,
    direction: "credit",
    description_clean: desc,
    description_raw: desc,
    category_name: "Transfer",
    date: dateISO,
    status: "posted",
  });
  if (e2) throw e2;
}

/* ---------- accounts ---------- */

export async function getAccounts(): Promise<Account[]> {
  const { sb, workspaceId } = await ctx();
  const [{ data: accs, error }, { data: bal }] = await Promise.all([
    sb.from("accounts").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: true }),
    sb.rpc("get_account_balances"),
  ]);
  if (error) throw error;
  const map = new Map<string, number>(
    ((bal ?? []) as { account_id: string; current_minor: number }[]).map((b) => [b.account_id, Number(b.current_minor)])
  );
  return ((accs ?? []) as Account[]).map((a) => ({ ...a, current_minor: map.get(a.id) ?? a.balance_minor }));
}

export async function createAccount(name: string, institution: string, type: string, currentBalance: number, balanceAsOf: string) {
  await insertRow("accounts", { name, institution, type, balance_minor: toMinor(currentBalance), balance_as_of: balanceAsOf });
}

export async function updateAccount(id: string, p: { name: string; institution: string; type: string; currentBalance: number; balanceAsOf: string }) {
  await patchRow("accounts", id, { name: p.name, institution: p.institution, type: p.type, balance_minor: toMinor(p.currentBalance), balance_as_of: p.balanceAsOf });
}

export async function deleteAccount(id: string) {
  await removeRow("accounts", id);
}

/* ---------- assets & liabilities ---------- */

export const getAssets = () => list<Asset>("assets");

export const addAsset = (name: string, type: "asset" | "liability", value: number, meta?: any) =>
  insertRow("assets", { name, type, value_minor: toMinor(value), meta });

export const updateAsset = (id: string, name: string, type: "asset" | "liability", value: number) =>
  patchRow("assets", id, { name, type, value_minor: toMinor(value) });

export const deleteAsset = (id: string) => removeRow("assets", id);

/* ---------- workspace budget ---------- */

export async function updateBudgetLimit(newLimit: number) {
  const { sb, workspaceId } = await ctx();
  const { error } = await sb.from("workspaces").update({ budget_limit_minor: toMinor(newLimit) }).eq("id", workspaceId);
  if (error) throw error;
}

export async function updateWorkspaceBudget(newLimitMinor: number) {
  const { sb, workspaceId } = await ctx();
  const { error } = await sb.from("workspaces").update({ budget_limit_minor: newLimitMinor }).eq("id", workspaceId);
  if (error) throw error;
}

/* ---------- payday cycle ---------- */

export async function getCurrentCycle(): Promise<{ cycle_start: string; cycle_end: string }> {
  const { sb, workspaceId } = await ctx();
  const { data, error } = await sb.rpc("get_current_cycle", { p_workspace_id: workspaceId });
  if (error) throw error;
  return data as { cycle_start: string; cycle_end: string };
}

export async function updateCycleStartDay(day: number): Promise<void> {
  const { sb, workspaceId } = await ctx();
  const safe = Math.max(1, Math.min(day, 28));
  const { error } = await sb.from("workspaces").update({ cycle_start_day: safe }).eq("id", workspaceId);
  if (error) throw error;
}

/* ---------- budgets (per-account) ---------- */

export async function getBudgets(accountId?: string | null): Promise<Budget[]> {
  const { sb, workspaceId } = await ctx();
  let q = sb.from("budgets").select("*").eq("workspace_id", workspaceId);
  if (accountId === null || accountId === "all") {
    q = q.is("account_id", null);
  } else if (accountId) {
    q = q.eq("account_id", accountId);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Budget[];
}

export async function setBudget(accountId: string | null, category: string, limitMinor: number) {
  const { sb, workspaceId } = await ctx();
  const { error } = await sb.from("budgets").upsert(
    { workspace_id: workspaceId, account_id: accountId, category, limit_minor: limitMinor },
    { onConflict: "workspace_id,account_id,category" }
  );
  if (error) throw error;
}

export async function deleteBudget(id: string) {
  await removeRow("budgets", id);
}

/* ---------- custom categories ---------- */

export async function getCustomCategories(): Promise<CustomCategory[]> {
  const { sb, workspaceId } = await ctx();
  const { data, error } = await sb.from("custom_categories").select("id,name,icon,color,kind").eq("workspace_id", workspaceId).order("created_at");
  if (error) throw error;
  return (data ?? []) as any;
}

export async function addCustomCategory(name: string, icon = "Tag", color = "#8fb3a3", kind: "expense" | "income" | "both" = "expense"): Promise<void> {
  const { sb, workspaceId } = await ctx();
  const { error } = await sb.from("custom_categories").insert({ workspace_id: workspaceId, name: name.trim(), icon, color, kind });
  if (error) throw error;
}

export async function deleteCustomCategory(id: string): Promise<void> {
  await removeRow("custom_categories", id);
}

/* ---------- category rules ---------- */

export async function getCategoryRules(): Promise<CategoryRule[]> {
  const { sb, workspaceId } = await ctx();
  const { data, error } = await sb.from("category_rules").select("id,merchant_pattern,category").eq("workspace_id", workspaceId);
  if (error) throw error;
  return (data ?? []) as any;
}

export async function addCategoryRule(merchantPattern: string, category: string): Promise<void> {
  const { sb, workspaceId } = await ctx();
  const { error } = await sb.from("category_rules").upsert(
    { workspace_id: workspaceId, merchant_pattern: merchantPattern.toLowerCase().trim(), category },
    { onConflict: "workspace_id,merchant_pattern" }
  );
  if (error) throw error;
}

export async function deleteCategoryRule(id: string): Promise<void> {
  await removeRow("category_rules", id);
}

/* ---------- recurring items ---------- */

export const getRecurringItems = () => list<RecurringItem>("recurring_items", "created_at");
export const addRecurringItem = (i: { 
  account_id: string | null; 
  name: string; 
  kind: "income" | "bill" | "rent"; 
  amount: number; 
  frequency: "weekly" | "monthly" | "annually"; 
  day: number; 
  month?: number;
  category?: string | null; 
  auto_post?: boolean 
}) =>
  insertRow("recurring_items", { 
    account_id: i.account_id, 
    name: i.name, 
    kind: i.kind, 
    amount_minor: toMinor(i.amount), 
    frequency: i.frequency, 
    day: i.day, 
    month: i.month ?? null,
    category: i.category ?? null, 
    auto_post: i.auto_post ?? false, 
    active: true 
  });
export const updateRecurringItem = (id: string, patch: Partial<Pick<RecurringItem, "name" | "amount_minor" | "day" | "category" | "auto_post" | "active">>) => patchRow("recurring_items", id, patch);
export const deleteRecurringItem = (id: string) => removeRow("recurring_items", id);

/* ---------- sinking funds ---------- */

export const getFunds = () => list<Fund>("sinking_funds");
export const addFund = (name: string, target: number, saved: number, targetDate: string | null) => insertRow("sinking_funds", { name, target_minor: toMinor(target), saved_minor: toMinor(saved), target_date: targetDate || null });
export const addToFund = (fund: Fund, amount: number) => patchRow("sinking_funds", fund.id, { saved_minor: fund.saved_minor + toMinor(amount) });
export const deleteFund = (id: string) => removeRow("sinking_funds", id);

/* ---------- family support ---------- */

export async function getFamilySupport() {
  const { sb, workspaceId } = await ctx();
  const { data, error } = await sb.from("workspaces").select("family_support_minor,family_support_label,family_support_day").eq("id", workspaceId).single();
  if (error) throw error;
  return { 
    amount_minor: Number(data?.family_support_minor ?? 0), 
    label: (data?.family_support_label as string) ?? "",
    day: Number(data?.family_support_day ?? 1)
  };
}

export async function setFamilySupport(amount: number, label: string, day: number = 1) {
  const { sb, workspaceId } = await ctx();
  const { error } = await sb.from("workspaces").update({ 
    family_support_minor: toMinor(amount), 
    family_support_label: label,
    family_support_day: day
  }).eq("id", workspaceId);
  if (error) throw error;
}

/* ---------- ajo ---------- */

export const getAjoGroups = () => list<AjoGroup>("ajo_groups");
export const addAjoGroup = (g: { 
  name: string; 
  contribution: number; 
  frequency: "weekly" | "monthly"; 
  members: number; 
  position: number;
  members_list: string[];
  start_date: string;
}) => insertRow("ajo_groups", { 
  name: g.name, 
  contribution_minor: toMinor(g.contribution), 
  frequency: g.frequency, 
  members: g.members, 
  my_position: g.position,
  members_list: g.members_list,
  start_date: g.start_date
});
export const recordAjoPayment = (g: AjoGroup) => patchRow("ajo_groups", g.id, { paid_cycles: Math.min(g.paid_cycles + 1, g.members) });
export const deleteAjoGroup = (id: string) => removeRow("ajo_groups", id);

/* ---------- setup status / onboarding ---------- */

export interface SetupStatus {
  workspace_id: string | null;
  onboarding_step: number;
  has_account: boolean;
  has_income: boolean;
  has_bills: boolean;
  has_budget: boolean;
  is_complete: boolean;
}

export async function getSetupStatus(): Promise<SetupStatus> {
  const { sb, workspaceId } = await ctx();
  const { data, error } = await sb.rpc("get_setup_status", { p_workspace_id: workspaceId });
  if (error) throw error;
  return data as SetupStatus;
}

export async function completeOnboarding(): Promise<void> {
  const { sb } = await ctx();
  const { error } = await sb.rpc("complete_onboarding");
  if (error) throw error;
}

/* ---------- safe to spend ---------- */

export interface SafeToSpend {
  liquid_minor: number;
  bills_due_minor: number;
  total_safe_minor: number;
  daily_safe_minor: number;
  days_until_next_income: number;
  next_income_date: string;
  has_income: boolean;
  has_accounts: boolean;
  upcoming_bills: { name: string; amount_minor: number; day: number }[];
  error?: string;
}

export async function getSafeToSpend(): Promise<SafeToSpend> {
  const { sb, workspaceId } = await ctx();
  const { data, error } = await sb.rpc("get_safe_to_spend", { p_workspace_id: workspaceId });
  if (error) throw error;
  return data as SafeToSpend;
}

/* ---------- statement scan (Step 5) ---------- */

export async function importStatement(): Promise<{ inserted: number; skipped: number }> {
  throw new Error("Statement Scan is coming in Step 5. Use Account > Statements when it's ready.");
}

export const importCsvStatement = importStatement;
/* ---------- balance check-ins ---------- */

export interface BalanceCheckinResult {
  account_id: string;
  account_name: string;
  expected_minor: number;
  reported_minor: number;
  difference_minor: number;
  checkin_id: string;
}

export async function submitBalanceCheckin(
  accountId: string,
  reportedAmount: number,
  options: { logAdjustment: boolean }
): Promise<BalanceCheckinResult> {
  const { sb, workspaceId } = await ctx();

  const { data: bal } = await sb.rpc("get_account_balances");
  const map = new Map<string, number>(
    ((bal ?? []) as { account_id: string; current_minor: number }[]).map((b) => [
      b.account_id,
      Number(b.current_minor),
    ])
  );
  const expected = map.get(accountId) ?? 0;
  const reported = toMinor(reportedAmount);
  const diff = reported - expected;

  const { data: acc } = await sb.from("accounts").select("name").eq("id", accountId).single();
  const accountName = acc?.name ?? "Account";

  // 1. Update the account's anchor balance directly in the accounts table
  // This ensures the balance is exactly what the user typed, without creating a fake transaction.
  const { error: anchorErr } = await sb
    .from("accounts")
    .update({ 
      balance_minor: reported, 
      balance_as_of: new Date().toISOString().slice(0, 10) 
    })
    .eq("id", accountId);
  if (anchorErr) throw anchorErr;

  // 2. Log the check-in for history
  const resolution = "reanchor_only"; // We no longer log transactions, we just reanchor.

  const { data: chk, error: chkErr } = await sb
    .from("balance_checkins")
    .insert({
      workspace_id: workspaceId,
      account_id: accountId,
      expected_minor: expected,
      reported_minor: reported,
      difference_minor: diff,
      resolution,
      adjustment_txn_id: null, // No transaction ID anymore
    })
    .select("id")
    .single();
  if (chkErr) throw chkErr;

  return {
    account_id: accountId,
    account_name: accountName,
    expected_minor: expected,
    reported_minor: reported,
    difference_minor: diff,
    checkin_id: chk?.id ?? "",
  };
}

export async function getLastCheckin(accountId: string): Promise<{ created_at: string } | null> {
  const { sb } = await ctx();
  const { data, error } = await sb
    .from("balance_checkins")
    .select("created_at")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as { created_at: string } | null;
}
/* ---------- home helpers ---------- */

export interface CategorySpendRow {
  category: string;
  total_minor: number;
}

export async function getCategorySpend(sinceISO: string): Promise<CategorySpendRow[]> {
  const { sb, workspaceId } = await ctx();
  const accountIds = await getWorkspaceAccountIds(sb, workspaceId);
  if (accountIds.length === 0) return [];

  const { data, error } = await sb
    .from("transactions")
    .select("category_name,amount_minor")
    .in("account_id", accountIds)
    .or(NOT_SPLIT)
    .eq("direction", "debit")
    .eq("status", "posted")
    .gte("date", sinceISO)
    .limit(2000);
  if (error) throw error;

  const map = new Map<string, number>();
  for (const t of (data ?? []) as { category_name: string | null; amount_minor: number }[]) {
    const k = t.category_name || "Uncategorized";
    map.set(k, (map.get(k) ?? 0) + t.amount_minor);
  }
  return [...map.entries()]
    .map(([category, total_minor]) => ({ category, total_minor }))
    .sort((a, b) => b.total_minor - a.total_minor);
}

export function getPeriodLabel(cycle: { cycle_start: string; cycle_end: string } | null): string {
  return new Date().toLocaleDateString("en-NG", { month: "long", year: "numeric" });
}

/* ---------- profile ---------- */

export async function updateProfile(fullName: string) {
  const { sb } = await ctx();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const { error } = await sb.from("profiles").update({ full_name: fullName.trim() }).eq("id", user.id);
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { sb } = await ctx();
  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
// Add to database.ts
export async function getAnnualRent() {
  const { sb, workspaceId } = await ctx();
  const { data, error } = await sb.from("workspaces").select("annual_rent_minor").eq("id", workspaceId).single();
  if (error) throw error;
  return Number(data?.annual_rent_minor ?? 0) / 100;
}

export async function setAnnualRent(amount: number) {
  const { sb, workspaceId } = await ctx();
  const { error } = await sb.from("workspaces").update({ annual_rent_minor: toMinor(amount) }).eq("id", workspaceId);
  if (error) throw error;
}