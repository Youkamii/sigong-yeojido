// 사료 선택은 개별 id로 유지하고, 표시할 때만 종류별로 묶는다.
export function groupSources(sources){
  const rows = [], groups = new Map();
  for (const source of sources) {
    const label = sources.length > 30 ? source.sourceGroup : null;
    if (!label) { rows.push({label: null, sources: [source]}); continue; }
    if (!groups.has(label)) {
      const group = {label, sources: []};
      groups.set(label, group);
      rows.push(group);
    }
    groups.get(label).sources.push(source);
  }
  return rows;
}

// 출처 설정 목록의 한 줄 이름 — 발행처는 묶음 제목이 이미 보여 주므로 뗀다 (#205).
// "평양 (Pyongyang) — 영어 위키백과 (English Wikipedia)" -> "평양 (Pyongyang)"
export function shortSourceLabel(source){
  const text = String(source?.label || source?.id || '').trim();
  const parts = text.split(/\s+[—–]\s+/);
  return parts.length >= 2 ? parts.slice(0, -1).join(' — ').trim() : text;
}

export function selectionOf(sources, on){
  const selected = sources.filter(s => on.has(s.id)).length;
  return selected === 0 ? 'false' : selected === sources.length ? 'true' : 'mixed';
}
