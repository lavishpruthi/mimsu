/**
 * tools/json-beautifier.js
 * Registered in js/config/tools.config.js. See that file for the shape
 * every tool module must export.
 */
import { parseJsonSafe } from "../core/json-utils.js";

const INDENT_CHOICES = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tab" }
];

function resolveIndent(v) {
  return v === "tab" ? "\t" : Number(v);
}

export default {
  id: "json-beautifier",
  menuId: "json",
  title: "JSON Beautifier",
  desc: "Pretty-print a JSON document with configurable indentation.",
  runLabel: "Beautify",
  outputExt: "json",
  outputLabel: "Formatted JSON",
  loadingLabel: "FORMATTING",
  sample: `{"id":1,"name":"Ada Lovelace","active":true,"tags":["math","computing"],"address":{"city":"London","zip":null}}`,
  options: [
    { id: "indent", type: "select", label: "Indent", choices: INDENT_CHOICES, default: "2" },
    { id: "sortKeys", type: "checkbox", label: "Sort keys", default: false }
  ],
  run(input, opts) {
    const parsed = parseJsonSafe(input);
    if (!parsed.ok) throw new Error(parsed.message);

    const replacer = opts.sortKeys
      ? (key, val) => {
          if (val && typeof val === "object" && !Array.isArray(val)) {
            return Object.keys(val).sort().reduce((acc, k) => { acc[k] = val[k]; return acc; }, {});
          }
          return val;
        }
      : null;

    return JSON.stringify(parsed.value, replacer, resolveIndent(opts.indent));
  }
};
