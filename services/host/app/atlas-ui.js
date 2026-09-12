import {icon} from './atlas-icons.js';
import {yearLabel} from './chronicle.js';
import {AtlasData} from './atlas-data.js';
import {AtlasSearch} from './atlas-search.js';
import {AtlasStory} from './atlas-story.js';
import {AtlasChat} from './atlas-chat.js';
import {AtlasEvents} from './atlas-events.js';
import {eras,eraAt} from './atlas-eras.js';

export class AtlasUI{
  constructor({chronicle,scene,runtime,filters,evidence}){
    Object.assign(this,{chronicle,scene,runtime,filters,evidence});
    this.data=new AtlasData();
    document.body.classList.add('atlas');
    this.root=document.createElement('div');this.root.id='atlas';
    this.root.innerHTML=`<div class="atlas-brand"><h1>시공여지도</h1><p>시간으로 읽는 한국사</p></div>
      <div class="atlas-tools"><div id="atlasSearchMount"></div><button class="atlas-tool" id="atlasSettingsButton" aria-expanded="false" aria-controls="atlasSettings">${icon('layers')}<span>지도 설정</span></button></div>
      <aside class="atlas-pane atlas-right" id="atlasSettings" hidden aria-label="지도 설정"><header><h2>지도 설정</h2><button class="atlas-icon" data-close aria-label="지도 설정 닫기">${icon('close')}</button></header>
        <div class="atlas-settings-map"></div><details class="atlas-source-fold"><summary>사료와 근거 설정</summary><div class="atlas-settings-sources"></div></details>
        <label class="atlas-setting">시간 막대 범위<select id="atlasTimeWindow"><option value="20">20년</option><option value="100">100년</option><option value="4600">전체 시간</option></select></label>
        <label class="atlas-setting">화질<select id="atlasQuality"><option value="auto">자동</option><option value="low">낮음</option><option value="medium">보통</option><option value="high">높음</option></select></label>
        <p class="atlas-muted">지도 속 건물과 생활 풍경은 역사 장면을 위한 상징 모형입니다.</p></aside>
      <div id="atlasPanelMount"></div>
      <button class="atlas-ask atlas-tool" id="atlasAsk" hidden>${icon('star')}<span>AI와 역사 이야기</span></button>
      <nav class="atlas-navigation" aria-label="지도 조작"><button class="atlas-north" aria-label="북쪽을 위로">N<span>↑</span></button><div><button data-zoom="in" aria-label="지도 확대">${icon('plus')}</button><button data-zoom="out" aria-label="지도 축소">${icon('minus')}</button></div></nav>
      <p id="atlasStatus" role="status"></p><button id="atlasEvidenceClose" class="atlas-icon" aria-label="근거 닫기">${icon('close')}</button>`;
    document.getElementById('app').append(this.root);
    this.panes=new Map([['settings',this.root.querySelector('#atlasSettings')]]);
    this.root.querySelector('#atlasSettingsButton').onclick=()=>this.togglePanel('settings');
    this.root.addEventListener('click',e=>{if(e.target.closest('[data-close]'))this.closePanel();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){
      if(document.querySelector('.stage').classList.contains('evidence-open'))this.closeEvidence();else this.closePanel(true);
    }});
    this.buildSettings();this.buildTime();
    this.root.querySelector('#atlasEvidenceClose').onclick=()=>this.closeEvidence();
    this.root.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.zoom==='in'?'sceneZoomIn':'sceneZoomOut').click());
    this.root.querySelector('.atlas-north').onclick=()=>{
      const e=this.runtime()?.engine;if(!e)return;
      const offset=e.camera.position.clone().sub(e.controls.target);e.fly=null;
      e.camera.position.set(e.controls.target.x,e.controls.target.y+offset.y,e.controls.target.z+Math.hypot(offset.x,offset.z));e.controls.update();
    };
    this.search=new AtlasSearch(this);
    this.story=new AtlasStory(this);
    this.chat=new AtlasChat(this);
    this.events=new AtlasEvents(this);
    this.update(chronicle.context);
  }
  buildSettings(){
    const settings=this.root.querySelector('.atlas-settings-map');
    for(const selector of ['.scene-actions','.scene-navigation','#mapDisplay','.geography-navigation','#territoryLegend','.origin-filter']){
      const node=document.querySelector(selector);if(node)settings.append(node);
    }
    document.getElementById('mapDisplay').open=true;
    this.root.querySelector('.atlas-settings-sources').append(document.getElementById('sourceRail'));
    this.root.querySelector('#atlasTimeWindow').onchange=()=>{this.rangeWindow=null;this.syncTime(this.chronicle.year);};
    this.root.querySelector('#atlasQuality').onchange=e=>{
      const engine=this.runtime()?.engine;if(!engine)return;
      if(e.target.value==='auto')engine.resetQualityAuto();else engine.setQuality(e.target.value,{manual:true,persist:true});
    };
  }
  buildTime(){
    const controls=this.chronicle.controls;
    this.time=document.createElement('div');this.time.className='atlas-time';
    this.time.innerHTML=`<select class="atlas-era" aria-label="시대로 이동">${eras.map(([year,name])=>`<option value="${year}">${name}</option>`).join('')}</select><div class="atlas-year-slot"></div><div class="atlas-slider-slot"></div><div class="atlas-play-slot"></div><button class="atlas-event-toggle" id="atlasEventsButton" hidden aria-expanded="false">${icon('list')}<span>사건 목록</span></button>`;
    this.time.querySelector('.atlas-year-slot').append(controls.querySelector('.time-year'));
    this.time.querySelector('.atlas-slider-slot').append(controls.querySelector('.time-slider'));
    this.time.querySelector('.atlas-play-slot').append(controls.querySelector('.time-actions'));
    controls.prepend(this.time);
    this.time.querySelector('.atlas-era').onchange=e=>{this.chronicle.stopPlay();this.chronicle.chooseYear(+e.target.value);};
    this.slider=controls.querySelector('[type=range]');
    this.ticks=document.createElement('div');this.ticks.className='atlas-time-ticks';this.time.querySelector('.atlas-slider-slot').append(this.ticks);
    this.currentTick=document.createElement('span');this.currentTick.className='atlas-current-tick';this.time.querySelector('.atlas-slider-slot').append(this.currentTick);
    controls.addEventListener('yearpreview',event=>this.syncTime(event.detail,true));
    this.slider.addEventListener('change',()=>{this.rangeWindow=null;this.syncTime(this.chronicle.year);});
    controls.querySelector('[data-previous]').title='이전 사건';controls.querySelector('[data-next]').title='다음 사건';
    controls.querySelector('[data-previous]').innerHTML=icon('left');controls.querySelector('[data-next]').innerHTML=icon('right');
  }
  syncTime(year,preview=false){
    if(!Number.isInteger(year))return;
    const span=+this.root.querySelector('#atlasTimeWindow').value;
    if(!this.rangeWindow||year<this.rangeWindow[0]||year>this.rangeWindow[1]){
      const low=span>=4600?-2500:Math.max(-2500,Math.min(2100-span,Math.floor(year/(span/2))*(span/2)-span/2));
      this.rangeWindow=[low,span>=4600?2100:low+span];
    }
    const [min,max]=this.rangeWindow||[-2500,2100];this.slider.min=min;this.slider.max=max;this.slider.value=year;
    this.slider.setAttribute('aria-valuetext',yearLabel(year));
    this.events?.preview(year);
    this.currentTick.textContent=year<0?'BC '+Math.abs(year):year;this.currentTick.style.left=((year-min)/(max-min)*100)+'%';
    const era=eraAt(year);this.time.querySelector('.atlas-era').value=era[0];
    this.time.querySelector('.time-year>span').textContent=year<0?'기원전':'년';
    const key=min+':'+max;
    if(this.tickKey!==key){this.tickKey=key;this.ticks.innerHTML=Array.from({length:5},(_,i)=>Math.round(min+(max-min)*i/4)).map(y=>`<span data-tick-year="${y}">${y===0?'':y<0?'BC '+Math.abs(y):y}</span>`).join('');}
    for(const tick of this.ticks.children)tick.classList.toggle('near-current',Math.abs(+tick.dataset.tickYear-year)<(max-min)*.13);
  }
  registerPanel(name,element){this.panes.set(name,element);this.root.querySelector('#atlasPanelMount').append(element);element.hidden=true;}
  openPanel(name){
    this.closeEvidence();
    this.panel=name;document.body.dataset.atlasPanel=name;
    for(const [key,pane] of this.panes)pane.hidden=key!==name;
    this.root.querySelector('#atlasSettingsButton').setAttribute('aria-expanded',String(name==='settings'));
    if(name!=='events')this.events?.hide();this.scene.layoutKey=null;
  }
  togglePanel(name){if(this.panel===name)this.closePanel();else this.openPanel(name);}
  closePanel(focus=false){
    const previous=this.panel;this.panel=null;delete document.body.dataset.atlasPanel;
    for(const pane of this.panes.values())pane.hidden=true;
    this.events?.hide();this.root.querySelector('#atlasSettingsButton').setAttribute('aria-expanded','false');
    if(focus&&previous==='settings')this.root.querySelector('#atlasSettingsButton').focus();this.scene.layoutKey=null;
  }
  closeEvidence(){document.querySelector('.stage').classList.remove('evidence-open');document.getElementById('evidenceBtn').setAttribute('aria-expanded','false');}
  showEntity(entity,activity){this.story.show(entity,activity);return true;}
  update(context){
    if(!context)return;
    const filtersChanged=this.data.data&&this.data.data!==this.chronicle.data;
    this.data.update(this.chronicle.data,context,this.chronicle.callbacks.scenePackets?.());
    const changed=this.lastYear!==undefined&&this.lastYear!==context.year;
    if(changed||filtersChanged){this.story?.reset();if(this.panel==='story')this.closePanel();this.closeEvidence();}
    this.lastYear=context.year;this.syncTime(context.year);
    const status=this.root.querySelector('#atlasStatus');status.textContent=this.chronicle.error||(this.chronicle.loading?'인물과 사건을 불러오는 중…':'');status.hidden=!status.textContent;
    this.search?.update();
    this.chat?.update(changed||filtersChanged);
    this.events?.update();
  }
}
