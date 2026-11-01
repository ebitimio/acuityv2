import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { code, customName, workspaceId } = await req.json();
    if (!code || !workspaceId) return NextResponse.json({ error: "Missing data" }, { status: 400 });
    
    const key = process.env.MONO_SECRET_KEY;
    if (!key) return NextResponse.json({ error: "Mono not configured" }, { status: 500 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Verify Premium Tier
    const { data: profile } = await supabase.from("profiles").select("tier").eq("id", user.id).single();
    if (profile?.tier !== "premium") {
      return NextResponse.json({ error: "Upgrade to premium required" }, { status: 403 });
    }

    // 2. Verify Workspace Ownership
    const { data: ws } = await supabase.from("workspaces").select("id").eq("id", workspaceId).eq("owner_id", user.id).single();
    if (!ws) return NextResponse.json({ error: "Invalid workspace" }, { status: 403 });

    // 3. Exchange code for account ID
    const exchangeRes = await fetch("https://api.withmono.com/v2/accounts/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json", "mono-sec-key": key },
      body: JSON.stringify({ code }),
    });
    const exchangeData = await exchangeRes.json();
    if (!exchangeRes.ok) throw new Error(exchangeData.message || "Failed to exchange code");

    const tempId = exchangeData.id || exchangeData.data?.id;
    
    // 4. Fetch full account details
    const detailsRes = await fetch(`https://api.withmono.com/v2/accounts/${tempId}`, { headers: { "mono-sec-key": key } });
    const details = await detailsRes.json();
    
    const rawData = details.data || details;
    const accountInfo = rawData.account || rawData;
    const institutionInfo = rawData.institution || {};

    // Extract the real bank name safely
    const bankName = institutionInfo.name || rawData.institution_name || accountInfo.bank_name || "Linked Bank";
    const accountName = customName || accountInfo.name || "Linked Bank Account";
    
    const monoAccountId = tempId || accountInfo._id || accountInfo.account_number;

    // Save to Supabase
    const { data: newAccount, error: insertError } = await supabase
      .from("accounts")
      .insert({
        workspace_id: ws.id,
        name: accountName,
        institution: bankName, 
        type: "savings", // Defaulting to savings; update this if you add a type selector
        balance_minor: Math.round(Number(accountInfo.balance) || 0), 
        balance_as_of: new Date().toISOString(),
        mono_account_id: monoAccountId, 
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ error: "This bank account is already linked." }, { status: 400 });
      }
      throw insertError;
    }

    return NextResponse.json({ success: true, account: newAccount });
  } catch (error: any) {
    console.error("Mono Exchange Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
