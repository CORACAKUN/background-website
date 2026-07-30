const canvas = document.querySelector("#dashboard");
const ctx = canvas.getContext("2d");
const transmissionLabel = document.querySelector("#transmission");

const pointer = {
  x: 0.5,
  targetX: 0.5,
  down: false,
};

const shiftThresholds = [0, 42, 88, 138, 196, 258, 321];
const streaks = Array.from({ length: 120 }, () => ({
  x: Math.random(),
  y: Math.random(),
  length: 0.05 + Math.random() * 0.2,
  depth: 0.25 + Math.random() * 0.75,
}));

let width = 0;
let height = 0;
let dpr = 1;
let centerX = 0;
let centerY = 0;
let radius = 0;
let speed = 76;
let targetSpeed = 76;
let rpm = 2400;
let gear = 2;
let previousGear = 2;
let shiftFlash = 0;
let shiftKick = 0;
let time = 0;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  centerX = width < 700 ? width * 0.61 : width * 0.73;
  centerY = width < 700 ? height * 0.31 : height * 0.49;
  radius = Math.min(width * (width < 700 ? 0.42 : 0.285), height * 0.39);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawBackground() {
  ctx.fillStyle = `rgb(${5 + shiftFlash * 15}, ${6 + shiftFlash * 4}, ${8 + shiftFlash * 4})`;
  ctx.fillRect(0, 0, width, height);

  const intensity = Math.min(1, speed / 330);
  ctx.strokeStyle = `rgba(220, 230, 238, ${0.025 + intensity * 0.12})`;
  for (const streak of streaks) {
    const startX = streak.x * width;
    const y = streak.y * height;
    const length = streak.length * width * intensity * streak.depth;
    ctx.lineWidth = 0.3 + streak.depth;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(startX - length, y);
    ctx.stroke();

    streak.x += (0.0015 + intensity * 0.016) * streak.depth;
    if (streak.x > 1.15) {
      streak.x = -0.15;
      streak.y = Math.random();
    }
  }

  const roadGlow = ctx.createRadialGradient(
    centerX,
    height,
    0,
    centerX,
    height,
    width * 0.42,
  );
  roadGlow.addColorStop(0, `rgba(224, 48, 55, ${0.08 + intensity * 0.1})`);
  roadGlow.addColorStop(1, "rgba(224, 48, 55, 0)");
  ctx.fillStyle = roadGlow;
  ctx.fillRect(0, 0, width, height);
}

function drawArc(start, end, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, start, end);
  ctx.stroke();
}

function drawSpeedometer() {
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const speedRatio = Math.max(0, Math.min(1, speed / 340));
  const needleAngle = startAngle + (endAngle - startAngle) * speedRatio;

  const outerGlow = ctx.createRadialGradient(
    centerX,
    centerY,
    radius * 0.35,
    centerX,
    centerY,
    radius * 1.22,
  );
  outerGlow.addColorStop(0, "rgba(24, 27, 31, 0.18)");
  outerGlow.addColorStop(0.72, "rgba(12, 14, 17, 0.65)");
  outerGlow.addColorStop(1, "rgba(239, 66, 72, 0)");
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 1.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(7, 9, 11, 0.88)";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(234, 239, 244, 0.15)";
  ctx.lineWidth = 1;
  ctx.stroke();

  drawArc(
    startAngle,
    endAngle,
    "rgba(224, 230, 236, 0.11)",
    Math.max(3, radius * 0.018),
  );
  drawArc(
    startAngle,
    needleAngle,
    speedRatio > 0.78 ? "#ef4248" : "#f1f4f7",
    Math.max(3, radius * 0.018),
  );

  for (let tick = 0; tick <= 34; tick += 1) {
    const ratio = tick / 34;
    const angle = startAngle + (endAngle - startAngle) * ratio;
    const major = tick % 2 === 0;
    const inner = radius - (major ? radius * 0.12 : radius * 0.075);
    const outer = radius - radius * 0.035;
    const dangerous = ratio > 0.78;

    ctx.strokeStyle = dangerous
      ? "rgba(239, 66, 72, 0.72)"
      : "rgba(231, 237, 242, 0.48)";
    ctx.lineWidth = major ? 1.4 : 0.7;
    ctx.beginPath();
    ctx.moveTo(
      centerX + Math.cos(angle) * inner,
      centerY + Math.sin(angle) * inner,
    );
    ctx.lineTo(
      centerX + Math.cos(angle) * outer,
      centerY + Math.sin(angle) * outer,
    );
    ctx.stroke();

    if (major) {
      ctx.fillStyle = dangerous
        ? "rgba(239, 94, 99, 0.62)"
        : "rgba(225, 232, 238, 0.45)";
      ctx.font = `${Math.max(7, radius * 0.04)}px "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(
        String(tick * 10),
        centerX + Math.cos(angle) * (radius * 0.77),
        centerY + Math.sin(angle) * (radius * 0.77) + 3,
      );
    }
  }

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(needleAngle);
  ctx.strokeStyle = "#ef4248";
  ctx.lineWidth = Math.max(1.5, radius * 0.009);
  ctx.shadowColor = "#ef4248";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.12, 0);
  ctx.lineTo(radius * 0.69, 0);
  ctx.stroke();
  ctx.restore();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#e7ebef";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.033, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#f3f5f7";
  ctx.font = `500 ${Math.max(26, radius * 0.18)}px Inter, system-ui`;
  ctx.fillText(String(Math.round(speed)).padStart(3, "0"), centerX, centerY + radius * 0.27);
  ctx.fillStyle = "rgba(230, 235, 240, 0.38)";
  ctx.font = `700 ${Math.max(7, radius * 0.04)}px "Courier New", monospace`;
  ctx.fillText("KM/H", centerX, centerY + radius * 0.36);
}

function drawGearAndRpm() {
  const gearY = centerY - radius * 0.27;
  ctx.textAlign = "center";
  ctx.fillStyle = shiftFlash > 0.15 ? "#ef4248" : "#f5f7f9";
  ctx.font = `500 ${Math.max(34, radius * 0.25)}px Inter, system-ui`;
  ctx.fillText(String(gear), centerX, gearY);
  ctx.fillStyle = "rgba(231, 236, 241, 0.33)";
  ctx.font = `700 ${Math.max(7, radius * 0.038)}px "Courier New", monospace`;
  ctx.fillText("GEAR", centerX, gearY + radius * 0.1);

  const barWidth = radius * 0.78;
  const barX = centerX - barWidth / 2;
  const barY = centerY + radius * 0.48;
  const rpmRatio = Math.max(0, Math.min(1, rpm / 8000));
  ctx.fillStyle = "rgba(231, 236, 241, 0.09)";
  ctx.fillRect(barX, barY, barWidth, 3);
  ctx.fillStyle = rpmRatio > 0.78 ? "#ef4248" : "#e8edf1";
  ctx.fillRect(barX, barY, barWidth * rpmRatio, 3);
  ctx.fillStyle = "rgba(231, 236, 241, 0.38)";
  ctx.font = `700 ${Math.max(7, radius * 0.035)}px "Courier New", monospace`;
  ctx.fillText(`${Math.round(rpm)} RPM`, centerX, barY + 17);
}

function updateDrivetrain() {
  const cruiseWave = (Math.sin(time * 0.0035) * 0.5 + 0.5) * 205;
  targetSpeed = pointer.down
    ? 332
    : 62 + cruiseWave * 0.62 + pointer.x * 72;
  speed += (targetSpeed - speed) * (pointer.down ? 0.012 : 0.006);

  previousGear = gear;
  gear = 1;
  for (let index = 1; index < shiftThresholds.length; index += 1) {
    if (speed >= shiftThresholds[index]) gear = Math.min(6, index + 1);
  }

  if (gear !== previousGear) {
    shiftFlash = 1;
    shiftKick = 1;
    transmissionLabel.textContent = gear > previousGear ? "Upshift" : "Downshift";
  }

  const lowerThreshold = shiftThresholds[gear - 1] || 0;
  const upperThreshold = shiftThresholds[gear] || 340;
  const gearProgress =
    (speed - lowerThreshold) / Math.max(1, upperThreshold - lowerThreshold);
  const targetRpm = 2100 + gearProgress * 5300 - shiftKick * 1700;
  rpm += (targetRpm - rpm) * 0.08;

  shiftFlash *= 0.91;
  shiftKick *= 0.88;
  if (shiftFlash < 0.03) transmissionLabel.textContent = `Gear ${gear} / Auto`;
}

window.addEventListener("pointermove", (event) => {
  pointer.targetX = event.clientX / width;
});

window.addEventListener("pointerdown", () => {
  pointer.down = true;
});

window.addEventListener("pointerup", () => {
  pointer.down = false;
});

window.addEventListener("blur", () => {
  pointer.down = false;
});

window.addEventListener("resize", resize);

function animate() {
  pointer.x += (pointer.targetX - pointer.x) * 0.04;
  updateDrivetrain();
  drawBackground();
  drawSpeedometer();
  drawGearAndRpm();

  time += 1;
  requestAnimationFrame(animate);
}

resize();
animate();
