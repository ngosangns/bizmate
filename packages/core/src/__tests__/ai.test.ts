import { describe, expect, it } from "vitest";
import {
  aiLabels,
  createAiMeta,
  resolveAiMode,
  type AiMode,
} from "../ai.js";

describe("ai helpers", () => {
  it("defaults to offline_stub", () => {
    expect(resolveAiMode({})).toBe("offline_stub");
    expect(resolveAiMode({ BIZMATE_MODE: "offline" })).toBe("offline_stub");
  });

  it("maps BIZMATE_MODE=live to live", () => {
    expect(resolveAiMode({ BIZMATE_MODE: "live" })).toBe("live");
  });

  it("labels offline stubs honestly", () => {
    const stub = aiLabels("offline_stub", "fixture");
    expect(stub.labelVi).toMatch(/stub|offline/i);
    expect(stub.labelEn.toLowerCase()).toMatch(/stub|offline/);
  });

  it("createAiMeta omits modelId offline", () => {
    const meta = createAiMeta("offline_stub", "heuristic");
    expect(meta.mode).toBe("offline_stub" satisfies AiMode);
    expect(meta.modelId).toBeUndefined();
    expect(meta.labelVi).toBeTruthy();
  });
});
