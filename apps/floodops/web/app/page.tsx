import FloodMap from "../components/FloodMap";
import OrdersTable from "../components/OrdersTable";
import BillingPanel from "../components/BillingPanel";
import {
  codAtRiskFromState,
  loadBillingSeats,
  loadWaveState,
} from "../lib/load-state";

export const dynamic = "force-dynamic";

function vnd(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

export default function OpsDashboardPage() {
  const state = loadWaveState();
  const { plans, checkout } = loadBillingSeats();

  if (!state) {
    return (
      <div className="layout">
        <div className="banner">
          <strong>Missing fixture</strong> — không tìm thấy{" "}
          <code>fixtures/hcm-flood-day.json</code>.
        </div>
      </div>
    );
  }

  const atRisk = codAtRiskFromState(state);
  const human = state.actions.filter((a) => a.requiresHuman).length;
  const auto = state.actions.length - human;
  const floodedN = state.wards.filter((w) => w.status === "flooded").length;

  return (
    <div className="layout">
      <header className="app-header">
        <h1>🌧️ FloodOps · Ops Dashboard</h1>
        <span className="meta">
          {state.city} · wave <code>{state.waveId}</code> · updated{" "}
          {state.updatedAt}
        </span>
      </header>

      <div className="banner">
        <strong>SANDBOX / STUB</strong> — {state.honestyBanner}
        <br />
        <span style={{ color: "#c9b87a" }}>
          COD ≠ invoice · no live SPX / Shopee Express API · analogy last-mile
          only · billing = <code>offline_stub</code>
        </span>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="label">COD at-risk (fixture)</div>
          <div className="value">{vnd(atRisk)}</div>
          <div className="muted">≠ product invoice</div>
        </div>
        <div className="stat">
          <div className="label">Wards flooded</div>
          <div className="value">
            {floodedN}/{state.wards.length}
          </div>
        </div>
        <div className="stat">
          <div className="label">Actions</div>
          <div className="value">
            {state.actions.length || "—"}{" "}
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              · HUMAN {human} · AUTO {auto}
            </span>
          </div>
        </div>
      </div>

      <div className="grid">
        <section className="panel">
          <h2>Bản đồ phường · HCMC wards</h2>
          <FloodMap wards={state.wards} wardGeo={state.wardGeo} />
        </section>

        <section className="panel">
          <h2>Billing seats · §④</h2>
          <BillingPanel plans={plans} checkout={checkout} />
        </section>
      </div>

      <section className="panel" style={{ marginTop: "1rem" }}>
        <h2>Orders · HUMAN + COD</h2>
        <OrdersTable
          orders={state.orders}
          actions={state.actions}
          wards={state.wards}
        />
      </section>

      <p className="muted" style={{ marginTop: "1.25rem" }}>
        Engine: deterministic TS <code>replanOrder</code> / <code>runWave</code>{" "}
        · worker ghi <code>data/orders.json</code> +{" "}
        <code>.audit/wave.jsonl</code> · demo CLI vẫn{" "}
        <code>npm run demo:floodops</code>.
      </p>
    </div>
  );
}
