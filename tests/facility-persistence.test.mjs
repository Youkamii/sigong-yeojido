import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import {planContinuingFacilities} from '../services/host/app/facility-persistence.js';
import {sceneVisualKey} from '../services/host/app/chronicle-persistence.js';
registerHooks({resolve(specifier,context,next){return specifier==='three'?{url:new URL('../services/host/vendor/three.module.min.js',import.meta.url).href,shortCircuit:true,format:'module'}:next(specifier,context);}});
const THREE=await import('three');
const {composeHistoricalEvent}=await import('../services/host/app/chronicle-event-scenes.js');
const {scenes:packets}=JSON.parse(readFileSync(new URL('../services/host/app/history-scenes.json',import.meta.url),'utf8'));
const plan=year=>({year,events:packets.filter(s=>s.startYear<=year&&s.endYear>=year)});
const rows=year=>planContinuingFacilities(packets,plan(year));
const at=(id,year)=>rows(year).find(row=>row.siteBackground.sourceSceneId===id);
const hwangnyongsa='scene-anc-hwangnyongsa-tap-645',station='scene-mod-seoul-station-1925';
const flat={contains:()=>true,surfaceAt:()=>0,seaLevel:0};
const sea={...flat,contains:()=>false};
const compose=(row,extra={})=>composeHistoricalEvent({...row,...extra},new THREE.Vector3(),row.scenePlace.medium==='sea'?sea:flat);

test('황룡사는 646·1237년에 존속하고 1238년 소실부터 사라진다',()=>{
  for(const year of [646,1237]){
    const row=at(hwangnyongsa,year);assert.ok(row);
    assert.equal(row.continuing.sinceYear,646);assert.equal(row.continuing.untilYear,1237);
    assert.equal(row.continuing.endedBy,'scene-syj122-hwangnyongsa-1238');assert.equal(row.continuing.openEnded,false);
    assert.equal(row.label,'황룡사 구층목탑 · 시설(추정 존속)');
  }
  for(const year of [645,1238,1239,1500,2100])assert.equal(at(hwangnyongsa,year),undefined);
});

test('경성역은 원 패킷이 활성인 1925년에는 중복하지 않고 1926년부터 존속한다',()=>{
  assert.equal(at(station,1925),undefined);
  const row=at(station,1926);assert.ok(row);assert.equal(row.sceneFunction,'rail_station');
  assert.equal(row.archetype,'construction');assert.equal(row.setting,true);assert.equal(row.siteBackground.scope,'facility');
  assert.match(row.summary,/건립 기록을 근거로 시설이 남아 있다고 추정한 배경이며 이후 변형·훼손 기록은 반영하지 않았다/);
  assert.deepEqual(row.participants,[]);assert.deepEqual(row.participantGroups,[]);
  assert.equal(planContinuingFacilities(packets,{year:1926,events:[packets.find(s=>s.id===station)]}).some(r=>r.siteBackground.sourceSceneId===station),false);
});

const palace=packets.find(s=>s.id==='scene-je-gyeongbokgung-1395'&&s.kind==='construction');
test('경복궁 건립 시설은 1592년 소실 이후인 1593년에 없다',{skip:!palace&&'경복궁 건립 패킷 없음'},()=>{
  const row=at(palace.id,1591);assert.ok(row);
  assert.equal(row.continuing.endedBy,'scene-hanyang-palace-fire-1592');
  for(const year of [1592,1593])assert.equal(at(palace.id,year),undefined);
});

test('소멸 기록이 없는 시설은 openEnded이고 2100년까지 표시한다',()=>{
  const open=rows(2000).filter(r=>r.continuing.openEnded);assert.ok(open.length>0);
  for(const row of open){assert.equal(row.continuing.untilYear,2100);assert.equal(row.continuing.endedBy,null);}
  assert.ok(at(station,2100));assert.equal(rows(2101).length,0);
});

test('실제 건립 패킷의 시설 조립에는 공사 인력·손수레·건설 효과가 없고 반경은 12 이하이다',()=>{
  let count=0;
  for(const packet of packets.filter(s=>s.kind==='construction')){
    const row=at(packet.id,packet.endYear+1);if(!row)continue;
    count++;
    for(const compact of [false,true]){
      const scene=compose(row,{compact});assert.ok(scene.models.length>0,packet.id);
      assert.equal(scene.models.filter(m=>/worker|handcart|groundbreaking|building_frame/.test(m.archetype)||m.action==='working'||m.role==='worker').length,0,packet.id);
      assert.equal(scene.group.children.filter(c=>c.name==='event-fire').length,0,packet.id);
      assert.ok(scene.radius<=12,packet.id);assert.ok(scene.occupied.every(o=>o.radius<=3),packet.id);
    }
  }
  assert.equal(count,packets.filter(s=>s.kind==='construction'&&Number.isFinite(s.place?.lon)&&Number.isFinite(s.place?.lat)).length);
  assert.ok(compose(at(station,1926)).models.some(m=>m.archetype==='station'));
  assert.ok(compose(at(hwangnyongsa,646)).models.some(m=>m.archetype==='pagoda'));
  assert.ok(compose(at(hwangnyongsa,646)).models.some(m=>/monk/.test(m.archetype)));
});

test('시설 표시 연도와 시대가 바뀌어도 재사용 키와 조립 외형은 같다',()=>{
  const position=new THREE.Vector3();
  for(const [id,years] of [[hwangnyongsa,[646,1237]],[station,[1926,1945,2100]],['scene-anc-gameunsa-682',[683,1876,2100]]]){
    const first=at(id,years[0]);assert.ok(first);
    for(const year of years){
      const row=at(id,year);assert.ok(row);assert.equal(row.id,first.id);
      assert.equal(sceneVisualKey(row,position,false,100),sceneVisualKey(first,position,false,100));
      assert.deepEqual(compose(row).models,compose(first).models);
    }
  }
});

test('시설 표시는 남아 있는 건설 플래그·참여 집단·화재 효과보다 우선한다',()=>{
  for(const id of [station,'scene-syj128-haeinsa-802']){
    const source=packets.find(s=>s.id===id),row=at(id,source.endYear+1);
    const scene=compose(row,{visualActions:{construction:true,constructionYears:[source.endYear]},
      effects:{fire:{enabled:true},attack:{enabled:true}},
      participantGroups:[{role:'worker',stance:'worker',count:20}],
      participants:[{archetype:'field_worker',presence:'on-site',role:'worker'}]});
    assert.ok(scene.models.length>0);
    assert.equal(scene.models.filter(m=>/worker|handcart/.test(m.archetype)||m.action==='working').length,0);
    assert.equal(scene.group.children.filter(c=>c.name==='event-fire').length,0);
  }
});

test('좌표·이름을 함께 대조하고 가장 이른 소멸 기록을 선택한다',()=>{
  const source=packets.find(s=>s.id===station);
  const ending=(id,year,title,lon=source.place.lon)=>({...source,id,startYear:year,endYear:year,kind:'court',title,summary:'',place:{...source.place,lon}});
  const candidates=[source,ending('later',2000,'경성역사 철거'),ending('far',1930,'경성역사 파괴',source.place.lon+.02),
    ending('other',1931,'다른시설 소실'),ending('first',1950,'경성역사 붕괴')];
  const [row]=planContinuingFacilities(candidates,{year:1949,events:[]});
  assert.equal(row.continuing.endedBy,'first');assert.equal(row.continuing.untilYear,1949);
  assert.equal(planContinuingFacilities(candidates,{year:1950,events:[]}).length,0);
});

test('장소명 대체·근거 필터를 적용하고 원 패킷은 바꾸지 않는다',()=>{
  const before=JSON.stringify(packets),source=packets.find(s=>s.id==='scene-jl-gyeongbokgung-junggeon-1865');
  const row=at(source.id,source.endYear+1);assert.ok(row.label.startsWith(source.place.label+' ·'));
  assert.equal(row.visualActions,source.visualActions);
  assert.equal(planContinuingFacilities([source],{year:1870,events:[]},new Map()).length,0);
  const claims=new Map(row.claimIds.map(id=>[id,{}]));
  assert.equal(planContinuingFacilities([source],{year:1870,events:[]},claims).length,1);
  assert.equal(JSON.stringify(packets),before);
});
