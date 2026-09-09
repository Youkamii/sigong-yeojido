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

// ── 우상단 아이콘 2개와 메뉴 서랍 (#149) ─────────────────────────────────────
// 기존 조작을 지우지 않고 DOM 이동으로 서랍에 넣는다. 인라인 스크립트의 getElementById 참조는 노드가 같으므로 그대로 산다.
if (document.body.classList.contains('simple')) {
  const wrap = document.querySelector('.canvasWrap');
  const ICON_ASK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>';
  const ICON_MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

  const top = document.createElement('div');
  top.className = 'simple-top';
  top.innerHTML = '<span class="simple-brand">시공여지도</span><span class="spacer"></span>'
    + `<button id="simpleAsk" class="simple-icon" type="button" aria-label="물어보기">${ICON_ASK}<span>물어보기</span></button>`
    + `<button id="simpleMenuBtn" class="simple-icon" type="button" aria-label="메뉴" aria-controls="simpleMenu" aria-expanded="false">${ICON_MENU}<span>메뉴</span></button>`;
  wrap.append(top);

  const scrim = document.createElement('div');
  scrim.className = 'simple-scrim'; scrim.id = 'simpleScrim'; scrim.hidden = true;
  const menu = document.createElement('aside');
  menu.className = 'simple-menu'; menu.id = 'simpleMenu'; menu.hidden = true; menu.setAttribute('aria-label', '메뉴');
  menu.innerHTML = '<div class="simple-menu-head"><strong>메뉴</strong><button id="simpleMenuClose" type="button" aria-label="닫기">×</button></div>'
    + '<section data-slot="view"><h3>보기</h3></section>'
    + '<section data-slot="time"><h3>시간</h3></section>'
    + '<section data-slot="scene"><h3>장면·지도 표시</h3></section>'
    + '<section data-slot="sources"><h3>사료·찾기</h3></section>';
  document.body.append(scrim, menu);
  const slot = (name) => menu.querySelector(`[data-slot="${name}"]`);

  // 기존 조작을 서랍으로 옮긴다 — 없으면 건너뛴다(화면 구조가 바뀌어도 여기서 죽지 않게)
  const move = (el, to) => { if (el && to) to.append(el); };
  move(document.querySelector('.bar .seg'), slot('view'));
  move(document.getElementById('sourcesBtn'), slot('view'));
  move(document.getElementById('evidenceBtn'), slot('view'));
  move(document.querySelector('.bar .origin-filter'), slot('view'));
  move(document.querySelector('#historyTime .time-heading'), slot('time'));
  move(document.getElementById('sceneContext'), slot('scene'));
  move(document.querySelector('.geography-navigation'), slot('scene'));
  move(document.getElementById('sourceRail'), slot('sources'));

  // 탭 표시를 실제 모드에 맞춘다 — 기존 HTML 은 '지도' 탭이 켜진 채 시작하지만 첫 화면은 3D 다
  if (document.body.classList.contains('mode3d')) {
    document.getElementById('b2d')?.classList.remove('on');
    document.getElementById('b3d')?.classList.add('on');
  }

  const btn = document.getElementById('simpleMenuBtn');
  const setOpen = (open) => {
    menu.hidden = !open; scrim.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.classList.toggle('on', open);
    if (open) menu.focus?.();
  };
  btn.onclick = () => setOpen(menu.hidden);
  document.getElementById('simpleMenuClose').onclick = () => setOpen(false);
  scrim.onclick = () => setOpen(false);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setOpen(false); });

  // 물어보기 — 기존 질문(챗) 화면을 연다. 다시 누르면 3D 로 돌아온다. (D5 에서 서랍형 챗으로 바꾼다)
  const ask = document.getElementById('simpleAsk');
  ask.onclick = () => {
    const inChat = document.body.classList.contains('modechat');
    document.getElementById(inChat ? 'b3d' : 'bchat')?.click();
    ask.classList.toggle('on', !inChat);
  };
}
