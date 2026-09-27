import { describe, expect, it } from "vitest";
import { judgeMessage } from "../engine.js";
import {
  attachAiDrafts,
  draftAiExplanation,
  triageAssistScore,
} from "../ai-explain.js";

describe("shield AI explain + triage", () => {
  it("always drafts AI explanation on block verdict", () => {
    const v = judgeMessage({
      id: "ai-1",
      channel: "sms",
      from: "bank",
      body: "Xác minh ngay http://vcb-secure-login.xyz hoặc bị khóa",
      meta: { senderSpoof: true },
    });
    expect(v.action).toBe("block");
    const draft = draftAiExplanation(v, "offline_stub");
    expect(draft.elderVi).toMatch(/AI-draft/i);
    expect(draft.meta.mode).toBe("offline_stub");
    expect(draft.meta.labelVi.toLowerCase()).toMatch(/stub|template|draft/);
    expect(draft.familyVi).toBeTruthy();
  });

  it("triage assist never overrides rule verdict", () => {
    const msg = {
      id: "ai-2",
      channel: "zalo",
      from: "x",
      body: "Chào bà chuyển tiền gấp",
      meta: { deepfakeScore: 0.95 },
    };
    const v = judgeMessage(msg);
    const triage = triageAssistScore(msg, v, "offline_stub");
    expect(triage.overridesVerdict).toBe(false);
    expect(triage.score).toBeGreaterThan(0.5);
    expect(triage.rationaleVi).toMatch(/verdict rule vẫn là/);
    // rule decision unchanged
    expect(v.action).toBe("block");
  });

  it("attachAiDrafts keeps risk/action from rules", () => {
    const msg = {
      id: "ai-3",
      channel: "sms",
      from: "Con",
      body: "Ba nhớ uống thuốc",
    };
    const v = judgeMessage(msg);
    const bundled = attachAiDrafts(msg, v, "offline_stub");
    expect(bundled.action).toBe(v.action);
    expect(bundled.risk).toBe(v.risk);
    expect(bundled.aiExplanation.meta.mode).toBe("offline_stub");
    expect(bundled.triageAssist.overridesVerdict).toBe(false);
  });
});
