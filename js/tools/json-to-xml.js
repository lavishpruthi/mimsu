import { parseJsonSafe } from "../core/json-utils.js";
import { escapeXmlText, isValidXmlName, sanitizeTagName } from "../core/xml-utils.js";

function jsonToXml(value, rootName, indentUnit, includeDeclaration) {
  const lines = [];
  const root = sanitizeTagName(rootName || "root");

  function emit(tag, val, depth) {
    const pad = indentUnit.repeat(depth);
    if (val === null || val === undefined) {
      lines.push(`${pad}<${tag}/>`);
      return;
    }
    if (Array.isArray(val)) {
      if (val.length === 0) { lines.push(`${pad}<${tag}/>`); return; }
      for (const item of val) emit(tag, item, depth);
      return;
    }
    if (typeof val === "object") {
      const keys = Object.keys(val);
      if (keys.length === 0) { lines.push(`${pad}<${tag}/>`); return; }
      lines.push(`${pad}<${tag}>`);
      for (const key of keys) emit(sanitizeTagName(key), val[key], depth + 1);
      lines.push(`${pad}</${tag}>`);
      return;
    }
    const text = escapeXmlText(val);
    lines.push(text === "" ? `${pad}<${tag}/>` : `${pad}<${tag}>${text}</${tag}>`);
  }

  emit(root, value, 0);
  const decl = includeDeclaration ? '<?xml version="1.0" encoding="UTF-8"?>\n' : "";
  return decl + lines.join("\n");
}

const INDENT_CHOICES = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" }
];

export default {
  id: "json-to-xml",
  menuId: "convert",
  title: "JSON \u2192 XML",
  desc: "Convert a JSON document into an XML document.",
  runLabel: "Convert",
  outputExt: "xml",
  outputLabel: "XML output",
  loadingLabel: "BUILDING_XML",
  sample: `{"employee":{"id":101,"name":"Grace Hopper","skills":["COBOL","compilers"],"manager":null}}`,
  options: [
    { id: "root", type: "text", label: "Root element", default: "root" },
    { id: "indent", type: "select", label: "Indent", choices: INDENT_CHOICES, default: "2" },
    { id: "declaration", type: "checkbox", label: "XML declaration", default: true }
  ],
  run(input, opts) {
    const parsed = parseJsonSafe(input);
    if (!parsed.ok) throw new Error(parsed.message);
    if (opts.root && !isValidXmlName(opts.root)) {
      throw new Error(`"${opts.root}" is not a valid XML element name. Use letters, digits, "_", "-", "." and start with a letter or underscore.`);
    }
    const indentUnit = " ".repeat(Number(opts.indent));
    return jsonToXml(parsed.value, opts.root || "root", indentUnit, opts.declaration);
  }
};
