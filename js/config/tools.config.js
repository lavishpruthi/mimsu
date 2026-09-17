/**
 * tools.config.js
 * ---------------------------------------------------------------------
 * The single source of truth for which tools exist. Everything else
 * (the sidebar menu, the router, the home directory) is generated from
 * this file, so it's also the only file you touch to add a new tool.
 *
 * HOW TO ADD A NEW TOOL
 *   1. Create js/tools/your-tool.js. It must `export default` an
 *      object shaped like the ones below:
 *        {
 *          id:           "your-tool"        // becomes the route: #/your-tool
 *          menuId:       "json" | "xml" | "convert" | <new id>
 *          title:        "Human title"
 *          desc:         "One sentence, shown under the title."
 *          runLabel:     "Beautify"          // primary button text
 *          outputExt:    "json" | "xml" | "txt"
 *          outputLabel:  "Label above the output pane"
 *          loadingLabel: "SHOUTY_STATUS_WORD"   // shown in the loader
 *          sample:       "example input text"
 *          options:      []   // see OPTION SHAPES below
 *          showStats:    false // optional: renders a stats-card row
 *          run(input, opts)    // returns a string, or {output, stats}
 *        }
 *   2. Import it below and add it to TOOL_MODULES.
 *   3. If it belongs in a new menu group, add that group to MENUS.
 *   That's it — the sidebar, router and home page all update themselves.
 *
 * OPTION SHAPES (tool.options entries)
 *   { id, type: "select",   label, choices: [{value,label}], default }
 *   { id, type: "checkbox", label, default: boolean }
 *   { id, type: "text",     label, default: string }
 * ---------------------------------------------------------------------
 */

import jsonBeautifier from "../tools/json-beautifier.js";
import jsonMinifier from "../tools/json-minifier.js";
import jsonValidator from "../tools/json-validator.js";
import jsonToXml from "../tools/json-to-xml.js";
import xmlToJson from "../tools/xml-to-json.js";
import xmlFormatter from "../tools/xml-formatter.js";

/** Ordered list of registered tool modules. Add new imports here. */
const TOOL_MODULES = [
  jsonBeautifier,
  jsonMinifier,
  jsonValidator,
  jsonToXml,
  xmlToJson,
  xmlFormatter
];

/** Menu group id -> display label, in sidebar order. */
export const MENUS = {
  json: "JSON",
  xml: "XML",
  convert: "Convert"
};

export const TOOL_REGISTRY = TOOL_MODULES;

export const TOOL_BY_ID = Object.fromEntries(TOOL_REGISTRY.map(t => [t.id, t]));

/** Tools grouped by menuId, in MENUS order. */
export function toolsByMenu() {
  const groups = Object.keys(MENUS).map(menuId => ({
    menuId,
    label: MENUS[menuId],
    tools: TOOL_REGISTRY.filter(t => t.menuId === menuId)
  }));
  return groups.filter(g => g.tools.length > 0);
}
