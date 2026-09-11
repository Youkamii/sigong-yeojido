import assert from 'node:assert/strict';
import {territoryAnchor,inPolygon,visibleTerritories,territoryName} from '../services/host/app/territory-label-geometry.js';
const square=(x,y,size)=>[[x,y],[x+size,y],[x+size,y+size],[x,y+size],[x,y]];
const feature=(coordinates,type='Polygon',name='Silla',label='신라 · 참고 영역',from=500,to=660)=>({id:name,geometry:{type,coordinates},properties:{label,validFrom:from,validTo:to,sourceRecord:{Name:name}}});
const concave=feature([[[0,0],[10,0],[10,2],[2,2],[2,10],[0,10],[0,0]]]);
const concaveAnchor=territoryAnchor(concave);assert.ok(inPolygon(concaveAnchor.x,concaveAnchor.z,concave.geometry.coordinates));
const hole=feature([square(0,0,10),square(3,3,4)]),holeAnchor=territoryAnchor(hole);
assert.ok(inPolygon(holeAnchor.x,holeAnchor.z,hole.geometry.coordinates));assert.ok(holeAnchor.clearance>1);
const islands=feature([[square(50,50,2)],[square(0,0,10)]],'MultiPolygon'),islandAnchor=territoryAnchor(islands);
assert.ok(islandAnchor.x<10&&islandAnchor.z<10,'anchor belongs to largest connected polygon, never a remote island');
const landAnchor=territoryAnchor(feature([square(0,0,10)]),undefined,(x,z)=>x<2&&z<2);
assert.ok(landAnchor.x<2&&landAnchor.z<2,'ocean candidates rejected');
assert.equal(territoryAnchor(hole,undefined,()=>false),null,'no on-land anchor means no label');
const transformed=territoryAnchor(feature([square(0,0,10)]),(x,y)=>[x*8,-y*8]);
assert.ok(Math.abs(transformed.x-40)<.1&&Math.abs(transformed.z+40)<.1);
const rows=[feature([square(0,0,10)]),feature([square(0,0,10)],'Polygon','Baekje','백제 · 참고 영역'),feature([square(0,0,10)],'Polygon','Goguryeo','고구려 · 참고 영역',500,681),feature([square(0,0,10)],'Polygon','Joseon','조선 · 참고 영역',1392,1897)];
assert.deepEqual(visibleTerritories(rows,600).map(territoryName),['신라','백제','고구려']);
assert.deepEqual(visibleTerritories(rows,1500).map(territoryName),['조선']);
assert.equal(visibleTerritories(rows,669).length,0,'Goguryeo post-668 exclusion preserved');
assert.equal(visibleTerritories(rows,-500).length,0);
assert.equal(visibleTerritories(rows,600,{origin:'human'}).length,0);
assert.equal(visibleTerritories(rows,600,{sources:new Set()}).length,0);
assert.equal(visibleTerritories(rows,600,{origin:'ai',sources:new Set(['selected-source'])}).length,3);
assert.equal(visibleTerritories(rows,500).length,3);assert.equal(visibleTerritories(rows,660).length,3);
console.log('PASS: concavity, holes, largest component, land rejection, transform, Korean names, temporal boundaries, source/origin filters');
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const catalog=JSON.parse(gunzipSync(readFileSync(new URL('../data/maps/cliopatria-korea-v013.geojson.gz',import.meta.url))));
for(const [year,names] of [[600,['고구려','신라','백제']],[1500,['조선']]]){
  const active=visibleTerritories(catalog.features,year);
  assert.deepEqual(active.map(territoryName).sort(),names.sort());
  for(const row of active){const anchor=territoryAnchor(row);assert.ok(anchor&&inPolygon(anchor.x,anchor.z,anchor.polygon));}
}
console.log('PASS: checked-in catalog names and interior anchors at 600 and 1500');
