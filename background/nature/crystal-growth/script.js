let c=document.querySelector("canvas"), g=c.getContext("2d"), b=[], w, h;
onresize=()=> {
  w=c.width=innerWidth;
  h=c.height=innerHeight
};
onpointerdown=e=> {
  for(let i=0;i<12;i++)b.push( {
    x:e.x,
    y:e.y,
    a:i/12*7,
    l:0,
    max:30+Math.random()*100,
    d:0
  })
};
function f() {
  g.fillStyle="rgba(7,17,27,.08)";
  g.fillRect(0, 0, w, h);
  for(let i=b.length-1;i>=0;i--) {
    let q=b[i], px=q.x+Math.cos(q.a)*q.l, py=q.y+Math.sin(q.a)*q.l;
    q.l+=1;
    g.strokeStyle=`rgba(118,223,255,${1-q.d*.18})`;
    g.beginPath();
    g.moveTo(q.x, q.y);
    g.lineTo(px, py);
    g.stroke();
    if(q.l>q.max) {
      if(q.d<3)for(let j=-1;j<=1;j+=2)b.push( {
        x:px,
        y:py,
        a:q.a+j*(.35+Math.random()*.35),
        l:0,
        max:q.max*.62,
        d:q.d+1
      });
      b.splice(i, 1)
    }
  }
  requestAnimationFrame(f)
}
onresize();
onpointerdown( {
  x:innerWidth*.75,
  y:innerHeight*.45
});
f();
