# DEVELOPMENT_RULES — barem → kỹ thuật → bằng chứng demo

| Tiêu chí BTC | Yêu cầu kỹ thuật | Bằng chứng demo |
|---|---|---|
| Problem framing | Domain brief trong `domains/*/brief.md`; pain VN (thuế khoán→kê khai) hoặc sales ops | Pitch 30s + README one-liner |
| Quality of build | Offline demo `npm run demo:offline`; contracts Ajv; tests | CLI demo + vitest green |
| Insight & originality | Evoloop-for-business: Mate evolves **white-box workflow code** | Show generation N→N+1 diff |
| Real-world value | Accounting threshold 1B VND + sales pipeline fixtures | Runtime prints ledger + threshold |
| Codex leverage | EM task queue + AGENTS.md constitution + parallel pillars | `.scratch/` issues + git history |
| Trust/safety | Propose→verify→decide; human approve before persist | Judge fail without approve step |

## MVP scope (locked)
- Domains: accounting + sales only
- Offline mode required; live LLM optional stub
- Demo loop: generate → judge → approve → run (one happy path)
- No live tax authority / real payments

## Acceptance by owner
| Owner | Deliverable | Done when |
|-------|-------------|-----------|
| Mate | Workflow JSON validates | `validateWorkflow` + evolve gen+1 |
| Judge | Verdict schema + Laya rules | Missing approve → fail |
| EM | Board + blockedBy | `em next` respects deps |
| Runtime | Deterministic handlers | Threshold test passes |
| Web | Offline UI | `vite build` succeeds |
