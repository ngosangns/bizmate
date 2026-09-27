import { describe, expect, it } from "vitest";
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
import { crossesExemption } from "@bizmate/core";

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
    // 1B still pure code
    expect(
      crossesExemption(proposal.payload.ytdBefore, proposal.payload.totalVnd)
    ).toBe(true);
  });

  it("live proposer falls back to offline stub without inventing LLM output", async () => {
    const live = new LiveAiLedgerProposer();
    const ai = await live.propose({
      utteranceId: "u-live",
      text: "bán 1 áo 100 nghìn",
      ytdRevenueVnd: 0,
      citationIds: [],
    });
    expect(ai.meta.mode).toBe("offline_stub");
    expect(ai.classificationNote).toMatch(/live hook unavailable|offline_stub/i);
  });

  it("createAiLedgerProposer defaults offline", () => {
    expect(createAiLedgerProposer({}).mode).toBe("offline_stub");
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
