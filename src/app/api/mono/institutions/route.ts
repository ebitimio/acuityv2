import { NextResponse } from "next/server";

export async function GET() {
  try {
    const key = process.env.MONO_SECRET_KEY;
    if (!key) {
      return NextResponse.json({ error: "MONO_SECRET_KEY is missing in Vercel" }, { status: 500 });
    }

    // Use v2/institutions which is the standard endpoint for Connect
    const res = await fetch("https://api.withmono.com/v2/institutions", {
      headers: {
        "mono-sec-key": key,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Mono Institutions API Error:", data);
      return NextResponse.json({ error: data.message || "Mono rejected the request" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Mono Institutions Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}