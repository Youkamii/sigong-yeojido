import * as THREE from 'three';
import {RIVERS,RIVER_SOURCE} from './river-paths.js';
import {RIVER_MESH} from './river-grid.js';

export class ChronicleRivers{
  constructor(world){
    this.world=world;this.group=new THREE.Group();this.group.name='peninsula-rivers';
    this.cells=new Map();this.rivers=[];
    for(const river of RIVERS){
      const width=['북한강','소양강','남한강','임진강'].includes(river.name)?.62:.92;
      const paths=river.paths.map(path=>path.map(p=>world.toWorld(...p)));
      for(const path of paths)for(let i=1;i<path.length;i++){
        const a=path[i-1],b=path[i],segment={a,b,width};
        for(let x=Math.floor((Math.min(a[0],b[0])-width-.3)/32);x<=Math.floor((Math.max(a[0],b[0])+width+.3)/32);x++)
          for(let z=Math.floor((Math.min(a[1],b[1])-width-.3)/32);z<=Math.floor((Math.max(a[1],b[1])+width+.3)/32);z++){
            const key=x+':'+z;if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push(segment);
          }
      }
      this.rivers.push({...river,paths});
    }
    const decode=(text,Type)=>new Type(Uint8Array.from(atob(text),c=>c.charCodeAt(0)).buffer);
    let triangles=0;
    for(const [name,color,lift] of [['banks','#bcbd91',.09],['water','#4e8c99',.12]]){
      const source=RIVER_MESH[name],xz=decode(source.xz,Float32Array),indices=decode(source.indices,Uint16Array),positions=[];
      for(let i=0;i<indices.length;i+=3){
        const points=[0,1,2].map(k=>[xz[indices[i+k]*2],xz[indices[i+k]*2+1]]);
        const center=points.reduce((p,q)=>[p[0]+q[0]/3,p[1]+q[1]/3],[0,0]);
        if(!world.contains(...center))continue;
        for(const [x,z] of points)positions.push(x,world.surfaceAt(x,z)+lift,z);
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
      const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color,side:THREE.FrontSide,toneMapped:false}));
      mesh.name='river-'+name;geometry.computeBoundingSphere();this.group.add(mesh);triangles+=positions.length/9;
    }
    this.stats={rivers:this.rivers.length,drawCalls:this.group.children.length,triangles};
  }
  near(x,z,margin=0){
    for(let ix=Math.floor((x-margin)/32);ix<=Math.floor((x+margin)/32);ix++)
      for(let iz=Math.floor((z-margin)/32);iz<=Math.floor((z+margin)/32);iz++)
        for(const {a,b,width} of this.cells.get(ix+':'+iz)||[]){
          const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));
          if((x-a[0]-dx*t)**2+(z-a[1]-dz*t)**2<(width+margin+.3)**2)return true;
        }
    return false;
  }
  addControls(engine){
    const field=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent='물길';field.append(legend);
    const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=true;input.dataset.mapRivers='';
    input.onchange=()=>{this.group.visible=input.checked;};label.append(input,'주요 강');field.append(label);
    const select=document.createElement('select');select.setAttribute('aria-label','강으로 이동');select.style.cssText='max-width:155px;padding:4px;background:var(--ink-2);color:var(--paper);border:1px solid var(--line-2);border-radius:3px';
    select.add(new Option('강으로 이동',''));for(const river of this.rivers)select.add(new Option(river.name,river.name));
    select.onchange=()=>{
      const river=this.rivers.find(r=>r.name===select.value);if(!river)return;
      this.group.visible=input.checked=true;
      const path=[...river.paths].sort((a,b)=>b.length-a.length)[0],p=path[Math.floor(path.length/2)];
      engine.flyTo(new THREE.Vector3(p[0],this.world.surfaceAt(...p),p[1]),140,650);
    };
    field.append(select);field.title=RIVER_SOURCE.note;document.getElementById('mapDisplay').append(field);
    const credit=document.createElement('a');credit.href=RIVER_SOURCE.url;credit.target='_blank';credit.rel='noopener';credit.textContent='물길 © OpenStreetMap';credit.title=RIVER_SOURCE.note;
    credit.style.cssText='position:absolute;right:8px;bottom:8px;font:10px sans-serif;color:#263e3e;background:#efe8d6dc;padding:3px 5px;border-radius:3px;pointer-events:auto';
    engine.renderer.domElement.parentElement.append(credit);
  }
}
