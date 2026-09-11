import {escapeHtml as esc} from './html.js';

export function timelineEntries(events){
  return events.filter(e=>Number.isInteger(e.lo)&&e.lo!==0).map(e=>({...e,hi:e.setting?e.lo:e.hi,key:[e.id,e.lo,e.hi,e.sceneId||''].join('|')}))
    .sort((a,b)=>a.lo-b.lo||a.title.localeCompare(b.title,'ko')||a.key.localeCompare(b.key));
}
export function yearAnchors(entries){
  const groups=new Map();entries.forEach((e,index)=>{const g=groups.get(e.lo)||{year:e.lo,first:index,last:index};g.last=index;groups.set(e.lo,g);});
  return [...groups.values()].map(g=>({year:g.year,position:(g.first+g.last)/2}));
}
export function positionAtYear(anchors,year){
  if(!anchors.length)return 0;
  if(year<=anchors[0].year)return anchors[0].position;
  const i=anchors.findIndex(a=>a.year>=year);if(i<0)return anchors.at(-1).position;
  const a=anchors[i-1],b=anchors[i];return a.position+(b.position-a.position)*(year-a.year)/(b.year-a.year);
}
export function yearAtPosition(anchors,position){
  if(!anchors.length)return null;
  if(position<=anchors[0].position)return anchors[0].year;
  const i=anchors.findIndex(a=>a.position>=position);if(i<0)return anchors.at(-1).year;
  const a=anchors[i-1],b=anchors[i],year=Math.round(a.year+(b.year-a.year)*(position-a.position)/(b.position-a.position));
  return year===0?(position<(a.position+b.position)/2?-1:1):year;
}

export class EventTimeline{
  constructor(host,{select,preview,commit,yearLabel}){
    this.host=host;this.select=select;this.preview=preview;this.commit=commit;this.yearLabel=yearLabel;this.entries=[];this.anchors=[];this.year=1593;
    host.innerHTML=`<div class="event-strip-heading"><strong>주요 사건</strong><span class="event-strip-hint">좌우로 끌어 탐색</span><span data-event-total></span>
      <button data-event-prev aria-label="이전 주요 사건">‹</button><button data-event-next aria-label="다음 주요 사건">›</button></div>
      <div class="event-strip-window" tabindex="0" role="region" aria-label="연도순 주요 사건"><div class="event-strip-axis"></div>
      <div class="event-strip-cursor"><span></span></div><div class="event-strip-track"></div><p class="event-strip-empty" hidden>선택한 사료에 연결된 사건이 없습니다.</p></div>`;
    this.viewport=host.querySelector('.event-strip-window');this.track=host.querySelector('.event-strip-track');
    host.querySelector('[data-event-prev]').onclick=()=>this.move(-1);host.querySelector('[data-event-next]').onclick=()=>this.move(1);
    this.viewport.onclick=e=>{if(this.dragged)return;const button=e.target.closest('[data-event-key]');if(button){const entry=this.entries.find(x=>x.key===button.dataset.eventKey);if(entry)this.select(entry);}};
    this.viewport.onkeydown=e=>{this.dragged=false;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();this.move(e.key==='ArrowLeft'?-1:1);}};
    this.viewport.onpointerdown=e=>{if(e.button!==0||!this.entries.length)return;this.dragged=false;this.drag={x:e.clientX,position:positionAtYear(this.anchors,this.year),id:e.pointerId};};
    this.viewport.onpointermove=e=>{
      if(!this.drag)return;const dx=e.clientX-this.drag.x;if(!this.dragged&&Math.abs(dx)<6)return;
      this.dragged=true;this.viewport.setPointerCapture(e.pointerId);this.host.classList.add('scrubbing');
      this.preview(yearAtPosition(this.anchors,this.drag.position-dx/this.step));
    };
    const end=e=>{if(!this.drag)return;this.drag=null;if(this.viewport.hasPointerCapture(e.pointerId))this.viewport.releasePointerCapture(e.pointerId);this.host.classList.remove('scrubbing');if(this.dragged)this.commit();};
    this.viewport.onpointerup=end;this.viewport.onpointercancel=end;
    this.viewport.addEventListener('wheel',e=>{if(!this.entries.length)return;e.preventDefault();const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
      this.preview(yearAtPosition(this.anchors,positionAtYear(this.anchors,this.year)+delta/this.step));},{passive:false});
    new ResizeObserver(()=>this.setYear(this.year,true)).observe(this.viewport);
  }
  setEvents(events){
    const entries=timelineEntries(events),key=entries.map(e=>[e.key,e.title,e.placeLabel].join(':')).join('|');
    if(this.eventsKey===key)return;this.eventsKey=key;this.entries=entries;this.anchors=yearAnchors(entries);this.windowKey=null;
    this.host.querySelector('[data-event-total]').textContent=entries.length?`${entries.length}개 사건`:'';
    this.host.querySelector('.event-strip-empty').hidden=!!entries.length;
    this.setYear(this.year,true);
  }
  setYear(year,instant=false){
    if(!Number.isInteger(year))return;this.year=year;
    const width=this.viewport.clientWidth;this.cardWidth=this.cardWidthFor?.(width)||(width<600?146:190);this.step=this.cardWidth+14;
    const rawPosition=positionAtYear(this.anchors,year),position=this.snapToCard&&!this.drag?Math.round(rawPosition):rawPosition,count=Math.ceil(width/this.step)+6;
    const start=Math.max(0,Math.min(this.entries.length-count,Math.floor(position-count/2))),end=Math.min(this.entries.length,start+count);
    const key=[start,end,this.cardWidth].join(':');
    if(this.windowKey!==key){
      this.windowKey=key;instant=true;
      this.track.innerHTML=this.entries.slice(start,end).map(e=>`<button class="event-strip-card" data-event-key="${esc(e.key)}" data-event-id="${esc(e.id)}" data-scene-id="${esc(e.sceneId||'')}" data-year="${e.lo}">
        ${this.cardContent?this.cardContent(e):`<span class="event-strip-date">${esc(this.yearLabel(e.lo))}${e.hi!==e.lo?' – '+esc(this.yearLabel(e.hi)):''}</span><strong>${esc(e.title)}</strong>${e.placeLabel?`<small>${esc(e.placeLabel)}</small>`:''}`}</button>`).join('');
    }
    this.track.style.setProperty('--event-card-width',this.cardWidth+'px');
    this.track.style.transition=instant||this.drag?'none':'';
    this.track.style.transform=`translateX(${width/2-this.cardWidth/2+(start-position)*this.step}px)`;
    for(const [i,button] of [...this.track.children].entries()){
      const entry=this.entries[start+i],current=entry.lo<=year&&entry.hi>=year;
      button.classList.toggle('current',current);button.classList.toggle('past',entry.hi<year);button.setAttribute('aria-current',current?'date':'false');
      const x=width/2+(start+i-position)*this.step;button.tabIndex=Math.abs(x-width/2)<width/2+this.cardWidth/2?0:-1;
    }
    this.host.querySelector('.event-strip-cursor span').textContent=this.yearLabel(year);
    this.host.querySelector('[data-event-prev]').disabled=!this.anchors.some(a=>a.year<year);
    this.host.querySelector('[data-event-next]').disabled=!this.anchors.some(a=>a.year>year);
  }
  move(direction){
    const target=direction<0?this.anchors.filter(a=>a.year<this.year).at(-1):this.anchors.find(a=>a.year>this.year);
    if(target){this.preview(target.year);this.commit();}
  }
}
