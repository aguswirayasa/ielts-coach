import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { db } from "@/lib/db";
import { chunkText } from "@/lib/materials/chunk";

const MAX_BYTES = 25 * 1024 * 1024;
const SKILLS = ["READING", "WRITING", "LISTENING", "SPEAKING", "GENERAL"] as const;
type Skill = (typeof SKILLS)[number];

function title(value: string) {
  return value.replace(/[^a-z0-9 _-]/gi, "").trim().slice(0, 120) || "NotebookLM export";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { title?: string; skill?: string; markdown?: string } | null;
  const rawText = body?.markdown?.replace(/\u0000/g, "").trim() ?? "";
  const skill = body?.skill;

  if (!body || !rawText) return NextResponse.json({ error: "NotebookLM Markdown is required." }, { status: 400 });
  if (new TextEncoder().encode(rawText).byteLength > MAX_BYTES) return NextResponse.json({ error: "Export exceeds the 25 MB limit." }, { status: 413 });
  if (!skill || !SKILLS.includes(skill as Skill)) return NextResponse.json({ error: "Choose a valid IELTS skill." }, { status: 400 });

  const chunks = chunkText(rawText);
  if (!chunks.length) return NextResponse.json({ error: "The export has no readable text." }, { status: 400 });

  const id = crypto.randomUUID();
  const storedName = `${id}.notebooklm.md`;
  const uploadDir = path.join(process.cwd(), "data", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, storedName), rawText, { encoding: "utf8", flag: "wx" });

  const material = await db.material.create({
    data: {
      title: title(body.title ?? "NotebookLM export"),
      skill: skill as Skill,
      fileType: "notebooklm-markdown",
      storedName,
      rawText,
      chunkCount: chunks.length,
      chunks: { create: chunks.map((text, idx) => ({ text, idx })) },
    },
    select: { id: true, title: true, skill: true, fileType: true, chunkCount: true, createdAt: true },
  });

  return NextResponse.json(material, { status: 201 });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

// NotebookLM exports are imported explicitly so their provenance remains visible in the material type.
