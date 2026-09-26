# STACK-REBUILD — domain-fit tech stacks

> Orchestrator · 2026-09-26 Asia/Saigon · Source: **Pstack / User P0**  
> Goal: rebuild 4 apps with **domain-fit** stacks (not one shared TS CLI shape).  
> Prior rounds (Tech R1 · Domain · Business R2 · Hands-on R3) stay on tip `fd56e9a` as baseline; this is a **new track**.

## Honesty (non-negotiable)

- No fake live SPX / tax authority / payment gateway.
- Sandbox / stub / fixture **labeled** in UI + CLI.
- Keep `@bizmate/contracts` + `@bizmate/billing` where shared money/seat semantics apply.

## Target stacks (implement unless blocked)

| App | Domain | Target stack | Keep / migrate |
|-----|--------|--------------|----------------|
| **Bookkeeper** | Deep Domain kế toán | Next.js (App Router) + tRPC or API routes + SQLite (Prisma **or** better-sqlite3) ledger; server actions for HITL approve; voice→ledger offline-first | `@bizmate/contracts` + billing; demos/tests EXIT 0 |
| **Shield** | Elder anti-scam | React Native / Expo (mobile-first family alert) **OR** PWA + Service Worker; rule engine in TS; optional on-device ML stub labeled fixture; local notifications | Rule/blacklist verdicts; billing Care subscribe honesty |
| **FloodOps** | Logistics ops | Next.js ops dashboard + map (Leaflet) + event-driven Node worker; JSONL and/or SQLite order state; COD≠invoice honesty; wire billing seats | Pricing VND · HUMAN+COD escalate · audit |
| **BizMate** (mate/judge/em/runtime/web) | Agent CO stack | Keep TS monorepo core; web = Vite **or** Next for story UI; runtime deterministic Node; mate CLI evolve; shared `packages/{contracts,billing,core}` | EM money HITL · demo:offline who-pays · audit JSONL |

## Protocol (per Adv)

1. Rewrite under `apps/<app>` with chosen stack (document pick if OR).
2. Migrate demos + tests; update BUSINESS / runbook docs.
3. Prove: **demo EXIT 0** + **tests EXIT 0** (cite commands + tip SHA).
4. Push tip → ping **Orchestrator** with prove packet path.
5. Orchestrator updates matrix below → when **4/4 green**, brief **Judging Room** for stack-fit glance (not full R1 re-open unless demos break).

## Status matrix

| App | Adv | Stack chosen | Tip SHA | Demo | Tests | Docs | Status |
|-----|-----|--------------|---------|------|-------|------|--------|
| Bookkeeper | Adv · Bookkeeper | **Next App Router + SQLite** (chosen; tRPC/API) | `fd56e9a` baseline | — | — | — | **In progress** |
| Shield | Adv · Shield | **PWA + Service Worker (+ Vite)** | `d751cef` | EXIT 0 | EXIT 0 | `SHIELD-STACK.md` | **Done** (Adv claim) |
| FloodOps | Adv · FloodOps | **Next + Leaflet + Node worker** (chosen) | `fd56e9a` baseline | — | — | — | **In progress** |
| BizMate | Adv · BizMate | **Vite + TS monorepo** (not Next) | `124e0f7` | EXIT 0 | EXIT 0 | `docs/review/BIZMATE-STACK.md` | **Done** (Adv claim) |

## Routed

Orchestrator → 4 Advs · 2026-09-26 ~18:52 ICT · baseline tip `fd56e9a` · R3 GATE MET closed separately.

## Judging

_Stand by until 4/4 green._ Then Judging Room: stack-fit / demo clarity glance; Tech R1 scores not auto-invalidated.

