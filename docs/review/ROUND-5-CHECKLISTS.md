# Round 5 UX checklists

Use these checklists during a live hands-on session at the app's target port. Tick every step, record friction in the field, and link screenshots/logs only as supporting evidence.

## BizMate — Vite :5173

### Happy path

- [ ] Open the app at `:5173` and confirm the primary navigation and first-call-to-action are understandable.
- [ ] Start the main business/customer workflow from the landing/dashboard screen.
- [ ] Enter valid data and continue through each step without using a direct URL shortcut.
- [ ] Reach the HITL money step and identify who pays, who receives, and what action is pending.
- [ ] Complete/confirm the workflow and verify success feedback plus the resulting state in the UI.
- [ ] Open the pricing CTA and verify the destination, plan/value explanation, and billing label.

### Edge and recovery

- [ ] Empty state: open a new/empty list or workspace and verify useful guidance and a next action.
- [ ] Error state: submit invalid/incomplete data or exercise the available failure path; verify readable feedback and recovery.
- [ ] HITL/money edge: verify pending/review states explain responsibility and do not imply a live charge.
- [ ] Pricing CTA: confirm sandbox/demo billing is labeled honestly and no deceptive paywall is shown.

**Flow friction notes:**

> _Where did the scan path slow down, what was unclear, and could you recover without starting over?_

______________________________________________________________________________

## Shield — PWA :5174

### Happy path

- [ ] Open the PWA at `:5174`; identify status, primary action, and navigation without instruction.
- [ ] Submit or inspect a normal item/request and follow it through the expected safe/allowed path.
- [ ] Trigger or open the BLOCK flow and inspect the verdict card (reason, severity/status, and next action).
- [ ] Use the verdict card action to recover, dismiss, or continue; confirm the result is visible.
- [ ] Open Care/sandbox and verify the boundary between sandbox behavior and live service.
- [ ] Open the pricing CTA and verify the plan/value path and honest billing label.

### Edge and recovery

- [ ] Empty state: verify an empty queue/list explains what to do next.
- [ ] Error state: exercise an invalid/unavailable action and confirm actionable feedback.
- [ ] Verdict cards: check allowed, blocked, and uncertain/review presentation for clarity and consistent actions.
- [ ] Pricing CTA: confirm sandbox/demo billing is not presented as a completed live transaction.

**Flow friction notes:**

> _Where did the verdict, recovery action, or CTA create hesitation or a dead end?_

______________________________________________________________________________

## Bookkeeper — Next :3010

### Happy path

- [ ] Open the Bookkeeper UI at `:3010` and identify the current queue/task and primary action.
- [ ] Create or open a bookkeeping item with the provided/demo data.
- [ ] Review the item and click through **Từ chối (Reject)**; confirm the reason/input is visible.
- [ ] Recover from rejection by editing or revisiting the item, then click **Duyệt (Approve)**.
- [ ] Verify the approved state, confirmation feedback, and next available action.
- [ ] Open the 1B/pricing CTA and confirm the value, destination, and billing mode are clear.

### Edge and recovery

- [ ] Empty state: verify an empty queue explains how to add or find work.
- [ ] Error state: submit missing/invalid data or use the available failure path; verify inline feedback and recovery.
- [ ] Reject/HITL: ensure reject requires/retains an understandable reason and the item can be recovered without a dead end.
- [ ] Pricing CTA: verify 1B/paywall behavior is clearly labeled sandbox/demo where it is not live billing.

**Flow friction notes:**

> _Record ambiguity around approve/reject, retained context, error recovery, density, or the paywall._

______________________________________________________________________________

## FloodOps — Next + Leaflet :3011

### Happy path

- [ ] Open the map/dashboard at `:3011` and identify the map, event status, legend, and primary action.
- [ ] Select or open a flood event and inspect location, severity, timing, and available response actions.
- [ ] Follow the event response flow through HUMAN review/confirmation where shown.
- [ ] Inspect the COD option and verify COD is explicitly distinct from an invoice.
- [ ] Complete/confirm the response and verify map/list feedback and the resulting state.
- [ ] Open the pricing CTA and verify value, destination, and honest sandbox/demo billing label.

### Edge and recovery

- [ ] Empty state: verify no-event/no-data presentation explains how to refresh, filter, or proceed.
- [ ] Error state: exercise unavailable map/data or an invalid response and verify recovery without a dead end.
- [ ] Flood event: inspect a normal and high-severity/event edge; confirm priority and next action are clear.
- [ ] Pricing CTA: confirm COD/demo billing is not represented as an invoice or live payment.

**Flow friction notes:**

> _Record map legibility, event-to-action friction, recovery, COD wording, and any dead end._

______________________________________________________________________________
