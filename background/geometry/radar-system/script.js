const canvas = document.querySelector("#radar");
const ctx = canvas.getContext("2d");
const contactCount = document.querySelector("#contact-count");
const bearingLabel = document.querySelector("#bearing");
const distanceLabel = document.querySelector("#distance");

const contacts = [];
const echoes = [];
const waypoints = [];

const pointer = {
  x: -1000,
  y: -1000,
  inside: false,
};

let width = 0;
let height = 0;
let dpr = 1;
let centerX = 0;
let centerY = 0;
let radius = 0;
let sweepAngle = -Math.PI / 2;
let time = 0;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createContact(index) {
  const angle = randomBetween(0, Math.PI * 2);
  const distance = randomBetween(0.18, 0.88);
  return {
    id: `T-${String(index + 1).padStart(2, "0")}`,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    vx: randomBetween(-0.00016, 0.00016),
    vy: randomBetween(-0.00016, 0.00016),
    strength: 0,
    detected: false,
    type: index % 3 === 0 ? "AIR" : index % 3 === 1 ? "SURFACE" : "UNKNOWN",
  };
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  centerX = width < 700 ? width * 0.62 : width * 0.73;
  centerY = width < 700 ? height * 0.33 : height * 0.49;
  radius = Math.min(width * (width < 700 ? 0.43 : 0.285), height * 0.39);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const targetCount = width < 700 ? 6 : 8;
  while (contacts.length < targetCount) contacts.push(createContact(contacts.length));
  contacts.length = targetCount;
  contactCount.textContent = `${String(targetCount).padStart(2, "0")} active`;
}

function normalizeAngle(angle) {
  let result = angle % (Math.PI * 2);
  if (result < 0) result += Math.PI * 2;
  return result;
}

function angularDistance(a, b) {
  const difference = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(difference, Math.PI * 2 - difference);
}

function drawBackground() {
  ctx.fillStyle = "#020b07";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(67, 174, 107, 0.035)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x < width; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawRadarFace() {
  const glow = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius * 1.25,
  );
  glow.addColorStop(0, "rgba(34, 172, 91, 0.06)");
  glow.addColorStop(0.78, "rgba(11, 83, 45, 0.025)");
  glow.addColorStop(1, "rgba(20, 130, 65, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 1.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(4, 25, 15, 0.7)";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(83, 255, 152, 0.2)";
  ctx.lineWidth = 0.7;
  for (let ring = 1; ring <= 5; ring += 1) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, (radius / 5) * ring, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius,
    );
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(83, 255, 152, 0.46)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(170, 255, 202, 0.28)";
  ctx.font = '7px "Courier New", monospace';
  ctx.textAlign = "center";
  for (let angle = 0; angle < 360; angle += 30) {
    const radians = toRadians(angle - 90);
    ctx.fillText(
      String(angle).padStart(3, "0"),
      centerX + Math.cos(radians) * (radius + 15),
      centerY + Math.sin(radians) * (radius + 15) + 2,
    );
  }
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function drawSweep() {
  const trailWidth = 0.62;
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius,
  );
  gradient.addColorStop(0, "rgba(83, 255, 152, 0.19)");
  gradient.addColorStop(1, "rgba(83, 255, 152, 0.015)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, sweepAngle - trailWidth, sweepAngle);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(128, 255, 180, 0.78)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(sweepAngle) * radius,
    centerY + Math.sin(sweepAngle) * radius,
  );
  ctx.stroke();
}

function updateContacts() {
  for (const contact of contacts) {
    contact.x += contact.vx;
    contact.y += contact.vy;

    const distance = Math.hypot(contact.x, contact.y);
    if (distance > 0.92) {
      const normalX = contact.x / distance;
      const normalY = contact.y / distance;
      const dot = contact.vx * normalX + contact.vy * normalY;
      contact.vx -= 2 * dot * normalX;
      contact.vy -= 2 * dot * normalY;
    }

    const angle = Math.atan2(contact.y, contact.x);
    if (angularDistance(angle, sweepAngle) < 0.025) {
      contact.strength = 1;
      contact.detected = true;
      echoes.push({
        x: contact.x,
        y: contact.y,
        life: 1,
      });
    }

    contact.strength *= 0.986;
  }

  if (echoes.length > 70) echoes.splice(0, echoes.length - 70);
}

function drawEchoes() {
  for (let index = echoes.length - 1; index >= 0; index -= 1) {
    const echo = echoes[index];
    echo.life *= 0.975;
    const x = centerX + echo.x * radius;
    const y = centerY + echo.y * radius;

    ctx.strokeStyle = `rgba(83, 255, 152, ${echo.life * 0.2})`;
    ctx.beginPath();
    ctx.arc(x, y, 2 + (1 - echo.life) * 11, 0, Math.PI * 2);
    ctx.stroke();

    if (echo.life < 0.02) echoes.splice(index, 1);
  }
}

function drawContacts() {
  ctx.textAlign = "left";

  for (const contact of contacts) {
    const x = centerX + contact.x * radius;
    const y = centerY + contact.y * radius;
    const alpha = 0.18 + contact.strength * 0.82;

    ctx.fillStyle = `rgba(158, 255, 195, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.8 + contact.strength * 1.4, 0, Math.PI * 2);
    ctx.fill();

    if (contact.strength > 0.16) {
      ctx.strokeStyle = `rgba(83, 255, 152, ${contact.strength * 0.55})`;
      ctx.beginPath();
      ctx.moveTo(x + 5, y);
      ctx.lineTo(x + 12, y - 7);
      ctx.lineTo(x + 34, y - 7);
      ctx.stroke();

      ctx.fillStyle = `rgba(196, 255, 218, ${contact.strength * 0.65})`;
      ctx.font = '7px "Courier New", monospace';
      ctx.fillText(`${contact.id} / ${contact.type}`, x + 38, y - 5);
    }
  }
}

function drawWaypoints() {
  for (const waypoint of waypoints) {
    waypoint.life *= 0.996;
    const x = centerX + waypoint.x * radius;
    const y = centerY + waypoint.y * radius;
    const pulse = 8 + Math.sin(time * 0.08) * 3;

    ctx.strokeStyle = `rgba(255, 221, 92, ${waypoint.life * 0.7})`;
    ctx.strokeRect(x - 4, y - 4, 8, 8);
    ctx.beginPath();
    ctx.arc(x, y, pulse, 0, Math.PI * 2);
    ctx.stroke();
  }

  while (waypoints.length > 4) waypoints.shift();
}

function updateCoordinates(x, y) {
  const dx = x - centerX;
  const dy = y - centerY;
  const normalizedDistance = Math.min(1, Math.hypot(dx, dy) / radius);
  const bearing = normalizeAngle(Math.atan2(dx, -dy));
  bearingLabel.textContent = `BRG ${String(Math.round((bearing * 180) / Math.PI)).padStart(3, "0")}°`;
  distanceLabel.textContent = `DST ${String(Math.round(normalizedDistance * 480)).padStart(3, "0")} KM`;
  pointer.inside = normalizedDistance <= 1;
}

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  updateCoordinates(pointer.x, pointer.y);
});

window.addEventListener("pointerdown", () => {
  if (!pointer.inside) return;
  waypoints.push({
    x: (pointer.x - centerX) / radius,
    y: (pointer.y - centerY) / radius,
    life: 1,
  });
});

window.addEventListener("resize", resize);

function animate() {
  drawBackground();
  drawRadarFace();
  drawSweep();
  updateContacts();
  drawEchoes();
  drawContacts();
  drawWaypoints();

  sweepAngle = normalizeAngle(sweepAngle + 0.012);
  time += 1;
  requestAnimationFrame(animate);
}

resize();
animate();
