import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { CHATBOT_SYSTEM_PROMPT } from "@/lib/constants";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  // Rate limit: 20 req/min per IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(ip, 20, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }

  // Validate messages array
  if (!Array.isArray(body.messages)) {
    return NextResponse.json({ error: "Field 'messages' harus berupa array." }, { status: 400 });
  }

  // Sanitize: strip system messages from client, limit to last 10, cap content length
  const messages: ChatMessage[] = (body.messages as Array<{ role?: string; content?: string }>)
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-10)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: String(m.content ?? "").slice(0, 2000),
    }));

  if (messages.length === 0) {
    return NextResponse.json({ error: "Tidak ada pesan valid." }, { status: 400 });
  }

  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    // Fallback response when no API key configured
    const fallback = "Maaf, chatbot sedang tidak tersedia. Silakan hubungi saya langsung via email.";
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const data = JSON.stringify({ choices: [{ delta: { content: fallback } }] });
        controller.enqueue(encoder.encode(`data: ${data}\n\ndata: [DONE]\n\n`));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        max_tokens: 512,
        messages: [{ role: "system", content: CHATBOT_SYSTEM_PROMPT }, ...messages],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      throw new Error(`Upstream error: ${upstream.status}`);
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json({ error: "Gagal menghubungi AI." }, { status: 502 });
  }
}
