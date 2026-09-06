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
