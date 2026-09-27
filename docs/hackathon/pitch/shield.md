# Shield — pitch 60–90s + demo 3'

## Pitch (~75s)

**Pain:** Tin nhắn lừa đảo với người già — ML “score” không giải thích được cho gia đình.  
**Product:** **Rule/blacklist** quyết allow/flag/block. AI luôn có **giải thích** (elder + family) + triage score mềm.  
**Trust:** `overridesVerdict=false` — AI không đổi risk.  
**Honesty:** Offline = AI-draft stub. Live OpenAI chỉ viết copy; thiếu key → `missing_api_key`.

## Demo script (~3')

| t | Click / nói |
|---|-------------|
| 0:00 | **http://localhost:5174** (Shield PWA). |
| 0:30 | Message spoof/OTP/QR blacklist → **block**; chỉ rule verdict. |
| 1:15 | Panel AI-draft / triage — *verdict rule vẫn là block*. |
| 2:00 | Message lành (“Ba nhớ uống thuốc”) → allow; AI draft vẫn có. |
| 2:40 | Nói rõ: risk = rules; AI = giải thích. |

**Không nói:** “Model deepfake live đang chấm điểm thật.”
