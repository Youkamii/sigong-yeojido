import {projectCoordinates} from './history-coordinates.js';
import {insideCoastline} from './coastline-index.js';

// Contextual neighborhoods around collected city coordinates, not surveyed streets,
// population estimates, or historical municipal boundaries. Evidence: history-coordinates.json
// and docs/research/era-world-169/reviews/06-modern-review.md.
export const URBAN_REGIONS=Object.freeze([
  {id:'seoul',lon:126.99,lat:37.56,radius:20,startYear:1945,growthYear:1970},
  {id:'gangnam',lon:127.04,lat:37.50,radius:15,startYear:1970,growthYear:1980},
  {id:'busan',lon:129.075,lat:35.18,radius:22,startYear:1945,growthYear:1970,industry:'harbor'},
  {id:'incheon',lon:126.64861111111,lat:37.463888888889,radius:19,startYear:1945,growthYear:1970,industry:'harbor'},
  {id:'daegu',lon:128.60166666666666,lat:35.87166666666667,radius:19,startYear:1945,growthYear:1970},
  {id:'daejeon',lon:127.385,lat:36.35,radius:17,startYear:1945,growthYear:1980},
  {id:'gwangju',lon:126.91666666667,lat:35.166666666667,radius:16,startYear:1945,growthYear:1980},
  {id:'pohang',lon:129.365,lat:36.02,radius:15,startYear:1945,growthYear:1970,industry:'steel',industryYear:1973},
  {id:'ulsan',lon:129.31666666667,lat:35.55,radius:18,startYear:1945,growthYear:1970,industry:'industrial',industryYear:1970},
  {id:'pyongyang',lon:125.7475,lat:39.016666666666666,radius:22,startYear:1945,growthYear:1970,north:true},
  {id:'hamhung',lon:127.53333333333,lat:39.916666666667,radius:16,startYear:1945,growthYear:1970,north:true,industry:'industrial',industryYear:1970},
  {id:'jeju',lon:126.52194444444,lat:33.509722222222,radius:9,startYear:1955,growthYear:1980,industry:'harbor',lowSkyline:true},
].map(Object.freeze));

export function urbanRegionAt(lon,lat,year){
  const [x,z]=projectCoordinates(lon,lat,8);
  let nearest=null,nearestDistance=Infinity;
  for(const region of URBAN_REGIONS){
    if(!(year>=region.startYear))continue;
    const [px,pz]=projectCoordinates(region.lon,region.lat,8),distance=Math.hypot(x-px,z-pz);
    if(distance<region.radius&&(distance<nearestDistance||distance===nearestDistance&&region.id<nearest.id)){
      nearest=region;nearestDistance=distance;
    }
  }
  return nearest;
}

export function planUrbanSites(world){
  return URBAN_REGIONS.map((profile,i)=>{
    const [x,z]=world.toWorld?world.toWorld(profile.lon,profile.lat):projectCoordinates(profile.lon,profile.lat,world.mapScale??8);
    return {id:'urban-region:'+profile.id,x,z,latitude:profile.lat,seed:1709+i*113,kind:'urban',profile,radius:profile.radius,angle:0,scale:1};
  }).filter(s=>world.rings.some(r=>insideCoastline(s.x,s.z,r)));
}

export function urbanLayout(site,periodOrYear){
  const year=typeof periodOrYear==='number'?periodOrYear:periodOrYear.year,p=site.profile;
  if(year<p.startYear)return {houses:[],fields:[],roads:[],spaces:[],density:0};
  const mature=year>=1980,developing=year>=1970,grown=year>=p.growthYear;
  const radius=site.radius*(grown?1:.68),houses=[],roads=[],spaces=[];
  const step=3.6,extent=Math.floor(radius/step),heightLimit=p.lowSkyline?3.6:8;
  for(let row=-extent;row<=extent;row++)for(let col=-extent;col<=extent;col++){
    const x=col*step,z=row*step;
    if(Math.hypot(x,z)>radius-1.5)continue;
    const n=Math.abs((row+19)*137+(col+23)*71+site.seed),central=Math.abs(col)<=1;
    if(col===0&&row===0){spaces.push({x,z,width:2.8,depth:2.8,type:'square'});continue;}
    if(n%17===0){spaces.push({x,z,width:2.6,depth:2.6,type:'park'});continue;}
    let type='lowrise',width=1.6,depth=1.8,height=.8+(n%3)*.35,color='#bbb7a6';
    if(p.industry&&year>=(p.industryYear??1945)&&col>=extent-2){type=p.industry==='harbor'?'warehouse':'industrial';width=2.6;depth=2.3;height=1.2+(n%2)*.5;color='#919f9f';}
    else if(n%19===0){type='civic';width=2.4;depth=2.2;height=1.35;color='#d0c7b1';}
    else if(developing&&n%4===0){type='apartment';width=2.5;depth=1.25;height=Math.min(heightLimit,mature?3.6+n%4:2.3+n%2*.4);color=p.north?'#c6bdab':'#c4c8c5';}
    else if(central&&n%3!==0){type='commercial';width=1.8;depth=2;height=Math.min(heightLimit,mature?3+n%6:developing?1.8+n%3*.5:1.4);color=mature&&!p.north?'#7e999f':'#b8ae9c';}
    houses.push({x,z,scale:1,angle:0,width,depth,height,color,type,archetype:'urban_'+type});
  }
  // Avenues run between the parcels, with cross streets and a central square.
  for(let i=-extent;i<extent;i++){
    const offset=(i+.5)*step,len=Math.sqrt(Math.max(0,radius*radius-offset*offset));
    roads.push({points:[[offset,-len],[offset,len]],width:i===0?.8:.45,paved:true});
    roads.push({points:[[-len,offset],[len,offset]],width:i===0?.8:.45,paved:true});
  }
  return {houses,fields:[],roads,spaces,density:grown?1:.68};
}
