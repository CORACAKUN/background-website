const canvas = document.querySelector("#gravity-field");
const ctx = canvas.getContext("2d");
const pointer = {
  x: 0,
  y: 0,
  previousX: 0,
  previousY: 0,
  active: false,
  speed: 0,
};
const particles = [];
const settings = {
  particleDensity: 7600,
  influenceRadius: 245,
  gravity: 1.05,
  swirl: 0.34,
  maxSpeed: 4.5,
};
let width = 0;
let height = 0;
let dpr = 1;
let animationFrame = 0;
function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}
function createParticle(initial = true) {
  const particle = {
    x: Math.random() * width,
    y: Math.random() * height,
    previousX: 0,
    previousY: 0,
    vx: randomBetween(-0.12, 0.12),
    vy: randomBetween(-0.12, 0.12),
    size: randomBetween(0.55, 1.45),
    warmth: Math.random(),
    life: randomBetween(500, 1500),
  };
  particle.previousX = particle.x;
  particle.previousY = particle.y;
  if (!initial) {
    const side = Math.floor(Math.random() * 4);
    if (side === 0) particle.x = -5;
    if (side === 1) particle.x = width + 5;
    if (side === 2) particle.y = -5;
    if (side === 3) particle.y = height + 5;
  }
  return particle;
}
function resetParticle(particle) {
  Object.assign(particle, createParticle(false));
  particle.previousX = particle.x;
  particle.previousY = particle.y;
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
  const targetCount = Math.min(220, Math.max(80, Math.round((width * height) / settings.particleDensity)), );
  while (particles.length < targetCount) particles.push(createParticle());
  particles.length = targetCount;
}
function movePointer(x, y) {
  const dx = x - pointer.x;
  const dy = y - pointer.y;
  pointer.previousX = pointer.x;
  pointer.previousY = pointer.y;
  pointer.x = x;
  pointer.y = y;
  pointer.speed = Math.min(30, Math.hypot(dx, dy));
  pointer.active = true;
}
window.addEventListener("pointermove", (event) => {
  movePointer(event.clientX, event.clientY);
});
window.addEventListener("touchmove", (event) => {
  const touch = event.touches[0];
  if (touch) movePointer(touch.clientX, touch.clientY);
}, {
  passive: true
}, );
document.documentElement.addEventListener("pointerleave", () => {
  pointer.active = false;
});
window.addEventListener("blur", () => {
  pointer.active = false;
});
window.addEventListener("resize", resize);
function applyGravity(particle) {
  if (!pointer.active) return;
  const dx = pointer.x - particle.x;
  const dy = pointer.y - particle.y;
  const distance = Math.hypot(dx, dy) || 1;
  if (distance > settings.influenceRadius) return;
  const proximity = 1 - distance / settings.influenceRadius;
  const force = proximity * proximity * settings.gravity;
  const normalX = dx / distance;
  const normalY = dy / distance;
  // Radial pull plus a perpendicular force produces a curved orbit.
  particle.vx += normalX * force - normalY * force * settings.swirl;
  particle.vy += normalY * force + normalX * force * settings.swirl;
  // Fast cursor movements pass a little momentum into the particle stream.
  particle.vx += (pointer.x - pointer.previousX) * proximity * pointer.speed * 0.0008;
  particle.vy += (pointer.y - pointer.previousY) * proximity * pointer.speed * 0.0008;
  if (distance < 18) {
    const kick = randomBetween(0.8, 1.8);
    particle.vx -= normalX * kick;
    particle.vy -= normalY * kick;
  }
}
function updateParticle(particle) {
  particle.previousX = particle.x;
  particle.previousY = particle.y;
  applyGravity(particle);
  const speed = Math.hypot(particle.vx, particle.vy);
  if (speed > settings.maxSpeed) {
    particle.vx = (particle.vx / speed) * settings.maxSpeed;
    particle.vy = (particle.vy / speed) * settings.maxSpeed;
  }
  particle.vx *= 0.994;
  particle.vy *= 0.994;
  particle.x += particle.vx;
  particle.y += particle.vy;
  particle.life -= 1;
  const margin = 55;
  if (particle.life <= 0 || particle.x < -margin || particle.x > width + margin || particle.y < -margin || particle.y > height + margin ) {
    resetParticle(particle);
  }
}
function drawParticle(particle) {
  const speed = Math.hypot(particle.vx, particle.vy);
  const alpha = Math.min(0.9, 0.24 + speed * 0.14);
  const red = Math.round(175 + particle.warmth * 80);
  const green = Math.round(165 - particle.warmth * 45);
  const blue = Math.round(225 - particle.warmth * 130);
  ctx.beginPath();
  ctx.moveTo(particle.previousX, particle.previousY);
  ctx.lineTo(particle.x, particle.y);
  ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  ctx.lineWidth = particle.size;
  ctx.lineCap = "round";
  ctx.stroke();
}
function drawGravityWell() {
  if (!pointer.active) return;
  const pulse = Math.sin(animationFrame * 0.025) * 3;
  const outerRadius = 44 + pulse;
  const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, outerRadius, );
  glow.addColorStop(0, "rgba(0, 0, 0, 0.96)");
  glow.addColorStop(0.18, "rgba(15, 7, 12, 0.92)");
  glow.addColorStop(0.35, "rgba(255, 111, 52, 0.19)");
  glow.addColorStop(0.57, "rgba(155, 94, 242, 0.08)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, outerRadius, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(pointer.x, pointer.y, 29 + pulse * 0.3, 9, -0.28, 0, Math.PI * 2, );
  ctx.strokeStyle = "rgba(255, 141, 74, 0.52)";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = "#020102";
  ctx.shadowColor = "#ff7545";
  ctx.shadowBlur = 13;
  ctx.fill();
  ctx.shadowBlur = 0;
}
function animate() {
  // A translucent clear preserves short particle trails.
  ctx.fillStyle = "rgba(7, 5, 6, 0.2)";
  ctx.fillRect(0, 0, width, height);
  for (const particle of particles) {
    updateParticle(particle);
    drawParticle(particle);
  }
  drawGravityWell();
  pointer.speed *= 0.84;
  animationFrame += 1;
  requestAnimationFrame(animate);
}
resize();
ctx.fillStyle = "#070506";
ctx.fillRect(0, 0, width, height);
animate();
