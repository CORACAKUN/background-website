const c=document.querySelector("#c"), g=c.getContext("2d"), o=document.createElement("canvas"), x=o.getContext("2d");
let w, h, d, W, H, A, B, nA, nB, img, down=false, S=6;
function idx(x, y) {
  return y*W+x
}
function seed(cx, cy, r=5) {
  for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<r*r) {
    let X=(cx+x+W)%W, Y=(cy+y+H)%H;
    B[idx(X, Y)]=1
  }
}
function fit() {
  w=innerWidth;
  h=innerHeight;
  d=Math.min(devicePixelRatio||1, 1.5);
  c.width=w*d;
  c.height=h*d;
  g.setTransform(d, 0, 0, d, 0, 0);
  W=Math.ceil(w/S);
  H=Math.ceil(h/S);
  o.width=W;
  o.height=H;
  A=new Float32Array(W*H).fill(1);
  B=new Float32Array(W*H);
  nA=new Float32Array(W*H);
  nB=new Float32Array(W*H);
  img=x.createImageData(W, H);
  for(let i=0;i<14;i++)seed(Math.random()*W|0, Math.random()*H|0, 3+Math.random()*5|0)
}
addEventListener("resize", fit);
function mark(e) {
  let q=e.touches?.[0]||e;
  seed(q.clientX/S|0, q.clientY/S|0, 6)
}
addEventListener("pointerdown", e=> {
  down=true;
  mark(e)
});
addEventListener("pointermove", e=> {
  if(down)mark(e)
});
addEventListener("pointerup", ()=>down=false);
function step() {
  for(let y=1;y<H-1;y++)for(let x1=1;x1<W-1;x1++) {
    let i=idx(x1, y), a=A[i], b=B[i], la=A[i-1]+A[i+1]+A[i-W]+A[i+W]-4*a, lb=B[i-1]+B[i+1]+B[i-W]+B[i+W]-4*b, react=a*b*b;
    nA[i]=Math.max(0, Math.min(1, a+(la-react+.055*(1-a))));
    nB[i]=Math.max(0, Math.min(1, b+(.5*lb+react-(.062+.055)*b)))
  }
  [A, nA]=[nA, A];
  [B, nB]=[nB, B]
}
function loop() {
  for(let i=0;i<3;i++)step();
  let z=img.data;
  for(let i=0;i<A.length;i++) {
    let v=Math.max(0, Math.min(1, (A[i]-B[i])*1.5)), j=i*4;
    z[j]=18+v*225;
    z[j+1]=12+v*145;
    z[j+2]=20+v*72;
    z[j+3]=255
  }
  x.putImageData(img, 0, 0);
  g.imageSmoothingEnabled=true;
  g.drawImage(o, 0, 0, w, h);
  requestAnimationFrame(loop)
}
fit();
loop();
