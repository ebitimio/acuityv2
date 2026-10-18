import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const supabase = await createClient();

    // 1. Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch their recent transactions
    const { data: transactions } = await supabase
      .from("transactions")
      .select(`
        amount_minor,
        direction,
        description_clean,
        category_name,
        date
      `)
      .order("date", { ascending: false })
      .limit(50);

    // 3. Format the transactions into a string for the AI context
    const transactionContext = transactions?.map(tx => 
      `- ${new Date(tx.date).toLocaleDateString()}: ${tx.description_clean} | ${tx.category_name || 'Uncategorized'} | ${tx.direction === 'credit' ? '+' : '-'}₦${(tx.amount_minor / 100).toLocaleString()}`
    ).join("\n") || "No transactions found.";

    // 4. Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are the Acuity AI Wealth Manager, an expert financial advisor for Nigerian users. 
          You have access to the user's recent transaction history. 
          Use this data to answer their questions accurately. If they ask about their spending, refer to specific transactions.
          Keep your answers concise, friendly, and use Naira (₦).
          
          USER'S RECENT TRANSACTIONS:
          ${transactionContext}`
        },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    });

    const aiResponse = completion.choices[0].message.content || "";

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}