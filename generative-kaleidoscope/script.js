let c=document.querySelector("canvas"), g=c.getContext("2d"), w, h, t=0, m= {
  x:100,
  y:100
};
onresize=()=> {
  w=c.width=innerWidth;
  h=c.height=innerHeight
};
onpointermove=e=> {
  m.x=e.x;
  m.y=e.y
};
function f() {
  g.fillStyle="rgba(8,6,9,.12)";
  g.fillRect(0, 0, w, h);
  g.save();
  g.translate(w*.72, h*.45);
  g.globalCompositeOperation="screen";
  for(let k=0;k<12;k++) {
    g.save();
    g.rotate(k/12*7);
    if(k%2)g.scale(1, -1);
    g.strokeStyle=`hsla(${t+k*25},90%,65%,.28)`;
    g.beginPath();
    for(let i=0;i<45;i++) {
      let r=i*4, a=Math.sin(i*.23+t*.012)*.5+(m.x/w-.5);
      let x=Math.cos(a)*r, y=Math.sin(a)*r+(m.y/h-.5)*80;
      i?g.lineTo(x, y):g.moveTo(x, y)
    }
    g.stroke();
    g.restore()
  }
  g.restore();
  t++;
  requestAnimationFrame(f)
}
onresize();
f();
