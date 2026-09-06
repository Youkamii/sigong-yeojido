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

export function selectionOf(sources, on){
  const selected = sources.filter(s => on.has(s.id)).length;
  return selected === 0 ? 'false' : selected === sources.length ? 'true' : 'mixed';
}
