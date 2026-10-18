import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

const naira = (minor: number) => `₦${Math.round(minor / 100).toLocaleString("en-NG")}`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const incoming = Array.isArray(body?.messages) ? body.messages : [];
    if (incoming.length === 0) return NextResponse.json({ error: "No messages" }, { status: 400 });
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "The AI advisor is not configured yet." }, { status: 500 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const notSplit = 'category_name.is.null,category_name.neq."Split Parent"';

    const [recent, month, ws, balances, accounts] = await Promise.all([
      supabase.from("transactions").select("amount_minor,direction,description_clean,category_name,date").or(notSplit).order("date", { ascending: false }).limit(40),
      supabase.from("transactions").select("amount_minor,direction,category_name").or(notSplit).gte("date", monthStart.toISOString()).limit(1000),
      supabase.from("workspaces").select("budget_limit_minor").eq("owner_id", user.id).single(),
      supabase.rpc("get_account_balances"),
      supabase.from("accounts").select("id,name,institution"),
    ]);

    let spent = 0, income = 0;
    const byCat = new Map<string, number>();
    for (const t of month.data ?? []) {
      if (t.direction === "debit") { spent += t.amount_minor; const k = t.category_name || "Uncategorized"; byCat.set(k, (byCat.get(k) ?? 0) + t.amount_minor); }
      else income += t.amount_minor;
    }
    const topCats = [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `- ${k}: ${naira(v)}`).join("\n") || "none yet";
    const balMap = new Map((balances.data ?? []).map((b: { account_id: string; current_minor: number }) => [b.account_id, b.current_minor]));
    const accountLines = (accounts.data ?? []).map((a) => `- ${a.name} (${a.institution}): ${naira(Number(balMap.get(a.id) ?? 0))}`).join("\n") || "none";
    const txLines = (recent.data ?? []).map((t) => `- ${new Date(t.date).toLocaleDateString("en-NG")}: ${t.description_clean} | ${t.category_name || "Uncategorized"} | ${t.direction === "credit" ? "+" : "-"}${naira(t.amount_minor)}`).join("\n") || "No transactions found.";

    const system = `You are the Acuity AI Wealth Manager, a practical financial coach for Nigerian users.
Use only the data below. If something is not in the data, say so instead of guessing. Be concise, friendly and specific. Use Naira (₦). Do not give regulated investment or legal advice.

THIS MONTH
- Income: ${naira(income)}
- Spending: ${naira(spent)}
- Monthly budget: ${ws.data?.budget_limit_minor ? naira(ws.data.budget_limit_minor) : "not set"}
Spending by category:
${topCats}

ACCOUNT BALANCES
${accountLines}

LATEST TRANSACTIONS
${txLines}`;

    const history = incoming.slice(-12).filter((m: { role?: string; content?: unknown }) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string").map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content.slice(0, 2000) }));
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({ model: "gpt-4o-mini", messages: [{ role: "system", content: system }, ...history] });

    return NextResponse.json({ response: completion.choices[0].message.content || "" });
  } catch (error: unknown) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI request failed" }, { status: 500 });
  }
}