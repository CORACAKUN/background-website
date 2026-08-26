(function () {
  const STORAGE_KEY = "fields.trace.enabled";
  const FOCUS_STORAGE_KEY = "fields.focus.enabled";
  const root = document.documentElement;
  const originalFillRect = CanvasRenderingContext2D.prototype.fillRect;
  const urlParams = new URLSearchParams(window.location.search);
  const embedEnabled = urlParams.get("embed") === "1";
  const visitorStorageKey = "fields.visitor.id";
  let traceEnabled = localStorage.getItem(STORAGE_KEY) === "true";
  let focusEnabled = embedEnabled || localStorage.getItem(FOCUS_STORAGE_KEY) === "true";
  function syncState() {
    root.dataset.trace = traceEnabled ? "on" : "off";
    root.dataset.focus = focusEnabled ? "on" : "off";
    root.dataset.embed = embedEnabled ? "on" : "off";
    window.fieldTraceEnabled = traceEnabled;
    window.fieldFocusEnabled = focusEnabled;
    window.fieldEmbedEnabled = embedEnabled;
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
  function getEmbedUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set("embed", "1");
    url.hash = "";
    return url.href;
  }
  function getEmbedCode() {
    const title = document.title || "Interactive background";
    return `<div class="fields-background">
  <iframe
    src="${getEmbedUrl()}"
    title="${title}"
    draggable="false"
  ></iframe>
</div>

<style>
  .fields-background {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
  }

  .fields-background iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    pointer-events: auto;
    user-select: none;
    -webkit-user-select: none;
  }
</style>`;
  }
  function getVisitorId() {
    let visitorId = localStorage.getItem(visitorStorageKey);
    if (!visitorId) {
      visitorId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(visitorStorageKey, visitorId);
    }
    return visitorId;
  }
  function getBackgroundMeta() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const backgroundIndex = parts.indexOf("background");
    const category = backgroundIndex >= 0 ? parts[backgroundIndex + 1] || "" : "";
    const slug = backgroundIndex >= 0 ? parts[backgroundIndex + 2] || "" : document.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return {
      slug,
      category,
      title: document.title || slug,
      path: window.location.pathname,
      visitorId: getVisitorId(),
      embedded: embedEnabled,
    };
  }
  function getPublicInfo() {
    return {
      language: navigator.language || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      screen: `${window.screen.width}x${window.screen.height}`,
      referrer: document.referrer || "",
      userAgent: navigator.userAgent || "",
    };
  }
  function postJson(url, data) {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }
  function trackVisit() {
    if (!window.location.pathname.includes("/background/")) return;
    const payload = {
      ...getBackgroundMeta(),
      publicInfo: getPublicInfo(),
    };
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/visit", blob);
      return;
    }
    postJson("/api/visit", payload).catch(() => {});
  }
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  function setButtonStatus(button, text, delay = 1600) {
    const original = button.dataset.originalText || button.textContent;
    button.dataset.originalText = original;
    button.textContent = text;
    window.clearTimeout(button._fieldStatusTimer);
    button._fieldStatusTimer = window.setTimeout(() => {
      button.textContent = original;
    }, delay);
  }
  function addToggle() {
    const controls = document.createElement("div");
    controls.className = "field-toggles";
    controls.setAttribute("aria-label", "Background controls");
    const focusButton = document.createElement("button");
    const traceButton = document.createElement("button");
    const exportButton = document.createElement("button");
    const ratingButton = document.createElement("button");
    const exportPanel = document.createElement("div");
    const ratingPanel = document.createElement("div");
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
    exportButton.className = "field-toggle export-toggle";
    exportButton.type = "button";
    exportButton.setAttribute("aria-expanded", "false");
    exportButton.innerHTML = "<span></span><b>Export</b>";
    exportPanel.className = "field-export-panel";
    exportPanel.hidden = true;
    exportPanel.innerHTML = `
      <div class="field-export-head">
        <strong>Export</strong>
        <button class="field-export-close" type="button" aria-label="Close export">x</button>
      </div>
      <button class="field-export-copy" type="button">Copy Embed Code</button>
      <small class="field-export-note">Copies an interactive iframe with embed mode enabled. Page content placed above it can block pointer interaction.</small>
    `;
    ratingButton.className = "field-toggle rating-toggle";
    ratingButton.type = "button";
    ratingButton.setAttribute("aria-expanded", "false");
    ratingButton.innerHTML = "<span></span><b>Rate</b>";
    ratingPanel.className = "field-rating-panel";
    ratingPanel.hidden = true;
    ratingPanel.innerHTML = `
      <div class="field-export-head">
        <strong>Rate</strong>
        <button class="field-rating-close" type="button" aria-label="Close rating">x</button>
      </div>
      <div class="field-rating-stars" aria-label="Rate this background">
        <button type="button" data-rating="1">☆</button>
        <button type="button" data-rating="2">☆</button>
        <button type="button" data-rating="3">☆</button>
        <button type="button" data-rating="4">☆</button>
        <button type="button" data-rating="5">☆</button>
      </div>
      <small class="field-rating-summary">No ratings yet</small>
    `;
    const copyButton = exportPanel.querySelector(".field-export-copy");
    const closeExport = exportPanel.querySelector(".field-export-close");
    const ratingSummary = ratingPanel.querySelector(".field-rating-summary");
    const closeRating = ratingPanel.querySelector(".field-rating-close");
    const starButtons = Array.from(ratingPanel.querySelectorAll("[data-rating]"));
    function setRatingDisplay(value, summary) {
      starButtons.forEach((button) => {
        const active = Number(button.dataset.rating) <= value;
        button.textContent = active ? "★" : "☆";
        button.setAttribute("aria-pressed", String(active));
      });
      if (summary) ratingSummary.textContent = summary;
    }
    exportButton.addEventListener("click", () => {
      exportPanel.hidden = !exportPanel.hidden;
      exportButton.setAttribute("aria-expanded", String(!exportPanel.hidden));
    });
    closeExport.addEventListener("click", () => {
      exportPanel.hidden = true;
      exportButton.setAttribute("aria-expanded", "false");
    });
    ratingButton.addEventListener("click", () => {
      ratingPanel.hidden = !ratingPanel.hidden;
      ratingButton.setAttribute("aria-expanded", String(!ratingPanel.hidden));
    });
    closeRating.addEventListener("click", () => {
      ratingPanel.hidden = true;
      ratingButton.setAttribute("aria-expanded", "false");
    });
    starButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const value = Number(button.dataset.rating);
        setRatingDisplay(value, "Saving...");
        localStorage.setItem(`fields.rating.${getBackgroundMeta().slug}`, String(value));
        try {
          const response = await postJson("/api/rating", {
            ...getBackgroundMeta(),
            rating: value,
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Rating failed");
          const average = data.rating.average || 0;
          const count = data.rating.count || 0;
          setRatingDisplay(Math.round(average), `${average.toFixed(2)} average from ${count} ratings`);
        }
        catch (error) {
          console.error(error);
          setRatingDisplay(value, "Could not save rating");
        }
      });
    });
    copyButton.addEventListener("click", async () => {
      try {
        await copyText(getEmbedCode());
        setButtonStatus(copyButton, "Copied");
      }
      catch (error) {
        console.error(error);
        setButtonStatus(copyButton, "Copy failed", 2200);
      }
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

      html[data-focus="on"],
      html[data-focus="on"] * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      html[data-focus="on"] ::selection {
        color: inherit;
        background: transparent;
      }

      html[data-embed="on"],
      html[data-embed="on"] body {
        cursor: default;
      }

      .field-export-panel,
      .field-rating-panel {
        position: fixed;
        right: 18px;
        top: 62px;
        z-index: 2147483647;
        width: min(270px, calc(100vw - 28px));
        padding: 14px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 12px;
        color: rgba(255, 255, 255, 0.82);
        background: rgba(4, 6, 10, 0.78);
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.32);
        backdrop-filter: blur(16px);
        font: 600 12px/1.35 Inter, system-ui, sans-serif;
        pointer-events: auto;
      }

      .field-rating-panel {
        top: 62px;
        right: 112px;
      }

      .field-export-panel[hidden],
      .field-rating-panel[hidden] {
        display: none !important;
      }

      .field-export-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .field-export-head strong {
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .field-export-close,
      .field-rating-close {
        width: 26px;
        height: 26px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 50%;
        color: rgba(255, 255, 255, 0.72);
        background: rgba(255, 255, 255, 0.06);
        cursor: pointer;
      }

      .field-export-note {
        color: rgba(255, 255, 255, 0.5);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .field-rating-stars {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 5px;
      }

      .field-rating-stars button {
        min-height: 36px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 8px;
        color: #b7ef79;
        background: rgba(255, 255, 255, 0.08);
        font: 700 20px/1 Inter, system-ui, sans-serif;
        cursor: pointer;
      }

      .field-rating-summary {
        display: block;
        margin-top: 10px;
        color: rgba(255, 255, 255, 0.5);
        font: 700 10px/1.45 Inter, system-ui, sans-serif;
      }

      .field-export-panel button:not(.field-export-close) {
        width: 100%;
        min-height: 36px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.86);
        background: rgba(255, 255, 255, 0.08);
        font: 700 11px/1 Inter, system-ui, sans-serif;
      }

      .field-export-panel button:not(.field-export-close) {
        margin-top: 8px;
        cursor: pointer;
      }

      .field-export-note {
        display: block;
        margin-top: 10px;
        line-height: 1.45;
        text-transform: none;
        letter-spacing: 0;
      }

      html[data-focus="on"] main,
      html[data-focus="on"] header,
      html[data-focus="on"] footer,
      html[data-focus="on"] nav,
      html[data-focus="on"] aside,
      html[data-focus="on"] dialog,
      html[data-focus="on"] body > button,
      html[data-focus="on"] .trace-toggle,
      html[data-focus="on"] .export-toggle,
      html[data-focus="on"] .rating-toggle,
      html[data-focus="on"] .field-export-panel,
      html[data-focus="on"] .field-rating-panel,
      html[data-focus="on"] [class*="control"],
      html[data-focus="on"] [class*="panel"],
      html[data-focus="on"] [class*="hud"],
      html[data-focus="on"] [class*="status"],
      html[data-focus="on"] [class*="meter"],
      html[data-focus="on"] [class*="legend"],
      html[data-focus="on"] [class*="label"],
      html[data-focus="on"] [class*="caption"],
      html[data-focus="on"] [class*="readout"],
      html[data-focus="on"] [class*="coordinates"],
      html[data-focus="on"] [class*="speed"],
      html[data-focus="on"] [class*="rpm"],
      html[data-focus="on"] [class*="hint"],
      html[data-focus="on"] [class*="identity"],
      html[data-focus="on"] [class*="title"],
      html[data-focus="on"] [class*="info"],
      html[data-focus="on"] [class*="instruction"] {
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }

      html[data-focus="on"] .trace-toggle,
      html[data-focus="on"] .export-toggle,
      html[data-focus="on"] .rating-toggle,
      html[data-focus="on"] .field-export-panel,
      html[data-focus="on"] .field-rating-panel {
        display: none !important;
      }

      html[data-focus="on"] .field-toggles,
      html[data-focus="on"] .focus-toggle {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }

      html[data-embed="on"] .field-toggles {
        display: none !important;
      }

      @media (max-width: 640px) {
        .field-toggles {
          right: 14px;
          top: 14px;
        }

        .field-export-panel {
          right: 14px;
          top: 58px;
        }

        .field-rating-panel {
          right: 14px;
          top: 58px;
        }
      }
    `;
    document.head.append(style);
    const savedRating = Number(localStorage.getItem(`fields.rating.${getBackgroundMeta().slug}`) || 0);
    if (savedRating) setRatingDisplay(savedRating, "Your rating");
    controls.append(focusButton, traceButton, ratingButton, exportButton);
    document.body.append(controls, ratingPanel, exportPanel);
  }
  syncState();
  trackVisit();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addToggle, {
      once: true
    });
  }
  else {
    addToggle();
  }
})();
