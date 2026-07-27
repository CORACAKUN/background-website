const canvas = document.querySelector("#constellation");
const ctx = canvas.getContext("2d");
const coordinateX = document.querySelector("#coordinate-x");
const coordinateY = document.querySelector("#coordinate-y");

const pointer = {
  x: -1000,
  y: -1000,
  active: false,
};

const particles = [];
const config = {
  connectionDistance: 128,
  cursorDistance: 180,
  density: 14500,
};

let width = 0;
let height = 0;
let dpr = 1;
let particleCount = 0;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createParticle() {
  const depth = randomBetween(0.45, 1);

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: randomBetween(-0.12, 0.12) * depth,
    vy: randomBetween(-0.12, 0.12) * depth,
    radius: randomBetween(0.65, 1.45) * depth,
    depth,
    phase: Math.random() * Math.PI * 2,
  };
}

function setParticleCount() {
  particleCount = Math.min(
    115,
    Math.max(42, Math.round((width * height) / config.density)),
  );

  while (particles.length < particleCount) particles.push(createParticle());
  particles.length = particleCount;
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

  setParticleCount();
}

function setPointer(x, y) {
  pointer.x = x;
  pointer.y = y;
  pointer.active = true;
  coordinateX.textContent = `X ${String(Math.round(x)).padStart(3, "0")}`;
  coordinateY.textContent = `Y ${String(Math.round(y)).padStart(3, "0")}`;
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

function updateParticle(particle) {
  particle.x += particle.vx;
  particle.y += particle.vy;
  particle.phase += 0.012;

  if (particle.x < -10) particle.x = width + 10;
  if (particle.x > width + 10) particle.x = -10;
  if (particle.y < -10) particle.y = height + 10;
  if (particle.y > height + 10) particle.y = -10;
}

function drawConnection(a, b, distance, maximum, cursorConnection = false) {
  const opacity = (1 - distance / maximum) * (cursorConnection ? 0.65 : 0.2);
  const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);

  gradient.addColorStop(
    0,
    `rgba(${cursorConnection ? "127, 231, 255" : "113, 129, 225"}, ${opacity})`,
  );
  gradient.addColorStop(1, `rgba(135, 146, 255, ${opacity * 0.55})`);

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = cursorConnection ? 0.75 : 0.5;
  ctx.stroke();
}

function drawParticle(particle) {
  const twinkle = 0.7 + Math.sin(particle.phase) * 0.25;

  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(215, 223, 255, ${twinkle * particle.depth})`;
  ctx.fill();
}

function drawCursorNode() {
  if (!pointer.active) return;

  const glow = ctx.createRadialGradient(
    pointer.x,
    pointer.y,
    0,
    pointer.x,
    pointer.y,
    19,
  );
  glow.addColorStop(0, "rgba(127, 231, 255, 0.5)");
  glow.addColorStop(0.18, "rgba(127, 231, 255, 0.17)");
  glow.addColorStop(1, "rgba(127, 231, 255, 0)");

  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, 19, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, 1.7, 0, Math.PI * 2);
  ctx.fillStyle = "#baf4ff";
  ctx.fill();
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < particles.length; i += 1) {
    const particle = particles[i];
    updateParticle(particle);

    for (let j = i + 1; j < particles.length; j += 1) {
      const neighbor = particles[j];
      const distance = Math.hypot(
        particle.x - neighbor.x,
        particle.y - neighbor.y,
      );

      if (distance < config.connectionDistance) {
        drawConnection(
          particle,
          neighbor,
          distance,
          config.connectionDistance,
        );
      }
    }

    if (pointer.active) {
      const cursorDistance = Math.hypot(
        particle.x - pointer.x,
        particle.y - pointer.y,
      );

      if (cursorDistance < config.cursorDistance) {
        drawConnection(
          particle,
          pointer,
          cursorDistance,
          config.cursorDistance,
          true,
        );
      }
    }

    drawParticle(particle);
  }

  drawCursorNode();
  requestAnimationFrame(animate);
}

resize();
animate();
