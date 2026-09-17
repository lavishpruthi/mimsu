/**
 * format-utils.js
 * Small, dependency-free helpers used by every tool for stats and
 * error-location reporting.
 */

/** UTF-8 byte length of a string. */
export function byteSize(str) {
  return new TextEncoder().encode(str).length;
}

export function lineCount(str) {
  if (str === "") return 0;
  return str.split("\n").length;
}

/** Convert a character index into a 1-based {line, column}. */
export function indexToLineCol(str, index) {
  const upto = str.slice(0, index);
  const lines = upto.split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}
