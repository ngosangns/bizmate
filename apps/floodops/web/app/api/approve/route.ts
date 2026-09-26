import { NextResponse } from "next/server";
import {
  defaultAuditJsonlPath,
  resolveHumanAction,
} from "../../../../src/audit";
import {
  defaultStatePath,
  readWaveState,
  writeWaveState,
} from "../../../../src/state";
import type { ProposedAction } from "../../../../src/engine";

export const dynamic = "force-dynamic";

/**
 * POST /api/approve — HUMAN HITL for awaiting_human rows (sandbox).
 * Body: { orderId, verdict?: "approve"|"reject", actor?: string, note?: string }
 * approve: propose_refund → Duyệt hoàn; other → Ops duyệt / Apply
 * reject: Từ chối → status proposed + audit
 */
export async function POST(req: Request) {
  let body: {
    orderId?: string;
    verdict?: string;
    actor?: string;
    note?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid JSON body", honesty: "sandbox" },
      { status: 400 }
    );
  }

  const orderId = body.orderId?.trim();
  if (!orderId) {
    return NextResponse.json(
      { error: "orderId required", honesty: "sandbox" },
      { status: 400 }
    );
  }

  const verdict =
    body.verdict === "reject" ? ("reject" as const) : ("approve" as const);
  const actor = (body.actor?.trim() || "ops-ui-demo").slice(0, 80);

  const statePath = defaultStatePath();
  const state = readWaveState(statePath);
  if (!state || !state.actions?.length) {
    return NextResponse.json(
      {
        error:
          "no wave state — chạy npm run worker -w @bizmate/floodops trước",
        honesty: "sandbox",
      },
      { status: 404 }
    );
  }

  const actions = state.actions as ProposedAction[];
  const auditPath = defaultAuditJsonlPath();

  try {
    const updated = resolveHumanAction(actions, orderId, actor, verdict, {
      auditPath,
      note: body.note,
    });
    state.actions = actions;
    state.updatedAt = new Date().toISOString();
    writeWaveState(state, statePath);

    return NextResponse.json({
      ok: true,
      honesty:
        "SANDBOX · HUMAN decide only — không live SPX / không payment · COD ≠ invoice",
      verdict,
      action: updated,
      updatedAt: state.updatedAt,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: msg, honesty: "sandbox" },
      { status: 400 }
    );
  }
}
