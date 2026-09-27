"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Order, ProposedAction, Ward } from "../lib/load-state";
import { adviseReplan, type OpsAdvice } from "../../src/ai-ops-advisor";
import type { ProposedAction as EngineAction, Order as EngineOrder, Ward as EngineWard } from "../../src/engine";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

function vnd(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

/** Spaced EN · VN so DOM text is never glued (Lee: Hòa Hưngflooded / floodedflood). */
function wardStatusLabel(status: Ward["status"]): string {
  return status === "flooded" ? "flooded · ngập" : "clear · khô";
}

function aiAdviceFor(
  a: ProposedAction,
  o: Order,
  w: Ward
): OpsAdvice {
  return adviseReplan(
    a as EngineAction,
    o as EngineOrder,
    w as EngineWard
  );
}


interface Props {
  orders: Order[];
  actions: ProposedAction[];
  wards: Ward[];
}

export default function OrdersTable({ orders, actions, wards }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [rows, setRows] = useState<ProposedAction[]>(actions);

  useEffect(() => {
    setRows(actions);
  }, [actions]);

  const byId = new Map(rows.map((a) => [a.orderId, a]));
  const wardName = new Map(wards.map((w) => [w.id, w]));

  async function hitl(
    orderId: string,
    verdict: "approve" | "reject"
  ): Promise<void> {
    setBusyId(orderId);
    setFlash(null);
    try {
      const res = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          verdict,
          actor: "ops-ui-demo",
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        action?: ProposedAction;
      };
      if (!res.ok || !data.ok || !data.action) {
        setFlash(data.error ?? `HITL failed (${res.status})`);
        return;
      }
      setRows((prev) =>
        prev.map((a) => (a.orderId === orderId ? { ...a, ...data.action! } : a))
      );
      setFlash(
        verdict === "approve"
          ? `✓ ${orderId} → ${data.action.status}`
          : `⛔ ${orderId} từ chối → ${data.action.status}`
      );
      startTransition(() => router.refresh());
    } catch (e) {
      setFlash(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted">
        Chưa có actions — chạy <code>npm run worker -w @bizmate/floodops</code>{" "}
        để replan và ghi <code>data/orders.json</code>.
      </p>
    );
  }

  const sorted = [...orders].sort((a, b) => {
    const ha = byId.get(a.id)?.requiresHuman ? 0 : 1;
    const hb = byId.get(b.id)?.requiresHuman ? 0 : 1;
    return ha - hb;
  });

  return (
    <div className="overflow-x-auto">
      {flash && (
        <p className="mb-2 text-sm text-warn" role="status">
          {flash}
        </p>
      )}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-muted">
            <th className="border-b border-border px-2 py-2 font-medium">Order</th>
            <th className="border-b border-border px-2 py-2 font-medium">Ward</th>
            <th className="border-b border-border px-2 py-2 font-medium">COD (VND)</th>
            <th className="border-b border-border px-2 py-2 font-medium">SLA</th>
            <th className="border-b border-border px-2 py-2 font-medium">Action</th>
            <th className="border-b border-border px-2 py-2 font-medium">Gate</th>
            <th className="border-b border-border px-2 py-2 font-medium">Status</th>
            <th className="border-b border-border px-2 py-2 font-medium">HITL</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((o) => {
            const a = byId.get(o.id);
            const w = wardName.get(o.wardId);
            const needsHitl =
              !!a && a.requiresHuman && a.status === "awaiting_human";
            const isRefund = a?.kind === "propose_refund";
            const rowBusy = busyId === o.id || pending;

            return (
              <tr key={o.id} className="align-top">
                <td className="border-b border-border px-2 py-2">
                  <code>{o.id}</code>
                </td>
                <td className="border-b border-border px-2 py-2">
                  <span>{w?.name ?? o.wardId}</span>
                  {w && (
                    <>
                      {" "}
                      <Badge
                        variant={w.status === "flooded" ? "flood" : "clear"}
                      >
                        {wardStatusLabel(w.status)}
                      </Badge>
                    </>
                  )}
                </td>
                <td className="border-b border-border px-2 py-2 font-medium tabular-nums whitespace-nowrap">
                  {vnd(o.codVnd)}
                </td>
                <td className="border-b border-border px-2 py-2">
                  {o.slaHoursLeft}h
                </td>
                <td className="border-b border-border px-2 py-2">
                  {a?.kind ?? "—"}
                  {a?.reason && (
                    <div className="mt-0.5 max-w-[280px] text-xs text-muted">
                      {a.reason}
                    </div>
                  )}
                  {a &&
                    (() => {
                      const w = wardName.get(o.wardId);
                      if (!w) return null;
                      const advice = aiAdviceFor(a, o, w);
                      return (
                        <div className="mt-1 max-w-[320px] rounded border border-dashed border-border px-1.5 py-1 text-[11px] text-muted">
                          <span className="font-medium text-ink">
                            AI advice · {advice.meta.labelVi}
                          </span>
                          <div className="mt-0.5">{advice.rationaleVi}</div>
                          {advice.alternateSuggestion ? (
                            <div className="mt-0.5 italic">
                              Gợi ý phụ: {advice.alternateSuggestion.kind} —{" "}
                              {advice.alternateSuggestion.whyVi}
                            </div>
                          ) : null}
                        </div>
                      );
                    })()}
                </td>
                <td className="border-b border-border px-2 py-2">
                  {a ? (
                    <Badge variant={a.requiresHuman ? "human" : "auto"}>
                      {a.requiresHuman ? "👤 HUMAN" : "🤖 AUTO"}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="border-b border-border px-2 py-2">
                  {a?.status ?? "—"}
                </td>
                <td className="border-b border-border px-2 py-2">
                  {needsHitl ? (
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="warn"
                        disabled={rowBusy}
                        onClick={() => void hitl(o.id, "approve")}
                        aria-label={
                          isRefund
                            ? `Duyệt hoàn ${o.id}`
                            : `Ops duyệt ${o.id}`
                        }
                      >
                        {isRefund ? "Duyệt hoàn" : "Ops duyệt"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={rowBusy}
                        onClick={() => void hitl(o.id, "reject")}
                        aria-label={`Từ chối ${o.id}`}
                      >
                        Từ chối
                      </Button>
                    </div>
                  ) : a?.status === "approved" ? (
                    <span className="text-xs text-[#9aecc0]">✓ đã duyệt</span>
                  ) : a?.reason?.includes("ops từ chối") ? (
                    <span className="text-xs text-muted">⛔ từ chối</span>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2.5 text-sm text-muted">
        COD trên bảng = giá trị thu hộ đơn (ops risk) —{" "}
        <strong className="text-warn">COD ≠ invoice / seat charge</strong>.
        Refund cao luôn HUMAN · Duyệt hoàn / Ops duyệt / Từ chối ghi audit JSONL
        (sandbox).
      </p>
    </div>
  );
}
