const c=document.querySelector("#c"), g=c.getContext("2d"), p=[];
let w, h, d, m= {
  x:0,
  y:0,
  px:0,
  py:0
};
function fit() {
  w=innerWidth;
  h=innerHeight;
  d=Math.min(devicePixelRatio||1, 1.5);
  c.width=w*d;
  c.height=h*d;
  g.setTransform(d, 0, 0, d, 0, 0)
}
addEventListener("resize", fit);
addEventListener("pointermove", e=> {
  m.px=m.x;
  m.py=m.y;
  m.x=e.clientX;
  m.y=e.clientY;
  for(let i=0;i<10;i++)p.push( {
    x:m.x,
    y:m.y,
    vx:(m.x-m.px)*-.04+(Math.random()-.5)*2,
    vy:(m.y-m.py)*-.04+(Math.random()-.5)*2,
    r:10+Math.random()*25,
    l:1,
    h:Math.random()> .5?180+Math.random()*30:295+Math.random()*35
  })
});
function loop() {
  g.fillStyle="rgba(3,3,11,.12)";
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation="lighter";
  for(let i=p.length-1;i>=0;i--) {
    let q=p[i];
    q.x+=q.vx;
    q.y+=q.vy;
    q.vx*=.97;
    q.vy*=.97;
    q.r+=.28;
    q.l*=.974;
    let z=g.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r);
    z.addColorStop(0, `hsla(${q.h},100%,65%,${q.l*.5})`);
    z.addColorStop(1, `hsla(${q.h},100%,50%,0)`);
    g.fillStyle=z;
    g.beginPath();
    g.arc(q.x, q.y, q.r, 0, 7);
    g.fill();
    if(q.l<.02)p.splice(i, 1)
  }
  g.globalCompositeOperation="source-over";
  if(p.length>500)p.splice(0, p.length-500);
  requestAnimationFrame(loop)
}
fit();
loop();
