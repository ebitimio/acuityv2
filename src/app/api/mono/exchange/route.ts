import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
    
    const key = process.env.MONO_SECRET_KEY;
    if (!key) {
      console.error("Missing MONO_SECRET_KEY in Vercel");
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
    console.log("Mono Exchange Response:", exchangeData);
    
    if (!exchangeRes.ok) {
      console.error("Mono Exchange API Error:", exchangeData);
      throw new Error(exchangeData.message || "Failed to exchange code");
    }

    const monoAccountId = exchangeData.id;

    // 2. Fetch account details (CHANGED: Using /v1/accounts/:id)
    const detailsRes = await fetch(`https://api.withmono.com/v1/accounts/${monoAccountId}`, {
      headers: { "mono-sec-key": key },
    });
    
    const details = await detailsRes.json();
    console.log("Mono Account Details Response:", details);

    if (!detailsRes.ok) {
      console.error("Mono Details API Error:", details);
      throw new Error(details.message || "Failed to fetch account details");
    }

    // 3. Get workspace
    const { data: ws } = await supabase.from("workspaces").select("id").eq("owner_id", user.id).limit(1).single();
    if (!ws) throw new Error("No workspace found");

    // 4. Save to Supabase
    const { data: newAccount, error: insertError } = await supabase
      .from("accounts")
      .insert({
        workspace_id: ws.id,
        name: details.account?.name || "Linked Bank Account",
        institution: details.institution?.name || "Mono",
        type: "checking",
        balance_minor: Math.round((details.account?.balance || 0) * 100),
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