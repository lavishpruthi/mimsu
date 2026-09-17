/**
 * download.js
 * Saves generated text output as a file. Pure client-side: builds a
 * Blob, briefly attaches an anchor with a download attribute, and
 * revokes the object URL once the browser has taken it.
 */
export function downloadText(filename, text, mimeType = "text/plain") {
  const blob = new Blob([text], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
