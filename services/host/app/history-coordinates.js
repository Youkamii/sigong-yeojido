import {DIORAMA_BOUNDS} from './place-state.js';

const radians=value=>value*Math.PI/180;
const mercator=lat=>Math.log(Math.tan(Math.PI/4+radians(lat)/2));
const b=DIORAMA_BOUNDS;
const centerX=(radians(b.lon0)+radians(b.lon1))/2;
const centerY=(mercator(b.lat0)+mercator(b.lat1))/2;
const scale=200/Math.max(radians(b.lon1-b.lon0),mercator(b.lat1)-mercator(b.lat0));

export function projectCoordinates(lon,lat,mapScale=1){
  return [(radians(lon)-centerX)*scale*mapScale,-(mercator(lat)-centerY)*scale*mapScale];
}

export function unprojectCoordinates(x,z,mapScale=1){
  return [(x/(scale*mapScale)+centerX)*180/Math.PI,
    (2*Math.atan(Math.exp(centerY-z/(scale*mapScale)))-Math.PI/2)*180/Math.PI];
}

export function latitudeCoordinates(lat,west=b.lon0,east=b.lon1,step=.025){
  const count=Math.ceil((east-west)/step);
  return Array.from({length:count+1},(_,i)=>[west+(east-west)*i/count,lat]);
}

export function formatCoordinates(coordinates){
  if(!coordinates?.every(Number.isFinite))return '';
  const [lon,lat]=coordinates;
  return `${Math.abs(lat).toFixed(5)}°${lat<0?'S':'N'} · ${Math.abs(lon).toFixed(5)}°${lon<0?'W':'E'}`;
}

export function coordinateRegistry(anchors,supplement={}){
  const existing=anchors.places.flatMap(place=>(place.candidates||[]).map((candidate,i)=>({
    id:place.id+':'+i,label:place.labelKo||place.label,aliases:[],anchorPlaceIds:[place.id],entityIds:[place.id],
    lon:candidate.lon,lat:candidate.lat,precision:'area',sourceIds:[candidate.fromSource],
    coordinateNote:candidate.basis,displayReference:true})));
  return {places:[...(supplement.places||[]),...existing],sources:supplement.sources||[]};
}

export function regionalCoordinate(registry,id,label){
  const rows=registry?.places||[];
  const exact=rows.filter(p=>p.id===id||p.entityIds?.includes(id)||p.anchorPlaceIds?.includes(id));
  const matches=exact.length?exact:rows.filter(p=>p.label===label||p.aliases?.includes(label));
  // A collected identity link takes priority over the older display references.
  const collected=matches.filter(p=>!p.displayReference);
  const candidates=collected.length?collected:matches;
  const points=[...new Map(candidates.filter(p=>Number.isFinite(p.lon)&&Number.isFinite(p.lat))
    .map(p=>[p.lon.toFixed(5)+':'+p.lat.toFixed(5),p])).values()];
  return points.length===1?points[0]:null;
}
