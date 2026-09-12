import test from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

const three=new URL('../services/host/vendor/three.module.min.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){return s==='three'?{url:${JSON.stringify(three)},shortCircuit:true}:n(s,c);}`),import.meta.url);
const {selectSceneSites}=await import('../services/host/app/chronicle-scenery.js');
const site=(id,x,z,radius,extra={})=>({id,x,z,radius,kind:'urban',documented:false,...extra});

test('original Seoul and Gangnam survive a larger documented urban site at the Seoul center',()=>{
  const documented=site('settlement-region:inhabited:place-goryeosa-039',-60.84,133.3,28,{documented:true});
  const seoul=site('urban-region:seoul',-60.84,133.3,20);
  const gangnam=site('urban-region:gangnam',-60.84,146.3,15);
  const sites=Object.freeze([documented,gangnam,seoul].map(Object.freeze));
  for(const input of [sites,[...sites].reverse()]){
    assert.deepEqual(selectSceneSites(input,new Set()),{
      current:[seoul,gangnam],major:[seoul,gangnam],selected:[seoul,gangnam]
    });
  }
  assert.deepEqual(sites,[documented,gangnam,seoul],'selection does not mutate the input');
});

test('documented urban stays alone and inside a major radius at a different center',()=>{
  const documented=site('settlement-region:busan',0,0,28,{documented:true});
  const neighbor=site('urban-region:neighbor',13,0,15);
  assert.deepEqual(selectSceneSites([documented],new Set()),{
    current:[documented],major:[],selected:[documented]
  });
  assert.deepEqual(selectSceneSites([documented,neighbor],new Set()),{
    current:[documented,neighbor],major:[neighbor],selected:[documented,neighbor]
  });
});

test('same-center priority applies below 0.1 and leaves the boundary and different kinds intact',()=>{
  const original=site('urban-region:original',0,0,20);
  for(const distance of [0,.099,.1]){
    const documented=site('settlement-region:documented',distance,0,28,{documented:true});
    assert.deepEqual(selectSceneSites([documented,original],new Set()).selected,
      distance<.1?[original]:[documented,original]);
  }
  for(const distance of [0,13]){
    const regional=site('settlement-region:regional',distance,0,28,{kind:'regional',documented:true});
    assert.deepEqual(selectSceneSites([regional,original],new Set()).selected,[regional,original]);
  }
});

test('estimated sites remain selected only when their IDs are present',()=>{
  const estimated=site('estimated-region:test',0,0,6,{kind:'village',estimated:true});
  const estimatedIds=new Set([estimated.id]);
  assert.deepEqual(selectSceneSites([estimated],new Set()),{
    current:[estimated],major:[],selected:[]
  });
  assert.deepEqual(selectSceneSites([estimated],estimatedIds),{
    current:[estimated],major:[],selected:[estimated]
  });
  assert.deepEqual([...estimatedIds],[estimated.id],'selection does not mutate the ID set');
});

test('other duplicates keep radius priority and the ID tie-break',()=>{
  const small=site('settlement-region:small',0,0,12,{documented:true});
  const large=site('settlement-region:large',0,0,28,{documented:true});
  const a=site('settlement-region:a',40,0,28,{kind:'regional',documented:true});
  const b={...a,id:'settlement-region:b'};
  assert.deepEqual(selectSceneSites([small,b,large,a],new Set()),{
    current:[a,large],major:[],selected:[a,large]
  });
});

test('documented Jeju remains when its original urban profile is suppressed by an active scene',()=>{
  const documented=site('settlement-region:inhabited:scene-regional163-jeju-1955',0,0,28,
    {documented:true,profile:{id:'inhabited:scene-regional163-jeju-1955'}});
  const original=site('urban-region:jeju',0,0,9,{profile:{id:'jeju'}});
  const suppressed=new Set(['jeju']);
  for(const input of [[documented,original],[original,documented]]){
    assert.deepEqual(selectSceneSites(input,new Set(),suppressed),{
      current:[documented],major:[],selected:[documented]
    });
    assert.deepEqual(selectSceneSites(input,new Set(),new Set()).selected,[original]);
    assert.deepEqual(selectSceneSites(input,new Set(),new Set(['another-city'])).selected,[original]);
  }
  assert.deepEqual([...suppressed],['jeju']);
});
