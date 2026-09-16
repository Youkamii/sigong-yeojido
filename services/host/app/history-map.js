import {sourcesParam} from './chronicle-load.js';
import {lensStrength} from './place-state.js';
import {historicalFeaturesKey} from './year-scrub.js';

export function historyRequestKey(filters){
  return new URLSearchParams({year:filters.year,sources:sourcesParam(filters.sources,filters.primary),origin:filters.origin,level:filters.level}).toString();
}

export function createHistoryCache({request=fetch,limit=60}={}){
  const cache=new Map(),prefetches=new Map();let controller=null,sequence=0;
  const remember=(key,value)=>{cache.delete(key);cache.set(key,value);while(cache.size>limit)cache.delete(cache.keys().next().value);return value;};
  const fetchData=async(filters,signal)=>{
    const response=await request('/api/history-map?'+historyRequestKey(filters),{signal});
    if(!response.ok)throw Error('역사 지도 자료를 불러오지 못했습니다.');
    const data=await response.json();return {features:data.features,year:filters.year,key:historicalFeaturesKey(data.features,filters.year)};
  };
  return {cache,async load(filters){
    const seq=++sequence;controller?.abort();
    for(const pending of prefetches.values())pending.abort();prefetches.clear();
    controller=new AbortController();const active=controller,key=historyRequestKey(filters);
    if(cache.has(key))return remember(key,cache.get(key));
    try{const result=await fetchData(filters,active.signal);if(seq!==sequence||active.signal.aborted)return null;return remember(key,result);}
    catch(error){if(active.signal.aborted||error.name==='AbortError')return null;throw error;}
  },async prefetch(filters){
    const key=historyRequestKey(filters);if(cache.has(key)||prefetches.has(key))return;
    const active=new AbortController();prefetches.set(key,active);
    try{const result=await fetchData(filters,active.signal);if(!active.signal.aborted)remember(key,result);}
    catch{}finally{if(prefetches.get(key)===active)prefetches.delete(key);}
  }};
}

export function featureLines(feature){
  const geometry=feature.geometry;
  if(geometry.type==='Polygon'||geometry.type==='MultiLineString')return geometry.coordinates;
  if(geometry.type==='MultiPolygon')return geometry.coordinates.flat();
  return geometry.type==='LineString'?[geometry.coordinates]:[];
}

export class HistoricalMap {
  constructor(button,callbacks){this.button=button;this.callbacks=callbacks;this.features=[];this.paths=[];this.sequence=0;this.requests=createHistoryCache();button.onclick=()=>callbacks.list();}
  async refresh(filters,{notify=true}={}){
    const seq=++this.sequence;
    const label=Number(filters.level)===5?'역로·옛길':Number(filters.level)===4?'사건 장소':'역사 경계';
    this.button.textContent=label+' 불러오고 있습니다…';
    try{
      const data=await this.requests.load(filters);if(seq!==this.sequence||!data)return null;
      this.button.textContent=`${label} ${data.features.length}개 · 출처 보기`;
      if(notify){this.apply(data);this.callbacks.changed(this.features);}
      return data;
    }catch(error){
      if(seq!==this.sequence)return null;
      // 오프라인·DNS 실패처럼 fetch 가 직접 throw 하면 error.message 가 브라우저의 영어 문장이다.
      // 화면에는 우리 문구만 쓰고, 원인은 개발자 콘솔에만 남긴다 (#203 감사 3).
      this.button.textContent=label+' 자료를 불러오지 못했습니다.';
      console.warn('[history-map]',error);
      const data={features:[],year:filters.year,key:historicalFeaturesKey([],filters.year)};
      if(notify){this.apply(data);this.callbacks.changed([]);}return data;
    }
  }
  apply(data){this.features=data.features;this.year=data.year;this.key=data.key;this.paths=[];}
  prefetchNeighbors(filters){
    if(typeof requestIdleCallback!=='function')return;
    const seq=this.sequence;
    requestIdleCallback(()=>{
      if(seq!==this.sequence)return;
      for(const year of [filters.year===1?-1:filters.year-1,filters.year===-1?1:filters.year+1])
        if(year>=-2500&&year<=2100)this.requests.prefetch({...filters,year});
    });
  }
  draw(ctx,project,primary){
    this.paths=[];
    for(const feature of this.features){
      const path=new Path2D();
      if(feature.geometry.type==='Point'){
        const [x,y]=project(...feature.geometry.coordinates);path.arc(x,y,6,0,Math.PI*2);
      }
      for(const line of featureLines(feature))line.forEach(([lon,lat],i)=>{const [x,y]=project(lon,lat);i?path.lineTo(x,y):path.moveTo(x,y);});
      ctx.save();ctx.globalAlpha=lensStrength(feature.properties,null,primary);
      ctx.strokeStyle='#D8B463';ctx.lineWidth=1.4;ctx.stroke(path);ctx.restore();
      this.paths.push({feature,path});
    }
  }
  pick(ctx,x,y){
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.lineWidth=9;
    const hit=this.paths.find(row=>ctx.isPointInStroke(row.path,x,y)||(row.feature.geometry.type==='Point'&&ctx.isPointInPath(row.path,x,y)));ctx.restore();return hit?.feature;
  }
}
