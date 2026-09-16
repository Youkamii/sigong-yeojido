import {sourcesParam} from './chronicle-load.js';
import {escapeHtml as esc} from './html.js';

export class SourceComparison {
  constructor(host,callbacks){
    this.host=host;this.callbacks=callbacks;this.sequence=0;this.mode='documented';this.offset=0;
    host.innerHTML='<div class="compare-tools"><label>사건 <select aria-label="비교 사건"></select></label><button class="card-btn" data-compare-sources>이 사례의 자료 켜기</button><button class="card-btn" data-find-differences>연도 차이 자동 찾기</button></div><div class="comparison-discovery" hidden><p class="empty" data-discovery-status></p><div data-difference-list></div><button class="card-btn" data-diff-prev>이전 보기</button><button class="card-btn" data-diff-next>다음 보기</button></div><p class="compare-description"></p><p role="status"></p><div class="compare-rows"></div><div class="compare-links"></div>';
    this.ready=fetch('/api/comparisons').then(r=>{if(!r.ok)throw new Error('비교 목록을 불러오지 못했어요.');return r.json();}).then(data=>{
      this.cases=data.cases;const select=host.querySelector('select');
      for(const entry of this.cases){const o=document.createElement('option');o.value=entry.id;o.textContent=entry.label;select.append(o);}
      select.onchange=()=>{this.mode='documented';this.show();};
    });
    host.querySelector('[data-compare-sources]').onclick=()=>{
      this.mode='documented';
      const entry=this.cases.find(c=>c.id===host.querySelector('select').value);
      if(entry)this.callbacks.selectSources(entry.sources);
    };
    host.querySelector('[data-find-differences]').onclick=()=>this.findDifferences();
    host.querySelector('[data-diff-prev]').onclick=()=>this.findDifferences(Math.max(0,this.offset-10));
    host.querySelector('[data-diff-next]').onclick=()=>this.findDifferences(this.offset+10);
  }

  async show(){
    if(this.mode==='automatic')return this.findDifferences(this.offset);
    this.host.querySelector('.comparison-discovery').hidden=true;
    const seq=++this.sequence;const status=this.host.querySelector('[role=status]');
    const rows=this.host.querySelector('.compare-rows'),links=this.host.querySelector('.compare-links');
    rows.replaceChildren();links.replaceChildren();status.textContent='자료별 기록을 불러오고 있어요…';
    try{
      await this.ready;if(seq!==this.sequence)return;
      const id=this.host.querySelector('select').value;
      if(!id){status.textContent='비교할 사례가 없어요.';return;}
      const filters=this.callbacks.filters();
      const response=await fetch('/api/compare?'+new URLSearchParams({id,origin:filters.origin,sources:sourcesParam(filters.sources,filters.primary)}));
      const data=await response.json();if(seq!==this.sequence)return;
      if(!response.ok)throw new Error(data.error||'비교 결과를 불러오지 못했어요.');
      this.render(data);
    }catch(error){if(seq===this.sequence)status.textContent=error.message;}
  }

  async findDifferences(offset=0){
    this.mode='automatic';this.offset=offset;
    const seq=++this.sequence,filters=this.callbacks.filters();
    const discovery=this.host.querySelector('.comparison-discovery'),list=this.host.querySelector('[data-difference-list]');
    const message=this.host.querySelector('[data-discovery-status]');discovery.hidden=false;list.replaceChildren();
    this.host.querySelector('.compare-rows').replaceChildren();this.host.querySelector('.compare-links').replaceChildren();
    this.host.querySelector('[role=status]').textContent='';
    this.host.querySelector('.compare-description').textContent='고른 자료에서 같은 사건의 연결과 연도 근거를 비교해요. 연도를 서기로 바꾸지 못한 기록은 이 목록에 나오지 않아요.';
    message.textContent='연결된 기록에서 연도 차이를 찾고 있어요…';
    discovery.querySelectorAll('button').forEach(b=>b.disabled=true);
    try{
      const response=await fetch('/api/comparison-differences?'+new URLSearchParams({sources:sourcesParam(filters.sources,filters.primary),origin:filters.origin,offset,limit:10}));
      const data=await response.json();if(seq!==this.sequence)return;
      if(!response.ok)throw new Error(data.error||'연도 차이를 불러오지 못했어요.');
      message.textContent=data.comparisons.length?`연도 차이가 있는 수록 사건 ${offset+1}~${offset+data.comparisons.length}`:'고른 자료에 연도 차이를 확인할 사건 연결이 없어요.';
      for(const entry of data.comparisons){
        const button=document.createElement('button');button.className='card-btn';button.dataset.difference=entry.case.id;
        button.textContent=entry.case.label;button.onclick=()=>this.render(entry);list.append(button);
      }
      discovery.querySelector('[data-diff-prev]').disabled=offset===0;
      discovery.querySelector('[data-diff-next]').disabled=!data.hasMore;
      if(data.comparisons.length)this.render(data.comparisons[0]);
    }catch(error){if(seq===this.sequence)message.textContent=error.message;}
  }

  render(data){
      const status=this.host.querySelector('[role=status]'),rows=this.host.querySelector('.compare-rows'),links=this.host.querySelector('.compare-links');
      rows.replaceChildren();links.replaceChildren();
      this.host.querySelector('.compare-description').textContent=data.case.description;
      status.textContent=data.rows.length?`${data.sourceCount}개 자료, ${data.rows.length}개 기록: ${data.differentRawDates?'원래 날짜 다름':'원래 날짜 같음'}${data.differentProjectedYears?', 서기로 바꾼 연도 다름':''}`:'고른 자료에 맞는 기록이 없어요. 이 사례의 자료를 켜 보세요.';
      for(const claim of data.rows){
        const card=document.createElement('article');card.className='comparison-card';card.dataset.claim=claim.id;
        card.innerHTML=`<h3>${esc(claim.sourceLabel)}</h3><p>${esc(claim.chunk.locator||claim.citesChunk)}</p>
          <p class="compare-raw">${esc(claim.object.verbatim)}</p><div class="quote">${esc(claim.quote)}</div>
          ${claim.note?`<details><summary>해석과 한계</summary><p class="empty">${esc(claim.note)}</p></details>`:''}
          <p class="empty">판본: ${esc(claim.edition.edition||'판본 미확인')} · ${esc(claim.edition.compiler||'엮은이 미확인')} · ${esc(claim.edition.composedYear??'편찬 연도 미확인')}</p>
          <p class="empty">${claim.origin==='ai'?'AI 추출':'사람 기록'} · 서기로 바꾼 날짜: ${claim.projections.length?'아래에서 출처별로 보기':'근거 없음'}</p>
          <button class="card-btn" data-action="claim">기록 출처 보기</button><button class="card-btn" data-action="chunk">원문 보기</button><button class="card-btn" data-action="source">자료 설명 보기</button>`;
        card.querySelector('[data-action=claim]').onclick=()=>this.callbacks.claim(claim);
        card.querySelector('[data-action=chunk]').onclick=()=>this.callbacks.chunk(claim.citesChunk);
        card.querySelector('[data-action=source]').onclick=()=>this.callbacks.source(claim.fromSource);
        for(const projection of claim.projections){
          const button=document.createElement('button');button.className='card-btn compare-year';
          const year=value=>value==null?'미확인':value<0?`기원전 ${-value}년`:`서기 ${value}년`;
          const source=claim.conversions.find(c=>c.id===projection.claimId)?.sourceLabel||claim.sourceLabel;
          button.textContent=`${year(projection.earliest)}${projection.latest===projection.earliest?'':' ~ '+year(projection.latest)} · ${source} · 연도 출처 보기`;
          button.onclick=()=>this.callbacks.time(claim,projection);card.append(button);
        }
        rows.append(card);
      }
      const title=document.createElement('h3');title.textContent='사건 연결 근거';links.append(title);
      if(!data.links.length){const empty=document.createElement('p');empty.className='empty';empty.textContent='고른 자료와 작성자에 맞는 사건 연결 근거가 없어요.';links.append(empty);}
      for(const claim of data.links){
        const card=document.createElement('article');card.className='compare-link';card.dataset.claim=claim.id;
        card.innerHTML=`<p>${esc(claim.sourceLabel)} · ${claim.origin==='ai'?'AI 연결':'사람 연결'}</p><div class="quote">${esc(claim.quote)}</div>${claim.note?`<details><summary>연결 근거와 한계</summary><p class="empty">${esc(claim.note)}</p></details>`:''}<button class="card-btn">연결 기록과 원문 보기</button>`;
        card.querySelector('button').onclick=()=>this.callbacks.claim(claim);links.append(card);
      }
  }
}
