import {QUALITY_KEY,chooseQuality,qualityNames} from './quality-choice.js';

export function mountQualityChoice(){
  const query=new URLSearchParams(location.search).get('q');
  let saved=null;
  try{saved=localStorage.getItem(QUALITY_KEY);}catch{}
  const profile={hardwareConcurrency:navigator.hardwareConcurrency,deviceMemory:navigator.deviceMemory,
    maxTouchPoints:navigator.maxTouchPoints,userAgent:navigator.userAgent,
    width:screen.width,height:screen.height,dpr:devicePixelRatio};
  const choice=chooseQuality(profile,saved,query),labels={low:'낮음',medium:'보통',high:'높음'};
  let selected=choice.selected,manual=choice.manual;
  const buttons=[...document.querySelectorAll('[data-gate-quality]')];
  const paint=()=>buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.gateQuality===selected)));
  const recommendation=document.getElementById('qualityRecommendation');
  if(recommendation)recommendation.textContent=choice.persist?'이 기기 추천: '+labels[choice.recommended]:`주소에서 고른 화질: ${labels[selected]}`;
  for(const button of buttons){
    button.disabled=!choice.persist;
    button.onclick=()=>{if(!choice.persist)return;selected=button.dataset.gateQuality;manual=true;paint();};
  }
  window.addEventListener('fan:quality',event=>{
    if(choice.persist&&event.detail?.manual===true&&qualityNames.includes(event.detail.quality)){selected=event.detail.quality;manual=true;paint();}
  });
  paint();
  return {
    enter(){
      if(choice.persist)try{localStorage.setItem(QUALITY_KEY,JSON.stringify({name:selected,manual}));}catch{}
      paint();return {name:selected,manual,persist:choice.persist};
    },
  };
}
