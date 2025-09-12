import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, defaultModelConfig } from "@/lib/ai/openai";
import type { Resume, TargetJob, AtsAnalysis } from "@/lib/types/resume";

type AnalyzeBody = {
  resume: Resume;
  target: TargetJob;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyzeBody;
    const client = getOpenAI();
    const system = `You are an ATS analyzer.
Score how well a resume matches a target job. Return JSON AtsAnalysis.
Consider: keyword coverage, measurable impact, clarity, formatting risks, dates consistency.`;
    const user = JSON.stringify({ resume: body.resume, target: body.target });

    const completion = await client.chat.completions.create({
      model: defaultModelConfig.model,
      temperature: 0.1,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const analysis = JSON.parse(content) as AtsAnalysis;
    return NextResponse.json({ analysis });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to analyze resume" }, { status: 500 });
  }
}

