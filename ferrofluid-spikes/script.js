let c=document.querySelector("canvas"), g=c.getContext("2d"), w, h, m= {
  x:-999,
  y:-999
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
  g.fillStyle="#d9d7d0";
  g.fillRect(0, 0, w, h);
  for(let y=0;y<h;y+=18)for(let x=0;x<w;x+=18) {
    let dx=m.x-x, dy=m.y-y, r=Math.hypot(dx, dy), k=Math.max(0, 1-r/210), len=2+k*k*25, a=Math.atan2(dy, dx);
    g.strokeStyle=`rgba(10,12,13,${.16+k*.8})`;
    g.lineWidth=1+k*2;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x+Math.cos(a)*len, y+Math.sin(a)*len);
    g.stroke();
    g.fillStyle="#111";
    g.beginPath();
    g.arc(x, y, 1+k*2, 0, 7);
    g.fill()
  }
  requestAnimationFrame(f)
}
onresize();
f();
