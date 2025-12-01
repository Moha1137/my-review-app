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

        // Only allow detailed mode if pro is active
        const effectiveMode: Mode = mode === "detailed" && pro ? "detailed" : "simple";

        const client = new OpenAI({
            apiKey: process.env.PERPLEXITY_API_KEY,
            baseURL: "https://api.perplexity.ai",
        });

        // Updated Schema: Added 'rating' and 'spoilers'
        const schema = {
            type: "object" as const,
            additionalProperties: false,
            properties: {
                summary: {
                    type: "string" as const,
                    description: "A concise synopsis of the plot (80–120 words)."
                },
                rating: {
                    type: "string" as const,
                    description: "Real world score (e.g., '8.5/10 IMDb', '92% Rotten Tomatoes', '4.5/5 Goodreads'). If unknown, give a fair estimate."
                },
                genres: {
                    type: "array" as const,
                    items: { type: "string" as const },
                    minItems: 3,
                    maxItems: 3,
                },
                themes: {
                    type: "array" as const,
                    items: { type: "string" as const },
                    minItems: 3,
                    maxItems: 3,
                },
                consensus: {
                    type: "string" as const,
                    description: "One sentence of general audience or critic consensus.",
                },
                character_insights: {
                    type: "array" as const,
                    items: { type: "string" as const },
                },
                // New Dedicated Spoiler Field
                spoilers: {
                    type: "string" as const,
                    description: "A summary of the ending or major plot twists. Only populate if requested, otherwise leave empty."
                },
                citations: {
                    type: "array" as const,
                    items: { type: "string" as const },
                },
            },
            required: ["summary", "genres", "themes", "consensus", "rating"],
        };

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: `You are a media critic. Provide accurate details.
        - For 'rating', find the actual MyAnimeList, IMDb, Rotten Tomatoes, or Goodreads score.
        - If 'spoilers' are requested, summarize the ending or big twist in the 'spoilers' field.
        - Return strictly valid JSON matching the schema.`
            },
            {
                role: "user",
                content: `Title: ${title}\nType: ${type}\nMode: ${effectiveMode}\nSpoilers Requested: ${spoiler}\nProvide JSON.`,
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
            temperature: 0.2, // Lower temperature for more factual accuracy on scores
            max_tokens: 1000,
        });

        const raw = completion.choices?.[0]?.message?.content ?? "{}";
        const parsed = JSON.parse(raw);

        // Extract citations from metadata if available
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
