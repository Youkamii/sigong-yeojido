import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseQuality,recommendQuality} from '../services/host/app/quality-choice.js';

const desktop={hardwareConcurrency:16,deviceMemory:8,width:1920,height:1080,dpr:1,userAgent:'Windows NT 10.0',maxTouchPoints:0};
test('패드는 낮음을 추천한다',()=>assert.equal(recommendQuality({...desktop,userAgent:'Android',maxTouchPoints:5}),'low'));
test('저사양 노트북은 낮음을 추천한다',()=>assert.equal(recommendQuality({...desktop,hardwareConcurrency:4,deviceMemory:4}),'low'));
test('데스크톱은 높음을 추천한다',()=>assert.equal(recommendQuality(desktop),'high'));
test('Mac UA 아이패드도 터치로 판별한다',()=>assert.equal(recommendQuality({...desktop,userAgent:'Macintosh',maxTouchPoints:5,dpr:2}),'low'));
test('저장값은 추천보다 우선하며 자동 결과를 보존한다',()=>assert.deepEqual(chooseQuality(desktop,'{"name":"low","manual":false}'),{recommended:'high',selected:'low',manual:false,persist:true}));
test('추천값도 자동 시작점이다',()=>assert.deepEqual(chooseQuality(desktop),{recommended:'high',selected:'high',manual:false,persist:true}));
test('수동 저장값은 복원하고 query는 저장하지 않는다',()=>{
  assert.equal(chooseQuality(desktop,{name:'low',manual:true}).manual,true);
  assert.deepEqual(chooseQuality(desktop,{name:'high',manual:false},'low'),{recommended:'high',selected:'low',manual:true,persist:false});
});
test('4코어 16GB 데스크톱은 보통이다',()=>assert.equal(recommendQuality({...desktop,hardwareConcurrency:4,deviceMemory:16}),'medium'));
test('16코어 Windows 터치 노트북은 높음이다',()=>assert.equal(recommendQuality({...desktop,maxTouchPoints:10}),'high'));
test('정보 없는 8코어 Safari도 높음이며 2코어는 낮음이다',()=>{
  assert.equal(recommendQuality({...desktop,hardwareConcurrency:8,deviceMemory:undefined,userAgent:'Macintosh Safari'}),'high');
  assert.equal(recommendQuality({hardwareConcurrency:8}),'high');
  assert.equal(recommendQuality({...desktop,hardwareConcurrency:2}),'low');
});
test('검증용 query는 저장값보다 우선한다',()=>assert.equal(chooseQuality(desktop,{name:'high'},'low').selected,'low'));
test('정보 누락, 잘못된 저장값, 고밀도 화면은 보통으로 시작한다',()=>{
  assert.equal(chooseQuality({},'broken','invalid').selected,'medium');
  assert.equal(chooseQuality({},'{"name":"invalid"}').selected,'medium');
  assert.equal(recommendQuality({...desktop,dpr:3}),'medium');
  assert.equal(recommendQuality({...desktop,hardwareConcurrency:6}),'medium');
});
