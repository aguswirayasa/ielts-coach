import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { db } from "@/lib/db";
import { chunkText } from "@/lib/materials/chunk";

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = new Set(["text/plain", "text/markdown"]);

function safeTitle(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9 _-]/gi, "").trim().slice(0, 120) || "Untitled material";
}

export async function GET() {
  const materials = await db.material.findMany({
    where: { archived: false },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, skill: true, fileType: true, chunkCount: true, createdAt: true },
  });
  return NextResponse.json(materials);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const skill = form.get("skill");

  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a text file." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File exceeds the 25 MB limit." }, { status: 413 });
  if (!ALLOWED.has(file.type) && !file.name.toLowerCase().endsWith((".txt"))) {
    return NextResponse.json({ error: "Only TXT and Markdown files are supported in this phase." }, { status: 415 });
  }
  if (!skill || !["READING", "WRITING", "LISTENING", "SPEAKING", "GENERAL"].includes(String(skill))) {
    return NextResponse.json({ error: "Choose a valid IELTS skill." }, { status: 400 });
  }

  const rawText = (await file.text()).replace(/\u0000/g, "").trim();
  const chunks = chunkText(rawText);
  if (!chunks.length) return NextResponse.json({ error: "The file has no readable text." }, { status: 400 });

  const id = crypto.randomUUID();
  const ext = file.name.toLowerCase().endsWith(".md") ? "md" : "txt";
  const storedName = `${id}.${ext}`;
  const uploadDir = path.join(process.cwd(), "data", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, storedName), Buffer.from(await file.arrayBuffer()), { flag: "wx" });

  const material = await db.material.create({
    data: {
      title: safeTitle(file.name),
      skill: String(skill) as "READING" | "WRITING" | "LISTENING" | "SPEAKING" | "GENERAL",
      fileType: ext,
      storedName,
      rawText,
      chunkCount: chunks.length,
      chunks: { create: chunks.map((text, idx) => ({ text, idx })) },
    },
    select: { id: true, title: true, skill: true, fileType: true, chunkCount: true, createdAt: true },
  });

  return NextResponse.json(material, { status: 201 });
}
