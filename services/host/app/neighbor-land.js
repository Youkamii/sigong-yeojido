import * as THREE from 'three';
import {makeMaterial} from './materials.js';
import {PALETTE,mix} from './artbible.js';
import {insideCoastline,coastlineDistance} from './coastline-index.js';

export class NeighborLand{
  constructor(data,toWorld){
    this.group=new THREE.Group();this.group.name='neighbor-land';this.rings=[];
    const top=makeMaterial('MAT_STONE',{color:mix(PALETTE.BASE_VERDANT,PALETTE.BASE_STONE,.25),roughness:.94});
    const side=makeMaterial('MAT_STONE',{color:PALETTE.BASE_EARTH,roughness:.98});
    for(const feature of data?.features||[]){
      const polygon=feature.geometry.coordinates.map(r=>r.map(c=>toWorld(...c))),ring=polygon[0];
      for(const r of polygon)r.bounds={minX:Math.min(...r.map(p=>p[0])),maxX:Math.max(...r.map(p=>p[0])),
        minZ:Math.min(...r.map(p=>p[1])),maxZ:Math.max(...r.map(p=>p[1]))};
      ring.holes=polygon.slice(1);this.rings.push(ring);
      const points=r=>r.map(p=>new THREE.Vector2(p[0],-p[1]));
      const shape=new THREE.Shape(points(ring));shape.holes=ring.holes.map(r=>new THREE.Path(points(r)));
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:7.04,bevelEnabled:false});geometry.rotateX(-Math.PI/2);
      const mesh=new THREE.Mesh(geometry,[top,side]);mesh.name=feature.id;
      mesh.receiveShadow=true;mesh.userData.fanGround=true;this.group.add(mesh);
    }
  }
  contains(x,z,margin=0){
    return this.rings.some(r=>insideCoastline(x,z,r)&&r.holes.every(h=>!insideCoastline(x,z,h))
      &&(!margin||[r,...r.holes].every(h=>coastlineDistance(x,z,h,margin)>=margin)));
  }
}
