import {settlementStyle} from './historical-regions.js';
import {urbanRegionAt} from './urban-regions.js';

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

// A former name or administrative role ending does not remove the anonymous town.
// Every dated settlement record continues as an anonymous town after its recorded end year;
// the record's end marks a name, role or archive boundary, not the disappearance of the city.
// Capital and fortified roles end with the record, so the continuation is drawn as a plain town.
const continuingStyle=scene=>settlementStyle(scene)==='port'?'port':'town';
const samePlace=(a,b)=>Math.hypot(a.lon-b.lon,a.lat-b.lat)<.03;
// A modern urban profile takes over the spot unless the record itself covers the profile's start
// (the record is then the documented basis of that modern city and its continuation keeps it).
const yieldsToUrban=(scene,urban)=>Boolean(urban)&&!(scene.startYear<=urban.startYear&&urban.startYear<=scene.endYear);
export function planContinuingCities(packets,plan,claims,settlementZones=[]){
  const activeZones=settlementZones.filter(zone=>zone.startYear<=plan.year&&plan.year<=zone.endYear);
  const ended=[];
  for(const scene of packets){
    if(scene.kind!=='settlement'||!Number.isFinite(scene.endYear)||plan.year<=scene.endYear)continue;
    const place=scene.place;
    if(!Number.isFinite(place?.lon)||!Number.isFinite(place?.lat))continue;
    const claimIds=[...new Set([...scene.dateClaimIds,...scene.actionClaimIds,...place.claimIds])];
    if(claims&&!claimIds.every(id=>claims.has(id)))continue;
    if(plan.events.some(event=>event.archetype==='settlement'&&event.scenePlace
      &&Math.hypot(event.scenePlace.coordinates[0]-place.lon,event.scenePlace.coordinates[1]-place.lat)<.03))continue;
    if(yieldsToUrban(scene,urbanRegionAt(place.lon,place.lat,plan.year)))continue;
    if(activeZones.some(zone=>samePlace(zone,place)))continue;
    ended.push({scene,place,claimIds});
  }
  // Several ended records at one spot leave a single continuation: the latest recorded end.
  const later=(a,b)=>a.scene.endYear>b.scene.endYear||(a.scene.endYear===b.scene.endYear&&a.scene.id<b.scene.id);
  const chosen=ended.filter(row=>!ended.some(other=>other!==row&&samePlace(other.place,row.place)&&later(other,row)));
  return chosen.map(({scene,place,claimIds})=>{
    const label='이름 없는 도시 생활 배경',id='background-city-'+scene.id;
    return {id,entityId:id,kind:'event',year:plan.year,label,archetype:'settlement',
      setting:true,detail:'과거 도시 기록의 위치를 잇는 추정 배경 · 기록 종료 뒤 존속',
      summary:'이 위치의 도시 기록을 바탕으로 이름 없는 생활 배경을 이어서 보여줍니다. 이전 도시 명칭과 행정 지위, 사건과 인물의 기간을 연장한 것이 아닙니다. 현재 건물과 거리 배치는 복원도가 아닙니다.\n규모는 축소 표현',
      claimIds,siteBackground:{scope:'anonymous-city',sourceSceneId:scene.id,
        recordedStartYear:scene.startYear,recordedEndYear:scene.endYear,episodes:[]},
      continuing:{sinceYear:scene.endYear+1,basis:'기록 종료 뒤 존속 추정',sourceSceneId:scene.id},
      scenePlace:{...place,label,settlement:{scope:'anonymous-city'},coordinates:[place.lon,place.lat],displayScale:0.5,
        displayBasis:'수집된 과거 도시 위치에 이어지는 이름 없는 추정 생활 배경 · 추정(기록 종료 뒤 존속)'},
      visualActions:{cityStyle:continuingStyle(scene)},
      sites:[],effects:{},sides:[],participants:[]};
  });
}
