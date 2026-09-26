# Architecture

```
domains/*/brief.md ──▶ Mate (codegen / evolve)
                           │ workflow draft (TS + schema)
                           ▼
                      Judge (Laya rules + SLM)
                           │ verdict
                           ▼
                      Human approve
                           │
                           ▼
                   Workflow Registry
                           │
                           ▼
                      Runtime ──▶ Web demo UI
                           ▲
EM (task queue / ownership / merge) ── coordinates Mate+Judge+Runtime work
```

## Propose → Verify → Decide

| Layer | Who | Output |
|-------|-----|--------|
| Propose | Mate / LLM | Draft workflow AST or TS source |
| Verify | Contracts (Ajv) + Judge + rule engine | Pass/fail + findings |
| Decide | Human (or EM policy for low-risk) | Approve / reject / request changes |

## Offline first
`BIZMATE_MODE=offline` loads fixtures from `domains/*/fixtures` and uses rule-based judge. Live mode only adds LLM mutation/review.
