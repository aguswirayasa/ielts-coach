import { z } from "zod";
import { getClient, getConfig } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/yoru";

// Streaming requires the Node.js runtime.
export const runtime = "nodejs";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  history: z.array(ChatMessageSchema).max(20).default([]),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { message, history } = parsed.data;
  const client = getClient();
  const { model } = getConfig();
  const encoder = new TextEncoder();

  try {
    const stream = await client.chat.completions.create({
      model,
      stream: true,
      messages: [
        { role: "system", content: buildSystemPrompt("chat") },
        ...history,
        { role: "user", content: message },
      ],
    });

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[api/chat] completion failed:", err);
    return Response.json(
      { error: "Yoru could not reach the model. Please try again." },
      { status: 500 }
    );
  }
}
