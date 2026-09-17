/**
 * json-utils.js
 * JSON-specific parsing and structural analysis, shared by the
 * beautifier, minifier and validator tools.
 */
import { indexToLineCol } from "./format-utils.js";

/**
 * Parse JSON and normalize errors into an actionable message.
 * @returns {{ok:true, value:*} | {ok:false, message:string}}
 */
export function parseJsonSafe(text) {
  if (text.trim() === "") {
    return { ok: false, message: "Input is empty. Paste or type a JSON document to continue." };
  }
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    const match = /position (\d+)/.exec(err.message);
    if (match) {
      const pos = Number(match[1]);
      const { line, column } = indexToLineCol(text, pos);
      return { ok: false, message: `${err.message}\nLocation: line ${line}, column ${column}.` };
    }
    return { ok: false, message: err.message };
  }
}

/** Walk a parsed JSON value and collect structural statistics. */
export function analyzeJson(value) {
  let objects = 0, arrays = 0, strings = 0, numbers = 0, booleans = 0, nulls = 0, keys = 0;
  let maxDepth = 0;

  (function walk(v, depth) {
    maxDepth = Math.max(maxDepth, depth);
    if (v === null) { nulls++; return; }
    if (Array.isArray(v)) {
      arrays++;
      for (const item of v) walk(item, depth + 1);
      return;
    }
    if (typeof v === "object") {
      objects++;
      const ks = Object.keys(v);
      keys += ks.length;
      for (const k of ks) walk(v[k], depth + 1);
      return;
    }
    if (typeof v === "string") strings++;
    else if (typeof v === "number") numbers++;
    else if (typeof v === "boolean") booleans++;
  })(value, 0);

  return {
    rootType: Array.isArray(value) ? "array" : value === null ? "null" : typeof value,
    objects, arrays, strings, numbers, booleans, nulls, keys, maxDepth
  };
}
