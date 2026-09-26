"use server";

/**
 * HITL server actions — Duyệt / Từ chối / propose / Pro sandbox.
 * Offline SQLite ledger · NEVER live tax / payment.
 */
import {
  approvePending,
  getScreenState,
  openProSandbox,
  proposeUtterance,
  refusePending,
  resetUiSession,
  type ScreenState,
} from "../lib/session.js";

export type { ScreenState };

export async function actionGetState(): Promise<ScreenState> {
  return getScreenState();
}

export async function actionReset(): Promise<ScreenState> {
  return resetUiSession();
}

export async function actionPropose(text: string): Promise<ScreenState> {
  return proposeUtterance(text.trim());
}

export async function actionRefuse(reason?: string): Promise<ScreenState> {
  return refusePending(reason);
}

export async function actionApprove(): Promise<ScreenState> {
  return approvePending();
}

export async function actionOpenPro(): Promise<{
  screen: ScreenState;
  billingLines: string[];
}> {
  return openProSandbox();
}
