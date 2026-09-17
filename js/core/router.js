/**
 * router.js
 * Tiny hash router. Each tool owns a path such as "json-beautifier",
 * addressed at "#/json-beautifier" — independent of the others and
 * bookmarkable/linkable on its own.
 */

export function currentPath() {
  return location.hash.replace(/^#\/?/, "");
}

/**
 * @param {(path: string) => void} onChange called immediately and on
 *   every hash change
 */
export function initRouter(onChange) {
  window.addEventListener("hashchange", () => onChange(currentPath()));
  onChange(currentPath());
}
