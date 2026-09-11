import {escapeHtml as esc} from './html.js';
import {icon} from './atlas-icons.js';
import {cleanTitle,typeName} from './atlas-data.js';
import {yearLabel} from './chronicle.js';

export class AtlasSearch{
  constructor(ui){
    this.ui=ui;this.type='all';
    const mount=ui.root.querySelector('#atlasSearchMount');
    mount.innerHTML=`<form class="atlas-search-bar" role="search"><button class="atlas-icon" type="submit" aria-label="인물·사건 검색">${icon('search')}</button><input id="atlasQuery" type="search" autocomplete="off" placeholder="인물·사건 찾기" aria-label="인물·사건 찾기" aria-controls="atlasSearchResults"><button class="atlas-icon atlas-search-clear" type="button" aria-label="검색어 지우기" hidden>${icon('close')}</button></form>`;
    this.input=mount.querySelector('input');
    this.pane=document.createElement('aside');this.pane.className='atlas-pane atlas-right';this.pane.id='atlasSearchResults';this.pane.setAttribute('aria-label','검색 결과');
    this.pane.innerHTML=`<header><h2>검색 결과</h2><button class="atlas-icon" data-close aria-label="검색 결과 닫기">${icon('close')}</button></header><div class="atlas-tabs" role="tablist" aria-label="검색 종류">${[['all','전체'],['Person','인물'],['Event','사건']].map(([value,label])=>`<button role="tab" data-search-type="${value}" aria-selected="${value==='all'}">${label}</button>`).join('')}</div><p class="atlas-search-note atlas-muted"></p><div class="atlas-search-results"></div><section class="atlas-search-detail"></section>`;
    ui.registerPanel('search',this.pane);
    mount.querySelector('form').onsubmit=e=>{e.preventDefault();this.show();this.input.focus();};
    this.input.oninput=()=>{clearTimeout(this.timer);this.timer=setTimeout(()=>this.show(),140);};
    this.input.onfocus=()=>{if(this.input.value.trim())this.show();};
    mount.querySelector('.atlas-search-clear').onclick=()=>{this.input.value='';this.selected=null;this.show();this.input.focus();};
    this.pane.onclick=e=>{
      const tab=e.target.closest('[data-search-type]');if(tab){this.type=tab.dataset.searchType;this.selected=null;this.render();return;}
      const result=e.target.closest('[data-search-entity]');if(result){this.selected=result.dataset.searchEntity;this.render();return;}
      if(e.target.closest('[data-search-go]'))this.go();
      if(e.target.closest('[data-search-proof]')){const claim=ui.data.subjects.get(this.selected)?.[0];if(claim)ui.evidence(claim);}
    };
  }
  show(){clearTimeout(this.timer);this.ui.openPanel('search');this.render();}
  update(){if(this.ui.panel==='search')this.render();}
  render(){
    const query=this.input.value.trim(),data=this.ui.data,rows=data.search(query,this.type);
    this.ui.root.querySelector('.atlas-search-clear').hidden=!query;
    if(!rows.some(r=>r.entity.id===this.selected))this.selected=rows[0]?.entity.id;
    this.pane.querySelectorAll('[data-search-type]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.searchType===this.type)));
    this.pane.querySelector('.atlas-search-note').textContent=this.ui.chronicle.error||(this.ui.chronicle.loading?'자료를 불러오는 중…':query?`선택한 사료 · 전체 시대에서 ${rows.length}개`:'인물이나 사건 이름을 입력해 보세요.');
    this.pane.querySelector('.atlas-search-results').innerHTML=rows.slice(0,40).map(({entity,related})=>`<button class="atlas-result${entity.id===this.selected?' selected':''}" data-search-entity="${esc(entity.id)}" aria-pressed="${entity.id===this.selected}">${icon(entity.type==='Person'?'person':'event')}<span><strong>${esc(data.label(entity))}</strong><small>${related?'관련 ':''}${typeName(entity.type)} · ${esc(data.datesLabel(entity.id))}</small></span>${icon('right')}</button>`).join('')||(query&&!this.ui.chronicle.loading?'<p class="atlas-muted">검색 결과가 없습니다. 다른 이름이나 사료 선택을 확인해 주세요.</p>':'');
    const entity=data.entities.get(this.selected),detail=this.pane.querySelector('.atlas-search-detail');
    if(!entity){detail.replaceChildren();return;}
    const event=data.eventsFor(entity.id)[0],scene=data.scenes.get(event?.sceneId),claim=data.subjects.get(entity.id)?.[0];
    const participant=scene?.participants?.find(p=>p.entityId===entity.id&&(p.claimIds||[]).some(id=>data.claims.has(id)));
    const description=data.description(entity.id)||(entity.type==='Event'?scene?.summary:participant?`${yearLabel(scene.startYear)} · ${participant.role}`:'');
    detail.innerHTML=`<h2>${esc(data.label(entity))}</h2>${description?`<p class="atlas-description">${esc(description)}</p>`:''}
      ${event&&entity.type==='Person'?`<p class="atlas-muted">관련 사건 <strong>${esc(cleanTitle(event.title))}</strong> · ${esc(yearLabel(event.lo))}</p>`:''}
      ${claim?`<button class="atlas-source-link" data-search-proof>${esc(claim.sourceLabel||'기록의 근거')} ↗</button>`:''}
      <button class="atlas-primary" data-search-go>${event?esc(yearLabel(event.lo)+' '+cleanTitle(event.title)+'에서 보기'):'인물 기록 보기'}${icon('right')}</button>`;
  }
  go(){
    const entity=this.ui.data.entities.get(this.selected);if(!entity)return;
    const event=this.ui.data.eventsFor(entity.id)[0];
    this.ui.closeEvidence();
    if(event)this.ui.chronicle.showEvent(event);else this.ui.chronicle.showEntity(entity.id);
  }
}
