import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const data=JSON.parse(fs.readFileSync(path.join(here,'../services/host/app/history-scenes.json'),'utf8'));
const scenes=new Map(data.scenes.map(s=>[s.id,s]));

const SCENE_FUNCTIONS=new Set(['rail_station','temple','print_workshop','migration','persecution','naval_expedition','civil_conflict','uprising_battle']);
const ROLES=new Set(['militia','soldier','police','civilian','monk','printer','scholar','commoner','ruler','commander','worker']);
const STANCES=new Set(['attacker','defender','bystander','worker','victim','marching']);
const SIDES=new Set(['a','b','c']);

const EXPECTED={
  'scene-mod-seoul-station-1925':'rail_station',
  'scene-jikji-1377':'print_workshop',
  'scene-daejanggyeong-pangak-1237':'print_workshop',
  'scene-jeju43-1947-1954':'civil_conflict',
  'scene-ugeumchi-1894':'uprising_battle',
  'scene-anc-usanguk-512':'naval_expedition',
  'scene-anc-cheonghaejin-abolition-851':'migration',
  'scene-syj128-haeinsa-802':'temple',
  'scene-jl-sinyu-bakhae-1801':'persecution',
};

test('issue #173 packets carry the expected sceneFunction',()=>{
  for(const [id,fn] of Object.entries(EXPECTED)){
    const s=scenes.get(id);assert.ok(s,`scene missing: ${id}`);
    assert.equal(s.sceneFunction,fn,id);
    assert.ok(SCENE_FUNCTIONS.has(s.sceneFunction),id);
  }
});

test('every sceneFunction and participantGroups in the file use the allowed vocabulary and known claim ids',()=>{
  for(const s of data.scenes){
    if(s.sceneFunction!==undefined)assert.ok(SCENE_FUNCTIONS.has(s.sceneFunction),`${s.id}: sceneFunction ${s.sceneFunction}`);
    if(s.participantGroups===undefined)continue;
    assert.ok(Array.isArray(s.participantGroups)&&s.participantGroups.length>0,`${s.id}: participantGroups must be a non-empty array`);
    assert.equal(s.participantGroupsNote,'count 는 화면 표현값이며 사료의 인원수가 아니다',`${s.id}: participantGroupsNote`);
    const known=new Set((s.participants||[]).flatMap(p=>p.claimIds||[]));
    const entities=new Set((s.participants||[]).map(p=>p.entityId));
    for(const g of s.participantGroups){
      assert.ok(ROLES.has(g.role),`${s.id}: role ${g.role}`);
      assert.ok(STANCES.has(g.stance),`${s.id}: stance ${g.stance}`);
      assert.ok(SIDES.has(g.side),`${s.id}: side ${g.side}`);
      assert.ok(typeof g.label==='string'&&g.label.length>0,`${s.id}: label`);
      assert.ok(Number.isInteger(g.count)&&g.count>0,`${s.id}: count`);
      assert.ok(g.entityId===null||entities.has(g.entityId),`${s.id}: entityId ${g.entityId} not in participants`);
      assert.ok(Array.isArray(g.claimIds),`${s.id}: claimIds array`);
      for(const c of g.claimIds)assert.ok(known.has(c),`${s.id}: claim ${c} not in participants[].claimIds`);
      if(g.entityId===null)assert.ok(typeof g.basis==='string'&&g.basis.length>0,`${s.id}: null-entity group needs basis`);
    }
  }
});

test('packets that were given participantGroups have the requested groups',()=>{
  const want={
    'scene-jikji-1377':[['printer','worker','a',6]],
    'scene-daejanggyeong-pangak-1237':[['printer','worker','a',8]],
    'scene-jeju43-1947-1954':[['militia','attacker','a',8],['soldier','defender','b',8],['police','defender','b',4],['civilian','victim','c',12]],
    'scene-ugeumchi-1894':[['militia','attacker','a',12],['soldier','defender','b',8]],
    'scene-jl-sinyu-bakhae-1801':[['civilian','victim','c'],['soldier','defender','b']],
  };
  for(const [id,groups] of Object.entries(want)){
    const s=scenes.get(id);
    assert.equal(s.participantGroups.length,groups.length,id);
    groups.forEach(([role,stance,side,count],i)=>{
      const g=s.participantGroups[i];
      assert.deepEqual([g.role,g.stance,g.side],[role,stance,side],`${id}[${i}]`);
      if(count!==undefined)assert.equal(g.count,count,`${id}[${i}] count`);
    });
  }
  for(const id of ['scene-mod-seoul-station-1925','scene-anc-usanguk-512','scene-anc-cheonghaejin-abolition-851','scene-syj128-haeinsa-802'])
    assert.equal(scenes.get(id).participantGroups,undefined,`${id} should not have participantGroups`);
});
