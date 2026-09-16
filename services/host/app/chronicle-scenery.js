import * as THREE from 'three';
import {stableSeed} from './chronicle-world.js';
import {insideCoastline} from './coastline-index.js';
import {CountrysidePaths} from './chronicle-paths.js';
import {setOverviewDetails,overviewFromBuckets} from './scenery-overview.js';
import {sceneryPeriod,sitePeriod,sceneryRecipe,sceneryHouseRecipe} from './scenery-period.js';
import {loadFactLayers,planSettlementSites,planEstimatedSites,settlementSiteActive,settlementSiteForYear} from './settlement-regions.js';
import {planUrbanSites} from './urban-regions.js';
import {buildSettlementZones} from './inhabited-zones.js';
import {sceneBudget} from './scene-quality.js';
import {isEstimatedSite,setEstimatedMesh,markEstimatedGroup} from './scenery-estimated-dim.js';
import {sceneryPeriodKey} from './year-scrub.js';
import {computeLandscape,overviewBuckets,siteDensityState,selectEstimatedSites,selectSceneSites,pointOn} from './scene-layout.js';
import {createSceneLayoutClient} from './scene-layout-client.js';

// 계산부는 scene-layout.js 한 곳에 있다(워커와 공유). 옛 사용처를 위해 다시 내보낸다.
export {siteDensityState,selectEstimatedSites,selectSceneSites};

export async function loadWorldFactLayers(world){
  if(!world.factLayers){
    try{
      const response=await fetch(new URL('./fact-layers.json',import.meta.url));
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      world.factLayers=await response.json();
    }catch(error){console.warn('[fact-layers]',error);world.factLayers={version:1,generatedFrom:[],density:[],administrative:[]};}
  }
  loadFactLayers(world.factLayers);
  return world.factLayers;
}

// Anonymous scenery provides context; historical places and people remain separate.
export class ChronicleScenery{
  constructor(assets){
    this.assets=assets;this.world=assets.world;this.group=new THREE.Group();this.group.name='decorative-scenery';assets.engine.add(this.group);
    this.urbanSites=planUrbanSites(this.world);this.sites=[...planSettlementSites(this.world,buildSettlementZones(this.world.scenePackets||[],this.world.coordinateRegistry||{},this.world.places||[],this.world.factLayers)),...planEstimatedSites(this.world),...this.urbanSites];this.estimatedIds=new Set();this.cells=[];this.occupied=[];this.areaOccupied=this.occupied;this.wildlife=[];this.showPaths=true;this.detailCache=new Map();this.houseScales=new Map();
    this.stats={villages:this.sites.length,houses:0,fields:0,tigers:0,ready:false,modelBuilds:0};
    this.estimatedDim=true;
    this.paths=new CountrysidePaths(this.world,this.sites.filter(s=>s.kind!=='urban'));this.group.add(this.paths.mesh,this.paths.estimatedMesh);
    this.quality=assets.engine.quality;
    globalThis.window?.addEventListener('fan:quality',()=>this.setQuality());
  }
  setQuality(){
    const quality=this.assets.engine.quality;
    if(sceneBudget(quality)===sceneBudget(this.quality)){this.quality=quality;this.stats.quality=quality;return;}
    this.quality=quality;this.assets.treeCandidates=null;
    if(!this.initialized)return;
    // 화질이 바뀌면 워커에 다시 요청한다(예산이 요청에 실려 간다).
    this.stats.ready=false;this.requestRefresh(true);this.rebuildForest();
  }
  rebuildForest(){
    this.setState({occupied:this.occupied,areaOccupied:this.areaOccupied});
    this.assets.buildForest([...this.assets.forestOccupied,...this.clearings],this.assets.forestScenes);
    this.assets.forest.visible=this.world.geography?.display?.forest!==false;
  }
  point(site,x,z){return pointOn(site,x,z);}
  activeSites(){const year=this.stats.year;return this.sites.filter(s=>settlementSiteActive(s,year)).map(s=>settlementSiteForYear(s,year));}
  available(site){return site.id?.startsWith('settlement-region:')||site.kind==='urban'||this.occupied.every(o=>Math.hypot(site.x-o.x,site.z-o.z)>o.radius);}
  setDisplay(visible,paths,estimatedDim=this.estimatedDim){
    this.group.visible=visible;this.showPaths=paths;this.estimatedDim=estimatedDim;
    this.group.traverse(o=>{if(o.name==='scenery-lanes')o.visible=paths;if(o.userData.estimatedBackground)setEstimatedMesh(o,estimatedDim);});
  }
  sync(occupied,areaOccupied=occupied){this.setState({occupied,areaOccupied});}
  setState({year=this.stats.year,occupied=this.occupied,areaOccupied=this.areaOccupied}){
    this.stats.year=year;this.occupied=occupied;this.areaOccupied=areaOccupied;
    const sites=this.activeSites(),period=sceneryPeriod(year);
    const periodKey=sceneryPeriodKey(period.id,sites.map(s=>siteDensityState(s,year,this.world,sceneBudget(this.quality).estimatedScale)));
    // Both parcel and road clearances must invalidate layouts when occupancy changes.
    const keyOf=rows=>rows.map(o=>`${o.x}:${o.z}:${o.radius}:${o.urbanRegionId||''}`).sort().join('|');
    const occupancyKey=keyOf(areaOccupied),parcelKey=keyOf(occupied);
    const changed=periodKey!==this.periodKey||occupancyKey!==this.occupancyKey||parcelKey!==this.parcelKey;
    this.period=period;this.periodKey=periodKey;this.occupancyKey=occupancyKey;this.parcelKey=parcelKey;
    this.clearings=[...sites,...this.wildlife].filter(s=>this.available(s));
    if(changed){this.stats.ready=false;if(this.initialized)this.requestRefresh(true);}
    for(const c of this.cells)if(c.group)c.group.visible=this.available(c.site)&&this.period?.tigers!==false;
    for(const c of this.detailCache.values())c.group.visible=c.group.visible&&this.available(c.site);
    this.stats.tigers=this.period?.tigers===false?0:this.wildlife.length;this.syncPaths(sites);
  }
  syncPaths(sites=this.activeSites()){
    this.paths.sync(s=>this.available(s)&&settlementSiteActive(s,this.stats.year)&&(!s.estimated||this.estimatedIds.has(s.id)),
      this.areaOccupied,sites.filter(s=>s.kind==='urban'));
  }
  nearPath(x,z,margin){return this.paths.near(x,z,margin);}
  start(forest,year=this.stats.year){
    if(year!==this.stats.year||!this.ready)this.setState({year});
    if(this.ready)return;
    this.ready=this.populate(forest).then(()=>{this.initialized=true;this.requestRefresh(true);}).catch(e=>this.failed(e));
  }
  failed(error){this.stats.error=error.message;console.error('[scenery]',error);}
  setYear(year){this.setState({year});}
  // 워커가 있으면 계산을 넘기고, 없거나 실패하면 같은 함수를 메인에서 동기로 돌린다.
  ensureLayoutWorker(){
    if(this.layoutClient!==undefined)return this.layoutClient;
    this.layoutClient=createSceneLayoutClient({world:this.world,sites:this.sites,
      onResult:data=>this.applyWorkerResult(data),
      onFallback:()=>this.handleWorkerFallback()})||null;
    return this.layoutClient;
  }
  layoutRequest(preserve){
    return {year:this.stats.year,quality:this.quality,occupied:this.occupied,areaOccupied:this.areaOccupied,
      estimatedIds:[...(this.estimatedIds||[])],preserve,occupancyKey:this.occupancyKey,parcelKey:this.parcelKey};
  }
  requestRefresh(preserve=false){
    // 손잡이를 만드는 도중에도 폴백이 날 수 있으므로, 여기서 한 번만 동기 계산하도록 막아 둔다.
    this.pendingPreserve=preserve;this.workerRequestInline=true;
    let sent=false;
    try{
      const client=this.ensureLayoutWorker();
      if(client)sent=client.request(this.layoutRequest(preserve));
    }finally{this.workerRequestInline=false;}
    if(sent){this.refreshStarted=performance.now();return;}
    // 워커가 아예 없는 환경(file://·모듈 워커 미지원)에서도 길·숲을 새 마을 선택으로 맞춘다 —
    // 이걸 빼면 워커 있는 화면과 첫 화면이 갈린다 (#203 감사 8).
    this.refreshPeriod(preserve);
    this.settleRefresh();
  }
  handleWorkerFallback(){
    this.layoutClient=null;
    if(this.workerRequestInline)return;
    this.refreshPeriod(this.pendingPreserve??true);
    this.settleRefresh();
  }
  applyWorkerResult(data){
    const previous=new Map((this.landscapeCells||[]).map(c=>[c.site.id,c]));
    const cells=data.order.map(id=>data.cells[id]||previous.get(id)).filter(Boolean);
    this.applyLandscape({...data,cells},this.refreshStarted??performance.now());
    this.settleRefresh();
  }
  // 워커 응답을 반영한 뒤에는 길과 숲도 새 마을 선택으로 다시 맞춘다.
  settleRefresh(){
    this.syncPaths();
    if(this.initialized&&typeof this.assets?.buildForest==='function')
      this.assets.buildForest([...(this.assets.forestOccupied||[]),...this.clearings],this.assets.forestScenes||[]);
  }
  refreshPeriod(preserve=false){
    const started=performance.now();
    const result=computeLandscape({...this.layoutRequest(preserve),sites:this.sites,
      previousCells:this.landscapeCells||[],previousUrbanKey:this.urbanKey},this.world);
    const {buckets,dirty}=overviewBuckets(this.world,result.cells,this.stats.year,
      result.reuseBase?result.changedSites:null,{normals:false});
    this.applyLandscape({...result,buckets,dirty,changedSiteIds:result.changedSites.map(s=>s.id)},started);
  }
  applyLandscape(result,started=performance.now()){
    this.estimatedIds=new Set(result.estimatedIds);this.urbanKey=result.urbanKey;
    const retained=new Set(result.retainedIds);
    for(const [id,c] of this.detailCache)if(!retained.has(id)){this.assets.release(c.group);this.detailCache.delete(id);}
    const overview=overviewFromBuckets(result.buckets,result.dirty,this.overview);
    if(this.overview)this.assets.release(this.overview);
    this.overview=overview;this.detailKey=null;this.group.add(overview);this.landscapeCells=result.cells;
    setOverviewDetails(overview,[...this.detailCache.values()].filter(c=>c.group.visible));
    this.stats.houses=result.houses;this.stats.fields=result.fields;this.stats.villages=result.cells.length;
    this.stats.estimatedSites=result.estimatedCount;this.stats.documentedZones=result.documentedIds.length;this.stats.zoneIds=result.documentedIds;
    this.stats.farDraws=overview.children.length;this.stats.farTriangles=overview.children.reduce((n,m)=>n+m.geometry.attributes.position.count/3,0);this.stats.period=this.period.id;this.stats.ready=true;
    this.stats.refreshedSites=result.changedSiteIds.length;this.stats.reusedSites=retained.size;this.stats.refreshMs=performance.now()-started;
    this.stats.quality=this.quality;
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
    this.assets.engine._tagShadows(field.group);markEstimatedGroup(field.group,isEstimatedSite(site),this.estimatedDim);this.group.add(field.group);const detail={site,indices:houses.map(h=>h.index),group:field.group,animated:field.animated};this.detailCache.set(site.id,detail);this.stats.modelBuilds++;return detail;
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
    this.rebuildForest();
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
