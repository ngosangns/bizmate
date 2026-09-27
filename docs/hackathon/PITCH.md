# Pitch — BizMate (hackathon)

## Skeleton (6')

1. **Pain (45s)** — SME/tiểu thương cần app ops đáng tin; chat-LLM trên tiền thuế thì không audit được.
2. **Insight (45s)** — Evoloop thắng vì *white-box code*. Ta áp dụng cho nghiệp vụ: agent **viết** workflow, runtime chạy deterministic.
3. **Demo (3')** — Mate generate accounting → Judge (Laya+SLM) → human approve → Runtime ledger + ngưỡng 1 tỷ. (Parallel pillars: Bookkeeper / Shield / FloodOps — cùng trust pattern.)
4. **Trust (45s)** — AI proposes / code verifies / human decides. Số liệu không do model sinh. Offline stub mặc định; live OpenAI chỉ khi có key thật.
5. **Codex (45s)** — EM + parallel pillars + contracts-first; số task/subagent/commit.
6. **Ask (15s)** — Roadmap: thêm domain, SLM thật, registry multi-tenant.

## Pitch / demo pack (Round-7 polish)

| File | Use |
|------|-----|
| [`pitch/00-overview-90s.md`](./pitch/00-overview-90s.md) | 90s all 4 apps + trust |
| [`pitch/mate.md`](./pitch/mate.md) | Mate 60–90s + 3' demo |
| [`pitch/bookkeeper.md`](./pitch/bookkeeper.md) | Bookkeeper 60–90s + 3' demo |
| [`pitch/shield.md`](./pitch/shield.md) | Shield 60–90s + 3' demo |
| [`pitch/floodops.md`](./pitch/floodops.md) | FloodOps 60–90s + 3' demo |
| [`pitch/DEMO-DAY-RUNBOOK.md`](./pitch/DEMO-DAY-RUNBOOK.md) | Ports 5173/5174/3010/3011 · offline first · optional live |
| [`ai-ops/SOFT-A4-LIVE-HOOKS.md`](./ai-ops/SOFT-A4-LIVE-HOOKS.md) | Soft A4 env + honesty |

Older cards (kept): `pitch/bizmate-week2-pilot.md`, `bizmate-wtp-slide.md`, `bizmate-partnership-20s.md`.
