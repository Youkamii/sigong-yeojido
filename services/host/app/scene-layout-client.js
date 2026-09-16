// #201: 장면 조립·풍경 배치 워커의 메인 스레드 쪽 손잡이.
// 워커가 없거나(file://·구형) 한 번이라도 실패하면 곧바로 동기 폴백으로 넘어가고
// 경고는 한 번만 남긴다. 연속 확정에서는 토큰이 최신이 아닌 응답을 버린다.
import {serializeWorld} from './scene-layout.js';

let warned=false;
export const WORKER_TIMEOUT_MS=6000;

export function createSceneLayoutClient({world,sites,onResult,onFallback,
  WorkerClass=globalThis.Worker,workerUrl=new URL('./workers/scene-layout.worker.js',import.meta.url),
  timeoutMs=WORKER_TIMEOUT_MS,schedule=setTimeout,cancel=clearTimeout}={}){
  if(typeof WorkerClass!=='function')return null;
  const payload=serializeWorld(world);
  if(!payload)return null;
  let worker=null,token=0,inflight=null,applied=null,timer=null;
  const warn=error=>{
    if(!warned){warned=true;console.warn('[scene-layout worker] 워커를 쓰지 못해 메인 스레드에서 계산합니다.',error);}
  };
  const client={
    get available(){return !!worker;},
    get inflight(){return inflight;},
    request(request){
      if(!worker)return false;
      inflight=++token;
      try{worker.postMessage({...request,type:'layout',token:inflight,ack:applied});}
      catch(error){disable(error);return false;}
      cancel(timer);timer=schedule(()=>disable(new Error('워커 응답이 '+timeoutMs+'ms 안에 오지 않았습니다.')),timeoutMs);
      return true;
    },
    dispose(){cancel(timer);worker?.terminate();worker=null;},
  };
  const disable=error=>{
    cancel(timer);timer=null;
    if(!worker)return;
    try{worker.terminate();}catch{}
    worker=null;inflight=null;
    warn(error);
    onFallback?.(error);
  };
  try{worker=new WorkerClass(workerUrl,{type:'module'});}
  catch(error){warn(error);return null;}
  worker.onerror=event=>{event.preventDefault?.();disable(event.message||event);};
  worker.onmessageerror=event=>disable(event);
  worker.onmessage=event=>{
    const data=event.data;
    if(!data||data.type!=='layout')return;
    if(data.error)return disable(new Error(data.error));
    // 늦게 온 옛 작업은 버린다. 최신 토큰만 화면에 반영한다.
    if(data.token!==inflight)return;
    cancel(timer);timer=null;inflight=null;
    try{onResult(data);applied=data.token;}
    catch(error){disable(error);}
  };
  const transfer=[payload.terrainPositions.buffer,...payload.rings.map(r=>r.buffer),
    ...payload.neighborRings.flatMap(n=>[n.ring.buffer,...n.holes.map(h=>h.buffer)])];
  try{worker.postMessage({type:'init',world:payload,sites},transfer);}
  catch(error){disable(error);return null;}
  return client;
}
