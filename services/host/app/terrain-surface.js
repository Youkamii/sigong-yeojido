// Sample the actual rendered triangles so small scenery does not sink below them.
export function terrainSurface(position,fallback){
  const cells=new Map(),size=16,cache=new Map();
  for(let i=0;i<position.count;i+=3){
    const a=[position.getX(i),position.getY(i),position.getZ(i)],b=[position.getX(i+1),position.getY(i+1),position.getZ(i+1)],c=[position.getX(i+2),position.getY(i+2),position.getZ(i+2)];
    const d=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);if(Math.abs(d)<1e-12)continue;
    const triangle={a,b,c,d};
    for(let x=Math.floor(Math.min(a[0],b[0],c[0])/size);x<=Math.floor(Math.max(a[0],b[0],c[0])/size);x++)
      for(let z=Math.floor(Math.min(a[2],b[2],c[2])/size);z<=Math.floor(Math.max(a[2],b[2],c[2])/size);z++){
        const key=x+':'+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(triangle);
      }
  }
  return (x,z)=>{
    const key=x.toFixed(4)+':'+z.toFixed(4);if(cache.has(key))return cache.get(key);
    let height=-Infinity;
    for(const {a,b,c,d} of cells.get(Math.floor(x/size)+':'+Math.floor(z/size))||[]){
      const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/d,v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/d;
      if(u>=-1e-7&&v>=-1e-7&&u+v<=1+1e-7)height=Math.max(height,u*a[1]+v*b[1]+(1-u-v)*c[1]);
    }
    if(!Number.isFinite(height))height=fallback(x,z);cache.set(key,height);return height;
  };
}
