// 원을 걸치는 모든 칸에 등록해 경계와 큰 반경도 빠뜨리지 않는다.
// 조회는 가까운 후보에 기존 거리식을 그대로 적용한다(표본화하지 않는다).
export function occupancyGrid(occupied,{cellSize=16,margin=0}={}){
  const cells=new Map();
  for(const circle of occupied){
    for(let x=Math.floor((circle.x-circle.radius)/cellSize);x<=Math.floor((circle.x+circle.radius)/cellSize);x++)
      for(let z=Math.floor((circle.z-circle.radius)/cellSize);z<=Math.floor((circle.z+circle.radius)/cellSize);z++){
        const key=x+':'+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(circle);
      }
  }
  return (x,z,radius=0)=>{
    for(let cx=Math.floor((x-radius-margin)/cellSize);cx<=Math.floor((x+radius+margin)/cellSize);cx++)
      for(let cz=Math.floor((z-radius-margin)/cellSize);cz<=Math.floor((z+radius+margin)/cellSize);cz++)
        for(const circle of cells.get(cx+':'+cz)||[])
          if(!(Math.hypot(x-circle.x,z-circle.z)>radius+circle.radius+margin))return false;
    return true;
  };
}
