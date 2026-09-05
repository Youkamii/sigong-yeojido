// app/util.js — 결정론 난수 · 노이즈 · 기하 유틸
// 계약 §7: 절차 생성은 전부 결정론이어야 한다 (같은 그래프 → 같은 세계).
// 색 상수는 여기 없다 — artbible.js 토큰만 참조한다 (P8).
import * as THREE from 'three';
import { WHITE, rgba } from './artbible.js';

/* ───────── 해시 · 난수 ───────── */

export function hash32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 문자열 키들로 결정론 난수기를 만든다. rng() → [0,1) */
export function rngFor(...keys) {
  return mulberry32(hash32(keys.join('|')));
}

/* ───────── 스칼라 유틸 ───────── */

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
}

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ───────── 값 노이즈 (2D/3D, 결정론) ───────── */

function ihash(x, y, z, seed) {
  let h = seed ^ 0x9e3779b9;
  h = Math.imul(h ^ (x | 0), 0x85ebca6b);
  h = Math.imul(h ^ (y | 0), 0xc2b2ae35);
  h = Math.imul(h ^ (z | 0), 0x27d4eb2f);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

export function valueNoise2(x, y, seed = 1) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = ihash(xi, yi, 0, seed);
  const b = ihash(xi + 1, yi, 0, seed);
  const c = ihash(xi, yi + 1, 0, seed);
  const d = ihash(xi + 1, yi + 1, 0, seed);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}

/** fbm — 옥타브 합. 반환 [0,1] 근사 */
export function fbm2(x, y, seed = 1, octaves = 4, lac = 2.03, gain = 0.5) {
  let amp = 1, freq = 1, sum = 0, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2(x * freq, y * freq, seed + i * 977);
    norm += amp;
    amp *= gain;
    freq *= lac;
  }
  return sum / (norm || 1);
}

/** 능선형 노이즈 — 산등성이용 */
export function ridged2(x, y, seed = 1, octaves = 3) {
  let amp = 1, freq = 1, sum = 0, norm = 0;
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(valueNoise2(x * freq, y * freq, seed + i * 613) * 2 - 1);
    sum += amp * n * n;
    norm += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return sum / (norm || 1);
}

/* ───────── 색 유틸 ───────── */

export function toColor(hex, fallback = WHITE) {
  try {
    if (typeof hex === 'string' && /^#?[0-9a-fA-F]{6}$/.test(hex.trim())) {
      return new THREE.Color(hex.trim().startsWith('#') ? hex.trim() : '#' + hex.trim());
    }
  } catch (e) { /* 무시 — 폴백 */ }
  return new THREE.Color(fallback);
}

export function mixColor(a, b, t) {
  return new THREE.Color(lerp(a.r, b.r, t), lerp(a.g, b.g, t), lerp(a.b, b.b, t));
}

/* ───────── 지오메트리 병합 (BufferGeometryUtils 없이) ───────── */

/**
 * parts: [{ geo: BufferGeometry, matrix?: Matrix4, color?: THREE.Color }]
 * position/normal/color 만 담은 non-indexed BufferGeometry 하나로 합친다.
 * 벤더에 BufferGeometryUtils 가 없으므로 자체 구현 (외부 의존 0).
 */
/**
 * 면 노멀을 지오메트리에 굽는다 (각진 매스 룩).
 * 머티리얼의 flatShading 은 병합 지오메트리 전체에 걸리므로, 부분적으로 각을 세우려면
 * 지오메트리 쪽에서 해결한다: non-indexed 로 펴고 삼각형별 노멀을 다시 계산.
 */
export function flattenNormals(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  g.computeVertexNormals();          // non-indexed 면 삼각형 단위 노멀이 된다
  if (g !== geo) geo.dispose();
  return g;
}

/**
 * vertexColors 를 켜려면 지오메트리에 color 속성이 반드시 있어야 한다.
 * (three 는 USE_COLOR 를 머티리얼 플래그만 보고 켜므로, 속성이 없으면 vColor 가 0 → 새까맣게 나온다.
 *  또한 InstancedMesh 의 instanceColor 는 vertexColors 가 켜져야 프래그먼트에 반영된다.)
 */
export function ensureVertexColors(geo, r = 1, g = 1, b = 1) {
  if (geo.getAttribute('color')) return geo;
  const n = geo.getAttribute('position').count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = r; arr[i * 3 + 1] = g; arr[i * 3 + 2] = b; }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}

/**
 * withUV: uv 가 실제로 필요한 조립(풀 crossquad 등)에서만 켠다 — 나머지는 정점마다
 * 0으로 채운 uv 8바이트를 낭비할 뿐이다.
 */
export function mergeParts(parts, flat = false, withUV = false) {
  const pos = [], nrm = [], col = [], uvs = [];
  const nm = new THREE.Matrix3();
  const v = new THREE.Vector3();
  for (const part of parts) {
    if (!part || !part.geo) continue;
    const g = part.geo.index ? part.geo.toNonIndexed() : part.geo;
    const p = g.getAttribute('position');
    if (!p) continue;
    let n = g.getAttribute('normal');
    if (!n) { g.computeVertexNormals(); n = g.getAttribute('normal'); }
    const uv = g.getAttribute('uv');
    const m = part.matrix || null;
    if (m) nm.getNormalMatrix(m);
    const c = part.color || null;
    for (let i = 0; i < p.count; i++) {
      v.set(p.getX(i), p.getY(i), p.getZ(i));
      if (m) v.applyMatrix4(m);
      pos.push(v.x, v.y, v.z);
      v.set(n.getX(i), n.getY(i), n.getZ(i));
      if (m) v.applyMatrix3(nm).normalize();
      nrm.push(v.x, v.y, v.z);
      col.push(c ? c.r : 1, c ? c.g : 1, c ? c.b : 1);
      if (withUV) uvs.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0);
    }
    if (g !== part.geo) g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  if (withUV) out.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  if (flat) out.computeVertexNormals();     // 이미 non-indexed → 면 노멀
  return out;
}

/** 씬 그래프 전체 폐기 — 재소환 시 GPU 메모리 누수 방지 */
export function disposeDeep(obj) {
  if (!obj) return;
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    // 그림자 전용 depth 재질은 o.material 이 아니라 오브젝트에 붙는다 — 같이 회수한다
    if (o.customDepthMaterial && o.customDepthMaterial.dispose) {
      o.customDepthMaterial.dispose();
      o.customDepthMaterial = undefined;
    }
    const m = o.material;
    if (!m) return;
    const list = Array.isArray(m) ? m : [m];
    for (const mm of list) {
      if (mm.__fanKeep === true) continue;        // materials.js 공유 캐시는 살려 둔다
      for (const k of ['map', 'alphaMap', 'emissiveMap', 'bumpMap', 'normalMap',
        'roughnessMap', 'metalnessMap', 'aoMap', 'sheenColorMap', 'clearcoatMap', 'transmissionMap']) {
        if (mm[k] && mm[k].dispose && mm[k].__fanKeep !== true) mm[k].dispose();
      }
      if (mm.uniforms) {              // ShaderMaterial 의 텍스처 유니폼도 회수
        for (const k in mm.uniforms) {
          const v = mm.uniforms[k] && mm.uniforms[k].value;
          if (v && v.isTexture && v.__fanKeep !== true) v.dispose();
        }
      }
      // onBeforeCompile 로 셰이더에만 꽂은 텍스처는 위 두 경로 어디에도 안 걸린다.
      // 주입한 쪽이 여기에 등록해 두면(예: 물의 깊이 DataTexture) 함께 회수된다.
      const owned = mm.userData && mm.userData.fanOwnedTextures;
      if (Array.isArray(owned)) {
        for (const t of owned) if (t && t.dispose && t.__fanKeep !== true) t.dispose();
      }
      mm.dispose();
    }
  });
  if (obj.parent) obj.parent.remove(obj);
}

/* ───────── 캔버스 텍스처 (외부 이미지 요청 0) ───────── */

export function canvasTexture(w, h, draw, opts = {}) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = opts.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = opts.wrap || THREE.ClampToEdgeWrapping;
  tex.anisotropy = opts.aniso || 1;
  tex.needsUpdate = true;
  return tex;
}

/** 부드러운 원형 글로우 — 반딧불이·안개·태양 등 */
export function glowTexture(size = 128, inner = rgba(WHITE, 1), outer = rgba(WHITE, 0)) {
  return canvasTexture(size, size, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, inner);
    g.addColorStop(0.35, inner.replace(/[\d.]+\)$/, '0.55)'));
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

/* ───────── 문자열 ───────── */

export function truncate(s, n) {
  s = String(s == null ? '' : s);
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
