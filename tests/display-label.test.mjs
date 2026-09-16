import test from 'node:test';
import assert from 'node:assert/strict';
import {displayLabel,stripLabelNotes,labelNote,isGroupEntity} from '../services/host/app/chronicle.js';
import {typeName} from '../services/host/app/atlas-data.js';
import {shortLabel,sourceName,mergeEvents} from '../services/host/app/atlas-story.js';

test('displayLabel 은 설명 꼬리·연도 괄호·긴 설명 괄호를 떼고 짧은 구분 괄호는 남긴다 (#197)',()=>{
  const label=(text,type='Polity')=>displayLabel({label:text,type});
  assert.equal(label('성균관 유생 (1742년 당론 금지 대상) · 집단 행위자'),'성균관 유생');
  assert.equal(label('일본군 (임진왜란 침입군, 사료 표기 일본군·왜군·적군) · 집단 행위자'),'일본군');
  assert.equal(label('아관파천 (1896년 2월 11일)','Event'),'아관파천');
  assert.equal(label('삼포 개항(1423·1426)','Event'),'삼포 개항');
  assert.equal(label('김수환 추기경 (1987년 명동대성당 추모미사 집전)','Person'),'김수환 추기경');
  assert.equal(label('안동부 · 지방 행정 중심지','Place'),'안동부');
  assert.equal(label('세종 (조선)','Person'),'세종 (조선)');
  assert.equal(label('낙화암(타사암)','Place'),'낙화암(타사암)');
  assert.equal(label('성리학(주자학) 도입 (연도 미상)','Event'),'성리학(주자학) 도입');
  assert.equal(label('(1896년)','Event'),'(1896년)');  // 비면 원본 유지
});

test('labelNote 와 isGroupEntity, typeName 집단',()=>{
  assert.equal(labelNote({label:'안동부 · 지방 행정 중심지'}),'지방 행정 중심지');
  assert.equal(labelNote({label:'일본군 (침입군) · 집단 행위자'}),'');
  assert.equal(labelNote({label:'세종'}),'');
  const group={label:'처인부곡민 (1232) · 집단 행위자',type:'Polity'};
  assert.ok(isGroupEntity(group));
  assert.equal(typeName('Polity',group),'집단');
  assert.equal(typeName('Polity',{label:'조선',type:'Polity'}),'나라');
  assert.equal(typeName('Person'),'인물');
});

test('stripLabelNotes 는 연도만 있는 괄호와 11자 이상 설명을 뗀다',()=>{
  assert.equal(stripLabelNotes('불국사 창건 (751, 창건 연대 이설 있음)'),'불국사 창건');
  assert.equal(stripLabelNotes('부산의 임시수도 기능 (1950년 8월 18일 ~ 1953년 8월 15일)'),'부산의 임시수도 기능');
  assert.equal(stripLabelNotes('제포 (웅천)'),'제포 (웅천)');
});

test('shortLabel 은 연도 괄호를 떼고 sourceName 은 대시를 「」로 바꾼다',()=>{
  assert.equal(shortLabel('삼포 개항(1423·1426)'),'삼포 개항');
  assert.equal(shortLabel('만민공동회 (1898년 종로 민중 대회)'),'만민공동회');
  assert.equal(shortLabel('수군 (조선) · 집단 행위자'),'수군 (조선)');
  assert.equal(sourceName('거북선 — 한국민족문화대백과사전'),'한국민족문화대백과사전 「거북선」');
  assert.equal(sourceName('한국사데이터베이스'),'한국사데이터베이스');
  assert.equal(sourceName(''),'원문 보기');
});

test('연도 없는 같은 제목의 행은 연도 있는 행에 흡수되고 출처는 합쳐진다 (#197)',()=>{
  const rows=[{id:'e1',title:'주화론과 척화론',lo:1636,sceneId:'s1',placeLabel:'남한산성 행궁 일대',basis:[{id:'c1'}]},
    {id:'e2',title:'주화론과 척화론',basis:[{id:'c2'}]},
    {id:'e3',title:'다른 사건',basis:[]}];
  const merged=mergeEvents(rows);
  assert.equal(merged.length,2);
  const main=merged.find(e=>e.id==='e1');
  assert.deepEqual(new Set(main.basis.map(c=>c.id)),new Set(['c1','c2']));
  assert.ok(merged.some(e=>e.id==='e3'));
});
