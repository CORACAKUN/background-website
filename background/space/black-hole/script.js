const c=document.querySelector("#scene"), g=c.getContext("2d"), stars=[], m= {
  x:innerWidth*.72,
  y:innerHeight*.48,
  down:false,
  power:1
};
let w, h, d, t=0;
function star() {
  const a=Math.random()*6.28, r=Math.random()*Math.max(w, h);
  return {
    x:m.x+Math.cos(a)*r,
    y:m.y+Math.sin(a)*r,
    vx:0,
    vy:0,
    z:Math.random(),
    life:1
  }
}
function size() {
  w=innerWidth;
  h=innerHeight;
  d=Math.min(devicePixelRatio||1, 2);
  c.width=w*d;
  c.height=h*d;
  g.setTransform(d, 0, 0, d, 0, 0);
  while(stars.length<260)stars.push(star())
}
addEventListener("resize", size);
addEventListener("pointermove", e=> {
  m.x=e.clientX;
  m.y=e.clientY
});
addEventListener("pointerdown", ()=>m.down=true);
addEventListener("pointerup", ()=>m.down=false);
function loop() {
  g.fillStyle="rgba(2,2,4,.22)";
  g.fillRect(0, 0, w, h);
  m.power+=((m.down?2.4:1)-m.power)*.025;
  g.globalCompositeOperation="lighter";
  for(const s of stars) {
    const dx=m.x-s.x, dy=m.y-s.y, r=Math.hypot(dx, dy)||1, f=Math.min(.7, 1400*m.power/(r*r));
    s.vx+=dx/r*f-dy/r*f*.58;
    s.vy+=dy/r*f+dx/r*f*.58;
    s.vx*=.995;
    s.vy*=.995;
    s.x+=s.vx;
    s.y+=s.vy;
    g.beginPath();
    g.moveTo(s.x-s.vx*3, s.y-s.vy*3);
    g.lineTo(s.x, s.y);
    g.strokeStyle=`rgba(255,${120+s.z*100},${55+s.z*160},${.25+s.z*.6})`;
    g.stroke();
    if(r<15||s.x<0||s.x>w||s.y<0||s.y>h)Object.assign(s, star())
  }
  const R=34+Math.sin(t*.04)*3+m.power*5, gr=g.createRadialGradient(m.x, m.y, 4, m.x, m.y, R);
  gr.addColorStop(0, "#000");
  gr.addColorStop(.35, "#000");
  gr.addColorStop(.55, "rgba(255,99,36,.8)");
  gr.addColorStop(1, "rgba(128,45,255,0)");
  g.fillStyle=gr;
  g.beginPath();
  g.arc(m.x, m.y, R, 0, 6.28);
  g.fill();
  g.globalCompositeOperation="source-over";
  t++;
  requestAnimationFrame(loop)
}
size();
loop();
