let c=document.querySelector("canvas"), g=c.getContext("2d"), r=[], w, h, wind=2, flash=0;
onresize=()=> {
  w=c.width=innerWidth;
  h=c.height=innerHeight;
  r=Array.from( {
    length:500
  }, ()=>( {
    x:Math.random()*w,
    y:Math.random()*h,
    l:8+Math.random()*18,
    s:6+Math.random()*9
  }))
};
onpointermove=e=>wind=(e.x/w-.5)*12;
onpointerdown=()=>flash=1;
function f() {
  g.fillStyle=`rgb(${24+flash*150},${35+flash*160},${49+flash*180})`;
  g.fillRect(0, 0, w, h);
  g.strokeStyle="#c9e8ff77";
  for(let q of r) {
    g.beginPath();
    g.moveTo(q.x, q.y);
    g.lineTo(q.x+wind, q.y+q.l);
    g.stroke();
    q.x+=wind*.12;
    q.y+=q.s;
    if(q.y>h) {
      q.y=-20;
      q.x=Math.random()*w
    }
  }
  if(flash>.2) {
    g.strokeStyle="#fff";
    g.lineWidth=2;
    g.beginPath();
    g.moveTo(w*.8, 0);
    for(let y=0;y<h*.7;y+=35)g.lineTo(w*.8+(Math.random()-.5)*80, y);
    g.stroke()
  }
  flash*=.82;
  requestAnimationFrame(f)
}
onresize();
f();
