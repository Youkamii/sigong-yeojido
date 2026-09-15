import test from 'node:test';
import assert from 'node:assert/strict';
import {AtlasData} from '../services/host/app/atlas-data.js';
import {AtlasStory} from '../services/host/app/atlas-story.js';
import {loadChronicle} from '../services/host/app/chronicle-load.js';

const canonical='person-encykorea-sejong-e0029857',old='ent-wea-sejong';
function fixture(){
  const entities=[
    {id:canonical,type:'Person',label:'세종',aliases:['세종장헌왕','世宗莊憲王'],mergedIds:[old]},
    {id:old,type:'Person',label:'세종장헌왕',mergedInto:canonical},
    {id:'place',type:'Place',label:'한성',aliases:['漢城','한양']},
    {id:'event',type:'Event',label:'즉위'},
    {id:'event-old',type:'Event',label:'즉위 옛 표기',mergedInto:'event'},
  ];
  const claims=[
    {id:'identity',subject:old,predicate:'syj:sameEntityAs',object:{kind:'entity',id:canonical}},
    {id:'participant',subject:'event',predicate:'syj:hasParticipant',object:{kind:'entity',id:canonical}},
    {id:'place',subject:canonical,predicate:'syj:relatedTo',object:{kind:'entity',id:'place'}},
    {id:'description',subject:canonical,predicate:'syj:describedAs',object:{kind:'literal',value:'조선의 왕'}},
  ];
  const packets=[{id:'scene',eventId:'event',title:'즉위',startYear:1418,
    participants:[{entityId:old,claimIds:['participant']},{entityId:canonical,claimIds:['participant']}]}];
  const context={year:1418,allEvents:[{id:'event',title:'즉위',lo:1418,hi:1418,sceneId:'scene'},
    {id:'event-old',title:'즉위 옛 표기',lo:1418,hi:1418,sceneId:'scene'}]};
  const data=new AtlasData();data.update({entities,claims},context,packets);
  return data;
}
function storyFor(data,id){
  return Object.assign(Object.create(AtlasStory.prototype),{entity:data.entities.get(id),mode:'summary',history:[],pane:{},
    ui:{data,chronicle:{year:1418},scene:{assets:{}},openPanel(){}}});
}

test('검색은 병합된 개체를 빼고 한글·한자 다른 표기로 정본을 찾는다',()=>{
  const data=fixture();
  for(const query of ['세종','세종장헌왕','世宗莊憲王']){
    assert.deepEqual(data.search(query,'Person').map(r=>r.entity.id),[canonical]);
    assert.ok(data.search(query).every(r=>!r.entity.mergedInto));
  }
  assert.deepEqual(data.search('즉위').map(r=>r.entity.id),['event']);
  assert.equal(data.entities.get(old).label,'세종장헌왕');
  assert.equal(data.label(data.entities.get(old)),'세종장헌왕');
});

test('옛 id의 관계와 사건을 정본으로 읽고 동일성 주장은 출처에 남긴다',()=>{
  const data=fixture();
  assert.deepEqual(data.relations(old),data.relations(canonical));
  assert.deepEqual(data.relations(canonical).map(r=>r.entity.id),['event','place']);
  assert.deepEqual(data.eventsFor(old),data.eventsFor(canonical));
  assert.deepEqual(data.eventsFor(old).map(e=>e.id),['event']);
  assert.ok(data.subjects.get(canonical).some(c=>c.id==='identity'&&c.subject===old));
  assert.equal(data.description(old),'조선의 왕');
  assert.equal(data.datesLabel(old),data.datesLabel(canonical));
  data.links.clear();
  assert.deepEqual(data.eventsFor(canonical).map(e=>e.id),['event']);
});

test('장면 참여자 관계 목록에도 같은 사람이 한 번만 나온다',()=>{
  const data=fixture(),story=storyFor(data,'event');
  assert.deepEqual(story.relatedRows().map(r=>r.entity.id),[canonical]);
  story.render();
  assert.ok(!story.pane.innerHTML.includes(`data-story-entity="${old}"`));
});

test('인물·장소 카드 설명 아래에 다른 표기를 표시하고 옛 id도 정본 카드를 연다',()=>{
  const data=fixture();
  for(const [id,aliases] of [[canonical,'세종장헌왕 · 世宗莊憲王'],['place','漢城 · 한양']]){
    const story=storyFor(data,id);story.render();
    assert.ok(story.pane.innerHTML.includes(`<p class="atlas-story-aliases">다른 표기 · ${aliases}</p>`));
    if(id===canonical)assert.ok(story.pane.innerHTML.indexOf('조선의 왕')<story.pane.innerHTML.indexOf('다른 표기'));
  }
  const story=storyFor(data,old);story.show(data.entities.get(old));
  assert.equal(story.entity.id,canonical);
  assert.ok(story.pane.innerHTML.includes('<h2>세종</h2>'));
  assert.ok(story.pane.innerHTML.includes('다른 표기 · 세종장헌왕 · 世宗莊憲王'));
  assert.ok(story.pane.innerHTML.includes('data-story-claim="identity"'));
});

test('별칭이 없으면 줄을 생략하고 별칭 문자열은 HTML로 해석하지 않는다',()=>{
  const data=fixture(),story=storyFor(data,canonical);
  story.entity.aliases=['<옛 이름>'];story.render();
  assert.ok(story.pane.innerHTML.includes('다른 표기 · &lt;옛 이름&gt;'));
  story.entity.aliases=[];story.render();
  assert.ok(!story.pane.innerHTML.includes('atlas-story-aliases'));
});

for(const split of ['limit','url'])for(const reverse of [false,true]){
  test(`나뉜 응답의 병합 정보를 보존해 정본만 검색한다 (${split}, reverse=${reverse})`,async()=>{
    const rich={id:canonical,type:'Person',label:'세종',aliases:['세종장헌왕','世宗莊憲王'],mergedIds:[old]};
    const spelling={id:old,type:'Person',label:'세종장헌왕',mergedInto:canonical};
    const parts=[
      {entities:[rich,{id:old,type:'Person',label:'세종장헌왕'}],claims:[],hasMore:false},
      {entities:[{id:canonical,type:'Person',label:'세종'},spelling],claims:[
        {id:'identity',subject:old,predicate:'syj:sameEntityAs',object:{kind:'entity',id:canonical}},
      ],hasMore:false},
    ];
    if(reverse)parts.reverse();
    const original=structuredClone(parts),calls=[],controller=new AbortController();
    const sources=['source-a','source-b'].map(id=>id+(split==='url'?'x'.repeat(24000):''));
    const request=async(url,options)=>{
      const params=new URL(url,'https://example.org').searchParams;
      assert.equal(params.get('origin'),'human');
      assert.equal(options.signal,controller.signal);
      const selected=params.get('sources');calls.push(selected);
      const data=selected===sources.join(',')?{entities:[],claims:[],hasMore:true}:parts[sources.indexOf(selected)];
      assert.ok(data);
      return {ok:true,json:async()=>data};
    };
    const result=await loadChronicle(sources,'human',controller.signal,request);
    assert.equal(calls.length,split==='url'?2:3);
    assert.equal(result.hasMore,false);
    assert.equal(result.entities.length,2);
    assert.deepEqual(result.entities.find(e=>e.id===canonical),rich);
    assert.deepEqual(result.entities.find(e=>e.id===old),spelling);
    assert.deepEqual(parts,original);
    const data=new AtlasData();data.update(result,{year:1418,allEvents:[]},[]);
    for(const query of ['세종','세종장헌왕','世宗莊憲王']){
      assert.deepEqual(data.search(query,'Person').map(r=>r.entity.id),[canonical]);
    }
    assert.ok(data.subjects.get(canonical).some(c=>c.id==='identity'));
  });
}
