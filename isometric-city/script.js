const c=document.querySelector("canvas"),g=c.getContext("2d");
let w,h,d,t=0,m= {
  x:.5,y:.5
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
  m.x=e.x/w;
  m.y=e.y/h
}
;
function block(x,y,s,z,hue) {
  let top=y-z;
  g.fillStyle=`hsl(${hue},15%,${28+z*.05}%)`;
  g.beginPath();
  g.moveTo(x,top-s/2);
  g.lineTo(x+s,top);
  g.lineTo(x,top+s/2);
  g.lineTo(x-s,top);
  g.closePath();
  g.fill();
  g.fillStyle=`hsl(${hue},18%,20%)`;
  g.beginPath();
  g.moveTo(x-s,top);
  g.lineTo(x,top+s/2);
  g.lineTo(x,y+s/2);
  g.lineTo(x-s,y);
  g.closePath();
  g.fill();
  g.fillStyle=`hsl(${hue},20%,14%)`;
  g.beginPath();
  g.moveTo(x+s,top);
  g.lineTo(x,top+s/2);
  g.lineTo(x,y+s/2);
  g.lineTo(x+s,y);
  g.closePath();
  g.fill();
  g.strokeStyle="#ffab6933";
  g.stroke()
}
function loop() {
  g.fillStyle="#0c1014";
  g.fillRect(0,0,w,h);
  let s=34,cx=w*.72+(m.x-.5)*45,cy=h*.24+(m.y-.5)*25;
  for(let row=0;row<16;row++)for(let col=0;col<19;col++) {
    let x=cx+(col-row)*s,y=cy+(col+row)*s*.5+(t*.15%(s*.5)),n=Math.sin(col*12.7+row*8.1)*.5+.5,z=12+n*110+Math.sin(t*.012+col+row)*8;
    if(y<h+100)block(x,y,s,z,22+n*25)
  }
  t++;
  requestAnimationFrame(loop)
}
fit();
loop();
