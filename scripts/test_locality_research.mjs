import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {contextAt} from '../services/host/app/chronicle.js';
import {planChronicleAssets} from '../services/host/app/chronicle-asset-plan.js';
import {coordinateRegistry,regionalCoordinate} from '../services/host/app/history-coordinates.js';

const json=async path=>JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8'));
const packets=(await json('services/host/app/history-scenes.json')).scenes;
const anchors=await json('services/host/app/history-place-anchors.json');
const registry=coordinateRegistry(anchors,await json('services/host/app/history-coordinates.json'));
const claims=[];
for(const name of await readdir(new URL('../data/claims/',import.meta.url),{recursive:true})){
  if(!name.replaceAll('\\','/').includes('/scenes-128/')||!name.endsWith('.md'))continue;
  const text=await readFile(new URL('../data/claims/'+name.replaceAll('\\','/'),import.meta.url),'utf8');
  claims.push(...JSON.parse(text.match(/```claims-json\r?\n([\s\S]*?)\r?\n```/)[1]));
}
const entities=new Map();
for(const job of ['ancient_settlements','middle_kingdoms','late_goryeo','early_joseon','later_joseon','modern_localities']){
  for(const e of (await json('data/research/scenes-128/'+job+'/result.json')).entities)entities.set(e.id,e);
}
const data={entities:[...entities.values()],claims,scenePackets:packets};
const plan=year=>planChronicleAssets(contextAt(data,year),data,[],anchors.places,packets,registry);
assert.equal(claims.length,289);
for(const [year,id] of [[470,'event-syj128-naengsuri-503'],[550,'event-syj128-daegu-ojak']]){
  assert.ok(!contextAt(data,year).events.some(e=>e.id===id&&e.current),'Alternative candidate dates are not a continuous event');
  assert.ok(!plan(year).events.some(e=>e.entityId===id));
}
for(const [year,id] of [[503,'scene-syj128-pohang-naengsuri-503'],[518,'scene-syj128-daegu-ojak'],[858,'scene-syj128-borimsa-birojana-858'],[938,'scene-syj128-tamna-mallo-938']]){
  const event=plan(year).events.find(e=>e.id===id);
  assert.ok(event.scenePlace?.displayBasis,'Reference regions keep their explicit placement explanation');
  assert.ok(event.participants.every(p=>p.presence==='related'),'A reference region does not establish personal attendance');
}
for(const [year,id] of [[536,'scene-syj128-yeongcheon-cheongje-536'],[1544,'scene-ej-saryangjin-waebyeon-1544'],[1587,'scene-ej-sonjukdo-1587'],[1287,'scene-lg128-jewangungi-samcheok-1287']]){
  assert.equal(plan(year).events.find(e=>e.id===id).scenePlace,null,'Missing sites cannot fall back to a different place');
}
const revolt=plan(1174).events.find(e=>e.id==='scene-lg128-jowichong-seogyeong-1174');
assert.equal(revolt.effects.attack.enabled,false);
assert.deepEqual(revolt.participants.map(p=>p.entityId),['person-lg128-jo-wichong']);
assert.equal(plan(1176).events.find(e=>e.id===revolt.id).effects.attack.enabled,true);
assert.equal(plan(1236).events.find(e=>e.id==='scene-lg128-jukjuseong-1236').effects.fire.enabled,false);
assert.equal(plan(1795).events.find(e=>e.id==='scene-syj128-kim-mandeok-jeju-1795').effects.ships.enabled,false);
assert.deepEqual(plan(1415).events.find(e=>e.id==='scene-ej-byeokgolje-1415').visualActions.constructionYears,[1415]);
assert.equal(regionalCoordinate(registry,'place-encykorea-namyeongdong').precision,'site');
for(const id of ['place-encykorea-gungjeongdong','place-yinav-jangmunpo','place-encykorea-bongodong']){
  assert.equal(regionalCoordinate(registry,id),null,'A nearby administrative point must not stand in for an unidentified site');
}
for(const id of ['place-shanghai','place-encykorea-shanghai-hongkou-park'])assert.ok(regionalCoordinate(registry,id));
console.log('PASS: 289 imported claims, alternative dates, reference regions, missing sites, dated people/effects and four coordinate links');
