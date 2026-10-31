import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (body.event === "mono.events.account_updated") {
      const monoAccountId = body.data.account._id;
      const transactions = body.data.transactions || [];

      // Use the service role key to bypass RLS (since this is a server-to-server call)
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Find the corresponding account in our DB
      const { data: account } = await supabaseAdmin
        .from("accounts")
        .select("id, workspace_id")
        .eq("mono_account_id", monoAccountId)
        .single();

      if (account && transactions.length > 0) {
        const rows = transactions.map((t: any) => ({
          workspace_id: account.workspace_id,
          account_id: account.id,
          amount_minor: Math.round(t.amount * 100),
          direction: t.type === "credit" ? "credit" : "debit",
          description_raw: t.narration,
          description_clean: t.narration,
          category_name: "Uncategorized",
          date: t.date,
          status: "posted",
          source: "alert",
        }));

        // Insert the transactions (The DB Trigger we created earlier will auto-update the balance!)
        await supabaseAdmin.from("transactions").insert(rows);
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}