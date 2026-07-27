const canvas = document.querySelector("#wave-grid");
const ctx = canvas.getContext("2d");
const meterFill = document.querySelector("#meter-fill");

const pointer = {
  x: 0,
  y: 0,
  active: false,
  energy: 0,
};

const ripples = [];
const settings = {
  gap: 27,
  hoverRadius: 175,
  perspective: 0.17,
};

let width = 0;
let height = 0;
let dpr = 1;
let columns = 0;
let rows = 0;
let offsetX = 0;
let offsetY = 0;
let time = 0;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const gap = width < 640 ? 23 : settings.gap;
  columns = Math.ceil(width / gap) + 4;
  rows = Math.ceil(height / gap) + 4;
  offsetX = (width - (columns - 1) * gap) / 2;
  offsetY = (height - (rows - 1) * gap) / 2;
  settings.currentGap = gap;
}

function setPointer(x, y) {
  pointer.x = x;
  pointer.y = y;
  pointer.active = true;
  pointer.energy = Math.min(1, pointer.energy + 0.08);
}

function createRipple(x, y, strength = 1) {
  ripples.push({
    x,
    y,
    radius: 0,
    strength,
    life: 1,
  });

  if (ripples.length > 8) ripples.shift();
}

window.addEventListener("pointermove", (event) => {
  setPointer(event.clientX, event.clientY);
});

window.addEventListener("pointerdown", (event) => {
  setPointer(event.clientX, event.clientY);
  createRipple(event.clientX, event.clientY, 1.35);
  pointer.energy = 1;
});

document.documentElement.addEventListener("pointerleave", () => {
  pointer.active = false;
});

window.addEventListener("blur", () => {
  pointer.active = false;
});

window.addEventListener("resize", resize);

function waveHeight(x, y) {
  let heightValue =
    Math.sin(x * 0.012 + time * 0.018) * 2.8 +
    Math.cos(y * 0.014 - time * 0.015) * 2.2;

  if (pointer.active) {
    const distance = Math.hypot(x - pointer.x, y - pointer.y);
    if (distance < settings.hoverRadius) {
      const proximity = 1 - distance / settings.hoverRadius;
      heightValue +=
        Math.cos(distance * 0.045 - time * 0.085) *
        proximity *
        19 *
        pointer.energy;
    }
  }

  for (const ripple of ripples) {
    const distance = Math.hypot(x - ripple.x, y - ripple.y);
    const distanceFromRing = Math.abs(distance - ripple.radius);
    const bandWidth = 52;

    if (distanceFromRing < bandWidth) {
      const band = 1 - distanceFromRing / bandWidth;
      heightValue +=
        Math.sin((distance - ripple.radius) * 0.07) *
        band *
        ripple.life *
        ripple.strength *
        27;
    }
  }

  return heightValue;
}

function getPoint(column, row) {
  const baseX = offsetX + column * settings.currentGap;
  const baseY = offsetY + row * settings.currentGap;
  const wave = waveHeight(baseX, baseY);

  // A small horizontal shift makes vertical displacement feel dimensional.
  return {
    x: baseX + wave * settings.perspective,
    y: baseY - wave,
    wave,
  };
}

function drawLine(points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }

  ctx.stroke();
}

function drawGrid() {
  const glowStrength = 0.11 + pointer.energy * 0.08;
  ctx.lineWidth = 0.55;
  ctx.strokeStyle = `rgba(93, 189, 222, ${glowStrength})`;

  for (let row = 0; row < rows; row += 1) {
    const points = [];
    for (let column = 0; column < columns; column += 1) {
      points.push(getPoint(column, row));
    }
    drawLine(points);
  }

  ctx.strokeStyle = `rgba(112, 219, 255, ${glowStrength * 0.82})`;

  for (let column = 0; column < columns; column += 1) {
    const points = [];
    for (let row = 0; row < rows; row += 1) {
      points.push(getPoint(column, row));
    }
    drawLine(points);
  }
}

function drawNodes() {
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const point = getPoint(column, row);
      const intensity = Math.min(1, Math.abs(point.wave) / 18);
      if (intensity < 0.2) continue;

      ctx.beginPath();
      ctx.arc(point.x, point.y, 0.5 + intensity * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(133, 229, 255, ${intensity * 0.5})`;
      ctx.fill();
    }
  }
}

function updateRipples() {
  for (let index = ripples.length - 1; index >= 0; index -= 1) {
    const ripple = ripples[index];
    ripple.radius += 4.1;
    ripple.life *= 0.983;

    if (ripple.life < 0.025) ripples.splice(index, 1);
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  drawGrid();
  drawNodes();
  updateRipples();

  if (pointer.active) {
    pointer.energy += (0.72 - pointer.energy) * 0.035;
  } else {
    pointer.energy *= 0.965;
  }

  meterFill.style.width = `${20 + pointer.energy * 80}%`;
  time += 1;
  requestAnimationFrame(animate);
}

resize();
animate();
