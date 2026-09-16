import {escapeHtml as esc} from './html.js';
import {loadChronicle} from './chronicle-load.js';
import {createYearHold,bindYearHold,bindYearSlider,stepYear,createYearPlayback} from './year-hold.js';
import {EventTimeline} from './event-timeline.js';
import {isHistoricalSetting} from './chronicle-sites.js';
import {visiblePackets,visiblePacketEvents} from './scene-packets.js';
import {createYearIndex} from './year-index.js';
import {valueKey} from './year-scrub.js';

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
  // 교과서 항목 조사에서 적재한 출처(위키백과·박물관·기관 해설)는 카드에 defaultLens 가 켜져 있다 — 이 출처가 꺼져 있으면 항목의 인물 관계·출처가 "선택한 사료 밖"으로만 보인다.
  {label:'항목 조사 출처', matches:s=>s.defaultLens===true},
];
export {sourcesParam} from './chronicle-load.js';
export const yearLabel = y => y < 0 ? `기원전 ${-y}년` : `${y}년`;
export const sceneContextLabel = (context,estimatedSites=0) =>
  `동시대 인물 ${context.people.length}, 주변 사건 ${context.events.length}, 추정 배경 마을 ${estimatedSites}(사료 없음)`;
export const entityLabel = e => e.label.replace(/\s*\([\u3400-\u9fff\s]+\)/g,'').replace(e.type==='Person'?/\s*·\s*\d+년.*$/:/$^/,'').replace(/\s*\([^)]*민족문화대백과[^)]*\)/g,part=>{
  const polity=part.match(/조선|고려|백제|신라|발해/);return polity?` (${polity[0]})`:'';
}).trim();
// #197 화면용 이름: 데이터 라벨의 설명 꼬리(" · 지방 행정 중심지", " · 집단 행위자")와 연도·긴 설명 괄호를 뗀다.
// 짧은 구분 괄호("(조선)", "(양주)")는 남긴다. 원본은 entityLabel/e.label 로 남아 검색·매칭에 쓴다.
const NOTE_PAREN=/\s*\(([^()]*)\)/g;
const isYearParen=text=>/^[\s\d년월일경~∼～·,.\-–]+$/.test(text)||/^(?:기원전\s*)?\d{1,4}년?(?:\s*[~∼～–-]\s*\d{1,4}년?)?(?:\s*(?:경|무렵))?$/.test(text);
export const stripLabelNotes = text => String(text||'').replace(NOTE_PAREN,(match,inner)=>isYearParen(inner)||inner.trim().length>=11||/미상|미확인|미기재|불명/.test(inner)?'':match)
  .replace(/\s{2,}/g,' ').trim();
// ' · ' 는 괄호 밖에서만 자른다 — '(발굴 조사 기관 · 집단 행위자)' 처럼 괄호 안에 있으면 이름의 일부다 (#200).
export const splitOutsideParens = (text,separator=' · ') => {
  const value=String(text||''),parts=[];let depth=0,start=0;
  for(let i=0;i<value.length;i++){
    const char=value[i];
    if(char==='(')depth++;
    else if(char===')')depth=Math.max(0,depth-1);
    else if(depth===0&&value.startsWith(separator,i)){parts.push(value.slice(start,i));i+=separator.length-1;start=i+1;}
  }
  parts.push(value.slice(start));
  return parts;
};
// 데이터에 labelNote 가 있으면 그것을 쓴다 — 원본 이름을 정리하며 떼어낸 설명을 옮겨 둔 자리다 (#200).
// 연도·날짜뿐인 설명은 빈 값으로 본다 — 검색 줄이 이미 연도를 따로 보여 주므로 '사건 · 713 · 713년' 이 된다 (#203 감사 2).
export const labelNote = e => {if(e?.labelNote){const note=String(e.labelNote).trim();return isYearParen(note)?'':note;}const parts=splitOutsideParens(String(e?.label||''));return parts.length>1?parts.slice(1).join(' · ').replace(/집단 행위자/g,'').replace(/\s*·\s*$/,'').trim():'';};
// '(값) 미상' 처럼 홀로 선 '미상'만 '미확인'으로 바꾼다. 앞뒤가 한글이면 이름의 일부다 —
// 경계를 안 보던 옛 규칙이 '다미상면'을 '다미확인면'으로 망가뜨렸다 (#203 감사 11).
export const replaceUnknown = text => String(text||'').replace(/(^|[^가-힣])미상(?=[^가-힣]|$)/g,'$1미확인');
export const displayLabel = e => {
  if(!e||!e.label)return '';
  const base=splitOutsideParens(entityLabel(e))[0];
  const cleaned=replaceUnknown(stripLabelNotes(base).replace(/집단 행위자|정본/g,'')).replace(/\s{2,}/g,' ').trim();
  return cleaned||entityLabel(e)||e.label;
};
// 카드의 '다른 이름' 줄에 쓸 값 — 정리 전 표기(같은 규칙으로 정리하면 표시 이름이 되는 것)는 뺀다.
// 검색은 entity.aliases 를 그대로 쓰므로 옛 이름으로도 계속 찾힌다 (#200).
export const visibleAliases = e => {
  const shown=displayLabel(e);
  const seen=new Set();
  return (e?.aliases||[]).map(a=>String(a||'').trim()).filter(alias=>{
    if(!alias||alias===shown||alias===String(e?.label||'')||seen.has(alias))return false;
    seen.add(alias);
    return displayLabel({label:alias,type:e?.type})!==shown;
  });
};
// 집단 판정: 유형 Group·라벨 꼬리·kind 를 함께 본다(#198 감사 C-18). 라벨에서 '집단 행위자' 꼬리를 떼는
// 데이터 정리가 끝나도 판정이 살아남게. kind 는 #200 이 서버 응답에 새로 실어 주는 집단 표시다.
export const isGroupEntity = e => e?.type==='Group'||/집단 행위자/.test(String(e?.label||''))
  ||['group','organization'].includes(String(e?.kind||e?.subtype||'').toLowerCase());
const shortPredicate = p=>p.replace('syj:','');
const ACTIVITY = new Map([['livedIn','생존'],['reignedIn','재위'],['activeIn','활동'],['appearsIn','등장']]);
const activityLabel=(predicate,claim)=>predicate==='appearsIn'&&claim.note?.startsWith('전승 연대')?'전승 연대':ACTIVITY.get(predicate);
export const EVENT_WORDS = {foundedIn:'건국',establishedIn:'설립',proclaimedIn:'선포',accededIn:'즉위'};
export const RELATION_WORDS = {hasParticipant:'참여',participatedIn:'참여 사건',tookPlaceAt:'장소',occurredAt:'장소',
  hasSetting:'전승의 무대',hasCharacter:'전승 속 등장인물',
  isKingOf:'나라',memberOf:'소속',affiliatedWith:'소속',hasParent:'부모',childOf:'부모',parentOf:'자녀',
  foundedBy:'건국자',ledBy:'이끈 인물',hasFounder:'설립자',sameEntityAs:'같다고 보는 이름',
  relatedTo:'관련',capitalOf:'수도',hasTeacher:'스승',teacherOf:'제자',alliedWith:'동맹',enemyOf:'적대'};
// 화면 카드·연결 보기에 쓰는 술어 이름. 관계 이름표(RELATION_WORDS)에 없는 술어를 여기서 받는다.
export const RECORD_WORDS = {hasBoundaryRecord:'경계 기록',locatedAt:'위치',locatedIn:'속한 곳',occurredIn:'일어난 때',
  describedAs:'설명',bornIn:'태어난 해',diedIn:'죽은 해',endedIn:'끝난 해',builtIn:'세운 해',reignedIn:'재위',
  reignedFrom:'재위 시작',reignedTo:'재위 끝',activeIn:'활동 시기',livedIn:'생존 시기',administeredAs:'행정 구분',
  householdCount:'호구 수',populationCount:'인구 수',mentionedIn:'언급된 기록',hasTitle:'직함',producedAt:'만든 곳',
  destroyedIn:'무너진 해',appearsIn:'등장한 기록',convertsTo:'환산한 연도',routeConnects:'이어진 길',
  capitalMovedTo:'옮긴 수도',hasCapital:'수도',existedIn:'존속 시기',hasOutcome:'결과',sameEventAs:'같다고 보는 사건',
  heldOffice:'맡은 자리',appointedTo:'임명된 자리',hasAppointee:'임명한 사람',hasEventSite:'사건 장소',
  hasName:'이름',hasStateName:'나라 이름',dated:'적힌 날짜',hasReferenceDate:'기준 날짜'};
// 화면에 쓰는 술어 이름. 표에 없으면 '관련 기록' 으로 떨어뜨린다(원시 키를 절대 그대로 내보내지 않는다).
export const predicateLabel = predicate => {
  const key=shortPredicate(String(predicate||''));
  return RELATION_WORDS[key]||EVENT_WORDS[key]||RECORD_WORDS[key]||'관련 기록';
};
// 유형 이름. 서버가 주는 개체 유형(17종)과 연결 보기의 그래프 노드 유형을 함께 담는다.
export const TYPE_WORDS = {Person:'인물',Event:'사건',Place:'장소',Polity:'나라',Narrative:'전승',
  Group:'집단',Organization:'단체',Institution:'제도',Office:'관직',Work:'기록물',Thing:'물건',
  Facility:'시설',Heritage:'문화유산',Artifact:'유물',Document:'문서',Concept:'개념',Period:'시대',
  Chunk:'원문 대목',Source:'사료',Claim:'기록',TimeSpan:'시점',Location:'좌표',Value:'값'};
export const typeWord = type => TYPE_WORDS[type]||'기록';
// 정밀도 코드. 표에 없는 값은 빈 문자열로 두고 화면에 아무것도 내보내지 않는다.
export const PRECISION_WORDS = {approx:'대략 위치',region:'일대 기준',area:'일대 기준',site:'유적 지점',
  year:'연 단위',month:'월 단위',day:'일 단위',century:'세기 단위',decade:'10년 단위','year-range':'연 단위 범위',
  'historical-gis-reconstruction-point':'옛 지도 복원 지점','modern-region-representative-point':'현재 지역 대표 지점',
  'heritage-catalog-point-crs-unspecified':'국가유산 목록 지점','site-point-from-institution':'기관이 준 지점'};
export const precisionLabel = value => PRECISION_WORDS[String(value||'')]||'';
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

const EMPTY_PACKETS=[];
const contextIndexes=new WeakMap();
export function buildContextIndex(data){
  const entities=new Map(data.entities.map(e=>[e.id,e])),dates=datedClaims(data),events=[];
  const bySubject=new Map(),participation=new Map(),deaths=new Map(),relations=new Map();
  for(const claim of data.claims){
    const list=bySubject.get(claim.subject)||[];list.push(claim);bySubject.set(claim.subject,list);
    if(claim.object.kind==='entity')for(const id of new Set([claim.subject,claim.object.id])){
      const rows=relations.get(id)||[];rows.push(claim);relations.set(id,rows);
    }
    const eventId=['syj:hasParticipant','syj:ledBy'].includes(claim.predicate)?claim.subject
      :claim.predicate==='syj:participatedIn'?claim.object.id:null;
    if(eventId&&claim.object.kind==='entity'){const rows=participation.get(eventId)||[];rows.push(claim);participation.set(eventId,rows);}
  }
  for(const d of dates){
    if(d.claim.predicate==='syj:diedIn'){
      const key=valueKey([d.claim.subject,d.claim.fromSource]),rows=deaths.get(key)||[];rows.push(d);deaths.set(key,rows);
    }
    const entity=entities.get(d.claim.subject),predicate=shortPredicate(d.claim.predicate);
    if(entity?.type==='Event'||entity?.type==='Polity'&&EVENT_WORDS[predicate])
      events.push({...entity,...d,title:entity.label+(entity.type==='Polity'?` · ${EVENT_WORDS[predicate]}`:''),current:false});
  }
  const byClaim=new Map(data.claims.map(claim=>[claim.id,claim]));
  const curatedEvents=[];
  for(const scene of visiblePackets(data.scenePackets)){
    if(!Number.isInteger(scene.startYear)||!Number.isInteger(scene.endYear)||scene.place?.settlement?.scope==='between-records')continue;
    const ids=[...scene.dateClaimIds,...scene.actionClaimIds],entity=entities.get(scene.eventId)
      ||(scene.itemId?{id:scene.eventId,type:'Event',label:scene.title}:null);
    if(!entity||entity.type==='Narrative'||scene.narrativeType||!scene.itemId&&(!ids.length||ids.some(id=>!byClaim.has(id))))continue;
    const setting=isHistoricalSetting(scene);
    curatedEvents.push({...entity,sceneId:scene.id,placeLabel:scene.place?.label,lo:scene.startYear,hi:scene.endYear,claim:byClaim.get(scene.dateClaimIds[0]),
      basis:[...new Set(ids)].map(id=>byClaim.get(id)).filter(Boolean),title:scene.title,setting,
      current:false});
  }
  const correctedEntities=new Set((data.scenePackets||[]).filter(scene=>scene.roleCorrection&&scene.actionClaimIds.every(id=>byClaim.has(id))).map(scene=>scene.eventId));
  for(let i=events.length-1;i>=0;i--)if(correctedEntities.has(events[i].id)||curatedEvents.some(s=>s.id===events[i].id&&s.lo<=events[i].lo&&s.hi>=events[i].hi))events.splice(i,1);
  events.push(...curatedEvents);

  const lifespans=[];
  for(const birth of dates.filter(d=>d.claim.predicate==='syj:bornIn')){
    if(entities.get(birth.claim.subject)?.type!=='Person')continue;
    for(const death of deaths.get(valueKey([birth.claim.subject,birth.claim.fromSource]))||[])
      lifespans.push({lo:birth.hi,hi:death.lo,birth,death});
  }
  const unique=new Map();
  for(const event of visiblePacketEvents(events,data.scenePackets)){
  const key=[event.id,event.lo,event.hi,event.sceneId||''].join('|');
    if(unique.has(key))unique.get(key).basis.push(...event.basis);else unique.set(key,{...event,basis:[...event.basis]});
  }
  const grouped=[...unique.values()].filter(e=>!events.some(other=>other!==e&&other.id===e.id&&other.sceneId===e.sceneId
    &&other.claim?.fromSource===e.claim?.fromSource&&other.claim?.predicate===e.claim?.predicate
    &&other.lo<=e.lo&&other.hi>=e.hi&&(other.lo<e.lo||other.hi>e.hi)));
  grouped.sort((a,b)=>a.lo-b.lo||a.title.localeCompare(b.title,'ko'));

  const polityDates=new Map();
  for(const d of dates.filter(d=>d.claim.predicate==='syj:activeIn')){const rows=polityDates.get(d.claim.subject)||[];rows.push(d);polityDates.set(d.claim.subject,rows);}
  const index={polityDates,entities,dates,bySubject,participation,relations,events:grouped,
    datesIndex:createYearIndex(dates),lifeIndex:createYearIndex(lifespans),
    eventIndex:createYearIndex(grouped),participationIndex:createYearIndex(events),nearbyIndex:createYearIndex(grouped.map(event=>({lo:event.lo,hi:event.setting?event.lo:event.hi,event}))),
    eventYears:[...new Set(grouped.flatMap(e=>e.setting?[e.lo]:[e.lo,e.hi]))].sort((a,b)=>a-b)};
  contextIndexes.set(data,index);return index;
}

export function contextAt(data,year,span=50){
  const index=contextIndexes.get(data)||buildContextIndex(data);
  const {entities,bySubject,participation,eventYears}=index,people=new Map(),polities=new Map();
  const from=year-Math.floor(span/2),to=year+Math.ceil(span/2);
  const addPerson=(entity,period)=>{
    const row=people.get(entity.id)||{...entity,periods:[],relations:[]};
    row.periods.push(period);people.set(entity.id,row);
  };
  for(const d of index.datesIndex.between(year,year)){
    const entity=entities.get(d.claim.subject),predicate=shortPredicate(d.claim.predicate);
    if(entity?.type==='Person'&&ACTIVITY.has(predicate))addPerson(entity,{...d,label:activityLabel(predicate,d.claim)});
    if(entity?.type==='Polity'&&predicate==='activeIn')polities.set(entity.id,{...entity,period:d,basis:d.basis});
  }
  for(const {birth,death} of index.lifeIndex.between(year,year)){
    addPerson(entities.get(birth.claim.subject),{lo:birth.lo,hi:death.hi,label:'출생~사망',
      dateLabel:`${yearLabel(birth.lo)}${birth.lo!==birth.hi?'(~'+yearLabel(birth.hi)+')':''}~${yearLabel(death.lo)}${death.lo!==death.hi?'(~'+yearLabel(death.hi)+')':''}`,
      claim:birth.claim,basis:[...birth.basis,...death.basis]});
  }
  const currentEvents=index.eventIndex.between(year,year).filter(e=>!e.setting||e.lo===year);
  for(const event of index.participationIndex.between(year,year).filter(e=>e.type==='Event'&&(!e.setting||e.lo===year))){
    for(const claim of participation.get(event.id)||[]){
      const lo=Math.max(event.lo,claim.validFrom??event.lo),hi=Math.min(event.hi,claim.validTo??event.hi);
      if(year<lo||year>hi)continue;
      const id=claim.subject===event.id&&['syj:hasParticipant','syj:ledBy'].includes(claim.predicate)?claim.object.id
        :claim.object.id===event.id&&claim.predicate==='syj:participatedIn'?claim.subject:null;
      const person=entities.get(id);if(person?.type!=='Person')continue;
      addPerson(person,{lo,hi,label:'사건 참여',claim,basis:[claim,...event.basis],eventId:event.id});
    }
  }
  for(const person of people.values()){
    person.relations=(bySubject.get(person.id)||[]).filter(c=>c.object.kind==='entity'
      &&c.predicate==='syj:isKingOf'&&person.periods.some(p=>p.claim.predicate==='syj:reignedIn'
        &&p.claim.fromSource===c.fromSource)).filter(c=>{
          const periods=index.polityDates.get(c.object.id)||[];
          return !periods.length||periods.some(d=>d.lo<=year&&d.hi>=year);
        });
    for(const relation of person.relations){
      const polity=entities.get(relation.object.id);
      if(polity&&!polities.has(polity.id))polities.set(polity.id,{...polity,basis:[relation],ruler:person});
    }
  }
  const current=new Set(currentEvents),fresh=e=>({...e,current:current.has(e)});
  const nearby=index.nearbyIndex.between(from,to).map(row=>fresh(row.event));
  const settings=index.eventIndex.between(year,year).filter(e=>e.setting).map(fresh);
  return {year,from,to,entities,people:[...people.values()].sort((a,b)=>a.label.localeCompare(b.label,'ko')),
    polities:[...polities.values()],events:nearby,settings,eventYears,allEvents:index.events.map(fresh),
    previous:eventYears.filter(y=>y<year).at(-1),next:eventYears.find(y=>y>year)};
}

export class Chronicle {
  constructor(host,controls,callbacks){
    this.host=host;this.controls=controls;this.callbacks=callbacks;
    this.data={entities:[],claims:[]};this.year=1593;this.span=50;this.sequence=0;this.loading=true;
    controls.innerHTML=`<div class="time-heading"><div class="time-year"><label for="historyYear" data-calendar>연도 입력</label>
      <input id="historyYear" aria-label="연도" aria-describedby="yearInputHelp" type="number" value="1593" min="-2500" max="2100" step="1" required><span>년</span><div class="year-nudge" role="group" aria-label="1년씩 이동합니다. 길게 누르면 빨라집니다"><button data-year-step="-1" aria-label="이전 해. 길게 누르면 빨라집니다" title="1년 전. 길게 누르면 빨라집니다">−</button><button data-year-step="1" aria-label="다음 해. 길게 누르면 빨라집니다" title="1년 후. 길게 누르면 빨라집니다">+</button></div><button data-go-year>이동하기</button><small id="yearInputHelp">숫자를 적고 엔터를 누릅니다. 기원전은 −500처럼 적습니다</small></div>
      <div class="time-actions"><button data-previous aria-label="이전 사건으로 이동하기">← 이전 사건 보기</button>
      <button data-play aria-label="시간 재생하기">▶ 재생하기</button><button data-next aria-label="다음 사건으로 이동하기">다음 사건 보기 →</button></div>
      <label class="time-span">주변 사건 <select aria-label="사건 탐색 범위"><option value="20">20년</option><option value="50" selected>50년</option><option value="100">100년</option></select></label></div>
      <div class="time-slider"><span>기원전 2500</span><input type="range" min="-2500" max="2100" value="1593" aria-label="연도 이동. 원하는 연도로 끌어 놓습니다" title="끌어서 연도를 고릅니다. 방향키나 마우스 휠로는 1년씩 움직입니다"><span>2100</span></div>
      <div class="event-strip"></div>`;
    this.timeline=new EventTimeline(controls.querySelector('.event-strip'),{yearLabel,
      preview:(year,holding)=>this.previewYear(year,holding),commit:()=>this.finishScrub(),select:entry=>this.showEvent(entry)});
    this.yearHold=createYearHold({read:()=>this.pendingYear??this.year,preview:year=>this.previewYear(year,true),commit:()=>this.finishScrub()});
    bindYearHold(controls,this.yearHold);
    const yearInput=controls.querySelector('[type=number]');
    const goYear=()=>{if(yearInput.reportValidity()){this.stopPlay();if(yearInput.valueAsNumber!==this.year)this.chooseYear(yearInput.valueAsNumber);}};
    yearInput.onchange=goYear;
    yearInput.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();goYear();}};
    controls.querySelector('[data-go-year]').onclick=goYear;
    const slider=controls.querySelector('[type=range]');
    bindYearSlider(slider,{read:()=>this.pendingYear??this.year,preview:(year,holding)=>this.previewYear(year,holding),commit:()=>this.finishScrub()},()=>this.stopPlay());
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
    this.yearHold?.stop(false);
    clearTimeout(this.scrubTimer);this.pendingYear=null;
    if(!Number.isInteger(year)||year<-2500||year>2100)return;
    if(year===0)year=this.year<0?1:-1;
    if(year===this.year)return;
    return this.callbacks.year(year);
  }
  previewYear(year,holding=false){
    if(!holding)this.yearHold?.stop(false);
    if(!Number.isInteger(year)||year<-2500||year>2100)return;
    if(year===0)year=this.year<0?1:-1;
    this.stopPlay();clearTimeout(this.scrubTimer);this.pendingYear=year;
    this.showYearPreview(year);
    if(!holding)this.scrubTimer=setTimeout(()=>this.finishScrub(),250);
  }
  showYearPreview(year){
    this.controls.querySelector('[type=number]').value=year;this.controls.querySelector('[type=range]').value=year;
    this.timeline.setYear(year);
    this.controls.dispatchEvent(new CustomEvent('yearpreview',{detail:year}));
  }
  finishScrub(){const year=this.pendingYear;clearTimeout(this.scrubTimer);this.pendingYear=null;if(year!==this.year)this.chooseYear(year);}
  async showEvent(event){
    const year=this.year>=event.lo&&this.year<=event.hi?this.year:event.lo;
    this.stopPlay();await this.chooseYear(year);
    if(this.year!==year)return;
    this.callbacks.scene?.(event.sceneId);this.showEntity(event.id);
  }
  setYear(year){this.year=year;this.render();}
  stopPlay(){this.playback?.stop();const button=this.controls.querySelector('[data-play]');button.textContent='▶ 재생하기';button.setAttribute('aria-pressed','false');button.setAttribute('aria-label','시간 재생하기');}
  togglePlay(){
    this.yearHold.stop();this.finishScrub();
    if(this.playback?.playing){this.stopPlay();return;}
    this.controls.querySelector('[data-play]').textContent='Ⅱ 멈추기';
    this.controls.querySelector('[data-play]').setAttribute('aria-pressed','true');
    this.controls.querySelector('[data-play]').setAttribute('aria-label','시간 재생 멈추기');
    this.playback??=createYearPlayback({busy:()=>this.callbacks.busy?.()||false,
      lastCompleted:()=>this.callbacks.lastCompleted?.()??-Infinity,
      advance:()=>{if(this.year>=2100){this.stopPlay();return;}return this.chooseYear(stepYear(this.year,1));}});
    this.playback.start();
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
    const {entities,relations}=contextIndexes.get(this.contextData)||buildContextIndex(this.data);
    return (relations.get(id)||[])
      .map(c=>({claim:c,target:entities.get(c.subject===id?c.object.id:c.subject)})).filter(x=>x.target);
  }
  async showEntity(id){
    this.panelKey=null;
    this.stopPlay();
    const background=this.callbacks.activity?.(id);
    const entity=this.data.entities.find(e=>e.id===id)
      ||(background?.itemId?(()=>{const person=(background.participants||[]).find(p=>p.entityId===id);  // #186: 로드되지 않은 항목 인물
        return person?{id,type:'Person',label:person.label||background.label}:{id,type:'Event',label:background.label};})():null)
      ||(['anonymous-city','facility'].includes(background?.siteBackground?.scope)?{id,type:'Place',labels:[]}:null);
    if(!entity)return;
    const dates=datedClaims(this.data).filter(d=>d.claim.subject===id);
    const currentEvent=this.context?.allEvents.some(e=>e.id===id&&e.current);
    const currentSetting=this.callbacks.activity?.(id)?.setting;
    if(entity.type==='Event'&&dates.length&&!currentEvent&&!currentSetting&&!dates.some(d=>d.lo<=this.year&&d.hi>=this.year)){
      const nearest=[...dates].sort((a,b)=>Math.abs(a.lo-this.year)-Math.abs(b.lo-this.year))[0];
      await this.chooseYear(nearest.lo);
      if(this.year!==nearest.lo)return;
    }
    this.callbacks.entity(id);
    const activity=this.callbacks.activity?.(id);
    // 카드를 그리는 일은 atlasUI(atlas-story.js)가 맡는다. 예전에는 여기에도 같은 카드를 그리는 가지가 있었지만
    // presentEntity 가 언제나 카드를 열어 한 번도 실행되지 않았다 — #203 감사 1·5 에서 지웠다.
    this.callbacks.presentEntity?.(entity,activity);
  }
  render(){
    const packets=this.callbacks.scenePackets?.()||this.data.scenePackets||EMPTY_PACKETS;
    if(this.contextSource!==this.data||this.contextPackets!==packets){
      this.contextSource=this.data;this.contextPackets=packets;this.contextData={...this.data,scenePackets:packets};
      buildContextIndex(this.contextData);this.panelKey=null;
    }
    const c=contextAt(this.contextData,this.year,this.span);this.context=c;
    this.timeline.setEvents(this.callbacks.timelineEvents?.(c.allEvents)||c.allEvents);this.timeline.setYear(this.year);
    this.controls.querySelector('[type=number]').value=this.year;
    this.controls.querySelector('[type=range]').value=this.year;
    this.controls.querySelector('[data-calendar]').textContent='연도 입력';
    this.controls.querySelector('[data-previous]').disabled=c.previous==null;
    this.controls.querySelector('[data-next]').disabled=c.next==null;
    this.controls.querySelectorAll('[data-era]').forEach(b=>b.classList.toggle('on',Math.abs(+b.dataset.era-this.year)<10));
    const status=this.error||(this.loading?'이 시대의 인물과 사건을 불러오고 있습니다…':'');
    const counts=`인물 ${c.people.length}, 주변 사건 ${c.events.length}`;
    const panelKey=valueKey([status,this.data.hasMore,
      c.people.map(p=>[p.id,entityLabel(p),p.periods.map(d=>[d.lo,d.hi,d.label,d.claim.id]),p.relations.map(r=>r.object.id)]),
      c.polities.map(p=>[p.id,entityLabel(p),p.ruler?.id,p.ruler&&entityLabel(p.ruler)]),
      c.events.map(e=>[e.id,e.sceneId,e.lo,e.hi,e.current]),c.settings.map(e=>[e.id,e.sceneId])]);
    const title=this.host.querySelector('.context-title h2'),range=this.host.querySelector('[data-context-range]');
    if(this.panelKey!==panelKey||!title||!range){
      this.panelKey=panelKey;
      this.host.innerHTML=`<div class="context-kicker">시간 속으로</div><div class="context-title"><h2>${yearLabel(this.year)}</h2><span>${counts}</span></div>
      ${status?`<p role="status" class="context-empty">${esc(status)}</p>`:''}
      ${c.polities.length?`<section class="context-polities" aria-label="이때의 나라와 집단">${c.polities.map(p=>`<button class="relation-chip" data-chronicle-entity="${esc(p.id)}">${esc(entityLabel(p))}${p.ruler?' · '+esc(entityLabel(p.ruler))+' 재위':''}</button>`).join('')}</section>`:''}
      ${c.events.some(e=>e.current)?`<section class="current-events"><h3>이 해의 사건</h3>${c.events.filter(e=>e.current).map(e=>`<button data-chronicle-entity="${esc(e.id)}" data-chronicle-scene="${esc(e.sceneId||'')}">${esc(e.title)} <span>→</span></button>`).join('')}</section>`:''}
      ${c.settings.length?`<details class="context-section era-sites"><summary>이때의 도시·시설 ${c.settings.length}곳</summary>${c.settings.map(e=>`<button class="period-site" data-chronicle-entity="${esc(e.id)}" data-chronicle-scene="${esc(e.sceneId)}">${esc(e.title)}</button>`).join('')}</details>`:''}
      <details class="context-section era-people"><summary>동시대 인물 ${c.people.length}명 (생존, 재위, 활동)</summary><div class="section-heading"><h3>이때의 사람들</h3></div>
      ${c.people.map(p=>this.personCard(p,c)).join('')||(!status?'<p class="context-empty">고른 사료에는 이 해의 생존·활동 출처가 연결된 인물이 없습니다.</p>':'')}
      </details><section class="context-section"><div class="section-heading"><h3>이 시기의 사건</h3><span data-context-range>${yearLabel(c.from)}~${yearLabel(c.to)}</span></div>
      <div class="event-sequence">${c.events.map(e=>`<article class="period-event${e.current?' current':''}"><button class="event-year" data-jump-year="${e.lo}">${yearLabel(e.lo)}${e.lo!==e.hi?'~'+yearLabel(e.hi):''}</button>
        <button class="event-title" data-chronicle-entity="${esc(e.id)}" data-chronicle-scene="${esc(e.sceneId||'')}">${esc(e.title)}</button>
        ${this.relations(e.id).filter(x=>['Person','Polity','Place'].includes(x.target.type)).slice(0,6).map(x=>`<button class="relation-chip" data-chronicle-entity="${esc(x.target.id)}">${esc(entityLabel(x.target))}</button>`).join('')}
        ${[...new Map(e.basis.map(b=>[b.fromSource,b])).values()].map(b=>`<button class="context-proof" data-chronicle-claim="${esc(b.id)}">${esc(b.sourceLabel)} ↗</button>`).join('')}</article>`).join('')||(!status?'<p class="context-empty">이 기간에 연결된 사건이 없습니다. 이전·다음 사건으로 이동해 보십시오.</p>':'')}</div></section>
      <p class="context-footnote">고른 사료에 출처가 연결된 항목입니다. 출생~사망 연도와 재위·활동 기간은 따로 표시합니다.${this.data.hasMore?' 한 번에 불러올 양을 넘어 일부만 보여줍니다.':''}</p>`;
    }else{
      title.textContent=yearLabel(this.year);
      range.textContent=`${yearLabel(c.from)}~${yearLabel(c.to)}`;
      for(const [i,track] of [...this.host.querySelectorAll('.life-track i')].entries()){
        const person=c.people[i],p=person.periods.find(p=>p.label==='출생~사망')||person.periods[0];
        const left=Math.max(0,(p.lo-c.from)/this.span*100),right=Math.min(100,(p.hi-c.from)/this.span*100);
        track.style.left=left+'%';track.style.width=Math.max(1,right-left)+'%';
      }
    }
    this.callbacks.context?.(c);
  }
  personCard(person,context){
    const p=person.periods.find(p=>p.label==='출생~사망')||person.periods[0];
    const left=Math.max(0,(p.lo-context.from)/this.span*100),right=Math.min(100,(p.hi-context.from)/this.span*100);
    const memberships=[...new Set(person.relations.map(c=>context.entities.get(c.object.id)).filter(Boolean).map(entityLabel))];
    const activity=person.periods.find(p=>p.claim.predicate==='syj:activeIn');
    const events=[...new Map(this.relations(person.id).filter(x=>x.target.type==='Event'
      &&context.events.some(e=>e.id===x.target.id)).map(x=>[x.target.id,x.target])).values()];
    return `<article class="period-person"><div class="person-heading"><button data-chronicle-entity="${esc(person.id)}">${esc(entityLabel(person))}</button><span>${esc(memberships.join(', '))}</span></div>
      <div class="person-dates">${p.dateLabel||yearLabel(p.lo)+'~'+yearLabel(p.hi)} <span>${p.label}</span></div>
      <div class="life-track" aria-label="${esc(person.label)} ${p.label} ${p.lo}~${p.hi}"><i style="left:${left}%;width:${Math.max(1,right-left)}%"></i><b></b></div>
      ${activity?`<button class="person-activity" data-chronicle-claim="${esc(activity.claim.id)}">${esc(activity.claim.quote)} ↗</button>`:''}
      ${events.length?`<div class="person-events">${events.map(e=>`<button class="relation-chip" data-chronicle-entity="${esc(e.id)}">${esc(entityLabel(e))}</button>`).join('')}</div>`:''}
      <button class="context-proof" data-chronicle-claim="${esc(p.claim.id)}">${esc(p.claim.sourceLabel)} ↗</button></article>`;
  }
}
