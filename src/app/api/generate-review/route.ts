import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type Mode = "simple" | "detailed";
type MediaType = "book" | "manga" | "movie" | "tv";

export async function POST(req: NextRequest) {
    try {
        // 1. Parse and validate request body
        const body = await req.json();
        const {
            title,
            type,
            mode = "simple",
            pro = false,
            spoiler = false,
        } = body as {
            title: string;
            type: MediaType;
            mode?: Mode;
            pro?: boolean;
            spoiler?: boolean;
        };

        if (!title || !type) {
            return NextResponse.json(
                { error: "Missing title or type" },
                { status: 400 }
            );
        }

        // 2. Check API key exists
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error("Missing GROQ_API_KEY in environment variables");
            return NextResponse.json(
                { error: "Server configuration error: missing API key" },
                { status: 500 }
            );
        }

        const effectiveMode: Mode =
            mode === "detailed" && pro ? "detailed" : "simple";

        // 3. Create Groq client (OpenAI-compatible)
        const client = new OpenAI({
            apiKey,
            baseURL: "https://api.groq.com/openai/v1",
        });

        // 4. Build messages with strong critic prompt
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: `You are a professional media critic with deep knowledge of books, manga, movies, and TV shows. You write balanced, honest, and detailed reviews.

CRITICAL REQUIREMENTS:
1. You MUST always respond with valid JSON matching the exact structure requested.
2. You MUST identify genuine weaknesses in every work — no exceptions. Every published work has flaws.
3. Common weaknesses to look for include:
   - Pacing problems (too slow or too rushed)
   - Underdeveloped characters or story arcs
   - Plot holes or logical inconsistencies
   - Weak, predictable, or unsatisfying endings
   - Tonal inconsistencies or uneven quality
   - Overused tropes or clichés
   - Poor adaptation choices (if applicable)
4. Your reviews must be:
   - Specific (use concrete examples, not vague statements)
   - Balanced (acknowledge both strengths AND genuine flaws)
   - Accurate (reflect real critical and audience reception)
   - Professional in tone

NEVER describe any work as flawless or perfect. That is not credible criticism.`,
            },
            {
                role: "user",
                content: `Write a full critical review for: "${title}" (${type})
Review mode: ${effectiveMode === "detailed" ? "detailed and comprehensive" : "standard"}
Include spoilers: ${spoiler ? "Yes — include major plot revelations and ending details" : "No — keep it spoiler-free"}

Respond ONLY with a valid JSON object using this exact structure:
{
  "summary": "A thorough engaging synopsis covering the main plot tone and standout moments (150-200 words)",
  "rating": "Real-world score e.g. '8.5/10 IMDb' or '92% Rotten Tomatoes' or '8.7/10 MAL'. Use actual known scores. If unknown provide a fair critical estimate.",
  "genres": ["genre1", "genre2", "genre3"],
  "strengths": [
    "Specific strength with concrete reason why it works",
    "Another specific strength",
    "Another specific strength"
  ],
  "weaknesses": [
    "Specific genuine weakness or criticism that critics or audiences have noted",
    "Another specific weakness with explanation",
    "Another specific weakness"
  ],
  "consensus": "A single balanced sentence of 40-60 words capturing both the praise and the criticism of this work",
  "detailed_review": "3-4 sentences analyzing quality execution and impact honestly covering both what works and what does not",
  "character_insights": [
    "Insight about a key character",
    "Insight about another character",
    "Insight about another character"
  ],
  "spoilers": "${spoiler ? "Major plot revelations and ending details in 100-150 words" : ""}"
}

Important: genres must have 3-4 items. strengths must have 3-5 items. weaknesses must have 2-4 items. character_insights must have 2-3 items.`,
            },
        ];

        // 5. Call Groq API
        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.4,
            max_tokens: 2000,
            response_format: { type: "json_object" },
        });

        // 6. Parse the response
        const raw = completion.choices?.[0]?.message?.content;
        if (!raw) {
            return NextResponse.json(
                { error: "No response received from AI model" },
                { status: 500 }
            );
        }

        let parsed: Record<string, any>;
        try {
            parsed = JSON.parse(raw);
        } catch (parseError) {
            console.error("Failed to parse AI response as JSON:", raw);
            return NextResponse.json(
                { error: "AI returned invalid JSON. Please try again." },
                { status: 500 }
            );
        }

        // 7. Validate required fields exist and are correct types
        const ensureArray = (val: any): string[] =>
            Array.isArray(val) ? val : [];
        const ensureString = (val: any): string =>
            typeof val === "string" ? val : "";

        const safeResponse = {
            summary: ensureString(parsed.summary),
            rating: ensureString(parsed.rating) || "N/A",
            genres: ensureArray(parsed.genres),
            strengths: ensureArray(parsed.strengths),
            weaknesses: ensureArray(parsed.weaknesses),
            consensus: ensureString(parsed.consensus),
            detailed_review: ensureString(parsed.detailed_review),
            character_insights: ensureArray(parsed.character_insights),
            spoilers: ensureString(parsed.spoilers),
        };

        // 8. Return clean response
        return NextResponse.json(safeResponse);
    } catch (err: any) {
        console.error("API Route Error:", err);

        // Return a helpful error message
        const message =
            err?.message ?? "An unknown error occurred. Please try again.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
