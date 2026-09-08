import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {projectCoordinates,unprojectCoordinates,latitudeCoordinates,coordinateRegistry,regionalCoordinate} from '../services/host/app/history-coordinates.js';
import {contextAt} from '../services/host/app/chronicle.js';
import {planChronicleAssets} from '../services/host/app/chronicle-asset-plan.js';

const anchors=JSON.parse(await readFile(new URL('../services/host/app/history-place-anchors.json',import.meta.url),'utf8'));
const supplement=JSON.parse(await readFile(new URL('../services/host/app/history-coordinates.json',import.meta.url),'utf8'));
const registry=coordinateRegistry(anchors,supplement);
for(const p of registry.places){
  const result=unprojectCoordinates(...projectCoordinates(p.lon,p.lat,8),8);
  assert.ok(Math.abs(result[0]-p.lon)<1e-9&&Math.abs(result[1]-p.lat)<1e-9,p.label);
}
const parallel=latitudeCoordinates(38);
assert.equal(parallel[0][0],123);assert.equal(parallel.at(-1)[0],132);
assert.equal(new Set(parallel.map(p=>projectCoordinates(...p,8)[1])).size,1,'38 N remains one latitude across all longitudes');
assert.ok(projectCoordinates(127,39,8)[1]<projectCoordinates(127,37,8)[1],'North is negative z');

const city={id:'geo-hanseong',label:'서울',aliases:['한성'],entityIds:['place-hanseong'],lon:126.97,lat:37.57,
  precision:'area',sourceIds:['geo-source'],coordinateNote:'도시 기준점'};
const geo={places:[city]};
assert.equal(regionalCoordinate(geo,'place-hanseong','한성'),city);
assert.equal(regionalCoordinate(geo,'unrelated','한성부의 어느 성'),null,'No substring matching');
assert.equal(regionalCoordinate({places:[city,{...city,id:'different',lon:128}]},null,'한성'),null,'Namesakes need an identity link');
const person={id:'person-a',type:'Person',label:'인물'};
const place={id:'place-hanseong',type:'Place',label:'한성'};
const data={entities:[person,place],claims:[
  {id:'life',subject:person.id,predicate:'syj:bornIn',object:{kind:'year',value:1500},fromSource:'source'},
  {id:'death',subject:person.id,predicate:'syj:diedIn',object:{kind:'year',value:1560},fromSource:'source'},
  {id:'activity',subject:person.id,predicate:'syj:activeIn',object:{kind:'entity',id:place.id},fromSource:'source',validFrom:1530,validTo:1532}]};
const plan=(year,d=data)=>planChronicleAssets(contextAt(d,year),d,[],[],[],geo);
assert.equal(plan(1531).people[0].locationReference.placeId,city.id);
assert.equal(plan(1520).people[0].locationReference,null,'A lifetime does not extend a dated regional activity');
const undated={...data,claims:data.claims.map(c=>c.id==='activity'?{...c,validFrom:null,validTo:null}:c)};
assert.equal(plan(1531,undated).people[0].locationReference,null,'Undated regional membership cannot establish activity in this year');
console.log(`PASS: ${registry.places.length} geographic round trips, 38 N, aliases, namesakes and dated regional activity`);
