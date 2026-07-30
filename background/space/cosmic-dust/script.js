const c=document.querySelector("#c"), g=c.getContext("2d"), p=[];
let w, h, d, t=0, m= {
  x:-999,
  y:-999,
  on:false
};
function seed(q= {
}) {
  q.x=Math.random()*w;
  q.y=Math.random()*h;
  q.vx=(Math.random()-.5)*.08;
  q.vy=(Math.random()-.5)*.08;
  q.z=Math.random();
  q.h=Math.random()>.5?255+Math.random()*45:175+Math.random()*30;
  return q
}
function fit() {
  w=innerWidth;
  h=innerHeight;
  d=Math.min(devicePixelRatio||1, 2);
  c.width=w*d;
  c.height=h*d;
  g.setTransform(d, 0, 0, d, 0, 0);
  while(p.length<900)p.push(seed())
}
addEventListener("resize", fit);
addEventListener("pointermove", e=> {
  m.x=e.clientX;
  m.y=e.clientY;
  m.on=true
});
function loop() {
  g.fillStyle="rgba(2,3,10,.13)";
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation="lighter";
  for(let q of p) {
    let dx=m.x-q.x, dy=m.y-q.y, r=Math.hypot(dx, dy)||1;
    if(m.on&&r<250) {
      let f=(1-r/250)*.035;
      q.vx+=dx/r*f-dy/r*f*1.8;
      q.vy+=dy/r*f+dx/r*f*1.8
    }
    q.vx+=Math.sin(q.y*.008+t*.003)*.002;
    q.vy+=Math.cos(q.x*.006-t*.002)*.002;
    q.vx*=.997;
    q.vy*=.997;
    q.x+=q.vx;
    q.y+=q.vy;
    if(q.x<0||q.x>w||q.y<0||q.y>h)seed(q);
    g.fillStyle=`hsla(${q.h},85%,68%,${.06+q.z*.28})`;
    g.beginPath();
    g.arc(q.x, q.y, .4+q.z*1.3, 0, 7);
    g.fill()
  }
  g.globalCompositeOperation="source-over";
  t++;
  requestAnimationFrame(loop)
}
fit();
loop();
