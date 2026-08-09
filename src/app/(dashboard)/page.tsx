"use client";

import Link from "next/link";
import { BookOpen, PenLine, Headphones, Mic } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { fadeUp, fadeUpTransition, staggerContainer } from "@/lib/motion";

const SKILLS = [
  { label: "Reading", icon: BookOpen },
  { label: "Writing", icon: PenLine },
  { label: "Listening", icon: Headphones },
  { label: "Speaking", icon: Mic },
];

export default function DashboardPage() {
  const reduce = useReducedMotion();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome home, Master</h1>
        <p className="mt-2 text-muted-foreground">
          I shall take care of your preparation. Where shall we begin today?
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial={reduce ? false : "hidden"}
        animate={reduce ? { opacity: 1 } : "visible"}
        className="space-y-8"
      >
        <motion.div variants={fadeUp} transition={fadeUpTransition}>
          <Link href="/diagnostic" className="pressable block">
            <div className="glass-card rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/[0.06] p-8">
              <h2 className="text-xl font-medium tracking-tight">Begin the diagnostic</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                A full assessment across reading, writing, listening, and speaking, so I can
                plan your study with real numbers.
              </p>
              <span className="mt-5 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Start diagnostic
              </span>
            </div>
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={fadeUpTransition}
          className="grid gap-4 lg:grid-cols-5"
        >
          <div className="glass-card rounded-2xl border border-white/[0.06] p-6 lg:col-span-3">
            <h2 className="text-lg font-medium tracking-tight">Practice</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a skill for today&apos;s exercise.
            </p>
            <ul className="mt-4 divide-y divide-border">
              {SKILLS.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <Link
                    href="/practice"
                    className="pressable flex items-center gap-3 py-3 text-sm hover:opacity-70"
                  >
                    <Icon className="h-4 w-4 text-[var(--primary)]" aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-card p-6 lg:col-span-2">
            <div>
              <h2 className="text-lg font-medium tracking-tight">Progress</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Band history and streaks will appear here after your first diagnostic. No
                invented numbers, Master, only your real work.
              </p>
            </div>
            <Link
              href="/progress"
              className="pressable mt-6 text-sm font-medium text-[var(--primary)] hover:opacity-70"
            >
              View progress
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
