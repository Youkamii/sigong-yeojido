// app/landmarks.js — placeType 별 모듈러 구조물 생성기 (정본: docs/03-art-bible.md)
//
// 설계 규약
//   · P1  큰 덩어리부터: primary 1 + secondary 2~3 + tertiary 디테일, 크기는 SILHOUETTE_RATIO(massOf).
//   · P3  기단/몸통/지붕/트림/개구부를 **분리해서** 조립한다. 면이 서로 관통하며 끝나지 않도록
//         모든 연결부에 트림 밴드·레지·베벨을 넣는다 (관통 마감 금지).
//   · P5  표면 라인은 PANEL_GRID 격자와 하중 흐름을 따른다. 무작위 그리블 금지.
//   · P7  랜드마크는 주변 대비 LANDMARK_SCALE(1.6~2.2배)로 과장한다 — 중요할수록 크게.
//   · P2  중요도 3티어 — A(상위 15%) 풀 디테일 / B 실루엣+주요 트림 / C 실루엣만.
//   · §5  전 장소의 파트를 **재질 계열별로 하나씩** 병합해 굽는다 (계열 8 + 깃발 1 = 최대 9 드로우콜).
//
// 색·베벨·비례 상수는 artbible.js 토큰과 그 연산에서만 온다 (P8). 이 파일에 hex 리터럴은 없다.
import * as THREE from 'three';
import { mergeGeometries } from '../vendor/utils/BufferGeometryUtils.js';
import { rngFor, lerp, mixColor, ensureVertexColors } from './util.js';
import { makeSurface, factionColor } from './style.js';
import { fillVertexTimeIndex, setInstanceTimeIndex } from './timetravel.js';
import {
  BEVEL_S, BEVEL_M, BEVEL_L, PANEL_GRID, TAPER,
  DETAIL_TIERS, LANDMARK_SCALE, STRUCT, FOLIAGE, MYSTIC, SURFACE, WATER, BAND as ART_BAND,
  trim as trimU, massOf, WHITE,
} from './artbible.js';

/* ══════════════════════════════════════════════════════════════════
   0. 재질 계열 — 색이 아니라 빛 반응으로 나뉜다 (P4)
   ══════════════════════════════════════════════════════════════════ */
export const FAMILY = Object.freeze({
  STONE: 'stone',        // MAT_STONE        — 성벽·기단·벽체
  ROCK_WET: 'rockwet',   // MAT_ROCK_WET     — 물가 암반 (clearcoat)
  TIMBER: 'timber',      // MAT_TIMBER       — 목구조·지붕널
  IRON: 'iron',          // MAT_METAL_IRON   — 철물·무기
  GOLD: 'gold',          // MAT_METAL_GOLD   — 왕관·첨정 (화면 5% 이하)
  LEATHER: 'leather',    // MAT_LEATHER      — 가죽 끈·장구
  FOLIAGE: 'foliage',    // MAT_FOLIAGE      — 수관
  CRYSTAL: 'crystal',    // MAT_GLASS_ARCANE — 아케인 결정
});

export const FAMILY_ORDER = [
  FAMILY.STONE, FAMILY.ROCK_WET, FAMILY.TIMBER, FAMILY.IRON,
  FAMILY.GOLD, FAMILY.LEATHER, FAMILY.FOLIAGE, FAMILY.CRYSTAL,
];

const FAMILY_PRESET = Object.freeze({
  [FAMILY.STONE]: 'MAT_STONE',
  [FAMILY.ROCK_WET]: 'MAT_ROCK_WET',
  [FAMILY.TIMBER]: 'MAT_TIMBER',
  [FAMILY.IRON]: 'MAT_METAL_IRON',
  [FAMILY.GOLD]: 'MAT_METAL_GOLD',
  [FAMILY.LEATHER]: 'MAT_LEATHER',
  [FAMILY.FOLIAGE]: 'MAT_FOLIAGE',
  [FAMILY.CRYSTAL]: 'MAT_GLASS_ARCANE',
});

/** 역할색 — 전부 artbible 토큰(또는 토큰 연산) */
const C = {
  base: new THREE.Color(STRUCT.STONE_DARK),
  body: new THREE.Color(STRUCT.STONE),
  bodyMid: new THREE.Color(STRUCT.STONE_MID),
  mortar: new THREE.Color(STRUCT.MORTAR),
  trim: new THREE.Color(STRUCT.TRIM),
  timber: new THREE.Color(STRUCT.TIMBER),
  timberLt: new THREE.Color(STRUCT.TIMBER_LIGHT),
  roof: new THREE.Color(STRUCT.ROOF),
  roofAlt: new THREE.Color(STRUCT.ROOF_ALT),
  iron: new THREE.Color(STRUCT.IRON),
  steel: new THREE.Color(STRUCT.STEEL),
  gold: new THREE.Color(STRUCT.GOLD),
  trunk: new THREE.Color(FOLIAGE.TRUNK),
  trunkDark: new THREE.Color(FOLIAGE.TRUNK_DARK),
  canopyLow: new THREE.Color(FOLIAGE.CANOPY_LOW),
  canopyHi: new THREE.Color(FOLIAGE.CANOPY_HI),
  leafHi: new THREE.Color(FOLIAGE.LEAF_HI),
  reed: new THREE.Color(FOLIAGE.REED),
  crystalA: new THREE.Color(MYSTIC.CRYSTAL_A),
  crystalB: new THREE.Color(MYSTIC.CRYSTAL_B),
  strata: new THREE.Color(SURFACE.STRATA_TOP),
  strataMid: new THREE.Color(SURFACE.STRATA_MID),
  snow: new THREE.Color(ART_BAND.SNOW),
  rock: new THREE.Color(ART_BAND.ROCK),
  cliff: new THREE.Color(ART_BAND.CLIFF),
  deepWater: new THREE.Color(WATER.DEEP),
  banner: new THREE.Color(STRUCT.BANNER_DEFAULT),
};
export const ASSET_COLOR = C;

/** uv 투영 단위 — 월드 좌표 기준 텍셀 밀도를 고정한다 (PANEL_GRID 파생) */
const UV_UNIT = PANEL_GRID * 3;

const M4 = () => new THREE.Matrix4();
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const QY = (ry) => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0));
/** 방위각 a 쪽을 바라보는 회전 (three 의 +Z 가 정면) */
const facing = (a) => Math.PI / 2 - a;

/* ══════════════════════════════════════════════════════════════════
   1. 지오메트리 원시형 — 날 선 90° 모서리 금지 (§1.2)
   ══════════════════════════════════════════════════════════════════ */

/**
 * 챔퍼 박스 — 모든 모서리가 BEVEL 토큰만큼 깎여 빛을 받는다.
 * 6 면 + 12 모서리 + 8 코너 = 44 삼각형. 삼각형마다 평면이라 면 노멀이 정확하다.
 */
export function chamferBox(w, h, d, bev = BEVEL_M) {
  const b = Math.max(1e-4, Math.min(bev, w * 0.3, h * 0.3, d * 0.3));
  const X = w / 2, Y = h / 2, Z = d / 2;
  const xi = X - b, yi = Y - b, zi = Z - b;
  const A = (sx, sy, sz) => [sx * X, sy * yi, sz * zi];    // ±X 면
  const B = (sx, sy, sz) => [sx * xi, sy * Y, sz * zi];    // ±Y 면
  const D = (sx, sy, sz) => [sx * xi, sy * yi, sz * Z];    // ±Z 면

  const pos = [], nrm = [];
  const tri = (p0, p1, p2) => {
    const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2];
    const vx = p2[0] - p0[0], vy = p2[1] - p0[1], vz = p2[2] - p0[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const cx = (p0[0] + p1[0] + p2[0]) / 3, cy = (p0[1] + p1[1] + p2[1]) / 3, cz = (p0[2] + p1[2] + p2[2]) / 3;
    let a = p0, bb = p1, c = p2;
    if (nx * cx + ny * cy + nz * cz < 0) { bb = p2; c = p1; nx = -nx; ny = -ny; nz = -nz; }
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len; ny /= len; nz /= len;
    pos.push(a[0], a[1], a[2], bb[0], bb[1], bb[2], c[0], c[1], c[2]);
    for (let i = 0; i < 3; i++) nrm.push(nx, ny, nz);
  };
  const quad = (p0, p1, p2, p3) => { tri(p0, p1, p2); tri(p0, p2, p3); };

  for (const s of [1, -1]) {
    quad(A(s, 1, 1), A(s, 1, -1), A(s, -1, -1), A(s, -1, 1));
    quad(B(1, s, 1), B(1, s, -1), B(-1, s, -1), B(-1, s, 1));
    quad(D(1, 1, s), D(1, -1, s), D(-1, -1, s), D(-1, 1, s));
  }
  for (const sx of [1, -1]) {
    for (const sy of [1, -1]) quad(A(sx, sy, 1), A(sx, sy, -1), B(sx, sy, -1), B(sx, sy, 1));
    for (const sz of [1, -1]) quad(A(sx, 1, sz), A(sx, -1, sz), D(sx, -1, sz), D(sx, 1, sz));
  }
  for (const sy of [1, -1]) {
    for (const sz of [1, -1]) quad(B(1, sy, sz), B(-1, sy, sz), D(-1, sy, sz), D(1, sy, sz));
  }
  for (const sx of [1, -1]) {
    for (const sy of [1, -1]) {
      for (const sz of [1, -1]) tri(A(sx, sy, sz), B(sx, sy, sz), D(sx, sy, sz));
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  return g;
}

/** 사각 샤프트 — 아래가 넓고 위가 좁은 챔퍼 기둥 (TAPER 의 조형) */
export function taperedShaft(wBottom, wTop, h, bev = BEVEL_M) {
  const g = chamferBox(wBottom, h, wBottom, bev);
  const p = g.getAttribute('position');
  const k = wTop / wBottom;
  for (let i = 0; i < p.count; i++) {
    const t = (p.getY(i) + h / 2) / h;
    const s = lerp(1, k, t);
    p.setX(i, p.getX(i) * s);
    p.setZ(i, p.getZ(i) * s);
  }
  g.computeVertexNormals();
  return g;
}

/** 박공 지붕 — 마룻대가 x 축을 따른다. 밑면을 닫아 속이 비쳐 보이지 않게 한다. */
export function gableRoof(w, h, d) {
  const X = w / 2, Z = d / 2;
  const pos = [], nrm = [];
  const tri = (p0, p1, p2) => {
    const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2];
    const vx = p2[0] - p0[0], vy = p2[1] - p0[1], vz = p2[2] - p0[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz) || 1;
    pos.push(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
    for (let i = 0; i < 3; i++) nrm.push(nx / len, ny / len, nz / len);
  };
  const rA = [-X, h, 0], rB = [X, h, 0];
  const c0 = [-X, 0, -Z], c1 = [X, 0, -Z], c2 = [X, 0, Z], c3 = [-X, 0, Z];
  tri(c3, c2, rB); tri(c3, rB, rA);        // +Z 경사면
  tri(c1, c0, rA); tri(c1, rA, rB);        // -Z 경사면
  tri(c0, c3, rA);                          // -X 박공
  tri(c2, c1, rB);                          // +X 박공
  tri(c0, c1, c2); tri(c0, c2, c3);         // 밑면
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  return g;
}

/** 삼각형 단위 uv 투영 — 월드 좌표 기준이라 병합해도 텍셀 밀도가 이어진다 */
function projectUV(geo, unit) {
  const p = geo.getAttribute('position');
  const n = geo.getAttribute('normal');
  const uv = new Float32Array(p.count * 2);
  for (let t = 0; t + 2 < p.count; t += 3) {
    let nx = 0, ny = 0, nz = 0;
    for (let k = 0; k < 3; k++) { nx += n.getX(t + k); ny += n.getY(t + k); nz += n.getZ(t + k); }
    const ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
    for (let k = 0; k < 3; k++) {
      const x = p.getX(t + k), y = p.getY(t + k), z = p.getZ(t + k);
      let u, v;
      if (ay >= ax && ay >= az) { u = x; v = z; }
      else if (ax >= az) { u = z; v = y; }
      else { u = x; v = y; }
      uv[(t + k) * 2] = u / unit;
      uv[(t + k) * 2 + 1] = v / unit;
    }
  }
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return geo;
}

/**
 * 파트 하나를 월드 좌표로 굽는다 — position/normal/uv/color 만 남긴 non-indexed.
 * `part.timeSlot` 이 있으면 시간 여행(#14)용 칸 번호를 정점마다 함께 굽는다 —
 * 병합해도 어느 장소의 벽인지 알 수 있어야 그 장소만 디졸브할 수 있다.
 */
export function bakePart(part) {
  const src = part.geo;
  const g = src.index ? src.toNonIndexed() : src.clone();
  if (part.matrix) g.applyMatrix4(part.matrix);
  if (part.flat || !g.getAttribute('normal')) g.computeVertexNormals();
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', g.getAttribute('position').clone());
  out.setAttribute('normal', g.getAttribute('normal').clone());
  projectUV(out, UV_UNIT);
  const cnt = out.getAttribute('position').count;
  const col = new Float32Array(cnt * 3);
  const c = part.color || C.body;
  for (let i = 0; i < cnt; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  if (part.timeSlot != null) fillVertexTimeIndex(out, part.timeSlot);
  g.dispose();
  src.dispose();
  return out;
}

/**
 * mergeGeometries 가 거부할 때의 안전망 — 같은 레이아웃끼리 이어 붙인다.
 * `aTimeIdx`(시간 여행 칸 번호)도 함께 옮긴다 — 여기서 빠뜨리면 폴백 경로에서만
 * 속성이 사라져 전 랜드마크가 0번 칸을 따라가는 조용한 버그가 된다.
 */
function concatGeos(list) {
  let total = 0;
  for (const g of list) total += g.getAttribute('position').count;
  const pos = new Float32Array(total * 3), nrm = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2), col = new Float32Array(total * 3);
  const hasTime = list.length > 0 && !!list[0].getAttribute('aTimeIdx');
  const tim = hasTime ? new Float32Array(total) : null;
  let o = 0;
  for (const g of list) {
    const p = g.getAttribute('position'), n = g.getAttribute('normal');
    const t = g.getAttribute('uv'), c = g.getAttribute('color');
    const ti = hasTime ? g.getAttribute('aTimeIdx') : null;
    for (let i = 0; i < p.count; i++) {
      const j = o + i;
      pos[j * 3] = p.getX(i); pos[j * 3 + 1] = p.getY(i); pos[j * 3 + 2] = p.getZ(i);
      nrm[j * 3] = n.getX(i); nrm[j * 3 + 1] = n.getY(i); nrm[j * 3 + 2] = n.getZ(i);
      uv[j * 2] = t.getX(i); uv[j * 2 + 1] = t.getY(i);
      col[j * 3] = c.getX(i); col[j * 3 + 1] = c.getY(i); col[j * 3 + 2] = c.getZ(i);
      if (tim) tim[j] = ti ? ti.getX(i) : 0;
    }
    o += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  if (tim) out.setAttribute('aTimeIdx', new THREE.BufferAttribute(tim, 1));
  return out;
}

export function mergeBucket(list) {
  let geo = null;
  try { geo = mergeGeometries(list, false); } catch (e) { geo = null; }
  if (!geo) geo = concatGeos(list);
  for (const g of list) g.dispose();
  return geo;
}

/* ══════════════════════════════════════════════════════════════════
   2. 조립기 — 기단/몸통/지붕/트림/개구부를 분리해서 쌓는다 (P3)
   ══════════════════════════════════════════════════════════════════ */

export class Assembly {
  constructor(rng, tier) {
    this.rng = rng;
    this.tier = tier;              // 'A' | 'B' | 'C'
    this.parts = [];
    this.flags = [];
    this.height = 4;
    this.radius = 3;
  }

  get full() { return this.tier === 'A'; }
  get mid() { return this.tier === 'A' || this.tier === 'B'; }

  push(geo, fam, color, matrix, flat) {
    this.parts.push({ geo, fam, color, matrix, flat: !!flat });
    return this;
  }

  /** 챔퍼 박스 (기단·벽체·트림의 기본 단위) */
  box(w, h, d, x, y, z, fam, color, ry = 0, bev = BEVEL_M) {
    return this.push(chamferBox(w, h, d, bev), fam, color,
      M4().compose(V3(x, y, z), QY(ry), V3(1, 1, 1)), false);
  }

  /** 원기둥 — rTop < rBottom 이면 TAPER (중력의 설득력) */
  cyl(rBottom, rTop, h, seg, x, y, z, fam, color, ry = 0, flat = false) {
    return this.push(new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1), fam, color,
      M4().compose(V3(x, y, z), QY(ry), V3(1, 1, 1)), flat);
  }

  cone(r, h, seg, x, y, z, fam, color, ry = 0, flat = true) {
    return this.push(new THREE.ConeGeometry(r, h, seg, 1), fam, color,
      M4().compose(V3(x, y, z), QY(ry), V3(1, 1, 1)), flat);
  }

  /** 기울고 굴러다니는 덩어리 (바위·낙석) */
  chunk(r, x, y, z, fam, color, ex, ey, ez, sx = 1.3, sy = 0.85, sz = 1.15) {
    return this.push(new THREE.IcosahedronGeometry(r, 0), fam, color,
      M4().compose(V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(ex, ey, ez)), V3(sx, sy, sz)), true);
  }

  /** 트림 링 — 원형 이음매를 덮는다 (P3) */
  band(r, y, fam = FAMILY.STONE, color = C.trim, seg = 16, mult = 2) {
    return this.cyl(r, r, trimU(mult), seg, 0, y, 0, fam, color);
  }

  /** 사각 레지 — 박스 몸통의 이음매를 덮는다 */
  ledge(w, d, y, fam = FAMILY.STONE, color = C.trim, mult = 2, ry = 0) {
    return this.box(w, trimU(mult), d, 0, y, 0, fam, color, ry, BEVEL_S);
  }

  gable(w, h, d, x, y, z, fam, color, ry = 0) {
    return this.push(gableRoof(w, h, d), fam, color, M4().compose(V3(x, y, z), QY(ry), V3(1, 1, 1)), true);
  }

  /**
   * 개구부 — 문·창. 벽면보다 안쪽으로 물러난 어두운 판 + 사방 트림 프레임.
   * 벽을 뚫지 않고 "끼워 넣은" 조립으로 표현한다 (관통 마감 금지).
   * @param ry  개구부가 바라보는 방향 (three 의 +Z 가 정면)
   */
  opening(w, h, x, y, z, ry, tone = C.mortar, frameFam = FAMILY.STONE) {
    const nx = Math.sin(ry), nz = Math.cos(ry);
    const dep = trimU(1.4);
    this.push(chamferBox(w, h, dep, BEVEL_S), FAMILY.STONE, tone,
      M4().compose(V3(x - nx * dep * 0.35, y, z - nz * dep * 0.35), QY(ry), V3(1, 1, 1)), false);
    const t = trimU(1.5);
    const fx = x + nx * dep * 0.35, fz = z + nz * dep * 0.35;
    const tx = Math.cos(ry), tz = -Math.sin(ry);   // 벽면 접선
    for (const s of [1, -1]) {
      this.push(chamferBox(t, h + t * 2, t, BEVEL_S), frameFam, C.trim,
        M4().compose(V3(fx + tx * s * (w / 2 + t / 2), y, fz + tz * s * (w / 2 + t / 2)), QY(ry), V3(1, 1, 1)), false);
      this.push(chamferBox(w + t * 2, t, t, BEVEL_S), frameFam, C.trim,
        M4().compose(V3(fx, y + s * (h / 2 + t / 2), fz), QY(ry), V3(1, 1, 1)), false);
    }
    return this;
  }

  /** 흉벽 — 총안이 뚫린 성벽 상단 (성의 형태 근거는 방어다) */
  crenellation(y, count, half, fam = FAMILY.STONE, color = C.bodyMid, square = false) {
    const wm = PANEL_GRID * 0.5;
    for (let i = 0; i < count; i++) {
      let x, z, ry;
      if (square) {
        const t = (i / count) * 4;
        const side = Math.floor(t), f = (t - side) * 2 - 1;
        if (side === 0) { x = f * half; z = half; ry = 0; }
        else if (side === 1) { x = half; z = -f * half; ry = Math.PI / 2; }
        else if (side === 2) { x = -f * half; z = -half; ry = 0; }
        else { x = -half; z = f * half; ry = Math.PI / 2; }
      } else {
        const a = (i / count) * Math.PI * 2;
        x = Math.cos(a) * half; z = Math.sin(a) * half; ry = facing(a);
      }
      this.box(wm, trimU(4.5), wm * 0.7, x, y + trimU(2.25), z, fam, color, ry, BEVEL_S);
    }
    return this;
  }

  /** 깃대는 구조물에 합치고, 천은 좌표만 모은다 (전 장소의 깃발이 인스턴스 하나로 모인다) */
  flag(x, y, z, h) {
    this.cyl(BEVEL_M, BEVEL_M * 0.8, h, 6, x, y + h / 2, z, FAMILY.IRON, C.iron);
    this.cyl(BEVEL_L * 0.8, BEVEL_S, trimU(3), 6, x, y + h + trimU(1.5), z, FAMILY.GOLD, C.gold);
    this.flags.push({ x, y: y + h - trimU(8), z });
    return this;
  }
}

const rng = (b) => b.rng;

/* ══════════════════════════════════════════════════════════════════
   3. placeType 10종 생성기 — 형태는 장식이 아니라 근거에서 나온다 (P1)
   ══════════════════════════════════════════════════════════════════ */

/** 성 — 방어의 논리: 두꺼운 하부, 좁은 상부, 흉벽, 모서리 탑, 성문 */
function buildCastle(b, S) {
  const r = rng(b);
  const P = S;
  const SEC = massOf(S, 1);
  const TER = massOf(S, 2);

  // ── 기단 2단 (아래가 넓다) + 상단 코니스
  const p1 = trimU(7), p2 = trimU(8);
  if (b.mid) {
    b.cyl(P * 1.16, P * 1.10, p1, 16, 0, p1 / 2, 0, FAMILY.STONE, C.base);
    b.cyl(P * 1.06, P * 1.00, p2, 16, 0, p1 + p2 / 2, 0, FAMILY.STONE, C.bodyMid);
  } else {
    // Tier C — 두 단을 한 덩어리로. 실루엣은 그대로고 파트만 절반이다 (P2 의도적 여백)
    b.cyl(P * 1.16, P * 1.00, p1 + p2, 16, 0, (p1 + p2) / 2, 0, FAMILY.STONE, C.base);
  }
  b.band(P * 1.06, p1 + p2, FAMILY.STONE, C.trim, 16, 2);      // 기단↔몸통 이음 트림 (P3, 티어 무관)
  const y0 = p1 + p2 - trimU(1);           // 몸통은 기단 안으로 조금 내려 앉는다

  // ── 몸통(킵) 2단 — 위가 좁다 (TAPER)
  // P2: Tier C 는 **실루엣만** — 기단 코니스(위)만 남기고 레지·흉벽 같은 tertiary 는 내보낸다.
  const kw = P * 0.98, kd = P * 0.88, kh = P * 1.22;
  // 이음 레지를 뺀 티어에서는 윗단이 아랫단 위에 바로 앉는다 (레지 두께만큼 뜨면 안 된다)
  const joint = b.mid ? trimU(1) : 0;
  b.box(kw, kh, kd, 0, y0 + kh / 2, 0, FAMILY.STONE, C.body, 0, BEVEL_M);
  if (b.mid) b.ledge(kw + trimU(2), kd + trimU(2), y0 + kh, FAMILY.STONE, C.trim, 2);
  const kw2 = kw * TAPER, kd2 = kd * TAPER, kh2 = P * 0.72;
  b.box(kw2, kh2, kd2, 0, y0 + kh + joint + kh2 / 2, 0, FAMILY.STONE, C.body, 0, BEVEL_M);
  const topY = y0 + kh + joint + kh2;
  if (b.mid) {
    b.ledge(kw2 + trimU(3), kd2 + trimU(3), topY, FAMILY.STONE, C.trim, 3);
    // 총안 16개는 근거리에서만 읽히는 tertiary 다 — Tier C 에는 있어선 안 된다
    b.crenellation(topY + trimU(1.5), 16, (kw2 + trimU(3)) / 2 - PANEL_GRID * 0.22,
      FAMILY.STONE, C.bodyMid, true);
  }

  // ── 지붕 — 킵 중앙의 첨탑. 첨정의 금은 깃대 머리 하나로 끝낸다 (금 5% 이하)
  // crown = 흉벽 띠의 두께. 흉벽이 없는 티어에서는 첨탑이 킵 위에 바로 선다.
  const crown = b.mid ? trimU(3) : 0;
  const spire = P * 0.78;
  b.cone(kw2 * 0.5, spire, 8, 0, topY + crown + spire / 2, 0, FAMILY.TIMBER, C.roof, Math.PI / 8);

  // ── 모서리 탑 (secondary) — TAPER + 원뿔 지붕 + 이음 트림
  const towers = b.full ? 4 : b.mid ? 3 : 2;
  const tRing = P * 0.98;
  for (let i = 0; i < towers; i++) {
    const a = (i / towers) * Math.PI * 2 + Math.PI / 4;
    const tx = Math.cos(a) * tRing, tz = Math.sin(a) * tRing;
    const th = SEC * (1.5 + r() * 0.4);
    const tr = SEC * 0.32;
    // 기단에서 몸통까지 이어지는 받침 — 사이가 뜨면 탑이 공중에 선다 (티어와 무관하게 필수)
    const socleH = y0 + trimU(1) - p1;
    b.cyl(tr * 1.2, tr * 1.12, socleH, 12, tx, p1 + socleH / 2, tz, FAMILY.STONE, C.base);
    b.cyl(tr, tr * TAPER, th, 12, tx, y0 + th / 2, tz, FAMILY.STONE, C.body);
    if (b.mid) b.cyl(tr * 1.16, tr * 1.16, trimU(3), 12, tx, y0 + th, tz, FAMILY.STONE, C.trim);
    const capY = y0 + th + (b.mid ? trimU(1.5) : 0);          // 이음 링이 없으면 지붕이 바로 앉는다
    b.cone(tr * 1.34, th * 0.5, 12, tx, capY + th * 0.25, tz, FAMILY.TIMBER, C.roofAlt);
    if (b.mid) {
      b.opening(TER * 0.2, TER * 0.42, tx + Math.cos(a) * tr * 0.96, y0 + th * 0.58, tz + Math.sin(a) * tr * 0.96, facing(a));
    }
  }

  // ── 개구부 — 성문 + 창
  if (b.mid) {
    b.opening(P * 0.34, P * 0.56, 0, y0 + P * 0.28, kd / 2, 0, C.mortar, FAMILY.IRON);
    if (b.full) {
      for (const s of [-1, 1]) {
        b.opening(TER * 0.26, TER * 0.54, s * kw * 0.28, y0 + kh * 0.7, kd / 2, 0);
        b.opening(TER * 0.26, TER * 0.54, s * kw / 2, y0 + kh * 0.7, s * kd * 0.26, s > 0 ? Math.PI / 2 : -Math.PI / 2);
      }
      // 외곽 방벽 — 기단 밖 낮은 벽 (모서리마다 짧게 끊어 조립 논리를 보인다)
      const wn = 12, wr = P * 1.42, wh = TER * 0.62;
      for (let i = 0; i < wn; i++) {
        if (i % 4 === 0) continue;                     // 성문·통로 자리
        const a = (i / wn) * Math.PI * 2;
        b.box(PANEL_GRID * 1.15, wh + trimU(4), PANEL_GRID * 0.4,
          Math.cos(a) * wr, wh / 2 - trimU(2), Math.sin(a) * wr, FAMILY.STONE, C.base, facing(a), BEVEL_S);
      }
    }
  }
  b.flag(0, topY + crown + spire, 0, P * 0.62);         // 첨탑 꼭대기에 선다 (관통 없음)
  b.height = topY + crown + spire + P * 0.62;
  b.radius = P * 1.45;
}

/** 왕국 — 영역 표지 오벨리스크 (아트 바이블 §3) */
function buildKingdom(b, S) {
  const r = rng(b);
  const P = S;
  const base = P * 0.9;
  // P2 — Tier C 의 기단은 계단 3단이 아니라 한 덩어리다 (실루엣만)
  const steps = b.mid ? 3 : 1;
  for (let i = 0; i < steps; i++) {
    const w = base * (1.5 - i * 0.22), h = trimU(15) / steps;
    b.box(w, h, w, 0, h * (i + 0.5), 0, FAMILY.STONE, i === 1 ? C.bodyMid : C.base, 0, BEVEL_M);
  }
  const y0 = trimU(15);
  b.ledge(base * 1.1, base * 1.1, y0 - trimU(1), FAMILY.STONE, C.trim, 2);   // 기단↔샤프트 이음 (P3)

  const h1 = P * 1.55, h2 = P * 1.15;
  const w1 = base * 0.58, w2 = w1 * TAPER, w3 = w2 * TAPER;
  b.push(taperedShaft(w1, w2, h1, BEVEL_M), FAMILY.STONE, C.body,
    M4().makeTranslation(0, y0 + h1 / 2, 0), false);
  if (b.mid) b.ledge(w2 + trimU(2), w2 + trimU(2), y0 + h1, FAMILY.STONE, C.trim, 1.5);
  b.push(taperedShaft(w2, w3, h2, BEVEL_M), FAMILY.STONE, C.body,
    M4().makeTranslation(0, y0 + h1 + trimU(1) + h2 / 2, 0), false);
  const top = y0 + h1 + trimU(1) + h2;
  b.cone(w3 * 0.76, P * 0.44, 4, 0, top + P * 0.22, 0, FAMILY.GOLD, C.gold, Math.PI / 4);

  // 면 패널 라인 — 하중 방향(수직)을 설명하는 얕은 띠 (Tier A)
  if (b.full) {
    for (let i = 1; i <= 3; i++) {
      const y = y0 + (h1 * i) / 4;
      const wq = lerp(w1, w2, i / 4);
      for (const s of [1, -1]) {
        b.box(wq * 0.46, trimU(1), trimU(1), 0, y, s * (wq / 2), FAMILY.GOLD, C.trim, 0, BEVEL_S);
        b.box(trimU(1), trimU(1), wq * 0.46, s * (wq / 2), y, 0, FAMILY.GOLD, C.trim, 0, BEVEL_S);
      }
    }
  }
  const stones = b.full ? 6 : b.mid ? 5 : 3;
  for (let i = 0; i < stones; i++) {
    const a = (i / stones) * Math.PI * 2 + 0.3;
    const hh = massOf(P, 2) * (0.9 + r() * 0.5);
    b.box(PANEL_GRID * 0.5, hh, PANEL_GRID * 0.38,
      Math.cos(a) * base * 1.7, hh / 2, Math.sin(a) * base * 1.7, FAMILY.STONE, C.base, facing(a), BEVEL_M);
  }
  b.flag(base * 0.6, trimU(15), base * 0.6, P * 0.72);
  if (b.mid) b.flag(-base * 0.6, trimU(15), -base * 0.6, P * 0.72);
  b.height = top + P * 0.44;
  b.radius = base * 1.9;
}

/** 도시 — 생활의 논리: 대성당 + 집 군집 + 성벽 */
function buildCity(b, S) {
  const r = rng(b);
  const P = S;
  const SEC = massOf(S, 1);
  // 대성당: 기단 → 네이브 → 레지 → 박공 지붕
  b.box(P * 1.12, trimU(5), P * 0.86, 0, trimU(2.5), 0, FAMILY.STONE, C.base, 0, BEVEL_M);
  const nav = P * 0.82, navD = P * 0.62;
  b.box(nav, P * 0.8, navD, 0, trimU(4) + P * 0.4, 0, FAMILY.STONE, C.body, 0, BEVEL_M);
  const navTop = trimU(4) + P * 0.8;
  b.ledge(nav + trimU(2), navD + trimU(2), navTop, FAMILY.STONE, C.trim, 2);
  b.gable(nav * 1.14, P * 0.44, navD * 1.2, 0, navTop + trimU(1), 0, FAMILY.TIMBER, C.roof);

  // 종탑 (secondary) — 네이브 **밖에** 세우고 버트레스로 잇는다 (면 관통 금지)
  const bh = P * 1.05, br = SEC * 0.3;
  const bx = -(nav / 2 + br * 0.92), bz = 0;
  const linkR = -nav / 2 + trimU(1);
  b.box(linkR - bx, P * 0.52, br * 1.5, (bx + linkR) / 2, trimU(4) + P * 0.26, bz,
    FAMILY.STONE, C.bodyMid, 0, BEVEL_S);
  b.cyl(br * 1.2, br * 1.14, trimU(5), 10, bx, trimU(2.5), bz, FAMILY.STONE, C.base);
  b.cyl(br, br * TAPER, bh, 10, bx, trimU(4) + bh / 2, bz, FAMILY.STONE, C.body);
  const bellY = trimU(4) + bh;
  b.cyl(br * 1.16, br * 1.16, trimU(3), 10, bx, bellY, bz, FAMILY.STONE, C.trim);
  b.cone(br * 1.4, P * 0.62, 10, bx, bellY + trimU(1.5) + P * 0.31, bz, FAMILY.TIMBER, C.roofAlt);
  const spireTop = bellY + trimU(1.5) + P * 0.62;

  if (b.mid) {
    b.opening(P * 0.24, P * 0.42, 0, trimU(4) + P * 0.22, navD / 2, 0, C.mortar, FAMILY.IRON);
    b.opening(br * 0.5, br * 0.9, bx, bellY - P * 0.16, bz + br, 0);
  }
  // 집 군집
  const n = b.full ? 9 : b.mid ? 6 : 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.5;
    const rr = P * (1.1 + r() * 0.55);
    house(b, Math.cos(a) * rr, Math.sin(a) * rr, facing(a), massOf(S, 2) * (0.9 + r() * 0.4), i % 3 === 0);
  }
  // 성벽 + 문루
  if (b.mid) {
    const wn = 14, wr = P * 1.95, wh = SEC * 0.6;
    for (let i = 0; i < wn; i++) {
      if (i === 0) continue;
      const a = (i / wn) * Math.PI * 2;
      b.box(PANEL_GRID * 1.05, wh + trimU(4), PANEL_GRID * 0.36,
        Math.cos(a) * wr, wh / 2 - trimU(2), Math.sin(a) * wr, FAMILY.STONE, C.base, facing(a), BEVEL_S);
    }
    for (const s of [-1, 1]) {
      const a = s * 0.26;
      b.cyl(SEC * 0.2, SEC * 0.18, wh * 1.55, 10, Math.cos(a) * wr, wh * 0.775 - trimU(2), Math.sin(a) * wr,
        FAMILY.STONE, C.bodyMid);
    }
    b.flag(wr, wh * 1.55 - trimU(2), 0, SEC * 0.75);
  }
  b.flag(bx, spireTop, bz, P * 0.5);
  b.height = spireTop + P * 0.5;
  b.radius = P * 2.15;
}

/** 마을 — 생활의 논리: 소가옥·굴뚝·우물·울타리 */
function buildVillage(b, S) {
  const r = rng(b);
  const n = b.full ? 6 : b.mid ? 5 : 3;
  const R = S * 0.95;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.5;
    const rr = R * (0.6 + r() * 0.55);
    house(b, Math.cos(a) * rr, Math.sin(a) * rr, facing(a), S * (0.58 + r() * 0.18), i % 2 === 0);
  }
  b.cyl(S * 0.2, S * 0.19, trimU(4), 10, 0, trimU(2), 0, FAMILY.STONE, C.base);
  b.band(S * 0.21, trimU(4.5), FAMILY.STONE, C.trim, 10, 1);
  if (b.mid) {
    for (const s of [-1, 1]) {
      b.box(trimU(1.5), S * 0.34, trimU(1.5), s * S * 0.16, trimU(4) + S * 0.17, 0, FAMILY.TIMBER, C.timber, 0, BEVEL_S);
    }
    b.gable(S * 0.46, S * 0.14, S * 0.26, 0, trimU(4) + S * 0.34, 0, FAMILY.TIMBER, C.roof);
    const fn = 14;
    for (let i = 0; i < fn; i++) {
      const a = (i / fn) * Math.PI * 2;
      b.box(trimU(1.2), S * 0.3, trimU(1.2), Math.cos(a) * R * 1.5, S * 0.15 - trimU(1), Math.sin(a) * R * 1.5,
        FAMILY.TIMBER, C.timberLt, facing(a), BEVEL_S);
    }
  }
  b.flag(R * 0.2, 0, -R * 0.6, S * 0.72);
  b.height = S * 1.1;
  b.radius = R * 1.65;
}

/**
 * 소가옥 — 기단(석)/벽(목·석)/처마 트림/박공 지붕/굴뚝. 도시·마을 공용 모듈.
 * 티어는 조립기(b)에서 읽는다 — Tier C 는 기단+벽+지붕 3파트로 줄인다 (P2).
 */
function house(b, x, z, ry, h, stoneWalls) {
  const w = h * 1.35, d = h * 1.05;
  b.box(w * 1.08, trimU(2.5), d * 1.08, x, trimU(1.25), z, FAMILY.STONE, C.base, ry, BEVEL_S);
  b.box(w, h, d, x, trimU(2.5) + h / 2, z, stoneWalls ? FAMILY.STONE : FAMILY.TIMBER,
    stoneWalls ? C.bodyMid : C.timber, ry, BEVEL_S);
  const eaveY = trimU(2.5) + h;
  if (b.mid) {
    b.box(w + trimU(1.5), trimU(1.5), d + trimU(1.5), x, eaveY, z, FAMILY.TIMBER, C.timberLt, ry, BEVEL_S);
  }
  // 처마 트림을 뺀 티어에서는 지붕이 벽 위에 바로 앉는다 (뜨는 지붕 금지)
  b.gable(w * 1.16, h * 0.6, d * 1.18, x, b.mid ? trimU(3.5) + h : eaveY, z, FAMILY.TIMBER, C.roof, ry);
  if (b.mid) {
    const cx = x + Math.cos(ry) * w * 0.3, cz = z - Math.sin(ry) * w * 0.3;
    b.box(trimU(2.4), h * 0.66, trimU(2.4), cx, trimU(3.5) + h + h * 0.3, cz, FAMILY.STONE, C.mortar, ry, BEVEL_S);
    b.opening(w * 0.2, h * 0.44, x + Math.sin(ry) * d * 0.5, trimU(2.5) + h * 0.27, z + Math.cos(ry) * d * 0.5, ry,
      C.mortar, FAMILY.TIMBER);
  }
}

/** 숲 — 3티어 수목 군락 + 선돌 원 */
function buildForest(b, S) {
  const r = rng(b);
  const P = S;
  b.cyl(P * 0.26, P * 0.17, P * 1.2, 9, 0, P * 0.6, 0, FAMILY.TIMBER, C.trunkDark);
  b.cone(P * 0.9, P * 1.0, 10, 0, P * 1.4, 0, FAMILY.FOLIAGE, C.canopyLow, 0.3);
  b.cone(P * 0.68, P * 0.84, 10, 0, P * 1.92, 0, FAMILY.FOLIAGE, C.canopyHi, -0.4);
  b.cone(P * 0.42, P * 0.62, 9, 0, P * 2.36, 0, FAMILY.FOLIAGE, C.leafHi, 0.8);
  const mid = b.full ? 6 : b.mid ? 4 : 2;
  for (let i = 0; i < mid; i++) {
    const a = (i / mid) * Math.PI * 2 + r() * 0.6;
    const rr = P * (0.95 + r() * 0.45);
    const hh = massOf(P, 1) * (0.9 + r() * 0.45);
    b.cyl(hh * 0.12, hh * 0.09, hh * 0.66, 7, Math.cos(a) * rr, hh * 0.33, Math.sin(a) * rr, FAMILY.TIMBER, C.trunk);
    b.cone(hh * 0.46, hh * 0.78, 8, Math.cos(a) * rr, hh * 1.0, Math.sin(a) * rr, FAMILY.FOLIAGE,
      mixColor(C.canopyLow, C.canopyHi, r()), r() * 3);
  }
  if (b.mid) {
    for (let i = 0; i < 7; i++) {
      const a = r() * Math.PI * 2, rr = P * (0.6 + r() * 1.1);
      const s = massOf(P, 2) * (0.35 + r() * 0.3);
      b.cone(s, s * 1.25, 6, Math.cos(a) * rr, s * 0.62, Math.sin(a) * rr, FAMILY.FOLIAGE, C.canopyLow, r() * 3);
    }
  }
  const stones = b.mid ? 7 : 5;
  for (let i = 0; i < stones; i++) {
    const a = (i / stones) * Math.PI * 2 + 0.2;
    const hh = massOf(P, 2) * (0.95 + r() * 0.5);
    b.box(PANEL_GRID * 0.46, hh, PANEL_GRID * 0.34, Math.cos(a) * P * 1.55, hh / 2 - trimU(1), Math.sin(a) * P * 1.55,
      FAMILY.STONE, C.base, facing(a) + (r() - 0.5) * 0.2, BEVEL_M);
  }
  b.height = P * 2.7;
  b.radius = P * 1.8;
}

/** 산 — 각진 암봉 + 층리 + 설선 */
function buildMountain(b, S) {
  const r = rng(b);
  const P = S;
  const peaks = b.mid ? 3 : 2;
  for (let i = 0; i < peaks; i++) {
    const a = (i / peaks) * Math.PI * 2 + r();
    const rr = i === 0 ? 0 : P * (0.45 + r() * 0.35);
    const hh = P * (i === 0 ? 1.6 : 0.85 + r() * 0.5);
    const rad = P * (i === 0 ? 0.6 : 0.38 + r() * 0.14);
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    b.cyl(rad * 1.16, rad * 0.94, hh * 0.34, 7, x, hh * 0.17, z, FAMILY.STONE, C.cliff, r(), true);
    b.cone(rad * 0.96, hh * 0.76, 7, x, hh * 0.34 + hh * 0.38, z, FAMILY.STONE, C.rock, r(), true);
    b.cone(rad * 0.36, hh * 0.3, 6, x, hh * 0.96, z, FAMILY.STONE, C.snow, r(), true);
    if (b.mid) {
      for (let k = 1; k <= 2; k++) {
        b.cyl(rad * (0.99 - k * 0.13), rad * (0.97 - k * 0.13), trimU(2), 7,
          x, hh * (0.36 + k * 0.16), z, FAMILY.STONE, k % 2 ? C.strataMid : C.strata, r(), true);
      }
    }
  }
  if (b.mid) {
    for (let i = 0; i < 6; i++) {
      const a = r() * Math.PI * 2, rr = P * (0.85 + r() * 0.6);
      const s = massOf(P, 2) * (0.25 + r() * 0.22);
      b.chunk(s, Math.cos(a) * rr, s * 0.55, Math.sin(a) * rr, FAMILY.STONE,
        mixColor(C.rock, C.cliff, r()), r(), r() * 3, r());
    }
  }
  b.height = P * 1.95;
  b.radius = P * 1.5;
}

/** 전장 — 사건의 논리: 흙더미·창 열·방패 더미·깃발 */
function buildBattlefield(b, S) {
  const r = rng(b);
  const P = S;
  b.cyl(P * 1.05, P * 0.78, P * 0.24, 12, 0, P * 0.12 - trimU(1), 0, FAMILY.STONE,
    mixColor(C.cliff, C.base, 0.4), 0, true);
  const spears = b.full ? 12 : b.mid ? 8 : 5;
  for (let i = 0; i < spears; i++) {
    const t = (i / Math.max(1, spears - 1)) - 0.5;
    const x = t * P * 1.7 + (r() - 0.5) * PANEL_GRID * 0.3;
    const z = Math.sin(i * 1.7) * P * 0.45;
    const tilt = (r() - 0.5) * 0.42;
    const hh = massOf(P, 1) * (1.0 + r() * 0.3);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, r() * 3, tilt * 0.6));
    // 자루가 **실제로** 향하는 축 — 회전은 X·Y·Z 세 축이 걸려 있으므로 X 성분만 보정하면
    // 창끝이 자루에서 떨어져 허공에 뜬다 (자루 상단 반경의 네 배까지 벌어졌었다).
    const axis = V3(0, 1, 0).applyQuaternion(q);
    const foot = V3(x, hh / 2, z);
    b.push(new THREE.CylinderGeometry(BEVEL_S * 1.4, BEVEL_M, hh, 5, 1), FAMILY.TIMBER, C.timber,
      M4().compose(foot.clone(), q, V3(1, 1, 1)), false);
    // 페룰(이음 링) — 자루와 창날의 굵기 차를 덮는다 (P3: 연결부에 트림, 관통 마감 금지)
    b.push(new THREE.CylinderGeometry(BEVEL_M * 1.2, BEVEL_M * 1.2, trimU(1.1), 6, 1), FAMILY.IRON, C.iron,
      M4().compose(foot.clone().addScaledVector(axis, hh * 0.5), q, V3(1, 1, 1)), false);
    b.push(new THREE.ConeGeometry(BEVEL_L * 0.75, hh * 0.2, 4, 1), FAMILY.IRON, C.steel,
      M4().compose(foot.clone().addScaledVector(axis, hh * 0.56), q, V3(1, 1, 1)), true);
  }
  if (b.mid) {
    for (let i = 0; i < 5; i++) {
      const a = r() * Math.PI * 2, rr = P * (0.5 + r() * 0.8);
      const s = massOf(P, 2) * (0.55 + r() * 0.3);
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2.2, r() * 3, r()));
      b.push(new THREE.CylinderGeometry(s, s * 0.92, trimU(2), 8, 1), FAMILY.IRON, C.iron,
        M4().compose(V3(Math.cos(a) * rr, s * 0.5, Math.sin(a) * rr), q, V3(1, 1, 1)), false);
      b.push(new THREE.TorusGeometry(s * 0.58, trimU(0.8), 4, 8), FAMILY.LEATHER, C.timberLt,
        M4().compose(V3(Math.cos(a) * rr, s * 0.62, Math.sin(a) * rr), q, V3(1, 1, 1)), false);
    }
  }
  const flags = b.mid ? 3 : 2;
  for (let i = 0; i < flags; i++) {
    const a = (i / flags) * Math.PI * 2 + 0.7;
    b.flag(Math.cos(a) * P * 1.1, 0, Math.sin(a) * P * 1.1, P * 0.9);
  }
  b.height = P * 1.5;
  b.radius = P * 1.6;
}

/** 호수 — 부두·배·갈대·젖은 물가 암반 */
function buildLake(b, S) {
  const r = rng(b);
  const P = S;
  const deckL = P * 1.6, deckW = P * 0.46;
  b.box(deckW, trimU(2), deckL, 0, trimU(4), deckL * 0.4, FAMILY.TIMBER, C.timberLt, 0, BEVEL_S);
  for (let i = 0; i < 4; i++) {
    for (const s of [-1, 1]) {
      b.cyl(BEVEL_L * 0.85, BEVEL_L * 0.75, trimU(10), 6,
        s * deckW * 0.34, trimU(0.5), deckL * (0.08 + i * 0.22), FAMILY.TIMBER, C.timber);
    }
  }
  if (b.mid) {
    const bl = massOf(P, 1) * 1.1;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0.15));
    b.push(new THREE.CylinderGeometry(bl * 0.2, bl * 0.28, bl, 6, 1), FAMILY.TIMBER, C.timber,
      M4().compose(V3(deckW * 1.15, trimU(1.5), deckL * 0.55), q, V3(1, 1, 0.55)), false);
    b.cyl(BEVEL_M, BEVEL_S, bl * 0.9, 5, deckW * 1.15, trimU(1.5) + bl * 0.45, deckL * 0.55, FAMILY.TIMBER, C.timberLt);
  }
  const rocks = b.mid ? 6 : 4;
  for (let i = 0; i < rocks; i++) {
    const a = r() * Math.PI * 2, rr = P * (0.9 + r() * 0.7);
    const s = massOf(P, 2) * (0.6 + r() * 0.45);
    b.chunk(s, Math.cos(a) * rr, s * 0.3, Math.sin(a) * rr, FAMILY.ROCK_WET,
      mixColor(C.rock, C.cliff, r() * 0.7), r(), r() * 3, r(), 1.4, 0.75, 1.2);
  }
  const reeds = b.full ? 16 : 10;
  for (let i = 0; i < reeds; i++) {
    const a = r() * Math.PI * 2, rr = P * (0.85 + r() * 0.95);
    const hh = massOf(P, 2) * (1.0 + r() * 0.7);
    b.cyl(BEVEL_S, BEVEL_S * 0.5, hh, 4, Math.cos(a) * rr, hh / 2, Math.sin(a) * rr, FAMILY.FOLIAGE, C.reed, r() * 3);
  }
  b.flag(-deckW * 1.3, 0, 0, P * 0.72);
  b.height = P * 1.0;
  b.radius = P * 1.75;
}

/** 섬 — 등대 + 암초 + 철 난간 */
function buildIsland(b, S) {
  const r = rng(b);
  const P = S;
  b.cyl(P * 0.5, P * 0.46, trimU(5), 12, 0, trimU(2.5), 0, FAMILY.STONE, C.base);
  b.cyl(P * 0.34, P * 0.34 * TAPER, P * 1.05, 12, 0, trimU(4) + P * 0.525, 0, FAMILY.STONE, C.body);
  const y1 = trimU(4) + P * 1.05;
  b.cyl(P * 0.31, P * 0.31, trimU(3), 12, 0, y1, 0, FAMILY.STONE, C.trim);
  b.cyl(P * 0.26, P * 0.26 * TAPER, P * 0.6, 12, 0, y1 + trimU(1.5) + P * 0.3, 0, FAMILY.STONE, C.bodyMid);
  const y2 = y1 + trimU(1.5) + P * 0.6;
  b.cyl(P * 0.29, P * 0.29, trimU(2), 12, 0, y2, 0, FAMILY.IRON, C.iron);
  b.cyl(P * 0.2, P * 0.2, P * 0.3, 8, 0, y2 + P * 0.16, 0, FAMILY.GOLD, C.gold);
  b.cone(P * 0.29, P * 0.34, 8, 0, y2 + P * 0.48, 0, FAMILY.IRON, C.steel);
  if (b.mid) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.cyl(BEVEL_S, BEVEL_S, P * 0.22, 4, Math.cos(a) * P * 0.26, y2 + P * 0.11, Math.sin(a) * P * 0.26, FAMILY.IRON, C.iron);
    }
    b.opening(P * 0.18, P * 0.34, 0, trimU(4) + P * 0.2, P * 0.34, 0, C.mortar, FAMILY.TIMBER);
  }
  const rocks = b.mid ? 6 : 4;
  for (let i = 0; i < rocks; i++) {
    const a = r() * Math.PI * 2, rr = P * (1.0 + r() * 0.7);
    const s = massOf(P, 1) * (0.4 + r() * 0.35);
    b.push(new THREE.ConeGeometry(s, s * 1.6, 5, 1), FAMILY.ROCK_WET, mixColor(C.cliff, C.rock, r()),
      M4().compose(V3(Math.cos(a) * rr, s * 0.55, Math.sin(a) * rr),
        new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.4, r() * 3, (r() - 0.5) * 0.4)), V3(1, 1, 1)), true);
  }
  b.flag(P * 0.55, trimU(4), -P * 0.55, P * 0.6);
  b.height = y2 + P * 0.65;
  b.radius = P * 1.7;
}

/** 이계 — 부유 암괴 + 아치 + 발광 결정 (부유섬 위에 얹힌다) */
function buildOtherworld(b, S) {
  const r = rng(b);
  const P = S;
  const gap = P * 0.82, ph = P * 1.45, pw = P * 0.2;
  for (const s of [-1, 1]) {
    b.box(pw * 1.4, trimU(4), pw * 1.4, s * gap, trimU(2), 0, FAMILY.STONE, C.base, 0, BEVEL_M);
    b.push(taperedShaft(pw, pw * TAPER, ph, BEVEL_M), FAMILY.STONE, C.bodyMid,
      M4().makeTranslation(s * gap, trimU(3) + ph / 2, 0), false);
    b.box(pw * 1.3, trimU(3), pw * 1.3, s * gap, trimU(3) + ph, 0, FAMILY.GOLD, C.trim, 0, BEVEL_S);
  }
  const lintelY = trimU(3) + ph + trimU(4);
  b.box(gap * 2 + pw * 1.6, trimU(6), pw * 1.15, 0, lintelY, 0, FAMILY.STONE, C.body, 0, BEVEL_M);
  b.box(gap * 2 + pw * 1.9, trimU(2), pw * 1.35, 0, lintelY + trimU(4), 0, FAMILY.GOLD, C.gold, 0, BEVEL_S);
  const crystals = b.mid ? 7 : 4;
  for (let i = 0; i < crystals; i++) {
    const a = r() * Math.PI * 2, rr = P * (0.4 + r() * 1.05);
    const hh = massOf(P, 1) * (0.55 + r() * 0.8);
    b.push(new THREE.ConeGeometry(hh * 0.22, hh, 5, 1), FAMILY.CRYSTAL, mixColor(C.crystalA, C.crystalB, r()),
      M4().compose(V3(Math.cos(a) * rr, hh * 0.42, Math.sin(a) * rr),
        new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.5, r() * 3, (r() - 0.5) * 0.5)), V3(1, 1, 1)), true);
  }
  if (b.mid) {
    for (let i = 0; i < 4; i++) {
      const a = r() * Math.PI * 2, rr = P * (1.15 + r() * 0.5);
      const s = massOf(P, 2) * (0.7 + r() * 0.5);
      b.chunk(s, Math.cos(a) * rr, P * (0.45 + r() * 0.7), Math.sin(a) * rr, FAMILY.STONE,
        mixColor(C.base, C.strataMid, r()), r(), r() * 3, r());
    }
  }
  b.height = lintelY + trimU(6);
  b.radius = P * 1.6;
}

/** 어휘 밖 placeType 을 만났을 때의 표지석 (§1 어휘는 10종이 전부다) */
function buildMarker(b, S) {
  b.cyl(S * 0.5, S * 0.44, trimU(5), 10, 0, trimU(2.5), 0, FAMILY.STONE, C.base);
  b.band(S * 0.46, trimU(5), FAMILY.STONE, C.trim, 10, 1.5);
  b.push(taperedShaft(S * 0.32, S * 0.26, S * 0.9, BEVEL_M), FAMILY.STONE, C.body,
    M4().makeTranslation(0, trimU(5) + S * 0.45, 0), false);
  b.cone(S * 0.22, S * 0.3, 6, 0, trimU(5) + S * 1.05, 0, FAMILY.STONE, C.bodyMid);
  b.height = trimU(5) + S * 1.2;
  b.radius = S * 0.8;
}

export const PLACE_BUILDERS = Object.freeze({
  castle: buildCastle,
  kingdom: buildKingdom,
  city: buildCity,
  village: buildVillage,
  forest: buildForest,
  mountain: buildMountain,
  battlefield: buildBattlefield,
  lake: buildLake,
  island: buildIsland,
  otherworld: buildOtherworld,
});

export const LANDMARK_GENERATORS = Object.keys(PLACE_BUILDERS).length;

/**
 * placeType 별 primary 매스 기준 크기.
 * 장소 간 최근접 거리(약 18~22 월드 단위)를 넘지 않도록 잡았다 —
 * 여기에 P7 과장 배율(1.6~2.2)이 곱해진다.
 */
const BASE_SIZE = Object.freeze({
  castle: 2.7, kingdom: 2.6, city: 2.8, village: 2.6, forest: 2.6,
  mountain: 3.6, battlefield: 2.8, lake: 2.7, island: 2.5, otherworld: 2.6,
});

/* ══════════════════════════════════════════════════════════════════
   4. 필드 조립 — 전 장소의 파트를 재질 계열별로 병합한다 (§5 예산)
   ══════════════════════════════════════════════════════════════════ */

/**
 * @param {object} ctx
 *   places   : [{id, type, x, z, eventCount, degree}]  지상 장소
 *   style    : normalizeStyle 결과
 *   idx      : indexGraph 결과
 *   seed     : 세계 시드
 *   surfaceAt: (x,z) => y
 *   timeSlotOf: (placeId) => 칸 번호 (선택 · 시간 여행 #14. 0 이면 언제나 존재)
 * @returns {{group, picks, anchors, clearances, stats}}
 */
export function buildLandmarkField(ctx) {
  const { places, style, idx, seed, surfaceAt } = ctx;
  const timeSlotOf = typeof ctx.timeSlotOf === 'function' ? ctx.timeSlotOf : null;
  const group = new THREE.Group();
  group.name = 'fan-landmarks';
  const picks = [];
  const anchors = new Map();
  const clearances = [];             // 식생이 건물을 뚫지 않게 비워 둘 반경
  const buckets = new Map();
  const flagItems = [];
  const stats = {
    generators: LANDMARK_GENERATORS, tierA: 0, tierB: 0, tierC: 0,
    parts: 0, triangles: 0, flags: 0, meshes: 0,
  };

  // 중요도 백분위 — degree + eventCount (P2 3티어의 근거)
  const scored = places.map((p) => ({
    p, score: Math.log(1 + p.eventCount) * 1.7 + Math.log(1 + p.degree) * 1.0,
  })).sort((a, b) => a.score - b.score);
  const pct = new Map();
  scored.forEach((s, i) => pct.set(s.p.id, scored.length > 1 ? i / (scored.length - 1) : 1));

  const pickMat = new THREE.MeshBasicMaterial({ visible: false });
  const tmpV = new THREE.Vector3();

  for (const p of places) {
    const q = pct.get(p.id) || 0;
    const tier = q >= DETAIL_TIERS.A ? 'A' : q >= DETAIL_TIERS.B ? 'B' : 'C';
    stats['tier' + tier]++;
    const r = rngFor('landmark', p.id, String(seed));
    const b = new Assembly(r, tier);
    (PLACE_BUILDERS[p.type] || buildMarker)(b, BASE_SIZE[p.type] || 2.4);

    // P7 — 주변 대비 1.6~2.2배 과장. 중요할수록 크다.
    const scale = LANDMARK_SCALE.MIN + (LANDMARK_SCALE.MAX - LANDMARK_SCALE.MIN) * q;
    const ry = r() * Math.PI * 2;
    const gy = surfaceAt(p.x, p.z);

    // 경사에 앉히기 — 구조물은 지반고에 그대로 서고, 발밑이 꺼진 만큼 **기단을 아래로 늘린다**.
    // (구조물을 파묻으면 기단·개구부가 사라진다 — 늘어난 기단은 성채의 모트처럼 읽힌다.)
    const foot = b.radius * scale * 0.6;
    let low = gy;
    for (const [dx, dz] of [[foot, 0], [-foot, 0], [0, foot], [0, -foot],
      [foot * 0.7, foot * 0.7], [-foot * 0.7, -foot * 0.7]]) {
      const h = surfaceAt(p.x + dx, p.z + dz);
      if (h < low) low = h;
    }
    const baseY = gy;
    const drop = Math.max(0, Math.min(gy - low, b.height * scale * 0.85));
    if (drop > 0.08) {
      const dl = drop / scale;                       // 로컬 단위로 환산
      const padH = dl + trimU(3);
      b.cyl(b.radius * 0.82, b.radius * 0.74, padH, 14, 0, trimU(1.5) - padH / 2, 0,
        FAMILY.STONE, C.base, 0, false);
      // 늘어난 기단 상단에 코니스 — 지면과의 이음매를 덮는다 (P3)
      b.band(b.radius * 0.84, trimU(2), FAMILY.STONE, C.trim, 14, 2);
    }

    const worldM = new THREE.Matrix4().compose(
      new THREE.Vector3(p.x, baseY, p.z), QY(ry), new THREE.Vector3(scale, scale, scale));

    const timeSlot = timeSlotOf ? (timeSlotOf(p.id) || 0) : null;
    for (const part of b.parts) {
      const m = new THREE.Matrix4().multiplyMatrices(worldM, part.matrix || M4());
      const baked = bakePart({
        geo: part.geo, matrix: m, color: part.color, flat: part.flat, timeSlot,
      });
      const fam = part.fam || FAMILY.STONE;
      if (!buckets.has(fam)) buckets.set(fam, []);
      buckets.get(fam).push(baked);
      stats.parts++;
      stats.triangles += baked.getAttribute('position').count / 3;
    }

    const banner = bannerColor(style, idx, p.id);
    for (const f of b.flags) {
      tmpV.set(f.x, f.y, f.z).applyMatrix4(worldM);
      const fs = scale * 0.9;
      flagItems.push({
        matrix: new THREE.Matrix4().compose(tmpV.clone(), QY(ry), new THREE.Vector3(fs, fs, fs)),
        color: banner,
        timeSlot: timeSlot || 0,
      });
    }
    stats.flags += b.flags.length;

    const topY = baseY + b.height * scale;
    anchors.set(p.id, new THREE.Vector3(p.x, topY, p.z));
    clearances.push({ x: p.x, z: p.z, r: b.radius * scale * 0.95 });

    // 픽 프록시 — 렌더되지 않는다(visible=false → 드로우콜 0).
    // three 의 레이캐스트는 가시성을 보지 않으므로 클릭 판정은 그대로 산다.
    const proxyH = Math.max(2, b.height * scale);
    const proxy = new THREE.Mesh(
      new THREE.CylinderGeometry(b.radius * scale * 0.7, b.radius * scale * 0.82, proxyH, 8, 1), pickMat);
    proxy.position.set(p.x, baseY + proxyH / 2, p.z);
    proxy.visible = false;
    proxy.userData.fanNodeId = p.id;
    proxy.name = 'fan-pick-' + p.id;
    group.add(proxy);
    picks.push(proxy);
  }

  // ── 계열별 병합 — 드로우콜이 장소 수가 아니라 재질 수로 고정된다
  for (const fam of FAMILY_ORDER) {
    const list = buckets.get(fam);
    if (!list || !list.length) continue;
    const mesh = new THREE.Mesh(mergeBucket(list), familyMaterial(fam));
    mesh.name = 'fan-landmark-' + fam;
    group.add(mesh);
    stats.meshes++;
  }

  if (flagItems.length) { group.add(buildFlagInstances(flagItems)); stats.meshes++; }
  return { group, picks, anchors, clearances, stats };
}

export function familyMaterial(fam) {
  const params = { preset: FAMILY_PRESET[fam] || 'MAT_STONE', vertexColors: true, color: WHITE, detail: true };
  if (fam === FAMILY.FOLIAGE) params.side = THREE.DoubleSide;
  if (fam === FAMILY.CRYSTAL) { params.emissive = MYSTIC.CRYSTAL_EMISSIVE; params.detail = false; }
  return makeSurface(params, { key: 'lm-' + fam });
}

/** 세력 깃발색 — 세력이 없으면 팔레트 기본 배너 */
function bannerColor(style, idx, placeId) {
  const fid = idx.placeFaction.get(placeId);
  if (!fid) return C.banner.clone();
  return factionColor(style, fid, idx.factionOrder.indexOf(fid));
}

/** 깃발 천 — MAT_CLOTH(sheen)로만 구분되는 천. 세력색은 인스턴스 색으로 얹는다. */
function buildFlagInstances(items) {
  const geo = new THREE.PlaneGeometry(PANEL_GRID * 2.6, PANEL_GRID * 1.5, 4, 2);
  geo.translate(PANEL_GRID * 1.3, 0, 0);
  ensureVertexColors(geo);
  const mat = makeSurface(
    { preset: 'MAT_CLOTH', vertexColors: true, side: THREE.DoubleSide, color: WHITE, detail: true, repeat: 2 },
    { wind: 2.2, windAxis: 'x', key: 'flag' });
  const inst = new THREE.InstancedMesh(geo, mat, items.length);
  const slots = [];
  let anyTime = false;
  for (let i = 0; i < items.length; i++) {
    inst.setMatrixAt(i, items[i].matrix);
    inst.setColorAt(i, items[i].color);
    const s = items[i].timeSlot || 0;
    slots.push(s);
    if (s > 0) anyTime = true;
  }
  // 성이 사라지면 그 성의 깃발도 함께 사라진다 (인스턴스 하나 = 장소 하나의 깃대)
  if (anyTime) setInstanceTimeIndex(geo, slots);
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  inst.name = 'fan-flags';
  inst.frustumCulled = false;
  return inst;
}

/**
 * 부유섬 위에 얹을 이계 구조물 — effects.js 의 부유섬이 쓴다.
 * 지상 필드와 같은 조립기를 쓰되, 결과를 로컬 좌표에서 병합해 돌려준다.
 */
export function buildOtherworldStructure(placeId, size, seedKey, tier = 'A') {
  const r = rngFor('otherworld', placeId, String(seedKey));
  const b = new Assembly(r, tier);
  buildOtherworld(b, size);
  const group = new THREE.Group();
  group.name = 'fan-otherworld-' + placeId;
  const buckets = new Map();
  let tris = 0;
  for (const part of b.parts) {
    const baked = bakePart({ geo: part.geo, matrix: part.matrix, color: part.color, flat: part.flat });
    const fam = part.fam || FAMILY.STONE;
    if (!buckets.has(fam)) buckets.set(fam, []);
    buckets.get(fam).push(baked);
  }
  for (const fam of FAMILY_ORDER) {
    const list = buckets.get(fam);
    if (!list || !list.length) continue;
    const geo = mergeBucket(list);
    tris += geo.getAttribute('position').count / 3;
    const mesh = new THREE.Mesh(geo, familyMaterial(fam));
    mesh.name = 'fan-otherworld-' + fam;
    group.add(mesh);
  }
  return { group, height: b.height, radius: b.radius, triangles: tris };
}
