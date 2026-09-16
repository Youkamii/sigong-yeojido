import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// 가로 모드 휴대폰(아이폰 SE 가로 667×375)에서 이야기 패널 본문이 0px 로 붕괴하던 문제(#198 감사 C-26).
// 서버를 띄우지 않으므로 규칙과 기하 계산을 스타일시트 원문으로 확인한다.
const css=readFileSync(new URL('../services/host/app/atlas.css',import.meta.url),'utf8');
const shortViewport=css.match(/@media\(max-height:520px\)\{([\s\S]*?)\n\}/);

test('낮은 화면에서는 패널이 시간 막대 위로 올라가 세로 자리를 되찾는다',()=>{
  assert.ok(shortViewport,'@media(max-height:520px) 블록이 있다');
  const rules=shortViewport[1];
  assert.match(rules,/\.atlas-pane\{top:72px;bottom:12px\}/);
  // #atlas 는 z-index:16 으로 쌓임 맥락을 만들고 .timebar 는 17 이라 패널이 막대 아래에 깔렸다.
  assert.match(rules,/\.atlas #atlas\{z-index:18\}/);
  const base=css.match(/\.atlas #atlas\{[^}]*z-index:16/);
  assert.ok(base,'기본 규칙은 z-index:16 그대로');
  assert.ok(css.indexOf('@media(max-height:520px)')>css.lastIndexOf('@media(max-width:720px)'),
    '낮은 화면 블록이 폭 규칙보다 뒤에 와야 top/bottom 을 덮는다');
});

test('세로 375px 가로 화면에서 패널 본문 높이가 남는다',()=>{
  const height=375,top=72,bottom=12,padding=19*2,header=57,footer=66;
  const body=height-top-bottom-padding-header-footer;
  assert.ok(body>100,`본문 높이 ${body}px — 붕괴(0px)가 아니다`);
});

test('초상은 낮은 화면에서만 96px 로 줄고 넓은 화면의 카드 폭 초상(#198)은 그대로다',()=>{
  const rules=shortViewport[1];
  assert.match(rules,/\.atlas-story-hero\{flex-direction:row/);
  assert.match(rules,/\.atlas-story-hero \.atlas-ai-image\{width:96px;flex:none\}/);
  assert.match(rules,/\.atlas-story-hero \.atlas-ai-image img\{max-height:96px\}/);
  assert.match(css,/\.atlas-story-hero \.atlas-ai-image img\{width:100%;max-width:100%;height:auto;max-height:320px/);
  assert.match(css,/\.atlas-story-hero\{display:flex;flex-direction:column/);
});
