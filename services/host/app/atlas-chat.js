import {EvidenceChat} from './chat.js';
import {escapeHtml as esc} from './html.js';
import {icon} from './atlas-icons.js';
import {yearLabel} from './chronicle.js';
import {cleanTitle} from './atlas-data.js';

export class AtlasChat{
  constructor(ui){
    this.ui=ui;
    this.pane=document.createElement('aside');this.pane.className='atlas-pane atlas-left atlas-chat';this.pane.id='atlasChat';this.pane.setAttribute('aria-label','AI와 역사 이야기');
    this.pane.innerHTML=`<header><h2>${icon('star')} AI와 역사 이야기</h2><button class="atlas-icon" data-close aria-label="AI 대화 닫기">${icon('close')}</button></header><div class="atlas-chat-body"></div>`;
    ui.registerPanel('chat',this.pane);
    const host=this.pane.querySelector('.atlas-chat-body');
    this.chat=new EvidenceChat(host,{filters:()=>({...ui.filters(),entity:this.entityId||null}),citation:ui.evidence});
    host.querySelector('h2').remove();
    this.context=document.createElement('p');this.context.className='atlas-chat-context';host.prepend(this.context);
    this.thread=document.createElement('div');this.thread.className='atlas-chat-thread';
    this.question=document.createElement('p');this.question.className='atlas-chat-question';this.question.hidden=true;
    this.thread.append(host.querySelector('.chat-note'),this.question,host.querySelector('.chat-status'),host.querySelector('.chat-answer'));host.append(this.thread);
    this.suggestions=document.createElement('div');this.suggestions.className='atlas-chat-suggestions';host.append(this.suggestions);
    const form=host.querySelector('form');host.append(form);
    const input=form.querySelector('textarea');input.rows=1;input.placeholder='궁금한 역사를 물어보세요';
    form.querySelector('button').innerHTML=icon('send');form.querySelector('button').setAttribute('aria-label','질문 보내기');
    input.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();form.requestSubmit();}};
    form.addEventListener('submit',()=>{if(!input.value.trim())return;this.question.textContent=input.value.trim();this.question.hidden=false;this.suggestions.hidden=true;this.thread.scrollTop=this.thread.scrollHeight;});
    this.suggestions.onclick=e=>{const button=e.target.closest('[data-chat-suggestion]');if(button){input.value=button.dataset.chatSuggestion;input.focus();}};
    ui.root.querySelector('#atlasAsk').hidden=false;
    ui.root.querySelector('#atlasAsk').onclick=()=>{if(ui.panel==='chat')ui.closePanel();else this.show(ui.story?.entity?.id);};
  }
  show(id){
    if(this.entityId!==id)this.invalidate();
    this.entityId=id||null;this.renderContext();this.ui.openPanel('chat');
  }
  invalidate(reason='선택한 이야기나 사료가 바뀌었습니다. 현재 기록으로 다시 질문해 보세요.'){
    this.entityId=null;this.chat.filtersChanged();
    this.pane.querySelector('.chat-status').textContent=reason;
    this.question.hidden=true;this.suggestions.hidden=false;
  }
  renderContext(){
    const entity=this.ui.data.entities.get(this.entityId);
    this.context.textContent=`선택한 이야기 · ${entity?this.ui.data.label(entity)+' · ':''}${yearLabel(this.ui.chronicle.year)}`;
    const events=entity?this.ui.data.eventsFor(entity.id):this.ui.data.context?.events||[];
    const questions=[...new Set(events.slice(0,3).map(e=>`${cleanTitle(e.title)}에 대해 기록은 어떻게 설명하나요?`))];
    if(entity?.type==='Person')questions.unshift(`${this.ui.data.label(entity)}과 관련된 사건을 알려주세요.`);
    this.suggestions.innerHTML=questions.length?`<p>이런 질문도 해보세요</p>${questions.slice(0,3).map(q=>`<button data-chat-suggestion="${esc(q)}">${esc(q)}</button>`).join('')}`:'';
  }
  update(changed){if(changed){this.invalidate();this.renderContext();}}
}
