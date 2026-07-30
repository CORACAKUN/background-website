const c=document.querySelector("canvas"),g=c.getContext("2d");
let w,h,d,a=0,spd=.035,down=false;
function fit() {
  w=innerWidth;
  h=innerHeight;
  d=Math.min(devicePixelRatio||1,1.5);
  c.width=w*d;
  c.height=h*d;
  g.setTransform(d,0,0,d,0,0)
}
onresize=fit;
onpointerdown=()=>down=true;
onpointerup=()=>down=false;
function loop() {
  g.fillStyle="#0a0b0c";
  g.fillRect(0,0,w,h);
  spd+=((down?.11:.035)-spd)*.04;
  a+=spd;
  let cx=w*.72,cy=h*.58,s=Math.min(w,h)*.12;
  g.strokeStyle="#7f858866";
  g.lineWidth=2;
  g.beginPath();
  g.moveTo(cx-s*2.2,cy);
  g.lineTo(cx+s*2.2,cy);
  g.stroke();
  for(let i=0;i<4;i++) {
    let x=cx+(i-1.5)*s*.95,phase=a+i*Math.PI,crankX=x+Math.cos(phase)*s*.25,crankY=cy+Math.sin(phase)*s*.25,pistonY=cy-s*1.65+Math.sin(phase)*s*.55;
    g.strokeStyle="#b9bec0";
    g.lineWidth=4;
    g.beginPath();
    g.moveTo(crankX,crankY);
    g.lineTo(x,pistonY+s*.35);
    g.stroke();
    g.fillStyle="#34383a";
    g.fillRect(x-s*.28,pistonY-s*.22,s*.56,s*.44);
    g.strokeStyle="#e5794c88";
    g.strokeRect(x-s*.34,cy-s*2.25,s*.68,s*1.45);
    g.fillStyle="#d6dadb";
    g.beginPath();
    g.arc(crankX,crankY,s*.1,0,7);
    g.fill();
    if(Math.sin(phase)<-.88) {
      g.fillStyle="#ff6a3222";
      g.fillRect(x-s*.3,cy-s*2.2,s*.6,s*.5)
    }
  }
  g.strokeStyle="#e5794c";
  g.beginPath();
  g.arc(cx,cy,s*.38,0,7);
  g.stroke();
  requestAnimationFrame(loop)
}
fit();
loop();
