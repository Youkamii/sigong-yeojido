// Anonymous visual families, not reconstructions of a named building or town.
// Reuses the existing catalog's house/storage/hall/market parts. Era boundaries,
// proportions and variant shares are artistic display settings, not research claims.
export const BUILDING_PERIODS=Object.freeze([
  {id:'early',until:1,year:-500}, {id:'three',until:918,year:600},
  {id:'goryeo',until:1392,year:1200}, {id:'joseon',until:1876,year:1700},
  {id:'earlymodern',until:1970,year:1930}, {id:'modern',until:Infinity,year:2000},
].map(Object.freeze));
const roles={house:'house',rural_hut:'house',rural_cottage:'house',korean_house:'house',farmhouse:'house',
  rural_store:'store',store:'store',palace:'hall',korean_hall:'hall',hall:'hall',civic_hall:'hall',
  gatehouse:'gate',korean_gate:'gate',gate:'gate',market:'market',
  courtyard_house:'courtyard',korean_courtyard:'courtyard',academy_hall:'hall',korean_academy:'hall'};
const familyAt=year=>BUILDING_PERIODS.find(period=>year<period.until);
export function buildingArchetype(archetype,year,region={}){
  if(archetype.startsWith('urban_')){
    const type=archetype.slice(6),variant=Math.abs(Math.trunc(region.seed||0))%3;
    const stage=year<1945?'transition':year<1970?'postwar':'modern';
    return `urban_${stage}_${type}_${variant}`;
  }
  const role=roles[archetype];if(!role)return archetype;
  const family=familyAt(year).id,variant=Math.abs(Math.trunc(region.seed||0))%3;
  return `era_${family}_${role}_${variant}`;
}
function resized(source,x=1,y=1,z=1){
  const blueprint=structuredClone(source);
  blueprint.h*=y;blueprint.rad*=Math.max(x,z);
  blueprint.p=blueprint.p.filter(part=>!part.detail116).map(part=>{
    for(const key of ['x','w'])if(typeof part[key]==='number')part[key]*=x;
    for(const key of ['y','h'])if(typeof part[key]==='number')part[key]*=y;
    for(const key of ['z','d'])if(typeof part[key]==='number')part[key]*=z;
    if(['cyl','cone','sph'].includes(part.k)){part.sx=(part.sx||1)*x;part.sz=(part.sz||1)*z;}
    if(part.rep?.dx)part.rep.dx*=x;
    return part;
  });
  return blueprint;
}
export function extendBuildingCatalog(raw){
  const cores=[...raw.categories.buildings.cores],blueprints={...raw.blueprints};
  for(const family of BUILDING_PERIODS)for(const role of ['house','store','hall','gate','market','courtyard'])for(let variant=0;variant<3;variant++){
    const id=`era_${family.id}_${role}_${variant}`;if(blueprints[id])continue;
    let source=role==='house'?'rural_cottage':role==='store'?'rural_store':role==='hall'?'korean_hall':role==='gate'?'korean_gate':role==='courtyard'?'korean_courtyard':'market';
    if(role==='house')source=family.id==='early'?'rural_hut':family.id==='modern'?['rural_tiled','rural_metal','rural_flat'][variant]:variant===2&&['goryeo','joseon','earlymodern'].includes(family.id)?'korean_house':'rural_cottage';
    if(family.id==='early'&&['hall','courtyard'].includes(role))source='rural_hut';
    if(family.id==='early'&&role==='gate')source='rural_store';
    if(family.id==='modern'&&role==='hall')source='civic_hall';
    const roleScale=family.id==='early'&&['hall','courtyard'].includes(role)?1.5:1;
    const width=[.92,1.15,1][variant]*roleScale,depth=[1.08,.86,1.15][variant]*roleScale;
    const height={early:.8,three:.88,goryeo:1,joseon:1,earlymodern:.95,modern:1}[family.id];
    const blueprint=resized(raw.blueprints[source],width,height,depth);
    if(role==='gate'&&['early','modern'].includes(family.id)){
      const material=family.id==='early'?'timber':'stone';
      blueprint.h=3;blueprint.rad=2.8;
      blueprint.p=[{k:'box',w:.4,h:2.7,d:.5,x:2,y:1.35,m:material,c:'timber',tag:'body',rep:{mir:'x'}},
        {k:'box',w:4.8,h:.35,d:.7,y:2.8,m:material,c:family.id==='early'?'timberLt':'bodyMid',tag:'top'}];
    }
    if(role==='house'&&family.id!=='modern'){
      for(const part of blueprint.p)if(part.tag==='roof'){
        if(family.id==='three'){part.c='timberLt';if(part.k==='gable')part.h*=1.25;}
        if(family.id==='goryeo'&&variant===2)part.c='iron';
      }
      if(family.id==='joseon'&&variant===1){
        blueprint.p.push({k:'box',w:2.3,h:.25,d:1.1,x:1.5,y:.2,z:2,m:'timber',c:'timberLt',tag:'base'});
      }
    }
    blueprints[id]=blueprint;cores.push(`${id}|이름 없는 시대별 ${role} 모형`);
  }
  for(const [stage,year] of [['transition',1930],['postwar',1960],['modern',2010]])
    for(const type of ['lowrise','apartment','commercial','civic','transit','industrial','warehouse'])for(let variant=0;variant<3;variant++){
      const id=`urban_${stage}_${type}_${variant}`;
      if(blueprints[id])continue;
      blueprints[id]=urbanBlueprint(type,year,variant);cores.push(`${id}|이름 없는 도시 건물`);
    }
  return {...raw,blueprints,categories:{...raw.categories,buildings:{...raw.categories.buildings,cores}}};
}

// Shared proportions for anonymous city blocks; never a named building reconstruction.
export function urbanBuildingDimensions(type,year,variant=0){
  const modern=year>=1970;
  const dimensions={lowrise:[5,4,3.2+variant*.9],apartment:[7,4,modern?18+variant*5:4],
    commercial:[5,5,modern?10+variant*5:4],civic:[10,6,4.8],transit:[10,4,3],
    industrial:[8,6,4],warehouse:[7,5,3]};
  const [width,depth,height]=dimensions[type]||dimensions.lowrise;
  return {width,depth,height};
}
function urbanBlueprint(type,year,variant){
  const {width:w,depth:d,height:h}=urbanBuildingDimensions(type,year,variant);
  const p=[{k:'box',w,h,d,y:h/2,m:'stone',c:variant===1?'bodyMid':'stone',tag:'body'},
    {k:'box',w:w+.25,h:.22,d:d+.25,y:h+.11,m:'stone',c:'iron',tag:'roof'}];
  const floors=Math.max(1,Math.floor(h/1.8));
  for(let floor=0;floor<floors;floor++)for(let column=0;column<3;column++){
    p.push({k:'box',w:w*.17,h:.65,d:.08,x:(column-1)*w*.28,y:1+floor*1.8,z:d/2+.05,m:'stone',c:'iron',tag:'window',rep:{mir:'z'}});
  }
  if(['commercial','transit'].includes(type))p.push({k:'box',w:w*.85,h:.3,d:1,y:1.9,z:d/2+.4,m:'timber',c:variant===2?'timberLt':'bodyMid',tag:'awning'});
  if(year<1945&&type==='lowrise'){
    p.splice(1,1);p.push({k:'gable',w:w+.5,h:1.1,d:d+.5,y:h,m:'timber',c:'iron',tag:'roof'});
  }
  return {h:h+1,rad:Math.hypot(w,d)/2,p};
}
