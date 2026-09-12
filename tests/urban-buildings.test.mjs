import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildingArchetype,extendBuildingCatalog,urbanBuildingDimensions} from '../services/host/app/period-buildings.js';
import {compileAssetCatalog} from '../services/host/app/assetcatalog.js';
const raw=JSON.parse(await readFile(new URL('../services/host/app/history-asset-catalog.json',import.meta.url),'utf8'));
test('urban families compile concrete geometry, with low postwar and taller modern blocks',()=>{
 const expanded=extendBuildingCatalog(raw),catalog=compileAssetCatalog(expanded);
 for(const year of [1930,1960,2010])for(const type of ['lowrise','apartment','commercial','civic','transit','industrial','warehouse'])for(let seed=0;seed<3;seed++){
  const id=buildingArchetype('urban_'+type,year,{seed}),blueprint=expanded.blueprints[id];
  assert.ok(catalog.cores.has(id),id);assert.ok(blueprint.p.length>=3,id);
  assert.ok(blueprint.p.every(part=>Object.values(part).every(value=>typeof value!=='number'||Number.isFinite(value))),id);
 }
 assert.ok(urbanBuildingDimensions('apartment',1960).height<urbanBuildingDimensions('apartment',2010).height);
 assert.notEqual(buildingArchetype('urban_lowrise',1944),buildingArchetype('urban_lowrise',1945));
 assert.notEqual(buildingArchetype('urban_apartment',1969),buildingArchetype('urban_apartment',1970));
 assert.equal(raw.blueprints.urban_modern_lowrise_0,undefined);
});
