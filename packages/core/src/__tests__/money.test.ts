import { describe, expect, it } from "vitest";
import {
  crossesExemption,
  remainingExemption,
  sumVnd,
  EXEMPTION_THRESHOLD_VND,
} from "../money.js";

describe("money", () => {
  it("sums VND", () => {
    expect(sumVnd([1000, 2000])).toBe(3000);
  });

  it("tracks exemption threshold", () => {
    expect(remainingExemption(EXEMPTION_THRESHOLD_VND - 1)).toBe(1);
    expect(crossesExemption(EXEMPTION_THRESHOLD_VND - 500, 1000)).toBe(true);
  });
});
