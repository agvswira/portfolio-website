export interface SseParser {
  push(chunk: string): void;
  finish(): void;
}

export function createSseParser(onData: (data: string) => void): SseParser {
  let buffer = "";

  const emit = (block: string) => {
    const data = block
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).replace(/^ /, ""))
      .join("\n");
    if (data) onData(data);
  };

  const drain = () => {
    while (true) {
      const match = /\r?\n\r?\n/.exec(buffer);
      if (!match || match.index === undefined) break;
      emit(buffer.slice(0, match.index));
      buffer = buffer.slice(match.index + match[0].length);
    }
  };

  return {
    push(chunk) {
      buffer += chunk;
      drain();
    },
    finish() {
      drain();
      if (buffer.trim()) emit(buffer);
      buffer = "";
    },
  };
}
