import * as THREE from 'three';

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
  const sea=event.scenePlace?.medium==='sea'||event.archetype==='naval';
  let displayScale=event.scenePlace?.displayScale||1;
  if(sea){
    let clearance=35;
    for(let r=.1;r<35;r*=1.25){
      if(Array.from({length:24},(_,i)=>i*Math.PI/12).some(a=>world.contains(position.x+Math.cos(a)*r,position.z+Math.sin(a)*r))){clearance=r/1.25;break;}
    }
    displayScale=Math.min(displayScale,clearance/48);
  }
  if(event.compact)displayScale*=.16;
  const radius=sea?45:['siege','battle'].includes(event.archetype)?36:24;
  const model=(archetype,dx,dz,scale=1,extra={})=>{
    dx*=displayScale;dz*=displayScale;scale*=displayScale;
    let x=position.x+dx,z=position.z+dz;
    if(!sea&&!world.contains(x,z)){
      x=position.x+dx*.4;z=position.z+dz*.4;
      if(!world.contains(x,z))return;
    }
    if(sea&&world.contains(x,z))return;
    const p=new THREE.Vector3(x,sea?world.seaLevel:world.surfaceAt(x,z),z);
    const row={archetype,position:p,scale,...extra,lift:(extra.lift||0)*displayScale};models.push(row);occupied.push({...p,radius:(archetype==='spearman'?1.7:3)*displayScale});
    return row;
  };
  const standard=(row,side,lift=0)=>{
    if(!row)return;
    const flag=new THREE.Mesh(new THREE.BoxGeometry(2.8,.9,.12),new THREE.MeshStandardMaterial({color:side==='invader'?'#9a4435':'#346978',roughness:1}));
    flag.position.copy(row.position);flag.position.y+=(lift+2)*displayScale;flag.scale.setScalar(displayScale);
    flag.name='event-side-'+side;group.add(flag);
  };
  if(sea){
    model('ship',-13,0,1.5,{primary:true,side:'naval'});
    if(!event.compact&&event.effects.ships?.enabled){
      for(const [x,z,s,side] of [[-24,-15,1.1,'naval'],[-22,17,1.2,'naval'],[17,-14,1.15,'invader'],[24,0,1.05,'invader'],[19,18,1.1,'invader']])model('ship',x,z,s,{side});
    }
    models.filter(m=>m.archetype==='ship').forEach(m=>standard(m,m.side,7));
  }else if(['siege','battle'].includes(event.archetype)){
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
      for(let i=0;i<10;i++)model('spearman',-17+(i%5)*7,19+Math.floor(i/5)*7,1.5,{side:'invader',action:event.effects.attack?.enabled&&i<3?'attacking':'idle'});
      for(let i=0;i<7;i++)model('spearman',-19+i*6,-4,1.5,{side:'defender',action:event.effects.attack?.enabled&&i<3?'defending':'idle'});
      standard(model('banner',-20,22,1.8),'invader',4);standard(model('banner',20,-6,1.8),'defender',4);
    }
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
    model(event.archetype==='court'?'palace':'courtyard_house',0,0,1.8,{primary:true});
    if(!event.compact){
    for(const [x,z] of [[-16,-9],[16,-10],[-19,11],[17,15]])model('house',x,z,.9,{path:true});
    if(event.archetype==='assembly')for(let i=0;i<15;i++)model('human',-11+(i%5)*5,12+Math.floor(i/5)*5,1.5);
    if(event.archetype==='construction'){model('handcart',10,9,1.3);model('table',-10,10,1.3);}
    }
  }
  if(!event.compact&&event.effects.fire?.enabled){
    for(const target of models.filter(m=>sea?m.archetype==='ship'&&m.side==='invader':['house','courtyard_house','palace'].includes(m.archetype)).slice(0,3)){
      const p=target.position.clone();p.y+=(sea?2:3)*displayScale;
      fireAt(group,p,(sea?1.2:1.5)*displayScale,animated);
      group.children.at(-1).userData.targetSide=target.side||null;
    }
  }
  const actorCounts={};
  for(const person of event.compact?[]:event.participants.filter(p=>p.presence==='on-site')){
    const side=person.side||'civilian',index=actorCounts[side]||0;actorCounts[side]=index+1;
    if(sea){
      const ship=models.filter(m=>m.archetype==='ship'&&m.side===side)[index%3];
      if(!ship)continue;
      const row=model(person.archetype,(ship.position.x-position.x)/displayScale,(ship.position.z-position.z)/displayScale,.75,{person,side,lift:2.7*ship.scale/displayScale});
      if(row)row.shipSide=ship.side;
    }else{
      const dx=-7+index*6,dz=event.archetype==='publication'?4:side==='invader'?22:-6;
      model(person.archetype,dx,dz,1.9,{person,side,action:event.archetype==='publication'?'working':'idle'});
    }
  }
  return {group,animated,models,occupied,radius:radius*displayScale,focusDistance:Math.max(.1,(sea?145:event.archetype==='publication'?85:115)*displayScale)};
}
