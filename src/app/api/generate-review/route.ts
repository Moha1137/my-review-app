import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type Mode = "simple" | "detailed";
type MediaType = "book" | "manga" | "movie" | "tv";

export async function POST(req: NextRequest) {
    try {
        const { title, type, mode = "simple", pro = false, spoiler = false } = (await req.json()) as {
            title: string;
            type: MediaType;
            mode?: Mode;
            pro?: boolean;
            spoiler?: boolean;
        };

        if (!title || !type) {
            return NextResponse.json({ error: "Missing title or type" }, { status: 400 });
        }

        const effectiveMode: Mode = mode === "detailed" && pro ? "detailed" : "simple";

        const client = new OpenAI({
            apiKey: process.env.PERPLEXITY_API_KEY,
            baseURL: "https://api.perplexity.ai",
        });

        const schema = {
            type: "object" as const,
            additionalProperties: false,
            properties: {
                summary: {
                    type: "string" as const,
                    description: "A thorough, engaging synopsis that covers the main plot, tone, and standout moments (150-200 words)."
                },
                rating: {
                    type: "string" as const,
                    description: "Real-world score from IMDb, Rotten Tomatoes, MyAnimeList, or Goodreads. Format: '8.5/10 IMDb' or '92% RT'. If unavailable, provide a fair critical estimate."
                },
                genres: {
                    type: "array" as const,
                    items: { type: "string" as const },
                    minItems: 3,
                    maxItems: 4,
                },
                strengths: {
                    type: "array" as const,
                    items: { type: "string" as const },
                    minItems: 3,
                    maxItems: 5,
                    description: "Specific positive aspects that work well. Be concrete about WHY they work."
                },
                weaknesses: {
                    type: "array" as const,
                    items: { type: "string" as const },
                    minItems: 2,
                    maxItems: 4,
                    description: "REQUIRED: Genuine criticisms from critics or audiences. Every work has flaws - identify them honestly (pacing issues, plot holes, weak characters, inconsistent tone, rushed ending, etc.)"
                },
                consensus: {
                    type: "string" as const,
                    description: "A balanced sentence capturing both praise and criticism (40-60 words).",
                },
                detailed_review: {
                    type: "string" as const,
                    description: "3-4 sentences analyzing quality, execution, and impact. Be honest about both strengths AND weaknesses."
                },
                character_insights: {
                    type: "array" as const,
                    items: { type: "string" as const },
                },
                spoilers: {
                    type: "string" as const,
                    description: "If requested: Major plot revelations and ending (100-150 words). Otherwise empty string."
                },
                citations: {
                    type: "array" as const,
                    items: { type: "string" as const },
                },
            },
            required: ["summary", "genres", "consensus", "rating", "detailed_review", "strengths", "weaknesses"],
        };

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: `You are a professional media critic. Write balanced, honest reviews.

CRITICAL REQUIREMENT: You MUST identify genuine weaknesses. Every work has flaws - no exceptions. Common issues include:
- Pacing problems (too slow/rushed)
- Underdeveloped characters or arcs
- Plot holes or contrivances
- Weak/predictable endings
- Tonal inconsistencies
- Uneven quality across episodes/chapters

Your reviews should be:
✓ Specific with examples
✓ Balanced (highlight good AND bad)
✓ Honest about actual reception (check real reviews)
✓ Professional but critical

NEVER say "no flaws" or "perfect" - that's unrealistic and unhelpful to readers.`
            },
            {
                role: "user",
                content: `Review: "${title}" (${type})
Mode: ${effectiveMode}
Spoilers: ${spoiler ? "Yes" : "No"}

Provide an honest, critical analysis. Include at least 2-3 legitimate weaknesses that critics or audiences have noted.`,
            },
        ];

        const completion = await client.chat.completions.create({
            model: "sonar-pro",
            messages,
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "media_review",
                    schema,
                    strict: true,
                },
            },
            temperature: 0.4,
            max_tokens: 2000,
        });

        const raw = completion.choices?.[0]?.message?.content ?? "{}";
        const parsed = JSON.parse(raw);

        const citations: string[] = [];
        if (completion.choices?.[0]?.message) {
            const msg = completion.choices[0].message as any;
            if (msg.citations) citations.push(...msg.citations);
        }

        return NextResponse.json({
            ...parsed,
            citations: citations.length > 0 ? citations : undefined,
        });

    } catch (err: any) {
        console.error("API Error:", err);
        return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
    }
}
