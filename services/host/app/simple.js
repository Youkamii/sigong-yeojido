// app/simple.js — 단순 모드의 하단 연도 손잡이 (#148)
//
// 기존 Chronicle 이 만든 range input 을 그대로 쓴다 (previewYear → finishScrub → chooseYear 경로 유지).
// 여기서는 큰 연도 숫자 한 줄만 덧붙이고, 슬라이더 값과 연도 표시(#yearV)를 따라간다.
// body.simple 이 아니면 아무것도 하지 않는다.

const host = document.getElementById('historyTime');
const slider = host && host.querySelector('[type=range]');

if (document.body.classList.contains('simple') && slider) {
  const row = document.createElement('div');
  row.className = 'simple-year-row';
  row.innerHTML = '<span class="simple-year-end">기원전 2500</span>'
    + '<output class="simple-year" aria-live="polite"></output>'
    + '<span class="simple-year-end">2025</span>';
  host.append(row);
  const out = row.querySelector('.simple-year');
  const label = (y) => (y < 0 ? `기원전 ${Math.abs(y)}` : String(y));

  // 끄는 동안은 슬라이더 값을, 확정된 뒤에는 화면의 연도 표시를 따른다.
  slider.addEventListener('input', () => { out.textContent = label(+slider.value); });
  const yearV = document.getElementById('yearV');
  const yearL = document.getElementById('yearL');
  const fromUI = () => {
    const v = Number(yearV.textContent);
    if (!Number.isFinite(v)) return;
    out.textContent = label(yearL.textContent === '기원전' ? -v : v);
  };
  if (yearV && yearL) new MutationObserver(fromUI).observe(yearV, { childList: true, characterData: true, subtree: true });
  out.textContent = label(+slider.value);
}
