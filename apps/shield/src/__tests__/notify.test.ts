import { describe, expect, it, beforeEach } from "vitest";
import {
  clearAuditLog,
  judgeMessage,
} from "../engine.js";
import { buildFamilyNotify, SW_SHOW_NOTIFY } from "../notify.js";
import { runDetectorStub, DETECTOR_KIND } from "../detector-stub.js";

beforeEach(() => {
  clearAuditLog();
});

describe("notify helpers (PWA / SW)", () => {
  it("builds local-sw-stub payload on BLOCK", () => {
    const v = judgeMessage({
      id: "n1",
      channel: "sms",
      from: "bank",
      body: "Xác minh ngay http://vcb-secure-login.xyz hoặc bị khóa",
      meta: { senderSpoof: true },
    });
    expect(v.action).toBe("block");
    const n = buildFamilyNotify(v, "Ông Minh");
    expect(n).not.toBeNull();
    expect(n!.honesty).toBe("local-sw-stub");
    expect(n!.action).toBe("block");
    expect(n!.messageId).toBe("n1");
    expect(n!.title).toMatch(/chặn/i);
    expect(n!.body).toMatch(/Con ơi/);
    expect(n!.tag).toBe("shield-n1-block");
  });

  it("builds payload on FLAG and null on ALLOW", () => {
    const flagged = judgeMessage({
      id: "n2",
      channel: "sms",
      from: "1900-xxxx",
      body: "CSKH Vietcombank gọi xác minh thông tin tài khoản của quý khách. Vui lòng nghe máy.",
    });
    expect(flagged.action).toBe("flag");
    const n = buildFamilyNotify(flagged);
    expect(n?.action).toBe("flag");
    expect(n?.honesty).toBe("local-sw-stub");

    const allowed = judgeMessage({
      id: "n3",
      channel: "sms",
      from: "Con gái Hương",
      body: "Ba nhớ uống thuốc huyết áp nhé",
    });
    expect(allowed.action).toBe("allow");
    expect(buildFamilyNotify(allowed)).toBeNull();
  });

  it("SW message constant is stable for client↔worker contract", () => {
    expect(SW_SHOW_NOTIFY).toBe("shield:show-notify");
  });
});

describe("detector stub (fixture honesty)", () => {
  it("always labels detector: fixture", () => {
    expect(DETECTOR_KIND).toBe("fixture");
    const empty = runDetectorStub();
    expect(empty.detector).toBe("fixture");
    expect(empty.score).toBeNull();
    expect(empty.label).toMatch(/detector:\s*fixture/i);

    const scored = runDetectorStub({ deepfakeScore: 0.97 });
    expect(scored.detector).toBe("fixture");
    expect(scored.score).toBe(0.97);
    expect(scored.label).toMatch(/fixture/);
    expect(scored.elderHint).toMatch(/giả mạo/i);
    expect(scored.elderHint).not.toMatch(/fixture|ML|score/i);
  });
});
