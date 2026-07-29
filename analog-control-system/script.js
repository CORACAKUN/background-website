const canvas = document.querySelector("#console");
const ctx = canvas.getContext("2d");
const systemState = document.querySelector("#system-state");
const controlState = document.querySelector("#signal-status");

const pointer = {
  x: -1000,
  y: -1000,
  normalizedX: 0.5,
  normalizedY: 0.5,
  down: false,
};

const switches = [
  { label: "MASTER", on: false },
  { label: "NAV", on: true },
  { label: "AUTO", on: false },
  { label: "COOL", on: true },
];

const buttons = [
  { label: "START", color: "#79c77d", active: 0 },
  { label: "TEST", color: "#dbb15e", active: 0 },
  { label: "RESET", color: "#cc6852", active: 0 },
];

const lamps = [
  { label: "POWER", color: "#7fd17f" },
  { label: "NAV", color: "#7ab0cc" },
  { label: "SYNC", color: "#d5b95e" },
  { label: "AUX", color: "#be7959" },
  { label: "LINK", color: "#8cc6a0" },
  { label: "WARN", color: "#d95f4f" },
];

const auxiliaryButtons = [
  { label: "COM 1", color: "#65b7d0", on: true },
  { label: "COM 2", color: "#65b7d0", on: false },
  { label: "PUMP", color: "#70bd78", on: true },
  { label: "HYD", color: "#e0b15d", on: false },
  { label: "AUX", color: "#ba83cc", on: true },
  { label: "HEAT", color: "#d67856", on: false },
  { label: "ARM", color: "#d9574d", on: false },
];

const indicatorColors = [
  "#74cf7d",
  "#66bad0",
  "#d7b35e",
  "#d56c51",
  "#b080cb",
  "#d6d1a4",
];

let width = 0;
let height = 0;
let dpr = 1;
let panelX = 0;
let panelY = 0;
let panelWidth = 0;
let panelHeight = 0;
let scale = 1;
let leverValue = 0.36;
let draggingLever = false;
let hoveredControl = null;
let testPulse = 0;
let time = 0;

function roundedRect(x, y, widthValue, heightValue, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, widthValue, heightValue, radius);
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  panelWidth = Math.min(width * (width < 700 ? 0.9 : 0.52), 860);
  scale = panelWidth / 840;
  panelHeight = 620 * scale;
  panelX = width < 700 ? width * 0.5 : width * 0.73;
  panelY = width < 700 ? height * 0.3 : height * 0.5;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  layoutControls();
}

function panelPoint(localX, localY) {
  return {
    x: panelX - panelWidth / 2 + localX * scale,
    y: panelY - panelHeight / 2 + localY * scale,
  };
}

function layoutControls() {
  switches.forEach((toggle, index) => {
    const point = panelPoint(420 + index * 65, 405);
    Object.assign(toggle, {
      x: point.x,
      y: point.y,
      width: 42 * scale,
      height: 70 * scale,
      type: "switch",
    });
  });

  buttons.forEach((button, index) => {
    const point = panelPoint(445 + index * 72, 520);
    Object.assign(button, {
      x: point.x,
      y: point.y,
      radius: 18 * scale,
      type: "button",
    });
  });

  auxiliaryButtons.forEach((button, index) => {
    const point = panelPoint(42 + index * 46, 488);
    Object.assign(button, {
      x: point.x,
      y: point.y,
      width: 39 * scale,
      height: 38 * scale,
      type: "auxiliary",
    });
  });
}

function label(text, x, y, align = "left", alpha = 0.42, size = 8) {
  ctx.fillStyle = `rgba(242, 213, 164, ${alpha})`;
  ctx.font = `700 ${Math.max(5.5, size * scale)}px "Courier New", monospace`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

function drawBackground() {
  ctx.fillStyle = "#100e0a";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(218, 173, 99, 0.025)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x < width; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawPanel() {
  const left = panelX - panelWidth / 2;
  const top = panelY - panelHeight / 2;
  const gradient = ctx.createLinearGradient(
    left,
    top,
    left + panelWidth,
    top + panelHeight,
  );
  gradient.addColorStop(0, "rgba(44, 39, 29, 0.98)");
  gradient.addColorStop(1, "rgba(17, 16, 12, 0.99)");
  roundedRect(left, top, panelWidth, panelHeight, 8 * scale);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = "rgba(224, 178, 102, 0.24)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Section dividers.
  ctx.strokeStyle = "rgba(224, 178, 102, 0.1)";
  for (const localX of [380, 650]) {
    const start = panelPoint(localX, 55);
    const end = panelPoint(localX, 590);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
  const dividerStart = panelPoint(390, 310);
  const dividerEnd = panelPoint(630, 310);
  ctx.beginPath();
  ctx.moveTo(dividerStart.x, dividerStart.y);
  ctx.lineTo(dividerEnd.x, dividerEnd.y);
  ctx.stroke();

  for (const [localX, localY] of [
    [14, 14],
    [826, 14],
    [14, 606],
    [826, 606],
  ]) {
    const point = panelPoint(localX, localY);
    ctx.fillStyle = "rgba(229, 187, 118, 0.42)";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2.5 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  const title = panelPoint(32, 35);
  label("A-50 UNIFIED CONTROL DECK", title.x, title.y, "left", 0.72, 10);
  const serial = panelPoint(808, 35);
  label("SERIAL 0047 // MANUAL", serial.x, serial.y, "right", 0.32, 7);
}

function drawHeaderIndicators() {
  const start = panelPoint(390, 31);
  label("SUBSYSTEM BUS", start.x - 12 * scale, start.y + 2 * scale, "right", 0.28, 6);

  for (let index = 0; index < 12; index += 1) {
    const blink =
      Math.sin(time * (0.025 + (index % 3) * 0.008) + index * 1.7) > -0.2;
    const x = start.x + index * 14 * scale;
    ctx.globalAlpha = blink ? 0.72 : 0.12;
    ctx.fillStyle = indicatorColors[index % indicatorColors.length];
    ctx.beginPath();
    ctx.arc(x, start.y, 2.2 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawGauge(localX, localY, localRadius, value, gaugeLabel, unit) {
  const center = panelPoint(localX, localY);
  const radius = localRadius * scale;
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const clamped = Math.max(0, Math.min(1, value));
  const angle = startAngle + (endAngle - startAngle) * clamped;

  ctx.fillStyle = "rgba(6, 7, 5, 0.78)";
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(231, 192, 126, 0.22)";
  ctx.stroke();

  for (let tick = 0; tick <= 24; tick += 1) {
    const ratio = tick / 24;
    const tickAngle = startAngle + (endAngle - startAngle) * ratio;
    const major = tick % 4 === 0;
    const inner = radius - (major ? 10 * scale : 6 * scale);
    ctx.strokeStyle =
      ratio > 0.8
        ? "rgba(221, 103, 70, 0.7)"
        : "rgba(231, 192, 126, 0.48)";
    ctx.lineWidth = major ? 1.2 : 0.6;
    ctx.beginPath();
    ctx.moveTo(
      center.x + Math.cos(tickAngle) * inner,
      center.y + Math.sin(tickAngle) * inner,
    );
    ctx.lineTo(
      center.x + Math.cos(tickAngle) * (radius - 2 * scale),
      center.y + Math.sin(tickAngle) * (radius - 2 * scale),
    );
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(angle);
  ctx.strokeStyle = clamped > 0.8 ? "#e37455" : "#e5b86f";
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.14, 0);
  ctx.lineTo(radius * 0.68, 0);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#d8aa63";
  ctx.beginPath();
  ctx.arc(center.x, center.y, 3.5 * scale, 0, Math.PI * 2);
  ctx.fill();
  label(gaugeLabel, center.x, center.y + radius * 0.46, "center", 0.62, 7);
  label(
    `${Math.round(clamped * 100)} ${unit}`,
    center.x,
    center.y + radius * 0.63,
    "center",
    0.32,
    6,
  );
}

function drawGyro() {
  const center = panelPoint(510, 185);
  const radius = 90 * scale;
  const roll = (pointer.normalizedX - 0.5) * 0.75;
  const pitch = (pointer.normalizedY - 0.5) * radius * 0.7;

  ctx.save();
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(center.x, center.y);
  ctx.rotate(roll);
  ctx.translate(0, pitch);
  ctx.fillStyle = "#283b3d";
  ctx.fillRect(-radius * 1.5, -radius * 1.5, radius * 3, radius * 1.5);
  ctx.fillStyle = "#5a4932";
  ctx.fillRect(-radius * 1.5, 0, radius * 3, radius * 1.5);
  ctx.strokeStyle = "rgba(239, 207, 151, 0.75)";
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(-radius * 1.2, 0);
  ctx.lineTo(radius * 1.2, 0);
  ctx.stroke();
  for (let mark = -2; mark <= 2; mark += 1) {
    if (mark === 0) continue;
    ctx.beginPath();
    ctx.moveTo(-14 * scale, mark * 15 * scale);
    ctx.lineTo(14 * scale, mark * 15 * scale);
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(231, 192, 126, 0.35)";
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#dfb56d";
  ctx.beginPath();
  ctx.moveTo(center.x - 28 * scale, center.y);
  ctx.lineTo(center.x - 8 * scale, center.y);
  ctx.lineTo(center.x, center.y + 8 * scale);
  ctx.lineTo(center.x + 8 * scale, center.y);
  ctx.lineTo(center.x + 28 * scale, center.y);
  ctx.stroke();
  label("ATTITUDE GYRO", center.x, center.y + radius + 16 * scale, "center", 0.48, 7);
}

function drawDigitalDisplays() {
  const displays = [
    ["FREQUENCY", `${(42.6 + Math.sin(time * 0.02) * 2.4).toFixed(2)} MHz`],
    ["TEMPERATURE", `${Math.round(38 + leverValue * 47)} °C`],
    ["OUTPUT", `${Math.round(leverValue * 100)} %`],
  ];

  displays.forEach(([displayLabel, value], index) => {
    const point = panelPoint(680, 78 + index * 72);
    roundedRect(point.x, point.y, 130 * scale, 52 * scale, 3 * scale);
    ctx.fillStyle = "rgba(6, 14, 9, 0.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(126, 184, 116, 0.2)";
    ctx.stroke();
    label(displayLabel, point.x + 8 * scale, point.y + 13 * scale, "left", 0.32, 6);
    ctx.fillStyle = testPulse > 0.2 ? "#e3bd68" : "#99d18d";
    ctx.font = `500 ${Math.max(7, 14 * scale)}px "Courier New", monospace`;
    ctx.textAlign = "right";
    ctx.fillText(
      value,
      point.x + 120 * scale,
      point.y + 36 * scale,
    );
  });
}

function drawOscilloscope() {
  const point = panelPoint(35, 330);
  const scopeWidth = 320 * scale;
  const scopeHeight = 125 * scale;
  roundedRect(point.x, point.y, scopeWidth, scopeHeight, 4 * scale);
  ctx.fillStyle = "rgba(5, 12, 7, 0.92)";
  ctx.fill();
  ctx.strokeStyle = "rgba(127, 195, 112, 0.22)";
  ctx.stroke();

  ctx.strokeStyle = "rgba(98, 175, 92, 0.1)";
  for (let line = 1; line < 8; line += 1) {
    ctx.beginPath();
    ctx.moveTo(point.x + (scopeWidth / 8) * line, point.y);
    ctx.lineTo(point.x + (scopeWidth / 8) * line, point.y + scopeHeight);
    ctx.stroke();
  }
  for (let line = 1; line < 4; line += 1) {
    ctx.beginPath();
    ctx.moveTo(point.x, point.y + (scopeHeight / 4) * line);
    ctx.lineTo(point.x + scopeWidth, point.y + (scopeHeight / 4) * line);
    ctx.stroke();
  }

  ctx.strokeStyle = testPulse > 0.2 ? "#dfb85f" : "#8cd47e";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let sample = 0; sample <= scopeWidth; sample += 3) {
    const progress = sample / scopeWidth;
    const wave =
      Math.sin(progress * 24 + time * 0.055) * 0.34 +
      Math.sin(progress * 59 - time * 0.033) * 0.13;
    const y =
      point.y +
      scopeHeight / 2 +
      wave * scopeHeight * (0.28 + leverValue * 0.3);
    if (sample === 0) ctx.moveTo(point.x + sample, y);
    else ctx.lineTo(point.x + sample, y);
  }
  ctx.stroke();
  label("SIGNAL MONITOR // CH-A", point.x, point.y - 9 * scale, "left", 0.43, 7);
}

function drawBubbleLevel() {
  const point = panelPoint(405, 286);
  const levelWidth = 210 * scale;
  const levelHeight = 22 * scale;
  roundedRect(point.x, point.y, levelWidth, levelHeight, levelHeight / 2);
  ctx.fillStyle = "rgba(114, 139, 74, 0.28)";
  ctx.fill();
  ctx.strokeStyle = "rgba(222, 196, 111, 0.32)";
  ctx.stroke();
  const bubbleX =
    point.x +
    levelWidth / 2 +
    (pointer.normalizedX - 0.5) * levelWidth * 0.7;
  ctx.fillStyle = "rgba(217, 232, 141, 0.62)";
  ctx.beginPath();
  ctx.arc(bubbleX, point.y + levelHeight / 2, 7 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(239, 216, 151, 0.3)";
  ctx.beginPath();
  ctx.moveTo(point.x + levelWidth / 2, point.y);
  ctx.lineTo(point.x + levelWidth / 2, point.y + levelHeight);
  ctx.stroke();
  label("LEVEL", point.x, point.y - 7 * scale, "left", 0.42, 7);
}

function drawFaultMatrix() {
  const point = panelPoint(675, 286);
  const matrixWidth = 133 * scale;
  const matrixHeight = 54 * scale;
  label("FAULT / STATUS MATRIX", point.x, point.y - 7 * scale, "left", 0.4, 6);
  roundedRect(point.x, point.y, matrixWidth, matrixHeight, 3 * scale);
  ctx.fillStyle = "rgba(5, 7, 5, 0.68)";
  ctx.fill();
  ctx.strokeStyle = "rgba(222, 181, 111, 0.16)";
  ctx.stroke();

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 7; column += 1) {
      const index = row * 7 + column;
      const randomBlink =
        Math.sin(time * (0.018 + (index % 5) * 0.006) + index * 2.43) >
        0.25 + (index % 3) * 0.13;
      const forced = testPulse > 0.15 && (index + Math.floor(time / 5)) % 3 === 0;
      ctx.globalAlpha = randomBlink || forced ? 0.85 : 0.1;
      ctx.fillStyle = indicatorColors[index % indicatorColors.length];
      ctx.beginPath();
      ctx.arc(
        point.x + (14 + column * 17.5) * scale,
        point.y + (13 + row * 15) * scale,
        2.7 * scale,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawAuxiliaryButtons() {
  label(
    "ILLUMINATED FUNCTION BAR",
    auxiliaryButtons[0].x,
    auxiliaryButtons[0].y - 9 * scale,
    "left",
    0.42,
    7,
  );

  for (const button of auxiliaryButtons) {
    const hovered = hoveredControl === button;
    roundedRect(
      button.x,
      button.y,
      button.width,
      button.height,
      3 * scale,
    );
    ctx.fillStyle = "rgba(4, 5, 4, 0.78)";
    ctx.fill();
    ctx.strokeStyle = hovered
      ? "rgba(241, 210, 156, 0.64)"
      : "rgba(224, 178, 102, 0.18)";
    ctx.stroke();

    roundedRect(
      button.x + 4 * scale,
      button.y + 4 * scale,
      button.width - 8 * scale,
      15 * scale,
      2 * scale,
    );
    ctx.globalAlpha = button.on ? 0.88 : 0.14;
    ctx.fillStyle = button.color;
    ctx.fill();
    ctx.globalAlpha = 1;
    label(
      button.label,
      button.x + button.width / 2,
      button.y + 31 * scale,
      "center",
      button.on ? 0.68 : 0.3,
      5.5,
    );
  }
}

function drawRotaryKnob(localX, localY, knobLabel, value) {
  const center = panelPoint(localX, localY);
  const radius = 20 * scale;

  for (let tick = 0; tick <= 10; tick += 1) {
    const angle = Math.PI * 0.75 + (tick / 10) * Math.PI * 1.5;
    ctx.strokeStyle = "rgba(226, 192, 132, 0.32)";
    ctx.beginPath();
    ctx.moveTo(
      center.x + Math.cos(angle) * (radius + 5 * scale),
      center.y + Math.sin(angle) * (radius + 5 * scale),
    );
    ctx.lineTo(
      center.x + Math.cos(angle) * (radius + 9 * scale),
      center.y + Math.sin(angle) * (radius + 9 * scale),
    );
    ctx.stroke();
  }

  const knob = ctx.createRadialGradient(
    center.x - radius * 0.3,
    center.y - radius * 0.3,
    0,
    center.x,
    center.y,
    radius,
  );
  knob.addColorStop(0, "#655a48");
  knob.addColorStop(1, "#27231d");
  ctx.fillStyle = knob;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(235, 205, 151, 0.26)";
  ctx.stroke();

  const angle = Math.PI * 0.75 + value * Math.PI * 1.5;
  ctx.strokeStyle = "#dfb66e";
  ctx.lineWidth = 1.6 * scale;
  ctx.beginPath();
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(
    center.x + Math.cos(angle) * radius * 0.7,
    center.y + Math.sin(angle) * radius * 0.7,
  );
  ctx.stroke();
  label(knobLabel, center.x, center.y + radius + 16 * scale, "center", 0.4, 6);
}

function drawFuseBus() {
  const point = panelPoint(390, 579);
  const busWidth = 260 * scale;
  const busHeight = 24 * scale;
  label("FUSE BUS // 5A", point.x, point.y - 6 * scale, "left", 0.35, 6);
  roundedRect(point.x, point.y, busWidth, busHeight, 2 * scale);
  ctx.fillStyle = "rgba(5, 5, 4, 0.6)";
  ctx.fill();
  ctx.strokeStyle = "rgba(225, 184, 115, 0.14)";
  ctx.stroke();

  for (let index = 0; index < 10; index += 1) {
    const fuseX = point.x + (9 + index * 25) * scale;
    ctx.fillStyle =
      index === 7 && testPulse > 0.15
        ? "rgba(220, 88, 62, 0.72)"
        : "rgba(194, 169, 122, 0.28)";
    roundedRect(
      fuseX,
      point.y + 5 * scale,
      16 * scale,
      14 * scale,
      2 * scale,
    );
    ctx.fill();
    label(
      String(index + 1).padStart(2, "0"),
      fuseX + 8 * scale,
      point.y + 15 * scale,
      "center",
      0.32,
      5,
    );
  }
}

function drawSwitches() {
  for (const toggle of switches) {
    const hovered = hoveredControl === toggle;
    label(
      toggle.label,
      toggle.x + toggle.width / 2,
      toggle.y - 7 * scale,
      "center",
      hovered ? 0.78 : 0.4,
      6,
    );
    roundedRect(toggle.x, toggle.y, toggle.width, toggle.height, 3 * scale);
    ctx.fillStyle = "rgba(7, 7, 5, 0.66)";
    ctx.fill();
    ctx.strokeStyle = hovered
      ? "rgba(238, 198, 129, 0.62)"
      : "rgba(224, 178, 102, 0.18)";
    ctx.stroke();

    const pivotX = toggle.x + toggle.width / 2;
    const pivotY = toggle.y + toggle.height / 2;
    ctx.strokeStyle = "#b99a69";
    ctx.lineWidth = 4 * scale;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY + 12 * scale);
    ctx.lineTo(
      pivotX,
      pivotY + (toggle.on ? -17 : 17) * scale,
    );
    ctx.stroke();
    ctx.lineCap = "butt";

    ctx.fillStyle = toggle.on ? "#91c87e" : "rgba(208, 111, 78, 0.4)";
    ctx.beginPath();
    ctx.arc(pivotX, toggle.y + 12 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawButtons() {
  for (const button of buttons) {
    button.active *= 0.92;
    const hovered = hoveredControl === button;
    ctx.fillStyle = "rgba(6, 6, 5, 0.72)";
    ctx.beginPath();
    ctx.arc(button.x, button.y, button.radius + 5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hovered
      ? "rgba(240, 207, 148, 0.65)"
      : "rgba(224, 178, 102, 0.18)";
    ctx.stroke();
    ctx.globalAlpha = 0.55 + button.active * 0.45;
    ctx.fillStyle = button.color;
    ctx.beginPath();
    ctx.arc(button.x, button.y, button.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    label(
      button.label,
      button.x,
      button.y + button.radius + 15 * scale,
      "center",
      0.42,
      6,
    );
  }
}

function leverGeometry() {
  const point = panelPoint(745, 355);
  return {
    x: point.x,
    y: point.y,
    width: 42 * scale,
    height: 180 * scale,
  };
}

function drawLever() {
  const lever = leverGeometry();
  label("POWER LEVER", lever.x + lever.width / 2, lever.y - 12 * scale, "center", 0.5, 7);
  roundedRect(lever.x, lever.y, lever.width, lever.height, 5 * scale);
  ctx.fillStyle = "rgba(6, 6, 5, 0.76)";
  ctx.fill();
  ctx.strokeStyle =
    hoveredControl === "lever"
      ? "rgba(239, 200, 132, 0.64)"
      : "rgba(224, 178, 102, 0.2)";
  ctx.stroke();

  ctx.strokeStyle = "rgba(223, 188, 127, 0.2)";
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.moveTo(lever.x + lever.width / 2, lever.y + 15 * scale);
  ctx.lineTo(lever.x + lever.width / 2, lever.y + lever.height - 15 * scale);
  ctx.stroke();

  const handleY =
    lever.y + lever.height - 18 * scale - leverValue * (lever.height - 36 * scale);
  roundedRect(
    lever.x - 10 * scale,
    handleY - 10 * scale,
    lever.width + 20 * scale,
    20 * scale,
    4 * scale,
  );
  ctx.fillStyle = "#b28f5d";
  ctx.fill();
  ctx.strokeStyle = "rgba(248, 222, 174, 0.45)";
  ctx.stroke();
  label(
    `${Math.round(leverValue * 100)}%`,
    lever.x + lever.width / 2,
    lever.y + lever.height + 18 * scale,
    "center",
    0.44,
    7,
  );
}

function drawLamps() {
  lamps.forEach((lamp, index) => {
    const point = panelPoint(48 + index * 52, 565);
    const enabled =
      index === 0
        ? switches[0].on
        : index === 1
          ? switches[1].on
          : index === 2
            ? testPulse > 0.1
            : index === 3
              ? switches[2].on
              : index === 4
                ? switches[3].on
                : leverValue > 0.85;
    ctx.globalAlpha = enabled ? 1 : 0.18;
    ctx.fillStyle = lamp.color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5 * scale, 0, Math.PI * 2);
    ctx.fill();
    if (enabled) {
      ctx.strokeStyle = lamp.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 9 * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    label(lamp.label, point.x, point.y + 17 * scale, "center", 0.32, 5.5);
  });
}

function hitTest(x, y) {
  for (const toggle of switches) {
    if (
      x >= toggle.x &&
      x <= toggle.x + toggle.width &&
      y >= toggle.y &&
      y <= toggle.y + toggle.height
    ) {
      return toggle;
    }
  }

  for (const button of buttons) {
    if (Math.hypot(x - button.x, y - button.y) <= button.radius + 8 * scale) {
      return button;
    }
  }

  for (const button of auxiliaryButtons) {
    if (
      x >= button.x &&
      x <= button.x + button.width &&
      y >= button.y &&
      y <= button.y + button.height
    ) {
      return button;
    }
  }

  const lever = leverGeometry();
  if (
    x >= lever.x - 12 * scale &&
    x <= lever.x + lever.width + 12 * scale &&
    y >= lever.y &&
    y <= lever.y + lever.height
  ) {
    return "lever";
  }
  return null;
}

function updateLever(y) {
  const lever = leverGeometry();
  leverValue = Math.max(
    0,
    Math.min(1, 1 - (y - lever.y - 18 * scale) / (lever.height - 36 * scale)),
  );
  controlState.textContent = leverValue > 0.78 ? "High output" : "Manual";
}

function activateControl(control) {
  if (control?.type === "switch") {
    control.on = !control.on;
    if (control.label === "MASTER") {
      systemState.textContent = control.on ? "Online" : "Standby";
    }
  } else if (control?.type === "button") {
    control.active = 1;
    if (control.label === "START") {
      switches[0].on = true;
      systemState.textContent = "Online";
    } else if (control.label === "TEST") {
      testPulse = 1;
      controlState.textContent = "Self test";
    } else {
      switches.forEach((toggle, index) => {
        toggle.on = index === 1 || index === 3;
      });
      leverValue = 0.36;
      systemState.textContent = "Standby";
      controlState.textContent = "Manual";
    }
  } else if (control?.type === "auxiliary") {
    control.on = !control.on;
    controlState.textContent = `${control.label} ${control.on ? "on" : "off"}`;
  }
}

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.normalizedX = event.clientX / width;
  pointer.normalizedY = event.clientY / height;
  hoveredControl = hitTest(pointer.x, pointer.y);
  if (draggingLever) updateLever(pointer.y);
  canvas.style.cursor =
    hoveredControl || draggingLever ? (draggingLever ? "ns-resize" : "pointer") : "default";
});

window.addEventListener("pointerdown", () => {
  pointer.down = true;
  const control = hitTest(pointer.x, pointer.y);
  if (control === "lever") {
    draggingLever = true;
    updateLever(pointer.y);
  } else {
    activateControl(control);
  }
});

window.addEventListener("pointerup", () => {
  pointer.down = false;
  draggingLever = false;
});

window.addEventListener("blur", () => {
  draggingLever = false;
});

window.addEventListener("resize", resize);

function animate() {
  testPulse *= 0.965;
  if (testPulse < 0.03 && controlState.textContent === "Self test") {
    controlState.textContent = "Manual";
  }

  const signal =
    0.38 + leverValue * 0.48 + Math.sin(time * 0.018) * 0.08 + testPulse * 0.2;
  const pressure =
    0.32 + leverValue * 0.43 + Math.cos(time * 0.014) * 0.07;

  drawBackground();
  drawPanel();
  drawHeaderIndicators();
  drawGauge(120, 180, 80, signal, "SIGNAL", "dB");
  drawGauge(285, 180, 68, pressure, "PRESSURE", "PSI");
  drawGyro();
  drawDigitalDisplays();
  drawBubbleLevel();
  drawFaultMatrix();
  drawOscilloscope();
  drawAuxiliaryButtons();
  drawSwitches();
  drawButtons();
  drawRotaryKnob(690, 420, "GAIN", 0.34 + pointer.normalizedX * 0.5);
  drawRotaryKnob(690, 505, "TRIM", 0.3 + leverValue * 0.55);
  drawLever();
  drawLamps();
  drawFuseBus();

  time += 1;
  requestAnimationFrame(animate);
}

resize();
animate();
