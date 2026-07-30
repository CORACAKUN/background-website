const canvas = document.querySelector("#garden");
const ctx = canvas.getContext("2d");
const behaviorLabel = document.querySelector("#behavior");
const swarmCount = document.querySelector("#swarm-count");

const pointer = {
  x: -1000,
  y: -1000,
  active: false,
  down: false,
};

const butterflies = [];
const pollen = [];

let width = 0;
let height = 0;
let dpr = 1;
let time = 0;

const wingPalettes = [
  ["#ffc66f", "#ef775f", "#4f2d42"],
  ["#8de6d1", "#3aa8a0", "#1c4650"],
  ["#df9cff", "#9c63d5", "#4e315f"],
  ["#ff9fc0", "#e25683", "#653149"],
  ["#b9dc72", "#6ba95c", "#29453b"],
];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createButterfly() {
  const depth = randomBetween(0.45, 1);
  return {
    x: Math.random() * width,
    y: Math.random() * height * 0.82,
    vx: randomBetween(-0.35, 0.35),
    vy: randomBetween(-0.25, 0.25),
    depth,
    size: randomBetween(5.5, 10.5) * depth,
    phase: Math.random() * Math.PI * 2,
    flapSpeed: randomBetween(0.16, 0.26),
    wander: Math.random() * Math.PI * 2,
    palette: wingPalettes[Math.floor(Math.random() * wingPalettes.length)],
    pollenTimer: Math.random() * 80,
  };
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

  const targetCount = width < 680 ? 44 : 72;
  while (butterflies.length < targetCount) butterflies.push(createButterfly());
  butterflies.length = targetCount;
  swarmCount.textContent = `${targetCount} butterflies`;
}

function addPollen(x, y, color, amount = 1) {
  for (let index = 0; index < amount; index += 1) {
    pollen.push({
      x: x + randomBetween(-3, 3),
      y: y + randomBetween(-3, 3),
      vx: randomBetween(-0.15, 0.15),
      vy: randomBetween(-0.35, -0.05),
      life: randomBetween(0.45, 0.9),
      size: randomBetween(0.5, 1.3),
      color,
    });
  }

  if (pollen.length > 380) pollen.splice(0, pollen.length - 380);
}

function drawBackground() {
  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "#0b1514");
  background.addColorStop(0.58, "#111b16");
  background.addColorStop(1, "#172116");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(
    width * 0.72,
    height * 0.38,
    0,
    width * 0.72,
    height * 0.38,
    Math.min(width, height) * 0.48,
  );
  glow.addColorStop(0, "rgba(255, 184, 105, 0.12)");
  glow.addColorStop(1, "rgba(255, 184, 105, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Soft grass silhouettes anchor the scene without dominating the swarm.
  ctx.strokeStyle = "rgba(93, 132, 79, 0.17)";
  ctx.lineWidth = 1;
  for (let x = -10; x < width + 10; x += 11) {
    const bladeHeight = 25 + ((x * 17) % 45);
    const sway = Math.sin(time * 0.012 + x * 0.05) * 5;
    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.quadraticCurveTo(x + sway, height - bladeHeight / 2, x + sway, height - bladeHeight);
    ctx.stroke();
  }
}

function updateButterfly(butterfly) {
  butterfly.phase += butterfly.flapSpeed;
  butterfly.wander += randomBetween(-0.035, 0.035);

  butterfly.vx += Math.cos(butterfly.wander) * 0.012;
  butterfly.vy += Math.sin(butterfly.wander * 1.3) * 0.009;

  if (pointer.active) {
    const dx = pointer.x - butterfly.x;
    const dy = pointer.y - butterfly.y;
    const distance = Math.hypot(dx, dy) || 1;
    const radius = pointer.down ? 250 : 340;

    if (distance < radius) {
      const proximity = 1 - distance / radius;
      const force = pointer.down ? -0.28 : 0.018;
      butterfly.vx += (dx / distance) * proximity * force;
      butterfly.vy += (dy / distance) * proximity * force;

      if (!pointer.down && distance < 70) {
        butterfly.vx += (-dy / distance) * 0.018;
        butterfly.vy += (dx / distance) * 0.018;
      }
    }
  }

  const speed = Math.hypot(butterfly.vx, butterfly.vy);
  const maximum = pointer.down ? 4.2 : 1.25 + butterfly.depth;
  if (speed > maximum) {
    butterfly.vx = (butterfly.vx / speed) * maximum;
    butterfly.vy = (butterfly.vy / speed) * maximum;
  }

  butterfly.vx *= 0.986;
  butterfly.vy *= 0.986;
  butterfly.x += butterfly.vx;
  butterfly.y += butterfly.vy;

  const margin = 40;
  if (butterfly.x < -margin) butterfly.x = width + margin;
  if (butterfly.x > width + margin) butterfly.x = -margin;
  if (butterfly.y < -margin) butterfly.y = height * 0.78;
  if (butterfly.y > height * 0.86) butterfly.vy -= 0.06;

  butterfly.pollenTimer -= 1;
  if (butterfly.pollenTimer <= 0 && butterfly.depth > 0.62) {
    addPollen(butterfly.x, butterfly.y, butterfly.palette[0]);
    butterfly.pollenTimer = randomBetween(28, 85);
  }
}

function drawWing(side, size, flap, colors) {
  ctx.save();
  ctx.scale(side * flap, 1);

  const gradient = ctx.createLinearGradient(0, -size, size, size);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.58, colors[1]);
  gradient.addColorStop(1, colors[2]);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.bezierCurveTo(size * 0.3, -size, size * 1.25, -size * 0.95, size * 0.95, -size * 0.12);
  ctx.bezierCurveTo(size * 1.4, size * 0.18, size * 0.92, size * 0.9, 1, size * 0.3);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 245, 226, 0.22)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(1, 0);
  ctx.lineTo(size * 0.82, -size * 0.48);
  ctx.moveTo(1, 1);
  ctx.lineTo(size * 0.72, size * 0.35);
  ctx.stroke();
  ctx.restore();
}

function drawButterfly(butterfly) {
  const angle = Math.atan2(butterfly.vy, butterfly.vx) + Math.PI / 2;
  const flap = 0.18 + Math.abs(Math.sin(butterfly.phase)) * 0.82;

  ctx.save();
  ctx.translate(butterfly.x, butterfly.y);
  ctx.rotate(angle);
  ctx.globalAlpha = 0.5 + butterfly.depth * 0.5;

  drawWing(-1, butterfly.size, flap, butterfly.palette);
  drawWing(1, butterfly.size, flap, butterfly.palette);

  ctx.fillStyle = "#241c22";
  ctx.beginPath();
  ctx.ellipse(0, 0, butterfly.size * 0.13, butterfly.size * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 232, 199, 0.55)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-0.5, -butterfly.size * 0.42);
  ctx.quadraticCurveTo(-butterfly.size * 0.25, -butterfly.size * 0.8, -butterfly.size * 0.42, -butterfly.size);
  ctx.moveTo(0.5, -butterfly.size * 0.42);
  ctx.quadraticCurveTo(butterfly.size * 0.25, -butterfly.size * 0.8, butterfly.size * 0.42, -butterfly.size);
  ctx.stroke();
  ctx.restore();
}

function updateAndDrawPollen() {
  ctx.globalCompositeOperation = "lighter";
  for (let index = pollen.length - 1; index >= 0; index -= 1) {
    const particle = pollen[index];
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy -= 0.001;
    particle.life *= 0.978;

    ctx.fillStyle = particle.color;
    ctx.globalAlpha = particle.life * 0.7;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();

    if (particle.life < 0.02) pollen.splice(index, 1);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
});

window.addEventListener("pointerdown", () => {
  pointer.down = true;
  behaviorLabel.textContent = "Scattering";
  addPollen(pointer.x, pointer.y, "#ffc46b", 16);
});

window.addEventListener("pointerup", () => {
  pointer.down = false;
  behaviorLabel.textContent = "Curious";
});

document.documentElement.addEventListener("pointerleave", () => {
  pointer.active = false;
  pointer.down = false;
  behaviorLabel.textContent = "Wandering";
});

window.addEventListener("resize", resize);

function animate() {
  drawBackground();

  butterflies.sort((a, b) => a.depth - b.depth);
  for (const butterfly of butterflies) {
    updateButterfly(butterfly);
    drawButterfly(butterfly);
  }

  updateAndDrawPollen();
  time += 1;
  requestAnimationFrame(animate);
}

resize();
animate();
