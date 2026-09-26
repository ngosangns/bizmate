
## CLI npm arg-forward fix (2026-09-26)
Root `package.json`: `mate:generate`/`judge` → `node apps/.../dist/cli.js` so `npm run … -- --flags` works (was broken via `npm run -w` without `--`).
Verified: mate:generate exit 0; judge exit 0 score 100.
