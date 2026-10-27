import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { workspaceId } = await req.json();
    if (!workspaceId) return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI not configured" }, { status: 500 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Fetch data for the last 30 days (Current Month)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    // 2. Fetch data for the previous 30 days (Previous Month)
    const prevEnd = new Date(start);
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - 30);

    const { data: accounts } = await supabase.from("accounts").select("id").eq("workspace_id", workspaceId);
    const accountIds = (accounts ?? []).map(a => a.id);

    if (accountIds.length === 0) return NextResponse.json({ error: "No accounts found" }, { status: 400 });

    // Fetch current month transactions
    const { data: currentTxns } = await supabase
      .from("transactions")
      .select("amount_minor, direction, category_name")
      .in("account_id", accountIds)
      .gte("date", start.toISOString())
      .lte("date", end.toISOString());

    // Fetch previous month transactions
    const { data: prevTxns } = await supabase
      .from("transactions")
      .select("amount_minor, direction, category_name")
      .in("account_id", accountIds)
      .gte("date", prevStart.toISOString())
      .lt("date", prevEnd.toISOString());

    // 3. Calculate metrics
    const calcMetrics = (txns: any[]) => {
      let income = 0, spent = 0;
      const byCat: Record<string, number> = {};
      for (const t of txns ?? []) {
        if (t.direction === "credit") income += t.amount_minor;
        else {
          spent += t.amount_minor;
          const c = t.category_name || "Uncategorized";
          byCat[c] = (byCat[c] || 0) + t.amount_minor;
        }
      }
      return { income: income / 100, spent: spent / 100, byCat };
    };

    const current = calcMetrics(currentTxns ?? []);
    const prev = calcMetrics(prevTxns ?? []);

    const topCats = Object.entries(current.byCat)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => `${name}: ₦${(amount / 100).toLocaleString()}`)
      .join(", ");

    // 4. Ask AI for the narrative
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const prompt = `You are the Acuity AI Wealth Manager. Write a short, exciting "Report Card" summary for the user's last 30 days.
    
    Current Month Data:
    - Total Income: ₦${current.income.toLocaleString()}
    - Total Spent: ₦${current.spent.toLocaleString()}
    - Top Categories: ${topCats || "None"}
    
    Previous Month Data:
    - Total Income: ₦${prev.income.toLocaleString()}
    - Total Spent: ₦${prev.spent.toLocaleString()}
    
    Write 2 short paragraphs.
    Paragraph 1: A fun summary of how they did compared to last month. (e.g. "You spent 20% less than last month, great job!")
    Paragraph 2: 2 bullet points of actionable advice based on their top categories.
    
    Keep it conversational, encouraging, and use Naira. Do not use Markdown headers. Use emojis sparingly.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
    });

    const aiSummary = completion.choices[0].message.content || "Keep up the good work!";

    return NextResponse.json({
      income: current.income,
      spent: current.spent,
      prevIncome: prev.income,
      prevSpent: prev.spent,
      topCats: Object.entries(current.byCat).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, amount]) => ({ name, amount: amount / 100 })),
      aiSummary,
    });

  } catch (error) {
    console.error("Report Error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}