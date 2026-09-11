const polygonsOf=feature=>feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
export const territoriesAt=(features,year)=>features.filter(f=>f.properties.validFrom<=year&&year<=f.properties.validTo
  &&f.properties.sourceRecord.Name!=='Byeonhan'
  &&!(f.properties.sourceRecord.Name==='Goguryeo'&&year>668));
export const visibleTerritories=(features,year,{origin='all',sources=null}={})=>
  origin==='human'||sources?.size===0?[]:territoriesAt(features,year);
export const territoryName=feature=>feature.properties.label.split(' · ')[0];
const area=ring=>Math.abs(ring.reduce((sum,p,i)=>{const q=ring[(i+1)%ring.length];return sum+p[0]*q[1]-q[0]*p[1];},0))/2;
function inRing(x,y,ring){
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const a=ring[i],b=ring[j];
    if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
export const inPolygon=(x,y,polygon)=>inRing(x,y,polygon[0])&&!polygon.slice(1).some(r=>inRing(x,y,r));
function clearance(x,y,polygon){
  let distance=Infinity;
  for(const ring of polygon)for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const a=ring[j],b=ring[i],dx=b[0]-a[0],dy=b[1]-a[1];
    const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));
    distance=Math.min(distance,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy));
  }
  return distance;
}
// Choose the largest connected polygon, never a centroid between separate islands.
export function territoryAnchor(feature,toWorld=(x,y)=>[x,y],onLand=()=>true){
  const polygons=polygonsOf(feature).map(p=>p.map(r=>r.map(c=>toWorld(...c))));
  const polygon=polygons.sort((a,b)=>(area(b[0])-b.slice(1).reduce((s,r)=>s+area(r),0))-(area(a[0])-a.slice(1).reduce((s,r)=>s+area(r),0)))[0];
  if(!polygon?.[0]?.length)return null;
  const xs=polygon[0].map(p=>p[0]),ys=polygon[0].map(p=>p[1]);
  let left=Math.min(...xs),top=Math.min(...ys),width=Math.max(...xs)-left,height=Math.max(...ys)-top,best=null;
  if(!width||!height)return null;
  for(let pass=0;pass<4;pass++){
    const dx=width/32,dy=height/32;
    for(let i=0;i<32;i++)for(let j=0;j<32;j++){
      const x=left+(i+.5)*dx,y=top+(j+.5)*dy;
      if(!inPolygon(x,y,polygon)||!onLand(x,y))continue;
      const distance=clearance(x,y,polygon);
      if(!best||distance>best.clearance)best={x,z:y,clearance:distance,polygon};
    }
    if(!best)break;
    left=best.x-dx;top=best.z-dy;width=dx*2;height=dy*2;
  }
  return best;
}
