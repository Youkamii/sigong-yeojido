// Arrays preserve order; length prefixes avoid collisions in labels and IDs.
export function valueKey(value){
  if(value===undefined)return 'u';
  if(value===null)return 'n';
  if(Array.isArray(value))return '['+value.map(valueKey).join('')+']';
  if(typeof value==='object')return '{'+Object.keys(value).sort().map(k=>valueKey(k)+valueKey(value[k])).join('')+'}';
  const text=String(value);return typeof value+text.length+':'+text;
}

const featureKeys=new WeakMap();
export function historicalFeaturesKey(features,year){
  let key=featureKeys.get(features);
  if(key===undefined){key=valueKey(features.map(f=>[f.id,f.geometry,f.properties]));featureKeys.set(features,key);}
  return valueKey(year)+key;
}

// Fields consumed by ChronicleAssets, composeHistoricalEvent, marker labels and activity cards.
const rowFields=['id','entityId','kind','year','archetype','label','title','detail','summary','setting','itemId',
  'startYear','endYear','scenePlace','locationReference','locations','visualActions','effects','sides',
  'sceneFunction','heritageType','heritageFloors','participantGroups','continuing','siteBackground','narrative',
  'role','presence','side','unloaded','action','claimIds','relationClaims','actionClaimIds','placeClaimIds'];
const rowKey=row=>valueKey(rowFields.map(field=>row[field]));
export function scenePlanKey(plan,activeScene,featuresKey=''){
  return valueKey([plan.year,activeScene,featuresKey])+plan.events.map(event=>
    rowKey(event)+valueKey(event.participants?.length||0)+(event.participants||[]).map(rowKey).join('')).join('')+plan.people.map(rowKey).join('');
}

export function sceneryPeriodKey(periodId,sites){
  return valueKey([periodId,sites.map(s=>[s.id,s.kind,s.periodId,
    Number(s.density).toFixed(2),Number(s.scale).toFixed(2),s.selected,s.unscaledSelected,s.layoutKey])]);
}

export function createYearCommit({preview,context,features,applyFeatures,refresh,draw,done=()=>{},settled=()=>{},
  frame=()=>new Promise(resolve=>requestAnimationFrame(resolve)),schedule=setTimeout,cancel=clearTimeout,now=()=>performance.now(),waitMs=400,lateWaitMs=8000}){
  let sequence=0,busy=false,completedAt=-Infinity,pendingRefresh=false;
  const refreshNow=year=>{pendingRefresh=false;return refresh(year);};
  return {get busy(){return busy;},get completedAt(){return completedAt;},
    requestRefresh(year){if(busy)pendingRefresh=true;else refreshNow(year);},
    async run(year,options={}){
      const token=++sequence,current=()=>token===sequence;busy=true;
      let timeout,lateTimeout;
      try{
        preview(year,options);
        const request=Promise.resolve(features(year)).catch(()=>null);
        const ready=Promise.race([request,new Promise(resolve=>{timeout=schedule(()=>resolve(null),waitMs);})]);
        // Two frame boundaries let the preview paint before synchronous context work.
        await frame();if(!current())return;
        await frame();if(!current())return;
        context(year,options);
        await frame();if(!current())return;
        const result=await ready;
        cancel(timeout);if(!current())return;
        applyFeatures(result||{features:[],year,key:historicalFeaturesKey([],year)});
        let refreshedKey=refreshNow(year);
        await frame();if(!current())return;
        draw(year);
        if(!result){
          const applyLate=async late=>{
            if(!late||!current())return;
            await frame();if(!current())return;
            applyFeatures(late);
            if(late.key!==refreshedKey)refreshedKey=refreshNow(year);
            draw(year);
          };
          const expired=Symbol('late timeout');
          const late=await Promise.race([request,new Promise(resolve=>{lateTimeout=schedule(()=>resolve(expired),lateWaitMs);})]);
          cancel(lateTimeout);if(!current())return;
          if(late===expired)request.then(applyLate).catch(error=>console.error('[year history]',error));
          else await applyLate(late);
        }
        if(current())done(year);
      }finally{
        cancel(timeout);cancel(lateTimeout);
        if(current()){
          try{if(pendingRefresh)refreshNow(year);}
          finally{busy=false;completedAt=now();settled(year);}
        }
      }
    }
  };
}
