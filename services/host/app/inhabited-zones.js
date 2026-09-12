import {regionalCoordinate} from './history-coordinates.js';

// These collected packets describe sustained work or residence, not a battle,
// excavation date, or an event's incidental crowd.
const LIVELIHOODS=new Set([
  'scene-syj122-byeokgolje-330-790',
  'scene-jl2-jepo-waegwan-1423-1510','scene-jl2-yeompo-waegwan-1426-1512',
  'scene-jl2-tongjeyeong-duryongpo-1603-1895','scene-jl2-bunwonri-1752-1883',
  'scene-mod-wonsan-haegwan-1883',
  'scene-syj103-hansando-gunyeong-1593-1597','scene-syj103-gohado-jujun-1597-1598',
]);
const unique=values=>[...new Set(values.filter(Boolean))];
const point=p=>p&&Number.isFinite(p.lon)&&Number.isFinite(p.lat)&&p.lon>=115&&p.lon<=146&&p.lat>=25&&p.lat<=49;
const bounded=(start,end)=>Number.isInteger(start)&&Number.isInteger(end)&&start!==0&&end!==0&&start<=end;
const distinct=rows=>[...new Map(rows.map(p=>[p.lon.toFixed(5)+':'+p.lat.toFixed(5),p])).values()];
const sources=p=>unique([...(p.sourceIds||[]),...(p.requiredSources||[]),p.fromSource,p.sourceId]);

function candidatePoint(place,start,end){
  const candidates=(place?.candidates||[]).filter(c=>point(c)&&c.claimId&&sources(c).length
    &&(c.validFrom==null||c.validFrom<=end)&&(c.validTo==null||c.validTo>=start));
  const institutional=candidates.filter(c=>c.grounded&&c.precision==='site-point-from-institution');
  const preferred=institutional.length?institutional:candidates.filter(c=>c.grounded);
  const points=distinct(preferred);
  return points.length===1?{...points[0],sourceIds:sources(points[0]),alternatives:candidates.length>preferred.length}:null;
}

function scenePoint(scene,registry,places){
  const p=scene.place;if(!p||p.medium==='sea')return null;
  const place=places.find(a=>a.id===p.anchorPlaceId);
  const precise=candidatePoint(place,scene.startYear,scene.endYear);
  if(precise)return precise;
  if(point(p)&&p.coordinateSourceIds?.length)return {...p,sourceIds:p.coordinateSourceIds};
  const recorded=(registry.places||[]).filter(r=>point(r)&&point(p)&&Math.abs(r.lon-p.lon)<.00001&&Math.abs(r.lat-p.lat)<.00001
    &&(r.anchorPlaceIds?.includes(p.anchorPlaceId)||r.entityIds?.includes(p.anchorPlaceId))&&sources(r).length);
  if(recorded.length)return {...p,sourceIds:unique(recorded.flatMap(sources))};
  const region=regionalCoordinate(registry,p.anchorPlaceId,p.label);
  if(point(region)&&region.sourceIds?.filter(Boolean).length)return region;
  return null;
}

/** Display zones supported by dated occupation/activity records; never a national density grid. */
export function buildSettlementZones(scenePackets=[],coordinateRegistry={},places=[]){
  const zones=[];
  for(const scene of scenePackets){
    if(scene.narrativeType||!bounded(scene.startYear,scene.endYear))continue;
    if(scene.kind!=='settlement'&&!LIVELIHOODS.has(scene.id))continue;
    // Connecting two records is explicitly an estimate, not occupation evidence.
    if(scene.place?.settlement?.scope==='between-records')continue;
    if(!scene.dateClaimIds?.length||!scene.actionClaimIds?.length||!scene.place?.claimIds?.length)continue;
    const coordinate=scenePoint(scene,coordinateRegistry,places);if(!coordinate)continue;
    const kind=scene.kind==='settlement'?'regional':'village';
    zones.push({id:'inhabited:'+scene.id,label:scene.place.label||scene.title,
      lon:coordinate.lon,lat:coordinate.lat,startYear:scene.startYear,endYear:scene.endYear,kind,
      localityType:kind==='regional'?'city':'village',radius:kind==='regional'?28:12,
      sourceIds:unique([...(scene.sourceIds||[]),...sources(coordinate)]),
      claimIds:unique([...scene.dateClaimIds,...scene.actionClaimIds,...scene.place.claimIds,coordinate.claimId]),
      contextType:'settlement',basis:[scene.summary,coordinate.coordinateNote||coordinate.basis,
        coordinate.alternatives?'다른 위치 후보도 있으며 기관의 유적 위치를 표시 기준으로 사용합니다.':'',
        '기록에 나온 활동 기간의 생활 배경입니다. 구역 크기와 집 수는 복원이 아니며 끝 연도는 도시가 사라진 해를 뜻하지 않습니다.'].filter(Boolean).join(' ')});
  }
  for(const place of places){
    if(!['capital','city','town','village'].includes(place.kind))continue;
    const intervals=(place.candidates||[]).filter(c=>c.grounded&&c.claimId&&sources(c).length&&bounded(c.validFrom,c.validTo));
    for(const candidate of intervals){
      const coordinate=candidatePoint(place,candidate.validFrom,candidate.validTo);
      if(!coordinate||coordinate.claimId!==candidate.claimId)continue;
      const kind=place.kind==='capital'||place.kind==='city'?'regional':place.kind;
      zones.push({id:'inhabited:'+place.id+':'+candidate.claimId,label:place.labelKo||place.label,
        lon:coordinate.lon,lat:coordinate.lat,startYear:candidate.validFrom,endYear:candidate.validTo,
        kind,localityType:kind==='regional'?'city':kind,radius:kind==='regional'?28:kind==='town'?19:12,
        sourceIds:sources(coordinate),claimIds:unique([candidate.claimId,candidate.coordinateClaimId]),contextType:'settlement',
        basis:[candidate.quote,candidate.basis,coordinate.alternatives?'다른 위치 후보가 있어 기관의 유적 위치를 표시 기준으로 사용합니다.':'',
          '수도·도시 기록의 기간을 사용한 생활 배경입니다. 구역 크기와 인구를 복원하거나 마지막 연도를 폐허가 된 해로 해석하지 않습니다.'].filter(Boolean).join(' ')});
    }
    // Existing researched city-name records can anchor anonymous living scenery.
    // Their coordinates may be regional rather than grounded archaeological points.
    if(intervals.length)continue;
    const candidates=(place.candidates||[]).filter(c=>point(c)&&Number.isInteger(c.validFrom??place.validFrom)
      &&c.sourceUrl&&c.basis&&(c.dateBasis||c.historySourceTitle)&&sources(c).length);
    if(distinct(candidates).length!==1)continue;
    const candidate=candidates[0],startYear=candidate.validFrom??place.validFrom,endYear=candidate.validTo??place.validTo??2100;
    if(!bounded(startYear,endYear))continue;
    const kind=place.kind==='capital'||place.kind==='city'?'regional':place.kind;
    zones.push({id:'inhabited:'+place.id,label:place.labelKo||place.label,lon:candidate.lon,lat:candidate.lat,
      startYear,endYear,kind,localityType:kind==='regional'?'city':kind,radius:kind==='regional'?28:kind==='town'?19:12,
      sourceIds:unique([...sources(candidate),...sources(place)]),claimIds:unique([candidate.claimId,candidate.coordinateClaimId]),
      sourceUrls:unique([candidate.sourceUrl,candidate.coordSourceUrl,...(place.references||[])]),
      contextType:'settlement',openEnded:candidate.validTo==null&&place.validTo==null,
      basis:[candidate.basis,candidate.dateBasis,place.note,
        '수집된 도시 이름·지역 기록을 기준으로 익명의 생활 배경을 표시합니다. 현대 지역 대표점이며 집 수와 도시 범위는 복원이 아닙니다.',
        candidate.validTo==null&&place.validTo==null?'종료 기록이 없어 표시 범위 끝까지 생활 배경을 유지합니다. 같은 이름이나 시가지가 계속되었다는 새 주장이 아닙니다.':'이름·행정 역할의 종료 연도는 도시가 사라진 해를 뜻하지 않습니다.'].filter(Boolean).join(' ')});
  }
  return [...new Map(zones.map(zone=>[zone.id,zone])).values()].sort((a,b)=>a.id.localeCompare(b.id));
}

export function settlementZoneKey(zones,year){
  return zones.filter(zone=>zone.startYear<=year&&year<=zone.endYear).map(zone=>zone.id).sort().join('|');
}
