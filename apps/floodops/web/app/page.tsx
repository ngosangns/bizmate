import FloodMap from "../components/FloodMap";
import OrdersTable from "../components/OrdersTable";
import BillingPanel from "../components/BillingPanel";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
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
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Card className="border-warn bg-[#3a2f0f]">
          <CardContent className="pt-1 text-warn">
            <strong className="text-[#fff3c4]">Missing fixture</strong> — không
            tìm thấy <code>fixtures/hcm-flood-day.json</code>.
          </CardContent>
        </Card>
      </div>
    );
  }

  const atRisk = codAtRiskFromState(state);
  const human = state.actions.filter((a) => a.requiresHuman).length;
  const auto = state.actions.length - human;
  const floodedN = state.wards.filter((w) => w.status === "flooded").length;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-12 pt-5">
      <header className="mb-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <h1 className="m-0 text-2xl font-semibold tracking-tight">
          🌧️ FloodOps · Ops Dashboard
        </h1>
        <span className="text-sm text-muted">
          {state.city} · wave <code>{state.waveId}</code> · updated{" "}
          {state.updatedAt}
        </span>
      </header>

      <Card className="mb-4 border-warn bg-[#3a2f0f] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="warn">SANDBOX</Badge>
          <Badge variant="warn">STUB</Badge>
          <Badge variant="muted">COD ≠ invoice</Badge>
        </div>
        <p className="mb-0 mt-2 text-sm text-warn">
          <strong className="text-[#fff3c4]">SANDBOX / STUB</strong> —{" "}
          {state.honestyBanner}
        </p>
        <p className="mb-0 mt-1 text-sm text-[#c9b87a]">
          COD ≠ invoice · no live SPX / Shopee Express API · analogy last-mile
          only · billing = <code>offline_stub</code>
        </p>
      </Card>

      <div className="mb-4 flex flex-wrap gap-3">
        <Card className="min-w-[160px] flex-1 p-3">
          <div className="text-xs text-muted">COD at-risk (fixture)</div>
          <div className="text-lg font-semibold tabular-nums">{vnd(atRisk)}</div>
          <div className="text-xs text-muted">≠ product invoice</div>
        </Card>
        <Card className="min-w-[160px] flex-1 p-3">
          <div className="text-xs text-muted">Wards flooded</div>
          <div className="text-lg font-semibold">
            {floodedN}/{state.wards.length}
          </div>
        </Card>
        <Card className="min-w-[160px] flex-1 p-3">
          <div className="text-xs text-muted">Actions</div>
          <div className="text-lg font-semibold">
            {state.actions.length || "—"}{" "}
            <span className="text-sm font-normal text-muted">
              · HUMAN {human} · AUTO {auto}
            </span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Bản đồ phường · HCMC wards</CardTitle>
            <CardDescription>
              Leaflet fixture pins — không live GPS / SPX tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FloodMap wards={state.wards} wardGeo={state.wardGeo} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing seats · §④</CardTitle>
            <CardDescription>
              <code>@bizmate/billing</code> · offline_stub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BillingPanel plans={plans} checkout={checkout} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Orders · HUMAN + COD</CardTitle>
          <CardDescription>
            COD VND · HUMAN badge trước AUTO · refund cao luôn needs human
          </CardDescription>
        </CardHeader>
        <Separator className="mb-3" />
        <CardContent>
          <OrdersTable
            orders={state.orders}
            actions={state.actions}
            wards={state.wards}
          />
        </CardContent>
      </Card>

      <p className="mt-5 text-sm text-muted">
        Engine: deterministic TS <code>replanOrder</code> / <code>runWave</code>{" "}
        · worker ghi <code>data/orders.json</code> +{" "}
        <code>.audit/wave.jsonl</code> · demo CLI vẫn{" "}
        <code>npm run demo:floodops</code>.
      </p>
    </div>
  );
}
