import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    if (!process.env.MONO_SECRET_KEY) {
      return NextResponse.json({ error: "Mono secret key missing" }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Create a session with Mono API
    const res = await fetch("https://api.withmono.com/v2/connect/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mono-sec-key": process.env.MONO_SECRET_KEY!,
      },
      body: JSON.stringify({
        customer: {
          name: user.user_metadata?.full_name || "Acuity User",
          email: user.email,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create link");

    // Return the deep link URL
    return NextResponse.json({ url: data.data.mono_url });
  } catch (error: any) {
    console.error("Mono Create Link Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}