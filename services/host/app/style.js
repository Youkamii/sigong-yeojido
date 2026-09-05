// app/style.js — worldstyle(§4b) 소비 · 팔레트 틴트 · 홀로그램 물질화 셰이더 패치
//
// 아트 정본: docs/03-art-bible.md — 색·베벨·비례는 전부 artbible.js 토큰에서 온다.
// 재질은 materials.js 의 MeshPhysicalMaterial 프리셋만 쓴다.
// (구 계약의 툰 램프 방식은 전면 폐기됐다 — §0)
import * as THREE from 'three';
import { canvasTexture, toColor, rngFor, clamp } from './util.js';
import { makeMaterial } from './materials.js';
import {
  BAND as ART_BAND, BIOME_COLOR, FACTION_TINTS, HOLO, LABEL, LIGHT, SKY, TYPE_HUE,
  UI as UI_TOKEN, WHITE, rgba, tint as tintColor, capSaturation, mix as mixHex,
  TINT, FACTION_GLOW, KEY_DIR,
} from './artbible.js';

/* ══════════════════════════════════════════════════════════
   공유 유니폼 — 전 머티리얼이 같은 객체를 참조한다.
   값 하나 바꾸면 세계 전체가 같이 반응한다 (물질화·바람·시간).
   ══════════════════════════════════════════════════════════ */
export const U = {
  time:        { value: 0 },
  materialize: { value: 1 },   // 0 = 미소환, 1 = 완전 물질화
  matMinY:     { value: -80 },
  matMaxY:     { value: 90 },
  wind:        { value: 1 },
  holoA:       { value: new THREE.Color(HOLO.A) },   // 금
  holoB:       { value: new THREE.Color(HOLO.B) },   // 청록
  // 물질화 합성 계수 — 지표·구조물·하늘이 **같은 객체**를 본다 (하나의 그림, §3)
  holoMul:     { value: new THREE.Vector3(HOLO.TINT_MUL[0], HOLO.TINT_MUL[1], HOLO.TINT_MUL[2]) },
  holoAdd:     { value: new THREE.Color(HOLO.TINT_ADD) },
  holoBGain:   { value: HOLO.TINT_B_GAIN },
};

/** 물질화 스윕의 임계 구간 — 셰이더와 소환 스캔 링이 같은 수치를 쓴다 */
export const MAT_THR_LO = -0.15;
export const MAT_THR_HI = 1.60;

/* ══════════════════════════════════════════════════════════
   기본 팔레트 (worldstyle 없을 때의 내장 기본값 — 계약 §4b)
   ══════════════════════════════════════════════════════════ */
export const DEFAULT_STYLE = {
  mood: {
    skyTop: SKY.TOP, skyHorizon: SKY.HORIZON, sunColor: SKY.SUN,
    fogColor: SKY.FOG, ambient: LIGHT.FILL.ambientRef, timeOfDay: 'golden',
  },
  biomes: {}, factionStyles: {}, eraMoods: {},
  notes: '내장 기본 아트 디렉션 — 황금빛 오후의 브리튼.',
};

/**
 * 시간대 프리셋 — **방향은 아트 바이블 §1.4 고정값(고도 38°·방위 -35°)이다.**
 * 시간대는 세기·별·블룸만 바꾼다. 하늘의 태양 원반과 KEY 라이트가 어긋나지 않게
 * sunDir 은 전부 KEY_DIR 을 돌려준다.
 */
const TIME_PRESETS = {
  golden: { sunDir: KEY_DIR, sunI: 3.0, hemiI: 1.05, star: 0.35, bloom: 0.62 },
  day:    { sunDir: KEY_DIR, sunI: 3.3, hemiI: 1.25, star: 0.05, bloom: 0.5 },
  dusk:   { sunDir: KEY_DIR, sunI: 2.3, hemiI: 0.9,  star: 0.7,  bloom: 0.8 },
  night:  { sunDir: KEY_DIR, sunI: 1.1, hemiI: 0.7,  star: 1.0,  bloom: 0.95 },
};
export const timePreset = (t) => TIME_PRESETS[t] || TIME_PRESETS.golden;

/** placeType → 기본 바이옴 (worldstyle.biomes 가 우선) */
export const PLACE_BIOME = {
  kingdom: 'meadow', castle: 'meadow', city: 'meadow', village: 'meadow',
  forest: 'forest', mountain: 'rock', island: 'meadow', lake: 'water',
  battlefield: 'rock', otherworld: 'mystic',
};

/** 바이옴 팔레트 — [저지대색, 고지대색] + 밀도. 색은 전부 팔레트 파생. */
export const BIOME_DEF = {
  meadow: { palette: [BIOME_COLOR.meadow.low, BIOME_COLOR.meadow.high], density: 0.35, tree: 0.25 },
  forest: { palette: [BIOME_COLOR.forest.low, BIOME_COLOR.forest.high], density: 1.0,  tree: 1.0 },
  rock:   { palette: [BIOME_COLOR.rock.low,   BIOME_COLOR.rock.high],   density: 0.18, tree: 0.1 },
  snow:   { palette: [BIOME_COLOR.snow.low,   BIOME_COLOR.snow.high],   density: 0.05, tree: 0.05 },
  water:  { palette: [BIOME_COLOR.water.low,  BIOME_COLOR.water.high],  density: 0.2,  tree: 0.12 },
  mystic: { palette: [BIOME_COLOR.mystic.low, BIOME_COLOR.mystic.high], density: 0.6,  tree: 0.5 },
};

/** 고도·경사 밴딩 색 */
export const BAND = {
  sand:  new THREE.Color(ART_BAND.SAND),
  rock:  new THREE.Color(ART_BAND.ROCK),
  cliff: new THREE.Color(ART_BAND.CLIFF),
  snow:  new THREE.Color(ART_BAND.SNOW),
  deep:  new THREE.Color(ART_BAND.DEEP),
};

/** 노드 타입 색 — 아바타·라벨·범례 공통 (artbible TYPE_HUE) */
export const TYPE_COLOR = {
  Place:     TYPE_HUE.Place,
  Character: TYPE_HUE.Character,
  Event:     TYPE_HUE.Event,
  Faction:   TYPE_HUE.Faction,
  Artifact:  TYPE_HUE.Artifact,
  Species:   TYPE_HUE.Species,
  Power:     TYPE_HUE.Power,
};
export const TYPE_LABEL = {
  Place: '장소', Character: '인물', Event: '사건', Faction: '세력',
  Artifact: '사물', Species: '종족', Power: '힘',
};

/** 세력 깃발 기본 팔레트 — worldstyle.factionStyles 없을 때 결정론 배정 (채도 캡 통과) */
const FACTION_PALETTE = FACTION_TINTS;

/* ══════════════════════════════════════════════════════════
   worldstyle 정규화 — 없거나 망가져도 완전 동작 (계약 §4b)
   ══════════════════════════════════════════════════════════ */
export function normalizeStyle(raw) {
  const s = { ...DEFAULT_STYLE };
  const src = raw && typeof raw === 'object' ? raw : {};
  const m = src.mood && typeof src.mood === 'object' ? src.mood : {};
  s.mood = {
    skyTop: moodHex(m.skyTop, DEFAULT_STYLE.mood.skyTop),
    skyHorizon: moodHex(m.skyHorizon, DEFAULT_STYLE.mood.skyHorizon),
    sunColor: moodHex(m.sunColor, DEFAULT_STYLE.mood.sunColor),
    fogColor: moodHex(m.fogColor, DEFAULT_STYLE.mood.fogColor),
    ambient: typeof m.ambient === 'number' ? clamp(m.ambient, 0.05, 1.6) : DEFAULT_STYLE.mood.ambient,
    timeOfDay: TIME_PRESETS[m.timeOfDay] ? m.timeOfDay : DEFAULT_STYLE.mood.timeOfDay,
  };
  s.biomes = src.biomes && typeof src.biomes === 'object' ? src.biomes : {};
  s.factionStyles = src.factionStyles && typeof src.factionStyles === 'object' ? src.factionStyles : {};
  s.eraMoods = src.eraMoods && typeof src.eraMoods === 'object' ? src.eraMoods : {};
  s.notes = typeof src.notes === 'string' ? src.notes : DEFAULT_STYLE.notes;
  s.__ai = !!(raw && (raw.mood || raw.biomes || raw.notes));
  return s;
}
/** '#rrggbb' 형식이면 정규화해 돌려주고, 아니면 null. (규율 적용 전의 원색) */
function rawHex(v) {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!/^#?[0-9a-fA-F]{6}$/.test(t)) return null;
  return t[0] === '#' ? t.toLowerCase() : '#' + t.toLowerCase();
}

/**
 * AI 가 준 mood 색을 **팔레트 규율 안으로** 끌어들인다 (P9 · §1.1).
 *
 * mood 색은 KEY 광원색·반구광·안개·PMREM 환경맵으로 곧장 들어가 세계 전체의 빛이 된다.
 * 검증만 하고 그대로 쓰면 `#ff2fbf` 같은 형광색이 태양이 되어 12색 팔레트가 무의미해진다.
 * 그래서 세력색과 **같은 종류의 규율**을 건다: ① 채도 상한 ② 팔레트 앵커와의 혼합 상한.
 * (fb 는 언제나 팔레트 파생 토큰이므로 결과도 팔레트에 묶인다.)
 */
function moodHex(v, fb) {
  const ai = rawHex(v);
  if (!ai) return fb;
  return mixHex(fb, capSaturation(ai, TINT.MOOD_SAT_CAP), TINT.MOOD_MAX_MIX);
}

/** 장소의 바이옴 정의 (worldstyle 우선 → placeType 기본) */
export function biomeFor(style, placeId, placeType) {
  const ws = style.biomes[placeId];
  const name = (ws && BIOME_DEF[ws.biome]) ? ws.biome : (PLACE_BIOME[placeType] || 'meadow');
  const def = BIOME_DEF[name];
  // 지표는 화면 면적의 최대 지분이다 — AI 바이옴색은 세력색과 **같은 틴트 규약**으로만 얹는다
  // (채도 0.35 캡 + 혼합량 0.35 캡). 바이옴 기본색이 언제나 바탕에 남는다 (§1.1).
  const pal = (ws && Array.isArray(ws.palette) && ws.palette.length >= 1)
    ? [0, 1].map((i) => {
      const base = def.palette[i] || def.palette[0];
      const ai = rawHex(ws.palette[i]);
      return ai ? tintColor(base, ai, TINT.MAX_MIX) : base;
    })
    : def.palette;
  const density = (ws && typeof ws.density === 'number') ? clamp(ws.density, 0, 2) : def.density;
  return {
    name,
    low: toColor(pal[0], def.palette[0]),
    high: toColor(pal[1] || pal[0], def.palette[1]),
    density,
    tree: def.tree * (density / (def.density || 1)),
  };
}

/**
 * 바이옴 이름(§1 어휘 6종)으로 바로 정의를 얻는다 — 작가가 브러시로 칠한 구간용 (#15).
 * placeType 을 거치지 않으므로 'snow' 처럼 대응 장소 유형이 없는 바이옴도 쓸 수 있다.
 * 이름이 어휘 밖이면 null (호출부가 기본 경로로 되돌아간다).
 */
export function biomeByName(name) {
  const def = BIOME_DEF[name];
  if (!def) return null;
  return {
    name,
    low: toColor(def.palette[0]),
    high: toColor(def.palette[1] || def.palette[0]),
    density: def.density,
    tree: def.tree,
  };
}

/**
 * 세력 색 — worldstyle.factionStyles.banner 우선, 없으면 결정론 배정.
 * 외부에서 온 색은 **틴트 규약**(채도 0.35 캡)을 통과시켜 화면이 알록달록해지지 않게 한다 (§1.1).
 */
export function factionColor(style, factionId, index = 0) {
  const fs = style.factionStyles[factionId];
  if (fs && typeof fs.banner === 'string') {
    // 배너는 세력색을 보여주되 채도 상한을 강제한다 — 지면 틴트는 tintWithFaction 이 따로 처리한다.
    return toColor(capSaturation(rawHex(fs.banner) || FACTION_PALETTE[0]));
  }
  const rng = rngFor('faction', factionId);
  const pick = FACTION_PALETTE[(index + Math.floor(rng() * FACTION_PALETTE.length)) % FACTION_PALETTE.length];
  return toColor(pick);
}
/**
 * 세력 발광 세기 (§4b factionStyles[*].glow, 0~1).
 * 소비처: views.js 의 세력 표식 헤일로 배율 — 기본값(0.3)이면 배율 1.0 이라 화면이 그대로다.
 */
export function factionGlow(style, factionId) {
  const fs = style.factionStyles && style.factionStyles[factionId];
  return fs && typeof fs.glow === 'number' ? clamp(fs.glow, 0, 1) : FACTION_GLOW.DEFAULT;
}

/** glow(0~1) → 헤일로 크기 배율 (FACTION_GLOW.DEFAULT 가 1.0) */
export function factionHaloScale(style, factionId) {
  const g = factionGlow(style, factionId);
  return FACTION_GLOW.HALO_MIN + (FACTION_GLOW.HALO_MAX - FACTION_GLOW.HALO_MIN) * g;
}

/** eraMoods[eraId] — {tint, notes}. tint 는 채도 캡을 통과한 값만 돌려준다 (§4b · P9). */
export function eraMood(style, eraId) {
  const em = style && style.eraMoods ? style.eraMoods[eraId] : null;
  if (!em || typeof em !== 'object') return null;
  const raw = rawHex(em.tint);
  return {
    tint: raw ? capSaturation(raw, TINT.SAT_CAP) : null,
    notes: typeof em.notes === 'string' ? em.notes : '',
  };
}

/** 팔레트 위 세력색 틴트 — 지형·구조물이 세력색을 "덮어쓰지 않고" 물들일 때 쓴다 */
export function tintWithFaction(baseHex, factionHex, amount) {
  return tintColor(baseHex, factionHex, amount);
}

/* ══════════════════════════════════════════════════════════
   셰이더 조각 — 노이즈 (홀로그램 디졸브용)
   ══════════════════════════════════════════════════════════ */
export const FAN_NOISE_GLSL = /* glsl */`
float fanHash13(vec3 p){
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}
float fanNoise3(vec3 x){
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = fanHash13(i + vec3(0.0,0.0,0.0));
  float n100 = fanHash13(i + vec3(1.0,0.0,0.0));
  float n010 = fanHash13(i + vec3(0.0,1.0,0.0));
  float n110 = fanHash13(i + vec3(1.0,1.0,0.0));
  float n001 = fanHash13(i + vec3(0.0,0.0,1.0));
  float n101 = fanHash13(i + vec3(1.0,0.0,1.0));
  float n011 = fanHash13(i + vec3(0.0,1.0,1.0));
  float n111 = fanHash13(i + vec3(1.0,1.0,1.0));
  return mix(mix(mix(n000,n100,f.x), mix(n010,n110,f.x), f.y),
             mix(mix(n001,n101,f.x), mix(n011,n111,f.x), f.y), f.z);
}
`;

/* ══════════════════════════════════════════════════════════
   머티리얼 패치 — 홀로그램 물질화 + 바람
   (§3: 아래서 위로 디졸브, 금-청록 발광 에지)
   PBR 머티리얼에서도 동작하도록 합성 지점을 opaque_fragment 직후로 잡는다 —
   톤매핑·색공간 변환 **전**이라 추가된 발광이 블룸·ACES 를 정상으로 통과한다.

   **림 라이트는 여기 없다.** 실루엣 분리는 리그의 RIM DirectionalLight 하나가 담당한다 (§1.4).
   예전엔 여기서 뷰공간 프레넬을 가산했는데, 그건 KEY/FILL/RIM/ENV 밖의 다섯 번째 광원이었고
   opaque_fragment **뒤**에 더해져 roughness·metalness·sheen·clearcoat 를 전혀 통과하지 않았다 —
   금·천·석재의 가장자리가 똑같은 값으로 밝아져 P4(빛 반응으로 재질을 가른다)가 실루엣에서 무너졌다.
   ══════════════════════════════════════════════════════════ */
const _patched = new WeakSet();

function normalizePatchOpts(opts) {
  return {
    wind: opts.wind || 0,           // 0 = 없음, >0 = 흔들림 세기
    windAxis: opts.windAxis || 'y', // 'y' 식생(위로 갈수록), 'x' 깃발(끝으로 갈수록)
    key: opts.key || 'base',
  };
}

/** 공유 유니폼 바인딩 — 컬러 패스와 그림자 depth 패스가 같은 객체를 본다 */
function bindFanUniforms(shader, o) {
  shader.uniforms.uTime = U.time;
  shader.uniforms.uMaterialize = U.materialize;
  shader.uniforms.uMatMinY = U.matMinY;
  shader.uniforms.uMatMaxY = U.matMaxY;
  shader.uniforms.uWindGlobal = U.wind;
  shader.uniforms.uWindAmp = { value: o.wind };
}

/** 버텍스: 바람 변위 + 월드 좌표 varying (디졸브 판정의 근거) */
function injectFanVertex(shader, o) {
  shader.vertexShader = `
      uniform float uTime;
      uniform float uWindGlobal;
      uniform float uWindAmp;
      varying vec3 vFanWorld;
    ` + shader.vertexShader;

  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    /* glsl */`
      #include <begin_vertex>
      #ifdef USE_INSTANCING
        vec3 fanAnchor = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      #else
        vec3 fanAnchor = vec3(modelMatrix[3][0], modelMatrix[3][1], modelMatrix[3][2]);
      #endif
      ${o.wind > 0 ? `
      float fanW = sin(uTime * 1.35 + fanAnchor.x * 0.21 + fanAnchor.z * 0.17)
                 + 0.55 * sin(uTime * 2.7 + fanAnchor.z * 0.4);
      float fanFactor = ${o.windAxis === 'x' ? 'abs(position.x)' : 'max(position.y, 0.0)'};
      transformed.x += fanW * uWindAmp * uWindGlobal * fanFactor * 0.09;
      transformed.z += fanW * uWindAmp * uWindGlobal * fanFactor * 0.06;
      ` : ''}
      vec4 fanWP = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        fanWP = instanceMatrix * fanWP;
      #endif
      fanWP = modelMatrix * fanWP;
      vFanWorld = fanWP.xyz;
      `
  );
}

/** 프래그먼트 앞단: 디졸브 discard. withEdge 면 발광 에지 계수(fanEdge)도 남긴다. */
function injectFanDissolve(shader, withEdge) {
  shader.fragmentShader = `
      uniform float uTime;
      uniform float uMaterialize;
      uniform float uMatMinY;
      uniform float uMatMaxY;
      varying vec3 vFanWorld;
      ${FAN_NOISE_GLSL}
    ` + shader.fragmentShader;

  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <clipping_planes_fragment>',
    /* glsl */`
      #include <clipping_planes_fragment>
      float fanSweep = clamp((vFanWorld.y - uMatMinY) / max(uMatMaxY - uMatMinY, 0.001), 0.0, 1.0);
      float fanN = fanNoise3(vFanWorld * 0.055) * 0.55 + fanNoise3(vFanWorld * 0.19) * 0.22;
      float fanThr = mix(${MAT_THR_LO.toFixed(2)}, ${MAT_THR_HI.toFixed(2)}, uMaterialize);
      float fanD = fanThr - (fanSweep * 0.9 + fanN * 0.42);
      if (uMaterialize < 0.999 && fanD < 0.0) discard;
      ${withEdge ? 'float fanEdge = (uMaterialize < 0.999) ? (1.0 - smoothstep(0.0, 0.16, fanD)) : 0.0;' : ''}
      `
  );
}

export function patchFanMaterial(mat, opts = {}) {
  if (!mat || _patched.has(mat)) return mat;
  const o = normalizePatchOpts(opts);
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader) => {
    if (typeof prev === 'function') prev(shader);
    bindFanUniforms(shader, o);
    shader.uniforms.uHoloA = U.holoA;
    shader.uniforms.uHoloB = U.holoB;
    shader.uniforms.uHoloMul = U.holoMul;
    shader.uniforms.uHoloAdd = U.holoAdd;
    shader.uniforms.uHoloBGain = U.holoBGain;

    injectFanVertex(shader, o);
    injectFanDissolve(shader, true);

    shader.fragmentShader = `
      uniform vec3 uHoloA;
      uniform vec3 uHoloB;
      uniform vec3 uHoloMul;
      uniform vec3 uHoloAdd;
      uniform float uHoloBGain;
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      /* glsl */`
      #include <opaque_fragment>
      if (uMaterialize < 0.999) {
        float fanMix = smoothstep(0.15, 0.92, uMaterialize);
        // 합성 계수는 artbible HOLO.TINT_* — 하늘 셰이더도 같은 유니폼을 받는다 (하나의 그림)
        vec3 fanHolo = gl_FragColor.rgb * uHoloMul + uHoloB * uHoloBGain + uHoloAdd;
        gl_FragColor.rgb = mix(fanHolo, gl_FragColor.rgb, fanMix);
        vec3 fanEdgeCol = mix(uHoloA, uHoloB, 0.5 + 0.5 * sin(vFanWorld.y * 0.16 + uTime * 1.6));
        gl_FragColor.rgb += fanEdgeCol * fanEdge * 2.6;
      }
      `
    );
  };
  // 서로 다른 패치가 같은 프로그램을 공유하지 않게 (onBeforeCompile.toString 기본키 회피)
  mat.customProgramCacheKey = () => `fan|${o.key}|${o.wind}|${o.windAxis}`;
  mat.needsUpdate = true;
  mat.userData.fanPatch = o;          // 그림자 depth 재질이 같은 규칙을 다시 굽는 근거
  _patched.add(mat);
  return mat;
}

/**
 * 그림자 전용 깊이 재질 — **컬러 패스와 같은 디졸브·바람을 굽는다.**
 *
 * three 의 그림자 depth 재질 선택은 원본 머티리얼에서 visible/side/alphaMap/alphaTest/map/
 * displacement* 만 복사할 뿐 `onBeforeCompile` 은 가져가지 않는다. 그래서 패치를 안 하면
 *   · 소환 중(디졸브로 아직 안 보이는) 성·산의 그림자가 처음부터 지면에 구워지고
 *   · 나무·풀·깃발은 흔들리는데 그 그림자는 고정이다.
 * 캐스터에 이 재질을 붙이면 두 문제가 함께 사라진다 (engine._tagShadows 가 붙인다).
 */
export function fanDepthMaterial(mat) {
  const o = mat && mat.userData && mat.userData.fanPatch;
  if (!o) return null;
  // 물질화 위에 덧댄 규칙(예: 시간 여행 디졸브)도 그림자에 같이 구워야 한다 —
  // 사라진 성의 그림자가 땅에 남으면 시간 여행이 거짓말이 된다. 주입기는 재질이 들고 있다.
  const extra = mat.userData.fanDepthPatch;
  const extraKey = mat.userData.fanDepthKey || '';
  const d = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  const prev = d.onBeforeCompile;
  d.onBeforeCompile = (shader) => {
    if (typeof prev === 'function') prev(shader);
    bindFanUniforms(shader, o);
    injectFanVertex(shader, o);
    injectFanDissolve(shader, false);
    if (typeof extra === 'function') extra(shader);
  };
  d.customProgramCacheKey = () => `fanDepth|${o.key}|${o.wind}|${o.windAxis}|${extraKey}`;
  d.needsUpdate = true;
  return d;
}

/**
 * 표준 표면 재질 — 세계의 거의 모든 표면이 이걸 쓴다 (MeshPhysicalMaterial).
 *
 * params.preset 으로 아트 바이블 §1.3 프리셋을 고른다 (기본 MAT_STONE).
 * params.detail 을 true 로 줘야 절차 텍스처(bump/roughness)가 붙는다 —
 * uv 가 없는 병합 지오메트리에 텍스처를 물리면 (0,0) 한 점만 샘플링되기 때문이다.
 * 각진 로우폴리 룩은 util.flattenNormals / mergeParts(parts, true) 로 지오메트리에 굽는다.
 */
export function makeSurface(params = {}, patch = {}) {
  const mat = makeMaterial(params.preset || 'MAT_STONE', {
    color: params.color != null ? params.color : WHITE,
    vertexColors: !!params.vertexColors,
    transparent: !!params.transparent,
    opacity: params.opacity != null ? params.opacity : 1,
    side: params.side || THREE.FrontSide,
    alphaTest: params.alphaTest || 0,
    map: params.map || null,
    alphaMap: params.alphaMap || null,
    emissive: params.emissive != null ? params.emissive : undefined,
    roughness: params.roughness,
    metalness: params.metalness,
    flatShading: !!params.flatShading,
    detail: params.detail === true,
    repeat: params.repeat,
  });
  patchFanMaterial(mat, patch);
  return mat;
}

/** 발광체 (룬·수정·홀로그램 링) — 라이팅을 받지 않는 MAT_HOLO 전용 (§1.3) */
export function makeGlow(color, opacity = 1, additive = true, patch = {}) {
  const mat = makeMaterial('MAT_HOLO', {
    color, opacity, additive, side: THREE.DoubleSide, depthWrite: false,
  });
  patchFanMaterial(mat, { key: 'glow', ...patch });
  return mat;
}

/* ══════════════════════════════════════════════════════════
   라벨 아틀라스 — UI 명패 (캔버스 생성, 외부 폰트 요청 0)
   §4: NEUTRAL_BONE 지면 + NEUTRAL_INK 텍스트 + ACCENT_GOLD 트림

   명패를 노드마다 Sprite 로 만들면 **보이는 명패 하나가 드로우콜 하나**다 (three 에는
   스프라이트 배칭이 없다). 예산 250 중 절반을 명패가 먹고, 스프라이트마다 고유 텍스처라
   재소환을 반복해도 회수되지 않았다. 그래서 전 명패를 **아틀라스 한 장**에 굽고
   views.js 가 인스턴스 메시 하나로 그린다 (드로우콜 1).
   ══════════════════════════════════════════════════════════ */

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const LABEL_FONT = `600 ${LABEL.FONT_PX}px "Noto Serif KR","Nanum Myeongjo",Batang,serif`;

class LabelAtlas {
  constructor() {
    this.map = new Map();
    this.canvas = null;
    this.tex = null;
    this.x = 0; this.y = 0;
  }

  _ensure() {
    if (this.canvas) return;
    const A = LABEL.ATLAS;
    this.canvas = document.createElement('canvas');
    this.canvas.width = A; this.canvas.height = A;
    this.ctx = this.canvas.getContext('2d');
    const tex = new THREE.CanvasTexture(this.canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    // 밉맵을 만들면 낮은 밉에서 이웃 명패가 번져 들어온다 — 아틀라스는 선형 필터만 쓴다
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 4;
    tex.__fanKeep = true;
    tex.needsUpdate = true;
    this.tex = tex;
    this.x = 0; this.y = 0;
  }

  /** 아틀라스가 가득 차면 처음부터 다시 굽는다 (호출부가 매 프레임 rect() 로 다시 물어보므로 자가 치유) */
  _reset() {
    this.ctx.clearRect(0, 0, LABEL.ATLAS, LABEL.ATLAS);
    this.map.clear();
    this.x = 0; this.y = 0;
  }

  texture() { this._ensure(); return this.tex; }

  /**
   * 명패 한 장을 아틀라스에 굽고 uv 사각형을 돌려준다.
   * @returns {{u0:number,v0:number,u1:number,v1:number,aspect:number}|null}
   */
  rect(text, kind = 'Place') {
    this._ensure();
    const key = kind + '|' + text;
    const hit = this.map.get(key);
    if (hit) return hit;

    const A = LABEL.ATLAS, H = LABEL.TEX_H;
    const ctx = this.ctx;
    ctx.font = LABEL_FONT;
    const tw = Math.ceil(ctx.measureText(String(text)).width);
    const w = Math.min(LABEL.MAX_W, tw + LABEL.PAD_X * 2);
    const rowH = H + 2;
    if (this.x + w + 2 > A) { this.x = 0; this.y += rowH; }
    if (this.y + rowH > A) { this._reset(); }
    const px = this.x, py = this.y;
    this.x += w + 2;

    // ── 본(bone) 지면 명패 — 색은 전부 artbible 토큰
    const accent = TYPE_COLOR[kind] || UI_TOKEN.TRIM;
    const inset = Math.max(2, Math.round(H * 0.045));
    ctx.save();
    ctx.translate(px, py);
    ctx.clearRect(0, 0, w, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgba(UI_TOKEN.PLATE_TOP, 0.96));
    g.addColorStop(1, rgba(UI_TOKEN.PLATE_BOT, 0.94));
    ctx.fillStyle = g;
    roundRect(ctx, inset, inset, w - inset * 2, H - inset * 2, Math.round(H * 0.115));
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, H * 0.032);
    ctx.strokeStyle = rgba(UI_TOKEN.TRIM_DEEP, 0.85);
    ctx.stroke();
    // 타입 색 악센트 바
    ctx.fillStyle = accent;
    roundRect(ctx, Math.round(H * 0.115), H / 2 - H * 0.195, Math.round(H * 0.08), H * 0.39, 3);
    ctx.fill();
    ctx.font = LABEL_FONT;
    ctx.fillStyle = UI_TOKEN.INK;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(String(text), LABEL.PAD_X, H / 2 + 1, w - LABEL.PAD_X * 2);
    ctx.restore();

    // CanvasTexture 는 flipY 라 v 를 뒤집어 담는다
    const r = {
      u0: px / A, u1: (px + w) / A,
      v0: 1 - (py + H) / A, v1: 1 - py / A,
      aspect: w / H,
    };
    this.map.set(key, r);
    this.tex.needsUpdate = true;
    return r;
  }
}

/** 전 명패가 공유하는 아틀라스 (재소환에도 살아남는다 — __fanKeep) */
export const labelAtlas = new LabelAtlas();

/* ══════════════════════════════════════════════════════════
   절차 텍스처 — 풀·구름 (외부 이미지 0)
   ══════════════════════════════════════════════════════════ */
export function grassAlphaTexture() {
  return canvasTexture(64, 64, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = WHITE;
    for (const [cx, wid, top] of [[16, 7, 10], [32, 9, 3], [48, 7, 14]]) {
      ctx.beginPath();
      ctx.moveTo(cx - wid / 2, h);
      ctx.quadraticCurveTo(cx - wid / 2 + 1, h / 2, cx + 1, top);
      ctx.quadraticCurveTo(cx + wid / 2 - 1, h / 2, cx + wid / 2, h);
      ctx.closePath();
      ctx.fill();
    }
  });
}

export function cloudTexture(seed = 7) {
  return canvasTexture(256, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const rng = rngFor('cloud', String(seed));
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) {
      const x = w * (0.12 + rng() * 0.76);
      const y = h * (0.34 + rng() * 0.42);
      const r = h * (0.14 + rng() * 0.3);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(WHITE, 0.5));
      g.addColorStop(0.55, rgba(WHITE, 0.19));
      g.addColorStop(1, rgba(WHITE, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}
