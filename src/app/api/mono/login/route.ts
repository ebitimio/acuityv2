import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sessionId, credentials } = await req.json();

    const res = await fetch("https://api.withmono.com/v2/connect/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mono-sec-key": process.env.MONO_SECRET_KEY!,
        "x-session-id": sessionId,
      },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    
    // data.responseCode tells you if you need OTP (102) or if login is complete (99)
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}