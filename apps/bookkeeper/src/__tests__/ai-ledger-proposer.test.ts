import { afterEach, describe, expect, it, vi } from "vitest";
import {
  OfflineAiLedgerProposer,
  LiveAiLedgerProposer,
  createAiLedgerProposer,
  proposeOfflineSync,
  UI_BADGES,
} from "../lib/ai-ledger-proposer.js";
import {
  createVendorState,
  ingestUtterance,
  ingestUtteranceWithAi,
  commitApproved,
} from "../lib/agent.js";
import { crossesExemption, EXEMPTION_THRESHOLD_VND } from "@bizmate/core";

describe("AiLedgerProposer", () => {
  it("offline stub proposes items and labels honestly", async () => {
    const p = new OfflineAiLedgerProposer();
    const ai = await p.propose({
      utteranceId: "u-ai-1",
      text: "sáng nay bán 2 áo, mỗi cái 200 nghìn",
      ytdRevenueVnd: 100_000_000,
      citationIds: ["ND-141-2026"],
    });
    expect(p.mode).toBe("offline_stub");
    expect(ai.items[0]?.qty).toBe(2);
    expect(ai.meta.mode).toBe("offline_stub");
    expect(ai.meta.labelVi.toLowerCase()).toMatch(/stub|offline|đề xuất/);
    expect(ai.meta.modelId).toBeUndefined();
    expect(ai.fallbackUsed).toBe(false);
    expect(ai.uiBadges.ai).toBe(UI_BADGES.ai);
    expect(ai.uiBadges.ruleVerify).toBe(UI_BADGES.ruleVerify);
    expect(ai.uiBadges.human).toBe(UI_BADGES.human);
  });

  it("ingestUtterance returns AI propose + rule-verified proposal", () => {
    const state0 = createVendorState("v1", 980_000_000);
    const { proposal, ai } = ingestUtterance(
      state0,
      "u-ai-2",
      "bán 1 áo, 25000 nghìn",
      ["ND-141-2026"]
    );
    expect(ai.meta.mode).toBe("offline_stub");
    expect(proposal.status).toBe("verified");
    expect(proposal.payload.crossedThreshold).toBe(true);
    // 1B still pure code (@bizmate/core) — not LLM
    expect(
      crossesExemption(proposal.payload.ytdBefore, proposal.payload.totalVnd)
    ).toBe(true);
    expect(EXEMPTION_THRESHOLD_VND).toBe(1_000_000_000);
  });

  it("live proposer falls back to offline stub without inventing LLM output", async () => {
    const live = new LiveAiLedgerProposer({ BIZMATE_MODE: "live" });
    const ai = await live.propose({
      utteranceId: "u-live",
      text: "bán 1 áo 100 nghìn",
      ytdRevenueVnd: 0,
      citationIds: [],
    });
    expect(live.mode).toBe("live");
    expect(ai.meta.mode).toBe("offline_stub");
    expect(ai.fallbackUsed).toBe(true);
    expect(ai.meta.modelId).toBeUndefined();
    expect(ai.meta.fallbackReason).toBe("missing_api_key");
    expect(ai.classificationNote).toMatch(/missing_api_key/i);
    expect(ai.meta.labelVi).toMatch(/missing_api_key|fallback|stub|offline/i);
  });

  it("createAiLedgerProposer gated by BIZMATE_MODE", () => {
    expect(createAiLedgerProposer({}).mode).toBe("offline_stub");
    expect(createAiLedgerProposer({ BIZMATE_MODE: "offline" }).mode).toBe(
      "offline_stub"
    );
    expect(createAiLedgerProposer({ BIZMATE_MODE: "live" }).mode).toBe("live");
  });

  it("human Duyệt still required after AI propose", async () => {
    const state0 = createVendorState("v1", 50_000_000);
    const { proposal, state, ai } = await ingestUtteranceWithAi(
      state0,
      "u-hitl",
      "bán 1 áo 250 nghìn",
      ["ND-141-2026"],
      {}
    );
    expect(ai.uiBadges.human).toBe("chờ duyệt");
    expect(proposal.status).toBe("verified");
    const next = commitApproved(state, proposal);
    expect(next.ledger[0]?.status).toBe("approved");
  });

  it("proposeOfflineSync is sync and deterministic", () => {
    const a = proposeOfflineSync({
      utteranceId: "x",
      text: "bán 3 áo 100 nghìn",
      ytdRevenueVnd: 0,
      citationIds: [],
    });
    const b = proposeOfflineSync({
      utteranceId: "x",
      text: "bán 3 áo 100 nghìn",
      ytdRevenueVnd: 0,
      citationIds: [],
    });
    expect(a.items).toEqual(b.items);
  });
});

describe("AiLedgerProposer trust boundary", () => {
  it("AI proposal has draft items only — no tax/payment/YTD ownership fields", () => {
    const ai = proposeOfflineSync({
      utteranceId: "tb-1",
      text: "bán 2 áo 200 nghìn",
      ytdRevenueVnd: 999_000_000,
      citationIds: ["ND-141-2026"],
    });
    const keys = Object.keys(ai).sort();
    expect(keys).toEqual(
      [
        "classificationNote",
        "fallbackUsed",
        "items",
        "meta",
        "uiBadges",
        "utteranceId",
      ].sort()
    );
    // Line items are qty/description/unitPrice only — no crossedThreshold / tax
    for (const item of ai.items) {
      expect(item).toEqual({
        qty: item.qty,
        description: item.description,
        unitPriceVnd: item.unitPriceVnd,
      });
      expect(item).not.toHaveProperty("crossedThreshold");
      expect(item).not.toHaveProperty("ytdAfter");
      expect(item).not.toHaveProperty("taxVnd");
      expect(item).not.toHaveProperty("payment");
    }
  });

  it("1B / totals come from rules + @bizmate/core, not AI meta", () => {
    const ytd = 980_000_000;
    const { proposal, ai } = ingestUtterance(
      createVendorState("v-tb", ytd),
      "tb-2",
      "bán 1 áo, 25000 nghìn",
      ["ND-141-2026"]
    );
    // AI does not claim live or own threshold
    expect(ai.meta.mode).toBe("offline_stub");
    expect(ai.meta.source).not.toBe("llm");
    // Money math is deterministic code
    const total = proposal.payload.totalVnd;
    expect(proposal.payload.ytdBefore).toBe(ytd);
    expect(proposal.payload.ytdAfter).toBe(ytd + total);
    expect(proposal.payload.crossedThreshold).toBe(
      crossesExemption(ytd, total)
    );
    expect(proposal.payload.crossedThreshold).toBe(true);
  });

  it("live env still falls back without inventing modelId or tax", async () => {
    const { proposal, ai } = await ingestUtteranceWithAi(
      createVendorState("v-live", 10_000_000),
      "tb-live",
      "bán 1 áo 100 nghìn",
      ["ND-141-2026"],
      { BIZMATE_MODE: "live", BIZMATE_LLM_MODEL: "fake-model-should-not-appear" }
    );
    expect(ai.fallbackUsed).toBe(true);
    expect(ai.meta.mode).toBe("offline_stub");
    expect(ai.meta.modelId).toBeUndefined();
    expect(ai.meta.fallbackReason).toBe("missing_api_key");
    expect(ai.meta.labelVi).toMatch(/missing_api_key|fallback|stub|offline/i);
    // Totals still from rules
    expect(proposal.payload.totalVnd).toBe(100_000);
    expect(proposal.status).toBe("verified");
  });

  it("AI does not auto-persist — commitApproved requires verified + human", async () => {
    const state0 = createVendorState("v-hitl", 50_000_000);
    const { proposal, state, ai } = await ingestUtteranceWithAi(
      state0,
      "tb-hitl",
      "bán 1 áo 250 nghìn",
      ["ND-141-2026"],
      { BIZMATE_MODE: "live" }
    );
    expect(ai.uiBadges).toEqual(UI_BADGES);
    expect(state.ledger).toHaveLength(0);
    expect(proposal.status).toBe("verified");
    expect(() =>
      commitApproved(state, { ...proposal, status: "proposed" as const })
    ).toThrow(/verified/i);
    const next = commitApproved(state, proposal);
    expect(next.ledger).toHaveLength(1);
    expect(next.ledger[0]?.status).toBe("approved");
  });
});

describe("AiLedgerProposer Soft A4 live wire", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("live with key mocked → live meta; items still from parser (no tax)", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          model: "gpt-4o-mini",
          choices: [{ message: { content: "Looks like a shirt sale line." } }],
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchImpl);

    const live = new LiveAiLedgerProposer({
      BIZMATE_MODE: "live",
      OPENAI_API_KEY: "sk-test",
    });
    const ai = await live.propose({
      utteranceId: "u-live-ok",
      text: "bán 1 áo 100 nghìn",
      ytdRevenueVnd: 0,
      citationIds: [],
    });
    expect(ai.fallbackUsed).toBe(false);
    expect(ai.meta.mode).toBe("live");
    expect(ai.meta.source).toBe("llm");
    expect(ai.meta.modelId).toBe("gpt-4o-mini");
    expect(ai.classificationNote).toMatch(/AI-live/);
    expect(ai.items[0]?.unitPriceVnd).toBe(100_000);
    expect(ai).not.toHaveProperty("taxVnd");
    expect(fetchImpl).toHaveBeenCalled();
  });

  it("live missing key → missing_api_key fallback, no modelId", async () => {
    const live = new LiveAiLedgerProposer({ BIZMATE_MODE: "live" });
    const ai = await live.propose({
      utteranceId: "u-nokey",
      text: "bán 1 áo 100 nghìn",
      ytdRevenueVnd: 0,
      citationIds: [],
    });
    expect(ai.fallbackUsed).toBe(true);
    expect(ai.meta.mode).toBe("offline_stub");
    expect(ai.meta.fallbackReason).toBe("missing_api_key");
    expect(ai.meta.modelId).toBeUndefined();
  });
});
