let ls=document.querySelectorAll(".layers i");
onpointermove=e=>ls.forEach((q, i)=> {
  let k=(i+1)*.012;
  q.style.setProperty("--x", `${(e.x-innerWidth/2)*k}px`);
  q.style.setProperty("--y", `${(e.y-innerHeight/2)*k}px`)
});
