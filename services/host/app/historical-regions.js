// Symbolic neighborhood layouts, not reconstructed street plans or city extents.
export function settlementStyle(event){
  if(event.visualActions?.cityStyle)return event.visualActions.cityStyle;
  if(event.id.includes('busan'))return 'port';
  if(event.id.includes('ganghwa')||event.id.includes('ungjin'))return 'fortified';
  return event.id.includes('capital')||event.id.includes('wolseong')?'capital':'town';
}
export function settlementLayout(event){
  const style=settlementStyle(event),rows=[];
  const add=(archetype,x,z,scale=1,extra={})=>rows.push({archetype,x,z,scale,...extra});
  add(event.year>=1876?'civic_hall':'palace',0,-18,1.05,{primary:true});
  if(event.compact)return rows;
  const wards=style==='capital'?[[ -34,-28],[32,-28],[-34,0],[32,0],[-34,28],[32,28]]
    :style==='port'?[[-30,-30],[0,-36],[30,-30],[-30,0],[30,0]]:[[-27,-26],[27,-26],[-27,6],[27,6]];
  for(const [ward,[cx,cz]] of wards.entries())for(let i=0;i<9;i++){
    const x=cx+(i%3-1)*7,z=cz+(Math.floor(i/3)-1)*7;
    add(i%5===0?'courtyard_house':i%3===0?'rural_store':'house',x,z,.42+(i%3)*.045,{ward,path:i===4});
  }
  for(let i=0;i<6;i++)add('market',-15+i*6,17,.48,{ward:'market'});
  add('handcart',12,24,.65);add('grain_stack',-12,25,.65);
  for(let i=0;i<12;i++)add('human',-19+(i%6)*7,8+Math.floor(i/6)*17,.85,{action:i%3?'walking':'working'});
  for(const [cx,cz] of [[-27,49],[27,49]]){
    for(let i=0;i<4;i++)add('farmhouse',cx+(i%2)*7,cz+Math.floor(i/2)*7,.45,{ward:'hamlet'});
    add('grain_stack',cx+4,cz-5,.5);
  }
  if(style==='capital'||style==='fortified'){
    add('gatehouse',0,37,.85);
    for(const x of [-45,-30,-15,15,30,45])add('wall',x,37,.7);
    if(style==='fortified')for(const x of [-43,43])for(const z of [-30,-15,0,15])add('fort_wall_side',x,z,.7);
  }
  return rows;
}
export const SETTLEMENT_RADIUS=72;

export function describeSettlements(scenes){
  return scenes.map(scene=>scene.kind!=='settlement'?scene:{...scene,place:{...scene.place,
    settlement:{scope:scene.id.includes('capital')||scene.id.includes('wolseong')?'capital-role':'documented-activity',
      startYear:scene.startYear,endYear:scene.endYear,claimIds:[...scene.dateClaimIds,...scene.actionClaimIds]}}});
}
