/**
 * xml-utils.js
 * XML-specific escaping, name validation and safe parsing, shared by the
 * formatter and the JSON<->XML conversion tools.
 */

export function escapeXmlText(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function escapeXmlAttr(value) {
  return escapeXmlText(value).replace(/"/g, "&quot;");
}

/** True if a string is a valid XML element/attribute name (simplified). */
export function isValidXmlName(name) {
  return /^[A-Za-z_][\w.-]*$/.test(name);
}

/** Fall back to a safe generic tag name when a JSON key isn't XML-legal. */
export function sanitizeTagName(name) {
  return isValidXmlName(name) ? name : "item";
}

/**
 * Parse XML text, throwing a clean, user-facing Error on malformed input.
 * @returns {Document}
 */
export function parseXmlSafe(text) {
  if (text.trim() === "") {
    throw new Error("Input is empty. Paste or type an XML document to continue.");
  }
  const doc = new DOMParser().parseFromString(text, "application/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    const raw = errorNode.textContent.trim().split("\n")[0];
    throw new Error(`Malformed XML: ${raw}`);
  }
  return doc;
}
