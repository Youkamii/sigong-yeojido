import {escapeHtml as esc} from './html.js';
import {loadChronicle} from './chronicle-load.js';
import {EventTimeline} from './event-timeline.js';
import {isHistoricalSetting} from './chronicle-sites.js';

const sourceHost=source=>{try{return new URL(source.resource||'').hostname;}catch{return '';}};
const publicRecord=source=>{
  const host=sourceHost(source);
  return ['archives.go.kr','khs.go.kr','cha.go.kr','pa.go.kr','i815.or.kr','visitkorea.or.kr','grandculture.net','korea.kr','kari.re.kr','junggu.seoul.go.kr']
    .some(domain=>host===domain||host.endsWith('.'+domain));
};
export const REFERENCE_GROUPS = [
  {label:'한국민족문화대백과사전', matches:s=>s.sourceGroup==='한국민족문화대백과사전'||sourceHost(s)==='encykorea.aks.ac.kr'||s.id.includes('encykorea')||s.id.startsWith('src-aks-')},
  {label:'삼국사기', matches:s=>s.id==='src-samguksagi'},
  {label:'고려사', matches:s=>s.id==='src-goryeosa'},
  {label:'조선왕조실록', matches:s=>s.id.startsWith('src-sillok-')},
  {label:'국가유산·공공기록', matches:s=>publicRecord(s)||['src-khs-','src-presidential-','src-kto-','src-i815-'].some(prefix=>s.id.startsWith(prefix))},
];
export const yearLabel = y => y < 0 ? `기원전 ${-y}년` : `${y}년`;
export const entityLabel = e => e.label.replace(/\s*\([\u3400-\u9fff\s]+\)/g,'').replace(e.type==='Person'?/\s*·\s*\d+년.*$/:/$^/,'').replace(/\s*\([^)]*민족문화대백과[^)]*\)/g,part=>{
  const polity=part.match(/조선|고려|백제|신라|발해/);return polity?` (${polity[0]})`:'';
}).trim();
const shortPredicate = p=>p.replace('syj:','');
const ACTIVITY = new Map([['livedIn','생존'],['reignedIn','재위'],['activeIn','활동'],['appearsIn','등장']]);
const activityLabel=(predicate,claim)=>predicate==='appearsIn'&&claim.note?.startsWith('전승 연대')?'전승 연대':ACTIVITY.get(predicate);
const EVENT_WORDS = {foundedIn:'건국',establishedIn:'설립',proclaimedIn:'선포',accededIn:'즉위'};
const RELATION_WORDS = {hasParticipant:'참여',participatedIn:'참여 사건',tookPlaceAt:'장소',occurredAt:'장소',
  hasSetting:'전승의 무대',hasCharacter:'전승 속 등장인물',
  isKingOf:'나라',memberOf:'소속',affiliatedWith:'소속',hasParent:'부모',childOf:'부모',parentOf:'자녀',
  foundedBy:'건국자',ledBy:'이끈 인물',hasFounder:'설립자',sameEntityAs:'같다고 보는 이름'};
const bounded = p=>Number.isInteger(p.lo)&&Number.isInteger(p.hi)&&p.lo!==0&&p.hi!==0;

export function datedClaims(data){
  const conversions=new Map();
  for(const c of data.claims){
    if(c.predicate==='syj:convertsTo'&&c.object.kind==='year'){
      const rows=conversions.get(c.subject)||[];rows.push(c);conversions.set(c.subject,rows);
    }
  }
  const result=[];
  for(const claim of data.claims){
    const o=claim.object;
    if(o.kind==='year'&&claim.predicate!=='syj:convertsTo')result.push({claim,lo:o.value,hi:o.value,basis:[claim]});
    if(o.kind!=='time')continue;
    const lo=o.earliest??o.year,hi=o.latest??o.year;
    if(Number.isInteger(lo)&&Number.isInteger(hi))result.push({claim,lo,hi,basis:[claim]});
    for(const conversion of (conversions.get(o.id)||[]).filter(c=>c.fromSource===claim.fromSource))result.push({claim,lo:conversion.object.value,
      hi:conversion.object.value,basis:[claim,conversion]});
  }
  return result.filter(bounded);
}

export function contextAt(data,year,span=50){
  const entities=new Map(data.entities.map(e=>[e.id,e]));
  const dates=datedClaims(data),people=new Map(),polities=new Map(),events=[];
  const from=year-Math.floor(span/2),to=year+Math.ceil(span/2);
  const addPerson=(entity,period)=>{
    const row=people.get(entity.id)||{...entity,periods:[],relations:[]};
    row.periods.push(period);people.set(entity.id,row);
  };
  for(const d of dates){
    const entity=entities.get(d.claim.subject),predicate=shortPredicate(d.claim.predicate);
    if(entity?.type==='Person'&&ACTIVITY.has(predicate)&&d.lo<=year&&d.hi>=year)
      addPerson(entity,{...d,label:activityLabel(predicate,d.claim)});
    if(entity?.type==='Polity'&&predicate==='activeIn'&&d.lo<=year&&d.hi>=year)
      polities.set(entity.id,{...entity,period:d,basis:d.basis});
    if(entity?.type==='Event'||entity?.type==='Polity'&&EVENT_WORDS[predicate]){
      events.push({...entity,...d,title:entity.label+(entity.type==='Polity'?` · ${EVENT_WORDS[predicate]}`:''),
        current:d.lo<=year&&d.hi>=year});
    }
  }
  const byClaim=new Map(data.claims.map(claim=>[claim.id,claim]));
  const curatedEvents=[];
  for(const scene of data.scenePackets||[]){
    if(!Number.isInteger(scene.startYear)||!Number.isInteger(scene.endYear))continue;
    const ids=[...scene.dateClaimIds,...scene.actionClaimIds],entity=entities.get(scene.eventId);
    if(!entity||entity.type==='Narrative'||scene.narrativeType||!ids.length||ids.some(id=>!byClaim.has(id)))continue;
    const setting=isHistoricalSetting(scene);
    curatedEvents.push({...entity,sceneId:scene.id,placeLabel:scene.place?.label,lo:scene.startYear,hi:scene.endYear,claim:byClaim.get(scene.dateClaimIds[0]),
      basis:[...new Set(ids)].map(id=>byClaim.get(id)),title:scene.title,setting,
      current:setting?scene.startYear===year:scene.startYear<=year&&scene.endYear>=year});
  }
  for(let i=events.length-1;i>=0;i--)if(curatedEvents.some(s=>s.id===events[i].id&&s.lo<=events[i].lo&&s.hi>=events[i].hi))events.splice(i,1);
  events.push(...curatedEvents);
  // A lifespan must have both ends from the same source. Reign is a separate period.
  const births=dates.filter(d=>d.claim.predicate==='syj:bornIn');
  for(const birth of births){
    const entity=entities.get(birth.claim.subject);
    if(entity?.type!=='Person')continue;
    for(const death of dates.filter(d=>d.claim.predicate==='syj:diedIn'&&d.claim.subject===entity.id
      &&d.claim.fromSource===birth.claim.fromSource)){
      if(birth.hi<=year&&death.lo>=year)addPerson(entity,{lo:birth.lo,hi:death.hi,label:'생몰',
        dateLabel:`${yearLabel(birth.lo)}${birth.lo!==birth.hi?'~'+yearLabel(birth.hi):''} – ${yearLabel(death.lo)}${death.lo!==death.hi?'~'+yearLabel(death.hi):''}`,
        claim:birth.claim,basis:[...birth.basis,...death.basis]});
    }
  }
  // Participation makes a person discoverable; only an activity's evidence can place them.
  for(const event of events.filter(e=>e.type==='Event'&&e.current)){
    for(const claim of data.claims){
      if(claim.object.kind!=='entity')continue;
      const lo=Math.max(event.lo,claim.validFrom??event.lo),hi=Math.min(event.hi,claim.validTo??event.hi);
      if(year<lo||year>hi)continue;
      const id=claim.subject===event.id&&['syj:hasParticipant','syj:ledBy'].includes(claim.predicate)?claim.object.id
        :claim.object.id===event.id&&claim.predicate==='syj:participatedIn'?claim.subject:null;
      const person=entities.get(id);if(person?.type!=='Person')continue;
      addPerson(person,{lo,hi,label:'사건 참여',claim,basis:[claim,...event.basis],eventId:event.id});
    }
  }
  for(const person of people.values()){
    // A lifetime cannot date a later office or membership.
    person.relations=data.claims.filter(c=>c.subject===person.id&&c.object.kind==='entity'
      &&c.predicate==='syj:isKingOf'&&person.periods.some(p=>p.claim.predicate==='syj:reignedIn'
        &&p.claim.fromSource===c.fromSource)).filter(c=>{
          const periods=dates.filter(d=>d.claim.subject===c.object.id&&d.claim.predicate==='syj:activeIn');
          return !periods.length||periods.some(d=>d.lo<=year&&d.hi>=year);
        });
    for(const relation of person.relations){
      const polity=entities.get(relation.object.id);
      if(polity&&!polities.has(polity.id))polities.set(polity.id,{...polity,basis:[relation],ruler:person});
    }
  }
  const unique=new Map();
  for(const event of events){
  const key=[event.id,event.lo,event.hi,event.sceneId||''].join('|');
    if(unique.has(key))unique.get(key).basis.push(...event.basis);else unique.set(key,{...event,basis:[...event.basis]});
  }
  const grouped=[...unique.values()].filter(e=>!events.some(other=>other!==e&&other.id===e.id&&other.sceneId===e.sceneId
    &&other.claim.fromSource===e.claim.fromSource&&other.claim.predicate===e.claim.predicate
    &&other.lo<=e.lo&&other.hi>=e.hi&&(other.lo<e.lo||other.hi>e.hi)));
  grouped.sort((a,b)=>a.lo-b.lo||a.title.localeCompare(b.title,'ko'));
  const nearby=grouped.filter(e=>e.lo<=to&&(e.setting?e.lo:e.hi)>=from);
  const settings=grouped.filter(e=>e.setting&&e.lo<=year&&e.hi>=year);
  const eventYears=[...new Set(grouped.flatMap(e=>e.setting?[e.lo]:[e.lo,e.hi]))].sort((a,b)=>a-b);
  return {year,from,to,entities,people:[...people.values()].sort((a,b)=>a.label.localeCompare(b.label,'ko')),
    polities:[...polities.values()],events:nearby,settings,eventYears,allEvents:grouped,
    previous:eventYears.filter(y=>y<year).at(-1),next:eventYears.find(y=>y>year)};
}

export class Chronicle {
  constructor(host,controls,callbacks){
    this.host=host;this.controls=controls;this.callbacks=callbacks;
    this.data={entities:[],claims:[]};this.year=1593;this.span=50;this.sequence=0;this.loading=true;
    controls.innerHTML=`<div class="time-heading"><div class="time-year"><label for="historyYear" data-calendar>연도 입력</label>
      <input id="historyYear" aria-label="탐색 연도" aria-describedby="yearInputHelp" type="number" value="1593" min="-2500" max="2100" step="1" required><span>년</span><button data-go-year>이동</button><small id="yearInputHelp">Enter로 이동 · 기원전은 −500처럼 입력</small></div>
      <div class="time-actions"><button data-previous aria-label="이전 사건 연도로">← 이전 사건</button>
      <button data-play aria-label="시간 재생">▶ 재생</button><button data-next aria-label="다음 사건 연도로">다음 사건 →</button></div>
      <label class="time-span">주변 사건 <select aria-label="사건 탐색 범위"><option value="20">20년</option><option value="50" selected>50년</option><option value="100">100년</option></select></label></div>
      <div class="time-slider"><span>기원전 2500</span><input type="range" min="-2500" max="2025" value="1593" aria-label="역사 시간 이동"><span>2025</span></div>
      <div class="event-strip"></div>`;
    this.timeline=new EventTimeline(controls.querySelector('.event-strip'),{yearLabel,
      preview:year=>this.previewYear(year),commit:()=>this.finishScrub(),select:entry=>this.showEvent(entry)});
    const yearInput=controls.querySelector('[type=number]');
    const goYear=()=>{if(yearInput.reportValidity()){this.stopPlay();if(yearInput.valueAsNumber!==this.year)this.chooseYear(yearInput.valueAsNumber);}};
    yearInput.onchange=goYear;
    yearInput.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();goYear();}};
    controls.querySelector('[data-go-year]').onclick=goYear;
    const slider=controls.querySelector('[type=range]');
    slider.oninput=e=>this.previewYear(+e.target.value);
    slider.onchange=()=>this.finishScrub();
    controls.querySelector('select').onchange=e=>{this.span=+e.target.value;this.render();};
    controls.querySelector('[data-previous]').onclick=()=>this.chooseYear(this.context?.previous);
    controls.querySelector('[data-next]').onclick=()=>this.chooseYear(this.context?.next);
    controls.querySelector('[data-play]').onclick=()=>this.togglePlay();
    controls.querySelectorAll('[data-era]').forEach(b=>b.onclick=()=>{this.stopPlay();this.chooseYear(+b.dataset.era);});
    host.onclick=event=>{
      const jump=event.target.closest('[data-jump-year]');if(jump){this.chooseYear(+jump.dataset.jumpYear);return;}
      const proof=event.target.closest('[data-chronicle-claim]');
      if(proof){const c=this.data.claims.find(c=>c.id===proof.dataset.chronicleClaim);if(c)this.callbacks.claim(c);return;}
      const entity=event.target.closest('[data-chronicle-entity]');if(entity){
        const scene=entity.dataset.chronicleScene&&this.context.allEvents.find(e=>e.sceneId===entity.dataset.chronicleScene);
        if(scene)this.showEvent(scene);else this.showEntity(entity.dataset.chronicleEntity);
      }
      if(event.target.closest('[data-context-back]'))this.render();
    };
    this.render();
  }
  chooseYear(year){
    clearTimeout(this.scrubTimer);this.pendingYear=null;
    if(!Number.isInteger(year)||year<-2500||year>2100)return;
    if(year===0)year=this.year<0?1:-1;
    if(year===this.year)return;
    this.callbacks.year(year);
  }
  previewYear(year){
    if(!Number.isInteger(year)||year<-2500||year>2100)return;
    if(year===0)year=this.year<0?1:-1;
    this.stopPlay();clearTimeout(this.scrubTimer);this.pendingYear=year;
    this.controls.querySelector('[type=number]').value=year;this.controls.querySelector('[type=range]').value=year;
    this.timeline.setYear(year);this.scrubTimer=setTimeout(()=>this.finishScrub(),120);
  }
  finishScrub(){const year=this.pendingYear;clearTimeout(this.scrubTimer);this.pendingYear=null;if(year!==this.year)this.chooseYear(year);}
  showEvent(event){
    this.stopPlay();this.chooseYear(this.year>=event.lo&&this.year<=event.hi?this.year:event.lo);
    this.callbacks.scene?.(event.sceneId);this.showEntity(event.id);
  }
  setYear(year){this.year=year;this.render();}
  stopPlay(){clearInterval(this.timer);this.timer=null;const button=this.controls.querySelector('[data-play]');button.textContent='▶ 재생';button.setAttribute('aria-pressed','false');button.setAttribute('aria-label','시간 재생');}
  togglePlay(){
    if(this.timer){this.stopPlay();return;}
    this.controls.querySelector('[data-play]').textContent='Ⅱ 멈춤';
    this.controls.querySelector('[data-play]').setAttribute('aria-pressed','true');
    this.controls.querySelector('[data-play]').setAttribute('aria-label','시간 재생 멈춤');
    this.timer=setInterval(()=>{if(this.year>=2025){this.stopPlay();return;}this.chooseYear(this.year+1);},1200);
  }
  async refresh(){
    const seq=++this.sequence,filters=this.callbacks.filters();this.loading=true;this.error='';
    this.requestController?.abort();this.requestController=new AbortController();
    this.data={entities:[],claims:[]};this.render();
    try{
      const data=await loadChronicle([...filters.sources],filters.origin,this.requestController.signal);
      if(seq!==this.sequence)return;
      this.data=data;
    }catch(e){if(seq!==this.sequence)return;this.error=e.message;}
    this.loading=false;this.render();
  }
  relations(id){
    const entities=new Map(this.data.entities.map(e=>[e.id,e]));
    return this.data.claims.filter(c=>c.object.kind==='entity'&&(c.subject===id||c.object.id===id))
      .map(c=>({claim:c,target:entities.get(c.subject===id?c.object.id:c.subject)})).filter(x=>x.target);
  }
  showEntity(id){
    this.stopPlay();const entity=this.data.entities.find(e=>e.id===id);if(!entity)return;
    const dates=datedClaims(this.data).filter(d=>d.claim.subject===id);
    const currentEvent=this.context?.allEvents.some(e=>e.id===id&&e.current);
    if(entity.type==='Event'&&dates.length&&!currentEvent&&!dates.some(d=>d.lo<=this.year&&d.hi>=this.year)){
      const nearest=[...dates].sort((a,b)=>Math.abs(a.lo-this.year)-Math.abs(b.lo-this.year))[0];
      this.chooseYear(nearest.lo);
    }
    this.callbacks.entity(id);
    const activity=this.callbacks.activity?.(id);
    if(this.callbacks.presentEntity?.(entity,activity))return;
    const activityClaims=(activity?.claimIds||[]).map(id=>this.data.claims.find(c=>c.id===id)).filter(Boolean);
    const descriptions=this.data.claims.filter(c=>c.subject===id&&['syj:describedAs','syj:hasTitle'].includes(c.predicate));
    this.host.innerHTML=`<button class="context-back" data-context-back>← ${yearLabel(this.year)}로 돌아가기</button>
      <div class="context-kicker">${{Person:'인물',Event:'사건',Narrative:'설화·전승',Polity:'나라',Place:'장소'}[entity.type]||'관련 항목'}</div><h2>${esc(activity?.siteBackground?activity.place:entityLabel(entity))}</h2>
      ${activity?`<section class="selected-activity"><h3>${activity.narrative?'이야기의 무대':activity.siteBackground?'성곽 배경 · 추정':yearLabel(this.year)}${activity.place?' · '+esc(activity.place):''}</h3>
        ${activity.role?`<p class="activity-role">${esc(activity.role)}</p>`:''}
        <p class="activity-summary">${esc(activity.summary||'이 시기에 기록된 활동입니다.')}</p>
        ${activity.narrative?`<dl class="narrative-times"><dt>이야기 속 시기</dt><dd>${esc(activity.narrative.storyTime.label)}</dd><dt>관련 문헌·기록 시기</dt><dd>${esc(activity.narrative.recordingTime.label)}</dd></dl><p class="activity-location">이야기와 기록 시기는 다릅니다. 이 표시가 선택한 연도의 실제 사건을 뜻하지는 않습니다.</p>`:''}
        ${activity.narrative?'':`<p class="activity-location">${esc(activity.placement)}</p>`}
        ${activity.coordinates?`<p class="activity-coordinates">${esc(activity.coordinates)}</p>`:''}
        ${activity.sides.map(s=>`<p class="activity-side"><strong>${esc(s.label)}</strong> · ${esc(s.role)}</p>`).join('')}
        <details><summary>활동·장소의 근거 ${activityClaims.length}개</summary>${activityClaims.map(c=>`<button class="context-proof" data-chronicle-claim="${esc(c.id)}">${esc(c.quote)} ↗</button>`).join('')}
        ${activity.coordinateNote?`<p>${esc(activity.coordinateNote)}</p>`:''}${activity.displayBasis?`<p>${esc(activity.displayBasis)}</p>`:''}
        ${activity.sources.map(s=>`<a class="context-proof" href="${esc(s.url)}" target="_blank" rel="noopener">위치 자료 · ${esc(s.title)} ↗</a>`).join('')}</details>
        ${activity.events.length?`<div class="activity-episodes">${activity.events.map(e=>`<button data-chronicle-entity="${esc(e.entityId)}">${esc(e.label)} →</button>`).join('')}</div>`:''}
        ${(activity.participants||[]).length?`<div class="activity-participants">${activity.participants.map(p=>`<button class="relation-chip" data-chronicle-entity="${esc(p.entityId)}">${esc(p.label)} · ${esc(p.role)}${p.presence!=='on-site'?' (관련)':''}</button>`).join('')}</div>`:''}
      </section>`:''}
      ${!activity?.narrative&&!activity?.siteBackground&&this.callbacks.placement?.(id)?`<p class="scene-placement">${esc(this.callbacks.placement(id))} · 건물·길·인물 외형은 상징 모형입니다.</p>`:''}
      ${activity?.narrative?'':descriptions.slice(0,2).map(c=>`<p class="entity-description">${esc(c.object.value||'')}</p>`).join('')}
      ${activity?.narrative||activity?.siteBackground?'':`<div class="context-section"><h3>시간</h3>${dates.map(d=>`<div class="entity-date"><button data-jump-year="${d.lo}">${yearLabel(d.lo)}${d.lo!==d.hi?' – '+yearLabel(d.hi):''}</button>
        <span>${esc(activityLabel(shortPredicate(d.claim.predicate),d.claim)||({bornIn:'출생',diedIn:'사망',occurredIn:'사건',foundedIn:'건국'})[shortPredicate(d.claim.predicate)]||'기록')}</span>
        ${d.basis.map(c=>`<button class="context-proof" data-chronicle-claim="${esc(c.id)}">${esc(c.sourceLabel)} ↗</button>`).join('')}</div>`).join('')||'<p class="context-empty">날짜 근거가 아직 연결되지 않았습니다.</p>'}</div>`}
      <div class="context-section"><h3>관련 인물·사건·장소</h3><p class="context-empty">이 항목의 전체 기록입니다. 관계가 있었던 시기는 각 근거에서 확인할 수 있습니다.</p>${this.relations(id).map(({claim,target})=>`<div class="relation-row"><button data-chronicle-entity="${esc(target.id)}">${esc(entityLabel(target))}</button>
        <small>${esc(RELATION_WORDS[shortPredicate(claim.predicate)]||'관련 기록')}</small><button class="context-proof" data-chronicle-claim="${esc(claim.id)}">근거 ↗</button></div>`).join('')||'<p class="context-empty">연결 근거가 아직 없습니다.</p>'}</div>`;
  }
  render(){
    const c=contextAt({...this.data,scenePackets:this.callbacks.scenePackets?.()||[]},this.year,this.span);this.context=c;
    this.timeline.setEvents(this.callbacks.timelineEvents?.(c.allEvents)||c.allEvents);this.timeline.setYear(this.year);
    this.controls.querySelector('[type=number]').value=this.year;
    this.controls.querySelector('[type=range]').value=this.year;
    this.controls.querySelector('[data-calendar]').textContent='연도 입력';
    this.controls.querySelector('[data-previous]').disabled=c.previous==null;
    this.controls.querySelector('[data-next]').disabled=c.next==null;
    this.controls.querySelectorAll('[data-era]').forEach(b=>b.classList.toggle('on',Math.abs(+b.dataset.era-this.year)<10));
    const status=this.error||(this.loading?'이 시대의 인물과 사건을 불러오는 중…':'');
    const counts=`인물 ${c.people.length} · 주변 사건 ${c.events.length}`;
    this.host.innerHTML=`<div class="context-kicker">시간 속으로</div><div class="context-title"><h2>${yearLabel(this.year)}</h2><span>${counts}</span></div>
      ${status?`<p role="status" class="context-empty">${esc(status)}</p>`:''}
      ${c.polities.length?`<section class="context-polities" aria-label="이때의 나라와 세력">${c.polities.map(p=>`<button class="relation-chip" data-chronicle-entity="${esc(p.id)}">${esc(entityLabel(p))}${p.ruler?' · '+esc(entityLabel(p.ruler))+' 재위':''}</button>`).join('')}</section>`:''}
      ${c.events.some(e=>e.current)?`<section class="current-events"><h3>이 해의 사건</h3>${c.events.filter(e=>e.current).map(e=>`<button data-chronicle-entity="${esc(e.id)}" data-chronicle-scene="${esc(e.sceneId||'')}">${esc(e.title)} <span>→</span></button>`).join('')}</section>`:''}
      ${c.settings.length?`<details class="context-section era-sites"><summary>이때의 도시·시설 ${c.settings.length}곳</summary>${c.settings.map(e=>`<button class="period-site" data-chronicle-entity="${esc(e.id)}" data-chronicle-scene="${esc(e.sceneId)}">${esc(e.title)}</button>`).join('')}</details>`:''}
      <details class="context-section era-people"><summary>동시대 인물 ${c.people.length}명 · 생존·재위·활동</summary><div class="section-heading"><h3>이때의 사람들</h3></div>
      ${c.people.map(p=>this.personCard(p,c)).join('')||(!status?'<p class="context-empty">선택한 사료에 이 해의 생존·활동 근거가 연결된 인물이 없습니다.</p>':'')}
      </details><section class="context-section"><div class="section-heading"><h3>이 시기의 사건</h3><span>${yearLabel(c.from)} – ${yearLabel(c.to)}</span></div>
      <div class="event-sequence">${c.events.map(e=>`<article class="period-event${e.current?' current':''}"><button class="event-year" data-jump-year="${e.lo}">${yearLabel(e.lo)}${e.lo!==e.hi?' – '+yearLabel(e.hi):''}</button>
        <button class="event-title" data-chronicle-entity="${esc(e.id)}" data-chronicle-scene="${esc(e.sceneId||'')}">${esc(e.title)}</button>
        ${this.relations(e.id).filter(x=>['Person','Polity','Place'].includes(x.target.type)).slice(0,6).map(x=>`<button class="relation-chip" data-chronicle-entity="${esc(x.target.id)}">${esc(entityLabel(x.target))}</button>`).join('')}
        ${[...new Map(e.basis.map(b=>[b.fromSource,b])).values()].map(b=>`<button class="context-proof" data-chronicle-claim="${esc(b.id)}">${esc(b.sourceLabel)} ↗</button>`).join('')}</article>`).join('')||(!status?'<p class="context-empty">이 범위에 연결된 사건이 없습니다. 이전·다음 사건으로 이동할 수 있습니다.</p>':'')}</div></section>
      <p class="context-footnote">선택한 사료에 근거가 연결된 항목입니다. 생몰년과 재위·활동 기간을 구별합니다.${this.data.hasMore?' 조회 한도에 도달해 일부만 표시합니다.':''}</p>`;
    this.callbacks.context?.(c);
  }
  personCard(person,context){
    const p=person.periods.find(p=>p.label==='생몰')||person.periods[0];
    const left=Math.max(0,(p.lo-context.from)/this.span*100),right=Math.min(100,(p.hi-context.from)/this.span*100);
    const memberships=[...new Set(person.relations.map(c=>context.entities.get(c.object.id)).filter(Boolean).map(entityLabel))];
    const activity=person.periods.find(p=>p.claim.predicate==='syj:activeIn');
    const events=[...new Map(this.relations(person.id).filter(x=>x.target.type==='Event'
      &&context.events.some(e=>e.id===x.target.id)).map(x=>[x.target.id,x.target])).values()];
    return `<article class="period-person"><div class="person-heading"><button data-chronicle-entity="${esc(person.id)}">${esc(entityLabel(person))}</button><span>${esc(memberships.join(' · '))}</span></div>
      <div class="person-dates">${p.dateLabel||yearLabel(p.lo)+' – '+yearLabel(p.hi)} <span>${p.label}</span></div>
      <div class="life-track" aria-label="${esc(person.label)} ${p.label} ${p.lo}~${p.hi}"><i style="left:${left}%;width:${Math.max(1,right-left)}%"></i><b></b></div>
      ${activity?`<button class="person-activity" data-chronicle-claim="${esc(activity.claim.id)}">${esc(activity.claim.quote)} ↗</button>`:''}
      ${events.length?`<div class="person-events">${events.map(e=>`<button class="relation-chip" data-chronicle-entity="${esc(e.id)}">${esc(entityLabel(e))}</button>`).join('')}</div>`:''}
      <button class="context-proof" data-chronicle-claim="${esc(p.claim.id)}">${esc(p.claim.sourceLabel)} ↗</button></article>`;
  }
}
