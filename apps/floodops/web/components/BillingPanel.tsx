import type { CheckoutResult, Plan } from "@bizmate/billing";

interface Props {
  plans: Plan[];
  checkout: CheckoutResult;
}

export default function BillingPanel({ plans, checkout }: Props) {
  return (
    <div>
      <p className="muted">
        §④ Seats từ <code>@bizmate/billing</code> ·{" "}
        <code>listPlans(&quot;floodops&quot;)</code> +{" "}
        <code>createCheckout(offline_stub)</code>
      </p>
      <div className="plans">
        {plans.map((p) => (
          <div key={p.id} className="plan-card">
            <div>
              <strong>{p.nameVi}</strong> · <code>{p.id}</code>
            </div>
            <div className="price">{p.priceDisplay}</div>
            <div className="muted">{p.honestyNote}</div>
          </div>
        ))}
      </div>
      <h3>Checkout stub</h3>
      <div className="banner" style={{ marginTop: "0.5rem" }}>
        <strong>{checkout.honestyBanner}</strong>
        <div className="muted" style={{ marginTop: "0.35rem", color: "#c9b87a" }}>
          ok={String(checkout.ok)} · session={checkout.sessionId} · stub=
          {String(checkout.stub)}
          {checkout.costCenter ? ` · CC=${checkout.costCenter}` : ""}
        </div>
        <div className="muted" style={{ color: "#c9b87a" }}>
          {checkout.detail}
        </div>
      </div>
      <p className="muted">
        Who pays: ops org / Express-analog internal budget — not live SPX pay.
        COD at-risk is avoidance metric, not the product invoice.
      </p>
    </div>
  );
}
