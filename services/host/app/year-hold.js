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

export function yearAtPointer(clientX,left,width,min=-2500,max=2100){
  const ratio=width>0?Math.max(0,Math.min(1,(clientX-left)/width)):0;
  const year=Math.round(min+(max-min)*ratio);
  return year===0?(min+(max-min)*ratio<0?-1:1):year;
}

export function bindYearSlider(slider,{read,preview,commit,schedule=setTimeout,cancel=clearTimeout},onStart=()=>{}){
  let pointer=null,pending=false,edge=0,edgeTimer=null,clientX=0;
  const stop=()=>{
    const id=pointer;pointer=null;edge=0;cancel(edgeTimer);edgeTimer=null;
    if(pending){pending=false;commit();}
    if(id!==null&&slider.hasPointerCapture(id))slider.releasePointerCapture(id);
  };
  const queueEdge=()=>{
    if(!edge||edgeTimer!==null)return;
    edgeTimer=schedule(()=>{
      edgeTimer=null;if(pointer===null)return;
      const before=slider.min+':'+slider.max;
      slider.dispatchEvent?.(new CustomEvent('yearedge',{detail:edge}));
      if(before===slider.min+':'+slider.max)return;
      move({clientX});
    },300);
  };
  const move=event=>{
    clientX=event.clientX;
    const rect=slider.getBoundingClientRect();pending=true;
    preview(yearAtPointer(clientX,rect.left,rect.width,+slider.min,+slider.max),true);
    const direction=clientX<=rect.left&&+slider.min>-2500?-1:clientX>=rect.left+rect.width&&+slider.max<2100?1:0;
    if(direction!==edge){cancel(edgeTimer);edgeTimer=null;edge=direction;}
    queueEdge();
  };
  slider.onpointerdown=event=>{
    if(event.button!==0||!event.isPrimary)return;
    event.preventDefault();stop();onStart();pointer=event.pointerId;
    slider.focus();slider.setPointerCapture(pointer);move(event);
  };
  slider.onpointermove=event=>{
    if(event.pointerId!==pointer)return;
    event.preventDefault();move(event);
  };
  slider.onpointerup=slider.onpointercancel=event=>{if(event.pointerId===pointer)stop();};
  slider.onlostpointercapture=()=>{if(pointer!==null)stop();};
  slider.onkeydown=event=>{
    if(!['ArrowLeft','ArrowRight','ArrowDown','ArrowUp'].includes(event.key))return;
    event.preventDefault();onStart();
    preview(stepYear(read(),['ArrowLeft','ArrowDown'].includes(event.key)?-1:1),false);
  };
  slider.addEventListener('wheel',event=>{
    if(!event.deltaY&&!event.deltaX)return;
    event.preventDefault();onStart();preview(stepYear(read(),Math.sign(event.deltaY||event.deltaX)),false);
  },{passive:false});
  const blur=()=>{if(pointer!==null)stop();else commit();};
  slider.onblur=blur;
  window.addEventListener('blur',blur);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  return stop;
}

export function createYearPlayback({advance,busy=()=>false,lastCompleted=()=>-Infinity,now=()=>performance.now(),schedule=setTimeout,cancel=clearTimeout,delay=1200}){
  let playing=false,timer=null,running=false;
  const queue=(wait=delay)=>{if(playing){cancel(timer);timer=schedule(()=>{timer=null;return tick();},wait);}};
  const tick=async()=>{
    if(!playing||running)return;
    if(busy())return;
    const remaining=delay-(now()-lastCompleted());
    if(remaining>5){queue(remaining);return;}
    running=true;
    try{await advance();}finally{running=false;queue();}
  };
  return {tick,completed(){if(!running)queue();},get playing(){return playing;},start(){if(playing)return;playing=true;if(!running)queue();},
    stop(){playing=false;cancel(timer);timer=null;}};
}
