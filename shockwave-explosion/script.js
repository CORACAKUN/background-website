const canvas = document.querySelector("#explosion");
const ctx = canvas.getContext("2d");

const pointer = {
  x: 0,
  y: 0,
  active: false,
  heat: 0,
};

const embers = [];
const blasts = [];
const smoke = [];

let width = 0;
let height = 0;
let dpr = 1;
let time = 0;

function random(min, max) {
  return min + Math.random() * (max - min);
}

function makeEmber(x = Math.random() * width, y = Math.random() * height) {
  return {
    x,
    y,
    px: x,
    py: y,
    vx: random(-0.4, 0.4),
    vy: random(-1.8, -0.2),
    size: random(0.8, 2.8),
    heat: random(0.35, 1),
    drift: random(0, Math.PI * 2),
  };
}

function resize() {
  width = innerWidth;
  height = innerHeight;
  dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  embers.length = 0;
  const count = Math.round(Math.min(260, Math.max(120, (width * height) / 8000)));

  for (let index = 0; index < count; index += 1) {
    embers.push(makeEmber());
  }
}

function movePointer(x, y) {
  pointer.x = x;
  pointer.y = y;
  pointer.active = true;
  pointer.heat = Math.min(1, pointer.heat + 0.06);
}

function detonate(x, y) {
  blasts.push({
    x,
    y,
    radius: 0,
    life: 1,
    power: random(0.85, 1.25),
  });

  for (let index = 0; index < 95; index += 1) {
    const angle = random(0, Math.PI * 2);
    const speed = random(2, 11);
    embers.push({
      ...makeEmber(x, y),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: random(1.2, 4.2),
      heat: 1,
    });
  }

  for (let index = 0; index < 18; index += 1) {
    const angle = random(0, Math.PI * 2);
    smoke.push({
      x,
      y,
      vx: Math.cos(angle) * random(0.6, 3.2),
      vy: Math.sin(angle) * random(0.6, 3.2) - random(0, 1.4),
      radius: random(18, 44),
      life: 1,
      hue: random(18, 38),
    });
  }

  if (embers.length > 520) embers.splice(0, embers.length - 520);
  if (blasts.length > 7) blasts.shift();
}

addEventListener("resize", resize);
addEventListener("pointermove", (event) => movePointer(event.clientX, event.clientY));
addEventListener("pointerdown", (event) => {
  movePointer(event.clientX, event.clientY);
  detonate(event.clientX, event.clientY);
});
addEventListener("blur", () => {
  pointer.active = false;
});

function drawBackground() {
  const gradient = ctx.createRadialGradient(
    width * 0.72,
    height * 0.5,
    0,
    width * 0.72,
    height * 0.5,
    Math.max(width, height) * 0.78,
  );

  gradient.addColorStop(0, "rgba(60, 18, 8, 0.34)");
  gradient.addColorStop(0.36, "rgba(18, 6, 5, 0.5)");
  gradient.addColorStop(1, "rgba(7, 3, 3, 1)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawBlast(blast) {
  blast.radius += 9 + blast.power * 12;
  blast.life *= 0.92;

  const core = ctx.createRadialGradient(blast.x, blast.y, 0, blast.x, blast.y, blast.radius * 1.2);
  core.addColorStop(0, `rgba(255, 246, 190, ${blast.life * 0.58})`);
  core.addColorStop(0.28, `rgba(255, 105, 25, ${blast.life * 0.32})`);
  core.addColorStop(1, "rgba(255, 64, 12, 0)");

  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(blast.x, blast.y, blast.radius * 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(blast.x, blast.y, blast.radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, 214, 98, ${blast.life * 0.42})`;
  ctx.lineWidth = 2.6 * blast.power;
  ctx.stroke();
}

function drawSmoke(puff) {
  puff.x += puff.vx;
  puff.y += puff.vy;
  puff.vx *= 0.986;
  puff.vy *= 0.982;
  puff.vy -= 0.014;
  puff.radius += 0.75;
  puff.life *= 0.978;

  const gradient = ctx.createRadialGradient(puff.x, puff.y, 0, puff.x, puff.y, puff.radius);
  gradient.addColorStop(0, `hsla(${puff.hue}, 45%, 38%, ${puff.life * 0.16})`);
  gradient.addColorStop(1, "rgba(30, 18, 14, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawEmber(ember) {
  ember.px = ember.x;
  ember.py = ember.y;

  const dx = ember.x - pointer.x;
  const dy = ember.y - pointer.y;
  const distance = Math.hypot(dx, dy) || 1;
  const push = pointer.active ? Math.max(0, 1 - distance / 180) : 0;

  ember.vx += (dx / distance) * push * 0.13;
  ember.vx += Math.sin(time * 0.025 + ember.drift) * 0.018;
  ember.vy += 0.035;
  ember.vx *= 0.992;
  ember.vy *= 0.992;
  ember.x += ember.vx;
  ember.y += ember.vy;
  ember.heat *= 0.995;

  if (ember.y > height + 30 || ember.x < -40 || ember.x > width + 40 || ember.heat < 0.08) {
    Object.assign(ember, makeEmber(Math.random() * width, height + 20));
  }

  ctx.beginPath();
  ctx.moveTo(ember.px, ember.py);
  ctx.lineTo(ember.x, ember.y);
  ctx.strokeStyle = `rgba(255, ${120 + ember.heat * 120}, 45, ${ember.heat * 0.55})`;
  ctx.lineWidth = ember.size;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(ember.x, ember.y, ember.size * 0.8, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, ${150 + ember.heat * 90}, 64, ${ember.heat})`;
  ctx.fill();
}

function loop() {
  drawBackground();
  ctx.globalCompositeOperation = "lighter";

  for (let index = blasts.length - 1; index >= 0; index -= 1) {
    drawBlast(blasts[index]);
    if (blasts[index].life < 0.035) blasts.splice(index, 1);
  }

  for (let index = smoke.length - 1; index >= 0; index -= 1) {
    drawSmoke(smoke[index]);
    if (smoke[index].life < 0.025) smoke.splice(index, 1);
  }

  for (const ember of embers) {
    drawEmber(ember);
  }

  ctx.globalCompositeOperation = "source-over";
  pointer.heat *= 0.96;
  time += 1;
  requestAnimationFrame(loop);
}

resize();
detonate(width * 0.72, height * 0.48);
loop();
