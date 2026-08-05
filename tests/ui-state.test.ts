import { describe, expect, test } from "vitest";

import { matchesProjectTag, shouldRunMotion } from "../src/lib/ui-state";

describe("matchesProjectTag", () => {
  test("shows every project for the All filter", () => {
    expect(matchesProjectTag(["Web3", "DApp"], "All")).toBe(true);
  });

  test("only matches an exact project tag", () => {
    expect(matchesProjectTag(["Web3", "DApp"], "DApp")).toBe(true);
    expect(matchesProjectTag(["Web3", "DApp"], "App")).toBe(false);
  });
});

describe("shouldRunMotion", () => {
  test("disables motion for reduced-motion users and mobile screens", () => {
    expect(shouldRunMotion({ reducedMotion: true, mobile: false })).toBe(false);
    expect(shouldRunMotion({ reducedMotion: false, mobile: true })).toBe(false);
  });

  test("allows motion on larger screens without a reduced-motion preference", () => {
    expect(shouldRunMotion({ reducedMotion: false, mobile: false })).toBe(true);
  });
});
