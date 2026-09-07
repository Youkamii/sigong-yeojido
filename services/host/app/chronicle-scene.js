import {escapeHtml as esc} from './html.js';
import {entityLabel} from './chronicle.js';

// Labels follow cited event locations as the user rotates the 3D scene.
export class ChronicleScene {
  constructor(host,onSelect){this.host=host;this.onSelect=onSelect;this.markers=[];}
  refresh(world,chronicle){
    this.host.replaceChildren();this.markers=[];
    for(const target of world.historyTargets){
      const feature=target.userData.feature;
      if(feature.geometry.type!=='Point'||!feature.properties.eventId)continue;
      const event=chronicle.data.entities.find(e=>e.id===feature.properties.eventId);
      if(!event)continue;
      const people=chronicle.relations(event.id).filter(x=>x.target.type==='Person').map(x=>entityLabel(x.target));
      const button=document.createElement('button');button.className='scene-event';
      button.dataset.sceneEvent=event.id;
      button.innerHTML=`<span class="scene-event-year">${chronicle.year}년 · 사건</span><strong>${esc(entityLabel(event))}</strong>
        ${people.length?`<span>${esc([...new Set(people)].join(' · '))}</span>`:''}<small>관련 장소 · 눌러서 살펴보기</small>`;
      button.onclick=()=>this.onSelect(event.id);
      target.geometry.computeBoundingSphere();
      const position=target.geometry.boundingSphere.center.clone();position.y+=5;
      this.host.append(button);this.markers.push({button,position});
    }
  }
  update(camera,canvas){
    const width=canvas.clientWidth,height=canvas.clientHeight;
    for(const {button,position} of this.markers){
      const p=position.clone().project(camera);
      button.hidden=p.z< -1||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1;
      button.style.left=(p.x+1)*width/2+'px';button.style.top=(1-p.y)*height/2+'px';
    }
  }
}
