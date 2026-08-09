"use client";

import { useEffect, useState } from "react";
import { Upload, FileText, Trash2 } from "lucide-react";

type Material = { id: string; title: string; skill: string; fileType: string; chunkCount: number; createdAt: string };

export function MaterialsClient() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [skill, setSkill] = useState("GENERAL");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/materials");
    if (res.ok) setMaterials(await res.json());
  }
  useEffect(() => {
    void fetch("/api/materials").then((res) => res.ok ? res.json() : []).then(setMaterials);
  }, []);

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setMessage("");
    const form = new FormData(); form.set("file", file); form.set("skill", skill);
    const res = await fetch("/api/materials", { method: "POST", body: form });
    const data = await res.json();
    setMessage(res.ok ? "Material indexed." : data.error ?? "Upload failed.");
    if (res.ok) await load();
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl border p-6">
        <div className="flex flex-wrap items-end gap-4">
          <label className="grid gap-2 text-sm font-medium">Skill
            <select value={skill} onChange={(e) => setSkill(e.target.value)} className="h-10 rounded-lg border bg-background px-3 text-sm">
              <option value="GENERAL">General</option><option value="READING">Reading</option><option value="WRITING">Writing</option><option value="LISTENING">Listening</option><option value="SPEAKING">Speaking</option>
            </select>
          </label>
          <label className="pressable flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
            <Upload className="size-4" aria-hidden /> {busy ? "Indexing..." : "Upload TXT or Markdown"}
            <input type="file" accept=".txt,.md,text/plain,text/markdown" className="sr-only" disabled={busy} onChange={(e) => void upload(e.target.files?.[0])} />
          </label>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Phase 2 currently accepts text materials. Files are chunked and stored locally for retrieval.</p>
        {message && <p className="mt-3 text-sm text-primary" role="status">{message}</p>}
      </div>
      <section className="space-y-3" aria-label="Uploaded materials">
        {materials.length === 0 ? <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">No materials yet. Upload an IELTS source to begin.</div> : materials.map((item) => (
          <article key={item.id} className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <FileText className="size-5 text-primary" aria-hidden /><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-medium">{item.title}</h2><p className="text-xs text-muted-foreground">{item.skill.toLowerCase()} · {item.chunkCount} chunks</p></div><Trash2 className="size-4 text-muted-foreground" aria-hidden />
          </article>
        ))}
      </section>
    </div>
  );
}

