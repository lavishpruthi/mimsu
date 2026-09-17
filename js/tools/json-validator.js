import { parseJsonSafe, analyzeJson } from "../core/json-utils.js";

export default {
  id: "json-validator",
  menuId: "json",
  title: "JSON Parser & Validator",
  desc: "Validate JSON syntax and inspect the document's structure.",
  runLabel: "Validate",
  outputExt: "json",
  outputLabel: "Formatted output",
  loadingLabel: "VALIDATING",
  sample: `{"orderId":"A-1042","items":[{"sku":"X1","qty":2},{"sku":"X2","qty":1}],"total":58.5,"paid":true,"notes":null}`,
  options: [],
  showStats: true,
  run(input) {
    const parsed = parseJsonSafe(input);
    if (!parsed.ok) throw new Error(parsed.message);
    const stats = analyzeJson(parsed.value);
    return { output: JSON.stringify(parsed.value, null, 2), stats };
  }
};
