const canvas = document.querySelector("#atoms");
const ctx = canvas.getContext("2d");

const pointer = {
  x: -999,
  y: -999,
  down: false,
  energy: 0,
};

const atoms = [];
const pulses = [];

let width = 0;
let height = 0;
let dpr = 1;
let time = 0;

function random(min, max) {
  return min + Math.random() * (max - min);
}

function createAtom(index) {
  const orbitCount = 2 + Math.floor(Math.random() * 3);

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: random(-0.28, 0.28),
    vy: random(-0.24, 0.24),
    radius: random(26, 62),
    spin: random(0.006, 0.018) * (Math.random() > 0.5 ? 1 : -1),
    phase: random(0, Math.PI * 2),
    hue: index % 3,
    orbitCount,
  };
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

  const target = Math.round(Math.min(42, Math.max(18, (width * height) / 36000)));
  atoms.length = 0;

  for (let index = 0; index < target; index += 1) {
    atoms.push(createAtom(index));
  }
}

function movePointer(x, y) {
  pointer.x = x;
  pointer.y = y;
  pointer.energy = Math.min(1, pointer.energy + 0.08);
}

function addPulse(x, y) {
  pulses.push({
    x,
    y,
    radius: 0,
    life: 1,
  });

  if (pulses.length > 6) pulses.shift();
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => movePointer(event.clientX, event.clientY));
window.addEventListener("pointerdown", (event) => {
  pointer.down = true;
  movePointer(event.clientX, event.clientY);
  addPulse(event.clientX, event.clientY);
});
window.addEventListener("pointerup", () => {
  pointer.down = false;
});
window.addEventListener("blur", () => {
  pointer.down = false;
});

function atomColor(atom, alpha) {
  if (atom.hue === 0) return `rgba(69, 232, 255, ${alpha})`;
  if (atom.hue === 1) return `rgba(255, 111, 171, ${alpha})`;
  return `rgba(183, 239, 121, ${alpha})`;
}

function drawAtom(atom) {
  const dx = pointer.x - atom.x;
  const dy = pointer.y - atom.y;
  const distance = Math.hypot(dx, dy) || 1;
  const influence = Math.max(0, 1 - distance / 230);
  const charge = influence * (0.75 + pointer.energy * 0.75);

  atom.vx += (dx / distance) * influence * 0.018;
  atom.vy += (dy / distance) * influence * 0.018;
  atom.vx *= 0.988;
  atom.vy *= 0.988;
  atom.x += atom.vx;
  atom.y += atom.vy;

  if (atom.x < -80) atom.x = width + 80;
  if (atom.x > width + 80) atom.x = -80;
  if (atom.y < -80) atom.y = height + 80;
  if (atom.y > height + 80) atom.y = -80;

  const nucleusRadius = 3.5 + charge * 3;
  const orbitRadius = atom.radius + charge * 14;

  ctx.save();
  ctx.translate(atom.x, atom.y);
  ctx.rotate(atom.phase + time * atom.spin);

  for (let orbit = 0; orbit < atom.orbitCount; orbit += 1) {
    const angle = (Math.PI / atom.orbitCount) * orbit + Math.sin(time * 0.01 + orbit) * 0.1;
    const electronAngle = time * atom.spin * 7 + atom.phase + orbit * 2.1;

    ctx.save();
    ctx.rotate(angle);
    ctx.scale(1, 0.36 + orbit * 0.09);
    ctx.beginPath();
    ctx.ellipse(0, 0, orbitRadius, orbitRadius, 0, 0, Math.PI * 2);
    ctx.strokeStyle = atomColor(atom, 0.08 + charge * 0.08);
    ctx.lineWidth = 0.8;
    ctx.stroke();

    const ex = Math.cos(electronAngle) * orbitRadius;
    const ey = Math.sin(electronAngle) * orbitRadius;
    ctx.beginPath();
    ctx.arc(ex, ey, 2.1 + charge * 1.4, 0, Math.PI * 2);
    ctx.fillStyle = atomColor(atom, 0.62 + charge * 0.35);
    ctx.shadowColor = atomColor(atom, 0.9);
    ctx.shadowBlur = 12 + charge * 16;
    ctx.fill();
    ctx.restore();
  }

  ctx.shadowBlur = 18 + charge * 24;
  ctx.shadowColor = atomColor(atom, 0.9);
  ctx.fillStyle = atomColor(atom, 0.82);
  ctx.beginPath();
  ctx.arc(0, 0, nucleusRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBonds() {
  ctx.lineWidth = 0.55;

  for (let a = 0; a < atoms.length; a += 1) {
    for (let b = a + 1; b < atoms.length; b += 1) {
      const first = atoms[a];
      const second = atoms[b];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);

      if (distance > 150) continue;

      const alpha = (1 - distance / 150) * 0.14;
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      ctx.lineTo(second.x, second.y);
      ctx.strokeStyle = `rgba(170, 230, 255, ${alpha})`;
      ctx.stroke();
    }
  }
}

function drawPulses() {
  for (let index = pulses.length - 1; index >= 0; index -= 1) {
    const pulse = pulses[index];
    pulse.radius += 8 + pointer.energy * 8;
    pulse.life *= 0.94;

    ctx.beginPath();
    ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(69, 232, 255, ${pulse.life * 0.24})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (pulse.life < 0.03) pulses.splice(index, 1);
  }
}

function loop() {
  ctx.fillStyle = "rgba(4, 7, 11, 0.2)";
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";
  drawBonds();
  drawPulses();

  for (const atom of atoms) {
    drawAtom(atom);
  }

  ctx.globalCompositeOperation = "source-over";
  pointer.energy *= pointer.down ? 0.985 : 0.95;
  time += 1;
  requestAnimationFrame(loop);
}

resize();
addPulse(window.innerWidth * 0.68, window.innerHeight * 0.42);
loop();
