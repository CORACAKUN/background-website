const canvas = document.querySelector("#fission");
const ctx = canvas.getContext("2d");

const pointer = {
  x: -999,
  y: -999,
  energy: 0,
};

const nuclei = [];
const neutrons = [];
const sparks = [];

let width = 0;
let height = 0;
let dpr = 1;
let time = 0;

function random(min, max) {
  return min + Math.random() * (max - min);
}

function makeNucleus(x = Math.random() * width, y = Math.random() * height) {
  return {
    x,
    y,
    vx: random(-0.22, 0.22),
    vy: random(-0.18, 0.18),
    radius: random(16, 28),
    wobble: random(0, Math.PI * 2),
    unstable: Math.random() > 0.45,
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

  nuclei.length = 0;
  const count = Math.round(Math.min(34, Math.max(14, (width * height) / 46000)));

  for (let index = 0; index < count; index += 1) {
    nuclei.push(makeNucleus());
  }
}

function emitNeutron(x, y, angle, speed = random(3, 6)) {
  neutrons.push({
    x,
    y,
    px: x,
    py: y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1,
  });
}

function splitNucleus(nucleus) {
  const pieces = 18;

  for (let index = 0; index < pieces; index += 1) {
    const angle = (index / pieces) * Math.PI * 2 + random(-0.16, 0.16);
    sparks.push({
      x: nucleus.x,
      y: nucleus.y,
      vx: Math.cos(angle) * random(1.8, 6.2),
      vy: Math.sin(angle) * random(1.8, 6.2),
      size: random(1, 3.4),
      life: 1,
    });
  }

  for (let index = 0; index < 3; index += 1) {
    emitNeutron(nucleus.x, nucleus.y, random(0, Math.PI * 2), random(4.6, 7.4));
  }

  nucleus.x = Math.random() * width;
  nucleus.y = Math.random() * height;
  nucleus.radius = random(15, 25);
  nucleus.unstable = Math.random() > 0.2;
}

function movePointer(x, y) {
  pointer.x = x;
  pointer.y = y;
  pointer.energy = Math.min(1, pointer.energy + 0.08);
}

addEventListener("resize", resize);
addEventListener("pointermove", (event) => movePointer(event.clientX, event.clientY));
addEventListener("pointerdown", (event) => {
  movePointer(event.clientX, event.clientY);
  let target = nuclei[0];
  let nearest = Infinity;

  for (const nucleus of nuclei) {
    const distance = Math.hypot(nucleus.x - event.clientX, nucleus.y - event.clientY);
    if (distance < nearest) {
      nearest = distance;
      target = nucleus;
    }
  }

  splitNucleus(target);
});

function updateNucleus(nucleus) {
  const dx = pointer.x - nucleus.x;
  const dy = pointer.y - nucleus.y;
  const distance = Math.hypot(dx, dy) || 1;
  const pull = Math.max(0, 1 - distance / 240) * 0.02;

  nucleus.vx += (dx / distance) * pull;
  nucleus.vy += (dy / distance) * pull;
  nucleus.vx *= 0.992;
  nucleus.vy *= 0.992;
  nucleus.x += nucleus.vx;
  nucleus.y += nucleus.vy;

  if (nucleus.x < -50) nucleus.x = width + 50;
  if (nucleus.x > width + 50) nucleus.x = -50;
  if (nucleus.y < -50) nucleus.y = height + 50;
  if (nucleus.y > height + 50) nucleus.y = -50;
}

function drawNucleus(nucleus) {
  const pulse = Math.sin(time * 0.04 + nucleus.wobble) * 2;
  const radius = nucleus.radius + pulse;

  ctx.save();
  ctx.translate(nucleus.x, nucleus.y);
  ctx.rotate(time * 0.012 + nucleus.wobble);

  for (let ring = 0; ring < 3; ring += 1) {
    ctx.beginPath();
    ctx.ellipse(0, 0, radius + ring * 8, (radius + ring * 8) * 0.42, ring, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, ${170 + ring * 24}, 64, ${0.1 + ring * 0.035})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  const gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, radius);
  gradient.addColorStop(0, nucleus.unstable ? "rgba(255, 236, 151, 0.95)" : "rgba(255, 185, 88, 0.9)");
  gradient.addColorStop(0.55, "rgba(255, 95, 39, 0.68)");
  gradient.addColorStop(1, "rgba(124, 31, 12, 0)");

  ctx.fillStyle = gradient;
  ctx.shadowColor = "#ff6a2f";
  ctx.shadowBlur = nucleus.unstable ? 22 : 13;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function updateNeutrons() {
  for (let index = neutrons.length - 1; index >= 0; index -= 1) {
    const neutron = neutrons[index];
    neutron.px = neutron.x;
    neutron.py = neutron.y;
    neutron.x += neutron.vx;
    neutron.y += neutron.vy;
    neutron.life *= 0.985;

    ctx.beginPath();
    ctx.moveTo(neutron.px, neutron.py);
    ctx.lineTo(neutron.x, neutron.y);
    ctx.strokeStyle = `rgba(255, 230, 129, ${neutron.life * 0.75})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (const nucleus of nuclei) {
      if (!nucleus.unstable) continue;

      const hit = Math.hypot(neutron.x - nucleus.x, neutron.y - nucleus.y) < nucleus.radius;
      if (hit) {
        splitNucleus(nucleus);
        neutron.life = 0;
        break;
      }
    }

    if (
      neutron.life < 0.04 ||
      neutron.x < -40 ||
      neutron.x > width + 40 ||
      neutron.y < -40 ||
      neutron.y > height + 40
    ) {
      neutrons.splice(index, 1);
    }
  }
}

function updateSparks() {
  for (let index = sparks.length - 1; index >= 0; index -= 1) {
    const spark = sparks[index];
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vx *= 0.97;
    spark.vy *= 0.97;
    spark.life *= 0.95;

    ctx.fillStyle = `rgba(255, ${150 + spark.life * 90}, 70, ${spark.life})`;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
    ctx.fill();

    if (spark.life < 0.03) sparks.splice(index, 1);
  }
}

function loop() {
  ctx.fillStyle = "rgba(8, 5, 4, 0.2)";
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";

  for (const nucleus of nuclei) {
    updateNucleus(nucleus);
    drawNucleus(nucleus);
  }

  updateNeutrons();
  updateSparks();

  ctx.globalCompositeOperation = "source-over";
  pointer.energy *= 0.96;
  time += 1;
  requestAnimationFrame(loop);
}

resize();
emitNeutron(width * 0.2, height * 0.4, 0.08, 4.5);
loop();
