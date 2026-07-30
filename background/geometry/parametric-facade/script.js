const c=document.querySelector("canvas"),g=c.getContext("2d");
let w,h,d,t=0,m= {
  x:-999,y:-999
}
;
function fit() {
  w=innerWidth;
  h=innerHeight;
  d=Math.min(devicePixelRatio||1,1.5);
  c.width=w*d;
  c.height=h*d;
  g.setTransform(d,0,0,d,0,0)
}
onresize=fit;
onpointermove=e=> {
  m.x=e.x;
  m.y=e.y
}
;
function loop() {
  g.fillStyle="#e8e6df";
  g.fillRect(0,0,w,h);
  let cols=17,rows=15,gap=Math.min(w,h)*.035,cx=w*.72,cy=h*.49;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++) {
    let X=cx+(x-cols/2)*gap,Y=cy+(y-rows/2)*gap,dist=Math.hypot(X-m.x,Y-m.y),push=Math.max(0,1-dist/230)*38+Math.sin(t*.02+x*.4+y*.25)*5,s=gap*.82,skew=push*.22;
    g.beginPath();
    g.moveTo(X-s/2-skew,Y-s/2);
    g.lineTo(X+s/2-skew,Y-s/2);
    g.lineTo(X+s/2+skew,Y+s/2);
    g.lineTo(X-s/2+skew,Y+s/2);
    g.closePath();
    let shade=52+push*.7;
    g.fillStyle=`hsl(${168+push},18%,${shade}%)`;
    g.fill();
    g.strokeStyle=`rgba(32,72,69,${.12+push*.008})`;
    g.stroke()
  }
  t++;
  requestAnimationFrame(loop)
}
fit();
loop();
