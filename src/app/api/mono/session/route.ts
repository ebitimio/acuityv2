import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { institutionId } = await req.json();
    if (!institutionId) return NextResponse.json({ error: "Missing institutionId" }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const res = await fetch("https://api.withmono.com/v2/connect/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mono-sec-key": process.env.MONO_SECRET_KEY!,
      },
      body: JSON.stringify({
        institution: institutionId,
        customer: {
          name: user.user_metadata?.full_name || "Acuity User",
          email: user.email,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create session");

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}