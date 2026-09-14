import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return s==='three'?{url:new URL('../services/host/vendor/three.module.min.js',import.meta.url).href,shortCircuit:true,format:'module'}:n(s,c);}});
// 텍스처 캔버스만 대체한다. 조립·메시·pick·카드 코드는 실제 모듈을 쓴다.
globalThis.document={createElement:()=>({getContext:()=>new Proxy({getImageData:()=>({data:new Uint8ClampedArray(512*512*4)})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const THREE=await import('three');
const {composeHistoricalEvent}=await import('../services/host/app/chronicle-event-scenes.js');
const {planChronicleAssets}=await import('../services/host/app/chronicle-asset-plan.js');
const {ChronicleAssets,pickableRow}=await import('../services/host/app/chronicle-assets.js');
const {ChronicleScene}=await import('../services/host/app/chronicle-scene.js');
const {Chronicle,contextAt}=await import('../services/host/app/chronicle.js');
const {AtlasStory}=await import('../services/host/app/atlas-story.js');
const {AtlasData}=await import('../services/host/app/atlas-data.js');
const {compileAssetCatalog}=await import('../services/host/app/assetcatalog.js');
const {buildAssetField}=await import('../services/host/app/assetforge.js');
const {extendFigureCatalog}=await import('../services/host/app/period-figures.js');
const {extendBuildingCatalog,buildingArchetype}=await import('../services/host/app/period-buildings.js');
const {HERITAGE_TYPES,HERITAGE_DISPLAY,heritageLook}=await import('../services/host/app/heritage-models.js');
const {planContinuingFacilities}=await import('../services/host/app/facility-persistence.js');
const {sceneVisualKey}=await import('../services/host/app/chronicle-persistence.js');
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const sample=read('./fixtures/scene-kinds-190/history-scenes.sample.json');
const catalog=compileAssetCatalog(extendBuildingCatalog(extendFigureCatalog(read('../services/host/app/history-asset-catalog.json'))));
const world={contains:()=>true,surfaceAt:()=>10,toWorld:(x,z)=>[x,z],ground:[],sky:[],time:null,cata:null};
function assetsFor(plan){
  const assets=Object.create(ChronicleAssets.prototype);
  Object.assign(assets,{world,catalog,engine:{camera:new THREE.PerspectiveCamera(),add(){},remove(){},_tagShadows(){}},group:new THREE.Group(),revision:0,
    scenery:{sync(){},start(){},clearings:[]},buildForest(){},setSelected(){},
    field:(recipes,anchors)=>buildAssetField({world:{...world,anchorOf:id=>anchors.get(id)},catalog,recipes,seed:'190'})});
  assets.rebuild(plan);return assets;
}
function eventFor(packet){
  const context=contextAt({...sample,scenePackets:[packet]},packet.startYear,0);
  return planChronicleAssets(context,sample,[],[],[packet]).events.find(e=>e.id===packet.id);
}
const compose=e=>composeHistoricalEvent(e,new THREE.Vector3(0,10,0),world);

test('항목 portrait와 heritage는 빈 사료에서도 실제 모형과 양쪽 카드에 좌표와 누락 안내를 표시한다',()=>{
  for(const original of sample.scenes.slice(0,2))for(const partial of [false,true]){
    const packet={...original,itemId:'hs-test',participants:(original.participants||[]).map(p=>({...p,role:'ruler'})),place:{...original.place,coordinateNote:partial?'항목 좌표 조사':undefined}};
    const data={entities:[],claims:partial?sample.claims.filter(c=>packet.dateClaimIds.includes(c.id)):[],scenePackets:[packet]};
    const context=contextAt(data,packet.startYear),plan=planChronicleAssets(context,data,[],[],[packet]);
    // #186: 항목 인물 장면은 근거가 로드되지 않아도 주인공 조형(person 행)이 서고, 문화재는 사건 행이 선다.
    const assets=assetsFor(plan),row=assets.rows.find(r=>r.sceneId===packet.id&&['event','person'].includes(r.kind));
    assert.ok(row);assert.ok(assets.picks.includes(row.pick));
    assert.equal(plan.events[0].participants.length,packet.kind==='portrait'?1:0);
    if(packet.kind==='portrait')assert.ok(assets.rows.some(r=>r.sceneId===packet.id&&r.kind==='person'));
    const sceneView=Object.assign(Object.create(ChronicleScene.prototype),{assets,world,chronicle:{data}});
    const card=Object.assign(Object.create(Chronicle.prototype),{data,context,year:packet.startYear,host:{},stopPlay(){},relations:()=>[],
      callbacks:{entity(){},activity:id=>sceneView.activity(id)}});
    const activity=sceneView.activity(plan.events[0].entityId);
    const missing=[...new Set([...packet.dateClaimIds,...packet.actionClaimIds,...packet.place.claimIds])].filter(id=>!data.claims.some(c=>c.id===id));
    assert.deepEqual(activity.missingClaimIds,missing);
    assert.equal(activity.placement,'항목 조사에서 확인한 좌표');
    if(partial)assert.equal(activity.coordinateNote,'항목 좌표 조사');
    card.showEntity(plan.events[0].entityId);
    assert.ok(card.host.innerHTML.includes(packet.title));
    if(packet.kind==='portrait'){
      // 로드되지 않은 인물 조형을 눌러도 인물 카드가 뜨고 역할은 한글이다.
      const lead=plan.events[0].participants[0];
      assert.equal(lead.role,'군주');
      card.showEntity(lead.entityId);assert.ok(card.host.innerHTML.includes(packet.title));
      assert.ok(!assets.rows.some(r=>r.role==='ruler'));
      card.showEntity(plan.events[0].entityId);  // 사건 카드로 되돌려 아래 누락 안내 검사를 잇는다
    }
    assert.ok(card.host.innerHTML.includes('항목 조사에서 확인한 좌표'));
    assert.ok(card.host.innerHTML.includes(`근거 ${missing.length}건은 현재 선택한 사료 밖`));
    const atlas=new AtlasData();atlas.update(data,context,[packet]);
    const story=Object.assign(Object.create(AtlasStory.prototype),{entity:{id:plan.events[0].entityId,type:'Event',label:packet.title},activity,history:[],pane:{},
      ui:{data:atlas,chronicle:card,scene:sceneView}});
    story.render();
    assert.ok(story.pane.innerHTML.includes('항목 조사에서 확인한 좌표'));
    assert.ok(story.pane.innerHTML.includes(`근거 ${missing.length}건은 현재 선택한 사료 밖`));
    for(const claim of data.claims)assert.ok(story.pane.innerHTML.includes(`data-story-claim="${claim.id}"`));
    sceneView.chronicle.data={claims:[...new Set([...packet.dateClaimIds,...packet.actionClaimIds,...packet.place.claimIds])].map(id=>({id}))};
    assert.equal(sceneView.activity(plan.events[0].entityId).missingClaimsNote,'');
  }
});
test('문화재 실루엣은 유형과 제목으로 고른다',()=>{
  for(const [type,title,look] of [['artifact','거북선','ship'],['artifact','칠지도 — 백제가 왜에 보낸 일곱 가지 칼','heritage_blade'],['artifact','대동여지도','hanging_scroll'],
    ['artifact','난중일기','book'],['artifact','성덕대왕 신종','heritage_bell'],['artifact','논산 관촉사 석조미륵보살입상','heritage_statue'],['artifact','고려청자','heritage_jar'],
    ['artifact','발해 상경성 석등','heritage_lantern'],['artifact','혼천의','heritage_instrument'],['artifact','신라 금관','heritage_pedestal'],
    ['site','첨성대','heritage_tower'],['site','독립문','gatehouse'],['site','탑골 공원','memorial'],['site','서대문 형무소','prison'],['site','독도 영유권 문제','heritage_site'],
    ['tomb','문무대왕릉(대왕암)','heritage_tomb'],['pagoda','x','pagoda'],['hall','x','hall'],['fortress','x','fortress']])assert.equal(heritageLook(type,title),look,title);
});
test('옮길 수 있는 유물은 닫힌 기간이나 돌 붙박이일 때만 존속한다',()=>{
  const base={...sample.scenes[1],persistence:{kind:'facility',from:1441,to:null,basisClaimIds:['recorded']}};
  const rows=(packet,year)=>planContinuingFacilities([packet],{year,events:[]}).length;
  assert.equal(rows(base,1500),0);
  assert.equal(rows({...base,persistence:{...base.persistence,to:1592}},1500),1);
  assert.equal(rows({...base,persistence:{...base.persistence,to:1592}},1600),0);
  assert.equal(rows({...base,title:'논산 관촉사 석조미륵보살입상'},1500),1);
  assert.equal(rows({...base,heritageType:'stele'},1500),1);
});
test('전승 이야기가 없는 항목 tradition 장면은 책 무대로 조립된다',()=>{
  const packet={...sample.scenes[0],id:'scene-hs-test-women',itemId:'hs-test-women',kind:'tradition',narrativeType:null,participants:[],participantGroups:null,sides:null};
  delete packet.narrative;
  const event=eventFor(packet);assert.ok(event);assert.equal(event.archetype,'tradition');
  const scene=compose(event);
  assert.equal(scene.models.find(m=>m.primary)?.archetype,'book');
});
for(const packet of sample.scenes.slice(0,2))test(`${packet.title}: packet → row → mesh → pick → existing card`,()=>{
  const event=eventFor(packet);assert.ok(event);
  const scene=compose(event);assert.equal(scene.compositionKind,packet.kind);assert.ok(scene.models.some(m=>m.primary));
  const assets=assetsFor({year:event.year,events:[event],people:[]});
  const row=assets.rows.find(r=>r.kind===(packet.kind==='portrait'?'person':'event'));
  assert.ok(row);assert.ok(pickableRow(row));assert.ok(assets.picks.includes(row.pick));
  assert.ok(assets.group.children.length);assert.equal(assets.stats.dropped.length,0);
  const sceneView=Object.assign(Object.create(ChronicleScene.prototype),{assets,world});
  const card=Object.assign(Object.create(Chronicle.prototype),{data:sample,year:event.year,host:{},stopPlay(){},relations:()=>[],
    callbacks:{entity(){},activity:id=>sceneView.activity(id)}});
  card.showEntity(row.entityId);
  assert.ok(card.host.innerHTML.includes(packet.title));assert.ok(card.host.innerHTML.includes(`${packet.startYear}년`));
  assert.ok(card.host.innerHTML.includes(packet.summary));
});
test('portrait has one main person, at most four attendants, shared radius and survives compact mode',()=>{
  const event=eventFor(sample.scenes[0]);
  event.participants.push({...event.participants[0],id:'second'});
  event.participantGroups=[{role:'scholar',count:3},{role:'soldier',count:12}];
  const scene=compose(event);assert.equal(scene.radius,HERITAGE_DISPLAY.radius*HERITAGE_DISPLAY.scale);
  assert.equal(scene.models.filter(m=>m.person).length,1);
  assert.equal(compose({...event,sceneFunction:'fortress'}).models.filter(m=>m.role).length,4);assert.equal(scene.models.filter(m=>m.role).length,4);
  assert.ok(compose({...event,compact:true}).models.some(m=>m.primary&&m.person));
  const compact=compose({...event,compact:true,maxRadius:1});
  assert.equal(compact.displayScale,1/HERITAGE_DISPLAY.radius);
  assert.ok(compact.models.some(m=>m.primary&&!m.person));
});
test('all nine heritage types build pickable meshes with no people or dropped recipes',()=>{
  for(const heritageType of HERITAGE_TYPES){
    const event={...eventFor(sample.scenes[1]),heritageType};
    const city={...event,id:'city',entityId:'city',archetype:'settlement'};
    const hosted=assetsFor({year:1441,events:[city,event],people:[]});
    assert.equal(hosted.sceneCache.get(event.id).scene.displayScale,HERITAGE_DISPLAY.scale);
    const assets=assetsFor({year:1441,events:[event],people:[]});
    assert.equal(assets.stats.dropped.length,0,heritageType);
    assert.ok(assets.rows.some(r=>r.kind==='event'&&assets.picks.includes(r.pick)),heritageType);
    assert.equal(assets.rows.some(r=>r.kind==='person'),false);
  }
});
test('explicit heritage facility interval preserves the model and excludes people and out-of-range years',()=>{
  // #186: 옮길 수 있는 유물(artifact)은 존속 행을 만들지 않으므로 붙박이 유형(stele)으로 검사한다.
  const packet={...sample.scenes[1],heritageType:'stele',persistence:{kind:'facility',from:1441,to:1946,basisClaimIds:['recorded']}};
  const rows=year=>planContinuingFacilities([packet],{year,events:[]});
  assert.equal(rows(1441).length,0);assert.equal(rows(1947).length,0);
  for(const year of [1442,1946]){
    const row=rows(year)[0];assert.ok(row);
    const continued=compose(row),original=compose(eventFor(packet));
    assert.deepEqual(continued.models.map(m=>[m.archetype,m.scale]),original.models.map(m=>[m.archetype,m.scale]));
    assert.equal(row.participants.length,0);assert.equal(pickableRow(row),false);
    for(const text of [row.label,row.summary,row.continuing.basis,row.scenePlace.displayBasis])assert.match(text,/기록된 존속\(근거 1건\)/);
  }
  for(const from of [undefined,null,NaN,Infinity,'1441'])assert.equal(planContinuingFacilities([{...packet,persistence:{...packet.persistence,from}}],{year:1442,events:[]}).length,0);
  assert.equal(planContinuingFacilities([{...packet,persistence:undefined}],{year:1442,events:[]}).length,0);
  const current={...packet,persistence:{...packet.persistence,to:null}};
  assert.equal(planContinuingFacilities([current],{year:2100,events:[]}).length,1);
  assert.equal(planContinuingFacilities([current],{year:2101,events:[]}).length,0);
});

test('cache keys distinguish heritage shape, floors and portrait setting',()=>{
  const event={...eventFor(sample.scenes[1]),heritageType:'pagoda'},key=e=>sceneVisualKey(e,new THREE.Vector3(),false,100,world);
  assert.notEqual(key(event),key({...event,heritageType:'stele'}));
  assert.notEqual(sceneVisualKey(event,new THREE.Vector3(),true,1,world),sceneVisualKey(event,new THREE.Vector3(),true,2,world));
  assert.notEqual(key(event),key({...event,heritageFloors:5}));
  assert.notEqual(key(event),key({...event,scenePlace:{...event.scenePlace,setting:'temple'}}));
  assert.equal(compose({...event,heritageFloors:5}).models[0].archetype,'heritage_pagoda_5');
});

test('unknown heritage type falls back to the site model',()=>{
  for(const heritageType of ['castle','__proto__',undefined]){
    const event={...eventFor(sample.scenes[1]),heritageType};
    assert.equal(compose(event).models[0].archetype,'heritage_site');
    assert.equal(assetsFor({year:event.year,events:[event],people:[]}).stats.dropped.length,0);
  }
});
test('portrait setting table ignores sceneFunction and keeps the event card without people',()=>{
  const event=eventFor(sample.scenes[0]);
  for(const [setting,archetype] of Object.entries({palace:'palace',office:'academy_hall',temple:'pagoda',battle:'banner',village:'house',academy:'academy_hall'})){
    const expected=compose({...event,scenePlace:{...event.scenePlace,setting}}).models[0];
    const mapped={palace:'korean_hall',academy_hall:'korean_academy',house:'korean_house'}[archetype]||archetype;
    assert.equal(expected.archetype,buildingArchetype(mapped,event.year,{seed:0,latitude:event.scenePlace.coordinates[1]}));
    assert.equal(compose({...event,sceneFunction:'temple',scenePlace:{...event.scenePlace,setting}}).models[0].archetype,expected.archetype);
  }
  for(const missing of ['participants','context']){
    const packet={...sample.scenes[0],...(missing==='participants'?{participants:[]}:{})};
    const context=contextAt({...sample,scenePackets:[packet]},packet.startYear,0);
    context.people=[];
    const planned=planChronicleAssets(context,sample,[],[],[packet]);
    const event=planned.events.find(e=>e.id===packet.id);
    const neighbor={...event,id:'neighbor',entityId:'event-neighbor',scenePlace:{...event.scenePlace,coordinates:[event.scenePlace.coordinates[0]+2,event.scenePlace.coordinates[1]]}};
    const assets=assetsFor({year:event.year,events:[neighbor,event],people:[]});
    const row=assets.rows.find(r=>r.id===event.id&&r.kind==='event');
    assert.ok(row,missing);assert.ok(row.compact);assert.ok(assets.picks.includes(row.pick));
    assert.equal(assets.unlocated.some(r=>r.id===event.id),false);
    const view=Object.assign(Object.create(ChronicleScene.prototype),{assets,world});
    const card=Object.assign(Object.create(Chronicle.prototype),{data:sample,year:event.year,host:{},stopPlay(){},relations:()=>[],callbacks:{entity(){},activity:id=>view.activity(id)}});
    card.showEntity(row.entityId);assert.ok(card.host.innerHTML.includes(packet.title));
  }
  const assets=assetsFor({year:event.year,events:[event],people:[]});
  assert.equal(assets.rows.filter(r=>r.sceneId===event.id&&r.kind==='event').length,1);
  assert.equal(assets.rows.filter(r=>r.sceneId===event.id&&r.kind==='person').length,1);
  assert.equal(new Set(assets.rows.map(r=>r.id)).size,assets.rows.length);
});

const stageEvent=(archetype,year=1500,title='항목',extra={})=>({id:'stage-'+archetype,itemId:'hs-stage-'+archetype,archetype,kind:archetype,year,title,label:title,
  summary:'',participants:[],effects:{},scenePlace:{setting:null,medium:'land',coordinates:[0,0]},...extra});
const primaryOf=scene=>scene.models.find(m=>m.primary)?.archetype;
const hasModel=(scene,pattern)=>scene.models.some(m=>pattern.test(m.archetype));
const stageCases=[
  ['court',1500,'정책',/^era_joseon_hall_/,/book/,6,'scholar'],
  ['court',1900,'정책',/^era_earlymodern_hall_/,/book/,6,'civilian'],
  ['assembly',1500,'모임',/^era_joseon_hall_/,/book/,8,'scholar'],
  ['assembly',1876,'모임',/^banner$/,/era_earlymodern_hall_/,16,'civilian'],
  ['survey',1500,'토지 조사',/^hanging_scroll$/,/handcart/,3,'scholar'],
  ['survey',2000,'호구 조사',/^hanging_scroll$/,/book/,3,'civilian'],
  ['ritual',1200,'팔관회',/^pagoda$/,/era_goryeo_hall_/,4,'monk'],
  ['ritual',1988,'올림픽 행사',/^era_modern_hall_/,/banner/,12,'civilian'],
  ['ritual',1500,'종묘 제례',/^table$/,/pine/,6,'scholar'],
  ['ritual',1900,'신사 참배 불교',/^table$/,/pine/,6,'civilian'],
  ['construction',1500,'산성 건설',/^era_joseon_gate_/,/^wall$/],
  ['construction',1500,'경복궁 중건',/^era_joseon_hall_/,/groundbreaking/,6,'worker'],
  ['construction',1500,'석탑 건립',/^pagoda$/,/handcart/],
  ['construction',1975,'산업 개발 계획',/^steelworks$/,/car/],
  ['construction',1500,'시설 건설',/^era_joseon_courtyard_/,/handcart/],
  ['tradition',1500,'생활 제도',/^book$/,/era_joseon_house_/,2,'civilian'],
  ['tradition',1500,'탈춤 놀이',/^book$/,/string_instrument/,4,'civilian'],
  ['tradition',2000,'생활 문화',/^book$/,/banner/,4,'civilian'],
  ['excavation',-501,'고인돌 유적',/^era_early_house_/,/standing_stone/,4,'civilian'],
  ['excavation',1200,'청자 가마 요지',/^era_goryeo_store_/,/handcart/],
  ['excavation',-500,'무덤 유적',/^heritage_tomb$/,/pine/],
  ['excavation',1500,'옛 유적',/^dig_site$/,/book/],
  ['market',1500,'교역',/^era_joseon_market_/,/handcart/],
  ['market',1900,'장터',/^era_earlymodern_market_/,/handcart/],
  ['market',2000,'장터',/^era_modern_market_/,/handcart/],
  ['market',2000,'은행 금융 위기',/^era_modern_hall_/,/car/,6,'civilian'],
  ['migration',1500,'이주',/^handcart$/,/figure_joseon_commoner/,12,'civilian'],
  ['fire',1500,'화재',/^era_joseon_house_/,/figure_joseon_commoner/,4,'civilian'],
  ['disaster',1500,'홍수',/^era_joseon_store_/,/figure_joseon_commoner/,8,'civilian'],
  ['settlement',-501,'청동 취락',/^era_early_house_/,/standing_stone/,4,'civilian'],
  ['relief',1500,'구제',/^grain_stack$/,/handcart/],
];
for(const [kind,year,title,primary,symbol,count,role] of stageCases)test(`kind stage: ${kind} ${year} ${title}`,()=>{
  const event=stageEvent(kind,year,title),scene=compose(event);
  assert.match(primaryOf(scene),primary);assert.ok(hasModel(scene,symbol));
  assert.equal(scene.models.filter(m=>m.primary).length,1);
  if(count!==undefined)assert.equal(scene.models.filter(m=>m.role===role).length,count);
  const compact=compose({...event,compact:true});
  assert.equal(compact.models.length,1);assert.match(primaryOf(compact),primary);
  const assets=assetsFor({year,events:[event],people:[]});
  assert.equal(assets.stats.dropped.length,0,JSON.stringify(assets.stats.dropped));
});

test('setting stages select the building behind the symbol and keep books on tables',()=>{
  for(const kind of ['court','assembly','survey','ritual','fire'])for(const [setting,shape] of Object.entries({palace:/_hall_/,office:/_hall_/,academy:/_hall_/,temple:/^pagoda$/,village:/_house_/,battle:/^banner$/})){
    const scene=compose(stageEvent(kind,1500,'항목',{scenePlace:{setting,medium:'land'}}));
    const expected=kind==='ritual'&&setting==='temple'?/_hall_/:shape;  // 유교·민속 제례(종묘·사직)는 사당 전각
    assert.ok(scene.models.some(m=>expected.test(m.archetype)&&m.position.x===0&&m.position.z===-14),kind+' '+setting);
    if(['court','assembly','survey'].includes(kind)){
      const book=scene.models.find(m=>m.archetype==='book'),table=scene.models.find(m=>m.archetype==='table');
      assert.deepEqual(book.position,table.position);assert.ok(book.lift>0);
    }
  }
});

test('court omits an anonymous ruler only for an on-site ruler',()=>{
  for(const role of ['ruler','왕','임금','국왕'])for(const presence of ['on-site','related']){
    const scene=compose(stageEvent('court',1500,'정책',{participants:[{id:'king',role,presence,archetype:'period_ruler'}]}));
    assert.equal(scene.models.filter(m=>!m.person&&m.role==='ruler').length,presence==='on-site'?0:1);
  }
});

test('assembly and modern ritual use front semicircles with radius at most twelve',()=>{
  for(const [kind,year,title,count] of [['assembly',1500,'모임',8],['assembly',2000,'모임',16],['ritual',2000,'축제',12]]){
    const people=compose(stageEvent(kind,year,title)).models.filter(m=>m.role);
    assert.equal(people.length,count);
    for(const m of people){assert.ok(m.position.z>0);assert.ok(Math.hypot(m.position.x,m.position.z)<=12.000001);}
  }
  const special=compose(stageEvent('assembly',1860,'모임',{id:'scene-jl-donghak-yongdam-1860'}));
  assert.match(primaryOf(special),/_courtyard_/);assert.equal(special.models.some(m=>m.role),false);
});

test('construction classification reads the title and summary and includes workers',()=>{
  for(const [summary,primary] of [['성곽',/_gate_/],['궁궐',/_hall_/],['사찰',/^pagoda$/],['산업 정책',/^steelworks$/]]){
    const scene=compose(stageEvent('construction',1900,'항목',{label:'표시',summary}));
    assert.match(primaryOf(scene),primary);assert.ok(scene.models.some(m=>m.action==='working'));
  }
  for(const title of ['요지','가마','자기','청자','백자','분청','도자','굽']){
    const scene=compose(stageEvent('excavation',1500,title));
    assert.equal(scene.compositionKind,'kiln');assert.match(primaryOf(scene),/_store_/);
  }
});

test('prehistoric settlements and sites have huts and residents without palaces or walls',()=>{
  for(const kind of ['settlement','excavation']){
    const scene=compose(stageEvent(kind,-1000,'고인돌'));
    assert.equal(scene.models.filter(m=>/_house_/.test(m.archetype)).length,kind==='settlement'?5:3);
    assert.equal(scene.models.filter(m=>m.archetype==='rural_figure').length,4);
    assert.ok(!hasModel(scene,/hall|palace|wall|gate/));assert.ok(hasModel(scene,/grain_stack/));
  }
  assert.equal(hasModel(compose(stageEvent('settlement',-500,'도시')),/rural_figure/),false);
});

test('fire defaults to the primary stage and disaster has deterministic civilian victims',()=>{
  for(const fireTargets of [undefined,[]]){
    const scene=compose(stageEvent('fire',1500,'화재',{scenePlace:{setting:'office'},visualActions:{fireTargets}}));
    const fires=scene.group.children.filter(m=>m.name==='event-fire');
    assert.equal(fires.length,1);assert.equal(fires[0].position.z,scene.models.find(m=>m.primary).position.z);
    assert.equal(scene.models.filter(m=>m.action==='walking').length,4);
  }
  const event=stageEvent('disaster'),scene=compose(event),victims=scene.models.filter(m=>m.stance==='victim');
  assert.equal(victims.length,8);assert.ok(victims.every(m=>m.action==='idle'&&m.position.z>0));
  assert.ok(!hasModel(scene,/soldier|spearman|commander/));
  assert.deepEqual(scene.models.map(m=>m.position),compose(event).models.map(m=>m.position));
});

test('land naval stages put three period ships offshore and four people on the coast',()=>{
  const coast={...world,contains:(x,z)=>z<10,seaLevel:0};
  for(const year of [1500,2000])for(const compact of [false,true]){
    const scene=composeHistoricalEvent(stageEvent('naval',year,'출항',{compact}),new THREE.Vector3(0,10,0),coast);
    const shipType=year>=1876?'motor_ship':'ship',ships=scene.models.filter(m=>m.archetype===shipType);
    assert.equal(scene.compositionKind,'naval_expedition');assert.equal(primaryOf(scene),shipType);
    assert.equal(ships.length,compact?1:3);assert.ok(ships.every(m=>!coast.contains(m.position.x,m.position.z)));
    assert.equal(scene.models.filter(m=>m.medium==='land').length,compact?0:4);
  }
  // 물이 없는 세계에서는 배를 놓을 수 없으므로 선착장이 primary 로 남아 장면이 사라지지 않는다.
  assert.equal(primaryOf(compose(stageEvent('naval'))),'boat_slip');
});

test('explicit scene functions and existing regex stages keep priority over kind stages',()=>{
  for(const kind of ['court','assembly','survey','ritual','construction','tradition','excavation','market','migration','naval','fire','disaster','settlement','relief']){
    const scene=compose(stageEvent(kind,2000,'산업 은행 궁 탑',{sceneFunction:'print_workshop'}));
    assert.equal(scene.compositionKind,'print_workshop');assert.match(primaryOf(scene),/_hall_/);
    assert.equal(scene.models.filter(m=>m.role==='printer').length,6);
    assert.equal(scene.group.children.some(m=>m.name==='event-fire'),false);
  }
  for(const [kind,title,expected] of [['court','학교 교육','teaching'],['assembly','철도 개통','rail'],['construction','제철소 건설','industry'],['fire','법전 화형식 분신','fire']]){
    const scene=compose(stageEvent(kind,2000,title));assert.equal(scene.compositionKind,expected);
    if(kind==='fire')assert.equal(primaryOf(scene),'book');
  }
  const expanded=extendBuildingCatalog(read('../services/host/app/history-asset-catalog.json'));
  for(const era of ['earlymodern','modern'])for(let i=0;i<3;i++)assert.ok(expanded.blueprints[`era_${era}_market_${i}`]);
});

test('review fixes: item-only construction/naval stages, ruler omission by Korean role, fire gate, megalith, land-anchored sea scenes',()=>{
  // 옛(비항목) 공사·해군 장면은 한 글자 매칭이나 근거 없는 함대 없이 기존 범용 무대를 유지한다
  const legacy=(archetype,title,extra={})=>({...stageEvent(archetype,1500,title,extra),itemId:undefined});
  assert.match(primaryOf(compose(legacy('construction','나로우주센터 설립과 나로호 1차 발사 —'))),/_courtyard_/);
  assert.match(primaryOf(compose(legacy('construction','보림사 철조비로자나불 주성 발원'))),/_courtyard_/);
  assert.match(primaryOf(compose(legacy('naval','주원방포 출항'))),/_courtyard_/);
  // 항목 고인돌 축조는 선돌이 상징물
  const megalith=compose(stageEvent('construction',-800,'강화 부근리 지석묘'));
  assert.equal(primaryOf(megalith),'standing_stone');assert.ok(hasModel(megalith,/handcart/));
  assert.equal(megalith.models.filter(m=>m.action==='working').length,6);
  // asset-plan 이 role 을 '군주' 로 넘겨도 익명 군주를 겹쳐 세우지 않는다(왕비는 군주가 아니다)
  const anonymousRulers=scene=>scene.models.filter(m=>!m.person&&m.role==='ruler').length;
  assert.equal(anonymousRulers(compose(stageEvent('court',1500,'항목',{participants:[{id:'k',entityId:'k',role:'군주',presence:'on-site',archetype:'figure_joseon_ruler'}]}))),0);
  assert.equal(anonymousRulers(compose(stageEvent('court',1500,'항목',{participants:[{id:'q',entityId:'q',role:'왕비',presence:'on-site',archetype:'figure_joseon_scholar'}]}))),1);
  // kind fire: 항목 장면은 effect 기록 없이도 불이 붙고, 명시적으로 꺼진 옛 장면은 불이 없다
  const fires=scene=>scene.group.children.filter(c=>c.name==='event-fire').length;
  assert.equal(fires(compose(stageEvent('fire',1232,'초조대장경 소실',{scenePlace:{setting:'temple',medium:'land'}}))),1);
  assert.equal(fires(compose(legacy('fire','영흥사 화재',{effects:{fire:{enabled:false,claimIds:[]}}}))),0);
  // 바다 장면인데 기준점이 육지면 배를 해안 밖에 두는 원정 무대로(이전에는 배가 전부 생략돼 장면이 비었다)
  const coast={...world,contains:(x,z)=>z<10,seaLevel:0};
  const harbor=composeHistoricalEvent(legacy('naval','왜구의 침입',{scenePlace:{setting:null,medium:'sea',coordinates:[0,0]}}),new THREE.Vector3(0,10,0),coast);
  assert.equal(harbor.compositionKind,'naval_expedition');assert.equal(primaryOf(harbor),'ship');
  assert.ok(harbor.models.filter(m=>m.archetype==='ship').every(m=>!coast.contains(m.position.x,m.position.z)));
  // primary 무대 건물이 물에 빠지면 기준점으로 되돌려 장면이 남는다
  const island={...world,contains:(x,z)=>Math.hypot(x,z)<5};
  const court=composeHistoricalEvent(stageEvent('court',1500,'항목'),new THREE.Vector3(0,10,0),island);
  assert.ok(court.models.some(m=>m.primary&&m.position.x===0&&m.position.z===0));
  // 종묘·사직(setting temple, 불교 아님)은 제단 뒤에 탑이 아니라 전각이 선다
  const jongmyo=compose(stageEvent('ritual',1395,'종묘 — 종묘 (1395)',{scenePlace:{setting:'temple',medium:'land'}}));
  assert.equal(primaryOf(jongmyo),'table');assert.ok(!hasModel(jongmyo,/^pagoda$/));assert.ok(hasModel(jongmyo,/_hall_/));
});

test('a scene sharing its point with another scene (maxRadius 0) keeps a finite positive scale',()=>{
  for(const [kind,extra] of [['heritage',{heritageType:'statue',title:'연가 7년명 금동여래입상',label:'연가 7년명 금동여래입상'}],['portrait',{scenePlace:{setting:'battle',medium:'land'}}],['court',{compact:false}]]){
    const scene=compose({...stageEvent(kind,1593,'항목',extra),maxRadius:0});
    assert.ok(scene.models.length>0,kind);
    assert.ok(scene.models.every(m=>Number.isFinite(m.scale)&&m.scale>0&&[m.position.x,m.position.y,m.position.z].every(Number.isFinite)),kind);
    assert.ok(scene.displayScale>0);
  }
});
