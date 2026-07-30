const c=document.querySelector("canvas"),g=c.getContext("2d"),cols=[];
let w,h,d,t=0,m= {
  x:-999,y:-999
}
;
const walls=[[0,0,1,0],[1,0,1,1],[1,1,0,1],[0,1,0,0],[.36,0,.36,.62],[.36,.62,1,.62],[.7,.62,.7,1],[0,.34,.36,.34],[.7,.25,1,.25]];
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
onpointerdown=e=> {
  cols.push( {
    x:e.x,y:e.y
  }
  );
  if(cols.length>12)cols.shift()
}
;
function loop() {
  g.fillStyle="#071a30";
  g.fillRect(0,0,w,h);
  g.strokeStyle="#75d5ff12";
  g.lineWidth=.5;
  for(let x=0;x<w;x+=24) {
    g.beginPath();
    g.moveTo(x,0);
    g.lineTo(x,h);
    g.stroke()
  }
  for(let y=0;y<h;y+=24) {
    g.beginPath();
    g.moveTo(0,y);
    g.lineTo(w,y);
    g.stroke()
  }
  let W=Math.min(w*.46,680),H=W*.67,X=w*.72-W/2,Y=h*.48-H/2;
  g.strokeStyle="#b9e9ff99";
  g.lineWidth=2;
  for(const q of walls) {
    g.beginPath();
    g.moveTo(X+q[0]*W,Y+q[1]*H);
    g.lineTo(X+q[2]*W,Y+q[3]*H);
    g.stroke()
  }
  g.strokeStyle="#75d5ff66";
  g.lineWidth=.7;
  for(let i=0;i<6;i++) {
    let x=X+i*W/5;
    g.beginPath();
    g.moveTo(x,Y-22);
    g.lineTo(x,Y+H+22);
    g.stroke()
  }
  g.font="8px monospace";
  g.fillStyle="#b9e9ff88";
  g.fillText("LIVING / 42.5 m²",X+20,Y+H*.18);
  g.fillText("CORE",X+W*.43,Y+H*.42);
  g.fillText("STUDIO",X+W*.73,Y+H*.82);
  for(const q of cols) {
    g.strokeStyle="#ffbd6799";
    g.strokeRect(q.x-5,q.y-5,10,10)
  }
  g.strokeStyle="#fff5";
  g.setLineDash([4,6]);
  g.beginPath();
  g.moveTo(m.x,0);
  g.lineTo(m.x,h);
  g.moveTo(0,m.y);
  g.lineTo(w,m.y);
  g.stroke();
  g.setLineDash([]);
  g.strokeStyle="#75d5ff55";
  g.beginPath();
  g.moveTo(X,Y-30);
  g.lineTo(X+W,Y-30);
  g.stroke();
  g.fillStyle="#75d5ff";
  g.fillRect(X+(t*.5%W),Y-32,4,4);
  t++;
  requestAnimationFrame(loop)
}
fit();
loop();
