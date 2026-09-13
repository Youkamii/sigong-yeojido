import test from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';
import {readFileSync} from 'node:fs';
import {loadFactLayers,estimatedSiteThreshold,planSettlementSites} from '../services/host/app/settlement-regions.js';
import {buildSettlementZones} from '../services/host/app/inhabited-zones.js';

const three=new URL('../services/host/vendor/three.module.min.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){return s==='three'?{url:${JSON.stringify(three)},shortCircuit:true}:n(s,c);}`),import.meta.url);
const {loadWorldFactLayers,selectEstimatedSites,ChronicleScenery}=await import('../services/host/app/chronicle-scenery.js');
const read=name=>JSON.parse(readFileSync(new URL(`./fixtures/fact-layers/fixture-collection/summary/${name}.json`,import.meta.url),'utf8'));
const layers={version:1,generatedFrom:['fixture-collection'],...Object.fromEntries(['density','administrative'].map(kind=>
  [kind,read(kind).filter(r=>r.lon!=null&&r.lat!=null).map(({placeLabel,job,...row})=>({...row,label:placeLabel}))]))};
const world={toWorld:(lon,lat)=>[(lon-127)*100,(37-lat)*100],surfaceAt:()=>0,
  rings:[[[-500,-500],[500,-500],[500,500],[-500,500]]]};
const context={x:0,z:0,year:521,world};
const base=estimatedSiteThreshold('three-kingdoms',37);
test.afterEach(()=>loadFactLayers(null));

test('without context all legacy period and latitude thresholds remain exact',()=>{
  loadFactLayers(layers);
  const ratios={'early-settlement':.10,'early-farming':.18,'three-kingdoms':.30,goryeo:.38,joseon:.50,
    'late-joseon':.55,'opening-period':.55,'early-modern':.55,postwar:.60,'modern-farming':.60,
    'early-roof-transition':.60,'roof-transition':.60,mechanized:.60,unknown:.45};
  for(const [period,ratio] of Object.entries(ratios))for(const latitude of [null,33,34.2,37,38.5,39]){
    const expected=ratio*(latitude===33?.6:latitude===39?.7:1);
    assert.equal(estimatedSiteThreshold(period,latitude),expected);
    assert.equal(estimatedSiteThreshold(period,latitude,{}),expected);
  }
});

test('900 households multiply nearby threshold by about 1.34 with inclusive distance and year boundaries',()=>{
  loadFactLayers(layers);
  const expected=base*(.6+Math.log10(900)/4);
  assert.ok(Math.abs(estimatedSiteThreshold('three-kingdoms',37,context)/base-1.34)<.02);
  for(const change of [{},{x:40},{z:-40},{year:371},{year:671}])
    assert.equal(estimatedSiteThreshold('three-kingdoms',37,{...context,...change}),expected);
  for(const change of [{x:40.001},{z:40.001},{year:370},{year:672},{world:null}])
    assert.equal(estimatedSiteThreshold('three-kingdoms',37,{...context,...change}),base);
  loadFactLayers(null);
  assert.equal(estimatedSiteThreshold('three-kingdoms',37,context),base);
});

test('nearest eligible record wins; population conversion, count floor and final clamp apply',()=>{
  const record=layers.density[0];
  const nearby={...record,lon:127.1,households:10000};
  for(const density of [[nearby,record],[record,nearby]]){
    loadFactLayers({density});
    assert.equal(estimatedSiteThreshold('three-kingdoms',37,context),base*(.6+Math.log10(900)/4));
  }
  for(const [households,population,factor] of [[null,50000,1.6],[100,0,1.1],[0,null,1.1],[1e20,null,1.8]]){
    loadFactLayers({density:[{...record,households,population}]});
    assert.equal(estimatedSiteThreshold('three-kingdoms',37,context),base*factor);
  }
  assert.equal(estimatedSiteThreshold('mechanized',37,context),.95);
  loadFactLayers({density:[{...record,year:1000},nearby]});
  assert.equal(estimatedSiteThreshold('three-kingdoms',37,context),base*1.6);
});

test('selection forwards site coordinates and current year and preserves seed determinism',()=>{
  loadFactLayers(layers);
  const site={id:'fixture-site',x:0,z:0,latitude:37,radius:12,seed:35};
  assert.deepEqual(selectEstimatedSites([site],[],[],'three-kingdoms'),[]);
  const select=year=>selectEstimatedSites([site],[],[],()=> 'three-kingdoms',()=>true,{world,year});
  assert.deepEqual(select(521),[site]);assert.deepEqual(select(521),select(521));
  assert.deepEqual(select(672),[]);
});

test('administrative cities and institutions become dated zones and planned sites',()=>{
  const administrative=layers.administrative.filter(r=>r.kind!=='facility');
  const zones=buildSettlementZones([],{},[],{administrative});
  assert.equal(zones.length,2);
  const city=zones.find(z=>z.kind==='regional'),institution=zones.find(z=>z.kind==='town');
  assert.deepEqual(city,{id:'inhabited:fact:시험-도읍:427',label:'시험 도읍',lon:127,lat:37,
    startYear:427,endYear:2100,kind:'regional',localityType:'city',radius:28,openEnded:true,
    sourceIds:['facts'],claimIds:['claim-fixture-city'],contextType:'settlement',
    basis:'사실 조사(#182) 행정 기록에 근거한 익명 생활 배경. 구역 크기와 집 수는 복원이 아니다.'});
  assert.equal(institution.radius,19);assert.equal(institution.endYear,600);assert.equal(institution.openEnded,false);
  const sites=planSettlementSites(world,zones);
  assert.equal(sites.length,2);assert.ok(sites.every(s=>s.documented));
  assert.deepEqual(sites.find(s=>s.kind==='regional').claimIds,city.claimIds);
});

test('existing scene and place zones win within .03 degrees and overlapping dates',()=>{
  const city=layers.administrative[0];
  const scene={id:'existing',kind:'settlement',startYear:400,endYear:500,dateClaimIds:['date'],actionClaimIds:['action'],
    place:{label:'기존 구역',lon:127.02,lat:37,claimIds:['place'],coordinateSourceIds:['source']}};
  const existing=buildSettlementZones([scene]);
  assert.deepEqual(buildSettlementZones([scene],{},[],{administrative:[city]}),existing);
  assert.equal(buildSettlementZones([scene],{},[],{administrative:[{...city,from:500}]}).length,1);
  assert.equal(buildSettlementZones([scene],{},[],{administrative:[{...city,from:501}]}).length,2);
  assert.equal(buildSettlementZones([scene],{},[],{administrative:[{...city,lon:127.06}]}).length,2);
  const place={id:'existing',kind:'city',labelKo:'기존 도시',candidates:[{lon:127,lat:37,grounded:true,
    claimId:'place',sourceId:'source',validFrom:400,validTo:500}]};
  assert.deepEqual(buildSettlementZones([],{},[place],{administrative:[city]}),buildSettlementZones([],{},[place]));
});

test('facility is excluded and counted, and none is not a settlement zone',t=>{
  const messages=[];t.mock.method(console,'info',message=>messages.push(message));
  const facility=layers.administrative.find(r=>r.kind==='facility');
  assert.deepEqual(buildSettlementZones([],{},[],{administrative:[facility,{...facility,kind:'none'}]}),[]);
  assert.deepEqual(messages,['[fact-layers] facility 구역 제외: 1']);
});

test('world loading fetches once and shares the same object with density and both zone consumers',async t=>{
  let calls=0;
  t.mock.method(globalThis,'fetch',async url=>{
    calls++;assert.ok(url.href.endsWith('/services/host/app/fact-layers.json'));
    return {ok:true,json:async()=>layers};
  });
  t.mock.method(console,'info',()=>{});
  const loadedWorld={...world};
  assert.equal(await loadWorldFactLayers(loadedWorld),layers);
  assert.equal(await loadWorldFactLayers(loadedWorld),layers);assert.equal(calls,1);
  assert.equal(loadedWorld.factLayers,layers);
  assert.ok(estimatedSiteThreshold('three-kingdoms',37,{...context,world:loadedWorld})>base);
  const zones=buildSettlementZones([],{},[],loadedWorld.factLayers);
  const scenery=new ChronicleScenery({world:{...loadedWorld,bounds:{minX:0,maxX:0,minZ:0,maxZ:0},contains:()=>true},engine:{add(){}}});
  assert.deepEqual(scenery.sites.filter(s=>s.documented).map(s=>s.id),planSettlementSites(world,zones).map(s=>s.id));
});

test('failed fact fetch reports the failure and keeps legacy scenery available',async t=>{
  const messages=[];
  t.mock.method(globalThis,'fetch',async()=>({ok:false,status:404}));
  t.mock.method(console,'warn',(...args)=>messages.push(args));
  const loadedWorld={...world};
  const result=await loadWorldFactLayers(loadedWorld);
  assert.deepEqual(result,{version:1,generatedFrom:[],density:[],administrative:[]});
  assert.equal(messages.length,1);assert.equal(messages[0][1].message,'HTTP 404');
  assert.equal(estimatedSiteThreshold('three-kingdoms',37,context),base);
});

test('same-era year changes refresh density selection across the record window',()=>{
  const scenery=Object.create(ChronicleScenery.prototype);let refreshes=0;
  Object.assign(scenery,{stats:{},world:{factLayers:layers},initialized:true,activeSites:()=>[],
    refreshPeriod:()=>refreshes++,sync(){}});
  scenery.setYear(671);const first=refreshes;
  scenery.setYear(672);assert.equal(refreshes,first+1);
  scenery.setYear(672);assert.equal(refreshes,first+1);
});
