import * as THREE from 'three';
import {KoreaWorld,toWorld,makeHeightAt} from './korea.js';
import {makeMaterial} from './materials.js';
import {PALETTE,mix,darken} from './artbible.js';

function inside(x,z,ring){
  let result=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const a=ring[i],b=ring[j];
    if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])result=!result;
  }
  return result;
}
function edgeDistance(x,z,ring){
  let best=Infinity;
  for(let i=0;i<ring.length-1;i++){
    const a=ring[i],b=ring[i+1],dx=b[0]-a[0],dz=b[1]-a[1];
    const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));
    best=Math.min(best,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz));
  }
  return best;
}
export function stableSeed(text){let value=2166136261;for(const c of text)value=Math.imul(value^c.charCodeAt(0),16777619);return value>>>0;}

/** The outline is a fixed map canvas. It never supplies historical location claims. */
export class ChronicleWorld extends KoreaWorld{
  constructor(geo,places,{elev,outline}){
    super({features:[]},[],{});
    for(const child of [...this.group.children])if(child!==this.history&&child!==this.marks){
      this.group.remove(child);child.traverse(o=>{o.geometry?.dispose();for(const m of [o.material].flat())m?.dispose();});
    }
    this.places=places;this.marks.visible=false;this.geo=geo;
    const polygons=outline.geometry.type==='Polygon'?[outline.geometry.coordinates]:outline.geometry.coordinates;
    this.rings=polygons.map(p=>p[0].map(c=>toWorld(...c))).filter(r=>{
      const area=Math.abs(r.reduce((a,p,i)=>a+p[0]*r[(i+1)%r.length][1]-r[(i+1)%r.length][0]*p[1],0))/2;
      return area>.12;
    });
    this.rings.sort((a,b)=>b.length-a.length);
    const points=this.rings.flat();
    this.bounds={minX:Math.min(...points.map(p=>p[0])),maxX:Math.max(...points.map(p=>p[0])),
      minZ:Math.min(...points.map(p=>p[1])),maxZ:Math.max(...points.map(p=>p[1]))};
    this.center=new THREE.Vector3((this.bounds.minX+this.bounds.maxX)/2,8,(this.bounds.minZ+this.bounds.maxZ)/2);
    this.maxRim=95;
    const sample=elev?makeHeightAt(elev):()=>0;
    const [x0,z0]=toWorld(127,37),[x1,z1]=toWorld(128,38);
    this.coordinatesAt=(x,z)=>{
      const lon=127+(x-x0)/(x1-x0),merc37=Math.log(Math.tan(Math.PI/4+37*Math.PI/360));
      const merc38=Math.log(Math.tan(Math.PI/4+38*Math.PI/360));
      return [lon,(2*Math.atan(Math.exp(merc37+(z-z0)/(z1-z0)*(merc38-merc37)))-Math.PI/2)*180/Math.PI];
    };
    this.surfaceAt=(x,z)=>{
      const ring=this.rings.find(r=>inside(x,z,r));if(!ring)return 7;
      const [lon,lat]=this.coordinatesAt(x,z);
      let height=0;
      for(const dx of [-.12,0,.12])for(const dy of [-.12,0,.12])height+=Math.max(0,sample(lon+dx,lat+dy))/9;
      return 7+Math.sqrt(height)*.095*Math.min(1,edgeDistance(x,z,ring)/2.3);
    };
    // KoreaWorld's old overlays convert this display height back with terrainY.
    this.heightAt=(lon,lat)=>(this.surfaceAt(...toWorld(lon,lat))-7)*244.6+.001;
    this.land=new THREE.Group();this.land.name='peninsula-diorama';this.group.add(this.land);
    this.buildLand();
  }
  contains(x,z,margin=0){return this.rings.some(r=>inside(x,z,r)&&edgeDistance(x,z,r)>=margin);}
  placeNear(x,z,radius=2,occupied=[]){
    for(let i=0;i<700;i++){
      const angle=i*2.399963,spread=i?Math.sqrt(i)*1.05:0;
      const px=x+Math.cos(angle)*spread,pz=z+Math.sin(angle)*spread;
      if(this.contains(px,pz,radius)&&occupied.every(p=>Math.hypot(px-p.x,pz-p.z)>=radius+p.radius))
        return new THREE.Vector3(px,this.surfaceAt(px,pz),pz);
    }
    return null;
  }
  displayAnchor(id,occupied=[],radius=3){
    const seed=stableSeed(id),b=this.bounds;
    const x=b.minX+(b.maxX-b.minX)*(.2+(seed%1000)/1000*.6);
    const z=b.minZ+(b.maxZ-b.minZ)*(.18+(Math.floor(seed/1000)%1000)/1000*.68);
    return this.placeNear(x,z,radius,occupied);
  }
  buildLand(){
    const earth=makeMaterial('MAT_STONE',{color:PALETTE.BASE_EARTH,roughness:.98});
    const cliff=makeMaterial('MAT_STONE',{color:darken(PALETTE.BASE_EARTH,.3),roughness:.98});
    const coast=makeMaterial('MAT_STONE',{color:mix(PALETTE.BASE_WATER,PALETTE.BASE_STONE,.42),roughness:.85});
    const grass=makeMaterial('MAT_STONE',{color:'#ffffff',vertexColors:true,roughness:.94,metalness:0});
    const positions=[],colors=[],low=new THREE.Color(mix(PALETTE.BASE_VERDANT,PALETTE.BASE_STONE,.25));
    const high=new THREE.Color(mix(PALETTE.BASE_EARTH,PALETTE.BASE_VERDANT,.45));
    const addTriangle=(a,b,c,depth=0)=>{
      const lengths=[Math.hypot(a[0]-b[0],a[1]-b[1]),Math.hypot(b[0]-c[0],b[1]-c[1]),Math.hypot(c[0]-a[0],c[1]-a[1])];
      const longest=Math.max(...lengths),index=lengths.indexOf(longest);
      if(longest>3.5&&depth<14){
        const pts=[a,b,c],p=pts[index],q=pts[(index+1)%3],r=pts[(index+2)%3],mid=[(p[0]+q[0])/2,(p[1]+q[1])/2];
        addTriangle(p,mid,r,depth+1);addTriangle(mid,q,r,depth+1);return;
      }
      for(const p of [a,b,c]){
        const y=this.surfaceAt(...p),color=low.clone().lerp(high,Math.min(1,(y-7)/5));
        positions.push(p[0],y,p[1]);colors.push(color.r,color.g,color.b);
      }
    };
    for(const ring of this.rings){
      const shape=new THREE.Shape(ring.map(p=>new THREE.Vector2(p[0],-p[1])));
      for(const [bottom,height,material,scale] of [[0,3.3,cliff,1],[3.3,2.6,earth,1],[5.9,1.1,coast,1.008]]){
        const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelThickness:.22,bevelSize:.22,bevelSegments:1});
        geometry.rotateX(-Math.PI/2);
        const mesh=new THREE.Mesh(geometry,material);mesh.position.y=bottom;mesh.scale.set(scale,1,scale);
        mesh.receiveShadow=true;mesh.userData.fanGround=true;this.land.add(mesh);
      }
      const flat=new THREE.ShapeGeometry(shape),p=flat.attributes.position,idx=flat.index;
      for(let i=0;i<idx.count;i+=3){
        const points=[0,1,2].map(k=>[p.getX(idx.getX(i+k)),-p.getY(idx.getX(i+k))]);
        addTriangle(...points);
      }
      flat.dispose();
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,grass);mesh.receiveShadow=true;mesh.userData.fanGround=true;mesh.name='peninsula-surface';this.land.add(mesh);
  }
  frame(engine){
    const aspect=engine.renderer.domElement.clientWidth/engine.renderer.domElement.clientHeight;
    engine.flyTo(this.center.clone(),Math.max(215,205/aspect),650);
  }
}
