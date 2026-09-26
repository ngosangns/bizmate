"use client";

import { useCallback, useState, useTransition } from "react";
import {
  actionApprove,
  actionOpenPro,
  actionPropose,
  actionRefuse,
  actionReset,
  type ScreenState,
} from "../actions/hitl";

function vnd(n: number): string {
  return `${n.toLocaleString("vi-VN")}₫`;
}

const ONE_B = 1_000_000_000;

export function BookkeeperScreen({ initial }: { initial: ScreenState }) {
  const [state, setState] = useState(initial);
  const [utterance, setUtterance] = useState(
    "cuối ngày bán 1 lô áo đặc biệt, 25000 nghìn"
  );
  const [billing, setBilling] = useState<string>("");
  const [pending, startTransition] = useTransition();

  const run = useCallback((fn: () => Promise<void>) => {
    startTransition(() => {
      void fn();
    });
  }, []);

  const pct = Math.min(100, Math.round((state.ytdRevenueVnd / ONE_B) * 100));

  return (
    <div className="phone">
      <header className="app">
        <h1>📒 Sạp An Đông — Bà Lan</h1>
        <div className="ytd">
          YTD (doanh thu năm): <strong>{vnd(state.ytdRevenueVnd)}</strong>
        </div>
        <div className="bar" aria-label="YTD vs 1B">
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className="ytd" style={{ fontSize: "0.8rem", opacity: 0.9 }}>
          Còn lại trước 1B: {vnd(state.remainingExemptionVnd)} · sổ:{" "}
          {state.ledgerCount} dòng
        </div>
      </header>

      <div className="banner">
        Demo offline — không kết nối cơ quan thuế. Parse = regex stub (chưa
        ASR). Ledger = SQLite (better-sqlite3). Billing = sandbox/stub only.
        {state.honestyOffline ? ` ${state.honestyOffline}` : ""}
      </div>

      <section className="card">
        <h2>Lời nói (voice→ledger stub)</h2>
        <textarea
          rows={2}
          value={utterance}
          onChange={(e) => setUtterance(e.target.value)}
          aria-label="Utterance"
        />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="secondary"
            disabled={pending}
            onClick={() =>
              run(async () => {
                const s = await actionPropose(utterance);
                setState(s);
                setBilling("");
              })
            }
          >
            Đề xuất ghi sổ
          </button>
          <button
            type="button"
            className="secondary"
            disabled={pending}
            onClick={() =>
              run(async () => {
                const s = await actionReset();
                setState(s);
                setBilling("");
              })
            }
          >
            ↺ Reset seed
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Đề xuất ghi sổ</h2>
        {state.pending ? (
          <>
            <p className="utterance">
              “{state.pending.utteranceText}”
            </p>
            <p className="proposal">
              {state.pending.proposal.payload.items
                .map(
                  (i) =>
                    `${i.qty} ${i.description} × ${vnd(i.unitPriceVnd)} = ${vnd(i.qty * i.unitPriceVnd)}`
                )
                .join("; ")}
              <br />
              Tổng: <strong>{vnd(state.pending.proposal.payload.totalVnd)}</strong>
              {" · "}
              YTD sau:{" "}
              <strong>{vnd(state.pending.proposal.payload.ytdAfter)}</strong>
            </p>
            {state.crossedThresholdPending && (
              <div className="warn">
                ⚠️ Cảnh báo 1B: Giao dịch này sẽ vượt ngưỡng miễn thuế{" "}
                <strong>1 tỷ</strong> đồng/năm. Cần bạn <strong>Duyệt</strong>{" "}
                trước khi ghi sổ.
              </div>
            )}
          </>
        ) : (
          <p className="proposal">Chưa có đề xuất — nhập lời nói rồi Đề xuất.</p>
        )}
      </section>

      <div className="actions">
        <button
          type="button"
          className="refuse"
          disabled={pending || !state.pending}
          onClick={() =>
            run(async () => {
              const s = await actionRefuse();
              setState(s);
            })
          }
          aria-label="Từ chối ghi sổ"
        >
          Từ chối
        </button>
        <button
          type="button"
          className="approve"
          disabled={pending || !state.pending}
          onClick={() =>
            run(async () => {
              const s = await actionApprove();
              setState(s);
            })
          }
          aria-label="Duyệt ghi sổ"
        >
          Duyệt
        </button>
      </div>
      <p className="status" aria-live="polite">
        {state.lastStatus}
      </p>

      <section
        className="card"
        style={{ borderColor: "#fcd34d", background: "#fffbeb" }}
      >
        <h2 style={{ color: "#b45309" }}>Free / Pro (fixture)</h2>
        <div className="pricing">
          <div className="tier">
            <p className="name">Free</p>
            <p className="price">0₫/tháng</p>
            <ul>
              <li>Nhật ký bán</li>
              <li>Cảnh báo ngưỡng 1B</li>
            </ul>
          </div>
          <div className="tier pro-tier">
            <p className="name">Pro kê khai</p>
            <p className="price">99.000₫/tháng*</p>
            <ul>
              <li>Kê khai / e-invoice assist</li>
              <li>Unlock khi vượt 1B</li>
            </ul>
          </div>
        </div>
        <p
          className="proposal"
          style={{ margin: "10px 0 0", fontSize: "0.82rem", color: "#92400e" }}
        >
          *Hypothesis — chưa đo ARPU · planId=<code>{state.planIds.pro}</code> ·
          không billing live · không cổng thuế.
        </p>
        <button
          type="button"
          className="pro"
          disabled={pending}
          onClick={() =>
            run(async () => {
              const r = await actionOpenPro();
              setState(r.screen);
              setBilling(r.billingLines.join("\n"));
            })
          }
          aria-label="Mở Pro sandbox"
        >
          Mở Pro (sandbox)
        </button>
        {billing ? (
          <div className="billing-out" aria-live="polite">
            {billing}
          </div>
        ) : null}
      </section>

      <section className="card">
        <h2>Căn cứ (citation)</h2>
        <p className="citations">
          {state.citations.map((c) => `${c.title}`).join(" · ")} — ngưỡng miễn
          thuế hộ KD 1 tỷ/năm (fixture demo only).
        </p>
      </section>

      <footer className="app">
        Bookkeeper · Next.js App Router + better-sqlite3 · BizMate
        <br />
        Server actions HITL · offline voice stub
      </footer>
    </div>
  );
}
