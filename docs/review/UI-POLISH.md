# UI-POLISH — shadcn / Tailwind / Radix (P0)

> Orchestrator · 2026-09-26 Asia/Saigon · Source: **Pstack / User P0**  
> Goal: polish UI on all 4 rebuilt apps (shadcn/ui · Tailwind · Radix primitives as fit).  
> After tip green → fold into **ROUND-4 hands-on re-use**.  
> **ENV GREEN** (`687e652`) — full UI walk open; fold polish tips into R4 re-use.

## Honesty

Keep stub/sandbox labels. No fake live SPX / tax / payment. Shared `@bizmate/contracts` + `@bizmate/billing`.

## Tracking matrix (4 Advs)

| App | Adv | Current UI | Polish target | Tip SHA | Demo | Build | Tests | Docs | Status |
|-----|-----|------------|---------------|---------|------|-------|-------|------|--------|
| BizMate | Adv · BizMate | Vite SPA `apps/web` | Tailwind + shadcn/Radix · story + billing **Giá** panel | `ddd5276` / `d2ca575` | ☑ | ☑ | ☑ | ☑ | **Verified** |
| Bookkeeper | Adv · Bookkeeper | Next App Router | Tailwind + shadcn/Radix · HITL Duyệt/Từ chối · ledger cards · `.next-build` race fix | `53c147f` | ☑ | ☑ | ☑ | ☑ | **Done (Adv claim)** |
| Shield | Adv · Shield | PWA + Vite `:5174` | Tailwind + a11y elder/family · SW notifs labeled · Care CTA | `52972a1` | ☑ | ☑ | ☑ | ☑ | **Done (Adv claim)** |
| FloodOps | Adv · FloodOps | Next + Leaflet `:3011` | Tailwind + shadcn · map/orders/billing · **fix Lee+Sid R4 `build:web`** first | — | ☐ | ☐ | ☐ | ☐ | **In progress** (+ R4 CONDITIONAL) |

**Status legend:** Routed → In progress → Prove filed → **Verified** (Orchestrator) → Folded into R4 re-use.

## Protocol (per Adv)

1. Polish under `apps/<app>` (document stack picks in prove note).
2. Prove: **demo EXIT 0** + **build EXIT 0** + **tests EXIT 0**.
3. Push tip → ping Orchestrator + prove path under `docs/review/`.
4. If ROUND-4 CONDITIONAL open for your app: **fix first**, then **REPORT** judges (before/after · tip · re-use) — template trong `ROUND-4-FEEDBACK-FORM.md` § Adv REPORT.
5. Orchestrator folds green tips into R4 re-use after ENV green (hoặc CLI/demo path như hiện tại).

## R4 linkage

| Item | Path |
|------|------|
| Hands-on protocol | `ROUND-4-HANDS-ON.md` |
| Rubric / checklists / form | `ROUND-4-RUBRIC.md` · `ROUND-4-CHECKLISTS.md` · `ROUND-4-FEEDBACK-FORM.md` |
| Env gate | `ROUND-4-ENV.md` |
| Open CONDITIONAL | FloodOps · Lee + Sidharth · `build:web` packaging |

## Routed

Orchestrator → 4 Advs · 2026-09-26 ~19:03 ICT.


## Orchestrator verify log

- **BizMate** · tip `ddd5276` · 2026-09-26 19:08 ICT · web build / demo:offline / runtime 12/12 EXIT 0 · honesty OK · **Verified**

- **Bookkeeper** · tip `53c147f` · 2026-09-26 Asia/Saigon · build/test/demo EXIT 0 · curl :3010 HTTP 200 · Son R4 REPORT filed · **Adv claim** (await Orchestrator verify)
