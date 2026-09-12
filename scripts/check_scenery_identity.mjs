import {createEstimatedWorld} from './check_estimated_islands.mjs';
const {ChronicleScenery}=await import('../services/host/app/chronicle-scenery.js');
const {sceneryPeriod}=await import('../services/host/app/scenery-period.js');
const scenery=new ChronicleScenery({world:createEstimatedWorld(),engine:{add(){}},release:g=>{
  g.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});g.removeFromParent();
}});
if(process.argv.includes('--refresh')){
  scenery.setYear(1360);scenery.initialized=true;scenery.refreshPeriod();
  for(const year of [1361,1362,...Array.from({length:53},(_,i)=>1366+i),1500,1501,1502]){
    const old=scenery.overview,meshes=new Set(old.children),start=performance.now();scenery.setYear(year);
    const elapsed=performance.now()-start,refreshed=old!==scenery.overview;
    console.log(JSON.stringify({year,setYearMs:+elapsed.toFixed(2),refreshed,
      updatedSites:refreshed?scenery.stats.refreshedSites:0,reusedSites:refreshed?scenery.stats.reusedSites:scenery.landscapeCells.length,
      rebuiltDraws:scenery.overview.children.filter(m=>!meshes.has(m)).length,totalSites:scenery.landscapeCells.length,
      refreshMs:refreshed?+scenery.stats.refreshMs.toFixed(2):0}));
  }
}else{
  for(const year of [-2000,-500,600,1200,1700,1960,1975,2000,2020]){
    scenery.stats.year=year;scenery.period=sceneryPeriod(year);const start=performance.now();scenery.refreshPeriod();
    console.log(JSON.stringify({year,houses:scenery.stats.houses,farTriangles:scenery.stats.farTriangles,farDraws:scenery.stats.farDraws,
      refreshMs:+(performance.now()-start).toFixed(2)}));
  }
}
