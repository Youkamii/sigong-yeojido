import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createEstimatedWorld} from './check_estimated_islands.mjs';

const THREE=await import('three');
const {ChronicleAssets}=await import('../services/host/app/chronicle-assets.js');
const {ChronicleScenery}=await import('../services/host/app/chronicle-scenery.js');
const {compileAssetCatalog}=await import('../services/host/app/assetcatalog.js');
const {extendBuildingCatalog}=await import('../services/host/app/period-buildings.js');
const {extendFigureCatalog}=await import('../services/host/app/period-figures.js');
const {insideCoastline}=await import('../services/host/app/coastline-index.js');
const {activityFigure}=await import('../services/host/app/chronicle-asset-plan.js');

export function checkSceneryCoexist(){
  const world=createEstimatedWorld(),scene=new THREE.Scene();
  const engine={scene,camera:new THREE.PerspectiveCamera(),add:g=>scene.add(g),remove:g=>scene.remove(g),_tagShadows(){}};
  const catalog=compileAssetCatalog(extendBuildingCatalog(extendFigureCatalog(JSON.parse(readFileSync(new URL('../services/host/app/history-asset-catalog.json',import.meta.url),'utf8')))));
  const assets=new ChronicleAssets(engine,world,catalog);
  assets.scenery=new ChronicleScenery(assets);
  // Run terrain, event models, forest and settlement geometry in Node; skip async wildlife population.
  assets.scenery.start=function(forest,year){this.setYear(year);this.initialized=true;this.refreshPeriod();};
  const packet=world.scenePackets.find(s=>s.id==='scene-syj128-kim-mandeok-jeju-1795');
  const event={...packet,entityId:packet.eventId,label:packet.title,year:1795,archetype:packet.kind,
    scenePlace:{...packet.place,coordinates:[packet.place.lon,packet.place.lat]},
    participants:packet.participants.filter(p=>p.entityId.startsWith('person-')).map(p=>({...p,id:p.entityId,
      archetype:activityFigure(p.entityId,p.role,1795,[])}))};
  // The plan is limited to the recorded Kim Mandeok scene; rebuild makes its real occupied lists.
  assets.rebuild({year:1795,events:[event],people:[]});
  const scenery=assets.scenery,composed=assets.sceneCache.get(event.id).scene;
  const jeju=world.rings.find(r=>insideCoastline(...world.toWorld(126.55,33.38),r));
  const cells=scenery.landscapeCells.filter(c=>c.site.estimated&&insideCoastline(c.site.x,c.site.z,jeju));
  const report={year:1795,sceneId:event.id,composition:composed.compositionKind,sceneRadius:composed.radius,
    eventModels:composed.models.length,footprintRadii:[...new Set(composed.occupied.map(o=>o.radius))],
    settlementMarkerRadius:scenery.occupied[0].radius,forestAndPathRadius:scenery.areaOccupied[0].radius,
    jejuCandidates:scenery.sites.filter(s=>s.estimated&&insideCoastline(s.x,s.z,jeju)).length,
    jejuRenderedSites:cells.length,jejuHouses:cells.reduce((n,c)=>n+c.layout.houses.length,0),
    sites:cells.map(c=>({id:c.site.id,houses:c.layout.houses.length,fields:c.layout.fields.length})),
    mode:'Real ChronicleAssets.rebuild, terrain, event models, forest and settlement geometry; single-scene plan; canvas drawing stubbed; no browser or async wildlife.'};
  return {report,assets,composed};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
  console.log(JSON.stringify(checkSceneryCoexist().report,null,2));
