// #173 시설·행위·참여 관계 → 모델 연결. 평지 world stub 은 city-composition.test.mjs 와 같은 방식.
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){return specifier==='three'?{url:new URL('../services/host/vendor/three.module.min.js',import.meta.url).href,shortCircuit:true,format:'module'}:next(specifier,context);}});
const THREE=await import('three');
const {composeHistoricalEvent}=await import('../services/host/app/chronicle-event-scenes.js');
const {figureArchetype}=await import('../services/host/app/period-figures.js');
const {activityFigure}=await import('../services/host/app/chronicle-asset-plan.js');
const flat={contains:()=>true,surfaceAt:()=>0};
const compose=(event)=>composeHistoricalEvent({id:'t',label:'',summary:'',participants:[],effects:{},year:1894,...event},new THREE.Vector3(),flat);

test('sceneFunction rail_station: station 포함, korean_hall/palace 없음',()=>{
  const scene=compose({archetype:'construction',sceneFunction:'rail_station',year:1899});
  assert.equal(scene.compositionKind,'rail_station');
  assert.ok(scene.models.some(m=>m.archetype==='station'));
  assert.ok(scene.models.every(m=>!/korean_hall|palace/.test(m.archetype)));
});

test('uprising_battle + participantGroups: attacker 8·defender 6, archetype 이 다름',()=>{
  const scene=compose({archetype:'battle',sceneFunction:'uprising_battle',year:1894,
    participantGroups:[{entityId:null,label:'농민군',role:'militia',stance:'attacker',side:'a',count:8,claimIds:[]},
      {entityId:null,label:'관군',role:'soldier',stance:'defender',side:'b',count:6,claimIds:[]}]});
  const attackers=scene.models.filter(m=>m.stance==='attacker'),defenders=scene.models.filter(m=>m.stance==='defender');
  assert.equal(attackers.length,8);assert.ok(attackers.every(m=>m.action==='attacking'));
  assert.equal(defenders.length,6);assert.ok(defenders.every(m=>m.action==='defending'));
  assert.notEqual(attackers[0].archetype,defenders[0].archetype);
  assert.equal(attackers[0].archetype,'field_worker');
  assert.equal(defenders[0].archetype,figureArchetype('soldier',1894));
  assert.ok(attackers.every(m=>m.position.z>0)&&defenders.every(m=>m.position.z<0));
  // 깃발: a=청, b=적
  const flags=scene.group.children.filter(c=>c.name.startsWith('event-side-'));
  assert.deepEqual(flags.map(f=>f.name).sort(),['event-side-a','event-side-b']);
  // 결정론: 같은 입력이면 같은 출력
  const again=compose({archetype:'battle',sceneFunction:'uprising_battle',year:1894,
    participantGroups:[{entityId:null,label:'농민군',role:'militia',stance:'attacker',side:'a',count:8,claimIds:[]},
      {entityId:null,label:'관군',role:'soldier',stance:'defender',side:'b',count:6,claimIds:[]}]});
  assert.deepEqual(scene.models.map(m=>[m.archetype,...m.position.toArray()]),again.models.map(m=>[m.archetype,...m.position.toArray()]));
});

test('civil_conflict: civilian bystander 군집은 soldier archetype 을 쓰지 않는다',()=>{
  const scene=compose({archetype:'battle',sceneFunction:'civil_conflict',year:1946,
    participantGroups:[{entityId:null,label:'주민',role:'civilian',stance:'bystander',side:'c',count:10,claimIds:[]},
      {entityId:null,label:'경찰',role:'police',stance:'attacker',side:'b',count:4,claimIds:[]}]});
  const bystanders=scene.models.filter(m=>m.stance==='bystander');
  assert.equal(bystanders.length,10);
  const soldierArchetype=figureArchetype('soldier',1946);
  assert.ok(bystanders.every(m=>m.archetype!==soldierArchetype&&!/soldier|spearman/.test(m.archetype)));
  assert.ok(bystanders.every(m=>m.action==='idle'&&m.position.x<0));
  assert.ok(bystanders.every(m=>Math.hypot(m.position.x+24,m.position.z)<=6.01));
  assert.ok(scene.models.filter(m=>m.stance==='attacker').every(m=>m.archetype===soldierArchetype));
  assert.ok(scene.group.children.every(c=>c.name!=='event-side-c'));
});

test('migration: handcart 포함, 12명 walking 한 줄',()=>{
  const scene=compose({archetype:'assembly',sceneFunction:'migration',year:1950});
  assert.ok(scene.models.some(m=>m.archetype==='handcart'));
  const walkers=scene.models.filter(m=>m.action==='walking');
  assert.equal(walkers.length,12);assert.ok(walkers.every(m=>m.position.z===walkers[0].position.z));
});

test('sceneFunction 없는 기존 battle 패킷은 10+10 그대로 (회귀)',()=>{
  const event={archetype:'battle',year:1592,effects:{attack:{enabled:true}},sides:[{side:'invader',presence:'on-site'}]};
  const scene=compose(event);
  const soldierArchetype=figureArchetype('soldier',1592);
  assert.equal(scene.models.filter(m=>m.archetype===soldierArchetype&&m.side==='defender').length,10);
  assert.equal(scene.models.filter(m=>m.archetype===soldierArchetype&&m.side==='invader').length,10);
  assert.equal(scene.compositionKind,'battle');
});

test('activityFigure: 비구니 → monk',()=>{
  assert.equal(activityFigure('p1','비구니 · 사찰 간행 주도',1600,[]),figureArchetype('monk',1600));
  assert.equal(activityFigure('p1','여승',1600,[]),figureArchetype('monk',1600));
});

test('figureArchetype: 새 역할은 카탈로그에 있는 archetype 또는 commoner 폴백',()=>{
  assert.equal(figureArchetype('militia',1894),'field_worker');
  assert.equal(figureArchetype('worker',1894),'field_worker');
  assert.equal(figureArchetype('police',1900),'rifle_soldier');
  assert.equal(figureArchetype('police',1800),figureArchetype('soldier',1800));
  assert.equal(figureArchetype('civilian',1800),'period_figure');
  assert.equal(figureArchetype('civilian',1950),'modern_figure');
  assert.equal(figureArchetype('printer',1500),figureArchetype('commoner',1500));
  assert.equal(figureArchetype('unknown_role',1500),figureArchetype('commoner',1500));
});

test('모든 sceneFunction 이 평지·해안 stub 에서 예외 없이 구성된다',()=>{
  const coast={contains:(x,z)=>z<=10,surfaceAt:()=>0};
  for(const fn of ['rail_station','temple','print_workshop','migration','persecution','naval_expedition','civil_conflict','uprising_battle']){
    for(const world of [flat,coast]){
      const scene=composeHistoricalEvent({id:'s-'+fn,label:'',summary:'',participants:[],effects:{},year:1880,archetype:'construction',sceneFunction:fn,scenePlace:{medium:'land'}},new THREE.Vector3(),world);
      assert.equal(scene.compositionKind,fn);assert.ok(scene.models.length>0,fn);
      if(fn==='persecution')assert.ok(scene.models.every(m=>!/palace|hall/.test(m.archetype)));
      if(fn==='naval_expedition'&&world===coast){assert.equal(scene.models.filter(m=>m.medium==='sea').length,3);assert.ok(scene.models.filter(m=>m.medium==='sea').every(m=>m.position.z>10));}
    }
  }
});
