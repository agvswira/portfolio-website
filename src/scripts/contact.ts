function renderStatus(target: HTMLElement, kind: "success" | "error", message: string): void {
  target.textContent = message;
  target.className = [
    "mt-4 rounded-lg border px-4 py-3 text-sm",
    kind === "success"
      ? "border-aurora-green/20 bg-aurora-green/10 text-aurora-green"
      : "border-aurora-red/20 bg-aurora-red/10 text-[#E099A0]",
  ].join(" ");
}

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>("[data-contact-form]");
  const submit = document.querySelector<HTMLButtonElement>("[data-contact-submit]");
  const status = document.querySelector<HTMLElement>("[data-contact-status]");
  if (!form || !submit || !status) return;

  form.addEventListener("submit", async (event) => {
    if (!form.reportValidity()) return;
    event.preventDefault();
    submit.disabled = true;
    submit.textContent = "Mengirim...";
    status.textContent = "";
    status.className = "mt-4";

    try {
      const body = Object.fromEntries(new FormData(form).entries());
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Gagal mengirim pesan.");

      form.reset();
      renderStatus(
        status,
        "success",
        "Pesan berhasil terkirim! Saya akan segera menghubungi Anda."
      );
    } catch (error) {
      renderStatus(
        status,
        "error",
        error instanceof Error ? error.message : "Gagal mengirim pesan."
      );
    } finally {
      submit.disabled = false;
      submit.textContent = "Kirim Pesan";
    }
  });
}
