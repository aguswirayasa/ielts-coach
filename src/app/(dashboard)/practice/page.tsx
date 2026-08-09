"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/motion";

type Skill = "READING" | "WRITING" | "LISTENING" | "SPEAKING";
type Step = "pick" | "exercise" | "result";

interface Exercise {
  id: string;
  skill: Skill;
  type: string;
  title: string;
  prompt: string;
  content: string;
}

interface AnswerKey {
  correctAnswer: string;
  explanation: string;
}

interface PracticeResult {
  bandEstimate: number;
  feedback: string;
  scores: Record<string, string>;
  tips: string[];
  answerKey: AnswerKey | null;
}

const SKILLS: { skill: Skill; label: string; caption: string }[] = [
  { skill: "READING", label: "Reading", caption: "Passages and questions" },
  { skill: "WRITING", label: "Writing", caption: "Essays and reports" },
  { skill: "LISTENING", label: "Listening", caption: "Transcripts and questions" },
  { skill: "SPEAKING", label: "Speaking", caption: "Cue cards" },
];

function formatBand(band: number): string {
  return Number.isInteger(band) ? band.toFixed(0) : band.toFixed(1);
}

export default function PracticePage() {
  const [step, setStep] = useState<Step>("pick");
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState<"start" | "submit" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const reduce = useReducedMotion();

  function reset() {
    setStep("pick");
    setExercise(null);
    setAnswer("");
    setError(null);
    setResult(null);
  }

  async function start(skill: Skill) {
    setLoading("start");
    setError(null);
    try {
      const res = await fetch("/api/practice/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill, difficulty: 5 }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.exercise) {
        throw new Error(body?.error ?? "Request failed");
      }
      setExercise(body.exercise as Exercise);
      setAnswer("");
      setStep("exercise");
    } catch (err) {
      console.error("[practice] start failed:", err);
      setError(
        "Yoru could not prepare an exercise, Master. Please try again."
      );
    } finally {
      setLoading(null);
    }
  }

  async function submit() {
    if (!exercise) return;
    setLoading("submit");
    setError(null);
    try {
      const res = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: exercise.id, response: answer }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.result) {
        throw new Error(body?.error ?? "Request failed");
      }
      setResult(body.result as PracticeResult);
      setStep("result");
    } catch (err) {
      console.error("[practice] submit failed:", err);
      setError(
        "Yoru could not evaluate your answer, Master. Please try again."
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Practice"
        description="Choose a skill, and I shall prepare an exercise suited to your level, Master."
      />

      <AnimatePresence mode="wait">
      {step === "pick" && (
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={spring}
          className="mt-8 mx-auto max-w-2xl"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {SKILLS.map(({ skill, label, caption }) => (
              <button
                key={skill}
                type="button"
                onClick={() => void start(skill)}
                disabled={loading !== null}
                className={cn(
                  "pressable glass-card rounded-2xl border border-white/[0.06] px-5 py-6 text-left",
                  "transition-colors hover:border-[var(--primary)]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
                  "disabled:cursor-not-allowed disabled:opacity-60"
                )}
              >
                <span className="block text-base font-semibold text-foreground">
                  {label}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {caption}
                </span>
              </button>
            ))}
          </div>
          {loading === "start" && (
            <p className="mt-6 text-sm text-muted-foreground" role="status">
              Yoru is preparing an exercise for Master...
            </p>
          )}
          {error && (
            <div className="mt-6" role="alert">
              <p className="text-sm text-[var(--primary)]">{error}</p>
              <Button
                variant="outline"
                onClick={() => setError(null)}
                className="mt-3 h-9 px-5"
              >
                Dismiss
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {step === "exercise" && exercise && (
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={spring}
          className="mt-8 mx-auto max-w-2xl space-y-5"
        >
          <Card>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {SKILLS.find((s) => s.skill === exercise.skill)?.label}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {exercise.type}
                </span>
              </div>
              <h2 className="text-base font-semibold text-foreground">
                {exercise.title}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {exercise.prompt}
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {exercise.content}
              </p>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={loading !== null}
                placeholder="Your answer, Master..."
                rows={8}
                aria-label="Your answer"
              />
            </CardContent>
          </Card>

          {error && (
            <p className="text-sm text-[var(--primary)]" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={reset}
              disabled={loading !== null}
              className="h-9 px-5"
            >
              Back
            </Button>
            <Button
              onClick={() => void submit()}
              disabled={loading !== null || answer.trim().length === 0}
              size="lg"
              className="h-9 px-5"
            >
              {loading === "submit"
                ? "Yoru is evaluating..."
                : "Submit answer"}
            </Button>
          </div>
        </motion.div>
      )}

      {step === "result" && result && (
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={spring}
          className="mt-8 mx-auto max-w-2xl space-y-5"
        >
          <Card>
            <CardContent className="flex flex-col items-center gap-1 py-8 text-center">
              <p className="text-xs font-medium text-muted-foreground">
                Estimated band
              </p>
              <p className="text-5xl font-semibold text-[var(--primary)]">
                {formatBand(result.bandEstimate)}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {result.feedback}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground">
                Scores by criterion
              </h2>
              <dl className="space-y-3">
                {Object.entries(result.scores).map(([criterion, score]) => (
                  <div key={criterion} className="space-y-0.5">
                    <dt className="text-xs font-medium text-muted-foreground">
                      {criterion}
                    </dt>
                    <dd className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                      {score}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {result.tips.length > 0 && (
            <Card>
              <CardContent className="space-y-2">
                <h2 className="text-sm font-semibold text-foreground">
                  Tips from Yoru
                </h2>
                <ul className="list-disc space-y-1 pl-5">
                  {result.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="text-sm leading-relaxed text-foreground"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.answerKey && (
            <Card>
              <CardContent className="space-y-2">
                <h2 className="text-sm font-semibold text-foreground">
                  Correct answer
                </h2>
                <p className="text-sm leading-relaxed text-foreground">
                  {result.answerKey.correctAnswer}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {result.answerKey.explanation}
                </p>
              </CardContent>
            </Card>
          )}

          {error && (
            <p className="text-sm text-[var(--primary)]" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={reset}
              size="lg"
              className="h-9 px-5"
            >
              Try another exercise
            </Button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
