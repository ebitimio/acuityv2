import { createClient } from "./client";
import Papa from "papaparse";

export async function getWorkspaceAndTransactions() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (wsError || !workspace) throw new Error("Workspace not found");

  // Filter out "Split Parent" transactions
  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select(`
      id,
      amount_minor,
      direction,
      description_clean,
      description_raw,
      category_name,
      date,
      parent_id,
      account_id,
      account:accounts (
        name,
        institution
      )
    `)
    .neq("category_name", "Split Parent")
    .order("date", { ascending: false })
    .limit(50);

  if (txError) throw txError;

  return { workspace, transactions: transactions || [] };
}

export async function getHomeMetrics() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_home_metrics");
  
  if (error) throw error;
  return data as {
    net_worth_minor: number;
    total_spent_minor: number;
    total_income_minor: number;
    budget_limit_minor: number;
    uncategorized_count: number;
  };
}

export async function insertMockTransactions() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!workspace) return;

  const { data: existingAccounts } = await supabase
    .from("accounts")
    .select("id")
    .eq("workspace_id", workspace.id)
    .limit(1);

  let accountId = existingAccounts?.[0]?.id;

  if (!accountId) {
    const { data: newAccount } = await supabase
      .from("accounts")
      .insert({
        workspace_id: workspace.id,
        name: "Main Checking",
        institution: "GTBank",
        type: "checking",
        balance_minor: 125043000,
      })
      .select("id")
      .single();
      
    accountId = newAccount?.id;
  }

  if (accountId) {
    await supabase.from("transactions").insert([
      {
        account_id: accountId,
        amount_minor: 4500000,
        direction: "debit",
        description_raw: "POS PURCHASE SHOPRITE LEKKI",
        description_clean: "Shoprite Lekki",
        category_name: "Groceries",
        date: new Date().toISOString(),
      },
      {
        account_id: accountId,
        amount_minor: 350000,
        direction: "debit",
        description_raw: "UBER TRIP LAGOS",
        description_clean: "Uber Trip",
        category_name: "Transport",
        date: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        account_id: accountId,
        amount_minor: 85000000,
        direction: "credit",
        description_raw: "SALARY ACME CORP",
        description_clean: "Salary - Acme Corp",
        category_name: "Income",
        date: new Date(Date.now() - 172800000).toISOString(),
      }
    ]);
  }
}

export async function importCsvStatement(file: File) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!workspace) throw new Error("Workspace not found");

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id")
    .eq("workspace_id", workspace.id)
    .limit(1);

  let accountId = accounts?.[0]?.id;
  
  if (!accountId) {
    const { data: newAcc } = await supabase.from("accounts").insert({
      workspace_id: workspace.id,
      name: "Imported Account",
      institution: "Bank Statement",
      type: "checking",
    }).select("id").single();
    accountId = newAcc?.id;
  }

  return new Promise<number>((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          
          const transactionsToInsert = rows.map((row) => {
            const dateCol = row["Date"] || row["Trans Date"] || row["Transaction Date"] || row["Value Date"] || row["date"];
            const descCol = row["Description"] || row["Narration"] || row["Details"] || row["Description/Narration"] || row["description"];
            
            let rawAmount = 0;
            if (row["Amount"] !== undefined) {
              rawAmount = parseFloat(row["Amount"].toString().replace(/,/g, ""));
            } else if (row["Debit"] !== undefined && parseFloat(row["Debit"].toString()) > 0) {
              rawAmount = -parseFloat(row["Debit"].toString().replace(/,/g, ""));
            } else if (row["Credit"] !== undefined && parseFloat(row["Credit"].toString()) > 0) {
              rawAmount = parseFloat(row["Credit"].toString().replace(/,/g, ""));
            } else if (row["Value"] !== undefined) {
              rawAmount = parseFloat(row["Value"].toString().replace(/,/g, ""));
            }

            const isIncome = rawAmount > 0;
            const rawDescStr = descCol ? String(descCol) : "Unknown Transaction";
            const category = autoCategorize(rawDescStr);

            return {
              account_id: accountId,
              amount_minor: Math.abs(Math.round(rawAmount * 100)),
              direction: isIncome ? "credit" : "debit",
              description_raw: rawDescStr,
              description_clean: cleanMerchantName(rawDescStr),
              category_name: category,
              date: new Date(dateCol || Date.now()).toISOString(),
            };
          }).filter(tx => tx.amount_minor > 0);

          const { error } = await supabase.from("transactions").insert(transactionsToInsert);
          if (error) throw error;
          resolve(transactionsToInsert.length);
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => reject(error),
    });
  });
}

function cleanMerchantName(raw: string) {
  let clean = raw
    .replace(/NIP\/FRM\//g, "")
    .replace(/\/[A-Z0-9]{10,}\//g, " ") 
    .replace(/POS PURCHASE/g, "")
    .replace(/TRF\//g, "")
    .replace(/\s+/g, " ")
    .trim();

  return clean.split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function autoCategorize(description: string): string {
  const desc = description.toUpperCase();
  
  if (desc.includes("SHOPRITE") || desc.includes("MARKET") || desc.includes("GROCERY")) return "Groceries";
  if (desc.includes("UBER") || desc.includes("BOLT") || desc.includes("TAXIFY")) return "Transport";
  if (desc.includes("NETFLIX") || desc.includes("SPOTIFY") || desc.includes("APPLE")) return "Subscriptions";
  if (desc.includes("NNPC") || desc.includes("FUEL") || desc.includes("GAS")) return "Fuel";
  if (desc.includes("SALARY") || desc.includes("PAYROLL")) return "Income";
  if (desc.includes("TRANSFER") || desc.includes("TRF")) return "Transfers";
  
  return "Uncategorized";
}