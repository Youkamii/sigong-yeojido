import * as THREE from 'three';
import {figureArchetype} from './period-figures.js';
import {buildingArchetype} from './period-buildings.js';
import {settlementLayout,SETTLEMENT_RADIUS} from './historical-regions.js';

function fireAt(group,position,scale,animated){
  const fire=new THREE.Group();fire.position.copy(position);fire.scale.setScalar(scale);group.add(fire);
  const flames=[];
  for(let i=0;i<7;i++){
    const material=new THREE.MeshStandardMaterial({color:i%2?'#ed9e39':'#c24b25',emissive:'#b64112',emissiveIntensity:.7,roughness:1,flatShading:true});
    const flame=new THREE.Mesh(new THREE.ConeGeometry(.7+i%3*.22,2.5+i%3,5),material);
    flame.position.set(Math.cos(i*2.4)*1.1,1.4,Math.sin(i*2.4)*.9);fire.add(flame);flames.push(flame);
  }
  const smoke=[];
  const material=new THREE.MeshStandardMaterial({color:'#5b5650',transparent:true,opacity:.38,depthWrite:false,flatShading:true});
  for(let i=0;i<7;i++){
    const cloud=new THREE.Mesh(new THREE.IcosahedronGeometry(1.2,0),material);fire.add(cloud);smoke.push(cloud);
  }
  fire.name='event-fire';
  animated.push({update(t){
    flames.forEach((f,i)=>{f.scale.y=.85+Math.sin(t*6+i)*.22;f.rotation.z=Math.sin(t*3+i)*.15;});
    smoke.forEach((s,i)=>{const phase=(t*.17+i/7)%1;s.position.set(phase*4+Math.sin(i)*.7,3+phase*12,Math.cos(i)*phase*2);s.scale.setScalar(.6+phase*1.8);});
  }});
}

/** Local composition explains the event; these offsets are not new geographic facts. */
export function composeHistoricalEvent(event,position,world){
  const group=new THREE.Group(),animated=[],models=[],occupied=[];
  group.userData.sceneId=event.id;
  const sea=event.scenePlace?event.scenePlace.medium==='sea':event.archetype==='naval';
  const actions=[event.label,event.summary,JSON.stringify(event.visualActions||'')].join(' ');
  const modern=event.year>=1876,shipType=modern?'motor_ship':'ship';
  const alliedFleet=event.participants.some(p=>p.presence==='on-site'&&p.side==='naval'&&/명나라 수군|명 수군/.test(p.role));
  const soldier=modern?'rifle_soldier':'spearman';
  const launch=modern&&/누리호|발사체/.test(actions);
  const temple=/황룡사|불국사|감은사|흥륜사|사찰|사원/.test(actions)&&event.archetype==='construction';
  const rail=modern&&/지하철|철도|열차/.test(actions),industry=modern&&/제철|고로|공업단지|공업센터|원자력발전소/.test(actions);
  const groundbreaking=industry&&/기공식/.test(actions),power=industry&&/원자력발전소/.test(actions);
  const music=!sea&&/가얏고|가야금|음악 전습/.test(actions)&&/가르|배우|배운|전습/.test(actions);
  const relief=!sea&&/구휼/.test(actions)&&/곡식|구휼미/.test(actions);
  const road=modern&&/고속도로/.test(actions),personalFire=/분신|자해/.test(actions),blockFire=/대장경판|경판|판목/.test(actions)&&event.effects.fire?.enabled;
  const paperFire=blockFire||personalFire&&/화형식|법전.*태/.test(actions);
  const kiln=/백자|관요|사기제조장|분원리/.test(actions),irrigation=/벽골제|청못|청제|수리 시설|관개/.test(actions);
  const invaders=event.effects.attack?.enabled||[...(event.sides||[]),...event.participants].some(p=>p.side==='invader'&&p.presence==='on-site');
  const harbor=!sea&&['construction','naval'].includes(event.archetype)&&event.effects.ships?.enabled;
  const teaching=!sea&&/강학|강의|교육|서당|서원|성균관|학교|학사/.test(actions)&&['court','publication','assembly'].includes(event.archetype);
  const market=!sea&&/장시|시장|교역|무역|상업/.test(actions)&&['court','construction'].includes(event.archetype);
  const fortress=event.visualActions?.fortress;
  const compositionKind=fortress?'fortress':music?'music':relief?'relief':kiln?'kiln':irrigation?'irrigation':launch?'launch':temple?'temple':rail?'rail':groundbreaking?'groundbreaking':power?'power':industry?'industry':road?'road':harbor?'harbor':teaching?'teaching':market?'market':event.archetype;
  let displayScale=event.scenePlace?.displayScale||1;
  if(sea){
    let clearance=35;
    for(let r=.1;r<35;r*=1.25){
      if(Array.from({length:24},(_,i)=>i*Math.PI/12).some(a=>world.contains(position.x+Math.cos(a)*r,position.z+Math.sin(a)*r))){clearance=r/1.25;break;}
    }
    displayScale=Math.min(displayScale,clearance/48);
  }
  if(event.compact)displayScale*=.16;
  const radius=event.archetype==='settlement'?SETTLEMENT_RADIUS:event.archetype==='tradition'?16:sea?45:['siege','battle'].includes(event.archetype)?36:24;
  if(!event.compact&&Number.isFinite(event.maxRadius))displayScale=Math.min(displayScale,event.maxRadius/radius);
  const model=(archetype,dx,dz,scale=1,extra={})=>{
    if(!modern)archetype=({palace:'korean_hall',house:'korean_house',gatehouse:'korean_gate',academy_hall:'korean_academy',courtyard_house:'korean_courtyard'})[archetype]||archetype;
    dx*=displayScale;dz*=displayScale;scale*=displayScale;
    let x=position.x+dx,z=position.z+dz;
    const onWater=extra.medium?extra.medium==='sea':sea;
    if(!onWater&&!world.contains(x,z)){
      if(event.archetype==='settlement')return;
      x=position.x+dx*.4;z=position.z+dz*.4;
      if(!world.contains(x,z))return;
    }
    if(onWater&&world.contains(x,z))return;
    const p=new THREE.Vector3(x,onWater?world.seaLevel:world.surfaceAt(x,z),z);
    const row={archetype,position:p,scale,...extra,lift:(extra.lift||0)*displayScale};models.push(row);occupied.push({...p,radius:(archetype==='spearman'?1.7:3)*displayScale});
    return row;
  };
  const standard=(row,side,lift=0)=>{
    if(!row)return;
    const flag=new THREE.Mesh(new THREE.BoxGeometry(2.8,.9,.12),new THREE.MeshStandardMaterial({color:side==='invader'?'#9a4435':row.fleet==='ming'?'#a58030':'#346978',roughness:1}));
    flag.position.copy(row.position);flag.position.y+=(lift+2)*displayScale;flag.scale.setScalar(displayScale);
    flag.name='event-side-'+side;flag.userData.fleet=row.fleet||side;group.add(flag);
  };
  if(sea){
    model(shipType,-13,0,1.5,{primary:true,side:'naval',fleet:alliedFleet?'joseon':undefined});
    const opposingFleet=[...(event.sides||[]),...event.participants].some(p=>p.side==='invader');
    if(!event.compact&&event.effects.ships?.enabled){
      for(const [x,z,s,side] of [[-24,-15,1.1,'naval'],[-22,17,1.2,'naval'],[17,-14,1.15,'invader'],[24,0,1.05,'invader'],[19,18,1.1,'invader']]){
        if(side!=='invader'||opposingFleet)model(shipType,x,z,s,{side,fleet:alliedFleet&&side==='naval'?(z>0?'ming':'joseon'):undefined});
      }
    }
    models.filter(m=>m.archetype===shipType).forEach(m=>standard(m,m.side,modern?3:7));
    if(!event.compact&&/상륙/.test(event.label)){
      let shore=null;
      for(let r=3;r<90&&!shore;r+=2)for(let i=0;i<32;i++){
        const a=i*Math.PI/16,dx=Math.cos(a)*r,dz=Math.sin(a)*r;
        if(world.contains(position.x+dx*displayScale,position.z+dz*displayScale)){shore={dx,dz};break;}
      }
      if(shore)for(let i=0;i<6;i++)model(modern?'human':'spearman',shore.dx+(i%3)*2,shore.dz+Math.floor(i/3)*2,1.2,{medium:'land',side:'naval',action:'walking'});
    }
  }else if(event.archetype==='tradition'){
    const motif=event.narrative.id.replace('nar-syj136-','');
    const primary={gujibong:'story_egg',cheoyong:'hanging_scroll',seodong:'period_figure',samseong:'story_hollows',
      nakhwaam:'story_rock',ondal:'wall',gwaneumsa:'pagoda',mangbuseok:'standing_stone',arang:'korean_house'}[motif]||'book';
    model(primary,0,0,2,{primary:true});
    if(!event.compact){
      model('book',8,5,1.2);
      if(['gujibong','cheoyong','nakhwaam','arang'].includes(motif))model(motif==='arang'?'oak':'pine',-8,-5,1.1);
      if(motif==='gujibong')model('story_rock',-5,3,.65);
      if(motif==='seodong')model('korean_house',-8,-6,.85);
      if(motif==='ondal')model('period_commander',3,5,1.5);
      if(motif==='gwaneumsa')model('period_monk',-7,4,1.5);
      if(motif==='mangbuseok')model('korean_house',-9,-6,.7);
    }
  }else if(music){
    model('string_instrument',-8,0,2,{primary:true});
    if(!event.compact)model('string_instrument',2,7,1.7);
  }else if(relief){
    model('grain_stack',0,0,2.4,{primary:true});
    if(!event.compact){
      model('grain_stack',-9,-2,1.8);model('handcart',-13,6,1.2);model('table',5,4,1.5);
      for(const [x,z] of [[4,8],[10,11],[7,16],[-1,13]])model(modern?'modern_figure':'period_figure',x,z,1.6,{action:'working'});
    }
  }else if(event.archetype==='excavation'){
    model('dig_site',0,0,2,{primary:true});
    if(!event.compact){
      model('dig_site',-15,-9,1.2);model('table',13,2,1.2);model('book',13,2,1,{lift:2});
      model('groundbreaking',-10,10,.9);
      for(const [x,z] of [[-8,3],[5,-7],[12,6]])model('modern_figure',x,z,1.6,{action:'working'});
    }
  }else if(fortress){
    model('gatehouse',0,10,1.4,{primary:true});
    if(!event.compact){
      const width=18+(event.scenePlace.label.length%3)*3;
      for(const x of [-width,-9,9,width]){model('wall',x,10,1);model('wall',x,-17,1);}
      for(const x of [-width-4,width+4])for(const z of [-10,-1,6])model('fort_wall_side',x,z,1);
      model('rural_store',-9,-6,1.4);model('korean_house',10,-5,1.2);
      if(event.visualActions.construction){
        model('handcart',-12,18,1.3);model('groundbreaking',8,17,1.2);
        for(const [x,z] of [[-14,6],[12,15],[18,-12]])model('period_figure',x,z,1.5,{action:'working'});
      }else if(event.archetype==='court'){model('table',0,-4,1.5);model('book',0,-4,1.2,{lift:2.5});}
    }
  }else if(event.archetype==='settlement'){
    for(const {archetype,x,z,scale,...extra} of settlementLayout(event))model(archetype,x,z,scale,extra);
    if(!event.compact){
      const patches=[];
      for(const x of [-48,-40,-8,0,8,40,48])for(const z of [47,55,63]){
        const px=position.x+x*displayScale,pz=position.z+z*displayScale;
        if(world.contains(px,pz)&&world.contains(px+3*displayScale,pz+2*displayScale))patches.push([px,world.surfaceAt(px,pz)+.05*displayScale,pz]);
      }
      const fields=new THREE.InstancedMesh(new THREE.BoxGeometry(5*displayScale,.08*displayScale,3*displayScale),new THREE.MeshStandardMaterial({color:'#8c9252',roughness:1}),patches.length);
      const matrix=new THREE.Matrix4();patches.forEach((p,i)=>fields.setMatrixAt(i,matrix.makeTranslation(...p)));
      fields.name='city-symbolic-fields';group.add(fields);
      const lanes=[];
      for(let i=-8;i<=8;i++)for(const [x,z,sx,sz] of [[i*5,6,4.6,1],[-18,i*5,1,4.6],[18,i*5,1,4.6]]){
        const px=position.x+x*displayScale,pz=position.z+z*displayScale;
        if(world.contains(px,pz))lanes.push([px,world.surfaceAt(px,pz)+.06*displayScale,pz,sx,sz]);
      }
      const street=new THREE.InstancedMesh(new THREE.BoxGeometry(1.1*displayScale,.06*displayScale,1.1*displayScale),new THREE.MeshStandardMaterial({color:'#ad9e7e',roughness:1}),lanes.length);
      lanes.forEach(([x,y,z,sx,sz],i)=>{matrix.makeScale(sx,1,sz);matrix.setPosition(x,y,z);street.setMatrixAt(i,matrix);});street.name='city-local-lanes';group.add(street);
    }
  }else if(kiln){
    model('rural_store',0,-9,2,{primary:true});
    if(!event.compact){
      const kiln=new THREE.Mesh(new THREE.CylinderGeometry(3,4,3.5,10),new THREE.MeshStandardMaterial({color:'#a48768',roughness:1}));
      kiln.scale.setScalar(displayScale);kiln.position.set(position.x-10*displayScale,world.surfaceAt(position.x-10*displayScale,position.z)+1.75*displayScale,position.z);group.add(kiln);
      for(const x of [-1,8,17]){model('table',x,5,1.5);for(let i=0;i<3;i++){
        const jar=new THREE.Mesh(new THREE.SphereGeometry(.6,8,6),new THREE.MeshStandardMaterial({color:'#e4dfc9',roughness:.6}));
        jar.scale.set(displayScale*.8,displayScale,displayScale*.8);jar.position.set(position.x+(x+i*1.4-1.4)*displayScale,world.surfaceAt(position.x+x*displayScale,position.z+5*displayScale)+2.8*displayScale,position.z+5*displayScale);group.add(jar);
      }}
      model('handcart',-12,10,1.1);for(let i=0;i<5;i++)model('human',-5+i*5,12,1.4,{action:'working'});
    }
  }else if(irrigation){
    model('rural_hut',-20,-9,1.5,{primary:true});
    if(!event.compact){
      const water=new THREE.Mesh(new THREE.PlaneGeometry(34*displayScale,19*displayScale),new THREE.MeshStandardMaterial({color:'#668f8e',roughness:.6,side:THREE.DoubleSide}));
      water.rotation.x=-Math.PI/2;water.position.set(position.x,position.y+.15*displayScale,position.z);water.userData.fanGround=true;group.add(water);
      for(let i=0;i<10;i++){
        const x=position.x+(-19+i*4)*displayScale,z=position.z+11*displayScale;
        const bank=new THREE.Mesh(new THREE.BoxGeometry(4.1*displayScale,1.8*displayScale,3*displayScale),new THREE.MeshStandardMaterial({color:'#958764',roughness:1}));
        bank.position.set(x,world.surfaceAt(x,z)+.9*displayScale,z);group.add(bank);
      }
      if(event.visualActions?.constructionYears?.includes(event.year)){model('handcart',-12,17,1.2);for(let i=0;i<5;i++)model('human',-8+i*4,16,1.4,{action:'working'});}
    }
  }else if(launch){
    model('rocket',0,0,1.7,{primary:true});
    if(!event.compact){model('civic_hall',18,-14,1);model('car',16,6,1.2);
      for(let i=0;i<4;i++)model('human',12+i*4,13,1.5);}
  }else if(temple){
    model('pagoda',0,0,1.8,{primary:true});
    if(!event.compact){model('academy_hall',0,-16,1.8);model('handcart',15,9,1.1);
      for(let i=0;i<6;i++)model('human',-12+i*5,12,1.5,{action:'working'});}
  }else if(rail||road){
    model(rail?'station':'civic_hall',0,-10,1.4,{primary:true});
    if(!event.compact){
      const length=65*displayScale,width=(rail?4:8)*displayScale;
      const base=new THREE.Mesh(new THREE.BoxGeometry(length,.12*displayScale,width),new THREE.MeshStandardMaterial({color:rail?'#817765':'#777b76',roughness:1}));
      base.position.set(position.x,position.y+.07*displayScale,position.z+8*displayScale);group.add(base);
      for(const x of [-20,0,20])model(rail?'train':'car',x,8,rail?.9:1.2);
      for(let i=0;i<8;i++)model('human',-13+i*4,-1,1.5);
      model('banner',-15,0,1.5);model('banner',15,0,1.5);
    }
  }else if(groundbreaking){
    model('groundbreaking',0,0,2.4,{primary:true});
  }else if(power){
    const building=event.year<event.endYear?'building_frame':'power_facility';
    model(building,0,0,2,{primary:true});
    if(!event.compact&&building==='building_frame')model('groundbreaking',-13,8,1.3);
  }else if(industry){
    model('steelworks',0,0,1.6,{primary:true});
    if(!event.compact){model('civic_hall',18,-7,1.0);model('car',14,13,1.2);
      for(let i=0;i<6;i++)model('human',-12+i*5,12,1.5,{action:'working'});}
  }else if(personalFire||blockFire){
    model(paperFire?'book':'banner',0,0,paperFire?1.5:2,{primary:true});
    if(!event.compact){model(blockFire?'academy_hall':'market',0,-12,1.5);for(let i=0;i<6;i++)model(blockFire?'book':'human',-9+i*4,5,1.5);}
  }else if(harbor){
    model('courtyard_house',0,0,1.4,{primary:true});
    if(!event.compact){
      let shore=null;
      for(let r=1;r<48&&!shore;r+=1)for(let i=0;i<48;i++){
        const angle=i*Math.PI/24,dx=Math.cos(angle)*r,dz=Math.sin(angle)*r;
        if(!world.contains(position.x+dx*displayScale,position.z+dz*displayScale)){
          shore={dx,dz,angle};break;
        }
      }
      model('table',-8,6,1.5);model('handcart',8,5,1.1);
      for(let i=0;i<4;i++)model('human',-10+i*5,8,1.5,{action:'working',side:'naval'});
      if(shore){
        const {dx,dz,angle}=shore;
        model('boat_slip',dx*.7,dz*.7,1.0);
        for(let i=0;i<3;i++){
          const sx=dx+Math.cos(angle)*(8+i*8),sz=dz+Math.sin(angle)*(8+i*8);
          model(i?'boat':'ship',sx,sz,i?.8:1.1,{medium:'sea',side:'naval'});
        }
      }
      for(let i=0;i<5;i++){
        const timber=new THREE.Mesh(new THREE.BoxGeometry(5,.55,.7),new THREE.MeshStandardMaterial({color:'#97764c',roughness:1}));
        timber.scale.setScalar(displayScale);timber.position.set(position.x-5*displayScale,position.y+(.4+i%2*.6)*displayScale,position.z+(11+i*.8)*displayScale);
        group.add(timber);
      }
    }
  }else if(event.archetype==='battle'){
    model('banner',0,0,1.8,{primary:true,side:'defender'});
    if(!event.compact){
      for(let i=0;i<10;i++)model(soldier,-20+(i%5)*8,-8-Math.floor(i/5)*7,1.5,{side:'defender',action:event.effects.attack?.enabled&&i<3?'defending':'idle'});
      if(invaders)for(let i=0;i<10;i++)model(soldier,-17+(i%5)*8,13+Math.floor(i/5)*7,1.5,{side:'invader',action:event.effects.attack?.enabled&&i<3?'attacking':'idle'});
      standard(model('banner',-24,-12,1.8),'defender',4);if(invaders)standard(model('banner',24,18,1.8),'invader',4);
    }
  }else if(event.archetype==='siege'){
    model('gatehouse',0,0,1.55,{primary:true});
    if(!event.compact){
    for(const x of [-19,-9,9,19])model('wall',x,1,1.0);
    for(const x of [-25,25])for(let z=-3;z>=-25;z-=2){
      const px=position.x+x*displayScale,pz=position.z+z*displayScale;
      if(!world.contains(px,pz))continue;
      const wall=new THREE.Mesh(new THREE.BoxGeometry(1.5,4.1,2.2),new THREE.MeshStandardMaterial({color:'#91836a',roughness:1}));
      wall.scale.setScalar(displayScale);wall.position.set(px,world.surfaceAt(px,pz)+2*displayScale,pz);group.add(wall);
    }
    for(const [x,z] of [[-15,-13],[1,-15],[15,-11],[-10,-24],[12,-25]])model('house',x,z,.9,{path:true});
    {
      if(invaders)for(let i=0;i<10;i++)model(soldier,-17+(i%5)*7,19+Math.floor(i/5)*7,1.5,{side:'invader',action:event.effects.attack?.enabled&&i<3?'attacking':'idle'});
      for(let i=0;i<7;i++)model(soldier,-19+i*6,-4,1.5,{side:'defender',action:event.effects.attack?.enabled&&i<3?'defending':'idle'});
      if(invaders)standard(model('banner',-20,22,1.8),'invader',4);standard(model('banner',20,-6,1.8),'defender',4);
    }
    }
  }else if(teaching){
    model('academy_hall',0,-6,1.7,{primary:true});
    if(!event.compact){
      model('table',0,5,1.6);model('book',0,5,1.5,{lift:2.5});
      for(let i=0;i<9;i++)model('scribe',-9+(i%3)*8,12+Math.floor(i/3)*6,1.4,{action:'working'});
    }
  }else if(market){
    model('market',0,0,1.8,{primary:true});
    if(!event.compact){
      for(const x of [-16,16]){model('market',x,1,1.3);model('handcart',x,9,1.0);}
      for(let i=0;i<9;i++)model('human',-15+(i%5)*7,10+Math.floor(i/5)*6,1.5,{action:i%3?'walking':'working'});
    }
  }else if(event.archetype==='publication'){
    model('table',0,0,2.5,{primary:true});
    if(!event.compact){
      model('academy_hall',0,-13,1.7);
      for(const x of [-7,7]){model('table',x,0,1.5);model('book',x,0,1.4,{lift:2.6});}
      model('handcart',12,6,1.2);model('book',0,0,2,{lift:3.3});
      for(let i=0;i<4;i++){
        const paper=new THREE.Mesh(new THREE.BoxGeometry(2.8,.45,2),new THREE.MeshStandardMaterial({color:'#f3e6bf',roughness:1}));
        paper.scale.setScalar(displayScale);paper.position.set(position.x+(5+i%2*3)*displayScale,world.surfaceAt(position.x,position.z)+(3+i*.5)*displayScale,position.z+2*displayScale);group.add(paper);
      }
    }
  }else{
    model(modern?'civic_hall':event.archetype==='court'?'palace':'courtyard_house',0,0,1.8,{primary:true});
    if(!event.compact){
    for(const [x,z] of [[-16,-9],[16,-10],[-19,11],[17,15]])model('house',x,z,.9,{path:true});
    if(event.archetype==='assembly'&&event.id!=='scene-jl-donghak-yongdam-1860')for(let i=0;i<15;i++)model('human',-11+(i%5)*5,12+Math.floor(i/5)*5,1.5);
    if(event.archetype==='construction'){
      model('handcart',10,9,1.3);model('table',-10,10,1.3);
      for(let i=0;i<6;i++)model('human',-12+i*5,14,1.5,{action:'working'});
    }
    if(event.archetype==='court')for(let i=0;i<8;i++)model(modern?'human':'scribe',-12+(i%4)*8,10+Math.floor(i/4)*6,1.5);
    }
  }
  if(!event.compact&&event.visualActions?.fireTargets?.includes('rural_store'))model('rural_store',-8,-16,1.5);
  if(!sea&&!harbor&&!event.compact&&event.effects.ships?.enabled){
    let shore=null;
    for(let r=3;r<48&&!shore;r+=2)for(let i=0;i<48;i++){
      const angle=i*Math.PI/24,dx=Math.cos(angle)*r,dz=Math.sin(angle)*r;
      if(!world.contains(position.x+dx*displayScale,position.z+dz*displayScale)){shore={dx,dz,angle};break;}
    }
    if(shore)for(let i=0;i<3;i++){
      const side=[...(event.sides||[]),...event.participants].some(p=>p.side==='invader')?'invader':'naval';
      const ship=model(shipType,shore.dx+Math.cos(shore.angle)*(4+i*6),shore.dz+Math.sin(shore.angle)*(4+i*6),1,{medium:'sea',side});
      standard(ship,side,modern?3:7);
    }
  }
  if(!event.compact&&event.effects.fire?.enabled&&(!personalFire||paperFire)){
    for(const target of models.filter(m=>event.visualActions?.fireTargets?event.visualActions.fireTargets.includes(m.archetype):paperFire?m.archetype==='book':sea?m.archetype===shipType&&m.side==='invader':['house','korean_house','courtyard_house','korean_courtyard','palace','korean_hall','civic_hall'].includes(m.archetype)).slice(0,3)){
      const p=target.position.clone();p.y+=(paperFire?.4:sea?2:3)*displayScale;
      fireAt(group,p,(paperFire?.2:sea?1.2:1.5)*displayScale,animated);
      group.children.at(-1).userData.targetSide=target.side||null;
    }
  }
  const actorCounts={};
  for(const person of event.compact?[]:event.participants.filter(p=>p.presence==='on-site')){
    const side=person.side||'civilian',index=actorCounts[side]||0;actorCounts[side]=index+1;
    if(sea){
      const affiliation=alliedFleet&&side==='naval'?(/명나라 수군|명 수군/.test(person.role)?'ming':'joseon'):null;
      const fleet=models.filter(m=>m.archetype===shipType&&m.side===side&&(!affiliation||m.fleet===affiliation)),ship=fleet[index%fleet.length];
      if(!ship)continue;
      const berth=Math.floor(index/fleet.length),dx=berth?(berth%2?-.5:.5)*ship.scale/displayScale:0,dz=berth?(Math.floor((berth-1)/2)+1)*.65*ship.scale/displayScale:0;
      const row=model(person.archetype,(ship.position.x-position.x)/displayScale+dx,(ship.position.z-position.z)/displayScale+dz,1.05,{person,side,lift:(modern?1.9:2.2)*ship.scale/displayScale});
      if(row){row.shipSide=ship.side;row.fleet=ship.fleet;}
    }else if(music){
      const teacher=/가르친|악사/.test(person.role),instrument=/가얏고|가야금/.test(person.role),dance=/춤/.test(person.role);
      const [dx,dz]=teacher?[-8,-3]:instrument?[2,4]:dance?[12,11]:[10,-3];
      model(person.archetype,dx,dz,2.4,{person,side,action:teacher||instrument?'working':dance?'walking':'idle'});
    }else{
      const dx=-7+index*6,dz=event.archetype==='publication'?4:side==='invader'?22:side==='civilian'?4:-6;
      model(person.archetype,dx,dz,2.4,{person,side,action:event.archetype==='publication'?'working':'idle'});
    }
  }
  const anonymousRoles={human:'commoner',period_figure:'commoner',modern_figure:'commoner',spearman:'soldier',rifle_soldier:'soldier',period_commander:'commander',period_scholar:'scholar',period_monk:'monk',period_ruler:'ruler'};
  for(const [seed,row] of models.entries())if(!row.person){
    const role=anonymousRoles[row.archetype];
    row.archetype=role?figureArchetype(role,event.year):buildingArchetype(row.archetype,event.year,{seed,latitude:event.scenePlace?.coordinates?.[1]});
  }
  return {group,animated,models,occupied,compositionKind,displayScale,radius:radius*displayScale,
    focusDistance:Math.max(.1,(event.archetype==='settlement'?220:sea?145:harbor?150:groundbreaking?60:music||['publication','tradition'].includes(event.archetype)?85:relief||power?95:115)*displayScale)};
}
