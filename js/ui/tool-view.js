/**
 * tool-view.js
 * Builds the full workspace for one tool. Generic across all tools —
 * it reads the tool's `options`, `run()`, and metadata rather than
 * having tool-specific branches, so a new tool needs no changes here.
 */
import { el, clear } from "../core/dom.js";
import { byteSize, lineCount } from "../core/format-utils.js";
import { copyText } from "../core/clipboard.js";
import { downloadText } from "../core/download.js";
import { showToast } from "../core/toast.js";
import { Loader } from "../core/loader.js";

const MIME_BY_EXT = { json: "application/json", xml: "application/xml", txt: "text/plain" };

export function renderTool(tool) {
  const view = document.getElementById("view");
  clear(view);

  const state = {};
  for (const opt of tool.options) state[opt.id] = opt.default;

  view.appendChild(
    el("div", { class: "tool-head" }, [el("h1", {}, tool.title), el("p", {}, tool.desc)])
  );

  /* ---- Toolbar ---- */
  const toolbar = el("div", { class: "toolbar" });
  for (const opt of tool.options) {
    const label = el("label", { class: "opt" }, opt.label + ":");
    if (opt.type === "select") {
      const select = el("select", { onchange: e => { state[opt.id] = e.target.value; } },
        opt.choices.map(c => el("option", { value: c.value }, c.label)));
      select.value = opt.default;
      label.appendChild(select);
    } else if (opt.type === "checkbox") {
      const cb = el("input", { type: "checkbox", onchange: e => { state[opt.id] = e.target.checked; } });
      cb.checked = opt.default;
      label.appendChild(cb);
    } else if (opt.type === "text") {
      label.appendChild(el("input", {
        type: "text",
        value: opt.default,
        oninput: e => { state[opt.id] = e.target.value; }
      }));
    }
    toolbar.appendChild(label);
  }
  toolbar.appendChild(el("div", { class: "spacer" }));

  const sampleBtn = el("button", { class: "btn btn-ghost", type: "button" }, [
    el("span", { class: "glyph" }, "\u2726"), "Load sample"
  ]);
  const clearBtn = el("button", { class: "btn btn-ghost", type: "button" }, [
    el("span", { class: "glyph" }, "\u2715"), "Clear"
  ]);
  const runBtn = el("button", { class: "btn btn-primary", type: "button" }, [
    el("span", { class: "glyph" }, "\u25b6"), tool.runLabel || "Run"
  ]);
  toolbar.appendChild(sampleBtn);
  toolbar.appendChild(clearBtn);
  toolbar.appendChild(runBtn);
  view.appendChild(toolbar);

  /* ---- Loader ---- */
  const loaderMount = el("div");
  view.appendChild(loaderMount);
  const loader = new Loader(loaderMount);

  /* ---- Optional stats grid (validator-style tools) ---- */
  let statsGrid = null;
  if (tool.showStats) {
    statsGrid = el("div", { class: "stats-grid" });
    view.appendChild(statsGrid);
  }

  /* ---- Panes ---- */
  const inputArea = el("textarea", { spellcheck: "false", placeholder: "Paste input here\u2026" });
  const outputArea = el("textarea", { spellcheck: "false", readonly: true, placeholder: "Output will appear here." });

  const copyBtn = el("button", { class: "icon-btn", type: "button" }, [el("span", { class: "glyph" }, "\u29c9"), "Copy"]);
  const downloadBtn = el("button", { class: "icon-btn", type: "button" }, [el("span", { class: "glyph" }, "\u2913"), "Download"]);

  view.appendChild(
    el("div", { class: "panes" }, [
      el("div", { class: "pane" }, [el("div", { class: "pane-label" }, ["Input"]), inputArea]),
      el("div", { class: "pane" }, [
        el("div", { class: "pane-label" }, [tool.outputLabel, el("div", { class: "pane-actions" }, [copyBtn, downloadBtn])]),
        outputArea
      ])
    ])
  );

  const banner = el("div", { class: "banner" });
  view.appendChild(banner);
  const statbar = el("div", { class: "statbar" });
  view.appendChild(statbar);

  /* ---- Helpers ---- */
  function setBanner(kind, message) {
    banner.className = `banner show ${kind}`;
    banner.textContent = message;
  }
  function clearBanner() {
    banner.className = "banner";
    banner.textContent = "";
  }
  function updateStatbar(inputText, outputText, ms) {
    clear(statbar);
    const rows = [
      ["Input", `${byteSize(inputText)} bytes \u00b7 ${lineCount(inputText)} lines`],
      ["Output", `${byteSize(outputText)} bytes \u00b7 ${lineCount(outputText)} lines`],
      ["Time", `${ms.toFixed(1)} ms`]
    ];
    for (const [label, value] of rows) {
      statbar.appendChild(el("span", {}, [el("b", {}, label + ": "), value]));
    }
  }
  function renderStats(stats) {
    if (!statsGrid || !stats) return;
    clear(statsGrid);
    const cards = [
      ["Root type", stats.rootType], ["Objects", stats.objects], ["Arrays", stats.arrays],
      ["Keys", stats.keys], ["Strings", stats.strings], ["Numbers", stats.numbers],
      ["Booleans", stats.booleans], ["Nulls", stats.nulls], ["Max depth", stats.maxDepth]
    ];
    for (const [label, value] of cards) {
      statsGrid.appendChild(el("div", { class: "stat-card" }, [el("div", { class: "n" }, String(value)), el("div", { class: "l" }, label)]));
    }
  }

  /* ---- Execute ---- */
  async function execute() {
    clearBanner();
    const inputText = inputArea.value;
    const wallStart = performance.now();
    try {
      const result = await loader.run(tool.loadingLabel || "PROCESSING", () => tool.run(inputText, state));
      const elapsed = performance.now() - wallStart;
      if (result && typeof result === "object" && "output" in result) {
        outputArea.value = result.output;
        renderStats(result.stats);
        updateStatbar(inputText, result.output, elapsed);
        setBanner("success", "Valid \u2014 no syntax errors found.");
      } else {
        outputArea.value = result;
        updateStatbar(inputText, result, elapsed);
        setBanner("success", `${tool.title} completed.`);
      }
    } catch (err) {
      outputArea.value = "";
      if (statsGrid) clear(statsGrid);
      clear(statbar);
      setBanner("error", err.message);
    }
  }

  runBtn.addEventListener("click", execute);
  sampleBtn.addEventListener("click", () => { inputArea.value = tool.sample; execute(); });
  clearBtn.addEventListener("click", () => {
    inputArea.value = "";
    outputArea.value = "";
    if (statsGrid) clear(statsGrid);
    clear(statbar);
    clearBanner();
    inputArea.focus();
  });
  inputArea.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); execute(); }
  });
  copyBtn.addEventListener("click", async () => {
    if (!outputArea.value) { showToast("Nothing to copy yet"); return; }
    const ok = await copyText(outputArea.value);
    showToast(ok ? "Copied to clipboard" : "Copy failed \u2014 select and copy manually");
  });
  downloadBtn.addEventListener("click", () => {
    if (!outputArea.value) { showToast("Nothing to download yet"); return; }
    const mime = MIME_BY_EXT[tool.outputExt] || "text/plain";
    downloadText(`${tool.id}-output.${tool.outputExt}`, outputArea.value, mime);
    showToast("Download started");
  });
}
