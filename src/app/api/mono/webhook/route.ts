import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Mono sends a specific event when new transactions occur
    if (body.event === "mono.events.account_updated") {
      const monoAccountId = body.data.account?._id || body.data.account?.id;
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
          amount_minor: Math.round(Number(t.amount) || 0), // Mono sends kobo
          direction: t.type === "credit" ? "credit" : "debit",
          description_raw: t.narration || "Mono Transaction",
          description_clean: t.narration || "Mono Transaction",
          category_name: "Uncategorized",
          date: new Date(t.date).toISOString(),
          status: "posted",
          source: "alert",
        }));

        // Note: Mono's webhook doesn't send unique transaction IDs yet, so 
        // we insert them. Your DB trigger will automatically update the balance.
        await supabaseAdmin.from("transactions").insert(rows);
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}