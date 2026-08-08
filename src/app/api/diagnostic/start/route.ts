import { z } from "zod";
import { getClient, getConfig } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/yoru";
import { parseJsonContent } from "@/lib/ai/json";

// Non-streaming call, so the Node.js runtime is safe to use.
export const runtime = "nodejs";

const StartRequestSchema = z.object({
  ieltsType: z.enum(["ACADEMIC", "GENERAL"]).default("ACADEMIC"),
});

const QuestionSchema = z.object({
  skill: z.enum(["READING", "WRITING", "LISTENING", "SPEAKING"]),
  type: z.string().min(1),
  title: z.string().min(1),
  prompt: z.string().min(1),
  instructions: z.string().min(1),
});

const SKILLS = ["READING", "WRITING", "LISTENING", "SPEAKING"] as const;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const parsed = StartRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { ieltsType } = parsed.data;
  const client = getClient();
  const { model } = getConfig();

  const userPrompt = `Prepare a full IELTS diagnostic for Master. The test type is ${ieltsType}.

IMPORTANT: Do NOT include the answer key anywhere in the output. Master must answer blind; the correct answer must not appear in instructions, prompt, or title.

Create EXACTLY FOUR exercises, one per skill, in this order: READING, WRITING, LISTENING, SPEAKING.
- READING: one passage-based multiple choice question (type "MCQ"). The prompt must contain the full passage text plus the question with answer options.
- WRITING: one Task 2 essay prompt (type "WRITING_T2"). The prompt must contain the essay task.
- LISTENING: one multiple choice question (type "MCQ"). The prompt must contain a short transcript plus the question with answer options.
- SPEAKING: one Part 2 long-turn cue card (type "SPEAKING_P2"). The prompt must contain the full cue card.

Respond with STRICT JSON only, no markdown, no commentary. Shape:
{ "questions": [ { "skill": "READING", "type": "MCQ", "title": "...", "prompt": "passage/question text", "instructions": "..." }, { "skill": "WRITING", "type": "WRITING_T2", "title": "...", "prompt": "essay task", "instructions": "..." }, { "skill": "LISTENING", "type": "MCQ", "title": "...", "prompt": "transcript + question", "instructions": "..." }, { "skill": "SPEAKING", "type": "SPEAKING_P2", "title": "...", "prompt": "cue card", "instructions": "..." } ] }`;

  let raw: string;
  try {
    raw = await callModel(client, model, userPrompt);
  } catch (err) {
    console.error("[api/diagnostic/start] completion failed:", err);
    return Response.json(
      { error: "Yoru could not prepare the diagnostic. Try again." },
      { status: 502 }
    );
  }

  try {
    const data = parseJsonContent(raw) as { questions?: unknown };
    const questions = z.array(QuestionSchema).parse(data.questions);
    if (
      questions.length !== SKILLS.length ||
      questions.some((q, i) => q.skill !== SKILLS[i])
    ) {
      throw new Error("Model returned wrong skill set.");
    }
    return Response.json({ questions });
  } catch (err) {
    console.error("[api/diagnostic/start] parse failed:", err);
    return Response.json(
      { error: "Yoru could not prepare the diagnostic. Try again." },
      { status: 502 }
    );
  }
}

// Try JSON mode first; some providers reject response_format, so fall back.
async function callModel(
  client: ReturnType<typeof getClient>,
  model: string,
  userPrompt: string
): Promise<string> {
  const base = {
    model,
    messages: [
      { role: "system" as const, content: buildSystemPrompt("generate") },
      { role: "user" as const, content: userPrompt },
    ],
  };
  try {
    const completion = await client.chat.completions.create({
      ...base,
      response_format: { type: "json_object" },
    });
    return completion.choices[0]?.message?.content ?? "";
  } catch {
    const completion = await client.chat.completions.create(base);
    return completion.choices[0]?.message?.content ?? "";
  }
}
