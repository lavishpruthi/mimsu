/**
 * loader.js
 * A reusable, on-theme "processing" indicator built from the symbols of
 * the subject matter (JSON/XML delimiters) instead of a generic spinner:
 * pulsing brace/angle-bracket glyphs, a scanning gradient bar, and a
 * status label that decrypts into place with a text-scramble effect.
 */
import { el } from "./dom.js";

const SCRAMBLE_CHARS = "{}[]<>/\\:\",;|_=-";

/** Classic "text scramble" reveal: settles character-by-character. */
class TextScramble {
  constructor(node) {
    this.node = node;
    this.frame = 0;
    this.queue = [];
    this.frameRequest = null;
    this.resolve = null;
  }

  setText(newText) {
    const oldText = this.node.textContent;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => { this.resolve = resolve; });

    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 12);
      const end = start + Math.floor(Math.random() * 14) + 6;
      this.queue.push({ from, to, start, end, char: "" });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this._update();
    return promise;
  }

  _update() {
    let output = "";
    let complete = 0;
    for (const item of this.queue) {
      if (this.frame >= item.end) {
        complete++;
        output += item.to;
      } else if (this.frame >= item.start) {
        if (!item.char || Math.random() < 0.3) {
          item.char = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
        output += `<span class="scramble-char">${item.char}</span>`;
      } else {
        output += item.from;
      }
    }
    this.node.innerHTML = output;

    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frame++;
      this.frameRequest = requestAnimationFrame(() => this._update());
    }
  }
}

export class Loader {
  /** @param {HTMLElement} mountPoint element the loader UI is appended to */
  constructor(mountPoint) {
    this.labelEl = el("div", { class: "loader-label" }, "READY");
    this.fillEl = el("div", { class: "loader-fill" });
    this.root = el("div", { class: "loader", role: "status", "aria-live": "polite" }, [
      el("div", { class: "loader-row" }, [
        el("div", { class: "loader-glyphs" }, ["{", "<", "/", ">", "}"].map(ch => el("span", {}, ch))),
        this.labelEl
      ]),
      el("div", { class: "loader-track" }, [this.fillEl])
    ]);
    mountPoint.appendChild(this.root);
    this.scramble = new TextScramble(this.labelEl);
  }

  show() { this.root.classList.add("active"); }
  hide() { this.root.classList.remove("active"); }

  /**
   * Run work behind the loader, guaranteeing it stays visible at least
   * `minDuration` ms so the animation is always perceptible — even
   * though most conversions here finish in under a millisecond.
   * @template T
   * @param {string} label status text to scramble into view
   * @param {() => T} workFn
   * @param {number} [minDuration]
   * @returns {Promise<T>}
   */
  async run(label, workFn, minDuration = 420) {
    this.show();
    this.scramble.setText(label);
    const start = performance.now();
    let result, error;
    try {
      result = workFn();
    } catch (err) {
      error = err;
    }
    const elapsed = performance.now() - start;
    if (elapsed < minDuration) {
      await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed));
    }
    this.hide();
    if (error) throw error;
    return result;
  }
}
