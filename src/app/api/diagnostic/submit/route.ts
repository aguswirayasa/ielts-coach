import { z } from "zod";
import { getClient, getConfig } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/yoru";
import { parseJsonContent } from "@/lib/ai/json";
import { db } from "@/lib/db";
import { SkillTag } from "@/generated/prisma/enums";

// Non-streaming call plus Prisma, so the Node.js runtime is required.
export const runtime = "nodejs";

const QuestionSchema = z.object({
  skill: z.enum(["READING", "WRITING", "LISTENING", "SPEAKING"]),
  type: z.string().min(1),
  title: z.string().min(1),
  prompt: z.string().min(1),
  instructions: z.string().min(1),
});

const SubmitRequestSchema = z.object({
  questions: z.array(QuestionSchema).length(4),
  answers: z.object({
    READING: z.string().min(1).max(8000),
    WRITING: z.string().min(1).max(8000),
    LISTENING: z.string().min(1).max(8000),
    SPEAKING: z.string().min(1).max(8000),
  }),
});

const SKILLS = ["READING", "WRITING", "LISTENING", "SPEAKING"] as const;
type SkillKey = (typeof SKILLS)[number];

const BandSchema = z
  .object({
    readingBand: z.number(),
    writingBand: z.number(),
    listeningBand: z.number(),
    speakingBand: z.number(),
    overallBand: z.number().optional(),
    weakestSkill: z.enum(SKILLS).optional(),
    feedback: z.object({
      READING: z.string().min(1),
      WRITING: z.string().min(1),
      LISTENING: z.string().min(1),
      SPEAKING: z.string().min(1),
    }),
    plan: z.string().min(1),
  })
  .passthrough();

function clampBand(value: number): number {
  return Math.min(9, Math.max(0, value));
}

function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = SubmitRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { questions, answers } = parsed.data;
  const client = getClient();
  const { model } = getConfig();

  const questionsBlock = questions
    .map(
      (q) =>
        `[${q.skill}] ${q.title}\nTask: ${q.prompt}\nInstructions: ${q.instructions}`
    )
    .join("\n\n");

  const userPrompt = `Master completed the diagnostic. Score each skill band honestly and conservatively against the official IELTS band descriptors.

QUESTIONS AND ANSWERS:
${questionsBlock}

MASTER'S ANSWERS:
[READING] ${answers.READING}
[WRITING] ${answers.WRITING}
[LISTENING] ${answers.LISTENING}
[SPEAKING] ${answers.SPEAKING}

Respond with STRICT JSON only, no markdown, no commentary. Shape:
{
  "readingBand": 5.5,
  "writingBand": 6.0,
  "listeningBand": 5.0,
  "speakingBand": 6.5,
  "overallBand": 5.5,
  "weakestSkill": "LISTENING",
  "feedback": {
    "READING": "2-3 sentence comment",
    "WRITING": "2-3 sentence comment",
    "LISTENING": "2-3 sentence comment",
    "SPEAKING": "2-3 sentence comment"
  },
  "plan": "3-5 sentence study plan"
}
Band values are numbers from 0 to 9 in 0.5 steps. overallBand is the mean of the four bands rounded to the nearest 0.5. weakestSkill is the skill with the lowest band.`;

  let data: z.infer<typeof BandSchema>;
  try {
    let raw: string;
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: buildSystemPrompt("diagnostic") },
          { role: "user", content: userPrompt },
        ],
      });
      raw = completion.choices[0]?.message?.content ?? "";
    } catch (err) {
      console.error("[api/diagnostic/submit] completion failed:", err);
      return Response.json(
        { error: "Yoru could not score the diagnostic. Try again." },
        { status: 502 }
      );
    }
    data = BandSchema.parse(parseJsonContent(raw));
  } catch (err) {
    console.error("[api/diagnostic/submit] parse failed:", err);
    return Response.json(
      { error: "Yoru could not score the diagnostic. Try again." },
      { status: 502 }
    );
  }

  // Clamp bands into the valid 0-9 range and recompute derived values.
  const readingBand = clampBand(data.readingBand);
  const writingBand = clampBand(data.writingBand);
  const listeningBand = clampBand(data.listeningBand);
  const speakingBand = clampBand(data.speakingBand);
  const overallBand =
    data.overallBand === undefined
      ? roundToHalf((readingBand + writingBand + listeningBand + speakingBand) / 4)
      : clampBand(data.overallBand);
  const bySkill: Record<SkillKey, number> = {
    READING: readingBand,
    WRITING: writingBand,
    LISTENING: listeningBand,
    SPEAKING: speakingBand,
  };
  const weakestSkill: SkillKey =
    data.weakestSkill ??
    SKILLS.reduce((weakest, skill) =>
      bySkill[skill] < bySkill[weakest] ? skill : weakest
    );

  const responses = { questions, answers, feedback: data.feedback, plan: data.plan };

  try {
    await db.diagnosticResult.create({
      data: {
        readingBand,
        writingBand,
        listeningBand,
        speakingBand,
        overallBand,
        weakestSkill: SkillTag[weakestSkill],
        responses,
      },
    });
  } catch (err) {
    console.error("[api/diagnostic/submit] save failed:", err);
    return Response.json(
      { error: "Yoru could not save your results, Master. Try again." },
      { status: 500 }
    );
  }

  return Response.json({
    result: {
      readingBand,
      writingBand,
      listeningBand,
      speakingBand,
      overallBand,
      weakestSkill,
      feedback: data.feedback,
      plan: data.plan,
      saved: true,
    },
  });
}
