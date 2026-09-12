import test from 'node:test';
import assert from 'node:assert/strict';
import {checkSceneryCoexist} from '../scripts/check_scenery_coexist.mjs';
const {ChronicleScenery}=await import('../services/host/app/chronicle-scenery.js');
const {settlementLayout}=await import('../services/host/app/settlement-regions.js');
const {sitePeriod}=await import('../services/host/app/scenery-period.js');
const {pathSegmentClear}=await import('../services/host/app/chronicle-paths.js');

const site={id:'estimated-region:test',estimated:true,kind:'village',x:0,z:0,radius:12,seed:0,angle:.3,layout:0,
  latitude:35,startYear:-Infinity,endYear:Infinity};
const world={bounds:{minX:-100,maxX:100,minZ:-100,maxZ:100},rings:[[[-100,-100],[100,-100],[100,100],[-100,100]]],
  seaLevel:0,surfaceAt:()=>1,contains:()=>true,coordinatesAt:()=>[127,35]};
const makeScenery=()=>{
  const scenery=new ChronicleScenery({world,engine:{add(){}},release:g=>g.removeFromParent()});
  scenery.sites=[site];scenery.setYear(1795);return scenery;
};

test('site availability uses only occupied radius and preserves documented/urban exemptions',()=>{
  const scenery=makeScenery();scenery.occupied=[{x:0,z:0,radius:24}];
  for(const id of ['estimated-region:test','documented-test']){
    assert.equal(scenery.available({...site,id,x:30}),true);
    assert.equal(scenery.available({...site,id,x:20}),false);
    assert.equal(scenery.available({...site,id,x:24}),false);
  }
  assert.equal(scenery.available({...site,id:'settlement-region:test'}),true);
  assert.equal(scenery.available({...site,kind:'urban'}),true);
});

test('a radius 3 footprint removes only overlapping settlementLayout houses and retains the village',()=>{
  const scenery=makeScenery(),layout=settlementLayout(site,sitePeriod(site,1795));
  scenery.refreshPeriod();assert.deepEqual(scenery.landscapeCells[0].layout.houses,layout.houses);
  const target=layout.houses.at(-1),[x,z]=scenery.point(site,target.x,target.z),occupied=[{x,z,radius:3}];
  scenery.sync(occupied);scenery.refreshPeriod();
  const expected=layout.houses.filter(h=>{
    const [hx,hz]=scenery.point(site,h.x,h.z),radius=Math.hypot(2.4*h.scale,1.9*h.scale)/2;
    return Math.hypot(hx-x,hz-z)>3+radius+.15;
  });
  assert.ok(expected.length>0&&expected.length<layout.houses.length);
  assert.equal(scenery.landscapeCells.length,1);
  assert.deepEqual(scenery.landscapeCells[0].layout.houses,expected);
  scenery.refreshPeriod();assert.deepEqual(scenery.landscapeCells[0].layout.houses,expected);
});

test('scene radii persist for paths and the original occupancy refresh conditions',()=>{
  const scenery=makeScenery(),occupied=[{x:5,z:0,radius:0},{x:7,z:0,radius:3}];
  const areas=[{...occupied[0],radius:24},occupied[1]];
  let refreshes=0,pathOccupied;
  const refresh=scenery.refreshPeriod.bind(scenery);
  scenery.refreshPeriod=()=>{refreshes++;refresh();};
  scenery.paths.sync=(available,items)=>{pathOccupied=items;};scenery.initialized=true;
  scenery.sync(occupied,areas);assert.equal(refreshes,1);assert.equal(pathOccupied,areas);
  assert.equal(scenery.landscapeCells.length,1);assert.equal(scenery.landscapeCells[0].layout.roads.length,0);
  assert.equal(scenery.occupancyKey,areas.map(o=>`${o.x}:${o.z}:${o.radius}:${o.urbanRegionId||''}`).sort().join('|'));
  scenery.sync([...occupied].reverse(),[...areas].reverse());assert.equal(refreshes,1);
  scenery.setYear(1796);assert.equal(refreshes,1);assert.deepEqual(pathOccupied,[...areas].reverse());
  scenery.sync(occupied,[{...areas[0],radius:36},areas[1]]);assert.equal(refreshes,2);
  scenery.sync([{...occupied[0],x:6},occupied[1]],[{...areas[0],x:6,radius:36},areas[1]]);assert.equal(refreshes,3);
  const moved=[{...occupied[0],x:6},{...occupied[1],radius:4}];
  scenery.sync(moved,[{...areas[0],x:6,radius:36},moved[1]]);assert.equal(refreshes,4);
  scenery.sync([...moved,{x:40,z:0,radius:0,urbanRegionId:'test'}],[...scenery.areaOccupied,{x:40,z:0,radius:0,urbanRegionId:'test'}]);assert.equal(refreshes,5);
  assert.equal(pathSegmentClear({x:12,z:-1},{x:12,z:1},occupied),true);
  assert.equal(pathSegmentClear({x:12,z:-1},{x:12,z:1},areas),false);
});

test('1795 Jeju retains estimated villages with actual Kim Mandeok scene occupancy',()=>{
  const {report,assets,composed}=checkSceneryCoexist(),scenery=assets.scenery;
  assert.equal(report.composition,'relief');assert.equal(report.sceneRadius,24);
  assert.equal(report.settlementMarkerRadius,0);assert.equal(report.forestAndPathRadius,24);
  assert.deepEqual(scenery.occupied.slice(1),composed.occupied);
  assert.deepEqual(assets.forestOccupied,scenery.areaOccupied);
  assert.ok(report.jejuRenderedSites>=1);assert.ok(report.jejuHouses>0);
  const forestKey=JSON.parse(assets.forestKey);
  assert.deepEqual(forestKey[0].slice(0,scenery.areaOccupied.length),scenery.areaOccupied.map(o=>[o.x,o.z,o.radius]));
  const before=scenery.landscapeCells.map(c=>({id:c.site.id,layout:c.layout}));
  assets.rebuild(assets.plan);
  assert.deepEqual(scenery.landscapeCells.map(c=>({id:c.site.id,layout:c.layout})),before);
  assert.equal(assets.reuse.builtScenes,0);assert.equal(assets.reuse.scenes,1);
});
