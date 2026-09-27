# Demo day runbook — ports, offline first, optional live

## Ports

| App | Port | Start (typical) |
|-----|------|-----------------|
| Mate web | **5173** | `npm run dev:web` |
| Shield PWA | **5174** | `npm run dev -w @bizmate/shield` |
| Bookkeeper | **3010** | `npm run demo:bookkeeper` / `dev` in app |
| FloodOps | **3011** | `npm run demo:floodops` / `dev -w @bizmate/floodops` |

Check: `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5173` (expect 200).

## Offline first (recommended for judges)

1. **Unset** `BIZMATE_MODE`, `VITE_BIZMATE_MODE`, `OPENAI_API_KEY`, `BIZMATE_OPENAI_API_KEY`.  
2. Start all four apps.  
3. Walk Mate → Bookkeeper → Shield → FloodOps (see per-app pitch scripts).  
4. Honesty line: *“AI đề xuất (stub offline) — không gọi OpenAI, không giả live thuế/Stripe.”*

## Optional live (only with a real key)

```bash
export BIZMATE_MODE=live
export OPENAI_API_KEY=sk-...   # real key only
# optional: export BIZMATE_LLM_MODEL=gpt-4o-mini
# restart Node processes so env applies
```

- If live succeeds: badge *AI đề xuất (live)* + real model id.  
- If you set `live` but **forget the key**: UI/meta shows `missing_api_key` — say that out loud. **Do not claim live worked.**

Vite web: set `VITE_BIZMATE_MODE=live` at build/dev only for badge intent; browser still should not ship secrets — keep keys on server-side propose paths.

## What to click (90s each if short on time)

1. **5173** — generate → judge → Duyệt → Chạy (zero LLM).  
2. **3010** — utterance → propose → rule badges → Duyệt.  
3. **5174** — scam SMS → block + AI draft; clean SMS → allow.  
4. **3011** — flood wave → engine action + AI rationale → human on refund.

## Honesty cheat-sheet (say these)

- “AI proposes / code verifies / human decides.”  
- “Offline stub by default.”  
- “Live OpenAI only with real key; otherwise missing_api_key — we never invent live.”  
- “Money, tax, risk, refund: not owned by the model.”

## Docs

- Soft A4 detail: [`../ai-ops/SOFT-A4-LIVE-HOOKS.md`](../ai-ops/SOFT-A4-LIVE-HOOKS.md)  
- Pitch index: [`../PITCH.md`](../PITCH.md)
