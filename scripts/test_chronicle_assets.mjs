import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {contextAt} from '../services/host/app/chronicle.js';
import {planChronicleAssets,personArchetype} from '../services/host/app/chronicle-asset-plan.js';
import {compileAssetCatalog,normalizeAssetRecipe} from '../services/host/app/assetcatalog.js';

const person={id:'person-a',type:'Person',label:'인물'};
const event={id:'event-a',type:'Event',label:'전투'};
const claim=(id,subject,predicate,object)=>({id,subject,predicate:'syj:'+predicate,object,fromSource:'src-a'});
const year=value=>({kind:'year',value});
const data={entities:[person,event],claims:[claim('born',person.id,'bornIn',year(1550)),
  claim('died',person.id,'diedIn',year(1599)),claim('date',event.id,'occurredIn',year(1593)),
  claim('participant',event.id,'hasParticipant',{kind:'entity',id:person.id})]};
const site={id:'site-a',geometry:{type:'Point',coordinates:[126.8,37.6]},properties:{eventId:event.id,validFrom:1593,validTo:1593}};
const plan=(y,features=[site],d=data)=>planChronicleAssets(contextAt(d,y),d,features);
assert.deepEqual(plan(1593).events[0].participants,[],'A whole-war relationship does not put a person at the event location');
assert.equal(plan(1593).people[0].placement,'unlocated');
assert.equal('coordinates' in plan(1593).people[0],false,'A lifespan does not become a geographic location');
assert.equal(plan(1593,[]).events[0].sites.length,0,'No fallback to guessed geography');
assert.equal(plan(1592).events.length,0,'Nearby events do not acquire active 3D models');
assert.equal(plan(1600).people.length,0,'Dead figures leave the scene');
assert.equal(plan(1593,[{...site,properties:{...site.properties,validTo:1592}}]).events[0].sites.length,0,'Stale location responses are rejected');
assert.equal(plan(1593,[{...site,geometry:{type:'Point',coordinates:[0,0]}}]).events[0].sites.length,0);
assert.deepEqual(plan(1593,[],{entities:[],claims:[]}),{year:1593,people:[],events:[]});
assert.equal(personArchetype(person.id,[claim('king',person.id,'hasTitle',{kind:'literal',value:'조선의 왕'})]),'human','A Korean king does not become a European fantasy king');
assert.equal(personArchetype(person.id,[claim('scholar',person.id,'describedAs',{kind:'literal',value:'문신'})]),'scribe');

const raw=JSON.parse(await readFile(new URL('../services/host/app/history-asset-catalog.json',import.meta.url),'utf8'));
const provenance=JSON.parse(await readFile(new URL('../docs/research/fantology-assets-93.json',import.meta.url),'utf8'));
for(const [file,expected] of Object.entries(provenance.moduleTextSha256)){
  const text=(await readFile(new URL('../services/host/app/'+file,import.meta.url),'utf8')).replace(/\r\n/g,'\n');
  assert.equal(createHash('sha256').update(text).digest('hex'),expected,'Original generator text: '+file);
}
const catalog=compileAssetCatalog(raw);
assert.equal(catalog.blueprintCount,36);
const outline=JSON.parse(await readFile(new URL('../services/host/app/korea-outline.json',import.meta.url),'utf8'));
assert.equal(createHash('sha256').update(await readFile(new URL('../'+outline.properties.source,import.meta.url))).digest('hex'),outline.properties.sha256);
const displayProof=JSON.parse(await readFile(new URL('../docs/research/peninsula-assets-94.json',import.meta.url),'utf8'));
const sceneText=(await readFile(new URL('../services/host/app/chronicle-assets.js',import.meta.url),'utf8')).replace(/\r\n/g,'\n');
const tree='function makeTreeGeometry() {'+sceneText.split('function makeTreeGeometry() {')[1].split('\n}')[0]+'\n}';
assert.equal(createHash('sha256').update(tree).digest('hex'),displayProof.treeFunctionSha256,'Use the actual original world tree geometry');
for(const archetype of ['human','scribe','monk','battle','hanging_scroll','ship','wall','table','book','handcart','steelworks','station','train','car','motor_ship','civic_hall','rocket','rifle_soldier','korean_hall','korean_house']){
  const {recipe,dropped}=normalizeAssetRecipe({archetype,anchor:'test',form:archetype==='battle'?'local':archetype==='hanging_scroll'?'plain':['human','scribe','monk'].includes(archetype)?'civilian':undefined},catalog);
  assert.deepEqual(dropped,[]);assert.equal(recipe.materialExplicit,false,'Keep the blueprint materials for individual parts');
  assert.ok(catalog.cores.get(archetype).blueprint.p.length>=5,'Use the assembled blueprint, not a generic fallback box');
}
const scene={id:'scene-a',eventId:event.id,title:'전투',kind:'naval',summary:'선박 전투',startYear:1593,endYear:1593,
  dateClaimIds:['date'],actionClaimIds:['participant'],place:{label:'해협',medium:'sea',precision:'area',lon:127,lat:35,
    coordinateSourceIds:['geography-a'],claimIds:['date'],anchorPlaceId:'land-center'},
  participants:[{entityId:person.id,presence:'related',side:'naval',role:'관련 지휘관',claimIds:['participant']}],
  effects:{fire:{enabled:true,claimIds:['participant']}}};
const packetPlan=(s=scene,d=data,y=1593)=>planChronicleAssets(contextAt(d,y),d,[],[{id:'land-center',candidates:[{lon:127,lat:37}]}],[s]);
assert.deepEqual(packetPlan().events[0].scenePlace.coordinates,[127,35]);
assert.equal(packetPlan().events[0].participants[0].presence,'related');
assert.equal(packetPlan({...scene,place:{...scene.place,lon:null,lat:null}}).events[0].scenePlace,null,'A sea scene cannot use a county center');
assert.equal(packetPlan(scene,{...data,claims:data.claims.filter(c=>c.id!=='participant')}).events[0].scenePlace,undefined,'Missing action evidence removes the curated scene');
assert.equal(packetPlan(scene,data,1592).events.length,0);
assert.equal(packetPlan({...scene,effects:{fire:{enabled:true,claimIds:['participant'],startYear:1592,endYear:1592}}}).events[0].effects.fire.enabled,false,'An effect does not continue beyond its own recorded year');
assert.deepEqual(packetPlan(scene,{entities:[],claims:[]}).events,[]);
const packets=JSON.parse(await readFile(new URL('../services/host/app/history-scenes.json',import.meta.url),'utf8')).scenes;
assert.equal(packets.find(s=>s.id==='scene-myeongnyang-1597').effects.fire.enabled,false,'Fire arrows do not prove burning ships');
assert.equal(packets.find(s=>s.id==='scene-gohado-jin-1597').place.anchorPlaceId,undefined,'Mokpo center is not Gohado');
assert.equal(packets.find(s=>s.id==='scene-danghangpo-2-1594').participants.find(p=>p.entityId==='person-encykorea-yi-sunsin').presence,'related');
assert.equal(new Set(packets.flatMap(s=>s.participants.filter(p=>p.entityId.startsWith('polity-residents-')).map(p=>p.entityId))).size,4);
console.log('PASS: actual blueprints, materials, lifespans, event dates, participant evidence, unknown locations and empty selection');
