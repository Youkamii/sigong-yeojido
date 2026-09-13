const imageRoot='/assets/ai-images/';
let catalog=null,loading=null;

export function loadAiImages(){
  if(!loading)loading=Promise.all([
    fetch(imageRoot+'index.json'),fetch('/app/ai-image-map.json'),
  ].map(async response=>{
    const result=await response;
    if(!result.ok)throw new Error('AI 이미지 목록을 불러오지 못했습니다.');
    return result.json();
  })).then(([index,map])=>{
    if(!Array.isArray(index?.images)||!map) return null;
    catalog={index,map};return catalog;
  }).catch(()=>null);
  return loading;
}

// catalog를 넘기면 네트워크나 전역 상태 없이 매핑을 검사할 수 있다.
export function aiImageFor({entityId,sceneId,itemId}={},data=catalog){
  if(!data)return null;
  const {index,map}=data;
  const ids=[map.scenes?.[sceneId],map.items?.[itemId],map.entities?.[entityId]];
  const image=ids.filter(Boolean).map(id=>index.images.find(image=>image.id===id)).find(Boolean);
  if(!image?.file||!image.preview)return null;
  return {
    src:imageRoot+image.file,preview:imageRoot+image.preview,
    alt:`${image.title}의 AI 생성 상상도`,title:image.title,
    label:index.label||'AI 생성 상상도',
    notice:index.notice||'실제 사료·유물 사진이 아니라 AI가 만든 상상도입니다.',
    basis:image.basis||'',caveats:image.caveats||'',
    generatedAt:image.generatedAt||'',generator:image.generator||'',
  };
}

export function pickSrc(image,quality){return image?(quality==='low'?image.preview:image.src):null;}
