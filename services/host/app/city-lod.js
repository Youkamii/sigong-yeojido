import * as THREE from 'three';

// Two instanced meshes retain neighborhood footprints when individual roofs are distant.
export function createCityLOD(batch,anchors,rows,detail){
  const primary=rows.find(row=>row.kind==='event'),center=primary.position.clone();
  const buildings=batch.filter(recipe=>!rows.find(row=>row.id===recipe.id)?.action);
  const group=new THREE.Group();group.name='city-distant';
  const base=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'#b6a17a',roughness:1}),buildings.length);
  const roofs=new THREE.InstancedMesh(new THREE.ConeGeometry(1,1,4),new THREE.MeshStandardMaterial({color:'#696852',roughness:1}),buildings.length);
  const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion();
  buildings.forEach((recipe,i)=>{
    const point=anchors.get(recipe.anchor),s=recipe.scale;
    matrix.compose(point.clone().add(new THREE.Vector3(0,s,0)),rotation,new THREE.Vector3(s*4,s*2,s*3));base.setMatrixAt(i,matrix);
    matrix.compose(point.clone().add(new THREE.Vector3(0,s*2.5,0)),rotation,new THREE.Vector3(s*3,s,s*2.5));roofs.setMatrixAt(i,matrix);
  });
  group.add(base,roofs);
  const lod={group,center,near:true,distance:Math.max(20,primary.focusDistance*2.8),update(camera){
    this.near=camera.position.distanceTo(center)<this.distance;detail.group.visible=this.near;group.visible=!this.near;
  }};
  for(const pick of detail.picks){
    const raycast=pick.raycast;
    pick.raycast=function(raycaster,hits){if(lod.near||this.userData.fanAssetId===primary.id)raycast.call(this,raycaster,hits);};
  }
  return lod;
}
