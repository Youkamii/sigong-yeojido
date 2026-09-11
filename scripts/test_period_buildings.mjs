import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {extendBuildingCatalog,buildingArchetype} from '../services/host/app/period-buildings.js';
import {compileAssetCatalog,normalizeAssetRecipe} from '../services/host/app/assetcatalog.js';
import {sceneryPeriod,sceneryRecipe} from '../services/host/app/scenery-period.js';
const raw=JSON.parse(await readFile(new URL('../services/host/app/history-asset-catalog.json',import.meta.url),'utf8'));
const original=JSON.stringify(raw),extended=extendBuildingCatalog(raw),catalog=compileAssetCatalog(extended);
assert.equal(JSON.stringify(raw),original,'The base catalog remains unchanged');
assert.equal(extendBuildingCatalog(extended).categories.buildings.cores.length,extended.categories.buildings.cores.length);
const ids=Object.keys(extended.blueprints).filter(id=>id.startsWith('era_'));
assert.equal(ids.length,108);
for(const archetype of ids){
  const {dropped}=normalizeAssetRecipe({id:archetype,archetype,anchor:'a',scale:.2},catalog);
  assert.deepEqual(dropped,[]);assert.ok(extended.blueprints[archetype].p.length<22,'Compact shapes avoid individual tile geometry');
}
for(const year of [-500,600,1200,1600,1930,2000]){
  const house=buildingArchetype('house',year),store=buildingArchetype('rural_store',year);
  assert.notEqual(house,store,'Storage keeps its own silhouette');
  assert.ok(catalog.cores.has(house)&&catalog.cores.has(store));
  assert.equal(new Set([0,1,2].map(seed=>JSON.stringify(extended.blueprints[buildingArchetype('house',year,{seed})]))).size,3);
}
assert.equal(buildingArchetype('ship',1600),'ship');
assert.equal(buildingArchetype('house',1500),buildingArchetype('house',1600));
assert.notEqual(buildingArchetype('house',600),buildingArchetype('house',1200));
const recipe={id:'scenery-village:1:4',archetype:'rural_store',scale:.2};
assert.match(sceneryRecipe(recipe,sceneryPeriod(-500),{seed:12,latitude:35}).archetype,/_store_/);
assert.equal(sceneryRecipe({...recipe,archetype:'market'},sceneryPeriod(-500),{seed:12,latitude:35}),null);
console.log('PASS: 108 compact role/period variants, immutable extension, deterministic variety and storage roles');
