const c=document.querySelector("canvas"),g=c.getContext("2d"),p=[];
let w,h,d,a=0,spd=.018,down=false,m= {
  y:.5
}
;
function fit() {
  w=innerWidth;
  h=innerHeight;
  d=Math.min(devicePixelRatio||1,1.5);
  c.width=w*d;
  c.height=h*d;
  g.setTransform(d,0,0,d,0,0);
  while(p.length<260)p.push( {
    x:Math.random()*w,y:Math.random()*h,v:.5+Math.random()*1.5
  }
  )
}
onresize=fit;
onpointermove=e=>m.y=e.y/h;
onpointerdown=()=>down=true;
onpointerup=()=>down=false;
function loop() {
  g.fillStyle="rgba(4,11,16,.3)";
  g.fillRect(0,0,w,h);
  spd+=((down?.075:.018)-spd)*.04;
  a+=spd;
  let cx=w*.72,cy=h*.48,R=Math.min(w,h)*.27;
  g.strokeStyle="#62d9ee22";
  for(let r=R*.32;r<=R;r+=R*.17) {
    g.beginPath();
    g.arc(cx,cy,r,0,7);
    g.stroke()
  }
  for(let i=0;i<28;i++) {
    let A=i/28*7+a,r1=R*.26,r2=R*.9;
    g.beginPath();
    g.moveTo(cx+Math.cos(A)*r1,cy+Math.sin(A)*r1);
    g.quadraticCurveTo(cx+Math.cos(A+.25)*R*.6,cy+Math.sin(A+.25)*R*.6,cx+Math.cos(A+.48)*r2,cy+Math.sin(A+.48)*r2);
    g.strokeStyle=`rgba(129,225,238,${.18+i%3*.08})`;
    g.stroke()
  }
  g.fillStyle="#07141a";
  g.beginPath();
  g.arc(cx,cy,R*.23,0,7);
  g.fill();
  g.strokeStyle="#61d9ee";
  g.stroke();
  g.globalCompositeOperation="lighter";
  for(let q of p) {
    q.x+=q.v*(1+spd*20);
    q.y+=(m.y-.5)*.08;
    if(q.x>w)q.x=0;
    let dx=q.x-cx,dy=q.y-cy,r=Math.hypot(dx,dy);
    if(r<R) {
      let A=Math.atan2(dy,dx)+spd*2;
      q.x=cx+Math.cos(A)*r;
      q.y=cy+Math.sin(A)*r
    }
    g.fillStyle="#66e9ff55";
    g.fillRect(q.x,q.y,1+q.v,1)
  }
  g.globalCompositeOperation="source-over";
  requestAnimationFrame(loop)
}
fit();
loop();
