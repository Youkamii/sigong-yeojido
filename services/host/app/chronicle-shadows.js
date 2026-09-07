import * as THREE from 'three';

function clip(polygon,axis,bound,greater){
  const output=[];
  for(let i=0;i<polygon.length;i++){
    const a=polygon[i],b=polygon[(i+1)%polygon.length];
    const insideA=greater?a[axis]>=bound:a[axis]<=bound;
    const insideB=greater?b[axis]>=bound:b[axis]<=bound;
    if(insideA)output.push(a);
    if(insideA!==insideB)output.push(a.clone().lerp(b,(bound-a[axis])/(b[axis]-a[axis])));
  }
  return output;
}

// Fit the visible ground and its casters in sunlight coordinates, including depth.
export function fitChronicleShadows(camera,light,direction,bounds,height){
  camera.updateMatrixWorld();
  const points=[];
  for(const y of [0,height]){
    let polygon=[];
    for(const [x,z] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
      const near=new THREE.Vector3(x,z,-1).unproject(camera),far=new THREE.Vector3(x,z,1).unproject(camera);
      const ray=far.sub(near);
      if(Math.abs(ray.y)<1e-6)return null;
      polygon.push(near.addScaledVector(ray,(y-near.y)/ray.y));
    }
    for(const [axis,bound,greater] of [['x',bounds.minX-40,true],['x',bounds.maxX+40,false],
      ['z',bounds.minZ-40,true],['z',bounds.maxZ+40,false]])polygon=clip(polygon,axis,bound,greater);
    points.push(...polygon);
  }
  if(!points.length)return null;
  const rotation=new THREE.Matrix4().lookAt(direction,new THREE.Vector3(),new THREE.Vector3(0,1,0));
  const inverse=rotation.clone().invert();
  const box=new THREE.Box3().setFromPoints(points.map(p=>p.clone().applyMatrix4(inverse))).expandByScalar(32);
  const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
  const width=Math.ceil(Math.max(32,size.x)/4)*4,span=Math.ceil(Math.max(32,size.y)/4)*4;
  const stepX=width/light.shadow.mapSize.x,stepY=span/light.shadow.mapSize.y;
  center.x=Math.round(center.x/stepX)*stepX;center.y=Math.round(center.y/stepY)*stepY;
  center.applyMatrix4(rotation);
  const distance=size.z/2+100;
  light.target.position.copy(center);light.position.copy(center).addScaledVector(direction,distance);
  const shadow=light.shadow.camera;
  shadow.left=-width/2;shadow.right=width/2;shadow.bottom=-span/2;shadow.top=span/2;
  shadow.near=1;shadow.far=size.z+200;shadow.updateProjectionMatrix();
  light.shadow.normalBias=.12;light.shadow.bias=-.00003;
  light.target.updateMatrixWorld();light.updateMatrixWorld();
  light.shadow.updateMatrices(light);
  return {width,height:span,depth:shadow.far,points:points.map(p=>p.toArray())};
}
