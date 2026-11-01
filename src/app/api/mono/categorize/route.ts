import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";
import { CATEGORY_NAMES } from "@/lib/categories";

export async function POST(req: Request) {
  try {
    const { workspaceId } = await req.json();
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Find up to 10 uncategorized transactions
    const { data: txns } = await supabaseAdmin
      .from("transactions")
      .select("id, description_clean, direction")
      .eq("workspace_id", workspaceId)
      .eq("category_name", "Uncategorized")
      .limit(10);

    if (!txns || txns.length === 0) return NextResponse.json({ status: "no_txns" });

    for (const t of txns) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: `Categorize this transaction into ONE of these: ${CATEGORY_NAMES.join(", ")}. Reply with ONLY the category name.` },
            { role: "user", content: `Narration: "${t.description_clean}". Type: "${t.direction}"` }
          ],
          temperature: 0,
        });
        const cat = completion.choices[0].message.content?.trim();
        if (cat && CATEGORY_NAMES.includes(cat)) {
          await supabaseAdmin.from("transactions").update({ category_name: cat }).eq("id", t.id);
        }
      } catch (e) { console.error("AI Error:", e); }
    }

    return NextResponse.json({ status: "success", count: txns.length });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}