/**
 * SQLite ledger via better-sqlite3 — offline-first persistence for Bookkeeper.
 * File under apps/bookkeeper/data/bookkeeper.db (gitignored).
 * Seed on --reset / first open from vendor-an-dong fixture.
 * Labeled offline — NEVER live tax portal.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import type { AuditEvent, AuditEventType } from "./audit.js";
import type { VendorState } from "./agent.js";
import type { LedgerEntry } from "./rules.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULT_DB_PATH = path.join(
  __dirname,
  "../../data/bookkeeper.db"
);

export const DEFAULT_FIXTURE_PATH = path.join(
  __dirname,
  "../../fixtures/vendor-an-dong.json"
);

export interface SeedVendor {
  vendorId: string;
  displayName: string;
  ytdRevenueVnd: number;
}

function ensureDir(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function loadSeed(fixturePath = DEFAULT_FIXTURE_PATH): SeedVendor {
  const raw = JSON.parse(fs.readFileSync(fixturePath, "utf8")) as SeedVendor;
  return {
    vendorId: raw.vendorId,
    displayName: raw.displayName,
    ytdRevenueVnd: raw.ytdRevenueVnd,
  };
}

export interface LedgerDb {
  db: Database.Database;
  path: string;
  seed: SeedVendor;
  reset(): void;
  loadState(vendorId?: string): VendorState;
  saveState(state: VendorState): void;
  appendAudit(event: Omit<AuditEvent, "ts"> & { ts?: string }): AuditEvent;
  listAudit(): AuditEvent[];
  close(): void;
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS vendor (
      vendor_id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      ytd_revenue_vnd INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ledger_entry (
      id TEXT PRIMARY KEY,
      vendor_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS verified_fingerprint (
      proposal_id TEXT PRIMARY KEY,
      vendor_id TEXT NOT NULL,
      fingerprint TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_event (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL,
      type TEXT NOT NULL,
      utterance_id TEXT,
      detail TEXT NOT NULL,
      ytd_vnd INTEGER
    );
  `);
}

function seedVendor(db: Database.Database, seed: SeedVendor): void {
  db.prepare(
    `INSERT OR REPLACE INTO vendor (vendor_id, display_name, ytd_revenue_vnd)
     VALUES (?, ?, ?)`
  ).run(seed.vendorId, seed.displayName, seed.ytdRevenueVnd);
}

/**
 * Open (or create) the SQLite ledger. Pass `:memory:` for tests/CI.
 * `reset: true` wipes tables and re-seeds YTD from fixture.
 */
export function openLedgerDb(opts: {
  dbPath?: string;
  fixturePath?: string;
  reset?: boolean;
} = {}): LedgerDb {
  const dbPath = opts.dbPath ?? DEFAULT_DB_PATH;
  const seed = loadSeed(opts.fixturePath);
  if (dbPath !== ":memory:") ensureDir(dbPath);

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  migrate(db);

  const api: LedgerDb = {
    db,
    path: dbPath,
    seed,
    reset() {
      db.exec(`
        DELETE FROM ledger_entry;
        DELETE FROM verified_fingerprint;
        DELETE FROM audit_event;
        DELETE FROM vendor;
      `);
      seedVendor(db, seed);
    },
    loadState(vendorId = seed.vendorId): VendorState {
      let row = db
        .prepare(
          `SELECT vendor_id, ytd_revenue_vnd FROM vendor WHERE vendor_id = ?`
        )
        .get(vendorId) as
        | { vendor_id: string; ytd_revenue_vnd: number }
        | undefined;

      if (!row) {
        seedVendor(db, seed);
        row = {
          vendor_id: seed.vendorId,
          ytd_revenue_vnd: seed.ytdRevenueVnd,
        };
      }

      const entries = db
        .prepare(
          `SELECT payload_json FROM ledger_entry WHERE vendor_id = ? ORDER BY created_at ASC`
        )
        .all(vendorId) as { payload_json: string }[];

      const fps = db
        .prepare(
          `SELECT proposal_id, fingerprint FROM verified_fingerprint WHERE vendor_id = ?`
        )
        .all(vendorId) as { proposal_id: string; fingerprint: string }[];

      const verifiedFingerprints: Record<string, string> = {};
      for (const f of fps) verifiedFingerprints[f.proposal_id] = f.fingerprint;

      return {
        vendorId: row.vendor_id,
        ytdRevenueVnd: row.ytd_revenue_vnd,
        ledger: entries.map((e) => JSON.parse(e.payload_json) as LedgerEntry),
        verifiedFingerprints,
      };
    },
    saveState(state: VendorState): void {
      const tx = db.transaction(() => {
        db.prepare(
          `INSERT OR REPLACE INTO vendor (vendor_id, display_name, ytd_revenue_vnd)
           VALUES (?, ?, ?)`
        ).run(state.vendorId, seed.displayName, state.ytdRevenueVnd);

        db.prepare(`DELETE FROM ledger_entry WHERE vendor_id = ?`).run(
          state.vendorId
        );
        const ins = db.prepare(
          `INSERT INTO ledger_entry (id, vendor_id, payload_json, status)
           VALUES (?, ?, ?, ?)`
        );
        for (const entry of state.ledger) {
          ins.run(
            entry.id,
            state.vendorId,
            JSON.stringify(entry),
            entry.status
          );
        }

        db.prepare(
          `DELETE FROM verified_fingerprint WHERE vendor_id = ?`
        ).run(state.vendorId);
        const fpIns = db.prepare(
          `INSERT INTO verified_fingerprint (proposal_id, vendor_id, fingerprint)
           VALUES (?, ?, ?)`
        );
        for (const [id, fp] of Object.entries(state.verifiedFingerprints)) {
          fpIns.run(id, state.vendorId, fp);
        }
      });
      tx();
    },
    appendAudit(event): AuditEvent {
      const row: AuditEvent = {
        ts: event.ts ?? new Date().toISOString(),
        type: event.type,
        utteranceId: event.utteranceId,
        detail: event.detail,
        ytdVnd: event.ytdVnd,
      };
      db.prepare(
        `INSERT INTO audit_event (ts, type, utterance_id, detail, ytd_vnd)
         VALUES (?, ?, ?, ?, ?)`
      ).run(
        row.ts,
        row.type,
        row.utteranceId ?? null,
        row.detail,
        row.ytdVnd ?? null
      );
      return row;
    },
    listAudit(): AuditEvent[] {
      const rows = db
        .prepare(
          `SELECT ts, type, utterance_id, detail, ytd_vnd FROM audit_event ORDER BY id ASC`
        )
        .all() as {
        ts: string;
        type: AuditEventType;
        utterance_id: string | null;
        detail: string;
        ytd_vnd: number | null;
      }[];
      return rows.map((r) => ({
        ts: r.ts,
        type: r.type,
        utteranceId: r.utterance_id ?? undefined,
        detail: r.detail,
        ytdVnd: r.ytd_vnd ?? undefined,
      }));
    },
    close(): void {
      db.close();
    },
  };

  if (opts.reset) {
    api.reset();
  } else {
    const count = (
      db.prepare(`SELECT COUNT(*) AS n FROM vendor`).get() as { n: number }
    ).n;
    if (count === 0) seedVendor(db, seed);
  }

  return api;
}
