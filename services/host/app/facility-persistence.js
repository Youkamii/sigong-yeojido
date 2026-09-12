const END_YEAR=2100;
const destruction=/소실|철거|파괴|훼철|폐사|붕괴/;
const coordinates=place=>Number.isFinite(place?.lon)&&Number.isFinite(place?.lat);

// 건립 동사 앞 명사구를 이름으로 쓰고, 없으면 장소 이름을 쓴다.
// 괄호 설명을 뺀 이름의 단어 중 하나라도 후속 제목/요약에 있고 좌표 거리가
// 0.01도 이내면 같은 시설로 추정한다(황룡사 구층목탑 → 황룡사 소실).
// 별칭·이전·부분 소실을 판별하지 못하며, 일반 명사나 넓은 장소명은 오인할 수 있다.
// construction 분류를 그대로 따르므로 건립 이외의 공사 기록도 포함될 수 있다.
function facilityName(scene){
  return scene.title?.match(/^(.+?)\s*(?:건립|준공|축조|착공|창건|조성|개통|완공)/)?.[1].trim()||scene.place.label;
}

export function planContinuingFacilities(packets,plan,claims){
  const rows=[];
  for(const scene of packets){
    if(scene.kind!=='construction'||!coordinates(scene.place)||!Number.isFinite(scene.endYear))continue;
    const sinceYear=scene.endYear+1;
    if(plan.year<sinceYear||plan.year>END_YEAR||plan.events.some(event=>event.id===scene.id))continue;
    const name=facilityName(scene);
    const tokens=name.replace(/\([^)]*\)/g,' ').split(/[\s·—~()[\]]+/).filter(Boolean);
    const ending=packets.filter(other=>other.id!==scene.id&&other.startYear>scene.endYear
      &&coordinates(other.place)&&Math.hypot(other.place.lon-scene.place.lon,other.place.lat-scene.place.lat)<=.01
      &&(other.kind==='fire'||destruction.test(other.title||''))
      &&tokens.some(token=>[other.title,other.summary].join(' ').includes(token)))
      .sort((a,b)=>a.startYear-b.startYear||a.id.localeCompare(b.id))[0];
    const untilYear=ending?ending.startYear-1:END_YEAR;
    if(plan.year>untilYear)continue;
    const claimIds=[...new Set([...(scene.dateClaimIds||[]),...(scene.actionClaimIds||[]),...(scene.place.claimIds||[])])];
    if(claims&&!claimIds.every(id=>claims.has(id)))continue;
    const id='background-facility-'+scene.id;
    rows.push({...scene,id,entityId:id,kind:'event',year:plan.year,archetype:scene.archetype||scene.kind,
      label:name+' · 시설(추정 존속)',setting:true,detail:'건립 기록 뒤 존속 추정',
      summary:(scene.summary?scene.summary+'\n':'')+'건립 기록을 근거로 시설이 남아 있다고 추정한 배경이며 이후 변형·훼손 기록은 반영하지 않았다.',
      continuing:{kind:'facility',sinceYear,untilYear,openEnded:!ending,basis:'건립 기록 뒤 존속 추정',endedBy:ending?.id||null},
      siteBackground:{scope:'facility',sourceSceneId:scene.id,recordedStartYear:scene.startYear,recordedEndYear:scene.endYear,episodes:[]},
      scenePlace:{...scene.place,coordinates:scene.place.displayCoordinates||[scene.place.lon,scene.place.lat],displayBasis:'시설 · 추정 존속'},
      claimIds,sites:[],locationReference:null,participants:[],participantGroups:[],sides:[]});
  }
  return rows;
}
