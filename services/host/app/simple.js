// app/simple.js — 단순 모드 (#148 #149)
//
// 하단: 기존 Chronicle 의 range input 을 그대로 쓰고(previewYear → finishScrub → chooseYear 경로 유지),
//       큰 연도 표시 한 줄만 덧붙인다. 값 갱신은 Chronicle.syncYear 가 한다(단일 경로).
// 우상단: '물어보기'·'메뉴' 아이콘 둘. 메뉴 서랍에는 기존 조작을 DOM 이동으로 옮긴다 — 삭제 0.
//       인라인 스크립트의 getElementById 참조는 노드가 같으므로 그대로 산다.
// body.simple 이 아니면(?ui=full) 아무것도 하지 않는다.

function initSimpleMode() {
  const host = document.getElementById('historyTime');
  const slider = host && host.querySelector('[type=range]');
  if (!slider) return;

  // ── 하단 연도 손잡이 (#148) ──
  const row = document.createElement('div');
  row.className = 'simple-year-row';
  row.innerHTML = '<span class="simple-year-end">기원전 2500</span>'
    + '<output class="simple-year" aria-live="polite"></output>'
    + '<span class="simple-year-end">2025</span>';
  host.append(row);
  const yearV = document.getElementById('yearV'), yearL = document.getElementById('yearL');
  if (yearV && yearL) {
    const v = Number(yearV.textContent);
    row.querySelector('.simple-year').textContent = yearL.textContent === '기원전' ? `기원전 ${v}년` : `${v}년`;
  }

  // ── 우상단 아이콘 2개 (#149) ──
  const ICON_ASK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>';
  const ICON_MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  const top = document.createElement('div');
  top.className = 'simple-top';
  top.innerHTML = '<span class="simple-brand">시공여지도</span><span class="spacer"></span>'
    + `<button id="simpleAsk" class="simple-icon" type="button" aria-label="물어보기">${ICON_ASK}<span>물어보기</span></button>`
    + `<button id="simpleMenuBtn" class="simple-icon" type="button" aria-label="메뉴" aria-controls="simpleMenu" aria-expanded="false">${ICON_MENU}<span>메뉴</span></button>`;
  document.querySelector('.canvasWrap').append(top);

  // ── 메뉴 서랍 ──
  const scrim = document.createElement('div');
  scrim.className = 'simple-scrim'; scrim.hidden = true;
  const menu = document.createElement('aside');
  menu.className = 'simple-menu'; menu.id = 'simpleMenu'; menu.hidden = true;
  menu.setAttribute('aria-label', '메뉴'); menu.tabIndex = -1;
  menu.innerHTML = '<div class="simple-menu-head"><strong>메뉴</strong><button id="simpleMenuClose" type="button" aria-label="닫기">×</button></div>'
    + '<section data-slot="view"><h3>보기</h3></section>'
    + '<section data-slot="time"><h3>시간</h3></section>'
    + '<section data-slot="scene"><h3>장면·지도 표시</h3></section>'
    + '<section data-slot="sources"><h3>사료·찾기</h3></section>';
  document.body.append(scrim, menu);
  const slot = (name) => menu.querySelector(`[data-slot="${name}"]`);

  // 기존 조작을 서랍으로 옮긴다 — 없으면 건너뛴다. 모드 탭(.seg)은 기존 화면도 숨기고 있으므로 옮기지 않는다.
  const move = (el, to) => { if (el && to) to.append(el); };
  move(document.getElementById('evidenceBtn'), slot('view'));
  move(document.querySelector('.bar .origin-filter'), slot('view'));
  move(document.querySelector('#historyTime .time-heading'), slot('time'));
  move(document.getElementById('sceneContext'), slot('scene'));
  move(document.querySelector('.geography-navigation'), slot('scene'));
  move(document.getElementById('sourceRail'), slot('sources'));

  const btn = document.getElementById('simpleMenuBtn');
  const setOpen = (open) => {
    menu.hidden = !open; scrim.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.classList.toggle('on', open);
    if (open) menu.focus(); else btn.focus();
  };
  btn.onclick = () => setOpen(menu.hidden);
  document.getElementById('simpleMenuClose').onclick = () => setOpen(false);
  scrim.onclick = () => setOpen(false);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setOpen(false); });
  // 서랍 안에서 다른 패널을 여는 조작(근거 열기·근거 ↗·지역 이동)은 서랍을 닫아야 그 패널이 보인다
  menu.addEventListener('click', (e) => {
    if (e.target.closest('#evidenceBtn, .context-proof, [data-chronicle-claim], [data-candidate-chunk], [data-candidate-source]')) setOpen(false);
  });
  document.getElementById('geographyDestination')?.addEventListener('change', () => setOpen(false));

  // 근거 패널은 서랍 밖(오른쪽)에 열린다 — 터치에서 닫을 길이 있어야 하므로 닫기 버튼을 얹는다 (D4 에서 카드로 바뀐다)
  const evi = document.getElementById('evi');
  if (evi) {
    const close = document.createElement('button');
    close.type = 'button'; close.className = 'simple-evi-close'; close.setAttribute('aria-label', '근거 닫기'); close.textContent = '×';
    close.onclick = () => document.getElementById('evidenceBtn')?.click();
    evi.prepend(close);
  }

  // 물어보기 — 기존 질문(챗) 화면을 연다. 다시 누르면 3D 로 돌아온다. 켜짐 표시는 CSS 가 body.modechat 에서 읽는다.
  document.getElementById('simpleAsk').onclick = () => {
    const inChat = document.body.classList.contains('modechat');
    document.getElementById(inChat ? 'b3d' : 'bchat')?.click();
  };
}

if (document.body.classList.contains('simple')) initSimpleMode();
