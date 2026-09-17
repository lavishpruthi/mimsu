import { parseXmlSafe, escapeXmlAttr } from "../core/xml-utils.js";

function prettyPrintXml(xmlText, indentUnit) {
  const doc = parseXmlSafe(xmlText);
  const out = [];

  function walk(node, depth) {
    if (node.nodeType === 3) {
      const text = node.nodeValue.trim();
      if (text !== "") out.push(indentUnit.repeat(depth) + text);
      return;
    }
    if (node.nodeType === 4) {
      out.push(indentUnit.repeat(depth) + `<![CDATA[${node.nodeValue}]]>`);
      return;
    }
    if (node.nodeType === 8) {
      out.push(indentUnit.repeat(depth) + `<!--${node.nodeValue}-->`);
      return;
    }
    if (node.nodeType !== 1) return;

    const pad = indentUnit.repeat(depth);
    const attrs = Array.from(node.attributes || [])
      .map(a => ` ${a.name}="${escapeXmlAttr(a.value)}"`)
      .join("");

    const childNodes = Array.from(node.childNodes).filter(n => !(n.nodeType === 3 && n.nodeValue.trim() === ""));

    if (childNodes.length === 0) {
      out.push(`${pad}<${node.nodeName}${attrs}/>`);
      return;
    }
    if (childNodes.length === 1 && childNodes[0].nodeType === 3) {
      out.push(`${pad}<${node.nodeName}${attrs}>${childNodes[0].nodeValue.trim()}</${node.nodeName}>`);
      return;
    }
    out.push(`${pad}<${node.nodeName}${attrs}>`);
    for (const child of childNodes) walk(child, depth + 1);
    out.push(`${pad}</${node.nodeName}>`);
  }

  if (doc.firstChild && doc.firstChild.nodeType === 7) {
    out.push(`<?${doc.firstChild.target} ${doc.firstChild.data}?>`);
  }
  walk(doc.documentElement, 0);
  return out.join("\n");
}

const INDENT_CHOICES = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tab" }
];

export default {
  id: "xml-formatter",
  menuId: "xml",
  title: "XML Formatter",
  desc: "Pretty-print and re-indent an XML document.",
  runLabel: "Format",
  outputExt: "xml",
  outputLabel: "Formatted XML",
  loadingLabel: "FORMATTING",
  sample: `<order id="A-1042"><item sku="X1" qty="2"/><item sku="X2" qty="1"/><total>58.5</total></order>`,
  options: [
    { id: "indent", type: "select", label: "Indent", choices: INDENT_CHOICES, default: "2" }
  ],
  run(input, opts) {
    const unit = opts.indent === "tab" ? "\t" : " ".repeat(Number(opts.indent));
    return prettyPrintXml(input, unit);
  }
};
