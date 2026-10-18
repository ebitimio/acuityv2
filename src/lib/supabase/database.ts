import { createClient } from "./client";
import Papa from "papaparse";

// ... (Keep getWorkspaceAndTransactions, getHomeMetrics, insertMockTransactions as they are) ...

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
          
          if (rows.length === 0) {
            throw new Error("The CSV file is empty or unreadable.");
          }

          const transactionsToInsert = rows.map((row) => {
            // 1. Find the Date Column (Handles "Date/Time" and normal "Date")
            const rawDate = row["Date/Time"] || row["Date"] || row["Trans Date"] || row["Transaction Date"] || row["date"];
            
            // 2. Find the Description Column (Handles "Description" and "To/From")
            const descCol = row["Description"] || row["To/From"] || row["Narration"] || row["Details"] || row["description"];
            
            // 3. Find the Amount (Handles Money In / Money Out)
            let rawAmount = 0;
            
            // Clean the string: remove ₦ symbol, commas, and spaces
            const cleanAmount = (val: any) => {
              if (!val) return 0;
              return parseFloat(val.toString().replace(/[₦,]/g, "").trim()) || 0;
            };

            const moneyIn = cleanAmount(row["Money In"] || row["Credit"]);
            const moneyOut = cleanAmount(row["Money Out"] || row["Debit"]);
            const generalAmount = cleanAmount(row["Amount"] || row["Value"]);

            if (moneyIn > 0) {
              rawAmount = moneyIn; // Income
            } else if (moneyOut > 0) {
              rawAmount = -moneyOut; // Expense
            } else if (generalAmount !== 0) {
              rawAmount = generalAmount; // Fallback
            } else if (row["Debit"] !== undefined) {
              rawAmount = -cleanAmount(row["Debit"]);
            }

            // Skip invalid/empty rows
            if (isNaN(rawAmount) || rawAmount === 0) return null;

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
              date: parseDate(rawDate), 
            };
          }).filter((tx): tx is NonNullable<typeof tx> => tx !== null);

          if (transactionsToInsert.length === 0) {
            throw new Error("No valid transactions found. Check column names.");
          }

          const { error } = await supabase.from("transactions").insert(transactionsToInsert);
          if (error) throw error;
          resolve(transactionsToInsert.length);
        } catch (err: any) {
          reject(err);
        }
      },
      error: (error) => reject(error),
    });
  });
}

// --- HELPER FUNCTIONS ---

function parseDate(dateString: any): string {
  if (!dateString) return new Date().toISOString();
  
  const str = String(dateString).trim();
  
  // Handle "01/09/26 10:37:12" format
  const parts = str.split(" ");
  const datePart = parts[0];
  const timePart = parts[1] || "00:00:00";

  // Handle DD/MM/YY
  const dmyMatch = datePart.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1]);
    const month = parseInt(dmyMatch[2]) - 1;
    let year = parseInt(dmyMatch[3]);
    if (year < 100) year += 2000;
    
    const timeParts = timePart.split(":");
    const hours = parseInt(timeParts[0]) || 0;
    const minutes = parseInt(timeParts[1]) || 0;
    const seconds = parseInt(timeParts[2]) || 0;

    const d = new Date(year, month, day, hours, minutes, seconds);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  
  // Handle YYYY-MM-DD
  const ymdMatch = datePart.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1]);
    const month = parseInt(ymdMatch[2]) - 1;
    const day = parseInt(ymdMatch[3]);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  // Fallback
  const fallback = new Date(str);
  if (!isNaN(fallback.getTime())) return fallback.toISOString();
  return new Date().toISOString();
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