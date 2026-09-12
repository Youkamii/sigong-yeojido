import {insideCoastline} from './coastline-index.js';

const END_YEAR=2100;
const DYNASTY_BOUNDARIES=[918,1392,1910,1945];
const destruction=/소실|철거|파괴|훼철|폐사|붕괴/;
const coordinates=place=>Number.isFinite(place?.lon)&&Number.isFinite(place?.lat);

// 건립 동사 앞 명사구를 이름으로 쓰고, 없으면 장소 이름을 쓴다.
// 괄호 설명을 뺀 이름의 단어 중 하나라도 후속 제목/요약에 있고 좌표 거리가
// 0.01도 이내면 같은 시설로 추정한다(황룡사 구층목탑 → 황룡사 소실).
// 별칭·이전·부분 소실을 판별하지 못하며, 일반 명사나 넓은 장소명은 오인할 수 있다.
// 전승 제목과 narrativeType이 있는 기록은 시설 존속의 근거에서 제외한다.
// facilityLook은 제목 → sceneFunction → summary → visualActions 순으로 정한다.
// temple: 사찰·절·가람·사원·사 이름의 창건/건립·탑·temple·pagoda.
// rail_station: 역·역사·철도·지하철·rail_station·station.
// palace: 궁궐·궁·전각·행궁·관아·객사·감영·청사·의사당·본영·병영·통제영·palace·government·office.
// industry: 1876년 이후 공장·제철소·공업단지·발전소·항만·부두·축항.
// 제외: 성벽·축성·도성·산성·성곽·읍성·돈대·진, 제방·저수지·준천·개천·수축·증축,
// 다리·교량·도로, 비석·비·기념비·정계비·표석, 능·묘·릉·사리 봉안, 서원·향교·학교.
// 이유: 조립기에 구별되는 외형이 없어 기와집으로 보임. 화면 표현 규칙이며 실제 소멸 주장이 아니다.
// 철거·해체·훼철·복원·이전·기념식·기공식·개통식 제목도 제외한다. 철도 개통식은 역으로 남긴다.
// 준공과 이전을 함께 기록한 행정 건물은 새 건물의 준공 근거로 남긴다.
// 외형을 정하지 못하면 행을 만들지 않는다. palace만 dynasty-boundary, 나머지는 openEnded다.
// 제목을 먼저 읽어 사찰의 전각, 궁궐 옆 철도 등 부속·주변 시설의 설명에 덜 흔들리게 한다.
// 조사·별칭·복합 시설과 부정문까지 해석하는 분류는 아니다.
// 소멸 패킷이 없으면 dynasty-boundary는 건립 종료 뒤 첫 왕조 경계 전년, openEnded는 2100년까지다.
// 경계는 실제 철거 연도가 아닌 추정의 한계다. 소멸 기록이 더 이르면 그 전년까지만 남긴다.
// 1945년 이후에는 다음 경계가 없어 두 유형 모두 2100년 상한이다. 영구 존속이나 현존 확인을 뜻하지 않는다.
// world가 있으면 실제 표시 좌표가 어느 해안선 링에도 속하지 않는 시설은 제외한다(좌표 이동 없음).
// 현재 지형 고도가 유한하지 않거나 (seaLevel??7)+0.3 이하이면 제외하며, 과거 지형은 복원하지 않는다.
// world 생략 호출은 기존처럼 좌표를 검사하지 않는다. 링은 현재 지도 기준이며 과거 해안선을 복원하지 않는다.
const temple=/사찰|가람|사원|절터|목탑|석탑|서탑|동탑|(?:^|\s)(?:절|탑)(?=[\s을를의에·—(]|$)|[가-힣]+사\s*(?:창건|건립)|\b(?:temple|pagoda)\b/i;
const rail=/철도|지하철|(?:^|\s)(?!지역|영역|권역|구역|교역|무역|부역|공역|사역|노역|징역|광역)[가-힣]*역(?=[\s을를의에·—(]|$)|(?:^|\s)[가-힣]*역사(?=\s*(?:건립|준공|개통|완공)|$)|\b(?:rail_station|station)\b/i;
const administrative=/궁궐|행궁|전각|관아|객사|감영|청사|의사당|본영|병영|통제영|궁(?=[\s·—(의을에]|$)|\b(?:palace|government|office)\b/i;
const industry=/공장|제철소|공업단지|발전소|항만|부두|축항/;
const excluded=/성벽|축성|도성|산성|성곽|읍성|돈대|鎭|제방|저수지|벽골제|청제|준천|개천|수축|증축|다리|교량|도로|비석|기념비|정계비|표석|사리\s*봉안|서원|향교|학교|(?:[가-힣]*)(?:비|능|묘|릉|진)(?=[\s·—(의을에]|$)|\b(?:fortress|fort|wall|reservoir|dam|bridge|road|stele|monument|school)\b/i;

function facilityLook(scene){
  // visualActions는 문자열 또는 객체다. false인 플래그와 숫자 연도는 분류 근거로 쓰지 않는다.
  const words=value=>typeof value==='string'?value:value&&typeof value==='object'
    ?Object.entries(value).flatMap(([key,v])=>v===true?[key]:[words(v)]).join(' '):'';
  const title=scene.title||'';
  if(/철거|해체|훼철|복원/.test(title))return null;
  if(/이전/.test(title)&&!(/준공/.test(title)&&administrative.test(title)))return null;
  if(/기념식|기공식|개통식/.test(title)&&!rail.test(title))return null;
  for(const text of [title,scene.sceneFunction,scene.summary,words(scene.visualActions)]){
    if(excluded.test(text||''))return null;
    if(administrative.test(text||''))return 'palace';
    if(rail.test(text||''))return 'rail_station';
    if(temple.test(text||''))return 'temple';
    if(industry.test(text||''))return scene.endYear>=1876?'industry':null;
  }
  return null;
}
function facilityName(scene){
  return scene.title?.match(/^(.+?)\s*(?:건립|준공|축조|착공|창건|조성|개통|완공|완성)/)?.[1].trim()||scene.place.label;
}

export function planContinuingFacilities(packets,plan,claims,world=null){
  const rows=[];
  for(const scene of packets){
    if(scene.kind!=='construction'||scene.narrativeType!=null||scene.title?.includes('전승')
      ||!coordinates(scene.place)||!Number.isFinite(scene.endYear))continue;
    const look=facilityLook(scene);
    if(!look)continue;
    const sinceYear=scene.endYear+1;
    if(plan.year<sinceYear||plan.year>END_YEAR||plan.events.some(event=>event.id===scene.id))continue;
    const displayCoordinates=scene.place.displayCoordinates||[scene.place.lon,scene.place.lat];
    if(world){
      const [x,z]=world.toWorld(...displayCoordinates);
      if(!Number.isFinite(x)||!Number.isFinite(z)||!world.rings.some(ring=>insideCoastline(x,z,ring)))continue;
      const y=world.surfaceAt(x,z);
      if(!Number.isFinite(y)||y<=(world.seaLevel??7)+.3)continue;
    }
    const name=facilityName(scene);
    const tokens=name.replace(/\([^)]*\)/g,' ').split(/[\s·—~()[\]]+/).filter(Boolean);
    const ending=packets.filter(other=>other.id!==scene.id&&other.startYear>scene.endYear
      &&coordinates(other.place)&&Math.hypot(other.place.lon-scene.place.lon,other.place.lat-scene.place.lat)<=.01
      &&(other.kind==='fire'||destruction.test(other.title||''))
      &&tokens.some(token=>[other.title,other.summary].join(' ').includes(token)))
      .sort((a,b)=>a.startYear-b.startYear||a.id.localeCompare(b.id))[0];
    const type=look==='palace'?'dynasty-boundary':'openEnded';
    const boundary=type==='dynasty-boundary'?DYNASTY_BOUNDARIES.find(year=>year>scene.endYear):undefined;
    const untilYear=Math.min(ending?ending.startYear-1:END_YEAR,boundary?boundary-1:END_YEAR);
    if(plan.year>untilYear)continue;
    const claimIds=[...new Set([...(scene.dateClaimIds||[]),...(scene.actionClaimIds||[]),...(scene.place.claimIds||[])])];
    if(claims&&!claimIds.every(id=>claims.has(id)))continue;
    const id='background-facility-'+scene.id;
    rows.push({...scene,id,entityId:id,kind:'event',year:plan.year,archetype:scene.archetype||scene.kind,
      facilityLook:look,...(['temple','rail_station'].includes(look)?{sceneFunction:look}:{}),
      label:name+' · 시설(추정 존속)',setting:true,detail:'건립 기록 뒤 존속 추정',
      summary:(scene.summary?scene.summary+'\n':'')+'건립 기록을 근거로 시설이 남아 있다고 추정한 배경이며 이후 변형·훼손 기록은 반영하지 않았다.',
      continuing:{kind:'facility',facilityLook:look,facilityType:type,sinceYear,untilYear,openEnded:!ending&&untilYear===END_YEAR,
        ...(boundary&&untilYear===boundary-1?{cappedBy:'dynasty-boundary'}:{}),
        basis:'건립 기록과 시설 유형에 따른 존속 추정',endedBy:ending?.id||null},
      siteBackground:{scope:'facility',sourceSceneId:scene.id,recordedStartYear:scene.startYear,recordedEndYear:scene.endYear,episodes:[]},
      scenePlace:{...scene.place,coordinates:displayCoordinates,displayBasis:'시설 · 추정 존속'},
      claimIds,sites:[],locationReference:null,participants:[],participantGroups:[],sides:[]});
  }
  return rows;
}
