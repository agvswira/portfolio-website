export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type ValidationResult<T> = { ok: true; data: T } | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseContactPayload(value: unknown): ValidationResult<ContactMessage> {
  if (!isRecord(value)) return { ok: false, error: "Request tidak valid." };
  if (value.website) return { ok: false, error: "Request tidak valid." };

  const name = typeof value.name === "string" ? value.name.trim() : "";
  const email = typeof value.email === "string" ? value.email.trim() : "";
  const message = typeof value.message === "string" ? value.message.trim() : "";

  if (!name || name.length > 100) return { ok: false, error: "Nama tidak valid." };
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Email tidak valid." };
  }
  if (message.length < 10 || message.length > 5_000) {
    return { ok: false, error: "Pesan terlalu pendek atau terlalu panjang." };
  }

  return { ok: true, data: { name, email, message } };
}

export function parseChatPayload(value: unknown): ValidationResult<ChatMessage[]> {
  if (!isRecord(value) || !Array.isArray(value.messages)) {
    return { ok: false, error: "Field 'messages' harus berupa array." };
  }
  if (value.messages.length === 0 || value.messages.length > 10) {
    return { ok: false, error: "Percakapan harus berisi 1 sampai 10 pesan." };
  }

  const messages: ChatMessage[] = [];
  for (const item of value.messages) {
    if (!isRecord(item) || (item.role !== "user" && item.role !== "assistant")) {
      return { ok: false, error: "Pesan tidak valid." };
    }
    if (typeof item.content !== "string" || item.content.length > 2_000) {
      return { ok: false, error: "Pesan tidak valid." };
    }
    const content = item.content.trim();
    if (!content) return { ok: false, error: "Pesan tidak valid." };
    messages.push({ role: item.role, content });
  }

  if (messages.at(-1)?.role !== "user") {
    return { ok: false, error: "Pesan terakhir harus berasal dari pengguna." };
  }
  return { ok: true, data: messages };
}
