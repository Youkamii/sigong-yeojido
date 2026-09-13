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
const {compileAssetCatalog}=await import('../services/host/app/assetcatalog.js');
const {buildAssetField}=await import('../services/host/app/assetforge.js');
const {extendFigureCatalog}=await import('../services/host/app/period-figures.js');
const {extendBuildingCatalog}=await import('../services/host/app/period-buildings.js');
const {extendHeritageCatalog,HERITAGE_TYPES}=await import('../services/host/app/heritage-models.js');
const {planContinuingFacilities}=await import('../services/host/app/facility-persistence.js');
const {sceneVisualKey}=await import('../services/host/app/chronicle-persistence.js');
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const sample=read('./fixtures/scene-kinds-190/history-scenes.sample.json');
const catalog=compileAssetCatalog(extendHeritageCatalog(extendBuildingCatalog(extendFigureCatalog(read('../services/host/app/history-asset-catalog.json')))));
const world={contains:()=>true,surfaceAt:()=>10,toWorld:(x,z)=>[x,z],ground:[],sky:[],time:null,cata:null};
function assetsFor(plan){
  const assets=Object.create(ChronicleAssets.prototype);
  Object.assign(assets,{world,catalog,engine:{add(){},remove(){},_tagShadows(){}},group:new THREE.Group(),revision:0,
    scenery:{sync(){},start(){},clearings:[]},buildForest(){},setSelected(){},
    field:(recipes,anchors)=>buildAssetField({world:{...world,anchorOf:id=>anchors.get(id)},catalog,recipes,seed:'190'})});
  assets.rebuild(plan);return assets;
}
function eventFor(packet){
  const context=contextAt({...sample,scenePackets:[packet]},packet.startYear,0);
  return planChronicleAssets(context,sample,[],[],[packet]).events.find(e=>e.id===packet.id);
}
const compose=e=>composeHistoricalEvent(e,new THREE.Vector3(0,10,0),world);
for(const packet of sample.scenes)test(`${packet.title}: packet → row → mesh → pick → existing card`,()=>{
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
test('portrait has one main person, at most four attendants, radius 7 and survives compact mode',()=>{
  const event=eventFor(sample.scenes[0]);
  event.participants.push({...event.participants[0],id:'second'});
  event.participantGroups=[{role:'scholar',count:3},{role:'soldier',count:12}];
  const scene=compose(event);assert.equal(scene.radius,7);
  assert.equal(scene.models.filter(m=>m.person).length,1);
  assert.equal(compose({...event,sceneFunction:'fortress'}).models.filter(m=>m.role).length,4);assert.equal(scene.models.filter(m=>m.role).length,4);
  assert.ok(compose({...event,compact:true}).models.some(m=>m.primary&&m.person));
  for(const setting of ['palace','office','temple','battle','village',''])assert.ok(compose({...event,scenePlace:{...event.scenePlace,setting}}).models.some(m=>m.primary));
});
test('all nine heritage types build pickable meshes with no people or dropped recipes',()=>{
  for(const heritageType of HERITAGE_TYPES){
    const event={...eventFor(sample.scenes[1]),heritageType};
    const assets=assetsFor({year:1441,events:[event],people:[]});
    assert.equal(assets.stats.dropped.length,0,heritageType);
    assert.ok(assets.rows.some(r=>r.kind==='event'&&assets.picks.includes(r.pick)),heritageType);
    assert.equal(assets.rows.some(r=>r.kind==='person'),false);
  }
});
test('explicit heritage facility interval preserves the model and excludes people and out-of-range years',()=>{
  for(const heritageType of HERITAGE_TYPES){
    const packet={...sample.scenes[1],heritageType,persistence:{kind:'facility',from:1441,to:1444}};
    const rows=year=>planContinuingFacilities([packet],{year,events:[]});
    assert.equal(rows(1441).length,0);assert.equal(rows(1445).length,0);
    for(const year of [1442,1444]){
      const row=rows(year)[0];assert.ok(row,heritageType);
      assert.deepEqual(compose(row).models.map(m=>m.archetype),compose(eventFor(packet)).models.map(m=>m.archetype));
      assert.equal(row.participants.length,0);assert.equal(pickableRow(row),false);
    }
    assert.equal(planContinuingFacilities([{...packet,persistence:undefined}],{year:1442,events:[]}).length,0);
  }
});
test('cache keys distinguish heritage shape, floors and portrait setting',()=>{
  const event=eventFor(sample.scenes[2]),key=e=>sceneVisualKey(e,new THREE.Vector3(),false,100,world);
  assert.notEqual(key(event),key({...event,heritageType:'stele'}));
  assert.notEqual(key(event),key({...event,heritageFloors:5}));
  assert.notEqual(key(event),key({...event,scenePlace:{...event.scenePlace,setting:'temple'}}));
  assert.equal(compose({...event,heritageFloors:5}).models[0].archetype,'heritage_pagoda_5');
});
