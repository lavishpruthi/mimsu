/**
 * theme-toggle.js
 * Cycles data-theme between "auto" (unset, follows the OS), "dark" and
 * "light". Preference is remembered per-browser via localStorage; if
 * storage is unavailable the toggle still works for the current visit.
 */
const STORAGE_KEY = "data-tools-theme";

export function initThemeToggle() {
  const button = document.getElementById("themeToggle");

  let stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage unavailable */ }
  if (stored === "light" || stored === "dark") {
    document.documentElement.setAttribute("data-theme", stored);
  }
  updateLabel(button);

  button.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : current === "light" ? null : "dark";

    if (next) document.documentElement.setAttribute("data-theme", next);
    else document.documentElement.removeAttribute("data-theme");

    try {
      if (next) localStorage.setItem(STORAGE_KEY, next);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* storage unavailable, theme still applies for this session */ }

    updateLabel(button);
  });
}

function updateLabel(button) {
  const current = document.documentElement.getAttribute("data-theme");
  button.textContent = "theme: " + (current || "auto");
}
