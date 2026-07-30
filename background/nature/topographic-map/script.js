const c=document.querySelector("#c"), g=c.getContext("2d");
let w, h, d, t=0, m= {
  x:innerWidth*.75,
  y:innerHeight*.4
};
function fit() {
  w=innerWidth;
  h=innerHeight;
  d=Math.min(devicePixelRatio||1, 2);
  c.width=w*d;
  c.height=h*d;
  g.setTransform(d, 0, 0, d, 0, 0)
}
addEventListener("resize", fit);
addEventListener("pointermove", e=> {
  m.x=e.clientX;
  m.y=e.clientY
});
function field(x, y) {
  let dx=x-m.x, dy=y-m.y, r=Math.hypot(dx, dy);
  return Math.sin(x*.009+t*.006)*13+Math.cos(y*.011-t*.004)*10+Math.sin((x+y)*.005)*8+Math.max(0, 1-r/260)*62
}
function loop() {
  g.clearRect(0, 0, w, h);
  for(let k=-60;k<=60;k+=9) {
    g.beginPath();
    let started=false;
    for(let x=0;x<=w;x+=7) {
      let last=null;
      for(let y=0;y<=h;y+=7) {
        let v=field(x, y)-k;
        if(last!==null&&v*last<0) {
          started?g.lineTo(x, y):g.moveTo(x, y);
          started=true;
          break
        }
        last=v
      }
    }
    g.strokeStyle=k%18===0?"rgba(70,83,42,.34)":"rgba(84,96,54,.18)";
    g.lineWidth=k%18===0?1:.6;
    g.stroke()
  }
  t++;
  requestAnimationFrame(loop)
}
fit();
loop();
