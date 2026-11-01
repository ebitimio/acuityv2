import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { code, customName } = await req.json();
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
    if (!exchangeRes.ok) throw new Error(exchangeData.message || "Failed to exchange code");

    const monoAccountId = exchangeData.id || exchangeData.data?.id;

    // 2. Fetch Details
    const detailsRes = await fetch(`https://api.withmono.com/v2/accounts/${monoAccountId}`, {
      headers: { "mono-sec-key": key },
    });
    
    const details = await detailsRes.json();
    if (!detailsRes.ok) throw new Error(details.message || "Failed to fetch account details");

    // 3. Safely extract nested data
    const rawData = details.data || details;
    const accountInfo = rawData.account || rawData;
    const institutionInfo = rawData.institution || {};

    // Safely find the bank name
    const bankName = institutionInfo.name || accountInfo.institution?.name || "Linked Bank";
    
    // Use the custom name from the frontend
    const accountName = customName || accountInfo.name || "Linked Bank Account";
    
    // CHANGED: Mono V2 returns balance in kobo. Do NOT multiply by 100.
    // If by chance it's a raw number like 100000, this math safely handles it.
    let balanceMinor = Number(accountInfo.balance) || 0;
    if (balanceMinor < 1000) {
       // If the balance is suspiciously low, it might be in Naira already.
       balanceMinor = Math.round(balanceMinor * 100);
    }

    // 4. Save to Supabase
    const { data: ws } = await supabase.from("workspaces").select("id").eq("owner_id", user.id).limit(1).single();
    if (!ws) throw new Error("No workspace found");

    const { data: newAccount, error: insertError } = await supabase
      .from("accounts")
      .insert({
        workspace_id: ws.id,
        name: accountName,
        institution: bankName, 
        type: "checking",
        balance_minor: balanceMinor, 
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