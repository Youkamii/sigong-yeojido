import * as THREE from 'three';
import {mergeGeometries} from '../vendor/utils/BufferGeometryUtils.js';

// At map distance keep every static silhouette and color in one draw per village.
export function sceneryOverview(group){
  const parts=[];group.updateWorldMatrix(true,true);
  group.traverseVisible(o=>{
    if(!o.isMesh||!o.material.visible)return;
    const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(),p=g.attributes.position;
    const existing=o.material.vertexColors&&g.attributes.color,colors=new Float32Array(p.count*3),color=o.material.color||new THREE.Color('#ffffff');
    for(let i=0;i<p.count;i++){colors[i*3]=color.r*(existing?existing.getX(i):1);colors[i*3+1]=color.g*(existing?existing.getY(i):1);colors[i*3+2]=color.b*(existing?existing.getZ(i):1);}
    g.setAttribute('color',new THREE.BufferAttribute(colors,3));g.applyMatrix4(o.matrixWorld);
    for(const name of Object.keys(g.attributes))if(!['position','normal','color'].includes(name))g.deleteAttribute(name);
    if(!g.attributes.normal)g.computeVertexNormals();parts.push(g);
  });
  const geometry=mergeGeometries(parts);for(const g of parts)g.dispose();
  const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));
  mesh.name='scenery-overview';mesh.visible=false;mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
}
