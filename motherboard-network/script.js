const canvas = document.querySelector("#board");
const ctx = canvas.getContext("2d");
const boardLayer = document.createElement("canvas");
const boardContext = boardLayer.getContext("2d");
const activityLabel = document.querySelector("#activity");
const metricElements = [...document.querySelectorAll(".metric")];

const pointer = { x: -1000, y: -1000 };
const components = [];
const routes = [];
const packets = [];

let width = 0;
let height = 0;
let dpr = 1;
let time = 0;
let hoveredComponent = null;

const componentSpecs = [
  { id: "cpu", label: "CPU", detail: "16 CORE / 5.4 GHZ", type: "core" },
  { id: "gpu", label: "GPU", detail: "PCIe x16 / ACTIVE", type: "large" },
  { id: "ram", label: "RAM", detail: "DDR5 / 6400 MT/s", type: "memory" },
  { id: "nvme", label: "NVMe", detail: "PCIe 5.0 / 7.2 GB/s", type: "drive" },
  { id: "power", label: "POWER", detail: "12V / STABLE", type: "power" },
  { id: "chipset", label: "CHIPSET", detail: "SYSTEM I/O", type: "small" },
  { id: "io", label: "I/O", detail: "USB4 / LAN / AUDIO", type: "small" },
  { id: "network", label: "NETWORK", detail: "2.5 GbE / WI-FI 7", type: "network" },
];

function componentSize(type) {
  const scale = width < 720 ? 0.62 : 1;
  const sizes = {
    core: [142, 142],
    large: [225, 92],
    memory: [54, 212],
    drive: [164, 46],
    power: [112, 76],
    small: [86, 64],
    network: [116, 54],
  };
  return sizes[type].map((value) => value * scale);
}

function layoutComponents() {
  components.length = 0;

  const boardCenterX = width < 720 ? width * 0.5 : width * 0.69;
  const boardCenterY = width < 720 ? height * 0.34 : height * 0.5;
  const horizontal =
    width < 720 ? Math.min(width * 0.46, 220) : Math.min(width * 0.31, 480);
  const vertical =
    width < 720 ? Math.min(height * 0.31, 235) : Math.min(height * 0.42, 365);

  const positions = {
    cpu: [boardCenterX, boardCenterY],
    gpu: [boardCenterX - horizontal * 0.1, boardCenterY + vertical * 0.9],
    ram: [boardCenterX + horizontal * 0.8, boardCenterY - vertical * 0.2],
    nvme: [boardCenterX - horizontal * 0.72, boardCenterY + vertical * 0.5],
    power: [boardCenterX + horizontal * 0.85, boardCenterY + vertical * 0.76],
    chipset: [boardCenterX + horizontal * 0.58, boardCenterY + vertical * 0.48],
    io: [boardCenterX - horizontal * 0.92, boardCenterY - vertical * 0.6],
    network: [boardCenterX - horizontal * 0.14, boardCenterY - vertical * 0.95],
  };

  for (const spec of componentSpecs) {
    const [componentWidth, componentHeight] = componentSize(spec.type);
    const [x, y] = positions[spec.id];

    components.push({
      ...spec,
      x,
      y,
      width: componentWidth,
      height: componentHeight,
      pulse: 0,
      load: 0.3 + Math.random() * 0.45,
    });
  }

  buildRoutes();
}

function getComponent(id) {
  return components.find((component) => component.id === id);
}

function buildRoutes() {
  routes.length = 0;
  const cpu = getComponent("cpu");
  const portScale = width < 720 ? 0.58 : 1;
  const topology = {
    io: {
      sourceSide: "left",
      sourceBase: -37,
      targetSide: "right",
      mode: "horizontal",
      corridor: 0.48,
      lanes: 6,
    },
    nvme: {
      sourceSide: "left",
      sourceBase: 38,
      targetSide: "right",
      mode: "horizontal",
      corridor: 0.42,
      lanes: 5,
    },
    network: {
      sourceSide: "top",
      sourceBase: -38,
      targetSide: "bottom",
      mode: "vertical",
      corridor: 0.52,
      lanes: 5,
    },
    ram: {
      sourceSide: "right",
      sourceBase: -38,
      targetSide: "left",
      mode: "horizontal",
      corridor: 0.52,
      lanes: 6,
    },
    chipset: {
      sourceSide: "right",
      sourceBase: 38,
      targetSide: "left",
      mode: "horizontal",
      corridor: 0.45,
      lanes: 4,
    },
    gpu: {
      sourceSide: "bottom",
      sourceBase: -40,
      targetSide: "top",
      mode: "vertical",
      corridor: 0.5,
      lanes: 7,
    },
    power: {
      sourceSide: "bottom",
      sourceBase: 41,
      targetSide: "top",
      mode: "vertical",
      corridor: 0.24,
      lanes: 4,
    },
  };

  for (const component of components) {
    if (component.id === "cpu") continue;

    const config = topology[component.id];
    for (let lane = 0; lane < config.lanes; lane += 1) {
      const laneOffset =
        (lane - (config.lanes - 1) / 2) * 5.5 * portScale;
      const start = portOnSide(
        cpu,
        config.sourceSide,
        config.sourceBase * portScale + laneOffset,
      );
      const end = portOnSide(component, config.targetSide, laneOffset);
      let points;

      if (config.mode === "horizontal") {
        const corridorX = start.x + (end.x - start.x) * config.corridor;
        points = [
          start,
          { x: corridorX, y: start.y },
          { x: corridorX, y: end.y },
          end,
        ];
      } else {
        const corridorY = start.y + (end.y - start.y) * config.corridor;
        points = [
          start,
          { x: start.x, y: corridorY },
          { x: end.x, y: corridorY },
          end,
        ];
      }

      const route = {
        component,
        points,
        lane,
        glow: 0,
        speed: 0.0018 + Math.random() * 0.002,
      };
      cacheRouteGeometry(route);
      routes.push(route);
    }
  }

  packets.length = 0;
  for (const route of routes) {
    // Every bus lane carries an outgoing and an incoming packet.
    for (let index = 0; index < 2; index += 1) {
      packets.push({
        route,
        progress: Math.random(),
        direction: index % 2 ? 1 : -1,
      });
    }
  }
}

function portOnSide(component, side, offset = 0) {
  const halfWidth = component.width / 2;
  const halfHeight = component.height / 2;

  if (side === "left" || side === "right") {
    return {
      x: component.x + (side === "left" ? -halfWidth : halfWidth),
      y:
        component.y +
        Math.max(-halfHeight + 7, Math.min(halfHeight - 7, offset)),
    };
  }

  return {
    x:
      component.x +
      Math.max(-halfWidth + 7, Math.min(halfWidth - 7, offset)),
    y: component.y + (side === "top" ? -halfHeight : halfHeight),
  };
}

function cacheRouteGeometry(route) {
  route.segments = [];
  route.totalLength = 0;

  for (let index = 1; index < route.points.length; index += 1) {
    const start = route.points[index - 1];
    const end = route.points[index];
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    route.segments.push({ start, end, length });
    route.totalLength += length;
  }
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

  layoutComponents();
  boardLayer.width = Math.round(width * dpr);
  boardLayer.height = Math.round(height * dpr);
  boardContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  renderBoardBackground();
}

function roundedRect(x, y, widthValue, heightValue, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, widthValue, heightValue, radius);
}

function renderBoardBackground() {
  const target = boardContext;
  target.fillStyle = "#03100d";
  target.fillRect(0, 0, width, height);

  target.strokeStyle = "rgba(68, 174, 124, 0.045)";
  target.lineWidth = 0.5;
  const grid = 24;

  for (let x = 0; x < width; x += grid) {
    target.beginPath();
    target.moveTo(x, 0);
    target.lineTo(x, height);
    target.stroke();
  }

  for (let y = 0; y < height; y += grid) {
    target.beginPath();
    target.moveTo(0, y);
    target.lineTo(width, y);
    target.stroke();
  }

  // Decorative solder points make the empty board feel connected.
  for (let y = 12; y < height; y += 48) {
    for (let x = 12; x < width; x += 48) {
      const distance = Math.hypot(x - width * 0.72, y - height * 0.48);
      const alpha = Math.max(0.025, 0.1 - distance / 9000);
      target.fillStyle = `rgba(95, 223, 159, ${alpha})`;
      target.fillRect(x, y, 1.5, 1.5);
    }
  }
}

function drawRoute(route) {
  const active =
    hoveredComponent === route.component || hoveredComponent?.id === "cpu";
  route.glow += ((active || route.component.pulse > 0 ? 1 : 0) - route.glow) * 0.08;

  ctx.beginPath();
  route.points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });

  ctx.strokeStyle = `rgba(68, 226, 148, ${0.14 + route.glow * 0.5})`;
  ctx.lineWidth = 1 + route.glow * 1.4;
  ctx.stroke();

  if (route.glow > 0.08) {
    ctx.setLineDash([2, 9]);
    ctx.lineDashOffset = -time * 0.12;
    ctx.strokeStyle = `rgba(143, 255, 202, ${route.glow * 0.4})`;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  for (let index = 1; index < route.points.length - 1; index += 1) {
    const point = route.points[index];
    ctx.fillStyle = "rgba(99, 230, 164, 0.45)";
    ctx.fillRect(point.x - 1.5, point.y - 1.5, 3, 3);
  }

  const start = route.points[0];
  const end = route.points.at(-1);
  ctx.fillStyle = "rgba(111, 242, 176, 0.65)";
  ctx.fillRect(start.x - 1, start.y - 1, 2, 2);
  ctx.fillRect(end.x - 1, end.y - 1, 2, 2);
}

function pointOnRoute(route, progress) {
  let target = progress * route.totalLength;
  for (const segment of route.segments) {
    if (target <= segment.length) {
      const ratio = target / segment.length;
      return {
        x: segment.start.x + (segment.end.x - segment.start.x) * ratio,
        y: segment.start.y + (segment.end.y - segment.start.y) * ratio,
      };
    }
    target -= segment.length;
  }

  return route.points.at(-1);
}

function drawPackets() {
  ctx.globalCompositeOperation = "lighter";

  // Soft halo pass avoids an expensive shadow-blur operation per packet.
  for (const packet of packets) {
    const point = pointOnRoute(packet.route, packet.progress);
    ctx.fillStyle = "rgba(69, 255, 168, 0.16)";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const packet of packets) {
    const boost = 1 + packet.route.component.pulse * 2.8;
    packet.progress += packet.route.speed * packet.direction * boost;

    if (packet.progress > 1) packet.progress = 0;
    if (packet.progress < 0) packet.progress = 1;

    const point = pointOnRoute(packet.route, packet.progress);
    const active =
      hoveredComponent === packet.route.component || hoveredComponent?.id === "cpu";
    const radius = active ? 2.4 : 1.6;

    ctx.fillStyle = active ? "#eafff3" : "#68ffb8";
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = "source-over";
}

function drawPins(component) {
  const spacing = 12;
  ctx.fillStyle = "rgba(123, 239, 182, 0.38)";

  for (
    let offset = -component.width / 2 + spacing;
    offset < component.width / 2;
    offset += spacing
  ) {
    ctx.fillRect(component.x + offset - 1, component.y - component.height / 2 - 5, 2, 5);
    ctx.fillRect(component.x + offset - 1, component.y + component.height / 2, 2, 5);
  }

  for (
    let offset = -component.height / 2 + spacing;
    offset < component.height / 2;
    offset += spacing
  ) {
    ctx.fillRect(component.x - component.width / 2 - 5, component.y + offset - 1, 5, 2);
    ctx.fillRect(component.x + component.width / 2, component.y + offset - 1, 5, 2);
  }
}

function drawComponent(component) {
  const active = hoveredComponent === component;
  component.pulse *= 0.965;
  const intensity = Math.max(component.pulse, active ? 0.75 : 0);
  const x = component.x - component.width / 2;
  const y = component.y - component.height / 2;

  ctx.shadowColor = "#48f5a2";
  ctx.shadowBlur = intensity * 22;
  roundedRect(x, y, component.width, component.height, component.type === "core" ? 8 : 4);
  ctx.fillStyle = `rgba(7, 30, 23, ${0.88 + intensity * 0.1})`;
  ctx.fill();
  ctx.strokeStyle = `rgba(101, 239, 170, ${0.28 + intensity * 0.65})`;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (component.type === "core") {
    const inset = 12;
    roundedRect(
      x + inset,
      y + inset,
      component.width - inset * 2,
      component.height - inset * 2,
      4,
    );
    ctx.strokeStyle = "rgba(109, 243, 175, 0.2)";
    ctx.stroke();

    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 4; column += 1) {
        const cellX = x + 21 + column * 19;
        const cellY = y + 21 + row * 19;
        const pulse = 0.18 + Math.sin(time * 0.03 + row + column) * 0.1;
        ctx.fillStyle = `rgba(83, 244, 165, ${pulse + intensity * 0.25})`;
        ctx.fillRect(cellX, cellY, 10, 10);
      }
    }
  } else {
    ctx.strokeStyle = "rgba(105, 230, 167, 0.12)";
    for (let line = 12; line < component.width - 8; line += 16) {
      ctx.beginPath();
      ctx.moveTo(x + line, y + 8);
      ctx.lineTo(x + line, y + component.height - 8);
      ctx.stroke();
    }
  }

  drawPins(component);

  ctx.fillStyle = active ? "#e8fff3" : "rgba(217, 255, 237, 0.72)";
  ctx.font = `700 ${component.type === "core" ? 11 : 8}px "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.fillText(component.label, component.x, component.y - 2);

  ctx.fillStyle = active ? "rgba(183, 255, 216, 0.72)" : "rgba(183, 255, 216, 0.32)";
  ctx.font = '7px "Courier New", monospace';
  ctx.fillText(component.detail, component.x, component.y + 13);

  if (active && component.id !== "cpu") {
    ctx.fillStyle = "#5dffb0";
    ctx.beginPath();
    ctx.arc(component.x, y - 10, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateHover() {
  hoveredComponent = null;
  for (const component of components) {
    const inside =
      Math.abs(pointer.x - component.x) < component.width / 2 + 12 &&
      Math.abs(pointer.y - component.y) < component.height / 2 + 12;
    if (inside) hoveredComponent = component;
  }
  canvas.style.cursor = hoveredComponent ? "pointer" : "default";
}

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  updateHover();
});

window.addEventListener("pointerdown", () => {
  if (!hoveredComponent) return;
  if (hoveredComponent.id === "cpu") {
    components.forEach((component) => {
      component.pulse = 1;
    });
  } else {
    hoveredComponent.pulse = 1;
  }
});

window.addEventListener("resize", resize);

const metricConfig = {
  cpu: { base: 48, range: 24, phase: 0.4, component: "cpu" },
  gpu: { base: 63, range: 21, phase: 1.7, component: "gpu" },
  ram: { base: 55, range: 13, phase: 2.6, component: "ram" },
  ssd: { base: 34, range: 28, phase: 3.4, component: "nvme" },
  network: { base: 46, range: 36, phase: 4.8, component: "network" },
};

for (const metric of metricElements) {
  const sparkline = metric.querySelector(".sparkline");
  sparkline.innerHTML = Array.from({ length: 18 }, () => "<i></i>").join("");
}

function updateTelemetry() {
  for (const metric of metricElements) {
    const key = metric.dataset.metric;
    const config = metricConfig[key];
    const component = getComponent(config.component);
    const wave =
      Math.sin(time * 0.021 + config.phase) * 0.6 +
      Math.sin(time * 0.047 + config.phase * 2) * 0.4;
    const boost = (component?.pulse || 0) * 28;
    const usage = Math.round(
      Math.max(8, Math.min(99, config.base + wave * config.range + boost)),
    );

    metric.querySelector("strong").textContent = `${usage}%`;
    const bars = metric.querySelectorAll(".sparkline i");
    bars.forEach((bar, index) => {
      if (index < bars.length - 1) {
        bar.style.transform =
          bars[index + 1].style.transform || "scaleY(0.3)";
      } else {
        const value = Math.max(
          0.1,
          Math.min(1, (usage + (Math.random() - 0.5) * 14) / 100),
        );
        bar.style.transform = `scaleY(${value})`;
      }
    });
  }
}

function animate() {
  ctx.drawImage(
    boardLayer,
    0,
    0,
    boardLayer.width,
    boardLayer.height,
    0,
    0,
    width,
    height,
  );

  for (const route of routes) drawRoute(route);
  drawPackets();
  for (const component of components) drawComponent(component);

  const totalPulse = components.reduce((sum, component) => sum + component.pulse, 0);
  const activity = Math.round(58 + Math.sin(time * 0.025) * 7 + totalPulse * 6);
  activityLabel.textContent = `${Math.min(99, activity)}%`;

  if (time % 18 === 0) updateTelemetry();
  time += 1;
  requestAnimationFrame(animate);
}

resize();
animate();
