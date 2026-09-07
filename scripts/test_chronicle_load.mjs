import assert from 'node:assert/strict';
import {loadChronicle} from '../services/host/app/chronicle-load.js';
const requests=[],controller=new AbortController();
const fetchPage=async(url,{signal})=>{
  assert.equal(signal,controller.signal);const q=new URL(url,'http://test').searchParams;
  assert.equal(q.get('origin'),'human');const sources=q.get('sources').split(',');requests.push(sources);
  return {ok:true,json:async()=>sources.length>1?{claims:[{id:'truncated'}],entities:[],hasMore:true}
    :{claims:[{id:'claim-'+sources[0]}],entities:[{id:'shared',type:'Person'}],hasMore:false}};
};
const result=await loadChronicle(['source-z','source-a'],'human',controller.signal,fetchPage);
assert.deepEqual(result.claims.map(c=>c.id),['claim-source-a','claim-source-z']);
assert.equal(result.entities.length,1);assert.equal(result.hasMore,false);assert.equal(requests.length,3);
await assert.rejects(loadChronicle(['huge'],'human',undefined,async()=>({ok:true,json:async()=>({hasMore:true})})),/조회 한도/);
await assert.rejects(loadChronicle(['bad'],'human',undefined,async()=>({ok:false,json:async()=>({error:'offline'})})),/offline/);
assert.deepEqual(await loadChronicle([],'all',undefined,()=>{throw Error('No request expected');}),{entities:[],claims:[],hasMore:false});
console.log('PASS: split complete source queries, discard truncated prefixes, deduplicate, retain origin/signal, surface failures and empty filters');
