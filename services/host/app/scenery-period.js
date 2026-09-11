import {buildingArchetype} from './period-buildings.js';
import {figureArchetype} from './period-figures.js';
// Broad visual settings for unnamed scenery, not dates of nationwide change.
const periods=[
  {until:-1500,id:'early-settlement',year:-2000,housing:'early',fields:false,people:'rural_figure',tigers:true},
  {until:1,id:'early-farming',year:-500,housing:'early',fields:true,people:'rural_figure',tigers:true},
  {until:918,id:'three-kingdoms',year:600,housing:'traditional',fields:true,people:'period_figure',tigers:true},
  {until:1392,id:'goryeo',year:1200,housing:'traditional',fields:true,people:'period_figure',tigers:true},
  {until:1876,id:'joseon',year:1700,housing:'traditional',fields:true,people:'period_figure',tigers:true},
  {until:1895,id:'late-joseon',year:1890,housing:'traditional',fields:true,people:'period_figure',tigers:true},
  {until:1910,id:'opening-period',year:1900,housing:'traditional',fields:true,people:'period_figure',tigers:true},
  {until:1945,id:'early-modern',year:1930,housing:'traditional',fields:true,people:'field_worker',tigers:false},
  {until:1970,id:'modern-farming',year:1960,housing:'traditional',fields:true,people:'field_worker',tigers:false},
  {until:1980,id:'roof-transition',year:1975,housing:'mixed',fields:true,people:'field_worker',tigers:false},
  {until:Infinity,id:'mechanized',year:2000,housing:'modern',fields:true,people:'field_worker',tigers:false},
].map(Object.freeze);
export function sceneryPeriod(year){
  return periods.find(period=>year<period.until);
}

export function sceneryRecipe(recipe,period,site){
  const seed=Number(recipe.id.split(':').at(-1)),choice=(site.seed+seed*37)%100;
  const houses=['rural_hut','korean_house','rural_cottage'];
  let archetype=recipe.archetype;
  if(houses.includes(archetype)){
    if(period.housing==='early')archetype=buildingArchetype(archetype,period.year,{seed:choice});
    // The collected modernization references concern the South. Keep the
    // northern scenery neutral until regional references are available.
    else if(site.latitude<37.7&&['mixed','modern'].includes(period.housing)){
      const share=period.housing==='mixed'?35:85;
      if(choice<share)archetype=choice%3===0?'rural_flat':choice%3===1?'rural_metal':'rural_tiled';
      else if(archetype==='rural_hut')archetype='rural_cottage';
    }else if(['mixed','modern'].includes(period.housing))archetype=buildingArchetype('rural_cottage',1700,{seed:choice});
    else archetype=buildingArchetype(archetype,period.year,{seed:choice});
  }else if(['rural_store','market'].includes(archetype)){
    if(archetype==='market'&&period.housing==='early')return null;
    archetype=buildingArchetype(archetype,site.latitude>=37.7&&['mixed','modern'].includes(period.housing)?1700:period.year,{seed:choice});
  }else if(archetype==='human')archetype=figureArchetype('commoner',period.year);
  else if(archetype==='handcart'){
    if(period.housing==='early')return null;
    if(period.housing==='modern'&&site.latitude<37.7&&choice<55)archetype='farm_tractor';
  }
  return {...recipe,archetype};
}
