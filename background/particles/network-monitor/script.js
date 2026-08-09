const canvas = document.querySelector("#network");
const ctx = canvas.getContext("2d");
const mainLog = document.querySelector("#main-log");
const hashStream = document.querySelector("#hash-stream");
const bars = document.querySelector("#bars");
const packetRate = document.querySelector("#packet-rate");
const entropyValue = document.querySelector("#entropy-value");
const codeFeed = document.querySelector("#code-feed");
const binaryGrid = document.querySelector("#binary-grid");
const diffCount = document.querySelector("#diff-count");

const verbs = [
  "mounting encrypted volume",
  "rotating signal marker",
  "sampling entropy pool",
  "indexing packet headers",
  "forking sandbox process",
  "tracing network route",
  "validating checksum table",
  "compiling transient module",
  "mapping memory window",
  "synchronizing signal terminal",
];

const scopes = ["route", "kernel", "proxy", "socket", "signal", "cache", "daemon"];
const hex = "0123456789abcdef";
const nodes = [];
const packets = [];
let barNodes = [];
let binaryNodes = [];
let width = 0;
let height = 0;
let dpr = 1;
let time = 0;
let diff = 0;

function random(min, max) {
  return min + Math.random() * (max - min);
}

function randomHex(length) {
  let value = "";
  for (let index = 0; index < length; index += 1) {
    value += hex[Math.floor(Math.random() * hex.length)];
  }
  return value;
}

function randomBinary(length) {
  let value = "";
  for (let index = 0; index < length; index += 1) {
    value += Math.random() > 0.5 ? "1" : "0";
  }
  return value;
}

function makeNode() {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: random(-0.28, 0.28),
    vy: random(-0.22, 0.22),
    pulse: Math.random(),
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

  nodes.length = 0;
  const count = Math.round(Math.min(68, Math.max(30, (width * height) / 26000)));
  for (let index = 0; index < count; index += 1) nodes.push(makeNode());
}

function addPacket() {
  if (nodes.length < 2) return;
  const from = nodes[Math.floor(Math.random() * nodes.length)];
  let to = nodes[Math.floor(Math.random() * nodes.length)];
  if (to === from) to = nodes[(nodes.indexOf(from) + 1) % nodes.length];
  packets.push({
    from,
    to,
    progress: 0,
    speed: random(0.01, 0.032),
  });
  if (packets.length > 58) packets.shift();
}

function drawNetwork() {
  ctx.fillStyle = "rgba(1, 8, 6, 0.13)";
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";

  for (const node of nodes) {
    node.x += node.vx;
    node.y += node.vy;
    node.pulse += 0.02;
    if (node.x < 0 || node.x > width) node.vx *= -1;
    if (node.y < 0 || node.y > height) node.vy *= -1;
  }

  for (let a = 0; a < nodes.length; a += 1) {
    for (let b = a + 1; b < nodes.length; b += 1) {
      const first = nodes[a];
      const second = nodes[b];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      if (distance > 190) continue;
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      ctx.lineTo(second.x, second.y);
      ctx.strokeStyle = `rgba(99, 255, 159, ${(1 - distance / 190) * 0.13})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
  }

  for (let index = packets.length - 1; index >= 0; index -= 1) {
    const packet = packets[index];
    packet.progress += packet.speed;
    const x = packet.from.x + (packet.to.x - packet.from.x) * packet.progress;
    const y = packet.from.y + (packet.to.y - packet.from.y) * packet.progress;
    const tailProgress = Math.max(0, packet.progress - 0.08);
    const tx = packet.from.x + (packet.to.x - packet.from.x) * tailProgress;
    const ty = packet.from.y + (packet.to.y - packet.from.y) * tailProgress;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "rgba(99, 255, 159, 0.32)";
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(223, 255, 234, 0.86)";
    ctx.shadowColor = "#63ff9f";
    ctx.shadowBlur = 14;
    ctx.fill();
    if (packet.progress >= 1) packets.splice(index, 1);
  }

  for (const node of nodes) {
    const glow = 0.42 + Math.sin(node.pulse) * 0.22;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(99, 255, 159, ${glow})`;
    ctx.shadowColor = "#63ff9f";
    ctx.shadowBlur = 10;
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "source-over";
}

function addLogLine() {
  const now = new Date();
  const stamp = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const scope = scopes[Math.floor(Math.random() * scopes.length)];
  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  const line = document.createElement("div");
  line.className = "log-line";
  line.innerHTML = `<time>${stamp}</time><b>${scope}</b><span>${verb} :: ${randomHex(12)}:${randomHex(8)}</span>`;
  mainLog.append(line);

  while (mainLog.children.length > 24) {
    mainLog.firstElementChild.remove();
  }
}

function updateHashes() {
  entropyValue.textContent = `0x${randomHex(2).toUpperCase()}`;
  hashStream.innerHTML = Array.from({ length: 12 }, () => {
    const kind = Math.random() > 0.5 ? "checksum" : "marker";
    return `<span>${kind}:${randomHex(48)}</span>`;
  }).join("");
}

function updateBars() {
  packetRate.textContent = `${Math.floor(random(120, 940))} mb/s`;
  for (const bar of barNodes) {
    bar.style.setProperty("--h", `${Math.floor(random(14, 100))}%`);
  }
}

function updateCode() {
  const lines = [
    `const seed = "0x${randomHex(16)}";`,
    `signal.rotate("${randomHex(8)}:${randomHex(8)}");`,
    `buffer.write(${randomBinary(12)}, 0b${randomBinary(8)});`,
    `graph.link("${randomHex(6)}", "${randomHex(6)}");`,
    `signal.mix([${randomHex(4)}, ${randomHex(4)}, ${randomHex(4)}]);`,
    `await sandbox.run("trace-${randomHex(5)}");`,
    `stream.patch(${Math.floor(random(1000, 9999))}, "${randomHex(10)}");`,
    `emit("heartbeat", { entropy: 0x${randomHex(2)} });`,
  ];
  codeFeed.textContent = Array.from({ length: 18 }, () => {
    return lines[Math.floor(Math.random() * lines.length)];
  }).join("\n");
}

function updateBinary() {
  diff += Math.floor(random(7, 39));
  diffCount.textContent = String(diff % 10000).padStart(4, "0");
  for (const cell of binaryNodes) {
    const hot = Math.random() > 0.78;
    cell.className = hot ? "hot" : "";
    cell.textContent = Math.random() > 0.5 ? "1" : "0";
  }
}

function buildBars() {
  bars.innerHTML = Array.from({ length: 28 }, () => "<i></i>").join("");
  barNodes = [...bars.querySelectorAll("i")];
}

function buildBinary() {
  const count = innerWidth < 640 ? 96 : 108;
  binaryGrid.innerHTML = Array.from({ length: count }, () => "<span>0</span>").join("");
  binaryNodes = [...binaryGrid.querySelectorAll("span")];
}

function loop() {
  drawNetwork();
  if (Math.random() < 0.24) addPacket();
  time += 1;
  requestAnimationFrame(loop);
}

resize();
addEventListener("resize", () => {
  resize();
  buildBinary();
  updateBinary();
});

for (let index = 0; index < 18; index += 1) addLogLine();
buildBars();
buildBinary();
updateHashes();
updateBars();
updateCode();
updateBinary();

setInterval(addLogLine, 520);
setInterval(updateHashes, 1300);
setInterval(updateBars, 420);
setInterval(updateCode, 1750);
setInterval(updateBinary, 260);

loop();
