import test from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';
// Geometry is real; the texture-only canvas is inert in Node.
globalThis.document={createElement:()=>({getContext:()=>new Proxy({getImageData:()=>({data:new Uint8ClampedArray(512*512*4)}),createImageData:()=>({data:new Uint8ClampedArray(512*512*4)})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const three=new URL('../services/host/vendor/three.module.min.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){return s==='three'?{url:${JSON.stringify(three)},shortCircuit:true}:n(s,c);}`),import.meta.url);
const {ChronicleAssets}=await import('../services/host/app/chronicle-assets.js');

const world={bounds:{minX:-160,maxX:160,minZ:-160,maxZ:160},
  contains:(x,z)=>Math.abs(x)<158&&Math.abs(z)<158,
  surfaceAt:(x,z)=>7.04+Math.sin(x/19)*1.1+Math.cos(z/27)*.8,
  ridgeAt:()=>0,geography:{}};
const sites=Array.from({length:12},(_,i)=>({id:'site:'+i,x:-110+(i%4)*70,z:-110+Math.floor(i/4)*70,radius:12,seed:i*104729+7}));

// 길은 막힌 원 몇 개로 흉내 낸다. 바뀐 길목은 takeChanges 가 돌려준다.
const makePaths=()=>({key:'p0',blocked:[],pendingChanges:null,
  takeChanges(){const out=this.pendingChanges;this.pendingChanges=null;return out;},
  near(x,z,margin){return this.blocked.some(o=>Math.hypot(x-o.x,z-o.z)<o.radius+margin);}});

function makeAssets(paths){
  const assets=Object.create(ChronicleAssets.prototype);
  const scenery={sites,paths,nearPath:(x,z,margin)=>paths.near(x,z,margin)};
  Object.assign(assets,{engine:{quality:'low',add(){},remove(){}},world,scenery});
  return assets;
}

function snapshot(assets){
  const base=assets.forestBase;
  return {
    positions:assets.forestPositions.map(p=>[p.x.toFixed(6),p.y.toFixed(6),p.z.toFixed(6),p.treeScale]),
    meshes:base.meshes.map(m=>[m.name,m.count,[...m.instanceMatrix.array]]).sort((a,b)=>a[0]<b[0]?-1:1),
    dynamic:base.dynamic?[base.dynamic.count,[...base.dynamic.instanceMatrix.array]]:null,
  };
}

const occupiedA=[{x:-110,z:-110,radius:14},{x:40,z:40,radius:9}];
const occupiedB=[{x:-110,z:-110,radius:14},{x:-40,z:20,radius:22},{x:120,z:-90,radius:11}];
const scenesA=[{id:'a',x:0,z:0,scale:.3}];
const scenesB=[{id:'a',x:0,z:0,scale:.3},{id:'b',x:90,z:60,scale:.4}];

test('점유·길·장면이 바뀐 반경만 고친 숲은 전수 재배치와 같은 나무를 같은 자리에 둔다',()=>{
  const paths=makePaths();
  const incremental=makeAssets(paths);
  incremental.buildForest(occupiedA,scenesA);
  assert.ok(incremental.forestPositions.length>200,'표본이 비면 비교가 의미 없다');
  const candidates=incremental.treeCandidates,meshes=incremental.forestBase.meshes;

  // 길 한 곳이 막히고 점유·장면이 바뀐 상태를 부분 갱신으로 반영한다.
  paths.blocked=[{x:20,z:-60,radius:2}];
  paths.pendingChanges=[{x:20,z:-60}];paths.key='p1';
  incremental.buildForest(occupiedB,scenesB);
  assert.equal(incremental.treeCandidates,candidates,'후보와 인스턴스 메시는 한 번만 만든다');
  assert.equal(incremental.forestBase.meshes,meshes);

  const fullPaths=makePaths();
  fullPaths.blocked=[{x:20,z:-60,radius:2}];fullPaths.key='p1';
  const full=makeAssets(fullPaths);
  full.buildForest(occupiedB,scenesB);

  assert.deepEqual(snapshot(incremental),snapshot(full));
});

test('가려진 후보는 스케일 0 행렬로 남고 edge/grove 나무만 따로 다시 만든다',()=>{
  const paths=makePaths();
  const assets=makeAssets(paths);
  assets.buildForest([],[]);
  const base=assets.forestBase,hiddenBefore=[...base.visible].filter(v=>!v).length;
  const firstDynamic=base.dynamic;
  assert.equal(base.group.children.length,base.meshes.length+(firstDynamic?1:0));

  paths.pendingChanges=[];paths.key='p1';
  assets.buildForest([{x:0,z:0,radius:60}],[]);
  const hiddenAfter=[...base.visible].filter(v=>!v).length;
  assert.ok(hiddenAfter>hiddenBefore,'점유 원 안의 후보가 가려져야 한다');
  for(let i=0;i<base.candidates.length;i++){
    if(base.visible[i])continue;
    const {mesh,slot}=base.slots[i],row=mesh.instanceMatrix.array.subarray(slot*16,slot*16+16);
    assert.equal(Math.abs(row[0]),0);assert.equal(Math.abs(row[5]),0);assert.equal(Math.abs(row[10]),0);
  }
  assert.notEqual(base.dynamic,firstDynamic,'동적 나무 메시만 다시 만든다');
  assert.equal(assets.forestPositions.length,[...base.visible].filter(Boolean).length+(base.dynamic?.count||0));
});

test('같은 입력이면 숲을 다시 만들지 않는다',()=>{
  const paths=makePaths();
  const assets=makeAssets(paths);
  assets.buildForest(occupiedA,scenesA);
  const before=assets.forestPositions;
  assets.buildForest(occupiedA,scenesA);
  assert.equal(assets.forestPositions,before);
});
