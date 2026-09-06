import {escapeHtml as esc} from './html.js';

export class GraphExplorer {
  constructor(host, callbacks){
    this.host=host;
    this.callbacks=callbacks;
    this.entity=null;
    this.offset=0;
    this.sequence=0;
    this.nodes=new Map();
    host.innerHTML='<div class="graph-tools"><span role="status"></span><button data-page="-1">이전</button><button data-page="1">다음</button></div><div class="graph-scroll"></div>';
    host.querySelectorAll('[data-page]').forEach(button=>button.onclick=()=>this.show(this.entity,this.offset+Number(button.dataset.page)*12));
    host.querySelector('.graph-scroll').addEventListener('click',event=>this.activate(event.target.closest('[data-node]')?.dataset.node));
    host.querySelector('.graph-scroll').addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){
        const id=event.target.closest('[data-node]')?.dataset.node;
        if(id){event.preventDefault();this.activate(id);}
      }
    });
  }

  async show(entity,offset=0){
    this.entity=entity;
    this.offset=Math.max(0,offset);
    const sequence=++this.sequence;
    const status=this.host.querySelector('[role=status]');
    const canvas=this.host.querySelector('.graph-scroll');
    status.textContent='근거 관계를 불러오는 중…';
    canvas.replaceChildren();
    this.nodes.clear();
    const filters=this.callbacks.filters();
    const query=new URLSearchParams({entity,origin:filters.origin,sources:[...filters.sources].join(','),limit:12,offset:this.offset});
    try{
      const response=await fetch('/api/graph?'+query);
      const data=await response.json();
      if(sequence!==this.sequence)return;
      if(!response.ok)throw new Error(data.error||'그래프 조회 실패');
      this.data=data;
      this.nodes=new Map(data.nodes.map(node=>[node.id,node]));
      status.textContent=`관련 주장 ${data.claims.length?`${this.offset+1}~${this.offset+data.claims.length}`:'0'} · 좌표 ${data.locations?.length||0}${data.moreLocations?'+':''} · 전체 시기`;
      this.host.querySelector('[data-page="-1"]').disabled=this.offset===0;
      this.host.querySelector('[data-page="1"]').disabled=!data.hasMore;
      if(!data.claims.length&&!data.locations?.length){
        status.textContent='현재 사료·작성자 선택에 맞는 연결이 없다.';
        canvas.innerHTML='<p class="empty">사료 선택을 바꾸거나 다른 항목을 찾아볼 수 있다. 기록이 없다는 것이 없었던 일이라는 뜻은 아니다.</p>';
        return;
      }
      this.draw();
    }catch(error){
      if(sequence!==this.sequence)return;
      status.textContent=error.message;
      canvas.innerHTML='<p class="empty">항목을 다시 선택하면 조회를 다시 시도한다.</p>';
    }
  }

  draw(){
    const columns=[[],[],[],[]];
    for(const node of this.nodes.values()){
      const col=node.type==='Claim'?1:node.type==='Chunk'?2:node.type==='Source'?3:0;
      columns[col].push(node);
    }
    const positions=new Map();
    columns.forEach((nodes,col)=>nodes.forEach((node,row)=>positions.set(node.id,{x:col*240+12,y:row*68+45})));
    const height=Math.max(...columns.map(column=>column.length))*68+60;
    const edges=this.data.edges.map(edge=>{
      const a=positions.get(edge.from),b=positions.get(edge.to);
      return `<path d="M${a.x+106},${a.y+24} C${a.x+180},${a.y+24} ${b.x-40},${b.y+24} ${b.x+106},${b.y+24}"><title>${esc(edge.label)}</title></path>`;
    }).join('');
    const nodes=[...this.nodes.values()].map(node=>{
      const pos=positions.get(node.id);
      const text=String(node.label);
      const label=text.length>16?text.slice(0,15)+'…':text;
      const detail=node.type==='Claim'?(node.origin==='human'?'사람':'AI 추출'):node.location?(node.location.grounded?'좌표 근거 연결':'조사 후보 · 미확정'):node.type;
      return `<g data-node="${esc(node.id)}" role="button" tabindex="0" aria-label="${esc(text+' · '+detail)}" transform="translate(${pos.x},${pos.y})" class="graph-node ${node.id===this.entity?'selected':''}">
        <title>${esc(text+' · '+node.id)}</title><rect width="212" height="48" rx="4"/>
        <text x="10" y="19">${esc(label)}</text><text class="graph-kind" x="10" y="36">${esc(detail)}</text></g>`;
    }).join('');
    const labels=['인물·장소·대상','주장','인용한 원문','사료'].map((label,i)=>`<text class="graph-column" x="${i*240+12}" y="24">${label}</text>`).join('');
    this.host.querySelector('.graph-scroll').innerHTML=`<svg width="960" height="${height}" aria-label="항목에서 주장, 원문, 사료로 이어지는 근거 그래프">${labels}<g class="graph-edges">${edges}</g>${nodes}</svg>`;
  }

  activate(id){
    const node=this.nodes.get(id);
    if(!node)return;
    if(node.type==='Source')this.callbacks.source(id);
    else if(node.type==='Chunk')this.callbacks.chunk(id);
    else if(node.type==='Claim')this.callbacks.claim(this.data.claims.find(claim=>claim.id===id));
    else if(node.location)this.callbacks.location(node.location);
    else if(node.type==='Value'||node.type==='Location')this.callbacks.claim(this.data.claims.find(claim=>claim.id===node.claimId));
    else this.callbacks.entity(id,node);
  }
}
