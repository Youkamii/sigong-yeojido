import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {planSettlementSites,settlementLayout} from '../services/host/app/settlement-regions.js';
import {sceneryPeriod,sceneryHouseRecipe} from '../services/host/app/scenery-period.js';
import {compileAssetCatalog,normalizeAssetRecipe} from '../services/host/app/assetcatalog.js';
const source=(await readFile(new URL('../services/host/app/scenery-overview.js',import.meta.url),'utf8')).replace("'three'",JSON.stringify(new URL('../services/host/vendor/three.module.min.js',import.meta.url).href)).replace(/'([.][/]scenery-[^']+)'/g,(_,path)=>JSON.stringify(new URL('../services/host/app/'+path,import.meta.url).href));
const {sceneryOverview,setOverviewDetails}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const world={rings:[[[-220,-450],[220,-450],[220,450],[-220,450]]],bounds:{minX:-220,maxX:220,minZ:-450,maxZ:450},seaLevel:7,surfaceAt:()=>8,coordinatesAt:(x,z)=>[127,38-z/100]};
world.toWorld=(lon,lat)=>[(lon-127)*100,(38-lat)*100];
// Explicit synthetic source zones stress geometry batching; the production
// planner no longer invents a national settlement grid.
world.settlementZones=Array.from({length:96},(_,i)=>({id:'fixture-zone:'+i,lon:125.1+(i%8)*.5,lat:34.2+Math.floor(i/8)*.65,startYear:-3000,endYear:2026,kind:'regional',contextType:'settlement',sourceIds:['fixture-source']}));
test('far scenery uses direct bounded geometry for thousands of homes in all periods',()=>{
 const sites=planSettlementSites(world);
 for(const year of [600,1500,1960]){
  const period=sceneryPeriod(year),cells=sites.map(site=>({site,layout:settlementLayout(site,period)})),homes=cells.reduce((n,c)=>n+c.layout.houses.length,0),group=sceneryOverview(world,cells,period);
  assert.ok(homes>2000);assert.ok(group.children.length<=30);
  const triangles=group.children.reduce((n,m)=>n+m.geometry.attributes.position.count/3,0);
  assert.ok(triangles<250000,`${year}: ${triangles}`);
  for(const mesh of group.children){assert.equal(mesh.castShadow,false);assert.equal(mesh.receiveShadow,false);assert.ok([...mesh.geometry.attributes.position.array].every(Number.isFinite));mesh.geometry.dispose();mesh.material.dispose();}
 }
});
test('near selection hides and restores only matching coarse homes',()=>{
 const site=planSettlementSites(world)[0],period=sceneryPeriod(600),group=sceneryOverview(world,[{site,layout:settlementLayout(site,period)}],period),mesh=group.children.find(c=>c.name==='settlement-roofs'),original=mesh.geometry.attributes.position.array.slice();
 setOverviewDetails(group,[{site,indices:[0]}]);assert.notDeepEqual(mesh.geometry.attributes.position.array,original);
 setOverviewDetails(group,[]);assert.deepEqual(mesh.geometry.attributes.position.array,original);
});
test('asset recipes preserve planned house yaw and default existing recipes to zero',async()=>{
 const catalog=compileAssetCatalog(JSON.parse(await readFile(new URL('../services/host/app/history-asset-catalog.json',import.meta.url),'utf8'))),recipe={id:'house',archetype:'rural_cottage',anchor:'a',scale:.2};
 assert.equal(normalizeAssetRecipe(recipe,catalog,0).recipe.yaw,0);
 assert.equal(normalizeAssetRecipe({...recipe,yaw:Math.PI/2},catalog,0).recipe.yaw,Math.PI/2);
 assert.equal(normalizeAssetRecipe({...recipe,yaw:NaN},catalog,0).recipe.yaw,0);
});
test('early period has no fields and different roof palettes remain visible',()=>{
 const site=planSettlementSites(world)[0],period=sceneryPeriod(-2000),group=sceneryOverview(world,[{site,layout:settlementLayout(site,period)}],period);
 assert.equal(group.children.some(c=>c.name==='decorative-fields'),false);assert.ok(group.children.some(c=>c.name==='settlement-roofs'));
});

const triangleCount=group=>group.children.reduce((n,m)=>n+m.geometry.attributes.position.count/3,0);
const legacyTriangles=(cells,period)=>cells.reduce((total,{site,layout})=>total
  +layout.houses.reduce((n,h,index)=>n+(h.type||period.housing==='modern'&&(index+site.seed)%5!==0?12:16),0)
  +(period.fields?layout.fields.length*8:0)+(layout.spaces?.length||0)*2
  +layout.roads.reduce((n,r)=>n+(r.points.length-1)*2,0),0);

test('far homes retain cone, gable and flat topology within twenty percent of the old triangle budget',()=>{
  const sites=planSettlementSites(world);
  for(const year of [-2000,-500,600,1200,1700,1960,1975,2000]){
    const period=sceneryPeriod(year),cells=sites.map(site=>({site,layout:settlementLayout(site,period)}));
    const group=sceneryOverview(world,cells,period),before=legacyTriangles(cells,period),after=triangleCount(group);
    assert.ok(after>=before*.8&&after<=before*1.2,`${year}: ${before} -> ${after}`);
    const kinds=new Set(group.children.flatMap(m=>(m.userData.houseRanges||[]).map(r=>r.roof)));
    if(year<1)assert.deepEqual([...kinds],['cone']);
    else if(year<1970)assert.deepEqual([...kinds],['gable']);
    else assert.ok(kinds.has('flat')&&kinds.has('gable'),'modern pitched-roof houses remain pitched nearby');
    for(const m of group.children){m.geometry.dispose();m.material.dispose();}
  }
});

test('actual vertex peaks distinguish prehistoric cones, Joseon ridges and modern flat boxes',()=>{
  for(const [year,seed,roof,peaks] of [[-2000,0,'cone',1],[-500,0,'cone',1],[1700,2,'gable',2],[2000,0,'flat',4]]){
    const period=sceneryPeriod(year),site={id:'test',x:0,z:0,angle:0,seed},h={x:0,z:0,scale:1,archetype:'rural_cottage'};
    const group=sceneryOverview(world,[{site,layout:{houses:[h],fields:[],roads:[]}}],period);
    const mesh=group.children[0],p=mesh.geometry.attributes.position,top=Math.max(...Array.from({length:p.count},(_,i)=>p.getY(i)));
    const vertices=new Set(Array.from({length:p.count},(_,i)=>i).filter(i=>Math.abs(p.getY(i)-top)<1e-5).map(i=>`${p.getX(i)},${p.getZ(i)}`));
    assert.equal(vertices.size,peaks);assert.equal(mesh.userData.houseRanges[0].roof,roof);
    if(roof==='cone')assert.ok([...vertices][0]==='0,0');
    mesh.geometry.dispose();mesh.material.dispose();
  }
});

test('far roofs use the selected detailed blueprint proportions and preserve combined site and house yaw',async()=>{
  const {extendBuildingCatalog}=await import('../services/host/app/period-buildings.js');
  const raw=extendBuildingCatalog(JSON.parse(await readFile(new URL('../services/host/app/history-asset-catalog.json',import.meta.url),'utf8')));
  for(const [year,seed] of [[600,1],[1700,2],[2000,1],[2000,2]]){
    const period=sceneryPeriod(year),site={id:'test',x:12,z:30,angle:.7,seed};
    const h={x:0,z:0,angle:.35,scale:1,archetype:'rural_cottage'},archetype=sceneryHouseRecipe(h,period,site).archetype;
    const roof=raw.blueprints[archetype].p.find(p=>p.k==='gable'&&p.tag==='roof');
    const group=sceneryOverview(world,[{site,layout:{houses:[h],fields:[],roads:[]}}],period);
    const p=group.children[0].geometry.attributes.position,angle=site.angle+h.angle,c=Math.cos(angle),s=Math.sin(angle);
    const points=Array.from({length:p.count},(_,i)=>{const x=p.getX(i)-site.x,z=p.getZ(i)-site.z;return [x*c-z*s,p.getY(i),x*s+z*c];});
    const top=Math.max(...points.map(p=>p[1])),ridge=points.filter(p=>Math.abs(p[1]-top)<1e-5);
    assert.ok(ridge.every(p=>Math.abs(p[2])<1e-5),'ridge follows local X after both yaw rotations');
    const width=Math.max(...points.map(p=>p[0]))-Math.min(...points.map(p=>p[0]));
    const depth=Math.max(...points.map(p=>p[2]))-Math.min(...points.map(p=>p[2]));
    assert.ok(Math.abs(width/depth-roof.w/roof.d)<1e-4,`${archetype} footprint ratio`);
    group.children[0].geometry.dispose();group.children[0].material.dispose();
  }
});
