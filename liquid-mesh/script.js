const canvas = document.querySelector("#liquid-mesh");
const ctx = canvas.getContext("2d");

const pointer = {
  x: 0,
  y: 0,
  previousX: 0,
  previousY: 0,
  active: false,
  influence: 0,
};

const blobs = [];
const palette = [
  [29, 170, 132],
  [62, 111, 157],
  [124, 74, 161],
  [181, 98, 102],
  [181, 211, 76],
  [28, 132, 117],
];

let width = 0;
let height = 0;
let dpr = 1;
let time = 0;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createBlob(index) {
  const angle = (index / palette.length) * Math.PI * 2;
  const radius = Math.min(width, height) * randomBetween(0.25, 0.43);
  const x = width * 0.58 + Math.cos(angle) * width * 0.27;
  const y = height * 0.5 + Math.sin(angle) * height * 0.3;

  return {
    x,
    y,
    homeX: x,
    homeY: y,
    vx: 0,
    vy: 0,
    radius,
    color: palette[index],
    phase: Math.random() * Math.PI * 2,
    speed: randomBetween(0.0007, 0.0015),
    orbitX: randomBetween(45, 125),
    orbitY: randomBetween(35, 100),
  };
}

function buildMesh() {
  blobs.length = 0;
  palette.forEach((_, index) => blobs.push(createBlob(index)));
}

function resize() {
  width = window.innerWidth * 1.16;
  height = window.innerHeight * 1.16;
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  buildMesh();
}

function setPointer(x, y) {
  const canvasX = x + window.innerWidth * 0.08;
  const canvasY = y + window.innerHeight * 0.08;

  pointer.previousX = pointer.x;
  pointer.previousY = pointer.y;
  pointer.x = canvasX;
  pointer.y = canvasY;
  pointer.active = true;
  pointer.influence = 1;
}

window.addEventListener("pointermove", (event) => {
  setPointer(event.clientX, event.clientY);
});

window.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];
    if (touch) setPointer(touch.clientX, touch.clientY);
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

function updateBlob(blob, index) {
  const flowX = Math.cos(time * blob.speed + blob.phase) * blob.orbitX;
  const flowY =
    Math.sin(time * blob.speed * 1.17 + blob.phase) * blob.orbitY;
  const targetX = blob.homeX + flowX;
  const targetY = blob.homeY + flowY;

  blob.vx += (targetX - blob.x) * 0.0017;
  blob.vy += (targetY - blob.y) * 0.0017;

  if (pointer.active || pointer.influence > 0.01) {
    const dx = pointer.x - blob.x;
    const dy = pointer.y - blob.y;
    const distance = Math.hypot(dx, dy) || 1;
    const reach = blob.radius * 1.5;

    if (distance < reach) {
      const proximity = 1 - distance / reach;
      const pull = proximity * proximity * (0.16 + index * 0.013);
      blob.vx += (dx / distance) * pull * pointer.influence;
      blob.vy += (dy / distance) * pull * pointer.influence;

      // The cursor's direction stretches the mesh like stirred paint.
      blob.vx +=
        (pointer.x - pointer.previousX) * proximity * 0.0018 * pointer.influence;
      blob.vy +=
        (pointer.y - pointer.previousY) * proximity * 0.0018 * pointer.influence;
    }
  }

  blob.vx *= 0.965;
  blob.vy *= 0.965;
  blob.x += blob.vx;
  blob.y += blob.vy;
}

function drawBlob(blob) {
  const [red, green, blue] = blob.color;
  const gradient = ctx.createRadialGradient(
    blob.x,
    blob.y,
    blob.radius * 0.04,
    blob.x,
    blob.y,
    blob.radius,
  );

  gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 0.95)`);
  gradient.addColorStop(0.42, `rgba(${red}, ${green}, ${blue}, 0.68)`);
  gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);

  ctx.beginPath();
  ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

function drawCursorCurrent() {
  if (pointer.influence < 0.01) return;

  const radius = 150;
  const gradient = ctx.createRadialGradient(
    pointer.x,
    pointer.y,
    0,
    pointer.x,
    pointer.y,
    radius,
  );

  gradient.addColorStop(
    0,
    `rgba(208, 255, 126, ${0.15 * pointer.influence})`,
  );
  gradient.addColorStop(
    0.42,
    `rgba(80, 235, 196, ${0.08 * pointer.influence})`,
  );
  gradient.addColorStop(1, "rgba(80, 235, 196, 0)");

  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

function animate() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#07110f";
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = "screen";
  ctx.filter = `blur(${Math.max(38, Math.min(width, height) * 0.045)}px)`;

  for (let index = 0; index < blobs.length; index += 1) {
    updateBlob(blobs[index], index);
    drawBlob(blobs[index]);
  }

  drawCursorCurrent();
  ctx.filter = "none";
  ctx.globalCompositeOperation = "source-over";

  if (!pointer.active) pointer.influence *= 0.965;
  time += 1;
  requestAnimationFrame(animate);
}

resize();
animate();
