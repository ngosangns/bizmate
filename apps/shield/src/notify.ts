/**
 * Local notification helpers for PWA Service Worker / Notification API.
 * Pure builders — browser SW posts these payloads; CLI tests cover shape.
 */

import type { ShieldVerdict } from "./engine.js";

export type NotifyPermission = "default" | "granted" | "denied" | "unsupported";

export interface FamilyNotifyPayload {
  title: string;
  body: string;
  tag: string;
  /** Honesty: local SW stub — not a push gateway. */
  honesty: "local-sw-stub";
  action: ShieldVerdict["action"];
  messageId: string;
}

/** Build a family-facing local notification from a verdict (BLOCK/FLAG only). */
export function buildFamilyNotify(
  verdict: ShieldVerdict,
  elderName = "ba/mẹ"
): FamilyNotifyPayload | null {
  if (verdict.action !== "block" && verdict.action !== "flag") return null;
  const title =
    verdict.action === "block"
      ? "Shield đã chặn tin nguy hiểm"
      : "Shield cảnh báo tin đáng ngờ";
  const body =
    verdict.familyAlert ??
    (verdict.action === "block"
      ? `Con ơi, Shield vừa chặn một tin nguy hiểm gửi cho ${elderName} — hãy kiểm tra giúp.`
      : `Con ơi, Shield vừa cảnh báo một tin đáng ngờ gửi cho ${elderName} — hãy xem giúp.`);
  return {
    title,
    body,
    tag: `shield-${verdict.messageId}-${verdict.action}`,
    honesty: "local-sw-stub",
    action: verdict.action,
    messageId: verdict.messageId,
  };
}

/** SW message type from page → service worker. */
export const SW_SHOW_NOTIFY = "shield:show-notify" as const;

export interface SwShowNotifyMessage {
  type: typeof SW_SHOW_NOTIFY;
  payload: FamilyNotifyPayload;
}
