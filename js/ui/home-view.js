/**
 * home-view.js
 * The "/" route: a directory of every registered tool, generated from
 * the tool registry so it never needs manual updates.
 */
import { el, clear } from "../core/dom.js";
import { TOOL_REGISTRY, MENUS } from "../config/tools.config.js";

export function renderHome() {
  const view = document.getElementById("view");
  clear(view);

  view.appendChild(
    el("div", { class: "home-head" }, [
      el("h1", {}, "Data Tools"),
      el("p", {}, "A small set of JSON and XML utilities. Each tool lives at its own address below \u2014 bookmark or link directly to the one you need.")
    ])
  );

  const table = el("table", { class: "index-table" });
  table.appendChild(
    el("thead", {}, el("tr", {}, [el("th", {}, "Tool"), el("th", {}, "Path"), el("th", {}, "Description")]))
  );
  const tbody = el("tbody");
  for (const tool of TOOL_REGISTRY) {
    tbody.appendChild(
      el("tr", {}, [
        el("td", {}, [
          el("a", { href: `#/${tool.id}` }, tool.title),
          el("span", { class: "menu-pill" }, MENUS[tool.menuId] || tool.menuId)
        ]),
        el("td", { class: "index-path" }, `#/${tool.id}`),
        el("td", { class: "index-desc" }, tool.desc)
      ])
    );
  }
  table.appendChild(tbody);
  view.appendChild(table);
}
