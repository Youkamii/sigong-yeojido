import * as THREE from 'three';

export function pathSegmentClear(a,b,occupied){
  const dx=b.x-a.x,dz=b.z-a.z,length2=dx*dx+dz*dz;
  return occupied.every(o=>{
    const t=length2?Math.max(0,Math.min(1,((o.x-a.x)*dx+(o.z-a.z)*dz)/length2)):0;
    return Math.hypot(a.x+dx*t-o.x,a.z+dz*t-o.z)>o.radius+.3;
  });
}

// Unnamed footpaths join decorative villages; these are not surveyed historical roads.
export class CountrysidePaths{
  constructor(world,sites){
    this.world=world;this.routes=[];this.cells=new Map();
    this.mesh=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshStandardMaterial({color:'#a18b62',roughness:1,side:THREE.DoubleSide}));
    this.mesh.name='scenery-lanes';this.mesh.receiveShadow=true;
    const seen=new Set();
    for(const a of sites){
      const nearby=sites.filter(b=>b!==a).map(b=>({b,d:Math.hypot(a.x-b.x,a.z-b.z)})).filter(p=>p.d<150).sort((p,q)=>p.d-q.d).slice(0,2);
      for(const {b,d} of nearby){
        const key=[a.id,b.id].sort().join('|');if(seen.has(key))continue;seen.add(key);
        const dx=b.x-a.x,dz=b.z-a.z,bend=((a.seed%100)/100-.5)*d*.22,points=[],steps=Math.ceil(d/1.5);
        for(let i=0;i<=steps;i++){
          const t=i/steps,curve=Math.sin(t*Math.PI)*bend,x=a.x+dx*t-dz/d*curve,z=a.z+dz*t+dx/d*curve;
          points.push({x,z,y:world.surfaceAt(x,z)});
        }
        if(points.some((p,i)=>!world.contains(p.x,p.z,1)||(i&&Math.abs(p.y-points[i-1].y)/Math.hypot(p.x-points[i-1].x,p.z-points[i-1].z)>.48)))continue;
        const positions=[];
        for(let i=1;i<points.length;i++){
          const p=points[i-1],q=points[i],dx=q.x-p.x,dz=q.z-p.z,length=Math.hypot(dx,dz),nx=-dz/length*.28,nz=dx/length*.28;
          const corners=[p,q].flatMap(p=>[-1,1].map(s=>[p.x+nx*s,world.surfaceAt(p.x+nx*s,p.z+nz*s)+.06,p.z+nz*s]));
          for(const k of [0,2,1,1,2,3])positions.push(...corners[k]);
        }
        const route={a,b,points,positions,active:false};this.routes.push(route);
        for(const [index,p] of points.entries()){const key=Math.floor(p.x/8)+':'+Math.floor(p.z/8);if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push({p,route,index});}
      }
    }
  }
  sync(available,occupied,urbanCores=[]){
    const obstacles=[...occupied.filter(o=>!o.urbanRegionId),...urbanCores];
    for(const route of this.routes){
      const enabled=available(route.a)&&available(route.b);
      route.segments=route.points.slice(1).map((p,i)=>enabled&&pathSegmentClear(route.points[i],p,obstacles));
      route.active=route.segments.some(Boolean);
    }
    const key=this.routes.map(r=>r.segments.map(v=>v?'1':'0').join('')).join('|');if(key===this.key)return;this.key=key;
    const positions=this.routes.flatMap(r=>r.segments.flatMap((active,i)=>active?r.positions.slice(i*18,(i+1)*18):[]));
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();
    this.mesh.geometry.dispose();this.mesh.geometry=g;
  }
  near(x,z,margin){
    const cx=Math.floor(x/8),cz=Math.floor(z/8);
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const {p,route,index} of this.cells.get((cx+dx)+':'+(cz+dz))||[])
      if((route.segments?.[index]||route.segments?.[index-1])&&Math.hypot(p.x-x,p.z-z)<margin+.75)return true;
    return false;
  }
}
