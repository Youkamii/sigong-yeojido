const CELL=24;

export function indexCoastline(ring){
  const bands=new Map(),cells=new Map(),segments=[];
  const add=(map,key,segment)=>{if(!map.has(key))map.set(key,[]);map.get(key).push(segment);};
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const a=ring[i],b=ring[j],segment={a,b,dx:b[0]-a[0],dz:b[1]-a[1]};
    segment.length2=segment.dx**2+segment.dz**2;
    segments.push(segment);
    const x0=Math.floor(Math.min(a[0],b[0])/CELL),x1=Math.floor(Math.max(a[0],b[0])/CELL);
    const z0=Math.floor(Math.min(a[1],b[1])/CELL),z1=Math.floor(Math.max(a[1],b[1])/CELL);
    for(let z=z0;z<=z1;z++){
      add(bands,z,segment);
      for(let x=x0;x<=x1;x++)add(cells,x+':'+z,segment);
    }
  }
  ring.coastline={bands,cells,segments};
  return ring;
}

export function insideCoastline(x,z,ring){
  const bounds=ring.bounds;
  if(bounds&&(x<bounds.minX||x>bounds.maxX||z<bounds.minZ||z>bounds.maxZ))return false;
  let result=false;
  if(!ring.coastline)indexCoastline(ring);
  for(const {a,b} of ring.coastline.bands.get(Math.floor(z/CELL))||[])
    if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])result=!result;
  return result;
}

// Callers only need distance up to their shore margin or height blend radius.
export function coastlineDistance(x,z,ring,limit=Infinity){
  if(!ring.coastline)indexCoastline(ring);
  let candidates=ring.coastline.segments;
  if(Number.isFinite(limit)){
    const found=new Set();
    for(let ix=Math.floor((x-limit)/CELL);ix<=Math.floor((x+limit)/CELL);ix++)
      for(let iz=Math.floor((z-limit)/CELL);iz<=Math.floor((z+limit)/CELL);iz++)
        for(const segment of ring.coastline.cells.get(ix+':'+iz)||[])found.add(segment);
    candidates=found;
  }
  let best=limit*limit;
  for(const {a,dx,dz,length2} of candidates){
    const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(length2||1)));
    best=Math.min(best,(x-a[0]-t*dx)**2+(z-a[1]-t*dz)**2);
  }
  return best===limit*limit?limit:Math.sqrt(best);
}
