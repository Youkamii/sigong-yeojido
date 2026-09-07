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
assert.equal(plan(1593).events[0].participants[0].entityId,person.id);
assert.deepEqual(plan(1593).events[0].participants[0].relationClaims,['participant']);
assert.equal(plan(1593).people[0].placement,'collection');
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
assert.equal(catalog.blueprintCount,5);
for(const archetype of ['human','scribe','monk','battle','hanging_scroll']){
  const {recipe,dropped}=normalizeAssetRecipe({archetype,anchor:'test',form:archetype==='battle'?'local':archetype==='hanging_scroll'?'plain':'civilian'},catalog);
  assert.deepEqual(dropped,[]);assert.equal(recipe.materialExplicit,false,'Keep the blueprint materials for individual parts');
  assert.ok(catalog.cores.get(archetype).blueprint.p.length>8,'Use real assemblies, not a generic fallback box');
}
console.log('PASS: actual blueprints, materials, lifespans, event dates, participant evidence, unknown locations and empty selection');
