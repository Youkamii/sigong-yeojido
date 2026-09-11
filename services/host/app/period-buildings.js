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
  return {...raw,blueprints,categories:{...raw.categories,buildings:{...raw.categories.buildings,cores}}};
}
