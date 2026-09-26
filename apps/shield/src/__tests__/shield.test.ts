import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";
import {
  BLACKLIST_VERSION,
  SCRIPT_PATTERNS,
  SHADOW_DAYS,
  addCalendarDays,
  applyHumanOverride,
  auditLog,
  blacklistDomainsHash,
  clearAuditLog,
  isPatternInShadow,
  judgeMessage,
  shadowedPatternIds,
} from "../engine.js";

beforeEach(() => {
  clearAuditLog();
});

describe("shield", () => {
  it("blocks fake bank SMS with blacklisted link", () => {
    const v = judgeMessage({
      id: "1",
      channel: "sms",
      from: "bank",
      body: "Xác minh ngay http://vcb-secure-login.xyz hoặc bị khóa",
      meta: { senderSpoof: true },
    });
    expect(v.action).toBe("block");
    expect(v.risk).toBe("block");
    expect(v.blacklistVersion).toBe(BLACKLIST_VERSION);
    expect(v.elderExplanation).not.toMatch(/Domain blacklist|Deepfake score/i);
    expect(v.explanationDraftSource).toBe("template");
  });

  it("allows benign family SMS", () => {
    const v = judgeMessage({
      id: "2",
      channel: "sms",
      from: "Con",
      body: "Ba nhớ uống thuốc huyết áp nhé",
    });
    expect(v.action).toBe("allow");
    expect(v.risk).toBe("safe");
  });

  it("deepfake alone blocks and labels fixture detector", () => {
    const v = judgeMessage({
      id: "3",
      channel: "zalo",
      from: "Ai đó",
      body: "Chào bà",
      meta: { deepfakeScore: 0.95 },
    });
    expect(v.action).toBe("block");
    expect(v.detector).toBe("fixture");
    expect(v.reasons.some((r) => /detector:\s*fixture/i.test(r))).toBe(true);
    expect(v.elderExplanation).toMatch(/giả mạo/i);
    expect(v.elderExplanation).not.toMatch(/Deepfake score|fixture|ML/i);
    expect(auditLog[0].detector).toBe("fixture");
  });

  it("warn path — single soft CSKH script without blacklist", () => {
    const v = judgeMessage({
      id: "m5",
      channel: "sms",
      from: "1900-xxxx",
      body: "CSKH Vietcombank gọi xác minh thông tin tài khoản của quý khách. Vui lòng nghe máy.",
      meta: {},
    });
    expect(v.action).toBe("flag");
    expect(v.risk).toBe("warn");
    // CSKH is in shadow window → shadowPatternIds set, never block from pattern alone
    expect(v.shadowPatternIds).toContain("fake-cskh-bank");
  });

  it("trusted contact soft-hit is allowed (ignore soft reasons)", () => {
    const v = judgeMessage({
      id: "t1",
      channel: "sms",
      from: "Con gái Hương",
      body: "CSKH Vietcombank gọi xác minh giúp ba nhé.",
      meta: {},
    });
    expect(v.action).toBe("allow");
    expect(v.risk).toBe("safe");
  });

  it("hard block still blocks spoofed trusted name", () => {
    const v = judgeMessage({
      id: "t2",
      channel: "sms",
      from: "Con gái Hương",
      body: "Ba ơi chuyển gấp http://vcb-secure-login.xyz xác minh ngay hoặc bị khóa",
      meta: { senderSpoof: true },
    });
    expect(v.action).toBe("block");
    expect(v.risk).toBe("block");
  });

  it("OTP share request blocks (or flags with enough signals)", () => {
    const v = judgeMessage({
      id: "m6",
      channel: "zalo",
      from: "Ngân hàng hỗ trợ",
      body: "Quý khách vui lòng chia sẻ mã OTP vừa nhận để chúng tôi xác minh giao dịch.",
      meta: {},
    });
    // OTP is in shadow → FLAG only (Lee-S2), never block from shadow pattern alone
    expect(v.action).toBe("flag");
    expect(v.action).not.toBe("allow");
    expect(v.shadowPatternIds).toContain("otp-share-request");
  });

  it("audit grows on each judge and carries blacklistVersion", () => {
    expect(auditLog.length).toBe(0);
    judgeMessage({
      id: "a1",
      channel: "sms",
      from: "x",
      body: "hello",
    });
    judgeMessage({
      id: "a2",
      channel: "sms",
      from: "x",
      body: "Xác minh ngay http://vcb-secure-login.xyz hoặc bị khóa",
    });
    expect(auditLog.length).toBe(2);
    expect(auditLog[0].messageId).toBe("a1");
    expect(auditLog[0].blacklistVersion).toBe(BLACKLIST_VERSION);
    expect(auditLog[0].blacklistHash).toBe(blacklistDomainsHash());
    expect(auditLog[1].action).toBe("block");
    expect(auditLog[1].blacklistVersion).toBe(BLACKLIST_VERSION);
  });

  it("false positive → human override", () => {
    const flagged = judgeMessage({
      id: "fp1",
      channel: "sms",
      from: "1900-xxxx",
      body: "CSKH Vietcombank gọi xác minh thông tin tài khoản của quý khách. Vui lòng nghe máy.",
      meta: {},
    });
    expect(flagged.action).toBe("flag");
    const allowed = applyHumanOverride(flagged, "allow", "Con gái Hương");
    expect(allowed.action).toBe("allow");
    expect(allowed.risk).toBe("safe");
    expect(allowed.reasons.some((r) => /Human override/i.test(r))).toBe(true);
    expect(auditLog.some((e) => /Human override/i.test(e.note ?? ""))).toBe(true);
  });

  it("override flips action", () => {
    const blocked = judgeMessage({
      id: "o1",
      channel: "sms",
      from: "bank",
      body: "Xác minh ngay http://vcb-secure-login.xyz hoặc bị khóa",
      meta: { senderSpoof: true },
    });
    expect(blocked.action).toBe("block");
    const allowed = applyHumanOverride(blocked, "allow", "Con gái Hương");
    expect(allowed.action).toBe("allow");
    expect(allowed.risk).toBe("safe");
    expect(allowed.reasons.some((r) => /Human override/i.test(r))).toBe(true);
    expect(auditLog.length).toBeGreaterThanOrEqual(2);

    const reblocked = applyHumanOverride(allowed, "block", "Con trai Nam");
    expect(reblocked.action).toBe("block");
    expect(reblocked.risk).toBe("block");
  });

  it("elder explanation never exposes machine jargon", () => {
    const v = judgeMessage({
      id: "j1",
      channel: "sms",
      from: "spoof",
      body: "Quét QR nhận hoàn tiền http://shopee-hoan-tien.tk",
      meta: { qrBlacklisted: true, deepfakeScore: 0.99 },
    });
    expect(v.action).toBe("block");
    expect(v.elderExplanation).not.toMatch(
      /Domain blacklist|Deepfake score|QR on blacklist|fixture|detector|hash|blacklistVersion/i
    );
    // TA-S3: familyAlert = everyday VN, no jargon/hash/version
    expect(v.familyAlert).toBeDefined();
    expect(v.familyAlert!).not.toMatch(
      /Domain blacklist|Deepfake|hash|blacklistVersion|fixture|detector/i
    );
    expect(v.familyAlert!).toMatch(/Con ơi/);
  });

  it("shadow mode turns would-block into flag with shadow: would_block", () => {
    const v = judgeMessage(
      {
        id: "sh1",
        channel: "sms",
        from: "bank",
        body: "Xác minh ngay http://vcb-secure-login.xyz hoặc bị khóa",
        meta: { senderSpoof: true },
      },
      { mode: "shadow" }
    );
    expect(v.action).toBe("flag");
    expect(v.risk).toBe("warn");
    expect(v.mode).toBe("shadow");
    expect(v.reasons.some((r) => r === "shadow: would_block")).toBe(true);
    expect(auditLog[0].note).toBe("shadow: would_block");
    expect(auditLog[0].mode).toBe("shadow");
  });

  it("shield-verdict schema file exists and matches shape", () => {
    const schemaPath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../../packages/contracts/schemas/shield-verdict.v0.1.schema.json"
    );
    expect(fs.existsSync(schemaPath)).toBe(true);
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
    expect(schema.$id).toMatch(/shield-verdict/);
    expect(schema.required).toEqual(
      expect.arrayContaining([
        "messageId",
        "risk",
        "reasons",
        "action",
        "elderExplanation",
        "explanationDraftSource",
        "blacklistVersion",
      ])
    );
    const v = judgeMessage({
      id: "schema1",
      channel: "sms",
      from: "x",
      body: "hello",
    });
    for (const key of schema.required as string[]) {
      expect(v).toHaveProperty(key);
    }
  });

  // --- S3/S4 + Sid-S3 + Lee-S2: per-pattern shadowUntil calendar ---

  it("isPatternInShadow: now < shadowUntil → true; past → false", () => {
    const now = new Date(2026, 8, 26); // 2026-09-26 local
    expect(isPatternInShadow("2026-10-01", now)).toBe(true);
    expect(isPatternInShadow("2026-09-26", now)).toBe(false); // not strictly before
    expect(isPatternInShadow("2026-09-08", now)).toBe(false);
    // introducedAt + SHADOW_DAYS
    const until = addCalendarDays("2026-09-24", SHADOW_DAYS); // 2026-10-01
    expect(until).toBe("2026-10-01");
    expect(isPatternInShadow(until, now)).toBe(true);
  });

  it("new shadow pattern alone → flag not block (Lee-S2)", () => {
    const v = judgeMessage({
      id: "shadow-alone",
      channel: "sms",
      from: "1900-xxxx",
      body: "CSKH Vietcombank gọi xác minh thông tin tài khoản của quý khách. Vui lòng nghe máy.",
      meta: {},
    });
    expect(v.action).toBe("flag");
    expect(v.risk).toBe("warn");
    expect(v.shadowPatternIds).toContain("fake-cskh-bank");
    expect(v.reasons.some((r) => /shadow: pattern fake-cskh-bank/i.test(r))).toBe(
      true
    );
    expect(auditLog[0].shadowPatternIds).toContain("fake-cskh-bank");
  });

  it("old patterns + blacklist still block (demo m1 intact)", () => {
    const v = judgeMessage({
      id: "m1",
      channel: "sms",
      from: "Vietcombank",
      body: "TK của quý khách bất thường. Nhấn link http://vcb-secure-login.xyz để xác minh ngay hoặc bị khóa.",
      meta: { senderSpoof: true },
    });
    expect(v.action).toBe("block");
    expect(v.risk).toBe("block");
    // bank-urgent is mature — not in shadow
    expect(v.shadowPatternIds ?? []).not.toContain("bank-urgent-link");
  });

  it("SCRIPT_PATTERNS carry introducedAt + shadowUntil; OTP/CSKH still in shadow", () => {
    for (const p of SCRIPT_PATTERNS) {
      expect(p.introducedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.shadowUntil).toBe(addCalendarDays(p.introducedAt, SHADOW_DAYS));
    }
    const now = new Date(2026, 8, 26);
    const ids = shadowedPatternIds(now);
    expect(ids).toEqual(
      expect.arrayContaining(["fake-cskh-bank", "otp-share-request"])
    );
    expect(ids).not.toContain("bank-urgent-link");
    expect(ids).not.toContain("family-emergency-money");
    expect(ids).not.toContain("qr-refund");
  });

  it("hard signals still block even when shadow patterns also fire", () => {
    // URL blacklist hard-blocks; shadow OTP must not weaken
    const v = judgeMessage({
      id: "hard+shadow",
      channel: "sms",
      from: "x",
      body: "Chia sẻ mã OTP và xác minh ngay http://vcb-secure-login.xyz",
      meta: {},
    });
    expect(v.action).toBe("block");
  });
});
