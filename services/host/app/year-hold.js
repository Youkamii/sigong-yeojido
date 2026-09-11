export function stepYear(year, amount, min=-2500, max=2100){
  const index=year>0?year-1:year;
  const next=index+amount;
  return Math.max(min,Math.min(max,next>=0?next+1:next));
}

export function createYearHold({read,preview,commit,now=()=>performance.now(),schedule=setTimeout,cancel=clearTimeout}){
  let direction=0,started=0,timer=null;
  const stop=(finish=true)=>{
    const active=direction!==0;direction=0;cancel(timer);timer=null;
    if(active&&finish)commit();
  };
  const advance=()=>{
    const elapsed=now()-started;
    const amount=elapsed<1200?1:elapsed<2400?2:elapsed<4000?5:elapsed<6000?10:25;
    const year=read(),next=stepYear(year,direction*amount);
    if(next===year){stop();return;}
    preview(next);
    timer=schedule(advance,100);
  };
  return {stop,start(nextDirection){
    if(direction===nextDirection)return;
    stop(false);direction=nextDirection;started=now();
    const year=read(),next=stepYear(year,direction);
    if(next===year){stop();return;}
    preview(next);timer=schedule(advance,400);
  }};
}

export function bindYearHold(root,hold){
  let owner=null,pointer=null,key=null;
  const stop=()=>{
    const element=owner,id=pointer;owner=null;pointer=null;key=null;
    hold.stop();
    if(id!==null&&element?.hasPointerCapture(id))element.releasePointerCapture(id);
  };
  for(const button of root.querySelectorAll('[data-year-step]')){
    button.onpointerdown=event=>{
      if(event.button!==0||!event.isPrimary)return;
      event.preventDefault();stop();owner=button;pointer=event.pointerId;
      button.focus();button.setPointerCapture(pointer);hold.start(+button.dataset.yearStep);
    };
    button.onpointerup=button.onpointercancel=event=>{if(event.pointerId===pointer)stop();};
    button.onlostpointercapture=()=>{if(owner===button)stop();};
    button.onkeydown=event=>{
      if(!['ArrowLeft','ArrowRight',' ','Enter'].includes(event.key))return;
      event.preventDefault();if(event.repeat)return;
      stop();owner=button;key=event.key;
      hold.start(event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:+button.dataset.yearStep);
    };
    button.onkeyup=event=>{if(event.key===key){event.preventDefault();stop();}};
    button.onblur=stop;
    button.onclick=event=>{if(event.detail===0&&!owner){hold.start(+button.dataset.yearStep);hold.stop();}};
  }
  window.addEventListener('blur',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  return stop;
}
