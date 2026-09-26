/**
 * Shield PWA UI — elder/family inbox demo (Tailwind + a11y polish).
 * Risk = shared rule engine (never LLM). Detector = fixture. Notifications = local SW stub.
 */
import {
  BLACKLIST_VERSION,
  applyHumanOverride,
  auditLog,
  blacklistDomainsHash,
  clearAuditLog,
  judgeMessage,
  shadowedPatternIds,
  type IncomingMessage,
  type ShieldVerdict,
} from "@shield/engine";
import { buildFamilyNotify, SW_SHOW_NOTIFY } from "@shield/notify";
import { runDetectorStub } from "@shield/detector";
import {
  createCheckout,
  honestyBanner,
  listPlans,
  type BillingMode,
} from "@bizmate/billing";
import inboxFixture from "../../fixtures/scam-inbox.json";
import { badgeClass, btnClass, cardClass, sectionTitleClass } from "./ui";

const app = document.querySelector("#app")!;

type LiveCounts = { allow: number; flag: number; block: number };

let verdicts: ShieldVerdict[] = [];
let live: LiveCounts = { allow: 0, flag: 0, block: 0 };
let swReady = false;
let notifPermission: NotificationPermission | "unsupported" = "unsupported";
let lastOverride: ShieldVerdict | null = null;
let billingMode: BillingMode = "stripe_test";
let lastCheckoutDetail = "";

const elderName: string = (inboxFixture as { elderName: string }).elderName;
const familyContact: string = (inboxFixture as { familyContact: string }).familyContact;
const messages = (inboxFixture as { messages: IncomingMessage[] }).messages;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function registerSW(): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    swReady = false;
    return;
  }
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "./" });
    const ready = navigator.serviceWorker.ready;
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
    await Promise.race([ready, timeout]);
    swReady = Boolean(reg.active || reg.waiting || reg.installing);
  } catch {
    swReady = false;
  }
}

async function requestNotifyPermission(): Promise<void> {
  if (!("Notification" in window)) {
    notifPermission = "unsupported";
    render();
    return;
  }
  notifPermission = Notification.permission;
  if (Notification.permission === "default") {
    notifPermission = await Notification.requestPermission();
  } else {
    notifPermission = Notification.permission;
  }
  render();
}

async function showLocalNotify(v: ShieldVerdict): Promise<void> {
  const payload = buildFamilyNotify(v, elderName);
  if (!payload) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  if (swReady && navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: SW_SHOW_NOTIFY,
      payload,
    });
    return;
  }
  try {
    new Notification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      icon: "/icon-192.png",
    });
  } catch {
    /* ignore */
  }
}

function runInbox(): void {
  clearAuditLog();
  lastOverride = null;
  verdicts = [];
  live = { allow: 0, flag: 0, block: 0 };
  for (const m of messages) {
    const v = judgeMessage(m);
    verdicts.push(v);
    live[v.action]++;
    void showLocalNotify(v);
  }
  render();
  document.getElementById("cards")?.focus();
}

function doOverride(): void {
  const blocked = verdicts.find((v) => v.action === "block");
  if (!blocked) return;
  lastOverride = applyHumanOverride(blocked, "allow", "Con gái Hương");
  render();
}

function doSubscribe(): void {
  const banner = honestyBanner(billingMode);
  const checkout = createCheckout({
    appId: "shield",
    planId: "shield-family-care",
    mode: billingMode,
  });
  lastCheckoutDetail = [
    banner,
    `honestyBanner: ${checkout.honestyBanner}`,
    `sessionId=${checkout.sessionId}  ok=${checkout.ok}  stub=${checkout.stub}`,
    checkout.url ? `url=${checkout.url}` : "url=(none · offline stub)",
    `detail: ${checkout.detail}`,
    "demoSubscribeCount=1 · plan=shield-family-care · NOT live payment",
  ].join("\n");
  render();
  document.getElementById("checkout-result")?.focus();
}

function actionLabelVi(action: ShieldVerdict["action"]): string {
  if (action === "block") return "CHẶN";
  if (action === "flag") return "CẢNH BÁO";
  return "AN TOÀN";
}

function actionIcon(action: ShieldVerdict["action"]): string {
  if (action === "block") return "🚫";
  if (action === "flag") return "⚠️";
  return "✅";
}

function renderCards(): string {
  if (verdicts.length === 0) {
    return `<div class="${cardClass()}" role="status">
      <p class="text-elder text-shield-muted m-0">
        Bấm <strong class="text-shield-ink">Chạy hộp thư demo</strong> để quét tin nhắn mẫu (offline).
      </p>
    </div>`;
  }
  return verdicts
    .map((v, i) => {
      const m = messages[i];
      const det =
        m.meta?.deepfakeScore !== undefined || v.detector
          ? runDetectorStub({ deepfakeScore: m.meta?.deepfakeScore })
          : null;
      const tip =
        v.action === "block" &&
        (m.id === "m3" || (m.meta?.qrBlacklisted && /hoàn tiền/i.test(m.body)))
          ? `<p class="mt-3 text-base text-shield-flag m-0" role="note">
              Tip buyer: Đừng quét QR hoàn tiền từ shipper lạ — mở app Shopee để kiểm tra đơn.
            </p>`
          : "";
      return `<article
        class="${cardClass(v.action)}"
        data-id="${escapeHtml(v.messageId)}"
        aria-label="Tin ${i + 1}: ${actionLabelVi(v.action)}"
        tabindex="0"
      >
        <div class="flex flex-wrap items-center gap-2 mb-3 text-sm text-shield-muted">
          <span class="${badgeClass(v.action)}" aria-hidden="false">
            <span aria-hidden="true">${actionIcon(v.action)}</span>
            ${v.action}
          </span>
          <span class="rounded-full bg-shield-surface px-2.5 py-1 border border-shield-border">
            STEP ${i + 1}/${messages.length}
          </span>
          <span>${escapeHtml(m.channel)} · ${escapeHtml(m.from)}</span>
        </div>
        <p class="text-elder-lg font-medium m-0 leading-snug">
          <span class="sr-only">Giải thích cho ông bà: </span>
          💬 ${escapeHtml(v.elderExplanation)}
        </p>
        ${
          v.familyAlert
            ? `<p class="mt-2 text-base text-shield-muted m-0">
                <span class="sr-only">Cảnh báo gia đình: </span>
                📱 ${escapeHtml(v.familyAlert)}
              </p>`
            : ""
        }
        ${
          det
            ? `<span class="mt-3 inline-flex ${badgeClass("sandbox")}" title="detector fixture">
                ${escapeHtml(det.label)}
              </span>`
            : ""
        }
        ${tip}
      </article>`;
    })
    .join("\n");
}

function renderAudit(): string {
  if (verdicts.length === 0) return "(chưa chạy)";
  const lines = [
    `AUDIT: blacklistVersion=${BLACKLIST_VERSION}  hash=${blacklistDomainsHash()}  deepfake=fixture`,
    `allow=${live.allow}  flag=${live.flag}  block=${live.block}  (audit entries=${auditLog.length})`,
    "—— machine reasons (AUDIT only) ——",
    ...verdicts.map((v) => {
      const shadow = v.shadowPatternIds?.length
        ? ` | shadowPatternIds=${v.shadowPatternIds.join(",")}`
        : "";
      return `${v.messageId}: ${v.action} (${v.risk}) — ${v.reasons.join("; ") || "clean"}${shadow}`;
    }),
  ];
  if (lastOverride) {
    lines.push(
      "",
      "—— HUMAN OVERRIDE ——",
      `${lastOverride.messageId} → ${lastOverride.action} (${lastOverride.risk})`,
      lastOverride.reasons.join("; "),
      "FP SLA: trusted-contact false-block target <1%; override = human decide"
    );
  }
  return escapeHtml(lines.join("\n"));
}

function renderPlanCards(): string {
  const plans = listPlans("shield");
  return plans
    .map((p) => {
      const featured = p.id === "shield-family-care";
      return `<div class="${cardClass()} ${
        featured ? "ring-2 ring-shield-accent/60" : ""
      }" role="listitem">
        <div class="flex flex-wrap items-start justify-between gap-2 mb-2">
          <div>
            <h3 class="text-lg font-bold m-0">${escapeHtml(p.nameVi || p.name)}</h3>
            <p class="text-sm text-shield-muted m-0 mt-0.5">${escapeHtml(p.id)}</p>
          </div>
          ${
            featured
              ? `<span class="${badgeClass("sandbox")}">Care · SANDBOX</span>`
              : `<span class="${badgeClass("neutral")}">fixture</span>`
          }
        </div>
        <p class="text-elder font-semibold text-shield-allow m-0 mb-3">${escapeHtml(p.priceDisplay)}</p>
        <ul class="m-0 pl-5 text-base text-shield-muted space-y-1">
          ${p.features.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}
        </ul>
      </div>`;
    })
    .join("\n");
}

function renderHonestyStrip(): string {
  return `<aside class="honesty-strip" role="status" aria-live="polite" aria-label="Honesty banners">
    <div class="mx-auto max-w-3xl px-4 py-3 space-y-1.5 text-sm sm:text-base">
      <p class="m-0">
        <strong class="text-shield-flag">detector: fixture</strong>
        · deepfakeScore=fixture ·
        <span class="text-shield-muted">HONESTY: không phải live detector</span>
      </p>
      <p class="m-0 text-shield-muted">
        Thông báo: <strong class="text-shield-ink">local-sw-stub</strong> (SW / Notification API — không phải remote push)
        · Thanh toán: <strong class="text-shield-flag">Stripe TEST / SANDBOX</strong> — không live payment
      </p>
      <p class="m-0 text-shield-muted">
        ENGINE: luật + blacklist deterministic — <strong class="text-shield-ink">risk NEVER from LLM</strong>
        · Người trả: family B2C (con trả cho ba/mẹ)
      </p>
    </div>
  </aside>`;
}

function renderLiveStats(): string {
  return `<div class="flex flex-wrap gap-3 text-base" role="status" aria-label="Live counts">
    <span class="${badgeClass("allow")}" title="ALLOW">✅ allow ${live.allow}</span>
    <span class="${badgeClass("flag")}" title="FLAG">⚠️ flag ${live.flag}</span>
    <span class="${badgeClass("block")}" title="BLOCK">🚫 block ${live.block}</span>
  </div>`;
}

function render(): void {
  const shadowIds = shadowedPatternIds();
  const swLabel = swReady ? "SW đã đăng ký (stub)" : "SW chưa sẵn sàng";
  const notifLabel =
    notifPermission === "unsupported"
      ? "Notification API không hỗ trợ"
      : `permission=${notifPermission}`;
  const canOverride = verdicts.some((v) => v.action === "block");

  app.innerHTML = `
    ${renderHonestyStrip()}

    <main id="main" class="mx-auto max-w-3xl px-4 py-6 sm:py-8 space-y-8">
      <header class="space-y-2">
        <p class="text-sm font-semibold uppercase tracking-widest text-shield-accent m-0">
          Shield PWA · Vite + Tailwind
        </p>
        <h1 class="text-elder-xl font-bold m-0 tracking-tight">
          🛡️ Lá chắn tin nhắn của ${escapeHtml(elderName)}
        </h1>
        <p class="text-elder text-shield-muted m-0">
          30s backup · ba/mẹ mua Shopee · Cảnh báo gia đình →
          <strong class="text-shield-ink">${escapeHtml(familyContact)}</strong>
        </p>
        <p class="text-sm text-shield-muted m-0">
          Per-pattern shadow (7 ngày):
          ${shadowIds.length ? escapeHtml(shadowIds.join(", ")) : "(none)"}
        </p>
      </header>

      <section aria-labelledby="toolbar-heading" class="space-y-4">
        <h2 id="toolbar-heading" class="sr-only">Điều khiển demo</h2>
        <div class="flex flex-wrap gap-3" role="toolbar" aria-label="Shield actions">
          <button type="button" id="btn-run" class="${btnClass("primary")}">
            Chạy hộp thư demo
          </button>
          <button type="button" id="btn-notif" class="${btnClass("secondary")}"
            aria-describedby="sw-hint">
            Bật thông báo local
            <span class="${badgeClass("sandbox")} text-xs">SW stub</span>
          </button>
          <button type="button" id="btn-override" class="${btnClass("ghost")}"
            ${canOverride ? "" : "disabled"}
            aria-disabled="${canOverride ? "false" : "true"}">
            Human override (FP → allow)
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-3 text-sm text-shield-muted" id="sw-hint">
          <span class="inline-flex items-center gap-2">
            <span class="status-dot ${swReady ? "status-dot-on" : "status-dot-off"}" aria-hidden="true"></span>
            ${escapeHtml(swLabel)}
          </span>
          <span aria-hidden="true">·</span>
          <span>${escapeHtml(notifLabel)}</span>
        </div>

        ${verdicts.length ? renderLiveStats() : ""}
      </section>

      <section aria-labelledby="inbox-heading" class="space-y-3">
        <h2 id="inbox-heading" class="${sectionTitleClass()}">Hộp thư · phán quyết</h2>
        <div id="cards" class="space-y-4" tabindex="-1" aria-live="polite">
          ${renderCards()}
        </div>
      </section>

      <section aria-labelledby="audit-heading" class="space-y-3">
        <h2 id="audit-heading" class="${sectionTitleClass()}">AUDIT SUMMARY</h2>
        <pre class="audit-pre" tabindex="0">${renderAudit()}</pre>
      </section>

      <section aria-labelledby="care-heading" class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <h2 id="care-heading" class="${sectionTitleClass()} !mb-0">Family Care · giá</h2>
          <span class="${badgeClass("sandbox")}">SANDBOX · not live payment</span>
        </div>
        <p class="text-base text-shield-muted m-0">
          Người trả = family B2C (con/cháu). Sea/Shopee = kênh phân phối thôi — không phải payer.
          Nguồn: <code class="text-shield-ink">@bizmate/billing</code> listPlans("shield").
        </p>
        <div class="grid gap-4 sm:grid-cols-3" role="list">
          ${renderPlanCards()}
        </div>
        <div class="flex flex-wrap gap-3 items-center">
          <button type="button" id="btn-subscribe" class="${btnClass("primary")}">
            Đăng ký Family Care
            <span class="${badgeClass("sandbox")} text-xs">SANDBOX</span>
          </button>
          <span class="text-sm text-shield-muted">Stripe TEST / offline stub — không trừ tiền thật</span>
        </div>
        ${
          lastCheckoutDetail
            ? `<pre id="checkout-result" class="audit-pre" tabindex="-1" aria-live="polite">${escapeHtml(
                lastCheckoutDetail
              )}</pre>`
            : ""
        }
      </section>

      <footer class="border-t border-shield-border pt-4 text-sm text-shield-muted">
        Stack: PWA + Service Worker (+ Vite) + Tailwind — not Expo.
        Dev: <code>npm run dev -w @bizmate/shield</code> → :5174 (host:true · localhost + 127.0.0.1).
        Manifest + icons giữ nguyên. Risk engine shared với CLI demo.
      </footer>
    </main>
  `;

  document.getElementById("btn-run")?.addEventListener("click", runInbox);
  document.getElementById("btn-notif")?.addEventListener("click", () => {
    void requestNotifyPermission();
  });
  document.getElementById("btn-override")?.addEventListener("click", doOverride);
  document.getElementById("btn-subscribe")?.addEventListener("click", doSubscribe);
}

if ("Notification" in window) {
  notifPermission = Notification.permission;
}

// Paint first; SW register may hang in some headless/offline contexts.
render();
void registerSW().then(() => {
  render();
});
