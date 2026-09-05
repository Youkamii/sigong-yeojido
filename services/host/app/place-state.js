export function candActive(candidate, year){
  return year >= (candidate.validFrom ?? -9999) && year <= (candidate.validTo ?? 9999);
}

export function activeAt(place, year, sources = null){
  if(!candActive(place, year)) return false;
  if(place.candidates?.length && !place.candidates.some(c => candActive(c, year))) return false;
  if(sources === null) return true;
  if(sources.size === 0) return false;
  const mentionedBy = Object.keys(place.mentions || {});
  return !mentionedBy.length || mentionedBy.some(id => sources.has(id));
}
