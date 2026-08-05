export function matchesProjectTag(tags: string[], activeTag: string): boolean {
  return activeTag === "All" || tags.includes(activeTag);
}

export function shouldRunMotion(state: { reducedMotion: boolean; mobile: boolean }): boolean {
  return !state.reducedMotion && !state.mobile;
}
