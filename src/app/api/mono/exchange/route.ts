import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    // 1. Destructure accountType and workspaceId from the request
    const { code, customName, workspaceId, accountType } = await req.json();
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
    
    const key = process.env.MONO_SECRET_KEY;
    if (!key) return NextResponse.json({ error: "Mono not configured" }, { status: 500 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Exchange code for Account ID
    const exchangeRes = await fetch("https://api.withmono.com/v2/accounts/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json", "mono-sec-key": key },
      body: JSON.stringify({ code }),
    });
    
    const exchangeData = await exchangeRes.json();
    if (!exchangeRes.ok) throw new Error(exchangeData.message || "Failed to exchange code");

    const monoAccountId = exchangeData.id || exchangeData.data?.id;

    // 3. Fetch Details
    const detailsRes = await fetch(`https://api.withmono.com/v2/accounts/${monoAccountId}`, {
      headers: { "mono-sec-key": key },
    });
    
    const details = await detailsRes.json();
    if (!detailsRes.ok) throw new Error(details.message || "Failed to fetch account details");

    // Log the full response so we can see exactly what Mono sends
    console.log("Full Mono Account Details:", JSON.stringify(details, null, 2));

    // 4. Safely extract nested data (YOUR EXACT LOGIC RESTORED)
    const rawData = details.data || details;
    const accountInfo = rawData.account || rawData;
    
    // Look for the bank name in all possible places
    let bankName = "Linked Bank";
    
    // Check top-level institution
    if (rawData.institution?.name) {
      bankName = rawData.institution.name;
    } 
    // Check account-level institution
    else if (accountInfo.institution?.name) {
      bankName = accountInfo.institution.name;
    }
    // Check if bank is just a string
    else if (typeof accountInfo.bank === "string") {
      bankName = accountInfo.bank;
    }

    // Use the custom name passed from the frontend, or fallback to Mono's name
    const accountName = customName || accountInfo.name || accountInfo.account_name || "Linked Bank Account";
    
    // Mono returns balance in kobo, so we do NOT multiply by 100 again
    const balanceMinor = Math.round(Number(accountInfo.balance) || 0);

    // 5. Determine the Workspace
    let targetWorkspaceId = workspaceId;

    if (!targetWorkspaceId) {
      const { data: ws } = await supabase.from("workspaces").select("id").eq("owner_id", user.id).limit(1).single();
      if (!ws) throw new Error("No workspace found");
      targetWorkspaceId = ws.id;
    } else {
      const { data: ws } = await supabase.from("workspaces").select("id").eq("id", targetWorkspaceId).eq("owner_id", user.id).single();
      if (!ws) throw new Error("Invalid workspace");
    }

    // 6. Save to Supabase using the selected accountType
    const { data: newAccount, error: insertError } = await supabase
      .from("accounts")
      .insert({
        workspace_id: targetWorkspaceId,
        name: accountName,
        institution: bankName, 
        type: accountType || "checking", // <-- Saves the selected type
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