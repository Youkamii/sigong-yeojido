import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {AtlasData,cleanTitle,relationName,relationDates} from '../services/host/app/atlas-data.js';
import {AtlasStory} from '../services/host/app/atlas-story.js';
import {contextAt,yearLabel} from '../services/host/app/chronicle.js';

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
function storyFor(id,mode='summary',source=liveData){
  const data=new AtlasData();data.update(source,contextAt(source,1598),source.scenePackets);
  return Object.assign(Object.create(AtlasStory.prototype),{entity:data.entities.get(id),mode,history:[],pane:{},
    ui:{data,chronicle:{year:1598},scene:{assets:{activeScene:'scene-noryang-1598'}}}});
}
const sectionHtml=(html,id)=>html.match(new RegExp(`<section[^>]*data-story-section="${id}"[\\s\\S]*?</section>`))?.[0];

test('실제 이순신·고하도 주둔 카드는 네 구역과 개수, 사건의 연도·제목·장소를 구분한다',()=>{
  for(const [id,title] of [[yi,'겪은 사건 연표'],['event-syj103-gohado-jujun-1597-1598','앞뒤 사건']])for(const mode of ['summary','relations']){
    const story=storyFor(id,mode),data=story.ui.data;
    assert.ok(story.entity,id);
    if(id===yi){
      assert.ok(data.eventsFor(id).length>=2);
      for(const type of ['Person','Place','Event'])assert.ok(story.relatedRows().some(r=>r.entity.type===type),type);
    }
    const groups=story.sections(story.relatedRows());story.render();const html=story.pane.innerHTML;
    for(const [key,label] of [['people','인물 관계'],['events',title],['places','장소'],['era','시대 배경']]){
      const section=sectionHtml(html,key);assert.ok(section,`${id}: ${key}`);
      assert.ok(section.includes(`<h3>${label} <span class="atlas-section-count">${groups.find(g=>g.id===key).rows.length}</span></h3>`));
    }
    const events=groups.find(g=>g.id==='events').rows;
    assert.ok(events.length>0);assert.ok(events.every(e=>e.id!==id));
    for(let i=1;i<events.length;i++)assert.ok((events[i-1].lo??Infinity)<=(events[i].lo??Infinity));
    const buttons=[...sectionHtml(html,'events').matchAll(/<button class="atlas-story-row atlas-story-event"[\s\S]*?<\/button>/g)].map(m=>m[0]);
    assert.equal(buttons.length,mode==='relations'?events.length:Math.min(8,events.length));
    for(const [index,button] of buttons.entries()){
      assert.ok(button.includes(`<span class="atlas-event-year">${yearLabel(events[index].lo)}</span>`));
      assert.match(button,/<strong class="atlas-event-title">[\s\S]+?<\/strong>/);
      assert.ok(button.includes(cleanTitle(events[index].title)));
      assert.match(button,/<small class="atlas-event-place">[^<]+<\/small>/);
      const scene=data.scenes.get(events[index].sceneId);
      if(scene)assert.ok(button.includes(`<small class="atlas-event-place">${scene.place.label}</small>`));
    }
    const places=groups.find(g=>g.id==='places').rows;
    assert.equal(new Set(places.map(p=>p.label.normalize('NFKC').trim())).size,places.length);
    assert.ok(places.some(p=>p.titles.size>0));
    assert.ok(html.includes('이야기의 출처 보기'));assert.match(html,/data-story-claim="[^"]+"/);
    assert.ok(!/근거|생몰|함께 살펴볼 사건/.test(html));
    if(id===yi){assert.ok(html.includes('출생 – 사망 · 1545년 – 1598년'));assert.ok(html.indexOf('출생 – 사망')<html.indexOf('class="atlas-role"'));}
  }
});

test('관계 이름은 방향을 반영하고 관계 자체에 기록된 시간만 표시한다',()=>{
  const parent={subject:'child',predicate:'syj:hasParent',object:{kind:'entity',id:'parent'},time:{earliest:1545,latest:1550}};
  assert.equal(relationName(parent,'child'),'부모');assert.equal(relationName(parent,'parent'),'자녀');
  assert.equal(relationDates(parent),'1545년 – 1550년');
  assert.equal(relationDates({...parent,time:{year:1592}}),'1592년');
  assert.equal(relationDates({...parent,time:undefined}),'');
  const story=storyFor(yi),target=story.ui.data.entities.get('person-yinav-jin-rin');
  assert.ok(target);
  const dated={...parent,subject:yi,object:{kind:'entity',id:target.id},predicate:'syj:hasTeacher'};
  const html=story.sectionHtml({id:'people',title:'인물 관계',rows:[{entity:target,claims:[dated],relationClaims:[dated]}]});
  assert.match(html,/<small>스승<\/small>/);assert.match(html,/<span class="atlas-relation-year">1545년 – 1550년<\/span>/);
  const unknown={...dated,predicate:'syj:unlistedRelation',time:undefined};
  assert.ok(story.sectionHtml({id:'people',title:'인물 관계',rows:[{entity:target,claims:[unknown],relationClaims:[unknown]}]}).includes('관련 인물'));
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

test('관계 모드는 30개 이후도 표시하고 빈 구역은 생략하며 나라가 없으면 시대를 표시한다',()=>{
  const story=storyFor(yi),rows=Array.from({length:35},(_,i)=>({entity:{id:`p${i}`,label:`인물 ${i}`,type:'Person'},claims:[]}));
  const group={id:'people',title:'인물 관계',rows};
  assert.equal((story.sectionHtml(group).match(/data-story-entity=/g)||[]).length,8);
  assert.ok(story.sectionHtml(group).includes('전체 35개 보기'));
  story.mode='relations';assert.equal((story.sectionHtml(group).match(/data-story-entity=/g)||[]).length,35);
  assert.equal(story.sectionHtml({...group,rows:[]}), '');
  const empty={entities:[{id:'empty',type:'Person',label:'기록 없는 인물'}],claims:[],scenePackets:[]};
  const sparse=storyFor('empty','summary',empty);sparse.render();
  assert.ok(sectionHtml(sparse.pane.innerHTML,'era').includes('조선'));
  assert.equal(sectionHtml(sparse.pane.innerHTML,'people'),undefined);
  assert.equal(sectionHtml(sparse.pane.innerHTML,'places'),undefined);
});

test('장소 중복을 합치고 해당 사건 이름을 보존한다',()=>{
  const story=storyFor(yi),data=story.ui.data,event=story.sceneEvent(),scene=data.scenes.get(event.sceneId);
  const place={entity:{id:'duplicate-place',type:'Place',label:scene.place.label},claims:[]};
  const rows=story.sections([...story.relatedRows(),place]).find(s=>s.id==='places').rows;
  const matches=rows.filter(p=>p.label===scene.place.label);assert.equal(matches.length,1);
  assert.equal(matches[0].entityId,'duplicate-place');assert.ok(matches[0].titles.has(cleanTitle(scene.title)));
});

test('인물·사건·장소·출처 버튼과 관계/뒤로 동작을 유지한다',async()=>{
  const previousDocument=globalThis.document,previousFetch=globalThis.fetch,calls=[];
  globalThis.document={createElement:()=>({setAttribute(){}})};
  globalThis.fetch=async()=>({ok:true,json:async()=>({images:[]})});
  try{
    const sample=storyFor(yi),ui={...sample.ui,registerPanel(){},openPanel(){},evidence:c=>calls.push(['claim',c.id]),
      chronicle:{...sample.ui.chronicle,showEntity:id=>calls.push(['entity',id]),showEvent:e=>calls.push(['event',e.sceneId])}};
    const story=new AtlasStory(ui);story.show(sample.entity);
    const click=(selector,dataset={})=>story.pane.onclick({target:{closest:s=>s===selector?{dataset}:null}});
    const event=story.sceneEvent(),claim=ui.data.claims.values().next().value;
    click('[data-story-entity]',{storyEntity:noryang});click('[data-story-event]',{storyEvent:event.sceneId});
    click('[data-story-place]',{storyPlace:event.sceneId});click('[data-story-claim]',{storyClaim:claim.id});
    assert.deepEqual(calls,[['entity',noryang],['event',event.sceneId],['event',event.sceneId],['claim',claim.id]]);
    click('[data-story-relations]');assert.equal(story.mode,'relations');click('[data-story-back]');assert.equal(story.mode,'summary');
    await Promise.resolve();
  }finally{globalThis.document=previousDocument;globalThis.fetch=previousFetch;}
});
