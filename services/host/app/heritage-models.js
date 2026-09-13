// 설명용 실루엣. 기존 blueprint 재질 계열과 artbible 베벨을 그대로 사용한다.
export const HERITAGE_TYPES=['pagoda','stele','hall','tomb','fortress','site','artifact','bridge','kiln'];
const box=(w,h,d,x,y,z,c='body')=>({k:'box',w,h,d,x,y,z,m:'stone',c,bev:'s',tag:'body'});
const cyl=(r,r1,h,x,y,z,m='stone',c='body')=>({k:'cyl',r,r1,h,x,y,z,m,c,seg:16,tag:'body'});
export function extendHeritageCatalog(raw){
  const blueprints={...raw.blueprints},cores=[...raw.categories.buildings.cores];
  const add=(type,h,rad,p)=>{const id='heritage_'+type;blueprints[id]={h,rad,p};cores.push(`${id}|문화재 설명 모형`);};
  for(const floors of [3,5]){
    const parts=[box(4,.5,4,0,.25,0,'base')];
    for(let i=0;i<floors;i++){
      const w=2.5-i*.3,y=.5+i*1.3;
      parts.push(box(w,.9,w,0,y+.45,0),box(w+.8,.4,w+.8,0,y+1.1,0,'trim'));
    }
    parts.push(cyl(.12,.3,.8,0,.9+floors*1.3,0));
    add('pagoda_'+floors,1.3+floors*1.3,2.8,parts);
  }
  add('stele',4.8,2,[box(3.5,.5,2.5,0,.25,0,'base'),box(1.8,3.8,.7,0,2.4,0),box(2.2,.4,1.1,0,4.5,0,'trim')]);
  // 아래 절반을 기단 안에 묻어 봉분의 윗반구만 드러낸다.
  add('tomb',3,4,[cyl(3.8,3.8,.4,0,.2,0),{k:'sph',r:3.3,sy:.8,y:.3,m:'foliage',c:'canopyLow',tag:'body'},
    ...Array.from({length:12},(_,i)=>box(.6,.6,.6,Math.cos(i*Math.PI/6)*3.7,.3,Math.sin(i*Math.PI/6)*3.7,'trim'))]);
  add('site',1.5,3.5,[box(6,.3,5,0,.15,0,'base'),box(.9,1.2,.5,2,.9,1.5)]);
  const pedestal=[box(3,.5,3,0,.25,0,'base'),box(2,1.3,2,0,1.15,0,'trim')];
  add('artifact',3.8,2,[...pedestal,cyl(.65,.9,1.4,0,2.5,0,'iron','iron'),cyl(.3,.65,.4,0,3.4,0,'iron','iron'),
    {k:'tor',R:.2,t:.08,y:3.8,m:'iron',c:'iron',tag:'ornament'}]);
  add('bridge',2.3,5,[...[-3,0,3].flatMap(x=>[box(2.9,.4,2.8,x,1.8,0),box(.7,1.6,2.2,x-1, .8,0,'base')]),
    ...[-1.3,1.3].map(z=>box(9,.3,.2,0,2.15,z,'trim'))]);
  // 기존 kiln 장면의 원통형 가마를 카탈로그로 옮겨 선택·재질 처리도 공유한다.
  add('kiln',3.8,4,[cyl(3,4,3.5,0,1.75,0,'stone','timber'),box(1.5,1.5,.3,0,.75,3.8,'iron'),cyl(.5,.7,1.5,0,3.05,-1,'stone','timber')]);
  return {...raw,blueprints,categories:{...raw.categories,buildings:{...raw.categories.buildings,cores}}};
}
