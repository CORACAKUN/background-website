const canvas = document.querySelector("#map");
const ctx = canvas.getContext("2d");
const elevationLabel = document.querySelector("#elevation");
const northingLabel = document.querySelector("#northing");
const eastingLabel = document.querySelector("#easting");

const peaks = [];
const markers = [];

const pointer = {
  x: -1000,
  y: -1000,
  targetX: -1000,
  targetY: -1000,
  active: false,
  strength: 0,
};

let width = 0;
let height = 0;
let dpr = 1;
let offsetX = 0;
let offsetY = 0;
let time = 0;

function seededValue(index, salt = 1) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function buildTerrain() {
  peaks.length = 0;
  const count = width < 700 ? 8 : 13;

  for (let index = 0; index < count; index += 1) {
    const rightSideBias = width < 700 ? 0 : width * 0.2;
    peaks.push({
      x: rightSideBias + seededValue(index, 2) * (width - rightSideBias),
      y: seededValue(index, 3) * height,
      radius: Math.min(width, height) * (0.08 + seededValue(index, 4) * 0.12),
      levels: 7 + Math.floor(seededValue(index, 5) * 8),
      phase: seededValue(index, 6) * Math.PI * 2,
      elevation: 800 + Math.round(seededValue(index, 7) * 2100),
      hue: 165 + seededValue(index, 9) * 190,
      name: `PK-${String(index + 1).padStart(2, "0")}`,
    });
  }
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  buildTerrain();
}

function drawMapBase() {
  ctx.fillStyle = "#04050a";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(121, 145, 203, 0.075)";
  ctx.lineWidth = 0.5;
  const grid = 42;

  for (let x = (offsetX % grid) - grid; x < width + grid; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = (offsetY % grid) - grid; y < height + grid; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(188, 204, 242, 0.25)";
  ctx.font = '7px "Courier New", monospace';
  ctx.textAlign = "left";
  for (let x = 30; x < width; x += 168) {
    ctx.fillText(String(420000 + x * 10), x, 16);
  }
  for (let y = 70; y < height; y += 168) {
    ctx.fillText(String(910000 + y * 10), 8, y);
  }
}

function contourRadius(peak, angle, level) {
  const normalizedLevel = level / peak.levels;
  const base = peak.radius * normalizedLevel;
  const irregularity =
    Math.sin(angle * 3 + peak.phase) * 0.08 +
    Math.sin(angle * 7 - peak.phase * 0.6) * 0.045 +
    Math.cos(angle * 11 + peak.phase * 1.7) * 0.022;
  const breathing = Math.sin(time * 0.004 + peak.phase + level * 0.3) * 0.006;
  return base * (1 + irregularity + breathing);
}

function drawPeak(peak, interactive = false) {
  const levels = interactive
    ? Math.max(3, Math.round(pointer.strength * 11))
    : peak.levels;
  if (levels <= 0) return;

  for (let level = levels; level >= 1; level -= 1) {
    const ratio = level / levels;
    ctx.beginPath();
    for (let step = 0; step <= 90; step += 1) {
      const angle = (step / 90) * Math.PI * 2;
      const radius = contourRadius(
        { ...peak, levels },
        angle,
        level,
      );
      const squash = 0.72 + Math.sin(peak.phase) * 0.08;
      const x =
        peak.x +
        offsetX * (interactive ? 0 : ratio * 0.035) +
        Math.cos(angle) * radius;
      const y =
        peak.y +
        offsetY * (interactive ? 0 : ratio * 0.035) +
        Math.sin(angle) * radius * squash;

      if (step === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const hue = interactive
      ? 175 + level * 14
      : peak.hue + (1 - ratio) * 42;
    ctx.strokeStyle = `hsla(${hue}, 88%, 66%, ${
      (interactive ? 0.2 : 0.14) + (1 - ratio) * 0.52
    })`;
    ctx.lineWidth = level === 1 || level === levels ? 1 : 0.6;
    ctx.stroke();
  }

  if (!interactive && peak.radius > 75) {
    ctx.fillStyle = `hsla(${peak.hue}, 82%, 76%, 0.42)`;
    ctx.font = '7px "Courier New", monospace';
    ctx.textAlign = "center";
    ctx.fillText(
      `${peak.name}  ${peak.elevation} M`,
      peak.x + offsetX * 0.03,
      peak.y + offsetY * 0.03 + 2,
    );
    ctx.fillStyle = `hsl(${peak.hue}, 90%, 68%)`;
    ctx.beginPath();
    ctx.arc(
      peak.x + offsetX * 0.03,
      peak.y + offsetY * 0.03,
      1.7,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

function drawRiver() {
  ctx.strokeStyle = "rgba(74, 210, 255, 0.38)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  for (let x = -40; x <= width + 40; x += 12) {
    const y =
      height * 0.64 +
      Math.sin(x * 0.007 + 1.4) * height * 0.08 +
      Math.sin(x * 0.018) * 18 +
      offsetY * 0.08;
    if (x === -40) ctx.moveTo(x + offsetX * 0.05, y);
    else ctx.lineTo(x + offsetX * 0.05, y);
  }
  ctx.stroke();
  ctx.fillStyle = "rgba(105, 224, 255, 0.48)";
  ctx.font = 'italic 7px "Courier New", monospace';
  ctx.fillText("NORTH FORK", width * 0.57, height * 0.68);
}

function drawMarkers() {
  for (const marker of markers) {
    marker.life *= 0.999;
    const pulse = 9 + Math.sin(time * 0.06 + marker.phase) * 3;
    ctx.strokeStyle = `rgba(255, 91, 201, ${marker.life * 0.76})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(marker.x - 5, marker.y);
    ctx.lineTo(marker.x + 5, marker.y);
    ctx.moveTo(marker.x, marker.y - 5);
    ctx.lineTo(marker.x, marker.y + 5);
    ctx.stroke();
    ctx.fillStyle = `rgba(255, 151, 218, ${marker.life * 0.78})`;
    ctx.font = '7px "Courier New", monospace';
    ctx.textAlign = "left";
    ctx.fillText(`${marker.elevation} M`, marker.x + 12, marker.y - 8);
  }
}

window.addEventListener("pointermove", (event) => {
  pointer.targetX = event.clientX;
  pointer.targetY = event.clientY;
  pointer.active = true;
  pointer.strength += (1 - pointer.strength) * 0.18;

  const northing = 910000 + Math.round((1 - event.clientY / height) * 80000);
  const easting = 420000 + Math.round((event.clientX / width) * 80000);
  const elevation = Math.round(
    400 + pointer.strength * 1800 + Math.sin(time * 0.02) * 120,
  );
  northingLabel.textContent = `N ${northing}`;
  eastingLabel.textContent = `E ${easting}`;
  elevationLabel.textContent = `${String(elevation).padStart(4, "0")} M`;
});

window.addEventListener("pointerdown", (event) => {
  markers.push({
    x: event.clientX,
    y: event.clientY,
    elevation: 1200 + Math.round(Math.random() * 1700),
    life: 1,
    phase: Math.random() * Math.PI * 2,
  });
  if (markers.length > 8) markers.shift();
});

document.documentElement.addEventListener("pointerleave", () => {
  pointer.active = false;
});

window.addEventListener("resize", resize);

function animate() {
  pointer.x += (pointer.targetX - pointer.x) * 0.08;
  pointer.y += (pointer.targetY - pointer.y) * 0.08;
  if (!pointer.active) pointer.strength *= 0.96;

  offsetX += ((pointer.x / width - 0.5) * -18 - offsetX) * 0.025;
  offsetY += ((pointer.y / height - 0.5) * -18 - offsetY) * 0.025;

  drawMapBase();
  drawRiver();
  for (const peak of peaks) drawPeak(peak);

  if (pointer.strength > 0.03) {
    drawPeak(
      {
        x: pointer.x,
        y: pointer.y,
        radius: 115 * pointer.strength,
        levels: 11,
        phase: 1.7,
      },
      true,
    );
  }

  drawMarkers();
  time += 1;
  requestAnimationFrame(animate);
}

resize();
animate();
