const c=document.querySelector("#c"), g=c.getContext("2d"), p=[];
let w, h, d, t=0, m= {
  x:-999,
  y:-999,
  on:false
};
function fit() {
  w=innerWidth;
  h=innerHeight;
  d=Math.min(devicePixelRatio||1, 2);
  c.width=w*d;
  c.height=h*d;
  g.setTransform(d, 0, 0, d, 0, 0);
  p.length=0;
  for(let i=0;i<1800;i++) {
    let x=Math.random()*w, y=Math.random()*h;
    p.push( {
      x, y,
      hx:x,
      hy:y,
      vx:0,
      vy:0,
      z:Math.random()
    })
  }
}
addEventListener("resize", fit);
addEventListener("pointermove", e=> {
  m.x=e.clientX;
  m.y=e.clientY;
  m.on=true
});
function loop() {
  let bg=g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#24160d");
  bg.addColorStop(1, "#6b3f1d");
  g.fillStyle=bg;
  g.fillRect(0, 0, w, h);
  for(const q of p) {
    let dune=Math.sin(q.hx*.012+t*.006)*28+Math.sin(q.hx*.004+t*.002)*55, ty=q.hy+dune*(q.hy/h);
    let dx=q.x-m.x, dy=q.y-m.y, r=Math.hypot(dx, dy)||1;
    if(m.on&&r<90) {
      q.vx+=dx/r*(1-r/90)*.7;
      q.vy+=dy/r*(1-r/90)*.7
    }
    q.vx+=(q.hx-q.x)*.018+.012;
    q.vy+=(ty-q.y)*.018;
    q.vx*=.91;
    q.vy*=.91;
    q.x+=q.vx;
    q.y+=q.vy;
    let light=55+q.z*30+(dune>0?8:0);
    g.fillStyle=`hsla(${28+q.z*13},80%,${light}%,${.22+q.z*.5})`;
    g.fillRect(q.x, q.y, .7+q.z, .7+q.z)
  }
  t++;
  requestAnimationFrame(loop)
}
fit();
loop();
