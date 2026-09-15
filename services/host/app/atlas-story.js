import {escapeHtml as esc} from './html.js';
import {icon} from './atlas-icons.js';
import {cleanTitle,typeName,relationName,relationDates,relationTime} from './atlas-data.js';
import {yearLabel} from './chronicle.js';
import {eraAt} from './atlas-eras.js';
import {roleLabel} from './chronicle-asset-plan.js';
import {loadAiImages,aiImageFor} from './ai-images.js';

export class AtlasStory{
  constructor(ui){
    this.ui=ui;this.history=[];
    this.pane=document.createElement('aside');this.pane.className='atlas-pane atlas-left atlas-story';this.pane.id='atlasStory';this.pane.setAttribute('aria-label','인물과 사건 이야기');
    ui.registerPanel('story',this.pane);
    loadAiImages().then(data=>{if(data&&this.entity)this.render();});
    this.pane.onclick=e=>{
      if(e.target.closest('[data-story-back]')){this.back();return;}
      if(e.target.closest('[data-story-relations]')){this.mode='relations';this.render();return;}
      if(e.target.closest('[data-story-summary]')){this.mode='summary';this.render();return;}
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
    const candidates=this.entity.type==='Event'?events.filter(e=>e.id===this.entity.id):events;
    return (this.activity?.sceneId&&candidates.find(e=>e.sceneId===this.activity.sceneId))||
      (scene&&candidates.find(e=>e.sceneId===scene))||candidates.find(e=>e.sceneId)||candidates[0];
  }
  relatedRows(){
    const data=this.ui.data,event=this.sceneEvent(),scene=data.scenes.get(this.activity?.sceneId||event?.sceneId);
    const rows=new Map(data.relations(this.entity.id).map(r=>[r.entity.id,{...r,relationClaims:r.claims,role:'',presence:''}]));
    if(this.entity.type==='Event')for(const p of scene?.participants||[]){
      const entity=data.entities.get(p.entityId),claims=(p.claimIds||[]).map(id=>data.claims.get(id)).filter(Boolean);
      if(!entity||!claims.length)continue;
      const row=rows.get(entity.id)||{entity,claims:[]};row.claims=[...new Map([...row.claims,...claims].map(c=>[c.id,c])).values()];row.role=p.role;row.roleYear=scene?.startYear;row.presence=p.presence;rows.set(entity.id,row);
    }
    if(this.entity.type==='Person')for(const e of data.eventsFor(this.entity.id)){
      const packet=data.scenes.get(e.sceneId);
      if(!packet?.participants?.some(p=>p.entityId===this.entity.id&&(p.claimIds||[]).some(id=>data.claims.has(id))))continue;
      for(const p of packet.participants){
        const entity=data.entities.get(p.entityId),claims=(p.claimIds||[]).map(id=>data.claims.get(id)).filter(Boolean);
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
    const linkedEvents=related.filter(r=>r.entity.type==='Event'),events=new Map();
    const addEvent=e=>{if(e.id!==entity.id)events.set(e.sceneId||`${e.id}:${e.lo??''}:${e.hi??''}`,e);};
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
    const eventRows=[...events.values()].sort((a,b)=>(a.lo??Infinity)-(b.lo??Infinity)||a.title.localeCompare(b.title,'ko'));
    const places=new Map(),placeKey=label=>label.normalize('NFKC').replace(/\s+/g,' ').trim();
    const addPlace=(label,entityId,sceneId,title)=>{
      if(!label)return;
      const key=placeKey(label),row=places.get(key)||{label,entityId,sceneId,titles:new Set()};
      row.entityId||=entityId;row.sceneId||=sceneId;
      if(title)row.titles.add(cleanTitle(title));
      places.set(key,row);
    };
    for(const row of related.filter(r=>r.entity.type==='Place'))addPlace(data.label(row.entity),row.entity.id);
    const placeEvents=entity.type==='Event'?(event?[event]:[]):eventRows;
    for(const e of placeEvents){
      const packet=data.scenes.get(e.sceneId);
      addPlace(packet?.place?.label||e.placeLabel,null,e.sceneId,e.title);
      for(const row of data.relations(e.id).filter(r=>r.entity.type==='Place'))addPlace(data.label(row.entity),row.entity.id,e.sceneId,e.title);
    }
    addPlace(this.activity?.place||scene?.place?.label,null,this.activity?.sceneId||event?.sceneId,scene?.title||event?.title);
    const year=scene?.startYear??event?.lo??data.dates.get(entity.id)?.[0]?.lo??this.ui.chronicle.year;
    const polities=related.filter(row=>row.entity.type==='Polity'&&row.claims.some(claim=>{
      const {lo,hi}=relationTime(claim);return (lo===null||lo<=year)&&(hi===null||hi>=year);
    })&&(!(data.dates.get(row.entity.id)||[]).some(d=>d.claim.predicate==='syj:activeIn')||
      data.dates.get(row.entity.id).some(d=>d.claim.predicate==='syj:activeIn'&&d.lo<=year&&d.hi>=year)));
    const people=related.filter(r=>r.entity.type==='Person');
    const section=(id,title,rows)=>({id,title,rows});
    return [section('people','인물 관계',people),
      section('events',entity.type==='Person'?'겪은 사건 연표':entity.type==='Event'?'앞뒤 사건':'사건·역사 관계',eventRows),
      section('places','장소',[...places.values()]),
      // 시대 이름을 먼저, 그 다음 관련 나라·집단(적군 포함 — 관계 이름으로 구분)
      section('era','시대 배경',[{label:eraAt(year)[1]+(Number.isFinite(year)?` · ${yearLabel(year)}`:'')},...polities])];
  }
  sectionHtml(section){
    const data=this.ui.data,all=this.mode==='relations',rows=all?section.rows:section.rows.slice(0,8);
    if(!rows.length)return '';
    const rowHtml=row=>{
      if(section.id==='events'){
        const place=data.scenes.get(row.sceneId)?.place?.label||row.placeLabel||
          data.relations(row.id).filter(r=>r.entity.type==='Place').map(r=>data.label(r.entity)).join(' · ')||'장소 미확인';
        return `<button class="atlas-story-row atlas-story-event" ${row.sceneId?`data-story-event="${esc(row.sceneId)}"`:`data-story-entity="${esc(row.id)}"`}><span class="atlas-event-year">${Number.isInteger(row.lo)?esc(yearLabel(row.lo)):'연도 미확인'}</span><strong class="atlas-event-title">${icon('event')}${esc(cleanTitle(row.title))}</strong><small class="atlas-event-place">${esc(place)}</small></button>`;
      }
      if(section.id==='places'){
        const action=row.entityId?`data-story-entity="${esc(row.entityId)}"`:`data-story-place="${esc(row.sceneId||'')}"`;
        return `<button class="atlas-story-row" ${action}>${icon('pin')}<span class="atlas-story-text"><strong>${esc(row.label)}</strong><small>${esc([...row.titles].join(' · ')||'관련 장소')}</small></span></button>`;
      }
      if(!row.entity)return `<p class="atlas-story-row">${icon('castle')}<strong>${esc(row.label)}</strong></p>`;
      const names=[...new Set((row.relationClaims||[]).map(c=>relationName(c,this.entity.id)).filter(Boolean))];
      if(row.sharedYears)names.push('함께 참여');
      const dates=[...new Set([...(row.relationClaims||[]).map(relationDates).filter(Boolean),...[...(row.sharedYears||[])].sort((a,b)=>a-b).map(yearLabel)])].join(' · ');
      const detail=[names.join(' · ')||(section.id==='people'?'관련 인물':'관련 나라·집단'),roleLabel(row.role,row.roleYear)].filter(Boolean).join(' · ');
      return `<button class="atlas-story-row" data-story-entity="${esc(row.entity.id)}">${icon(section.id==='people'?'person':'castle')}<span class="atlas-story-text"><strong>${esc(data.label(row.entity))}</strong><small>${esc(detail)}</small></span>${dates?`<span class="atlas-relation-year">${esc(dates)}</span>`:''}</button>`;
    };
    return `<section class="atlas-story-section" data-story-section="${section.id}"><h3>${section.title} <span class="atlas-section-count">${section.rows.length}</span></h3>${rows.map(rowHtml).join('')}${rows.length<section.rows.length?`<button class="atlas-section-more" data-story-relations>${section.title} 전체 ${section.rows.length}개 보기 ${icon('right')}</button>`:''}</section>`;
  }
  render(){
    if(!this.entity)return;
    const ui=this.ui,data=ui.data,entity=this.entity,activity=this.activity,event=this.sceneEvent(),scene=data.scenes.get(activity?.sceneId||event?.sceneId),name=activity?.setting?activity.label:data.label(entity);
    const related=this.relatedRows(),sections=this.sections(related),dates=data.datesLabel(entity.id),claims=data.subjects.get(entity.id)||[];
    const role=scene?.participants?.find(p=>p.entityId===entity.id&&(p.claimIds||[]).some(id=>data.claims.has(id)));
    const description=activity?.summary||data.description(entity.id)||(entity.type==='Event'?scene?.summary:'');
    const personRole=roleLabel(activity?.role||role?.role,scene?.startYear??activity?.year??ui.chronicle?.year);
    const relationMode=this.mode==='relations';
    const image=aiImageFor({entityId:entity.id,sceneId:activity?.sceneId||(entity.type==='Event'?event?.sceneId:null)});
    const imageFigure=image?`<figure class="atlas-ai-image">
      <a class="atlas-ai-image-link" href="${esc(image.src)}" target="_blank" rel="noopener"><img loading="lazy" decoding="async" src="${esc(ui.runtime()?.engine?.quality==='low'?image.preview:image.src)}" alt="${esc(image.alt)}" width="${esc(image.width)}" height="${esc(image.height)}"><span class="atlas-ai-badge atlas-ai-overlay">${esc(image.label)}</span></a>
      <figcaption><p>${esc(image.notice)}</p></figcaption>
      <details class="atlas-placement-note"><summary>어떻게 만들었나</summary><dl><dt>바탕 자료</dt><dd>${esc(image.basis)}</dd><dt>상상한 부분과 한계</dt><dd>${esc(image.caveats)}</dd><dt>생성 날짜</dt><dd>${esc(image.generatedAt)}</dd><dt>생성 도구</dt><dd>${esc(image.generator)}</dd></dl></details>
    </figure>`:'';
    this.pane.innerHTML=`<header><button class="atlas-story-back" data-story-back>${icon('left')}<span>${relationMode?'이야기로':this.history.length?'이전 이야기':'지도로 돌아가기'}</span></button><button class="atlas-icon" data-close aria-label="이야기 닫기">${icon('close')}</button></header>
      <div class="atlas-story-body"><p class="atlas-breadcrumb">${typeName(entity.type)} <span>›</span> ${esc(activity?.narrative?'설화·전승':activity?.setting?yearLabel(ui.chronicle.year):event?yearLabel(event.lo):dates)}</p>
      <h2>${esc(name)}${relationMode?'과 연결':''}</h2>
      ${imageFigure}
      ${description?`<p class="atlas-description">${esc(description)}</p>`:'<p class="atlas-muted">이 항목에 연결된 기록과 관계를 살펴보세요.</p>'}
      ${entity.type==='Person'?`<p class="atlas-muted">출생 – 사망 · ${esc(dates)}</p>`:''}
      ${personRole?`<p class="atlas-role">${esc(personRole)}</p>`:''}
      ${relationMode?'<p class="atlas-muted">관계를 따라 탐색해 보세요.</p>':''}
      ${activity?.narrative?`<p class="atlas-muted">이야기 속 시기 · ${esc(activity.narrative.storyTime.label)}<br>문헌의 기록 시기 · ${esc(activity.narrative.recordingTime.label)}</p>`:''}
      ${sections.map(section=>this.sectionHtml(section)).join('')}
      ${!relationMode&&related.length?`<button class="atlas-primary atlas-related-button" data-story-relations>관계 따라 보기 <span>${sections.reduce((sum,s)=>sum+s.rows.length,0)}</span>${icon('right')}</button>`:''}
      ${activity?.missingClaimsNote?`<p class="atlas-muted activity-missing-claims">${esc(activity.missingClaimsNote)}</p>`:''}
      <details class="atlas-story-evidence"><summary>${icon('event')}이야기의 출처 보기</summary>${[...new Map([...related.flatMap(r=>r.claims),...(activity?.claimIds||[]).map(id=>data.claims.get(id)).filter(Boolean),...claims,...sections.find(s=>s.id==='events').rows.flatMap(e=>e.basis||[])].map(c=>[c.id,c])).values()].map(c=>`<button data-story-claim="${esc(c.id)}"><span>${esc(c.quote||c.sourceLabel||'출처 기록')}</span><small>${esc(c.sourceLabel||'원문 보기')} ↗</small></button>`).join('')||'<p class="atlas-muted">직접 연결된 출처가 없습니다.</p>'}</details>
      ${activity?.placement?`<details class="atlas-placement-note"><summary>지도 위치 안내</summary><p>${esc(activity.placement)}</p>${activity.coordinateNote?`<p>${esc(activity.coordinateNote)}</p>`:''}</details>`:''}</div>
      ${ui.chat?`<footer><button class="atlas-primary" data-story-chat>${icon('star')}이 이야기 더 물어보기</button></footer>`:''}`;
  }
}
