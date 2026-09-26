import type { Order, ProposedAction, Ward } from "../lib/load-state";

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
      <p className="muted">
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
    <div style={{ overflowX: "auto" }}>
      <table className="orders">
        <thead>
          <tr>
            <th>Order</th>
            <th>Ward</th>
            <th>COD (VND)</th>
            <th>SLA</th>
            <th>Action</th>
            <th>Gate</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((o) => {
            const a = byId.get(o.id);
            const w = wardName.get(o.wardId);
            return (
              <tr key={o.id}>
                <td>
                  <code>{o.id}</code>
                </td>
                <td>
                  {w?.name ?? o.wardId}{" "}
                  {w && (
                    <span
                      className={`badge ${w.status === "flooded" ? "flood" : "clear"}`}
                    >
                      {w.status}
                    </span>
                  )}
                </td>
                <td className="cod">{vnd(o.codVnd)}</td>
                <td>{o.slaHoursLeft}h</td>
                <td>
                  {a?.kind ?? "—"}
                  {a?.reason && (
                    <div className="muted" style={{ maxWidth: 280 }}>
                      {a.reason}
                    </div>
                  )}
                </td>
                <td>
                  {a ? (
                    <span
                      className={`badge ${a.requiresHuman ? "human" : "auto"}`}
                    >
                      {a.requiresHuman ? "👤 HUMAN" : "🤖 AUTO"}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{a?.status ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="muted" style={{ marginTop: "0.6rem" }}>
        COD trên bảng = giá trị thu hộ đơn (ops risk) —{" "}
        <strong>COD ≠ invoice / seat charge</strong>. Refund cao luôn HUMAN.
      </p>
    </div>
  );
}
