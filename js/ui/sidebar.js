/**
 * sidebar.js
 * Renders the left navigation from toolsByMenu(), so adding a tool to
 * tools.config.js automatically adds its entry here.
 */
import { el, clear } from "../core/dom.js";
import { toolsByMenu } from "../config/tools.config.js";

export function renderSidebar(currentToolId) {
  const sidebar = document.getElementById("sidebar");
  clear(sidebar);

  for (const group of toolsByMenu()) {
    const groupEl = el("div", { class: "side-group" });
    groupEl.appendChild(el("div", { class: "side-group-label" }, group.label));
    for (const tool of group.tools) {
      const isActive = tool.id === currentToolId;
      groupEl.appendChild(
        el("a", { class: "side-link" + (isActive ? " active" : ""), href: `#/${tool.id}` }, [
          el("span", { class: "dot" }),
          tool.title
        ])
      );
    }
    sidebar.appendChild(groupEl);
  }
}
