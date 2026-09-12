import * as THREE from 'three';
import {stableSeed} from './chronicle-world.js';
import {insideCoastline} from './coastline-index.js';
import {CountrysidePaths} from './chronicle-paths.js';
import {sceneryOverview,setOverviewDetails} from './scenery-overview.js';
import {sceneryPeriod,sitePeriod,sceneryRecipe,sceneryHouseRecipe} from './scenery-period.js';
import {planSettlementSites,planEstimatedSites,estimatedSitePasses,estimatedIslandSettings,settlementLayout,settlementSiteActive,settlementSiteForYear} from './settlement-regions.js';
import {planUrbanSites} from './urban-regions.js';
import {buildSettlementZones} from './inhabited-zones.js';

// 문서화·도시·사건에 양보한 뒤 시대 문턱 적용. 작은 섬은 최소 보장 없이 집 몇 채만 남긴다.
export function selectEstimatedSites(estimated,documented,urban,periodId,available=()=>true){
  const eligible=estimated.filter(s=>documented.every(d=>Math.hypot(s.x-d.x,s.z-d.z)>s.radius+d.radius+6)
    &&urban.every(u=>Math.hypot(s.x-u.x,s.z-u.z)>u.radius)
    &&available(s));
  const selected=new Set(eligible.filter(s=>estimatedSitePasses(s,typeof periodId==='function'?periodId(s):periodId))),rings=new Map();
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

// 같은 자리(0.1 미만)의 urban은 반경과 무관하게 문서화되지 않은 urban-region:* 원 구역을 우선한다.
// 다른 자리의 문서화 urban은 이웃 반경 안에서도 남겨 서울 소실을 막고, 집 소유는 기존 owns()가 정한다.
export function selectSceneSites(activeSites,estimatedIds){
  const candidates=activeSites.filter(s=>!(s.documented&&s.kind==='urban'&&activeSites.some(other=>
    other.kind==='urban'&&!other.documented&&other.id.startsWith('urban-region:')&&Math.hypot(other.x-s.x,other.z-s.z)<.1)))
    .sort((a,b)=>b.radius-a.radius||a.id.localeCompare(b.id));
  const current=candidates.filter((s,i)=>!candidates.slice(0,i).some(other=>other.kind===s.kind&&Math.hypot(other.x-s.x,other.z-s.z)<.1));
  const major=current.filter(s=>s.kind==='urban'&&!s.documented);
  const selected=current.filter(s=>s.estimated?estimatedIds.has(s.id):!s.documented||s.kind!=='urban'||major.every(m=>Math.hypot(s.x-m.x,s.z-m.z)>=.1));
  return {current,major,selected};
}

// Anonymous scenery provides context; historical places and people remain separate.
export class ChronicleScenery{
  constructor(assets){
    this.assets=assets;this.world=assets.world;this.group=new THREE.Group();this.group.name='decorative-scenery';assets.engine.add(this.group);
    this.urbanSites=planUrbanSites(this.world);this.sites=[...planSettlementSites(this.world,buildSettlementZones(this.world.scenePackets||[],this.world.coordinateRegistry||{},this.world.places||[])),...planEstimatedSites(this.world),...this.urbanSites];this.estimatedIds=new Set();this.cells=[];this.occupied=[];this.wildlife=[];this.showPaths=true;this.detailCache=new Map();this.houseScales=new Map();
    this.stats={villages:this.sites.length,houses:0,fields:0,tigers:0,ready:false,modelBuilds:0};
    this.paths=new CountrysidePaths(this.world,this.sites.filter(s=>s.kind!=='urban'));this.group.add(this.paths.mesh);
  }
  point(site,x,z){const c=Math.cos(site.angle),s=Math.sin(site.angle);return [site.x+x*c+z*s,site.z-x*s+z*c];}
  activeSites(){const year=this.stats.year;return this.sites.filter(s=>settlementSiteActive(s,year)).map(s=>settlementSiteForYear(s,year));}
  available(site){return site.id?.startsWith('settlement-region:')||site.kind==='urban'||this.occupied.every(o=>Math.hypot(site.x-o.x,site.z-o.z)>o.radius);}
  setDisplay(visible,paths){this.group.visible=visible;this.showPaths=paths;this.group.traverse(o=>{if(o.name==='scenery-lanes')o.visible=paths;});}
  sync(occupied,areaOccupied=occupied){
    this.occupied=occupied;this.areaOccupied=areaOccupied;this.clearings=[...this.activeSites(),...this.wildlife].filter(s=>this.available(s));
    // Keep the original scene radii in the refresh key and in forest/path clearances.
    const key=areaOccupied.map(o=>`${o.x}:${o.z}:${o.radius}:${o.urbanRegionId||''}`).sort().join('|');
    if(this.initialized&&key!==this.occupancyKey)this.refreshPeriod();this.occupancyKey=key;
    for(const c of this.cells)if(c.group)c.group.visible=this.available(c.site)&&this.period?.tigers!==false;
    for(const c of this.detailCache.values())c.group.visible=c.group.visible&&this.available(c.site);
    this.stats.tigers=this.period?.tigers===false?0:this.wildlife.length;this.paths.sync(s=>this.available(s)&&settlementSiteActive(s,this.stats.year)&&(!s.estimated||this.estimatedIds.has(s.id)),areaOccupied,this.activeSites().filter(s=>s.kind==='urban'));
  }
  nearPath(x,z,margin){return this.paths.near(x,z,margin);}
  start(forest,year){this.setYear(year);if(this.ready)return;this.ready=this.populate(forest).then(()=>{this.initialized=true;this.refreshPeriod();}).catch(e=>this.failed(e));}
  failed(error){this.stats.error=error.message;console.error('[scenery]',error);}
  setYear(year){this.stats.year=year;const period=sceneryPeriod(year),key=period.id+'|'+this.activeSites().map(s=>s.id+':'+s.kind+':'+sitePeriod(s,year).id).join('|');if(this.periodKey===key)return;this.periodKey=key;this.period=period;this.stats.ready=false;
    if(this.initialized)this.refreshPeriod(true);this.sync(this.occupied,this.areaOccupied);
  }
  refreshPeriod(preserve=false){
    const started=performance.now();
    const sites=this.activeSites(),{current}=selectSceneSites(sites,this.estimatedIds);
    const estimated=selectEstimatedSites(current.filter(s=>s.estimated),current.filter(s=>s.documented&&s.kind!=='urban'),current.filter(s=>s.kind==='urban'),s=>sitePeriod(s,this.stats.year).id,s=>this.available(s));
    this.estimatedIds=new Set(estimated.map(s=>s.id));
    const {selected}=selectSceneSites(sites,this.estimatedIds);
    const urban=selected.filter(s=>s.kind==='urban');
    // Urban ownership can clip neighbouring parcels. Rural additions/removals
    // only invalidate their own cells and the far batches containing them.
    const urbanKey=urban.map(s=>s.id).join('|');
    const previous=new Map(preserve&&urbanKey===this.urbanKey?(this.landscapeCells||[]).map(c=>[c.site.id,c]):[]);
    this.urbanKey=urbanKey;
    const changedSites=[];
    const active=selected.filter(s=>this.available(s)&&!(s.kind==='urban'&&this.occupied.some(o=>o.urbanRegionId===s.profile.id))).map(site=>{
      const period=sitePeriod(site,this.stats.year),old=previous.get(site.id);
      if(old?.period.id===period.id)return old;
      changedSites.push(site);
      const layout=settlementLayout(site,site.kind==='urban'?this.stats.year:period);
      const free=(x,z,radius=0,occupied=this.occupied)=>occupied.every(o=>Math.hypot(x-o.x,z-o.z)>radius+o.radius+.15);
      const ground=(x,z,margin=0)=>this.world.rings.some(r=>insideCoastline(x,z,r))&&(!this.world.contains||this.world.contains(x,z,margin));
      const ruralFree=(x,z)=>site.kind==='urban'||urban.every(s=>Math.hypot(x-s.x,z-s.z)>s.radius);
      const owns=(x,z)=>site.kind!=='urban'||urban.every(s=>s.id===site.id||Math.hypot(x-site.x,z-site.z)<=Math.hypot(x-s.x,z-s.z));
      const fits=h=>{const [x,z]=this.point(site,h.x,h.z),r=Math.hypot(h.width??2.4*h.scale,h.depth??1.9*h.scale)/2;
        return free(x,z,r)&&ruralFree(x,z)&&owns(x,z)&&ground(x,z,r)&&(!h.width||Math.max(...[[-r,-r],[r,-r],[r,r],[-r,r]].map(([dx,dz])=>this.world.surfaceAt(x+dx,z+dz)))-Math.min(...[[-r,-r],[r,-r],[r,r],[-r,r]].map(([dx,dz])=>this.world.surfaceAt(x+dx,z+dz)))<1.8);};
      layout.houses=layout.houses.filter(fits);
      layout.fields=layout.fields.filter(f=>f.corners.every(p=>{const [x,z]=this.point(site,...p);return free(x,z)&&ruralFree(x,z);}));
      layout.spaces=(layout.spaces||[]).filter(s=>{const [x,z]=this.point(site,s.x,s.z);return owns(x,z)&&ground(x,z,Math.hypot(s.width,s.depth)/2)&&free(x,z,Math.hypot(s.width,s.depth)/2);});
      // Subdivide at the same ground sample spacing used by houses. Coastal lanes
      // stop on land instead of crossing a bay to reach another land endpoint.
      layout.roads=layout.roads.flatMap(road=>road.points.slice(1).flatMap((b,i)=>{
        const a=road.points[i],count=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.5),segments=[];
        for(let j=0;j<count;j++){const points=[j/count,(j+1)/count].map(t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);
          if(points.every(p=>{const [x,z]=this.point(site,...p);return owns(x,z)&&ground(x,z,road.width)&&free(x,z,road.width/2,this.areaOccupied)&&ruralFree(x,z);}))segments.push({...road,points});}return segments;
      }));
      return {site,layout,period};
    }).filter(c=>c.layout.houses.length);
    const activeIds=new Set(active.map(c=>c.site.id));
    for(const [id,c] of previous)if(!activeIds.has(id))changedSites.push(c.site);
    const retained=new Set(active.filter(c=>previous.get(c.site.id)===c).map(c=>c.site.id));
    for(const [id,c] of this.detailCache)if(!retained.has(id)){this.assets.release(c.group);this.detailCache.delete(id);}
    const overview=sceneryOverview(this.world,active,this.stats.year,this.overview,previous.size?changedSites:null);if(this.overview)this.assets.release(this.overview);this.overview=overview;this.detailKey=null;this.group.add(overview);this.landscapeCells=active;
    setOverviewDetails(overview,[...this.detailCache.values()].filter(c=>c.group.visible));
    this.stats.houses=active.reduce((n,c)=>n+c.layout.houses.length,0);this.stats.fields=active.reduce((n,c)=>n+c.layout.fields.length,0);this.stats.villages=active.length;
    this.stats.estimatedSites=estimated.length;this.stats.documentedZones=current.filter(s=>s.documented).length;this.stats.zoneIds=current.filter(s=>s.documented).map(s=>s.id);
    this.stats.farDraws=overview.children.length;this.stats.farTriangles=overview.children.reduce((n,m)=>n+m.geometry.attributes.position.count/3,0);this.stats.period=this.period.id;this.stats.ready=true;
    this.stats.refreshedSites=changedSites.length;this.stats.reusedSites=retained.size;this.stats.refreshMs=performance.now()-started;
    this.setDisplay(this.group.visible,this.showPaths);
  }
  buildDetail(cell){
    const anchors=new Map(),recipes=[],{site,layout}=cell;
    const period=cell.period??(Number.isFinite(this.stats.year)?sitePeriod(site,this.stats.year):this.period);
    if(site.kind==='urban')return this.buildUrbanDetail(cell);
    // Only a small, closest-neighbour cluster receives detailed walls and people.
    const houses=layout.houses.map((h,index)=>({...h,index})).sort((a,b)=>a.x*a.x+a.z*a.z-b.x*b.x-b.z*b.z).slice(0,20);
    const add=(archetype,x,z,scale,yaw=0,resolved=false)=>{const id=site.id+':'+recipes.length,[wx,wz]=this.point(site,x,z),y=this.world.surfaceAt(wx,wz);anchors.set(id,new THREE.Vector3(x,y,z));const recipe={id,anchor:id,archetype,scale,yaw,seed:id,offset:[0,y,0]};recipes.push(resolved?recipe:sceneryRecipe(recipe,period,site));};
    for(const h of houses){
      add(sceneryHouseRecipe(h,period,site,h.index).archetype,h.x,h.z,h.scale,h.angle||0,true);
      const recipe=recipes.at(-1);if(!recipe)continue;
      if(!this.houseScales.has(recipe.archetype)){
        const sample=this.assets.field([{...recipe,scale:1,yaw:0,offset:[0,0,0]}],new Map([[recipe.anchor,new THREE.Vector3()]]),{regional:false});
        sample.group.updateWorldMatrix(true,true);const bounds=new THREE.Box3();
        sample.group.traverse(o=>{if(o.isMesh&&o.material.visible!==false)bounds.expandByObject(o);});
        const size=bounds.getSize(new THREE.Vector3());
        this.houseScales.set(recipe.archetype,Math.min(Math.sqrt((2.4*1.9)/(size.x*size.z)),3/Math.hypot(size.x,size.z)));this.assets.release(sample.group);
      }
      recipe.scale=h.scale*this.houseScales.get(recipe.archetype);
    }
    add('human',0,2,.23);add('handcart',2,0,.18);
    const field=this.assets.field(recipes.filter(Boolean),anchors,{regional:false});field.group.position.set(site.x,0,site.z);field.group.rotation.y=site.angle;
    this.assets.engine._tagShadows(field.group);this.group.add(field.group);const detail={site,indices:houses.map(h=>h.index),group:field.group,animated:field.animated};this.detailCache.set(site.id,detail);this.stats.modelBuilds++;return detail;
  }
  buildUrbanDetail({site,layout}){
    // Keep the merged building body visible at both distances; only add facade
    // windows nearby. This cannot flatten an apartment into a cottage on zoom.
    const positions=[],add=(a,b,c,d)=>positions.push(...a,...b,...c,...a,...c,...d);
    for(const h of layout.houses.slice(0,48)){
      const [x,z]=this.point(site,h.x,h.z),hw=h.width/2,hd=h.depth/2;
      const y=Math.max(...[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([dx,dz])=>this.world.surfaceAt(x+dx,z+dz)))+.08;
      for(let floor=.35;floor<h.height-.15;floor+=.65)for(let wx=-hw+.25;wx<hw-.2;wx+=.48){
        for(const side of [-1,1]){const zz=z+side*(hd+.015);add([x+wx,y+floor,zz],[x+wx+.22,y+floor,zz],[x+wx+.22,y+floor+.24,zz],[x+wx,y+floor+.24,zz]);}
      }
    }
    const group=new THREE.Group(),geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();
    group.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:'#405f6d',roughness:.65,side:THREE.DoubleSide})));group.name=site.id+':facades';this.group.add(group);
    const animated=[];
    for(const [i,road] of layout.roads.filter(r=>r.paved).slice(0,12).entries()){
      const a=this.point(site,...road.points[0]),b=this.point(site,...road.points[1]);
      const car=i%3===0,geometry=new THREE.BoxGeometry(car?.5:.12,car?.23:.3,car?.27:.12);
      const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:car?'#c0a475':i%2?'#657889':'#9c8071'}));group.add(mesh);
      const update=t=>{const f=(1-Math.cos(t*.5+i*.173))/2,x=a[0]+(b[0]-a[0])*f,z=a[1]+(b[1]-a[1])*f;
        mesh.position.set(x,this.world.surfaceAt(x,z)+(car?.18:.2),z);mesh.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);};update(0);animated.push({update});
    }
    const detail={site,indices:[],group,animated};this.detailCache.set(site.id,detail);this.stats.modelBuilds++;return detail;
  }
  async populate(forest){
    const chosen=[];
    for(const tree of forest){
      if(chosen.length>=24)break;const seed=stableSeed('tiger:'+tree.x+':'+tree.z);if(seed%67)continue;
      const p=new THREE.Vector3(tree.x+2.5,0,tree.z);p.y=this.world.surfaceAt(p.x,p.z);
      if(!insideCoastline(p.x,p.z,this.world.rings[0])||!this.world.contains(p.x,p.z,2)||this.sites.some(s=>Math.hypot(p.x-s.x,p.z-s.z)<s.radius+5)||chosen.some(q=>p.distanceTo(q)<88)||!this.available({x:p.x,z:p.z,radius:3.2}))continue;
      chosen.push(p);const id='scenery-tiger:'+chosen.length,scale=.48+(seed%5)*.025;
      const field=this.assets.field([{id,anchor:id,archetype:'tiger',scale,seed:id,offset:[0,p.y,0]}],new Map([[id,p]]));field.group.name=id;field.group.userData.decorative=true;this.assets.engine._tagShadows(field.group);
      const site={x:p.x,z:p.z,radius:3.2};this.wildlife.push(site);this.cells.push({site,group:field.group,animated:field.animated});this.group.add(field.group);
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    this.sync(this.occupied,this.areaOccupied);this.assets.buildForest([...this.assets.forestOccupied,...this.clearings],this.assets.forestScenes);this.assets.forest.visible=this.world.geography?.display?.forest!==false;
  }
  update(camera,t){
    if(!this.group.visible)return;
    const distance=site=>Math.hypot(camera.position.x-site.x,camera.position.y-this.world.surfaceAt(site.x,site.z),camera.position.z-site.z);
    const nearby=(this.landscapeCells||[]).map(c=>({c,d:distance(c.site)})).filter(p=>p.d<95).sort((a,b)=>a.d-b.d).slice(0,4),active=new Set(nearby.map(p=>p.c.site.id));
    for(const [id,c] of this.detailCache){c.group.visible=active.has(id);}
    // Build at most one cell per frame, retaining four cached cells across same-era scrubs.
    const missing=nearby.find(p=>!this.detailCache.has(p.c.site.id));
    if(missing){if(this.detailCache.size>=4){const victim=[...this.detailCache.keys()].find(id=>!active.has(id));if(victim){this.assets.release(this.detailCache.get(victim).group);this.detailCache.delete(victim);}}
      if(this.detailCache.size<4)this.buildDetail(missing.c);}
    const visibleDetails=[...this.detailCache.values()].filter(c=>c.group.visible),detailKey=visibleDetails.map(c=>c.site.id).sort().join('|');
    if(this.overview&&detailKey!==this.detailKey){setOverviewDetails(this.overview,visibleDetails);this.detailKey=detailKey;}
    for(const c of visibleDetails)for(const a of c.animated)a.update(t);
    for(const c of this.cells){c.group.visible=this.period.tigers&&this.available(c.site)&&distance(c.site)<160;if(c.group.visible)for(const a of c.animated)a.update(t);}
    this.stats.detailCells=this.detailCache.size;
  }
}
