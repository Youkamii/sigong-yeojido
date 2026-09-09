import * as THREE from 'three';
import {GRID_XZ,GRID_INDICES,GRID_INFO} from './terrain-grid.js';

const decode=(text,Type)=>new Type(Uint8Array.from(atob(text),c=>c.charCodeAt(0)).buffer);
const SEA='#789fa7';

export function buildPeninsulaTerrain(world){
  const xz=decode(GRID_XZ,Float32Array),indices=decode(GRID_INDICES,Uint16Array);
  const positions=new Float32Array(xz.length/2*3),colors=new Float32Array(positions.length);
  const low=new THREE.Color('#a6b17c'),mid=new THREE.Color('#82946f'),high=new THREE.Color('#929380'),peak=new THREE.Color('#c5c0a7'),color=new THREE.Color();
  for(let i=0;i<xz.length;i+=2){
    const x=xz[i],z=xz[i+1],y=world.surfaceAt(x,z),h=y-world.seaLevel,j=i/2*3;
    positions.set([x,y,z],j);
    color.copy(low).lerp(mid,Math.min(1,h/10)).lerp(high,Math.max(0,Math.min(1,(h-10)/16))).lerp(peak,Math.max(0,Math.min(1,(h-24)/11)));
    color.toArray(colors,j);
  }
  const indexed=new THREE.BufferGeometry();indexed.setAttribute('position',new THREE.BufferAttribute(positions,3));
  indexed.setAttribute('color',new THREE.BufferAttribute(colors,3));indexed.setIndex(new THREE.BufferAttribute(indices,1));indexed.computeVertexNormals();
  // The shared vertex normals stay smooth; the existing surface sampler reads triangles.
  const geometry=indexed.toNonIndexed();indexed.dispose();geometry.computeBoundingBox();geometry.computeBoundingSphere();
  const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));
  mesh.name='peninsula-surface';mesh.receiveShadow=true;mesh.userData.fanGround=true;mesh.userData.fanCastShadow=true;
  world.land.add(mesh);world.maxSurfaceHeight=geometry.boundingBox.max.y;world.terrainStats=GRID_INFO;
  const positionsAtSea=[];
  for(const ring of world.rings)for(let i=1;i<ring.length;i++){
    for(const p of [ring[i-1],ring[i]])positionsAtSea.push(p[0],world.seaLevel+.025,p[1]);
  }
  const shore=new THREE.BufferGeometry();shore.setAttribute('position',new THREE.Float32BufferAttribute(positionsAtSea,3));
  const coast=new THREE.LineSegments(shore,new THREE.LineBasicMaterial({color:'#a3b9b2',transparent:true,opacity:.55,toneMapped:false}));
  coast.name='coastal-shallows';world.land.add(coast);
  const sea=world.group.getObjectByName('historical-sea');sea.material.dispose();sea.material=new THREE.MeshBasicMaterial({color:SEA,toneMapped:false});sea.receiveShadow=false;
}
