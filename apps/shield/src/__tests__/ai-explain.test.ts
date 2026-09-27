import { afterEach, describe, expect, it, vi } from "vitest";
import { judgeMessage } from "../engine.js";
import {
  attachAiDrafts,
  attachAiDraftsAsync,
  draftAiExplanation,
  draftAiExplanationAsync,
  triageAssistScore,
  triageAssistScoreAsync,
} from "../ai-explain.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

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
  });

  it("live async missing key → missing_api_key, no llm claim", async () => {
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

    const draft = await draftAiExplanationAsync(v, "live", {
      BIZMATE_MODE: "live",
    });
    expect(draft.meta.mode).toBe("offline_stub");
    expect(draft.meta.fallbackReason).toBe("missing_api_key");
    expect(draft.meta.modelId).toBeUndefined();
    expect(draft.meta.source).not.toBe("llm");

    const triage = await triageAssistScoreAsync(msg, v, "live", {
      BIZMATE_MODE: "live",
    });
    expect(triage.overridesVerdict).toBe(false);
    expect(triage.meta.fallbackReason).toBe("missing_api_key");

    const bundled = await attachAiDraftsAsync(msg, v, "live", {
      BIZMATE_MODE: "live",
    });
    expect(bundled.action).toBe(beforeAction);
    expect(bundled.risk).toBe(beforeRisk);
    expect(bundled.aiExplanation.meta.source).not.toBe("llm");
    expect(bundled.triageAssist.overridesVerdict).toBe(false);
  });

  it("live async with key mocked → live meta; risk unchanged", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          model: "gpt-4o-mini",
          choices: [
            { message: { content: "Ba/mẹ ơi, tin này có dấu hiệu lừa đảo." } },
          ],
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchImpl);

    const msg = {
      id: "ai-live-ok",
      channel: "sms" as const,
      from: "bank",
      body: "OTP http://evil.xyz",
      meta: { senderSpoof: true },
    };
    const v = judgeMessage(msg);
    const before = { action: v.action, risk: v.risk };

    const draft = await draftAiExplanationAsync(v, "live", {
      BIZMATE_MODE: "live",
      OPENAI_API_KEY: "sk-test",
    });
    expect(draft.meta.mode).toBe("live");
    expect(draft.meta.source).toBe("llm");
    expect(draft.meta.modelId).toBe("gpt-4o-mini");
    expect(draft.elderVi).toMatch(/AI-live/);
    expect(v.action).toBe(before.action);
    expect(v.risk).toBe(before.risk);
    expect(fetchImpl).toHaveBeenCalled();
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
