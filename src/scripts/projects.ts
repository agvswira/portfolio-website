import { matchesProjectTag } from "@/lib/ui-state";

const active = ["border-frost/40", "bg-frost/15", "text-frost"];
const inactive = ["border-nord-border/40", "bg-transparent", "text-text-muted"];

export function initProjectFilters(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-project-filter]"));
  const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-project-card]"));
  const empty = document.querySelector<HTMLElement>("[data-project-empty]");

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const selected = button.dataset.projectFilter ?? "All";
      let visibleCount = 0;

      for (const candidate of buttons) {
        const pressed = candidate === button;
        candidate.setAttribute("aria-pressed", String(pressed));
        active.forEach((name) => candidate.classList.toggle(name, pressed));
        inactive.forEach((name) => candidate.classList.toggle(name, !pressed));
      }

      for (const card of cards) {
        const tags = JSON.parse(card.dataset.projectTags ?? "[]") as string[];
        const visible = matchesProjectTag(tags, selected);
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      }

      empty?.classList.toggle("hidden", visibleCount > 0);
    });
  }
}
