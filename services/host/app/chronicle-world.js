import * as THREE from 'three';
import {KoreaWorld,toWorld,makeHeightAt} from './korea.js';
import {makeMaterial} from './materials.js';
import {PALETTE,mix,darken} from './artbible.js';
import {ridgeSegments,ridgeRelief} from './chronicle-geography.js';
import {fitChronicleShadows} from './chronicle-shadows.js';
import {unprojectCoordinates} from './history-coordinates.js';
import {insideCoastline as inside,coastlineDistance as edgeDistance} from './coastline-index.js';
import {NeighborLand} from './neighbor-land.js';

export function stableSeed(text){let value=2166136261;for(const c of text)value=Math.imul(value^c.charCodeAt(0),16777619);return value>>>0;}

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
      let height=0;
      for(const dx of [-.12,0,.12])for(const dy of [-.12,0,.12])height+=Math.max(0,sample(lon+dx,lat+dy))/9;
      const ridge=ridgeRelief(x,z,this.ridgeSegments);
      return 7.04+(Math.sqrt(height)*.095+ridge*(4+Math.sqrt(height)*.32))*edgeDistance(x,z,ring,2.3*this.mapScale)/(2.3*this.mapScale);
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
  }
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
  buildLand(){
    const earth=makeMaterial('MAT_STONE',{color:PALETTE.BASE_EARTH,roughness:.98});
    const cliff=makeMaterial('MAT_STONE',{color:darken(PALETTE.BASE_EARTH,.3),roughness:.98});
    const coast=makeMaterial('MAT_STONE',{color:mix(PALETTE.BASE_WATER,PALETTE.BASE_STONE,.42),roughness:.85});
    const grass=makeMaterial('MAT_STONE',{color:'#ffffff',vertexColors:true,roughness:.94,metalness:0});
    const positions=[],colors=[],low=new THREE.Color(mix(PALETTE.BASE_VERDANT,PALETTE.BASE_STONE,.25));
    const high=new THREE.Color(mix(PALETTE.BASE_EARTH,PALETTE.BASE_VERDANT,.45));
    const addTriangle=(a,b,c,limit,depth=0)=>{
      const lengths=[Math.hypot(a[0]-b[0],a[1]-b[1]),Math.hypot(b[0]-c[0],b[1]-c[1]),Math.hypot(c[0]-a[0],c[1]-a[1])];
      const longest=Math.max(...lengths),index=lengths.indexOf(longest);
      if(longest>limit&&depth<18){
        const pts=[a,b,c],p=pts[index],q=pts[(index+1)%3],r=pts[(index+2)%3],mid=[(p[0]+q[0])/2,(p[1]+q[1])/2];
        addTriangle(p,mid,r,limit,depth+1);addTriangle(mid,q,r,limit,depth+1);return;
      }
      for(const p of [a,b,c]){
        const y=Math.max(7.04,this.surfaceAt(...p)),color=low.clone().lerp(high,Math.min(1,(y-7)/20));
        positions.push(p[0],y,p[1]);colors.push(color.r,color.g,color.b);
      }
    };
    for(const ring of this.rings){
      const limit=Math.min(1.5*this.mapScale,Math.max(.03,Math.max(ring.bounds.maxX-ring.bounds.minX,ring.bounds.maxZ-ring.bounds.minZ)/8));
      const shape=new THREE.Shape(ring.map(p=>new THREE.Vector2(p[0],-p[1])));
      const island=this.islandRings.some(i=>i.ring===ring);
      const layers=island?[[6.7,.3,cliff,1]]:[[0,3.3,cliff,1],[3.3,2.6,earth,1],[5.9,1.1,coast,1]];
      for(const [bottom,height,material,scale] of layers){
          const bevel=.005;
        const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:1});
        geometry.rotateX(-Math.PI/2);
        const mesh=new THREE.Mesh(geometry,material);mesh.position.y=bottom;mesh.scale.set(scale,1,scale);
        mesh.receiveShadow=true;mesh.userData.fanGround=true;this.land.add(mesh);
      }
      const flat=new THREE.ShapeGeometry(shape),p=flat.attributes.position,idx=flat.index;
      for(let i=0;i<idx.count;i+=3){
        const points=[0,1,2].map(k=>[p.getX(idx.getX(i+k)),-p.getY(idx.getX(i+k))]);
        addTriangle(...points,limit);
      }
      flat.dispose();
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
    geometry.computeBoundingBox();this.maxSurfaceHeight=geometry.boundingBox.max.y;
    const mesh=new THREE.Mesh(geometry,grass);mesh.receiveShadow=true;mesh.userData.fanGround=true;
    mesh.userData.fanCastShadow=true;mesh.name='peninsula-surface';this.land.add(mesh);
  }
  configureEngine(engine){
    this.engine=engine;
    engine.contactShadowDistance=400;
    engine.frameWorld(this.navigationRim);
    engine.controls.minDistance=.1;engine.controls.maxDistance=this.navigationRim*5;
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
