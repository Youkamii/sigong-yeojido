import {escapeHtml as esc} from './html.js';

export class SourceComparison {
  constructor(host,callbacks){
    this.host=host;this.callbacks=callbacks;this.sequence=0;
    host.innerHTML='<div class="compare-tools"><label>사건 <select aria-label="비교 사건"></select></label><button class="card-btn" data-compare-sources>이 사례의 사료 켜기</button></div><p class="compare-description"></p><p role="status"></p><div class="compare-rows"></div><div class="compare-links"></div>';
    this.ready=fetch('/api/comparisons').then(r=>{if(!r.ok)throw new Error('비교 목록 조회 실패');return r.json();}).then(data=>{
      this.cases=data.cases;const select=host.querySelector('select');
      for(const entry of this.cases){const o=document.createElement('option');o.value=entry.id;o.textContent=entry.label;select.append(o);}
      select.onchange=()=>this.show();
    });
    host.querySelector('[data-compare-sources]').onclick=()=>{
      const entry=this.cases.find(c=>c.id===host.querySelector('select').value);
      if(entry)this.callbacks.selectSources(entry.sources);
    };
  }

  async show(){
    const seq=++this.sequence;const status=this.host.querySelector('[role=status]');
    const rows=this.host.querySelector('.compare-rows'),links=this.host.querySelector('.compare-links');
    rows.replaceChildren();links.replaceChildren();status.textContent='사료별 주장을 불러오는 중…';
    try{
      await this.ready;if(seq!==this.sequence)return;
      const id=this.host.querySelector('select').value;
      if(!id){status.textContent='수록한 비교 사례가 없다.';return;}
      const filters=this.callbacks.filters();
      const response=await fetch('/api/compare?'+new URLSearchParams({id,origin:filters.origin,sources:[...filters.sources].join(',')}));
      const data=await response.json();if(seq!==this.sequence)return;
      if(!response.ok)throw new Error(data.error||'비교 조회 실패');
      this.host.querySelector('.compare-description').textContent=data.case.description;
      status.textContent=data.rows.length?`${data.sourceCount}개 사료 · ${data.rows.length}개 서술 · ${data.differentRawDates?'원표기 다름':'같은 원표기'}${data.differentProjectedYears?' · 환산 연도 다름':''}`:'현재 선택에 맞는 서술이 없다. 이 사례의 사료를 켤 수 있다.';
      for(const claim of data.rows){
        const card=document.createElement('article');card.className='comparison-card';card.dataset.claim=claim.id;
        card.innerHTML=`<h3>${esc(claim.sourceLabel)}</h3><p>${esc(claim.chunk.locator||claim.citesChunk)}</p>
          <p class="compare-raw">${esc(claim.object.verbatim)}</p><div class="quote">${esc(claim.quote)}</div>
          <p class="empty">판본: ${esc(claim.edition.edition||'별도 판본 표기 없음')} · ${esc(claim.edition.compiler||'편찬자 미상')} · ${esc(claim.edition.composedYear??'편찬년 미상')}</p>
          <p class="empty">${claim.origin==='ai'?'AI 추출':'사람 기록'} · 환산 ${claim.projections.length?'아래 출처별 표시':'근거 미수록'}</p>
          <button class="card-btn" data-action="claim">주장 근거</button><button class="card-btn" data-action="chunk">원문</button><button class="card-btn" data-action="source">사료 카드</button>`;
        card.querySelector('[data-action=claim]').onclick=()=>this.callbacks.claim(claim);
        card.querySelector('[data-action=chunk]').onclick=()=>this.callbacks.chunk(claim.citesChunk);
        card.querySelector('[data-action=source]').onclick=()=>this.callbacks.source(claim.fromSource);
        for(const projection of claim.projections){
          const button=document.createElement('button');button.className='card-btn compare-year';
          const year=value=>value==null?'미상':value<0?`기원전 ${-value}년`:`서기 ${value}년`;
          const source=claim.conversions.find(c=>c.id===projection.claimId)?.sourceLabel||claim.sourceLabel;
          button.textContent=`${year(projection.earliest)}${projection.latest===projection.earliest?'':' ~ '+year(projection.latest)} · ${source} · 연도 근거`;
          button.onclick=()=>this.callbacks.time(claim,projection);card.append(button);
        }
        rows.append(card);
      }
      const title=document.createElement('h3');title.textContent='같은 사건으로 연결한 근거';links.append(title);
      if(!data.links.length){const empty=document.createElement('p');empty.className='empty';empty.textContent='현재 사료·작성자 선택에서 사건 연결 근거가 없다.';links.append(empty);}
      for(const claim of data.links){
        const card=document.createElement('article');card.className='compare-link';card.dataset.claim=claim.id;
        card.innerHTML=`<p>${esc(claim.sourceLabel)} · ${claim.origin==='ai'?'AI 연결':'사람 연결'}</p><div class="quote">${esc(claim.quote)}</div><button class="card-btn">연결 주장과 원문</button>`;
        card.querySelector('button').onclick=()=>this.callbacks.claim(claim);links.append(card);
      }
    }catch(error){if(seq===this.sequence)status.textContent=error.message;}
  }
}
