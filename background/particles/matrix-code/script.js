const canvas = document.querySelector("#matrix");
const ctx = canvas.getContext("2d");

const glyphs =
  "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&<>[]{}";

const pointer = {
  x: -999,
  y: -999,
  active: false,
  pulse: 0,
};

const columns = [];
const bursts = [];

let width = 0;
let height = 0;
let dpr = 1;
let fontSize = 18;
let time = 0;

function random(min, max) {
  return min + Math.random() * (max - min);
}

function randomGlyph() {
  return glyphs[Math.floor(Math.random() * glyphs.length)];
}

function createColumn(index) {
  return {
    x: index * fontSize,
    y: random(-height, height),
    speed: random(3.6, 9.5),
    length: Math.floor(random(9, 34)),
    drift: random(0, Math.PI * 2),
    glyphs: Array.from({ length: 40 }, randomGlyph),
  };
}

function resize() {
  width = innerWidth;
  height = innerHeight;
  dpr = Math.min(devicePixelRatio || 1, 2);
  fontSize = width < 640 ? 15 : 18;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const count = Math.ceil(width / fontSize) + 2;
  columns.length = 0;

  for (let index = 0; index < count; index += 1) {
    columns.push(createColumn(index));
  }
}

function movePointer(x, y) {
  pointer.x = x;
  pointer.y = y;
  pointer.active = true;
  pointer.pulse = Math.min(1, pointer.pulse + 0.05);
}

function emitBurst(x, y) {
  bursts.push({
    x,
    y,
    radius: 0,
    life: 1,
  });

  if (bursts.length > 7) bursts.shift();
}

addEventListener("resize", resize);
addEventListener("pointermove", (event) => movePointer(event.clientX, event.clientY));
addEventListener("pointerdown", (event) => {
  movePointer(event.clientX, event.clientY);
  emitBurst(event.clientX, event.clientY);
});
addEventListener("blur", () => {
  pointer.active = false;
});

function drawColumn(column, index) {
  const pointerDistance = Math.abs(column.x - pointer.x);
  const warp = pointer.active ? Math.max(0, 1 - pointerDistance / 160) : 0;
  const x = column.x + Math.sin(time * 0.025 + column.drift) * 3 + warp * 22 * Math.sin(time * 0.08);

  column.y += column.speed + warp * 2.2;

  if (column.y - column.length * fontSize > height + 80) {
    Object.assign(column, createColumn(index));
    column.y = random(-height * 0.5, -40);
  }

  for (let row = 0; row < column.length; row += 1) {
    const y = column.y - row * fontSize;
    if (y < -40 || y > height + 40) continue;

    const glyphIndex = (row + Math.floor(time * 0.08 + index)) % column.glyphs.length;
    const alpha = Math.max(0, 1 - row / column.length);
    const glow = row === 0 ? 1 : alpha * 0.55;
    const nearPointer = Math.max(0, 1 - Math.hypot(x - pointer.x, y - pointer.y) / 145);

    if (Math.random() < 0.012) column.glyphs[glyphIndex] = randomGlyph();

    ctx.fillStyle =
      row === 0
        ? `rgba(235, 255, 242, ${0.78 + nearPointer * 0.22})`
        : `rgba(${68 + glow * 70}, ${210 + glow * 45}, ${116 + glow * 80}, ${
            alpha * 0.72 + nearPointer * 0.22
          })`;
    ctx.shadowColor = nearPointer > 0 ? "#63ff9f" : "#35db7e";
    ctx.shadowBlur = row === 0 ? 12 + nearPointer * 16 : nearPointer * 12;
    ctx.fillText(column.glyphs[glyphIndex], x, y);
  }
}

function drawBursts() {
  for (let index = bursts.length - 1; index >= 0; index -= 1) {
    const burst = bursts[index];
    burst.radius += 9 + pointer.pulse * 10;
    burst.life *= 0.92;

    ctx.beginPath();
    ctx.arc(burst.x, burst.y, burst.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(99, 255, 159, ${burst.life * 0.34})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = "#63ff9f";
    ctx.shadowBlur = 18;
    ctx.stroke();

    if (burst.life < 0.035) bursts.splice(index, 1);
  }
}

function drawGridNoise() {
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(99, 255, 159, 0.08)";

  for (let index = 0; index < 42; index += 1) {
    const x = (Math.sin(index * 91.7 + time * 0.013) * 0.5 + 0.5) * width;
    const y = (Math.cos(index * 41.3 - time * 0.017) * 0.5 + 0.5) * height;
    ctx.fillRect(x, y, 1, 1);
  }
}

function loop() {
  ctx.fillStyle = "rgba(1, 6, 4, 0.18)";
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${fontSize}px Consolas, 'Courier New', monospace`;
  ctx.globalCompositeOperation = "lighter";

  drawGridNoise();

  for (let index = 0; index < columns.length; index += 1) {
    drawColumn(columns[index], index);
  }

  drawBursts();

  ctx.globalCompositeOperation = "source-over";
  ctx.shadowBlur = 0;
  pointer.pulse *= 0.95;
  time += 1;
  requestAnimationFrame(loop);
}

resize();
emitBurst(width * 0.72, height * 0.42);
loop();
