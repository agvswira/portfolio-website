export function initChatShell(): void {
  const panel = document.querySelector<HTMLElement>("[data-chat-panel]");
  const toggle = document.querySelector<HTMLButtonElement>("[data-chat-toggle]");
  const close = document.querySelector<HTMLButtonElement>("[data-chat-close]");
  const input = document.querySelector<HTMLInputElement>("[data-chat-input]");
  const form = document.querySelector<HTMLFormElement>("[data-chat-form]");
  const status = document.querySelector<HTMLElement>("[data-chat-status]");
  const messages = document.querySelector<HTMLElement>("[data-chat-messages]");
  if (!panel || !toggle || !close || !input || !form || !status || !messages) return;

  let chatClient: Promise<typeof import("./chat-client")> | null = null;

  const setOpen = (open: boolean, returnFocus = false) => {
    panel.classList.toggle("hidden", !open);
    panel.classList.toggle("flex", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup chat" : "Buka chat");
    if (open) input.focus();
    if (!open) chatClient?.then(({ abortActiveChat }) => abortActiveChat());
    if (!open && returnFocus) toggle.focus();
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true", true);
  });
  close.addEventListener("click", () => setOpen(false, true));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false, true);
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    chatClient ??= import("./chat-client");
    void chatClient.then(({ submitChat }) => submitChat({ form, input, messages, status }));
  });
}
