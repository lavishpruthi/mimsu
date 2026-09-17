#!/usr/bin/env node
/**
 * build-bundle.js
 * Dev-only tool: concatenates the segregated source files into one
 * self-contained HTML file for environments that require a single file
 * (e.g. the Claude Artifact preview). The real, maintained source is
 * the multi-file project this script reads from — this output is a
 * generated artifact, not something to hand-edit.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const DEFAULT_EXPORT_NAMES = {
  "js/tools/json-beautifier.js": "jsonBeautifier",
  "js/tools/json-minifier.js": "jsonMinifier",
  "js/tools/json-validator.js": "jsonValidator",
  "js/tools/json-to-xml.js": "jsonToXml",
  "js/tools/xml-to-json.js": "xmlToJson",
  "js/tools/xml-formatter.js": "xmlFormatter"
};

const JS_ORDER = [
  "js/core/dom.js",
  "js/core/format-utils.js",
  "js/core/json-utils.js",
  "js/core/xml-utils.js",
  "js/core/clipboard.js",
  "js/core/download.js",
  "js/core/toast.js",
  "js/core/loader.js",
  "js/core/router.js",
  "js/tools/json-beautifier.js",
  "js/tools/json-minifier.js",
  "js/tools/json-validator.js",
  "js/tools/json-to-xml.js",
  "js/tools/xml-to-json.js",
  "js/tools/xml-formatter.js",
  "js/config/tools.config.js",
  "js/ui/sidebar.js",
  "js/ui/home-view.js",
  "js/ui/tool-view.js",
  "js/ui/theme-toggle.js",
  "js/app.js"
];

const CSS_ORDER = [
  "css/variables.css",
  "css/base.css",
  "css/layout.css",
  "css/buttons.css",
  "css/components.css",
  "css/loader.css"
];

function stripModuleSyntax(filePath, src) {
  let out = src
    .split("\n")
    .filter((line) => !/^\s*import\s.+from\s+["'].+["'];?\s*$/.test(line))
    .join("\n");

  const defaultName = DEFAULT_EXPORT_NAMES[filePath];
  if (defaultName) {
    // Tool files each declare their own module-local helper consts (e.g.
    // INDENT_CHOICES). Wrapping in an IIFE keeps those private per file
    // instead of colliding in the bundle's shared top-level scope.
    out = out.replace(/export default \{/, "return {");
    out = `const ${defaultName} = (function () {\n${out}\n})();`;
    return out;
  }
  out = out.replace(/^export (function|class|const|async function)/gm, "$1");
  return out;
}

const jsBundle = JS_ORDER.map((f) => `/* ---- ${f} ---- */\n${stripModuleSyntax(f, read(f))}`).join("\n\n");
const cssBundle = CSS_ORDER.map((f) => `/* ---- ${f} ---- */\n${read(f)}`).join("\n\n");

const shell = read("index.html")
  .replace(/<link rel="stylesheet" href="css\/[^"]+">\n?/g, "")
  .replace(/<script type="module" src="js\/app\.js"><\/script>/, `<script>\n${jsBundle}\n</script>`)
  .replace("</head>", `<style>\n${cssBundle}\n</style>\n</head>`);

const outPath = path.join(ROOT, "dist", "index.html");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, shell, "utf8");
console.log("Bundled ->", outPath);
