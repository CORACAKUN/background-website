const c=document.querySelector("#c"), g=c.getContext("2d"), o=document.createElement("canvas"), x=o.getContext("2d");
let w, h, d, t=0, m= {
  x:innerWidth*.72,
  y:innerHeight*.42
};
function fit() {
  w=innerWidth;
  h=innerHeight;
  d=Math.min(devicePixelRatio||1, 2);
  c.width=o.width=w*d;
  c.height=o.height=h*d;
  g.setTransform(d, 0, 0, d, 0, 0);
  x.setTransform(d, 0, 0, d, 0, 0)
}
addEventListener("resize", fit);
addEventListener("pointermove", e=> {
  m.x=e.clientX;
  m.y=e.clientY
});
function scene() {
  x.clearRect(0, 0, w, h);
  x.fillStyle="#e9edf3";
  x.fillRect(0, 0, w, h);
  for(let i=0;i<9;i++) {
    let X=w*(.15+(i%3)*.32)+Math.sin(t*.01+i)*22, Y=h*(.12+Math.floor(i/3)*.34)+Math.cos(t*.008+i)*18;
    x.fillStyle=`hsl(${i*42+200},75%,62%)`;
    x.beginPath();
    x.roundRect(X-90, Y-65, 180, 130, 35);
    x.fill()
  }
  x.strokeStyle="#18203322";
  for(let i=0;i<w;i+=36) {
    x.beginPath();
    x.moveTo(i, 0);
    x.lineTo(i, h);
    x.stroke()
  }
}
function loop() {
  scene();
  g.clearRect(0, 0, w, h);
  g.drawImage(o, 0, 0, w*d, h*d, 0, 0, w, h);
  let r=125;
  g.save();
  g.beginPath();
  g.arc(m.x, m.y, r, 0, 7);
  g.clip();
  g.translate(m.x, m.y);
  g.scale(1.16, 1.16);
  g.translate(-m.x, -m.y);
  g.drawImage(o, 0, 0, w*d, h*d, 0, 0, w, h);
  g.restore();
  g.beginPath();
  g.arc(m.x, m.y, r, 0, 7);
  g.strokeStyle="#ffffffaa";
  g.lineWidth=2;
  g.shadowColor="#40508055";
  g.shadowBlur=22;
  g.stroke();
  g.shadowBlur=0;
  t++;
  requestAnimationFrame(loop)
}
fit();
loop();
