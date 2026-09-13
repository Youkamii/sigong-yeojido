import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';

const root=new URL('../services/host/',import.meta.url);
const images=['scene','entity'].map(id=>({id,subjects:[id],title:id,file:id+'.jpg',preview:id+'-512.jpg',width:683,height:1024,basis:'basis',caveats:'caveats',generatedAt:'2026-09-13T15:00:00Z',generator:'codex'}));
const index={images,label:'label from index',notice:'notice from index'};
let sequence=0;
async function load(t,data=index){
  t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>data}));
  const module=await import(`../services/host/app/ai-images.js?test-${sequence++}`);
  assert.equal(module.aiImageFor({entityId:'entity'}),null);
  await module.loadAiImages();
  return module;
}

test('scene mapping takes priority, missing scene falls back to entity',async t=>{
  const {aiImageFor}=await load(t);
  assert.equal(aiImageFor({sceneId:'scene',entityId:'entity'}).alt,'scene');
  assert.equal(aiImageFor({sceneId:'missing',entityId:'entity'}).alt,'entity');
  assert.equal(aiImageFor({entityId:'missing'}),null);
  assert.equal(aiImageFor(),null);
});

test('display metadata, image dimensions and date are preserved',async t=>{
  const {aiImageFor}=await load(t);
  assert.deepEqual(aiImageFor({entityId:'entity'}),{
    src:new URL('assets/ai-images/entity.jpg',root).href,
    preview:new URL('assets/ai-images/entity-512.jpg',root).href,
    alt:'entity',label:index.label,notice:index.notice,width:683,height:1024,
    basis:'basis',caveats:'caveats',generatedAt:'2026-09-13',generator:'codex',
  });
});

test('invalid rows are filtered during load without losing valid mappings',async t=>{
  const invalid=[null,{}, {...images[0],file:undefined}, {...images[0],preview:undefined},
    {...images[0],id:3}, {...images[0],file:3}, {...images[0],preview:null},
    ...['../bad.jpg','dir/bad.jpg','dir'+String.fromCharCode(92)+'bad.jpg','bad..jpg',''].flatMap(file=>[
      {...images[0],file}, {...images[0],preview:file},
    ]), {...images[0],subjects:null}];
  const {aiImageFor}=await load(t,{images:[...invalid,images[1],{...images[1],subjects:[null,{},'', 'alias']}]});
  assert.equal(aiImageFor({sceneId:'scene'}),null);
  assert.equal(aiImageFor({entityId:'entity'}).alt,'entity');
  assert.equal(aiImageFor({entityId:'alias'}).alt,'entity');
});

test('pilot subjects refer to real scenes and existing image files',async t=>{
  const pilot=JSON.parse(await readFile(new URL('assets/ai-images/index.json',root),'utf8'));
  const history=JSON.parse(await readFile(new URL('app/history-scenes.json',root),'utf8'));
  const {aiImageFor}=await load(t,pilot);
  for(const [subject,file] of [
    ['person-joseon-sejong','sejong-portrait.jpg'],
    ['person-encykorea-sejong-e0029857','sejong-portrait.jpg'],
    ['scene-hansando-daecheop-1592','hansando-1592.jpg'],
    ['event-encykorea-hunminjeongeum-banpo-1446','sejong-hunminjeongeum-1446.jpg'],
  ])assert.ok(aiImageFor({entityId:subject}).src.endsWith('/'+file));
  for(const image of pilot.images){
    assert.ok(image.subjects.length>0);
    assert.equal(new Set(image.subjects).size,image.subjects.length);
    for(const id of image.subjects.filter(id=>id.startsWith('scene-')))assert.ok(history.scenes.some(scene=>scene.id===id),id);
    for(const file of [image.file,image.preview])assert.ok((await stat(new URL('assets/ai-images/'+file,root))).size>0);
  }
});

test('concurrent loads request only index once and reuse the result',async t=>{
  const calls=[];
  t.mock.method(globalThis,'fetch',async url=>{calls.push(url.href);return {ok:true,json:async()=>index};});
  const module=await import('../services/host/app/ai-images.js?load-test');
  const first=module.loadAiImages();assert.equal(first,module.loadAiImages());
  await first;
  assert.deepEqual(calls,[new URL('assets/ai-images/index.json',root).href]);
  assert.equal(module.aiImageFor({entityId:'entity'}).alt,'entity');
  assert.equal(module.loadAiImages(),first);
});

for(const failure of ['network','http','json','shape'])test(`index ${failure} failure returns null without retry`,async t=>{
  let calls=0;
  t.mock.method(globalThis,'fetch',async()=>{
    calls++;
    if(failure==='network')throw new Error('offline');
    return {ok:failure!=='http',json:async()=>{if(failure==='json')throw new Error('invalid JSON');return {};}};
  });
  const module=await import(`../services/host/app/ai-images.js?failure-${failure}`);
  assert.equal(await module.loadAiImages(),null);
  assert.equal(module.aiImageFor({entityId:'entity'}),null);
  assert.equal(await module.loadAiImages(),null);
  assert.equal(calls,1);
});
