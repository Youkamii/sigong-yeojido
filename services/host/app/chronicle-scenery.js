import * as THREE from 'three';
import {stableSeed} from './chronicle-world.js';
import {insideCoastline} from './coastline-index.js';

// Unnamed decorative scenery requested by the user. These are not history rows or pick targets.
export class ChronicleScenery{
  constructor(assets){
    this.assets=assets;this.world=assets.world;this.group=new THREE.Group();this.group.name='decorative-scenery';
    assets.engine.add(this.group);this.sites=[];this.cells=[];this.occupied=[];this.wildlife=[];
    this.stats={villages:0,houses:0,fields:0,tigers:0,ready:false};
    const w=this.world,b=w.bounds;
    for(let x=b.minX+32;x<b.maxX-25;x+=88)for(let z=b.minZ+32;z<b.maxZ-25;z+=88){
      const seed=stableSeed('hamlet:'+x+':'+z),px=x+(seed%23)-11,pz=z+(Math.floor(seed/23)%23)-11;
      if(seed%6===0||!insideCoastline(px,pz,w.rings[0])||!w.contains(px,pz,22))continue;
      const h=w.surfaceAt(px,pz),around=[[-22,-22],[22,-22],[22,22],[-22,22]].map(([dx,dz])=>w.surfaceAt(px+dx,pz+dz));
      if(h>26||Math.max(...around,h)-Math.min(...around,h)>6)continue;
      this.sites.push({id:'scenery-village:'+this.sites.length,x:px,z:pz,radius:34,scale:.8,seed});
    }
  }
  available(site){return this.occupied.every(o=>Math.hypot(site.x-o.x,site.z-o.z)>site.radius+o.radius+8);}
  setDisplay(visible,paths){
    this.group.visible=visible;this.showPaths=paths;
    this.group.traverse(o=>{if(o.name==='scenery-lanes')o.visible=paths;});
  }
  sync(occupied){
    this.occupied=occupied;
    this.clearings=[...this.sites,...this.wildlife].filter(s=>this.available(s));
    for(const cell of this.cells)cell.group.visible=this.available(cell.site);
  }
  start(forest){
    if(this.ready)return;
    this.ready=this.populate(forest).then(()=>{this.stats.ready=true;}).catch(error=>{this.stats.error=error.message;console.error('[scenery]',error);});
  }
  async populate(forest){
    for(const site of this.sites){
      const group=new THREE.Group();group.name=site.id;group.userData.decorative=true;
      this.group.add(group);const cell={site,group,animated:[]};this.cells.push(cell);
      const anchors=new Map(),recipes=[];
      const add=(archetype,dx,dz,scale)=>{
        dx*=site.scale;dz*=site.scale;scale*=site.scale;
        const x=site.x+dx,z=site.z+dz;if(!this.world.contains(x,z,2))return;
        const id=site.id+':'+recipes.length,p=new THREE.Vector3(x,this.world.surfaceAt(x,z),z);
        anchors.set(id,p);recipes.push({id,anchor:id,archetype,scale,seed:id,offset:[0,p.y,0]});return true;
      };
      for(const [i,[x,z]] of [[-17,-13],[0,-17],[17,-12],[-18,5],[17,6],[-8,-2]].entries()){
        if(i===5&&site.seed%3)continue;
        if(add('korean_house',x,z,.85+(site.seed+i)%4*.1))this.stats.houses++;
      }
      add('handcart',2,6,.85);add('human',-3,3,1.25);add('human',8,-7,1.1);
      const field=this.assets.field(recipes,anchors);group.add(field.group);cell.animated=field.animated;
      const positions=[],colors=[];
      const patch=(x,z,width,depth,color,lift=.08,heightAt=this.world.surfaceAt)=>{
        x*=site.scale;z*=site.scale;width*=site.scale;depth*=site.scale;
        const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([dx,dz])=>{
          const px=site.x+x+dx*width/2,pz=site.z+z+dz*depth/2;return [px,heightAt(px,pz)+lift,pz];});
        if(corners.some(p=>!this.world.contains(p[0],p[2])))return false;
        for(const i of [0,2,1,0,3,2]){positions.push(...corners[i]);colors.push(color.r,color.g,color.b);}
        if(lift===0)for(let i=0;i<4;i++){
          const a=corners[i],b=corners[(i+1)%4],bottomA=[a[0],this.world.surfaceAt(a[0],a[2])+.02,a[2]],bottomB=[b[0],this.world.surfaceAt(b[0],b[2])+.02,b[2]];
          for(const p of [a,b,bottomA,b,bottomB,bottomA]){positions.push(...p);colors.push(color.r,color.g,color.b);}
        }
        return true;
      };
      const earth=new THREE.Color('#938060'),crop=new THREE.Color(site.seed%2?'#829458':'#a7a05b'),water=new THREE.Color('#728f77');
      patch(0,0,34,1.5,earth);patch(0,4,1.2,38,earth);
      for(const [i,dx] of [-20,-6,8,22].entries()){
        const cx=site.x+dx*site.scale,cz=site.z+23*site.scale,h=this.world.surfaceAt;
        const gx=(h(cx+4,cz)-h(cx-4,cz))/8,gz=(h(cx,cz+4)-h(cx,cz-4))/8;
        const base=Math.max(...[-4.8,0,4.8].flatMap(x=>[-5.2,0,5.2].map(z=>h(cx+x,cz+z)-gx*x-gz*z)))+.12;
        const heightAt=(x,z)=>base+gx*(x-cx)+gz*(z-cz);
        if(!patch(dx,23,12,13,earth,0,heightAt))continue;
        patch(dx,23,10.5,11.5,i%2?crop:water,.025,heightAt);
        for(let row=-4;row<=4;row+=2)patch(dx,23+row,10,.28,crop,.055,heightAt);
        this.stats.fields++;
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
      geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
      const plots=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95}));
      plots.name='decorative-fields';plots.receiveShadow=true;group.add(plots);
      group.visible=this.available(site);this.stats.villages++;
      // Let input and animation continue while the distant background is assembled.
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    const chosen=[],treeCells=new Map();
    for(const p of forest){const key=Math.floor(p.x/8)+':'+Math.floor(p.z/8);if(!treeCells.has(key))treeCells.set(key,[]);treeCells.get(key).push(p);}
    const clear=(x,z)=>{
      const cx=Math.floor(x/8),cz=Math.floor(z/8);
      for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)
        if((treeCells.get((cx+dx)+':'+(cz+dz))||[]).some(p=>Math.hypot(p.x-x,p.z-z)<3.4))return false;
      return this.world.contains(x,z,3);
    };
    for(const tree of forest){
      if(chosen.length>=24)break;
      const seed=stableSeed('tiger:'+tree.x+':'+tree.z);
      if(seed%47)continue;
      const offset=[[6,0],[-6,0],[0,6],[0,-6]].find(([dx,dz])=>clear(tree.x+dx,tree.z+dz));if(!offset)continue;
      const p=new THREE.Vector3(tree.x+offset[0],0,tree.z+offset[1]);p.y=this.world.surfaceAt(p.x,p.z);
      if(!insideCoastline(p.x,p.z,this.world.rings[0])||this.sites.some(s=>Math.hypot(p.x-s.x,p.z-s.z)<50)
        ||chosen.some(q=>p.distanceTo(q)<105)||!this.available({x:p.x,z:p.z,radius:12}))continue;
      chosen.push(p);const id='scenery-tiger:'+chosen.length;
      const field=this.assets.field([{id,anchor:id,archetype:'tiger',scale:2,seed:id,offset:[0,p.y,0]}],new Map([[id,p]]));
      field.group.name=id;field.group.userData.decorative=true;
      const site={x:p.x,z:p.z,radius:12};this.wildlife.push(site);this.cells.push({site,group:field.group,animated:field.animated});
      this.group.add(field.group);this.stats.tigers++;
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    this.sync(this.occupied);
    this.assets.buildForest([...this.assets.forestOccupied,...this.clearings],this.assets.forestScenes);
    this.assets.forest.visible=this.assets.world.geography?.display?.forest!==false;
  }
  update(camera,t){
    for(const cell of this.cells){
      if(!cell.group.visible)continue;
      const distance=Math.hypot(camera.position.x-cell.site.x,camera.position.z-cell.site.z);
      if(distance<250)for(const animation of cell.animated)animation.update(t);
    }
  }
}
