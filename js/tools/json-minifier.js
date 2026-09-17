import { parseJsonSafe } from "../core/json-utils.js";

export default {
  id: "json-minifier",
  menuId: "json",
  title: "JSON Minifier",
  desc: "Strip whitespace and produce a compact single-line payload.",
  runLabel: "Minify",
  outputExt: "json",
  outputLabel: "Minified JSON",
  loadingLabel: "MINIFYING",
  sample: `{\n  "id": 1,\n  "name": "Ada Lovelace",\n  "active": true,\n  "tags": ["math", "computing"]\n}`,
  options: [],
  run(input) {
    const parsed = parseJsonSafe(input);
    if (!parsed.ok) throw new Error(parsed.message);
    return JSON.stringify(parsed.value);
  }
};
