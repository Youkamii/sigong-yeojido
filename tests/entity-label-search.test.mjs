// 개체 이름을 원본 데이터에서 정리한 뒤에도 찾기가 같은 항목을 찾는가 (#200).
// 아래 표본은 data/entities 의 정리 전·후 값을 그대로 옮긴 것이다.
import test from 'node:test';
import assert from 'node:assert/strict';
import {AtlasData, typeName} from '../services/host/app/atlas-data.js';
import {displayLabel, labelNote, isGroupEntity} from '../services/host/app/chronicle.js';

// [id, 유형, 정리 전 이름, 정리 후 이름, 떼어낸 설명]
const ROWS = [
  ['event-hs-jl1-hansando', 'Event', '한산도 대첩(1592)', '한산도 대첩', '1592'],
  ['event-bulguksa-changgeon-751', 'Event', '불국사 창건 (751, 창건 연대 이설 있음)', '불국사 창건', '751, 창건 연대 이설 있음'],
  ['event-hs-sampo', 'Event', '삼포 개항(1423·1426)', '삼포 개항', '1423·1426'],
  ['event-hs-c5-518-law', 'Event', '5·18 특별법 제정(1995)', '5·18 특별법 제정', '1995'],
  ['event-yinav-hansando-fire-1597', 'Event', '한산도 본영 방화·소실 (1597)', '한산도 본영 방화·소실', '1597'],
  ['person-kim-suhwan-1987', 'Person', '김수환 추기경 (1987년 명동대성당 추모미사 집전)', '김수환 추기경', '1987년 명동대성당 추모미사 집전'],
  ['person-encykorea-gwanggaeto', 'Person', '광개토왕 (민족문화대백과)', '광개토왕', '민족문화대백과'],
  ['person-encykorea-jangbogo', 'Person', '장보고 (민족문화대백과)', '장보고', '민족문화대백과'],
  // 정리가 필요 없던 이름도 같이 넣어 순위가 흔들리지 않는지 본다
  ['person-encykorea-sejong-e0029857', 'Person', '세종', '세종', ''],
  ['person-encykorea-yi-sunsin', 'Person', '이순신', '이순신', ''],
  ['person-encykorea-an-junggeun', 'Person', '안중근', '안중근', ''],
  ['person-encykorea-jeon-taeil', 'Person', '전태일', '전태일', ''],
  ['event-hs-gabo', 'Event', '갑오개혁', '갑오개혁', ''],
  ['event-mt3-agwan', 'Event', '아관파천', '아관파천', ''],
  ['event-hs-gimyo-sahwa', 'Event', '기묘사화', '기묘사화', ''],
];

const before = ROWS.map(([id, type, label]) => ({id, type, label}));
const after = ROWS.map(([id, type, label, cleaned, note]) => ({
  id, type, label: cleaned, labelNote: note || undefined, aliases: label === cleaned ? [] : [label],
}));

const build = entities => {
  const data = new AtlasData();
  data.update({entities, claims: []}, {allEvents: [], year: 1500}, []);
  return data;
};

test('정리 전 이름으로 찾아도 같은 항목이 1순위다 — 원래 이름을 aliases 에 남겼기 때문 (#200)', () => {
  const now = build(after);
  for (const [id, , label] of ROWS) {
    assert.equal(now.search(label)[0]?.entity.id, id, `옛 이름 "${label}" 로 ${id} 를 못 찾는다`);
  }
});

test('정리한 이름으로도, 정리 전과 같은 항목이 1순위다', () => {
  const was = build(before), now = build(after);
  for (const [id, , label, cleaned] of ROWS) {
    assert.equal(now.search(cleaned)[0]?.entity.id, id, `새 이름 "${cleaned}" 로 ${id} 를 못 찾는다`);
    assert.equal(now.search(label)[0]?.entity.id, was.search(label)[0]?.entity.id, `"${label}" 의 1순위가 달라졌다`);
  }
});

test('화면 이름은 그대로고, 떼어낸 설명은 데이터의 labelNote 로 읽힌다', () => {
  for (const [id, type, label, cleaned, note] of ROWS) {
    const row = after.find(e => e.id === id);
    assert.equal(displayLabel({label, type}), cleaned, `화면 규칙과 원본 정리 결과가 다르다: ${label}`);
    assert.equal(displayLabel(row), cleaned);
    assert.equal(labelNote(row), note);
  }
});

test('집단은 label 꼬리 대신 kind 로 알아본다', () => {
  const was = {id: 'polity-imjin-japanese-force', type: 'Polity',
    label: '일본군 (임진왜란 침입군, 사료 표기 일본군·왜군·적군) · 집단 행위자'};
  const now = {id: was.id, type: 'Polity', label: '일본군', labelNote: '임진왜란 침입군, 사료 표기 일본군·왜군·적군',
    kind: 'group', aliases: [was.label]};
  assert.ok(isGroupEntity(was));
  assert.ok(isGroupEntity(now));
  assert.equal(typeName('Polity', now), '집단');
  assert.equal(displayLabel(was), '일본군');
  assert.equal(labelNote(now), '임진왜란 침입군, 사료 표기 일본군·왜군·적군');
});
