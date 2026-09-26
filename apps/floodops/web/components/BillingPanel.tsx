import type { CheckoutResult, Plan } from "@bizmate/billing";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";

interface Props {
  plans: Plan[];
  checkout: CheckoutResult;
}

export default function BillingPanel({ plans, checkout }: Props) {
  return (
    <div className="space-y-3">
      <p className="m-0 text-sm text-muted">
        §④ Seats từ <code>@bizmate/billing</code> ·{" "}
        <code>listPlans(&quot;floodops&quot;)</code> +{" "}
        <code>createCheckout(offline_stub)</code>
      </p>
      <div className="grid gap-2.5">
        {plans.map((p) => (
          <Card key={p.id} className="border-border bg-[#121a26] p-3 shadow-none">
            <div className="flex flex-wrap items-center gap-2">
              <strong>{p.nameVi}</strong>
              <Badge variant="muted">{p.id}</Badge>
            </div>
            <div className="mt-1 font-semibold text-white">{p.priceDisplay}</div>
            <div className="mt-1 text-xs text-muted">{p.honestyNote}</div>
          </Card>
        ))}
      </div>

      <Separator />

      <h3 className="m-0 text-sm font-semibold text-muted">Checkout stub</h3>
      <Card className="border-warn bg-[#3a2f0f] p-3">
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          <Badge variant="warn">SANDBOX</Badge>
          <Badge variant="warn">offline_stub</Badge>
        </div>
        <strong className="text-[#fff3c4]">{checkout.honestyBanner}</strong>
        <div className="mt-1.5 text-xs text-[#c9b87a]">
          ok={String(checkout.ok)} · session={checkout.sessionId} · stub=
          {String(checkout.stub)}
          {checkout.costCenter ? ` · CC=${checkout.costCenter}` : ""}
        </div>
        <div className="mt-1 text-xs text-[#c9b87a]">{checkout.detail}</div>
      </Card>
      <p className="m-0 text-sm text-muted">
        Who pays: ops org / Express-analog internal budget — not live SPX pay.
        COD at-risk is avoidance metric, not the product invoice.
      </p>
    </div>
  );
}
