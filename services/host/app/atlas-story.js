import {escapeHtml as esc} from './html.js';
import {icon} from './atlas-icons.js';
import {cleanTitle,typeName} from './atlas-data.js';
import {yearLabel} from './chronicle.js';

export class AtlasStory{
  constructor(ui){
    this.ui=ui;this.history=[];
    this.pane=document.createElement('aside');this.pane.className='atlas-pane atlas-left atlas-story';this.pane.id='atlasStory';this.pane.setAttribute('aria-label','인물과 사건 이야기');
    ui.registerPanel('story',this.pane);
    this.pane.onclick=e=>{
      if(e.target.closest('[data-story-back]')){this.back();return;}
      if(e.target.closest('[data-story-relations]')){this.mode='relations';this.render();return;}
      if(e.target.closest('[data-story-summary]')){this.mode='summary';this.render();return;}
      const related=e.target.closest('[data-story-entity]');if(related){this.ui.chronicle.showEntity(related.dataset.storyEntity);return;}
      const event=e.target.closest('[data-story-event]');if(event){const entry=ui.data.events.find(x=>x.sceneId===event.dataset.storyEvent);if(entry)ui.chronicle.showEvent(entry);return;}
      const claim=e.target.closest('[data-story-claim]');if(claim){const row=ui.data.claims.get(claim.dataset.storyClaim);if(row)ui.evidence(row);return;}
      if(e.target.closest('[data-story-place]')){const event=this.sceneEvent();if(event)ui.chronicle.showEvent(event);return;}
      if(e.target.closest('[data-story-chat]'))ui.chat?.show(this.entity.id);
    };
  }
  reset(){this.entity=null;this.activity=null;this.history=[];}
  show(entity,activity){
    if(this.entity&&this.entity.id!==entity.id&&!this.goingBack)this.history.push({id:this.entity.id,year:this.ui.chronicle.year,mode:this.mode});
    this.entity=entity;this.activity=activity;this.mode='summary';this.ui.openPanel('story');this.render();
  }
  back(){
    if(this.mode==='relations'){this.mode='summary';this.render();return;}
    const previous=this.history.pop();if(!previous){this.ui.closePanel();return;}
    this.goingBack=true;this.ui.chronicle.showEntity(previous.id);this.goingBack=false;this.mode=previous.mode;this.render();
  }
  sceneEvent(){
    const events=this.ui.data.eventsFor(this.entity.id),scene=this.ui.scene.assets?.activeScene;
    return events.find(e=>e.sceneId===scene)||events[0];
  }
  relatedRows(){
    const data=this.ui.data,event=this.sceneEvent(),scene=data.scenes.get(this.activity?.sceneId||event?.sceneId);
    const rows=new Map(data.relations(this.entity.id).map(r=>[r.entity.id,{...r,role:'',presence:''}]));
    if(this.entity.type==='Event')for(const p of scene?.participants||[]){
      const entity=data.entities.get(p.entityId),claims=(p.claimIds||[]).map(id=>data.claims.get(id)).filter(Boolean);
      if(!entity||!claims.length)continue;
      const row=rows.get(entity.id)||{entity,claims:[]};row.claims=[...new Map([...row.claims,...claims].map(c=>[c.id,c])).values()];row.role=p.role;row.presence=p.presence;rows.set(entity.id,row);
    }
    const order={Person:0,Place:1,Event:2,Polity:3};
    return [...rows.values()].sort((a,b)=>(order[a.entity.type]??4)-(order[b.entity.type]??4));
  }
  render(){
    if(!this.entity)return;
    const ui=this.ui,data=ui.data,entity=this.entity,activity=this.activity,event=this.sceneEvent(),scene=data.scenes.get(activity?.sceneId||event?.sceneId),name=activity?.setting?activity.label:data.label(entity);
    const related=this.relatedRows(),dates=data.datesLabel(entity.id),claims=data.subjects.get(entity.id)||[];
    const role=scene?.participants?.find(p=>p.entityId===entity.id&&(p.claimIds||[]).some(id=>data.claims.has(id)));
    const description=activity?.summary||data.description(entity.id)||(entity.type==='Event'?scene?.summary:role?`${yearLabel(scene.startYear)} · ${role.role}`:'');
    const place=activity?.place||scene?.place?.label;
    const relationMode=this.mode==='relations';
    this.pane.innerHTML=`<header><button class="atlas-story-back" data-story-back>${icon('left')}<span>${relationMode?'이야기로':this.history.length?'이전 이야기':'지도로 돌아가기'}</span></button><button class="atlas-icon" data-close aria-label="이야기 닫기">${icon('close')}</button></header>
      <div class="atlas-story-body"><p class="atlas-breadcrumb">${typeName(entity.type)} <span>›</span> ${esc(activity?.narrative?'설화·전승':event?yearLabel(event.lo):dates)}</p>
      <h2>${esc(name)}${relationMode?'과 연결':''}</h2>
      ${relationMode?'<p class="atlas-muted">관계를 따라 탐색해 보세요.</p>':`${activity?.role?`<p class="atlas-role">${esc(activity.role)}</p>`:''}${description?`<p class="atlas-description">${esc(description)}</p>`:'<p class="atlas-muted">이 항목에 연결된 기록과 관계를 살펴보세요.</p>'}
      ${activity?.narrative?`<p class="atlas-muted">이야기 속 시기 · ${esc(activity.narrative.storyTime.label)}<br>문헌의 기록 시기 · ${esc(activity.narrative.recordingTime.label)}</p>`:''}
      ${place?`<button class="atlas-place" data-story-place>${icon('pin')}<span>${esc(place)}</span>${icon('arrow')}</button>`:''}
      ${entity.type==='Person'?`<p class="atlas-muted">생몰·활동 기록 · ${esc(dates)}</p>`:''}`}
      <div class="atlas-connections">${related.slice(0,relationMode?30:3).map(row=>{
        const target=row.entity,caption={Person:'어떤 인물이 함께했을까?',Place:'어디에서 이어질까?',Event:'어떤 사건과 이어질까?',Polity:'어떤 나라·집단과 관련될까?'}[target.type]||'어떤 기록과 이어질까?';
        return `<button class="atlas-connection" data-story-entity="${esc(target.id)}">${icon(target.type==='Person'?'person':target.type==='Place'?'pin':target.type==='Polity'?'castle':'event')}<span><small>${relationMode?caption:typeName(target.type)}</small><strong>${esc(data.label(target))}</strong>${row.role?`<em>${esc(row.role)}${row.presence&&row.presence!=='on-site'?' · 관련 인물':''}</em>`:''}</span>${icon('right')}</button>`;
      }).join('')||'<p class="atlas-muted">아직 연결된 관계 기록이 없습니다.</p>'}</div>
      ${relationMode&&place?`<button class="atlas-connection" data-story-place>${icon('pin')}<span><small>어디서 일어났을까?</small><strong>${esc(place)}</strong><em>장면의 장소 살펴보기</em></span>${icon('right')}</button>`:''}
      ${!relationMode&&related.length?`<button class="atlas-primary atlas-related-button" data-story-relations>관계 따라 보기 <span>${related.length}</span>${icon('right')}</button>`:''}
      ${entity.type==='Person'&&data.eventsFor(entity.id).length?`<section class="atlas-related-events"><h3>함께 살펴볼 사건</h3>${data.eventsFor(entity.id).slice(0,8).map(e=>`<button ${e.sceneId?`data-story-event="${esc(e.sceneId)}"`:`data-story-entity="${esc(e.id)}"`}><span>${esc(yearLabel(e.lo))}</span>${esc(cleanTitle(e.title))}${icon('right')}</button>`).join('')}</section>`:''}
      <details class="atlas-story-evidence"><summary>${icon('event')}${relationMode?'관계의 근거 보기':'이야기의 근거 보기'}</summary>${[...new Map((relationMode?related.flatMap(r=>r.claims):[...(activity?.claimIds||[]).map(id=>data.claims.get(id)).filter(Boolean),...claims]).map(c=>[c.id,c])).values()].map(c=>`<button data-story-claim="${esc(c.id)}"><span>${esc(c.quote||c.sourceLabel||'근거 기록')}</span><small>${esc(c.sourceLabel||'원문 보기')} ↗</small></button>`).join('')||'<p class="atlas-muted">직접 연결된 근거가 없습니다.</p>'}</details>
      ${activity?.placement?`<details class="atlas-placement-note"><summary>지도 위치 안내</summary><p>${esc(activity.placement)}</p>${activity.coordinateNote?`<p>${esc(activity.coordinateNote)}</p>`:''}</details>`:''}</div>
      ${ui.chat?`<footer><button class="atlas-primary" data-story-chat>${icon('star')}이 이야기 더 물어보기</button></footer>`:''}`;
  }
}
