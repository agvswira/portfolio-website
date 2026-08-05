export type BodyReadResult =
  | { ok: true; text: string }
  | { ok: false; status: 413; error: "Request terlalu besar." };

export async function readRequestBody(request: Request, maxBytes: number): Promise<BodyReadResult> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { ok: false, status: 413, error: "Request terlalu besar." };
  }

  if (!request.body) return { ok: true, text: "" };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return { ok: false, status: 413, error: "Request terlalu besar." };
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, text: new TextDecoder().decode(bytes) };
}

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export async function requestWithTimeout(
  fetcher: FetchLike,
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
  clientSignal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  const abortFromClient = () => {
    controller.abort(clientSignal?.reason ?? new DOMException("Client disconnected", "AbortError"));
  };

  if (clientSignal?.aborted) abortFromClient();
  else clientSignal?.addEventListener("abort", abortFromClient, { once: true });

  const timeout = setTimeout(() => {
    controller.abort(new DOMException("Upstream request timed out", "TimeoutError"));
  }, timeoutMs);

  try {
    return await fetcher(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
    clientSignal?.removeEventListener("abort", abortFromClient);
  }
}

export function jsonResponse(body: unknown, status = 200, headers?: HeadersInit): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store", ...Object.fromEntries(new Headers(headers)) },
  });
}

export function mediaType(request: Request): string {
  return request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() ?? "";
}
