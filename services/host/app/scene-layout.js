// #201: 장면 조립·풍경 배치 계산의 순수부.
// three·DOM 을 쓰지 않으므로 메인 스레드와 workers/scene-layout.worker.js 가
// 같은 함수를 부른다. 결과가 갈라지지 않도록 계산은 여기 한 곳에만 둔다.
import {insideCoastline,coastlineDistance} from './coastline-index.js';
import {projectCoordinates} from './history-coordinates.js';
import {terrainSurface} from './terrain-surface.js';
import {occupancyGrid} from './occupancy-grid.js';
import {settlementLayout,settlementSiteActive,settlementSiteForYear,estimatedSitePasses,
  estimatedIslandSettings,estimatedThresholdAt,loadFactLayers} from './settlement-regions.js';
import {sitePeriod,sceneryHouseRecipe} from './scenery-period.js';
import {sceneryHouseForm} from './scenery-house-form.js';
import {isEstimatedSite} from './scenery-estimated-dim.js';
import {sceneBudget} from './scene-quality.js';
import {sceneryPeriodKey} from './year-scrub.js';

export {loadFactLayers};

// three 의 Color 가 쓰는 sRGB→선형 변환을 그대로 옮긴다(three.module.min.js 와 동일한 상수).
// 정점 색 배열이 three.Color 경로와 한 비트도 달라지지 않아야 한다.
const srgbToLinear=v=>v<.04045?v*.0773993808:Math.pow(v*.9478672986+.0521327014,2.4);
const colorCache=new Map();
export function linearColor(style){
  let color=colorCache.get(style);
  if(color)return color;
  let text=String(style).trim();
  if(text.startsWith('#'))text=text.slice(1);
  if(text.length===3)text=text[0]+text[0]+text[1]+text[1]+text[2]+text[2];
  const hex=parseInt(text,16)||0;
  color={r:srgbToLinear((hex>>16&255)/255),g:srgbToLinear((hex>>8&255)/255),b:srgbToLinear((hex&255)/255)};
  colorCache.set(style,color);
  return color;
}

// three 의 BufferGeometry.computeVertexNormals(비인덱스) + normalizeNormals 와 같은 순서·정밀도.
export function computeVertexNormals(positions){
  const normals=new Float32Array(positions.length);
  for(let i=0;i+8<positions.length;i+=9){
    const ax=positions[i],ay=positions[i+1],az=positions[i+2];
    const bx=positions[i+3],by=positions[i+4],bz=positions[i+5];
    const cx=positions[i+6],cy=positions[i+7],cz=positions[i+8];
    const cbx=cx-bx,cby=cy-by,cbz=cz-bz,abx=ax-bx,aby=ay-by,abz=az-bz;
    const nx=cby*abz-cbz*aby,ny=cbz*abx-cbx*abz,nz=cbx*aby-cby*abx;
    for(let k=0;k<9;k+=3){normals[i+k]=nx;normals[i+k+1]=ny;normals[i+k+2]=nz;}
  }
  for(let i=0;i<normals.length;i+=3){
    const x=normals[i],y=normals[i+1],z=normals[i+2],length=Math.sqrt(x*x+y*y+z*z)||1;
    normals[i]=x/length;normals[i+1]=y/length;normals[i+2]=z/length;
  }
  return normals;
}

export const pointOn=(site,x,z)=>{const c=Math.cos(site.angle),s=Math.sin(site.angle);return [site.x+x*c+z*s,site.z-x*s+z*c];};

export function siteDensityState(site,year,world,scale=1){
  const period=sitePeriod(site,year),context={year,world,x:site.x,z:site.z};
  // 배율만 다른 두 문턱이므로 호구 기록 탐색은 한 번만 한다(#196).
  const threshold=estimatedThresholdAt(period.id,site.latitude,context);
  const density=threshold(1),scaled=threshold(scale);
  const p=site.profile;
  return {id:site.id,kind:site.kind,periodId:period.id,density,scale,
    selected:site.estimated?site.seed%100<scaled*100:undefined,
    unscaledSelected:site.estimated?site.seed%100<density*100:undefined,
    layoutKey:p?[year>=p.growthYear,year>=1970,year>=1980,year>=(p.industryYear??1945)]:undefined};
}

// 문서화·도시·사건에 양보한 뒤 시대 문턱 적용. 작은 섬은 최소 보장 없이 집 몇 채만 남긴다.
export function selectEstimatedSites(estimated,documented,urban,periodId,available=()=>true,context={}){
  // 섬 대체 후보와 격자 상한도 보통의 부분집합 안에서 적용한다.
  if((context.scale??1)<1)estimated=selectEstimatedSites(estimated,documented,urban,periodId,available,{...context,scale:1});
  const eligible=estimated.filter(s=>documented.every(d=>Math.hypot(s.x-d.x,s.z-d.z)>s.radius+d.radius+6)
    &&urban.every(u=>Math.hypot(s.x-u.x,s.z-u.z)>u.radius)
    &&available(s));
  const selected=new Set(eligible.filter(s=>estimatedSitePasses(s,typeof periodId==='function'?periodId(s):periodId,{...context,x:s.x,z:s.z}))),rings=new Map();
  for(const site of eligible){
    if(!Number.isInteger(site.ringIndex)||site.islandArea<estimatedIslandSettings.mediumArea)continue;
    if(!rings.has(site.ringIndex))rings.set(site.ringIndex,[]);
    rings.get(site.ringIndex).push(site);
  }
  for(const sites of rings.values())if(!sites.some(s=>selected.has(s)))
    selected.add(sites.reduce((a,b)=>a.seed<b.seed||a.seed===b.seed&&a.id<b.id?a:b));
  // 카메라 이동으로 마을이 바뀌지 않도록 world 격자별 상한을 적용한다.
  // 큰 섬을 먼저 보존하고 나머지는 seed 순으로 고른다. 지역 상한은 최소 보장보다 우선한다.
  const cells=new Map(),{cellSize,cellLimit,largeArea}=estimatedIslandSettings;
  const islands=[...selected].filter(s=>Number.isFinite(s.islandArea)).sort((a,b)=>Number(b.islandArea>=largeArea)-Number(a.islandArea>=largeArea)||a.seed-b.seed||a.id.localeCompare(b.id));
  for(const site of islands){
    const key=`${Math.floor(site.x/cellSize)}:${Math.floor(site.z/cellSize)}`,count=cells.get(key)||0;
    if(count>=cellLimit)selected.delete(site);else cells.set(key,count+1);
  }
  return eligible.filter(s=>selected.has(s));
}

// 같은 자리(0.1 미만)의 urban은 반경과 무관하게 원 구역을 우선하되, 장면 마커로 쉬는 원 구역에는 자리를 내주지 않는다.
// 다른 자리의 문서화 urban은 이웃 반경 안에서도 남겨 서울 소실을 막고, 집 소유는 기존 owns()가 정한다.
export function selectSceneSites(activeSites,estimatedIds,suppressedProfileIds=new Set()){
  const candidates=activeSites.filter(s=>!(s.documented&&s.kind==='urban'&&activeSites.some(other=>
    other.kind==='urban'&&!other.documented&&other.id.startsWith('urban-region:')&&!suppressedProfileIds.has(other.profile?.id)&&Math.hypot(other.x-s.x,other.z-s.z)<.1)))
    .sort((a,b)=>b.radius-a.radius||a.id.localeCompare(b.id));
  const current=candidates.filter((s,i)=>!candidates.slice(0,i).some(other=>other.kind===s.kind&&Math.hypot(other.x-s.x,other.z-s.z)<.1));
  const major=current.filter(s=>s.kind==='urban'&&!s.documented);
  const selected=current.filter(s=>s.estimated?estimatedIds.has(s.id):!s.documented||s.kind!=='urban'||major.every(m=>Math.hypot(s.x-m.x,s.z-m.z)>=.1));
  return {current,major,selected};
}

// ChronicleScenery.refreshPeriod 의 계산부. 반환값은 구조화 복제 가능한 데이터뿐이다.
export function computeLandscape(request,world){
  const {year,occupied=[],areaOccupied=occupied,sites:allSites=[],estimatedIds:incomingIds=[],
    preserve=false,previousCells=[],previousUrbanKey=null,occupancyKey='',parcelKey='',quality}=request;
  const estimatedScale=sceneBudget(quality).estimatedScale;
  const available=site=>site.id?.startsWith('settlement-region:')||site.kind==='urban'
    ||occupied.every(o=>Math.hypot(site.x-o.x,site.z-o.z)>o.radius);
  const suppressedProfileIds=new Set(occupied.map(o=>o.urbanRegionId).filter(Boolean));
  const sites=allSites.filter(s=>settlementSiteActive(s,year)).map(s=>settlementSiteForYear(s,year));
  const {current}=selectSceneSites(sites,new Set(incomingIds),suppressedProfileIds);
  const estimated=selectEstimatedSites(current.filter(s=>s.estimated),current.filter(s=>s.documented&&s.kind!=='urban'),
    current.filter(s=>s.kind==='urban'),s=>sitePeriod(s,year).id,s=>available(s),{year,world,scale:estimatedScale});
  const estimatedIds=new Set(estimated.map(s=>s.id));
  const {selected}=selectSceneSites(sites,estimatedIds,suppressedProfileIds);
  const urban=selected.filter(s=>s.kind==='urban');
  // Urban ownership can clip neighbouring parcels. Rural additions/removals
  // only invalidate their own cells and the far batches containing them.
  const urbanKey=urban.map(s=>s.id).join('|');
  const previous=new Map(preserve&&urbanKey===previousUrbanKey?previousCells.map(c=>[c.site.id,c]):[]);
  const changedSites=[];
  const freeHouse=occupancyGrid(occupied,{cellSize:16,margin:.15});
  const freeRoad=occupancyGrid(areaOccupied,{cellSize:16,margin:.15});
  const active=selected.filter(s=>available(s)&&!(s.kind==='urban'&&occupied.some(o=>o.urbanRegionId===s.profile.id))).map(site=>{
    const period=sitePeriod(site,year),old=previous.get(site.id);
    const densityKey=sceneryPeriodKey(period.id,[siteDensityState(site,year,world,estimatedScale)])+(occupancyKey||'')+';'+(parcelKey||'');
    if(old?.densityKey===densityKey)return old;
    changedSites.push(site);
    const layout=settlementLayout(site,site.kind==='urban'?year:period);
    const ground=(x,z,margin=0)=>world.rings.some(r=>insideCoastline(x,z,r))&&(!world.contains||world.contains(x,z,margin));
    const ruralFree=(x,z)=>site.kind==='urban'||urban.every(s=>Math.hypot(x-s.x,z-s.z)>s.radius);
    const owns=(x,z)=>site.kind!=='urban'||urban.every(s=>s.id===site.id||Math.hypot(x-site.x,z-site.z)<=Math.hypot(x-s.x,z-s.z));
    const fits=h=>{const [x,z]=pointOn(site,h.x,h.z),r=Math.hypot(h.width??2.4*h.scale,h.depth??1.9*h.scale)/2;
      return freeHouse(x,z,r)&&ruralFree(x,z)&&owns(x,z)&&ground(x,z,r)&&(!h.width||Math.max(...[[-r,-r],[r,-r],[r,r],[-r,r]].map(([dx,dz])=>world.surfaceAt(x+dx,z+dz)))-Math.min(...[[-r,-r],[r,-r],[r,r],[-r,r]].map(([dx,dz])=>world.surfaceAt(x+dx,z+dz)))<1.8);};
    layout.houses=layout.houses.filter(fits);
    layout.fields=layout.fields.filter(f=>f.corners.every(p=>{const [x,z]=pointOn(site,...p);return freeHouse(x,z)&&ruralFree(x,z);}));
    layout.spaces=(layout.spaces||[]).filter(s=>{const [x,z]=pointOn(site,s.x,s.z);return owns(x,z)&&ground(x,z,Math.hypot(s.width,s.depth)/2)&&freeHouse(x,z,Math.hypot(s.width,s.depth)/2);});
    // Subdivide at the same ground sample spacing used by houses. Coastal lanes
    // stop on land instead of crossing a bay to reach another land endpoint.
    layout.roads=layout.roads.flatMap(road=>road.points.slice(1).flatMap((b,i)=>{
      const a=road.points[i],count=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.5),segments=[];
      for(let j=0;j<count;j++){const points=[j/count,(j+1)/count].map(t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);
        if(points.every(p=>{const [x,z]=pointOn(site,...p);return owns(x,z)&&ground(x,z,road.width)&&freeRoad(x,z,road.width/2)&&ruralFree(x,z);}))segments.push({...road,points});}return segments;
    }));
    return {site,layout,period,densityKey};
  }).filter(c=>c.layout.houses.length);
  const activeIds=new Set(active.map(c=>c.site.id));
  for(const [id,c] of previous)if(!activeIds.has(id))changedSites.push(c.site);
  const retainedIds=active.filter(c=>previous.get(c.site.id)===c).map(c=>c.site.id);
  return {cells:active,changedSites,retainedIds,urbanKey,
    estimatedIds:[...estimatedIds],estimatedCount:estimated.length,
    documentedIds:current.filter(s=>s.documented).map(s=>s.id),
    reuseBase:previous.size>0,
    houses:active.reduce((n,c)=>n+c.layout.houses.length,0),
    fields:active.reduce((n,c)=>n+c.layout.fields.length,0)};
}

export const overviewBucketFor=site=>Math.floor(site.x/480)+':'+Math.floor(site.z/480);

// scenery-overview.js 의 정점 계산부. three.Group 대신 버킷별 배열을 돌려준다.
export function overviewBuckets(world,cells,periodOrYear,changedSites=null,{normals=true}={}){
  const buckets=new Map();
  const dirty=changedSites&&new Set(changedSites.map(overviewBucketFor));
  const get=(site,kind)=>{const estimated=isEstimatedSite(site),key=overviewBucketFor(site)+':'+kind+':'+estimated;
    if(!buckets.has(key))buckets.set(key,{positions:[],colors:[],kind,estimated,bucket:overviewBucketFor(site),ranges:[]});return buckets.get(key);};
  const point=(site,x,z)=>pointOn(site,x,z);
  const triangle=(b,a,c,d,color)=>{b.positions.push(...a,...c,...d);for(let i=0;i<3;i++)b.colors.push(color.r,color.g,color.b);};
  const quad=(b,p,color)=>{triangle(b,p[0],p[2],p[1],color);triangle(b,p[0],p[3],p[2],color);};
  const earth=linearColor('#aa9570'),walls=linearColor('#aa9773');
  const crops=['#819258','#9a9d64','#b1a26a','#87915b','#939868','#a99b78'].map(linearColor);
  for(const cell of cells){
    if(dirty&&!dirty.has(overviewBucketFor(cell.site)))continue;
    const period=cell.period??(typeof periodOrYear==='number'?sitePeriod(cell.site,periodOrYear):periodOrYear);
    const {site,layout}=cell,houses=get(site,'houses'),fields=get(site,'fields'),lanes=get(site,'lanes');
    for(const [index,h] of layout.houses.entries()){
      const start=houses.positions.length;
      const [x,z]=point(site,h.x,h.z),angle=site.angle+(h.angle||0),c=Math.cos(angle),s=Math.sin(angle),scale=h.scale;
      const corner=(dx,dz,y)=>[x+dx*c+dz*s,y,z-dx*s+dz*c];
      const form=h.type?null:sceneryHouseForm(sceneryHouseRecipe(h,period,site,index).archetype);
      const hw=h.width?h.width/2:form.width*scale/2,hd=h.depth?h.depth/2:form.depth*scale/2;
      const footprint=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([dx,dz])=>corner(dx,dz,0));
      const y=Math.max(...footprint.map(p=>world.surfaceAt(p[0],p[2])))+.08,height=h.height??form.eave*scale;
      const wallColor=h.color?linearColor(h.color):walls;
      const base=footprint.map(p=>[p[0],y,p[2]]),top=base.map(p=>[p[0],y+height,p[2]]);
      const roof=linearColor(h.type?'#697977':form.color);
      if(form?.roof==='cone'){
        const ring=Array.from({length:6},(_,j)=>{const a=j*Math.PI/3+Math.PI/12;return corner(Math.cos(a)*hw,Math.sin(a)*hd,y+height);});
        const apex=corner(0,0,y+height+form.rise*scale);
        for(let j=0;j<6;j++){const a=ring[j],b=ring[(j+1)%6];
          quad(houses,[[a[0],y,a[2]],[b[0],y,b[2]],b,a],wallColor);triangle(houses,a,b,apex,roof);}
      }else{
        quad(houses,base.map(p=>[x+(p[0]-x)*1.2,y-.015,z+(p[2]-z)*1.2]),earth);
        for(let j=0;j<4;j++)quad(houses,[base[j],base[(j+1)%4],top[(j+1)%4],top[j]],wallColor);
        if(h.type||form.roof==='flat')quad(houses,top,roof);
        else {const a=corner(-hw,0,y+height+form.rise*scale),b=corner(hw,0,y+height+form.rise*scale);
          quad(houses,[top[0],top[1],b,a],roof);quad(houses,[a,b,top[2],top[3]],roof);
          triangle(houses,top[0],a,top[3],walls);triangle(houses,top[1],top[2],b,walls);}
      }
      houses.ranges.push({id:site.id,index,start,end:houses.positions.length,roof:form?.roof||'flat'});
    }
    for(const space of layout.spaces||[]){
      const p=[[-space.width/2,-space.depth/2],[space.width/2,-space.depth/2],[space.width/2,space.depth/2],[-space.width/2,space.depth/2]];
      quad(fields,p.map(([x,z])=>point(site,x+space.x,z+space.z)).map(([x,z])=>[x,world.surfaceAt(x,z)+.12,z]),linearColor(space.type==='park'?'#719369':'#b8b2a2'));
    }
    if(period.fields)for(const field of layout.fields){
      const p=field.corners.map(([x,z])=>point(site,x,z));
      const ground=p.map(([x,z])=>[x,world.surfaceAt(x,z)+.11,z]);quad(fields,ground,earth);
      const center=p.reduce((a,v)=>[a[0]+v[0]/4,a[1]+v[1]/4],[0,0]);
      quad(fields,p.map(([x,z])=>{x=center[0]+(x-center[0])*.9;z=center[1]+(z-center[1])*.9;return [x,world.surfaceAt(x,z)+.13,z];}),crops[field.color%crops.length]);
      const blend=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
      for(const t of [.3,.6])quad(fields,[blend(p[0],p[3],t),blend(p[1],p[2],t),blend(p[1],p[2],t+.025),blend(p[0],p[3],t+.025)].map(([x,z])=>[x,world.surfaceAt(x,z)+.15,z]),earth);
    }
    for(const road of layout.roads)for(let j=1;j<road.points.length;j++){
      const a=point(site,...road.points[j-1]),b=point(site,...road.points[j]),dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz)||1,nx=-dz/len*road.width/2,nz=dx/len*road.width/2;
      quad(lanes,[[a[0]-nx,a[1]-nz],[b[0]-nx,b[1]-nz],[b[0]+nx,b[1]+nz],[a[0]+nx,a[1]+nz]].map(([x,z])=>[x,world.surfaceAt(x,z)+.14,z]),road.paved?linearColor('#7b8280'):earth);
    }
  }
  const out=[];
  for(const b of buckets.values())if(b.positions.length){
    const positions=new Float32Array(b.positions),colors=new Float32Array(b.colors);
    out.push({kind:b.kind,estimated:b.estimated,bucket:b.bucket,ranges:b.ranges,positions,colors,
      normals:normals?computeVertexNormals(positions):null});
  }
  return {buckets:out,dirty:dirty?[...dirty]:null};
}

// 워커에서 world.surfaceAt·contains·toWorld 를 되살린다. 높이는 실제로 그려진
// 지형 삼각형 배열에서 뽑고, 링 밖은 메인과 같은 해수면/이웃 땅 높이로 떨어진다.
export function serializeWorld(world){
  const surface=world.land?.getObjectByName?.('peninsula-surface');
  const position=surface?.geometry?.attributes?.position;
  if(!position)return null;
  // 링은 좌표 쌍 수만 개라 평평한 Float64Array 로 보낸다(구조화 복제 비용을 줄인다).
  const flat=ring=>{const out=new Float64Array(ring.length*2);
    for(let i=0;i<ring.length;i++){out[i*2]=ring[i][0];out[i*2+1]=ring[i][1];}return out;};
  return {
    terrainPositions:position.array.slice(),
    rings:world.rings.map(flat),
    neighborRings:(world.neighbors?.rings||[]).map(ring=>({ring:flat(ring),holes:(ring.holes||[]).map(flat)})),
    mapScale:world.mapScale??8,seaLevel:world.seaLevel??7,
    factLayers:world.factLayers||null,
  };
}

// 평평한 Float64Array 도, 좌표 쌍 배열도 받는다(단위 검사는 쌍 배열을 쓴다).
const withBounds=source=>{
  const ring=ArrayBuffer.isView(source)
    ?Array.from({length:source.length/2},(_,i)=>[source[i*2],source[i*2+1]])
    :source.map(p=>[p[0],p[1]]);
  let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
  for(const [x,z] of ring){
    if(x<minX)minX=x;if(x>maxX)maxX=x;
    if(z<minZ)minZ=z;if(z>maxZ)maxZ=z;
  }
  ring.bounds={minX,maxX,minZ,maxZ};
  return ring;
};

export function createWorldView({terrainPositions,rings,neighborRings=[],mapScale=8,seaLevel=7}){
  const landRings=rings.map(withBounds);
  const neighbors=neighborRings.map(entry=>{const ring=withBounds(entry.ring);ring.holes=(entry.holes||[]).map(withBounds);return ring;});
  const neighborContains=(x,z,margin=0)=>neighbors.some(r=>insideCoastline(x,z,r)&&r.holes.every(h=>!insideCoastline(x,z,h))
    &&(!margin||[r,...r.holes].every(h=>coastlineDistance(x,z,h,margin)>=margin)));
  const contains=(x,z,margin=0)=>landRings.some(r=>insideCoastline(x,z,r)&&(!margin||coastlineDistance(x,z,r,margin)>=margin))||neighborContains(x,z,margin);
  const view={count:terrainPositions.length/3,
    getX:i=>terrainPositions[i*3],getY:i=>terrainPositions[i*3+1],getZ:i=>terrainPositions[i*3+2]};
  const surfaceAt=terrainSurface(view,(x,z)=>neighborContains(x,z)?7.04:7);
  return {rings:landRings,contains,surfaceAt,seaLevel,mapScale,
    toWorld:(lon,lat)=>projectCoordinates(lon,lat,mapScale),
    coordinatesAt:null};
}
