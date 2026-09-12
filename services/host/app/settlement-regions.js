import {insideCoastline,coastlineDistance} from './coastline-index.js';
import {urbanLayout} from './urban-regions.js';

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
  if(site.kind==='urban')return urbanLayout(site,periodOrYear);
  const year=typeof periodOrYear==='number'?periodOrYear:periodOrYear?.year??1960;
  const density=year< -1500?.16:year<1?.28:year<918?.45:year<1392?.6:year<1876?.78:year<1945?.9:1;
  const fieldsVisible=typeof periodOrYear==='object'?periodOrYear.fields!==false:year>=-1500;
  const config=settings[site.kind]||settings.village,r=randomFor(site.seed),houses=[],fields=[],roads=[];
  const core=site.radius*.57,spacing=site.kind==='regional'?1.85:site.kind==='town'?2:2.15;
  const bend=(z)=>Math.sin(z/(core||1)*2+site.layout)*core*.16;
  const lots=[];
  for(let row=-Math.floor(core/spacing);row<=Math.floor(core/spacing);row++)for(let col=-Math.floor(core/spacing);col<=Math.floor(core/spacing);col++){
    let z=row*spacing+(r()-.5)*.4,x=col*spacing+(row%2)*.5+(r()-.5)*.4;
    if(Math.hypot(x,z)>core||Math.abs(x)<.85)continue;
    if(site.layout===0){x*=.72;z*=1.3;x+=bend(z);}
    else if(site.layout===1){
      // Three uneven pockets leave little commons between groups of homes.
      const pocket=(row+col+100)%3,a=r()*Math.PI*2,d=Math.sqrt(r())*core*.45;
      x=Math.cos(a)*d+[-.42,.38,.08][pocket]*core;
      z=Math.sin(a)*d+[-.25,-.2,.5][pocket]*core;
    }else if(site.layout===3){x*=1.22;z=z*.72+Math.sin(x/core*2)*.6;}
    else x+=bend(z)*.2;
    if(lots.some(p=>Math.hypot(p.x-x,p.z-z)<2.1))continue;
    lots.push({x,z,scale:.42+r()*.23,angle:site.layout===1?r()*Math.PI*2:site.layout===3?(r()-.5)*.12:(row%2)*Math.PI/2+(r()-.5)*.18,archetype:r()<.2?'korean_house':'rural_cottage',rank:Math.hypot(x,z)+r()*core*.35});
  }
  lots.sort((a,b)=>a.rank-b.rank);
  for(const lot of lots.slice(0,Math.max(3,Math.floor(config.houses*density)))){const {rank,...house}=lot;houses.push(house);}
  const spine=Array.from({length:9},(_,i)=>{const z=(i/8*2-1)*site.radius*.9;return site.layout===3?[z,bend(z)]:[bend(z),z];});
  roads.push({points:spine,width:site.kind==='regional'?.8:.55});
  for(let i=0;i<(site.layout===0?1:3);i++){
    const z=(i-1)*core*.55;
    const points=site.layout===1?[[0,0],[-core*.42,core*.3],[core*.08,core*.5]]:site.layout===3?[[-core*1.2,z],[0,z+.6],[core*1.2,z]]:[[-core*.95,z-.6],[bend(z),z],[core*.95,z+.9]];
    if(site.layout===1&&i>0)continue;
    roads.push({points,width:.35});
  }
  const plotBounds=[];
  if(fieldsVisible)for(let i=0;i<config.fields*60&&fields.length<config.fields;i++){
    const size=site.radius/12;
    let x=(r()*2-1)*site.radius*.85,z=(r()*2-1)*site.radius*.85;
    if(site.layout===0)x=(r()<.5?-1:1)*site.radius*(.45+r()*.32);
    if(site.layout===1&&z< -site.radius*.25)continue;
    if(site.layout===3)z=(r()<.3?-1:1)*site.radius*(.48+r()*.25);
    const hw=(1.2+r()*1.2)*size,hd=(site.layout===3?.65+r()*.5:1.05+r()*1.1)*size;
    const box={minX:x-hw,maxX:x+hw,minZ:z-hd,maxZ:z+hd};
    if(plotBounds.some(p=>box.minX<p.maxX+.35&&box.maxX>p.minX-.35&&box.minZ<p.maxZ+.35&&box.maxZ>p.minZ-.35))continue;
    if(lots.some(p=>p.x>box.minX-1.1&&p.x<box.maxX+1.1&&p.z>box.minZ-1.1&&p.z<box.maxZ+1.1))continue;
    const corners=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([dx,dz])=>[x+dx*(.86+r()*.14),z+dz*(.86+r()*.14)]);
    if(corners.some(p=>Math.hypot(...p)>site.radius*.98))continue;
    plotBounds.push(box);fields.push({corners,color:Math.floor(r()*4)});
  }
  return {houses,fields,roads,density};
}
