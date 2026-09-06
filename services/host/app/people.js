import {escapeHtml as esc} from './html.js';

export class PeopleSearch {
  constructor(host,callbacks){
    this.host=host;this.callbacks=callbacks;this.sequence=0;this.active=false;
    host.innerHTML=`<summary>기간·나라로 인물 찾기</summary>
      <form><label>나라<select name="polity" class="q" aria-label="인물의 나라"></select></label>
      <label>시작 연도<input name="from" class="q" type="number" value="501" required></label>
      <label>끝 연도<input name="to" class="q" type="number" value="600" required></label>
      <button class="card-btn" type="submit">조건 검색</button></form>
      <p class="empty">현재 켠 사료 안에서 소속과 활동 기간이 함께 기록된 인물. 재위 기간은 생몰년 전체와 다르다.</p>
      <p role="status" class="empty"></p><div class="people-results qlist"></div>
      <button class="card-btn" data-more hidden>더 보기</button>`;
    host.querySelector('form').onsubmit=event=>{event.preventDefault();this.search();};
    host.querySelector('[data-more]').onclick=()=>this.search(this.offset+this.limit);
    host.querySelector('.people-results').onclick=event=>{
      const button=event.target.closest('[data-person]');if(button)this.callbacks.select(button.dataset.person);
    };
  }

  setPolities(entities){
    this.host.querySelector('[name=polity]').innerHTML=entities.filter(e=>e.type==='Polity').map(e=>
      `<option value="${esc(e.id)}" ${e.id==='polity-silla'?'selected':''}>${esc(e.label||e.id)}</option>`).join('');
  }

  filtersChanged(){if(this.active)this.search();}

  async search(offset=0){
    this.active=true;this.offset=offset;this.limit=20;
    const seq=++this.sequence,form=this.host.querySelector('form'),filters=this.callbacks.filters();
    const query=new URLSearchParams(new FormData(form));
    query.set('sources',[...filters.sources].join(','));query.set('origin',filters.origin);
    query.set('offset',offset);query.set('limit',this.limit);
    const status=this.host.querySelector('[role=status]'),results=this.host.querySelector('.people-results');
    status.textContent='조건에 맞는 근거를 찾는 중…';results.replaceChildren();this.host.querySelector('[data-more]').hidden=true;
    try{
      const response=await fetch('/api/people?'+query),data=await response.json();
      if(seq!==this.sequence)return;
      if(!response.ok)throw new Error(data.error||'인물 조회 실패');
      this.data=data;
      status.textContent=data.people.length?`수록 인물 ${offset+1}~${offset+data.people.length}${data.hasMore?' · 다음 결과 있음':''}`:'현재 조건에 맞는 수록 주장이 없다.';
      results.innerHTML=data.people.map(person=>`<button type="button" data-person="${esc(person.id)}">${esc(person.label)}
        ${person.evidence.map(e=>`<small>${esc(e.sourceLabel)} · ${esc(e.activity.verbatim)} · ${e.membership.origin==='ai'||e.activity.origin==='ai'?'자동 연결':'사람 작성'}</small>`).join('')}</button>`).join('');
      this.host.querySelector('[data-more]').hidden=!data.hasMore;
      if(data.evidenceTruncated)status.textContent+=' · 근거 일부 표시';
    }catch(error){if(seq===this.sequence)status.textContent=error.message;}
  }
}
