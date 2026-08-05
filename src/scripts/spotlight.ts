export function initSpotlights(): void {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  for (const card of document.querySelectorAll<HTMLElement>("[data-spotlight]")) {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
      card.style.setProperty("--my", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "50%");
    });
  }
}
