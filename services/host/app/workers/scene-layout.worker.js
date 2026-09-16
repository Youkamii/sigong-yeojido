// #201: 장면 조립·풍경 배치 워커. 계산은 ../scene-layout.js 한 곳에만 있고
// 여기서는 메시지 규약과 이어붙이기만 맡는다. three 를 부르지 않으므로
// 페이지의 importmap 없이 모듈 워커로 그대로 돌아간다.
import {computeLandscape,overviewBuckets,createWorldView,loadFactLayers} from '../scene-layout.js';

// node 단위 검사는 worker_threads 없이 이 함수를 직접 부른다.
export function createSceneLayoutCore(){
  let world=null,sites=[],base={cells:[],urbanKey:null};
  const pending=new Map();
  return {
    get ready(){return !!world;},
    get pendingCount(){return pending.size;},  // 검사용: 쌓인 배치 스냅샷 수
    handle(message){
      if(!message||typeof message!=='object')return null;
      if(message.type==='init'){
        world=createWorldView(message.world);
        if(message.world.factLayers)loadFactLayers(message.world.factLayers);
        sites=message.sites||[];
        base={cells:[],urbanKey:null};pending.clear();
        return null;
      }
      if(message.type!=='layout')return null;
      // 메인이 실제로 화면에 반영한 응답만 다음 재사용 기준이 된다.
      // 토큰으로 버려진 응답은 ack 가 오지 않으므로 기준이 밀리지 않는다.
      if(Number.isFinite(message.ack)){
        if(pending.has(message.ack))base=pending.get(message.ack);
        for(const key of [...pending.keys()])if(key<=message.ack)pending.delete(key);
      }
      // 메인은 마지막으로 보낸 토큰의 응답만 반영하므로(scene-layout-client.js), 이보다 앞선 요청의
      // 배치본은 다시 기준이 될 수 없다. 연속 스크럽에서 워커 힙이 계속 커지던 자리다 (#203 감사 9).
      for(const key of [...pending.keys()])if(key<message.token)pending.delete(key);
      if(!world)return {response:{type:'layout',token:message.token,error:'not-initialised'},transfer:[]};
      const result=computeLandscape({...message,sites,previousCells:base.cells,previousUrbanKey:base.urbanKey},world);
      const {buckets,dirty}=overviewBuckets(world,result.cells,message.year,result.reuseBase?result.changedSites:null);
      pending.set(message.token,{cells:result.cells,urbanKey:result.urbanKey});
      const retained=new Set(result.retainedIds),cells={};
      for(const cell of result.cells)if(!retained.has(cell.site.id))cells[cell.site.id]=cell;
      const response={type:'layout',token:message.token,
        order:result.cells.map(c=>c.site.id),cells,retainedIds:result.retainedIds,
        changedSiteIds:result.changedSites.map(s=>s.id),estimatedIds:result.estimatedIds,
        urbanKey:result.urbanKey,buckets,dirty,houses:result.houses,fields:result.fields,
        villages:result.cells.length,estimatedCount:result.estimatedCount,documentedIds:result.documentedIds};
      const transfer=[];
      for(const bucket of buckets)for(const name of ['positions','colors','normals'])if(bucket[name])transfer.push(bucket[name].buffer);
      return {response,transfer};
    },
  };
}

const core=createSceneLayoutCore();
const host=typeof self==='undefined'?null:self;
if(host&&typeof host.postMessage==='function'){
  host.onmessage=event=>{
    let out;
    try{out=core.handle(event.data);}
    catch(error){host.postMessage({type:'layout',token:event.data?.token,error:String(error?.message||error)});return;}
    if(out)host.postMessage(out.response,out.transfer);
  };
}
