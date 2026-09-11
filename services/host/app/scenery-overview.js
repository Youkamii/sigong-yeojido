import * as THREE from 'three';

// The distant landscape is built directly, never cloned from detailed assets.
export function sceneryOverview(world,cells,period){
  const buckets=new Map();
  const get=(site,kind)=>{const key=Math.floor(site.x/480)+':'+Math.floor(site.z/480)+':'+kind;
    if(!buckets.has(key))buckets.set(key,{positions:[],colors:[],kind,ranges:[]});return buckets.get(key);};
  const point=(site,x,z)=>{const c=Math.cos(site.angle),s=Math.sin(site.angle);return [site.x+x*c+z*s,site.z-x*s+z*c];};
  const triangle=(b,a,c,d,color)=>{b.positions.push(...a,...c,...d);for(let i=0;i<3;i++)b.colors.push(color.r,color.g,color.b);};
  const quad=(b,p,color)=>{triangle(b,p[0],p[2],p[1],color);triangle(b,p[0],p[3],p[2],color);};
  const earth=new THREE.Color('#aa9570'),walls=new THREE.Color('#aa9773');
  const crops=['#819258','#9a9d64','#b1a26a','#87915b','#939868','#a99b78'].map(c=>new THREE.Color(c));
  for(const cell of cells){
    const {site,layout}=cell,houses=get(site,'houses'),fields=get(site,'fields'),lanes=get(site,'lanes');
    for(const [index,h] of layout.houses.entries()){
      const start=houses.positions.length;
      const [x,z]=point(site,h.x,h.z),angle=site.angle+(h.angle||0),c=Math.cos(angle),s=Math.sin(angle),scale=h.scale;
      const corner=(dx,dz,y)=>[x+dx*c+dz*s,y,z-dx*s+dz*c];
      const footprint=[[-1.2,-.95],[1.2,-.95],[1.2,.95],[-1.2,.95]].map(([dx,dz])=>corner(dx*scale,dz*scale,0));
      const y=Math.max(...footprint.map(p=>world.surfaceAt(p[0],p[2])))+.08,height=(period.housing==='early'?.35:.85)*scale;
      const base=footprint.map(p=>[p[0],y,p[2]]),top=base.map(p=>[p[0],y+height,p[2]]);
      quad(houses,base.map(p=>[x+(p[0]-x)*1.2,y-.015,z+(p[2]-z)*1.2]),earth);
      for(let j=0;j<4;j++)quad(houses,[base[j],base[(j+1)%4],top[(j+1)%4],top[j]],walls);
      const modern=site.latitude<37.7&&period.housing==='modern'&&(index+site.seed)%5!==0;
      const roof=new THREE.Color(period.housing==='early'?'#79613e':modern?['#65888b','#977868','#81877f'][index%3]:index%(period.year<918?9:5)===0?'#666d68':index%3===0?'#79613e':'#887049');
      if(modern)quad(houses,top,roof);
      else {const a=corner(-1.2*scale,0,y+height+.6*scale),b=corner(1.2*scale,0,y+height+.6*scale);
        quad(houses,[top[0],top[1],b,a],roof);quad(houses,[a,b,top[2],top[3]],roof);
        triangle(houses,top[0],a,top[3],walls);triangle(houses,top[1],top[2],b,walls);}
      houses.ranges.push({id:site.id,index,start,end:houses.positions.length});
    }
    if(period.fields)for(const field of layout.fields){
      const p=field.corners.map(([x,z])=>point(site,x,z));
      const ground=p.map(([x,z])=>[x,world.surfaceAt(x,z)+.11,z]);quad(fields,ground,earth);
      const center=p.reduce((a,v)=>[a[0]+v[0]/4,a[1]+v[1]/4],[0,0]);
      quad(fields,p.map(([x,z])=>{x=center[0]+(x-center[0])*.9;z=center[1]+(z-center[1])*.9;return [x,world.surfaceAt(x,z)+.13,z];}),crops[field.color%crops.length]);
      const blend=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
      for(const t of [.3,.6])quad(fields,[blend(p[0],p[3],t),blend(p[1],p[2],t),blend(p[1],p[2],t+.025),blend(p[0],p[3],t+.025)].map(([x,z])=>[x,world.surfaceAt(x,z)+.15,z]),earth);
    }
    for(const road of layout.roads)for(let j=1;j<road.points.length;j++){
      const a=point(site,...road.points[j-1]),b=point(site,...road.points[j]),dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz)||1,nx=-dz/len*road.width/2,nz=dx/len*road.width/2;
      quad(lanes,[[a[0]-nx,a[1]-nz],[b[0]-nx,b[1]-nz],[b[0]+nx,b[1]+nz],[a[0]+nx,a[1]+nz]].map(([x,z])=>[x,world.surfaceAt(x,z)+.14,z]),earth);
    }
  }
  const group=new THREE.Group();group.name='scenery-overview';
  for(const b of buckets.values())if(b.positions.length){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(b.positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(b.colors,3));geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}));mesh.name=b.kind==='lanes'?'scenery-lanes':b.kind==='fields'?'decorative-fields':'settlement-roofs';mesh.receiveShadow=false;mesh.castShadow=false;
    if(b.ranges.length){mesh.userData.houseRanges=b.ranges;mesh.userData.originalPositions=geometry.attributes.position.array.slice();}group.add(mesh);}
  return group;
}

export function setOverviewDetails(group,details){
  const hidden=new Map(details.map(d=>[d.site.id,new Set(d.indices)]));
  for(const mesh of group.children){const ranges=mesh.userData.houseRanges;if(!ranges)continue;const attr=mesh.geometry.attributes.position,original=mesh.userData.originalPositions;let changed=false;
    for(const range of ranges){const hide=hidden.get(range.id)?.has(range.index)||false;if(hide===!!range.hidden)continue;range.hidden=hide;changed=true;
      if(hide)attr.array.fill(0,range.start,range.end);else attr.array.set(original.subarray(range.start,range.end),range.start);}
    if(changed)attr.needsUpdate=true;
  }
}


