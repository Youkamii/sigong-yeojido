// app/materials.js — 재질 프리셋 팩토리 (아트 바이블 §1.3 · P4 Premium Material Language)
//
// 규칙
//   · MeshPhysicalMaterial 만 쓴다. 구 계약의 툰 램프 방식은 전면 폐기됐다 (§0).
//   · 색은 artbible.js 토큰에서만 온다. 이 파일에 hex 리터럴은 없다.
//   · 절차 텍스처는 **구조를 설명한다** — 석조 줄눈, 나뭇결, 브러시드 금속, 직조, 가죽 결, 물결.
//     무작위 노이즈 도배는 금지다 (P5).
//   · 텍스처·프리셋 프로토타입은 캐시한다. 캐시 텍스처는 __fanKeep 로 표시해 재소환 시 살아남는다.
import * as THREE from 'three';
import { canvasTexture, rngFor } from './util.js';
import {
  MATERIAL, MATERIAL_KEYS, PANEL_GRID, TRIM_H, WHITE, BLACK, rgba,
  STRUCT, FOLIAGE, WATER,
} from './artbible.js';

/** 토큰(hex 문자열) → THREE.Color */
const col = (hex) => new THREE.Color(hex);

/* ══════════════════════════════════════════════════════════════════
   1. 절차 텍스처 — 캔버스 생성, 외부 이미지 요청 0
   각 kind 는 { bump, rough } 한 쌍을 만든다.
     bump  : 중간 회색 기준으로 요철을 기술 (구조 라인이 보이게)
     rough : 0.75~1.0 좁은 구간의 거칠기 브레이크업 (곱셈이므로 1 이 원본)
   ══════════════════════════════════════════════════════════════════ */
const TEX_SIZE = 256;
const _texCache = new Map();

const GREY = (v) => `rgb(${Math.round(v * 255)},${Math.round(v * 255)},${Math.round(v * 255)})`;

/** 석조 — 수평 층리(strata) + 어긋쌓기 줄눈. 하중 흐름을 드러낸다. */
function drawStoneBump(ctx, w, h) {
  ctx.fillStyle = GREY(0.52);
  ctx.fillRect(0, 0, w, h);
  const rng = rngFor('tex', 'stone');
  const courses = 5;                       // 층리 3~5층 (§3)
  const ch = h / courses;
  for (let r = 0; r < courses; r++) {
    // 층마다 미세하게 다른 밝기 — 층리별 거칠기 차이를 암시
    ctx.fillStyle = GREY(0.46 + (r % 2) * 0.08);
    ctx.fillRect(0, r * ch, w, ch);
    const cols = 4 + (r % 2);
    const cw = w / cols;
    const off = (r % 2) * cw * 0.5;
    ctx.strokeStyle = GREY(0.20);
    ctx.lineWidth = Math.max(1, h * TRIM_H * 0.12);
    for (let c = 0; c <= cols; c++) {
      const x = ((c * cw + off) % w);
      ctx.beginPath(); ctx.moveTo(x, r * ch); ctx.lineTo(x, (r + 1) * ch); ctx.stroke();
    }
    // 층 경계 줄눈 + 상단 모서리 하이라이트(베벨 마모)
    ctx.strokeStyle = GREY(0.18);
    ctx.beginPath(); ctx.moveTo(0, r * ch); ctx.lineTo(w, r * ch); ctx.stroke();
    ctx.strokeStyle = GREY(0.72);
    ctx.lineWidth = Math.max(1, h * TRIM_H * 0.06);
    ctx.beginPath(); ctx.moveTo(0, r * ch + 1.5); ctx.lineTo(w, r * ch + 1.5); ctx.stroke();
    // 블록별 아주 얕은 면 변화 (과도한 wear 금지 — 진폭을 작게)
    for (let c = 0; c < cols; c++) {
      const x = ((c * cw + off) % w);
      ctx.fillStyle = GREY(0.50 + (rng() - 0.5) * 0.07);
      ctx.fillRect(x + 2, r * ch + 2, cw - 4, ch - 4);
    }
  }
}

/** 나뭇결 — 한 방향 결 + 옹이 몇 개 (이방성 근거) */
function drawTimberBump(ctx, w, h) {
  ctx.fillStyle = GREY(0.52);
  ctx.fillRect(0, 0, w, h);
  const rng = rngFor('tex', 'timber');
  ctx.lineWidth = 1;
  for (let i = 0; i < 46; i++) {
    const y = (i / 46) * h + rng() * 2;
    const amp = 1.5 + rng() * 3.5;
    ctx.strokeStyle = GREY(0.40 + rng() * 0.22);
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const yy = y + Math.sin((x / w) * Math.PI * 2 + i) * amp;
      if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  for (let k = 0; k < 3; k++) {
    const cx = rng() * w, cy = rng() * h;
    for (let r = 12; r > 1; r -= 2.5) {
      ctx.strokeStyle = GREY(0.34 + r * 0.012);
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

/** 브러시드 금속 — 한 방향 미세선 + 패널 격자 심 (PANEL_GRID 배수) */
function drawMetalBump(ctx, w, h) {
  ctx.fillStyle = GREY(0.52);
  ctx.fillRect(0, 0, w, h);
  const rng = rngFor('tex', 'metal');
  ctx.lineWidth = 1;
  for (let i = 0; i < 220; i++) {
    const y = rng() * h;
    ctx.strokeStyle = GREY(0.46 + rng() * 0.12);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  const cells = 4;                                  // 패널 분할 = 격자 정수배
  ctx.strokeStyle = GREY(0.22);
  ctx.lineWidth = Math.max(1, w * TRIM_H * 0.10);
  for (let i = 0; i <= cells; i++) {
    const p = (i / cells) * w * PANEL_GRID;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(w, p); ctx.stroke();
  }
  ctx.strokeStyle = GREY(0.78);                     // 심 옆 엣지 하이라이트
  ctx.lineWidth = 1;
  for (let i = 0; i <= cells; i++) {
    const p = (i / cells) * w * PANEL_GRID + 2;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, h); ctx.stroke();
  }
}

/** 직조 — 씨실/날실 교차 (sheen 과 짝을 이룬다) */
function drawClothBump(ctx, w, h) {
  ctx.fillStyle = GREY(0.5);
  ctx.fillRect(0, 0, w, h);
  const n = 32, cw = w / n, chh = h / n;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const over = (x + y) % 2 === 0;
      ctx.fillStyle = GREY(over ? 0.62 : 0.40);
      ctx.fillRect(x * cw, y * chh, cw * 0.92, chh * 0.92);
    }
  }
}

/** 가죽 결 — 불규칙 셀 (작고 조밀하게, 스크래치 아님) */
function drawLeatherBump(ctx, w, h) {
  ctx.fillStyle = GREY(0.5);
  ctx.fillRect(0, 0, w, h);
  const rng = rngFor('tex', 'leather');
  const cells = 90;
  for (let i = 0; i < cells; i++) {
    const cx = rng() * w, cy = rng() * h, r = 6 + rng() * 10;
    const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    g.addColorStop(0, GREY(0.60));
    g.addColorStop(1, GREY(0.44));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  }
}

/** 물결 — 스웰 + 리플 2겹 (MAT_WATER 의 노멀 스크롤 2겹 근거) */
function drawWaterBump(ctx, w, h) {
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = (x / w) * Math.PI * 2, v = (y / h) * Math.PI * 2;
      const swell = Math.sin(u * 2 + v * 0.6) * 0.5 + Math.sin(v * 3 - u * 0.4) * 0.3;
      const ripple = Math.sin(u * 9 + v * 7) * 0.12 + Math.sin(u * 13 - v * 11) * 0.08;
      const val = 0.5 + (swell * 0.5 + ripple) * 0.45;
      const i = (y * w + x) * 4;
      const b = Math.max(0, Math.min(255, Math.round(val * 255)));
      img.data[i] = b; img.data[i + 1] = b; img.data[i + 2] = b; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** 잎맥 — 백라이트 근사(sheen)와 짝. alpha 는 별도 leafAlphaTexture 가 만든다. */
function drawFoliageBump(ctx, w, h) {
  ctx.fillStyle = GREY(0.5);
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = GREY(0.66);
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(w * 0.5, h); ctx.lineTo(w * 0.5, 0); ctx.stroke();
  ctx.lineWidth = 1;
  for (let i = 1; i < 10; i++) {
    const y = (i / 10) * h;
    ctx.strokeStyle = GREY(0.60);
    ctx.beginPath(); ctx.moveTo(w * 0.5, y); ctx.lineTo(w * 0.12, y - h * 0.06); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.5, y); ctx.lineTo(w * 0.88, y - h * 0.06); ctx.stroke();
  }
}

const BUMP_DRAW = {
  stone: drawStoneBump, timber: drawTimberBump, metal: drawMetalBump,
  cloth: drawClothBump, leather: drawLeatherBump, water: drawWaterBump, foliage: drawFoliageBump,
};

/** bump 캔버스를 좁은 밝기 구간으로 눌러 roughness 브레이크업으로 재사용 */
function toRoughness(ctx, w, h, kind) {
  BUMP_DRAW[kind](ctx, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = rgba(WHITE, 0.72);        // 0.72 흰색을 덮어 [0.75,1.0] 근방으로 압축
  ctx.fillRect(0, 0, w, h);
}

/** kind 별 { bump, rough } — 캐시 공유 */
export function detailTextures(kind, repeat = 1) {
  if (!kind || !BUMP_DRAW[kind]) return null;
  const key = kind + '|' + repeat;
  if (_texCache.has(key)) return _texCache.get(key);
  const wrap = THREE.RepeatWrapping;
  const bump = canvasTexture(TEX_SIZE, TEX_SIZE, (c, w, h) => BUMP_DRAW[kind](c, w, h), { linear: true, wrap, aniso: 4 });
  const rough = canvasTexture(TEX_SIZE, TEX_SIZE, (c, w, h) => toRoughness(c, w, h, kind), { linear: true, wrap, aniso: 4 });
  for (const t of [bump, rough]) {
    t.repeat.set(repeat, repeat);
    t.__fanKeep = true;
    t.needsUpdate = true;
  }
  const pair = { bump, rough };
  _texCache.set(key, pair);
  return pair;
}

/** 잎 알파 — MAT_FOLIAGE 의 alphaTest 용 (구조: 잎 3장 클러스터) */
export function leafAlphaTexture() {
  const key = 'leafAlpha';
  if (_texCache.has(key)) return _texCache.get(key);
  const tex = canvasTexture(128, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = WHITE;
    for (const [cx, cy, rx, ry, rot] of [
      [w * 0.5, h * 0.32, w * 0.22, h * 0.30, 0],
      [w * 0.26, h * 0.62, w * 0.20, h * 0.26, -0.5],
      [w * 0.74, h * 0.62, w * 0.20, h * 0.26, 0.5],
    ]) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  tex.__fanKeep = true;
  _texCache.set(key, tex);
  return tex;
}

/* ══════════════════════════════════════════════════════════════════
   2. 프리셋 팩토리
   ══════════════════════════════════════════════════════════════════ */

/* ── 굴절(투과) 재질 레지스트리 — 품질 프리셋이 통째로 끄고 켤 수 있게 ──────────
 *
 * three 는 `material.transmission > 0` 인 오브젝트가 **하나라도** 있으면 매 프레임
 *   ① 화면 크기 그대로의 half-float 4xMSAA 렌더타깃을 만들고
 *   ② 불투명 씬 **전체를 거기에 다시 그린 뒤**
 *   ③ resolve + 밉맵까지 만든다.
 * 수면은 화면 어디서나 프러스텀 안이라 이 비용이 상시 걸린다 — 저사양에서 SSAO 를
 * 다 꺼도 가장 큰 덩어리가 남는다. 그래서 프리셋(QUALITY.low)이 transmission 을 0 으로
 * 내릴 수 있게 만들어 둔 레지스트리다. 0 으로 내려도 roughness·envMap 반사는 그대로 남는다.
 */
const _transmissive = new Set();
let _transmissionOn = true;

function registerTransmissive(mat, base) {
  const entry = { mat, base };
  _transmissive.add(entry);
  mat.addEventListener('dispose', () => _transmissive.delete(entry));   // 재소환 누수 방지
  if (!_transmissionOn) mat.transmission = 0;
}

/**
 * 전 굴절 재질의 transmission 을 켜고 끈다.
 *
 * `transmission` 값만 바꾸면 렌더리스트 분류(`transmission > 0`)는 곧바로 따라오지만
 * 셰이더의 `USE_TRANSMISSION` 디파인은 그대로 남는다 — 없는 렌더타깃을 계속 샘플링하는
 * 프로그램이 도는 셈이다. needsUpdate 로 프로그램을 다시 굽어 디파인까지 떨어뜨린다.
 * (재컴파일이 공짜가 아니므로 **상태가 실제로 바뀔 때만** 돈다.)
 */
export function setTransmissionEnabled(on) {
  const next = !!on;
  if (next === _transmissionOn) return _transmissionOn;
  _transmissionOn = next;
  for (const e of _transmissive) {
    e.mat.transmission = next ? e.base : 0;
    e.mat.needsUpdate = true;
  }
  return _transmissionOn;
}
export function transmissionEnabled() { return _transmissionOn; }
export function transmissiveCount() { return _transmissive.size; }

function applyIfDefined(mat, prop, value) {
  if (value === undefined || value === null) return;
  if (!(prop in mat)) return;                      // three 버전이 지원하지 않으면 조용히 건너뛴다
  if (mat[prop] && mat[prop].isColor) mat[prop].set(value);
  else mat[prop] = value;
}

/**
 * 프리셋 이름으로 재질을 만든다.
 * @param {string} name  MATERIAL_KEYS 중 하나
 * @param {object} params
 *   color/emissive/opacity/transparent/side/alphaTest/map/alphaMap/vertexColors — 통상 오버라이드
 *   detail: false 면 절차 텍스처를 붙이지 않는다 (uv 없는 지오메트리 보호)
 *   repeat: 텍스처 반복 배수 (기본은 프리셋 값)
 */
export function makeMaterial(name, params = {}) {
  const preset = MATERIAL[name];
  if (!preset) throw new Error('unknown material preset: ' + name);

  if (preset.emissiveOnly) {
    // MAT_HOLO — 라이팅을 받지 않는 발광 전용 (§1.3)
    const mat = new THREE.MeshBasicMaterial({
      color: col(params.color != null ? params.color : preset.color),
      transparent: true,
      opacity: params.opacity != null ? params.opacity : preset.opacity,
      blending: (params.additive != null ? params.additive : preset.additive)
        ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: params.depthWrite != null ? params.depthWrite : preset.depthWrite,
      side: params.side || (preset.doubleSided ? THREE.DoubleSide : THREE.FrontSide),
      toneMapped: preset.toneMapped,
      map: params.map || null,
      alphaMap: params.alphaMap || null,
      vertexColors: !!params.vertexColors,
      fog: params.fog !== undefined ? params.fog : true,
    });
    mat.userData.fanPreset = name;
    return mat;
  }

  const wantsDetail = params.detail !== false && !!preset.detail;
  const repeat = params.repeat != null ? params.repeat : preset.repeat;
  const det = wantsDetail ? detailTextures(preset.detail, repeat) : null;

  const mat = new THREE.MeshPhysicalMaterial({
    color: col(params.color != null ? params.color : preset.color),
    roughness: params.roughness != null ? params.roughness : preset.roughness,
    metalness: params.metalness != null ? params.metalness : preset.metalness,
    vertexColors: !!params.vertexColors,
    transparent: !!params.transparent,
    opacity: params.opacity != null ? params.opacity : 1,
    side: params.side || (preset.doubleSided ? THREE.DoubleSide : THREE.FrontSide),
    alphaTest: params.alphaTest != null ? params.alphaTest : (preset.alphaTest || 0),
    map: params.map || null,
    alphaMap: params.alphaMap || null,
    flatShading: !!params.flatShading,
    fog: params.fog !== undefined ? params.fog : true,
  });

  mat.emissive = col(params.emissive != null ? params.emissive : BLACK);
  if (params.emissiveIntensity != null) mat.emissiveIntensity = params.emissiveIntensity;
  mat.envMapIntensity = params.envMapIntensity != null ? params.envMapIntensity : preset.envMapIntensity;

  // 재질을 색이 아니라 빛 반응으로 가르는 항목들 (§1.3)
  applyIfDefined(mat, 'clearcoat', preset.clearcoat);
  applyIfDefined(mat, 'clearcoatRoughness', preset.clearcoatRoughness);
  applyIfDefined(mat, 'sheen', params.sheen != null ? params.sheen : preset.sheen);
  applyIfDefined(mat, 'sheenRoughness', preset.sheenRoughness);
  if (preset.sheenColor && mat.sheenColor) mat.sheenColor.set(preset.sheenColor);
  applyIfDefined(mat, 'anisotropy', preset.anisotropy);
  applyIfDefined(mat, 'anisotropyRotation', preset.anisotropyRotation);
  applyIfDefined(mat, 'ior', preset.ior);
  applyIfDefined(mat, 'thickness', preset.thickness);
  if (preset.transmission != null) {
    const tv = params.transmission != null ? params.transmission : preset.transmission;
    applyIfDefined(mat, 'transmission', tv);
    if (preset.attenuationColor && mat.attenuationColor) mat.attenuationColor.set(preset.attenuationColor);
    applyIfDefined(mat, 'attenuationDistance', preset.attenuationDistance);
    if (tv > 0 && 'transmission' in mat) registerTransmissive(mat, tv);
  }

  if (det) {
    mat.bumpMap = det.bump;
    mat.bumpScale = params.bumpScale != null ? params.bumpScale : preset.bumpScale;
    mat.roughnessMap = det.rough;
  }

  // 다음 단계(지형·랜드마크)가 읽는 힌트 — 서브서피스·물결 스크롤 세기
  mat.userData.fanPreset = name;
  if (preset.subsurface != null) mat.userData.fanSubsurface = preset.subsurface;
  if (preset.scrollA != null) mat.userData.fanScroll = [preset.scrollA, preset.scrollB];
  return mat;
}

/* ── 이름별 단축 팩토리 (호출부 가독성) ───────────────────────── */
export const matStone       = (p) => makeMaterial('MAT_STONE', p);
export const matRockWet     = (p) => makeMaterial('MAT_ROCK_WET', p);
export const matTimber      = (p) => makeMaterial('MAT_TIMBER', p);
export const matMetalIron   = (p) => makeMaterial('MAT_METAL_IRON', p);
export const matMetalGold   = (p) => makeMaterial('MAT_METAL_GOLD', p);
export const matCloth       = (p) => makeMaterial('MAT_CLOTH', p);
export const matLeather     = (p) => makeMaterial('MAT_LEATHER', p);
export const matGlassArcane = (p) => makeMaterial('MAT_GLASS_ARCANE', p);
export const matWater       = (p) => makeMaterial('MAT_WATER', p);
export const matFoliage     = (p) => makeMaterial('MAT_FOLIAGE', p);
export const matHolo        = (p) => makeMaterial('MAT_HOLO', p);

/** placeType·용도 → 프리셋 이름 (조형 규약 §3 이 쓰는 매핑) */
export const SURFACE_PRESET = Object.freeze({
  wall: 'MAT_STONE', cliff: 'MAT_STONE', shore: 'MAT_ROCK_WET',
  beam: 'MAT_TIMBER', roof: 'MAT_TIMBER', frame: 'MAT_TIMBER',
  fitting: 'MAT_METAL_IRON', crown: 'MAT_METAL_GOLD',
  banner: 'MAT_CLOTH', tent: 'MAT_CLOTH', strap: 'MAT_LEATHER',
  crystal: 'MAT_GLASS_ARCANE', water: 'MAT_WATER', canopy: 'MAT_FOLIAGE', holo: 'MAT_HOLO',
});

/** 팔레트 역할색 힌트 — 구조물 조립부가 색을 직접 쓰지 않게 한다 */
export const PART_COLOR = Object.freeze({
  base: STRUCT.STONE_DARK, body: STRUCT.STONE, trim: STRUCT.TRIM,
  roof: STRUCT.ROOF, roofAlt: STRUCT.ROOF_ALT, timber: STRUCT.TIMBER,
  iron: STRUCT.IRON, gold: STRUCT.GOLD, banner: STRUCT.BANNER_DEFAULT,
  canopy: FOLIAGE.CANOPY_LOW, trunk: FOLIAGE.TRUNK,
  water: WATER.DEEP, plate: WATER.FOAM,
});

/* ══════════════════════════════════════════════════════════════════
   3. 공유 캐시 — 같은 파라미터면 같은 재질 인스턴스를 돌려준다
   (프로그램 재컴파일·유니폼 업로드를 줄인다. 반환된 재질을 직접 변형하지 말 것.)
   ══════════════════════════════════════════════════════════════════ */
const _matCache = new Map();

export function sharedMaterial(name, params = {}) {
  const key = name + '|' + JSON.stringify(params, Object.keys(params).sort());
  let mat = _matCache.get(key);
  if (mat && !mat.__disposed) return mat;
  mat = makeMaterial(name, params);
  mat.__fanKeep = true;                     // disposeDeep 이 공유 재질을 폐기하지 않게
  _matCache.set(key, mat);
  return mat;
}

export function materialCacheSize() { return _matCache.size; }

export function disposeMaterialCache() {
  for (const m of _matCache.values()) { m.__disposed = true; m.dispose(); }
  _matCache.clear();
  for (const v of _texCache.values()) {
    if (v && v.isTexture) v.dispose();
    else if (v) { v.bump.dispose(); v.rough.dispose(); }
  }
  _texCache.clear();
}

export { MATERIAL_KEYS };
