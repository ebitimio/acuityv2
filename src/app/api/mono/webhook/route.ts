import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (body.event === "mono.events.account_updated") {
      const accountData = body.data?.account;
      const transactions = body.data.transactions || [];
      if (!accountData || transactions.length === 0) return NextResponse.json({ status: "ignored" });

      const monoAccountId = accountData._id || accountData.accountNumber;
      const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

      const { data: account } = await supabaseAdmin
        .from("accounts")
        .select("id")
        .eq("mono_account_id", monoAccountId)
        .single();

      if (!account) return NextResponse.json({ status: "ignored_no_account" });

      const rows = transactions.map((t: any) => ({
        account_id: account.id,
        external_id: t._id || `${t.date}-${t.amount}-${t.narration}`, // Unique ID for duplicate protection
        amount_minor: Math.round(Number(t.amount) || 0),
        direction: t.type === "credit" ? "credit" : "debit",
        description_raw: t.narration || "Mono Transaction",
        description_clean: t.narration || "Mono Transaction",
        category_name: "Uncategorized", // Fast insert, AI will handle this later
        date: new Date(t.date).toISOString(),
        status: "posted",
        source: "alert",
      }));

      // Upsert with ignoreDuplicates prevents duplicate inserts on Mono retries
      const { error } = await supabaseAdmin
        .from("transactions")
        .upsert(rows, { onConflict: "account_id,external_id", ignoreDuplicates: true });

      if (error) throw error;
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}