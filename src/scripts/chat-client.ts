import { createSseParser } from "../lib/sse";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatElements {
  form: HTMLFormElement;
  input: HTMLInputElement;
  messages: HTMLElement;
  status: HTMLElement;
}

const history: ChatMessage[] = [];
let activeController: AbortController | null = null;

function addBubble(
  container: HTMLElement,
  role: ChatMessage["role"],
  content: string
): HTMLElement {
  const bubble = document.createElement("p");
  bubble.dataset.chatRole = role;
  bubble.className =
    role === "user"
      ? "ml-8 rounded-xl rounded-tr-sm bg-frost px-3 py-2 text-bg-base"
      : "mr-8 rounded-xl rounded-tl-sm bg-bg-elevated px-3 py-2 text-text-secondary";
  bubble.textContent = content;
  container.append(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

function errorMessage(status: number, payload: unknown): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }
  return status === 429
    ? "Terlalu banyak permintaan. Coba lagi nanti."
    : "Chat sedang tidak tersedia.";
}

export function abortActiveChat(): void {
  activeController?.abort(new DOMException("Chat ditutup", "AbortError"));
}

export async function submitChat({ form, input, messages, status }: ChatElements): Promise<void> {
  if (activeController) return;
  const content = input.value.trim();
  if (!content || !form.reportValidity()) return;

  input.value = "";
  addBubble(messages, "user", content);
  history.push({ role: "user", content });
  const assistant = addBubble(messages, "assistant", "…");
  const submit = form.querySelector<HTMLButtonElement>("[data-chat-submit]");
  submit?.setAttribute("disabled", "");
  input.disabled = true;
  status.textContent = "Asisten sedang menjawab.";

  const controller = new AbortController();
  activeController = controller;
  let answer = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-10) }),
      signal: controller.signal,
    });
    if (!response.ok || !response.body) {
      const payload = (await response.json().catch(() => null)) as unknown;
      throw new Error(errorMessage(response.status, payload));
    }
    if (!response.headers.get("content-type")?.includes("text/event-stream")) {
      throw new Error("Respons chat tidak valid.");
    }

    const parser = createSseParser((data) => {
      if (data === "[DONE]") return;
      try {
        const event = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: unknown } }>;
        };
        const delta = event.choices?.[0]?.delta?.content;
        if (typeof delta !== "string") return;
        answer += delta;
        assistant.textContent = answer;
        messages.scrollTop = messages.scrollHeight;
      } catch {
        throw new Error("Respons chat tidak valid.");
      }
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      parser.push(decoder.decode(value, { stream: true }));
    }
    parser.push(decoder.decode());
    parser.finish();
    if (!answer) throw new Error("AI tidak mengirim jawaban.");

    history.push({ role: "assistant", content: answer });
    status.textContent = "Jawaban selesai.";
  } catch (error) {
    assistant.remove();
    if (controller.signal.aborted) {
      status.textContent = "Permintaan chat dibatalkan.";
    } else {
      status.textContent = error instanceof Error ? error.message : "Chat sedang tidak tersedia.";
    }
  } finally {
    if (activeController === controller) activeController = null;
    submit?.removeAttribute("disabled");
    input.disabled = false;
    input.focus();
  }
}
