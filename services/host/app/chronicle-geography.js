import * as THREE from 'three';

export function ridgeSegments(data,toWorld){
  return (data?.ridges||[]).flatMap(ridge=>{
    const lines=ridge.geometry?.type==='MultiLineString'?ridge.geometry.coordinates:[ridge.geometry?.coordinates||[]];
    return lines.flatMap(line=>line.slice(1).map((p,i)=>({a:toWorld(...line[i]),b:toWorld(...p)})));
  });
}

export function ridgeRelief(x,z,segments){
  let nearest=Infinity;
  for(const {a,b} of segments){
    const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));
    nearest=Math.min(nearest,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz));
  }
  return Math.exp(-Math.pow(nearest/16,2));
}

export class ChronicleGeography{
  constructor(world,engine,data){
    this.world=world;this.engine=engine;this.data=data;this.markers=[];
    const host=document.getElementById('sceneGeography'),menu=document.getElementById('geographyDestination');
    menu.replaceChildren(new Option('산맥·섬으로 이동',''));
    for(const row of [...data.islands,...data.ridges]){
      const line=row.geometry?.type==='LineString'?row.geometry.coordinates:row.geometry?.type==='MultiLineString'?row.geometry.coordinates[0]:null;
      const coordinate=row.lon!=null?[row.lon,row.lat]:line?.[Math.floor(line.length/2)];
      if(!coordinate)continue;
      const [x,z]=world.toWorld(...coordinate),position=new THREE.Vector3(x,world.surfaceAt(x,z)+.8,z);
      const button=document.createElement('button');button.className='scene-geography';button.textContent=row.label;
      button.dataset.geography=row.id;button.onclick=()=>this.focus(row.id);host.append(button);
      this.markers.push({row,button,position});menu.add(new Option(row.label,row.id));
    }
    menu.onchange=()=>{if(menu.value)this.focus(menu.value);};
    document.getElementById('geographyClose').onclick=()=>{document.getElementById('geographyCard').hidden=true;};
  }
  focus(id){
    const marker=this.markers.find(m=>m.row.id===id);if(!marker)return false;
    const {row,position}=marker,island=this.data.islands.includes(row);
    this.engine.flyTo(position.clone(),island?(row.areaKm2<1?9:48):180,650);
    document.getElementById('geographyDestination').value=id;
    const card=document.getElementById('geographyCard');card.hidden=false;
    card.querySelector('strong').textContent=row.label;
    card.querySelector('p').textContent=[row.lon!=null?`${row.lat.toFixed(5)}°N · ${row.lon.toFixed(5)}°E`:'',row.displayNote||''].filter(Boolean).join(' · ');
    const refs=card.querySelector('div');refs.replaceChildren();
    const more=document.createElement('details'),summary=document.createElement('summary');
    summary.textContent='위치 자료 더 보기';more.append(summary);
    let shown=0;
    for(const sid of row.sourceIds||[]){
      const source=this.data.sources.find(s=>s.id===sid);if(!source)continue;
      const link=document.createElement('a');link.textContent=source.title;link.title=source.publisher+' · '+source.title;
      link.href=source.url;link.target='_blank';link.rel='noopener';
      (shown++<2?refs:more).append(link);
    }
    if(shown>2)refs.append(more);
    return true;
  }
  update(camera,canvas,occupied){
    const distance=camera.position.distanceTo(this.engine.controls.target),w=canvas.clientWidth,h=canvas.clientHeight;
    for(const {row,button,position} of this.markers){
      const p=position.clone().project(camera),island=this.data.islands.includes(row);
      button.hidden=p.z< -1||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1||(!island&&distance<90);
      if(button.hidden)continue;
      const x=(p.x+1)*w/2,y=(1-p.y)*h/2,bw=button.offsetWidth,bh=button.offsetHeight;
      const rect={left:x-bw/2,right:x+bw/2,top:y-bh,bottom:y};
      button.hidden=occupied.some(r=>r.left<rect.right+4&&r.right>rect.left-4&&r.top<rect.bottom+4&&r.bottom>rect.top-4);
      if(!button.hidden){button.style.left=x+'px';button.style.top=y+'px';occupied.push(rect);}
    }
  }
}
