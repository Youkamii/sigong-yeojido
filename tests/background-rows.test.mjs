import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){return specifier==='three'?{url:new URL('../services/host/vendor/three.module.min.js',import.meta.url).href,shortCircuit:true,format:'module'}:next(specifier,context);}});
const {ChronicleAssets,pickableRow}=await import('../services/host/app/chronicle-assets.js');
const {ChronicleScene,sceneDestinationOptions}=await import('../services/host/app/chronicle-scene.js');

const backgrounds=[{scope:'anonymous-city'},{scope:'facility'},{startYear:470,endYear:590}]
  .flatMap((siteBackground,index)=>{
    const row={id:'background-'+index,entityId:'background-entity-'+index,kind:'event',label:'배경',siteBackground};
    return [row,{...row,id:row.id+':part:1',kind:'building',sceneId:row.id}];
  });
const documented={id:'scene-city-hanseong-capital-1394-1910',entityId:'hanseong',kind:'event',
  label:'한성부',setting:true,archetype:'settlement',sceneId:'scene-city-hanseong-capital-1394-1910'};
const ordinary=[{id:'event',entityId:'event-entity',kind:'event',label:'사건'},
  {id:'person',entityId:'person-entity',kind:'person',label:'인물'},documented,
  {...documented,id:documented.id+':part:1',kind:'building'}];

test('pickableRow excludes background primaries and parts but keeps events, people and documented settlements',()=>{
  const rows=[...backgrounds,...ordinary],before=JSON.stringify(rows);
  const byRecipe=new Map(rows.map(row=>[row.id,row]));
  const picks=rows.map(row=>({userData:{fanAssetId:row.id}}));
  assert.deepEqual(picks.filter(pick=>pickableRow(byRecipe.get(pick.userData.fanAssetId))),picks.slice(backgrounds.length));
  assert.equal(JSON.stringify(rows),before);
  assert.equal(pickableRow({...ordinary[0],siteBackground:{scope:'other'}}),true);
});

test('dropdown options exclude background rows and retain documented settlements and duplicate entity destinations',()=>{
  const duplicate={...ordinary[1],id:'person@event',detail:'현장'};
  const rows=[...backgrounds,{...backgrounds[0],entityId:documented.entityId},...ordinary,duplicate];
  const before=JSON.stringify(rows),options=sceneDestinationOptions(rows);
  assert.deepEqual(options.map(option=>option.value),['event-entity','person-entity','hanseong','person@event']);
  assert.deepEqual(options[2],{label:'도시·시설 · 한성부',value:'hanseong',sceneRow:documented.id,sceneEntity:'hanseong'});
  assert.equal(options[3].label,'인물 · 현장');
  assert.deepEqual(sceneDestinationOptions(backgrounds),[]);
  assert.equal(JSON.stringify(rows),before);
});

function selectionScene(rows){
  const scene=Object.create(ChronicleScene.prototype);
  const unexpected=()=>assert.fail('background selection must not change state or invoke UI work');
  scene.assets={rows,plan:{events:rows},selected:'existing',selectedRow:'existing-row',activeScene:'existing-scene',
    rowFor:ChronicleAssets.prototype.rowFor,setSelected:unexpected,focus:unexpected};
  scene.preferredRow='existing-row';scene.markers=[];
  scene.refresh=unexpected;scene.renderFocus=unexpected;
  return scene;
}

test('select ignores background entity IDs, row IDs and part IDs without changing selection',()=>{
  const scene=selectionScene([...backgrounds,...ordinary]);
  const before=JSON.stringify(scene);
  for(const row of backgrounds)for(const id of [row.entityId,row.id]){
    assert.equal(scene.select(id),false,id);
    assert.equal(JSON.stringify(scene),before,id);
  }
});

test('select also ignores unlocated background plan entries',()=>{
  const scene=selectionScene([]);scene.assets.plan.events=backgrounds;
  const before=JSON.stringify(scene);
  for(const row of backgrounds)assert.equal(scene.select(row.id),false);
  assert.equal(JSON.stringify(scene),before);
});

test('select still selects and focuses documented Hanseong',()=>{
  const scene=selectionScene([documented]),calls=[];
  scene.preferredRow=documented.id;
  scene.refresh=()=>calls.push('refresh');scene.renderFocus=()=>calls.push('renderFocus');
  scene.assets.setSelected=(id,preferred)=>{scene.assets.selected=id;scene.assets.selectedRow=preferred;calls.push('setSelected');};
  scene.assets.focus=(id,preferred)=>{assert.equal(id,'hanseong');assert.equal(preferred,documented.id);calls.push('focus');return true;};
  assert.equal(scene.select('hanseong'),true);
  assert.equal(scene.assets.selected,'hanseong');assert.equal(scene.assets.selectedRow,documented.id);
  assert.equal(scene.assets.activeScene,documented.sceneId);assert.equal(scene.preferredRow,null);
  assert.deepEqual(calls,['refresh','setSelected','renderFocus','focus']);
});
