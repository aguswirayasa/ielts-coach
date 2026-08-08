import { z } from "zod";
import { getClient, getConfig } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/yoru";
import { parseJsonContent } from "@/lib/ai/json";
import { db } from "@/lib/db";
import { SkillTag, ExerciseType } from "@/generated/prisma/enums";

// Non-streaming call plus Prisma, so the Node.js runtime is required.
export const runtime = "nodejs";

const StartRequestSchema = z.object({
  skill: z.enum(["READING", "WRITING", "LISTENING", "SPEAKING"]),
  difficulty: z.number().min(1).max(9).default(5),
});

const ExerciseSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  prompt: z.string().min(1),
  content: z.string().min(1),
  answerKey: z.object({
    correctAnswer: z.string().min(1),
    explanation: z.string().min(1),
  }),
});

const TYPE_OPTIONS: Record<string, string[]> = {
  READING: ["MCQ", "TF_NG", "GAP_FILL"],
  WRITING: ["WRITING_T1", "WRITING_T2"],
  LISTENING: ["MCQ", "GAP_FILL"],
  SPEAKING: ["SPEAKING_P2"],
};

const TYPE_GUIDANCE: Record<string, string> = {
  READING: "a passage with questions (multiple choice, true/false/not given, or gap fill)",
  WRITING: "an essay task (Task 1 report/letter or Task 2 essay)",
  LISTENING: "a short transcript with questions (multiple choice or gap fill)",
  SPEAKING: "a Part 2 long-turn cue card",
};

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

  const { skill, difficulty } = parsed.data;
  const client = getClient();
  const { model } = getConfig();

  const userPrompt = `Prepare ONE IELTS practice exercise for Master. Skill: ${skill}. Difficulty: ${difficulty} on a scale of 1 (easiest) to 9 (hardest, near native level).

For ${skill}, create ${TYPE_GUIDANCE[skill]}. Use exactly one of these types: ${TYPE_OPTIONS[skill].join(", ")}.

IMPORTANT: Do NOT include the answer key anywhere in the title, prompt, or content. Master must answer blind; the correct answer must never be revealed before submission.

The "prompt" field is the instruction line shown above the exercise, e.g. "Read the passage, then choose the best answer." The "content" field holds the full exercise body: the passage and question text for reading, the essay task for writing, the transcript and question for listening, the cue card for speaking.

Respond with STRICT JSON only, no markdown, no commentary. Shape:
{ "type": "MCQ", "title": "short title", "prompt": "instruction line", "content": "full exercise body", "answerKey": { "correctAnswer": "the correct answer", "explanation": "why it is correct" } }`;

  let raw: string;
  try {
    raw = await callModel(client, model, userPrompt);
  } catch (err) {
    console.error("[api/practice/start] completion failed:", err);
    return Response.json(
      { error: "Yoru could not prepare an exercise. Try again." },
      { status: 502 }
    );
  }

  let data: z.infer<typeof ExerciseSchema>;
  try {
    data = ExerciseSchema.parse(parseJsonContent(raw));
  } catch (err) {
    console.error("[api/practice/start] parse failed:", err);
    return Response.json(
      { error: "Yoru could not prepare an exercise. Try again." },
      { status: 502 }
    );
  }

  try {
    const exercise = await db.exercise.create({
      data: {
        skill: SkillTag[skill],
        type: ExerciseType[data.type as keyof typeof ExerciseType],
        difficulty,
        prompt: data.prompt,
        content: data.content,
        answerKey: data.answerKey,
      },
    });
    return Response.json({
      exercise: {
        id: exercise.id,
        skill,
        type: exercise.type,
        title: data.title,
        prompt: data.prompt,
        content: data.content,
      },
    });
  } catch (err) {
    console.error("[api/practice/start] save failed:", err);
    return Response.json(
      { error: "Yoru could not save the exercise, Master. Try again." },
      { status: 500 }
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
