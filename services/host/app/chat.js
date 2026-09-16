export class EvidenceChat {
  constructor(host, callbacks) {
    this.host=host; this.callbacks=callbacks; this.sequence=0; this.pending=false;
    host.innerHTML=`<h2>사료에 묻기</h2>
      <p class="chat-note">고른 사료에 연결된 기록을 찾아 답합니다. 문장의 출처를 누르면 인용과 원문이 열립니다.</p>
      <form><label for="chatQuestion">질문</label><textarea id="chatQuestion" required maxlength="1000" rows="3" placeholder="비문은 광개토왕의 이름과 즉위를 어떻게 설명하나요?"></textarea>
      <button type="submit">물어보기</button></form>
      <div class="chat-status" role="status"></div><div class="chat-answer"></div>`;
    host.querySelector('form').onsubmit=event=>{event.preventDefault();this.ask();};
  }

  filtersChanged() {
    ++this.sequence;
    this.host.querySelector('.chat-answer').replaceChildren();
    this.host.querySelector('.chat-status').textContent='사료 선택이 바뀌었습니다. 현재 조건으로 다시 물어보십시오.';
  }

  async ask() {
    if(this.pending)return;
    const question=this.host.querySelector('textarea').value.trim();
    if(!question)return;
    const seq=++this.sequence, button=this.host.querySelector('form button[type=submit]'), status=this.host.querySelector('.chat-status');
    this.pending=true;button.disabled=true;status.textContent='고른 출처를 읽고 답하고 있습니다…';
    this.host.querySelector('.chat-answer').replaceChildren();
    try {
      const filters=this.callbacks.filters();
      const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({question,...filters,sources:[...filters.sources]})});
      const result=await response.json();
      if(seq!==this.sequence)return;
      if(!response.ok)throw new Error(result.error||'답변을 불러오지 못했습니다.');
      status.textContent=result.status==='answered'?`기록 ${result.evidenceCount}개를 확인했습니다.${result.truncated?' 찾은 출처 중 일부만 썼습니다.':''}`:'답할 근거가 부족합니다.';
      const answer=this.host.querySelector('.chat-answer');
      for(const sentence of result.sentences) {
        const paragraph=document.createElement('p');
        paragraph.className='chat-sentence';
        paragraph.append(document.createTextNode(sentence.text+' '));
        sentence.citations.forEach((claim,index)=>{
          const cite=document.createElement('button');cite.className='chat-citation';
          cite.textContent=`[출처 ${index+1}]`;cite.title=claim.sourceLabel+' · '+(claim.chunk.locator||claim.citesChunk);
          cite.onclick=()=>this.callbacks.citation(claim);paragraph.append(cite);
        });
        answer.append(paragraph);
      }
      if(result.unanswered) {
        const note=document.createElement('p');note.className='chat-note';note.textContent=result.unanswered;answer.append(note);
      }
      if(result.status==='answered')answer.insertAdjacentHTML('beforeend','<p class="chat-note">AI가 쓴 설명입니다. 인용 연결은 확인했습니다. 해석은 원문과 함께 살펴보십시오.</p>');
    } catch(error) { if(seq===this.sequence)status.textContent=error.message; }
    finally {this.pending=false;button.disabled=false;}
  }
}
