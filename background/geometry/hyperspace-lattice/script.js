let c=document.querySelector("canvas"), g=c.getContext("2d"), w, h, t=0, m= {
  x:0,
  y:0
};
onresize=()=> {
  w=c.width=innerWidth;
  h=c.height=innerHeight
};
onpointermove=e=> {
  m.x=(e.x/w-.5)*100;
  m.y=(e.y/h-.5)*100
};
function f() {
  g.fillStyle="#02040d";
  g.fillRect(0, 0, w, h);
  let cx=w/2+m.x, cy=h/2+m.y;
  for(let z=0;z<22;z++) {
    let u=((z-t*.08)%22+22)%22/22, r=20+u*Math.max(w, h), a=t*.004+u*1.2;
    g.strokeStyle=`rgba(100,130,255,${1-u})`;
    g.beginPath();
    for(let i=0;i<=4;i++) {
      let A=i/4*6.28+a, x=cx+Math.cos(A)*r, y=cy+Math.sin(A)*r*.62;
      i?g.lineTo(x, y):g.moveTo(x, y)
    }
    g.stroke()
  }
  for(let i=0;i<12;i++) {
    let a=i/12*6.28+t*.004;
    g.beginPath();
    g.moveTo(cx+Math.cos(a)*20, cy+Math.sin(a)*12);
    g.lineTo(cx+Math.cos(a+1.2)*w, cy+Math.sin(a+1.2)*h);
    g.strokeStyle="#758aff22";
    g.stroke()
  }
  t++;
  requestAnimationFrame(f)
}
onresize();
f();
