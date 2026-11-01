import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";
import { CATEGORY_NAMES } from "@/lib/categories"; // Import your categories

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // We only process real transaction updates
    if (body.event === "mono.events.account_updated") {
      const accountData = body.data?.account;
      const transactions = body.data.transactions || [];

      if (!accountData || transactions.length === 0) {
        return NextResponse.json({ status: "ignored_no_data" });
      }

      const monoAccountId = accountData._id || accountData.accountNumber;
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Find the linked account in our DB
      const { data: account } = await supabaseAdmin
        .from("accounts")
        .select("id")
        .eq("mono_account_id", monoAccountId)
        .single();

      if (!account) return NextResponse.json({ status: "ignored_no_account" });

      // Initialize OpenAI
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Process each transaction
      for (const t of transactions) {
        let category = "Uncategorized";
        
        // Use AI to categorize
        if (process.env.OPENAI_API_KEY && t.narration) {
          try {
            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: `You are a transaction categorizer for a Nigerian personal finance app. 
                  Your job is to look at a bank transaction narration and pick the single best category from this exact list:
                  ${CATEGORY_NAMES.join(", ")}
                  
                  If the transaction is a credit (incoming money), use "Income".
                  If it's a transfer between the user's own accounts, use "Transfers".
                  If you are not confident, respond with "Uncategorized".
                  
                  Respond with ONLY the category name. No punctuation, no explanation.`
                },
                {
                  role: "user",
                  content: `Narration: "${t.narration}". Type: "${t.type}"`
                }
              ],
              temperature: 0,
              max_tokens: 10,
            });

            const aiCategory = completion.choices[0].message.content?.trim();
            if (aiCategory && CATEGORY_NAMES.includes(aiCategory)) {
              category = aiCategory;
            } else if (aiCategory === "Uncategorized" || aiCategory === "Income" || aiCategory === "Transfers") {
              category = aiCategory;
            }
          } catch (e) {
            console.error("AI Categorization failed:", e);
            // Fallback to Uncategorized if AI fails
          }
        }

        // Insert the transaction
        const row = {
          account_id: account.id,
          amount_minor: Math.round(Number(t.amount) || 0),
          direction: t.type === "credit" ? "credit" : "debit",
          description_raw: t.narration || "Mono Transaction",
          description_clean: t.narration || "Mono Transaction",
          category_name: category,
          date: new Date(t.date).toISOString(),
          status: "posted",
          source: "alert",
        };

        const { error } = await supabaseAdmin.from("transactions").insert(row);
        if (error) throw error;
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}