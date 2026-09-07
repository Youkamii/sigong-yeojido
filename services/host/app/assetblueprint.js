// app/assetblueprint.js — blueprint(부품 조립 명세)를 Assembly 파트로 굽는다.
//
// 왜 있나: 예전 생성기는 core id 를 if-chain 으로 갈라 13개 함수가 160개를 나눠 맡았다.
// 대부분은 분기에 걸리지 않고 기본 상자로 떨어졌고, 그래서 160개가 실루엣 몇십 개로 뭉쳤다.
// blueprint 는 core 하나에 부품 명세 하나를 붙여 **모든 core 가 제 실루엣을 갖게** 한다.
//
// 규격 정본: docs/04-assets.md §blueprint DSL v2 (좌표계·부품 종류·재질·역할색·반복자·태그).
// 이 파일은 그 규격의 유일한 해석기다 — 규격 밖 키는 조용히 무시한다(부분 손상이 전체를 죽이지 않게).
import * as THREE from 'three';
import { ASSET_COLOR as C, FAMILY, chamferBox, gableRoof } from './landmarks.js';
import { BEVEL_S, BEVEL_M, BEVEL_L, PANEL_GRID, trim as trimU } from './artbible.js';

const M4 = () => new THREE.Matrix4();
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const QE = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));

const FAM_BY_KEY = Object.freeze({
  stone: FAMILY.STONE, rockwet: FAMILY.ROCK_WET, timber: FAMILY.TIMBER, iron: FAMILY.IRON,
  gold: FAMILY.GOLD, leather: FAMILY.LEATHER, foliage: FAMILY.FOLIAGE, crystal: FAMILY.CRYSTAL,
});
const BEV_BY_KEY = Object.freeze({ s: BEVEL_S, m: BEVEL_M, l: BEVEL_L });

/** 부품 종류별 기본 재질·색 — m/c 를 안 적어도 흉하지 않게 떨어지는 자리 */
const DEFAULTS = Object.freeze({
  box: ['stone', 'body'], cyl: ['stone', 'body'], cone: ['timber', 'roof'],
  sph: ['foliage', 'canopyLow'], tor: ['iron', 'steel'], chunk: ['stone', 'rock'],
  gable: ['timber', 'roof'], rcyl: ['timber', 'timber'], wing: ['leather', 'roof'],
  band: ['stone', 'trim'], ledge: ['stone', 'trim'], cren: ['stone', 'bodyMid'],
  open: ['stone', 'mortar'], flag: ['iron', 'iron'],
});

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const famOf = (key, fallbackKey) => FAM_BY_KEY[key] || FAM_BY_KEY[fallbackKey] || FAMILY.STONE;
const colorOf = (key, fallbackKey) => (C[key] || C[fallbackKey] || C.body);

/* ══════════════════════════════════════════════════════════════════
   1. 반복자 — 부품 하나를 여러 벌로 펼친다
   ══════════════════════════════════════════════════════════════════ */

/**
 * rep 를 풀어 부품 목록을 만든다. 규격의 네 가지(ring · 선형 dx/dy/dz · mir · sq)뿐이다.
 * 반환은 **새 객체**들이라 원본 blueprint 는 절대 오염되지 않는다 (도감이 같은 blueprint 를
 * 형태·변종별로 수십 번 다시 굽는다 — 여기서 한 번이라도 원본을 만지면 두 번째부터 무너진다).
 */
function expandRepeat(spec) {
  const rep = spec && spec.rep;
  const bare = { ...spec };
  delete bare.rep;
  if (!rep || typeof rep !== 'object') return [bare];

  const out = [];
  const n = Math.max(1, Math.min(24, Math.round(num(rep.n, 1))));

  if (Number.isFinite(Number(rep.ring))) {
    const R = num(rep.ring, 1);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const copy = { ...bare };
      copy.x = num(bare.x) + Math.cos(a) * R;
      copy.z = num(bare.z) + Math.sin(a) * R;
      // three 의 +Z 가 정면이라 바깥을 보려면 방위각을 이렇게 뒤집는다
      if (rep.face) copy.ry = num(bare.ry) + (Math.PI / 2 - a);
      out.push(copy);
    }
    return out;
  }

  if (Number.isFinite(Number(rep.sq))) {
    const h = num(rep.sq, 1);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const copy = { ...bare };
      copy.x = num(bare.x) + sx * h;
      copy.z = num(bare.z) + sz * h;
      out.push(copy);
    }
    return out;
  }

  if (rep.mir === 'x' || rep.mir === 'z') {
    // ±축 대칭 두 벌. 원본의 오프셋 부호를 뒤집는다 — 오프셋이 0 이면 겹치므로
    // 작성자에게 span 을 주라는 뜻이지만, 겹쳐도 렌더는 깨지지 않으니 그대로 둔다.
    for (const s of [1, -1]) {
      const copy = { ...bare };
      if (rep.mir === 'x') { copy.x = num(bare.x) * s; copy.ry = num(bare.ry) * s; }
      else copy.z = num(bare.z) * s;
      copy.side = (num(bare.side, 1) || 1) * s;   // wing 은 side 로 좌우를 가른다
      out.push(copy);
    }
    return out;
  }

  const dx = num(rep.dx), dy = num(rep.dy), dz = num(rep.dz);
  if (dx || dy || dz) {
    // 선형 반복은 **원점 기준 가운데 정렬** — 작성자가 오프셋을 손으로 계산하지 않게 한다.
    // 단 dy(쌓기)만 있는 경우는 아래에서 위로 쌓는 게 자연스러워 정렬하지 않는다.
    const centerX = dx * (n - 1) / 2;
    const centerZ = dz * (n - 1) / 2;
    for (let i = 0; i < n; i++) {
      const copy = { ...bare };
      copy.x = num(bare.x) + dx * i - centerX;
      copy.y = num(bare.y) + dy * i;
      copy.z = num(bare.z) + dz * i - centerZ;
      out.push(copy);
    }
    return out;
  }

  for (let i = 0; i < n; i++) out.push({ ...bare });
  return out;
}

/** blueprint.p 전체를 반복자까지 풀어 평평한 부품 목록으로 만든다. */
export function expandBlueprint(bp) {
  const src = bp && Array.isArray(bp.p) ? bp.p : [];
  const out = [];
  for (const spec of src) {
    if (!spec || typeof spec !== 'object' || !spec.k) continue;
    for (const one of expandRepeat(spec)) out.push(one);
  }
  return out;
}

/* ══════════════════════════════════════════════════════════════════
   2. 형태 변형 — form 은 크기만 바꾸는 딱지가 아니라 **부품을 수술한다**
   ══════════════════════════════════════════════════════════════════ */

const TAG_ORDER = ['base', 'body', 'limb', 'roof', 'top', 'ornament', 'glow'];
const tagOf = (spec) => (TAG_ORDER.includes(spec.tag) ? spec.tag : 'body');

/** 결정론적 잡음 — 같은 (core, form, 변종) 은 언제나 같은 모습이어야 한다 (도감이 재생성한다) */
function hashNoise(seed, i) {
  let h = 2166136261 >>> 0;
  const s = String(seed) + '#' + i;
  for (let k = 0; k < s.length; k++) { h ^= s.charCodeAt(k); h = Math.imul(h, 16777619) >>> 0; }
  return ((h >>> 8) & 0xffff) / 0xffff;
}

const dropTags = (specs, tags) => specs.filter((s) => !tags.includes(tagOf(s)));

/** 부품에 기울임을 누적한다 (rcyl/chunk 가 아닌 종류도 rx/rz 를 받아들이도록 rcyl 로 승격하지 않고 필드만 얹는다) */
function tilt(spec, rx, rz) {
  const out = { ...spec };
  out._rx = num(out._rx) + rx;
  out._rz = num(out._rz) + rz;
  return out;
}

function rubble(meta, n, seed) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + hashNoise(seed, i) * 1.4;
    const r = meta.rad * (0.42 + hashNoise(seed, i + 40) * 0.72);
    out.push({
      k: 'chunk', r: meta.rad * (0.07 + hashNoise(seed, i + 80) * 0.10),
      x: Math.cos(a) * r, y: meta.rad * 0.06, z: Math.sin(a) * r,
      ex: hashNoise(seed, i + 120) * 2, ey: hashNoise(seed, i + 160) * 2, ez: hashNoise(seed, i + 200) * 2,
      m: 'stone', c: 'rock', tag: 'base',
    });
  }
  return out;
}

function shards(meta, n, seed, color = 'crystalA') {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = meta.rad * (0.62 + hashNoise(seed, i + 11) * 0.30);
    out.push({
      k: 'chunk', r: meta.rad * 0.09, x: Math.cos(a) * r,
      y: meta.h * (0.24 + hashNoise(seed, i + 21) * 0.5), z: Math.sin(a) * r,
      ex: a, ey: a * 0.6, ez: a * 0.3, sx: 0.55, sy: 2.1, sz: 0.55,
      m: 'crystal', c: color, tag: 'glow',
    });
  }
  return out;
}

/**
 * 형태 변형 레지스트리.
 * 각 함수는 (부품목록, meta{h,rad}, seed) → 새 부품목록. **원본을 변형하지 않는다.**
 * 카테고리별 form id 가 여기 키에 없으면 identity 로 떨어진다 — 새 form 을 추가해도 안 깨진다.
 */
export const FORM_FX = Object.freeze({
  /* ── 온전·기본 ─────────────────────────────────────────────── */
  identity: (p) => p,

  /* ── 규모 ─────────────────────────────────────────────────── */
  swell: (p, m, s) => p.concat([
    { k: 'cyl', r: m.rad * 1.12, r1: m.rad * 1.04, h: m.h * 0.06, y: m.h * 0.03, seg: 16, m: 'stone', c: 'base', tag: 'base' },
  ]),
  layered: (p, m) => {
    // 같은 몸통을 위로 두 단 더 얹되 좁혀 올린다 — 계단식 실루엣이 생긴다
    const body = p.filter((x) => tagOf(x) === 'body');
    const out = p.slice();
    for (let step = 1; step <= 2; step++) {
      const k = 1 - step * 0.22;
      for (const spec of body) {
        const copy = { ...spec };
        copy._mul = num(copy._mul, 1) * k;
        copy._lift = num(copy._lift) + m.h * 0.34 * step;
        out.push(copy);
      }
    }
    return out;
  },
  hollow: (p, m, s) => dropTags(p, ['top', 'ornament']).concat([
    { k: 'tor', R: m.rad * 0.86, t: m.rad * 0.07, y: m.h * 0.52, rx: Math.PI / 2, m: 'stone', c: 'bodyMid', tag: 'body' },
  ]),

  /* ── 손상 계열 ─────────────────────────────────────────────── */
  ruin: (p, m, s) => {
    const kept = [];
    let i = 0;
    for (const spec of p) {
      const t = tagOf(spec);
      if (t === 'roof' || t === 'top' || t === 'ornament') { i++; continue; }   // 지붕·꼭대기가 먼저 사라진다
      const y = num(spec.y);
      if (y > m.h * 0.58 && hashNoise(s, i) < 0.62) { i++; continue; }          // 위쪽 몸통도 절반쯤 무너진다
      kept.push(tilt(spec, (hashNoise(s, i + 7) - 0.5) * 0.30, (hashNoise(s, i + 13) - 0.5) * 0.30));
      i++;
    }
    return kept.concat(rubble(m, 7, s));
  },
  damage: (p, m, s) => {
    const out = [];
    let i = 0;
    for (const spec of p) {
      if (tagOf(spec) === 'ornament' && hashNoise(s, i) < 0.5) { i++; continue; }
      out.push(hashNoise(s, i + 3) < 0.35
        ? tilt(spec, (hashNoise(s, i + 5) - 0.5) * 0.16, (hashNoise(s, i + 9) - 0.5) * 0.16)
        : spec);
      i++;
    }
    return out.concat(rubble(m, 3, s));
  },
  shatter: (p, m, s) => {
    const out = [];
    let i = 0;
    for (const spec of p) {
      if (hashNoise(s, i) < 0.28) { i++; continue; }
      const a = hashNoise(s, i + 31) * Math.PI * 2;
      const push = m.rad * (0.08 + hashNoise(s, i + 41) * 0.34);
      const copy = tilt(spec, (hashNoise(s, i + 51) - 0.5) * 1.1, (hashNoise(s, i + 61) - 0.5) * 1.1);
      copy.x = num(copy.x) + Math.cos(a) * push;
      copy.z = num(copy.z) + Math.sin(a) * push;
      copy._lift = num(copy._lift) + (hashNoise(s, i + 71) - 0.35) * m.h * 0.22;
      out.push(copy);
      i++;
    }
    return out.concat(rubble(m, 9, s));
  },
  buried: (p, m, s) => {
    const sunk = p.map((spec) => ({ ...spec, _lift: num(spec._lift) - m.h * 0.34 }));
    return sunk.concat([
      { k: 'cyl', r: m.rad * 1.25, r1: m.rad * 0.95, h: m.h * 0.22, y: m.h * 0.09, seg: 14, m: 'stone', c: 'strata', tag: 'base' },
    ], rubble(m, 4, s));
  },

  /* ── 격식·장식 계열 ────────────────────────────────────────── */
  ornate: (p, m, s) => p.concat([
    { k: 'band', r: m.rad * 0.94, y: m.h * 0.74, m: 'gold', c: 'gold', tag: 'ornament' },
    { k: 'cone', r: m.rad * 0.13, h: m.h * 0.18, seg: 8, y: m.h * 1.05, m: 'gold', c: 'gold', tag: 'ornament' },
    { k: 'box', w: m.rad * 0.40, h: m.h * 0.24, d: m.rad * 0.04, x: m.rad * 0.92, y: m.h * 0.60, m: 'leather', c: 'banner', tag: 'ornament', rep: { mir: 'x' } },
  ]),
  royal: (p, m, s) => FORM_FX.ornate(p, m, s).concat([
    { k: 'cyl', r: m.rad * 1.18, r1: m.rad * 1.10, h: m.h * 0.09, y: m.h * 0.045, seg: 16, m: 'stone', c: 'base', tag: 'base' },
    { k: 'flag', x: m.rad * 0.78, y: m.h * 0.10, z: m.rad * 0.42, h: m.h * 0.62, rep: { mir: 'x' } },
  ]),
  humble: (p) => dropTags(p, ['ornament']).map((s) => ({ ...s, _mul: num(s._mul, 1) * 0.92 })),

  /* ── 마법·초자연 계열 ──────────────────────────────────────── */
  arcane: (p, m, s) => p.concat(shards(m, 5, s), [
    { k: 'tor', R: m.rad * 0.78, t: m.rad * 0.035, y: m.h * 0.62, rx: Math.PI / 2, m: 'crystal', c: 'crystalB', tag: 'glow' },
  ]),
  spectral: (p, m) => p.map((s) => ({ ...s, m: 'crystal', c: 'crystalB', _lift: num(s._lift) + m.h * 0.10, tag: tagOf(s) })),
  dormant: (p) => dropTags(p, ['glow']).map((s) => ({ ...s, _mul: num(s._mul, 1) * 0.90 })),
  unstable: (p, m, s) => {
    const out = p.map((spec, i) => tilt(spec, (hashNoise(s, i + 3) - 0.5) * 0.26, (hashNoise(s, i + 5) - 0.5) * 0.26));
    return out.concat(shards(m, 7, s, 'crystalA'));
  },
  corrupt: (p, m, s) => {
    const out = p.map((spec, i) => (hashNoise(s, i) < 0.4
      ? tilt(spec, (hashNoise(s, i + 2) - 0.5) * 0.22, (hashNoise(s, i + 4) - 0.5) * 0.22) : spec));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      out.push({
        k: 'cone', r: m.rad * 0.06, h: m.h * (0.22 + hashNoise(s, i + 90) * 0.26), seg: 5,
        x: Math.cos(a) * m.rad * 0.66, y: m.h * (0.28 + hashNoise(s, i + 91) * 0.30), z: Math.sin(a) * m.rad * 0.66,
        m: 'crystal', c: 'crystalA', tag: 'ornament',
      });
    }
    return out;
  },

  /* ── 생장 계열 ─────────────────────────────────────────────── */
  juvenile: (p, m) => dropTags(p, ['ornament']).map((s) => ({
    ...s, _mul: num(s._mul, 1) * (tagOf(s) === 'top' ? 1.18 : 0.74),
  })),
  ancient: (p, m, s) => p.concat([
    { k: 'sph', r: m.rad * 0.16, x: m.rad * 0.62, y: m.h * 0.14, z: m.rad * 0.30, sx: 1.5, sy: 0.42, sz: 1.3, m: 'foliage', c: 'canopyLow', tag: 'ornament', rep: { n: 4, ring: m.rad * 0.72 } },
  ], rubble(m, 3, s)),
  colossal: (p, m, s) => FORM_FX.swell(p, m, s).concat(rubble(m, 4, s)),

  /* ── 무장·점유 계열 ────────────────────────────────────────── */
  armored: (p, m, s) => p.concat([
    { k: 'box', w: m.rad * 0.62, h: m.h * 0.14, d: m.rad * 0.62, y: m.h * 0.58, m: 'iron', c: 'steel', bev: 's', tag: 'ornament', rep: { n: 3, dy: m.h * 0.14 } },
    { k: 'cone', r: m.rad * 0.05, h: m.h * 0.12, seg: 5, x: m.rad * 0.44, y: m.h * 0.78, m: 'iron', c: 'iron', tag: 'ornament', rep: { mir: 'x' } },
  ]),
  occupied: (p, m, s) => p.concat([
    { k: 'box', w: m.rad * 0.26, h: m.rad * 0.20, d: m.rad * 0.20, x: m.rad * 0.86, y: m.rad * 0.10, z: m.rad * 0.34, m: 'timber', c: 'timber', bev: 's', tag: 'ornament', rep: { n: 3, dx: m.rad * 0.30 } },
    { k: 'flag', x: -m.rad * 0.82, y: 0, z: m.rad * 0.30, h: m.h * 0.52 },
  ]),

  /* ── 대기·사건 계열 (부피가 주인공이라 별도 처리) ──────────── */
  flowing: (p, m) => p.map((s) => ({ ...s, _sx: num(s._sx, 1) * 1.5, _sz: num(s._sz, 1) * 0.68 })),
  towering: (p, m) => p.map((s) => ({ ...s, _sy: num(s._sy, 1) * 1.65, _lift: num(s._lift) + m.h * 0.12 })),
  violent: (p, m, s) => FORM_FX.unstable(p, m, s).map((x) => ({ ...x, _sx: num(x._sx, 1) * 1.2, _sz: num(x._sz, 1) * 1.2 })),
  spreading: (p, m) => p.map((s) => ({ ...s, _sx: num(s._sx, 1) * 1.45, _sz: num(s._sz, 1) * 1.45, _sy: num(s._sy, 1) * 0.72 })),

  /* ── 충돌을 푸는 전용 변형 ─────────────────────────────────────
     같은 카테고리 안에서 두 form 이 같은 변형으로 떨어지면 도감에 똑같은 물건이 두 번 선다.
     아래는 그 짝들을 갈라 주는 전용 변형이다. ───────────────────────────── */

  /** 모이는 — 부품이 안쪽으로 당겨지고 같은 것이 주변에 작게 여럿 모인다 */
  gather: (p, m, s) => {
    const pulled = p.map((spec) => ({ ...spec, x: num(spec.x) * 0.74, z: num(spec.z) * 0.74 }));
    const seeds = p.filter((x) => tagOf(x) !== 'base').slice(0, 5);
    const out = pulled.slice();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      for (const spec of seeds) {
        out.push({
          ...spec, _mul: num(spec._mul, 1) * 0.42,
          x: num(spec.x) * 0.42 + Math.cos(a) * m.rad * 0.82,
          z: num(spec.z) * 0.42 + Math.sin(a) * m.rad * 0.82,
        });
      }
    }
    return out;
  },

  /** 석화 — 전부 돌이 된다. 색까지 바위로 눌러 유기물의 온기를 지운다. */
  petrify: (p, m, s) => p.map((spec, i) => ({
    ...spec, m: 'stone', c: i % 3 === 0 ? 'rock' : i % 3 === 1 ? 'bodyMid' : 'strata',
  })).concat(rubble(m, 3, s)),

  /** 요새화 — 장갑 위에 낮은 외곽 성벽과 흉벽을 두른다 (walled 는 판만 덧댄다) */
  fortify: (p, m, s) => p.concat([
    { k: 'box', w: m.rad * 0.34, h: m.h * 0.30, d: m.rad * 0.34, y: m.h * 0.15, m: 'stone', c: 'base', tag: 'base', rep: { n: 10, ring: m.rad * 1.18, face: true } },
    { k: 'cren', y: m.h * 0.30, n: 14, half: m.rad * 1.18, m: 'stone', c: 'bodyMid', tag: 'top' },
    { k: 'cyl', r: m.rad * 0.22, r1: m.rad * 0.19, h: m.h * 0.52, y: m.h * 0.26, seg: 8, m: 'stone', c: 'body', tag: 'body', rep: { n: 4, sq: m.rad * 0.86 } },
  ]),

  /** 사용 중 — 살림살이가 아니라 사람이 지나간 흔적이 남는다 (furnished 와 갈린다) */
  inhabit: (p, m, s) => p.concat([
    { k: 'cyl', r: m.rad * 0.10, h: m.h * 0.42, y: m.h * 0.21, x: m.rad * 0.70, z: -m.rad * 0.42, seg: 6, m: 'timber', c: 'trunk', tag: 'ornament' },
    { k: 'box', w: m.rad * 0.44, h: m.h * 0.16, d: m.rad * 0.03, y: m.h * 0.40, x: m.rad * 0.70, z: -m.rad * 0.42, m: 'leather', c: 'banner', bev: 's', tag: 'ornament', rep: { n: 3, dx: m.rad * 0.30 } },
    { k: 'chunk', r: m.rad * 0.11, y: m.rad * 0.09, x: -m.rad * 0.62, z: m.rad * 0.52, ex: 0.7, ey: 1.3, m: 'timber', c: 'timber', tag: 'ornament', rep: { n: 3, dx: m.rad * 0.22 } },
  ]),

  /** 명품 — 금은 아끼되 선이 가늘어지고 트림이 정확해진다 (royal 은 크고 화려하다) */
  masterwork: (p, m, s) => p.map((spec) => (
    tagOf(spec) === 'body' ? { ...spec, _sx: num(spec._sx, 1) * 0.94, _sz: num(spec._sz, 1) * 0.94 } : spec
  )).concat([
    { k: 'band', r: m.rad * 0.86, y: m.h * 0.28, m: 'gold', c: 'gold', tag: 'ornament' },
    { k: 'band', r: m.rad * 0.78, y: m.h * 0.66, m: 'gold', c: 'gold', tag: 'ornament' },
    { k: 'cone', r: m.rad * 0.08, h: m.h * 0.12, seg: 6, y: m.h * 1.02, m: 'gold', c: 'gold', tag: 'ornament' },
  ]),

  /** 오염 — 가시가 아니라 늘어지고 덮인다 (corrupt 는 가시가 솟는다) */
  blight: (p, m, s) => {
    const out = p.map((spec, i) => ({
      ...spec, c: i % 2 ? spec.c : 'trunkDark',
      _sy: num(spec._sy, 1) * (tagOf(spec) === 'top' ? 0.82 : 1),
    }));
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      out.push({
        k: 'sph', r: m.rad * 0.13, x: Math.cos(a) * m.rad * 0.70,
        y: m.h * (0.18 + hashNoise(s, i) * 0.46), z: Math.sin(a) * m.rad * 0.70,
        sx: 1.4, sy: 2.2, sz: 1.4, m: 'foliage', c: 'canopyLow', tag: 'ornament',
      });
    }
    return out;
  },

  /** 지워진 — 절반이 사라지고 남은 것은 윤곽만 (faint 는 옅어질 뿐 다 남는다) */
  erase: (p, m, s) => p.filter((x, i) => hashNoise(s, i) > 0.52 || tagOf(x) === 'base')
    .map((spec) => ({ ...spec, m: 'crystal', c: 'crystalB', _sx: num(spec._sx, 1) * 0.96, _sz: num(spec._sz, 1) * 0.96 })),

  /** 덮인 — 같은 자리에 다른 재질의 판본이 겹쳐 쓰인다 (disputed 는 유령처럼 어긋난다) */
  overwrite: (p, m, s) => p.concat(
    p.filter((x) => tagOf(x) !== 'base').map((spec) => ({
      ...spec, m: 'iron', c: 'steel',
      _mul: num(spec._mul, 1) * 1.06,
      x: num(spec.x) + m.rad * 0.05, z: num(spec.z) + m.rad * 0.05,
      _lift: num(spec._lift) + m.h * 0.02,
    })),
  ),

  /** 다투는 — 세 판본이 부채꼴로 갈라져 각자 조금씩만 남는다 */
  contest: (p, m, s) => {
    const out = [];
    const tone = ['crystalA', 'crystalB', 'gold'];
    for (let k = 0; k < 3; k++) {
      const a = (k - 1) * 0.42;
      const slice = p.filter((x, i) => (i + k) % 3 !== 2);
      for (const spec of slice) {
        out.push({
          ...spec, m: k === 2 ? 'gold' : 'crystal', c: tone[k],
          x: num(spec.x) * Math.cos(a) - num(spec.z) * Math.sin(a) + Math.sin(a) * m.rad * 0.30,
          z: num(spec.x) * Math.sin(a) + num(spec.z) * Math.cos(a),
          ry: num(spec.ry) + a,
        });
      }
    }
    return out;
  },

  /** 난폭 — 위로 터져 오른다 (peak 는 솟고, 이쪽은 흩어지며 솟는다) */
  surge: (p, m, s) => p.map((spec, i) => ({
    ...spec,
    _lift: num(spec._lift) + m.h * hashNoise(s, i) * 0.34,
    _rx: num(spec._rx) + (hashNoise(s, i + 5) - 0.5) * 0.46,
    _rz: num(spec._rz) + (hashNoise(s, i + 9) - 0.5) * 0.46,
    _sy: num(spec._sy, 1) * 1.28,
  })).concat(shards(m, 6, s, 'gold')),

  /** 잔해 — 무너진 뒤 넓게 퍼진 상태 (ruin 은 자리에 주저앉는다) */
  wreck: (p, m, s) => {
    const kept = [];
    let i = 0;
    for (const spec of p) {
      const t = tagOf(spec);
      if (t === 'roof' || t === 'top' || t === 'ornament' || hashNoise(s, i) < 0.42) { i++; continue; }
      const a = hashNoise(s, i + 17) * Math.PI * 2;
      const push = m.rad * (0.30 + hashNoise(s, i + 23) * 0.66);
      kept.push({
        ...tilt(spec, (hashNoise(s, i + 29) - 0.5) * 0.9, (hashNoise(s, i + 31) - 0.5) * 0.9),
        x: num(spec.x) + Math.cos(a) * push,
        z: num(spec.z) + Math.sin(a) * push,
        _lift: num(spec._lift) - m.h * 0.22,
        _sy: num(spec._sy, 1) * 0.6,
      });
      i++;
    }
    return kept.concat(rubble(m, 11, s));
  },

  /* ── 인식·소문 계열 ────────────────────────────────────────── */
  faint: (p, m) => p.filter((s, i) => i % 2 === 0).map((s) => ({ ...s, m: 'crystal', c: 'crystalB', _mul: num(s._mul, 1) * 0.86 })),
  disputed: (p, m, s) => {
    // 같은 물건이 조금 어긋나 두 벌 겹친다 — 판본 충돌을 형태로 말한다
    const ghost = p.slice(0, Math.min(8, p.length)).map((spec) => ({
      ...spec, m: 'crystal', c: 'crystalA',
      x: num(spec.x) + m.rad * 0.18, z: num(spec.z) - m.rad * 0.14, _lift: num(spec._lift) + m.h * 0.05,
    }));
    return p.concat(ghost);
  },
  fragmented: (p, m, s) => FORM_FX.shatter(p, m, s).map((x) => ({ ...x, m: 'crystal', c: 'crystalB' })),
});

/** 카테고리별 form id → 변형 함수 이름. 없으면 identity. */
/**
 * 같은 form id 가 카테고리마다 다른 뜻인 경우의 예외표.
 * 예: events 의 'violent' 는 같은 카테고리의 'peak' 와 나란히 서므로 둘을 갈라야 하고,
 *     magic 의 'corrupted' 는 'forbidden' 과 나란히 선다.
 * 조회 순서는 [카테고리|form] -> [form] -> identity.
 */
export const FORM_FX_BY_CATEGORY = Object.freeze({
  'magic|corrupted': 'blight',
  'events|violent': 'surge',
  'events|ruined': 'wreck',
  'ecology|corrupted': 'blight',
  'interiors|ruined': 'wreck',
  'infrastructure|ruined': 'wreck',
  'interiors|ceremonial': 'royal',
});

export const FORM_FX_BY_ID = Object.freeze({
  base: 'identity', vast: 'swell', layered: 'layered', hollow: 'hollow', shattered: 'shatter',
  eroded: 'damage', frozen_over: 'identity', volcanic: 'corrupt',
  calm: 'identity', flowing: 'flowing', towering: 'towering', violent: 'violent', supernatural: 'arcane',
  gathering: 'gather', dissipating: 'faint', charged: 'unstable',
  patch: 'humble', grove: 'identity', ancient: 'ancient', colossal: 'colossal', corrupted: 'corrupt',
  blooming: 'ornate', withered: 'damage', petrified: 'petrify',
  compact: 'humble', walled: 'armored', elevated: 'towering', sprawling: 'spreading', monumental: 'royal',
  ruined: 'ruin', abandoned: 'damage', fortified: 'fortify',
  bare: 'humble', furnished: 'occupied', ceremonial: 'ornate', occupied: 'inhabit',
  narrow: 'humble', reinforced: 'armored', buried: 'buried',
  civilian: 'identity', armored: 'armored', cargo: 'spreading', royal: 'royal', arcane: 'arcane',
  derelict: 'ruin', racing: 'flowing', ancient_craft: 'ancient',
  warrior: 'armored', mystic: 'arcane', veteran: 'damage', noble: 'ornate',
  juvenile: 'juvenile', adult: 'identity', spectral: 'spectral', alpha: 'swell', swarming: 'spreading',
  plain: 'humble', ornate: 'ornate', damaged: 'damage', enchanted: 'arcane',
  broken: 'shatter', masterwork: 'masterwork', cursed: 'corrupt',
  dormant: 'dormant', active: 'identity', unstable: 'unstable', grand: 'royal', forbidden: 'corrupt',
  local: 'humble', spreading: 'spreading', peak: 'violent', aftermath: 'ruin',
  faint: 'faint', revealed: 'identity', disputed: 'disputed', fragmented: 'fragmented', overwritten: 'overwrite',
  erased: 'erase', contested: 'contest',
});

/* ══════════════════════════════════════════════════════════════════
   3. 변종 — 같은 형태를 다른 재질·시대·기후로 다시 만든다
   ══════════════════════════════════════════════════════════════════ */

/**
 * 변종 프리셋. `swap` 은 재질 계열 치환, `tint` 는 역할색 보정, `add` 는 덧붙는 부품이다.
 * 형태(form)가 "이 물건에 무슨 일이 있었나"라면 변종은 "이 물건이 어느 세계 것인가"다.
 */
export const VARIANTS = Object.freeze([
  { id: 'native', label: '토착', swap: null, tint: null },
  // 석조 — 나무·가죽·결정까지 전부 깎아 만든 세계. 석화된 나무도 여기 든다.
  { id: 'stonecut', label: '석조',
    swap: { timber: 'stone', leather: 'stone', crystal: 'stone', foliage: 'stone', rockwet: 'stone' },
    tint: { key: 'strata', amount: 0.30 } },
  // 철제 — 돌·나무·결정이 철로. 산업·군사 문명의 같은 물건.
  { id: 'ironwrought', label: '철제',
    swap: { stone: 'iron', timber: 'iron', crystal: 'iron', rockwet: 'iron', leather: 'iron' },
    tint: { key: 'steel', amount: 0.34 } },
  // 수목 — 돌·철·결정이 나무와 잎으로. 숲 문명의 같은 물건.
  { id: 'verdant', label: '수목',
    swap: { stone: 'timber', iron: 'timber', rockwet: 'timber', crystal: 'foliage' },
    tint: { key: 'trunk', amount: 0.28 } },
  // 결정 — 돌·철·나무가 아케인 결정으로. 유리처럼 비치고 발광에 실린다.
  { id: 'arcanite', label: '결정',
    swap: { stone: 'crystal', iron: 'crystal', timber: 'crystal', rockwet: 'crystal', leather: 'crystal' },
    tint: { key: 'crystalA', amount: 0.34 }, glow: true },
]);
export const VARIANT_BY_ID = new Map(VARIANTS.map((v) => [v.id, v]));

function applyVariant(specs, variant) {
  if (!variant || (!variant.swap && !variant.tint)) return specs;
  return specs.map((spec) => {
    const out = { ...spec };
    const famKey = out.m || (DEFAULTS[out.k] && DEFAULTS[out.k][0]) || 'stone';
    // 금은 변종을 타지 않는다 — 금이 재질 치환에 휩쓸리면 왕관이 나무가 된다.
    const swapped = variant.swap && famKey !== 'gold' && variant.swap[famKey];
    if (swapped) out.m = variant.swap[famKey];
    // 색 보정은 **재질이 실제로 바뀐 부품에만** 건다. 전 부품에 걸면 지붕·수관·깃발까지
    // 같은 색으로 덮여 변종 다섯 개가 전부 한 가지 색 뭉치로 보인다(결정 변종에서 실제로 그랬다).
    if (variant.tint && swapped) { out._tintKey = variant.tint.key; out._tintAmt = variant.tint.amount; }
    return out;
  });
}

/* ══════════════════════════════════════════════════════════════════
   4. 굽기 — 부품 명세를 Assembly 에 밀어 넣는다
   ══════════════════════════════════════════════════════════════════ */

function resolveColor(spec, fallbackKey) {
  let color = colorOf(spec.c, fallbackKey);
  if (spec._tintKey && C[spec._tintKey]) {
    color = color.clone().lerp(C[spec._tintKey], Math.max(0, Math.min(1, num(spec._tintAmt, 0.3))));
  }
  return color;
}

function pushGeneric(b, geo, spec, size, fallback, flat) {
  const mul = num(spec._mul, 1);
  const pos = V3(
    num(spec.x) * size * mul,
    (num(spec.y) * mul + num(spec._lift)) * size,
    num(spec.z) * size * mul,
  );
  const quat = QE(num(spec.rx) + num(spec._rx), num(spec.ry), num(spec.rz) + num(spec._rz));
  const scl = V3(num(spec._sx, 1), num(spec._sy, 1), num(spec._sz, 1));
  b.push(geo, famOf(spec.m, fallback[0]), resolveColor(spec, fallback[1]),
    M4().compose(pos, quat, scl), !!flat);
}

/** 부품 명세 하나를 Assembly 에 굽는다. 알 수 없는 k 는 조용히 건너뛴다. */
function emitPart(b, spec, size) {
  const k = String(spec.k || '');
  const fallback = DEFAULTS[k] || ['stone', 'body'];
  const mul = num(spec._mul, 1);
  const S = size * mul;
  const fam = famOf(spec.m, fallback[0]);
  const color = resolveColor(spec, fallback[1]);
  const bev = BEV_BY_KEY[spec.bev] || BEVEL_M;
  const seg = Math.max(3, Math.min(24, Math.round(num(spec.seg, 12))));
  const x = num(spec.x) * S;
  const y = (num(spec.y) * mul + num(spec._lift)) * size;
  const z = num(spec.z) * S;
  const tilted = num(spec.rx) + num(spec._rx) !== 0 || num(spec.rz) + num(spec._rz) !== 0
    || num(spec._sx, 1) !== 1 || num(spec._sy, 1) !== 1 || num(spec._sz, 1) !== 1;

  switch (k) {
    case 'box': {
      const w = num(spec.w, 1) * S, h = num(spec.h, 1) * S, d = num(spec.d, 1) * S;
      // 기울거나 눌린 상자는 Assembly.box(=Y 회전만 받는다)로 표현할 수 없다 — 직접 밀어 넣는다.
      if (tilted) { pushGeneric(b, chamferBox(w, h, d, bev), spec, size, fallback, false); break; }
      b.box(w, h, d, x, y, z, fam, color, num(spec.ry), bev);
      break;
    }
    case 'cyl': {
      const r = num(spec.r, 1) * S;
      const r1 = Number.isFinite(Number(spec.r1)) ? num(spec.r1) * S : r;
      const h = num(spec.h, 1) * S;
      if (tilted) {
        pushGeneric(b, new THREE.CylinderGeometry(r1, r, h, seg, 1), spec, size, fallback, !!spec.flat);
        break;
      }
      b.cyl(r, r1, h, seg, x, y, z, fam, color, num(spec.ry), !!spec.flat);
      break;
    }
    case 'rcyl': {
      const r = num(spec.r, 1) * S;
      const r1 = Number.isFinite(Number(spec.r1)) ? num(spec.r1) * S : r;
      pushGeneric(b, new THREE.CylinderGeometry(r1, r, num(spec.h, 1) * S, seg, 1), spec, size, fallback, false);
      break;
    }
    case 'cone': {
      const r = num(spec.r, 1) * S, h = num(spec.h, 1) * S;
      if (tilted) { pushGeneric(b, new THREE.ConeGeometry(r, h, seg, 1), spec, size, fallback, true); break; }
      b.cone(r, h, seg, x, y, z, fam, color, num(spec.ry), true);
      break;
    }
    case 'sph': {
      const detail = num(spec.r, 1) * S > size * 0.9 ? 1 : 0;   // 큰 구만 한 단계 더 나눈다 (삼각형 예산)
      const g = new THREE.IcosahedronGeometry(num(spec.r, 1) * S, detail);
      const out = { ...spec };
      out._sx = num(spec._sx, 1) * num(spec.sx, 1);
      out._sy = num(spec._sy, 1) * num(spec.sy, 1);
      out._sz = num(spec._sz, 1) * num(spec.sz, 1);
      pushGeneric(b, g, out, size, fallback, false);
      break;
    }
    case 'tor':
      pushGeneric(b, new THREE.TorusGeometry(num(spec.R, 1) * S, num(spec.t, 0.1) * S, 8, 20),
        spec, size, fallback, false);
      break;
    case 'chunk': {
      const g = new THREE.IcosahedronGeometry(num(spec.r, 0.3) * S, 0);
      const out = { ...spec };
      out.rx = num(spec.rx) + num(spec.ex);
      out.ry = num(spec.ry) + num(spec.ey);
      out.rz = num(spec.rz) + num(spec.ez);
      out._sx = num(spec._sx, 1) * num(spec.sx, 1.3);
      out._sy = num(spec._sy, 1) * num(spec.sy, 0.85);
      out._sz = num(spec._sz, 1) * num(spec.sz, 1.15);
      pushGeneric(b, g, out, size, fallback, true);
      break;
    }
    case 'gable': {
      const w = num(spec.w, 1) * S, gh = num(spec.h, 1) * S, d = num(spec.d, 1) * S;
      // Assembly.gable 은 Y 회전만 받는다. 기운 지붕(무너진 집·기우는 배)을 쓰려면
      // 직접 밀어 넣어야 한다 — 안 그러면 몸통만 기울고 지붕은 수평으로 떠 있다.
      if (tilted) { pushGeneric(b, gableRoof(w, gh, d), spec, size, fallback, true); break; }
      b.gable(w, gh, d, x, y, z, fam, color, num(spec.ry));
      break;
    }
    case 'wing':
      emitWing(b, num(spec.side, 1) < 0 ? -1 : 1, y, z, fam, color, num(spec.span, 1) * S);
      break;
    case 'open':
      b.opening(num(spec.w, 0.8) * S, num(spec.h, 1.3) * S, x, y, z, num(spec.ry),
        C[spec.c] || C.mortar, fam);
      break;
    // band·ledge·cren 은 Assembly 쪽 구현이 x·z 를 0 으로 못박아 둔다(중심 구조물 전용이라).
    // 여기서는 곁탑·별동에도 트림을 두를 수 있어야 해서 오프셋을 살려 직접 만든다.
    case 'band': {
      const r = num(spec.r, 1) * S;
      // 눕힌 트림 링(기운 배의 테, 비스듬한 고리)도 쓰이므로 회전을 그대로 받는다.
      if (tilted) {
        pushGeneric(b, new THREE.CylinderGeometry(r, r, trimU(2), 16, 1), spec, size, fallback, false);
        break;
      }
      b.cyl(r, r, trimU(2), 16, x, y, z, fam, color, num(spec.ry), false);
      break;
    }
    case 'ledge':
      b.box(num(spec.w, 1) * S, trimU(2), num(spec.d, 1) * S, x, y, z, fam, color, num(spec.ry), BEVEL_S);
      break;
    case 'cren': {
      const n = Math.max(3, Math.min(32, Math.round(num(spec.n, 8))));
      const half = num(spec.half, 1) * S;
      const wm = PANEL_GRID * 0.5 * Math.min(1, S / 1.35);   // 총안 폭은 물건 크기를 따라간다
      for (let i = 0; i < n; i++) {
        let cx, cz, cry;
        if (spec.sq) {
          const t = (i / n) * 4;
          const side = Math.floor(t), f = (t - side) * 2 - 1;
          if (side === 0) { cx = f * half; cz = half; cry = 0; }
          else if (side === 1) { cx = half; cz = -f * half; cry = Math.PI / 2; }
          else if (side === 2) { cx = -f * half; cz = -half; cry = 0; }
          else { cx = -half; cz = f * half; cry = Math.PI / 2; }
        } else {
          const a = (i / n) * Math.PI * 2;
          cx = Math.cos(a) * half; cz = Math.sin(a) * half; cry = Math.PI / 2 - a;
        }
        b.box(wm, trimU(4.5), wm * 0.7, x + cx, y + trimU(2.25), z + cz, fam, color, cry, BEVEL_S);
      }
      break;
    }
    case 'flag':
      b.flag(x, y, z, num(spec.h, 1) * S);
      break;
    default:
      break;   // 규격 밖 종류는 없는 셈 친다 — 하나가 틀려도 나머지는 선다
  }
}

function emitWing(b, side, y, z, fam, color, span) {
  const s = side < 0 ? -1 : 1;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0, s * span, span * 0.24, -span * 0.20, s * span * 0.78, -span * 0.05, span * 0.40,
    0, 0, 0, s * span * 0.78, -span * 0.05, span * 0.40, s * span * 0.35, -span * 0.11, span * 0.56,
  ], 3));
  geo.computeVertexNormals();
  b.push(geo, fam, color, M4().compose(V3(0, y, z), QE(-0.12, 0, -s * 0.10), V3(1, 1, 1)), true);
}

/* ══════════════════════════════════════════════════════════════════
   5. 진입점
   ══════════════════════════════════════════════════════════════════ */

/**
 * blueprint 한 벌을 Assembly 에 굽는다.
 * @param b        Assembly
 * @param size     기준 단위 (부품 수치는 전부 이 값의 배수다)
 * @param bp       { h, rad, float?, p: [...] }
 * @param opts     { form, variant, seed }
 * @returns        true 면 구웠고, false 면 blueprint 가 없어 폴백 생성기로 가야 한다
 */
export function buildFromBlueprint(b, size, bp, opts = {}) {
  if (!bp || !Array.isArray(bp.p) || bp.p.length === 0) return false;
  const meta = { h: num(bp.h, 4), rad: num(bp.rad, 2) };
  const seed = String(opts.seed || 'bp');

  let specs = expandBlueprint(bp);
  const fxName = FORM_FX_BY_CATEGORY[opts.category + '|' + opts.form]
    || FORM_FX_BY_ID[opts.form] || 'identity';
  const fx = FORM_FX[fxName] || FORM_FX.identity;
  specs = fx(specs, meta, seed) || specs;
  // 변형이 rep 를 얹은 부품을 새로 넣을 수 있다 — 한 번 더 펼친다
  specs = specs.flatMap((spec) => expandRepeat(spec));
  specs = applyVariant(specs, opts.variant);

  for (const spec of specs) emitPart(b, spec, size);

  b.height = meta.h * size;
  b.radius = meta.rad * size;
  // bp.float 은 조형도 작성 규약(부품 y 를 공중에 둔다)의 표시일 뿐, 여기서 따로 할 일은 없다 —
  // 부품이 이미 그 높이에 서 있고, 도감의 진열 배율도 h·rad 만 본다.
  return true;
}

/* 규격 어휘 — 검증기(scripts 쪽 validate.mjs)와 도구가 같은 표를 보게 내보낸다.
   조형도의 정적 점검은 그쪽 하나뿐이다. 여기에 두 번째 검사기를 두면 곧 서로 어긋난다. */
export const BLUEPRINT_PART_KINDS = Object.freeze(Object.keys(DEFAULTS));
export const BLUEPRINT_MATERIALS = Object.freeze(Object.keys(FAM_BY_KEY));
export const BLUEPRINT_COLORS = Object.freeze(Object.keys(C));
