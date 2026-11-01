import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log("Webhook Received:", JSON.stringify(body, null, 2));

    if (
      body.event === "mono.events.account_updated" || 
      body.event === "mono.events.webhook_test"
    ) {
      const accountData = body.data?.account;
      if (!accountData) return NextResponse.json({ status: "ignored_no_account" });

      const monoAccountId = accountData._id || accountData.accountNumber;
      const transactions = body.data.transactions || [];

      if (!monoAccountId) return NextResponse.json({ status: "ignored_no_id" });
      if (transactions.length === 0) {
        return NextResponse.json({ status: "success_no_transactions" });
      }

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Find the linked account in our DB
      const { data: account } = await supabaseAdmin
        .from("accounts")
        .select("id") // We only need the ID now
        .eq("mono_account_id", monoAccountId)
        .single();

      if (account) {
        const rows = transactions.map((t: any) => ({
          // CHANGED: Removed workspace_id since your table doesn't have it
          account_id: account.id,
          amount_minor: Math.round(Number(t.amount) || 0), 
          direction: t.type === "credit" ? "credit" : "debit",
          description_raw: t.narration || "Mono Transaction",
          description_clean: t.narration || "Mono Transaction",
          category_name: "Uncategorized",
          date: new Date(t.date).toISOString(),
          status: "posted",
          source: "alert",
        }));

        const { error } = await supabaseAdmin.from("transactions").insert(rows);
        if (error) throw error;
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}