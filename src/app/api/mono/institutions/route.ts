import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.MONO_SECRET_KEY) {
      return NextResponse.json({ error: "Mono secret key missing" }, { status: 500 });
    }

    // Use v2/institutions which is the standard endpoint for Connect
    const res = await fetch("https://api.withmono.com/v2/institutions", {
      headers: {
        "mono-sec-key": process.env.MONO_SECRET_KEY,
      },
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch institutions");

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Mono Institutions Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}