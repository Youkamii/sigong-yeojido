import * as THREE from 'three';
import {sitePeriod,sceneryHouseRecipe} from './scenery-period.js';
import {sceneryHouseForm} from './scenery-house-form.js';

const bucketFor=site=>Math.floor(site.x/480)+':'+Math.floor(site.z/480);

// The distant landscape is built directly, never cloned from detailed assets.
export function sceneryOverview(world,cells,periodOrYear,previous=null,changedSites=null){
  const buckets=new Map();
  const dirty=changedSites&&new Set(changedSites.map(bucketFor));
  const get=(site,kind)=>{const key=bucketFor(site)+':'+kind;
    if(!buckets.has(key))buckets.set(key,{positions:[],colors:[],kind,bucket:bucketFor(site),ranges:[]});return buckets.get(key);};
  const point=(site,x,z)=>{const c=Math.cos(site.angle),s=Math.sin(site.angle);return [site.x+x*c+z*s,site.z-x*s+z*c];};
  const triangle=(b,a,c,d,color)=>{b.positions.push(...a,...c,...d);for(let i=0;i<3;i++)b.colors.push(color.r,color.g,color.b);};
  const quad=(b,p,color)=>{triangle(b,p[0],p[2],p[1],color);triangle(b,p[0],p[3],p[2],color);};
  const earth=new THREE.Color('#aa9570'),walls=new THREE.Color('#aa9773');
  const crops=['#819258','#9a9d64','#b1a26a','#87915b','#939868','#a99b78'].map(c=>new THREE.Color(c));
  for(const cell of cells){
    if(dirty&&!dirty.has(bucketFor(cell.site)))continue;
    const period=cell.period??(typeof periodOrYear==='number'?sitePeriod(cell.site,periodOrYear):periodOrYear);
    const {site,layout}=cell,houses=get(site,'houses'),fields=get(site,'fields'),lanes=get(site,'lanes');
    for(const [index,h] of layout.houses.entries()){
      const start=houses.positions.length;
      const [x,z]=point(site,h.x,h.z),angle=site.angle+(h.angle||0),c=Math.cos(angle),s=Math.sin(angle),scale=h.scale;
      const corner=(dx,dz,y)=>[x+dx*c+dz*s,y,z-dx*s+dz*c];
      const form=h.type?null:sceneryHouseForm(sceneryHouseRecipe(h,period,site,index).archetype);
      const hw=h.width?h.width/2:form.width*scale/2,hd=h.depth?h.depth/2:form.depth*scale/2;
      const footprint=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([dx,dz])=>corner(dx,dz,0));
      const y=Math.max(...footprint.map(p=>world.surfaceAt(p[0],p[2])))+.08,height=h.height??form.eave*scale;
      const wallColor=h.color?new THREE.Color(h.color):walls;
      const base=footprint.map(p=>[p[0],y,p[2]]),top=base.map(p=>[p[0],y+height,p[2]]);
      const roof=new THREE.Color(h.type?'#697977':form.color);
      if(form?.roof==='cone'){
        const ring=Array.from({length:6},(_,j)=>{const a=j*Math.PI/3+Math.PI/12;return corner(Math.cos(a)*hw,Math.sin(a)*hd,y+height);});
        const apex=corner(0,0,y+height+form.rise*scale);
        for(let j=0;j<6;j++){const a=ring[j],b=ring[(j+1)%6];
          quad(houses,[[a[0],y,a[2]],[b[0],y,b[2]],b,a],wallColor);triangle(houses,a,b,apex,roof);}
      }else{
        quad(houses,base.map(p=>[x+(p[0]-x)*1.2,y-.015,z+(p[2]-z)*1.2]),earth);
        for(let j=0;j<4;j++)quad(houses,[base[j],base[(j+1)%4],top[(j+1)%4],top[j]],wallColor);
        if(h.type||form.roof==='flat')quad(houses,top,roof);
        else {const a=corner(-hw,0,y+height+form.rise*scale),b=corner(hw,0,y+height+form.rise*scale);
          quad(houses,[top[0],top[1],b,a],roof);quad(houses,[a,b,top[2],top[3]],roof);
          triangle(houses,top[0],a,top[3],walls);triangle(houses,top[1],top[2],b,walls);}
      }
      houses.ranges.push({id:site.id,index,start,end:houses.positions.length,roof:form?.roof||'flat'});
    }
    for(const space of layout.spaces||[]){
      const p=[[-space.width/2,-space.depth/2],[space.width/2,-space.depth/2],[space.width/2,space.depth/2],[-space.width/2,space.depth/2]];
      quad(fields,p.map(([x,z])=>point(site,x+space.x,z+space.z)).map(([x,z])=>[x,world.surfaceAt(x,z)+.12,z]),new THREE.Color(space.type==='park'?'#719369':'#b8b2a2'));
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
      quad(lanes,[[a[0]-nx,a[1]-nz],[b[0]-nx,b[1]-nz],[b[0]+nx,b[1]+nz],[a[0]+nx,a[1]+nz]].map(([x,z])=>[x,world.surfaceAt(x,z)+.14,z]),road.paved?new THREE.Color('#7b8280'):earth);
    }
  }
  const group=new THREE.Group();group.name='scenery-overview';
  if(previous&&dirty)for(const mesh of [...previous.children])if(!dirty.has(mesh.userData.bucket))group.add(mesh);
  for(const b of buckets.values())if(b.positions.length){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(b.positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(b.colors,3));geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}));mesh.name=b.kind==='lanes'?'scenery-lanes':b.kind==='fields'?'decorative-fields':'settlement-roofs';mesh.receiveShadow=false;mesh.castShadow=false;
    mesh.userData.bucket=b.bucket;
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


