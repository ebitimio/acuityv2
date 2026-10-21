import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { buildTools } from "@/lib/ai/tools";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const incoming = Array.isArray(body?.messages) ? body.messages : [];
    if (incoming.length === 0) return NextResponse.json({ error: "No messages" }, { status: 400 });
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "The AI advisor is not configured yet." }, { status: 500 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tools = buildTools(supabase);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `You are the Acuity AI Wealth Manager, a sharp, pragmatic, and highly intelligent financial advisor for Nigerians.
You have tools that query the user's real data. ALWAYS use them when a question involves their numbers.

CRITICAL RULES:
1. NEVER just list out the raw data the user already knows. If they ask "What is my safe to spend?", do not just say "Your safe to spend is ₦X." 
2. ALWAYS structure your response with an analysis. 
   - State the answer clearly.
   - Explain the "Why": Break down the math (e.g., "Your income is ₦X, obligations are ₦Y, leaving you with ₦Z. Divided by your days left, this gives you ₦A/day").
   - Give actionable, smart advice (e.g., "Since your budget is tight, prioritize X over Y").
3. If the user's budget is unrealistic or higher than their income, call it out immediately and explain the danger of debt.
4. Be conversational, direct, and professional. Avoid sounding like a robot reading a database.

FORMATTING:
- Keep responses readable with line breaks.
- Do NOT use Markdown headers (###). Use plain text bullets (-).
- Do not use bold text (**).`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: system },
      ...incoming
        .slice(-12)
        .filter((m: { role?: string; content?: unknown }) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content.slice(0, 2000) })),
    ];

    const toolSpec = tools.map((t) => ({
      type: "function" as const,
      function: { name: t.name, description: t.description, parameters: t.parameters },
    }));

    for (let round = 0; round < 4; round++) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        tools: toolSpec,
        tool_choice: "auto",
      });

      const choice = completion.choices[0];
      messages.push(choice.message);

      const functionCalls = (choice.message.tool_calls ?? []).filter(
        (c): c is OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall => c.type === "function"
      );

      if (functionCalls.length === 0) {
        return NextResponse.json({ response: choice.message.content || "" });
      }

      for (const call of functionCalls) {
        const tool = tools.find((t) => t.name === call.function.name);
        let result: unknown;
        try {
          const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
          result = tool ? await tool.run(args) : { error: `Unknown tool: ${call.function.name}` };
        } catch (e) {
          result = { error: e instanceof Error ? e.message : "Tool failed" };
        }
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
    }

    return NextResponse.json({ response: "I ran out of steps while reasoning about your question. Please try rephrasing." });
  } catch (error: unknown) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI request failed" }, { status: 500 });
  }
}