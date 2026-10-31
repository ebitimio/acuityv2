import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
    
    const key = process.env.MONO_SECRET_KEY;
    if (!key) {
      return NextResponse.json({ error: "Mono not configured" }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Exchange code for Mono Account ID
    const exchangeRes = await fetch("https://api.withmono.com/v2/accounts/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mono-sec-key": key,
      },
      body: JSON.stringify({ code }),
    });

    const exchangeData = await exchangeRes.json();
    
    if (!exchangeRes.ok) {
      throw new Error(exchangeData.message || "Failed to exchange code");
    }

    // CHANGED: Safely extract the ID whether it is nested or not
    const monoAccountId = exchangeData.id || exchangeData.data?.id || exchangeData.data?._id;

    if (!monoAccountId) {
      throw new Error("Could not find account ID in Mono response");
    }

    // 2. Fetch account details
    const detailsRes = await fetch(`https://api.withmono.com/v2/accounts/${monoAccountId}`, {
      headers: { 
        "mono-sec-key": key,
        "Content-Type": "application/json"
      },
    });
    
    const details = await detailsRes.json();

    if (!detailsRes.ok) {
      throw new Error(details.message || "Failed to fetch account details");
    }

    // 3. Get workspace
    const { data: ws } = await supabase.from("workspaces").select("id").eq("owner_id", user.id).limit(1).single();
    if (!ws) throw new Error("No workspace found");

    // 4. Save to Supabase
    // Note: Mono's V2 details endpoint returns data inside a `data` object
    const accountData = details.data || details;
    const institutionData = accountData.institution || accountData.bank || {};

    const { data: newAccount, error: insertError } = await supabase
      .from("accounts")
      .insert({
        workspace_id: ws.id,
        name: accountData.name || accountData.account_name || "Linked Bank Account",
        institution: institutionData.name || "Mono Bank",
        type: "checking",
        balance_minor: Math.round(Number(accountData.balance || 0) * 100),
        balance_as_of: new Date().toISOString(),
        mono_account_id: monoAccountId, 
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, account: newAccount });
  } catch (error: any) {
    console.error("Mono Exchange Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}