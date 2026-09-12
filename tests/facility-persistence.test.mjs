import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import {planContinuingFacilities} from '../services/host/app/facility-persistence.js';
import {sceneVisualKey} from '../services/host/app/chronicle-persistence.js';
import {insideCoastline} from '../services/host/app/coastline-index.js';
registerHooks({resolve(specifier,context,next){return specifier==='three'?{url:new URL('../services/host/vendor/three.module.min.js',import.meta.url).href,shortCircuit:true,format:'module'}:next(specifier,context);}});
const THREE=await import('three');
const {composeHistoricalEvent}=await import('../services/host/app/chronicle-event-scenes.js');
const {scenes:packets}=JSON.parse(readFileSync(new URL('../services/host/app/history-scenes.json',import.meta.url),'utf8'));
const plan=year=>({year,events:packets.filter(s=>s.startYear<=year&&s.endYear>=year)});
const rows=year=>planContinuingFacilities(packets,plan(year));
const at=(id,year)=>rows(year).find(row=>row.siteBackground.sourceSceneId===id);
const hwangnyongsa='scene-anc-hwangnyongsa-tap-645',station='scene-mod-seoul-station-1925';
const myeonghwal='scene-syj135-myeonghwalsanseong-chukseong-551',namgyeong='scene-syj128-namgyeong-1104';
const byeolbangjin='scene-ej-byeolbangjin-1510',dondae='scene-jl2-ganghwa-dondae-1679';
const flat={contains:()=>true,surfaceAt:()=>0,seaLevel:0};
const sea={...flat,contains:()=>false};
const compose=(row,extra={})=>composeHistoricalEvent({...row,...extra},new THREE.Vector3(),row.scenePlace.medium==='sea'?sea:flat);
let actualWorld;
async function getActualWorld(){
  if(!actualWorld){
    const {createEstimatedWorld}=await import('../scripts/check_estimated_islands.mjs');
    actualWorld=createEstimatedWorld();
  }
  return actualWorld;
}

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
  for(const year of [1926,2020,2100]){
    const continuing=at(station,year).continuing;
    assert.equal(continuing.facilityType,'openEnded');
    assert.equal(continuing.untilYear,2100);assert.equal(continuing.openEnded,true);
    assert.equal(continuing.cappedBy,undefined);
  }
});

test('금성 축조 전승과 narrativeType·tradition 패킷은 어느 표시 연도에도 시설이 아니다',()=>{
  const geumseong=packets.find(s=>s.id==='scene-anc-geumseong-bce37');assert.match(geumseong.title,/전승/);
  const source=packets.find(s=>s.id===station);
  const excluded=[geumseong,{...source,id:'narrative',narrativeType:'legend'},
    {...source,id:'empty-narrative',narrativeType:''},{...source,id:'tradition',kind:'tradition'}];
  for(let year=-2000;year<=2101;year++)assert.deepEqual(planContinuingFacilities(excluded,{year,events:[]}),[],String(year));
  for(const year of [645,646,1795,2020])assert.equal(at(geumseong.id,year),undefined);
});

test('남경 궁궐은 1300·1391년에 있고 1392년부터 없다',()=>{
  for(const year of [1300,1391]){
    const row=at(namgyeong,year);assert.ok(row);
    assert.equal(row.continuing.facilityType,'dynasty-boundary');
    assert.equal(row.continuing.untilYear,1391);assert.equal(row.continuing.openEnded,false);
    assert.equal(row.continuing.cappedBy,'dynasty-boundary');assert.equal(row.continuing.endedBy,null);
  }
  for(const year of [1392,2020])assert.equal(at(namgyeong,year),undefined);
  assert.equal(at(namgyeong,1300).label,'남경 궁궐 · 시설(추정 존속)');
});

test('소멸 패킷 없는 사찰·산성·돈대·진·제방은 2020·2100년에도 남는다',()=>{
  for(const id of [myeonghwal,dondae,byeolbangjin,'scene-syj128-haeinsa-802',
    'scene-syj128-silsangsa-828','scene-syj128-mireuksa-sari-639',
    'scene-syj135-samnyeonsanseong-chukjo-470','scene-syj122-byeokgolje-790','scene-ej-byeokgolje-1415']){
    for(const year of [2020,2100]){
      const row=at(id,year);assert.ok(row,id);
      assert.equal(row.continuing.facilityType,'openEnded',id);
      assert.equal(row.continuing.untilYear,2100);assert.equal(row.continuing.openEnded,true);
      assert.equal(row.continuing.cappedBy,undefined);assert.equal(row.continuing.endedBy,null);
    }
  }
});

test('행정 시설 상한은 착공이 아닌 건립 종료 뒤 첫 경계이며 1945년 경계도 적용한다',()=>{
  const source=packets.find(s=>s.id===namgyeong);
  for(const [endYear,untilYear] of [[917,917],[918,1391],[1391,1391],[1392,1909],[1909,1909],[1910,1944],[1925,1944],[1944,1944],[1945,2100],[2000,2100]]){
    const scene={...source,id:'boundary-case',startYear:500,endYear};
    const result=planContinuingFacilities([scene],{year:endYear+1,events:[]});
    if(endYear===untilYear){assert.deepEqual(result,[]);continue;}
    assert.equal(result[0].continuing.untilYear,untilYear);
    assert.equal(result[0].continuing.openEnded,untilYear===2100);
    assert.equal(result[0].continuing.cappedBy,untilYear===2100?undefined:'dynasty-boundary');
  }
});

test('1795년 한성에서는 남경 궁궐이 사라지고 북한산성은 남는다',t=>{
  const nearby=rows(1795).filter(row=>Math.hypot(row.place.lon-126.9768,row.place.lat-37.58)<=1);
  t.diagnostic('1795 HANSEONG radius=1deg: facilities='+nearby.length);
  assert.ok(nearby.some(row=>row.siteBackground.sourceSceneId==='scene-jl2-bukhansanseong-1711'));
  assert.ok(!nearby.some(row=>row.siteBackground.sourceSceneId===namgyeong));
});

const palace=packets.find(s=>s.id==='scene-je-gyeongbokgung-1395'&&s.kind==='construction');
test('경복궁 건립 시설은 1592년 소실 이후인 1593년에 없다',{skip:!palace&&'경복궁 건립 패킷 없음'},()=>{
  const row=at(palace.id,1591);assert.ok(row);
  assert.equal(row.continuing.endedBy,'scene-hanyang-palace-fire-1592');
  for(const year of [1592,1593])assert.equal(at(palace.id,year),undefined);
});

test('2100년 상한 시설만 openEnded이고 2101년부터 표시하지 않는다',()=>{
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
  const eligible=packets.filter(s=>s.kind==='construction'&&s.narrativeType==null&&!s.title?.includes('전승')&&Number.isFinite(s.place?.lon)&&Number.isFinite(s.place?.lat));
  assert.equal(count,eligible.length);
  assert.ok(compose(at(station,1926)).models.some(m=>m.archetype==='station'));
  assert.ok(compose(at(hwangnyongsa,646)).models.some(m=>m.archetype==='pagoda'));
  assert.ok(compose(at(hwangnyongsa,646)).models.some(m=>/monk/.test(m.archetype)));
});

test('시설 표시 연도와 시대가 바뀌어도 재사용 키와 조립 외형은 같다',()=>{
  const position=new THREE.Vector3();
  for(const [id,years] of [[hwangnyongsa,[646,1237]],[station,[1926,1945,2100]],['scene-anc-gameunsa-682',[683,800,917]]]){
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

test('소멸 기록은 왕조 경계보다 이르거나 늦어도 상한에 우선한다',()=>{
  for(const id of [myeonghwal,namgyeong]){
    const source=packets.find(s=>s.id===id);
    for(const year of id===myeonghwal?[800,1000]:[1300,1500]){
    const ending={...source,id:'destruction',kind:'fire',startYear:year,endYear:year,title:source.place.label+' 소실'};
    const [row]=planContinuingFacilities([source,ending],{year:year-1,events:[]});
    assert.equal(row.continuing.untilYear,year-1);assert.equal(row.continuing.endedBy,ending.id);
    assert.equal(row.continuing.openEnded,false);assert.equal(row.continuing.cappedBy,undefined);
    assert.deepEqual(planContinuingFacilities([source,ending],{year,events:[]}),[]);
    }
  }
});

test('실제 제주·강화 링 폭이 시설 조립과 재사용 키의 크기 상한에 함께 반영된다',async t=>{
  const world=await getActualWorld();
  for(const [id,name,limit] of [[byeolbangjin,'Jeju',.6],[dondae,'Ganghwa',.14],[namgyeong,'Mainland',.7]]){
    const row=at(id,id===namgyeong?1300:1795),[x,z]=world.toWorld(...row.scenePlace.coordinates);
    const position=new THREE.Vector3(x,world.surfaceAt(x,z),z);
    const ring=world.rings.find(r=>insideCoastline(x,z,r));assert.ok(ring,name);
    const width=ring.bounds.maxX-ring.bounds.minX,expected=Math.min(row.scenePlace.displayScale||1,.7,width/160);
    for(const compact of [false,true]){
      const scene=composeHistoricalEvent({...row,compact},position,world);
      assert.ok(scene.models.some(model=>model.primary),name);
      assert.ok(scene.displayScale<=limit,name);assert.equal(scene.displayScale,expected*(compact?.16:1));
      const key=JSON.parse(sceneVisualKey(row,position,compact,100,world));
      assert.equal(key.scale,expected);assert.equal(key.maxRadius,compact?null:12*expected);
      const limited=composeHistoricalEvent({...row,compact,maxRadius:1},position,world);
      assert.equal(limited.displayScale,compact?expected*.16:Math.min(expected,1/12));
      assert.equal(JSON.parse(sceneVisualKey(row,position,compact,1,world)).maxRadius,compact?null:1);
    }
    t.diagnostic(name+': ringWidth='+width+', displayScale='+expected);
    const smaller={...row,scenePlace:{...row.scenePlace,displayScale:.05}};
    assert.equal(composeHistoricalEvent(smaller,position,world).displayScale,.05);
    assert.equal(JSON.parse(sceneVisualKey(smaller,position,false,100,world)).scale,.05);
  }
});

test('시설 키워드는 네 필드에서 분류하고 역의 ID가 달라도 같은 규칙을 쓴다',()=>{
  const source={...packets.find(s=>s.id===station),id:'different-station-id',title:'시설 건립',
    summary:'',sceneFunction:'',visualActions:{},startYear:800,endYear:800};
  const groups={
    'dynasty-boundary':['궁궐','궁','경복궁','전각','관아','객사','행궁','도감','감영','읍성 관청','기념 행사 시설'],
    openEnded:['사찰','탑','산성','성곽','돈대','진','진(鎭)','제방','저수지','다리','도로','역','철도',
      '비석','기념비','서원','향교','학교','공장','발전소','항만']
  };
  for(const [type,keywords] of Object.entries(groups))for(const keyword of keywords){
    for(const field of ['title','summary','sceneFunction','visualActions']){
      const scene={...source,[field]:keyword+' 건립'};
      const [row]=planContinuingFacilities([scene],{year:801,events:[]});
      assert.equal(row.continuing.facilityType,type,field+': '+keyword);
      assert.equal(row.continuing.untilYear,type==='openEnded'?2100:917);
    }
  }
  for(const patch of [{sceneFunction:'rail_station'},{title:'경성역사 준공'},
    {visualActions:{fortress:true,constructionYears:[800]}},{visualActions:{type:'temple'}}]){
    assert.equal(planContinuingFacilities([{...source,...patch}],{year:2020,events:[]})[0].continuing.facilityType,'openEnded');
  }
  for(const patch of [{},{title:'지역 공사',summary:'역사 자료로 확인된 사진'},
    {visualActions:{fortress:false,constructionYears:[800]}}]){
    const [row]=planContinuingFacilities([{...source,...patch}],{year:801,events:[]});
    assert.equal(row.continuing.facilityType,'dynasty-boundary');
    assert.equal(row.continuing.untilYear,917);
  }
});

test('시설 제목을 주변·부속 시설 설명보다 우선한다',()=>{
  const source=packets.find(s=>s.id===namgyeong);
  for(const [title,summary,type] of [
    ['불국사 창건','전각을 세운다','openEnded'],
    ['남경 궁궐 완성','산성과 다리 곁 관아','dynasty-boundary'],
    ['읍성 관청 건립','성곽 안 관아','dynasty-boundary']
  ]){
    const [row]=planContinuingFacilities([{...source,title,summary}],{year:1300,events:[]});
    assert.equal(row.continuing.facilityType,type);
  }
});

test('해안선 밖 표시 좌표는 제외하며 원 좌표·패킷은 바꾸지 않는다',()=>{
  const source=packets.find(s=>s.id===station),ring=[[-1,-1],[1,-1],[1,1],[-1,1]];
  const world={rings:[ring],toWorld:(lon,lat)=>[lon,lat],contains:()=>true};
  const land={...source,place:{...source.place,lon:0,lat:0}};
  const water={...source,place:{...source.place,lon:2,lat:0}};
  const before=JSON.stringify([land,water]);
  const query=scene=>planContinuingFacilities([scene],{year:2020,events:[]},undefined,world);
  assert.equal(query(land).length,1);assert.deepEqual(query(water),[]);
  assert.deepEqual(query({...land,place:{...land.place,displayCoordinates:[2,0]}}),[]);
  assert.equal(query({...water,place:{...water.place,displayCoordinates:[0,0]}}).length,1);
  assert.deepEqual(planContinuingFacilities([land],{year:2020,events:[]},undefined,{...world,rings:[]}),[]);
  assert.equal(planContinuingFacilities([water],{year:2020,events:[]}).length,1);
  assert.equal(JSON.stringify([land,water]),before);
});

test('실제 ChronicleWorld로 바다 시설을 제외하고 1450년 전주 반경 1도의 시설은 모두 육지에 둔다',async t=>{
  const world=await getActualWorld();
  const onLand=row=>world.rings.some(ring=>insideCoastline(...world.toWorld(...row.scenePlace.coordinates),ring));
  const nearJeonju=row=>Math.hypot(row.place.lon-127.15,row.place.lat-35.82)<=1;
  const before=rows(1450).filter(nearJeonju);
  const water=before.filter(row=>!onLand(row));
  const after=planContinuingFacilities(packets,plan(1450),undefined,world).filter(nearJeonju);
  assert.ok(after.length>0);assert.ok(after.every(onLand));
  assert.deepEqual(after.map(row=>row.id),before.filter(onLand).map(row=>row.id));
  t.diagnostic('1450 JEONJU radius=1deg: '+JSON.stringify({before:before.length,after:after.length,
    excluded:water.map(row=>({title:row.title,coordinates:row.scenePlace.coordinates})),
    land:after.map(row=>({title:row.title,coordinates:row.scenePlace.coordinates}))}));
  for(const year of [1300,1450,2020]){
    assert.ok(planContinuingFacilities(packets,plan(year),undefined,world).every(onLand));
  }
  const current=planContinuingFacilities(packets,plan(2020),undefined,world);
  for(const id of [station,byeolbangjin,'scene-syj128-haeinsa-802','scene-syj135-samnyeonsanseong-chukjo-470']){
    assert.ok(current.some(row=>row.siteBackground.sourceSceneId===id),id);
  }
  const busan=at('scene-mod-busan-port-1876',2020);assert.ok(busan);assert.equal(onLand(busan),false);
  assert.equal(current.some(row=>row.id===busan.id),false);
  t.diagnostic('2020 BUSAN excluded: '+JSON.stringify({title:busan.title,coordinates:busan.scenePlace.coordinates}));
  const source=packets.find(s=>s.id===station);
  const seaScene={...source,place:{...source.place,lon:124,lat:35,displayCoordinates:[124,35]}};
  assert.equal(world.rings.some(ring=>insideCoastline(...world.toWorld(124,35),ring)),false);
  assert.deepEqual(planContinuingFacilities([seaScene],{year:2020,events:[]},undefined,world),[]);
});

test('링 순서와 꼭짓점 수 대신 면적으로 본토를 고르고 캐시 키는 링 폭 변경을 따른다',()=>{
  const row=at(station,1926),position=new THREE.Vector3();
  const island=[[-10,-10],[0,-10],[10,-10],[10,0],[10,10],[0,10],[-10,10],[-10,0]];
  const mainland=[[100,100],[500,100],[500,500],[100,500]];
  const world={...flat,rings:[island,mainland]};
  assert.equal(composeHistoricalEvent(row,position,world).displayScale,.125);
  const key=sceneVisualKey(row,position,false,100,world);
  assert.equal(JSON.parse(key).scale,.125);
  assert.equal(sceneVisualKey(row,position,false,100,{...world,rings:[mainland,island]}),key);
  const wider={...world,rings:[island.map(([x,z])=>[x*2,z]),mainland]};
  assert.equal(composeHistoricalEvent(row,position,wider).displayScale,.25);
  assert.notEqual(sceneVisualKey(row,position,false,100,wider),key);
  assert.equal(composeHistoricalEvent(row,position,flat).displayScale,.7);
  const event={...row,continuing:undefined};
  assert.equal(composeHistoricalEvent(event,position,world).displayScale,1);
  assert.equal(sceneVisualKey(event,position,false,100,world),sceneVisualKey(event,position,false,100,flat));
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
