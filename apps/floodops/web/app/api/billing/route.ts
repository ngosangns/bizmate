import { NextResponse } from "next/server";
import { loadBillingSeats } from "../../../lib/load-state";

export const dynamic = "force-dynamic";

/** GET /api/billing — listPlans + offline_stub checkout (labeled) */
export async function GET() {
  const seats = loadBillingSeats();
  return NextResponse.json({
    honesty:
      "STUB · offline_stub / cost-center — không cổng thanh toán live · not live SPX pay",
    ...seats,
  });
}
