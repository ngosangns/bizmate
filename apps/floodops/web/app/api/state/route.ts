import { NextResponse } from "next/server";
import { loadWaveState } from "../../../lib/load-state";

export const dynamic = "force-dynamic";

/** GET /api/state — sandbox wave JSON for ops UI / debugging */
export async function GET() {
  const state = loadWaveState();
  if (!state) {
    return NextResponse.json(
      { error: "no fixture/state", honesty: "sandbox" },
      { status: 404 }
    );
  }
  return NextResponse.json(state);
}
