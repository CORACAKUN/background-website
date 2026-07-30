const canvas = document.querySelector("#highway");
const ctx = canvas.getContext("2d");
const speedLabel = document.querySelector("#speed");

const pointer = {
  x: 0.5,
  targetX: 0.5,
  down: false,
};

const buildings = [];
const stars = [];

let width = 0;
let height = 0;
let dpr = 1;
let horizon = 0;
let roadPhase = 0;
let speed = 0.011;
let cameraOffset = 0;
let time = 0;

function seededValue(index, salt = 1) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function buildSkyline() {
  buildings.length = 0;
  const count = Math.ceil(width / 34);

  for (let index = 0; index < count; index += 1) {
    const buildingWidth = 22 + seededValue(index, 2) * 44;
    const buildingHeight = 20 + seededValue(index, 3) * height * 0.17;
    buildings.push({
      x: (index / count) * width,
      width: buildingWidth,
      height: buildingHeight,
      antenna: seededValue(index, 5) > 0.72,
      hue: seededValue(index, 6) > 0.5 ? 315 : 188,
    });
  }

  stars.length = 0;
  for (let index = 0; index < 110; index += 1) {
    stars.push({
      x: seededValue(index, 8) * width,
      y: seededValue(index, 9) * horizon * 0.9,
      size: 0.4 + seededValue(index, 10) * 1.1,
      phase: seededValue(index, 11) * Math.PI * 2,
    });
  }
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  horizon = height * (width < 680 ? 0.36 : 0.43);
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  buildSkyline();
}

function drawSky() {
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, "#03020b");
  sky.addColorStop(0.62, "#10072a");
  sky.addColorStop(1, "#4a0c54");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, horizon + 2);

  for (const star of stars) {
    const alpha = 0.2 + Math.sin(time * 0.018 + star.phase) * 0.15;
    ctx.fillStyle = `rgba(195, 185, 255, ${alpha})`;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }

  const sunX = width * 0.73 + cameraOffset * 0.08;
  const sunY = horizon - height * 0.095;
  const sunRadius = Math.min(width, height) * 0.09;
  const sunGlow = ctx.createRadialGradient(
    sunX,
    sunY,
    0,
    sunX,
    sunY,
    sunRadius * 1.8,
  );
  sunGlow.addColorStop(0, "rgba(255, 85, 201, 0.42)");
  sunGlow.addColorStop(0.52, "rgba(255, 51, 194, 0.13)");
  sunGlow.addColorStop(1, "rgba(255, 51, 194, 0)");
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius * 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.clip();
  const sun = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
  sun.addColorStop(0, "#ffd36e");
  sun.addColorStop(0.5, "#ff568f");
  sun.addColorStop(1, "#df1ab3");
  ctx.fillStyle = sun;
  ctx.fillRect(sunX - sunRadius, sunY - sunRadius, sunRadius * 2, sunRadius * 2);
  ctx.fillStyle = "rgba(25, 4, 38, 0.42)";
  for (let offset = -sunRadius; offset < sunRadius; offset += 10) {
    const stripeHeight = 2 + ((offset + sunRadius) / (sunRadius * 2)) * 5;
    ctx.fillRect(sunX - sunRadius, sunY + offset, sunRadius * 2, stripeHeight);
  }
  ctx.restore();
}

function drawCity() {
  for (let index = 0; index < buildings.length; index += 1) {
    const building = buildings[index];
    const x = building.x + cameraOffset * 0.04;
    const y = horizon - building.height;

    ctx.fillStyle = index % 3 === 0 ? "#090817" : "#070712";
    ctx.fillRect(x, y, building.width, building.height);

    ctx.fillStyle = `hsla(${building.hue}, 95%, 64%, 0.42)`;
    for (let row = y + 8; row < horizon - 4; row += 10) {
      for (let column = x + 6; column < x + building.width - 4; column += 10) {
        if (seededValue(index + row + column, 12) > 0.5) {
          ctx.fillRect(column, row, 2, 3);
        }
      }
    }

    if (building.antenna) {
      ctx.strokeStyle = "rgba(255, 74, 215, 0.55)";
      ctx.beginPath();
      ctx.moveTo(x + building.width / 2, y);
      ctx.lineTo(x + building.width / 2, y - 18);
      ctx.stroke();
    }
  }
}

function perspectiveY(depth) {
  return horizon + depth * depth * (height - horizon);
}

function roadHalfWidth(depth) {
  return 10 + depth * depth * width * 0.46;
}

function centerAt(depth) {
  const curve = Math.sin(time * 0.0035 + depth * 2.2) * depth * depth * width * 0.035;
  return width * 0.72 + cameraOffset * depth * 0.42 + curve;
}

function drawGround() {
  const ground = ctx.createLinearGradient(0, horizon, 0, height);
  ground.addColorStop(0, "#08051a");
  ground.addColorStop(1, "#02020a");
  ctx.fillStyle = ground;
  ctx.fillRect(0, horizon, width, height - horizon);

  const vanishX = centerAt(0);
  ctx.strokeStyle = "rgba(52, 117, 255, 0.16)";
  ctx.lineWidth = 0.7;

  for (let bottomX = -width; bottomX <= width * 2; bottomX += 80) {
    ctx.beginPath();
    ctx.moveTo(vanishX, horizon);
    ctx.lineTo(bottomX + cameraOffset, height);
    ctx.stroke();
  }

  for (let index = 0; index < 24; index += 1) {
    const depth = (index / 24 + roadPhase) % 1;
    const y = perspectiveY(depth);
    ctx.globalAlpha = 0.15 + depth * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawRoad() {
  const bottomCenter = centerAt(1);
  const horizonCenter = centerAt(0);
  const bottomWidth = roadHalfWidth(1);

  ctx.beginPath();
  ctx.moveTo(horizonCenter - 10, horizon);
  ctx.lineTo(horizonCenter + 10, horizon);
  ctx.lineTo(bottomCenter + bottomWidth, height);
  ctx.lineTo(bottomCenter - bottomWidth, height);
  ctx.closePath();
  const road = ctx.createLinearGradient(0, horizon, 0, height);
  road.addColorStop(0, "#11101c");
  road.addColorStop(1, "#07070d");
  ctx.fillStyle = road;
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ff3bcf";
  ctx.shadowColor = "#ff3bcf";
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(horizonCenter - 10, horizon);
  ctx.lineTo(bottomCenter - bottomWidth, height);
  ctx.moveTo(horizonCenter + 10, horizon);
  ctx.lineTo(bottomCenter + bottomWidth, height);
  ctx.stroke();
  ctx.shadowBlur = 0;

  const lanePositions = [-0.5, 0, 0.5];
  for (const lane of lanePositions) {
    for (let index = 0; index < 34; index += 2) {
      const depthStart = (index / 34 + roadPhase) % 1;
      const depthEnd = Math.min(1, depthStart + 0.028 + depthStart * 0.045);
      const startX = centerAt(depthStart) + lane * roadHalfWidth(depthStart);
      const endX = centerAt(depthEnd) + lane * roadHalfWidth(depthEnd);

      ctx.strokeStyle = `rgba(109, 218, 255, ${0.25 + depthStart * 0.68})`;
      ctx.lineWidth = 0.5 + depthStart * 2.5;
      ctx.beginPath();
      ctx.moveTo(startX, perspectiveY(depthStart));
      ctx.lineTo(endX, perspectiveY(depthEnd));
      ctx.stroke();
    }
  }

  // Roadside light posts amplify the feeling of forward speed.
  for (let index = 0; index < 22; index += 1) {
    const depth = (index / 22 + roadPhase * 1.4) % 1;
    const y = perspectiveY(depth);
    const center = centerAt(depth);
    const halfWidth = roadHalfWidth(depth);
    const postHeight = 4 + depth * 42;
    const alpha = 0.18 + depth * 0.75;

    for (const side of [-1, 1]) {
      const x = center + side * (halfWidth + 8 + depth * 18);
      ctx.strokeStyle = `rgba(105, 229, 255, ${alpha})`;
      ctx.lineWidth = 0.5 + depth * 1.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - postHeight);
      ctx.stroke();
      ctx.fillStyle = `rgba(255, 73, 214, ${alpha})`;
      ctx.fillRect(x - 2, y - postHeight - 2, 4, 3);
    }
  }
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
  pointer.x += (pointer.targetX - pointer.x) * 0.035;
  cameraOffset +=
    (((pointer.x - 0.5) * width * 0.22) - cameraOffset) * 0.035;

  const targetSpeed = pointer.down ? 0.029 : 0.011;
  speed += (targetSpeed - speed) * 0.045;
  roadPhase = (roadPhase + speed) % 1;

  drawSky();
  drawCity();
  drawGround();
  drawRoad();

  const displaySpeed = Math.round(165 + speed * 7600);
  speedLabel.textContent = `${displaySpeed} KM/H`;

  time += 1;
  requestAnimationFrame(animate);
}

resize();
animate();
