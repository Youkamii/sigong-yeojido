export const DIORAMA_BOUNDS = {lon0:123, lon1:132, lat0:33, lat1:43.5};

export function inDiorama(candidate){
  const b = DIORAMA_BOUNDS;
  return candidate.lon >= b.lon0 && candidate.lon <= b.lon1 && candidate.lat >= b.lat0 && candidate.lat <= b.lat1;
}

export function outsideCandidates(places, year, sources, origin = 'all'){
  return places.filter(p => activeAt(p, year, sources, origin)).flatMap(place =>
    (place.candidates || []).filter(c => candActive(c, year) && originMatches(c, origin, place) && !inDiorama(c))
      .map(candidate => ({place, candidate})));
}

export function originMatches(record, origin = 'all', parent = null){
  return origin === 'all' || (record.origin ?? parent?.origin) === origin;
}

export function candActive(candidate, year){
  return year >= (candidate.validFrom ?? -9999) && year <= (candidate.validTo ?? 9999);
}

export function activeAt(place, year, sources = null, origin = 'all'){
  if(!candActive(place, year)) return false;
  if(place.candidates?.length){
    if(!place.candidates.some(c => candActive(c, year) && originMatches(c, origin, place))) return false;
  }else if(!originMatches(place, origin)) return false;
  if(sources === null) return true;
  if(sources.size === 0) return false;
  if(place.sourceId && !sources.has(place.sourceId)) return false;
  const mentionedBy = Object.keys(place.mentions || {});
  return !mentionedBy.length || mentionedBy.some(id => sources.has(id));
}
