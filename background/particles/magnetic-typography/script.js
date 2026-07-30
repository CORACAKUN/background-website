const c=document.querySelector("#c"), g=c.getContext("2d"), letters=[], text="GRAVITY MAKES MEANING ";
let w, h, d, m= {
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
  letters.length=0;
  for(let i=0;i<180;i++)letters.push( {
    ch:text[i%text.length],
    x:Math.random()*w,
    y:Math.random()*h,
    hx:0,
    hy:0,
    vx:0,
    vy:0,
    r:70+Math.random()*130,
    a:Math.random()*6.28
  })
}
addEventListener("resize", fit);
addEventListener("pointermove", e=> {
  m.x=e.clientX;
  m.y=e.clientY;
  m.on=true
});
document.documentElement.addEventListener("pointerleave", ()=>m.on=false);
function loop() {
  g.clearRect(0, 0, w, h);
  g.font="11px monospace";
  g.textAlign="center";
  for(let i=0;i<letters.length;i++) {
    let q=letters[i];
    q.a+=.004;
    q.hx=m.x+Math.cos(q.a)*q.r;
    q.hy=m.y+Math.sin(q.a)*q.r*.42;
    if(m.on) {
      let dx=q.hx-q.x, dy=q.hy-q.y, dist=Math.hypot(q.x-m.x, q.y-m.y);
      if(dist<290) {
        q.vx+=dx*.006;
        q.vy+=dy*.006
      }
    }
    else {
      q.vx+=Math.cos(q.a)*.01;
      q.vy+=Math.sin(q.a)*.01
    }
    q.vx*=.91;
    q.vy*=.91;
    q.x+=q.vx;
    q.y+=q.vy;
    if(q.x<0)q.x=w;
    if(q.x>w)q.x=0;
    if(q.y<0)q.y=h;
    if(q.y>h)q.y=0;
    let near=m.on?Math.max(0, 1-Math.hypot(q.x-m.x, q.y-m.y)/300):0;
    g.fillStyle=`rgba(255,${150-near*45},${115-near*30},${.15+near*.75})`;
    g.fillText(q.ch, q.x, q.y)
  }
  requestAnimationFrame(loop)
}
fit();
loop();
