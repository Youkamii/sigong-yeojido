import test from 'node:test';
import assert from 'node:assert/strict';
import {AtlasData} from '../services/host/app/atlas-data.js';
import {AtlasStory} from '../services/host/app/atlas-story.js';
import {loadChronicle,mergeSameEntities} from '../services/host/app/chronicle-load.js';

const canonical='person-encykorea-sejong-e0029857',old='ent-wea-sejong';
const identity=(id,subject,target)=>({id,subject,predicate:'syj:sameEntityAs',object:{kind:'entity',id:target}});
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
  for(const [id,aliases] of [[canonical,'세종장헌왕, 世宗莊憲王'],['place','漢城, 한양']]){
    const story=storyFor(data,id);story.render();
    assert.ok(story.pane.innerHTML.includes(`<p class="atlas-story-aliases">다른 이름: ${aliases}</p>`));
    if(id===canonical)assert.ok(story.pane.innerHTML.indexOf('조선의 왕')<story.pane.innerHTML.indexOf('다른 이름:'));
  }
  const story=storyFor(data,old);story.show(data.entities.get(old));
  assert.equal(story.entity.id,canonical);
  assert.ok(story.pane.innerHTML.includes('<h2>세종</h2>'));
  assert.ok(story.pane.innerHTML.includes('다른 이름: 세종장헌왕, 世宗莊憲王'));
  assert.ok(story.pane.innerHTML.includes('data-story-claim="identity"'));
});

test('별칭이 없으면 줄을 생략하고 별칭 문자열은 HTML로 해석하지 않는다',()=>{
  const data=fixture(),story=storyFor(data,canonical);
  story.entity.aliases=['<옛 이름>'];story.render();
  assert.ok(story.pane.innerHTML.includes('다른 이름: &lt;옛 이름&gt;'));
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

for(const split of ['limit','url','single'])for(const reverse of [false,true]){
  test(`응답을 모두 모은 뒤 같은 인물을 묶고 정본 하나만 검색한다 (${split}, reverse=${reverse})`,async()=>{
    const spelling='person-joseon-sejong';
    const parts=[
      {entities:[{id:spelling,type:'Person',label:'세종대왕',labelHanja:'世宗',aliases:['충녕대군']}],claims:[
        {id:'description',subject:spelling,subjectLabel:'세종대왕',predicate:'syj:describedAs',object:{kind:'literal',value:'조선의 왕'},sourceId:'sillok'},
        {id:'reference',subject:'event',predicate:'syj:hasParticipant',object:{kind:'entity',id:spelling}},
      ],hasMore:false},
      {entities:[{id:canonical,type:'Person',label:'세종',aliases:['세종장헌왕']}],claims:[identity('identity',spelling,canonical)],hasMore:false},
    ];
    if(reverse)parts.reverse();
    const original=structuredClone(parts),calls=[];
    const sources=split==='single'?['source-all']:['source-a','source-b'].map(id=>id+(split==='url'?'x'.repeat(24000):''));
    const request=async url=>{
      const selected=new URL(url,'https://example.org').searchParams.get('sources');calls.push(selected);
      const data=split==='single'?{entities:parts.flatMap(p=>p.entities),claims:parts.flatMap(p=>p.claims),hasMore:false}:
        selected===sources.join(',')?{entities:[],claims:[],hasMore:true}:parts[sources.indexOf(selected)];
      assert.ok(data);
      return {ok:true,json:async()=>data};
    };
    const result=await loadChronicle(sources,'human',undefined,request);
    assert.equal(calls.length,split==='single'?1:split==='url'?2:3);
    assert.equal(result.entities.find(e=>e.id===spelling).mergedInto,canonical);
    const merged=result.entities.find(e=>e.id===canonical);
    assert.deepEqual(merged.aliases,['세종장헌왕','세종대왕','世宗','충녕대군']);
    assert.deepEqual(merged.mergedIds,[spelling]);
    assert.equal(result.claims.find(c=>c.id==='description').subject,canonical);
    assert.equal(result.claims.find(c=>c.id==='description').subjectLabel,'세종');
    assert.equal(result.claims.find(c=>c.id==='reference').object.id,canonical);
    assert.deepEqual(result.claims.find(c=>c.id==='identity'),identity('identity',spelling,canonical));
    assert.deepEqual(parts,original);
    assert.deepEqual(mergeSameEntities(result),result);
    const data=new AtlasData();data.update(result,{year:1418,allEvents:[]},[]);
    assert.deepEqual(data.searchable.map(row=>row.entity.id),[canonical]);
    for(const query of ['세종','세종대왕','世宗','충녕대군']){
      assert.deepEqual(data.search(query,'Person').map(row=>row.entity.id),[canonical]);
    }
  });
}

test('동일성 주장은 양쪽 개체가 있고 종류가 같을 때만 묶는다',()=>{
  const data={entities:[
    {id:canonical,type:'Person',label:'세종'},
    {id:'place-sejong',type:'Place',label:'세종'},
    {id:old,type:'Person',label:'옛 세종'},
    {id:'unknown-a',label:'미상'},
    {id:'unknown-b',label:'미상'},
  ],claims:[
    identity('different',canonical,'place-sejong'),
    identity('missing-subject','absent',canonical),
    identity('missing-object',canonical,'absent'),
    identity('unknown-type','unknown-a','unknown-b'),
    {id:'literal',subject:old,predicate:'syj:sameEntityAs',object:{kind:'literal',id:canonical,value:canonical}},
    {id:'related',subject:old,predicate:'syj:relatedTo',object:{kind:'entity',id:canonical}},
  ]};
  const result=mergeSameEntities(data);
  assert.deepEqual(result.entities,data.entities);
  assert.equal(result.claims.find(c=>c.id==='related').subject,old);
});

test('서버의 정본 방향과 새 동일성 간선을 함께 따라 하나의 정본으로 모은다',()=>{
  const serverCanonical='person-hs-sejong',latest='person-joseon-sejong';
  const data={entities:[
    {id:canonical,type:'Person',label:'백과 세종',mergedInto:serverCanonical},
    {id:serverCanonical,type:'Person',label:'세종',aliases:['기존 별칭'],mergedIds:[canonical]},
    {id:old,type:'Person',label:'세종 옛 이름',mergedInto:canonical},
    {id:latest,type:'Person',label:'세종대왕'},
  ],claims:[identity('new-edge',old,latest),
    {id:'description',subject:latest,subjectLabel:'세종대왕',predicate:'syj:describedAs',object:{kind:'entity',id:old}},
  ],hasMore:false};
  const original=structuredClone(data);
  const result=mergeSameEntities(data),root=result.entities.find(e=>!e.mergedInto);
  assert.equal(root.id,serverCanonical);
  assert.deepEqual(root.mergedIds,[old,canonical,latest].sort());
  for(const entity of result.entities.filter(e=>e.id!==root.id))assert.equal(entity.mergedInto,root.id);
  for(const alias of ['기존 별칭','백과 세종','세종 옛 이름','세종대왕'])assert.ok(root.aliases.includes(alias));
  const claim=result.claims.find(c=>c.id==='description');
  assert.equal(claim.subject,root.id);
  assert.equal(claim.subjectLabel,root.label);
  assert.equal(claim.object.id,root.id);
  assert.deepEqual(result.claims.find(c=>c.id==='new-edge'),data.claims[0]);
  assert.deepEqual(data,original);
  assert.deepEqual(mergeSameEntities(result),result);
});

test('정본은 AKS 번호, 백과 접두사, hs, 주체 주장 수, id 순서로 고른다',()=>{
  const cases=[
    ['person-encykorea-sejong-e0029857','person-encykorea-a','Person'],
    ['place-encykorea-hanseong-e0000001','place-encykorea-a','Place'],
    ['person-encykorea-sejong','person-hs-sejong','Person'],
    ['place-encykorea-hanseong','place-hs-hanseong','Place'],
    ['person-hs-sejong','person-a','Person'],
    ['person-z','person-a','Person',true],
    ['person-a','person-z','Person'],
  ];
  for(const [winner,loser,type,moreClaims] of cases){
    const claims=[identity('forward',winner,loser),identity('backward',loser,winner)];
    const subject=moreClaims?winner:loser;
    if(moreClaims||winner.includes('encykorea')||winner.includes('-hs-'))claims.push(
      {id:'extra',subject,predicate:'syj:describedAs',object:{kind:'literal',value:'설명'}});
    const result=mergeSameEntities({entities:[{id:loser,type,label:'다른 이름'},{id:winner,type,label:'정본'}],claims});
    assert.equal(result.entities.find(e=>!e.mergedInto).id,winner);
  }
});

test('정본으로 바꾼 중복 주장은 출처별로 가장 작은 id를 남긴다',()=>{
  const claim=(id,subject,object,source)=>({id,subject,predicate:'syj:relatedTo',object,...source});
  const data={entities:[{id:canonical,type:'Person',label:'세종'},{id:old,type:'Person',label:'옛 이름'}],claims:[
    identity('identity',old,canonical),
    claim('z',old,{kind:'entity',id:old,extra:{b:2,a:[1,2]}},{sourceId:'source-a'}),
    claim('a',canonical,{extra:{a:[1,2],b:2},id:canonical,kind:'entity'},{fromSource:'source-a'}),
    claim('b',old,{kind:'entity',id:old,extra:{a:[1,2],b:2}},{chunk:{sourceId:'source-a'}}),
    claim('c',old,{kind:'entity',id:old,extra:{b:2,a:[1,2]}},{sourceId:'source-b'}),
    claim('d',old,{kind:'entity',id:old,extra:{b:2,a:[2,1]}},{sourceId:'source-a'}),
  ]};
  const original=structuredClone(data),result=mergeSameEntities(data);
  assert.deepEqual(result.claims.map(c=>c.id),['a','c','d','identity']);
  assert.deepEqual(data,original);
});

test('검색 순위는 다른 표기가 붙어도 정확히 맞는 이름을 먼저 둔다 (#192)',()=>{
  const data=new AtlasData();data.update({entities:[
    {id:'person-a',type:'Person',label:'세종',aliases:['세종장헌왕','세종장헌대왕']},
    {id:'event-b',type:'Event',label:'세종대 경연 운영'},
  ],claims:[]},{year:1418,allEvents:[]},[]);
  const rows=data.search('세종');
  assert.equal(rows[0].entity.id,'person-a');
  assert.equal(rows[1].entity.id,'event-b');
  assert.equal(data.search('장헌대왕')[0].entity.id,'person-a');
});
