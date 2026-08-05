import { initChatShell } from "./chat-shell";
import { initContactForm } from "./contact";
import { initMotion } from "./motion";
import { initNavigation } from "./navigation";
import { initProjectFilters } from "./projects";
import { initSpotlights } from "./spotlight";

export function initHome(): void {
  initNavigation();
  initProjectFilters();
  initSpotlights();
  initContactForm();
  initChatShell();
  initMotion();
}
