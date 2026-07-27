(function () {
  const STORAGE_KEY = "fields.trace.enabled";
  const root = document.documentElement;
  const originalFillRect = CanvasRenderingContext2D.prototype.fillRect;
  let traceEnabled = localStorage.getItem(STORAGE_KEY) === "true";
  function syncState() {
    root.dataset.trace = traceEnabled ? "on" : "off";
    window.fieldTraceEnabled = traceEnabled;
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
    const button = document.createElement("button");
    button.className = "trace-toggle";
    button.type = "button";
    button.setAttribute("aria-pressed", String(traceEnabled));
    button.innerHTML = "<span></span><b>Trace</b>";
    button.addEventListener("click", () => {
      traceEnabled = !traceEnabled;
      localStorage.setItem(STORAGE_KEY, String(traceEnabled));
      button.setAttribute("aria-pressed", String(traceEnabled));
      syncState();
    });
    const style = document.createElement("style");
    style.textContent = `
      .trace-toggle {
        position: fixed;
        right: 18px;
        top: 18px;
        z-index: 20;
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

      .trace-toggle span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.32);
        box-shadow: none;
      }

      .trace-toggle[aria-pressed="true"] {
        border-color: rgba(183, 239, 121, 0.52);
        color: #f5ffe9;
      }

      .trace-toggle[aria-pressed="true"] span {
        background: #b7ef79;
        box-shadow: 0 0 12px rgba(183, 239, 121, 0.85);
      }

      @media (max-width: 640px) {
        .trace-toggle {
          right: 14px;
          top: 14px;
        }
      }
    `;
    document.head.append(style);
    document.body.append(button);
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
