// app/timetravel.js — 연대 슬라이더가 지형 위의 시간을 움직인다 (계약 §7 #14)
//
// 무엇을 하는가
//   `existsFromYear`/`existsToYear` 창 밖으로 나간 랜드마크·사물이 **마이크로 디졸브**로 사라지고,
//   창 안으로 들어오면 다시 피어난다. 연출은 새로 만들지 않는다 — 홀로그램 물질화와
//   **같은 노이즈(fanNoise3) · 같은 에지색(U.holoA/holoB) · 같은 합성 지점**을 쓴다 (§3).
//
// 어떻게 싸게 하는가 (계약: "빠르게 긁어도 프레임이 유지돼야 한다")
//   · 존재도(presence)는 노드마다 0~1 값 하나다. 그 값들을 **1픽셀 높이 텍스처 한 장**에 담고
//     메시는 정점 속성 `aTimeIdx` 로 자기 칸을 본다 — 장소마다 메시를 쪼개지 않으므로 드로우콜 변화 0.
//   · 연도가 바뀔 때만 diff 하고(THROTTLE_MS 간격), 매 프레임에는 이미 시작된 전환만 보간한다.
//   · 창이 없는 노드는 슬롯을 갖지 않는다(슬롯 0 = 항상 존재) — 텍스처는 실제로 시간을 타는
//     노드 수 + 1 칸이면 된다. 속성이 없는 메시가 이 재질을 써도 0 을 읽어 무해하다.
//
// 개방세계 원칙: 창이 **없으면** 언제나 존재한다 — 모르는 것을 없다고 하지 않는다 (§1).
import * as THREE from 'three';
import { TIME } from './artbible.js';
import { clamp } from './util.js';

/** 노드의 존재 구간 — [from, to] (모르면 null 로 열려 있다). 숫자만 인정한다. */
export function existSpan(node) {
  const a = (node && node.attrs) || {};
  const from = typeof a.existsFromYear === 'number' && isFinite(a.existsFromYear) ? a.existsFromYear : null;
  const to = typeof a.existsToYear === 'number' && isFinite(a.existsToYear) ? a.existsToYear : null;
  if (from == null && to == null) return null;
  return [from, to];
}

export class TimeField {
  constructor(idx) {
    this.idx = idx;
    this.year = null;
    this.enabled = false;
    this.spans = new Map();          // nodeId -> [from, to]
    this.slot = new Map();           // nodeId -> 1..n (0 은 "항상 존재" 예약)
    const nodes = (idx && idx.nodes) || [];
    for (const n of nodes) {
      const s = existSpan(n);
      if (!s) continue;
      this.spans.set(n.id, s);
      this.slot.set(n.id, this.slot.size + 1);
    }
    // 슬롯 0 은 언제나 1.0 이다 — 속성이 없는(=시간을 타지 않는) 메시가 읽어도 그대로 보인다.
    this.width = Math.max(2, this.slot.size + 1);
    this.cur = new Float32Array(this.width).fill(1);
    this.tgt = new Float32Array(this.width).fill(1);
    this.data = new Uint8Array(this.width * 4).fill(255);
    this.tex = null;
    // 전 재질이 같은 객체를 본다 (물질화 유니폼과 같은 방식).
    // 칸이 늘어나면 .value 만 갈아 끼우므로 이미 컴파일된 셰이더도 새 텍스처를 본다.
    this.uniforms = { uTimeTex: { value: null }, uTimeN: { value: this.width } };
    this.external = new Set();       // 외부가 직접 모는 칸 (전장 오버레이 등)
    this.reserved = new Map();       // key -> slot
    this._makeTexture();
    this._pending = null;            // 아직 diff 하지 않은 (year, enabled)
    this._lastDiff = -1e9;
    this._moving = false;
    this._patched = new WeakSet();
  }

  /** 시간을 타는 대상이 하나라도 있는가 (없으면 전 경로가 no-op) */
  get active() { return (this.slot.size + this.reserved.size) > 0; }

  get count() { return this.slot.size; }

  /** 지금 전환 중인가 — 소비자(아바타 명도·명패)가 이 값으로 갱신 시점을 잡는다 */
  get moving() { return this._moving; }

  _makeTexture() {
    const tex = new THREE.DataTexture(this.data, this.width, 1, THREE.RGBAFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    // 여러 재질이 유니폼으로 공유한다 — 그중 하나를 폐기해도 이 텍스처는 살아남아야 한다.
    // 회수는 TimeField.dispose() 한 곳에서만 한다 (disposeDeep 은 __fanKeep 를 건너뛴다).
    tex.__fanKeep = true;
    tex.needsUpdate = true;
    if (this.tex) { this.tex.__fanKeep = false; this.tex.dispose(); }
    this.tex = tex;
    this.uniforms.uTimeTex.value = tex;
    this.uniforms.uTimeN.value = this.width;
  }

  /**
   * 외부가 직접 모는 칸을 빌린다 (전장 오버레이가 사이트마다 하나씩 쓴다).
   * 이미 패치된 재질들도 같은 유니폼 객체를 보므로 칸이 늘어나도 다시 컴파일하지 않는다.
   * @returns Map(key -> slot)
   */
  reserve(keys) {
    const list = (keys || []).filter((k) => k != null && !this.reserved.has(k));
    if (list.length) {
      const w0 = this.width;
      const width = w0 + list.length;
      const cur = new Float32Array(width).fill(1); cur.set(this.cur);
      const tgt = new Float32Array(width).fill(1); tgt.set(this.tgt);
      const data = new Uint8Array(width * 4).fill(255); data.set(this.data);
      this.width = width; this.cur = cur; this.tgt = tgt; this.data = data;
      list.forEach((k, i) => {
        const slot = w0 + i;
        this.reserved.set(k, slot);
        this.external.add(slot);
        this.cur[slot] = 0;
        this.tgt[slot] = 0;
        this._writeByte(slot);
      });
      this._makeTexture();
    }
    const out = new Map();
    for (const k of (keys || [])) if (this.reserved.has(k)) out.set(k, this.reserved.get(k));
    return out;
  }

  /** 예약 칸의 목표 존재도 (0~1). 전환은 update 가 같은 속도 규칙으로 굴린다. */
  setSlot(slot, value) {
    if (slot == null || slot <= 0 || slot >= this.width) return;
    this.tgt[slot] = clamp(Number(value) || 0, 0, 1);
  }

  _writeByte(i) {
    const b = Math.round(clamp(this.cur[i], 0, 1) * 255);
    const o = i * 4;
    this.data[o] = b; this.data[o + 1] = b; this.data[o + 2] = b;
  }

  /** 정점·인스턴스 속성에 담을 칸 번호. 창이 없으면 0 (항상 존재). */
  slotFor(nodeId) { return this.slot.get(nodeId) || 0; }

  /** 지금 이 노드가 얼마나 존재하는가 (0~1) — 명패·아바타 판정에 쓴다 */
  presenceOf(nodeId) {
    const s = this.slot.get(nodeId);
    return s == null ? 1 : this.cur[s];
  }

  /** 연도 창 안인가 (열린 끝은 무한으로 본다) */
  inWindow(span, year) {
    const [from, to] = span;
    if (from != null && year < from) return false;
    if (to != null && year > to) return false;
    return true;
  }

  /**
   * 슬라이더가 움직였다. **여기서는 아무것도 계산하지 않는다** —
   * 같은 값이면 즉시 반환하고, 다르면 다음 update 에서 스로틀에 걸어 한 번만 diff 한다.
   */
  setYear(year, enabled) {
    const on = !!enabled;
    const y = Math.round(Number(year));
    if (!isFinite(y)) return;
    if (this.year === y && this.enabled === on) return;
    this.year = y;
    this.enabled = on;
    this._pending = { year: y, on };
  }

  /** 목표 존재도 재계산 — 연도가 바뀐 순간에만 (매 프레임 금지) */
  _diff() {
    const { year, on } = this._pending;
    this._pending = null;
    this._lastDiff = performance.now();
    // 외부가 모는 칸(전장 등)은 건드리지 않는다 — 주인이 따로 있다
    for (let i = 1; i < this.width; i++) if (!this.external.has(i)) this.tgt[i] = 1;
    if (!on) return;
    for (const [id, span] of this.spans) {
      const s = this.slot.get(id);
      this.tgt[s] = this.inWindow(span, year) ? 1 : 0;
    }
  }

  /** 매 프레임: 시작된 전환만 보간한다. dt 는 초. */
  update(dt) {
    if (!this.active) return;
    if (this._pending && performance.now() - this._lastDiff >= TIME.THROTTLE_MS) this._diff();
    let moving = false;
    let dirty = false;
    const ms = Math.max(0, dt) * 1000;
    for (let i = 1; i < this.width; i++) {
      const c = this.cur[i], t = this.tgt[i];
      if (c === t) continue;
      const dur = t > c ? TIME.FADE_IN_MS : TIME.FADE_OUT_MS;
      const step = ms / Math.max(1, dur);
      let v = t > c ? Math.min(t, c + step) : Math.max(t, c - step);
      if (Math.abs(v - t) < 0.002) v = t;
      this.cur[i] = v;
      const before = this.data[i * 4];
      this._writeByte(i);
      if (this.data[i * 4] !== before) dirty = true;
      moving = true;
    }
    if (dirty && this.tex) this.tex.needsUpdate = true;
    this._moving = moving;
  }

  /**
   * 재질에 시간 디졸브를 덧댄다 — **style.js 의 홀로그램 패치 위에 얹는 체인**이다.
   * 전제: 이 재질은 이미 patchFanMaterial 을 거쳤다 (vFanWorld · fanNoise3 · uHoloA/B 가 있다).
   * 그렇지 않은 재질은 건드리지 않는다 (조용히 통과).
   */
  patch(mat, key) {
    if (!mat || !mat.userData || !mat.userData.fanPatch) return mat;
    if (this._patched.has(mat)) return mat;
    if (!this.active) return mat;                 // 시간을 타는 노드가 없으면 셰이더를 늘리지 않는다
    const u = this.uniforms;
    const prev = mat.onBeforeCompile;
    const NS = TIME.NOISE_SCALE.toFixed(4);
    const ED = TIME.EDGE.toFixed(3);
    const GA = TIME.EDGE_GAIN.toFixed(2);

    mat.onBeforeCompile = (shader) => {
      if (typeof prev === 'function') prev(shader);
      shader.uniforms.uTimeTex = u.uTimeTex;
      shader.uniforms.uTimeN = u.uTimeN;
      injectTimeVertex(shader);
      injectTimeFragment(shader, NS, ED);
      // 경계 발광 — 물질화 에지와 같은 색 유니폼을 쓴다 (하나의 언어)
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <opaque_fragment>',
        /* glsl */`
      #include <opaque_fragment>
      if (fanTimeEdge > 0.0) {
        vec3 fanTimeCol = mix(uHoloA, uHoloB, 0.5 + 0.5 * sin(vFanWorld.y * 0.16 + uTime * 1.6));
        gl_FragColor.rgb += fanTimeCol * fanTimeEdge * ${GA};
      }
      `);
    };
    mat.customProgramCacheKey = () => `fan|time|${key}`;
    // 그림자도 같이 사라져야 한다 — three 는 depth 재질에 onBeforeCompile 을 가져가지 않으므로
    // 같은 규칙을 굽는 주입기를 재질에 얹어 둔다 (style.fanDepthMaterial 이 이걸 읽는다).
    mat.userData.fanDepthPatch = (shader) => {
      shader.uniforms.uTimeTex = u.uTimeTex;
      shader.uniforms.uTimeN = u.uTimeN;
      injectTimeVertex(shader);
      injectTimeFragment(shader, NS, ED);
    };
    mat.userData.fanDepthKey = 'time-' + key;
    mat.needsUpdate = true;
    this._patched.add(mat);
    return mat;
  }

  dispose() {
    if (this.tex) { this.tex.__fanKeep = false; this.tex.dispose(); }
    this.tex = null;
    this.uniforms.uTimeTex.value = null;
  }
}

/* ─────────────────────────────────────────────────────────────
   셰이더 주입 — 컬러 패스와 그림자 depth 패스가 같은 코드를 쓴다
   ───────────────────────────────────────────────────────────── */

/** aTimeIdx(정점·인스턴스 속성) → varying. 앵커는 begin_vertex — depth 셰이더에도 있다. */
function injectTimeVertex(shader) {
  shader.vertexShader = 'attribute float aTimeIdx;\nvarying float vFanTimeIdx;\n' + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    '#include <begin_vertex>\n  vFanTimeIdx = aTimeIdx;');
}

/**
 * 존재도 < 1 이면 노이즈 임계로 깎아 낸다. 임계를 -EDGE ~ 1+EDGE 로 훑으므로
 * 0 에서는 전부 discard, 1 에서는 전부 통과다. fanTimeEdge 는 경계 발광 계수.
 * fanNoise3 · vFanWorld 는 style.js 의 물질화 패치가 이미 선언해 두었다.
 */
function injectTimeFragment(shader, noiseScale, edge) {
  shader.fragmentShader = `
    uniform sampler2D uTimeTex;
    uniform float uTimeN;
    varying float vFanTimeIdx;
  ` + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <clipping_planes_fragment>',
    /* glsl */`
      #include <clipping_planes_fragment>
      float fanTimeEdge = 0.0;
      if (vFanTimeIdx > 0.5) {
        float fanPres = texture2D(uTimeTex, vec2((vFanTimeIdx + 0.5) / uTimeN, 0.5)).r;
        if (fanPres < 0.999) {
          float fanTn = fanNoise3(vFanWorld * ${noiseScale});
          float fanTthr = mix(-${edge}, 1.0 + ${edge}, smoothstep(0.0, 1.0, fanPres));
          float fanTd = fanTthr - fanTn;
          if (fanTd < 0.0) discard;
          fanTimeEdge = 1.0 - smoothstep(0.0, ${edge}, fanTd);
        }
      }
      `);
}

/**
 * 이미 만들어진 그룹의 재질들에 시간 디졸브를 건다.
 * 지오메트리에 `aTimeIdx` 가 있는 메시만 대상이다 — 지형·식생은 시간을 타지 않는다.
 * (엔진에 add 하기 **전에** 불러야 그림자 depth 재질까지 같은 규칙으로 구워진다.)
 */
export function patchGroupTime(group, timeField, prefix = 'lm') {
  if (!group || !timeField || !timeField.active) return 0;
  let n = 0;
  group.traverse((o) => {
    if (!o.isMesh || !o.geometry || !o.geometry.getAttribute('aTimeIdx')) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m, i) => {
      if (!m) return;
      timeField.patch(m, `${prefix}-${o.name || 'mesh'}-${i}`);
      n++;
    });
  });
  return n;
}

/** 인스턴스 필드에 칸 번호를 붙인다 (깃발·아바타처럼 인스턴스 하나가 노드 하나일 때) */
export function setInstanceTimeIndex(geometry, slots) {
  if (!geometry || !slots || !slots.length) return null;
  const attr = new THREE.InstancedBufferAttribute(Float32Array.from(slots), 1);
  geometry.setAttribute('aTimeIdx', attr);
  return attr;
}

/** 정점마다 같은 칸 번호를 채운 속성 (병합 전 파트 지오메트리에 쓴다) */
export function fillVertexTimeIndex(geometry, slot) {
  if (!geometry) return null;
  const p = geometry.getAttribute('position');
  if (!p) return null;
  const arr = new Float32Array(p.count).fill(slot);
  const attr = new THREE.BufferAttribute(arr, 1);
  geometry.setAttribute('aTimeIdx', attr);
  return attr;
}
