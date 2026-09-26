import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { assertValid, validateFloodDecision } from "@bizmate/contracts";
import {
  approveRefund,
  persistWaveActions,
  readAuditJsonl,
  resetAuditFile,
} from "../audit.js";
import {
  buildAuditLog,
  codAtRiskVnd,
  replanOrder,
  runWave,
  summarizeEvents,
  type Policy,
  type ProposedAction,
  type Ward,
} from "../engine.js";

describe("floodops", () => {
  const policy: Policy = {
    autoRescheduleMaxCodVnd: 500_000,
    refundRequiresHumanAboveVnd: 1_000_000,
  };
  const flooded: Ward = {
    id: "w1",
    name: "X",
    floodCm: 40,
    status: "flooded",
  };
  const clear: Ward = {
    id: "w-clear",
    name: "Dry",
    floodCm: 0,
    status: "clear",
  };

  const tmpDirs: string[] = [];
  afterEach(() => {
    for (const d of tmpDirs) {
      try {
        fs.rmSync(d, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    }
    tmpDirs.length = 0;
  });

  function tmpAudit(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "floodops-audit-"));
    tmpDirs.push(dir);
    return path.join(dir, "wave.jsonl");
  }

  it("auto-reschedules low COD in flood when clear wards exist", () => {
    const a = replanOrder(
      { id: "o1", wardId: "w1", codVnd: 100_000, slaHoursLeft: 6 },
      flooded,
      policy,
      ["clear"]
    );
    expect(a.kind).toBe("reschedule");
    expect(a.requiresHuman).toBe(false);
    expect(a.status).toBe("auto_applied");
  });

  it("reroutes mid COD to a clear ward", () => {
    const a = replanOrder(
      { id: "o-mid", wardId: "w1", codVnd: 750_000, slaHoursLeft: 5 },
      flooded,
      policy,
      ["w-clear"]
    );
    expect(a.kind).toBe("reroute_clear_ward");
    expect(a.requiresHuman).toBe(false);
    expect(a.reason).toContain("w-clear");
    expect(a.status).toBe("auto_applied");
  });

  it("escalates high COD refund to human", () => {
    const a = replanOrder(
      { id: "o2", wardId: "w1", codVnd: 2_500_000, slaHoursLeft: 2 },
      flooded,
      policy,
      ["clear"]
    );
    expect(a.kind).toBe("propose_refund");
    expect(a.requiresHuman).toBe(true);
    expect(a.status).toBe("awaiting_human");
  });

  it("noop on clear ward regardless of COD", () => {
    const a = replanOrder(
      { id: "o3", wardId: "w-clear", codVnd: 2_500_000, slaHoursLeft: 1 },
      clear,
      policy,
      ["w-clear"]
    );
    expect(a.kind).toBe("noop");
    expect(a.requiresHuman).toBe(false);
    expect(a.reason).toBe("Ward clear");
  });

  it("holds low COD when courier cancelled on flooded ward", () => {
    const a = replanOrder(
      { id: "o4", wardId: "w1", codVnd: 100_000, slaHoursLeft: 6 },
      flooded,
      policy,
      ["clear"],
      true
    );
    expect(a.kind).toBe("hold");
    expect(a.reason).toMatch(/courier cancel/i);
    expect(a.requiresHuman).toBe(false);
  });

  it("tight SLA hold requires human", () => {
    const a = replanOrder(
      { id: "o5", wardId: "w1", codVnd: 100_000, slaHoursLeft: 1 },
      flooded,
      policy,
      [], // no clear → hold
      false
    );
    expect(a.kind).toBe("hold");
    expect(a.requiresHuman).toBe(true);
    expect(a.status).toBe("awaiting_human");
  });

  it("SLA ≤2h on flooded ward forces human even for reschedule (ORD-1005 style)", () => {
    const a = replanOrder(
      { id: "ORD-1005-style", wardId: "w1", codVnd: 50_000, slaHoursLeft: 1 },
      flooded,
      policy,
      ["clear"],
      false
    );
    expect(a.kind).toBe("reschedule");
    expect(a.requiresHuman).toBe(true);
    expect(a.status).toBe("awaiting_human");
    expect(a.reason).toMatch(/SLA/);
  });

  it("SLA ≤2h on flooded ward forces human even for reroute", () => {
    const a = replanOrder(
      { id: "o-reroute-sla", wardId: "w1", codVnd: 750_000, slaHoursLeft: 2 },
      flooded,
      policy,
      ["w-clear"]
    );
    expect(a.kind).toBe("reroute_clear_ward");
    expect(a.requiresHuman).toBe(true);
    expect(a.status).toBe("awaiting_human");
  });

  it("refund never auto-applies", () => {
    const cases = [
      { id: "r1", codVnd: 1_000_000, slaHoursLeft: 8 },
      { id: "r2", codVnd: 5_000_000, slaHoursLeft: 1 },
      { id: "r3", codVnd: 2_000_000, slaHoursLeft: 4 },
    ];
    for (const c of cases) {
      const a = replanOrder(
        { id: c.id, wardId: "w1", codVnd: c.codVnd, slaHoursLeft: c.slaHoursLeft },
        flooded,
        policy,
        ["clear"]
      );
      expect(a.kind).toBe("propose_refund");
      expect(a.status).not.toBe("auto_applied");
      expect(a.status).toBe("awaiting_human");
      expect(a.requiresHuman).toBe(true);
      assertValid(validateFloodDecision, a, `refund-${c.id}`);
    }
  });

  it("approveRefund flips awaiting_human → approved and appends audit", () => {
    const auditPath = tmpAudit();
    const actions: ProposedAction[] = [
      replanOrder(
        { id: "ORD-1003", wardId: "w1", codVnd: 2_500_000, slaHoursLeft: 2 },
        flooded,
        policy,
        ["clear"]
      ),
    ];
    expect(actions[0]!.status).toBe("awaiting_human");
    persistWaveActions(actions, { auditPath, waveId: "test-wave" });
    const approved = approveRefund(actions, "ORD-1003", "ops-lead-demo", {
      auditPath,
    });
    expect(approved.status).toBe("approved");
    expect(actions[0]!.status).toBe("approved");
    const lines = readAuditJsonl(auditPath);
    expect(lines.length).toBe(2);
    expect(lines[1]!.type).toBe("human_decision");
    expect(lines[1]!.actor).toBe("ops-lead-demo");
    expect(lines[1]!.before?.status).toBe("awaiting_human");
    expect(lines[1]!.after?.status).toBe("approved");
    assertValid(validateFloodDecision, lines[1]!, "human-decision");
  });

  it("approveRefund rejects non-refund or wrong status", () => {
    const hold = replanOrder(
      { id: "h1", wardId: "w1", codVnd: 100_000, slaHoursLeft: 6 },
      flooded,
      policy,
      []
    );
    expect(() => approveRefund([hold], "h1", "ops")).toThrow(/propose_refund/);
    const refund = replanOrder(
      { id: "ORD-X", wardId: "w1", codVnd: 2_000_000, slaHoursLeft: 4 },
      flooded,
      policy,
      ["clear"]
    );
    refund.status = "approved";
    expect(() => approveRefund([refund], "ORD-X", "ops")).toThrow(
      /awaiting_human/
    );
  });

  it("resetAuditFile clears JSONL for replay", () => {
    const auditPath = tmpAudit();
    persistWaveActions(
      [
        replanOrder(
          { id: "o1", wardId: "w1", codVnd: 100_000, slaHoursLeft: 6 },
          flooded,
          policy,
          ["clear"]
        ),
      ],
      { auditPath }
    );
    expect(readAuditJsonl(auditPath).length).toBe(1);
    resetAuditFile(auditPath);
    expect(readAuditJsonl(auditPath).length).toBe(0);
  });

  it("summarizeEvents extracts alerts and cancels", () => {
    const s = summarizeEvents([
      { type: "flood_alert", wardId: "a", floodCm: 45 },
      { type: "flood_alert", wardId: "b", floodCm: 30 },
      { type: "courier_cancel", wardId: "a" },
      { type: "noise" },
    ]);
    expect(s.floodAlerts).toEqual([
      { wardId: "a", floodCm: 45 },
      { wardId: "b", floodCm: 30 },
    ]);
    expect(s.courierCancelWardIds).toEqual(["a"]);
  });

  it("buildAuditLog is deterministic and field-stable", () => {
    const actions = runWave(
      [
        { id: "ORD-A", wardId: "w1", codVnd: 100_000, slaHoursLeft: 6 },
        { id: "ORD-B", wardId: "w-clear", codVnd: 50_000, slaHoursLeft: 8 },
        { id: "ORD-C", wardId: "w1", codVnd: 2_000_000, slaHoursLeft: 2 },
      ],
      [flooded, clear],
      policy,
      [{ type: "courier_cancel", wardId: "w1" }]
    );
    const log = buildAuditLog(actions);
    expect(log).toHaveLength(3);
    expect(Object.keys(log[0]!)).toEqual([
      "orderId",
      "kind",
      "requiresHuman",
      "status",
      "reason",
    ]);
    expect(log.map((e) => e.orderId)).toEqual(["ORD-A", "ORD-B", "ORD-C"]);
    expect(log[0]!.kind).toBe("hold"); // cancel prefers hold over reschedule
    expect(log[1]!.kind).toBe("noop");
    expect(log[2]!.kind).toBe("propose_refund");
    expect(log[2]!.requiresHuman).toBe(true);
    expect(buildAuditLog(actions)).toEqual(log);
  });

  it("mid COD without clear wards falls to hold", () => {
    const a = replanOrder(
      { id: "o6", wardId: "w1", codVnd: 750_000, slaHoursLeft: 4 },
      flooded,
      policy,
      []
    );
    expect(a.kind).toBe("hold");
    expect(a.requiresHuman).toBe(false);
  });

  it("boundary: COD == autoRescheduleMax is low (reschedule), == refund threshold is refund", () => {
    const atMax = replanOrder(
      { id: "b1", wardId: "w1", codVnd: 500_000, slaHoursLeft: 4 },
      flooded,
      policy,
      ["clear"]
    );
    expect(atMax.kind).toBe("reschedule");

    const atRefund = replanOrder(
      { id: "b2", wardId: "w1", codVnd: 1_000_000, slaHoursLeft: 4 },
      flooded,
      policy,
      ["clear"]
    );
    expect(atRefund.kind).toBe("propose_refund");
  });

  it("codAtRiskVnd sums COD on flooded wards only", () => {
    const n = codAtRiskVnd(
      [
        { id: "a", wardId: "w1", codVnd: 100_000, slaHoursLeft: 4 },
        { id: "b", wardId: "w-clear", codVnd: 999_000, slaHoursLeft: 4 },
        { id: "c", wardId: "w1", codVnd: 50_000, slaHoursLeft: 1 },
      ],
      [flooded, clear]
    );
    expect(n).toBe(150_000);
  });

  it("flood-decision schema rejects propose_refund + auto_applied", () => {
    const bad = {
      orderId: "ORD-X",
      kind: "propose_refund",
      status: "auto_applied",
      requiresHuman: false,
    };
    expect(validateFloodDecision(bad)).toBe(false);
  });
});
