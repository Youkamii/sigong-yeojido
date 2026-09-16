import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {visiblePackets,visiblePacketEvents} from '../services/host/app/scene-packets.js';
import {contextAt} from '../services/host/app/chronicle.js';
import {planChronicleAssets} from '../services/host/app/chronicle-asset-plan.js';
import {planContinuingFacilities} from '../services/host/app/facility-persistence.js';
import {planContinuingCities,planHistoricalSites} from '../services/host/app/chronicle-sites.js';
import {AtlasEvents} from '../services/host/app/atlas-events.js';
import {AtlasData} from '../services/host/app/atlas-data.js';

const packet=(id,extra={})=>({id,eventId:'event-'+id,title:'황룡사 창건',kind:'construction',
  startYear:553,endYear:553,dateClaimIds:[id+'-date'],actionClaimIds:[id+'-action'],participants:[],
  place:{lon:129.2325,lat:35.83694,label:'황룡사',claimIds:[id+'-place'],coordinateSourceIds:['source']},...extra});
const old=packet('old',{supersededBy:'new'}),item=packet('new',{itemId:'hs-new'});
const dataFor=packets=>({scenePackets:packets,
  entities:packets.map(p=>({id:p.eventId,type:'Event',label:p.title})),
  claims:packets.flatMap(p=>[
    {id:p.id+'-date',subject:p.eventId,predicate:'syj:occurredIn',object:{kind:'year',value:553},fromSource:'source'},
    {id:p.id+'-action',subject:p.eventId,predicate:'syj:describedAs',object:{kind:'literal',value:p.title},fromSource:'source'},
    {id:p.id+'-place',subject:p.eventId,predicate:'syj:tookPlaceAt',object:{kind:'entity',id:'place'},fromSource:'source'}])});

test('항목 패킷은 사료를 모두 꺼도 후보와 좌표를 유지하고 기존 패킷은 제외한다',()=>{
  const legacy=packet('legacy'),packets=[legacy,item],data={entities:[],claims:[],scenePackets:packets};
  const context=contextAt(data,553),plan=planChronicleAssets(context,data,[],[],packets);
  assert.deepEqual(plan.events.map(e=>e.id),['new']);
  assert.equal(plan.events[0].itemId,'hs-new');
  assert.deepEqual(plan.events[0].scenePlace.coordinates,[129.2325,35.83694]);
  assert.equal(plan.events[0].scenePlace.placementType,'item-packet');
  assert.deepEqual(context.allEvents.map(e=>e.sceneId),['new']);
  assert.deepEqual(context.allEvents[0].basis,[]);
  assert.equal(planChronicleAssets(contextAt(data,554),data,[],[],packets).events.length,0);
});

test('항목 좌표는 대체 표시 좌표보다 우선하며 좌표 자료 목록 없이도 배치한다',()=>{
  const next={...item,place:{...item.place,coordinateSourceIds:[],displayCoordinates:[127,37]}};
  const data={entities:[],claims:[]};
  const plan=planChronicleAssets(contextAt(data,553),data,[],[],[next]);
  assert.deepEqual(plan.events[0].scenePlace.coordinates,[129.2325,35.83694]);
  const unlocated={...next,place:{...next.place,lon:undefined}};
  assert.equal(planChronicleAssets(contextAt(data,553),data,[],[],[unlocated]).events[0].scenePlace,null);
});

test('기존 패킷은 날짜와 행위가 로드돼야 후보가 되고 장소 근거까지 있어야 배치된다',()=>{
  const legacy=packet('legacy'),data=dataFor([legacy]);
  const plan=claims=>{
    const selected={...data,claims};
    return planChronicleAssets(contextAt(selected,553),selected,[],[],[legacy]);
  };
  for(const missing of ['date','action'])assert.ok(!plan(data.claims.filter(c=>c.id!=='legacy-'+missing)).events.some(e=>e.id===legacy.id));
  assert.equal(plan(data.claims.filter(c=>c.id!=='legacy-place')).events.find(e=>e.id===legacy.id).scenePlace,null);
  assert.deepEqual(plan(data.claims).events.find(e=>e.id===legacy.id).scenePlace.coordinates,[129.2325,35.83694]);
});

test('supersede로 숨긴 기존 장면 대신 근거가 로드되지 않은 항목 장면을 배치한다',()=>{
  const packets=[old,item],data={...dataFor([old]),scenePackets:packets};
  const context=contextAt(data,553),plan=planChronicleAssets(context,data,[],[],packets);
  assert.deepEqual(plan.events.map(e=>e.id),['new']);
  assert.ok(plan.events[0].scenePlace);
  assert.deepEqual(context.allEvents.map(e=>e.sceneId),['new']);
});

test('항목 현장 참여자는 근거나 현재 인물이 없으면 unloaded로 보완한다',()=>{
  const participant={entityId:'person',role:'장인',presence:'on-site',claimIds:['relation']};
  const next={...item,participants:[participant]};
  const claim={id:'relation',subject:item.eventId,predicate:'syj:hasParticipant',object:{kind:'entity',id:'person'}};
  const entity={id:'person',type:'Person',label:'장인'};
  for(const [entities,claims,unloaded] of [[[],[],true],[[entity],[],true],[[],[claim],true],[[entity],[claim],false]]){
    const data={entities,claims,scenePackets:[next]},context=contextAt(data,553);
    const participants=planChronicleAssets(context,data,[],[],[next]).events[0].participants;
    assert.equal(participants.length,1);
    assert.equal(Boolean(participants[0].unloaded),unloaded);
  }
});

test('공통 필터는 숨긴 패킷만 빼고 항목 장면들과 원본을 보존한다',()=>{
  const second=packet('second',{itemId:'hs-second'}),packets=[old,item,second];
  const before=JSON.stringify(packets);
  assert.deepEqual(visiblePackets(packets),[item,second]);
  assert.equal(JSON.stringify(packets),before);
  assert.deepEqual(visiblePackets(),[]);
});

test('지도, 사건 목록, 이 해의 사건에서 제외하고 개체의 원본 주장은 보존한다',()=>{
  const packets=[old,item],data=dataFor(packets),before=JSON.stringify(data),context=contextAt(data,553);
  assert.deepEqual(context.allEvents.map(e=>e.sceneId),['new']);
  assert.deepEqual(context.events.map(e=>e.sceneId),['new']);
  const plan=planChronicleAssets(context,data,[],[],packets);
  assert.deepEqual(plan.events.map(e=>e.id),['new']);
  const atlas=new AtlasData();atlas.update(data,context,packets);
  assert.equal(atlas.subjects.get(old.eventId).length,3);
  assert.deepEqual(AtlasEvents.prototype.filter.call({category:'all',ui:{data:atlas}},context.allEvents).map(e=>e.sceneId),['new']);
  assert.equal(JSON.stringify(data),before);
});

test('한 개체에 보이는 다른 항목 장면이 있으면 그 사건은 유지한다',()=>{
  const same={...item,eventId:old.eventId};
  const events=[{id:old.eventId,sceneId:old.id},{id:same.eventId,sceneId:same.id},{id:same.eventId,lo:553,hi:553}];
  assert.deepEqual(visiblePacketEvents(events,[old,same]),events.slice(1));
  // 숨긴 패킷의 연도 밖에 있는 같은 개체의 일반 사건은 남는다.
  const generic=[{id:old.eventId,lo:553,hi:553},{id:old.eventId,lo:600,hi:600}];
  assert.deepEqual(visiblePacketEvents(generic,[old,item]),generic.slice(1));
});

test('시설 존속은 항목 persistence를 우선하며 없으면 기존 존속과 소실 근거를 유지한다',()=>{
  const persistence={kind:'facility',from:553,to:1238};
  const original={...old,persistence},replacement={...item,kind:'heritage',heritageType:'hall',persistence};
  const plan={year:600,events:[]};
  assert.deepEqual(planContinuingFacilities([original,replacement],plan).map(r=>r.siteBackground.sourceSceneId),['new']);
  // 항목 장면의 시설은 로드된 근거 지도와 무관하게 남고, 기존 장면은 종전대로 근거를 요구한다.
  assert.deepEqual(planContinuingFacilities([original,replacement],plan,new Map()).map(r=>r.siteBackground.sourceSceneId),['new']);
  assert.deepEqual(planContinuingFacilities([original],plan,new Map()),[]);
  const without={...replacement,persistence:undefined};
  assert.deepEqual(planContinuingFacilities([original,without],plan).map(r=>r.siteBackground.sourceSceneId),['old']);
  assert.deepEqual(planContinuingFacilities([original,item],plan).map(r=>r.siteBackground.sourceSceneId),['old']);
  assert.deepEqual(planContinuingFacilities([{...original,kind:'court'},item],plan).map(r=>r.siteBackground.sourceSceneId),['new']);
  const dated={...item,persistence:{kind:'facility',from:580,to:610}};
  for(const year of [579,611])assert.deepEqual(planContinuingFacilities([original,dated],{year,events:[]}),[]);
  assert.deepEqual(planContinuingFacilities([original,dated],{year:600,events:[]}).map(r=>r.siteBackground.sourceSceneId),['new']);
  assert.deepEqual(planContinuingFacilities([original,without],{year:600,events:[{id:'new'}]}),[]);
  const fire=packet('fire',{kind:'fire',title:'황룡사 소실',startYear:700,endYear:700,supersededBy:'new-fire'});
  assert.deepEqual(planContinuingFacilities([original,without,fire],{year:700,events:[]}),[]);
});

test('도시 존속과 기록 사이 장소도 숨긴 패킷을 다시 조립하지 않는다',()=>{
  assert.deepEqual(planContinuingCities([{...old,kind:'settlement'}],{year:600,events:[]}),[]);
  const entityId='syj135-place-samnyeonsanseong';
  const episode=packet('episode',{researchCollection:'scenes-135',place:{...old.place,claimIds:['location']}});
  const hidden={...episode,id:'hidden',startYear:600,endYear:600,supersededBy:'new'};
  const data={entities:[{id:entityId}],claims:[...dataFor([episode]).claims,{id:'location',object:{id:entityId}}]};
  assert.deepEqual(planHistoricalSites(data,[episode,hidden],{year:580,events:[]}),[]);
});

test('실제 전체 패킷에서도 숨긴 카드는 없고 항목 persistence로 시설을 대체한다',()=>{
  const {scenes}=JSON.parse(readFileSync(new URL('../services/host/app/history-scenes.json',import.meta.url),'utf8'));
  const hidden=scenes.filter(scene=>scene.supersededBy),byId=new Map(scenes.map(scene=>[scene.id,scene]));
  assert.ok(hidden.length>0);
  const visible=visiblePackets(scenes),continuing=scenes.filter(scene=>!scene.supersededBy||!byId.get(scene.supersededBy)?.persistence);
  for(const old of hidden){
    const next=byId.get(old.supersededBy);
    assert.ok(next?.itemId);assert.ok(!old.itemId);
    assert.ok(!visible.includes(old));assert.ok(visible.includes(next));
    assert.equal(continuing.includes(old),!next.persistence);
    if(next.persistence){
      const year=Math.max(old.endYear,next.endYear)+1;
      const rows=planContinuingFacilities(scenes,{year,events:visible.filter(p=>p.startYear<=year&&p.endYear>=year)});
      assert.ok(!rows.some(row=>row.siteBackground.sourceSceneId===old.id),old.id);
      const expected=planContinuingFacilities([next],{year,events:[]})[0];
      if(expected&&rows.some(row=>row.siteBackground.sourceSceneId===next.id)){
        assert.equal(rows.find(row=>row.siteBackground.sourceSceneId===next.id).continuing.facilityLook,expected.continuing.facilityLook);
      }
    }
  }
  const station=byId.get('scene-mod-seoul-station-1925');
  const replacement=byId.get(station.supersededBy);
  assert.ok(replacement?.persistence);
  const rows=planContinuingFacilities(scenes,{year:replacement.endYear+1,events:[]});
  assert.ok(rows.some(row=>row.siteBackground.sourceSceneId===replacement.id));
  assert.ok(!rows.some(row=>row.siteBackground.sourceSceneId===station.id));
});

test('built supersededBy matches a fresh recomputation',()=>{
  // #199 round 2 (B-9): 제목 윤문이 titles_overlap 을 깨뜨려도 빌드 산출물과 재계산이 갈라지지 않게 잡는다.
  const packetUrl=new URL('../services/host/app/history-scenes.json',import.meta.url);
  const packet=JSON.parse(readFileSync(packetUrl,'utf8'));
  const built=new Map(packet.scenes.filter(scene=>scene.supersededBy).map(scene=>[scene.id,scene.supersededBy]));
  const dir=mkdtempSync(join(tmpdir(),'supersede-'));
  const out=join(dir,'history-scenes.json');
  writeFileSync(out,JSON.stringify(packet));
  let ran=null;
  for(const python of ['python','python3','py']){
    const result=spawnSync(python,[fileURLToPath(new URL('../scripts/build_history_scenes.py',import.meta.url)),
      '--supersede-only','--out',out,'--supersede-report',join(dir,'pairs.json')],{encoding:'utf8'});
    if(!result.error){ran=result;break;}
  }
  assert.ok(ran,'python is required to recompute supersededBy');
  assert.equal(ran.status,0,ran.stderr);
  const fresh=new Map(JSON.parse(readFileSync(out,'utf8')).scenes.filter(scene=>scene.supersededBy)
    .map(scene=>[scene.id,scene.supersededBy]));
  rmSync(dir,{recursive:true,force:true});
  assert.deepEqual([...fresh.entries()].sort(),[...built.entries()].sort(),
    '재계산 결과가 history-scenes.json 과 다르다 — 재빌드하면 숨긴 장면이 되살아난다');
});
