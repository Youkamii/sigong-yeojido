import * as THREE from 'three';
import {yearLabel} from './chronicle.js';
import {TerritoryLabels} from './territory-labels.js';
import {territoryName,visibleTerritories} from './territory-label-geometry.js';
export {territoriesAt} from './territory-label-geometry.js';

const colors={Gojoseon:'#aa7660','Korean Jin':'#afa263',Goguryeo:'#b66d60',Baekje:'#c5a459',Silla:'#5e9ea3',
  'Unified Silla':'#5e9ea3',Balhae:'#9b84b6',Goryeo:'#738cba',Joseon:'#92a265','Korean Empire':'#92a265',
  'Republic of Korea':'#779fb5',"Democratic People's Republic of Korea":'#b97a71',
  'Korea under Japanese rule':'#8a8f96','US Army Military Government in Korea':'#a1bccd',
  'Soviet Civil Administration':'#d0a19a'};
const ringsOf=f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;


export class ChronicleTerritories{
  constructor(world,data){
    this.labels=new TerritoryLabels(world);
    this.world=world;this.records=data.features;this.features=[];this.paths=new Map();this.visible=true;
    this.group=new THREE.Group();this.group.name='chronicle-territories';world.group.add(this.group);
    this.canvas=document.createElement('canvas');this.canvas.width=this.canvas.height=1024;this.context=this.canvas.getContext('2d');
    this.texture=new THREE.CanvasTexture(this.canvas);this.texture.flipY=false;this.texture.colorSpace=THREE.SRGBColorSpace;
    this.texture.generateMipmaps=false;this.texture.minFilter=THREE.LinearFilter;
    const b=world.navigationBounds;this.bounds=new THREE.Vector4(b.minX,b.minZ,b.maxX-b.minX,b.maxZ-b.minZ);
    this.uniforms={territoryMap:{value:this.texture},territoryBounds:{value:this.bounds},territoryEnabled:{value:1}};
    const materials=new Set([world.land.getObjectByName('peninsula-surface').material]);
    for(const mesh of world.neighbors.group.children)materials.add(mesh.material[0]);
    for(const material of materials)this.tintMaterial(material);
    this.legend=document.getElementById('territoryLegend');this.note=document.getElementById('territoryNote');this.stats={redraws:0,records:data.features.length};
  }
  tintMaterial(material){
    const previous=material.onBeforeCompile,cacheKey=material.customProgramCacheKey.bind(material),key=cacheKey();
    material.onBeforeCompile=(shader,renderer)=>{
      previous.call(material,shader,renderer);Object.assign(shader.uniforms,this.uniforms);
      shader.vertexShader='varying vec2 vTerritoryUv;\nuniform vec4 territoryBounds;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvTerritoryUv=((modelMatrix*vec4(transformed,1.0)).xz-territoryBounds.xy)/territoryBounds.zw;');
      shader.fragmentShader='varying vec2 vTerritoryUv;\nuniform sampler2D territoryMap;\nuniform float territoryEnabled;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        if(territoryEnabled>0.5&&all(greaterThanEqual(vTerritoryUv,vec2(0.0)))&&all(lessThanEqual(vTerritoryUv,vec2(1.0)))){
          vec4 territory=texture2D(territoryMap,vTerritoryUv);
          diffuseColor.rgb=mix(diffuseColor.rgb,territory.rgb,territory.a*0.32);
        }`);
    };
    material.customProgramCacheKey=()=>key+':territory-tint';material.needsUpdate=true;
  }
  color(feature){
    const name=feature.properties.sourceRecord.Name;
    return colors[name]||['#b88b70','#8da86d','#a185a8','#719d9d'][name.length%4];
  }
  path(feature){
    if(this.paths.has(feature.id))return this.paths.get(feature.id);
    const path=new Path2D(),b=this.bounds;
    for(const polygon of ringsOf(feature))for(const ring of polygon){
      ring.forEach(([lon,lat],i)=>{
        const [x,z]=this.world.toWorld(lon,lat),px=(x-b.x)/b.z*1024,py=(z-b.y)/b.w*1024;
        if(i)path.lineTo(px,py);else path.moveTo(px,py);
      });path.closePath();
    }
    this.paths.set(feature.id,path);return path;
  }
  border(feature){
    const positions=[],w=this.world;
    for(const polygon of ringsOf(feature))for(const ring of polygon)for(let i=1;i<ring.length;i++){
      const a=w.toWorld(...ring[i-1]),b=w.toWorld(...ring[i]),n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/4));
      for(let j=0;j<n;j++){
        const p=[a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n],q=[a[0]+(b[0]-a[0])*(j+1)/n,a[1]+(b[1]-a[1])*(j+1)/n];
        if(!w.contains(...p)||!w.contains(...q))continue;
        for(const point of [p,q])positions.push(point[0],w.surfaceAt(...point)+.12,point[1]);
      }
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    const line=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:this.color(feature),transparent:true,opacity:.65,depthWrite:false}));
    line.name=feature.id;line.userData.feature=feature;this.group.add(line);
  }
  setYear(year,{origin='all',sources=null}={}){
    this.year=year;
    const features=visibleTerritories(this.records,year,{origin,sources});
    const key=features.map(f=>f.id).join(':');this.stats.year=year;
    if(key!==this.key){
      this.key=key;this.features=features;this.labels.setFeatures(features);this.context.clearRect(0,0,1024,1024);
      for(const old of [...this.group.children]){old.geometry.dispose();old.material.dispose();old.removeFromParent();}
      for(const feature of features){this.context.fillStyle=this.color(feature);this.context.fill(this.path(feature),'evenodd');this.border(feature);}
      this.texture.needsUpdate=true;this.stats.redraws++;
      this.renderLegend();
    }
    this.updateNote();
  }
  update(camera,canvas,occupied){this.labels.update(camera,canvas,occupied);}
  setDisplay(visible){this.labels.setDisplay(visible);this.visible=visible;this.group.visible=visible;this.uniforms.territoryEnabled.value=visible?1:0;this.legend.hidden=!visible;this.note.hidden=!visible||!this.note.textContent;}
  renderLegend(){
    this.legend.replaceChildren();
    const title=document.createElement('summary');title.textContent=this.features.length?'국가 영역 · '+this.features.map(territoryName).join(' / '):'국가 영역 · 이 연도 자료 없음';
    this.legend.append(title);
    for(const feature of this.features){
      const p=feature.properties,row=document.createElement('span');row.className='territory-key';
      const dot=document.createElement('i');dot.style.background=this.color(feature);row.append(dot,document.createTextNode(territoryName(feature)));
      row.title=yearLabel(p.validFrom)+'~'+yearLabel(p.validTo)+' 적용 도형';this.legend.append(row);
    }
    const note=document.createElement('p');note.textContent='시기별 연구 지도와 행정구역 경계를 참고해 그린 영역입니다. 표시 기간은 건국·멸망 연도와 다를 수 있습니다.';this.legend.append(note);
    const links=[['src-cliopatria-korea-v013','https://zenodo.org/records/14714684','Cliopatria v0.1.3 · CC BY 4.0'],
      ['src-hgis-admin-1910-1945','https://hgis.history.go.kr/pro_g1/dataset.do','국사편찬위원회 HGIS 1910~1945 행정구역']];
    for(const [source,href,label] of links){
      if(!this.features.some(f=>f.properties.fromSource===source))continue;
      const link=document.createElement('a');link.href=href;link.target='_blank';link.rel='noopener';link.textContent=label;this.legend.append(link);
    }
    const omitted=document.createElement('p');omitted.textContent='가야 시기까지 변한 이름을 이어 쓴 경계와 668년 뒤의 고구려 경계는 제외했습니다. 1260~1362년은 이 자료가 모두 비어 있습니다.';this.legend.append(omitted);
  }
  updateNote(){
    const notes=[[500,681,'이 시기 영역은 참고용입니다. 일부 확장·정복 시점이 맞지 않습니다.'],
      [1911,1947,'1911~1947년은 행정구역 경계 13도를 합친 참고도입니다. 1945~1947년은 38도선으로 나눈 미·소 군정 구역입니다. 실제 국경·통치 범위와는 다릅니다.'],
      [1950,1953,'국가 영역을 보여주는 참고도입니다. 한국전쟁의 전선은 아닙니다.']];
    this.note.textContent=this.features.length?(notes.find(([start,end])=>start<=this.year&&this.year<=end)?.[2]||''):'';
    if(this.year>=669&&this.year<=681)this.note.textContent+=' 멸망 이후의 고구려 경계는 제외했습니다.';
    this.note.hidden=!this.visible||!this.note.textContent;
    this.legend.hidden=!this.visible;
  }
}
