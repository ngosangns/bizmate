/**
 * Deterministic sales pipeline: lead → quote → order.
 */

export type SalesStage = "lead" | "quote" | "order";

export interface Lead {
  id: string;
  name: string;
  stage: SalesStage;
  amountVnd: number;
  notes?: string;
}

export interface PipelineResult {
  leads: Lead[];
  advanced: Array<{ id: string; from: SalesStage; to: SalesStage }>;
  blocked: Array<{ id: string; reason: string }>;
  persisted: boolean;
}

const STAGE_ORDER: SalesStage[] = ["lead", "quote", "order"];

export function advanceStage(current: SalesStage): SalesStage | null {
  const idx = STAGE_ORDER.indexOf(current);
  if (idx < 0 || idx >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1]!;
}

/**
 * Advance each lead one stage. Moving into `order` requires approval.
 */
export function processPipeline(
  leads: Lead[],
  approved: boolean
): PipelineResult {
  const advanced: PipelineResult["advanced"] = [];
  const blocked: PipelineResult["blocked"] = [];
  const next: Lead[] = [];

  for (const lead of leads) {
    const to = advanceStage(lead.stage);
    if (!to) {
      next.push({ ...lead });
      blocked.push({ id: lead.id, reason: "already at order" });
      continue;
    }
    if (to === "order" && !approved) {
      next.push({ ...lead });
      blocked.push({
        id: lead.id,
        reason: "human approval required before order",
      });
      continue;
    }
    advanced.push({ id: lead.id, from: lead.stage, to });
    next.push({ ...lead, stage: to });
  }

  return {
    leads: next,
    advanced,
    blocked,
    persisted: approved || advanced.every((a) => a.to !== "order"),
  };
}
