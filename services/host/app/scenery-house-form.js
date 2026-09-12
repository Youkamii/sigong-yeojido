// Main roof proportions from the catalog, before the same era resizing used by
// extendBuildingCatalog. Small trim and porches are omitted at this distance.
const forms={
  rural_hut:{roof:'cone',width:4.6,depth:4.6,eave:.75,rise:1.9,color:'#79613e'},
  rural_cottage:{roof:'gable',width:5.4,depth:4,eave:1.98,rise:1.2,color:'#887049'},
  korean_house:{roof:'gable',width:4.5,depth:3.9,eave:2.66,rise:.8,color:'#666d68'},
  rural_flat:{roof:'flat',width:5.1,depth:4.5,eave:2.98,rise:0,color:'#81877f'},
  rural_metal:{roof:'gable',width:6.6,depth:3.9,eave:2.45,rise:.6,color:'#65888b'},
  rural_tiled:{roof:'gable',width:6.1,depth:4.6,eave:2.45,rise:1.1,color:'#666d68'},
};
export function sceneryHouseForm(archetype){
  const era=/^era_(early|three|goryeo|joseon|earlymodern|modern)_house_([0-2])$/.exec(archetype);
  let source=archetype,width=1,depth=1,height=1;
  if(era){
    const [,family,v]=era,variant=Number(v);
    source=family==='early'?'rural_hut':family==='modern'?['rural_tiled','rural_metal','rural_flat'][variant]:variant===2&&['goryeo','joseon','earlymodern'].includes(family)?'korean_house':'rural_cottage';
    width=[.92,1.15,1][variant];depth=[1.08,.86,1.15][variant];
    height={early:.8,three:.88,goryeo:1,joseon:1,earlymodern:.95,modern:1}[family];
    // The detailed cone emitter keeps a round footprint (unlike box resizing).
    if(family==='early'){width=1;depth=1;}
  }
  const form={...forms[source]};
  form.width*=width;form.depth*=depth;form.eave*=height;form.rise*=height;
  if(era?.[1]==='three')form.rise*=1.25;
  const scale=Math.min(Math.sqrt(2.4*1.9/(form.width*form.depth)),3/Math.hypot(form.width,form.depth));
  return {...form,width:form.width*scale,depth:form.depth*scale,eave:form.eave*scale,rise:form.rise*scale};
}
