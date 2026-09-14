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
const {HERITAGE_TYPES,HERITAGE_DISPLAY}=await import('../services/host/app/heritage-models.js');
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
    const packet={...original,itemId:'hs-test',place:{...original.place,coordinateNote:partial?'항목 좌표 조사':undefined}};
    const data={entities:[],claims:partial?sample.claims.filter(c=>packet.dateClaimIds.includes(c.id)):[],scenePackets:[packet]};
    const context=contextAt(data,packet.startYear),plan=planChronicleAssets(context,data,[],[],[packet]);
    const assets=assetsFor(plan),row=assets.rows.find(r=>r.itemId);
    assert.ok(row);assert.ok(assets.picks.includes(row.pick));
    assert.equal(plan.events[0].participants.length,0);
    const sceneView=Object.assign(Object.create(ChronicleScene.prototype),{assets,world,chronicle:{data}});
    const card=Object.assign(Object.create(Chronicle.prototype),{data,context,year:packet.startYear,host:{},stopPlay(){},relations:()=>[],
      callbacks:{entity(){},activity:id=>sceneView.activity(id)}});
    const activity=sceneView.activity(row.entityId);
    const missing=[...new Set([...packet.dateClaimIds,...packet.actionClaimIds,...packet.place.claimIds])].filter(id=>!data.claims.some(c=>c.id===id));
    assert.deepEqual(activity.missingClaimIds,missing);
    assert.equal(activity.placement,'항목 조사에서 확인한 좌표');
    if(partial)assert.equal(activity.coordinateNote,'항목 좌표 조사');
    card.showEntity(row.entityId);
    assert.ok(card.host.innerHTML.includes(packet.title));
    assert.ok(card.host.innerHTML.includes('항목 조사에서 확인한 좌표'));
    assert.ok(card.host.innerHTML.includes(`근거 ${missing.length}건은 현재 선택한 사료 밖`));
    const atlas=new AtlasData();atlas.update(data,context,[packet]);
    const story=Object.assign(Object.create(AtlasStory.prototype),{entity:{id:row.entityId,type:'Event',label:packet.title},activity,history:[],pane:{},
      ui:{data:atlas,chronicle:card,scene:sceneView}});
    story.render();
    assert.ok(story.pane.innerHTML.includes('항목 조사에서 확인한 좌표'));
    assert.ok(story.pane.innerHTML.includes(`근거 ${missing.length}건은 현재 선택한 사료 밖`));
    for(const claim of data.claims)assert.ok(story.pane.innerHTML.includes(`data-story-claim="${claim.id}"`));
    sceneView.chronicle.data={claims:[...new Set([...packet.dateClaimIds,...packet.actionClaimIds,...packet.place.claimIds])].map(id=>({id}))};
    assert.equal(sceneView.activity(row.entityId).missingClaimsNote,'');
  }
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
  const packet={...sample.scenes[1],persistence:{kind:'facility',from:1441,to:1946,basisClaimIds:['recorded']}};
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
  for(const [setting,archetype] of Object.entries({palace:'palace',office:'academy_hall',temple:'pagoda',battle:'wall',village:'house',academy:'academy_hall'})){
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
