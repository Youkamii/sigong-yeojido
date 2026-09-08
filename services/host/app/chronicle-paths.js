import * as THREE from 'three';

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
        for(const p of points){const key=Math.floor(p.x/8)+':'+Math.floor(p.z/8);if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push({p,route});}
      }
    }
  }
  sync(available,occupied){
    for(const route of this.routes)route.active=available(route.a)&&available(route.b)&&route.points.every(p=>occupied.every(o=>Math.hypot(p.x-o.x,p.z-o.z)>o.radius+1));
    const key=this.routes.map(r=>r.active?'1':'0').join('');if(key===this.key)return;this.key=key;
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.routes.filter(r=>r.active).flatMap(r=>r.positions),3));g.computeVertexNormals();
    this.mesh.geometry.dispose();this.mesh.geometry=g;
  }
  near(x,z,margin){
    const cx=Math.floor(x/8),cz=Math.floor(z/8);
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const {p,route} of this.cells.get((cx+dx)+':'+(cz+dz))||[])
      if(route.active&&Math.hypot(p.x-x,p.z-z)<margin+.75)return true;
    return false;
  }
}
