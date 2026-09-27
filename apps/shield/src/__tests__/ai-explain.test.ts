import { describe, expect, it } from "vitest";
import { judgeMessage } from "../engine.js";
import {
  attachAiDrafts,
  attachAiDraftsAsync,
  draftAiExplanation,
  draftAiExplanationAsync,
  triageAssistScore,
  triageAssistScoreAsync,
} from "../ai-explain.js";

describe("shield AI explain + triage", () => {
  it("always drafts AI explanation on block verdict (offline)", () => {
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
    expect(draft.meta.source).toBe("template");
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

  it("attachAiDrafts keeps risk/action from rules (trust boundary)", () => {
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

  it("live sync path falls back honestly without claiming llm source", () => {
    const msg = {
      id: "ai-4",
      channel: "sms",
      from: "bank",
      body: "OTP ngân hàng http://evil.xyz",
      meta: { senderSpoof: true },
    };
    const v = judgeMessage(msg);
    const draft = draftAiExplanation(v, "live");
    expect(draft.meta.mode).toBe("offline_stub");
    expect(draft.meta.source).not.toBe("llm");
    expect(draft.meta.labelVi.toLowerCase()).toMatch(/fallback|stub|offline/);
    expect(draft.elderVi).toMatch(/AI-draft/i);

    const triage = triageAssistScore(msg, v, "live");
    expect(triage.overridesVerdict).toBe(false);
    expect(triage.meta.mode).toBe("offline_stub");
    expect(triage.meta.source).not.toBe("llm");
    expect(triage.meta.labelVi.toLowerCase()).toMatch(/fallback|stub|offline/);
  });

  it("live async path catches stub throw → offline fallback, no llm claim", async () => {
    const msg = {
      id: "ai-5",
      channel: "zalo",
      from: "ship",
      body: "QR hoàn tiền đơn hàng",
      meta: { qrBlacklisted: true },
    };
    const v = judgeMessage(msg);
    const beforeAction = v.action;
    const beforeRisk = v.risk;

    const draft = await draftAiExplanationAsync(v, "live");
    expect(draft.meta.mode).toBe("offline_stub");
    expect(draft.meta.source).toBe("template");
    expect(draft.meta.source).not.toBe("llm");
    expect(draft.meta.labelVi.toLowerCase()).toMatch(/fallback/);
    expect(draft.elderVi).toMatch(/AI-draft/i);

    const triage = await triageAssistScoreAsync(msg, v, "live");
    expect(triage.overridesVerdict).toBe(false);
    expect(triage.meta.mode).toBe("offline_stub");
    expect(triage.meta.source).not.toBe("llm");

    const bundled = await attachAiDraftsAsync(msg, v, "live");
    expect(bundled.action).toBe(beforeAction);
    expect(bundled.risk).toBe(beforeRisk);
    expect(bundled.aiExplanation.meta.source).not.toBe("llm");
    expect(bundled.triageAssist.overridesVerdict).toBe(false);
  });

  it("offline async always drafts (same honesty as sync)", async () => {
    const msg = {
      id: "ai-6",
      channel: "sms",
      from: "Con",
      body: "Ba nhớ uống thuốc",
    };
    const v = judgeMessage(msg);
    const bundled = await attachAiDraftsAsync(msg, v, "offline_stub");
    expect(bundled.aiExplanation.elderVi).toMatch(/AI-draft/i);
    expect(bundled.aiExplanation.meta.mode).toBe("offline_stub");
    expect(bundled.triageAssist.overridesVerdict).toBe(false);
    expect(bundled.action).toBe(v.action);
    expect(bundled.risk).toBe(v.risk);
  });
});
