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
| Bookkeeper | Adv · Bookkeeper | Next App Router | Tailwind + shadcn/Radix · HITL Duyệt/Từ chối · ledger cards · `.next-build` race fix | `53c147f` / `e3f2956` | ☑ | ☑ | ☑ | ☑ | **Verified** |
| Shield | Adv · Shield | PWA + Vite `:5174` | Tailwind + a11y elder/family · SW notifs labeled · Care CTA | `52972a1` / `07a6072` | ☑ | ☑ | ☑ | ☑ | **Verified** |
| FloodOps | Adv · FloodOps | Next + Leaflet `:3011` | Tailwind + shadcn · map/orders/billing · `build:web` hygiene | `d2df47c` / `c93ea43` | ☑ | ☑ | ☑ | ☑ | **Verified** |

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
| Open CONDITIONAL | _none_ — R4 GATE MET · all CONDITIONAL cleared |

## Routed

Orchestrator → 4 Advs · 2026-09-26 ~19:03 ICT.


## Orchestrator verify log

- **BizMate** · tip `ddd5276` · 2026-09-26 19:08 ICT · web build / demo:offline / runtime 12/12 EXIT 0 · honesty OK · **Verified**

- **Bookkeeper** · tip `53c147f` (docs `e3f2956`) · 2026-09-26 19:16 ICT · build `.next-build` EXIT 0 · test 16/16 · demo EXIT 0 · :3010 HTTP 200 · REPORT Son · **Verified**

- **FloodOps** · tip `d2df47c` (fix `c93ea43`) · 2026-09-26 19:15 ICT · build:web EXIT 0 · test 24/24 · :3011 HTTP 200 · REPORT ×5 · **Verified**
