import test from 'node:test';
import assert from 'node:assert/strict';
import {URBAN_REGIONS,urbanLayout,urbanRegionAt} from '../services/host/app/urban-regions.js';
import {sceneryPeriod,sceneryRecipe} from '../services/host/app/scenery-period.js';
import {settlementLayout} from '../services/host/app/settlement-regions.js';
const site=p=>({id:'urban-region:'+p.id,kind:'urban',profile:p,radius:p.radius,seed:1822});

test('2010 major city cores contain neighborhoods, public space and workplaces, not fields',()=>{
  for(const p of URBAN_REGIONS){
    const layout=urbanLayout(site(p),sceneryPeriod(2010)),types=new Set(layout.houses.map(h=>h.type));
    assert.ok(layout.houses.length>=10,p.id);assert.equal(layout.fields.length,0);
    for(const type of ['lowrise','commercial','apartment'])assert.ok(types.has(type),p.id+':'+type);
    assert.ok(layout.spaces.length&&layout.roads.every(r=>r.paved));
    if(p.industry)assert.ok(types.has(p.industry==='harbor'?'warehouse':'industrial'),p.id);
    for(const h of layout.houses)assert.ok([h.width,h.depth,h.height].every(n=>Number.isFinite(n)&&n>0));
  }
  const rural=settlementLayout({seed:71,kind:'town',radius:19,layout:0},2010);
  assert.ok(rural.fields.length>3);assert.ok(rural.houses.every(h=>!h.type));
  assert.equal(urbanRegionAt(126.55,33.38,2010),null,'Jeju island center remains outside the city');
});

test('growth bands retain low-rise 1960 and distinguish 1975 from later skylines',()=>{
  const seoul=site(URBAN_REGIONS[0]),early=urbanLayout(seoul,1960),transition=urbanLayout(seoul,1975),late=urbanLayout(seoul,2010);
  assert.ok(Math.max(...early.houses.map(h=>h.height))<=1.8);
  assert.equal(early.houses.filter(h=>h.type==='apartment').length,0);
  assert.ok(transition.houses.some(h=>h.type==='apartment'));
  assert.ok(Math.max(...transition.houses.map(h=>h.height))<Math.max(...late.houses.map(h=>h.height)));
  const gangnam=site(URBAN_REGIONS.find(p=>p.id==='gangnam'));
  assert.equal(urbanLayout(gangnam,sceneryPeriod(1969)).houses.length,0);
  assert.ok(urbanLayout(gangnam,sceneryPeriod(1970)).houses.length>0);
  const jeju=site(URBAN_REGIONS.find(p=>p.id==='jeju'));
  assert.equal(urbanLayout(jeju,sceneryPeriod(1954)).houses.length,0);
  assert.ok(urbanLayout(jeju,sceneryPeriod(1955)).houses.length>0);
  const pohang=site(URBAN_REGIONS.find(p=>p.id==='pohang'));
  assert.ok(!urbanLayout(pohang,sceneryPeriod(1972)).houses.some(h=>h.type==='industrial'));
  assert.ok(urbanLayout(pohang,sceneryPeriod(1973)).houses.some(h=>h.type==='industrial'));
});

test('north remains modern and cities persist across event and administrative end years',()=>{
  for(const p of URBAN_REGIONS){
    const s=site(p);
    assert.deepEqual(urbanLayout(s,sceneryPeriod(2005)),urbanLayout(s,sceneryPeriod(2006)));
    assert.equal(sceneryPeriod(2010),sceneryPeriod(2011));
    if(p.north)assert.ok(urbanLayout(s,2010).houses.some(h=>h.type==='apartment'&&h.height>3));
  }
  for(let seed=0;seed<100;seed++)assert.doesNotMatch(sceneryRecipe({id:'rural:0',archetype:'rural_cottage'},sceneryPeriod(2010),{latitude:40,seed}).archetype,/era_joseon/);
});
