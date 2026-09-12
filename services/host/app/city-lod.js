import * as THREE from 'three';
import {urbanBuildingDimensions} from './period-buildings.js';
import {gableRoof} from './landmarks.js';

// Instance bodies and roof families; urban silhouettes retain their near-model dimensions.
export function createCityLOD(batch,anchors,rows,detail){
  const primary=rows.find(row=>row.kind==='event'),center=primary.position.clone();
  const byId=new Map(rows.map(row=>[row.id,row]));
  const buildings=batch.filter(recipe=>!byId.get(recipe.id)?.action
    &&(primary.year<1876||/^(urban_|era_)/.test(recipe.archetype)));
  const group=new THREE.Group();group.name='city-distant';
  const roofGroups={flat:[],gable:[],traditional:[]};
  const base=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'#b6a17a',roughness:1}),buildings.length);
  base.name='city-distant-bodies';
  const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion();
  buildings.forEach((recipe,i)=>{
    const point=anchors.get(recipe.anchor),s=recipe.scale;
    const urban=/^urban_(transition|postwar|modern)_([a-z]+)_([0-2])$/.exec(recipe.archetype);
    if(urban){
      const [,stage,type,variant]=urban;
      const {width,depth,height}=urbanBuildingDimensions(type,stage==='modern'?2010:stage==='postwar'?1960:1930,Number(variant));
      // The catalog's default compact form applies humble (.92), then form scale.
      // Match assetforge's blueprint unit (1.35); recipe scale already includes city extent.
      const sx=s*1.35*.92*.78,sy=s*1.35*.92*.84,sz=sx;
      matrix.compose(point.clone().add(new THREE.Vector3(0,height*sy/2,0)),rotation,new THREE.Vector3(width*sx,height*sy,depth*sz));
      base.setMatrixAt(i,matrix);base.setColorAt(i,new THREE.Color(Number(variant)===1?'#aaa99c':'#c0bdb0'));
      const gable=stage==='transition'&&type==='lowrise';
      roofGroups[gable?'gable':'flat'].push({point:point.clone().add(new THREE.Vector3(0,(height+(gable?0:.11))*sy,0)),
        scale:new THREE.Vector3((width+(gable?.5:.25))*sx,(gable?1.1:.22)*sy,(depth+(gable?.5:.25))*sz)});
    }else{
      matrix.compose(point.clone().add(new THREE.Vector3(0,s,0)),rotation,new THREE.Vector3(s*4,s*2,s*3));base.setMatrixAt(i,matrix);
      base.setColorAt(i,new THREE.Color('#b6a17a'));
      roofGroups.traditional.push({point:point.clone().add(new THREE.Vector3(0,s*2.5,0)),scale:new THREE.Vector3(s*3,s,s*2.5)});
    }
  });
  base.computeBoundingSphere();group.add(base);
  for(const [type,instances] of Object.entries(roofGroups)){
    if(!instances.length)continue;
    const geometry=type==='flat'?new THREE.BoxGeometry(1,1,1):type==='gable'?gableRoof(1,1,1):new THREE.ConeGeometry(1,1,4);
    const roofs=new THREE.InstancedMesh(geometry,new THREE.MeshStandardMaterial({color:type==='flat'?'#646c6c':'#696852',roughness:1}),instances.length);
    roofs.name='city-distant-roofs-'+type;
    instances.forEach((instance,i)=>{matrix.compose(instance.point,rotation,instance.scale);roofs.setMatrixAt(i,matrix);});
    roofs.computeBoundingSphere();group.add(roofs);
  }
  const lod={group,center,near:true,distance:Math.max(20,primary.focusDistance*2.8),update(camera){
    this.near=camera.position.distanceTo(center)<this.distance;detail.group.visible=this.near;group.visible=!this.near;
  }};
  for(const pick of detail.picks){
    const raycast=pick.raycast;
    pick.raycast=function(raycaster,hits){if(lod.near||this.userData.fanAssetId===primary.id)raycast.call(this,raycaster,hits);};
  }
  return lod;
}
