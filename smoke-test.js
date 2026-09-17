const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const html = fs.readFileSync(path.join(__dirname, "dist", "index.html"), "utf8");

(async () => {
  const errors = [];
  const dom = new JSDOM(html, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 4);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  window.console.error = (...args) => errors.push(args.map(String).join(" "));
  window.onerror = (msg) => errors.push(String(msg));

  await new Promise((resolve) => window.addEventListener("load", resolve));
  await new Promise((r) => setTimeout(r, 50));

  const doc = window.document;
  const routes = ["json-beautifier", "json-minifier", "json-validator", "json-to-xml", "xml-to-json", "xml-formatter"];

  for (const route of routes) {
    window.location.hash = "#/" + route;
    await new Promise((r) => setTimeout(r, 30));

    const title = doc.querySelector(".tool-head h1");
    if (!title) { errors.push(`[${route}] tool view did not render`); continue; }

    const sampleBtn = [...doc.querySelectorAll(".btn-ghost")].find(b => b.textContent.includes("Load sample"));
    sampleBtn.dispatchEvent(new window.Event("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 700)); // loader min-duration + margin

    const output = doc.querySelector(".pane textarea[readonly]");
    const banner = doc.querySelector(".banner");
    const ok = output && output.value.trim().length > 0 && banner.classList.contains("success");
    console.log(route, "->", ok ? "OK" : "FAILED", `(output ${output ? output.value.length : 0} chars, banner: ${banner.className})`);
    if (!ok) errors.push(`[${route}] sample run did not produce a successful output`);
  }

  // home + 404
  window.location.hash = "#/";
  await new Promise((r) => setTimeout(r, 30));
  console.log("home ->", doc.querySelectorAll(".index-table tbody tr").length, "tool rows listed");

  window.location.hash = "#/does-not-exist";
  await new Promise((r) => setTimeout(r, 30));
  console.log("404 ->", doc.querySelector(".tool-head h1")?.textContent);

  console.log("\nConsole/window errors captured:", errors.length);
  errors.forEach(e => console.log(" -", e));
  process.exit(errors.length ? 1 : 0);
})();
