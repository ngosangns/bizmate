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
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
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
  const [rejectReason, setRejectReason] = useState("");
  const [billing, setBilling] = useState<string>("");
  const [pending, startTransition] = useTransition();

  const run = useCallback((fn: () => Promise<void>) => {
    startTransition(() => {
      void fn();
    });
  }, []);

  const pct = Math.min(100, Math.round((state.ytdRevenueVnd / ONE_B) * 100));
  const reasonOk = rejectReason.trim().length > 0;
  const ytdAfter = state.pending?.proposal.payload.ytdAfter ?? state.ytdRevenueVnd;
  const remainingAfter = Math.max(0, ONE_B - ytdAfter);
  const postOneBLocked = state.postOneBLocked;
  const hitlLockedUntilDuyet = Boolean(
    state.pending && state.crossedThresholdPending
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-phone flex-col gap-3 px-4 pb-7 pt-4 lg:max-w-6xl">
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        {/* Left: header + YTD + voice + proposal + HITL */}
        <div className="flex flex-col gap-3">
          {/* Header + YTD ledger card */}
          <header className="rounded-lg bg-accent p-4 text-white shadow-soft">
            <div className="flex items-start justify-between gap-2">
              <h1 className="m-0 text-[1.05rem] font-bold leading-snug">
                📒 Sạp An Đông — Bà Lan
              </h1>
              <Badge
                variant="stub"
                className="shrink-0 border-white/30 bg-white/15 text-white"
              >
                DEMO
              </Badge>
            </div>
            <p className="mt-2 m-0 rounded-sm bg-white/15 px-2 py-1.5 text-[0.78rem] leading-snug">
              <strong>Who pays:</strong> Free = sạp Bà Lan (0₫) · Sea pilot =
              cost-center nội bộ (STUB) · Pro = tiểu thương{" "}
              <Badge
                variant="stub"
                className="mx-0.5 align-middle border-white/30 bg-white/20 text-white"
              >
                SANDBOX
              </Badge>{" "}
              — không billing live.
            </p>
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

          {postOneBLocked ? (
            <Alert variant="danger" className="border-2" role="status">
              <AlertTitle>🔒 KHÓA sau vượt ngưỡng 1 TỶ</AlertTitle>
              <AlertDescription className="space-y-1 text-[0.85rem]">
                <p className="m-0">
                  YTD hiện tại <strong>{vnd(state.ytdRevenueVnd)}</strong> đã
                  vượt miễn thuế 1 tỷ.
                </p>
                <p className="m-0">
                  <strong>Không khả dụng:</strong> Đề xuất ghi sổ (Free) — cần
                  mở <strong>Pro (sandbox)</strong> để tiếp tục kê khai, hoặc{" "}
                  <strong>↺ Reset seed</strong> để demo lại từ fixture.
                </p>
                <p className="m-0 text-[0.78rem]">
                  STUB/SANDBOX only — không billing live / không cổng thuế.
                </p>
              </AlertDescription>
            </Alert>
          ) : null}

          {hitlLockedUntilDuyet ? (
            <Alert variant="warn" className="border-2" role="status">
              <AlertTitle>🔒 Ghi sổ tự động: KHÓA</AlertTitle>
              <AlertDescription className="text-[0.85rem]">
                Giao dịch sẽ vượt 1B — <strong>không ghi sổ</strong> cho đến khi
                bạn <strong>Duyệt</strong> (HITL). Từ chối cần nhập lý do.
              </AlertDescription>
            </Alert>
          ) : null}

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
                  disabled={pending || postOneBLocked}
                  title={
                    postOneBLocked
                      ? "KHÓA sau 1B — mở Pro (sandbox) hoặc Reset seed"
                      : "Đề xuất ghi sổ"
                  }
                  onClick={() =>
                    run(async () => {
                      const s = await actionPropose(utterance);
                      setState(s);
                      setBilling("");
                      setRejectReason("");
                    })
                  }
                >
                  {postOneBLocked ? "Đề xuất (KHÓA · sau 1B)" : "Đề xuất ghi sổ"}
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
                      setRejectReason("");
                    })
                  }
                >
                  ↺ Reset seed
                </Button>
              </div>
              {postOneBLocked ? (
                <p className="m-0 text-[0.78rem] font-semibold text-danger">
                  Vì sao khóa? Đã vượt 1B exemption — Free đề xuất không khả dụng
                  cho đến Pro sandbox / Reset.
                </p>
              ) : null}
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
                    <Alert variant="danger" className="border-2">
                      <AlertTitle className="text-base tracking-wide">
                        ⚠️ VƯỢT NGƯỠNG 1 TỶ
                      </AlertTitle>
                      <AlertDescription className="mt-1.5 space-y-1 text-[0.85rem] font-medium">
                        <p className="m-0">
                          Giao dịch này sẽ vượt ngưỡng miễn thuế{" "}
                          <strong>1 tỷ</strong> đồng/năm.
                        </p>
                        <p className="m-0">
                          YTD trước: <strong>{vnd(state.ytdRevenueVnd)}</strong>
                          {" → "}
                          sau: <strong>{vnd(ytdAfter)}</strong>
                        </p>
                        <p className="m-0">
                          Còn lại trước 1B (sau giao dịch):{" "}
                          <strong>{vnd(remainingAfter)}</strong>
                        </p>
                        <p className="m-0">
                          Cần bạn <strong>Duyệt</strong> trước khi ghi sổ.
                        </p>
                      </AlertDescription>
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

          {/* HITL — reason + big Duyệt / Từ chối */}
          {state.pending ? (
            <Card className="border-danger-border bg-danger-soft/40">
              <CardHeader className="mb-2">
                <CardTitle className="text-danger">Lý do Từ chối (HITL)</CardTitle>
                <CardDescription>
                  Bắt buộc nhập lý do trước khi Từ chối — lưu audit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="vd: sai số tiền / nhầm mặt hàng…"
                  aria-label="Lý do Từ chối"
                  className="bg-white"
                />
              </CardContent>
            </Card>
          ) : null}

          {state.crossedThresholdPending && state.pending ? (
            <Alert variant="warn" className="border-2 text-center">
              <AlertTitle>VƯỢT NGƯỠNG 1 TỶ — xác nhận HITL</AlertTitle>
              <AlertDescription className="text-[0.82rem]">
                YTD {vnd(state.ytdRevenueVnd)} → {vnd(ytdAfter)} · còn lại{" "}
                {vnd(remainingAfter)}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="refuse"
              size="hitl"
              disabled={pending || !state.pending || !reasonOk}
              onClick={() =>
                run(async () => {
                  const s = await actionRefuse(rejectReason.trim());
                  setState(s);
                  setRejectReason("");
                })
              }
              aria-label="Từ chối ghi sổ"
              title={
                !state.pending
                  ? "Không có đề xuất"
                  : !reasonOk
                    ? "Nhập lý do Từ chối trước"
                    : "Từ chối và lưu lý do"
              }
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
                  setRejectReason("");
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

          {state.lastRejectReason && !state.pending ? (
            <Alert variant="danger" aria-live="polite">
              <AlertTitle>Đã Từ chối</AlertTitle>
              <AlertDescription>
                Lý do: <strong>{state.lastRejectReason}</strong> — chưa ghi sổ
                (HITL audit).
              </AlertDescription>
            </Alert>
          ) : null}
        </div>

        {/* Right: Free/Pro + citations + honesty */}
        <div className="flex flex-col gap-3">
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

          {/* Free / Pro pricing */}
          <Card className="border-amber-border bg-amber-soft">
            <CardHeader className="mb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-warn">Free / Pro (fixture)</CardTitle>
                <Badge variant="stub">SANDBOX</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="m-0 rounded-sm border border-amber-border bg-white px-2.5 py-2 text-[0.78rem] leading-snug text-ink">
                <strong>Who pays (GTM):</strong> Free → sạp Bà Lan · Sea pilot →
                Sea internal tooling (STUB cost-center) · Pro kê khai → payer =
                tiểu thương (Stripe TEST / SANDBOX — không live).
              </p>
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
                <AlertDescription>
                  *Hypothesis — chưa đo ARPU · planId=
                  <code className="rounded bg-white/60 px-1 text-[0.75rem]">
                    {state.planIds.pro}
                  </code>{" "}
                  · không billing live · không cổng thuế.
                </AlertDescription>
              </Alert>
              {postOneBLocked ? (
                <Alert variant="warn" className="border-2">
                  <AlertTitle>Cần Pro để mở khóa sau 1B</AlertTitle>
                  <AlertDescription className="text-[0.82rem]">
                    Free ledger actions đang <strong>KHÓA</strong>. Bấm Mở Pro
                    (sandbox) — Stripe TEST / STUB only, không live.
                  </AlertDescription>
                </Alert>
              ) : null}
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
                {postOneBLocked
                  ? "Mở Pro (sandbox) — mở khóa sau 1B"
                  : "Mở Pro (sandbox)"}
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
                {state.citations.map((c) => `${c.title}`).join(" · ")} — ngưỡng
                miễn thuế hộ KD 1 tỷ/năm (fixture demo only).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="mt-auto pt-2 text-center text-[0.72rem] leading-relaxed text-muted">
        Bookkeeper · Next.js App Router + Tailwind + shadcn/Radix · SQLite
        <br />
        Server actions HITL · offline voice stub · STUB/SANDBOX billing
      </footer>
    </div>
  );
}
