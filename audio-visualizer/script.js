let c=document.querySelector("canvas"), g=c.getContext("2d"), w, h, t=0, data, audio;
onresize=()=> {
  w=c.width=innerWidth;
  h=c.height=innerHeight
};
onpointerdown=async()=> {
  if(audio)return;
  try {
    let s=await navigator.mediaDevices.getUserMedia( {
      audio:true
    }), a=new AudioContext, src=a.createMediaStreamSource(s);
    audio=a.createAnalyser();
    audio.fftSize=256;
    src.connect(audio);
    data=new Uint8Array(audio.frequencyBinCount)
  }
  catch {
  }
};
function f() {
  g.fillStyle="rgba(7,5,16,.25)";
  g.fillRect(0, 0, w, h);
  if(audio)audio.getByteFrequencyData(data);
  let n=data?.length||96;
  g.beginPath();
  for(let i=0;i<n;i++) {
    let a=i/n*7, r=90+(data?data[i]*.7:35+Math.sin(t*.03+i*.4)*24), x=w*.72+Math.cos(a)*r, y=h*.45+Math.sin(a)*r;
    i?g.lineTo(x, y):g.moveTo(x, y)
  }
  g.closePath();
  g.strokeStyle="#df6cffaa";
  g.lineWidth=2;
  g.shadowColor="#df6cff";
  g.shadowBlur=18;
  g.stroke();
  g.shadowBlur=0;
  t++;
  requestAnimationFrame(f)
}
onresize();
f();
