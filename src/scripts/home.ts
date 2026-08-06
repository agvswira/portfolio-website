import { initChatShell } from "./chat-shell";
import { initContactForm } from "./contact";
import { initMotion } from "./motion";
import { initProjectFilters } from "./projects";
import { initSpotlights } from "./spotlight";

export function initHome(): void {
  initProjectFilters();
  initSpotlights();
  initContactForm();
  initChatShell();
  initMotion();
}
