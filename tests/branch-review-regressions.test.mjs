import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){return specifier==='three'?{url:new URL('../services/host/vendor/three.module.min.js',import.meta.url).href,shortCircuit:true,format:'module'}:next(specifier,context);}});
const THREE=await import('three');
const {ChronicleAssets}=await import('../services/host/app/chronicle-assets.js');
const {compileAssetCatalog}=await import('../services/host/app/assetcatalog.js');
const {extendBuildingCatalog}=await import('../services/host/app/period-buildings.js');
const {extendFigureCatalog}=await import('../services/host/app/period-figures.js');
const {sceneVisualKey}=await import('../services/host/app/chronicle-persistence.js');
const {urbanRegionAt}=await import('../services/host/app/urban-regions.js');
const {composeHistoricalEvent}=await import('../services/host/app/chronicle-event-scenes.js');
const {planContinuingFacilities}=await import('../services/host/app/facility-persistence.js');
const chronicle=await import('../services/host/app/chronicle.js');
// 기존 city-lod 테스트와 같은 캔버스 대체. 텍스처 그리기만 생략한다.
globalThis.document={createElement:()=>({getContext:()=>new Proxy({getImageData:()=>({data:new Uint8ClampedArray(512*512*4)}),createImageData:()=>({data:new Uint8ClampedArray(512*512*4)})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const read=name=>readFileSync(new URL('../services/host/'+name,import.meta.url),'utf8');
const catalog=compileAssetCatalog(extendBuildingCatalog(extendFigureCatalog(JSON.parse(read('app/history-asset-catalog.json')))));
const {scenes:packets}=JSON.parse(read('app/history-scenes.json'));
const flat={contains:()=>true,surfaceAt:()=>1,seaLevel:0,toWorld:(x,z)=>[x,z]};
const event=(id,archetype,x,z,medium='land')=>({id,entityId:id,label:id,summary:'',year:1801,
  archetype,participants:[],effects:{},scenePlace:{label:id,coordinates:[x,z],medium}});
function assetsFor(world){
  const scene=new THREE.Scene();
  const assets=new ChronicleAssets({scene,camera:new THREE.PerspectiveCamera(),add:g=>scene.add(g),remove:g=>scene.remove(g)},world,catalog);
  // 실제 rebuild·장면 조립·모델 생성·캐시를 실행하고 무관한 숲과 비동기 풍경만 생략한다.
  assets.buildForest=()=>{};
  assets.scenery={clearings:[],sync(){},start(){}};
  return assets;
}
const rebuild=(assets,events)=>assets.rebuild({year:1801,events,people:[]});

test('시설 외형 변경은 실제 rebuild의 대표 모델을 교체하고 이후 재사용한다',()=>{
  const packet=packets.find(p=>p.id==='scene-mod-seoul-station-1925');
  const [row]=planContinuingFacilities([packet],{year:1926,events:[]});
  const assets=assetsFor(flat);
  rebuild(assets,[row]);
  const first=assets.sceneCache.get(row.id).scene;
  assert.equal(first.models.find(m=>m.primary)?.archetype,'station');
  const changed={...row,facilityLook:'palace',continuing:{...row.continuing,facilityLook:'palace'}};
  rebuild(assets,[changed]);
  const second=assets.sceneCache.get(row.id).scene;
  assert.notEqual(second,first);
  assert.equal(second.models.find(m=>m.primary)?.archetype,'civic_hall');
  assert.ok(!second.models.some(m=>/courtyard|figure|human|worker|handcart/.test(m.archetype)));
  rebuild(assets,[changed]);
  assert.equal(assets.sceneCache.get(row.id).scene,second);
});

for(const medium of ['sea',undefined])test(`1: 도시 (0,1) 옆 바다 사건 (0,-5)을 rebuild해도 바다에 남는다 (${medium||'naval fallback'})`,()=>{
  const world={...flat,contains:(x,z)=>z>=0},assets=assetsFor(world);
  const naval=event('naval','naval',0,-5,'sea');
  if(!medium){delete naval.scenePlace;naval.sites=[{geometry:{coordinates:[0,-5]}}];}
  rebuild(assets,[event('city','settlement',0,1),naval]);
  assert.ok(!assets.unlocated.some(row=>row.id==='naval'),'바다 사건이 unlocated로 빠지면 안 된다');
  const row=assets.rows.find(row=>row.id==='naval');assert.ok(row);
  assert.ok(row.position.z<0);assert.equal(row.position.y,world.seaLevel);
  assert.ok(assets.sceneCache.get('naval').scene.models.filter(m=>/ship/.test(m.archetype)).every(m=>!world.contains(m.position.x,m.position.z)));
});

test('1: 바다 이동 후보 네 곳이 모두 육지면 원래 바다 위치를 보존한다',()=>{
  const world={...flat,contains:(x,z)=>Math.hypot(x,z+5)>=2},assets=assetsFor(world);
  rebuild(assets,[event('city','settlement',0,1),event('naval','naval',0,-5,'sea')]);
  assert.deepEqual(assets.unlocated,[]);
  assert.deepEqual(JSON.parse(assets.sceneCache.get('naval').key).position,[0,0,-5]);
});

test('1: 육지 사건은 바다 후보를 건너뛰고 육지에 남는다',()=>{
  const world={...flat,contains:(x,z)=>z<5},assets=assetsFor(world);
  rebuild(assets,[event('city','settlement',0,0),event('land','court',0,1)]);
  assert.deepEqual(assets.unlocated,[]);
  assert.deepEqual(JSON.parse(assets.sceneCache.get('land').key).position,[10,1,1]);
});

const group={role:'civilian',stance:'attacker',side:'a',count:8,label:'주민'};
test('2: 참여 집단 attacker/8 → victim/2 변경은 재사용 키를 바꾼다',()=>{
  const row={...event('conflict','battle',0,0),participantGroups:[group]};
  const key=patch=>sceneVisualKey({...row,participantGroups:[{...group,...patch}]},new THREE.Vector3(),false,Infinity,flat);
  assert.notEqual(key({}),key({stance:'victim',count:2}));
  for(const patch of [{role:'soldier'},{stance:'victim'},{side:'b'},{count:2},{label:'다른 주민'}])assert.notEqual(key({}),key(patch),JSON.stringify(patch));
});

test('2: rebuild는 집단 변경 뒤 8명 공격 장면을 2명 피해 장면으로 교체하고 다음에는 재사용한다',()=>{
  const assets=assetsFor(flat),row={...event('conflict','battle',0,0),participantGroups:[group]};
  rebuild(assets,[row]);const first=assets.sceneCache.get(row.id).scene;
  assert.equal(first.models.filter(m=>m.stance==='attacker').length,8);
  const changed={...row,participantGroups:[{...group,stance:'victim',count:2}]};
  rebuild(assets,[changed]);const second=assets.sceneCache.get(row.id).scene;
  assert.ok(second!==first,'참여 집단이 달라지면 장면을 다시 조립해야 한다');
  assert.equal(second.models.filter(m=>m.stance==='victim').length,2);
  assert.equal(second.models.filter(m=>m.stance==='attacker').length,0);
  rebuild(assets,[changed]);assert.equal(assets.sceneCache.get(row.id).scene,second);
});

test('3: 겹치는 활성 현대 도시 구역에서는 가까운 중심을 고른다',()=>{
  assert.equal(urbanRegionAt(127.04,37.50,2020)?.id,'gangnam');
  assert.equal(urbanRegionAt(126.99,37.56,2020)?.id,'seoul');
  assert.equal(urbanRegionAt(127.04,37.50,1969)?.id,'seoul');
  assert.equal(urbanRegionAt(127.04,37.50,1944),null);
});

test('3: 중심 거리가 같으면 id 사전순으로 고른다',t=>{
  t.mock.method(Math,'hypot',()=>1);
  assert.equal(urbanRegionAt(127.04,37.50,2020)?.id,'busan');
});

function packetEvent(sceneFunction){
  const packet=packets.find(p=>p.sceneFunction===sceneFunction&&(sceneFunction==='print_workshop'?/대장경/.test(p.title):/신유박해/.test(p.title)));
  assert.ok(packet,sceneFunction);
  return {...packet,id:packet.id,entityId:packet.eventId,label:packet.title,year:packet.startYear,archetype:packet.kind,
    participants:[],scenePlace:{...packet.place,coordinates:[packet.place.lon,packet.place.lat]}};
}
for(const fn of ['print_workshop','persecution'])test(`4: 실제 ${fn} 패킷의 집단별 역할·동작·인원수를 rebuild에 반영한다`,()=>{
  const row=packetEvent(fn),assets=assetsFor(flat);
  const expected=fn==='print_workshop'?[['printer','worker',8]]:[['civilian','victim',12],['soldier','defender',6]];
  assert.deepEqual(row.participantGroups.map(g=>[g.role,g.stance,g.count]),expected);
  rebuild(assets,[row]);const scene=assets.sceneCache.get(row.id)?.scene;assert.ok(scene);
  const grouped=composeHistoricalEvent({...row,archetype:'battle',sceneFunction:'civil_conflict'},new THREE.Vector3(),flat);
  assert.equal(scene.models.filter(m=>m.primary).length,1);
  for(const [role,stance,count] of expected){
    const actors=scene.models.filter(m=>m.role===role);
    assert.equal(actors.length,count,role);
    const archetype=grouped.models.find(m=>m.role===role).archetype;
    assert.ok(actors.every(m=>m.stance===stance&&m.archetype===archetype));
    assert.ok(actors.every(m=>m.action===({worker:'working',victim:'idle',defender:'defending'})[stance]));
  }
});

test('4: 집단이 없으면 작업장 6명·박해 10+3명 고정 구성을 유지한다',()=>{
  for(const fn of ['print_workshop','persecution'])for(const participantGroups of [undefined,[]]){
    const row={...packetEvent(fn),participantGroups},scene=composeHistoricalEvent(row,new THREE.Vector3(),flat);
    assert.equal(scene.models.filter(m=>m.role===(fn==='print_workshop'?'printer':'civilian')).length,fn==='print_workshop'?6:10);
    if(fn==='persecution')assert.equal(scene.models.filter(m=>m.role==='soldier').length,3);
  }
});

test('4: 축소 박해 장면의 대표 인물도 입력 집단의 역할과 동작을 따른다',()=>{
  const row={...packetEvent('persecution'),compact:true,participantGroups:[{role:'soldier',stance:'marching',count:2}]};
  const scene=composeHistoricalEvent(row,new THREE.Vector3(),flat),primary=scene.models.find(m=>m.primary);
  assert.ok(primary);assert.equal(primary.role,'soldier');assert.equal(primary.action,'walking');
  assert.equal(scene.models.filter(m=>m.role).length,1);
});

test('5: 장면 정보 문구에 추정 배경 마을 수와 사료 없음을 표시한다',()=>{
  assert.equal(typeof chronicle.sceneContextLabel,'function');
  const context={people:[{},{}],events:[{}]};
  assert.equal(chronicle.sceneContextLabel(context,7),'동시대 인물 2 · 주변 사건 1 · 추정 배경 마을 7(사료 없음)');
  assert.equal(chronicle.sceneContextLabel(context),'동시대 인물 2 · 주변 사건 1 · 추정 배경 마을 0(사료 없음)');
});

test('5: 지도 표시 체크박스에 추정 배경과 사료 없음 설명을 표시한다',()=>{
  const label=read('index.html').match(/data-map-display="scenery"[^>]*>([^<]*)<\/label>/)?.[1];
  assert.equal(label,'마을·밭·동물 (추정 배경 · 사료 없음)');
});
