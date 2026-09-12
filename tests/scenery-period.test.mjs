import test from 'node:test';
import assert from 'node:assert/strict';
import {sceneryPeriod,sitePeriod,sceneryRecipe} from '../services/host/app/scenery-period.js';
import {settlementLayout} from '../services/host/app/settlement-regions.js';

const boundaries=[-1500,1,918,1392,1876,1895,1910,1945,1955,1970,1973,1980];
const site={id:'background',seed:25,kind:'village',radius:12,layout:0,latitude:39,longitude:125.8};

test('site periods deterministically scatter every boundary without reversing nearby transitions',()=>{
  for(const year of boundaries)for(let seed=0;seed<51;seed++){
    const s={...site,seed},offset=seed-25,transition=year+offset;
    assert.equal(sitePeriod(s,transition-1),sceneryPeriod(year-1));
    assert.equal(sitePeriod(s,transition),sceneryPeriod(year));
    assert.equal(sitePeriod(s,transition),sitePeriod({...s},transition));
    assert.ok(transition>=year-25&&transition<=year+25);
    // Neighbouring windows overlap after 1876. Check each boundary's side,
    // rather than falsely requiring an adjacent period across another boundary.
    assert.ok(sitePeriod(s,year-26).until<=year);
    assert.ok(sitePeriod(s,year+26).until>year);
  }
  for(const year of [-1500,1,918,1392])for(let seed=0;seed<51;seed++){
    assert.equal(sitePeriod({...site,seed},year-26),sceneryPeriod(year-1));
    assert.equal(sitePeriod({...site,seed},year+26),sceneryPeriod(year));
  }
  assert.notEqual(sitePeriod({...site,seed:0},1392),sitePeriod({...site,seed:50},1392));
});

test('rural layouts and people follow the site period while urban dates stay exact',()=>{
  for(const seed of [0,50]){
    const s={...site,seed},period=sitePeriod(s,1392);
    assert.deepEqual(settlementLayout(s,1392),settlementLayout(s,period));
    const person=sceneryRecipe({id:'person:0',archetype:'human'},period,s);
    assert.equal(person.archetype,seed===0?'figure_joseon_commoner':'figure_goryeo_commoner');
    assert.equal(sitePeriod({...s,kind:'urban'},1392),sceneryPeriod(1392));
  }
});

test('1980 Pyongyang outskirts use the same modern rural housing and stores as the south',()=>{
  for(let seed=0;seed<100;seed++)for(const year of [1945,1960,1980,2006]){
    const north={...site,seed},south={...north,latitude:35};
    const period=sitePeriod(north,year);
    assert.equal(period,sitePeriod(south,year));
    for(const archetype of ['rural_hut','rural_cottage','korean_house','rural_store','market']){
      const recipe={id:'house:0',archetype},n=sceneryRecipe(recipe,period,north),s=sceneryRecipe(recipe,period,south);
      assert.deepEqual(n,s);
      assert.doesNotMatch(n.archetype,/era_joseon/);
    }
  }
  assert.equal(sitePeriod(site,1980).id,'mechanized');
});
