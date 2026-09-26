import type { Order, ProposedAction, Ward } from "../lib/load-state";
import { Badge } from "./ui/badge";

function vnd(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

interface Props {
  orders: Order[];
  actions: ProposedAction[];
  wards: Ward[];
}

export default function OrdersTable({ orders, actions, wards }: Props) {
  const byId = new Map(actions.map((a) => [a.orderId, a]));
  const wardName = new Map(wards.map((w) => [w.id, w]));

  if (actions.length === 0) {
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
          </tr>
        </thead>
        <tbody>
          {sorted.map((o) => {
            const a = byId.get(o.id);
            const w = wardName.get(o.wardId);
            return (
              <tr key={o.id} className="align-top">
                <td className="border-b border-border px-2 py-2">
                  <code>{o.id}</code>
                </td>
                <td className="border-b border-border px-2 py-2">
                  <span className="mr-1.5">{w?.name ?? o.wardId}</span>
                  {w && (
                    <Badge variant={w.status === "flooded" ? "flood" : "clear"}>
                      {w.status}
                    </Badge>
                  )}
                </td>
                <td className="border-b border-border px-2 py-2 font-medium tabular-nums whitespace-nowrap">
                  {vnd(o.codVnd)}
                </td>
                <td className="border-b border-border px-2 py-2">{o.slaHoursLeft}h</td>
                <td className="border-b border-border px-2 py-2">
                  {a?.kind ?? "—"}
                  {a?.reason && (
                    <div className="mt-0.5 max-w-[280px] text-xs text-muted">
                      {a.reason}
                    </div>
                  )}
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
                <td className="border-b border-border px-2 py-2">{a?.status ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2.5 text-sm text-muted">
        COD trên bảng = giá trị thu hộ đơn (ops risk) —{" "}
        <strong className="text-warn">COD ≠ invoice / seat charge</strong>.
        Refund cao luôn HUMAN.
      </p>
    </div>
  );
}
