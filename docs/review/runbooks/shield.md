# Shield Round 1 / STACK-REBUILD runbook (from Adv · Shield)

## Stack
**PWA + Service Worker (+ Vite)** — not Expo. Rationale: CI prove `demo`+`test` EXIT 0 in Node without simulator; family home-screen install + local SW notifications.

## Offline CLI prove (judges / Orchestrator)
```
cd /workspace/bizmate
npm run demo:shield
npm run test -w @bizmate/shield
npm run build -w @bizmate/shield   # tsc + vite PWA
```

## PWA (family UI)
```
npm run dev -w @bizmate/shield      # Vite :5174
npm run preview -w @bizmate/shield  # after build
```

## Key paths
- apps/shield/src/engine.ts — judgeMessage (shared rule core)
- apps/shield/src/blacklist.ts
- apps/shield/src/detector-stub.ts — labeled fixture ML stub
- apps/shield/src/notify.ts — local SW notify payloads
- apps/shield/src/demo.ts — CLI scam-inbox + billing
- apps/shield/web/ — Vite PWA + public/sw.js
- apps/shield/fixtures/scam-inbox.json
- apps/shield/src/__tests__/shield.test.ts · notify.test.ts

## Success signals
- SMS Vietcombank scam → BLOCK + familyAlert
- Zalo deepfake 20tr → BLOCK (detector: fixture)
- QR hoàn tiền Shopee → BLOCK
- SMS con gái thật → ALLOW
- CLI demo + vitest EXIT 0
- PWA build EXIT 0; SW can show local notification on BLOCK/FLAG (stub)

## Honesty
- Risk NEVER from LLM · deepfake = fixture · Care checkout = sandbox/stub · SW notify = local-sw-stub (not remote push)

## Pitch
Shield = AFK guardian rules+blacklist; PWA for family; LLM drafts words later; block + alert family; human decides money.
