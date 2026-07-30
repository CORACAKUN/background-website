const canvas = document.querySelector("#globe");
const ctx = canvas.getContext("2d");
const latitudeLabel = document.querySelector("#latitude");
const longitudeLabel = document.querySelector("#longitude");
const latencyLabel = document.querySelector("#latency");

const pointer = {
  x: 0.5,
  y: 0.5,
  targetX: 0.5,
  targetY: 0.5,
  down: false,
};

const cities = [
  { name: "San Francisco", lat: 37.77, lon: -122.42 },
  { name: "New York", lat: 40.71, lon: -74.01 },
  { name: "São Paulo", lat: -23.55, lon: -46.63 },
  { name: "London", lat: 51.51, lon: -0.13 },
  { name: "Dubai", lat: 25.2, lon: 55.27 },
  { name: "Singapore", lat: 1.35, lon: 103.82 },
  { name: "Tokyo", lat: 35.68, lon: 139.69 },
  { name: "Sydney", lat: -33.87, lon: 151.21 },
  { name: "Manila", lat: 14.6, lon: 120.98 },
];

const routePairs = [
  [0, 1],
  [1, 3],
  [1, 2],
  [3, 4],
  [3, 6],
  [4, 5],
  [5, 6],
  [5, 8],
  [6, 7],
  [8, 7],
];

const continents = [
  [[-168, 70], [-140, 60], [-125, 48], [-123, 31], [-105, 20], [-82, 25], [-66, 45], [-54, 52], [-82, 72], [-120, 74], [-168, 70]],
  [[-81, 12], [-70, 4], [-52, -5], [-42, -23], [-54, -55], [-69, -46], [-76, -20], [-81, 12]],
  [[-12, 35], [0, 58], [35, 70], [80, 73], [130, 60], [165, 50], [150, 25], [112, 8], [83, 21], [57, 7], [37, 30], [15, 38], [-12, 35]],
  [[-17, 35], [12, 37], [38, 28], [51, 10], [39, -25], [20, -35], [2, -30], [-13, 4], [-17, 35]],
  [[112, -11], [132, -10], [154, -23], [147, -41], [117, -35], [112, -11]],
  [[-53, 60], [-42, 78], [-20, 72], [-28, 60], [-53, 60]],
];

const orbiters = Array.from({ length: 32 }, (_, index) => ({
  angle: (index / 32) * Math.PI * 2,
  tilt: -0.75 + (index % 4) * 0.5,
  speed: 0.0015 + (index % 5) * 0.00025,
  size: 0.6 + (index % 3) * 0.4,
}));

let width = 0;
let height = 0;
let dpr = 1;
let centerX = 0;
let centerY = 0;
let radius = 0;
let rotation = -0.5;
let tilt = -0.18;
let time = 0;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function spherePoint(lat, lon, altitude = 1) {
  const latitude = toRadians(lat);
  const longitude = toRadians(lon) + rotation;
  const cosLat = Math.cos(latitude);

  let x = cosLat * Math.sin(longitude) * altitude;
  let y = Math.sin(latitude) * altitude;
  let z = cosLat * Math.cos(longitude) * altitude;

  const tiltedY = y * Math.cos(tilt) - z * Math.sin(tilt);
  const tiltedZ = y * Math.sin(tilt) + z * Math.cos(tilt);
  y = tiltedY;
  z = tiltedZ;

  return {
    x: centerX + x * radius,
    y: centerY - y * radius,
    z,
    scale: altitude,
  };
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  centerX = width < 700 ? width * 0.64 : width * 0.73;
  centerY = width < 700 ? height * 0.34 : height * 0.49;
  radius = Math.min(width * (width < 700 ? 0.42 : 0.27), height * 0.38);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawBackground() {
  ctx.fillStyle = "#02080d";
  ctx.fillRect(0, 0, width, height);

  for (let index = 0; index < 90; index += 1) {
    const x = (Math.sin(index * 91.7) * 0.5 + 0.5) * width;
    const y = (Math.sin(index * 47.3 + 2) * 0.5 + 0.5) * height;
    const alpha = 0.05 + (index % 5) * 0.018;
    ctx.fillStyle = `rgba(131, 218, 242, ${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

function drawGlobeBase() {
  const glow = ctx.createRadialGradient(
    centerX - radius * 0.25,
    centerY - radius * 0.3,
    radius * 0.05,
    centerX,
    centerY,
    radius * 1.2,
  );
  glow.addColorStop(0, "rgba(41, 160, 194, 0.12)");
  glow.addColorStop(0.72, "rgba(6, 34, 46, 0.22)");
  glow.addColorStop(1, "rgba(30, 181, 219, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(3, 20, 27, 0.7)";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(98, 227, 255, 0.42)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSphereLine(points, color, lineWidth = 0.6) {
  let drawing = false;
  ctx.beginPath();

  for (const point of points) {
    if (point.z > 0) {
      if (!drawing) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
      drawing = true;
    } else {
      drawing = false;
    }
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function drawGrid() {
  for (let latitude = -75; latitude <= 75; latitude += 15) {
    const points = [];
    for (let longitude = -180; longitude <= 180; longitude += 4) {
      points.push(spherePoint(latitude, longitude));
    }
    drawSphereLine(points, "rgba(77, 193, 222, 0.13)");
  }

  for (let longitude = -180; longitude < 180; longitude += 15) {
    const points = [];
    for (let latitude = -90; latitude <= 90; latitude += 3) {
      points.push(spherePoint(latitude, longitude));
    }
    drawSphereLine(points, "rgba(77, 193, 222, 0.13)");
  }
}

function drawContinents() {
  for (const continent of continents) {
    const interpolated = [];

    for (let index = 1; index < continent.length; index += 1) {
      const [startLon, startLat] = continent[index - 1];
      const [endLon, endLat] = continent[index];
      for (let step = 0; step < 8; step += 1) {
        const ratio = step / 8;
        interpolated.push(
          spherePoint(
            startLat + (endLat - startLat) * ratio,
            startLon + (endLon - startLon) * ratio,
            1.004,
          ),
        );
      }
    }

    drawSphereLine(interpolated, "rgba(113, 232, 255, 0.52)", 1.1);
  }
}

function interpolateRoute(from, to, progress) {
  let longitudeDelta = to.lon - from.lon;
  if (longitudeDelta > 180) longitudeDelta -= 360;
  if (longitudeDelta < -180) longitudeDelta += 360;

  const latitude = from.lat + (to.lat - from.lat) * progress;
  const longitude = from.lon + longitudeDelta * progress;
  const altitude = 1 + Math.sin(progress * Math.PI) * 0.16;
  return spherePoint(latitude, longitude, altitude);
}

function drawRoutes() {
  for (let routeIndex = 0; routeIndex < routePairs.length; routeIndex += 1) {
    const [fromIndex, toIndex] = routePairs[routeIndex];
    const from = cities[fromIndex];
    const to = cities[toIndex];
    const points = [];

    for (let step = 0; step <= 45; step += 1) {
      points.push(interpolateRoute(from, to, step / 45));
    }

    drawSphereLine(points, "rgba(79, 221, 255, 0.28)", 0.8);

    const progress = (time * 0.003 + routeIndex / routePairs.length) % 1;
    const packet = interpolateRoute(from, to, progress);
    if (packet.z > -0.03) {
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(98, 227, 255, 0.2)";
      ctx.beginPath();
      ctx.arc(packet.x, packet.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#bff6ff";
      ctx.beginPath();
      ctx.arc(packet.x, packet.y, 1.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
  }
}

function drawCities() {
  ctx.textAlign = "left";
  for (const city of cities) {
    const point = spherePoint(city.lat, city.lon, 1.008);
    if (point.z <= 0) continue;

    const pulse = 2.5 + Math.sin(time * 0.035 + city.lon) * 0.8;
    ctx.strokeStyle = "rgba(98, 227, 255, 0.42)";
    ctx.beginPath();
    ctx.arc(point.x, point.y, pulse + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#bdf5ff";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 1.8, 0, Math.PI * 2);
    ctx.fill();

    if (radius > 220) {
      ctx.fillStyle = "rgba(199, 244, 255, 0.48)";
      ctx.font = '7px "Courier New", monospace';
      ctx.fillText(city.name.toUpperCase(), point.x + 9, point.y - 6);
    }
  }
}

function drawOrbiters() {
  ctx.globalCompositeOperation = "lighter";
  for (const orbiter of orbiters) {
    orbiter.angle += orbiter.speed;
    const x = Math.cos(orbiter.angle) * Math.cos(orbiter.tilt);
    const y = Math.sin(orbiter.tilt);
    const z = Math.sin(orbiter.angle) * Math.cos(orbiter.tilt);
    const rotatedX = x * Math.cos(rotation) + z * Math.sin(rotation);
    const rotatedZ = -x * Math.sin(rotation) + z * Math.cos(rotation);

    if (rotatedZ < -0.2) continue;
    ctx.fillStyle = `rgba(98, 227, 255, ${0.12 + rotatedZ * 0.22})`;
    ctx.beginPath();
    ctx.arc(
      centerX + rotatedX * radius * 1.16,
      centerY - y * radius * 1.16,
      orbiter.size,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}

window.addEventListener("pointermove", (event) => {
  pointer.targetX = event.clientX / width;
  pointer.targetY = event.clientY / height;
  const latitude = (0.5 - pointer.targetY) * 180;
  const longitude = (pointer.targetX - 0.5) * 360;
  latitudeLabel.textContent = `LAT ${latitude.toFixed(2)}`;
  longitudeLabel.textContent = `LON ${longitude.toFixed(2)}`;
});

window.addEventListener("pointerdown", () => {
  pointer.down = true;
});

window.addEventListener("pointerup", () => {
  pointer.down = false;
});

window.addEventListener("resize", resize);

function animate() {
  pointer.x += (pointer.targetX - pointer.x) * 0.035;
  pointer.y += (pointer.targetY - pointer.y) * 0.035;
  const targetTilt = -0.18 + (pointer.y - 0.5) * 0.45;
  tilt += (targetTilt - tilt) * 0.025;
  rotation += 0.0017 + (pointer.x - 0.5) * 0.0009;

  drawBackground();
  drawGlobeBase();
  drawGrid();
  drawContinents();
  drawRoutes();
  drawCities();
  drawOrbiters();

  latencyLabel.textContent = `${Math.round(24 + Math.sin(time * 0.025) * 7)} MS`;
  time += 1;
  requestAnimationFrame(animate);
}

resize();
animate();
