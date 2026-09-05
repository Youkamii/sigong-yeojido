const ENTITIES = {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'};

export function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, c => ENTITIES[c]);
}

export function externalLink(value, label){
  try{
    const url = new URL(value);
    if(url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return `<a href="${escapeHtml(url.href)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
  }catch{
    return '';
  }
}

export function highlightText(value, names){
  const terms = [...new Set(names.filter(n => typeof n === 'string' && n))].sort((a,b) => b.length - a.length);
  const plain = text => escapeHtml(text).replace(/□/g, '<span class="gap">□</span>');
  if(!terms.length) return plain(value);
  const pattern = new RegExp('(' + terms.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gu');
  return String(value ?? '').split(pattern).map((part, i) => i % 2 ? `<span class="hit">${escapeHtml(part)}</span>` : plain(part)).join('');
}
