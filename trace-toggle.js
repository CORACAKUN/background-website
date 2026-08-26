(function () {
  const STORAGE_KEY = "fields.trace.enabled";
  const FOCUS_STORAGE_KEY = "fields.focus.enabled";
  const root = document.documentElement;
  const originalFillRect = CanvasRenderingContext2D.prototype.fillRect;
  let traceEnabled = localStorage.getItem(STORAGE_KEY) === "true";
  let focusEnabled = localStorage.getItem(FOCUS_STORAGE_KEY) === "true";
  function syncState() {
    root.dataset.trace = traceEnabled ? "on" : "off";
    root.dataset.focus = focusEnabled ? "on" : "off";
    window.fieldTraceEnabled = traceEnabled;
    window.fieldFocusEnabled = focusEnabled;
  }
  function getCanvasSize(ctx) {
    const canvas = ctx.canvas;
    return {
      width: canvas.width || canvas.clientWidth,
      height: canvas.height || canvas.clientHeight,
    };
  }
  function isTransparentFullCanvasWipe(ctx, x, y, width, height) {
    const size = getCanvasSize(ctx);
    return (!traceEnabled && x === 0 && y === 0 && width >= size.width && height >= size.height && typeof ctx.fillStyle === "string" && /rgba?\([^)]*, \s*(0?\.\d+|0)\s*\)$/i.test(ctx.fillStyle) );
  }
  function makeOpaque(fillStyle) {
    const rgba = fillStyle.match(/^rgba?\((.*)\)$/i);
    if (!rgba) return fillStyle;
    const parts = rgba[1].split(",").map((part) => part.trim());
    return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
  }
  CanvasRenderingContext2D.prototype.fillRect = function (x, y, width, height) {
    if (isTransparentFullCanvasWipe(this, x, y, width, height)) {
      const previous = this.fillStyle;
      this.fillStyle = makeOpaque(previous);
      originalFillRect.call(this, x, y, width, height);
      this.fillStyle = previous;
      return;
    }
    originalFillRect.call(this, x, y, width, height);
  };
  function addToggle() {
    const controls = document.createElement("div");
    controls.className = "field-toggles";
    controls.setAttribute("aria-label", "Background controls");
    const focusButton = document.createElement("button");
    const traceButton = document.createElement("button");
    focusButton.className = "field-toggle focus-toggle";
    focusButton.type = "button";
    focusButton.setAttribute("aria-pressed", String(focusEnabled));
    focusButton.innerHTML = "<span></span><b>Focus</b>";
    focusButton.addEventListener("click", () => {
      focusEnabled = !focusEnabled;
      localStorage.setItem(FOCUS_STORAGE_KEY, String(focusEnabled));
      focusButton.setAttribute("aria-pressed", String(focusEnabled));
      syncState();
    });
    traceButton.className = "field-toggle trace-toggle";
    traceButton.type = "button";
    traceButton.setAttribute("aria-pressed", String(traceEnabled));
    traceButton.innerHTML = "<span></span><b>Trace</b>";
    traceButton.addEventListener("click", () => {
      traceEnabled = !traceEnabled;
      localStorage.setItem(STORAGE_KEY, String(traceEnabled));
      traceButton.setAttribute("aria-pressed", String(traceEnabled));
      syncState();
    });
    const style = document.createElement("style");
    style.textContent = `
      .field-toggles {
        position: fixed;
        right: 18px;
        top: 18px;
        z-index: 2147483647;
        display: inline-flex;
        gap: 8px;
        pointer-events: auto;
      }

      .field-toggle {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 34px;
        padding: 7px 10px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 999px;
        color: rgba(255, 255, 255, 0.64);
        background: rgba(0, 0, 0, 0.32);
        backdrop-filter: blur(10px);
        font: 700 9px/1 Inter, system-ui, sans-serif;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        cursor: pointer;
        pointer-events: auto;
      }

      .field-toggle span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.32);
        box-shadow: none;
      }

      .field-toggle[aria-pressed="true"] {
        border-color: rgba(183, 239, 121, 0.52);
        color: #f5ffe9;
      }

      .field-toggle[aria-pressed="true"] span {
        background: #b7ef79;
        box-shadow: 0 0 12px rgba(183, 239, 121, 0.85);
      }

      html[data-focus="on"] main,
      html[data-focus="on"] header,
      html[data-focus="on"] footer,
      html[data-focus="on"] nav,
      html[data-focus="on"] aside,
      html[data-focus="on"] dialog,
      html[data-focus="on"] .trace-toggle,
      html[data-focus="on"] [class*="control"],
      html[data-focus="on"] [class*="panel"],
      html[data-focus="on"] [class*="hud"],
      html[data-focus="on"] [class*="status"],
      html[data-focus="on"] [class*="meter"],
      html[data-focus="on"] [class*="legend"],
      html[data-focus="on"] [class*="label"],
      html[data-focus="on"] [class*="caption"],
      html[data-focus="on"] [class*="readout"],
      html[data-focus="on"] [class*="speed"],
      html[data-focus="on"] [class*="hint"],
      html[data-focus="on"] [class*="title"],
      html[data-focus="on"] [class*="info"],
      html[data-focus="on"] [class*="instruction"] {
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }

      html[data-focus="on"] .trace-toggle {
        display: none !important;
      }

      html[data-focus="on"] .field-toggles,
      html[data-focus="on"] .focus-toggle {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }

      @media (max-width: 640px) {
        .field-toggles {
          right: 14px;
          top: 14px;
        }
      }
    `;
    document.head.append(style);
    controls.append(focusButton, traceButton);
    document.body.append(controls);
  }
  syncState();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addToggle, {
      once: true
    });
  }
  else {
    addToggle();
  }
})();
