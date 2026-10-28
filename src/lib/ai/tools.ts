import { createClient } from "@/lib/supabase/server";
import { detectRecurring } from "@/lib/recurring";
import { auditCharges } from "@/lib/charges";
import { computeTax } from "@/lib/tax";
import { CATEGORY_NAMES } from "@/lib/categories";

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

export function buildTools(supabase: Awaited<ReturnType<typeof createClient>>, workspaceId: string | null): ToolDef[] {
  return [
    {
      name: "get_financial_context",
      description: "CRITICAL: Call this first before answering any question about the user's finances. Returns their full net worth, offline assets, liabilities, liquid cash, income, bills, family support, and budgets.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
      run: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "not logged in" };
        if (!workspaceId) return { error: "No active workspace selected" };

        const [
          { data: accounts },
          { data: balances },
          { data: assets },
          { data: budgets },
          { data: commitments },
          { data: ajo },
          { data: ws }
        ] = await Promise.all([
          supabase.from("accounts").select("id,name,type,institution").eq("workspace_id", workspaceId),
          supabase.rpc("get_account_balances"),
          supabase.from("assets").select("name,type,value_minor").eq("workspace_id", workspaceId),
          supabase.from("budgets").select("limit_minor").eq("workspace_id", workspaceId),
          supabase.from("recurring_items").select("name,kind,amount_minor,frequency").eq("workspace_id", workspaceId),
          supabase.from("ajo_groups").select("name,contribution_minor,frequency").eq("workspace_id", workspaceId),
          supabase.from("workspaces").select("budget_limit_minor,family_support_minor,family_support_label").eq("id", workspaceId).single()
        ]);

        const accountIds = (accounts ?? []).map(a => a.id);
        const balanceMap = new Map<string, number>(
          (balances ?? [])
            .filter((b: { account_id: string; current_minor: number }) => accountIds.includes(b.account_id))
            .map((b: { account_id: string; current_minor: number }) => [b.account_id, Number(b.current_minor)])
        );

        let liquidCash = 0;
        const accountList = (accounts ?? []).map((a) => {
          const bal = balanceMap.get(a.id) ?? 0;
          liquidCash += bal;
          return { id: a.id, name: a.name, institution: a.institution, type: a.type, balance: naira(bal) };
        });

        let totalAssets = 0;
        let totalLiabilities = 0;
        const assetList = (assets ?? []).map((a) => {
          if (a.type === "asset") totalAssets += a.value_minor;
          else totalLiabilities += a.value_minor;
          return { name: a.name, type: a.type, value: naira(a.value_minor) };
        });

        const budgetLimit = ws?.budget_limit_minor ?? 0;
        
        const incomeItems = (commitments ?? []).filter(c => c.kind === "income");
        const billItems = (commitments ?? []).filter(c => c.kind === "bill");
        const totalIncome = incomeItems.reduce((s, c) => s + c.amount_minor, 0);
        const totalBills = billItems.reduce((s, c) => s + c.amount_minor, 0);
        
        // Parse family support JSON
        let familySupportList = [];
        try {
          const parsed = JSON.parse(ws?.family_support_label || "[]");
          if (Array.isArray(parsed)) familySupportList = parsed;
        } catch {}
        
        const familySupportTotal = ws?.family_support_minor ?? 0;

        return {
          liquid_cash: naira(liquidCash),
          connected_accounts: accountList,
          offline_assets: assetList.filter(a => a.type === "asset"),
          offline_liabilities: assetList.filter(a => a.type === "liability"),
          total_net_worth: naira(liquidCash + totalAssets - totalLiabilities),
          monthly_income: naira(totalIncome),
          monthly_bills: naira(totalBills),
          family_support: familySupportTotal > 0 ? { total: naira(familySupportTotal), details: familySupportList } : "None",
          total_obligations: naira(totalBills + familySupportTotal),
          monthly_budget_limit: budgetLimit > 0 ? naira(budgetLimit) : "Not set",
          recurring_income: incomeItems.map(c => ({ name: c.name, amount: naira(c.amount_minor) })),
          recurring_bills: billItems.map(c => ({ name: c.name, amount: naira(c.amount_minor) })),
          ajo_groups: (ajo ?? []).map(a => ({ name: a.name, contribution: naira(a.contribution_minor), frequency: a.frequency })),
          available_categories: CATEGORY_NAMES,
        };
      },
    },
    {
      name: "get_safe_to_spend_status",
      description: "Get the exact 'Safe to Spend' calculation the app uses on the home screen. Returns daily safe amount, days until payday, and total safe cash.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
      run: async () => {
        if (!workspaceId) return { error: "No active workspace" };
        const { data, error } = await supabase.rpc("get_safe_to_spend", { p_workspace_id: workspaceId });
        if (error) return { error: error.message };
        return {
          daily_safe_to_spend: naira(data.daily_safe_minor),
          total_safe_cash: naira(data.total_safe_minor),
          days_until_next_income: data.days_until_next_income,
          next_income_date: data.next_income_date ? new Date(data.next_income_date).toLocaleDateString("en-NG") : "Not set"
        };
      },
    },
    {
      name: "get_budget_status",
      description: "Get this month's real budget, spend so far, and how much is left.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
      run: async () => {
        if (!workspaceId) return { error: "No active workspace" };
        
        const [{ data: budgets }, { data: ws }, { data: accounts }] = await Promise.all([
          supabase.from("budgets").select("limit_minor").eq("workspace_id", workspaceId),
          supabase.from("workspaces").select("budget_limit_minor").eq("id", workspaceId).single(),
          supabase.from("accounts").select("id").eq("workspace_id", workspaceId)
        ]);

        const accountIds = (accounts ?? []).map(a => a.id);
        const { data: txs } = accountIds.length > 0 ? await supabase.from("transactions").select("amount_minor").in("account_id", accountIds).or(NOT_SPLIT).eq("direction", "debit").gte("date", monthStartISO()) : { data: [] };
        
        const categoryBudget = (budgets ?? []).reduce((s, b) => s + Number(b.limit_minor), 0);
        const workspaceBudget = ws?.budget_limit_minor ?? 0;
        const totalBudget = categoryBudget > 0 ? categoryBudget : workspaceBudget;
        
        const spent = (txs ?? []).reduce((s, t) => s + t.amount_minor, 0);
        const remaining = Math.max(totalBudget - spent, 0);
        
        return {
          budget: totalBudget > 0 ? naira(totalBudget) : "not set",
          spent: naira(spent),
          remaining: totalBudget > 0 ? naira(remaining) : "n/a",
          percent_used: totalBudget ? `${Math.round((spent / totalBudget) * 100)}%` : "n/a",
        };
      },
    },
    {
      name: "get_month_summary",
      description: "Get this month's income, spending, and net cash flow.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
      run: async () => {
        if (!workspaceId) return { error: "No active workspace" };
        const { data: accounts } = await supabase.from("accounts").select("id").eq("workspace_id", workspaceId);
        const accountIds = (accounts ?? []).map(a => a.id);
        if (accountIds.length === 0) return { income: "₦0", spent: "₦0", net: "₦0" };

        const { data } = await supabase.from("transactions").select("amount_minor,direction").in("account_id", accountIds).or(NOT_SPLIT).gte("date", monthStartISO());
        let income = 0, spent = 0;
        for (const t of data ?? []) t.direction === "credit" ? (income += t.amount_minor) : (spent += t.amount_minor);
        return { income: naira(income), spent: naira(spent), net: naira(income - spent) };
      },
    },
    {
      name: "get_spend_by_category",
      description: "Get spend per category for a given month offset (0 = this month, 1 = last month).",
      parameters: {
        type: "object",
        properties: { month_offset: { type: "number", description: "0 for this month, 1 for last month" } },
        additionalProperties: false,
      },
      run: async (args) => {
        if (!workspaceId) return { error: "No active workspace" };
        const offset = Number(args.month_offset ?? 0);
        const since = monthStartISOAgo(offset);
        const until = offset === 0 ? new Date().toISOString() : monthStartISOAgo(offset - 1);
        
        const { data: accounts } = await supabase.from("accounts").select("id").eq("workspace_id", workspaceId);
        const accountIds = (accounts ?? []).map(a => a.id);
        if (accountIds.length === 0) return [];

        const { data } = await supabase.from("transactions").select("amount_minor,category_name").in("account_id", accountIds).or(NOT_SPLIT).eq("direction", "debit").gte("date", since).lt("date", until).limit(2000);
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
        if (!workspaceId) return { error: "No active workspace" };
        const limit = Math.min(Number(args.limit ?? 10), 50);
        
        const { data: accounts } = await supabase.from("accounts").select("id").eq("workspace_id", workspaceId);
        const accountIds = (accounts ?? []).map(a => a.id);
        if (accountIds.length === 0) return [];

        const { data } = await supabase.from("transactions").select("date,description_clean,category_name,direction,amount_minor").in("account_id", accountIds).or(NOT_SPLIT).order("date", { ascending: false }).limit(limit);
        return (data ?? []).map((t) => ({
          date: new Date(t.date).toLocaleDateString("en-NG"),
          description: t.description_clean,
          category: t.category_name,
          amount: `${t.direction === "credit" ? "+" : "-"}${naira(t.amount_minor)}`,
        }));
      },
    },
    // NEW ENGINE TOOLS
    {
      name: "find_subscriptions",
      description: "Detects recurring subscriptions (Netflix, Spotify, etc) by analyzing the last 6 months of transactions.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
      run: async () => {
        if (!workspaceId) return { error: "No active workspace" };
        const { data: accounts } = await supabase.from("accounts").select("id").eq("workspace_id", workspaceId);
        const accountIds = (accounts ?? []).map(a => a.id);
        
        const { data: txns } = await supabase.from("transactions").select("*").in("account_id", accountIds).or(NOT_SPLIT).eq("direction", "debit").gte("date", monthStartISOAgo(6));
        const { data: bills } = await supabase.from("recurring_items").select("name").eq("workspace_id", workspaceId).eq("kind", "bill");
        
        const knownBills = new Set((bills ?? []).map(b => b.name));
        const suggestions = detectRecurring((txns as any) || [], knownBills);
        
        return suggestions.map(s => ({
          name: s.name,
          amount: naira(s.amount_minor),
          frequency: s.cadence,
          confidence: Math.round(s.confidence * 100) + "%",
          next_expected: new Date(s.next_date).toLocaleDateString("en-NG"),
        }));
      },
    },
    {
      name: "audit_bank_charges",
      description: "Audits bank charges for overcharges, stamp duty errors, and duplicate fees.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
      run: async () => {
        if (!workspaceId) return { error: "No active workspace" };
        const { data: accounts } = await supabase.from("accounts").select("id").eq("workspace_id", workspaceId);
        const accountIds = (accounts ?? []).map(a => a.id);
        
        const { data: txns } = await supabase.from("transactions").select("*").in("account_id", accountIds).or(NOT_SPLIT).eq("status", "posted");
        const audit = auditCharges((txns as any) || []);
        
        return {
          total_overcharged: naira(audit.totalOver),
          total_fees_paid: naira(audit.totalFees),
          flagged_charges: audit.charges.filter(c => c.flag).map(c => ({
            date: new Date(c.date).toLocaleDateString("en-NG"),
            description: c.description,
            amount: naira(c.amount),
            issue: c.flag,
          })).slice(0, 10),
        };
      },
    },
    {
      name: "estimate_tax",
      description: "Estimates Nigerian Personal Income Tax (PIT) based on gross income and deductions.",
      parameters: {
        type: "object",
        properties: {
          gross_annual: { type: "number", description: "Gross annual income in Naira" },
          annual_rent: { type: "number", description: "Annual rent paid in Naira (optional)" },
        },
        required: ["gross_annual"],
        additionalProperties: false,
      },
      run: async (args) => {
        const gross = Number(args.gross_annual ?? 0);
        const rent = Number(args.annual_rent ?? 0);
        const pension = gross * 0.08; // Standard 8% pension
        
        const result = computeTax({ gross, pension, nhf: 0, nhis: 0, rent, other: 0 });
        
        return {
          gross_income: naira(gross),
          pension_estimate: naira(pension),
          rent_relief: naira(result.rentRelief),
          taxable_income: naira(result.taxable),
          estimated_tax: naira(result.tax),
          monthly_tax: naira(result.monthly),
          effective_rate: (result.effectiveRate * 100).toFixed(1) + "%",
          is_exempt: result.isExempt,
        };
      },
    },
    // NEW ACTION TOOL
    {
      name: "propose_action",
      description: "Propose a change for the user to confirm. You must never claim it has been done.",
      parameters: {
        type: "object",
        properties: {
          action: { 
            type: "string", 
            enum: ["add_transaction","set_budget","add_bill","add_income","recategorize","transfer"] 
          },
          payload: { type: "object" },
          summary: { type: "string", description: "One plain sentence the user will read on the confirm card" }
        },
        required: ["action","payload","summary"],
        additionalProperties: false
      },
      run: async (args) => {
        return { status: "pending_user_confirmation", ...args };
      },
    },
  ];
}