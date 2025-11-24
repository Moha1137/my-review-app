// src/app/api/generate-review/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type Mode = "simple" | "detailed";
type MediaType = "book" | "manga" | "movie" | "tv";

export async function POST(req: NextRequest) {
    try {
        const { title, type, mode = "simple", pro = false } = (await req.json()) as {
            title: string;
            type: MediaType;
            mode?: Mode;
            pro?: boolean; // temporary flag until Stripe gates this
        };

        if (!title || !type) {
            return NextResponse.json({ error: "Missing title or type" }, { status: 400 });
        }

        // Gate detailed mode behind pro
        const effectiveMode: Mode = mode === "detailed" && pro ? "detailed" : "simple";

        const client = new OpenAI({
            apiKey: process.env.PERPLEXITY_API_KEY,
            baseURL: "https://api.perplexity.ai",
        });

        const simpleSchema = {
            type: "object",
            additionalProperties: false,
            properties: {
                summary: { type: "string", description: "80–120 words max." },
                genres: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3,
                },
                themes: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3,
                },
                consensus: {
                    type: "string",
                    description: "One sentence of general audience or critic consensus.",
                },
                citations: {
                    type: "array",
                    items: { type: "string", format: "uri" },
                    maxItems: 3,
                },
            },
            required: ["summary", "genres", "themes", "consensus"],
        };

        const detailedSchema = {
            type: "object",
            additionalProperties: false,
            properties: {
                summary: { type: "string", description: "2 short paragraphs max." },
                genres: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 6,
                },
                themes: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 5,
                    maxItems: 8,
                },
                character_insights: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 5,
                },
                discussion_questions: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 5,
                },
                adaptation_notes: { type: "string" },
                citations: {
                    type: "array",
                    items: { type: "string", format: "uri" },
                    maxItems: 6,
                },
            },
            required: ["summary", "genres", "themes"],
        };

        const schema = effectiveMode === "simple" ? simpleSchema : detailedSchema;

        const messages = [
            {
                role: "system",
                content:
                    effectiveMode === "simple"
                        ? "Return only JSON matching the schema, no markdown, keep sentences short and plain, avoid spoilers."
                        : "Return only JSON matching the schema, no markdown, be thorough but concise, avoid unnecessary spoilers.",
            },
            {
                role: "user",
                content: `Title: ${title}\nType: ${type}\nMode: ${effectiveMode}\nProvide clean JSON as specified.`,
            },
        ];

        const completion = await client.chat.completions.create({
            model: "sonar-pro",
            messages,
            response_format: { type: "json_schema", json_schema: { schema } },
            temperature: effectiveMode === "simple" ? 0.5 : 0.7,
            max_tokens: effectiveMode === "simple" ? 500 : 1200,
        });

        const raw = completion.choices?.[0]?.message?.content ?? "{}";
        const parsed = JSON.parse(raw);

        return NextResponse.json(parsed);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
    }
}
