# `@bizmate/billing`

Shared **sandbox / stub** billing contract for BizMate · Bookkeeper · Shield · FloodOps.

**Never claims live payment.** Modes: `stripe_test` | `vn_sandbox` | `offline_stub`.

## Import (all Advs)

```ts
import {
  honestyBanner,
  listPlans,
  createCheckout,
  stubCharge,
  type BillingMode,
  type Plan,
  type CheckoutResult,
} from "@bizmate/billing";
```

1. Build once: `npm run build -w @bizmate/billing`
2. Depend: `"@bizmate/billing": "0.1.0"` in your app `package.json`
3. Always render `honestyBanner(mode)` (or `result.honestyBanner`) next to any checkout CTA

## API

| Fn | Returns |
|----|---------|
| `honestyBanner(mode)` | Vietnamese/EN string that **must** say sandbox/stub clearly |
| `listPlans(appId)` | Demo pricing tiers (fixtures) |
| `createCheckout({ appId, planId, mode })` | Stripe-test shaped session **or** labeled stub |
| `stubCharge({ appId, planId, ... })` | Offline chargeback / cost-center stub |

## Honesty

Every checkout/charge result includes `honestyBanner`. UI must show it — do not hide.
