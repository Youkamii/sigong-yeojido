const indexUrl=new URL('../assets/ai-images/index.json',import.meta.url);
const imageRoot=new URL('.',indexUrl).href;
let catalog=null,loading=null;

export function loadAiImages(){
  // 실패도 저장해 이 페이지에서는 재시도하지 않는다.
  if(!loading)loading=fetch(indexUrl).then(async response=>{
    if(!response.ok)throw new Error('AI 상상도 목록을 불러오지 못했어요.');
    const index=await response.json();
    if(!Array.isArray(index?.images))return null;
    catalog=new Map();
    for(const image of index.images){
      if(!image||!['id','file','preview'].every(key=>typeof image[key]==='string')||
        [image.file,image.preview].some(file=>!file||/[\\/]|\.\./.test(file))||!Array.isArray(image.subjects))continue;
      const entry={
        src:imageRoot+image.file,preview:imageRoot+image.preview,
        alt:image.title,label:'AI 상상도',
        notice:index.notice||'실제 사료·유물 사진이 아니라 AI가 만든 상상도입니다.',
        width:image.width,height:image.height,
        basis:image.basis||'',caveats:image.caveats||'',
        generatedAt:typeof image.generatedAt==='string'?image.generatedAt.slice(0,10):'',generator:image.generator||'',
      };
      for(const subject of image.subjects)if(typeof subject==='string'&&subject.trim())catalog.set(subject,entry);
    }
    return catalog;
  }).catch(()=>null);
  return loading;
}

export function aiImageFor({entityId,sceneId}={}){
  return [sceneId,entityId].map(id=>catalog?.get(id)).find(Boolean)||null;
}
