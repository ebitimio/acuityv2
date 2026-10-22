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

    // Get the active workspace from localStorage (sent by client)
    const workspaceId = body?.workspaceId ?? null;
    const workspaceName = body?.workspaceName ?? "Current";

    const tools = buildTools(supabase);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `You are the Acuity AI Wealth Manager for Nigerian users.
ACTIVE WORKSPACE: "${workspaceName}"

CRITICAL RULES:
1. All tools query the currently active workspace. Never reference data from other workspaces.
2. If the user just created a new workspace, the data will be sparse or empty. Adjust your tone and advice accordingly — don't invent data.
3. NEVER invent amounts. Use Naira (₦).
4. ALWAYS check income, obligations, and budget before giving spending advice.
5. Be realistic. If math says spend ₦300k/day but budget is ₦50k, warn the user.
6. Use plain text. Do not use Markdown headers.`;

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