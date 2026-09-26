# Codex evidence — BizMate (Son / Lee B4)

> Counts from `git` / files on disk at write time. **Do not invent.**

| Evidence | Count / note |
|----------|----------------|
| `git rev-list --count HEAD` | **8** commits on `main` |
| `.scratch/*.md` task cards | **5** (BizMate core: `001-template` … `004-runtime`; plus peer cards) |
| EM `apps/em/board.json` | **10** tasks — **7 landed (done)** / **3 planned HITL/evolve** (`em-001, mate-001, mate-002, judge-001, judge-002, runtime-001, web-001` vs `human-001, mate-003, human-002`) |
| Constitution | `AGENTS.md` pillars + AI proposes → code verifies → human decides |
| Contracts | Ajv schemas via `npm run validate:contracts` |
| Parallel ownership | workspaces `apps/mate|judge|em|runtime|web` + `packages/contracts|core` |

## Recent BizMate-relevant commits (oneline)

```
ece5923 docs(floodops): FLOODOPS-FIX.md for Round-1 CONDITIONAL clear
ce0b82e fix(floodops): clear Round-1 CONDITIONAL — SLA human, audit JSONL, schema
8297752 docs(bizmate): Lee R1b — stage hero accounting/Bà Lan only
cd03ae2 fix(bizmate): Round-1 CONDITIONAL — audit JSONL, story web, CLI args
edee3ab fix(shield): clear Round-1 CONDITIONAL — honesty, version, shadow, demo reset
77b8622 fix(bookkeeper): demo PASS — verified approve + JSON fixture + 1B hero
3ed08f7 docs: add VN/SG/TW judge roster and mock persona packs
303584d feat: Biz Mate monorepo + SEAC VN hackathon candidates
```

## 60s stage script

1. Show `AGENTS.md` trust line.  
2. Point at `.scratch/002`–`004` + EM board = parallel Codex tasks.  
3. `git log --oneline` = proof of iterate-after-judge (e.g. `cd03ae2` audit/web).  
4. Live: `npm run demo:offline` deny→Duyệt→1B + AUDIT JSONL.


## Landed vs planned (Son R1d — after board sync)

| Bucket | N | IDs |
|--------|--:|-----|
| **Landed / done** | 7 | em-001, mate-001, mate-002, judge-001, judge-002, runtime-001, web-001 |
| **Still todo (HITL / evolve)** | 3 | human-001, mate-003, human-002 |

**60s line:** “7 Codex pillar tasks landed offline (mate/judge/runtime/web); 3 remain HITL publish + evolve. Stub fail: live SLM = heuristics.”
