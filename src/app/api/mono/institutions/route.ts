import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.withmono.com/v3/institutions?scope=financial_data", {
      headers: {
        "mono-sec-key": process.env.MONO_SECRET_KEY!,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch institutions");
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}