/**
 * app.js
 * Entry point (loaded as a module from index.html). Wires the router to
 * the sidebar and either the home view or a tool view.
 */
import { initRouter } from "./core/router.js";
import { initThemeToggle } from "./ui/theme-toggle.js";
import { renderSidebar } from "./ui/sidebar.js";
import { renderHome } from "./ui/home-view.js";
import { renderTool } from "./ui/tool-view.js";
import { TOOL_BY_ID } from "./config/tools.config.js";
import { el, clear } from "./core/dom.js";

function handleRoute(path) {
  document.getElementById("routepath").textContent = "/" + path;

  if (path === "") {
    renderSidebar(null);
    renderHome();
    return;
  }

  const tool = TOOL_BY_ID[path];
  if (!tool) {
    renderSidebar(null);
    const view = document.getElementById("view");
    clear(view);
    view.appendChild(
      el("div", { class: "tool-head" }, [
        el("h1", {}, "Not found"),
        el("p", {}, `There's no tool at "/${path}". Choose one from the menu on the left.`)
      ])
    );
    return;
  }

  renderSidebar(tool.id);
  renderTool(tool);
}

initThemeToggle();
initRouter(handleRoute);
