import OpenAI from "openai";

export type ModelConfig = {
  model: string;
  temperature?: number;
  maxTokens?: number;
};

let client: InstanceType<typeof OpenAI> | null = null;

export const getOpenAI = (): InstanceType<typeof OpenAI> => {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  client = new OpenAI({ apiKey });
  return client;
};

export const defaultModelConfig: ModelConfig = {
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  temperature: 0.2,
  maxTokens: 1200,
};

