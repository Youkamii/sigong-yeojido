import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {yearAtPointer,createYearPlayback} from '../services/host/app/year-hold.js';
import {sceneryPeriodKey,scenePlanKey,historicalFeaturesKey,createYearCommit} from '../services/host/app/year-scrub.js';
import {createHistoryCache,historyRequestKey} from '../services/host/app/history-map.js';
import {createYearIndex} from '../services/host/app/year-index.js';
import {contextAt,buildContextIndex,Chronicle} from '../services/host/app/chronicle.js';

const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const feature=(id='f',lon=127)=>({id,geometry:{type:'Point',coordinates:[lon,37]},properties:{name:id}});
const filters=(year=1593)=>({year,sources:new Set(['a']),primary:new Set(),origin:'all',level:4});
const reply=(features=[feature()])=>({ok:true,json:async()=>({features})});
function jobs(){let id=0;const tasks=new Map();return {tasks,schedule(fn,delay){tasks.set(++id,{fn,delay});return id;},cancel(id){tasks.delete(id);},async next(){const [id,job]=tasks.entries().next().value;tasks.delete(id);return job.fn();}};}

test('thumb maps full range, outside bounds, rounding and BCE without year zero',()=>{
  assert.equal(yearAtPointer(100,100,460),-2500);
  assert.equal(yearAtPointer(560,100,460),2100);
  assert.equal(yearAtPointer(-1,100,460),-2500);
  assert.equal(yearAtPointer(1000,100,460),2100);
  assert.equal(yearAtPointer(350,100,460),1);
  assert.equal(yearAtPointer(349.99,100,460),-1);
  assert.equal(yearAtPointer(0,0,0),-2500);
  assert.equal(yearAtPointer(25.6,0,100,100,200),126);
});

test('density keys reuse equal rounded values and preserve threshold and urban changes',()=>{
  const sites=[{id:'s',kind:'rural',periodId:'joseon',density:.502,scale:1,selected:true}];
  const key=sceneryPeriodKey('joseon',sites);
  assert.equal(key,sceneryPeriodKey('joseon',[{...sites[0],density:.503}]));
  for(const change of [{density:.52},{scale:.8},{selected:false},{periodId:'modern'},{kind:'urban'},{layoutKey:[true]}])
    assert.notEqual(key,sceneryPeriodKey('joseon',[{...sites[0],...change}]));
});

test('scene keys respond to same-count actors, placement, visual and evidence changes',()=>{
  const plan={year:1593,people:[],events:[{id:'s',entityId:'e',year:1593,kind:'event',archetype:'battle',label:'A',
    scenePlace:{coordinates:[127,37],medium:'land',displayScale:1},effects:{fire:{enabled:false}},
    participants:[{id:'p',entityId:'p',role:'ruler',presence:'on-site'}],claimIds:['c']}]};
  const key=scenePlanKey(plan,null,'features');
  assert.equal(key,scenePlanKey(structuredClone(plan),null,'features'));
  const changes=[p=>p.year++,p=>p.events[0].id='s2',p=>p.events[0].kind='person',p=>p.events[0].archetype='court',
    p=>p.events[0].scenePlace.coordinates[0]++,p=>p.events[0].scenePlace.displayScale=.5,
    p=>p.events[0].participants[0].id='q',p=>p.events[0].participants[0].presence='related',
    p=>p.events[0].participants[0].role='teacher',p=>p.events[0].participants.push({id:'q'}),
    p=>p.events[0].effects.fire.enabled=true,p=>p.events[0].participantGroups=[{count:8,stance:'attacker'}],
    p=>p.events[0].sceneFunction='temple',p=>p.events[0].heritageFloors=7,
    p=>p.events[0].continuing={kind:'facility',facilityLook:'industry'},p=>p.events[0].claimIds=['other']];
  for(const change of changes){const copy=structuredClone(plan);change(copy);assert.notEqual(key,scenePlanKey(copy,null,'features'));}
  assert.notEqual(key,scenePlanKey(plan,'s','features'));
  assert.notEqual(key,scenePlanKey(plan,null,'other features'));
});

test('feature keys include year, order, geometry and properties for same IDs',()=>{
  const original=[feature()];const key=historicalFeaturesKey(original,1593);
  assert.equal(key,historicalFeaturesKey(structuredClone(original),1593));
  assert.notEqual(key,historicalFeaturesKey(original,1594));
  assert.notEqual(key,historicalFeaturesKey([feature('f',128)],1593));
  assert.notEqual(key,historicalFeaturesKey([{...feature(),properties:{name:'changed'}}],1593));
});

test('history cache aborts previous load, rejects stale responses and reuses filter-specific data',async()=>{
  const calls=[];const cache=createHistoryCache({request:(url,{signal})=>{const d=deferred();calls.push({url,signal,...d});return d.promise;}});
  const old=cache.load(filters(1593)),latest=cache.load(filters(1594));
  assert.equal(calls[0].signal.aborted,true);
  calls[1].resolve(reply());const current=await latest;
  calls[0].resolve(reply([feature('stale')]));assert.equal(await old,null);
  assert.equal(await cache.load(filters(1594)),current);assert.equal(calls.length,2);
  assert.equal(cache.cache.size,1);
  const changed=cache.load({...filters(1594),origin:'human'});assert.equal(calls.length,3);
  calls[2].resolve(reply([]));await changed;
  assert.notEqual(historyRequestKey(filters()),historyRequestKey({...filters(),level:5}));
  assert.notEqual(historyRequestKey(filters()),historyRequestKey({...filters(),sources:new Set(['b'])}));
});

test('history cache caps at 60 and prefetch is cached without superseding foreground',async()=>{
  let count=0;const cache=createHistoryCache({request:async()=>{count++;return reply();}});
  for(let year=100;year<161;year++)await cache.load(filters(year));
  assert.equal(cache.cache.size,60);assert.equal(cache.cache.has(historyRequestKey(filters(100))),false);
  await cache.prefetch(filters(162));const before=count;await cache.load(filters(162));assert.equal(count,before);
  const calls=[];const pending=createHistoryCache({request:(url,{signal})=>{const d=deferred();calls.push({signal,...d});return d.promise;}});
  const main=pending.load(filters()),warm=pending.prefetch(filters(1594));
  assert.equal(calls[0].signal.aborted,false);
  calls[0].resolve(reply());calls[1].resolve(reply());assert.ok(await main);await warm;
});

test('playback waits for completion then 1200ms, skipping busy or running ticks',async()=>{
  const clock=jobs(),work=deferred();let busy=true,count=0;
  const play=createYearPlayback({...clock,busy:()=>busy,advance:()=>{count++;return work.promise;}});
  play.start();assert.equal([...clock.tasks.values()][0].delay,1200);
  await clock.next();assert.equal(count,0);assert.equal(clock.tasks.size,0);
  busy=false;play.completed();const tick=clock.next();assert.equal(count,1);assert.equal(clock.tasks.size,0);
  await play.tick();assert.equal(count,1);
  work.resolve();await tick;assert.equal(clock.tasks.size,1);assert.equal([...clock.tasks.values()][0].delay,1200);
  play.stop();assert.equal(clock.tasks.size,0);
});

test('playback also waits 1200ms after a manual commit completes between ticks',async()=>{
  const clock=jobs();let now=1200,completed=1000,count=0;
  const play=createYearPlayback({...clock,now:()=>now,lastCompleted:()=>completed,advance:()=>count++});
  play.start();await clock.next();assert.equal(count,0);
  now=2400;await clock.next();assert.equal(count,1);play.stop();
});

test('commit paints preview before context and refreshes once with a prompt history response',async()=>{
  const calls=[],clock=jobs(),data={features:[feature()],year:1593,key:'f'};
  const pipeline=createYearCommit({...clock,preview:()=>calls.push('preview'),frame:async()=>calls.push('frame'),
    context:()=>calls.push('context'),features:async()=>data,applyFeatures:()=>calls.push('features'),
    refresh:()=>{calls.push('refresh');return 'f';},draw:()=>calls.push('draw')});
  const run=pipeline.run(1593);assert.deepEqual(calls,['preview','frame']);assert.equal(pipeline.busy,true);
  await run;assert.deepEqual(calls,['preview','frame','frame','context','frame','features','refresh','frame','draw']);
  assert.equal(pipeline.busy,false);assert.equal(clock.tasks.size,0);
});

test('late equal features skip rebuild; superseded commits cannot apply context or late responses',async()=>{
  const clock=jobs(),network=deferred(),calls=[];
  const emptyKey=historicalFeaturesKey([],1593);
  const pipeline=createYearCommit({...clock,preview:y=>calls.push(['preview',y]),frame:async()=>{},
    context:y=>calls.push(['context',y]),features:()=>network.promise,
    applyFeatures:data=>calls.push(['features',data.year]),refresh:()=>{calls.push(['refresh']);return emptyKey;},draw:()=>{}});
  const run=pipeline.run(1593);
  while(!clock.tasks.size)await Promise.resolve();await clock.next();await Promise.resolve();
  assert.equal(pipeline.busy,true);
  network.resolve({features:[],year:1593,key:emptyKey});await run;
  assert.equal(calls.filter(c=>c[0]==='refresh').length,1);
  const frames=[],late=deferred();
  const next=createYearCommit({...clock,preview:()=>{},frame:()=>{const d=deferred();frames.push(d);return d.promise;},
    context:y=>calls.push(['new-context',y]),features:()=>late.promise,applyFeatures:()=>calls.push(['new-features']),refresh:()=>'',draw:()=>{}});
  const first=next.run(1600),second=next.run(1601);frames[0].resolve();await first;
  assert.equal(calls.some(c=>c[0]==='new-context'),false);
  late.resolve(null);
  for(let i=1;i<5;i++){while(!frames[i])await Promise.resolve();frames[i].resolve();}
  await second;
  assert.deepEqual(calls.filter(c=>c[0]==='new-context'),[['new-context',1601]]);
  assert.equal(calls.filter(c=>c[0]==='new-features').length,1);
});

test('interval index includes long overlapping lifespans and preserves source order',()=>{
  const rows=[{lo:500,hi:510},{lo:-2500,hi:2100},{lo:499,hi:501},{lo:520,hi:520}];
  const index=createYearIndex(rows);
  assert.deepEqual(index.between(500,500),rows.slice(0,3));
  assert.deepEqual(index.between(511,519),[rows[1]]);
  assert.deepEqual(index.between(520,520),[rows[1],rows[3]]);
});

test('context index retains cross-window life, current event participation and source-matched reign',()=>{
  const claim=(id,subject,predicate,object,source='s')=>({id,subject,predicate:'syj:'+predicate,object,fromSource:source});
  const data={entities:[{id:'p',type:'Person',label:'P'},{id:'q',type:'Polity',label:'Q'},{id:'e',type:'Event',label:'E'}],claims:[
    claim('birth','p','bornIn',{kind:'year',value:100}),claim('death','p','diedIn',{kind:'year',value:200}),
    claim('reign','p','reignedIn',{kind:'time',earliest:140,latest:160}),claim('king','p','isKingOf',{kind:'entity',id:'q'}),
    claim('qdate','q','activeIn',{kind:'time',earliest:130,latest:170}),claim('event','e','occurredIn',{kind:'year',value:150}),
    claim('actor','e','hasParticipant',{kind:'entity',id:'p'})]};
  buildContextIndex(data);
  // A prepared index must not iterate all raw claims on later year queries.
  data.claims=new Proxy(data.claims,{get(target,key){if(['map','filter',Symbol.iterator].includes(key))throw Error('full claims scan');return Reflect.get(target,key);}});
  const c=contextAt(data,150,2);
  assert.equal(c.people.length,1);assert.equal(c.people[0].periods.length,3);assert.equal(c.people[0].relations.length,1);
  assert.equal(c.events[0].current,true);assert.equal(c.polities[0].id,'q');
  const later=contextAt(data,175,2);assert.equal(later.people.length,1);assert.equal(later.events.length,0);assert.equal(later.polities.length,0);
  assert.equal(later.previous,150);assert.equal(later.allEvents[0].current,false);
});

test('host module remains syntactically valid after async commit integration',()=>{
  const html=readFileSync(new URL('../services/host/index.html',import.meta.url),'utf8');
  const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1].replace(/^import .+;\s*$/gm,'');
  const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
  assert.doesNotThrow(()=>new AsyncFunction(script));
});

test('context panel reuses nodes across equal event lists while updating dates and life tracks',()=>{
  const view=Object.create(Chronicle.prototype),title={},range={},track={style:{}};let writes=0;
  const host={set innerHTML(value){writes++;},querySelector:selector=>selector.includes('h2')?title:range,querySelectorAll:()=>[track]};
  Object.assign(view,{host,controls:{querySelector:()=>({}),querySelectorAll:()=>[]},callbacks:{},
    timeline:{setEvents(){},setYear(){}},year:150,span:50,loading:false,data:{entities:[{id:'p',type:'Person',label:'P'}],claims:[
      {id:'born',subject:'p',predicate:'syj:bornIn',object:{kind:'year',value:100},fromSource:'s'},
      {id:'died',subject:'p',predicate:'syj:diedIn',object:{kind:'year',value:200},fromSource:'s'}]}});
  view.render();assert.equal(writes,1);
  view.year=151;view.render();assert.equal(writes,1);assert.equal(title.textContent,'151년');assert.equal(range.textContent,'126년~176년');
  assert.equal(track.style.width,'100%');
  view.year=201;view.render();assert.equal(writes,2,'changed people must invalidate the panel even with equal event IDs');
});

test('late changed features refresh once more and prevent playback completion until applied',async()=>{
  const clock=jobs(),network=deferred(),calls=[];
  const pipeline=createYearCommit({...clock,frame:async()=>{},preview(){},context(){},features:()=>network.promise,
    applyFeatures:data=>calls.push(['features',data.features.length]),refresh:()=>{calls.push(['refresh']);return 'empty';},
    draw:()=>calls.push(['draw']),done:()=>calls.push(['done'])});
  const run=pipeline.run(1593);while(!clock.tasks.size)await Promise.resolve();await clock.next();
  while(!calls.some(c=>c[0]==='draw'))await Promise.resolve();
  assert.equal(pipeline.busy,true);assert.equal(calls.some(c=>c[0]==='done'),false);
  network.resolve({features:[feature()],year:1593,key:'changed'});await run;
  assert.equal(calls.filter(c=>c[0]==='refresh').length,2);assert.equal(calls.at(-1)[0],'done');assert.equal(pipeline.busy,false);
});

test('a new year cancels a previous late response without changing the latest scene',async()=>{
  const clock=jobs(),old=deferred(),calls=[];
  const pipeline=createYearCommit({...clock,frame:async()=>{},preview(){},context(){},
    features:year=>year===1593?old.promise:Promise.resolve({features:[feature('new')],year,key:'new'}),
    applyFeatures:data=>calls.push(data.year),refresh:()=>'',draw(){}});
  const first=pipeline.run(1593);while(!clock.tasks.size)await Promise.resolve();await clock.next();
  while(!calls.length)await Promise.resolve();
  await pipeline.run(1594);old.resolve({features:[feature('old')],year:1593,key:'old'});await first;
  assert.deepEqual(calls,[1593,1594]);
});

test('two context renders while waiting for history produce one pending refresh at completion',async()=>{
  const clock=jobs(),network=deferred();let refreshes=0,draws=0;
  const key=historicalFeaturesKey([],1593);
  const pipeline=createYearCommit({...clock,frame:async()=>{},preview(){},context(){},features:()=>network.promise,
    applyFeatures(){},refresh:()=>{refreshes++;return key;},draw:()=>draws++});
  const run=pipeline.run(1593);await clock.next();
  while(!draws)await Promise.resolve();
  pipeline.requestRefresh(1593);pipeline.requestRefresh(1593);
  assert.equal(refreshes,1);
  network.resolve({features:[],year:1593,key});await run;
  assert.equal(refreshes,2);assert.equal(pipeline.busy,false);
});

test('filter-only commits forward keepSelection to preview and context',async()=>{
  let selected='person';const seen=[];
  const pipeline=createYearCommit({frame:async()=>{},preview:(year,{keepSelection})=>{if(!keepSelection)selected=null;},
    context:()=>seen.push(selected),features:async year=>({features:[],year,key:'empty'}),applyFeatures(){},refresh(){},draw(){}});
  await pipeline.run(1593,{keepSelection:true});assert.deepEqual(seen,['person']);
  await pipeline.run(1594);assert.deepEqual(seen,['person',null]);
});

test('late history timeout releases busy and applies arriving responses only for the latest year',async()=>{
  for(const changedYear of [false,true]){
    const clock=jobs(),network=deferred(),applied=[];let draws=0,refreshes=0,completions=0;
    const pipeline=createYearCommit({...clock,frame:async()=>{},preview(){},context(){},
      features:year=>year===1593?network.promise:Promise.resolve({features:[],year,key:'next'}),
      applyFeatures:data=>applied.push(data.year),refresh:()=>{refreshes++;return 'empty';},draw:()=>draws++,settled:()=>completions++});
    const run=pipeline.run(1593);await clock.next();
    while(![...clock.tasks.values()].some(t=>t.delay===8000))await Promise.resolve();
    assert.equal(pipeline.busy,true);await clock.next();await run;
    assert.equal(pipeline.busy,false);assert.equal(completions,1);assert.equal(clock.tasks.size,0);
    if(changedYear)await pipeline.run(1594);
    network.resolve({features:[feature()],year:1593,key:'late'});
    for(let i=0;i<10;i++)await Promise.resolve();
    assert.deepEqual(applied,changedYear?[1593,1594]:[1593,1593]);
    assert.equal(refreshes,2);assert.equal(draws,2);
  }
});

test('superseded finally does not flush a newer pending context refresh',async()=>{
  const clock=jobs(),old=deferred(),latest=deferred();let draws=0,refreshes=0;
  const pipeline=createYearCommit({...clock,frame:async()=>{},preview(){},context(){},
    features:year=>year===1593?old.promise:latest.promise,applyFeatures(){},
    refresh:year=>{refreshes++;return historicalFeaturesKey([],year);},draw:()=>draws++});
  const first=pipeline.run(1593);await clock.next();while(draws<1)await Promise.resolve();
  const second=pipeline.run(1594);
  const early=[...clock.tasks.entries()].find(([,task])=>task.delay===400);clock.tasks.delete(early[0]);early[1].fn();
  while(draws<2)await Promise.resolve();
  pipeline.requestRefresh(1594);pipeline.requestRefresh(1594);
  old.resolve(null);await first;assert.equal(refreshes,2);assert.equal(pipeline.busy,true);
  latest.resolve({features:[],year:1594,key:historicalFeaturesKey([],1594)});await second;
  assert.equal(refreshes,3);assert.equal(pipeline.busy,false);
});

test('playback accepts a 1199ms interval and resumes scheduling exactly on commit completion',async()=>{
  const clock=jobs();let time=1199,completed=0,count=0,busy=false;
  const play=createYearPlayback({...clock,now:()=>time,lastCompleted:()=>completed,busy:()=>busy,advance:()=>count++});
  play.start();await clock.next();assert.equal(count,1);
  busy=true;await clock.next();assert.equal(clock.tasks.size,0);
  completed=time=5000;busy=false;play.completed();assert.equal([...clock.tasks.values()][0].delay,1200);
  time=6199;await clock.next();assert.equal(count,2);play.stop();
});

test('context panel falls back to a full render after an entity page removes the title',()=>{
  const view=Object.create(Chronicle.prototype);let contextNodes=true,writes=0;
  Object.assign(view,{host:{set innerHTML(value){writes++;contextNodes=true;},querySelector:()=>contextNodes?{}:null,querySelectorAll:()=>[]},
    controls:{querySelector:()=>({}),querySelectorAll:()=>[]},callbacks:{},timeline:{setEvents(){},setYear(){}},
    year:150,span:50,loading:false,data:{entities:[],claims:[]}});
  view.render();contextNodes=false;view.year=151;
  assert.doesNotThrow(()=>view.render());assert.equal(writes,2);
});
