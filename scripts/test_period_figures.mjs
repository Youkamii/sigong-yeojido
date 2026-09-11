import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {figureArchetype,figureEra,figureEras,figureRoles,extendFigureCatalog} from '../services/host/app/period-figures.js';
import {activityFigure} from '../services/host/app/chronicle-asset-plan.js';
import {compileAssetCatalog,normalizeAssetRecipe} from '../services/host/app/assetcatalog.js';
const raw=JSON.parse(readFileSync(new URL('../services/host/app/history-asset-catalog.json',import.meta.url),'utf8'));
const before=JSON.stringify(raw),extended=extendFigureCatalog(raw),catalog=compileAssetCatalog(extended);
assert.equal(JSON.stringify(raw),before,'Extending figures does not mutate the checked-in catalog or village definitions');
assert.deepEqual(extendFigureCatalog(extended),extended,'Repeated loading does not duplicate cores');
assert.equal(extended.categories.humanoids.cores.length,raw.categories.humanoids.cores.length+figureEras.length*figureRoles.length);
for(const [year,era] of [[-1000,'early'],[-1,'early'],[0,'three_kingdoms'],[600,'three_kingdoms'],[917,'three_kingdoms'],[918,'goryeo'],[1391,'goryeo'],[1392,'joseon'],[1894,'joseon'],[1895,'transition'],[1944,'transition'],[1945,'modern'],[2026,'modern']])assert.equal(figureEra(year).id,era);
const shape=bp=>JSON.stringify(bp.p.map(({c,m,...part})=>part));
for(const role of figureRoles){
  const silhouettes=new Set();
  for(const era of figureEras){
    const id=figureArchetype(role,Math.max(era.from,-1000)),core=catalog.cores.get(id);
    assert.ok(core?.blueprint.p.length>=12,id+' has assembled geometry');
    const normalized=normalizeAssetRecipe({archetype:id,anchor:'test',form:'civilian'},catalog);
    assert.deepEqual(normalized.dropped,[]);assert.equal(normalized.recipe.archetype,id);
    for(const p of core.blueprint.p){assert.ok(['box','cyl','rcyl','cone','sph'].includes(p.k));for(const [key,value] of Object.entries(p))if(typeof value==='number')assert.ok(Number.isFinite(value),id+'.'+key);}
    silhouettes.add(shape(core.blueprint));
  }
  assert.equal(silhouettes.size,figureEras.length,role+' changes geometry, not only color, across all display eras');
}
for(const era of figureEras){
  const year=Math.max(era.from,-1000);
  assert.equal(new Set(figureRoles.map(role=>shape(extended.blueprints[figureArchetype(role,year)]))).size,6,era.id+' roles have different silhouettes');
}
const claim=(text,from,to,predicate='syj:describedAs')=>({subject:'person',predicate,object:{value:text},validFrom:from,validTo:to});
assert.equal(activityFigure('person','',600,[claim('국왕',590,620,'syj:hasTitle')]),figureArchetype('ruler',600));
assert.equal(activityFigure('person','',580,[claim('국왕',590,620,'syj:hasTitle')]),figureArchetype('commoner',580),'Future office does not become current dress');
assert.equal(activityFigure('person','지휘관',1592,[]),figureArchetype('commander',1592));
assert.equal(activityFigure('person','승려',1100,[]),figureArchetype('monk',1100));
assert.equal(activityFigure('person','학자',2026,[]),figureArchetype('scholar',2026),'Modern time no longer erases the role');
assert.equal(activityFigure('person','보병',1950,[]),figureArchetype('soldier',1950));
assert.equal(activityFigure('person','',1500,[claim('학자',null,null)]),figureArchetype('commoner',1500),'Undated office is not treated as current');
console.log('PASS: 36 compileable era/role blueprints, structural silhouette changes, nonmutation, period endpoints and time-qualified role selection');
