// app/cataclysm.js — 대격변이 지형 자체를 바꾼다 (계약 §1 cataclysm · §7 "대격변 렌더")
//
// 무엇을 하는가
//   `eventType: "cataclysm"` + `attrs.effect` 사건이 `occursAt` 대상 일대의 **지형**을 바꾼다.
//   연대 슬라이더가 그 해를 지나면:
//     shatter — 대상 일대 지반이 보로노이 파편 4~9개로 갈라져 각기 다른 높이·기울기로 부유하고
//               떠난 자리는 함몰한다. 절단면은 디오라마 암반의 층리를 그대로 쓴다 (§3).
//     sink    — 지반이 내려앉고 그 자리에 물이 든다 (수면 침수).
//     rise    — 새 땅이 솟는다. 솟는 동안 홀로그램 물질화와 **같은 에지색**이 경계에 걸린다.
//     scorch  — 초토 틴트 + 잔불 파티클(인스턴스 1드로우콜).
//
// 어떻게 싸게 하는가 (계약: "드로우콜 폭증이 아니게 머티리얼 공유")
//   · 지반 변형은 메시를 다시 만들지 않는다 — **변형 필드 텍스처 한 장**(96×96 RGBA)을
//     지표·절벽·물·식생·랜드마크의 셰이더가 같이 읽는다. 드로우콜 변화 0.
//   · 파편은 전 사이트를 통틀어 **지오메트리 하나 · 머티리얼 하나**로 병합하고,
//     사이트별 진행도(0~1)만 1×N 텍스처로 넘긴다. 파편이 몇 개든 드로우콜 1.
//   · 잔불은 인스턴스 빌보드 1개. 대격변이 하나도 진행되지 않은 연대에서는 그룹째 꺼진다.
//   · 왕복은 진행도를 되돌리는 것뿐이다 — 파편이 도로 붙고 물이 빠진다.
//   · 연도가 바뀔 때만 diff 하고(THROTTLE_MS), 매 프레임에는 시작된 전환만 보간한다.
//
// 대격변이 하나도 없는 세계에서는 `active === false` 라 **아무 재질도 건드리지 않는다**
// (아서왕 예시 세계에는 리오네스 수몰 sink 가 하나 있어 활성이다 — 회귀 기준으로 삼지 말 것).
import * as THREE from 'three';
import { rngFor, glowTexture, clamp, smoothstep, lerp, mixColor } from './util.js';
import { makeSurface, U } from './style.js';
import { voronoiCell } from './geom2d.js';
import { CATACLYSM as CATA, SURFACE, WHITE, WORLD_SCALE } from './artbible.js';

/** 사건 연도 — 확정값 우선, 범위뿐이면 이른 끝(일어난 순간)을 쓴다 */
function yearOf(attrs) {
  const a = attrs || {};
  if (typeof a.worldYear === 'number' && isFinite(a.worldYear)) return a.worldYear;
  if (typeof a.yearEarliest === 'number' && isFinite(a.yearEarliest)) return a.yearEarliest;
  if (typeof a.yearLatest === 'number' && isFinite(a.yearLatest)) return a.yearLatest;
  return null;
}

export class CataclysmField {
  /** @param idx indexGraph 결과 (좌표는 layout 에서 직접 읽는다 — World 보다 먼저 태어난다) */
  constructor(idx) {
    this.idx = idx;
    this.sites = [];
    this.year = null;
    this.enabled = false;
    this._pending = null;
    this._lastDiff = -1e9;
    this._moving = false;
    this._fieldDirty = true;
    this._patched = new WeakSet();
    this.group = new THREE.Group();
    this.group.name = 'fan-cataclysm';
    this.group.visible = false;
    this.shards = null;
    this.embers = null;

    this._collect();

    const N = Math.max(1, this.sites.length);
    this.prog = new Float32Array(N);          // 현재 진행도
    this.target = new Float32Array(N);        // 목표 진행도
    this.progData = new Uint8Array(N * 4);
    this.progTex = null;

    const F = CATA.FIELD;
    this.fieldData = new Uint8Array(F * F * 4);
    this.fieldTex = null;

    // 전 재질이 같은 객체를 본다 (물질화·시간 여행과 같은 방식)
    this.uniforms = {
      uCataTex: { value: null },
      uCataProg: { value: null },
      uCataN: { value: N },
      uCataSize: { value: 400 },              // 필드가 덮는 월드 한 변 (build 에서 확정)
      uCataScorch: { value: new THREE.Color(CATA.SCORCH) },
      uCataDown: { value: CATA.MAX_DOWN },
      uCataUp: { value: CATA.MAX_UP },
    };
    if (this.active) {
      this._makeFieldTexture();
      this._makeProgTexture();
    }
  }

  /** 대격변이 하나라도 있는가 — 없으면 전 경로가 no-op (아서 회귀 0) */
  get active() { return this.sites.length > 0; }
  get length() { return this.sites.length; }
  get moving() { return this._moving; }

  /* ═══════════════ 1) 사건 수집 ═══════════════ */

  /**
   * cataclysm 사건 → 사이트. 대상은 장소(좌표 있음) 또는 구역(멤버 무게중심).
   * 같은 (대상, effect)가 여러 번이면 **가장 이른 해**를 쓴다 — 그때 이미 벌어졌다.
   * 사이트는 연도 순으로 정렬해 누적 적용 순서를 고정한다 (§1).
   */
  _collect() {
    const idx = this.idx;
    if (!idx || !idx.byType) return;
    const events = idx.byType.get('Event') || [];
    const effects = new Set(CATA.EFFECTS);
    const byKey = new Map();
    // id 순으로 먼저 정렬해 같은 해의 사건도 결정론적으로 들어간다
    const ordered = events.slice().sort((a, b) => String(a.id).localeCompare(String(b.id)));
    for (const ev of ordered) {
      const a = ev.attrs || {};
      if (a.eventType !== 'cataclysm') continue;
      const effect = effects.has(a.effect) ? a.effect : null;
      if (!effect) continue;
      const y = yearOf(a);
      if (y == null) continue;                       // 연도를 모르면 시간에 걸 수 없다
      const at = (idx.outE.get(ev.id) || []).find((e) => e.property === 'occursAt');
      if (!at) continue;
      const spot = this._resolveTarget(at.target);
      if (!spot) continue;
      const key = spot.id + '|' + effect;
      const prev = byKey.get(key);
      if (prev && prev.year <= y) continue;
      byKey.set(key, {
        id: key, targetId: spot.id, eventId: ev.id, effect, year: y,
        x: spot.x, z: spot.z, radius: spot.radius,
      });
    }
    this.sites = Array.from(byKey.values())
      .sort((p, q) => (p.year - q.year) || p.id.localeCompare(q.id));
    this.sites.forEach((s, i) => { s.index = i; });
  }

  /** 대상 id → 월드 좌표·반경. 구역(좌표 없음)은 멤버 장소들의 무게중심을 쓴다 (§1). */
  _resolveTarget(id) {
    const idx = this.idx;
    const S = WORLD_SCALE.LAYOUT;
    const xy = idx.placeXY ? idx.placeXY[id] : null;
    if (Array.isArray(xy) && xy.length >= 2) {
      return { id, x: xy[0] * S, z: xy[1] * S, radius: CATA.RADIUS };
    }
    const regions = (idx.graph && Array.isArray(idx.graph.regions)) ? idx.graph.regions : [];
    const reg = regions.find((r) => r && r.id === id);
    if (!reg) return null;
    let n = 0, cx = 0, cz = 0;
    for (const mid of (Array.isArray(reg.memberPlaceIds) ? reg.memberPlaceIds : [])) {
      const m = idx.placeXY ? idx.placeXY[mid] : null;
      if (!Array.isArray(m) || m.length < 2) continue;
      cx += m[0] * S; cz += m[1] * S; n++;
    }
    if (!n) return null;
    return { id, x: cx / n, z: cz / n, radius: CATA.RADIUS_REGION };
  }

  /* ═══════════════ 2) 텍스처 ═══════════════ */

  _makeFieldTexture() {
    const F = CATA.FIELD;
    const tex = new THREE.DataTexture(this.fieldData, F, F, THREE.RGBAFormat);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.__fanKeep = true;                     // 회수는 dispose() 한 곳에서만
    tex.needsUpdate = true;
    this.fieldTex = tex;
    this.uniforms.uCataTex.value = tex;
  }

  _makeProgTexture() {
    const N = Math.max(1, this.sites.length);
    const tex = new THREE.DataTexture(this.progData, N, 1, THREE.RGBAFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.__fanKeep = true;
    tex.needsUpdate = true;
    this.progTex = tex;
    this.uniforms.uCataProg.value = tex;
    this.uniforms.uCataN.value = N;
  }

  /* ═══════════════ 3) 조립 — 파편 · 잔불 ═══════════════ */

  /**
   * 지형이 선 뒤에 부른다 (heightAt 이 필요하다).
   * 필드가 덮는 범위를 세계 크기에 맞추고, shatter 파편과 scorch 잔불을 만든다.
   */
  build(world) {
    if (!this.active || !world) return this.group;
    this.world = world;
    const ext = Math.max(80, (world.maxRim || 160) * 1.06);
    this.uniforms.uCataSize.value = ext * 2;
    this._buildFieldStamps(ext);
    this._writeField();

    const shatter = this.sites.filter((s) => s.effect === 'shatter');
    if (shatter.length) {
      this.shards = buildShards(shatter, world, this);
      if (this.shards) this.group.add(this.shards);
    }
    const scorch = this.sites.filter((s) => s.effect === 'scorch');
    if (scorch.length) {
      this.embers = buildEmbers(scorch, world, this);
      if (this.embers) this.group.add(this.embers);
    }
    return this.group;
  }

  /**
   * 사이트마다 "어느 픽셀을 얼마나 물들이는가"를 미리 굽는다.
   * 매 프레임 96×96 을 전부 도는 대신 사이트가 닿는 픽셀만 다시 쓴다.
   */
  _buildFieldStamps(ext) {
    const F = CATA.FIELD;
    const size = ext * 2;
    for (const s of this.sites) {
      const cells = [];
      const R = s.radius;
      const toPix = (w) => Math.round(((w + ext) / size) * (F - 1));
      const i0 = Math.max(0, toPix(s.x - R)), i1 = Math.min(F - 1, toPix(s.x + R));
      const j0 = Math.max(0, toPix(s.z - R)), j1 = Math.min(F - 1, toPix(s.z + R));
      for (let j = j0; j <= j1; j++) {
        const wz = (j / (F - 1)) * size - ext;
        for (let i = i0; i <= i1; i++) {
          const wx = (i / (F - 1)) * size - ext;
          const d = Math.hypot(wx - s.x, wz - s.z) / R;
          if (d >= 1) continue;
          // 중심은 평평한 고원, 가장자리에서만 감쇠 (하드 컷 금지 — §3 노이즈 경계와 같은 결)
          const w = 1 - smoothstep(0.42, 1.0, d);
          if (w <= 0.002) continue;
          cells.push(j * F + i, w);
        }
      }
      s.cells = Float32Array.from(cells);
    }
  }

  /** 진행도에 맞춰 변형 필드를 다시 쓴다 (사이트가 움직일 때만) */
  _writeField() {
    const F = CATA.FIELD;
    const data = this.fieldData;
    data.fill(0);
    for (const s of this.sites) {
      const p = this.prog[s.index];
      if (p <= CATA.DONE || !s.cells) continue;
      const down = s.effect === 'shatter' ? CATA.VOID_DEPTH / CATA.MAX_DOWN
        : s.effect === 'sink' ? CATA.SINK_DEPTH / CATA.MAX_DOWN : 0;
      const up = s.effect === 'rise' ? CATA.RISE_HEIGHT / CATA.MAX_UP : 0;
      const burn = s.effect === 'scorch' ? 1 : 0;
      const kill = (s.effect === 'shatter' || s.effect === 'sink') ? 1 : 0;
      for (let k = 0; k < s.cells.length; k += 2) {
        const o = s.cells[k] * 4;
        const w = s.cells[k + 1] * p;
        if (down) data[o] = Math.min(255, data[o] + Math.round(down * w * 255));
        if (up) data[o + 1] = Math.min(255, data[o + 1] + Math.round(up * w * 255));
        if (burn) data[o + 2] = Math.min(255, data[o + 2] + Math.round(burn * w * 255));
        if (kill) data[o + 3] = Math.min(255, data[o + 3] + Math.round(kill * w * 255));
      }
    }
    if (this.fieldTex) this.fieldTex.needsUpdate = true;
  }

  _writeProg() {
    for (let i = 0; i < this.prog.length; i++) {
      const b = Math.round(clamp(this.prog[i], 0, 1) * 255);
      const o = i * 4;
      this.progData[o] = b; this.progData[o + 1] = b; this.progData[o + 2] = b;
      this.progData[o + 3] = 255;
    }
    if (this.progTex) this.progTex.needsUpdate = true;
  }

  /* ═══════════════ 4) 시간 ═══════════════ */

  /** 슬라이더가 움직였다 — 여기서는 계산하지 않는다 (시간 여행과 같은 규칙) */
  setYear(year, enabled) {
    if (!this.active) return;
    const on = !!enabled;
    const y = Math.round(Number(year));
    if (!isFinite(y)) return;
    if (this.year === y && this.enabled === on) return;
    this.year = y;
    this.enabled = on;
    this._pending = { year: y, on };
  }

  _diff() {
    const { year, on } = this._pending;
    this._pending = null;
    this._lastDiff = performance.now();
    for (const s of this.sites) {
      this.target[s.index] = (on && year >= s.year) ? 1 : 0;
    }
  }

  update(dt) {
    if (!this.active) return;
    if (this._pending && performance.now() - this._lastDiff >= CATA.THROTTLE_MS) this._diff();
    let moving = false;
    const step = Math.max(0, dt) * 1000 / Math.max(1, CATA.MS);
    for (let i = 0; i < this.prog.length; i++) {
      const c = this.prog[i], t = this.target[i];
      if (c === t) continue;
      let v = t > c ? Math.min(t, c + step) : Math.max(t, c - step);
      if (Math.abs(v - t) < 0.002) v = t;
      this.prog[i] = v;
      moving = true;
    }
    if (moving) { this._writeProg(); this._writeField(); }
    else if (this._fieldDirty) { this._writeProg(); this._writeField(); this._fieldDirty = false; }
    this._moving = moving;
    let any = false;
    for (let i = 0; i < this.prog.length; i++) if (this.prog[i] > CATA.DONE) { any = true; break; }
    this.group.visible = any;
  }

  /** 지금 이 대상이 얼마나 무너졌는가 (0~1) — 패널·자가검증용 */
  progressOf(targetId, effect) {
    const s = this.sites.find((x) => x.targetId === targetId && (!effect || x.effect === effect));
    return s ? this.prog[s.index] : 0;
  }

  /** 자가검증 요약 */
  state() {
    return {
      count: this.sites.length,
      shards: this.shards ? this.shards.userData.fanShardCount || 0 : 0,
      visible: this.group.visible,
      sites: this.sites.map((s) => ({
        target: s.targetId, effect: s.effect, year: s.year, progress: this.prog[s.index],
      })),
    };
  }

  dispose() {
    if (this.fieldTex) { this.fieldTex.__fanKeep = false; this.fieldTex.dispose(); this.fieldTex = null; }
    if (this.progTex) { this.progTex.__fanKeep = false; this.progTex.dispose(); this.progTex = null; }
    this.uniforms.uCataTex.value = null;
    this.uniforms.uCataProg.value = null;
  }

  /* ═══════════════ 5) 재질 패치 ═══════════════ */

  /**
   * 지반 변형을 재질에 덧댄다 — **style.js 의 물질화 패치 위에 얹는 체인**이다.
   * 전제: 이 재질은 patchFanMaterial 을 거쳤다 (vFanWorld · uHoloA/B 가 있다).
   *
   * 인스턴스 메시인지는 셰이더가 `USE_INSTANCING` 으로 스스로 안다 — 호출부가 고를 것이 없다.
   * @param opts.vanish true 면 파괴 채널에서 스케일이 0 으로 줄어든다 (구조물·식생)
   * @param opts.tint   false 면 색은 건드리지 않는다
   */
  patchSurface(mat, key, opts = {}) {
    if (!this.active || !mat || !mat.userData || !mat.userData.fanPatch) return mat;
    if (this._patched.has(mat)) return mat;
    const u = this.uniforms;
    const o = { vanish: !!opts.vanish, tint: opts.tint !== false };
    const prev = mat.onBeforeCompile;
    const prevKey = typeof mat.customProgramCacheKey === 'function' ? mat.customProgramCacheKey() : 'fan';

    mat.onBeforeCompile = (shader) => {
      if (typeof prev === 'function') prev(shader);
      bindCata(shader, u);
      injectCataVertex(shader, o);
      if (o.tint) injectCataFragment(shader);
    };
    mat.customProgramCacheKey = () => `${prevKey}|cata|${o.vanish ? 1 : 0}|${o.tint ? 1 : 0}`;

    // 그림자도 같이 내려앉아야 한다 — 앞선 패치(시간 디졸브)의 주입기를 지우지 않고 잇는다
    const prevDepth = mat.userData.fanDepthPatch;
    mat.userData.fanDepthPatch = (shader) => {
      if (typeof prevDepth === 'function') prevDepth(shader);
      bindCata(shader, u);
      injectCataVertex(shader, o);
    };
    mat.userData.fanDepthKey = (mat.userData.fanDepthKey || 'base') + '+cata-' + key;
    mat.needsUpdate = true;
    this._patched.add(mat);
    return mat;
  }

  /**
   * 물 — 내려앉은 지반에 물이 든다 (sink 의 "수면 침수").
   * terrain 의 patchWater 가 이미 구운 컷아웃 문자열을 **덧대어** 고친다.
   * 대격변이 없으면 이 함수는 아무것도 하지 않으므로 물 셰이더는 지금까지와 완전히 같다.
   */
  patchWater(mat) {
    if (!this.active || !mat) return mat;
    if (this._patched.has(mat)) return mat;
    const u = this.uniforms;
    const prev = mat.onBeforeCompile;
    mat.onBeforeCompile = (shader) => {
      if (typeof prev === 'function') prev(shader);
      bindCata(shader, u);
      shader.fragmentShader = CATA_FRAG_HEAD + shader.fragmentShader;
      // 컷아웃 판정을 침수량과 함께 다시 본다 (원 문자열이 없으면 조용히 건너뛴다)
      const needle = 'if (fanWd.r <= 0.004) discard;';
      if (shader.fragmentShader.indexOf(needle) >= 0) {
        shader.fragmentShader = shader.fragmentShader.replace(needle, /* glsl */`
      float fanFlood = texture2D(uCataTex, vFanWorld.xz / uCataSize + 0.5).r;
      if (fanWd.r <= 0.004 && fanFlood <= 0.02) discard;`);
        shader.fragmentShader = shader.fragmentShader.replace(
          'float fanDepth = fanWd.r;',
          'float fanDepth = max(fanWd.r, fanFlood * ' + CATA.FLOOD.toFixed(3) + ');');
      }
    };
    mat.customProgramCacheKey = () => 'fan|water|cata';
    mat.needsUpdate = true;
    this._patched.add(mat);
    return mat;
  }
}

/* ══════════════════════════════════════════════════════════════════
   셰이더 주입 — 컬러 패스와 그림자 depth 패스가 같은 코드를 쓴다
   ══════════════════════════════════════════════════════════════════ */

const CATA_FRAG_HEAD = /* glsl */`
  uniform sampler2D uCataTex;
  uniform float uCataSize;
  uniform vec3 uCataScorch;
`;

function bindCata(shader, u) {
  shader.uniforms.uCataTex = u.uCataTex;
  shader.uniforms.uCataProg = u.uCataProg;
  shader.uniforms.uCataN = u.uCataN;
  shader.uniforms.uCataSize = u.uCataSize;
  shader.uniforms.uCataScorch = u.uCataScorch;
  shader.uniforms.uCataDown = u.uCataDown;
  shader.uniforms.uCataUp = u.uCataUp;
}

/**
 * 정점: 변형 필드를 읽어 지반과 함께 오르내리고, 파괴 채널에서 스러진다.
 * 앵커는 `#include <begin_vertex>` — 물질화 패치가 그 include 를 남겨 두므로
 * 이 코드는 **물질화의 vFanWorld 계산보다 앞서** 들어간다 (변위가 반영된 좌표가 넘어간다).
 */
function injectCataVertex(shader, o) {
  shader.vertexShader = /* glsl */`
    uniform sampler2D uCataTex;
    uniform float uCataSize;
    uniform float uCataDown;
    uniform float uCataUp;
  ` + shader.vertexShader;

  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    /* glsl */`
      #include <begin_vertex>
      {
        // 인스턴스는 원점이 곧 그 개체가 선 자리다. 지반 변위는 월드 단위라
        // 인스턴스 스케일로 나눠 로컬 좌표에 얹는다 (나무가 스케일만큼 더 솟지 않게).
        #ifdef USE_INSTANCING
          vec3 fanCA = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
          float fanCS = max(length(vec3(instanceMatrix[1][0], instanceMatrix[1][1], instanceMatrix[1][2])), 0.001);
        #else
          vec3 fanCA = (modelMatrix * vec4(transformed, 1.0)).xyz;
          float fanCS = 1.0;
        #endif
        vec4 fanCF = texture2D(uCataTex, fanCA.xz / uCataSize + 0.5);
        float fanCDy = (fanCF.g * uCataUp - fanCF.r * uCataDown) / fanCS;
        transformed.y += fanCDy;
        ${o.vanish ? /* glsl */`
        {
          float fanKill = smoothstep(0.20, 0.80, fanCF.a);
          #ifdef USE_INSTANCING
            // 인스턴스는 로컬 원점이 곧 그 개체가 선 자리다 — 스칼라 곱이 곧 제자리 축소다.
            transformed *= 1.0 - fanKill;
          #else
            // 병합 랜드마크는 월드 좌표가 지오메트리에 구워져 있다(landmarks.js 가 worldM 을
            // 굽고 계열별로 합친다). 여기서 스칼라 곱을 하면 **세계 원점 쪽으로 끌려가** 구조물이
            // 지도 한복판으로 미끄러진다(리오네스는 원점에서 84단위 — 섬 반지름의 2/3).
            // XZ 는 손대지 않고 지반면(변위가 반영된 수면 높이)으로 눌러 제자리에서 스러지게 한다.
            transformed.y = mix(transformed.y, fanCDy, fanKill);
          #endif
        }` : ''}
      }
      `);
}

/**
 * 프래그먼트: 초토 틴트 + 융기 경계 발광.
 * `vFanWorld` · `uHoloA/uHoloB` · `uTime` 은 물질화 패치가 이미 선언해 두었다 (하나의 언어, §3).
 */
function injectCataFragment(shader) {
  shader.fragmentShader = CATA_FRAG_HEAD + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <opaque_fragment>',
    /* glsl */`
      #include <opaque_fragment>
      {
        vec4 fanCF = texture2D(uCataTex, vFanWorld.xz / uCataSize + 0.5);
        if (fanCF.b > 0.004) {
          gl_FragColor.rgb = mix(gl_FragColor.rgb, uCataScorch, fanCF.b * ${CATA.SCORCH_MIX.toFixed(3)});
        }
        if (fanCF.g > 0.004 && fanCF.g < 0.985) {
          float fanRiseE = 1.0 - abs(fanCF.g * 2.0 - 1.0);
          vec3 fanRiseC = mix(uHoloA, uHoloB, 0.5 + 0.5 * sin(vFanWorld.y * 0.16 + uTime * 1.6));
          gl_FragColor.rgb += fanRiseC * fanRiseE * ${CATA.RISE_GAIN.toFixed(2)} * 0.25;
        }
      }
      `);
}

/**
 * 이미 만들어진 그룹의 재질에 대격변을 건다 (랜드마크처럼 여러 재질을 품은 그룹).
 * 엔진에 add 하기 **전에** 불러야 그림자 depth 재질까지 같은 규칙으로 구워진다.
 */
export function patchGroupCataclysm(group, cata, prefix = 'lm', opts = {}) {
  if (!group || !cata || !cata.active) return 0;
  let n = 0;
  group.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m, i) => {
      if (!m) return;
      cata.patchSurface(m, `${prefix}-${o.name || 'mesh'}-${i}`, opts);
      n++;
    });
  });
  return n;
}

/* ══════════════════════════════════════════════════════════════════
   파편 (shatter) — 보로노이 셀 4~9개, 전 사이트가 지오메트리 하나
   (셀 분할 자체는 geom2d.js — 지도 편집의 판정과 같은 수학을 쓴다)
   ══════════════════════════════════════════════════════════════════ */

/**
 * 파편 한 덩이 = 상면(지형을 그대로 뜬 것) + 층리 측벽 + 하부 역원뿔 (§3 디오라마와 같은 조형).
 * 정점마다 자기 사이트 번호·중심·부양량·기울기를 들고 있어, 셰이더가 진행도 하나로 굴린다.
 */
function buildShardPart(cellPoly, site, world, rng, out) {
  const n = cellPoly.length;
  let cx = 0, cz = 0;
  for (const p of cellPoly) { cx += p[0]; cz += p[1]; }
  cx /= n; cz /= n;
  // 파편 사이에 틈을 낸다 — 붙어 있으면 갈라졌다고 읽히지 않는다
  const ring = cellPoly.map((p) => [
    cx + (p[0] - cx) * CATA.SHARD_GAP,
    cz + (p[1] - cz) * CATA.SHARD_GAP,
  ]);
  const topY = ring.map((p) => Math.max(world.surfaceAt(p[0], p[1]), 0.4));
  const cy = topY.reduce((a, b) => a + b, 0) / n;
  const botY = cy - CATA.SHARD_DEPTH;
  const tipY = botY - CATA.SHARD_DEPTH * CATA.SHARD_TIP * 2;

  // 부양·기울기는 결정론 — 같은 세계면 같은 파편이 같은 자세로 뜬다
  const up = rng();
  const lift = up < 0.28 ? -CATA.SHARD_SINK * (0.4 + rng() * 0.6)
    : CATA.SHARD_LIFT * (0.35 + rng() * 0.9);
  const tiltX = (rng() - 0.5) * 2 * CATA.SHARD_TILT;
  const tiltZ = (rng() - 0.5) * 2 * CATA.SHARD_TILT;

  const biome = typeof world.biomeAt === 'function' ? world.biomeAt(cx, cz) : null;
  const topCol = biome ? mixColor(biome.low, biome.high, 0.45) : new THREE.Color(SURFACE.STRATA_TOP);
  const strata = [
    new THREE.Color(SURFACE.STRATA_TOP),
    new THREE.Color(SURFACE.STRATA_MID),
    new THREE.Color(SURFACE.STRATA_BOTTOM),
  ];

  const push = (x, y, z, c) => {
    out.pos.push(x, y, z);
    out.col.push(c.r, c.g, c.b);
    out.site.push(site.index);
    out.center.push(cx, cy, cz);
    out.lift.push(lift);
    out.tilt.push(tiltX, tiltZ);
  };

  // ① 상면 — 중심에서 부채꼴
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    push(cx, cy, cz, topCol);
    push(ring[i][0], topY[i], ring[i][1], topCol);
    push(ring[j][0], topY[j], ring[j][1], topCol);
  }
  // ② 측벽 — 수평 층리 3층 (층마다 색이 다르다)
  const L = strata.length;
  for (let l = 0; l < L; l++) {
    const y0 = lerp(cy, botY, l / L), y1 = lerp(cy, botY, (l + 1) / L);
    const c = strata[l];
    const shrink0 = 1 - l * 0.02, shrink1 = 1 - (l + 1) * 0.02;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const ax0 = cx + (ring[i][0] - cx) * shrink0, az0 = cz + (ring[i][1] - cz) * shrink0;
      const bx0 = cx + (ring[j][0] - cx) * shrink0, bz0 = cz + (ring[j][1] - cz) * shrink0;
      const ax1 = cx + (ring[i][0] - cx) * shrink1, az1 = cz + (ring[i][1] - cz) * shrink1;
      const bx1 = cx + (ring[j][0] - cx) * shrink1, bz1 = cz + (ring[j][1] - cz) * shrink1;
      const yTop0 = l === 0 ? topY[i] : y0, yTop1 = l === 0 ? topY[j] : y0;
      push(ax0, yTop0, az0, c); push(bx1, y1, bz1, c); push(bx0, yTop1, bz0, c);
      push(ax0, yTop0, az0, c); push(ax1, y1, az1, c); push(bx1, y1, bz1, c);
    }
  }
  // ③ 하부 역원뿔 — 디오라마 섬의 밑면과 같은 수렴
  const tipCol = strata[L - 1];
  const sh = 1 - L * 0.02;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ax = cx + (ring[i][0] - cx) * sh, az = cz + (ring[i][1] - cz) * sh;
    const bx = cx + (ring[j][0] - cx) * sh, bz = cz + (ring[j][1] - cz) * sh;
    push(ax, botY, az, tipCol);
    push(cx, tipY, cz, tipCol);
    push(bx, botY, bz, tipCol);
  }
}

/** 전 shatter 사이트의 파편을 하나의 메시로 (드로우콜 1) */
function buildShards(sites, world, cata) {
  const out = { pos: [], col: [], site: [], center: [], lift: [], tilt: [] };
  let count = 0;
  for (const s of sites) {
    const rng = rngFor('cataclysm', s.id, String(world.seed || 0));
    const n = CATA.SHARD_MIN + Math.floor(rng() * (CATA.SHARD_MAX - CATA.SHARD_MIN + 1));
    const R = s.radius;
    // 경계 = 사이트 반경의 다각형. 씨앗은 그 안에 결정론적으로 흩는다.
    const boundary = [];
    const BN = 22;
    for (let i = 0; i < BN; i++) {
      const a = (i / BN) * Math.PI * 2;
      boundary.push([s.x + Math.cos(a) * R * 0.94, s.z + Math.sin(a) * R * 0.94]);
    }
    const seeds = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rng() * 0.9;
      const rr = R * (0.16 + Math.sqrt(rng()) * 0.62);
      seeds.push([s.x + Math.cos(a) * rr, s.z + Math.sin(a) * rr]);
    }
    for (let i = 0; i < seeds.length; i++) {
      const cell = voronoiCell(seeds, i, boundary);
      if (!cell || cell.length < 3) continue;
      buildShardPart(cell, s, world, rng, out);
      count++;
    }
  }
  if (!out.pos.length) return null;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(out.pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(out.col, 3));
  geo.setAttribute('aCataSite', new THREE.Float32BufferAttribute(out.site, 1));
  geo.setAttribute('aShardC', new THREE.Float32BufferAttribute(out.center, 3));
  geo.setAttribute('aShardLift', new THREE.Float32BufferAttribute(out.lift, 1));
  geo.setAttribute('aShardTilt', new THREE.Float32BufferAttribute(out.tilt, 2));
  geo.computeVertexNormals();                 // non-indexed → 각진 암반 면

  const mat = makeSurface(
    { preset: 'MAT_STONE', vertexColors: true, color: WHITE, detail: false },
    { key: 'cata-shard' });
  patchShardMaterial(mat, cata);

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'fan-shards';
  mesh.frustumCulled = false;
  mesh.userData.fanShardCount = count;
  return mesh;
}

/**
 * 파편 재질 — 진행도 하나로 중심을 축 삼아 기울고 뜬다.
 * 진행도가 0 이면 원래 지반 자리에 정확히 맞물려 있어 "붙어 있는" 상태다 (왕복의 근거).
 */
function patchShardMaterial(mat, cata) {
  const u = cata.uniforms;
  const prev = mat.onBeforeCompile;
  const prevKey = typeof mat.customProgramCacheKey === 'function' ? mat.customProgramCacheKey() : 'fan';
  const inject = (shader) => {
    shader.uniforms.uCataProg = u.uCataProg;
    shader.uniforms.uCataN = u.uCataN;
    shader.vertexShader = /* glsl */`
      attribute float aCataSite;
      attribute vec3 aShardC;
      attribute float aShardLift;
      attribute vec2 aShardTilt;
      uniform sampler2D uCataProg;
      uniform float uCataN;
      varying float vShardP;
    ` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      /* glsl */`
      #include <begin_vertex>
      {
        float fanSp = texture2D(uCataProg, vec2((aCataSite + 0.5) / uCataN, 0.5)).r;
        vShardP = fanSp;
        vec3 fanRel = transformed - aShardC;
        float fanCx = cos(aShardTilt.x * fanSp), fanSx = sin(aShardTilt.x * fanSp);
        float fanCz = cos(aShardTilt.y * fanSp), fanSz = sin(aShardTilt.y * fanSp);
        vec3 fanR1 = vec3(fanRel.x, fanRel.y * fanCx - fanRel.z * fanSx, fanRel.y * fanSx + fanRel.z * fanCx);
        vec3 fanR2 = vec3(fanR1.x * fanCz - fanR1.y * fanSz, fanR1.x * fanSz + fanR1.y * fanCz, fanR1.z);
        vec3 fanNew = aShardC + fanR2 + vec3(0.0, aShardLift * fanSp, 0.0);
        // 아직 갈라지지 않은 파편은 중심 한 점으로 접힌다 — 지반과 겹쳐 깜빡이지 않게 (드로우콜은 그대로 1)
        transformed = mix(aShardC, fanNew, step(0.002, fanSp));
      }
      `);
  };
  mat.onBeforeCompile = (shader) => {
    if (typeof prev === 'function') prev(shader);
    inject(shader);
    // 갈라지는 순간에만 절단면에 물질화 에지색이 스친다 (§3 — 하나의 언어)
    shader.fragmentShader = 'varying float vShardP;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      /* glsl */`
      #include <opaque_fragment>
      if (vShardP > 0.004 && vShardP < 0.996) {
        float fanSe = 1.0 - abs(vShardP * 2.0 - 1.0);
        vec3 fanSc = mix(uHoloA, uHoloB, 0.5 + 0.5 * sin(vFanWorld.y * 0.16 + uTime * 1.6));
        gl_FragColor.rgb += fanSc * fanSe * 0.35;
      }
      `);
  };
  mat.customProgramCacheKey = () => prevKey + '|cata-shard';
  mat.userData.fanDepthPatch = (shader) => inject(shader);
  mat.userData.fanDepthKey = 'cata-shard';
  mat.needsUpdate = true;
  return mat;
}

/* ══════════════════════════════════════════════════════════════════
   잔불 (scorch) — 인스턴스 빌보드 1개. 진행도가 세기를 준다.
   ══════════════════════════════════════════════════════════════════ */
function buildEmbers(sites, world, cata) {
  const items = [];
  for (const s of sites) {
    const rng = rngFor('ember', s.id);
    for (let i = 0; i < CATA.EMBER_PER_SITE; i++) {
      const a = rng() * Math.PI * 2;
      const rr = Math.sqrt(rng()) * s.radius * 0.86;
      const x = s.x + Math.cos(a) * rr, z = s.z + Math.sin(a) * rr;
      items.push({ x, y: world.surfaceAt(x, z) + 0.8, z, seed: rng(), site: s.index });
    }
  }
  if (!items.length) return null;

  const base = new THREE.PlaneGeometry(1, 1, 1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute('position', base.getAttribute('position').clone());
  geo.setAttribute('uv', base.getAttribute('uv').clone());
  geo.setIndex(Array.from(base.getIndex().array));
  geo.instanceCount = items.length;
  base.dispose();

  const aPos = new Float32Array(items.length * 3);
  const aSeed = new Float32Array(items.length);
  const aSite = new Float32Array(items.length);
  items.forEach((it, i) => {
    aPos[i * 3] = it.x; aPos[i * 3 + 1] = it.y; aPos[i * 3 + 2] = it.z;
    aSeed[i] = it.seed;
    aSite[i] = it.site;
  });
  geo.setAttribute('aPos', new THREE.InstancedBufferAttribute(aPos, 3));
  geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(aSeed, 1));
  geo.setAttribute('aCataSite', new THREE.InstancedBufferAttribute(aSite, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: true,
    uniforms: {
      uTime: U.time,
      uMaterialize: U.materialize,
      uMap: { value: glowTexture(96) },
      uColor: { value: new THREE.Color(CATA.EMBER) },
      uOpacity: { value: CATA.EMBER_OPACITY },
      uSize: { value: CATA.EMBER_SIZE },
      uRise: { value: CATA.EMBER_RISE },
      uCataProg: cata.uniforms.uCataProg,
      uCataN: cata.uniforms.uCataN,
    },
    vertexShader: /* glsl */`
      attribute vec3 aPos;
      attribute float aSeed;
      attribute float aCataSite;
      uniform float uTime, uSize, uRise, uCataN;
      uniform sampler2D uCataProg;
      varying vec2 vUv;
      varying float vFade;
      void main(){
        vUv = uv;
        float p = texture2D(uCataProg, vec2((aCataSite + 0.5) / uCataN, 0.5)).r;
        float rise = fract(uTime * (0.10 + aSeed * 0.09) + aSeed);
        vec3 c = aPos;
        c.y += rise * uRise;
        c.x += sin(uTime * (0.5 + aSeed) + aSeed * 27.0) * 1.8 * rise;
        c.z += cos(uTime * (0.4 + aSeed) + aSeed * 19.0) * 1.6 * rise;
        vFade = p * (1.0 - rise) * smoothstep(0.0, 0.18, rise);
        float s = uSize * (0.3 + (1.0 - rise) * 0.8) * p;
        vec4 mv = modelViewMatrix * vec4(c, 1.0);
        mv.xy += position.xy * s;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uMap;
      uniform vec3 uColor;
      uniform float uOpacity, uMaterialize;
      varying vec2 vUv;
      varying float vFade;
      void main(){
        vec4 t = texture2D(uMap, vUv);
        float a = t.a * uOpacity * vFade * clamp(uMaterialize * 1.2, 0.0, 1.0);
        if (a < 0.004) discard;
        gl_FragColor = vec4(uColor, a);
      }`,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.userData.fanNoShadow = true;
  mesh.renderOrder = 3;
  mesh.name = 'fan-embers';
  return mesh;
}
