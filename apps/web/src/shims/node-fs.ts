/** Browser stub for node:fs — runtime audit JSONL is no-op in web. */
const noop = (): void => {};
export const mkdirSync = noop;
export const appendFileSync = noop;
export const unlinkSync = noop;
export const existsSync = (): boolean => false;
export const readFileSync = (): string => "";
export default {
  mkdirSync,
  appendFileSync,
  unlinkSync,
  existsSync,
  readFileSync,
};
