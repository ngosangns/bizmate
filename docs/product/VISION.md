# Biz Mate — Vision

## One-liner
An autonomous coding agent that **writes** sales and accounting workflows as deterministic apps — Evoloop for business ops.

## Problem
SMEs and sellers need reliable ops software (ledger, invoice drafts, sales pipeline). Building that by hand is slow; bolting a chat LLM into the app is unreliable for money/tax. Hackathon winners prove that **white-box code** the agent evolves beats black-box policy nets when auditability matters.

## Solution shape
1. **Mate** takes a domain brief (e.g. “hộ kinh doanh kê khai + hóa đơn”) and emits a workflow package (TS modules + JSON schema + fixtures).
2. **Judge** (Laya-style static + SLM high-level) scores whether the generated code matches intent, safety, and contracts.
3. **Human** approves publish.
4. **Runtime** executes the approved workflow with zero LLM on the critical path.
5. **EM** orchestrates parallel agents like an engineering manager: issues, ownership, acceptance, merge.

## Headline demo moment
Vendor voice note → Mate generates / evolves bookkeeping workflow → Judge passes → human approves → Runtime posts ledger entry and tracks 1B VND threshold — all offline-replayable.

## Build directions (Sea x OpenAI)
Primary: **AI-Native Products & Operations** (+ Deep Domain for VN tax/accounting fixtures).
