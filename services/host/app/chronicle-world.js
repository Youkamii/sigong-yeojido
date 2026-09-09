import * as THREE from 'three';
import {KoreaWorld,toWorld,makeHeightAt} from './korea.js';
import {ridgeSegments,ridgeRelief} from './chronicle-geography.js';
import {fitChronicleShadows} from './chronicle-shadows.js';
import {unprojectCoordinates} from './history-coordinates.js';
import {insideCoastline as inside,coastlineDistance as edgeDistance} from './coastline-index.js';
import {NeighborLand} from './neighbor-land.js';
import {terrainSurface} from './terrain-surface.js';
import {ChronicleRivers} from './chronicle-rivers.js';
import {buildPeninsulaTerrain} from './peninsula-terrain.js';

export function stableSeed(text){let value=2166136261;for(const c of text)value=Math.imul(value^c.charCodeAt(0),16777619);return value>>>0;}
export function woodlandDensity(x,z){return Math.max(0,Math.min(1,(Math.sin(x/31)+Math.cos(z/37)+Math.sin((x+z)/13)*.5-.4)/1.8));}

/** The outline is a fixed map canvas. It never supplies historical location claims. */
export class ChronicleWorld extends KoreaWorld{
  constructor(geo,places,{elev,outline,geography,neighbors}){
    super({features:[]},[],{});
    for(const child of [...this.group.children])if(child!==this.history&&child!==this.marks){
      this.group.remove(child);child.traverse(o=>{o.geometry?.dispose();for(const m of [o.material].flat())m?.dispose();});
    }
    this.places=places;this.marks.visible=false;this.geo=geo;this.mapScale=8;
    const polygons=outline.geometry.type==='Polygon'?[outline.geometry.coordinates]:outline.geometry.coordinates;
    this.rings=polygons.map(p=>p[0].map(c=>this.toWorld(...c))).filter(r=>{
      const area=Math.abs(r.reduce((a,p,i)=>a+p[0]*r[(i+1)%r.length][1]-r[(i+1)%r.length][0]*p[1],0))/2;
      return area>.00001;
    });
    this.rings.sort((a,b)=>b.length-a.length);
    this.rings=this.rings.filter(r=>!(geography?.islands||[]).some(i=>inside(...this.toWorld(i.lon,i.lat),r)));
    this.islandRings=[];
    for(const island of geography?.islands||[]){
      const geometry=island.geometry;if(!geometry)continue;
      const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;
      for(const polygon of polygons){
        const ring=polygon[0].map(c=>this.toWorld(...c));
        this.rings.push(ring);this.islandRings.push({ring,island});
      }
    }
    this.ridgeSegments=ridgeSegments(geography,(...c)=>this.toWorld(...c));
    const ridges=new Map();
    this.ridgeAt=(x,z)=>{const key=x.toFixed(3)+':'+z.toFixed(3);if(!ridges.has(key))ridges.set(key,ridgeRelief(x,z,this.ridgeSegments));return ridges.get(key);};
    for(const ring of this.rings)ring.bounds={minX:Math.min(...ring.map(p=>p[0])),maxX:Math.max(...ring.map(p=>p[0])),
      minZ:Math.min(...ring.map(p=>p[1])),maxZ:Math.max(...ring.map(p=>p[1]))};
    const points=this.rings.flat();
    this.bounds={minX:Math.min(...points.map(p=>p[0])),maxX:Math.max(...points.map(p=>p[0])),
      minZ:Math.min(...points.map(p=>p[1])),maxZ:Math.max(...points.map(p=>p[1]))};
    this.center=new THREE.Vector3((this.bounds.minX+this.bounds.maxX)/2,8,(this.bounds.minZ+this.bounds.maxZ)/2);
    this.maxRim=Math.max(...points.map(p=>Math.hypot(...p)));
    this.neighbors=new NeighborLand(neighbors,(...c)=>this.toWorld(...c));this.group.add(this.neighbors.group);
    const worldPoints=[...points,...this.neighbors.rings.flat()];
    this.navigationBounds=worldPoints.reduce((b,[x,z])=>({minX:Math.min(b.minX,x),maxX:Math.max(b.maxX,x),
      minZ:Math.min(b.minZ,z),maxZ:Math.max(b.maxZ,z)}),{...this.bounds});
    this.navigationRim=worldPoints.reduce((r,p)=>Math.max(r,Math.hypot(...p)),this.maxRim);
    this.seaLevel=7;
    const nb=this.navigationBounds;
    const seaGeometry=new THREE.PlaneGeometry((nb.maxX-nb.minX)*3,(nb.maxZ-nb.minZ)*3,1,1);
    seaGeometry.rotateX(-Math.PI/2);
    const sea=new THREE.Mesh(seaGeometry,new THREE.MeshStandardMaterial({color:'#6c999a',roughness:.55,metalness:.05}));
    sea.position.set(this.center.x,this.seaLevel,this.center.z);sea.receiveShadow=true;sea.userData.fanGround=true;
    sea.name='historical-sea';this.group.add(sea);
    const sample=elev?makeHeightAt(elev):()=>0;
    this.coordinatesAt=(x,z)=>unprojectCoordinates(x,z,this.mapScale);
    this.surfaceAt=(x,z)=>{
      const ring=this.rings.find(r=>inside(x,z,r));if(!ring)return this.neighbors.contains(x,z)?7.04:7;
      const island=this.islandRings.find(i=>i.ring===ring);
      if(island){
        const [cx,cz]=this.toWorld(island.island.lon,island.island.lat);
        const extent=Math.max(...ring.map(p=>Math.hypot(p[0]-cx,p[1]-cz)));
        const relief=island.island.areaKm2<1?.35:6;
        return 7.04+edgeDistance(x,z,ring,relief/1.2)*1.2*Math.max(.2,1-Math.hypot(x-cx,z-cz)/(extent||1));
      }
      const [lon,lat]=this.coordinatesAt(x,z);
      let height=Math.max(0,sample(lon,lat))*.5;
      for(const [dx,dy] of [[-.025,0],[.025,0],[0,-.025],[0,.025]])height+=Math.max(0,sample(lon+dx,lat+dy))*.125;
      const ridge=this.ridgeAt(x,z);
      return 7.04+(height*.012+Math.sqrt(height)*.04+ridge*1.8)*edgeDistance(x,z,ring,2.3*this.mapScale)/(2.3*this.mapScale);
    };
    // KoreaWorld's old overlays convert this display height back with terrainY.
    this.heightAt=(lon,lat)=>(this.surfaceAt(...this.toWorld(lon,lat))-7)*244.6+.001;
    const sampleSurface=this.surfaceAt,heights=new Map();
    this.surfaceAt=(x,z)=>{
      const key=x.toFixed(3)+':'+z.toFixed(3);
      if(!heights.has(key))heights.set(key,sampleSurface(x,z));
      return heights.get(key);
    };
    this.land=new THREE.Group();this.land.name='peninsula-diorama';this.group.add(this.land);
    this.buildLand();
    this.surfaceAt=terrainSurface(this.land.getObjectByName('peninsula-surface').geometry.attributes.position,this.surfaceAt);
    this.rivers=new ChronicleRivers(this);this.group.add(this.rivers.group);
  }
  nearWater(x,z,margin=0){return this.rivers?.near(x,z,margin)||false;}
  toWorld(lon,lat){return toWorld(lon,lat).map(v=>v*this.mapScale);}
  contains(x,z,margin=0){return this.rings.some(r=>inside(x,z,r)&&(!margin||edgeDistance(x,z,r,margin)>=margin))||this.neighbors.contains(x,z,margin);}
  placeNear(x,z,radius=2,occupied=[]){
    for(let i=0;i<700+occupied.length*12;i++){
      const angle=i*2.399963,spread=i?Math.sqrt(i)*1.05:0;
      const px=x+Math.cos(angle)*spread,pz=z+Math.sin(angle)*spread;
      if(this.contains(px,pz,radius)&&occupied.every(p=>Math.hypot(px-p.x,pz-p.z)>=radius+p.radius))
        return new THREE.Vector3(px,this.surfaceAt(px,pz),pz);
    }
    return null;
  }
  displayAnchor(id,occupied=[],radius=3){
    const b=this.bounds;
    for(let i=0;i<80;i++){
      const seed=stableSeed(id+':'+i),x=b.minX+(b.maxX-b.minX)*(.1+(seed%1000)/1000*.8);
      const z=b.minZ+(b.maxZ-b.minZ)*(.1+(Math.floor(seed/1000)%1000)/1000*.8);
      if(!this.contains(x,z,radius))continue;
      const p=this.placeNear(x,z,radius,occupied);if(p)return p;
    }
    return null;
  }
  buildLand(){buildPeninsulaTerrain(this);}
  configureEngine(engine){
    this.engine=engine;
    this.rivers.addControls(engine);
    engine.contactShadowDistance=400;
    engine.frameWorld(this.navigationRim);
    engine.controls.minDistance=.1;engine.controls.maxDistance=this.navigationRim*5;
    engine.controls.maxPolarAngle=Math.PI*.44;
    engine.camera.near=.005;
    engine.camera.far=this.navigationRim*10;engine.camera.updateProjectionMatrix();
    const el=40*Math.PI/180,az=-20*Math.PI/180,d=140;
    engine.controls.target.copy(this.center);
    engine.camera.position.copy(this.center).add(new THREE.Vector3(Math.sin(az)*Math.cos(el)*d,Math.sin(el)*d,Math.cos(az)*Math.cos(el)*d));
    engine.controls.update();
    this.sunDirection=engine.key.position.clone().sub(engine.key.target.position).normalize();
  }
  frame(engine,includeNeighbors=false){
    // Fit the projected coastline at the current angle, including portrait screens.
    const direction=engine.camera.position.clone().sub(engine.controls.target).normalize();
    if(direction.y<.22)direction.setY(.22).normalize();
    const right=new THREE.Vector3(direction.z,0,-direction.x).normalize(),up=new THREE.Vector3().crossVectors(direction,right);
    const bounds=includeNeighbors?this.navigationBounds:this.bounds;
    const center=includeNeighbors?new THREE.Vector3((bounds.minX+bounds.maxX)/2,8,(bounds.minZ+bounds.maxZ)/2):this.center;
    const rings=includeNeighbors?[...this.rings,...this.neighbors.rings]:this.rings;
    let halfWidth=0,halfHeight=0;
    for(const [x,z] of rings.flat()){
      const p=new THREE.Vector3(x,7,z).sub(center);
      halfWidth=Math.max(halfWidth,Math.abs(p.dot(right)));halfHeight=Math.max(halfHeight,Math.abs(p.dot(up)));
    }
    const aspect=engine.renderer.domElement.clientWidth/engine.renderer.domElement.clientHeight;
    engine.flyTo(center.clone(),Math.max(halfHeight,halfWidth/aspect)/Math.tan(21*Math.PI/180)*1.18,650);
  }
  update(t,camera,canvas){
    super.update(t,camera,canvas);
    const engine=this.engine;if(!engine)return;
    const target=engine.controls.target,distance=camera.position.distanceTo(target);
    const near=Math.max(.0005,distance*.05);
    if(camera.near!==near){camera.near=near;camera.updateProjectionMatrix();}
    if(engine.scene.fog){engine.scene.fog.near=distance+Math.max(280,distance*.65);engine.scene.fog.far=distance+this.navigationRim*3.5;}
    this.shadowCoverage=fitChronicleShadows(camera,engine.key,this.sunDirection,this.navigationBounds,this.maxSurfaceHeight+32);
  }
}
