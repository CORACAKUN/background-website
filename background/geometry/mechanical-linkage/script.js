const c=document.querySelector("canvas"),g=c.getContext("2d");
let w,h,d,a=0,m= {
  x:.5
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
onpointermove=e=>m.x=e.x/w;
function wheel(x,y,r,angle) {
  g.strokeStyle="#34333199";
  g.lineWidth=2;
  g.beginPath();
  g.arc(x,y,r,0,7);
  g.stroke();
  for(let i=0;i<8;i++) {
    let A=i/8*7+angle;
    g.beginPath();
    g.moveTo(x+Math.cos(A)*r*.25,y+Math.sin(A)*r*.25);
    g.lineTo(x+Math.cos(A)*r,y+Math.sin(A)*r);
    g.stroke()
  }
  g.fillStyle="#9d5537";
  g.beginPath();
  g.arc(x,y,5,0,7);
  g.fill()
}
function rod(x1,y1,x2,y2) {
  g.strokeStyle="#5c5a55";
  g.lineWidth=8;
  g.lineCap="round";
  g.beginPath();
  g.moveTo(x1,y1);
  g.lineTo(x2,y2);
  g.stroke();
  g.strokeStyle="#d2cdc2";
  g.lineWidth=2;
  g.stroke();
  g.lineCap="butt"
}
function loop() {
  g.fillStyle="#ece8df";
  g.fillRect(0,0,w,h);
  g.strokeStyle="#32312e12";
  for(let x=0;x<w;x+=28) {
    g.beginPath();
    g.moveTo(x,0);
    g.lineTo(x,h);
    g.stroke()
  }
  a+=.018+(m.x*.03);
  let cx=w*.7,cy=h*.5,s=Math.min(w,h)*.13,p1= {
    x:cx-s*1.6,y:cy
  }
  ,p2= {
    x:cx,y:cy+s*.35
  }
  ,p3= {
    x:cx+s*1.55,y:cy-s*.25
  }
  ;
  wheel(p1.x,p1.y,s*.7,a);
  wheel(p2.x,p2.y,s*.52,-a*1.35);
  wheel(p3.x,p3.y,s*.82,a*.82);
  let j1= {
    x:p1.x+Math.cos(a)*s*.5,y:p1.y+Math.sin(a)*s*.5
  }
  ,j2= {
    x:p2.x+Math.cos(-a*1.35)*s*.36,y:p2.y+Math.sin(-a*1.35)*s*.36
  }
  ,j3= {
    x:p3.x+Math.cos(a*.82)*s*.62,y:p3.y+Math.sin(a*.82)*s*.62
  }
  ;
  rod(j1.x,j1.y,j2.x,j2.y);
  rod(j2.x,j2.y,j3.x,j3.y);
  for(const q of[j1,j2,j3]) {
    g.fillStyle="#9d5537";
    g.beginPath();
    g.arc(q.x,q.y,6,0,7);
    g.fill()
  }
  requestAnimationFrame(loop)
}
fit();
loop();
