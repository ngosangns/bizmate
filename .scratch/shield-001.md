# shield-001 — Domain Kyle-S* / Son-S* (post 13cde1b)

## What to build
Finish Shield pitch craft after S1–S4 + Sid/Lee/TA: clean STEP lines (💬 only), `--once` CLI, live STEP pills, `detector: fixture` above-the-fold, scratch evidence card, no Mate-codegen claim.

## Owner
runtime (Shield) · family B2C payer · AFK demo

## Goal
30s backup demo: elder sees one plain VN sentence per message; machine `reasons[]` stay in AUDIT; honesty that deepfake = fixture / rule engine (not Mate codegen).

## Trust boundary (rules, not LLM)
- Verdict = blacklist + SCRIPT_PATTERNS + meta stubs (`qrBlacklisted`, `deepfakeScore` fixture) — **deterministic TypeScript**.
- No LLM on block/allow path. `explanationDraftSource` = `"template"`.
- Codex leverage = `shield-verdict` contract + audit (`blacklistVersion` / hash) — **not** Mate generating Shield policy in this demo.

## Acceptance checklist
- [x] Kyle-S1 (P0): per STEP = icon + pill + 💬 one elder sentence; `reasons[]` only in AUDIT SUMMARY
- [x] Kyle-S2 (P1): `npm run demo -w @bizmate/shield -- --once` skips RESET REPLAY; default keeps reset
- [x] Kyle-S3 (P1): `STEP k/N · action` + live allow/flag/block counts
- [x] Son-S1 (P1): `detector: fixture` above-the-fold in demo header (+ m2 deepfake line)
- [x] Son-S2 (P1): this card `.scratch/shield-001.md`
- [x] Son-S3 (P2): README + demo ENGINE line — rule engine + fixture score; **do not claim Mate codegen**
- [x] Do not regress S1–S4 / Sid / Lee / TA (opener, shadowUntil, buyer tip, FP SLA, AUDIT version/hash)
- [x] `npm run test -w @bizmate/shield` + `demo:shield` + `--once` EXIT 0

## Self-review (3 lines)
1. Acceptance: Kyle-S1/S2/S3 + Son-S1/S2/S3 mapped to `demo.ts` / README / this scratch.
2. Diff review: only demo surface + docs; engine verdict rules unchanged from `13cde1b`.
3. Stub remaining: deepfake = fixture meta; no live SMS/Zalo/QR; in-memory audit only.

## Blocked by
- none (base: `13cde1b`)

## HITL vs AFK
- Mode: AFK for rules demo; HITL = human override path (scripted “Con gái Hương”)

## Merge cadence
- Branch: shield-only commit on main — no force-push
- Reviewer: Adv · Shield → Review Orchestrator
- Done: tests + `demo:shield` + `demo -- --once` exit 0

## Notes
- Verdict schema: `packages/contracts/schemas/shield-verdict.v0.1.schema.json`
- Blacklist version + hash only in AUDIT (TA-S3 / Lee-S1)
- False-positive → human override + FP SLA line (Lee-S3)
- Optional 60s Codex story: contracts/audit are the white-box proof; runtime stays pure rules
