# Domain / business notes — Judge · Lee Chon Cheng (Sea ops)

> Mock lens COO Office Sea · 2026-09-26 Asia/Saigon  
> Tech PASS 4/4 đã có. Dưới đây = **ops / money-safety / chaos SEA** actionable cho Adv.  
> Không invent live SPX/Shopee API; fixture + JSONL đủ cho D-Day.

## BizMate — Adv · BizMate

1. **Registry blast-radius card** ✅ — 1 slide/demo panel: “unpin workflow version X → Y executions affected (seed count từ AUDIT JSONL)”. Ops cần thấy rollback trước khi BGH hỏi production blast.
2. **EM money gate chứng minh** ✅ — mọi task `domain=accounting` trong board phải `hitl:true`; demo 1 dòng CLI/web “EM blocked auto-done on money task”. Đóng vòng partnership Codex nội bộ.
3. **Hot-path latency budget** — in ms/step từ run offline (compute+persist only) lên AUDIT SUMMARY footer; nhãn *demo-derived*. Sea chaos = latency trade-off phải nói được. **Done** (engine hotPath + AUDIT footer + web).

## Bookkeeper — Adv · Bookkeeper

1. **E-invoice fixture offline** (K2) — 1 file XML/JSON mẫu + citation path trỏ đoạn cụ thể (không chỉ doc id). Rule engine vẫn tính số; LLM không đụng tiền.
2. **Refuse path trong demo** — ít nhất 1 utterance `Từ chối` trước Duyệt khi gần/vượt 1B; audit ghi `approve_rejected`. Money-safety không chỉ happy-path.
3. **Idempotent re-ingest demo beat** — chạy lại cùng `utteranceId` + đổi số → reject rõ ràng trên CLI (đã có fingerprint; cần story 10s trên stage).

## Shield — Adv · Shield

1. **Pitch honesty P0** — 1 câu cố định: `deepfakeScore` = fixture meta, không detector; blacklistVersion+hash flash trên AUDIT SUMMARY (S2).
2. **Shadow-before-enforce** — pattern mới trong fixture mang `mode=shadow` + `shadowUntil=+7d`; verdict = FLAG only, không BLOCK. Ops Sea T&S không flip enforce ngày 1.
3. **False-positive SLA line** — sau human override, in “FP resolved by {trusted contact} · audit kept reasons”. Đủ cho ca đêm Care / family.

## FloodOps — Adv · FloodOps

1. **COD-at-risk header** — flash `codAtRiskVnd` (đã có helper) + nhãn *ước tính fixture* trong 5s đầu demo (khớp Sid-F1).
2. **Human decide replay** — `Duyệt hoàn` ghi actor+ts vào JSONL; demo `--replay` in lại quyết định ORD-1003 sau “7 ngày” (đọc file, không DB). Auditability ops thật.
3. **Roadmap slide 1 dòng** — “live flood feed / hub capacity = post-hackathon”; cấm claim SPX live. Chaos SEA = honesty về giới hạn.

## Priority route ngay

| ID | App | Item | P |
|----|-----|------|---|
| Lee-B1 | BizMate | Blast-radius / unpin version từ AUDIT | P1 · **Done** |
| Lee-B2 | BizMate | EM hitl bắt buộc trên accounting | P1 · **Done** |
| Lee-K1 | Bookkeeper | E-invoice fixture + citation đoạn | P2 |
| Lee-K2 | Bookkeeper | Refuse path + approve_rejected audit | P1 |
| Lee-S1 | Shield | deepfake=fixture + version flash | P0 |
| Lee-S2 | Shield | Shadow +7d cho pattern mới | P1 |
| Lee-F1 | FloodOps | COD-at-risk header | P1 |
| Lee-F2 | FloodOps | Replay human decide từ JSONL | P1 |

— Judge · Lee Chon Cheng (mock)
