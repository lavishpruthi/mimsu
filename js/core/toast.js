/**
 * toast.js
 * A single reused toast element, shown briefly for transient feedback
 * (copy succeeded, download unavailable, etc.).
 */
let timer = null;

export function showToast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove("show"), 1800);
}
