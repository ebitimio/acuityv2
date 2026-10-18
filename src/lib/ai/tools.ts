import { createClient } from "@/lib/supabase/server";

const naira = (minor: number) => `₦${Math.round(minor / 100).toLocaleString("en-NG")}`;

function monthStartISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}
function monthStartISOAgo(months: number) {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - months, 1).toISOString();
}
const NOT_SPLIT = 'category_name.is.null,category_name.neq."Split Parent"';

export interface ToolDef {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  run: (args: Record<string, unknown>) => Promise<unknown>;
}

export function buildTools(supabase: Awaited<ReturnType<typeof createClient>>): ToolDef[] {
  return [
    {
      name: "get_month_summary",
      description: "Get this month's income, spending, and net cash flow.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
      run: async () => {
        const { data } = await supabase.from("transactions").select("amount_minor,direction").or(NOT_SPLIT).gte("date", monthStartISO());
        let income = 0, spent = 0;
        for (const t of data ?? []) t.direction === "credit" ? (income += t.amount_minor) : (spent += t.amount_minor);
        return { income: naira(income), spent: naira(spent), net: naira(income - spent) };
      },
    },
    {
      name: "get_spend_by_category",
      description: "Get spend per category for a given month offset (0 = this month, 1 = last month, etc). Returns ranked list.",
      parameters: {
        type: "object",
        properties: { month_offset: { type: "number", description: "0 for this month, 1 for last month" } },
        additionalProperties: false,
      },
      run: async (args) => {
        const offset = Number(args.month_offset ?? 0);
        const since = monthStartISOAgo(offset);
        const until = offset === 0 ? new Date().toISOString() : monthStartISOAgo(offset - 1);
        const { data } = await supabase.from("transactions").select("amount_minor,category_name").or(NOT_SPLIT).eq("direction", "debit").gte("date", since).lt("date", until).limit(2000);
        const byCat = new Map<string, number>();
        for (const t of data ?? []) {
          const k = t.category_name || "Uncategorized";
          byCat.set(k, (byCat.get(k) ?? 0) + t.amount_minor);
        }
        return [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => ({ category: k, amount: naira(v) }));
      },
    },
    {
      name: "list_recent_transactions",
      description: "List the most recent N transactions. Use for specific transaction questions.",
      parameters: {
        type: "object",
        properties: { limit: { type: "number", description: "Max 50" } },
        additionalProperties: false,
      },
      run: async (args) => {
        const limit = Math.min(Number(args.limit ?? 10), 50);
        const { data } = await supabase.from("transactions").select("date,description_clean,category_name,direction,amount_minor").or(NOT_SPLIT).order("date", { ascending: false }).limit(limit);
        return (data ?? []).map((t) => ({
          date: new Date(t.date).toLocaleDateString("en-NG"),
          description: t.description_clean,
          category: t.category_name,
          amount: `${t.direction === "credit" ? "+" : "-"}${naira(t.amount_minor)}`,
        }));
      },
    },
    {
      name: "get_account_balances",
      description: "List all connected accounts with their current balance.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
      run: async () => {
        const [{ data: accounts }, { data: balances }] = await Promise.all([
          supabase.from("accounts").select("id,name,institution"),
          supabase.rpc("get_account_balances"),
        ]);
        const map = new Map((balances ?? []).map((b: { account_id: string; current_minor: number }) => [b.account_id, b.current_minor]));
        return (accounts ?? []).map((a) => ({ name: a.name, institution: a.institution, balance: naira(Number(map.get(a.id) ?? 0)) }));
      },
    },
    {
      name: "get_budget_status",
      description: "Get this month's budget, spend so far, and how much is left.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
      run: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "not logged in" };
        const [{ data: ws }, { data: txs }] = await Promise.all([
          supabase.from("workspaces").select("budget_limit_minor").eq("owner_id", user.id).single(),
          supabase.from("transactions").select("amount_minor").or(NOT_SPLIT).eq("direction", "debit").gte("date", monthStartISO()),
        ]);
        const budget = Number(ws?.budget_limit_minor ?? 0);
        const spent = (txs ?? []).reduce((s, t) => s + t.amount_minor, 0);
        const remaining = Math.max(budget - spent, 0);
        return {
          budget: budget ? naira(budget) : "not set",
          spent: naira(spent),
          remaining: budget ? naira(remaining) : "n/a",
          percent_used: budget ? `${Math.round((spent / budget) * 100)}%` : "n/a",
        };
      },
    },
    {
      name: "get_runway_months",
      description: "Calculate how many months the user's liquid reserves can sustain current lifestyle if all income stops. Uses the average of the last 3 months' outflow.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
      run: async () => {
        const threeMonthsAgo = monthStartISOAgo(2);
        const [{ data: accs }, { data: txs }] = await Promise.all([
          supabase.rpc("get_account_balances"),
          supabase.from("transactions").select("amount_minor").or(NOT_SPLIT).eq("direction", "debit").gte("date", threeMonthsAgo),
        ]);
        const liquid = (accs ?? []).reduce((s: number, a: { current_minor: number }) => s + Number(a.current_minor), 0);
        const avgMonthlyOutflow = (txs ?? []).reduce((s, t) => s + t.amount_minor, 0) / 3;
        const months = avgMonthlyOutflow > 0 ? liquid / avgMonthlyOutflow : Infinity;
        return {
          liquid_reserves: naira(liquid),
          avg_monthly_outflow: naira(avgMonthlyOutflow),
          runway_months: Number.isFinite(months) ? Math.round(months * 10) / 10 : "no spending recorded",
        };
      },
    },
    {
      name: "find_idle_cash",
      description: "Identify accounts where the user has significant money that could earn interest (e.g. Money Market Fund). Assumes current savings accounts earn nothing.",
      parameters: {
        type: "object",
        properties: { threshold_naira: { type: "number", description: "Only flag accounts above this amount. Default 500000." } },
        additionalProperties: false,
      },
      run: async (args) => {
        const threshold = Number(args.threshold_naira ?? 500000) * 100;
        const [{ data: accounts }, { data: balances }] = await Promise.all([
          supabase.from("accounts").select("id,name,type"),
          supabase.rpc("get_account_balances"),
        ]);
        const map = new Map((balances ?? []).map((b: { account_id: string; current_minor: number }) => [b.account_id, Number(b.current_minor)]));
        const idle = (accounts ?? [])
          .filter((a) => a.type === "checking" || a.type === "wallet")
          .map((a) => ({ name: a.name, type: a.type, balance: map.get(a.id) ?? 0 }))
          .filter((a) => a.balance >= threshold);
        return idle.map((a) => ({ account: a.name, balance: naira(a.balance), suggestion: "Move to a Money Market Fund earning ~15–18% p.a." }));
      },
    },
  ];
}