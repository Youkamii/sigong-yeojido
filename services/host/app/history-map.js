import {lensStrength} from './place-state.js';

export function featureRings(feature){
  const geometry=feature.geometry;
  return geometry.type==='Polygon'?geometry.coordinates:geometry.type==='MultiPolygon'?geometry.coordinates.flat():[];
}

export class HistoricalMap {
  constructor(button,callbacks){this.button=button;this.callbacks=callbacks;this.features=[];this.paths=[];this.sequence=0;button.onclick=()=>callbacks.list();}
  async refresh(filters){
    const seq=++this.sequence;this.features=[];this.paths=[];this.callbacks.changed([]);
    this.button.textContent='역사 경계 조회 중…';
    try{
      const response=await fetch('/api/history-map?'+new URLSearchParams({year:filters.year,sources:[...filters.sources].join(','),origin:filters.origin,level:filters.level}));
      if(!response.ok)throw Error('역사 경계 조회 실패');
      const data=await response.json();if(seq!==this.sequence)return;
      this.features=data.features;this.button.textContent=`역사 경계 ${this.features.length}개 · 근거`;
      this.callbacks.changed(this.features);
    }catch(error){if(seq===this.sequence)this.button.textContent=error.message;}
  }
  draw(ctx,project,primary){
    this.paths=[];
    for(const feature of this.features){
      const path=new Path2D();
      for(const ring of featureRings(feature))ring.forEach(([lon,lat],i)=>{const [x,y]=project(lon,lat);i?path.lineTo(x,y):path.moveTo(x,y);});
      ctx.save();ctx.globalAlpha=lensStrength(feature.properties,null,primary);
      ctx.strokeStyle='#D8B463';ctx.lineWidth=1.4;ctx.stroke(path);ctx.restore();
      this.paths.push({feature,path});
    }
  }
  pick(ctx,x,y){
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.lineWidth=9;
    const hit=this.paths.find(row=>ctx.isPointInStroke(row.path,x,y));ctx.restore();return hit?.feature;
  }
}
