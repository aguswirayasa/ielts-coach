import OpenAI from "openai";

export interface AiConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}

export function getConfig(): AiConfig {
  return {
    // Bracket access: the env var name starts with a digit, which is invalid
    // as a dotted identifier (process.env.9ROUTER_API_KEY would not compile).
    baseURL: process.env.AI_BASE_URL ?? "http://127.0.0.1:20128/v1",
    apiKey: process.env["9ROUTER_API_KEY"] ?? "local",
    model: process.env.AI_MODEL ?? "fma/claude-opus-5",
  };
}

let client: OpenAI | null = null;

export function getClient(): OpenAI {
  if (!client) {
    const { baseURL, apiKey } = getConfig();
    client = new OpenAI({ baseURL, apiKey });
  }
  return client;
}
