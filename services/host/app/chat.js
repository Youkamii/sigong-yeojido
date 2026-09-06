export class EvidenceChat {
  constructor(host, callbacks) {
    this.host=host; this.callbacks=callbacks; this.sequence=0; this.pending=false;
    host.innerHTML=`<h2>사료에 묻기</h2>
      <p class="chat-note">선택한 사료에 연결된 주장을 찾아 답한다. 각 문장의 근거를 누르면 인용과 원문을 볼 수 있다.</p>
      <form><label for="chatQuestion">질문</label><textarea id="chatQuestion" required maxlength="1000" rows="3" placeholder="광개토왕의 이름과 즉위에 대해 비문은 어떻게 서술하나?"></textarea>
      <button type="submit">질문하기</button></form>
      <div class="chat-status" role="status"></div><div class="chat-answer"></div>`;
    host.querySelector('form').onsubmit=event=>{event.preventDefault();this.ask();};
  }

  filtersChanged() {
    ++this.sequence;
    this.host.querySelector('.chat-answer').replaceChildren();
    this.host.querySelector('.chat-status').textContent='사료 선택이 바뀌었다. 현재 조건으로 다시 질문할 수 있다.';
  }

  async ask() {
    if(this.pending)return;
    const question=this.host.querySelector('textarea').value.trim();
    if(!question)return;
    const seq=++this.sequence, button=this.host.querySelector('button'), status=this.host.querySelector('.chat-status');
    this.pending=true;button.disabled=true;status.textContent='선택한 근거를 읽고 답변하는 중…';
    this.host.querySelector('.chat-answer').replaceChildren();
    try {
      const filters=this.callbacks.filters();
      const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({question,...filters,sources:[...filters.sources]})});
      const result=await response.json();
      if(seq!==this.sequence)return;
      if(!response.ok)throw new Error(result.error||'답변을 불러오지 못했다.');
      status.textContent=result.status==='answered'?`주장 ${result.evidenceCount}개를 확인했다.${result.truncated?' 검색된 근거 중 일부만 사용했다.':''}`:'답할 근거가 부족하다.';
      const answer=this.host.querySelector('.chat-answer');
      for(const sentence of result.sentences) {
        const paragraph=document.createElement('p');
        paragraph.className='chat-sentence';
        paragraph.append(document.createTextNode(sentence.text+' '));
        sentence.citations.forEach((claim,index)=>{
          const cite=document.createElement('button');cite.className='chat-citation';
          cite.textContent=`[근거 ${index+1}]`;cite.title=claim.sourceLabel+' · '+(claim.chunk.locator||claim.citesChunk);
          cite.onclick=()=>this.callbacks.citation(claim);paragraph.append(cite);
        });
        answer.append(paragraph);
      }
      if(result.unanswered) {
        const note=document.createElement('p');note.className='chat-note';note.textContent=result.unanswered;answer.append(note);
      }
      if(result.status==='answered')answer.insertAdjacentHTML('beforeend','<p class="chat-note">Claude가 작성한 설명이다. 인용 연결은 확인했으며, 해석은 원문과 함께 검토할 수 있다.</p>');
    } catch(error) { if(seq===this.sequence)status.textContent=error.message; }
    finally {this.pending=false;button.disabled=false;}
  }
}
