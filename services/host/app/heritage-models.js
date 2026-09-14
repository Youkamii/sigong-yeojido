// 설명용 실루엣. 기존 blueprint 재질 계열과 artbible 베벨을 그대로 사용한다.
import {LANDMARK_SCALE} from './artbible.js';
export const HERITAGE_TYPES=['pagoda','stele','hall','tomb','fortress','site','artifact','bridge','kiln'];
export const HERITAGE_DISPLAY={scale:LANDMARK_SCALE.MAX,radius:8,focus:40};
const box=(w,h,d,x,y,z,c='body',tag='body')=>({k:'box',w,h,d,x,y,z,m:'stone',c,bev:'s',tag});
const cyl=(r,r1,h,x,y,z,m='stone',c='body',tag='body')=>({k:'cyl',r,r1,h,x,y,z,m,c,seg:16,tag});
export function extendHeritageCatalog(raw){
  if(!raw?.categories?.buildings)return raw;
  const blueprints={...raw.blueprints},cores=[...raw.categories.buildings.cores];
  const add=(type,h,rad,p)=>{const id='heritage_'+type;blueprints[id]={h,rad,p};cores.push(`${id}|문화재 설명 모형`);};
  for(const type of HERITAGE_TYPES){
    if(type==='pagoda')for(const floors of [3,5]){
      const parts=[box(4,.5,4,0,.25,0,'base','base')];
      for(let i=0;i<floors;i++){
        const w=2.5-i*.3,y=.5+i*1.3;
        parts.push(box(w,.9,w,0,y+.45,0),box(w+.8,.4,w+.8,0,y+1.1,0,'ledge','roof'));
      }
      parts.push(cyl(.12,.3,.8,0,.9+floors*1.3,0,'stone','body','top'));
      add('pagoda_'+floors,1.3+floors*1.3,2.8,parts);
    }
    if(type==='stele')add(type,4.8,2,[box(3.5,.5,2.5,0,.25,0,'base','base'),box(1.8,3.8,.7,0,2.4,0),box(2.2,.4,1.1,0,4.5,0,'ledge','top')]);
    // 아래 반구를 기단 밑에 묻어 봉분의 윗반구만 드러낸다.
    if(type==='tomb')add(type,3,4,[cyl(3.8,3.8,.4,0,.2,0,'stone','base','base'),{k:'sph',r:3.3,sy:.8,y:.3,m:'foliage',c:'canopyLow',tag:'body'},
      ...Array.from({length:12},(_,i)=>box(.6,.6,.6,Math.cos(i*Math.PI/6)*3.7,.3,Math.sin(i*Math.PI/6)*3.7,'band','ornament'))]);
    if(type==='site')add(type,1.5,3.5,[box(6,.3,5,0,.15,0,'base','base'),box(.9,1.2,.5,2,.9,1.5)]);
    if(type==='artifact')add(type,3.8,2,[box(3,.5,3,0,.25,0,'base','base'),box(2,1.3,2,0,1.15,0,'band','base'),
      cyl(.65,.9,1.4,0,2.5,0,'iron','iron'),cyl(.3,.65,.4,0,3.4,0,'iron','iron','top'),
      {k:'tor',R:.2,t:.08,y:3.8,m:'iron',c:'iron',tag:'ornament'}]);
    if(type==='bridge')add(type,2.3,5,[...[-3,0,3].flatMap(x=>[box(2.9,.4,2.8,x,1.8,0),box(.7,1.6,2.2,x-1,.8,0,'base','base')]),
      ...[-1.3,1.3].map(z=>box(9,.3,.2,0,2.15,z,'ledge','top'))]);
    // 가마는 랜드마크 축척(×2.2)으로 그려지므로 탑·비석과 같은 크기 급으로 둔다(반지름 4 였을 때 집 4~5채 폭으로 보였다, #186).
    if(type==='kiln')add(type,2.1,2,[cyl(1.4,1.8,1.6,0,.8,0,'stone','timber'),box(.8,.8,.25,0,.4,1.8,'iron','ornament'),cyl(.25,.35,.8,0,2,-.5,'stone','timber','top')]);
    // hall과 fortress는 조립기에서 기존 전각·성문·성벽을 쓴다.
  }
  return {...raw,blueprints,categories:{...raw.categories,buildings:{...raw.categories.buildings,cores}}};
}
