import {readFileSync} from 'node:fs';
import {register} from 'node:module';
import {pathToFileURL} from 'node:url';

const three=new URL('../services/host/vendor/three.module.min.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){return s==='three'?{url:${JSON.stringify(three)},shortCircuit:true}:n(s,c);}`),import.meta.url);
const {ChronicleWorld}=await import('../services/host/app/chronicle-world.js');
const {estimatedSitePasses}=await import('../services/host/app/settlement-regions.js');
const {ChronicleScenery}=await import('../services/host/app/chronicle-scenery.js');
const {sceneryPeriod}=await import('../services/host/app/scenery-period.js');
const {insideCoastline}=await import('../services/host/app/coastline-index.js');
const {coordinateRegistry}=await import('../services/host/app/history-coordinates.js');
const {describeSettlements}=await import('../services/host/app/historical-regions.js');
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));

export function createEstimatedWorld(outlineOnly=false){
  // Node has no canvas; only texture drawing is stubbed, terrain geometry is real.
  globalThis.document??={createElement:()=>({getContext:()=>new Proxy({getImageData:()=>({data:new Uint8ClampedArray(512*512*4)}),createImageData:()=>({data:new Uint8ClampedArray(512*512*4)})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
  const app='services/host/app/',anchors=read(app+'history-place-anchors.json');
  const world=new ChronicleWorld({features:[]},[],{
    elev:read('data/geo/korea-elevation.json'),outline:read(app+'korea-outline.json'),
    ...(outlineOnly?{}:{geography:read(app+'history-geography.json'),neighbors:read(app+'neighbor-outline.json')})
  });
  const places=read('data/places.json');
  world.places=[...(Array.isArray(places)?places:places.places),...anchors.places];
  world.coordinateRegistry=coordinateRegistry(anchors,read(app+'history-coordinates.json'));
  const regions=read(app+'historical-regions.json');
  world.scenePackets=describeSettlements([...read(app+'history-scenes.json').scenes,...regions.scenes],regions.capitalCorrections);
  return world;
}

export function estimatedIslandReport(world){
  const scenery=new ChronicleScenery({world,engine:{add(){}},release:g=>g.removeFromParent()});
  const sites=scenery.sites.filter(s=>s.estimated),ringOf=s=>world.rings.findIndex(r=>insideCoastline(s.x,s.z,r));
  const areas=world.rings.map(r=>Math.abs(r.reduce((a,p,i)=>a+p[0]*r[(i+1)%r.length][1]-r[(i+1)%r.length][0]*p[1],0))/2);
  const mainland=areas.indexOf(Math.max(...areas)),jeju=world.rings.findIndex(r=>insideCoastline(...world.toWorld(126.55,33.38),r));
  const years=[-2000,600,1795,2020].map(year=>{
    scenery.stats.year=year;scenery.period=sceneryPeriod(year);scenery.refreshPeriod();
    const period=scenery.period.id,selected=sites.filter(s=>scenery.estimatedIds.has(s.id));
    const cells=scenery.landscapeCells.filter(c=>c.site.estimated&&ringOf(c.site)===jeju);
    return {year,period,jejuThresholdOnly:sites.filter(s=>ringOf(s)===jeju&&estimatedSitePasses(s,period)).length,
      jejuSelected:selected.filter(s=>ringOf(s)===jeju).length,mainlandSelected:selected.filter(s=>ringOf(s)===mainland).length,
      jejuRenderedSites:cells.length,jejuHouses:cells.reduce((n,c)=>n+c.layout.houses.length,0),jejuFields:cells.reduce((n,c)=>n+c.layout.fields.length,0)};
  });
  return {rings:world.rings.length,mainlandRing:mainland,totalCandidates:sites.length,mainlandCandidates:sites.filter(s=>ringOf(s)===mainland).length,
    jejuRing:jeju,jejuCandidates:sites.filter(s=>ringOf(s)===jeju).length,occupancy:'No event placement; real documented zones and urban profiles are active.',years,
    islands:world.rings.flatMap((ring,i)=>i===mainland?[]:[{ringIndex:i,area:Math.round(areas[i]*100)/100,
      name:world.islandRings.find(r=>r.ring===ring)?.island.id||'',candidates:sites.filter(s=>ringOf(s)===i).length}])};
}

export function estimatedDensityReport(world){
  const scenery=new ChronicleScenery({world,engine:{add(){}},release:g=>g.removeFromParent()});
  const areas=world.rings.map(r=>Math.abs(r.reduce((a,p,i)=>a+p[0]*r[(i+1)%r.length][1]-r[(i+1)%r.length][0]*p[1],0))/2);
  const mainland=areas.indexOf(Math.max(...areas)),jeju=world.rings.findIndex(r=>insideCoastline(...world.toWorld(126.55,33.38),r));
  const rows=[['mokpo',1900,126.39,34.79],['jeju',1795,126.55,33.38],['gangnam',2020,127.0473,37.5172]].map(([name,year,lon,lat])=>{
    scenery.setYear(year);scenery.refreshPeriod();
    const [x,z]=world.toWorld(lon,lat),near=s=>name==='jeju'?s.ringIndex===jeju:Math.hypot(s.x-x,s.z-z)<=100;
    const candidates=scenery.sites.filter(s=>s.estimated&&near(s));
    const selected=candidates.filter(s=>scenery.estimatedIds.has(s.id)),cells=scenery.landscapeCells.filter(c=>near(c.site));
    const estimated=cells.filter(c=>c.site.estimated);
    return {name,year,lon,lat,radius:name==='jeju'?null:100,candidates:candidates.length,selected:selected.length,
      islandSelected:selected.filter(s=>s.ringIndex!==mainland).length,estimatedRenderedSites:estimated.length,
      estimatedHouses:estimated.reduce((n,c)=>n+c.layout.houses.length,0),renderedSites:cells.length,
      houses:cells.reduce((n,c)=>n+c.layout.houses.length,0),farTriangles:scenery.stats.farTriangles};
  });
  return {mainlandCandidates:scenery.sites.filter(s=>s.estimated&&s.ringIndex===mainland).length,
    mode:'Real world terrain, documented zones, urban profiles and scenery geometry; no event occupancy; canvas drawing stubbed. farTriangles is nationwide.',rows};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  console.log(JSON.stringify((process.argv.includes('--density')?estimatedDensityReport:estimatedIslandReport)(createEstimatedWorld(process.argv.includes('--outline-only'))),null,2));
}
