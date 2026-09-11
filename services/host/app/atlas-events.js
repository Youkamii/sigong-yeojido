import {escapeHtml as esc} from './html.js';
import {icon} from './atlas-icons.js';
import {cleanTitle} from './atlas-data.js';
import {yearLabel} from './chronicle.js';

export function eventCategory(event,scene){
  if(['battle','naval','siege'].includes(scene?.kind))return 'war';
  if(['court','assembly'].includes(scene?.kind))return 'politics';
  if(['publication','excavation'].includes(scene?.kind))return 'culture';
  const title=event.title||'';
  if(/전쟁|전투|해전|대첩|침입|침략|정벌|항전/.test(title))return 'war';
  if(/건국|즉위|선포|조약|정변|개혁|독립|정부/.test(title))return 'politics';
  if(/편찬|간행|창제|교육|학교|사찰|불교|서원|문화|과학|발명|인쇄/.test(title))return 'culture';
  return 'other';
}

export class AtlasEvents{
  constructor(ui){
    this.ui=ui;this.category='all';this.timeline=ui.chronicle.timeline;
    this.pane=document.createElement('aside');this.pane.id='atlasEvents';this.pane.className='atlas-event-panel';this.pane.setAttribute('aria-label','연도별 사건 목록');
    this.pane.innerHTML=`<header><h2>사건 목록</h2><span class="atlas-event-caption"></span><button class="atlas-icon" data-close aria-label="사건 목록 닫기">${icon('close')}</button></header><div class="atlas-event-categories" role="tablist" aria-label="사건 종류">${[['all','전체'],['war','전쟁'],['politics','정치'],['culture','문화']].map(([value,label])=>`<button role="tab" data-event-category="${value}" aria-selected="${value==='all'}">${label}</button>`).join('')}</div>`;
    this.pane.append(this.timeline.host);ui.registerPanel('events',this.pane);
    this.toggle=ui.time.querySelector('#atlasEventsButton');this.toggle.hidden=false;this.toggle.setAttribute('aria-controls','atlasEvents');
    this.toggle.onclick=()=>{if(ui.panel==='events')ui.closePanel();else{ui.openPanel('events');this.toggle.setAttribute('aria-expanded','true');this.update();}};
    this.pane.addEventListener('click',e=>{const button=e.target.closest('[data-event-category]');if(button){this.category=button.dataset.eventCategory;this.update();}});
    this.timeline.cardWidthFor=width=>width<700?Math.min(350,Math.max(220,width*.8)):Math.floor((width-28)/3);
    this.timeline.cardContent=event=>this.card(event);
    this.timeline.windowKey=null;
    ui.chronicle.callbacks.timelineEvents=events=>this.filter(events);
  }
  filter(events){return events.filter(event=>this.category==='all'||eventCategory(event,this.ui.data.scenes?.get(event.sceneId))===this.category);}
  card(event){
    const data=this.ui.data,scene=data.scenes?.get(event.sceneId),people=(scene?.participants||[]).filter(p=>data.entities.has(p.entityId)&&data.entities.get(p.entityId).type==='Person'&&(p.claimIds||[]).some(id=>data.claims.has(id))).slice(0,2).map(p=>data.label(data.entities.get(p.entityId)));
    const symbol=scene?.kind==='naval'?'ship':scene?.kind==='siege'?'castle':eventCategory(event,scene)==='war'?'battle':'event';
    return `<span class="atlas-event-date">${esc(yearLabel(event.lo))}</span><div class="atlas-event-card-body">${icon(symbol)}<div><strong>${esc(cleanTitle(event.title))}</strong><small>${esc([...people,event.placeLabel].filter(Boolean).join(' · '))}</small><span class="atlas-event-action"><em class="atlas-event-current">선택한 사건 보기</em><em class="atlas-event-jump">${esc(yearLabel(event.lo))}으로 이동</em>${icon('arrow')}</span></div></div>`;
  }
  preview(year){if(!this.pane.hidden)this.pane.querySelector('.atlas-event-caption').textContent=yearLabel(year)+'의 앞뒤 이야기';}
  update(){
    if(!this.ui.data.context)return;
    const events=this.filter(this.ui.data.context.allEvents);
    this.pane.querySelectorAll('[data-event-category]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.eventCategory===this.category)));
    this.timeline.setEvents(events);this.timeline.setYear(this.ui.chronicle.year,true);this.preview(this.ui.chronicle.year);
  }
  hide(){this.pane.hidden=true;this.toggle.setAttribute('aria-expanded','false');}
}
