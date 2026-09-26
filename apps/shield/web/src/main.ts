/**
 * Shield PWA UI — elder/family inbox demo.
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
    await navigator.serviceWorker.ready;
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
  // Fallback without controller — still local Notification API (stub)
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
}

function renderCards(): string {
  if (verdicts.length === 0) {
    return `<p class="sub">Bấm <strong>Chạy hộp thư demo</strong> để quét fixture scam-inbox (offline).</p>`;
  }
  return verdicts
    .map((v, i) => {
      const m = messages[i];
      const icon = v.action === "block" ? "🚫" : v.action === "flag" ? "⚠️" : "✅";
      const det =
        m.meta?.deepfakeScore !== undefined || v.detector
          ? runDetectorStub({ deepfakeScore: m.meta?.deepfakeScore })
          : null;
      const tip =
        v.action === "block" &&
        (m.id === "m3" || (m.meta?.qrBlacklisted && /hoàn tiền/i.test(m.body)))
          ? `<p class="tip">Tip buyer: Đừng quét QR hoàn tiền từ shipper lạ — mở app Shopee để kiểm tra đơn.</p>`
          : "";
      return `<article class="card" data-id="${escapeHtml(v.messageId)}">
        <div class="meta">
          <span class="pill ${v.action}">${icon} ${v.action}</span>
          <span>STEP ${i + 1}/${messages.length}</span>
          <span>${escapeHtml(m.channel)} · ${escapeHtml(m.from)}</span>
        </div>
        <p class="elder">💬 ${escapeHtml(v.elderExplanation)}</p>
        ${v.familyAlert ? `<p class="family">📱 ${escapeHtml(v.familyAlert)}</p>` : ""}
        ${det ? `<span class="fixture-tag">${escapeHtml(det.label)}</span>` : ""}
        ${tip}
      </article>`;
    })
    .join("");
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

function renderBilling(): string {
  const plans = listPlans("shield");
  const table = plans
    .map((p) => `· ${p.name} (${p.id}) — ${p.priceDisplay} — ${p.features.join("; ")}`)
    .join("\n");
  const lines = [
    "Buyer: family B2C (child pays). Sea = distribution only — not payer.",
    "Source: @bizmate/billing listPlans(\"shield\") + fixtures/family-plans.json",
    "Unit economics: fixture prices only — no invented live ARR/ARPU.",
    "",
    "—— pricing table (fixture) ——",
    table,
    "",
    lastCheckoutDetail || "(bấm Đăng ký Family Care để tạo sandbox checkout)",
  ];
  return escapeHtml(lines.join("\n"));
}

function render(): void {
  const shadowIds = shadowedPatternIds();
  const swLabel = swReady ? "SW registered" : "SW chưa sẵn sàng";
  const notifLabel =
    notifPermission === "unsupported"
      ? "Notification API không hỗ trợ"
      : `permission=${notifPermission}`;

  app.innerHTML = `
    <div class="banner">
      <div><strong>detector: fixture</strong> · deepfakeScore=fixture · HONESTY: deepfakeScore = fixture meta (not a live detector)</div>
      <div>ENGINE: rule engine + fixture score — not Mate codegen · risk NEVER from LLM</div>
      <div>Payer: family B2C (con trả cho ba/mẹ). Sea/Shopee = distribution only.</div>
      <div class="stack">Stack: <strong>PWA + Service Worker (+ Vite)</strong> — not Expo (CI prove: demo+test EXIT 0 in Node without simulator).</div>
      <div class="stack">Notifications: <strong>local SW / Notification API stub</strong> — not a remote push gateway.</div>
    </div>

    <h1>🛡️ Shield — hộp thư của ${escapeHtml(elderName)}</h1>
    <p class="sub">30s backup · ba/mẹ mua Shopee · Family alert → ${escapeHtml(familyContact)}</p>
    <p class="sub">Per-pattern shadow (7d): ${
      shadowIds.length ? escapeHtml(shadowIds.join(", ")) : "(none)"
    }</p>

    <div class="toolbar">
      <button type="button" id="btn-run">Chạy hộp thư demo</button>
      <button type="button" class="secondary" id="btn-notif">Bật thông báo local</button>
      <button type="button" class="secondary" id="btn-override" ${
        verdicts.some((v) => v.action === "block") ? "" : "disabled"
      }>Human override (FP → allow)</button>
      <button type="button" class="secondary" id="btn-subscribe">Đăng ký Family Care (sandbox)</button>
    </div>

    <p class="live">
      <span class="status-dot ${swReady ? "on" : "off"}"></span>${escapeHtml(swLabel)}
      · ${escapeHtml(notifLabel)}
      · live allow=${live.allow} flag=${live.flag} block=${live.block}
    </p>

    <div id="cards">${renderCards()}</div>

    <div class="section-title">AUDIT SUMMARY</div>
    <pre class="audit">${renderAudit()}</pre>

    <div class="section-title">BILLING (fixture · sandbox)</div>
    <pre class="billing">${renderBilling()}</pre>
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

void registerSW().then(() => {
  render();
});
