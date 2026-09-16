// 문구 인벤토리(docs/research/ui-copy-194.md)가 실제 소스와 어긋나면 잡는다 (#203 감사 6).
// 문서 '표 읽는 법' 규칙 그대로: '#198 재조정' 열이 '유지' 로 시작하면 '후' 가 현재 값이고,
// 그 밖에는 ' — ' 앞의 맨 앞 값이 현재 값이다. '후' 가 '(코드에 없음)' 인 행은 화면 경로가 사라진 문구다.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const unescapeHtml = text => text.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
// 문서는 줄바꿈을 ⏎ 로 적는다. 소스의 들여쓰기와 맞추려고 양쪽 모두 공백을 하나로 줄인다.
const normalize = text => unescapeHtml(text).replace(/⏎/g, '\n').replace(/\s+/g, ' ').trim();

const rows = read('docs/research/ui-copy-194.md').split('\n').map((line, index) => ({
  line: index + 1,
  cells: line.startsWith('| ') ? line.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()) : null,
})).filter(row => row.cells && row.cells.length === 6 && row.cells[0] !== '파일' && !/^-+$/.test(row.cells[0]));

test('문구 인벤토리가 말하는 현재 값이 소스에 그대로 있다 (#203 감사 6)', () => {
  assert.ok(rows.length > 800, `문구 표를 읽지 못했다: ${rows.length}행`);
  const sources = new Map(), missing = [];
  let compared = 0;
  for (const {line, cells} of rows) {
    const [file, , , after, , adjusted] = cells;
    if (after === '(코드에 없음)') continue;  // 화면 경로가 사라진 문구 — 각주 ㄱ·ㄹ
    const current = adjusted.startsWith('유지') ? after : adjusted.split(' — ')[0].trim();
    compared++;
    if (!sources.has(file)) sources.set(file, existsSync(new URL(file, root)) ? normalize(read(file)) : null);
    const source = sources.get(file);
    if (source === null) missing.push(`${line}행: 파일이 없다 — ${file}`);
    else if (!source.includes(normalize(current))) missing.push(`${line}행 ${file}: ${current}`);
  }
  assert.ok(compared > 700, `대조한 행이 너무 적다: ${compared}`);
  assert.deepEqual(missing, [], '문서가 말하는 현재 값이 소스에 없다 — 문구를 바꿨으면 문서도 고친다');
});
