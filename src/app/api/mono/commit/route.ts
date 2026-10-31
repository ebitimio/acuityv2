import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sessionId, userInput } = await req.json();

    const res = await fetch("https://api.withmono.com/v2/connect/commit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mono-sec-key": process.env.MONO_SECRET_KEY!,
        "x-session-id": sessionId,
      },
      body: JSON.stringify(userInput),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Commit failed");
    
    // If successful, data.code will be returned. Exchange this code for an account ID.
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}