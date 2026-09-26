# Round 5 — Design / Layout / UI-UX / User Flows

> UX judging kit for hands-on review of the four product apps. Round 5 is a fresh design/layout/flow pass; R1–R4 content remains untouched.

## Scope

| App | Stack / port | Judge target |
|---|---|---|
| BizMate | Vite :5173 | Core business workflow, HITL money and who-pays states |
| Shield | PWA :5174 | Block/verdict experience and Care sandbox |
| Bookkeeper | Next :3010 | Reject → approve flow and 1B paywall |
| FloodOps | Next + Leaflet :3011 | Flood event, HUMAN + COD, and COD ≠ invoice |

Judges **MUST use the running apps hands-on** at the target ports and click through the checklist. Screenshots under `/workspace/screenshots/apps/` are optional reference only; they never replace a live interaction.

## Score axes (1–5 each)

Score each axis with an integer from 1 to 5. `TB` (total band) is the arithmetic mean of D1–D4.

| Axis | What to assess | 1 — weak | 3 — adequate | 5 — excellent |
|---|---|---|---|---|
| **D1 Visual design** | Hierarchy, type, color, spacing, consistency | Confusing hierarchy, inconsistent styling, or visibly broken presentation | Legible and usable, with noticeable inconsistency or polish gaps | Clear hierarchy, confident typography/color/spacing, cohesive across screens |
| **D2 Layout** | Structure, density, scan path at desktop 1280 | Cluttered, sparse, or obstructs the primary task; scan path breaks | Task is findable but density or grouping causes friction | Purposeful structure and density; fast, obvious scan path at 1280px |
| **D3 UI patterns** | Controls, empty/error/loading states, feedback | Missing, misleading, or broken states and controls | Common states work but feedback or edge handling is uneven | Predictable controls and complete, timely empty/error/loading/feedback states |
| **D4 User flows** | Happy-path E2E, friction, dead ends, recoverability | Critical path breaks, dead-ends, or cannot recover | Happy path works with friction or a recoverable weak edge | Smooth E2E path, minimal friction, clear recovery and no dead ends |

## App verdict and gate

Apply the rules in precedence order:

- **FAIL** if any score is `1`, a critical flow is broken, or `TB < 3`.
- **CONDITIONAL** if not FAIL and `TB` is `3–3.9` or `D4 = 3`.
- **PASS** if `TB ≥ 4`, `D4 ≥ 4`, and no score is `1`.

The Round 5 gate is **4 apps PASS · 0 FAIL**. A CONDITIONAL app is not a PASS and must return through the loop.

## Review loop

```text
checklist → feedback form → Adv REPORT → Orchestrator verify → judge re-score
```

1. Run the relevant happy path and edge checks in `ROUND-5-CHECKLISTS.md`.
2. Complete `ROUND-5-FEEDBACK-FORM.md`, including scores, notes, verdict, and evidence paths.
3. For a CONDITIONAL/FAIL, the **Adv pings Orchestrator only**; the Adv fixes and files the REPORT.
4. Orchestrator verifies the claimed change and tip SHA.
5. Judge repeats the affected flow and re-scores; repeat until the gate is met.

## Protocol guardrails

- Adv communications route through **Orchestrator only**; do not direct-message judges or bypass the routing record.
- Billing, pricing, and payment behavior must be labeled honestly as sandbox/demo/stub where applicable. Never present sandbox billing as live money movement.
- Keep **R1–R4 untouched**. Round 5 may link back to prior context but must not rewrite prior-round gates or evidence.

Prior context: [Round 4 hands-on kit](./ROUND-4-HANDS-ON.md).
