export const DIORAMA_BOUNDS = {lon0:123, lon1:132, lat0:33, lat1:43.5};

export function inDiorama(candidate){
  const b = DIORAMA_BOUNDS;
  return candidate.lon >= b.lon0 && candidate.lon <= b.lon1 && candidate.lat >= b.lat0 && candidate.lat <= b.lat1;
}

export function outsideCandidates(places, year, sources, origin = 'all'){
  return places.filter(p => activeAt(p, year, sources, origin)).flatMap(place =>
    (place.candidates || []).filter(c => candActive(c, year, place) && originMatches(c, origin, place) && sourceMatches(c, place, sources) && !inDiorama(c))
      .map(candidate => ({place, candidate})));
}

export function originMatches(record, origin = 'all', parent = null){
  return origin === 'all' || (record.origin ?? parent?.origin) === origin;
}

export function lensStrength(candidate, place, primary = null){
  if(!primary?.size)return 1;
  const source=candidate.fromSource||candidate.sourceId||place?.sourceId;
  if(source)return primary.has(source)?1:0.32;
  return Object.keys(place?.mentions||{}).some(id=>primary.has(id))?1:0.32;
}

export function candActive(candidate, year, parent=null){
  const from='validFrom' in candidate?candidate.validFrom:parent?.validFrom;
  const to='validTo' in candidate?candidate.validTo:parent?.validTo;
  return year >= (from ?? -9999) && year <= (to ?? 9999);
}

export function sourceMatches(candidate, place, sources=null){
  if(sources===null)return true;
  if(sources.size===0)return false;
  if(candidate.requiredSources?.length)return candidate.requiredSources.every(s=>sources.has(s));
  const source=candidate.fromSource||candidate.sourceId||place?.sourceId;
  if(source)return sources.has(source);
  const mentionedBy=Object.keys(place?.mentions||{});
  return !mentionedBy.length||mentionedBy.some(id=>sources.has(id));
}

export function activeAt(place, year, sources = null, origin = 'all'){
  if(place.candidates?.length){
    return place.candidates.some(c => candActive(c, year, place) && originMatches(c, origin, place) && sourceMatches(c,place,sources));
  }
  return candActive(place,year)&&originMatches(place,origin)&&sourceMatches({},place,sources);
}
