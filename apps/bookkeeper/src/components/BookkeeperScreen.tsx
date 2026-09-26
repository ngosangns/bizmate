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
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";

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
    <div className="mx-auto flex min-h-dvh w-full max-w-phone flex-col gap-3 px-4 pb-7 pt-4">
      {/* Header + YTD ledger card */}
      <header className="rounded-lg bg-accent p-4 text-white shadow-soft">
        <div className="flex items-start justify-between gap-2">
          <h1 className="m-0 text-[1.05rem] font-bold leading-snug">
            📒 Sạp An Đông — Bà Lan
          </h1>
          <Badge variant="stub" className="shrink-0 border-white/30 bg-white/15 text-white">
            DEMO
          </Badge>
        </div>
        <p className="mt-2 m-0 text-sm opacity-95">
          YTD (doanh thu năm):{" "}
          <strong className="font-bold">{vnd(state.ytdRevenueVnd)}</strong>
        </p>
        <Progress
          value={pct}
          className="mt-3 h-2.5 bg-white/25"
          indicatorClassName="bg-gradient-to-r from-white to-amber-border"
          aria-label="YTD vs 1B"
        />
        <p className="mt-2 m-0 text-[0.8rem] opacity-90">
          Còn lại trước 1B: {vnd(state.remainingExemptionVnd)} · sổ:{" "}
          {state.ledgerCount} dòng · {pct}%
        </p>
      </header>

      {/* Honesty banner */}
      <Alert variant="honesty">
        <AlertDescription>
          Demo offline — không kết nối cơ quan thuế. Parse = regex stub (chưa
          ASR). Ledger = SQLite (better-sqlite3). Billing ={" "}
          <Badge variant="stub" className="mx-0.5 align-middle">
            STUB/SANDBOX
          </Badge>{" "}
          only.
          {state.honestyOffline ? ` ${state.honestyOffline}` : ""}
        </AlertDescription>
      </Alert>

      {/* Voice → propose */}
      <Card>
        <CardHeader className="mb-2">
          <CardTitle>Lời nói (voice→ledger stub)</CardTitle>
          <CardDescription>
            Nhập utterance · regex stub offline · chưa ASR
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          <Textarea
            rows={2}
            value={utterance}
            onChange={(e) => setUtterance(e.target.value)}
            aria-label="Utterance"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
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
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
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
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Proposal card */}
      <Card>
        <CardHeader className="mb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Đề xuất ghi sổ</CardTitle>
            {state.pending ? (
              <Badge variant="accent">Chờ Duyệt</Badge>
            ) : (
              <Badge variant="muted">Trống</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {state.pending ? (
            <div className="flex flex-col gap-2.5">
              <p className="m-0 text-[0.95rem] italic leading-snug text-ink">
                “{state.pending.utteranceText}”
              </p>
              <Separator />
              <p className="m-0 text-sm leading-relaxed text-ink">
                {state.pending.proposal.payload.items
                  .map(
                    (i) =>
                      `${i.qty} ${i.description} × ${vnd(i.unitPriceVnd)} = ${vnd(i.qty * i.unitPriceVnd)}`
                  )
                  .join("; ")}
              </p>
              <p className="m-0 text-sm">
                Tổng:{" "}
                <strong>
                  {vnd(state.pending.proposal.payload.totalVnd)}
                </strong>
                {" · "}
                YTD sau:{" "}
                <strong>
                  {vnd(state.pending.proposal.payload.ytdAfter)}
                </strong>
              </p>
              {state.crossedThresholdPending && (
                <Alert variant="warn">
                  ⚠️ Cảnh báo 1B: Giao dịch này sẽ vượt ngưỡng miễn thuế{" "}
                  <strong>1 tỷ</strong> đồng/năm. Cần bạn <strong>Duyệt</strong>{" "}
                  trước khi ghi sổ.
                </Alert>
              )}
            </div>
          ) : (
            <p className="m-0 text-sm text-muted">
              Chưa có đề xuất — nhập lời nói rồi Đề xuất.
            </p>
          )}
        </CardContent>
      </Card>

      {/* HITL — big Duyệt / Từ chối */}
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          type="button"
          variant="refuse"
          size="hitl"
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
        </Button>
        <Button
          type="button"
          variant="approve"
          size="hitl"
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
        </Button>
      </div>
      <p
        className="m-0 min-h-[1.4em] text-center text-sm font-semibold text-accent"
        aria-live="polite"
      >
        {state.lastStatus}
      </p>

      {/* Free / Pro pricing */}
      <Card className="border-amber-border bg-amber-soft">
        <CardHeader className="mb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-warn">Free / Pro (fixture)</CardTitle>
            <Badge variant="stub">SANDBOX</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-sm border border-border bg-white p-2.5">
              <p className="m-0 mb-1 text-[0.85rem] font-bold">Free</p>
              <p className="m-0 mb-1.5 text-[0.8rem] font-bold text-accent">
                0₫/tháng
              </p>
              <ul className="m-0 list-disc space-y-0.5 pl-4 text-[0.72rem] leading-snug text-muted">
                <li>Nhật ký bán</li>
                <li>Cảnh báo ngưỡng 1B</li>
              </ul>
            </div>
            <div className="rounded-sm border border-amber-border bg-amber-soft p-2.5">
              <p className="m-0 mb-1 text-[0.85rem] font-bold">Pro kê khai</p>
              <p className="m-0 mb-1.5 text-[0.8rem] font-bold text-accent">
                99.000₫/tháng*
              </p>
              <ul className="m-0 list-disc space-y-0.5 pl-4 text-[0.72rem] leading-snug text-muted">
                <li>Kê khai / e-invoice assist</li>
                <li>Unlock khi vượt 1B</li>
              </ul>
            </div>
          </div>
          <Alert variant="honesty" className="text-[0.82rem]">
            *Hypothesis — chưa đo ARPU · planId=
            <code className="rounded bg-white/60 px-1 text-[0.75rem]">
              {state.planIds.pro}
            </code>{" "}
            · không billing live · không cổng thuế.
          </Alert>
          <Button
            type="button"
            variant="pro"
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
          </Button>
          {billing ? (
            <Alert variant="stub" aria-live="polite">
              {billing}
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {/* Citations */}
      <Card>
        <CardHeader className="mb-2">
          <CardTitle>Căn cứ (citation)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="m-0 text-[0.82rem] leading-relaxed text-muted">
            {state.citations.map((c) => `${c.title}`).join(" · ")} — ngưỡng miễn
            thuế hộ KD 1 tỷ/năm (fixture demo only).
          </p>
        </CardContent>
      </Card>

      <footer className="mt-auto pt-2 text-center text-[0.72rem] leading-relaxed text-muted">
        Bookkeeper · Next.js App Router + Tailwind + shadcn/Radix · SQLite
        <br />
        Server actions HITL · offline voice stub · STUB/SANDBOX billing
      </footer>
    </div>
  );
}
