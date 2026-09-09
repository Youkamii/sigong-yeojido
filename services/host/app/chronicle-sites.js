// These packets describe continuing use of a place, rather than a recurring event.
const SETTINGS=new Set([
  'scene-syj122-byeokgolje-330-790','scene-syj122-nangnanggun-108bce-313',
  'scene-jl2-tongjeyeong-duryongpo-1603-1895','scene-jl2-bunwonri-1752-1883',
  'scene-jl2-jepo-waegwan-1423-1510','scene-jl2-yeompo-waegwan-1426-1512',
  'scene-mod-wonsan-haegwan-1883','scene-syj122-heunghwajin-995-1030',
  'scene-mod-wonsanhaksa-1883'
]);
export const isHistoricalSetting=scene=>scene.kind==='settlement'||SETTINGS.has(scene.id);

// These display intervals join dated records; they are not assertions of continuous occupation.
export function planHistoricalSites(data,packets,plan){
  const claims=new Map(data.claims.map(c=>[c.id,c])),entities=new Map(data.entities.map(e=>[e.id,e]));
  const sites=[];
  for(const entityId of ['syj135-place-samnyeonsanseong','syj135-place-myeonghwalsanseong']){
    const entity=entities.get(entityId);if(!entity)continue;
    const episodes=packets.filter(s=>s.researchCollection==='scenes-135'
      &&s.dateClaimIds.every(id=>claims.has(id))&&s.place?.claimIds.every(id=>claims.has(id))
      &&s.place.claimIds.some(id=>claims.get(id)?.object?.id===entityId)).sort((a,b)=>a.startYear-b.startYear);
    if(episodes.length<2)continue;
    const first=episodes[0],last=episodes.at(-1),year=plan.year;
    if(year<first.startYear||year>last.endYear||episodes.some(s=>plan.events.some(e=>e.id===s.id)))continue;
    const claimIds=[...new Set(episodes.flatMap(s=>[...s.dateClaimIds,...s.place.claimIds]))];
    const label=first.place.label.replace(/\s*\([^)]*\)/g,'');
    const summary=`${first.startYear}년부터 ${last.endYear}년까지 연결된 기록 사이에 성곽을 이어서 보여줍니다. 계속 같은 모습으로 쓰였다는 확정 기록은 아니며, 마지막 표시 연도가 폐성 연도를 뜻하지도 않습니다.`;
    sites.push({id:'background-'+entityId,entityId,kind:'event',year,label:'성곽 · '+label,
      archetype:'place',detail:'기록 사이를 잇는 추정 배경',summary,claimIds,
      siteBackground:{startYear:first.startYear,endYear:last.endYear,episodes:episodes.map(s=>({entityId:s.eventId,label:s.title}))},
      scenePlace:{...first.place,label,coordinates:[first.place.lon,first.place.lat],displayBasis:'기록 사이를 잇는 추정 배경입니다. 성의 실제 윤곽이나 건물 배치를 복원한 것은 아닙니다.'},
      visualActions:{fortress:true},sites:[],effects:{},sides:[],participants:[]});
  }
  return sites;
}
