import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    if (!process.env.MONO_SECRET_KEY) {
      return NextResponse.json({ error: "Mono not configured" }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Generate the hosted Connect link
    const res = await fetch("https://api.withmono.com/v2/accounts/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mono-sec-key": process.env.MONO_SECRET_KEY,
      },
      body: JSON.stringify({
        scope: "auth",
        redirect_url: "https://acuity.foo.ng/connect/callback", // Must match your callback
        customer: {
          name: user.user_metadata?.full_name || "Acuity User",
          email: user.email,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create link");

    // The API returns a hosted URL
    return NextResponse.json({ url: data.data.mono_url });
  } catch (error: any) {
    console.error("Mono Link Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}