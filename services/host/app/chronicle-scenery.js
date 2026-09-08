import * as THREE from 'three';
import {stableSeed} from './chronicle-world.js';
import {insideCoastline} from './coastline-index.js';
const randomFor=id=>{let n=stableSeed(id);return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};};
const blend=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];

// Unnamed life scenery stays separate from historical places, people and evidence.
export class ChronicleScenery{
  constructor(assets){
    this.assets=assets;this.world=assets.world;this.group=new THREE.Group();this.group.name='decorative-scenery';
    assets.engine.add(this.group);this.sites=[];this.cells=[];this.occupied=[];this.wildlife=[];this.showPaths=true;
    this.stats={villages:0,houses:0,fields:0,tigers:0,ready:false};
    const w=this.world,b=w.bounds,candidates=[];
    for(let x=b.minX+20;x<b.maxX-20;x+=58)for(let z=b.minZ+20;z<b.maxZ-20;z+=58){
      const seed=stableSeed('hamlet:'+x+':'+z),r=randomFor(String(seed)),px=x+r()*26-13,pz=z+r()*26-13;
      if(!insideCoastline(px,pz,w.rings[0])||!w.contains(px,pz,14))continue;
      const heights=[[0,0],[-11,-11],[11,-11],[11,11],[-11,11]].map(([dx,dz])=>w.surfaceAt(px+dx,pz+dz));
      if(heights[0]>26||Math.max(...heights)-Math.min(...heights)>3.6)continue;
      candidates.push({x:px,z:pz,radius:12,scale:.27+r()*.1,angle:r()*Math.PI*2,layout:seed%4,seed});
    }
    this.sites=candidates.sort((a,b)=>a.seed-b.seed).slice(0,64).map((s,i)=>({...s,id:'scenery-village:'+i}));
  }
  point(site,x,z){const c=Math.cos(site.angle),s=Math.sin(site.angle);return [site.x+(x*c+z*s)*site.scale,site.z+(-x*s+z*c)*site.scale];}
  available(site){return this.occupied.every(o=>Math.hypot(site.x-o.x,site.z-o.z)>site.radius+o.radius+4);}
  setDisplay(visible,paths){this.group.visible=visible;this.showPaths=paths;this.group.traverse(o=>{if(o.name==='scenery-lanes')o.visible=paths;});}
  sync(occupied){this.occupied=occupied;this.clearings=[...this.sites,...this.wildlife].filter(s=>this.available(s));for(const c of this.cells)c.group.visible=this.available(c.site);}
  start(forest){if(this.ready)return;this.ready=this.populate(forest).then(()=>{this.stats.ready=true;}).catch(e=>{this.stats.error=e.message;console.error('[scenery]',e);});}
  mesh(points,colors,name){
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();
    const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}));m.name=name;m.receiveShadow=true;return m;
  }
  async populate(forest){
    for(const site of this.sites){
      const r=randomFor(site.id+':'+site.seed),group=new THREE.Group();group.name=site.id;group.userData.decorative=true;
      const cell={site,group,animated:[],models:[],plots:[]};this.cells.push(cell);this.group.add(group);
      const anchors=new Map(),recipes=[],houses=[],count=3+Math.floor(r()*5);
      const add=(archetype,x,z,scale)=>{
        const [wx,wz]=this.point(site,x,z);if(!this.world.contains(wx,wz,1))return;
        const id=site.id+':'+recipes.length,y=this.world.surfaceAt(wx,wz),p=new THREE.Vector3(x*site.scale,y,z*site.scale);
        anchors.set(id,p);recipes.push({id,anchor:id,archetype,scale:scale*site.scale,seed:id,offset:[0,y,0]});cell.models.push({archetype,x:wx,z:wz,scale:scale*site.scale});
      };
      for(let i=0;i<count;i++){
        const a=(i/count)*Math.PI*2,jitter=r()*3-1.5;
        const p=site.layout===0?[(i-(count-1)/2)*7,(i%2?1:-1)*(6+r()*3)]:site.layout===1?[Math.cos(a)*(10+r()*3),Math.sin(a)*(9+r()*3)]:site.layout===2?[(i%3-1)*9+jitter,(Math.floor(i/3)-.5)*12+jitter]:[Math.cos(a)*7+i*.9,Math.sin(a)*12+jitter];
        houses.push(p);add(i===count-1&&r()>.45?'rural_store':r()>.8?'rural_hut':r()>.75?'korean_house':'rural_cottage',...p,.65+r()*.35);this.stats.houses++;
      }
      if(r()>.4)add('handcart',1,1,.5);add('human',-1,3,.65);if(r()>.5)add('human',5,-2,.6);
      const field=this.assets.field(recipes,anchors);field.group.position.set(site.x,0,site.z);field.group.rotation.y=site.angle;group.add(field.group);cell.animated=field.animated;
      const positions=[],colors=[],roadPoints=[],roadColors=[],earth=new THREE.Color('#958664');
      const push=(target,palette,p,color)=>{target.push(p[0],p[1],p[2]);palette.push(color.r,color.g,color.b);};
      const fill=(corners,color,heightAt,lift=0)=>{for(const i of [0,2,1,0,3,2]){const p=corners[i];push(positions,colors,[p[0],heightAt(...p)+lift,p[1]],color);}};
      const plots=2+Math.floor(r()*4);
      for(let i=0;i<plots;i++){
        const a=(i/plots)*Math.PI*2+r()*.3;
        const [cx,cz]=site.layout===0?[(i-(plots-1)/2)*10+r()*2,18+r()*3]:site.layout===2?[16+i*1.6,-14+i*7+r()*2]:site.layout===3?[-17+r()*4,(i-(plots-1)/2)*9]:[Math.cos(a)*(22+r()*3),Math.sin(a)*(22+r()*3)];
        const hw=4+r()*3,hd=3.5+r()*3;
        const corners=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([x,z])=>this.point(site,cx+x+r()*1.6,cz+z+r()*1.6));
        if(corners.some(p=>!this.world.contains(...p,.3)))continue;
        const [x,z]=this.point(site,cx,cz),h=this.world.surfaceAt,gx=(h(x+1,z)-h(x-1,z))/2,gz=(h(x,z+1)-h(x,z-1))/2;
        const base=Math.max(h(x,z),...corners.map(p=>h(...p)-gx*(p[0]-x)-gz*(p[1]-z)))+.06;
        const plane=(px,pz)=>base+gx*(px-x)+gz*(pz-z),center=[x,z],inner=corners.map(p=>blend(center,p,.91));
        fill(corners,earth,plane);const crop=new THREE.Color(['#788c54','#8e955e','#a29662','#708474'][Math.floor(r()*4)]);fill(inner,crop,plane,.012);
        for(let j=1,n=3+Math.floor(r()*4);j<n;j++){
          const t=j/n,l=blend(inner[0],inner[3],t),rr=blend(inner[1],inner[2],t),l2=blend(inner[0],inner[3],t+.025),r2=blend(inner[1],inner[2],t+.025);
          fill([l,rr,r2,l2],earth,plane,.025);
        }
        cell.plots.push(corners);this.stats.fields++;
      }
      group.add(this.mesh(positions,colors,'decorative-fields'));
      for(const house of houses){
        const start=this.point(site,...house),end=this.point(site,r()*4-2,r()*4-2),steps=8;
        for(let i=0;i<steps;i++){
          const a=blend(start,end,i/steps),b=blend(start,end,(i+1)/steps),dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz)||1,nx=-dz/len*.14,nz=dx/len*.14;
          const corners=[a,b].flatMap(p=>[-1,1].map(s=>[p[0]+nx*s,this.world.surfaceAt(p[0]+nx*s,p[1]+nz*s)+.065,p[1]+nz*s]));
          for(const k of [0,2,1,1,2,3])push(roadPoints,roadColors,corners[k],earth);
        }
      }
      const lanes=this.mesh(roadPoints,roadColors,'scenery-lanes');lanes.visible=this.showPaths;group.add(lanes);
      group.visible=this.available(site);this.stats.villages++;
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    const chosen=[];
    for(const tree of forest){
      if(chosen.length>=24)break;
      const seed=stableSeed('tiger:'+tree.x+':'+tree.z);if(seed%67)continue;
      const p=new THREE.Vector3(tree.x+2.5,0,tree.z);p.y=this.world.surfaceAt(p.x,p.z);
      if(!insideCoastline(p.x,p.z,this.world.rings[0])||!this.world.contains(p.x,p.z,2)||this.sites.some(s=>Math.hypot(p.x-s.x,p.z-s.z)<23)||chosen.some(q=>p.distanceTo(q)<88)||!this.available({x:p.x,z:p.z,radius:3.2}))continue;
      chosen.push(p);const id='scenery-tiger:'+chosen.length,scale=.48+(seed%5)*.025;
      const field=this.assets.field([{id,anchor:id,archetype:'tiger',scale,seed:id,offset:[0,p.y,0]}],new Map([[id,p]]));
      field.group.name=id;field.group.userData.decorative=true;
      const site={x:p.x,z:p.z,radius:3.2};this.wildlife.push(site);this.cells.push({site,group:field.group,animated:field.animated,scale});this.group.add(field.group);this.stats.tigers++;
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    this.sync(this.occupied);this.assets.buildForest([...this.assets.forestOccupied,...this.clearings],this.assets.forestScenes);
    this.assets.forest.visible=this.assets.world.geography?.display?.forest!==false;
  }
  update(camera,t){for(const c of this.cells)if(c.group.visible&&Math.hypot(camera.position.x-c.site.x,camera.position.z-c.site.z)<160)for(const a of c.animated)a.update(t);}
}
