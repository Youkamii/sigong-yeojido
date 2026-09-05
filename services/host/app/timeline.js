// app/timeline.js — 사료별 시간 막대 타임라인 (의존성 없음 · SVG)
//
// 사료마다 다루는 기간이 있다. 그걸 시간선에 막대로 깔아둔다 — 영상 편집기 타임라인처럼.
//   막대   = 다루는 기간 (coversFrom ~ coversTo)
//   점     = 쓰여진 때 (composedYear)
//   점선   = 막대 끝에서 점까지. 기록 대상과 편찬 사이의 거리가 눈에 읽히게
// 삼국유사 단군 기록은 막대가 왼쪽 끝(기원전 2333)까지 뻗는데 점은 1281년에 찍힌다.
// 3천 년 뒤에 쓴 기록이라는 게 이 한 줄에서 보여야 한다.
//
// 색·글꼴은 index.html 의 :root 토큰만 쓴다 (--ink, --paper, --celadon, --brick, --gardenia, --mono …).
// 호스트 폭이 바뀌면 ResizeObserver 로 다시 그린다.
//
// 사용법
//   import { Timeline } from './app/timeline.js';
//   const tl = new Timeline(host, {
//     sources,                    // Source[]
//     year: 414,                  // 현재 연도. 기원전은 음수
//     on: new Set(ids),           // 켜진 사료 id 집합 — 복사해서 쓴다. 바깥에서 바꾸면 setOn 으로 알린다
//     onYear(y){},                // 커서를 끌거나 눈금자를 누르면 (setYear 로 바꿀 때는 부르지 않는다)
//     onToggle(sourceId, on){},   // 체크박스를 누르면. on 은 바뀐 뒤의 값
//     labelWidth: 152,            // (선택) 왼쪽 라벨 칸 폭. 없으면 호스트 폭에 맞춰 고른다
//   });
//   tl.setYear(y); tl.setSources(sources); tl.setOn(set); tl.destroy();
//
// Source = { id, label, coversFrom, coversTo, composedYear, chunkCount, defaultLens }
//   연도는 정수. 없으면 null — 그 부분(막대·점)은 그리지 않는다.
//   defaultLens 가 참인 사료는 진한 막대(기본 렌즈), 나머지는 옅은 막대. 꺼진 사료는 흐리게.

const SVG_NS = 'http://www.w3.org/2000/svg';
const STYLE_ID = 'syj-timeline-style';
const STEPS = [100, 500, 1000];   // 눈금 단위 후보 — 라벨이 겹치지 않는 가장 촘촘한 것을 고른다

const RULER_H = 32;        // 위쪽 눈금자 높이
const ROW_H = 26;          // 트랙 한 줄
const PAD_B = 8;           // 아래 여백
const PAD_R = 14;          // 오른쪽 여백 — 마지막 눈금 라벨·커서 깃발이 잘리지 않게
const NARROW = 560;        // 이 폭 아래면 라벨 칸을 줄이고 글자를 작게
const MIN_LABEL_PX = 72;   // 눈금 라벨 사이 최소 간격 ("기원전 2000" 10px 모노 ≈ 66px). 그려진 뒤 실제 폭으로 한 번 더 솎는다
const LABEL_GAP_PX = 10;   // 눈금 라벨끼리 최소 빈틈
const MIN_GAP_PX = 56;     // 안내선이 이보다 길어야 "N년 뒤" 글자를 얹는다

// 색은 전부 :root 토큰. 여기에 색값을 직접 쓰지 않는다.
const CSS = `
.tl-host{display:block;position:relative;font-family:var(--sans);font-weight:300;line-height:1;
  -webkit-user-select:none;user-select:none}
.tl-svg{display:block;width:100%;overflow:visible;touch-action:none}
.tl-plot{fill:transparent;cursor:crosshair}
.tl-empty{fill:var(--paper-3);font-size:12px}
.tl-ruler-base{stroke:var(--line-2);stroke-width:1}
.tl-tick{stroke:var(--paper-3);stroke-width:1}
.tl-tick.minor{stroke:var(--line-2)}
.tl-tick-label{fill:var(--paper-3);font-family:var(--mono);font-size:10px;letter-spacing:.03em}
.tl-grid{stroke:var(--line);stroke-width:1}
.tl-zero{stroke:var(--line-2);stroke-width:1;stroke-dasharray:2 3}
.tl-row-bg{fill:transparent}
.tl-track:hover .tl-row-bg{fill:var(--ink-3)}
.tl-label{cursor:pointer;outline:none}
.tl-label-hit{fill:transparent}
.tl-box{fill:none;stroke:var(--celadon-dim);stroke-width:1.2}
.tl-label[aria-checked="true"] .tl-box{fill:var(--celadon);stroke:var(--celadon)}
.tl-label:focus-visible .tl-box{stroke:var(--celadon);stroke-width:2}
.tl-tickmark{fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.tl-label[aria-checked="false"] .tl-tickmark{display:none}
.tl-label-text{fill:var(--paper-2);font-size:12px}
.tl-narrow .tl-label-text{font-size:11px}
.tl-track.lens .tl-label-text{fill:var(--paper);font-weight:500}
.tl-track.off .tl-label-text{fill:var(--paper-3)}
.tl-body{transition:opacity .18s}
.tl-track.off .tl-body{opacity:.22}
.tl-bar{fill:var(--celadon-dim)}
.tl-track.lens .tl-bar{fill:var(--celadon)}
.tl-dot{fill:var(--gardenia);stroke:var(--ink);stroke-width:1.5}
.tl-guide{stroke:var(--gardenia);stroke-width:1;stroke-dasharray:2 3;opacity:.8}
.tl-gap{fill:var(--paper-3);font-family:var(--mono);font-size:9.5px;letter-spacing:.02em}
.tl-cursor{outline:none}
.tl-cursor-line{stroke:var(--brick);stroke-width:1.5}
.tl-flag-bg{fill:var(--ink);stroke:var(--brick);stroke-width:1}
.tl-cursor:focus-visible .tl-flag-bg{stroke-width:2}
.tl-flag-text{fill:var(--paper);font-family:var(--mono);font-size:10.5px;letter-spacing:.02em}
.tl-hit{fill:transparent;cursor:ew-resize}
`;

const isNum = v => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function injectStyle(){
  if (document.getElementById(STYLE_ID)) return;
  const st = document.createElement('style');
  st.id = STYLE_ID;
  st.textContent = CSS;
  document.head.appendChild(st);
}

/** SVG 요소 하나. attrs 가 null/undefined 면 건너뛴다. 자식은 문자열이면 텍스트 노드. */
function el(tag, attrs, ...kids){
  const n = document.createElementNS(SVG_NS, tag);
  if (attrs) for (const k of Object.keys(attrs)) {
    const v = attrs[k];
    if (v == null) continue;
    n.setAttribute(k, typeof v === 'number' ? String(Math.round(v * 100) / 100) : String(v));
  }
  for (const k of kids) {
    if (k == null) continue;
    n.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
  }
  return n;
}

/** 눈금 라벨 — 기원전은 "기원전 N", 나머지는 숫자만 */
export function fmtYear(y){
  return y < 0 ? '기원전 ' + (-y) : String(y);
}
/** 커서 깃발 — "기원전 57" / "서기 414" */
export function fmtYearFull(y){
  return y < 0 ? '기원전 ' + (-y) : '서기 ' + y;
}

/** 그리기 전의 폭 추정 (10px 모노 기준) — 한글 ≈ 11px, 그 외 ≈ 6.4px. 그려진 뒤에는 실제 폭을 잰다. */
function estWidth(text){
  let w = 0;
  for (const ch of text) w += ch > '⹿' ? 11 : 6.4;
  return w;
}

/** 붙어 있으면 실제 글자 폭, 아니면 추정치 */
function textWidth(t){
  const w = typeof t.getComputedTextLength === 'function' ? t.getComputedTextLength() : 0;
  return w || estWidth(t.textContent);
}

/** 데이터 범위에 여유를 둔 선형 축의 양끝. 값이 하나도 없으면 통사 기본 범위. */
export function domainOf(sources){
  let lo = Infinity, hi = -Infinity;
  for (const s of sources) for (const v of [s.coversFrom, s.coversTo, s.composedYear]) {
    if (!isNum(v)) continue;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  if (lo === Infinity) { lo = -2500; hi = 2100; }
  if (hi - lo < 200) { const m = (lo + hi) / 2; lo = m - 100; hi = m + 100; }
  const pad = (hi - lo) * 0.045;
  return [Math.floor((lo - pad) / 50) * 50, Math.ceil((hi + pad) / 50) * 50];
}

/** 눈금 단위 — 100·500·1000 중 라벨이 안 겹치는 가장 촘촘한 것. 다 겹치면 1000 을 쓰고 라벨을 건너뛴다. */
export function pickStep(plotW, span){
  for (const st of STEPS) if (st / span * plotW >= MIN_LABEL_PX) return st;
  return STEPS[STEPS.length - 1];
}

function titleOf(s){
  const parts = [s.label || s.id];
  if (isNum(s.coversFrom) && isNum(s.coversTo)) {
    parts.push(`다루는 기간 ${fmtYear(Math.min(s.coversFrom, s.coversTo))} ~ ${fmtYear(Math.max(s.coversFrom, s.coversTo))}`);
  }
  if (isNum(s.composedYear)) parts.push(`${fmtYearFull(s.composedYear)}에 쓰임`);
  if (isNum(s.chunkCount)) parts.push(`원문 조각 ${s.chunkCount}`);
  if (s.defaultLens) parts.push('기본 렌즈');
  return parts.join(' · ');
}

export class Timeline {
  constructor(host, opts = {}){
    if (!host || !host.appendChild) throw new Error('Timeline: host element is required');
    injectStyle();
    this.host = host;
    this.sources = Array.isArray(opts.sources) ? opts.sources.slice() : [];
    this.year = isNum(opts.year) ? Math.round(opts.year) : 0;
    this.on = new Set(opts.on ?? this.sources.map(s => s.id));
    this.onYear = typeof opts.onYear === 'function' ? opts.onYear : () => {};
    this.onToggle = typeof opts.onToggle === 'function' ? opts.onToggle : () => {};
    this.labelWidth = isNum(opts.labelWidth) ? opts.labelWidth : null;

    this.host.classList.add('tl-host');
    this.svg = el('svg', { class: 'tl-svg', role: 'group', 'aria-label': '사료 타임라인' });
    this.host.appendChild(this.svg);

    this._geom = null;       // 마지막 렌더의 기하 — 좌표 변환에 쓴다
    this._cursor = null;
    this._flag = null;
    this._raf = 0;
    this._drag = false;
    this._destroyed = false;

    this._onDown = e => this._pointerDown(e);
    this._onMove = e => this._pointerMove(e);
    this._onUp = () => { this._drag = false; };
    this.svg.addEventListener('pointerdown', this._onDown);
    window.addEventListener('pointermove', this._onMove);
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onUp);

    if (typeof ResizeObserver === 'function') {
      this._ro = new ResizeObserver(() => this._schedule());
      this._ro.observe(this.host);
    } else {
      this._onResize = () => this._schedule();
      window.addEventListener('resize', this._onResize);
    }
    // 웹폰트가 늦게 오면 라벨 폭이 달라진다 — 다 오면 한 번 더 그린다
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (!this._destroyed) this.render(); }).catch(() => {});
    }
    this.render();
  }

  // ── 공개 API ──

  /** 현재 연도만 옮긴다. 다시 그리지 않고 커서만 움직인다. onYear 는 부르지 않는다. */
  setYear(y){
    if (!isNum(y)) return;
    this.year = Math.round(y);
    this._placeCursor();
  }

  /** 사료 목록을 바꾼다. 축 범위를 다시 잡고 전부 다시 그린다. */
  setSources(sources){
    this.sources = Array.isArray(sources) ? sources.slice() : [];
    this.render();
  }

  /** 켜진 사료 집합을 바꾼다. 복사해서 들고 있으므로 바깥 Set 을 고쳤으면 다시 넘겨야 한다. */
  setOn(set){
    this.on = new Set(set ?? []);
    this._applyOn();
  }

  destroy(){
    this._destroyed = true;
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._ro) this._ro.disconnect();
    if (this._onResize) window.removeEventListener('resize', this._onResize);
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('pointercancel', this._onUp);
    this.svg.remove();
    this.host.classList.remove('tl-host', 'tl-narrow');
  }

  // ── 그리기 ──

  /** 폭이 바뀌면 다음 프레임에 한 번만 다시 그린다. 폭이 그대로면 건너뛴다. */
  _schedule(){
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => {
      this._raf = 0;
      if (this._destroyed) return;
      const w = this.host.clientWidth;
      if (!this._geom || w !== this._geom.w) this.render();
    });
  }

  render(){
    if (this._destroyed) return;
    const w = this.host.clientWidth;
    if (w < 40) return;   // 숨겨진 상태(display:none 등). 보이게 되면 ResizeObserver 가 다시 부른다

    const n = this.sources.length;
    const narrow = w < NARROW;
    this.host.classList.toggle('tl-narrow', narrow);
    const labelW = this.labelWidth ?? (narrow ? 112 : 152);
    const plotL = labelW + 6;
    const plotR = Math.max(plotL + 40, w - PAD_R);
    const plotW = plotR - plotL;
    const [d0, d1] = domainOf(this.sources);
    const span = d1 - d0;
    const xs = y => plotL + (y - d0) / span * plotW;
    const H = RULER_H + Math.max(n, 1) * ROW_H + PAD_B;
    this._geom = { w, H, labelW, plotL, plotR, plotW, d0, d1, xs };

    const svg = this.svg;
    svg.setAttribute('width', w);
    svg.setAttribute('height', H);
    svg.setAttribute('viewBox', `0 0 ${w} ${H}`);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // 눈금자 뒤의 투명 판 — 눈금자·트랙 어디를 눌러도 커서가 옮겨진다
    svg.appendChild(el('rect', { class: 'tl-plot', x: plotL - 6, y: 0, width: w - (plotL - 6), height: H }));

    const gGrid = el('g', { class: 'tl-gridlayer' });
    const gRuler = el('g', { class: 'tl-ruler' });
    const step = pickStep(plotW, span);
    const pxStep = step / span * plotW;
    const labelEvery = Math.max(1, Math.ceil(MIN_LABEL_PX / pxStep));
    const minor = pxStep / 5 >= 7 ? step / 5 : (pxStep / 2 >= 7 ? step / 2 : 0);

    if (minor) for (let y = Math.ceil(d0 / minor) * minor; y <= d1; y += minor) {
      if (y % step === 0) continue;
      const x = xs(y);
      gRuler.appendChild(el('line', { class: 'tl-tick minor', x1: x, x2: x, y1: RULER_H - 4, y2: RULER_H }));
    }
    const hasZero = d0 < 0 && d1 > 0;
    const tickLabels = [];
    for (let y = Math.ceil(d0 / step) * step; y <= d1; y += step) {
      const x = xs(y);
      gRuler.appendChild(el('line', { class: 'tl-tick', x1: x, x2: x, y1: RULER_H - 9, y2: RULER_H }));
      if (!(hasZero && y === 0)) {
        gGrid.appendChild(el('line', { class: 'tl-grid', x1: x, x2: x, y1: RULER_H, y2: H - PAD_B }));
      }
      if (Math.abs(y / step) % labelEvery !== 0) continue;
      const text = fmtYear(y);
      const tw = estWidth(text);
      let anchor = 'middle', tx = x, edge = null;
      if (x - tw / 2 < plotL - 4) { anchor = 'start'; tx = Math.max(plotL - 4, x - 2); edge = '1'; }   // 양끝은 안쪽으로 붙인다
      else if (x + tw / 2 > w - 2) { anchor = 'end'; tx = Math.min(w - 2, x + 2); edge = '1'; }
      tickLabels.push(gRuler.appendChild(
        el('text', { class: 'tl-tick-label', x: tx, y: RULER_H - 13, 'text-anchor': anchor, 'data-edge': edge }, text)));
    }
    if (hasZero) {
      const x = xs(0);   // 기원전/서기 경계
      gGrid.appendChild(el('line', { class: 'tl-zero', x1: x, x2: x, y1: RULER_H, y2: H - PAD_B }));
    }
    gRuler.appendChild(el('line', { class: 'tl-ruler-base', x1: plotL - 6, x2: w, y1: RULER_H + 0.5, y2: RULER_H + 0.5 }));
    svg.appendChild(gGrid);
    svg.appendChild(gRuler);

    // 트랙 — 사료 하나가 한 줄
    const gTracks = el('g', { class: 'tl-tracks' });
    if (!n) {
      gTracks.appendChild(el('text', { class: 'tl-empty', x: plotL, y: RULER_H + ROW_H / 2, dy: '.36em' }, '사료 없음'));
    }
    this.sources.forEach((s, i) => gTracks.appendChild(this._track(s, i)));
    svg.appendChild(gTracks);

    // 현재 연도 커서 — 세로선 + 눈금자 위의 깃발. 맨 위에 올린다
    const gc = el('g', {
      class: 'tl-cursor', role: 'slider', tabindex: 0, 'aria-label': '현재 연도',
      'aria-valuemin': d0, 'aria-valuemax': d1, 'aria-valuenow': this.year,
    });
    gc.appendChild(el('line', { class: 'tl-cursor-line', x1: 0, x2: 0, y1: 4, y2: H }));
    const flag = el('g', { class: 'tl-flag' });
    flag.appendChild(el('rect', { class: 'tl-flag-bg', x: 6, y: 3, width: 10, height: 17, rx: 2 }));
    flag.appendChild(el('text', { class: 'tl-flag-text', x: 12, y: 15 }, ''));
    gc.appendChild(flag);
    gc.appendChild(el('rect', { class: 'tl-hit', x: -7, y: 0, width: 14, height: H }));
    gc.addEventListener('keydown', e => this._cursorKey(e));
    this._cursor = gc;
    this._flag = flag;
    svg.appendChild(gc);

    this._thinTickLabels(tickLabels);
    this._trimLabels(labelW - 36);
    this._placeCursor();
  }

  /** 그려진 뒤 실제 폭을 재서 겹치는 눈금 라벨을 뺀다. 안쪽으로 밀어 넣은 양끝 라벨은 제자리 라벨에 진다. */
  _thinTickLabels(labels){
    const ext = labels.map(t => {
      const x = +t.getAttribute('x');
      const anchor = t.getAttribute('text-anchor');
      const tw = textWidth(t);
      const left = anchor === 'start' ? x : anchor === 'end' ? x - tw : x - tw / 2;
      return [left, left + tw];
    });
    const kept = labels.slice();
    for (let i = 0; i < kept.length; i++) {
      if (!kept[i].dataset.edge) continue;
      const [l, r] = ext[i];
      const prev = i > 0 ? ext[i - 1] : null;
      const next = i < kept.length - 1 ? ext[i + 1] : null;
      if ((prev && l < prev[1] + LABEL_GAP_PX) || (next && r > next[0] - LABEL_GAP_PX)) {
        kept[i].remove();
        kept[i] = null;
      }
    }
    let lastRight = -Infinity;
    kept.forEach((t, i) => {
      if (!t) return;
      const [l, r] = ext[i];
      if (l < lastRight + LABEL_GAP_PX) { t.remove(); return; }
      lastRight = r;
    });
  }

  _track(s, i){
    const { w, labelW, plotL, xs } = this._geom;
    const yTop = RULER_H + i * ROW_H, cy = yTop + ROW_H / 2;
    const on = this.on.has(s.id);
    const label = s.label || s.id;
    const g = el('g', { class: 'tl-track' + (on ? ' on' : ' off') + (s.defaultLens ? ' lens' : ''), 'data-id': s.id });
    g.appendChild(el('rect', { class: 'tl-row-bg', x: 0, y: yTop, width: w, height: ROW_H }));

    // 라벨 칸 — 체크박스가 곧 토글. 줄 전체(라벨 칸)를 눌러도 된다
    const lab = el('g', {
      class: 'tl-label', role: 'checkbox', tabindex: 0,
      'aria-checked': on ? 'true' : 'false', 'aria-label': label,
    });
    lab.appendChild(el('title', null, titleOf(s)));
    lab.appendChild(el('rect', { class: 'tl-label-hit', x: 0, y: yTop, width: labelW, height: ROW_H }));
    lab.appendChild(el('rect', { class: 'tl-box', x: 10, y: cy - 5.5, width: 11, height: 11, rx: 1.5 }));
    lab.appendChild(el('path', { class: 'tl-tickmark', d: `M12.6 ${cy}l2.3 2.4 4.6-5.2` }));
    const t = el('text', { class: 'tl-label-text', x: 28, y: cy, dy: '.36em' }, label);
    t.dataset.full = label;
    lab.appendChild(t);
    lab.addEventListener('click', e => { e.stopPropagation(); this._toggle(s.id); });
    lab.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this._toggle(s.id); }
    });
    g.appendChild(lab);

    // 몸통 — 막대 · 안내선 · 점
    const body = el('g', { class: 'tl-body' });
    const hasBar = isNum(s.coversFrom) && isNum(s.coversTo);
    const hasDot = isNum(s.composedYear);
    let a = 0, b = 0;
    if (hasBar) {
      a = Math.min(s.coversFrom, s.coversTo);
      b = Math.max(s.coversFrom, s.coversTo);
      const x0 = xs(a), x1 = xs(b);
      const bar = el('rect', { class: 'tl-bar', x: x0, y: cy - 5, width: Math.max(2, x1 - x0), height: 10, rx: 2 });
      bar.appendChild(el('title', null, `${label} · 다루는 기간 ${fmtYear(a)} ~ ${fmtYear(b)}`));
      body.appendChild(bar);
    }
    if (hasDot) {
      const xd = xs(s.composedYear);
      if (hasBar && (s.composedYear > b || s.composedYear < a)) {
        // 점이 막대 바깥에 찍히면 막대 끝에서 점까지 안내선 — "이만큼 뒤에 썼다"
        const later = s.composedYear > b;
        const from = xs(later ? b : a);
        const gap = later ? s.composedYear - b : a - s.composedYear;
        body.appendChild(el('line', { class: 'tl-guide', x1: from, x2: xd, y1: cy, y2: cy }));
        if (Math.abs(xd - from) >= MIN_GAP_PX) {
          body.appendChild(el('text', {
            class: 'tl-gap', x: (from + xd) / 2, y: cy - 7, 'text-anchor': 'middle',
          }, `${gap.toLocaleString('ko-KR')}년 ${later ? '뒤' : '앞'}`));
        }
      }
      const dot = el('circle', { class: 'tl-dot', cx: xd, cy, r: 4 });
      dot.appendChild(el('title', null, `${label} · ${fmtYearFull(s.composedYear)}에 쓰임`));
      body.appendChild(dot);
    }
    if (!hasBar && !hasDot) {
      body.appendChild(el('text', { class: 'tl-gap', x: plotL + 4, y: cy, dy: '.36em' }, '기간 미상'));
    }
    g.appendChild(body);
    return g;
  }

  /** 라벨 칸을 넘치는 이름은 줄여서 "…" 을 붙인다. 붙어 있지 않으면(측정 0) 건너뛴다. */
  _trimLabels(maxW){
    for (const t of this.svg.querySelectorAll('.tl-label-text')) {
      const full = t.dataset.full || t.textContent;
      t.textContent = full;
      if (typeof t.getComputedTextLength !== 'function') continue;
      let len = t.getComputedTextLength();
      if (!len || len <= maxW) continue;
      let s = full;
      while (s.length > 1 && len > maxW) {
        s = s.slice(0, -1);
        t.textContent = s + '…';
        len = t.getComputedTextLength();
      }
    }
  }

  _placeCursor(){
    const g = this._geom, gc = this._cursor;
    if (!g || !gc) return;
    const x = clamp(g.xs(this.year), g.plotL, g.plotR);
    gc.setAttribute('transform', `translate(${Math.round(x * 100) / 100} 0)`);
    gc.setAttribute('aria-valuenow', String(this.year));
    gc.setAttribute('aria-valuetext', fmtYearFull(this.year));

    const text = this._flag.querySelector('text');
    const bg = this._flag.querySelector('rect');
    text.textContent = fmtYearFull(this.year);
    const bw = textWidth(text) + 12;
    const flipLeft = x + 6 + bw > g.w - 2;   // 오른쪽 끝에서는 깃발을 왼쪽으로 붙인다
    const bx = flipLeft ? -6 - bw : 6;
    bg.setAttribute('x', String(bx));
    bg.setAttribute('width', String(Math.round(bw * 100) / 100));
    text.setAttribute('x', String(bx + 6));
  }

  _applyOn(){
    for (const g of this.svg.querySelectorAll('.tl-track')) {
      const on = this.on.has(g.dataset.id);
      g.classList.toggle('on', on);
      g.classList.toggle('off', !on);
      const lab = g.querySelector('.tl-label');
      if (lab) lab.setAttribute('aria-checked', on ? 'true' : 'false');
    }
  }

  // ── 입력 ──

  _toggle(id){
    const on = !this.on.has(id);
    if (on) this.on.add(id); else this.on.delete(id);
    this._applyOn();
    this.onToggle(id, on);
  }

  _yearAtClient(clientX){
    const g = this._geom;
    const r = this.svg.getBoundingClientRect();
    const x = clamp(clientX - r.left, g.plotL, g.plotR);
    return Math.round(g.d0 + (x - g.plotL) / g.plotW * (g.d1 - g.d0));
  }

  _commitYear(y){
    const g = this._geom;
    if (g) y = clamp(y, g.d0, g.d1);
    if (y === this.year) return;
    this.year = y;
    this._placeCursor();
    this.onYear(y);
  }

  _pointerDown(e){
    if (!this._geom) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target && typeof e.target.closest === 'function' && e.target.closest('.tl-label')) return;   // 체크박스는 제 일을 한다
    const r = this.svg.getBoundingClientRect();
    if (e.clientX - r.left < this._geom.plotL - 8) return;   // 라벨 칸
    e.preventDefault();
    this._drag = true;
    if (this._cursor && this._cursor.focus) this._cursor.focus({ preventScroll: true });
    this._commitYear(this._yearAtClient(e.clientX));
  }

  _pointerMove(e){
    if (this._drag) this._commitYear(this._yearAtClient(e.clientX));
  }

  _cursorKey(e){
    const g = this._geom;
    if (!g) return;
    let d = 0;
    switch (e.key) {
      case 'ArrowLeft': case 'ArrowDown': d = -1; break;
      case 'ArrowRight': case 'ArrowUp': d = 1; break;
      case 'PageDown': d = -100; break;
      case 'PageUp': d = 100; break;
      case 'Home': e.preventDefault(); this._commitYear(g.d0); return;
      case 'End': e.preventDefault(); this._commitYear(g.d1); return;
      default: return;
    }
    if (e.shiftKey && Math.abs(d) === 1) d *= 10;
    e.preventDefault();
    this._commitYear(this.year + d);
  }
}
