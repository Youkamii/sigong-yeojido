import * as THREE from 'three';
import {formatCoordinates,latitudeCoordinates} from './history-coordinates.js';
import {activityGeography} from './activity-geography.js';

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
    const positions=latitudeCoordinates(38).map(c=>{
      const [x,z]=world.toWorld(...c);return new THREE.Vector3(x,world.surfaceAt(x,z)+.3,z);
    });
    this.parallel=new THREE.Line(new THREE.BufferGeometry().setFromPoints(positions),
      new THREE.LineDashedMaterial({color:'#b55b40',dashSize:3,gapSize:2,transparent:true,opacity:.85}));
    this.parallel.name='latitude-38';this.parallel.computeLineDistances();this.parallel.visible=false;world.group.add(this.parallel);
    const toggle=document.getElementById('showParallel38');
    toggle.onchange=()=>{this.parallel.visible=toggle.checked;};
    menu.replaceChildren(new Option('지역·산맥·섬으로 이동',''));
    for(const row of [...data.islands,...data.ridges,...(data.peaks||[])])this.addMarker(row);
    menu.onchange=()=>{if(menu.value)this.focus(menu.value);};
    document.getElementById('geographyClose').onclick=()=>{document.getElementById('geographyCard').hidden=true;};
  }
  addMarker(row,region=false){
      const world=this.world,host=document.getElementById('sceneGeography'),menu=document.getElementById('geographyDestination');
      const line=row.geometry?.type==='LineString'?row.geometry.coordinates:row.geometry?.type==='MultiLineString'?row.geometry.coordinates[0]:null;
      const coordinate=row.lon!=null?[row.lon,row.lat]:line?.[Math.floor(line.length/2)];
      if(!coordinate)return;
      const [x,z]=world.toWorld(...coordinate),position=new THREE.Vector3(x,world.surfaceAt(x,z)+.8,z);
      const button=document.createElement('button');button.className='scene-geography';button.textContent=row.label;
      button.dataset.geography=row.id;button.onclick=()=>this.focus(row.id);host.append(button);
      this.markers.push({row,button,position,region});menu.add(new Option(row.label,row.id));
  }
  setActivities(plan){
    const rows=activityGeography(plan),key=JSON.stringify(rows);
    if(this.activityKey===key)return;
    this.activityKey=key;
    const menu=document.getElementById('geographyDestination'),previous=menu.value;
    const selected=this.markers.find(m=>m.row.id===previous);
    for(const marker of this.markers.filter(m=>m.region))marker.button.remove();
    this.markers=this.markers.filter(m=>!m.region);
    for(const option of [...menu.options])if(option.value.startsWith('activity-place:'))option.remove();
    for(const row of rows)this.addMarker(row,true);
    if([...menu.options].some(option=>option.value===previous)){
      menu.value=previous;
      if(selected?.region&&!document.getElementById('geographyCard').hidden)this.showCard(this.markers.find(m=>m.row.id===previous));
    }else if(selected?.region){menu.value='';document.getElementById('geographyCard').hidden=true;}
  }
  focus(id){
    const marker=this.markers.find(m=>m.row.id===id);if(!marker)return false;
    const {row,position,region}=marker,island=this.data.islands.includes(row);
    this.engine.flyTo(position.clone(),region?115:island?(row.areaKm2<1?9:48):180,650);
    document.getElementById('geographyDestination').value=id;
    this.showCard(marker);
    return true;
  }
  showCard({row,region}){
    const card=document.getElementById('geographyCard');card.hidden=false;
    card.querySelector('strong').textContent=row.label;
    card.querySelector('p').textContent=[row.lon!=null?formatCoordinates([row.lon,row.lat]):'',
      region&&row.precision==='area'?'지역 기준점 · 인물의 실제 위치를 뜻하지 않습니다.':'',
      region?row.year+'년 · '+row.activities.map(a=>a.label).join(' / '):row.displayNote||''].filter(Boolean).join(' · ');
    const refs=card.querySelector('div');refs.replaceChildren();
    const more=document.createElement('details'),summary=document.createElement('summary');
    summary.textContent='위치 자료 더 보기';more.append(summary);
    if(row.coordinateNote){const note=document.createElement('p');note.textContent=row.coordinateNote;more.append(note);}
    let shown=0;
    for(const sid of row.sourceIds||[]){
      const source=[...this.data.sources,...(this.world.sceneSources||[]),...(this.world.coordinateRegistry?.sources||[])].find(s=>s.id===sid);if(!source)continue;
      const link=document.createElement('a');link.textContent=source.title;link.title=source.publisher+' · '+source.title;
      link.href=source.url;link.target='_blank';link.rel='noopener';
      (shown++<2?refs:more).append(link);
    }
    if(shown>2||row.coordinateNote)refs.append(more);
  }
  update(camera,canvas,occupied){
    const distance=camera.position.distanceTo(this.engine.controls.target),w=canvas.clientWidth,h=canvas.clientHeight;
    const selectedId=document.getElementById('geographyDestination').value;
    for(const marker of this.markers){
      const {row,button,position,region}=marker;
      const p=position.clone().project(camera),island=this.data.islands.includes(row);
      const selected=selectedId===row.id;
      button.hidden=p.z< -1||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1||(!island&&!region&&distance<90)
        ||(region?this.display?.regions===false:this.display?.geography===false)
        ||(region&&!selected&&(distance<80||distance>420));
      if(button.hidden)continue;
      marker.size||=[button.offsetWidth,button.offsetHeight];
      const x=(p.x+1)*w/2,y=(1-p.y)*h/2,[bw,bh]=marker.size;
      const rect={left:x-bw/2,right:x+bw/2,top:y-bh,bottom:y};
      button.hidden=occupied.some(r=>r.left<rect.right+4&&r.right>rect.left-4&&r.top<rect.bottom+4&&r.bottom>rect.top-4);
      if(!button.hidden){button.style.left=x+'px';button.style.top=y+'px';occupied.push(rect);}
    }
  }
}
