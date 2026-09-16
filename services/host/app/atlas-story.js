import {escapeHtml as esc} from './html.js';
import {icon} from './atlas-icons.js';
import {cleanTitle,typeName,relationName,relationDates,relationTime} from './atlas-data.js';
import {yearLabel} from './chronicle.js';
import {eraAt} from './atlas-eras.js';
import {roleLabel} from './chronicle-asset-plan.js';
import {loadAiImages,aiImageFor} from './ai-images.js';

const withoutParentheses=text=>{
  let result=String(text||'').normalize('NFKC'),previous;
  do{previous=result;result=result.replace(/\([^()]*\)/g,'');}while(result!==previous);
  return result;
};
export const normalize=text=>withoutParentheses(text).toLowerCase().replace(/[\s·ㆍ・\-‐‑‒–—―]/g,'');
export const displayTitle=title=>cleanTitle(String(title||'')).replace(/\s*\((?:기원전\s*)?\d{1,4}년?(?:\s*[~～–—-]\s*\d{1,4}년?)?\)\s*$/,'').split(/ [—–-] /)[0].trim();
const yearOnly=text=>/^[\s\d년월일경~∼～·,.\-–]+$/.test(text);
export const shortLabel=label=>String(label||'').replace(/\s*\(([^()]*)\)/g,(match,detail)=>detail.length>10||yearOnly(detail)?'':match).split(' · ')[0].replace(/집단 행위자/g,'').replace(/\s{2,}/g,' ').trim();
const eventKey=row=>JSON.stringify([normalize(displayTitle(row.title)),row.lo??null]);
// 출처 라벨 '거북선 — 한국민족문화대백과사전' → '한국민족문화대백과사전 「거북선」'(대시 없이)
export const sourceName=label=>{const text=String(label||'').trim();if(!text)return '원문 보기';const parts=text.split(/\s+[—–]\s+/);return parts.length>=2?`${parts[parts.length-1].trim()} 「${parts.slice(0,-1).join(' ').trim()}」`:text;};
export function mergeEvents(rows){
  const merged=new Map(),firstPlaces=new Map(),datedKeys=new Map();
  for(const row of rows){
    const group=eventKey(row),place=normalize(row.placeLabel);
    if(place&&!firstPlaces.has(group))firstPlaces.set(group,place);
    // 연도 없는 같은 제목의 행(장면 없는 사건 개체)은 연도 있는 행에 흡수한다(#197: "주화론과 척화론 · 연도 미확인" 중복)
    if(Number.isInteger(row.lo)){const t=normalize(displayTitle(row.title)),prior=datedKeys.get(t);if(!prior||row.lo<prior.lo)datedKeys.set(t,{group,lo:row.lo});}
  }
  for(const row of rows){
    const titleKey=normalize(displayTitle(row.title));
    const group=Number.isInteger(row.lo)?eventKey(row):(datedKeys.get(titleKey)?.group||eventKey(row));
    const place=normalize(row.placeLabel)||firstPlaces.get(group)||'';
    const key=JSON.stringify([group,place]),previous=merged.get(key);
    if(!previous){merged.set(key,{...row,basis:[...(row.basis||[])]});continue;}
    const priority=entry=>Number(!!entry.sceneId)*2+Number(!!normalize(entry.placeLabel));
    const preferred=priority(row)>priority(previous)?row:previous;
    merged.set(key,{...preferred,
      basis:[...new Map([...previous.basis,...(row.basis||[])].map(c=>[c.id,c])).values()]});
  }
  return [...merged.values()].sort((a,b)=>(a.lo??Infinity)-(b.lo??Infinity)||a.title.localeCompare(b.title,'ko'));
}
export function mergePlaces(rows){
  const merged=new Map();
  for(const row of rows){
    if(!row.label)continue;
    const key=normalize(row.label),previous=merged.get(key);
    if(!previous){merged.set(key,{...row,fullLabel:row.label,events:new Map(row.events||[])});continue;}
    if(row.label.length<previous.label.length)previous.label=row.label;
    if(row.label.length>previous.fullLabel.length)previous.fullLabel=row.label;
    previous.entityId||=row.entityId;previous.sceneId||=row.sceneId;
    for(const [id,event] of row.events||[])previous.events.set(id,event);
  }
  return [...merged.values()].sort((a,b)=>b.events.size-a.events.size||a.label.localeCompare(b.label,'ko'));
}

export class AtlasStory{
  constructor(ui){
    this.ui=ui;this.history=[];this.tab='summary';this.more=new Set();
    this.pane=document.createElement('aside');this.pane.className='atlas-pane atlas-left atlas-story';this.pane.id='atlasStory';this.pane.setAttribute('aria-label','인물과 사건 이야기');
    ui.registerPanel('story',this.pane);
    loadAiImages().then(data=>{if(data&&this.entity)this.render();});
    this.pane.onclick=e=>{
      if(e.target.closest('[data-story-back]')){this.back();return;}
      const tab=e.target.closest('[data-story-tab]');if(tab){this.tab=tab.dataset.storyTab;this.render();this.pane.querySelector('.atlas-story-tabs')?.scrollIntoView({block:'start'});this.pane.querySelector(`.atlas-story-tab[data-story-tab="${this.tab}"]`)?.focus({preventScroll:true});return;}
      const more=e.target.closest('[data-story-more]');if(more){this.more.add(more.dataset.storyMore);this.render();return;}
      if(e.target.closest('[data-story-expand]')){this.expanded=!this.expanded;this.updateDescription();return;}
      const related=e.target.closest('[data-story-entity]');if(related){this.ui.chronicle.showEntity(related.dataset.storyEntity);return;}
      const event=e.target.closest('[data-story-event]');if(event){const entry=ui.data.events.find(x=>x.sceneId===event.dataset.storyEvent);if(entry)ui.chronicle.showEvent(entry);return;}
      const claim=e.target.closest('[data-story-claim]');if(claim){const row=ui.data.claims.get(claim.dataset.storyClaim);if(row)ui.evidence(row);return;}
      const place=e.target.closest('[data-story-place]');if(place){
        const selected=ui.data.events.find(x=>x.sceneId===place.dataset.storyPlace);
        if(selected){ui.chronicle.showEvent(selected);return;}
        if(this.activity?.sceneId){ui.chronicle.callbacks.scene?.(this.activity.sceneId);ui.chronicle.showEntity(this.entity.id);}
        else{const event=this.sceneEvent();if(event)ui.chronicle.showEvent(event);}
        return;
      }
      if(e.target.closest('[data-story-chat]'))ui.chat?.show(this.entity.id);
    };
  }
  reset(){this.entity=null;this.activity=null;this.history=[];this.tab='summary';this.more=new Set();this.expanded=false;this.descriptionObserver?.disconnect();}
  show(entity,activity){
    entity=this.ui.data.entities.get(this.ui.data.canonicalId(entity.id))||entity;
    if(this.entity&&this.entity.id!==entity.id&&!this.goingBack)this.history.push({id:this.entity.id});
    const changed=this.entity?.id!==entity.id;
    if(changed){this.tab='summary';this.more=new Set();this.expanded=false;}
    this.entity=entity;this.activity=activity;this.ui.openPanel('story');this.render();
    if(changed){const body=this.pane.querySelector?.('.atlas-story-body');if(body)body.scrollTop=0;}
  }
  back(){
    const previous=this.history.pop();if(!previous){this.ui.closePanel();return;}
    this.goingBack=true;this.ui.chronicle.showEntity(previous.id);this.goingBack=false;
  }
  sceneEvent(){
    const events=this.ui.data.eventsFor(this.entity.id),scene=this.ui.scene.assets?.activeScene;
    const candidates=this.entity.type==='Event'?events.filter(e=>e.id===this.entity.id):events;
    return (this.activity?.sceneId&&candidates.find(e=>e.sceneId===this.activity.sceneId))||
      (scene&&candidates.find(e=>e.sceneId===scene))||candidates.find(e=>e.sceneId)||candidates[0];
  }
  relatedRows(){
    const data=this.ui.data,event=this.sceneEvent(),scene=data.scenes.get(this.activity?.sceneId||event?.sceneId);
    const rows=new Map(data.relations(this.entity.id).map(r=>[r.entity.id,{...r,relationClaims:r.claims}]));
    if(this.entity.type==='Event')for(const p of scene?.participants||[]){
      const entity=data.entities.get(data.canonicalId(p.entityId)),claims=(p.claimIds||[]).map(id=>data.claims.get(id)).filter(Boolean);
      if(!entity||!claims.length)continue;
      const row=rows.get(entity.id)||{entity,claims:[]};row.claims=[...new Map([...row.claims,...claims].map(c=>[c.id,c])).values()];rows.set(entity.id,row);
    }
    if(this.entity.type==='Person')for(const e of data.eventsFor(this.entity.id)){
      const packet=data.scenes.get(e.sceneId);
      if(!packet?.participants?.some(p=>data.canonicalId(p.entityId)===this.entity.id&&(p.claimIds||[]).some(id=>data.claims.has(id))))continue;
      for(const p of packet.participants){
        const entity=data.entities.get(data.canonicalId(p.entityId)),claims=(p.claimIds||[]).map(id=>data.claims.get(id)).filter(Boolean);
        if(entity?.type!=='Person'||entity.id===this.entity.id||!claims.length)continue;
        const row=rows.get(entity.id)||{entity,claims:[]};
        row.claims=[...new Map([...row.claims,...claims].map(c=>[c.id,c])).values()];
        row.sharedYears||=new Set();row.sharedYears.add(e.lo);rows.set(entity.id,row);
      }
    }
    rows.delete(this.entity.id);
    return [...rows.values()];
  }
  sections(related){
    const data=this.ui.data,entity=this.entity,event=this.sceneEvent(),scene=data.scenes.get(this.activity?.sceneId||event?.sceneId);
    const linkedEvents=related.filter(r=>r.entity.type==='Event'),events=new Map(),excludedBasis=[];
    const cardTitle=normalize(displayTitle(this.activity?.setting?this.activity.label:data.label(entity))),cardYear=scene?.startYear??event?.lo;
    const addEvent=e=>{
      if(entity.type==='Event'&&(e.id===entity.id||normalize(displayTitle(e.title))===cardTitle&&(e.lo==null||cardYear==null||e.lo===cardYear))){
        excludedBasis.push(...(e.basis||[]));return;
      }
      if(e.id!==entity.id)events.set(e.sceneId||`${e.id}:${e.lo??''}:${e.hi??''}`,e);
    };
    if(entity.type==='Event'){
      const place=scene?.place?.label||event?.placeLabel,year=scene?.startYear??event?.lo;
      if(place&&Number.isInteger(year))for(const e of data.events){
        const otherPlace=data.scenes.get(e.sceneId)?.place?.label||e.placeLabel;
        if(otherPlace===place&&Math.abs(e.lo-year)<=5)addEvent(e);
      }
    }else for(const e of data.eventsFor(entity.id))addEvent(e);
    for(const row of linkedEvents){
      const entries=data.events.filter(e=>e.id===row.entity.id);
      if(entries.length)entries.forEach(addEvent);
      else{
        const date=data.dates.get(row.entity.id)?.[0];
        addEvent({id:row.entity.id,title:data.label(row.entity),lo:date?.lo,hi:date?.hi});
      }
    }
    const allEvents=[...events.values()].map(e=>({...e,placeLabel:data.scenes.get(e.sceneId)?.place?.label||e.placeLabel}));
    const eventRows=mergeEvents(allEvents);
    const places=[];
    const addPlace=(label,entityId,sceneId,event)=>{
      if(!label)return;
      places.push({label,entityId,sceneId,events:event?new Map([[eventKey(event),event]]):new Map()});
    };
    for(const row of related.filter(r=>r.entity.type==='Place'))addPlace(data.label(row.entity),row.entity.id);
    const placeEvents=entity.type==='Event'?(event?[event]:[]):allEvents;
    for(const e of placeEvents){
      const packet=data.scenes.get(e.sceneId);
      addPlace(e.placeLabel||packet?.place?.label,null,e.sceneId,e);
      for(const row of data.relations(e.id).filter(r=>r.entity.type==='Place'))addPlace(data.label(row.entity),row.entity.id,e.sceneId,e);
    }
    addPlace(this.activity?.place||scene?.place?.label,null,this.activity?.sceneId||event?.sceneId,event);
    // 시대 줄의 연도: 장면 → 사건 → 생몰 → 연표 첫 사건 → 현재 연도 (1742년 집단 카드가 현재 연도 1593을 보이던 문제, #197)
    const year=scene?.startYear??event?.lo??data.dates.get(entity.id)?.[0]?.lo??eventRows.find(e=>Number.isInteger(e.lo))?.lo??this.ui.chronicle.year;
    const polities=related.filter(row=>row.entity.type==='Polity'&&row.claims.some(claim=>{
      const {lo,hi}=relationTime(claim);return (lo===null||lo<=year)&&(hi===null||hi>=year);
    })&&(!(data.dates.get(row.entity.id)||[]).some(d=>d.claim.predicate==='syj:activeIn')||
      data.dates.get(row.entity.id).some(d=>d.claim.predicate==='syj:activeIn'&&d.lo<=year&&d.hi>=year)));
    const people=related.filter(r=>r.entity.type==='Person');
    const section=(id,title,rows)=>({id,title,rows});
    return [section('people','관계',people),
      {...section('events','연표',eventRows),basis:excludedBasis},
      section('places','장소',mergePlaces(places)),
      // 시대 이름을 먼저, 그 다음 관련 나라·집단(적군 포함 — 관계 이름으로 구분)
      section('era','시대',[{label:eraAt(year)[1]+(Number.isFinite(year)?` · ${yearLabel(year)}`:'')},...polities])];
  }
  relationGroups(rows){
    const groups=new Map();
    for(const row of rows){
      const names=new Set((row.relationClaims||[]).map(c=>relationName(c,this.entity.id)).filter(Boolean));
      if(row.sharedYears)names.add('같은 사건');
      if(!names.size)names.add('관계');
      for(const name of names){if(!groups.has(name))groups.set(name,[]);groups.get(name).push(row);}
    }
    return [...groups].map(([name,rows])=>({name,rows}));
  }
  relationDates(row){
    return [...new Set([...(row.relationClaims||[]).map(relationDates).filter(Boolean),
      ...[...(row.sharedYears||[])].filter(Number.isInteger).sort((a,b)=>a-b).map(yearLabel)])].join(', ');
  }
  personHtml(row,chip=false){
    const label=this.ui.data.label(row.entity),dates=this.relationDates(row);
    return `<button class="${chip?'atlas-chip':'atlas-story-row'}" data-story-entity="${esc(row.entity.id)}" title="${esc(label)}"><strong>${esc(shortLabel(label))}</strong>${dates?`<small class="atlas-relation-year" title="${esc(dates)}">${esc(dates)}</small>`:''}</button>`;
  }
  eventHtml(row){
    const data=this.ui.data,basePlace=row.placeLabel||data.scenes.get(row.sceneId)?.place?.label||
      data.relations(row.id).filter(r=>r.entity.type==='Place').map(r=>data.label(r.entity)).join(', ')||'장소 미확인';
    const place=[basePlace,...(row.extraPlaces||[]).map(shortLabel)].filter((p,i,a)=>p&&a.indexOf(p)===i).join(', ');
    return `<button class="atlas-story-row atlas-story-event" ${row.sceneId?`data-story-event="${esc(row.sceneId)}"`:`data-story-entity="${esc(row.id)}"`}><strong class="atlas-event-title" title="${esc(row.title)}">${esc(displayTitle(row.title))}</strong><small class="atlas-event-place" title="${esc(place)}">${esc(shortLabel(place))}</small></button>`;
  }
  timelineHtml(rows){
    const groups=new Map();
    for(const row of rows){const year=Number.isInteger(row.lo)?yearLabel(row.lo):'연도 미확인';if(!groups.has(year))groups.set(year,[]);groups.get(year).push(row);}
    const collapse=events=>{const seen=new Map();for(const row of events){const key=normalize(displayTitle(row.title));const prior=seen.get(key);if(prior){prior.extraPlaces=[...(prior.extraPlaces||[]),row.placeLabel].filter(Boolean);continue;}seen.set(key,{...row});}return [...seen.values()];};
    return `<div class="atlas-story-timeline">${[...groups].map(([year,events])=>`<div class="atlas-event-year">${esc(year)}</div><div>${collapse(events).map(row=>this.eventHtml(row)).join('')}</div>`).join('')}</div>`;
  }
  moreHtml(key,count,unit){
    return `<button class="atlas-story-more" data-story-more="${esc(key)}">${count}${unit} 더</button>`;
  }
  sectionHtml(section,summary=false,compact=false){
    const {id,title,rows}=section;
    if(!rows.length)return '';
    let content='';
    if(id==='people'){
      if(summary)content=`<div class="atlas-story-chips">${rows.slice(0,compact?rows.length:5).map(row=>this.personHtml(row,true)).join('')}</div>`;
      else content=this.relationGroups(rows).map(({name,rows},index)=>{
        const key=`people-${index}`,visible=this.more.has(key)?rows:rows.slice(0,8);
        return `<div class="atlas-story-group"><h4>${esc(name)} <span class="atlas-section-count">${rows.length}</span></h4>${visible.map(row=>this.personHtml(row)).join('')}${visible.length<rows.length?this.moreHtml(key,rows.length-visible.length,'명'):''}</div>`;
      }).join('');
    }else if(id==='events'){
      let visible=rows;
      if(summary&&!compact){
        const current=this.sceneEvent(),year=current?.lo??this.ui.chronicle.year;
        visible=[...rows].sort((a,b)=>Number(b.sceneId===current?.sceneId&&!!b.sceneId)-Number(a.sceneId===current?.sceneId&&!!a.sceneId)||
          Math.abs((a.lo??Infinity)-year)-Math.abs((b.lo??Infinity)-year)).slice(0,3).sort((a,b)=>(a.lo??Infinity)-(b.lo??Infinity));
      }else if(!summary&&rows.length>12&&!this.more.has(id))visible=rows.slice(0,10);
      content=this.timelineHtml(visible);
      if(!summary&&visible.length<rows.length)content+=this.moreHtml(id,rows.length-visible.length,'건');
    }else if(id==='places'){
      const visible=!summary&&rows.length>12&&!this.more.has(id)?rows.slice(0,10):rows;
      content=visible.map(row=>{
        const action=row.entityId?`data-story-entity="${esc(row.entityId)}"`:`data-story-place="${esc(row.sceneId||'')}"`;
        const years=[...row.events.values()].map(e=>e.lo).filter(Number.isInteger),year=this.ui.chronicle.year;
        const nearest=years.sort((a,b)=>Math.abs(a-year)-Math.abs(b-year)||a-b)[0];
        return `<button class="atlas-story-row" ${action}>${icon('pin')}<span class="atlas-story-text"><strong title="${esc(row.fullLabel)}">${esc(shortLabel(row.label))}</strong><small>사건 ${row.events.size}${nearest!==undefined?` · ${esc(yearLabel(nearest))}`:''}</small></span></button>`;
      }).join('');
      if(visible.length<rows.length)content+=this.moreHtml(id,rows.length-visible.length,'곳');
    }else if(id==='era'){
      content=`<div class="atlas-story-era-row"><span>${esc(rows[0].label)}</span>${rows.slice(1).map(row=>{
        const label=this.ui.data.label(row.entity);
        return `<button class="atlas-chip" data-story-entity="${esc(row.entity.id)}" title="${esc(label)}">${esc(shortLabel(label))}</button>`;
      }).join('')}</div>`;
    }
    const limit=id==='people'?5:3;
    if(summary&&!compact&&['people','events'].includes(id)&&rows.length>limit)content+=`<button class="atlas-story-more" data-story-tab="${id}">${title} ${rows.length} 모두 보기 ${icon('right')}</button>`;
    return `<section class="atlas-story-section" data-story-section="${id}">${summary?`<h3>${title} <span class="atlas-section-count">${rows.length}</span></h3>`:''}${content}</section>`;
  }
  updateDescription(){
    const description=this.pane.querySelector?.('.atlas-story-description'),button=this.pane.querySelector?.('[data-story-expand]');
    if(!description||!button)return;
    description.classList.remove('is-expanded');
    const overflows=description.scrollHeight>description.clientHeight+1;
    description.classList.toggle('is-expanded',!!this.expanded);
    button.hidden=!overflows;button.textContent=this.expanded?'접기':'더 보기';button.setAttribute('aria-expanded',String(!!this.expanded));
  }
  render(){
    if(!this.entity)return;
    const scrollTop=this.pane.querySelector?.('.atlas-story-body')?.scrollTop||0;
    const ui=this.ui,data=ui.data,entity=this.entity,activity=this.activity,event=this.sceneEvent(),scene=data.scenes.get(activity?.sceneId||event?.sceneId),name=activity?.setting?activity.label:data.label(entity);
    const related=this.relatedRows(),sections=this.sections(related),claims=data.subjects.get(entity.id)||[];
    const role=scene?.participants?.find(p=>data.canonicalId(p.entityId)===entity.id&&(p.claimIds||[]).some(id=>data.claims.has(id)));
    const description=activity?.summary||data.description(entity.id)||(entity.type==='Event'?scene?.summary:'');
    const personRole=roleLabel(activity?.role||role?.role,scene?.startYear??activity?.year??ui.chronicle?.year);
    const breadcrumb=entity.type==='Person'?data.datesLabel(entity.id):activity?.narrative?'설화·전승':activity?.setting?yearLabel(ui.chronicle.year):event?yearLabel(event.lo):data.datesLabel(entity.id);
    const image=aiImageFor({entityId:entity.id,sceneId:activity?.sceneId||(entity.type==='Event'?event?.sceneId:null)});
    const imageFigure=image?`<figure class="atlas-ai-image"><a class="atlas-ai-image-link" href="${esc(image.src)}" target="_blank" rel="noopener"><img loading="lazy" decoding="async" src="${esc(ui.runtime?.()?.engine?.quality==='low'?image.preview:image.src)}" alt="${esc(image.alt)}" width="${esc(image.width)}" height="${esc(image.height)}"><span class="atlas-ai-badge atlas-ai-overlay" title="${esc(image.notice)}">AI 상상도</span></a></figure>`:'';
    const lists=sections.filter(s=>s.id!=='era'),compact=lists.reduce((sum,s)=>sum+s.rows.length,0)<=6;
    if(compact||!lists.some(s=>s.id===this.tab&&s.rows.length))this.tab='summary';
    const tabs=compact?'':`<nav class="atlas-story-tabs" aria-label="이야기 목록">${[{id:'summary',title:'요약'},...lists.filter(s=>s.rows.length).sort((a,b)=>['events','people','places'].indexOf(a.id)-['events','people','places'].indexOf(b.id))].map(s=>`<button class="atlas-story-tab" data-story-tab="${s.id}" aria-pressed="${this.tab===s.id}">${s.title}${s.rows?` <span>${s.rows.length}</span>`:''}</button>`).join('')}</nav>`;
    const eventSection=lists.find(s=>s.id==='events');
    const evidence=[...new Map([...related.flatMap(r=>r.claims),...(activity?.claimIds||[]).map(id=>data.claims.get(id)).filter(Boolean),...claims,...(eventSection.basis||[]),...eventSection.rows.flatMap(e=>e.basis||[])].map(c=>[c.id,c])).values()];
    const details=`<details class="atlas-story-evidence"><summary>${icon('event')}출처와 지도 위치</summary>${evidence.map(c=>`<button data-story-claim="${esc(c.id)}"><span>${esc(c.quote||c.sourceLabel||'출처 기록')}</span><small>${esc(sourceName(c.sourceLabel))} ↗</small></button>`).join('')||'<p class="atlas-muted">연결된 출처가 없어요.</p>'}${activity?.placement?`<div class="atlas-placement-note"><h4>지도 위치</h4><p>${esc(activity.placement)}</p></div>`:''}</details>`;
    this.pane.innerHTML=`<header><button class="atlas-story-back" data-story-back>${icon('left')}<span>${this.history.length?'이전으로':'지도로 가기'}</span></button><button class="atlas-icon" data-close aria-label="이야기 닫기">${icon('close')}</button></header>
      <div class="atlas-story-body"><div class="atlas-story-hero">${imageFigure}<div><p class="atlas-breadcrumb">${typeName(entity.type,entity)}${breadcrumb&&breadcrumb!=='연도 미확인'?' · '+esc(breadcrumb):''}</p><h2>${esc(entity.type==='Event'?displayTitle(name):name)}</h2>${personRole?`<p class="atlas-role" title="${esc(personRole)}">${esc(personRole)}</p>`:''}</div></div>
      ${description?`<p id="atlasStoryDescription" class="atlas-description atlas-story-description">${esc(description)}</p><button class="atlas-story-more" data-story-expand aria-controls="atlasStoryDescription" aria-expanded="false" hidden>더 보기</button>`:'<p class="atlas-muted">이 항목에 연결된 기록과 관계를 보세요.</p>'}
      ${['Person','Place'].includes(entity.type)&&entity.aliases?.length?`<p class="atlas-story-aliases">다른 이름: ${entity.aliases.map(esc).join(', ')}</p>`:''}
      ${activity?.narrative?`<p class="atlas-muted">이야기 속 시기: ${esc(activity.narrative.storyTime.label)}<br>기록된 시기: ${esc(activity.narrative.recordingTime.label)}</p>`:''}
      ${this.sectionHtml(sections.find(s=>s.id==='era'))}${tabs}
      ${this.tab==='summary'?lists.filter(s=>compact||s.id!=='places').map(s=>this.sectionHtml(s,true,compact)).join('')+details:this.sectionHtml(lists.find(s=>s.id===this.tab))}
      ${activity?.missingClaimsNote?`<p class="atlas-muted activity-missing-claims">${esc(activity.missingClaimsNote)}</p>`:''}</div>
      ${ui.chat?`<footer><button class="atlas-primary" data-story-chat>${icon('star')}이 이야기 더 물어보기</button></footer>`:''}`;
    const body=this.pane.querySelector?.('.atlas-story-body');if(body)body.scrollTop=scrollTop;
    this.descriptionObserver?.disconnect();this.updateDescription();
    const paragraph=this.pane.querySelector?.('.atlas-story-description');
    if(paragraph&&typeof ResizeObserver!=='undefined'){this.descriptionObserver=new ResizeObserver(()=>this.updateDescription());this.descriptionObserver.observe(paragraph);}
  }
}
