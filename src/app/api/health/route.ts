import { NextResponse } from "next/server";
import { getConfig } from "@/lib/ai/client";

// Health: config only, no LLM call — cheap enough for the pill to ping on mount.
export function GET() {
  const { model, baseURL } = getConfig();
  return NextResponse.json({ ok: true, model, baseUrl: baseURL });
}
