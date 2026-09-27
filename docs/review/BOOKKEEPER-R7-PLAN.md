# BOOKKEEPER-R7-PLAN — AI-OPS P0 polish

> App: `apps/bookkeeper` · port `:3010` · baseline tip `45252f0`  
> Rubric: [ROUND-7-AI-OPS](./ROUND-7-AI-OPS.md) · [AI-OPS-REQUIREMENTS](../product/AI-OPS-REQUIREMENTS.md)  
> Scope: AiLedgerProposer live gate + safe fallback · pitch honesty · vitest trust boundary.  
> Out of scope: Mate web AI badges · other apps · rewriting R1–R6 docs.

## P0 → files

| P0 | Gap vs seed `45252f0` | Files |
|----|----------------------|-------|
| **A4 Live hook readiness** | Live class exists but success path is silent; no `fallbackUsed`; no env/docs for `BIZMATE_MODE=live` | `src/lib/ai-ledger-proposer.ts` |
| **A2 Trust boundary** | Tests cover offline propose + HITL; need explicit lock that AI never owns 1B/YTD/tax and money stays `@bizmate/core` | `src/__tests__/ai-ledger-proposer.test.ts` |
| **A3 Offline stub honesty** | UI hardcodes “AI đề xuất”; session does not surface `meta.labelVi` / classification note | `src/lib/session.ts` · `src/components/BookkeeperScreen.tsx` |
| **A5 Product clarity** | Business brief thin on live gate + “never invent tax/payment”; README still says “regex stub” without AI-OPS links | `docs/product/business/bookkeeper.md` · `apps/bookkeeper/README.md` |
| **A1 Presence** | Already in agent ingest + UI badges (seed) — keep; wire honesty label from proposer | (same UI/session) |

## Trust pattern (lock)

```
AI propose (offline_stub | live→fallback) → Ajv + rules (totals / 1B) → human Duyệt
```

- `BIZMATE_MODE=live` → `LiveAiLedgerProposer`; else `OfflineAiLedgerProposer`.
- Live provider not wired → catch → labeled offline_stub (`fallbackUsed: true`). Never invent tax, payment, YTD, or model traffic.
- 1B / `crossesExemption` / totals = `@bizmate/core` + `rules.ts` only.

## Prove

1. `npm test -w @bizmate/bookkeeper` (incl. trust-boundary cases)
2. `npm run build -w @bizmate/bookkeeper`
3. `npm run start -w @bizmate/bookkeeper` → `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3010` → **200**

## Deliverables

- This PLAN
- Implementation tip (bookkeeper + honesty docs only)
- `docs/review/BOOKKEEPER-R7-REPORT.md` with tip SHA + prove exits
