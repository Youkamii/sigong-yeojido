// These intervals select broad visual styles; they do not date a change in everyone's dress.
export const figureStyleNote='시대와 역할을 알아보기 위한 간략한 표현입니다. 복식이 바뀐 해나 개인의 정확한 차림을 뜻하지 않습니다.';
export const figureStyleSources=[
  {id:'aks-boksik-E0023690',title:'복식',supports:'삼국의 저고리와 바지, 고려의 긴 저고리 등 큰 옷차림 구분',publisher:'한국학중앙연구원',url:'https://encykorea.aks.ac.kr/Article/E0023690'},
  {id:'aks-gabot-E0000930',title:'갑옷',supports:'삼국의 판갑·찰갑, 고려의 포형 갑옷, 조선 후기의 두정갑',publisher:'한국학중앙연구원',url:'https://encykorea.aks.ac.kr/Article/E0000930'},
  {id:'aks-gunbok-E0006624',title:'군복',supports:'조선의 전립과 군복, 1895년 서구식 군복 개혁',publisher:'한국학중앙연구원',url:'https://encykorea.aks.ac.kr/Article/E0006624'},
  {id:'aks-gonryongpo-E0004150',title:'곤룡포',supports:'조선 왕의 포, 익선관과 둥근 가슴 장식',publisher:'한국학중앙연구원',url:'https://encykorea.aks.ac.kr/Article/E0004150'},
];
export const figureEras=[
  {id:'early',label:'선사·초기',from:-Infinity,to:-1},
  {id:'three_kingdoms',label:'삼국·남북국',from:0,to:917},
  {id:'goryeo',label:'고려',from:918,to:1391},
  {id:'joseon',label:'조선',from:1392,to:1894},
  {id:'transition',label:'개항기·근대',from:1895,to:1944},
  {id:'modern',label:'현대',from:1945,to:Infinity},
];
export const figureRoles=['ruler','commander','scholar','monk','commoner','soldier'];
const roleLabels={ruler:'군주',commander:'지휘관',scholar:'학자',monk:'승려',commoner:'생활 인물',soldier:'군사'};
export const figureEra=year=>figureEras.find(era=>era.from<=year&&year<=era.to)||figureEras[3];
export const figureArchetype=(role,year)=>'figure_'+figureEra(year).id+'_'+(figureRoles.includes(role)?role:'commoner');
const part=(k,shape,c='iron',tag='ornament',m='leather')=>({k,...shape,m,c,tag});
const box=(w,h,d,x,y,z,c='iron',tag='ornament')=>part('box',{w,h,d,x,y,z},c,tag);
const cylinder=(r,h,x,y,z,c='iron',tag='top')=>part('cyl',{r,h,x,y,z,seg:10},c,tag);
const pair=spec=>({...spec,rep:{mir:'x'}});
function blueprint(raw,era,role){
  const transition=era.id==='transition',modern=era.id==='modern'||(transition&&(role==='commander'||role==='soldier')),early=era.id==='early',ancient=era.id==='three_kingdoms',goryeo=era.id==='goryeo';
  const military=role==='commander'||role==='soldier';
  const base=structuredClone(raw.blueprints.period_figure);
  // Retain the existing face and proportions, then assemble era and role silhouettes.
  const p=base.p.slice(0,11);
  const cloth=role==='ruler'?'roof':role==='monk'?'bodyMid':military?'deepWater':role==='scholar'?'snow':'timberLt';
  for(const spec of p)if(spec.c==='snow'||spec.c==='bodyMid')spec.c=cloth;
  p[1].c=cloth;p[2].c=cloth;p[4].c=cloth;
  if(early||ancient||modern||transition){
    p.splice(1,1,pair(box(.23,.84,.29,.18,.53,0,cloth,'limb')));
    p.push(part('cyl',{r:early?.34:ancient?.39:.32,r1:.28,h:early?(role==='commander'?.7:.42):ancient?.6:transition&&!modern?.9:.28,y:early?(role==='commander'?.85:.99):ancient?.92:transition&&!modern?.83:1.12,seg:8},cloth,'body'));
  }else{
    p[1].r=goryeo?.46:.43;p[1].h=goryeo?1.05:.95;p[1].y=.66;
    p[4].r=role==='scholar'||role==='ruler'?(goryeo?.24:.21):.17;
  }
  if(transition&&!modern){p[4].r=.19;p[2].h=.82;}
  if(role!=='monk')p.push(part('sph',{r:.235,y:2.21,sy:.5},'iron','top'));
  if(role==='monk'){
    p.push(box(.34,.88,.07,-.12,1.25,.25,'roof','body'));
    p.push(part('rcyl',{r:.04,h:early?1.7:2.25,x:.65,y:early?.85:1.125,seg:6},'timber','ornament','timber'));
    if(!early)p.push(part('sph',{r:.045,y:1.55,z:.29,rep:{n:6,dx:.065}},'timber','ornament','timber'));
  }else if(modern){
    if(military){
      p.push(cylinder(.27,transition?.3:.17,0,transition?2.38:2.32,0,'deepWater'));
      p.push(box(.38,.035,.24,0,2.25,.15,'iron','top'));
      p.push(box(.6,.07,.04,0,1.63,.23,'gold','body'));
      if(transition){p.push(box(.57,.38,.11,0,.94,-.21,'deepWater','body'));p.push(part('box',{w:.045,h:.045,d:.035,y:1.22,z:.24,rep:{n:4,dy:.12}},'gold','body'));}
      if(role==='soldier')p.push(box(.12,1.2,.13,.58,1.05,.1,'trunk'));
      else p.push(box(.3,.3,.15,.43,1.05,.25,'iron'));
    }else{
      p.push(box(.17,.5,.035,0,1.5,.23,'snow','body'));
      p.push(box(.055,.36,.025,0,1.48,.26,'trunk','body'));
      if(role==='scholar')p.push(box(.32,.43,.09,.48,1.03,.15,'roof'));
      if(role==='ruler')p.push(box(.15,.08,.05,-.18,1.62,.23,'gold'));
      if(role==='commoner')p.push(box(.38,.3,.13,.48,.98,.15,'timber'));
    }
  }else if(military){
    if(role==='commander')p.push(box(.72,.6,.08,0,1.37,-.25,cloth,'body'));
    p.push(box(.61,early?.43:ancient?.65:.8,.12,0,early?1.42:1.32,.24,early?'trunk':'steel','body'));
    if(!early){
      p.push(part('box',{w:.55,h:.045,d:.045,y:1.13,z:.32,rep:{n:ancient?4:5,dy:.13}},'iron','body','iron'));
      p.push(part('sph',{r:ancient?.27:goryeo?.29:.275,y:2.25,sy:ancient?1:goryeo?1.15:.85},'steel','top','iron'));
      if(goryeo||era.id==='joseon')p.push(box(.5,.35,.12,0,2.07,-.16,'steel','top'));
      if(role==='commander')p.push(part('cone',{r:.065,h:ancient?.24:goryeo?.38:.47,y:ancient?2.58:goryeo?2.73:2.68,seg:6},'roof','top'));
    }else p.push(cylinder(.25,.08,0,2.24,0,'trunk'));
    if(era.id==='joseon'){
      if(role==='soldier'){
        p.splice(p.length-4,4);
        p.push(box(.61,.84,.12,0,1.28,.24,'deepWater','body'));
        p.push(cylinder(.43,.05,0,2.29,0));p.push(part('sph',{r:.25,y:2.35,sy:.7},'iron','top'));
      }else{
        const armor=p.find(s=>s.k==='box'&&s.w===.61);armor.c=cloth;
        const rows=p.find(s=>s.rep?.dy===.13);rows.w=.055;rows.h=.055;rows.c='gold';rows.rep={n:5,dy:.13};rows.x=-.2;
        p.push({...rows,x:.2});
      }
    }
    if(role==='soldier'||early){
      p.push(part('rcyl',{r:.035,h:2.25,x:.65,y:1.125,seg:6},'timber','ornament','timber'));
      p.push(part('cone',{r:.085,h:.3,x:.65,y:2.39,seg:4},early?'rock':'steel','ornament',early?'stone':'iron'));
    }else{
      p.push(part('rcyl',{r:.045,h:.9,x:.5,y:.68,rz:-.15,seg:6},'iron'));
      p.push(box(.22,.045,.1,.44,1.13,0,'gold'));
    }
  }else if(role==='ruler'){
    if(early){
      p.push(cylinder(.25,.12,0,2.28,0,'trunk'));
      p.push(box(.13,.23,.055,0,2.43,.16,'gold','top'));
    }else if(ancient){
      p.push(cylinder(.25,.16,0,2.3,0,'gold'));
      p.push(part('box',{w:.08,h:.29,d:.055,x:0,y:2.49,z:.15,rep:{n:3,dx:.17}},'gold','top'));
    }else if(goryeo){
      p.push(box(.44,.35,.34,0,2.4,0,'iron','top'));
      p.push(pair(box(.28,.07,.09,.32,2.25,-.03,'iron','top')));
    }else{
      p.push(cylinder(.245,.3,0,2.4,0));
      p.push(pair(part('box',{w:.25,h:.21,d:.08,x:.28,y:2.46,rz:.25},'iron','top')));
    }
    if(!early)p.push(part('cyl',{r:.12,h:.035,y:1.47,z:.235,rx:Math.PI/2,seg:10},'gold'));
  }else if(role==='scholar'){
    p.push(box(.28,.4,.07,.47,1.05,.11,'timberLt'));
    if(transition){p.push(cylinder(.37,.045,0,2.3,0));p.push(cylinder(.22,.25,0,2.43,0));}
    else if(early)p.push(part('sph',{r:.08,y:2.37},'iron','top'));
    else if(ancient)p.push(part('cone',{r:.23,h:.32,y:2.38,seg:6},'iron','top'));
    else if(goryeo){p.push(box(.38,.25,.3,0,2.36,0,'iron','top'));p.push(pair(box(.24,.07,.08,.27,2.26,0,'iron','top')));}
    else{p.push(cylinder(.43,.045,0,2.3,0));p.push(part('cyl',{r:.22,r1:.18,h:.34,y:2.47,seg:12},'iron','top'));}
  }else{
    p.push(part('sph',{r:early?.06:.08,y:early?2.31:2.36},'iron','top'));
    if(ancient)p.push(cylinder(.24,.055,0,2.2,0,'snow'));
    if(goryeo)p.push(box(.1,.46,.035,.14,1.49,.24,'snow','body'));
    if(transition)p.push(box(.34,.44,.09,.47,.98,.13,'trunk'));
    if(era.id==='joseon')p.push(box(.3,.21,.12,.47,1.02,.12,'timber'));
  }
  return {h:military&&!early&&!modern?3:2.8,rad:military?.8:.75,p,
    displayStyle:{era:era.id,role,note:figureStyleNote,
      sourceIds:[...(!early?['aks-boksik-E0023690']:[]),...(military&&!early&&!modern?['aks-gabot-E0000930']:[]),...(military&&(era.id==='joseon'||transition||modern)?['aks-gunbok-E0006624']:[]),...(role==='ruler'&&(era.id==='joseon'||transition)?['aks-gonryongpo-E0004150']:[])],
      evidenceScope:'출처는 해당 시대의 큰 옷차림을 참고한 자료입니다. 이 역할이나 인물의 모든 부품·색·소지품을 입증하지 않습니다.',
      artisticChoices:'단순한 얼굴과 몸 비율, 장식의 모양과 크기, 색 배합, 시대별 배정은 화면 표현을 위한 선택입니다.'}};
}
export function extendFigureCatalog(raw){
  const category=raw.categories.humanoids,cores=[...category.cores],blueprints={...raw.blueprints};
  const known=new Set(cores.map(core=>typeof core==='string'?core.split('|')[0]:core.id));
  for(const era of figureEras)for(const role of figureRoles){
    const id=figureArchetype(role,Math.max(era.from,-1000));
    if(!known.has(id))cores.push(id+'|'+era.label+' '+roleLabels[role]+' 표현');
    blueprints[id]=blueprint(raw,era,role);
  }
  return {...raw,categories:{...raw.categories,humanoids:{...category,cores}},blueprints};
}
