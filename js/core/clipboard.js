/**
 * clipboard.js
 * Copy-to-clipboard with a manual fallback for browsers or contexts
 * where the async Clipboard API is unavailable.
 */

/** @returns {Promise<boolean>} whether the copy succeeded */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch (fallbackErr) {
      return false;
    }
  }
}
