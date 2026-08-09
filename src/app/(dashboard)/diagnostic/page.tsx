"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/motion";

type Skill = "READING" | "WRITING" | "LISTENING" | "SPEAKING";
type Step = "intro" | "questions" | "results";

interface DiagnosticQuestion {
  skill: Skill;
  type: string;
  title: string;
  prompt: string;
  instructions: string;
}

interface DiagnosticResult {
  readingBand: number;
  writingBand: number;
  listeningBand: number;
  speakingBand: number;
  overallBand: number;
  weakestSkill: Skill;
  feedback: Record<Skill, string>;
  plan: string;
}

const SKILLS: Skill[] = ["READING", "WRITING", "LISTENING", "SPEAKING"];
const SKILL_LABEL: Record<Skill, string> = {
  READING: "Reading",
  WRITING: "Writing",
  LISTENING: "Listening",
  SPEAKING: "Speaking",
};
const BANDS: Record<Skill, "readingBand" | "writingBand" | "listeningBand" | "speakingBand"> = {
  READING: "readingBand",
  WRITING: "writingBand",
  LISTENING: "listeningBand",
  SPEAKING: "speakingBand",
};

function formatBand(band: number): string {
  return Number.isInteger(band) ? band.toFixed(0) : band.toFixed(1);
}

export default function DiagnosticPage() {
  const [step, setStep] = useState<Step>("intro");
  const [questions, setQuestions] = useState<DiagnosticQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<Skill, string>>({
    READING: "",
    WRITING: "",
    LISTENING: "",
    SPEAKING: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const reduce = useReducedMotion();

  function reset() {
    setStep("intro");
    setQuestions(null);
    setIndex(0);
    setAnswers({ READING: "", WRITING: "", LISTENING: "", SPEAKING: "" });
    setError(null);
    setResult(null);
  }

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/diagnostic/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.questions) {
        throw new Error(body?.error ?? "Request failed");
      }
      setQuestions(body.questions as DiagnosticQuestion[]);
      setIndex(0);
      setStep("questions");
    } catch (err) {
      console.error("[diagnostic] start failed:", err);
      setError(
        "Yoru could not prepare the diagnostic, Master. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!questions) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/diagnostic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, answers }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.result) {
        throw new Error(body?.error ?? "Request failed");
      }
      setResult(body.result as DiagnosticResult);
      setStep("results");
    } catch (err) {
      console.error("[diagnostic] submit failed:", err);
      setError(
        "Yoru could not score the diagnostic, Master. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const question = questions?.[index];

  return (
    <div>
      <PageHeader
        title="Diagnostic"
        description="A full assessment of your bands. Shall we begin, Master?"
      />

      <AnimatePresence mode="wait">
      {step === "intro" && (
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={spring}
          className="mt-8 mx-auto max-w-xl"
        >
          <Card>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-foreground">
                Yoru will walk Master through all four skills: Reading,
                Writing, Listening, and Speaking. Answer each one honestly, as
                if sitting the real test.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Allow about 30 minutes. At the end Yoru scores every skill
                against the official band descriptors and lays out a study
                plan.
              </p>
              {error && (
                <p className="text-sm text-[var(--primary)]" role="alert">
                  {error}
                </p>
              )}
              <Button
                onClick={start}
                disabled={loading}
                size="lg"
                className="w-full sm:w-auto"
              >
                {loading ? "Yoru is preparing..." : "Begin diagnostic"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {step === "questions" && question && (
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={spring}
          className="mt-8 mx-auto max-w-2xl space-y-5"
        >
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Skill {index + 1} of {SKILLS.length}: {SKILL_LABEL[question.skill]}
            </p>
            <Progress value={((index + 1) / SKILLS.length) * 100} aria-label="Diagnostic progress" />
          </div>

          <Card>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {question.title}
                </h2>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {question.type}
                </p>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {question.prompt}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {question.instructions}
              </p>
              <Textarea
                value={answers[question.skill]}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [question.skill]: e.target.value,
                  }))
                }
                disabled={loading}
                placeholder={`Your ${SKILL_LABEL[question.skill].toLowerCase()} answer, Master...`}
                rows={8}
                aria-label={`${SKILL_LABEL[question.skill]} answer`}
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
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0 || loading}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (index < SKILLS.length - 1) {
                  setIndex((i) => i + 1);
                } else {
                  void submit();
                }
              }}
              disabled={loading || answers[question.skill].trim().length === 0}
              size="lg"
              className="h-9 px-5"
            >
              {index < SKILLS.length - 1
                ? "Next"
                : loading
                  ? "Yoru is scoring..."
                  : "Submit"}
            </Button>
          </div>
        </motion.div>
      )}

      {step === "results" && result && (
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
                Overall band
              </p>
              <p className="text-5xl font-semibold text-[var(--primary)]">
                {formatBand(result.overallBand)}
              </p>
              <p className="text-sm text-muted-foreground">
                Weakest skill:{" "}
                <span className="font-medium text-[var(--primary)]">
                  {SKILL_LABEL[result.weakestSkill]}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-0 divide-y divide-border/60">
              {SKILLS.map((skill) => (
                <div
                  key={skill}
                  className={cn(
                    "flex items-center justify-between gap-3 py-3.5",
                    skill === result.weakestSkill &&
                      "bg-[var(--primary)]/[0.06] px-3 -mx-3"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {SKILL_LABEL[skill]}
                    </span>
                    {skill === result.weakestSkill && (
                      <span className="text-xs font-medium text-[var(--primary)]">
                        Weakest
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {formatBand(result[BANDS[skill]])}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground">
                Feedback from Yoru
              </h2>
              {SKILLS.map((skill) => (
                <div key={skill} className="space-y-1">
                  <h3 className="text-xs font-medium text-muted-foreground">
                    {SKILL_LABEL[skill]}
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                    {result.feedback[skill]}
                  </p>
                </div>
              ))}
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Study plan
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                  {result.plan}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button variant="outline" onClick={reset} size="lg" className="h-9 px-5">
              Retake diagnostic
            </Button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
