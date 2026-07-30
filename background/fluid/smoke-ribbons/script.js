let c=document.querySelector("canvas"), g=c.getContext("2d"), p=[], w, h, m= {
  x:0,
  y:0,
  px:0,
  py:0
};
onresize=()=> {
  w=c.width=innerWidth;
  h=c.height=innerHeight
};
onpointermove=e=> {
  m.px=m.x;
  m.py=m.y;
  m.x=e.x;
  m.y=e.y;
  for(let i=0;i<6;i++)p.push( {
    x:m.x,
    y:m.y,
    vx:(m.x-m.px)*-.03+(Math.random()-.5),
    vy:(m.y-m.py)*-.03-1-Math.random(),
    r:15,
    l:1,
    h:260+Math.random()*70
  })
};
function f() {
  g.fillStyle="rgba(9,8,11,.09)";
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation="screen";
  for(let i=p.length-1;i>=0;i--) {
    let q=p[i];
    q.x+=q.vx+Math.sin(q.y*.02)*.2;
    q.y+=q.vy;
    q.r+=.6;
    q.l*=.985;
    let z=g.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r);
    z.addColorStop(0, `hsla(${q.h},55%,70%,${q.l*.18})`);
    z.addColorStop(1, "transparent");
    g.fillStyle=z;
    g.beginPath();
    g.arc(q.x, q.y, q.r, 0, 7);
    g.fill();
    if(q.l<.02)p.splice(i, 1)
  }
  g.globalCompositeOperation="source-over";
  requestAnimationFrame(f)
}
onresize();
f();
