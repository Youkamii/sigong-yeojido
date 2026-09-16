import * as THREE from 'three';
import {overviewBuckets} from './scene-layout.js';

const overviewMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide});

// 정점 계산은 scene-layout.js(순수부)가 하고 여기서는 three 객체만 만든다.
// 워커가 보낸 배열도 같은 함수로 조립하므로 두 경로의 화면 결과가 같다.
export function overviewFromBuckets(buckets,dirty=null,previous=null){
  const group=new THREE.Group();group.name='scenery-overview';
  const dirtySet=dirty&&new Set(dirty);
  if(previous&&dirtySet)for(const mesh of [...previous.children])if(!dirtySet.has(mesh.userData.bucket))group.add(mesh);
  for(const b of buckets){
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(b.positions,3));
    geometry.setAttribute('color',new THREE.BufferAttribute(b.colors,3));
    if(b.normals)geometry.setAttribute('normal',new THREE.BufferAttribute(b.normals,3));
    else geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,overviewMaterial);
    mesh.name=b.kind==='lanes'?'scenery-lanes':b.kind==='fields'?'decorative-fields':'settlement-roofs';
    mesh.receiveShadow=false;mesh.castShadow=false;
    mesh.userData.estimatedBackground=b.estimated;mesh.userData.estimatedOpaque=b.kind==='houses';
    mesh.userData.bucket=b.bucket;
    if(b.ranges.length){mesh.userData.houseRanges=b.ranges;mesh.userData.originalPositions=geometry.attributes.position.array.slice();}
    group.add(mesh);
  }
  return group;
}

// The distant landscape is built directly, never cloned from detailed assets.
export function sceneryOverview(world,cells,periodOrYear,previous=null,changedSites=null){
  const {buckets,dirty}=overviewBuckets(world,cells,periodOrYear,changedSites,{normals:false});
  return overviewFromBuckets(buckets,dirty,previous);
}

export function setOverviewDetails(group,details){
  const hidden=new Map(details.map(d=>[d.site.id,new Set(d.indices)]));
  for(const mesh of group.children){const ranges=mesh.userData.houseRanges;if(!ranges)continue;const attr=mesh.geometry.attributes.position,original=mesh.userData.originalPositions;let changed=false;
    for(const range of ranges){const hide=hidden.get(range.id)?.has(range.index)||false;if(hide===!!range.hidden)continue;range.hidden=hide;changed=true;
      if(hide)attr.array.fill(0,range.start,range.end);else attr.array.set(original.subarray(range.start,range.end),range.start);}
    if(changed)attr.needsUpdate=true;
  }
}
