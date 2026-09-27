import { describe, expect, it, beforeEach } from "vitest";
import {
  browserAiMeta,
  stageBadgesFor,
  aiHonestyStripHtml,
} from "../hitl/ai-badges.js";
import { opsRailHtml } from "../hitl/ops-rail.js";
import { resetSessionFields, state } from "../state.js";

describe("web AI badges", () => {
  beforeEach(() => {
    resetSessionFields();
  });

  it("browser defaults to offline_stub honesty meta", () => {
    const meta = browserAiMeta();
    expect(meta.mode).toBe("offline_stub");
    expect(meta.labelVi.toLowerCase()).toMatch(/stub|offline|đề xuất/);
  });

  it("generating shows AI đang đề xuất", () => {
    const badges = stageBadgesFor("generating");
    expect(badges.some((b) => b.text === "AI đang đề xuất")).toBe(true);
  });

  it("ready+ shows đã verify", () => {
    expect(stageBadgesFor("ready").some((b) => b.text === "đã verify")).toBe(
      true
    );
    expect(stageBadgesFor("done").some((b) => b.text === "đã verify")).toBe(
      true
    );
  });

  it("running shows zero-LLM runtime badge", () => {
    const badges = stageBadgesFor("running");
    expect(
      badges.some((b) => /không LLM|deterministic/i.test(b.text))
    ).toBe(true);
  });

  it("ops-rail HTML includes AI đang đề xuất or đã verify and honesty strip", () => {
    state.progress = "ready";
    const html = opsRailHtml(false);
    expect(html).toMatch(/ops-rail/);
    expect(html).toMatch(/ai-honesty-strip/);
    expect(html).toMatch(/đã verify/);
    expect(html).toMatch(/stub|offline/i);

    state.progress = "generating";
    const gen = aiHonestyStripHtml();
    expect(gen).toMatch(/AI đang đề xuất/);
  });
});
