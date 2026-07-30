const canvas = document.querySelector("#fusion");
const ctx = canvas.getContext("2d");

const pointer = {
  x: 0,
  y: 0,
  active: false,
  compression: 0,
};

const particles = [];
const flares = [];

let width = 0;
let height = 0;
let dpr = 1;
let centerX = 0;
let centerY = 0;
let time = 0;

function random(min, max) {
  return min + Math.random() * (max - min);
}

function makeParticle(index) {
  return {
    angle: random(0, Math.PI * 2),
    radius: random(70, Math.max(width, height) * 0.62),
    speed: random(0.006, 0.018) * (index % 2 ? 1 : -1),
    size: random(1.2, 3.3),
    heat: Math.random(),
    lane: index % 4,
  };
}

function resize() {
  width = innerWidth;
  height = innerHeight;
  dpr = Math.min(devicePixelRatio || 1, 2);
  centerX = width * 0.66;
  centerY = height * 0.47;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  particles.length = 0;
  const count = Math.round(Math.min(220, Math.max(110, (width * height) / 9000)));

  for (let index = 0; index < count; index += 1) {
    particles.push(makeParticle(index));
  }
}

function movePointer(x, y) {
  pointer.x = x;
  pointer.y = y;
  pointer.active = true;
  pointer.compression = Math.min(1, pointer.compression + 0.04);
}

function createFlare(x, y) {
  flares.push({
    x,
    y,
    radius: 0,
    life: 1,
  });

  pointer.compression = 1;
  if (flares.length > 5) flares.shift();
}

addEventListener("resize", resize);
addEventListener("pointermove", (event) => movePointer(event.clientX, event.clientY));
addEventListener("pointerdown", (event) => {
  movePointer(event.clientX, event.clientY);
  createFlare(centerX, centerY);
});
addEventListener("blur", () => {
  pointer.active = false;
});

function plasmaColor(heat, alpha) {
  if (heat > 0.72) return `rgba(255, 246, 172, ${alpha})`;
  if (heat > 0.38) return `rgba(255, 107, 174, ${alpha})`;
  return `rgba(86, 221, 255, ${alpha})`;
}

function drawCore() {
  const pulse = Math.sin(time * 0.045) * 9 + pointer.compression * 24;
  const radius = 62 + pulse;
  const gradient = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, radius * 2.7);

  gradient.addColorStop(0, "rgba(255, 255, 224, 0.96)");
  gradient.addColorStop(0.18, "rgba(255, 204, 83, 0.76)");
  gradient.addColorStop(0.46, "rgba(255, 78, 164, 0.3)");
  gradient.addColorStop(1, "rgba(69, 152, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 2.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.36, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 230, 0.92)";
  ctx.shadowColor = "#ffd35b";
  ctx.shadowBlur = 28 + pointer.compression * 36;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawParticle(particle) {
  const pointerAngle = Math.atan2(pointer.y - centerY, pointer.x - centerX);
  const pull = pointer.active ? Math.max(0, 1 - Math.hypot(pointer.x - centerX, pointer.y - centerY) / width) : 0;
  particle.angle += particle.speed + pointer.compression * 0.012;
  particle.radius += Math.sin(time * 0.012 + particle.angle + particle.lane) * 0.16;
  particle.radius += (70 - particle.radius) * pointer.compression * 0.006;

  const swirl = pointerAngle * pull * 0.12;
  const ring = particle.radius + Math.sin(particle.angle * 3 + time * 0.02) * (18 + particle.lane * 7);
  const x = centerX + Math.cos(particle.angle + swirl) * ring;
  const y = centerY + Math.sin(particle.angle * 0.82 - swirl) * ring * 0.54;
  const alpha = 0.22 + (1 - Math.min(1, ring / Math.max(width, height))) * 0.7;

  ctx.beginPath();
  ctx.arc(x, y, particle.size + pointer.compression * 1.4, 0, Math.PI * 2);
  ctx.fillStyle = plasmaColor(particle.heat, alpha);
  ctx.shadowColor = plasmaColor(particle.heat, 0.9);
  ctx.shadowBlur = 12 + pointer.compression * 18;
  ctx.fill();
  ctx.shadowBlur = 0;

  if (ring < 86 && Math.random() < 0.008 + pointer.compression * 0.02) {
    createFlare(centerX + random(-18, 18), centerY + random(-18, 18));
    particle.radius = random(width * 0.28, Math.max(width, height) * 0.62);
  }
}

function drawFieldLines() {
  ctx.lineWidth = 0.8;

  for (let ring = 0; ring < 9; ring += 1) {
    const radius = 95 + ring * 36 + Math.sin(time * 0.02 + ring) * 8;
    ctx.beginPath();

    for (let step = 0; step <= 120; step += 1) {
      const angle = (step / 120) * Math.PI * 2 + time * 0.004 * (ring % 2 ? 1 : -1);
      const wave = Math.sin(angle * 5 + time * 0.025) * (8 + ring);
      const x = centerX + Math.cos(angle) * (radius + wave);
      const y = centerY + Math.sin(angle) * (radius + wave) * 0.52;

      if (step === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = `rgba(255, ${130 + ring * 10}, 210, ${0.035 + pointer.compression * 0.03})`;
    ctx.stroke();
  }
}

function drawFlares() {
  for (let index = flares.length - 1; index >= 0; index -= 1) {
    const flare = flares[index];
    flare.radius += 10 + pointer.compression * 8;
    flare.life *= 0.92;

    ctx.beginPath();
    ctx.arc(flare.x, flare.y, flare.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 238, 160, ${flare.life * 0.3})`;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    if (flare.life < 0.03) flares.splice(index, 1);
  }
}

function loop() {
  ctx.fillStyle = "rgba(5, 4, 11, 0.18)";
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";

  drawFieldLines();

  for (const particle of particles) {
    drawParticle(particle);
  }

  drawFlares();
  drawCore();

  ctx.globalCompositeOperation = "source-over";
  pointer.compression *= 0.965;
  time += 1;
  requestAnimationFrame(loop);
}

resize();
createFlare(centerX, centerY);
loop();
