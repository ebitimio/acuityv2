import { NextResponse } from "next/server";

export async function POST() {
  try {
    const publicKey = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY;
    
    if (!publicKey) {
      return NextResponse.json({ error: "Mono Public Key not configured in Vercel" }, { status: 500 });
    }

    // Generate the hosted Connect URL directly.
    // We don't need the secret key for this step.
    const redirectUrl = "https://acuity.foo.ng/connect/callback";
    const monoUrl = `https://connect.withmono.com/?key=${publicKey}&redirect_url=${encodeURIComponent(redirectUrl)}`;

    return NextResponse.json({ url: monoUrl });
  } catch (error: any) {
    console.error("Mono Create Link Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}