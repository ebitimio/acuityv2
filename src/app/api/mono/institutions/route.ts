import { NextResponse } from "next/server";

export async function GET() {
  try {
    const key = process.env.MONO_SECRET_KEY;
    
    // 1. Check if the key even exists
    if (!key) {
      return NextResponse.json({ error: "Missing MONO_SECRET_KEY in Vercel environment variables." }, { status: 500 });
    }

    // 2. Check if the key is formatted correctly (must start with test_sk_ or live_sk_)
    if (!key.startsWith("test_sk_") && !key.startsWith("live_sk_")) {
      return NextResponse.json({ error: "Invalid MONO_SECRET_KEY format. It must start with test_sk_ or live_sk_. You might have pasted the Public Key by mistake." }, { status: 500 });
    }

    const res = await fetch("https://api.withmono.com/v2/institutions", {
      headers: {
        "mono-sec-key": key,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Mono API Error:", data);
      return NextResponse.json({ error: data.message || "Mono rejected the request" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}