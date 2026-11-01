import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
    
    const key = process.env.MONO_SECRET_KEY;
    if (!key) return NextResponse.json({ error: "Mono not configured" }, { status: 500 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Exchange code for Account ID
    const exchangeRes = await fetch("https://api.withmono.com/v2/accounts/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json", "mono-sec-key": key },
      body: JSON.stringify({ code }),
    });
    const exchangeData = await exchangeRes.json();
    if (!exchangeRes.ok) throw new Error(exchangeData.message);

    const monoAccountId = exchangeData.id || exchangeData.data?.id;

    // 2. Fetch Details
    const detailsRes = await fetch(`https://api.withmono.com/v2/accounts/${monoAccountId}`, {
      headers: { "mono-sec-key": key },
    });
    const details = await detailsRes.json();
    if (!detailsRes.ok) throw new Error(details.message);

    // 3. Extract from the correct nested path
    const accountInfo = details.data.account;
    const institutionInfo = details.data.institution;

    // 4. Save to Supabase
    const { data: ws } = await supabase.from("workspaces").select("id").eq("owner_id", user.id).limit(1).single();
    if (!ws) throw new Error("No workspace found");

    const { data: newAccount, error: insertError } = await supabase
      .from("accounts")
      .insert({
        workspace_id: ws.id,
        name: accountInfo.name || "Linked Bank Account",
        institution: institutionInfo.name || "Mono Bank",
        type: "checking",
        // CHANGED: Correctly maps the balance from the nested data object
        balance_minor: Math.round(Number(accountInfo.balance) * 100), 
        balance_as_of: new Date().toISOString(),
        mono_account_id: monoAccountId, 
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, account: newAccount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}