// 설명용 실루엣. 기존 blueprint 재질 계열과 artbible 베벨을 그대로 사용한다.
import {LANDMARK_SCALE} from './artbible.js';
export const HERITAGE_TYPES=['pagoda','stele','hall','tomb','fortress','site','artifact','bridge','kiln'];
export const HERITAGE_DISPLAY={scale:LANDMARK_SCALE.MAX,radius:8,focus:40};
// #186: 유형만으로는 모형이 맞지 않는다(거북선·난중일기·불상이 모두 'artifact'). 제목의 낱말로 실루엣을 고른다.
const ARTIFACT_LOOKS=[
  [/동검|칠지도|검$|거푸집|철기|무기|화살|신기전/,'heritage_blade'],
  [/불상|여래|보살|미륵|입상|좌상|병좌상|반가|마애|삼존/,'heritage_statue'],
  [/신종|동종|범종|종$/,'heritage_bell'],
  [/토기|청자|백자|자기|분청|도자|항아리|그릇/,'heritage_jar'],
  [/석등/,'heritage_lantern'],
  [/혼천의|앙부일구|자격루|측우기|천문|시계|기구|의기/,'heritage_instrument'],
  [/거북선|판옥선|전함|군선|선박|배$/,'ship'],
  [/지도|여지도|불화|관음도|도원도|그림|산수화|영정|초상/,'hanging_scroll'],
  [/일기|대장경|경판|기록|실록|사기|유사|직지|훈민정음|선언|문서|서$|문집|시집|경$|록$|활자|책/,'book'],
];
const SITE_LOOKS=[
  [/독립문|성문|문$/,'gatehouse'],
  [/형무소|수용소|감옥|교도소/,'prison'],
  [/공원|묘지|묘역|기념|추모/,'memorial'],
  [/첨성대|전망대|봉수|탑$/,'heritage_tower'],
  [/마애|삼존|불상|여래|보살/,'heritage_statue'],
];
export function heritageLook(type,title=''){
  const rules=type==='artifact'?ARTIFACT_LOOKS:type==='site'?SITE_LOOKS:[];
  for(const [pattern,look] of rules)if(pattern.test(title))return look;
  return type==='artifact'?'heritage_pedestal':type==='site'?'heritage_site':type==='hall'||type==='fortress'||type==='pagoda'?type:'heritage_'+type;
}
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
    if(type==='artifact'){
      // 받침대 위 유물(기본): 낮은 대와 작은 상자. 종류가 확인되면 아래 전용 실루엣을 쓴다.
      add('pedestal',2.2,2,[box(3,.5,3,0,.25,0,'base','base'),box(1.6,.9,1.6,0,.95,0,'band','base'),box(1,.8,1,0,1.8,0,'ledge','top')]);
      // 불상·마애상: 대좌 위 몸(원기둥)과 머리(구), 광배(납작 상자).
      add('statue',4.2,2,[box(3,.5,3,0,.25,0,'base','base'),cyl(1,1.2,.5,0,.75,0,'stone','base'),cyl(.6,.8,2,0,2,0),{k:'sph',r:.5,y:3.4,m:'stone',c:'body',tag:'top'},
        box(2.2,3,.25,0,2.4,-.8,'ledge','ornament')]);
      // 범종: 나무틀에 매단 종.
      add('bell',4,2,[box(3.4,.4,2.4,0,.2,0,'base','base'),box(.35,3.4,.35,-1.4,1.9,0,'body','body'),box(.35,3.4,.35,1.4,1.9,0,'body','body'),box(3.4,.4,.5,0,3.8,0,'ledge','top'),
        cyl(.75,.95,1.8,0,2.3,0,'stone','band'),{k:'sph',r:.75,sy:.5,y:3.2,m:'stone',c:'band',tag:'ornament'}]);
      // 토기·청자·백자: 받침대 위 항아리.
      add('jar',3.2,2,[box(3,.5,3,0,.25,0,'base','base'),{k:'sph',r:1.05,sy:1.2,y:1.8,m:'stone',c:'band',tag:'body'},cyl(.55,.65,.5,0,3,0,'stone','ledge','top')]);
      // 동검·칠지도·철기: 받침대 위에 세운 날.
      add('blade',4.2,2,[box(3,.5,3,0,.25,0,'base','base'),box(1.4,.7,1.4,0,.85,0,'band','base'),box(.35,3,.14,0,2.7,0,'iron','iron'),box(.9,.18,.3,0,1.4,0,'iron','iron','ornament')]);
      // 석등: 기단·간주·화사석·지붕.
      add('lantern',4.4,2,[box(2.4,.5,2.4,0,.25,0,'base','base'),cyl(.35,.45,1.8,0,1.4,0,'stone','body'),box(1.2,1,1.2,0,2.8,0,'band','body'),box(1.8,.4,1.8,0,3.5,0,'ledge','roof'),cyl(.15,.25,.5,0,3.95,0,'stone','body','top')]);
      // 혼천의·앙부일구·자격루 같은 기구: 받침대 위 고리와 구.
      add('instrument',4,2,[box(3,.5,3,0,.25,0,'base','base'),box(1.6,1,1.6,0,1,0,'band','base'),{k:'tor',R:1,t:.12,y:2.7,m:'iron',c:'iron',tag:'body'},
        {k:'tor',R:1,t:.12,y:2.7,m:'iron',c:'iron',tag:'body',rx:Math.PI/2},{k:'sph',r:.3,y:2.7,m:'iron',c:'iron',tag:'top'}]);
    }
    // 첨성대 같은 돌탑: 위로 좁아지는 원통.
    if(type==='site')add('tower',4.4,2,[box(3,.5,3,0,.25,0,'base','base'),cyl(.9,1.4,3.4,0,2.2,0,'stone','body'),box(1.6,.4,1.6,0,4.1,0,'ledge','top')]);
    if(type==='bridge')add(type,2.3,5,[...[-3,0,3].flatMap(x=>[box(2.9,.4,2.8,x,1.8,0),box(.7,1.6,2.2,x-1,.8,0,'base','base')]),
      ...[-1.3,1.3].map(z=>box(9,.3,.2,0,2.15,z,'ledge','top'))]);
    // 가마는 랜드마크 축척(×2.2)으로 그려지므로 탑·비석과 같은 크기 급으로 둔다(반지름 4 였을 때 집 4~5채 폭으로 보였다, #186).
    if(type==='kiln')add(type,2.1,2,[cyl(1.4,1.8,1.6,0,.8,0,'stone','timber'),box(.8,.8,.25,0,.4,1.8,'iron','ornament'),cyl(.25,.35,.8,0,2,-.5,'stone','timber','top')]);
    // hall과 fortress는 조립기에서 기존 전각·성문·성벽을 쓴다.
  }
  return {...raw,blueprints,categories:{...raw.categories,buildings:{...raw.categories.buildings,cores}}};
}
