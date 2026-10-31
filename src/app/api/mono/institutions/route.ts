import { NextResponse } from "next/server";

export async function GET() {
  try {
    // HARDCODED KEY FOR TESTING
    const key = "test_sk_c1xb0h4xgnft3u0ouvy9"; 

    const res = await fetch("https://api.withmono.com/v2/institutions", {
      headers: {
        "mono-sec-key": key,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Mono rejected the request" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}