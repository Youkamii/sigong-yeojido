import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {AtlasData,cleanTitle,relationName,relationDates} from '../services/host/app/atlas-data.js';
import {AtlasUI} from '../services/host/app/atlas-ui.js';
import {AtlasStory,normalize,mergeEvents,mergePlaces,collapseEvents,displayTitle,shortLabel} from '../services/host/app/atlas-story.js';
import {contextAt,yearLabel} from '../services/host/app/chronicle.js';
import {roleLabel} from '../services/host/app/chronicle-asset-plan.js';

const json=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
// 실제 조사에서 등록한 개체, claims-json, 운영 장면을 함께 읽는다.
const research=['scenes-101/yi_naval','scenes-103/harbors_and_presence','periods-92/joseon-modern']
  .map(path=>json(`../data/research/${path}/result.json`));
const entities=[...new Map(research.flatMap(r=>r.entities).map(e=>[e.id,e])).values()];
const claims=[];
for(const sourceId of new Set(research.flatMap(r=>r.sources.map(s=>s.id)))){
  const dir=new URL(`../data/claims/${sourceId.replace(/^src-/,'')}/`,import.meta.url);
  if(!existsSync(dir))continue;
  for(const name of readdirSync(dir,{recursive:true}).filter(name=>name.endsWith('.md'))){
    const text=readFileSync(new URL(name.replaceAll('\\','/'),dir),'utf8');
    for(const match of text.matchAll(/```claims-json\s*([\s\S]*?)```/g))claims.push(...JSON.parse(match[1]));
  }
}
const sceneIds=new Set(research.flatMap(r=>(r.scenes||[]).map(s=>s.id)));
const packets=json('../services/host/app/history-scenes.json').scenes.filter(s=>sceneIds.has(s.id));
const liveData={entities,claims:[...new Map(claims.map(c=>[c.id,c])).values()],scenePackets:packets};
const yi='person-encykorea-yi-sunsin',noryang='event-yinav-noryang-1598';
function storyFor(id,tab='summary',source=liveData){
  const data=new AtlasData();data.update(source,contextAt(source,1598),source.scenePackets);
  return Object.assign(Object.create(AtlasStory.prototype),{entity:data.entities.get(id),tab,more:new Set(),history:[],pane:{},
    ui:{data,chronicle:{year:1598},scene:{assets:{activeScene:'scene-noryang-1598'}}}});
}
const sectionHtml=(html,id)=>html.match(new RegExp(`<section[^>]*data-story-section="${id}"[\\s\\S]*?</section>`))?.[0];

test('실제 인물·사건 카드는 요약과 세 목록을 나누고 연도 레일을 표시한다',()=>{
  for(const id of [yi,'event-syj103-gohado-jujun-1597-1598']){
    const story=storyFor(id),sections=story.sections(story.relatedRows());story.render();
    const summary=story.pane.innerHTML;
    assert.match(summary,/atlas-story-hero/);assert.match(summary,/출처와 지도 위치/);assert.match(summary,/data-story-claim=/);
    assert.match(sectionHtml(summary,'events'),/<h3>연표 /);
    assert.match(sectionHtml(summary,'era'),/class="atlas-story-era-row"><span>조선/);
    assert.doesNotMatch(sectionHtml(summary,'era'),/<h3>/);
    assert.equal((summary.match(/<details/g)||[]).length,1);
    assert.ok(!summary.includes('data-story-relations'));
    const people=sections.find(s=>s.id==='people').rows,events=sections.find(s=>s.id==='events').rows;
    const compact=sections.filter(s=>s.id!=='era').reduce((sum,s)=>sum+s.rows.length,0)<=6;
    assert.ok(events.length>0);assert.ok(events.every(e=>e.id!==id));
    assert.equal((sectionHtml(summary,'people')?.match(/data-story-entity=/g)||[]).length,compact?people.length:Math.min(people.length,5));
    assert.equal((sectionHtml(summary,'events').match(/atlas-story-event"/g)||[]).length,compact?events.length:Math.min(events.length,3));
    const current=story.sceneEvent();
    if(events.some(e=>e.sceneId===current.sceneId))assert.ok(sectionHtml(summary,'events').includes(`data-story-event="${current.sceneId}"`));
    const summaryYears=[...sectionHtml(summary,'events').matchAll(/class="atlas-event-year">(\d+)년/g)].map(match=>Number(match[1]));
    assert.deepEqual(summaryYears,[...summaryYears].sort((a,b)=>a-b));
    if(id===yi)assert.ok(summary.includes('인물 · 1545년~1598년'));
    if(compact){assert.ok(!summary.includes('class="atlas-story-tabs"'));continue;}
    for(const tab of ['events','people','places']){
      if(!sections.find(s=>s.id===tab).rows.length)continue;
      story.tab=tab;story.render();const html=story.pane.innerHTML;
      assert.ok(sectionHtml(html,tab));assert.ok(sectionHtml(html,'era'));
      assert.doesNotMatch(sectionHtml(html,tab),/<h3>/);
      for(const other of ['events','people','places'].filter(key=>key!==tab))assert.equal(sectionHtml(html,other),undefined);
    }
    story.tab='events';story.render();
    const visible=events.length>12?events.slice(0,10):events;
    const timeline=sectionHtml(story.pane.innerHTML,'events');
    assert.equal((timeline.match(/class="atlas-event-year"/g)||[]).length,new Set(visible.map(e=>e.lo??null)).size);
    for(const row of visible){assert.ok(timeline.includes(displayTitle(row.title)));assert.ok(timeline.includes(yearLabel(row.lo)));}
    story.tab='places';story.render();assert.match(sectionHtml(story.pane.innerHTML,'places'),/사건 \d+/);
  }
});

test('관계 이름은 방향을 반영하고 관계 자체에 기록된 시간만 표시한다',()=>{
  const parent={subject:'child',predicate:'syj:hasParent',object:{kind:'entity',id:'parent'},time:{earliest:1545,latest:1550}};
  assert.equal(relationName(parent,'child'),'부모');assert.equal(relationName(parent,'parent'),'자녀');
  assert.equal(relationDates(parent),'1545년~1550년');
  assert.equal(relationDates({...parent,time:{year:1592}}),'1592년');
  assert.equal(relationDates({...parent,time:undefined}),'');
  const story=storyFor(yi),target=story.ui.data.entities.get('person-yinav-jin-rin');
  assert.ok(target);
  const dated={...parent,subject:yi,object:{kind:'entity',id:target.id},predicate:'syj:hasTeacher'};
  const html=story.sectionHtml({id:'people',title:'인물 관계',rows:[{entity:target,claims:[dated],relationClaims:[dated]}]});
  assert.match(html,/<h4>스승 /);assert.match(html,/<small class="atlas-relation-year"[^>]*>1545년~1550년<\/small>/);
  const unknown={...dated,predicate:'syj:unlistedRelation',time:undefined};
  assert.ok(story.sectionHtml({id:'people',title:'인물 관계',rows:[{entity:target,claims:[unknown],relationClaims:[unknown]}]}).includes('<h4>관계 '));
});

test('사건의 앞뒤 목록은 같은 장소 ±5년과 직접 관계만 포함하며 다른 활성 장면에 흔들리지 않는다',()=>{
  const story=storyFor(noryang),data=story.ui.data,current=story.sceneEvent();
  const scene=data.scenes.get(current.sceneId),placeLabel=scene.place.label;
  const variants=[[-5,'before',placeLabel],[5,'after',placeLabel],[6,'too-late',placeLabel],[0,'elsewhere','다른 장소']];
  data.events.push(...variants.map(([offset,id,placeLabel])=>({id,type:'Event',title:id,lo:1598+offset,hi:1598+offset,placeLabel})));
  const linked={id:'linked-event',type:'Event',label:'직접 연결된 먼 사건'};
  data.entities.set(linked.id,linked);
  data.links.set(noryang,[...(data.links.get(noryang)||[]),{id:linked.id,claim:{id:'direct-event-link',subject:noryang,predicate:'syj:relatedTo',object:{kind:'entity',id:linked.id}}}]);
  story.ui.scene.assets.activeScene='scene-hansando-daecheop-1592';
  assert.equal(story.sceneEvent().id,noryang);
  const rows=story.sections(story.relatedRows()).find(s=>s.id==='events').rows;
  assert.ok(rows.some(e=>e.id==='before'));assert.ok(rows.some(e=>e.id==='after'));
  assert.ok(!rows.some(e=>['too-late','elsewhere',noryang].includes(e.id)));
  assert.ok(rows.some(e=>e.id===linked.id),'직접 연결 사건');
});

test('관계 그룹은 더 보기로 30개 이후도 표시하고 빈 구역은 생략하며 나라가 없으면 시대를 표시한다',()=>{
  const story=storyFor(yi),rows=Array.from({length:35},(_,i)=>({entity:{id:`p${i}`,label:`인물 ${i}`,type:'Person'},claims:[]}));
  const group={id:'people',title:'인물 관계',rows};
  assert.equal((story.sectionHtml(group).match(/data-story-entity=/g)||[]).length,8);
  assert.ok(story.sectionHtml(group).includes('27명 더 보기'));
  story.more.add('people-0');assert.equal((story.sectionHtml(group).match(/data-story-entity=/g)||[]).length,35);
  assert.equal(story.sectionHtml({...group,rows:[]}), '');
  const empty={entities:[{id:'empty',type:'Person',label:'기록 없는 인물'}],claims:[],scenePackets:[]};
  const sparse=storyFor('empty','summary',empty);sparse.render();
  assert.ok(sparse.pane.innerHTML.includes('class="atlas-breadcrumb">인물</p>'))  // #197 날짜가 없으면 유형만;
  assert.ok(sectionHtml(sparse.pane.innerHTML,'era').includes('조선'));
  assert.equal(sectionHtml(sparse.pane.innerHTML,'people'),undefined);
  assert.equal(sectionHtml(sparse.pane.innerHTML,'places'),undefined);
});

test('장소 중복을 합치고 해당 사건 수와 연결을 보존한다',()=>{
  const story=storyFor(yi),data=story.ui.data,event=story.sceneEvent(),scene=data.scenes.get(event.sceneId);
  const place={entity:{id:'duplicate-place',type:'Place',label:scene.place.label},claims:[]};
  const rows=story.sections([...story.relatedRows(),place]).find(s=>s.id==='places').rows;
  const matches=rows.filter(p=>normalize(p.label)===normalize(scene.place.label));assert.equal(matches.length,1);
  assert.ok(matches[0].entityId);assert.ok([...matches[0].events.values()].some(e=>normalize(e.title)===normalize(scene.title)));
});

test('인물·사건·장소·출처 버튼과 관계/뒤로 동작을 유지한다',async()=>{
  const previousDocument=globalThis.document,previousFetch=globalThis.fetch,calls=[];
  globalThis.document={createElement:()=>({setAttribute(){},querySelector(){return null;}})};
  globalThis.fetch=async()=>({ok:true,json:async()=>({images:[]})});
  try{
    const sample=storyFor(yi),ui={...sample.ui,registerPanel(){},openPanel(){},closePanel:()=>calls.push(['close']),chat:{show:id=>calls.push(['chat',id])},evidence:c=>calls.push(['claim',c.id]),
      chronicle:{...sample.ui.chronicle,showEntity:id=>calls.push(['entity',id]),showEvent:e=>calls.push(['event',e.sceneId])}};
    const story=new AtlasStory(ui);story.show(sample.entity);
    assert.ok(story.pane.innerHTML.includes('<span>지도로 가기</span>'));
    const click=(selector,dataset={})=>story.pane.onclick({target:{closest:s=>s===selector?{dataset}:null}});
    const event=story.sceneEvent(),claim=ui.data.claims.values().next().value;
    click('[data-story-entity]',{storyEntity:noryang});click('[data-story-event]',{storyEvent:event.sceneId});
    click('[data-story-place]',{storyPlace:event.sceneId});click('[data-story-claim]',{storyClaim:claim.id});
    assert.deepEqual(calls,[['entity',noryang],['event',event.sceneId],['event',event.sceneId],['claim',claim.id]]);
    click('[data-story-tab]',{storyTab:'events'});assert.equal(story.tab,'events');
    click('[data-story-more]',{storyMore:'events'});assert.ok(story.more.has('events'));
    click('[data-story-expand]');assert.equal(story.expanded,true);
    click('[data-story-chat]');assert.deepEqual(calls.at(-1),['chat',yi]);
    click('[data-story-back]');assert.deepEqual(calls.at(-1),['close']);
    story.show(ui.data.entities.get(noryang));assert.equal(story.tab,'summary');assert.equal(story.more.size,0);assert.equal(story.expanded,false);
    assert.ok(story.pane.innerHTML.includes('<span>이전으로</span>'));
    click('[data-story-back]');assert.deepEqual(calls.at(-1),['entity',yi]);
    await Promise.resolve();
  }finally{globalThis.document=previousDocument;globalThis.fetch=previousFetch;}
});

test('ruler 역할 호칭은 시대를 따른다 — 4·19 카드의 이승만이 군주로 불리지 않는다',()=>{
  assert.equal(roleLabel('ruler',1400),'군주');
  assert.equal(roleLabel('ruler',1900),'황제');
  assert.equal(roleLabel('ruler',1930),'지도자');
  assert.equal(roleLabel('ruler',1960),'국가 지도자');
  assert.equal(roleLabel('ruler'),'군주');
  assert.equal(roleLabel('군주',1948),'국가 지도자');  // 조형 계획이 번역해 넘긴 역할
  assert.equal(roleLabel('commander',1960),'지휘관');
});

test('이름 정규화와 제목·라벨 정리는 원문을 바꾸지 않는다',()=>{
  assert.equal(normalize(' Ａ · B–c—d- (설명 (안쪽)) '),'abcd');
  assert.equal(normalize('한산도 대첩'),normalize('한산도대첩'));
  assert.equal(displayTitle('한산도 본영 운영 — 전함 제작과 수리 (1593~1597)'), '한산도 본영 운영');
  for(const dash of ['—','–','-'])assert.equal(displayTitle(`출항 ${dash} 준비 (1593)`),'출항');
  assert.equal(displayTitle('한산도 (상륙지)'),'한산도 (상륙지)');
  assert.equal(displayTitle('한산도 (1593년–1597년)'),'한산도');
  assert.equal(shortLabel('일본군 (임진왜란 침입군, 사료 표기 일본군·왜군·적군) · 집단 행위자'),'일본군');
  assert.equal(shortLabel('일본군 (임진왜란 침입군 · 사료 표기 왜군) · 집단 행위자'),'일본군');
  assert.equal(shortLabel('수군 (조선) · 집단 행위자'),'수군 (조선)');
});

test('같은 제목·연도·장소만 병합하고 대표 행의 장면·장소·제목과 양쪽 출처를 남긴다',()=>{
  const rows=[{id:'a',title:'한산도 대첩',lo:1592,placeLabel:'한산섬 앞바다 (전투 장소)',basis:[{id:'c1'}]},
    {id:'b',title:'한산도대첩 (1592)',lo:1592,sceneId:'battle',placeLabel:'한산섬 앞바다',basis:[{id:'c2'},{id:'c1'}]},
    {id:'c',title:'한산도대첩',lo:1593}, {id:'d',title:'한산도 대첩'}];
  const original=structuredClone(rows);
  for(const input of [rows,[...rows].reverse()]){
    const merged=mergeEvents(input);assert.equal(merged.length,2);  // #197: 연도 없는 'd' 는 가장 이른 같은 제목 행(1592)에 흡수
    assert.ok(merged.some(e=>e.lo===1593));
    const battle=merged.find(e=>e.lo===1592);assert.equal(battle.id,'b');assert.equal(battle.sceneId,'battle');assert.equal(battle.placeLabel,'한산섬 앞바다');assert.equal(battle.title,rows[1].title);
    assert.deepEqual(new Set(battle.basis.map(c=>c.id)),new Set(['c1','c2']));
    assert.equal(battle.basis.length,2);
  }
  assert.deepEqual(rows,original);
});

test('같은 해 한산도 대첩은 부제가 달린 장면과 한 행으로 합친다',()=>{
  const rows=[{id:'a',title:'한산도 대첩',lo:1592,placeLabel:'한산섬 앞바다'},
    {id:'b',title:'한산도대첩 — 한산섬 앞바다',lo:1592,sceneId:'battle',placeLabel:'한산섬 앞바다'}];
  for(const input of [rows,[...rows].reverse()]){
    const merged=mergeEvents(input);
    assert.equal(merged.length,1);assert.equal(merged[0].sceneId,'battle');
    assert.equal(merged[0].placeLabel,'한산섬 앞바다');
    assert.equal((storyFor(yi).timelineHtml(merged).match(/atlas-story-event"/g)||[]).length,1);
  }
});

test('빈 장소는 같은 제목·연도 그룹의 첫 장소에만 흡수하고 다른 장소는 남긴다',()=>{
  for(const [title,lo,places] of [
    ['삼포왜란',1510,['부산포','제포']],['인조반정',1623,['홍제원','창덕궁']],
    ['정묘호란',1627,['안주성','강화도']],['망이·망소이의 난',1176,['공산성','명학소']]]){
    const empty={id:'empty',title,lo,basis:[{id:'empty-source'}]};
    const located=places.map((placeLabel,i)=>({id:`e${i}`,title,lo,placeLabel,sceneId:`scene${i}`,basis:[{id:`c${i}`}]}));
    for(const input of [[empty,...located],[...located,empty],[empty,...located.toReversed()]]){
      const merged=mergeEvents(input);assert.equal(merged.length,2);
      const first=input.find(row=>row.placeLabel);
      for(const original of located){
        const row=merged.find(row=>row.sceneId===original.sceneId);
        assert.equal(row.placeLabel,original.placeLabel);assert.equal(row.title,original.title);
        assert.deepEqual(new Set(row.basis.map(c=>c.id)),new Set([original.basis[0].id,...(first===original?['empty-source']:[])]));
      }
    }
  }
  const empty={id:'unknown',title:'임진왜란',lo:1592,basis:[{id:'unknown-source'}]};
  const located={id:'busan',title:'임진왜란',lo:1592,placeLabel:'부산진 일대',basis:[{id:'busan-source'}]};
  for(const input of [[empty,located],[located,empty]]){
    const merged=mergeEvents(input);assert.equal(merged.length,1);assert.equal(merged[0].placeLabel,'부산진 일대');
    assert.equal(merged[0].id,'busan');assert.equal(merged[0].basis.length,2);
  }
  const scene={...empty,sceneId:'unknown-place-scene'};
  for(const input of [[scene,located],[located,scene]]){
    const [merged]=mergeEvents(input);
    assert.equal(merged.sceneId,scene.sceneId);assert.equal(merged.placeLabel,scene.placeLabel);assert.equal(merged.title,scene.title);
  }
});

test('사건 카드의 다른 ID 중복은 연표·장소에서 빼고 출처는 남긴다',()=>{
  for(const [cardYear,rowYear,sceneYear] of [[1592,1592],[1592,undefined],[undefined,1592],[null,null],[1591,1592,1592]]){
    const entity={id:'event-hs-jl1-hansando',type:'Event',label:'한산도 대첩(1592)'};
    const story=storyFor(entity.id,'summary',{entities:[entity],claims:[],scenePackets:[]}),data=story.ui.data;
    const current={id:entity.id,title:entity.label,lo:cardYear,sceneId:'battle',placeLabel:'한산도'};
    const duplicate={id:'event-encykorea-hansando-daecheop-1592',title:'한산도대첩',lo:rowYear,placeLabel:'중복 장소',basis:[{id:'duplicate-source',quote:'중복 사건의 출처'}]};
    const differentYear={id:'different-year',title:'한산도 대첩',lo:1593,placeLabel:'한산도'};
    const differentTitle={id:'different-title',title:'다른 사건',lo:1592,placeLabel:'한산도'};
    data.events=[current,duplicate,differentYear,differentTitle];
    if(sceneYear!=null)data.scenes.set('battle',{startYear:sceneYear,place:{label:'한산도'}});
    story.sceneEvent=()=>current;
    story.relatedRows=()=>[duplicate,differentYear,differentTitle].map(e=>({entity:{id:e.id,type:'Event',label:e.title},claims:[]}));
    const sections=story.sections(story.relatedRows()),events=sections.find(s=>s.id==='events').rows;
    assert.ok(!events.some(e=>e.id===duplicate.id));
    assert.ok(events.some(e=>e.id===differentTitle.id));
    assert.equal(events.some(e=>e.id===differentYear.id),(sceneYear??cardYear)!=null);
    const places=sections.find(s=>s.id==='places').rows;
    assert.ok(!places.some(p=>p.label===duplicate.placeLabel));
    assert.ok(places.every(p=>[...p.events.values()].every(e=>e.id!==duplicate.id)));
    story.render();
    assert.equal((story.pane.innerHTML.match(/data-story-claim="duplicate-source"/g)||[]).length,1);
    assert.ok(!story.pane.innerHTML.includes(`data-story-entity="${duplicate.id}"`));
  }
});

test('장소와 연표는 긴 괄호 설명을 title에 남기고 짧은 이름을 표시한다',()=>{
  const story=storyFor(yi),label='한산도 수군 본영 (한산도 북서부 해안선 깊숙한 곳, 통영시 한산면 두억리)';
  const event={id:'base',title:'본영 운영',lo:1593,sceneId:'base-scene',placeLabel:label};
  assert.ok(story.eventHtml(event).includes(`class="atlas-event-place" title="${label}">한산도 수군 본영</small>`));
  const html=story.sectionHtml({id:'places',title:'장소',rows:mergePlaces([{label,sceneId:event.sceneId,events:new Map([['base',event]])},{label:'한산도 수군 본영'}])});
  assert.ok(html.includes(`<strong title="${label}">한산도 수군 본영</strong>`));
  assert.ok(html.includes('data-story-place="base-scene"'));
});

test('장소는 괄호 밖 이름이 같을 때만 합치며 사건 수로 정렬한다',()=>{
  const event={title:'주둔',lo:1587},rows=[
    {label:'녹둔도 (두만강 하류)',sceneId:'north',events:new Map([['one',event]])},
    {label:'녹둔도',entityId:'island',events:new Map([['one',event],['two',{title:'전투',lo:1588}]])},
    {label:'한산도',events:new Map()}, {label:'한산도 통제영(제승당)',events:new Map()}];
  const original=structuredClone(rows);
  for(const input of [rows,[...rows].reverse()]){
    const places=mergePlaces(input);assert.equal(places.length,3);assert.equal(places[0].label,'녹둔도');assert.equal(places[0].events.size,2);
    assert.equal(places[0].fullLabel,'녹둔도 (두만강 하류)');
    assert.equal(places[0].sceneId,'north');assert.equal(places[0].entityId,'island');
    assert.ok(places.some(p=>p.label==='한산도 통제영(제승당)'));
  }
  assert.deepEqual(rows,original);
});

test('작은 카드는 탭 없이 모든 목록을 표시하고 빈 탭은 숨긴다',()=>{
  const source={entities:[{id:'p',type:'Person',label:'사람'}],claims:[],scenePackets:[]},story=storyFor('p','summary',source);
  const events=Array.from({length:6},(_,i)=>({id:`e${i}`,title:`사건 ${i}`,lo:1500+i}));
  story.sections=()=>[{id:'people',title:'관계',rows:[]},{id:'events',title:'연표',rows:events},{id:'places',title:'장소',rows:[]},{id:'era',title:'시대',rows:[{label:'조선'}]}];
  story.render();assert.ok(!story.pane.innerHTML.includes('class="atlas-story-tabs"'));assert.equal((story.pane.innerHTML.match(/atlas-story-event"/g)||[]).length,6);
  events.push({id:'seventh',title:'일곱째 사건',lo:1507});story.render();
  assert.ok(story.pane.innerHTML.includes('class="atlas-story-tabs"'));assert.ok(!story.pane.innerHTML.includes('data-story-tab="people"'));assert.ok(!story.pane.innerHTML.includes('data-story-tab="places"'));
  assert.equal((story.pane.innerHTML.match(/atlas-story-event"/g)||[]).length,3);
});

test('연표와 장소는 12건까지 펼치고 13건부터 10건과 더 보기를 표시한다',()=>{
  const story=storyFor(yi);
  for(const id of ['events','places'])for(const count of [12,13]){
    const rows=Array.from({length:count},(_,i)=>id==='events'?{id:`e${i}`,title:`사건 ${i}`,lo:1592}:{label:`장소 ${i}`,sceneId:`s${i}`,events:new Map()});
    const section={id,title:id==='events'?'연표':'장소',rows};story.more.clear();
    const html=story.sectionHtml(section);assert.equal((html.match(/class="atlas-story-row/g)||[]).length,count===12?12:10);
    assert.equal(html.includes('data-story-more'),count===13);
    story.more.add(id);assert.equal((story.sectionHtml(section).match(/class="atlas-story-row/g)||[]).length,count);
  }
});

test('설명은 넘칠 때만 더 보기를 표시하고 펼친 뒤 접을 수 있다',()=>{
  const classes=new Set(),button={setAttribute(key,value){this[key]=value;}};
  const paragraph={clientHeight:90,scrollHeight:90,classList:{remove:value=>classes.delete(value),toggle(value,on){if(on)classes.add(value);else classes.delete(value);}}};
  const story=storyFor(yi);story.pane.querySelector=selector=>selector==='[data-story-expand]'?button:paragraph;
  story.updateDescription();assert.equal(button.hidden,true);
  paragraph.scrollHeight=120;story.updateDescription();assert.equal(button.hidden,false);assert.equal(button.textContent,'더 보기');
  story.expanded=true;story.updateDescription();assert.equal(button.textContent,'접기');assert.ok(classes.has('is-expanded'));assert.equal(button['aria-expanded'],'true');
  story.expanded=false;story.updateDescription();assert.ok(!classes.has('is-expanded'));
});

// ── #198 적대 리뷰 반영(C-1~C-6, C-25) ─────────────────────────────────────────
const fakeNode=name=>({name,hidden:false,attrs:{},tabIndex:0,focused:0,innerHTML:'',
  setAttribute(key,value){this.attrs[key]=value;},getAttribute(key){return this.attrs[key];},
  contains(){return false;},focus(){this.focused++;globalThis.document.activeElement=this;},querySelector(){return null;}});
const fakeUi=data=>{
  const ui=Object.create(AtlasUI.prototype);
  Object.assign(ui,{data,panel:'story',panes:new Map(),scene:{assets:{activeScene:'scene-noryang-1598'}},
    chronicle:{data:liveData,year:1598,callbacks:{scenePackets:()=>liveData.scenePackets},error:null,loading:false},
    root:{querySelector:()=>fakeNode('status')},registerPanel(){},openPanel(){this.panel='story';},
    closePanel(){this.panel=null;},closeEvidence(){},syncTime(){}});
  return ui;
};

test('changing only the year keeps the story history',async()=>{
  const previousDocument=globalThis.document,previousFetch=globalThis.fetch;
  globalThis.document={createElement:()=>fakeNode('pane'),body:{dataset:{}},activeElement:null,contains:()=>false};
  globalThis.fetch=async()=>({ok:true,json:async()=>({images:[]})});
  try{
    const data=new AtlasData();data.update(liveData,contextAt(liveData,1598),liveData.scenePackets);
    const ui=fakeUi(data);
    const story=new AtlasStory(ui);ui.story=story;
    story.show(data.entities.get(yi));
    assert.equal(story.history.length,0);
    AtlasUI.prototype.update.call(ui,contextAt(liveData,1598));
    AtlasUI.prototype.update.call(ui,contextAt(liveData,1592));  // 연도만 이동 — 카드도 히스토리도 남는다
    assert.equal(ui.panel,'story');
    assert.ok(story.entity,'연도 이동으로 카드가 사라지지 않는다');
    story.show(data.entities.get(noryang));
    assert.equal(story.history.length,1);
    assert.ok(story.pane.innerHTML.includes('<span>이전으로</span>'));
    await Promise.resolve();
  }finally{globalThis.document=previousDocument;globalThis.fetch=previousFetch;}
});

test('changing the source filter clears the story history',async()=>{
  const previousDocument=globalThis.document,previousFetch=globalThis.fetch;
  globalThis.document={createElement:()=>fakeNode('pane'),body:{dataset:{}},activeElement:null,contains:()=>false};
  globalThis.fetch=async()=>({ok:true,json:async()=>({images:[]})});
  try{
    const data=new AtlasData();data.update(liveData,contextAt(liveData,1598),liveData.scenePackets);
    const ui=fakeUi(data);
    const story=new AtlasStory(ui);ui.story=story;
    story.show(data.entities.get(yi));story.show(data.entities.get(noryang));
    assert.equal(story.history.length,1);
    ui.chronicle.data={...liveData};  // 자료 필터 변경 — 카드의 근거 자체가 달라진다
    AtlasUI.prototype.update.call(ui,contextAt(liveData,1598));
    assert.equal(story.history.length,0);
    assert.equal(story.entity,null);
    assert.equal(ui.panel,null);
    await Promise.resolve();
  }finally{globalThis.document=previousDocument;globalThis.fetch=previousFetch;}
});

test('timeline badge count matches rendered rows after collapsing',()=>{
  const rows=[{id:'h1',title:'행주대첩',lo:1593,sceneId:'scene-haengju',placeLabel:'고양 행주산성',basis:[{id:'b1'}]},
    {id:'h2',title:'행주 대첩',lo:1593,sceneId:'scene-hs-jl1-haengju-battle',placeLabel:'행주산성 대첩비 일대',basis:[{id:'b2'}]},
    {id:'m',title:'명량 해전',lo:1597,sceneId:'scene-myeongnyang',placeLabel:'울돌목'},
    {id:'n',title:'노량 해전',lo:1598,sceneId:'scene-noryang',placeLabel:'노량 앞바다'}];
  const collapsed=collapseEvents(mergeEvents(rows));
  assert.equal(collapsed.length,3);
  assert.deepEqual(new Set(collapsed.find(e=>e.lo===1593).basis.map(c=>c.id)),new Set(['b1','b2']));
  const story=storyFor(yi);story.ui.chronicle.year=1593;story.sceneEvent=()=>({lo:1593,sceneId:null});
  const html=story.sectionHtml({id:'events',title:'연표',rows:collapsed},true);
  assert.ok(html.includes('<h3>연표 <span class="atlas-section-count">3</span></h3>'));
  assert.equal((html.match(/atlas-story-event"/g)||[]).length,3);
  assert.ok(html.includes('노량 해전'),'1598 노량이 요약에서 밀려나지 않는다');
  const haengju=collapsed.find(row=>row.lo===1593);
  assert.ok(html.includes(`data-story-event="${haengju.sceneId}"`),'병합된 행도 장면으로 갈 수 있다');
  assert.ok(haengju.extraPlaces.length===1,'합쳐진 쪽 장소 표기를 버리지 않는다');
  assert.ok(html.includes('고양 행주산성')&&html.includes('행주산성 대첩비 일대'));
});

test('a label that is only a long parenthetical falls back to 장소 미확인',()=>{
  const label='(장소 미상 — 인용 출처에 광복 당일 장소와 건준 결성 장소가 없음)';
  assert.equal(shortLabel(label),'');
  const story=storyFor(yi);
  const html=story.eventHtml({id:'g',title:'광복',lo:1945,sceneId:'scene-gwangbok-geonjun-1945',placeLabel:label});
  assert.ok(html.includes(`class="atlas-event-place" title="${label}">장소 미확인</small>`));
  const places=mergePlaces([{label,sceneId:'scene-gwangbok-geonjun-1945',events:new Map()},
    {label:'(다른 긴 괄호 설명만 남은 장소 이름)',sceneId:'other',events:new Map()}]);
  assert.equal(places.length,2,'정규화 결과가 빈 라벨끼리 뭉치지 않는다');
  assert.ok(story.sectionHtml({id:'places',title:'장소',rows:places}).includes('>장소 미확인</strong>'));
});

test('a person with a concrete relation is not also listed under 같은 사건',()=>{
  const story=storyFor(yi),target=story.ui.data.entities.get('person-yinav-jin-rin');
  assert.ok(target);
  const claim={subject:yi,predicate:'syj:hasTeacher',object:{kind:'entity',id:target.id}};
  const row={entity:target,claims:[claim],relationClaims:[claim],sharedYears:new Set([1598])};
  assert.deepEqual(story.relationGroups([row]).map(group=>group.name),['스승']);
  const html=story.sectionHtml({id:'people',title:'관계',rows:[row]});
  assert.equal((html.match(/data-story-entity=/g)||[]).length,1);
  assert.ok(!html.includes('같은 사건'));
  const plain={entity:target,claims:[],relationClaims:[],sharedYears:new Set([1598])};
  assert.deepEqual(story.relationGroups([plain]).map(group=>group.name),['같은 사건']);
});

test('a related place with no events shows 연결된 사건 없음',()=>{
  const story=storyFor(yi);
  const rows=[{label:'통영 한산도 이충무공 유적',fullLabel:'통영 한산도 이충무공 유적',entityId:'place-yi',events:new Map()}];
  const html=story.sectionHtml({id:'places',title:'장소',rows});
  assert.ok(html.includes('<small>연결된 사건 없음</small>'));
  assert.ok(!html.includes('사건 0'));
});

test('switching tabs resets the body scroll to the top',async()=>{
  const previousDocument=globalThis.document,previousFetch=globalThis.fetch;
  const body={scrollTop:0};
  globalThis.document={createElement:()=>({setAttribute(){},querySelector(selector){return selector==='.atlas-story-body'?body:null;}})};
  globalThis.fetch=async()=>({ok:true,json:async()=>({images:[]})});
  try{
    const sample=storyFor(yi),ui={...sample.ui,registerPanel(){},openPanel(){},closePanel(){}};
    const story=new AtlasStory(ui);story.show(sample.entity);
    assert.equal(body.scrollTop,0);
    body.scrollTop=400;
    story.pane.onclick({target:{closest:selector=>selector==='[data-story-tab]'?{dataset:{storyTab:'events'}}:null}});
    assert.equal(body.scrollTop,0,'탭을 바꾸면 첫 행부터 보인다');
    body.scrollTop=250;
    story.pane.onclick({target:{closest:selector=>selector==='[data-story-more]'?{dataset:{storyMore:'events'}}:null}});
    assert.equal(body.scrollTop,250,'더 보기는 보던 자리를 지킨다');
    await Promise.resolve();
  }finally{globalThis.document=previousDocument;globalThis.fetch=previousFetch;}
});

test('opening a panel moves focus into it and closing restores it',()=>{
  const previousDocument=globalThis.document;
  const trigger=fakeNode('trigger'),pane=fakeNode('story'),settingsButton=fakeNode('settingsButton');
  globalThis.document={body:{dataset:{}},activeElement:trigger,contains:target=>target===trigger};
  try{
    const ui=Object.create(AtlasUI.prototype);
    Object.assign(ui,{panes:new Map([['story',pane]]),root:{querySelector:()=>settingsButton},scene:{},panel:null,
      closeEvidence(){},events:{hide(){}}});
    ui.openPanel('story');
    assert.equal(pane.focused,1);
    assert.equal(pane.attrs.role,'region');
    assert.equal(pane.tabIndex,-1);
    assert.equal(ui.returnFocus,trigger);
    ui.openPanel('story');
    assert.equal(pane.focused,1,'이미 열린 패널을 다시 열어도 포커스를 빼앗지 않는다');
    ui.closePanel();
    assert.equal(trigger.focused,1);
    assert.equal(ui.returnFocus,null);
    // 돌아갈 요소가 그 사이 사라졌으면 조용히 넘어간다
    ui.openPanel('story');globalThis.document.contains=()=>false;
    ui.closePanel();
    assert.equal(trigger.focused,1);
  }finally{globalThis.document=previousDocument;}
});
