import {sourcesParam} from './chronicle-load.js';
import {lensStrength} from './place-state.js';

export function featureLines(feature){
  const geometry=feature.geometry;
  if(geometry.type==='Polygon'||geometry.type==='MultiLineString')return geometry.coordinates;
  if(geometry.type==='MultiPolygon')return geometry.coordinates.flat();
  return geometry.type==='LineString'?[geometry.coordinates]:[];
}

export class HistoricalMap {
  constructor(button,callbacks){this.button=button;this.callbacks=callbacks;this.features=[];this.paths=[];this.sequence=0;button.onclick=()=>callbacks.list();}
  async refresh(filters){
    const seq=++this.sequence;this.features=[];this.paths=[];this.callbacks.changed([]);
    const label=Number(filters.level)===5?'역로·옛길':Number(filters.level)===4?'사건 장소':'역사 경계';
    this.button.textContent=label+' 불러오고 있습니다…';
    try{
      const response=await fetch('/api/history-map?'+new URLSearchParams({year:filters.year,sources:sourcesParam(filters.sources,filters.primary),origin:filters.origin,level:filters.level}));
      if(!response.ok)throw Error(label+' 자료를 불러오지 못했습니다.');
      const data=await response.json();if(seq!==this.sequence)return;
      this.features=data.features;this.button.textContent=`${label} ${this.features.length}개 · 출처 보기`;
      this.callbacks.changed(this.features);
    }catch(error){if(seq===this.sequence)this.button.textContent=error.message;}
  }
  draw(ctx,project,primary){
    this.paths=[];
    for(const feature of this.features){
      const path=new Path2D();
      if(feature.geometry.type==='Point'){
        const [x,y]=project(...feature.geometry.coordinates);path.arc(x,y,6,0,Math.PI*2);
      }
      for(const line of featureLines(feature))line.forEach(([lon,lat],i)=>{const [x,y]=project(lon,lat);i?path.lineTo(x,y):path.moveTo(x,y);});
      ctx.save();ctx.globalAlpha=lensStrength(feature.properties,null,primary);
      ctx.strokeStyle='#D8B463';ctx.lineWidth=1.4;ctx.stroke(path);ctx.restore();
      this.paths.push({feature,path});
    }
  }
  pick(ctx,x,y){
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.lineWidth=9;
    const hit=this.paths.find(row=>ctx.isPointInStroke(row.path,x,y)||(row.feature.geometry.type==='Point'&&ctx.isPointInPath(row.path,x,y)));ctx.restore();return hit?.feature;
  }
}
