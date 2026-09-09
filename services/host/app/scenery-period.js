// Broad visual settings for unnamed scenery, not dates of nationwide change.
export function sceneryPeriod(year){
  if(year<-1500)return {id:'early-settlement',housing:'early',fields:false,people:'rural_figure',tigers:true};
  if(year<1)return {id:'early-farming',housing:'early',fields:true,people:'rural_figure',tigers:true};
  if(year<1910)return {id:'traditional',housing:'traditional',fields:true,people:'period_figure',tigers:true};
  if(year<1970)return {id:'early-modern',housing:'traditional',fields:true,people:'field_worker',tigers:false};
  if(year<1980)return {id:'roof-transition',housing:'mixed',fields:true,people:'field_worker',tigers:false};
  return {id:'mechanized',housing:'modern',fields:true,people:'field_worker',tigers:false};
}

export function sceneryRecipe(recipe,period,site){
  const seed=Number(recipe.id.split(':').at(-1)),choice=(site.seed+seed*37)%100;
  const houses=['rural_store','rural_hut','korean_house','rural_cottage'];
  let archetype=recipe.archetype;
  if(houses.includes(archetype)){
    if(period.housing==='early')archetype='rural_hut';
    // The collected modernization references concern the South. Keep the
    // northern scenery neutral until regional references are available.
    else if(site.latitude<37.7&&['mixed','modern'].includes(period.housing)){
      const share=period.housing==='mixed'?35:85;
      if(choice<share)archetype=choice%3===0?'rural_flat':choice%3===1?'rural_metal':'rural_tiled';
    }
  }else if(archetype==='human')archetype=period.people;
  else if(archetype==='handcart'){
    if(period.housing==='early')return null;
    if(period.housing==='modern'&&site.latitude<37.7&&choice<55)archetype='farm_tractor';
  }
  return {...recipe,archetype};
}
