import * as THREE from 'three';
import {territoryAnchor,territoryName} from './territory-label-geometry.js';
export class TerritoryLabels{
  constructor(world){
    this.world=world;this.markers=[];this.cache=new Map();
    this.host=document.createElement('div');this.host.className='territory-labels';this.host.setAttribute('aria-label','국가 영역 이름');
    document.getElementById('sceneGeography').parentElement.append(this.host);
    if(!document.querySelector('link[data-territory-labels]')){
      const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('./territory-labels.css',import.meta.url).href;style.dataset.territoryLabels='';document.head.append(style);
    }
    this.projected=new THREE.Vector3();this.edge=new THREE.Vector3();
  }
  setFeatures(features){
    this.host.replaceChildren();this.markers=[];
    for(const feature of features){
      if(!this.cache.has(feature.id))this.cache.set(feature.id,territoryAnchor(feature,(x,y)=>this.world.toWorld(x,y),(x,z)=>this.world.contains(x,z,1)));
      const anchor=this.cache.get(feature.id);if(!anchor)continue;
      const label=document.createElement('span');label.className='territory-label';label.textContent=territoryName(feature);label.dataset.territory=feature.id;label.hidden=true;
      this.host.append(label);
      this.markers.push({label,anchor,position:new THREE.Vector3(anchor.x,this.world.surfaceAt(anchor.x,anchor.z)+.8,anchor.z)});
    }
  }
  setDisplay(visible){this.host.hidden=!visible;}
  update(camera,canvas,occupied=[]){
    if(this.host.hidden)return;
    const width=canvas.clientWidth,height=canvas.clientHeight;
    for(const marker of this.markers){
      const {label,position,anchor}=marker,p=this.projected.copy(position).project(camera);
      label.hidden=true;
      if(p.z< -1||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1)continue;
      const x=(p.x+1)*width/2,y=(1-p.y)*height/2;
      // Suppress labels when the polygon interior cannot contain their screen footprint.
      const axes=[];
      for(const [dx,dz] of [[1,0],[0,1]]){
        const edge=this.edge.copy(position);edge.x+=anchor.clearance*dx;edge.z+=anchor.clearance*dz;edge.project(camera);
        axes.push([(edge.x-p.x)*width/2,(edge.y-p.y)*height/2]);
      }
      const a=axes[0][0]**2+axes[0][1]**2,b=axes[1][0]**2+axes[1][1]**2,c=axes[0][0]*axes[1][0]+axes[0][1]*axes[1][1];
      const radius=Math.sqrt(Math.max(0,(a+b-Math.sqrt((a-b)**2+4*c*c))/2));
      const font=Math.max(15,Math.min(24,radius*.35));label.style.fontSize=font+'px';
      label.hidden=false;
      const w=label.offsetWidth,h=label.offsetHeight,rect={left:x-w/2,right:x+w/2,top:y-h/2,bottom:y+h/2};
      if(radius<Math.hypot(w,h)/2||rect.left<0||rect.right>width||rect.top<0||rect.bottom>height
        ||occupied.some(r=>r.left<rect.right+5&&r.right>rect.left-5&&r.top<rect.bottom+5&&r.bottom>rect.top-5)){label.hidden=true;continue;}
      label.style.left=x+'px';label.style.top=y+'px';occupied.push(rect);
    }
  }
}
