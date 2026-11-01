import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (body.event === "mono.events.account_updated") {
      // CHANGED: Fallback to account_number if _id is missing in sandbox payload
      const monoAccountId = 
        body.data.account?._id || 
        body.data.account?.id || 
        body.data.account?.account_number;
        
      const transactions = body.data.transactions || [];

      if (!monoAccountId || transactions.length === 0) {
        return NextResponse.json({ status: "ignored" });
      }

      // Use service role to bypass RLS
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Find the linked account in our DB
      const { data: account } = await supabaseAdmin
        .from("accounts")
        .select("id, workspace_id")
        .eq("mono_account_id", monoAccountId)
        .single();

      if (account) {
        const rows = transactions.map((t: any) => ({
          workspace_id: account.workspace_id,
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

        // Insert the transactions (The DB Trigger will auto-update the balance)
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