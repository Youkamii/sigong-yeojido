import {insideCoastline,coastlineDistance} from './coastline-index.js';

const seedFor=text=>{let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
const randomFor=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const settings={village:{radius:12,houses:28,fields:10},town:{radius:19,houses:76,fields:15},regional:{radius:28,houses:180,fields:22}};

// These anonymous regions describe scenery composition, not historical populations.
export function planSettlementSites(world){
  const candidates=[],b=world.bounds;
  for(let gx=Math.ceil(b.minX/24);gx*24<b.maxX;gx++)for(let gz=Math.ceil(b.minZ/24);gz*24<b.maxZ;gz++){
    const id=`settlement-region:${gx}:${gz}`,seed=seedFor(id),r=randomFor(seed);
    const x=gx*24+(r()-.5)*14,z=gz*24+(r()-.5)*14;
    const ring=world.rings.find(ring=>insideCoastline(x,z,ring));if(!ring)continue;
    const y=world.surfaceAt(x,z);if(!Number.isFinite(y)||y>(world.seaLevel??7)+13)continue;
    const regionalSeed=seedFor(`${Math.floor(x/120)}:${Math.floor(z/120)}`);
    // Broad fertile belts get several neighboring villages; quieter belts stay open.
    if(seed%100>(regionalSeed%5===0?48:94))continue;
    let kind=seed%19===0?'regional':seed%5===0?'town':'village';
    let radius=settings[kind].radius;
    const fits=size=>{
      if(coastlineDistance(x,z,ring,size+1)<size+1)return false;
      const samples=[];
      for(let dx=-size;dx<=size;dx+=size/2)for(let dz=-size;dz<=size;dz+=size/2){
        if(dx*dx+dz*dz>size*size)continue;
        const h=world.surfaceAt(x+dx,z+dz);if(!Number.isFinite(h))return false;
        samples.push(h);
      }
      return Math.max(...samples)-Math.min(...samples)<Math.min(3.6,size*.15);
    };
    if(!fits(radius)){kind='village';radius=settings[kind].radius;if(!fits(radius))continue;}
    const angle=r()*Math.PI*2,latitude=world.coordinatesAt(x,z)[1];
    candidates.push({id,x,z,latitude,seed,kind,radius,angle,scale:1,layout:seed%4});
  }
  // Larger centers claim space first, without a global cap biasing any latitude.
  candidates.sort((a,b)=>b.radius-a.radius||a.seed-b.seed);
  const sites=[];
  for(const site of candidates)if(sites.every(other=>Math.hypot(site.x-other.x,site.z-other.z)>site.radius+other.radius+2))sites.push(site);
  return sites.sort((a,b)=>a.id.localeCompare(b.id));
}

export function settlementLayout(site,periodOrYear){
  const year=typeof periodOrYear==='number'?periodOrYear:periodOrYear?.year??1960;
  const density=year< -1500?.16:year<1?.28:year<918?.45:year<1392?.6:year<1876?.78:year<1945?.9:1;
  const fieldsVisible=typeof periodOrYear==='object'?periodOrYear.fields!==false:year>=-1500;
  const config=settings[site.kind]||settings.village,r=randomFor(site.seed),houses=[],fields=[],roads=[];
  const core=site.radius*.57,spacing=site.kind==='regional'?2.0:site.kind==='town'?2.15:2.4;
  const bend=(z)=>Math.sin(z/(core||1)*2+site.layout)*core*.16;
  const lots=[];
  for(let row=-Math.floor(core/spacing);row<=Math.floor(core/spacing);row++)for(let col=-Math.floor(core/spacing);col<=Math.floor(core/spacing);col++){
    const z=row*spacing+(r()-.5)*.45,x=col*spacing+(row%2)*.5+(r()-.5)*.45+bend(z);
    if(Math.hypot(x,z)>core||Math.abs(x-bend(z))<.85)continue;
    lots.push({x,z,scale:.42+r()*.23,angle:site.layout===2?(r()-.5)*.65:(row%2)*Math.PI/2+(r()-.5)*.18,archetype:r()<.2?'korean_house':'rural_cottage',rank:Math.hypot(x,z)+r()*core*.35});
  }
  lots.sort((a,b)=>a.rank-b.rank);
  for(const lot of lots.slice(0,Math.max(3,Math.floor(config.houses*density)))){const {rank,...house}=lot;houses.push(house);}
  const spine=Array.from({length:9},(_,i)=>{const z=(i/8*2-1)*site.radius*.9;return [bend(z),z];});
  roads.push({points:spine,width:site.kind==='regional'?.8:.55});
  for(let i=0;i<3;i++){
    const z=(i-1)*core*.55;
    roads.push({points:[[-core*.95,z-.6],[bend(z),z],[core*.95,z+.9]],width:.35});
  }
  if(fieldsVisible)for(let i=0;i<config.fields;i++){
    const angle=i/config.fields*Math.PI*2+(r()-.5)*.1;
    const half=Math.PI/config.fields*(.7+r()*.15),inner=core+1+r()*.7,outer=site.radius*(.88+r()*.1);
    const corners=[[inner,angle-half],[outer,angle-half*.93],[outer*(.94+r()*.05),angle+half],[inner*(.94+r()*.08),angle+half*.91]].map(([radius,a])=>[Math.cos(a)*radius,Math.sin(a)*radius]);
    fields.push({corners,color:Math.floor(r()*4)});
  }
  return {houses,fields,roads,density};
}
