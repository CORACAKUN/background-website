const c=document.querySelector("#scene"), g=c.getContext("2d"), p=[], m= {
  x:-999,
  y:-999,
  on:false
};
let w, h, d, t=0;
function seed(q= {
}) {
  q.x=Math.random()*w;
  q.y=Math.random()*h;
  q.px=q.x;
  q.py=q.y;
  q.life=100+Math.random()*400;
  q.h=Math.random()*55+145;
  return q
}
function size() {
  w=innerWidth;
  h=innerHeight;
  d=Math.min(devicePixelRatio||1, 2);
  c.width=w*d;
  c.height=h*d;
  g.setTransform(d, 0, 0, d, 0, 0);
  while(p.length<700)p.push(seed());
  p.length=700
}
addEventListener("resize", size);
addEventListener("pointermove", e=> {
  m.x=e.clientX;
  m.y=e.clientY;
  m.on=true
});
document.documentElement.addEventListener("pointerleave", ()=>m.on=false);
function loop() {
  g.fillStyle="rgba(6,16,15,.045)";
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation="lighter";
  for(const q of p) {
    q.px=q.x;
    q.py=q.y;
    let a=Math.sin(q.x*.006+t*.003)*1.7+Math.cos(q.y*.008-t*.002)*1.5;
    if(m.on) {
      const dx=q.x-m.x, dy=q.y-m.y, r=Math.hypot(dx, dy);
      if(r<190)a+=Math.atan2(dy, dx)+1.4*(1-r/190)
    }
    q.x+=Math.cos(a)*1.05;
    q.y+=Math.sin(a)*1.05;
    q.life--;
    g.beginPath();
    g.moveTo(q.px, q.py);
    g.lineTo(q.x, q.y);
    g.strokeStyle=`hsla(${q.h},75%,65%,.17)`;
    g.stroke();
    if(q.life<0||q.x<0||q.x>w||q.y<0||q.y>h)seed(q)
  }
  g.globalCompositeOperation="source-over";
  t++;
  requestAnimationFrame(loop)
}
size();
loop();
