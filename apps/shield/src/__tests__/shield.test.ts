import { describe, expect, it } from "vitest";
import { judgeMessage } from "../engine.js";

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
  });

  it("allows benign family SMS", () => {
    const v = judgeMessage({
      id: "2",
      channel: "sms",
      from: "Con",
      body: "Ba nhớ uống thuốc huyết áp nhé",
    });
    expect(v.action).toBe("allow");
  });
});
