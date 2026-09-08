// The active plan already requires the selected year's activity and source evidence.
// A coordinate registry alone does not establish a place's historical name or period.
export function activityGeography(plan){
  const regions=new Map();
  for(const event of plan?.events||[]){
    const place=event.scenePlace||event.locationReference;
    if(!place||place.placementType==='context-region')continue;
    const coordinates=place.coordinates||(place.candidate?[place.candidate.lon,place.candidate.lat]:null);
    if(!coordinates?.every(Number.isFinite)||!place.label)continue;
    const key=place.label+':'+coordinates.map(n=>n.toFixed(5)).join(':');
    if(!regions.has(key))regions.set(key,{id:'activity-place:'+key,label:place.label,lon:coordinates[0],lat:coordinates[1],
      precision:place.precision,coordinateNote:place.coordinateNote,sourceIds:place.coordinateSourceIds||[],
      year:plan.year,activities:[]});
    regions.get(key).activities.push({id:event.entityId,label:event.label});
  }
  return [...regions.values()];
}
