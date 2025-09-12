import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, defaultModelConfig } from "@/lib/ai/openai";
import type { Resume, TargetJob } from "@/lib/types/resume";

type GenerateBody = {
  resume: Partial<Resume>;
  target: TargetJob;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateBody;
    const client = getOpenAI();

    const system = `You are an expert resume writer who specializes in ATS-friendly resumes.
Follow these rules:
- Use concise, metric-driven bullet points starting with action verbs.
- Include relevant keywords from the target job.
- Avoid tables, images, columns, headers/footers.
- Output JSON matching the provided TypeScript types for Resume.
- Dates: use YYYY-MM or 'Present'.`;

    const user = JSON.stringify({ resume: body.resume, target: body.target });

    const completion = await client.chat.completions.create({
      model: defaultModelConfig.model,
      temperature: defaultModelConfig.temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      max_tokens: defaultModelConfig.maxTokens,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const generated = JSON.parse(content) as Resume;
    return NextResponse.json({ resume: generated });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate resume" }, { status: 500 });
  }
}

