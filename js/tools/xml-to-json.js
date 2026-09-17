import { parseXmlSafe } from "../core/xml-utils.js";

function xmlNodeToJson(el) {
  const attrs = {};
  for (const attr of Array.from(el.attributes || [])) attrs[attr.name] = attr.value;

  const childElements = Array.from(el.childNodes).filter(n => n.nodeType === 1);
  const textContent = Array.from(el.childNodes)
    .filter(n => n.nodeType === 3 || n.nodeType === 4)
    .map(n => n.nodeValue)
    .join("")
    .trim();

  const hasAttrs = Object.keys(attrs).length > 0;

  if (childElements.length === 0) {
    if (hasAttrs) {
      const result = { "@attributes": attrs };
      if (textContent !== "") result["#text"] = textContent;
      return result;
    }
    return textContent;
  }

  const result = {};
  if (hasAttrs) result["@attributes"] = attrs;
  for (const child of childElements) {
    const value = xmlNodeToJson(child);
    const name = child.nodeName;
    if (Object.prototype.hasOwnProperty.call(result, name)) {
      if (!Array.isArray(result[name])) result[name] = [result[name]];
      result[name].push(value);
    } else {
      result[name] = value;
    }
  }
  return result;
}

const INDENT_CHOICES = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" }
];

export default {
  id: "xml-to-json",
  menuId: "convert",
  title: "XML \u2192 JSON",
  desc: "Convert an XML document into a JSON document.",
  runLabel: "Convert",
  outputExt: "json",
  outputLabel: "JSON output",
  loadingLabel: "PARSING_XML",
  sample: `<employee id="101">\n  <name>Grace Hopper</name>\n  <skills>\n    <skill>COBOL</skill>\n    <skill>compilers</skill>\n  </skills>\n</employee>`,
  options: [
    { id: "indent", type: "select", label: "Indent", choices: INDENT_CHOICES, default: "2" },
    { id: "compact", type: "checkbox", label: "Minify output", default: false }
  ],
  run(input, opts) {
    const doc = parseXmlSafe(input);
    const rootEl = doc.documentElement;
    const converted = { [rootEl.nodeName]: xmlNodeToJson(rootEl) };
    return opts.compact ? JSON.stringify(converted) : JSON.stringify(converted, null, Number(opts.indent));
  }
};
