// Symbolic neighborhood layouts, not reconstructed street plans or city extents.
export function settlementStyle(event){
  if(event.visualActions?.cityStyle)return event.visualActions.cityStyle;
  if(event.id.includes('busan'))return 'port';
  if(event.id.includes('ganghwa')||event.id.includes('ungjin'))return 'fortified';
  return event.id.includes('capital')||event.id.includes('wolseong')?'capital':'town';
}
export function settlementLayout(event){
  if(event.year>=1876&&!event.compact)return urbanSettlementLayout(event);
  const style=settlementStyle(event),rows=[];
  const add=(archetype,x,z,scale=1,extra={})=>rows.push({archetype,x,z,scale,...extra});
  add(event.year>=1876?'civic_hall':'palace',0,-32,.68,{primary:true});
  if(event.compact)return rows;
  const centers=[[-27,-22],[26,-20],[-28,-2],[27,0],[-27,23],[-9,25],[10,24],[29,24],[-9,-10],[9,-11],[-9,11],[9,12]];
  const wards=style==='capital'?centers:style==='port'?centers.filter((_,i)=>![0,8,9].includes(i)):style==='fortified'?centers.slice(0,10):centers.slice(4);
  for(const [ward,[cx,cz]] of wards.entries())for(let i=0;i<9;i++){
    const x=cx+(i%3-1)*4.5+(ward%3-1)*.5,z=cz+(Math.floor(i/3)-1)*4.5;
    add(i%5===0?'courtyard_house':i%3===0?'rural_store':'house',x,z,.56+(i%3)*.045,{ward});
  }
  for(let i=0;i<6;i++)add('market',-12+i*4.8,1,.55,{ward:'market'});
  add('handcart',15,4,.65);add('grain_stack',-15,4,.65);
  for(let i=0;i<12;i++)add('human',-14+(i%6)*5,5+Math.floor(i/6)*32,.85,{action:i%3?'walking':'working'});
  for(const [cx,cz] of [[-27,49],[27,49]]){
    for(let i=0;i<4;i++)add('farmhouse',cx+(i%2)*7,cz+Math.floor(i/2)*7,.45,{ward:'hamlet'});
    add('grain_stack',cx+4,cz-5,.5);
  }
  if(style==='capital'||style==='fortified'){
    add('gatehouse',0,42,.7);
    for(const x of [-42,-35,-28,-21,-14,14,21,28,35,42])add('wall',x,42,.7);
    if(style==='fortified')for(const x of [-43,43])for(const z of [-30,-15,0,15])add('fort_wall_side',x,z,.7);
  }
  return rows;
}

function urbanSettlementLayout(event){
  const rows=[],style=settlementStyle(event),postwar=event.year>=1945,modern=event.year>=1970,continuing=Boolean(event.continuing);
  const add=(archetype,x,z,scale=.7,extra={})=>rows.push({archetype,x,z,scale,...extra});
  add('urban_civic',0,-28,continuing?.8:.95,{primary:true,ward:'civic'});
  // Unequal blocks leave a central street, small squares and a transport edge.
  const wards=[[-30,-24],[-29,0],[-29,26],[-7,27],[16,27],[32,6],[28,-19],[-8,-8],[13,-9]];
  for(const [ward,[cx,cz]] of (continuing?wards.slice(0,6):wards).entries()){
    const residential=ward<5,apartments=!continuing&&modern&&residential&&ward%2===0;
    const count=apartments?4:ward%2?6:5;
    for(let i=0;i<count;i++){
      const archetype=apartments?'urban_apartment':residential
        ?(!postwar&&i%3===0?'courtyard_house':'urban_lowrise'):'urban_commercial';
      add(archetype,cx+(i%2)*7-3,cz+Math.floor(i/2)*7-6,apartments?.68:.7,{ward});
    }
  }
  if(!continuing)add('urban_transit',22,44,.9,{ward:'transit'});
  if(style==='port')for(let i=0;i<(continuing?2:4);i++)add('urban_warehouse',-26+i*9,48,.8,{ward:'harbor'});
  else if(!continuing){add('urban_commercial',-26,46,.9,{ward:'market'});add('urban_lowrise',-12,46,.8,{ward:'old-town'});}
  if(!postwar){add('market',-8,6,.7);add('handcart',-12,10,.6);}
  else for(const [x,z] of [[-17,7],[18,20],[7,43]].slice(0,continuing?1:3))add('car',x,z,.6);
  for(let i=0;i<(continuing?7:14);i++)add('human',-13+(i%7)*4,5+Math.floor(i/7)*31,.85,{action:'walking'});
  return rows;
}
export const SETTLEMENT_RADIUS=72;

export function describeSettlements(scenes,corrections=[]){
  const corrected=scenes.flatMap(scene=>{
    const correction=corrections.find(row=>row.sceneId===scene.id);if(!correction)return [scene];
    return correction.periods.map((period,index)=>({...scene,
      id:index===correction.periods.length-1?scene.id:scene.id+':role:'+period.startYear,
      startYear:period.startYear,endYear:period.endYear,roleCorrection:true,
      title:period.label+(period.capital?' · 조선 수도':' · 기록 사이 도시 배경'),
      summary:period.capital?`${period.label}의 수도 역할을 ${period.startYear}~${period.endYear}년 구간으로 표시합니다. 도시의 전체 존속 기간을 뜻하지 않으며, 건물 배치는 익명 생활을 보여주는 추정 배경입니다.`:'1399년 개경 천도와 1405년 한양 천도 사이에는 수도로 표시하지 않습니다. 도시는 기록 사이를 잇는 추정 생활 배경으로 남깁니다.',
      actionClaimIds:[...scene.actionClaimIds,...correction.claimIds],
      participants:period.capital?scene.participants:scene.participants.map(person=>({...person,role:'기록상 관련 국가 또는 인물'})),
      place:{...scene.place,label:period.label,settlement:{scope:period.capital?'capital-role':'between-records'}}}));
  });
  return corrected.map(scene=>scene.kind!=='settlement'?scene:{...scene,place:{...scene.place,
    settlement:{scope:scene.place?.settlement?.scope||(scene.id.includes('capital')||scene.id.includes('wolseong')?'capital-role':'documented-activity'),
      startYear:scene.startYear,endYear:scene.endYear,claimIds:[...scene.dateClaimIds,...scene.actionClaimIds]}}});
}
