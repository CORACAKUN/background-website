const canvas = document.querySelector("#dot-field");
const ctx = canvas.getContext("2d");
const modeToggle = document.querySelector("#mode-toggle");
const modeLabel = document.querySelector("#mode-label");

const pointer = {
  x: -1000,
  y: -1000,
  active: false,
};

const settings = {
  gap: 30,
  radius: 145,
  strength: 48,
  dotSize: 1.25,
  mode: "repel",
};

let dots = [];
let width = 0;
let height = 0;
let dpr = 1;
let animationId;

function makeField() {
  dots = [];

  const gap = width < 640 ? 25 : settings.gap;
  const columns = Math.ceil(width / gap) + 2;
  const rows = Math.ceil(height / gap) + 2;
  const offsetX = (width - (columns - 1) * gap) / 2;
  const offsetY = (height - (rows - 1) * gap) / 2;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      dots.push({
        homeX: offsetX + column * gap,
        homeY: offsetY + row * gap,
        x: offsetX + column * gap,
        y: offsetY + row * gap,
        vx: 0,
        vy: 0,
      });
    }
  }
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  makeField();
}

function movePointer(x, y) {
  pointer.x = x;
  pointer.y = y;
  pointer.active = true;
}

window.addEventListener("pointermove", (event) => {
  movePointer(event.clientX, event.clientY);
});

window.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];
    if (touch) movePointer(touch.clientX, touch.clientY);
  },
  { passive: true },
);

document.documentElement.addEventListener("pointerleave", () => {
  pointer.active = false;
});

window.addEventListener("blur", () => {
  pointer.active = false;
});

window.addEventListener("resize", resize);

modeToggle.addEventListener("click", () => {
  const isAttracting = settings.mode === "attract";
  settings.mode = isAttracting ? "repel" : "attract";
  modeToggle.setAttribute("aria-pressed", String(!isAttracting));
  modeLabel.textContent = isAttracting ? "Repel" : "Magnetize";
});

function updateDot(dot) {
  const dx = dot.x - pointer.x;
  const dy = dot.y - pointer.y;
  const distance = Math.hypot(dx, dy) || 1;

  if (pointer.active && distance < settings.radius) {
    const force = 1 - distance / settings.radius;
    const easedForce = force * force;
    const direction = settings.mode === "attract" ? -1 : 1;
    dot.vx +=
      (dx / distance) * easedForce * settings.strength * 0.16 * direction;
    dot.vy +=
      (dy / distance) * easedForce * settings.strength * 0.16 * direction;
  }

  // The home force makes the grid bend instead of scattering permanently.
  dot.vx += (dot.homeX - dot.x) * 0.055;
  dot.vy += (dot.homeY - dot.y) * 0.055;
  dot.vx *= 0.82;
  dot.vy *= 0.82;
  dot.x += dot.vx;
  dot.y += dot.vy;
}

function drawDot(dot) {
  const pointerDistance = Math.hypot(dot.x - pointer.x, dot.y - pointer.y);
  const proximity = pointer.active
    ? Math.max(0, 1 - pointerDistance / (settings.radius * 1.25))
    : 0;

  const size = settings.dotSize + proximity * 1.15;
  const alpha = 0.2 + proximity * 0.65;

  ctx.beginPath();
  ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${196 + proximity * 8}, ${211 + proximity * 25}, ${
    180 - proximity * 45
  }, ${alpha})`;
  ctx.fill();
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  for (const dot of dots) {
    updateDot(dot);
    drawDot(dot);
  }

  animationId = requestAnimationFrame(animate);
}

function start() {
  cancelAnimationFrame(animationId);
  resize();
  animate();
}

start();
