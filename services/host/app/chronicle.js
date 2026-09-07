import {escapeHtml as esc} from './html.js';

export const REFERENCE_GROUPS = [
  {label:'한국민족문화대백과사전', matches:s=>s.id.includes('encykorea') || s.id.startsWith('src-aks-')},
  {label:'삼국사기', matches:s=>s.id==='src-samguksagi'},
  {label:'고려사', matches:s=>s.id==='src-goryeosa'},
  {label:'조선왕조실록', matches:s=>s.id.startsWith('src-sillok-')},
  {label:'국가유산포털', matches:s=>s.id.startsWith('src-khs-')},
];
export const yearLabel = y => y < 0 ? `기원전 ${-y}년` : `${y}년`;
export const entityLabel = e => e.label.replace(/\s*\(민족문화대백과[^)]*\)/g,'').trim();
const shortPredicate = p=>p.replace('syj:','');
const ACTIVITY = new Map([['livedIn','생존'],['reignedIn','재위'],['activeIn','활동'],['appearsIn','등장']]);
const EVENT_WORDS = {foundedIn:'건국',establishedIn:'설립',proclaimedIn:'선포',accededIn:'즉위'};
const RELATION_WORDS = {hasParticipant:'참여',participatedIn:'참여 사건',tookPlaceAt:'장소',occurredAt:'장소',
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
    for(const conversion of conversions.get(o.id)||[])result.push({claim,lo:conversion.object.value,
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
      addPerson(entity,{...d,label:ACTIVITY.get(predicate)});
    if(entity?.type==='Polity'&&predicate==='activeIn'&&d.lo<=year&&d.hi>=year)
      polities.set(entity.id,{...entity,period:d,basis:d.basis});
    if(entity?.type==='Event'||entity?.type==='Polity'&&EVENT_WORDS[predicate]){
      events.push({...entity,...d,title:entity.label+(entity.type==='Polity'?` · ${EVENT_WORDS[predicate]}`:''),
        current:d.lo<=year&&d.hi>=year});
    }
  }
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
  for(const person of people.values()){
    // A lifetime cannot date a later office or membership.
    person.relations=data.claims.filter(c=>c.subject===person.id&&c.object.kind==='entity'
      &&c.predicate==='syj:isKingOf'&&person.periods.some(p=>p.claim.predicate==='syj:reignedIn'
        &&p.claim.fromSource===c.fromSource));
    for(const relation of person.relations){
      const polity=entities.get(relation.object.id);
      if(polity&&!polities.has(polity.id))polities.set(polity.id,{...polity,basis:[relation],ruler:person});
    }
  }
  const unique=new Map();
  for(const event of events){
  const key=[event.id,event.lo,event.hi].join('|');
    if(unique.has(key))unique.get(key).basis.push(...event.basis);else unique.set(key,{...event,basis:[...event.basis]});
  }
  const grouped=[...unique.values()].filter(e=>!events.some(other=>other!==e&&other.id===e.id
    &&other.claim.fromSource===e.claim.fromSource&&other.claim.predicate===e.claim.predicate
    &&other.lo<=e.lo&&other.hi>=e.hi&&(other.lo<e.lo||other.hi>e.hi)));
  grouped.sort((a,b)=>a.lo-b.lo||a.title.localeCompare(b.title,'ko'));
  const nearby=grouped.filter(e=>e.lo<=to&&e.hi>=from);
  const eventYears=[...new Set(events.flatMap(e=>[e.lo,e.hi]))].sort((a,b)=>a-b);
  return {year,from,to,entities,people:[...people.values()].sort((a,b)=>a.label.localeCompare(b.label,'ko')),
    polities:[...polities.values()],events:nearby,eventYears,allEvents:grouped,
    previous:eventYears.filter(y=>y<year).at(-1),next:eventYears.find(y=>y>year)};
}

export class Chronicle {
  constructor(host,controls,callbacks){
    this.host=host;this.controls=controls;this.callbacks=callbacks;
    this.data={entities:[],claims:[]};this.year=1593;this.span=50;this.sequence=0;this.loading=true;
    controls.innerHTML=`<div class="time-heading"><div class="time-year"><span data-calendar>서기</span>
      <input aria-label="탐색 연도" type="number" value="1593" min="-2500" max="2100" step="1"><span>년</span></div>
      <div class="time-actions"><button data-previous aria-label="이전 사건 연도로">← 이전 사건</button>
      <button data-play aria-label="시간 재생">▶ 재생</button><button data-next aria-label="다음 사건 연도로">다음 사건 →</button></div>
      <label class="time-span">주변 사건 <select aria-label="사건 탐색 범위"><option value="20">20년</option><option value="50" selected>50년</option><option value="100">100년</option></select></label></div>
      <div class="time-slider"><span>기원전 2500</span><input type="range" min="-2500" max="2025" value="1593" aria-label="역사 시간 이동"><span>2025</span></div>
      <div class="era-jumps">${[['414','고구려'],['540','신라'],['918','고려'],['1392','조선 건국'],['1446','세종'],['1593','임진왜란'],['1897','대한제국'],['1919','독립운동']].map(([y,l])=>`<button data-era="${y}">${l}</button>`).join('')}</div>`;
    controls.querySelector('[type=number]').onchange=e=>this.chooseYear(+e.target.value);
    controls.querySelector('[type=range]').oninput=e=>this.chooseYear(+e.target.value);
    controls.querySelector('select').onchange=e=>{this.span=+e.target.value;this.render();};
    controls.querySelector('[data-previous]').onclick=()=>this.chooseYear(this.context?.previous);
    controls.querySelector('[data-next]').onclick=()=>this.chooseYear(this.context?.next);
    controls.querySelector('[data-play]').onclick=()=>this.togglePlay();
    controls.querySelectorAll('[data-era]').forEach(b=>b.onclick=()=>{this.stopPlay();this.chooseYear(+b.dataset.era);});
    host.onclick=event=>{
      const jump=event.target.closest('[data-jump-year]');if(jump){this.chooseYear(+jump.dataset.jumpYear);return;}
      const proof=event.target.closest('[data-chronicle-claim]');
      if(proof){const c=this.data.claims.find(c=>c.id===proof.dataset.chronicleClaim);if(c)this.callbacks.claim(c);return;}
      const entity=event.target.closest('[data-chronicle-entity]');if(entity)this.showEntity(entity.dataset.chronicleEntity);
      if(event.target.closest('[data-context-back]'))this.render();
    };
    this.render();
  }
  chooseYear(year){
    if(!Number.isInteger(year)||year<-2500||year>2100)return;
    if(year===0)year=this.year<0?1:-1;
    this.callbacks.year(year);
  }
  setYear(year){this.year=year;this.render();}
  stopPlay(){clearInterval(this.timer);this.timer=null;this.controls.querySelector('[data-play]').textContent='▶ 재생';}
  togglePlay(){
    if(this.timer){this.stopPlay();return;}
    this.controls.querySelector('[data-play]').textContent='Ⅱ 멈춤';
    this.timer=setInterval(()=>{if(this.year>=2025){this.stopPlay();return;}this.chooseYear(this.year+1);},1200);
  }
  async refresh(){
    const seq=++this.sequence,filters=this.callbacks.filters();this.loading=true;this.error='';
    this.data={entities:[],claims:[]};this.render();
    try{
      const r=await fetch('/api/chronicle?'+new URLSearchParams({sources:[...filters.sources].join(','),origin:filters.origin}));
      const data=await r.json();if(seq!==this.sequence)return;
      if(!r.ok)throw new Error(data.error||'시대 정보를 불러오지 못했습니다.');
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
    if(entity.type==='Event'&&dates.length&&!dates.some(d=>d.lo<=this.year&&d.hi>=this.year)){
      const nearest=[...dates].sort((a,b)=>Math.abs(a.lo-this.year)-Math.abs(b.lo-this.year))[0];
      this.chooseYear(nearest.lo);
    }
    this.callbacks.entity(id);
    const descriptions=this.data.claims.filter(c=>c.subject===id&&['syj:describedAs','syj:hasTitle'].includes(c.predicate));
    this.host.innerHTML=`<button class="context-back" data-context-back>← ${yearLabel(this.year)}로 돌아가기</button>
      <div class="context-kicker">${{Person:'인물',Event:'사건',Polity:'나라'}[entity.type]||'관련 항목'}</div><h2>${esc(entityLabel(entity))}</h2>
      ${descriptions.slice(0,2).map(c=>`<p class="entity-description">${esc(c.object.value||'')}</p>`).join('')}
      <div class="context-section"><h3>시간</h3>${dates.map(d=>`<div class="entity-date"><button data-jump-year="${d.lo}">${yearLabel(d.lo)}${d.lo!==d.hi?' – '+yearLabel(d.hi):''}</button>
        <span>${esc(({bornIn:'출생',diedIn:'사망',reignedIn:'재위',activeIn:'활동',occurredIn:'사건',foundedIn:'건국'})[shortPredicate(d.claim.predicate)]||'기록')}</span>
        ${d.basis.map(c=>`<button class="context-proof" data-chronicle-claim="${esc(c.id)}">${esc(c.sourceLabel)} ↗</button>`).join('')}</div>`).join('')||'<p class="context-empty">날짜 근거가 아직 연결되지 않았습니다.</p>'}</div>
      <div class="context-section"><h3>관련 인물·사건·장소</h3><p class="context-empty">이 항목의 전체 기록입니다. 관계가 있었던 시기는 각 근거에서 확인할 수 있습니다.</p>${this.relations(id).map(({claim,target})=>`<div class="relation-row"><button data-chronicle-entity="${esc(target.id)}">${esc(entityLabel(target))}</button>
        <small>${esc(RELATION_WORDS[shortPredicate(claim.predicate)]||'관련 기록')}</small><button class="context-proof" data-chronicle-claim="${esc(claim.id)}">근거 ↗</button></div>`).join('')||'<p class="context-empty">연결 근거가 아직 없습니다.</p>'}</div>`;
  }
  render(){
    const c=contextAt(this.data,this.year,this.span);this.context=c;
    this.controls.querySelector('[type=number]').value=this.year;
    this.controls.querySelector('[type=range]').value=this.year;
    this.controls.querySelector('[data-calendar]').textContent='연도';
    this.controls.querySelector('[data-previous]').disabled=c.previous==null;
    this.controls.querySelector('[data-next]').disabled=c.next==null;
    this.controls.querySelectorAll('[data-era]').forEach(b=>b.classList.toggle('on',Math.abs(+b.dataset.era-this.year)<10));
    const status=this.error||(this.loading?'이 시대의 인물과 사건을 불러오는 중…':'');
    const counts=`인물 ${c.people.length} · 주변 사건 ${c.events.length}`;
    this.host.innerHTML=`<div class="context-kicker">시간 속으로</div><div class="context-title"><h2>${yearLabel(this.year)}</h2><span>${counts}</span></div>
      ${status?`<p role="status" class="context-empty">${esc(status)}</p>`:''}
      ${c.polities.length?`<section class="context-polities" aria-label="이때의 나라와 세력">${c.polities.map(p=>`<button class="relation-chip" data-chronicle-entity="${esc(p.id)}">${esc(entityLabel(p))}${p.ruler?' · '+esc(entityLabel(p.ruler))+' 재위':''}</button>`).join('')}</section>`:''}
      ${c.events.some(e=>e.current)?`<section class="current-events"><h3>이 해의 사건</h3>${c.events.filter(e=>e.current).map(e=>`<button data-chronicle-entity="${esc(e.id)}">${esc(entityLabel(e))} <span>→</span></button>`).join('')}</section>`:''}
      <section class="context-section"><div class="section-heading"><h3>이때의 사람들</h3><span>생존 · 재위 · 활동</span></div>
      ${c.people.map(p=>this.personCard(p,c)).join('')||(!status?'<p class="context-empty">선택한 사료에 이 해의 생존·활동 근거가 연결된 인물이 없습니다.</p>':'')}
      </section><section class="context-section"><div class="section-heading"><h3>이 시기의 사건</h3><span>${yearLabel(c.from)} – ${yearLabel(c.to)}</span></div>
      <div class="event-sequence">${c.events.map(e=>`<article class="period-event${e.current?' current':''}"><button class="event-year" data-jump-year="${e.lo}">${yearLabel(e.lo)}${e.lo!==e.hi?' – '+yearLabel(e.hi):''}</button>
        <button class="event-title" data-chronicle-entity="${esc(e.id)}">${esc(e.title)}</button>
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
