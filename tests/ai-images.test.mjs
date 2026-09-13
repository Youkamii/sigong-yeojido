import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {aiImageFor,pickSrc} from '../services/host/app/ai-images.js';

const images=['scene','item','entity'].map(id=>({id,title:id,file:id+'.jpg',preview:id+'-512.jpg',basis:'바탕 자료',caveats:'상상한 부분',generatedAt:'2026-09-13',generator:'codex'}));
const data={index:{images,label:'AI 생성 상상도',notice:'실제 사료·유물 사진이 아니라 AI가 만든 상상도입니다.'},map:{scenes:{s:'scene'},items:{i:'item'},entities:{e:'entity'}}};

test('AI 이미지 매핑은 장면 > 항목 > 개체 순서다',()=>{
  assert.equal(aiImageFor({sceneId:'s',itemId:'i',entityId:'e'},data).title,'scene');
  assert.equal(aiImageFor({sceneId:'missing',itemId:'i',entityId:'e'},data).title,'item');
  assert.equal(aiImageFor({entityId:'e'},data).title,'entity');
});

test('매핑 또는 이미지가 없거나 아직 로드되지 않으면 null이다',()=>{
  assert.equal(aiImageFor({entityId:'missing'},data),null);
  assert.equal(aiImageFor({},data),null);
  assert.equal(aiImageFor({entityId:'e'},null),null);
  assert.equal(aiImageFor({entityId:'e'},{...data,index:{images:[]}}),null);
});

test('낮음은 미리보기, 보통과 높음은 본 이미지를 고른다',()=>{
  const image=aiImageFor({entityId:'e'},data);
  assert.equal(pickSrc(image,'low'),'/assets/ai-images/entity-512.jpg');
  for(const quality of ['medium','high',undefined])assert.equal(pickSrc(image,quality),'/assets/ai-images/entity.jpg');
  assert.equal(pickSrc(null,'low'),null);
});

test('상상도 표시와 생성 근거를 보존한다',()=>{
  assert.deepEqual(aiImageFor({entityId:'e'},data),{
    src:'/assets/ai-images/entity.jpg',preview:'/assets/ai-images/entity-512.jpg',
    alt:'entity의 AI 생성 상상도',title:'entity',label:data.index.label,notice:data.index.notice,
    basis:'바탕 자료',caveats:'상상한 부분',generatedAt:'2026-09-13',generator:'codex',
  });
});

test('선택 필드가 없는 기존 매핑에서도 표시하고 이미지 파일 누락은 생략한다',()=>{
  const minimal={index:{images:[images[2]]},map:{entities:{e:'entity'}}};
  assert.equal(aiImageFor({entityId:'e'},minimal).label,'AI 생성 상상도');
  assert.equal(aiImageFor({entityId:'e'},{...minimal,index:{images:[{id:'entity',file:'entity.jpg'}]}}),null);
});

test('파일럿 매핑은 실제 이미지와 개체·장면을 가리킨다',async()=>{
  const root=new URL('../services/host/',import.meta.url);
  const index=JSON.parse(await readFile(new URL('assets/ai-images/index.json',root),'utf8'));
  const map=JSON.parse(await readFile(new URL('app/ai-image-map.json',root),'utf8'));
  const history=JSON.parse(await readFile(new URL('app/history-scenes.json',root),'utf8'));
  assert.ok(map.items&&typeof map.items==='object'&&!Array.isArray(map.items));
  assert.equal(aiImageFor({entityId:'person-encykorea-sejong-e0029857'},{index,map}).title,'세종 인물 상상도');
  assert.equal(aiImageFor({sceneId:'scene-hansando-daecheop-1592'},{index,map}).src,'/assets/ai-images/hansando-1592.jpg');
  assert.equal(aiImageFor({entityId:'event-encykorea-hunminjeongeum-banpo-1446'},{index,map}).src,'/assets/ai-images/sejong-hunminjeongeum-1446.jpg');
  for(const id of Object.keys(map.scenes))assert.ok(history.scenes.some(scene=>scene.id===id),id);
  for(const id of new Set([...Object.values(map.entities),...Object.values(map.scenes)])){
    const image=index.images.find(image=>image.id===id);assert.ok(image,id);
    for(const file of [image.file,image.preview])assert.ok((await stat(new URL('assets/ai-images/'+file,root))).size>0);
  }
});

test('동시 로드는 두 JSON을 한 번씩 요청하고 실패를 UI로 던지지 않는다',async t=>{
  const calls=[];
  t.mock.method(globalThis,'fetch',async url=>{calls.push(url);return {ok:true,json:async()=>url.endsWith('index.json')?data.index:data.map};});
  const module=await import('../services/host/app/ai-images.js?load-test');
  const first=module.loadAiImages();assert.equal(first,module.loadAiImages());
  await first;
  assert.deepEqual(calls,['/assets/ai-images/index.json','/app/ai-image-map.json']);
  assert.equal(module.aiImageFor({entityId:'e'}).title,'entity');
  assert.equal(module.loadAiImages(),first);
});

for(const failure of ['network','http','json','shape'])test(`이미지 목록 ${failure} 실패에도 null로 끝나고 재요청하지 않는다`,async t=>{
  let calls=0;
  t.mock.method(globalThis,'fetch',async()=>{
    calls++;
    if(failure==='network')throw new Error('offline');
    return {ok:failure!=='http',json:async()=>{if(failure==='json')throw new Error('invalid JSON');return {};}};
  });
  const module=await import(`../services/host/app/ai-images.js?failure-${failure}`);
  assert.equal(await module.loadAiImages(),null);
  assert.equal(module.aiImageFor({entityId:'e'}),null);
  assert.equal(await module.loadAiImages(),null);
  assert.equal(calls,2);
});
