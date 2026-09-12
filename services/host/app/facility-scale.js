import {insideCoastline} from './coastline-index.js';

// 실제 건물 크기가 아닌 표시 상한. 가장 넓은 링을 본토로 보고 섬은 동서 폭에 맞춘다.
export function facilityDisplayScale(scale,position,world){
  const rings=world?.rings||[];
  let mainland,largestArea=-1;
  for(const ring of rings){
    const area=Math.abs(ring.reduce((sum,p,i)=>{
      const next=ring[(i+1)%ring.length];return sum+p[0]*next[1]-next[0]*p[1];
    },0));
    if(area>largestArea){mainland=ring;largestArea=area;}
  }
  const ring=rings.find(r=>insideCoastline(position.x,position.z,r));
  if(ring&&ring!==mainland){
    const minX=ring.bounds?.minX??Math.min(...ring.map(p=>p[0]));
    const maxX=ring.bounds?.maxX??Math.max(...ring.map(p=>p[0]));
    scale=Math.min(scale,(maxX-minX)/160);
  }
  return Math.min(scale,.7);
}
