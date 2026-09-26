import { NextResponse } from "next/server";

/** Liveness — labeled offline demo, no live tax/payment. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "bookkeeper",
    stack: "next-app-router + route-handlers + better-sqlite3",
    honesty: "offline / sandbox / stub only — NEVER live tax or payment",
  });
}
