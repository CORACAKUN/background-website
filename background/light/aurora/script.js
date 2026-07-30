const c=document.querySelector("#scene"), g=c.getContext("2d"), m= {
  x:.5,
  y:.5
};
let w, h, d, t=0;
function size() {
  w=innerWidth;
  h=innerHeight;
  d=Math.min(devicePixelRatio||1, 1.5);
  c.width=w*d;
  c.height=h*d;
  g.setTransform(d, 0, 0, d, 0, 0)
}
addEventListener("resize", size);
addEventListener("pointermove", e=> {
  m.x=e.clientX/w;
  m.y=e.clientY/h
});
function ribbon(i, color) {
  const base=h*(.18+i*.13), shift=(m.x-.5)*100*(i%2?1:-1);
  g.beginPath();
  g.moveTo(-100, -100);
  for(let x=-100;x<=w+100;x+=24) {
    const y=base+Math.sin(x*.006+t*.009+i)*75+Math.sin(x*.014-t*.006+i*2)*32+shift;
    g.lineTo(x, y)
  }
  g.lineTo(w+100, h*.78);
  g.lineTo(-100, h*.65);
  g.closePath();
  const gr=g.createLinearGradient(0, base-100, 0, base+260);
  gr.addColorStop(0, color);
  gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle=gr;
  g.fill()
}
function loop() {
  g.clearRect(0, 0, w, h);
  g.globalCompositeOperation="screen";
  ribbon(0, "rgba(46,244,173,.3)");
  ribbon(1, "rgba(70,125,255,.24)");
  ribbon(2, "rgba(174,80,241,.18)");
  ribbon(3, "rgba(104,255,211,.15)");
  g.globalCompositeOperation="source-over";
  t++;
  requestAnimationFrame(loop)
}
size();
loop();
