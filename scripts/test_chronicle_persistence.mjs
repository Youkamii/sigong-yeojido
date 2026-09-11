import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){return specifier==='three'
  ?{url:new URL('../services/host/vendor/three.module.min.js',import.meta.url).href,shortCircuit:true,format:'module'}:{...next(specifier,context),...(specifier.endsWith('.js')?{format:'module'}:{})};}});
const THREE=await import('three');
const {ChronicleAssets}=await import('../services/host/app/chronicle-assets.js');
const {sceneVisualKey}=await import('../services/host/app/chronicle-persistence.js');
const {readFile}=await import('node:fs/promises');
const {compileAssetCatalog}=await import('../services/host/app/assetcatalog.js');
const engine={scene:new THREE.Scene(),add(group){this.scene.add(group);},remove(group){this.scene.remove(group);},flyTo(){}};
const world={toWorld:(x,z)=>[x,z],surfaceAt:()=>0,contains:()=>true};
const assets=new ChronicleAssets(engine,world,{stats:{}});
// Exercise real composition/reconciliation and Three ownership without a WebGL/canvas runtime.
assets.field=(recipes,anchors)=>{
  const group=new THREE.Group(),picks=[];
  for(const recipe of recipes){const pick=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial());
    pick.position.copy(anchors.get(recipe.anchor));pick.userData.fanAssetId=recipe.id;group.add(pick);picks.push(pick);}
  return {group,picks,animated:[],stats:{built:recipes.length,requested:recipes.length,dropped:[],batches:1}};
};
assets.scenery={sync(){},start(){},clearings:[]};assets.buildForest=()=>{};
const person=(id='p')=>({id,entityId:id,kind:'person',label:'인물',role:'관리',archetype:'scribe',presence:'on-site',claimIds:['old']});
const event=(id='a',x=0)=>({id,entityId:id,label:'도시',summary:'도시 활동',detail:'첫 근거',year:1500,endYear:1600,
  archetype:'settlement',effects:{},claimIds:['old'],participants:[person()],scenePlace:{coordinates:[x,0],medium:'land',label:'도시'}});
const plan=(events,year=1500)=>({events,people:[],year});
assets.rebuild(plan([event()]));
const original=assets.rows.find(r=>r.id==='a').pick,actor=assets.rows.find(r=>r.kind==='person').pick;
const composition=assets.sceneCache.get('a').scene.group,path=assets.pathMesh;
let disposed=0;original.geometry.addEventListener('dispose',()=>disposed++);
const revised={...event(),year:1501,label:'새 도시 이름',summary:'갱신된 설명',detail:'새 근거',claimIds:['new'],participants:[{...person(),label:'새 인물 이름',claimIds:['new']}]};
assets.rebuild(plan([revised],1501));
assert.equal(assets.rows.find(r=>r.id==='a').pick,original);
assert.equal(assets.rows.find(r=>r.kind==='person').pick,actor);
assert.equal(assets.sceneCache.get('a').scene.group,composition);
assert.equal(assets.pathMesh,path);assert.equal(disposed,0);
assert.equal(assets.rows.find(r=>r.id==='a').detail,'새 근거');
assert.deepEqual(assets.rows.find(r=>r.kind==='person').claimIds,['new']);
assert.equal(assets.reuse.builtFields,0);assert.equal(assets.reuse.builtScenes,0);
assets.rebuild(plan([revised,event('b',500)],1501));
assert.equal(assets.rows.find(r=>r.id==='a').pick,original,'A separate arriving event retains existing city');
assert.equal(assets.rows.find(r=>r.id==='p@a').pick,actor);
assets.rebuild(plan([{...revised,participants:[...revised.participants,person('q')]}],1501));
assert.equal(assets.rows.find(r=>r.id==='a').pick,original,'An added person retains the city batch');
assert.equal(assets.rows.find(r=>r.id==='p@a').pick,actor,'An unchanged named person retains its mesh');
assert.ok(!assets.picks.some(p=>p.userData.fanNodeId==='b'));
const close=event('close',.1);assets.activeScene='close';
assets.rebuild(plan([revised,close],1501));
assert.equal(assets.rows.find(r=>r.id==='a').compact,true,'Selection re-evaluates collision compactness');
assert.notEqual(assets.rows.find(r=>r.id==='a').pick,original);assert.equal(disposed,1);
assets.setSelected('close');assert.ok(assets.selection);
assets.rebuild(plan([],1502));
assert.equal(assets.rows.length,0);assert.equal(assets.picks.length,0);
assert.equal(assets.sceneCache.size,0);assert.equal(assets.fieldCache.size,0);assert.equal(assets.selection,null);
const key=e=>sceneVisualKey(e,new THREE.Vector3(),false,Infinity);
assert.equal(key(event()),key({...event(),year:1501}));
assert.notEqual(key({...event(),year:1875}),key({...event(),year:1876}));
assert.notEqual(key({...event(),visualActions:{constructionYears:[1500]}}),key({...event(),year:1501,visualActions:{constructionYears:[1500]}}));
assert.notEqual(key(event()),key({...event(),participants:[{...person(),archetype:'monk'}]}));
assert.notEqual(key(event()),key({...event(),effects:{fire:{enabled:true}}}));
assert.notEqual(key({...event(),year:2000}),key({...event(),summary:'철도 공사',year:2000}));
console.log('PASS: Three object identity, metadata freshness, event/person add/remove, selection collision layout, disposal, era and effects');

// Run the production batching too; only texture painting is replaced (no DOM/GPU).
const context=new Proxy({getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
  createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
  createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},
  {get:(target,key)=>target[key]||(()=>{})});
globalThis.document={createElement:()=>({getContext:()=>context})};
const catalog=compileAssetCatalog(JSON.parse(await readFile(new URL('../services/host/app/history-asset-catalog.json',import.meta.url),'utf8')));
const production=new ChronicleAssets(engine,world,catalog);
production.scenery=assets.scenery;production.buildForest=()=>{};
production.rebuild(plan([event()]));
const primary=production.rows.find(row=>row.id==='a').pick;
const draws=production.stats.meshes;
production.rebuild(plan([{...event(),year:1501}],1501));
assert.equal(production.rows.find(row=>row.id==='a').pick,primary);
assert.equal(production.reuse.builtFields,0);
assert.equal(production.stats.meshes,draws);
assert.ok(production.stats.batches<=5,'Structures and anonymous residents stay batched');
const baseline=production.field(production.rows.map(row=>({id:row.id,anchor:row.id,archetype:row.archetype,
  scale:row.scale,seed:row.id,offset:[0,row.position.y,0],form:row.archetype==='spearman'?'warrior':undefined,
  action:row.action||'idle'})),new Map(production.rows.map(row=>[row.id,row.position])));
assert.ok(draws<=baseline.stats.meshes*1.2,'Persistence does not split anonymous residents into separate draw calls');
console.log('PASS: production instanced field identity; meshes='+draws+', previous combined field meshes='+baseline.stats.meshes+', batches='+production.stats.batches);
production.release(baseline.group);

