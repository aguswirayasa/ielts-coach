import { z } from "zod";
import { getClient, getConfig } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/yoru";
import { parseJsonContent } from "@/lib/ai/json";
import { db } from "@/lib/db";
import type { SkillTag } from "@/generated/prisma/enums";

// Non-streaming call plus Prisma, so the Node.js runtime is required.
export const runtime = "nodejs";

const SubmitRequestSchema = z.object({
  exerciseId: z.string().min(1),
  response: z.string().min(1).max(8000),
});

const EvaluationSchema = z.object({
  bandEstimate: z.number(),
  feedback: z.string().min(1),
  scores: z.record(z.string(), z.string()),
  tips: z.array(z.string()),
});

const SKILL_LABEL: Record<string, string> = {
  READING: "Reading",
  WRITING: "Writing",
  LISTENING: "Listening",
  SPEAKING: "Speaking",
};

const CRITERIA: Record<string, string> = {
  WRITING:
    "Task Achievement, Coherence and Cohesion, Lexical Resource, Grammar Range and Accuracy",
  SPEAKING: "Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation",
  READING: "accuracy, e.g. { \"accuracy\": \"3/5 correct\", \"notes\": \"...\" }",
  LISTENING: "accuracy, e.g. { \"accuracy\": \"3/5 correct\", \"notes\": \"...\" }",
};

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

  const { exerciseId, response } = parsed.data;
  const client = getClient();
  const { model } = getConfig();

  let exercise: {
    id: string;
    skill: SkillTag;
    type: string;
    prompt: string;
    content: string;
    answerKey: unknown;
  } | null = null;
  try {
    exercise = await db.exercise.findUnique({ where: { id: exerciseId } });
  } catch (err) {
    console.error("[api/practice/submit] load failed:", err);
    return Response.json(
      { error: "Yoru could not save your attempt, Master. Try again." },
      { status: 500 }
    );
  }
  if (!exercise) {
    return Response.json({ error: "Exercise not found." }, { status: 404 });
  }

  const userPrompt = `Master completed a ${SKILL_LABEL[exercise.skill]} practice exercise. Evaluate the response honestly and conservatively against the official IELTS band descriptors.

EXERCISE (type: ${exercise.type}):
Prompt: ${exercise.prompt}
Content: ${exercise.content}

MASTER'S RESPONSE:
${response}

Respond with STRICT JSON only, no markdown, no commentary. Shape:
{
  "bandEstimate": 6.0,
  "feedback": "2-4 sentence overall comment",
  "scores": { "criterion": "score and short comment", ... },
  "tips": ["tip 1", "tip 2"]
}
For ${SKILL_LABEL[exercise.skill]}, use these criteria: ${CRITERIA[exercise.skill]}. bandEstimate is a number from 0 to 9 in 0.5 steps.`;

  let data: z.infer<typeof EvaluationSchema>;
  try {
    let raw: string;
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: buildSystemPrompt("evaluate") },
          { role: "user", content: userPrompt },
        ],
      });
      raw = completion.choices[0]?.message?.content ?? "";
    } catch (err) {
      console.error("[api/practice/submit] completion failed:", err);
      return Response.json(
        { error: "Yoru could not evaluate your answer. Try again." },
        { status: 502 }
      );
    }
    data = EvaluationSchema.parse(parseJsonContent(raw));
  } catch (err) {
    console.error("[api/practice/submit] parse failed:", err);
    return Response.json(
      { error: "Yoru could not evaluate your answer. Try again." },
      { status: 502 }
    );
  }

  // Clamp the band into the valid 0-9 range; the model occasionally drifts.
  const bandEstimate = Math.min(9, Math.max(0, data.bandEstimate));

  try {
    await db.$transaction(async (tx) => {
      const session = await tx.session.create({
        data: {
          startedAt: new Date(),
          endedAt: new Date(),
          skill: exercise!.skill,
          xpEarned: 10,
        },
      });
      await tx.attempt.create({
        data: {
          exerciseId,
          response,
          bandEstimate,
          feedback: { feedback: data.feedback, tips: data.tips },
          scores: data.scores,
          sessionId: session.id,
        },
      });
    });
  } catch (err) {
    console.error("[api/practice/submit] save failed:", err);
    return Response.json(
      { error: "Yoru could not save your attempt, Master. Try again." },
      { status: 500 }
    );
  }

  // The answer key stays hidden until Master has answered.
  return Response.json({
    result: {
      bandEstimate,
      feedback: data.feedback,
      scores: data.scores,
      tips: data.tips,
      answerKey: exercise.answerKey,
    },
  });
}
