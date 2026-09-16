import test from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';
const three=new URL('../services/host/vendor/three.module.min.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){return s==='three'?{url:${JSON.stringify(three)},shortCircuit:true}:n(s,c);}`),import.meta.url);
const THREE=await import('three');
const {computeLandscape,overviewBuckets,createWorldView,linearColor,serializeWorld}=await import('../services/host/app/scene-layout.js');
const {createSceneLayoutCore}=await import('../services/host/app/workers/scene-layout.worker.js');
const {createSceneLayoutClient}=await import('../services/host/app/scene-layout-client.js');
const {sceneryOverview}=await import('../services/host/app/scenery-overview.js');
const {terrainSurface}=await import('../services/host/app/terrain-surface.js');
const {insideCoastline,coastlineDistance}=await import('../services/host/app/coastline-index.js');
const {projectCoordinates}=await import('../services/host/app/history-coordinates.js');

// 실제 뷰어처럼 "그려진 삼각형"에서 높이를 읽는다. 워커는 같은 배열만 받는다.
const height=(x,z)=>7.04+Math.sin(x/17)*1.3+Math.cos(z/23)*.9+Math.abs(x*z)/9000;
const terrain=(()=>{
  const out=[];
  for(let x=-126;x<126;x+=6)for(let z=-126;z<126;z+=6){
    const corners=[[x,z],[x+6,z],[x+6,z+6],[x,z+6]].map(([a,b])=>[a,height(a,b),b]);
    out.push(...corners[0],...corners[1],...corners[2],...corners[0],...corners[2],...corners[3]);
  }
  return new Float32Array(out);
})();
const ringPoints=()=>[[-120,-120],[120,-120],[120,120],[-120,120]].map(p=>[p[0],p[1]]);

function makeMainWorld(){
  const rings=[ringPoints()];
  const world={rings,mapScale:8,seaLevel:7,
    contains:(x,z,margin=0)=>rings.some(r=>insideCoastline(x,z,r)&&(!margin||coastlineDistance(x,z,r,margin)>=margin)),
    toWorld:(lon,lat)=>projectCoordinates(lon,lat,8)};
  world.surfaceAt=terrainSurface(new THREE.Float32BufferAttribute(terrain.slice(),3),()=>7);
  world.neighbors={rings:[]};world.factLayers=null;
  world.land={getObjectByName:name=>name==='peninsula-surface'?{geometry:{attributes:{position:{array:terrain}}}}:null};
  return world;
}
// 실제 뷰어와 같은 직렬화 경로(평평한 Float64Array 링)를 그대로 태운다.
const workerWorldPayload=()=>serializeWorld(makeMainWorld());

const sites=Array.from({length:18},(_,i)=>({
  id:(i%3?'settlement-region:z':'estimated-region:z')+i,
  x:-96+(i%6)*38,z:-96+Math.floor(i/6)*38,latitude:35.2+i*.15,seed:i*7919+13,
  kind:i%5?'village':'town',radius:i%5?12:19,angle:.21*i,scale:1,layout:i%4,
  documented:i%3!==0,estimated:i%3===0,startYear:-3000,endYear:2026}));

const request={year:1700,quality:'high',
  occupied:[{x:0,z:0,radius:8},{x:-58,z:20,radius:3}],
  areaOccupied:[{x:0,z:0,radius:20},{x:-58,z:20,radius:3}],
  estimatedIds:[],preserve:false,occupancyKey:'occ',parcelKey:'par'};

test('워커 핸들러 결과는 같은 입력의 동기 결과와 마을 배치·정점·색·법선이 모두 같다',()=>{
  const mainWorld=makeMainWorld();
  const direct=computeLandscape({...request,sites},mainWorld);
  const core=createSceneLayoutCore();
  core.handle({type:'init',world:workerWorldPayload(),sites:structuredClone(sites)});
  const out=core.handle(structuredClone({...request,type:'layout',token:1,ack:null}));
  const reply=structuredClone(out.response);

  assert.ok(direct.cells.length>3,'표본이 비어 있으면 비교가 의미 없다');
  assert.deepEqual(reply.order,direct.cells.map(c=>c.site.id));
  assert.deepEqual(reply.estimatedIds,direct.estimatedIds);
  assert.equal(reply.houses,direct.houses);
  assert.equal(reply.fields,direct.fields);
  for(const cell of direct.cells)assert.deepEqual(reply.cells[cell.site.id].layout,cell.layout);

  // 메인의 three 경로(computeVertexNormals 포함)와 워커가 보낸 배열을 직접 맞춘다.
  const group=sceneryOverview(mainWorld,direct.cells,request.year);
  assert.equal(group.children.length,reply.buckets.length);
  assert.ok(reply.buckets.length>0);
  group.children.forEach((mesh,i)=>{
    const bucket=reply.buckets[i];
    assert.equal(mesh.userData.bucket,bucket.bucket);
    assert.deepEqual(mesh.geometry.attributes.position.array,bucket.positions);
    assert.deepEqual(mesh.geometry.attributes.color.array,bucket.colors);
    assert.deepEqual(mesh.geometry.attributes.normal.array,bucket.normals);
    assert.deepEqual(mesh.userData.houseRanges||[],bucket.ranges);
  });
});

test('워커가 재사용 기준으로 삼는 것은 메인이 실제로 반영(ack)한 응답뿐이다',()=>{
  const core=createSceneLayoutCore();
  core.handle({type:'init',world:workerWorldPayload(),sites:structuredClone(sites)});
  const first=core.handle({...request,type:'layout',token:1,ack:null}).response;
  assert.equal(first.retainedIds.length,0);
  // 반영하지 않은(ack 없는) 다음 요청은 옛 기준 그대로라 다시 전부 만든다.
  const dropped=core.handle({...request,type:'layout',token:2,ack:null,preserve:true}).response;
  assert.equal(dropped.retainedIds.length,0);
  assert.equal(dropped.dirty,null);
  // 반영했다고 알린 뒤에는 같은 입력에서 모든 마을을 재사용하고 먼 배치도 다시 만들지 않는다.
  const reused=core.handle({...request,type:'layout',token:3,ack:2,preserve:true}).response;
  assert.equal(reused.retainedIds.length,reused.order.length);
  assert.deepEqual(reused.buckets,[]);
  assert.deepEqual(reused.dirty,[]);
});

test('팔레트 색은 three.Color 의 sRGB→선형 변환과 한 값도 다르지 않다',()=>{
  const styles=['#aa9570','#aa9773','#697977','#719369','#b8b2a2','#7b8280','#819258','#9a9d64','#b1a26a',
    '#87915b','#939868','#a99b78','#bbb7a6','#c4c8c5','#7e999f','#d0c7b1','#919f9f','#79613e','#887049','#666d68'];
  for(const style of styles){
    const expected=new THREE.Color(style),actual=linearColor(style);
    assert.equal(new Float32Array([actual.r])[0],new Float32Array([expected.r])[0],style);
    assert.equal(new Float32Array([actual.g])[0],new Float32Array([expected.g])[0],style);
    assert.equal(new Float32Array([actual.b])[0],new Float32Array([expected.b])[0],style);
  }
});

const fakeWorld=()=>({rings:[ringPoints()],neighbors:{rings:[]},mapScale:8,seaLevel:7,factLayers:null,
  land:{getObjectByName:()=>({geometry:{attributes:{position:{array:terrain}}}})}});

class FakeWorker{
  constructor(url,options){this.url=url;this.options=options;this.posted=[];FakeWorker.last=this;}
  postMessage(message){this.posted.push(message);}
  terminate(){this.terminated=true;}
}

test('연속 확정에서 옛 토큰 응답은 버리고 최신 응답만 반영하며 ack 를 함께 보낸다',()=>{
  const results=[];
  const client=createSceneLayoutClient({world:fakeWorld(),sites:[],WorkerClass:FakeWorker,
    onResult:data=>results.push(data.token),onFallback:()=>assert.fail('폴백이 일어나면 안 된다')});
  const worker=FakeWorker.last;
  assert.equal(worker.posted[0].type,'init');
  assert.equal(worker.options.type,'module');
  client.request({year:1600});client.request({year:1601});
  assert.deepEqual(worker.posted.slice(1).map(m=>m.token),[1,2]);
  worker.onmessage({data:{type:'layout',token:1}});
  assert.deepEqual(results,[],'늦게 온 옛 작업은 버린다');
  worker.onmessage({data:{type:'layout',token:2}});
  assert.deepEqual(results,[2]);
  client.request({year:1602});
  assert.equal(worker.posted.at(-1).ack,2,'반영한 응답만 재사용 기준으로 알린다');
  client.dispose();
});

test('워커가 실패하면 한 번만 경고하고 폴백으로 넘어간다',t=>{
  const warnings=[];
  t.mock.method(console,'warn',(...args)=>warnings.push(args));
  let fallbacks=0;
  const first=createSceneLayoutClient({world:fakeWorld(),sites:[],WorkerClass:FakeWorker,
    onResult:()=>{},onFallback:()=>fallbacks++});
  FakeWorker.last.onerror({message:'boom'});
  assert.equal(fallbacks,1);assert.equal(first.available,false);
  assert.equal(first.request({year:1600}),false,'폴백 뒤에는 워커로 보내지 않는다');
  const second=createSceneLayoutClient({world:fakeWorld(),sites:[],WorkerClass:FakeWorker,
    onResult:()=>{},onFallback:()=>fallbacks++});
  FakeWorker.last.onerror({message:'boom again'});
  assert.equal(fallbacks,2);
  assert.equal(warnings.length,1,'경고는 세션에 한 번만 남긴다');
  second.dispose();
});

test('응답이 오지 않으면 감시 시간이 지난 뒤 폴백한다',()=>{
  let fallbacks=0;const timers=new Map();let id=0;
  const client=createSceneLayoutClient({world:fakeWorld(),sites:[],WorkerClass:FakeWorker,timeoutMs:1000,
    schedule:(fn)=>{timers.set(++id,fn);return id;},cancel:key=>timers.delete(key),
    onResult:()=>{},onFallback:()=>fallbacks++});
  client.request({year:1600});
  assert.equal(timers.size,1);
  [...timers.values()][0]();
  assert.equal(fallbacks,1);assert.equal(client.available,false);
});

test('워커 없는 환경에서는 손잡이를 만들지 않는다',()=>{
  assert.equal(createSceneLayoutClient({world:fakeWorld(),sites:[],WorkerClass:undefined,onResult:()=>{}}),null);
  assert.equal(createSceneLayoutClient({world:{rings:[]},sites:[],WorkerClass:FakeWorker,onResult:()=>{}}),null);
  assert.equal(serializeWorld({rings:[]}),null);
});
