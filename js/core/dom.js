/**
 * dom.js
 * Minimal element-builder helper. Keeps UI modules free of innerHTML
 * (and therefore free of injection risk) since every value is set via
 * DOM APIs or textContent, never parsed as markup.
 */

/**
 * @param {string} tag
 * @param {Object<string, any>} [attrs]
 * @param {(Node|string|null|undefined)[] | Node | string} [children]
 * @returns {HTMLElement}
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") {
      node.className = value;
    } else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2), value);
    } else if (value !== false && value !== null && value !== undefined) {
      node.setAttribute(key, value === true ? "" : value);
    }
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

/** Remove all children of a node. */
export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}
