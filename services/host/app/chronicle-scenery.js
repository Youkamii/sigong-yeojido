import * as THREE from 'three';
import {stableSeed} from './chronicle-world.js';
import {insideCoastline} from './coastline-index.js';
import {CountrysidePaths} from './chronicle-paths.js';
import {sceneryOverview,setOverviewDetails} from './scenery-overview.js';
import {sceneryPeriod,sceneryRecipe} from './scenery-period.js';
import {planSettlementSites,settlementLayout} from './settlement-regions.js';

// Anonymous scenery provides context; historical places and people remain separate.
export class ChronicleScenery{
  constructor(assets){
    this.assets=assets;this.world=assets.world;this.group=new THREE.Group();this.group.name='decorative-scenery';assets.engine.add(this.group);
    this.sites=planSettlementSites(this.world);this.cells=[];this.occupied=[];this.wildlife=[];this.showPaths=true;this.detailCache=new Map();
    this.stats={villages:this.sites.length,houses:0,fields:0,tigers:0,ready:false,modelBuilds:0};
    this.paths=new CountrysidePaths(this.world,this.sites);this.group.add(this.paths.mesh);
  }
  point(site,x,z){const c=Math.cos(site.angle),s=Math.sin(site.angle);return [site.x+x*c+z*s,site.z-x*s+z*c];}
  available(site){return this.occupied.every(o=>Math.hypot(site.x-o.x,site.z-o.z)>site.radius+o.radius+4);}
  setDisplay(visible,paths){this.group.visible=visible;this.showPaths=paths;this.group.traverse(o=>{if(o.name==='scenery-lanes')o.visible=paths;});}
  sync(occupied){
    this.occupied=occupied;this.clearings=[...this.sites,...this.wildlife].filter(s=>this.available(s));
    const key=this.sites.map(s=>this.available(s)?'1':'0').join('');
    if(this.initialized&&key!==this.occupancyKey)this.refreshPeriod();this.occupancyKey=key;
    for(const c of this.cells)if(c.group)c.group.visible=this.available(c.site)&&this.period?.tigers!==false;
    for(const c of this.detailCache.values())c.group.visible=c.group.visible&&this.available(c.site);
    this.stats.tigers=this.period?.tigers===false?0:this.wildlife.length;this.paths.sync(s=>this.available(s),occupied);
  }
  nearPath(x,z,margin){return this.paths.near(x,z,margin);}
  start(forest,year){this.setYear(year);if(this.ready)return;this.ready=this.populate(forest).then(()=>{this.initialized=true;this.refreshPeriod();}).catch(e=>this.failed(e));}
  failed(error){this.stats.error=error.message;console.error('[scenery]',error);}
  setYear(year){this.stats.year=year;const period=sceneryPeriod(year);if(this.period?.id===period.id)return;this.period=period;this.stats.ready=false;
    for(const c of this.detailCache.values())this.assets.release(c.group);this.detailCache.clear();
    if(this.initialized)this.refreshPeriod();this.sync(this.occupied);
  }
  refreshPeriod(){
    const active=this.sites.filter(s=>this.available(s)).map(site=>({site,layout:settlementLayout(site,this.period)}));
    const overview=sceneryOverview(this.world,active,this.period);if(this.overview)this.assets.release(this.overview);this.overview=overview;this.detailKey=null;this.group.add(overview);this.landscapeCells=active;
    this.stats.houses=active.reduce((n,c)=>n+c.layout.houses.length,0);this.stats.fields=active.reduce((n,c)=>n+c.layout.fields.length,0);this.stats.villages=active.length;
    this.stats.farDraws=overview.children.length;this.stats.farTriangles=overview.children.reduce((n,m)=>n+m.geometry.attributes.position.count/3,0);this.stats.period=this.period.id;this.stats.ready=true;
    this.setDisplay(this.group.visible,this.showPaths);
  }
  buildDetail(cell){
    const anchors=new Map(),recipes=[],{site,layout}=cell;
    // Only a small, closest-neighbour cluster receives detailed walls and people.
    const houses=layout.houses.map((h,index)=>({...h,index})).sort((a,b)=>a.x*a.x+a.z*a.z-b.x*b.x-b.z*b.z).slice(0,20);
    const add=(archetype,x,z,scale)=>{const id=site.id+':'+recipes.length,[wx,wz]=this.point(site,x,z),y=this.world.surfaceAt(wx,wz);anchors.set(id,new THREE.Vector3(x,y,z));recipes.push(sceneryRecipe({id,anchor:id,archetype,scale,seed:id,offset:[0,y,0]},this.period,site));};
    for(const h of houses)add(h.archetype||'rural_cottage',h.x,h.z,h.scale);
    add('human',0,2,.65);add('handcart',2,0,.5);
    const field=this.assets.field(recipes.filter(Boolean),anchors,{regional:false});field.group.position.set(site.x,0,site.z);field.group.rotation.y=site.angle;
    this.assets.engine._tagShadows(field.group);this.group.add(field.group);const detail={site,indices:houses.map(h=>h.index),group:field.group,animated:field.animated};this.detailCache.set(site.id,detail);this.stats.modelBuilds++;return detail;
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
    this.sync(this.occupied);this.assets.buildForest([...this.assets.forestOccupied,...this.clearings],this.assets.forestScenes);this.assets.forest.visible=this.world.geography?.display?.forest!==false;
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
