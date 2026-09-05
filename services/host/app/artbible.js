// app/artbible.js — 디자인 토큰 단일 소스 (정본: docs/03-art-bible.md §1)
//
// 이 파일이 이 저장소에서 **색 hex 리터럴·베벨·비례 상수가 존재할 수 있는 유일한 곳**이다.
// 다른 모듈은 여기서 토큰을 가져오고, 필요하면 색 연산(lighten/darken/mix/tint)으로 파생시킨다.
// 근거: 아트 바이블 P8 (Cohesive Art Direction) · 계약 §7 "하드코딩 금지".
//
// 설계 원칙
//   · 팔레트는 12색으로 고정한다. 그 밖의 모든 색은 12색의 **연산 결과**여야 한다.
//   · 세력색 같은 외부 입력색은 tint()로만 올린다 (채도 0.35 캡).
//   · 수치 토큰(베벨·트림·비례·라이팅·후처리·예산)도 여기서만 정의한다.
//
// **의존 0** — three 도 util 도 import 하지 않는다. 그래야 three 를 건드리면 안 되는
// panels.js 까지 같은 토큰을 쓸 수 있다 (색은 한 곳에서만 나온다).

/* ══════════════════════════════════════════════════════════════════
   0. 스칼라 유틸 (artbible 는 util.js 를 import 하지 않는다 — 순환 방지)
   ══════════════════════════════════════════════════════════════════ */
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerpN = (a, b, t) => a + (b - a) * t;
const byte = (v) => Math.max(0, Math.min(255, Math.round(v)));

/* ══════════════════════════════════════════════════════════════════
   1. 색 연산 유틸 — sRGB 바이트 공간에서 다룬다 (토큰 저작 공간)
   ══════════════════════════════════════════════════════════════════ */

/** '#rrggbb' | '#rgb' → {r,g,b} (0~255). 형식이 아니면 검정. */
export function hexToRgb(hex) {
  let h = String(hex == null ? '' : hex).trim();
  if (h[0] === '#') h = h.slice(1);
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return { r: 0, g: 0, b: 0 };
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** {r,g,b}(0~255) → '#rrggbb' */
export function rgbToHex(c) {
  const n = (byte(c.r) << 16) | (byte(c.g) << 8) | byte(c.b);
  return '#' + n.toString(16).padStart(6, '0');
}

/** 두 색을 t(0~1)로 섞는다. */
export function mix(a, b, t) {
  const x = hexToRgb(a), y = hexToRgb(b), k = clamp01(t);
  return rgbToHex({ r: lerpN(x.r, y.r, k), g: lerpN(x.g, y.g, k), b: lerpN(x.b, y.b, k) });
}

/** 흰쪽으로 amt 만큼. 값(value) 대비를 만들 때 쓴다. */
export function lighten(hex, amt) {
  const c = hexToRgb(hex), k = clamp01(amt);
  return rgbToHex({ r: lerpN(c.r, 255, k), g: lerpN(c.g, 255, k), b: lerpN(c.b, 255, k) });
}

/** 검정쪽으로 amt 만큼. */
export function darken(hex, amt) {
  const c = hexToRgb(hex), k = clamp01(amt);
  return rgbToHex({ r: lerpN(c.r, 0, k), g: lerpN(c.g, 0, k), b: lerpN(c.b, 0, k) });
}

/** HSL 변환 (0~1 정규화) — 채도 캡 계산용 */
export function hexToHsl(hex) {
  const c = hexToRgb(hex);
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  const d = max - min;
  if (d > 1e-6) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h, s, l };
}

export function hslToHex(h, s, l) {
  const hue = ((h % 1) + 1) % 1, sat = clamp01(s), lig = clamp01(l);
  if (sat <= 1e-6) { const v = byte(lig * 255); return rgbToHex({ r: v, g: v, b: v }); }
  const q = lig < 0.5 ? lig * (1 + sat) : lig + sat - lig * sat;
  const p = 2 * lig - q;
  const k = (t) => {
    let tt = t; if (tt < 0) tt += 1; if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return rgbToHex({ r: k(hue + 1 / 3) * 255, g: k(hue) * 255, b: k(hue - 1 / 3) * 255 });
}

/** 채도 상한을 강제한다 (외부 입력색을 팔레트 규율 안으로 끌어들이는 장치) */
export function capSaturation(hex, cap = TINT.SAT_CAP) {
  const { h, s, l } = hexToHsl(hex);
  return s <= cap ? rgbToHex(hexToRgb(hex)) : hslToHex(h, cap, l);
}

/**
 * 세력색 틴트 규약 (§1.1) — 채도 0.35 캡 + 혼합량 0.35 캡. base 를 덮지 않는다.
 * MOOD_MAX_MIX: AI(worldstyle.mood)가 준 하늘·태양·안개색이 팔레트 앵커를 덮을 수 있는 상한.
 *   세력색보다는 크게 허용하되(분위기를 바꾸는 게 목적이다), 앵커의 40% 는 반드시 남긴다.
 * MOOD_SAT_CAP: 하늘·태양색의 채도 상한. 지면 틴트의 0.35 를 쓰면 내장 기본 하늘(황금빛 지평,
 *   채도 0.53)보다도 탁해지므로 하늘 전용으로 더 높게 잡되 형광색(채도 1.0)은 잘라 낸다.
 */
export const TINT = Object.freeze({
  SAT_CAP: 0.35, MAX_MIX: 0.35, DEFAULT_MIX: 0.22,
  MOOD_MAX_MIX: 0.60, MOOD_SAT_CAP: 0.62,
});
export function tint(baseHex, tintHex, amount = TINT.DEFAULT_MIX) {
  const t = capSaturation(tintHex, TINT.SAT_CAP);
  return mix(baseHex, t, Math.min(clamp01(amount), TINT.MAX_MIX));
}

/** CSS rgba() 문자열 — 캔버스·UI 인라인 스타일용 (공백 없이: 기존 정규식 호환) */
export function rgba(hex, alpha = 1) {
  const c = hexToRgb(hex);
  return `rgba(${byte(c.r)},${byte(c.g)},${byte(c.b)},${alpha})`;
}

/** 0xrrggbb 숫자 (setClearColor 등 숫자를 요구하는 API용) */
export function hexNum(hex) {
  const c = hexToRgb(hex);
  return (byte(c.r) << 16) | (byte(c.g) << 8) | byte(c.b);
}

/* ══════════════════════════════════════════════════════════════════
   2. §1.1 팔레트 — 12색 제한 팔레트. 이 밖의 색은 파생으로만 존재한다.
   ══════════════════════════════════════════════════════════════════ */
export const PALETTE = Object.freeze({
  BASE_STONE:     '#8b8378',   // 암반·성벽 — 화면 면적 최대 지분
  BASE_EARTH:     '#6b5c47',   // 흙·절벽
  BASE_VERDANT:   '#5f7a52',   // 식생 (채도 억제)
  BASE_WATER:     '#3c5a6e',   // 수면
  SECOND_SLATE:   '#4a5058',   // 지붕·금속 구조
  SECOND_TIMBER:  '#5a4632',   // 목재·구조재
  SECOND_CLOTH:   '#8a7a5e',   // 천막·깃발 바탕
  ACCENT_GOLD:    '#c8a44d',   // 주 강조 (화면 5% 이하)
  ACCENT_CYAN:    '#4fd6c8',   // 보조 강조 — 홀로그램·선택·AI 제안
  ACCENT_CRIMSON: '#a83a3a',   // 경고 강조 — 판본 충돌·전장
  NEUTRAL_INK:    '#1a1712',   // 최암부
  NEUTRAL_BONE:   '#e6dcc8',   // 최명부·UI 지면
});
export const PALETTE_KEYS = Object.freeze(Object.keys(PALETTE));

/** 비색상 유틸 상수 — 알파 마스크·정점색 곱셈의 항등원. 팔레트가 아니다. */
export const WHITE = '#ffffff';
export const BLACK = '#000000';

const P = PALETTE;

/* ══════════════════════════════════════════════════════════════════
   3. §1.2 형상 토큰 — 모든 하드 엣지·트림·비례가 여기서 나온다
   ══════════════════════════════════════════════════════════════════ */
export const BEVEL_S = 0.02;
export const BEVEL_M = 0.06;
export const BEVEL_L = 0.14;
export const BEVELS = Object.freeze([BEVEL_S, BEVEL_M, BEVEL_L]);

export const TRIM_H = 0.08;                      // 트림 두께 단위 (정수배로만 사용)
export const PANEL_GRID = 1.0;                   // 패널 분할 격자 단위
export const SILHOUETTE_RATIO = Object.freeze([1, 0.618, 0.382]);  // primary:secondary:tertiary
export const TAPER = 0.85;                       // 수직 구조물 상단 축소율

/** 편의: 격자에 스냅 / 트림 정수배 / 실루엣 티어 크기 */
export const snapGrid = (v, mul = 1) => Math.round(v / (PANEL_GRID * mul)) * PANEL_GRID * mul;
export const trim = (n = 1) => TRIM_H * n;
export const massOf = (primary, tier = 0) => primary * SILHOUETTE_RATIO[Math.max(0, Math.min(2, tier))];
export const taperAt = (t) => lerpN(1, TAPER, clamp01(t));

/** P2 디테일 3티어 경계 (상위 15% / 다음 35% / 나머지) */
export const DETAIL_TIERS = Object.freeze({ A: 0.85, B: 0.50 });
/** P7 랜드마크 과장 배율 (주변 대비 1.6~2.2배) */
export const LANDMARK_SCALE = Object.freeze({ MIN: 1.6, MAX: 2.2 });

/**
 * P6 거리 밴드 (LOD) — 먼 거리엔 실루엣, 중거리엔 구조, 근거리에 미세 결.
 * 티어별 라벨 가시 거리가 다르다: Tier C 는 가까이 와야 이름을 내준다 (의도적 여백).
 */
export const LOD = Object.freeze({
  NEAR: 150,          // 근거리 경계
  MID: 320,           // 중거리 경계
  FAR: 640,           // 이 밖은 실루엣만
  LABEL_DIST: Object.freeze([640, 300, 150]),   // [Tier A, Tier B, Tier C]
  LABEL_FADE: 180,    // 가시 거리 앞에서 서서히 사라지는 구간
  LABEL_BUDGET: 84,   // 동시에 떠 있는 명패 상한 (P2 디테일 예산)
  HALO_FADE: 520,     // 헤일로가 사라지는 거리
  DETAIL_HIDE: 420,   // Tier C 부속 디테일(고리·비컨)이 꺼지는 거리
});

/**
 * 명패(라벨) — 전 라벨이 **아틀라스 1장 + 인스턴스 메시 1개**로 그려진다.
 * 스프라이트를 노드마다 만들면 라벨 하나가 드로우콜 하나다 (§5 예산의 절반을 명패가 먹는다).
 * 아래 수치가 아틀라스 해상도와 명패의 월드 크기를 정한다.
 */
export const LABEL = Object.freeze({
  ATLAS: 2048,        // 아틀라스 한 변 (px)
  TEX_H: 64,          // 명패 한 장의 높이 (px)
  FONT_PX: 38,        // 제목용 세리프 크기 (px)
  PAD_X: 20,          // 좌우 여백 (px)
  MAX_W: 640,         // 명패 최대 폭 (px)
  WORLD_H: 3.1,       // 월드 단위 높이
  SCALE_MIN: 0.72,    // 거리 보정 배율 하한
  SCALE_MAX: 2.0,     // 거리 보정 배율 상한
  SCALE_DIST: 190,    // 배율 1.0 이 되는 카메라 거리 (LOD.NEAR + 40)
  LIFT: 1.9,          // 아바타 매스 대비 명패가 뜨는 높이 배수
  LIFT_BASE: 2.0,     // 그 위에 더해지는 고정 높이
});

/**
 * P1 노드 아바타 매스 — 타입은 실루엣 계층(primary/secondary/tertiary)에 배정되고,
 * 크기는 primary 매스 × SILHOUETTE_RATIO 로만 나온다. 임의의 중간 크기 금지.
 */
export const NODE_MASS = Object.freeze({
  PRIMARY: 2.5,
  TYPE_TIER: Object.freeze({
    Place: 0, Faction: 0,
    Character: 1, Event: 1, Artifact: 1,
    Species: 2, Power: 2,
  }),
  DEFAULT_TIER: 1,
  IMPORTANCE: Object.freeze([1.0, 0.82, 0.66]),   // 중요도 티어(A/B/C)별 배율
  OFFVIEW: 0.28,                                   // 이 뷰의 주역이 아닌 노드
});

/**
 * P4 — 노드 아바타도 **색이 아니라 빛 반응**으로 갈린다.
 * 타입을 §1.3 프리셋 3계열에 배정한다 (인스턴스 그룹 3개 = 드로우콜 3).
 *   석재(무광·거침) / 천(sheen) / 아케인 결정(transmission·ior)
 */
export const NODE_MATERIAL = Object.freeze({
  Place: 'MAT_STONE', Character: 'MAT_STONE', Event: 'MAT_STONE', Species: 'MAT_STONE',
  Faction: 'MAT_CLOTH',
  Artifact: 'MAT_GLASS_ARCANE', Power: 'MAT_GLASS_ARCANE',
});
export const NODE_MATERIAL_DEFAULT = 'MAT_STONE';
/** 아바타 인스턴스 그룹 순서 — 드로우콜 순서를 고정한다 */
export const NODE_MATERIAL_GROUPS = Object.freeze(['MAT_STONE', 'MAT_CLOTH', 'MAT_GLASS_ARCANE']);

/* ══════════════════════════════════════════════════════════════════
   4. 파생 색 토큰 — 전부 팔레트 12색의 연산 결과다 (P9)
   ══════════════════════════════════════════════════════════════════ */

/** 지형 밴딩 (고도·경사) */
export const BAND = Object.freeze({
  SAND:  mix(P.SECOND_CLOTH, P.NEUTRAL_BONE, 0.34),
  ROCK:  darken(P.BASE_STONE, 0.12),
  CLIFF: darken(mix(P.BASE_EARTH, P.BASE_STONE, 0.45), 0.22),
  SNOW:  lighten(mix(P.NEUTRAL_BONE, P.BASE_WATER, 0.10), 0.42),
  DEEP:  darken(mix(P.BASE_WATER, P.BASE_VERDANT, 0.40), 0.42),
});

/** 지표·암반 */
export const SURFACE = Object.freeze({
  STRATA_TOP:    mix(P.BASE_EARTH, P.BASE_STONE, 0.30),          // 절벽 층리 상단
  STRATA_MID:    darken(mix(P.BASE_EARTH, P.SECOND_SLATE, 0.35), 0.18),
  STRATA_BOTTOM: darken(mix(P.BASE_EARTH, P.NEUTRAL_INK, 0.62), 0.10),
  ROAD:          mix(P.SECOND_CLOTH, P.NEUTRAL_BONE, 0.42),
  ROAD_WORN:     mix(P.SECOND_CLOTH, P.BASE_EARTH, 0.35),
  NODE_EMISSIVE: darken(P.NEUTRAL_INK, 0.30),                    // 노드 젬의 바닥 발광
  OTHER_UNDER:   darken(mix(P.SECOND_SLATE, P.BASE_WATER, 0.45), 0.30),  // 부유섬 하부 암괴
});

/** 구조물 (기단·벽·지붕·금속) */
export const STRUCT = Object.freeze({
  STONE:          lighten(P.BASE_STONE, 0.34),
  STONE_MID:      darken(P.BASE_STONE, 0.06),
  STONE_DARK:     darken(P.BASE_STONE, 0.22),
  MORTAR:         darken(P.BASE_STONE, 0.34),
  TIMBER:         lighten(P.SECOND_TIMBER, 0.18),
  TIMBER_LIGHT:   mix(P.SECOND_TIMBER, P.SECOND_CLOTH, 0.55),
  ROOF:           mix(P.ACCENT_CRIMSON, P.SECOND_TIMBER, 0.42),
  ROOF_ALT:       lighten(P.SECOND_SLATE, 0.16),
  STEEL:          lighten(P.SECOND_SLATE, 0.46),
  IRON:           darken(P.SECOND_SLATE, 0.18),
  GOLD:           P.ACCENT_GOLD,
  BANNER_DEFAULT: darken(P.ACCENT_GOLD, 0.18),
  TRIM:           mix(P.ACCENT_GOLD, P.SECOND_TIMBER, 0.35),
});

/** 식생 */
export const FOLIAGE = Object.freeze({
  TRUNK:       mix(P.SECOND_TIMBER, P.BASE_EARTH, 0.40),
  TRUNK_DARK:  darken(P.SECOND_TIMBER, 0.18),
  CANOPY_LOW:  darken(P.BASE_VERDANT, 0.34),
  CANOPY_HI:   mix(P.BASE_VERDANT, P.SECOND_CLOTH, 0.22),
  LEAF_HI:     lighten(mix(P.BASE_VERDANT, P.NEUTRAL_BONE, 0.62), 0.10),
  REED:        mix(P.BASE_VERDANT, P.SECOND_CLOTH, 0.42),
});

/** 물 */
export const WATER = Object.freeze({
  SHALLOW:  lighten(mix(P.BASE_WATER, P.ACCENT_CYAN, 0.38), 0.10),
  DEEP:     darken(P.BASE_WATER, 0.42),
  FOAM:     lighten(mix(P.NEUTRAL_BONE, P.BASE_WATER, 0.18), 0.42),
  SUN:      lighten(P.ACCENT_GOLD, 0.62),
  FALL_TOP: lighten(mix(P.NEUTRAL_BONE, P.ACCENT_CYAN, 0.22), 0.40),
  FALL_BOT: mix(P.BASE_WATER, P.ACCENT_CYAN, 0.50),
  SPRAY:    lighten(mix(P.NEUTRAL_BONE, P.ACCENT_CYAN, 0.30), 0.34),
});

/** 하늘·대기 (mood 가 덮어쓰기 전의 기본값) */
export const SKY = Object.freeze({
  TOP:        mix(P.BASE_WATER, P.NEUTRAL_INK, 0.35),
  HORIZON:    lighten(P.ACCENT_GOLD, 0.25),
  SUN:        lighten(P.ACCENT_GOLD, 0.50),
  FOG:        mix(P.NEUTRAL_BONE, P.BASE_WATER, 0.46),
  GROUND:     darken(P.BASE_EARTH, 0.42),          // 반구광 하단
  CLOUD_LIT:  lighten(P.NEUTRAL_BONE, 0.55),
  STAR:       lighten(mix(P.NEUTRAL_BONE, P.BASE_WATER, 0.25), 0.55),
  CLEAR:      darken(mix(P.BASE_WATER, P.NEUTRAL_INK, 0.72), 0.30),  // 렌더러 클리어색
});

/**
 * 홀로그램 물질화 전용 (§3 — 이 연출만 발광 재질을 쓴다)
 *
 * TINT_* 는 물질화가 도는 동안 화면 전체(지표·구조물·하늘)에 같은 값으로 걸리는 합성 계수다.
 * 지표와 하늘이 서로 다른 값을 쓰면 소환이 "하나의 그림"으로 읽히지 않으므로,
 * 두 셰이더가 **이 토큰을 유니폼으로 같이 받는다**.
 *   합성식: holo = color * TINT_MUL + HOLO.B * TINT_B_GAIN + TINT_ADD
 */
export const HOLO = Object.freeze({
  A:         P.ACCENT_GOLD,                        // 물질화 에지 A
  B:         P.ACCENT_CYAN,                        // 물질화 에지 B
  TINT_MUL:  Object.freeze([0.42, 0.72, 0.95]),    // 채널 게인 (색이 아니라 감쇠 계수)
  TINT_ADD:  darken(P.BASE_WATER, 0.33),           // 가산 오프셋 — 팔레트 파생
  TINT_B_GAIN: 0.14,                               // 청록 에지색 가산량
  GRID:      lighten(P.ACCENT_CYAN, 0.10),
  BEAM:      lighten(P.ACCENT_CYAN, 0.24),
  SCAN:      lighten(P.ACCENT_CYAN, 0.32),
  MOTE_WARM: lighten(P.ACCENT_GOLD, 0.42),
  MOTE_COOL: lighten(P.ACCENT_CYAN, 0.30),
  POLLEN:    lighten(P.ACCENT_GOLD, 0.66),
  SUN_CORE:  lighten(P.ACCENT_GOLD, 0.82),
  SUN_HALO:  lighten(P.ACCENT_GOLD, 0.40),
  MIST:      lighten(mix(P.NEUTRAL_BONE, P.BASE_WATER, 0.24), 0.30),
});

/** 판본 충돌 = 균열 (§3) */
export const RIFT = Object.freeze({
  HOT:       lighten(P.ACCENT_CRIMSON, 0.28),
  COLD:      lighten(P.ACCENT_GOLD, 0.46),
  SHARD:     lighten(mix(P.ACCENT_CRIMSON, P.ACCENT_GOLD, 0.45), 0.22),
  DISPUTED:  mix(P.ACCENT_CRIMSON, P.ACCENT_GOLD, 0.30),
  GLOW:      P.ACCENT_CRIMSON,
});

/**
 * 이계(otherworld) — 팔레트 규율상 보라 계열을 쓰지 않는다.
 * 아케인은 ACCENT_CYAN + SECOND_SLATE 로 표현한다 (P9: 색을 늘리지 않는다).
 */
export const MYSTIC = Object.freeze({
  LOW:              darken(mix(P.SECOND_SLATE, P.ACCENT_CYAN, 0.30), 0.16),
  HIGH:             mix(P.SECOND_SLATE, P.ACCENT_CYAN, 0.55),
  CRYSTAL_A:        lighten(P.ACCENT_CYAN, 0.22),
  CRYSTAL_B:        lighten(mix(P.ACCENT_CYAN, P.NEUTRAL_BONE, 0.35), 0.10),
  CRYSTAL_EMISSIVE: darken(P.ACCENT_CYAN, 0.55),
  AURA_A:           P.ACCENT_CYAN,
  AURA_B:           mix(P.ACCENT_CYAN, P.SECOND_SLATE, 0.45),
  BEAM:             lighten(P.ACCENT_CYAN, 0.36),
});

/** 바이옴 저지대/고지대 색 (worldstyle 이 없을 때의 기본) */
export const BIOME_COLOR = Object.freeze({
  meadow: Object.freeze({ low: P.BASE_VERDANT, high: lighten(P.BASE_VERDANT, 0.22) }),
  forest: Object.freeze({ low: darken(P.BASE_VERDANT, 0.42), high: darken(P.BASE_VERDANT, 0.16) }),
  rock:   Object.freeze({ low: darken(P.BASE_STONE, 0.16), high: lighten(P.BASE_STONE, 0.16) }),
  snow:   Object.freeze({ low: lighten(mix(P.NEUTRAL_BONE, P.BASE_WATER, 0.14), 0.36), high: lighten(P.NEUTRAL_BONE, 0.52) }),
  water:  Object.freeze({ low: mix(P.BASE_WATER, P.BASE_VERDANT, 0.34), high: lighten(mix(P.BASE_WATER, P.ACCENT_CYAN, 0.30), 0.12) }),
  mystic: Object.freeze({ low: MYSTIC.LOW, high: MYSTIC.HIGH }),
});

/** 노드 타입 색 — value/hue 로 서로 구분되되 전부 팔레트 파생 */
export const TYPE_HUE = Object.freeze({
  Place:     P.ACCENT_GOLD,
  Character: lighten(mix(P.BASE_WATER, P.NEUTRAL_BONE, 0.38), 0.16),
  Event:     lighten(mix(P.ACCENT_CRIMSON, P.ACCENT_GOLD, 0.45), 0.12),
  Faction:   lighten(mix(P.SECOND_SLATE, P.ACCENT_CRIMSON, 0.34), 0.28),
  Artifact:  P.ACCENT_CYAN,
  Species:   lighten(P.BASE_VERDANT, 0.30),
  Power:     lighten(mix(P.ACCENT_CRIMSON, P.NEUTRAL_BONE, 0.42), 0.06),
});
export const TYPE_HUE_FALLBACK = mix(P.NEUTRAL_BONE, P.SECOND_CLOTH, 0.35);

/** 관계 엣지 색 — 계열별로 묶는다 (혈연=본/금, 갈등=크림슨, 동맹=버던트, 순서=골드) */
export const REL_HUE = Object.freeze({
  childOf:        lighten(P.ACCENT_GOLD, 0.30),
  spouseOf:       lighten(mix(P.ACCENT_CRIMSON, P.NEUTRAL_BONE, 0.52), 0.06),
  loverOf:        lighten(mix(P.ACCENT_CRIMSON, P.NEUTRAL_BONE, 0.38), 0.04),
  siblingOf:      mix(P.SECOND_CLOTH, P.NEUTRAL_BONE, 0.42),
  memberOf:       lighten(mix(P.BASE_WATER, P.NEUTRAL_BONE, 0.42), 0.14),
  leaderOf:       lighten(P.ACCENT_GOLD, 0.40),
  enemyOf:        lighten(P.ACCENT_CRIMSON, 0.24),
  alliedWith:     lighten(mix(P.BASE_VERDANT, P.ACCENT_CYAN, 0.35), 0.24),
  vassalOf:       lighten(mix(P.SECOND_SLATE, P.ACCENT_CYAN, 0.30), 0.34),
  after:          lighten(mix(P.ACCENT_GOLD, P.ACCENT_CRIMSON, 0.24), 0.28),
  causedBy:       lighten(mix(P.ACCENT_CRIMSON, P.ACCENT_GOLD, 0.38), 0.18),
  hasParticipant: mix(P.BASE_WATER, P.NEUTRAL_BONE, 0.52),
  occursAt:       mix(P.BASE_VERDANT, P.NEUTRAL_BONE, 0.48),
  default:        mix(P.SECOND_CLOTH, P.NEUTRAL_BONE, 0.30),
});

/** 세력 기본 배너색 — 전부 채도 캡을 통과한 팔레트 파생 (worldstyle 이 없을 때) */
export const FACTION_TINTS = Object.freeze([
  capSaturation(darken(P.ACCENT_GOLD, 0.14)),
  capSaturation(darken(P.ACCENT_CRIMSON, 0.10)),
  capSaturation(lighten(P.BASE_WATER, 0.14)),
  capSaturation(lighten(P.BASE_VERDANT, 0.06)),
  capSaturation(mix(P.SECOND_TIMBER, P.ACCENT_GOLD, 0.35)),
  capSaturation(lighten(P.SECOND_SLATE, 0.10)),
  capSaturation(mix(P.ACCENT_CRIMSON, P.SECOND_TIMBER, 0.45)),
  capSaturation(mix(P.BASE_WATER, P.ACCENT_CYAN, 0.40)),
  capSaturation(mix(P.SECOND_CLOTH, P.ACCENT_GOLD, 0.40)),
  capSaturation(mix(P.SECOND_SLATE, P.ACCENT_CRIMSON, 0.35)),
]);

/**
 * 세력 발광 세기 (`worldstyle.factionStyles[*].glow`, 0~1) → 세력 표식 헤일로 배율.
 * DEFAULT(=0.3)가 배율 1.0 이 되도록 잡아 AI 지정이 없을 때의 화면을 그대로 둔다.
 */
export const FACTION_GLOW = Object.freeze({ DEFAULT: 0.3, HALO_MIN: 0.7, HALO_MAX: 1.7 });

/**
 * §4 UI 아트 디렉션 — 다크 글래스 게임 HUD (2026-08 개편).
 * 어두운 반투명 유리판 + 1px 헤어라인 + 금은 강조에만 (P9 예산). 양피지 판·금속
 * 코너 피팅은 폐기 — 3D 세계가 어두운 별하늘 위 발광체라 HUD 도 어둠에 녹아야 한다.
 * HUD 는 CSS 로 그려지지만 색의 출처는 여기 하나다 — `app/theme.js` 가 부팅 때
 * 이 토큰을 `:root` 커스텀 프로퍼티로 주입한다 (index.html 의 리터럴은 주입 실패 시 폴백).
 */
export const UI = Object.freeze({
  // 유리판 — 짙은 청흑 (잉크·수면의 파생, 신규 원색 아님)
  GLASS:      darken(mix(P.NEUTRAL_INK, P.BASE_WATER, 0.35), 0.42),
  GLASS_HI:   mix(P.NEUTRAL_INK, P.BASE_WATER, 0.48),
  // 텍스트 — 어두운 유리 위의 본 화이트 3단
  TEXT:       lighten(P.NEUTRAL_BONE, 0.30),
  TEXT_SOFT:  mix(P.NEUTRAL_BONE, P.SECOND_SLATE, 0.30),
  TEXT_MUTED: mix(P.NEUTRAL_BONE, P.SECOND_SLATE, 0.58),
  // 금 — 활성 상태·캡션·핵심 수치에만 (화면 5% 이하)
  TRIM:       P.ACCENT_GOLD,
  TRIM_LIT:   lighten(P.ACCENT_GOLD, 0.18),
  TRIM_SOFT:  mix(P.ACCENT_GOLD, P.SECOND_SLATE, 0.35),
  SHADOW:     darken(mix(P.NEUTRAL_INK, P.BASE_WATER, 0.30), 0.55),
  // 강조 — 어두운 바탕이라 텍스트용은 밝은 쪽(LIT)이다
  SELECT:     P.ACCENT_CYAN,
  SELECT_LIT: lighten(P.ACCENT_CYAN, 0.25),
  WARN:       P.ACCENT_CRIMSON,
  WARN_LIT:   lighten(P.ACCENT_CRIMSON, 0.34),
  CODE_BG:    darken(mix(P.NEUTRAL_INK, P.BASE_WATER, 0.22), 0.30),
  CODE_FG:    mix(P.NEUTRAL_BONE, P.ACCENT_GOLD, 0.32),
  // 부팅 오버레이
  BOOT_CORE:  mix(P.BASE_WATER, P.NEUTRAL_INK, 0.55),
  BOOT_EDGE:  darken(mix(P.BASE_WATER, P.NEUTRAL_INK, 0.82), 0.30),
  BOOT_TITLE: lighten(P.NEUTRAL_BONE, 0.30),
  BOOT_SUB:   mix(P.NEUTRAL_BONE, P.BASE_WATER, 0.42),
});

/** 선택·호버 링 */
export const HILIGHT = Object.freeze({
  SELECT_RING: lighten(P.ACCENT_GOLD, 0.52),
  SELECT_BEAM: lighten(P.ACCENT_GOLD, 0.36),
  HOVER_RING:  lighten(P.ACCENT_CYAN, 0.44),
  GHOST:       lighten(P.ACCENT_CYAN, 0.38),        // 제안 고스트 레이어
  BIRTH:       lighten(P.ACCENT_CYAN, 0.5),         // 탄생 스포트라이트 (§7 born) — 물질화 언어와 한 계열
});

/**
 * P10 값 구조 — **위계는 색상이 아니라 명도(value)로 먼저 표현한다.**
 * 노드 티어(P2)마다 곱해지는 명도 계수. Tier C 는 어두운 실루엣 덩어리로 뭉친다.
 */
export const NODE_VALUE = Object.freeze({
  A: 1.00, B: 0.62, C: 0.36,          // 티어별 명도
  FLOOR: 0.30,                        // 완전히 검게 죽지 않도록 하는 하한
  GAIN: 1.05,                         // 완전 활성 노드의 상한 (하한→상한 사이를 선형 보간)
  DIM_OFFSTAGE: 0.20,                 // 연대 필터 밖 (그 시점에 없는 것)
  DIM_OFFVIEW: 0.42,                   // 이 뷰의 주역이 아닌 것
  SELECT_LIFT: 0.42,                  // 선택 시 명부쪽으로 끌어올리는 양
  DISPUTED_MIX: 0.55,                 // 균열색 혼합량
});

/**
 * P9 강조 예산 — ACCENT_GOLD 는 화면의 5% 이하.
 * 원색 금은 Tier A 에서만 살리고, 아래 티어는 SECOND_CLOTH 쪽으로 물려 면적을 줄인다.
 */
export const ACCENT_BUDGET = Object.freeze({
  GOLD_TIER: 0,                       // 0 = Tier A 만 원색 금
  GOLD_DEMOTE: Object.freeze({ B: 0.45, C: 0.72 }),  // 티어별 SECOND_CLOTH 혼합량
  GOLD_DEMOTE_TO: P.SECOND_CLOTH,
});

/**
 * 링크 값 위계 — SILHOUETTE_RATIO 를 선(線)에 적용한다.
 * primary 관계만 밝게, 나머지는 값으로 물러난다 (선이 다 같은 밝기면 그래프가 실뭉치가 된다).
 */
export const EDGE_VALUE = Object.freeze({
  PRIMARY:   SILHOUETTE_RATIO[0],     // 1
  SECONDARY: SILHOUETTE_RATIO[1],     // 0.618
  TERTIARY:  SILHOUETTE_RATIO[2],     // 0.382
  HOT: 1.55,                          // 선택 노드에 걸린 링크
  OPACITY: 0.72,
  DISPUTED: 1.15,                     // 균열 링크는 한 단 위
});

/** §4 UI 모션 — 220ms cubic-bezier(.2,.7,.2,1) 통일 */
export const MOTION = Object.freeze({
  MS: 220,
  EASE: 'cubic-bezier(.2,.7,.2,1)',
  MORPH_MS: 780,                      // 뷰 모핑 (계약 §7: ≥400ms)
});

/* ══════════════════════════════════════════════════════════════════
   5. §1.3 재질 프리셋 파라미터 11종 (MeshPhysicalMaterial)
   색이 아니라 **빛 반응**으로 재질을 구분한다. materials.js 가 이 표를 그대로 소비한다.
   ══════════════════════════════════════════════════════════════════ */
export const MATERIAL = Object.freeze({
  MAT_STONE: Object.freeze({
    color: P.BASE_STONE, roughness: 0.92, metalness: 0.0,
    bumpScale: 0.028, envMapIntensity: 0.85, detail: 'stone', repeat: 6,
  }),
  MAT_ROCK_WET: Object.freeze({
    color: darken(P.BASE_STONE, 0.22), roughness: 0.55, metalness: 0.0,
    clearcoat: 0.30, clearcoatRoughness: 0.28,
    bumpScale: 0.020, envMapIntensity: 1.05, detail: 'stone', repeat: 5,
  }),
  MAT_TIMBER: Object.freeze({
    color: P.SECOND_TIMBER, roughness: 0.78, metalness: 0.0,
    anisotropy: 0.45, anisotropyRotation: 0.0,
    bumpScale: 0.016, envMapIntensity: 0.75, detail: 'timber', repeat: 3,
  }),
  MAT_METAL_IRON: Object.freeze({
    color: STRUCT.IRON, roughness: 0.42, metalness: 1.0,
    anisotropy: 0.25, bumpScale: 0.008, envMapIntensity: 1.25, detail: 'metal', repeat: 4,
  }),
  MAT_METAL_GOLD: Object.freeze({
    color: P.ACCENT_GOLD, roughness: 0.28, metalness: 1.0,
    bumpScale: 0.006, envMapIntensity: 1.45, detail: 'metal', repeat: 3,
  }),
  MAT_CLOTH: Object.freeze({
    color: P.SECOND_CLOTH, roughness: 0.88, metalness: 0.0,
    sheen: 0.60, sheenRoughness: 0.62, sheenColor: lighten(P.SECOND_CLOTH, 0.62),
    bumpScale: 0.010, envMapIntensity: 0.70, detail: 'cloth', repeat: 8,
  }),
  MAT_LEATHER: Object.freeze({
    color: darken(P.SECOND_TIMBER, 0.20), roughness: 0.70, metalness: 0.0,
    sheen: 0.20, sheenRoughness: 0.55, sheenColor: lighten(P.SECOND_TIMBER, 0.45),
    bumpScale: 0.012, envMapIntensity: 0.80, detail: 'leather', repeat: 6,
  }),
  MAT_GLASS_ARCANE: Object.freeze({
    color: MYSTIC.CRYSTAL_A, roughness: 0.08, metalness: 0.0,
    transmission: 0.90, ior: 1.45, thickness: 1.4,
    attenuationColor: MYSTIC.CRYSTAL_B, attenuationDistance: 6.0,
    envMapIntensity: 1.35, detail: null, repeat: 1,
  }),
  MAT_WATER: Object.freeze({
    color: WATER.DEEP, roughness: 0.06, metalness: 0.0,
    transmission: 0.60, ior: 1.33, thickness: 6.0,
    envMapIntensity: 1.30, detail: 'water', repeat: 12, scrollA: 0.012, scrollB: -0.008,
  }),
  MAT_FOLIAGE: Object.freeze({
    color: P.BASE_VERDANT, roughness: 0.85, metalness: 0.0,
    doubleSided: true, alphaTest: 0.42,
    sheen: 0.35, sheenRoughness: 0.80, sheenColor: lighten(P.BASE_VERDANT, 0.55),
    subsurface: 0.45,                                   // 백라이트 시 밝아지는 근사 세기
    envMapIntensity: 0.85, detail: 'foliage', repeat: 1,
  }),
  MAT_HOLO: Object.freeze({
    color: HOLO.B, emissiveOnly: true, additive: true, opacity: 0.95,
    toneMapped: false, depthWrite: false, doubleSided: true, detail: null, repeat: 1,
  }),
});
export const MATERIAL_KEYS = Object.freeze(Object.keys(MATERIAL));

/* ══════════════════════════════════════════════════════════════════
   6. §1.4 라이팅 리그 — 광원은 KEY/FILL/RIM/ENV 4개가 전부다
   ══════════════════════════════════════════════════════════════════ */
const DEG = Math.PI / 180;

/** 고도/방위 → 단위 방향 벡터 성분 [x,y,z] (y 업, 방위 0 = +Z) */
export function dirFromAngles(elevationDeg, azimuthDeg) {
  const el = elevationDeg * DEG, az = azimuthDeg * DEG;
  return [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)];
}

export const LIGHT = Object.freeze({
  KEY: Object.freeze({
    elevationDeg: 38, azimuthDeg: -35,          // §1.4 고정
    intensity: 3.0, distance: 420,
    color: SKY.SUN,
    shadow: Object.freeze({
      mapSize: 2048, near: 20, far: 1100, halfExtent: 240,
      bias: -0.0006, normalBias: 0.8, radius: 2.0,
    }),
  }),
  FILL: Object.freeze({                          // HemisphereLight — KEY 의 0.35 이하
    ratioOfKey: 0.35, skyColor: SKY.TOP, groundColor: SKY.GROUND,
    // worldstyle.mood.ambient 소비 — ambientRef 가 배율 1.0 이다 (기본값이면 화면이 그대로).
    // 배율 상한은 1.0 — FILL 은 어떤 경우에도 KEY 의 0.35 를 넘지 않는다 (§1.4).
    ambientRef: 0.55, ambientMin: 0.35, ambientMax: 1.0,
  }),
  RIM: Object.freeze({                           // 실루엣 분리 전용, 그림자 없음
    elevationDeg: 22, azimuthDeg: 145,
    intensity: 0.25, distance: 380,
    color: lighten(P.BASE_WATER, 0.55),
  }),
  ENV: Object.freeze({                           // PMREM 절차 하늘
    intensity: 1.0, pmremSigma: 0.035, domeRadius: 500, sunAngularSize: 0.045,
    sunGain: 6.0, horizonGain: 0.30, haloGain: 0.22,
    // ambient 는 간접광(환경맵) 세기로도 읽는다 — 반구광은 캡에 걸려 위로 못 가므로
    ambientMin: 0.55, ambientMax: 1.35,
  }),
});

export const KEY_DIR = Object.freeze(dirFromAngles(LIGHT.KEY.elevationDeg, LIGHT.KEY.azimuthDeg));
export const RIM_DIR = Object.freeze(dirFromAngles(LIGHT.RIM.elevationDeg, LIGHT.RIM.azimuthDeg));

/* §1.5 카메라·톤매핑 */
export const CAMERA = Object.freeze({
  FOV: 42, FOV_CLOSEUP: 32, NEAR: 0.6, FAR: 5200,
  EXPOSURE: 1.05,
});

/** P11 대기 원근 — 안개 구간 */
export const FOG = Object.freeze({ NEAR: 420, FAR: 1500 });

/* ══════════════════════════════════════════════════════════════════
   7. P12 후처리 파라미터 — 스택 순서는 상수로 고정한다
   ══════════════════════════════════════════════════════════════════ */
// 초점(피사계 심도) 패스는 대개편 R6 로 스택에서 제거됐다 — 직교 카메라 화면엔 흐림이 없다.
export const POST_ORDER = Object.freeze([
  'RenderPass', 'SSAOPass', 'UnrealBloomPass', 'FilmPass', 'SMAAPass', 'OutputPass',
]);

export const POST = Object.freeze({
  SSAO:  Object.freeze({ kernelSize: 16, kernelRadius: 4, intensity: 0.6, minDistance: 0.0022, maxDistance: 0.10 }),
  BLOOM: Object.freeze({ threshold: 0.85, strength: 0.35, radius: 0.55 }),
  FILM:  Object.freeze({ grain: 0.12, grayscale: false }),
});

/* ══════════════════════════════════════════════════════════════════
   8. §5 성능 예산 · 품질 프리셋
   ══════════════════════════════════════════════════════════════════ */
export const BUDGET = Object.freeze({
  MAX_DRAW_CALLS: 250,
  MAX_TRIANGLES: 1800000,
  MAX_PIXEL_RATIO: 2.0,          // '상' 프리셋 상한 = min(dpr, 2) (§7a.5, #39)
  SHADOW_MAP_SIZE: 2048,
});

/**
 * 프리셋 3단 (§5 · 대개편 §T6) — 픽셀비율은 min(기기 dpr, 이 상한): 하 0.75 / 중 1.0(기본) / 상 2.0.
 * 강등 순서는 SSAO → 블룸/투과 (초점 패스는 R6 로 제거됨).
 * `transmission`: 굴절 재질(물·아케인 결정)의 투과를 켤지. **끄면 불투명 씬 전체를 한 번 더 그리는
 * three 의 transmission 패스가 통째로 사라진다** — 저사양에서 가장 큰 한 덩어리라 low 에서만 끈다.
 * (끈 뒤에도 roughness 0.06 + envMap 반사는 남아 수면이 사라지지는 않는다.)
 */
export const QUALITY_ORDER = Object.freeze(['high', 'medium', 'low']);
export const QUALITY = Object.freeze({
  // 강등 사다리는 단마다 실질 비용이 줄어야 한다. medium 의 두 스위치가 핵심이다:
  // transmission(물 투과)은 three 가 불투명 씬을 매 프레임 별도 렌더타깃에 다시 그리는
  // 숨은 풀패스라 끊김의 주범이고, shadowMap 1024 는 룩 차이가 거의 없다.
  high:   Object.freeze({ pixelRatio: 2.0,  ssao: true,  bloom: true,  film: true,  smaa: true,  shadowMap: 2048, shadows: true, transmission: true }),
  medium: Object.freeze({ pixelRatio: 1.0,  ssao: true,  bloom: true,  film: true,  smaa: true,  shadowMap: 1024, shadows: true, transmission: false }),
  low:    Object.freeze({ pixelRatio: 0.75, ssao: false, bloom: false, film: false, smaa: false, shadowMap: 512,  shadows: true, transmission: false }),
});

/**
 * 자동 감지 — 두 층이다.
 * 초기 판정: 물질화(SSAO 가 꺼진 구간)가 끝난 뒤 5초 중앙값으로 시작 프리셋 확정.
 * 상시 적응: 이후에도 4초 창 중앙값이 임계를 넘으면 한 단계씩 강등 (승격은 자동으로 안 함 — 진동 방지).
 */
export const AUTO_QUALITY = Object.freeze({
  SAMPLE_MS: 5000, WARMUP_FRAMES: 30, MIN_SAMPLES: 10,
  MEDIUM_MS: 22, LOW_MS: 33,
  ADAPT_WINDOW_MS: 4000, ADAPT_MIN_SAMPLES: 10,
  // MIN_SAMPLES 를 크게 잡으면 안 된다: 끊기는 기기일수록 창 안의 샘플 수(=프레임 수)가
  // 적어서, 도와야 할 기기일수록 "판정 보류"에 걸리는 자기모순이 된다. 10개 중앙값이면 충분하고,
  // 탭 전환·물질화 노이즈는 창 리셋이 이미 걸러 준다.
});

/* ══════════════════════════════════════════════════════════════════
   8.5 시간 여행 · 전장 · 지역 (계약 §7 — #14 #13)
   연출 수치도 토큰이다. 색은 전부 위 12색의 연산 결과다 (P9).
   ══════════════════════════════════════════════════════════════════ */

/**
 * 시간 여행 (#14) — `existsFromYear`/`existsToYear` 창 밖 랜드마크·사물의 마이크로 디졸브.
 * 연출은 새로 만들지 않는다: 홀로그램 물질화와 **같은 노이즈·같은 에지색(HOLO.A/B)** 을 쓰고
 * 존재도(0~1)만 다른 축으로 움직인다 — 소환과 시간 여행이 하나의 언어로 읽히게.
 */
export const TIME = Object.freeze({
  FADE_OUT_MS: 640,        // 사라짐 (계약: 0.4~0.7초)
  FADE_IN_MS: 480,         // 피어남
  THROTTLE_MS: 70,         // 빠른 스크럽 중 diff 재계산 최소 간격 (매 프레임 재계산 금지)
  EDGE: 0.17,              // 디졸브 경계 폭 (노이즈 임계 기준)
  EDGE_GAIN: 2.2,          // 경계 발광 세기 (물질화 에지와 같은 계수대)
  NOISE_SCALE: 0.075,      // 경계 노이즈 주파수 — 구조물 크기에 맞춰 물질화보다 잘게
  GONE: 0.015,             // 이 아래는 "없는 것"
  LABEL_MIN: 0.45,         // 명패가 버티는 최소 존재도
});

/**
 * 전장 오버레이 (#14) — 전투 사건 연도 ±2년 창에서 그 장소에 낀다.
 * ACCENT_CRIMSON 은 한쪽 진영 깃발과 잔불에만 (§1.1 강조 5% 예산).
 */
export const BATTLE = Object.freeze({
  WINDOW: 2,               // 사건 연도 ±2년 (계약 §7)
  // 페이드 시간은 TIME.FADE_IN/OUT_MS 하나로만 굴린다 — 전장도 시간 디졸브와 같은 언어다.
  SITES_MAX: 12,           // 동시에 준비해 두는 전장 수 (드로우콜은 이와 무관하게 3)
  ROW_GAP: 15,             // 대치 두 열 사이 거리
  SPACING: 6.4,            // 한 열 안의 깃발 간격
  PER_ROW: 3,              // 열당 깃발 수
  POLE_H: 5.6,
  POLE_R: 0.16,
  BANNER_W: 3.0,
  BANNER_H: 1.7,
  DECAL_R: 16,             // 그을림 데칼 반경
  DECAL_SEG: 20,
  DECAL_RINGS: 3,
  DECAL_ALPHA: 0.62,
  SMOKE_PER_SITE: 12,
  SMOKE_SIZE: 13,
  SMOKE_RISE: 26,
  SMOKE_OPACITY: 0.34,
  BANNER_A: darken(P.ACCENT_CRIMSON, 0.08),                  // 붉은 진영
  BANNER_B: mix(P.SECOND_SLATE, P.SECOND_CLOTH, 0.42),       // 맞선 진영
  POLE: darken(P.SECOND_TIMBER, 0.16),
  SCORCH: darken(mix(P.NEUTRAL_INK, P.SECOND_TIMBER, 0.28), 0.10),
  EMBER: lighten(P.ACCENT_CRIMSON, 0.26),
  SMOKE: mix(P.SECOND_SLATE, P.NEUTRAL_INK, 0.42),
});

/**
 * 지역(Region) 표기 (#13) — graph.json `regions` 파생 배열의 소비 규약.
 * 구역은 랜드마크를 만들지 않는다: **지반 틴트 + 대형 지명 라벨**이 전부다.
 * 틴트는 세력색과 같은 규율(채도 캡 + 혼합 캡)을 통과한다 — 지표가 알록달록해지면 실패다.
 */
export const REGION_TINTS = Object.freeze([
  capSaturation(mix(P.BASE_VERDANT, P.ACCENT_GOLD, 0.30)),
  capSaturation(mix(P.BASE_WATER, P.ACCENT_CYAN, 0.26)),
  capSaturation(mix(P.SECOND_CLOTH, P.ACCENT_GOLD, 0.32)),
  capSaturation(mix(P.SECOND_SLATE, P.BASE_WATER, 0.42)),
  capSaturation(mix(P.BASE_EARTH, P.ACCENT_CRIMSON, 0.20)),
  capSaturation(mix(P.BASE_STONE, P.BASE_VERDANT, 0.36)),
]);

export const REGION = Object.freeze({
  TINT_MIX: 0.16,          // 지반 혼합량 (TINT.MAX_MIX 0.35 의 절반 이하 — 은은하게)
  SIGMA_MUL: 1.35,         // 멤버 장소 영향 반경 배율 (구역이 장소보다 넓게 퍼진다)
  ANCHOR_LIFT: 21,         // 구역 표식이 지면 위로 뜨는 높이
  LABEL_LIFT: 13,          // 그 표식 위로 지명이 더 뜨는 높이
  LABEL_SCALE: 3.1,        // 대형 지명 기본 배율 (중요도 티어로 SILHOUETTE_RATIO 가 걸린다)
  LABEL_FAR: 1700,         // 이 밖은 안개다 — 지명도 사라진다
  LABEL_NEAR: 170,         // 이 안으로 들어오면 지명이 완전히 사라진다 (장소 명패에 자리를 내준다)
  LABEL_FADE: 240,         // 원·근 양쪽 페이드 구간
  LABEL_BUDGET: 8,         // 명패 예산(LOD.LABEL_BUDGET) 안에서 구역이 쓰는 몫
});

/* ══════════════════════════════════════════════════════════════════
   8.6 세계 좌표 비례 — 작가 공간(0~100) ↔ layout(-100~100) ↔ 월드 XZ
   계약 §1: `layout = coord * 2 - 100`. 여기가 그 비례의 단일 출처다 (P8).
   지형·지도 편집·대격변이 **같은 상수**로 왕복 변환해야 그린 그대로 피어난다.
   ══════════════════════════════════════════════════════════════════ */
export const WORLD_SCALE = Object.freeze({
  LAYOUT: 1.16,        // layout [-100,100] → 월드 반경 배율
  AUTHOR_SPAN: 100,    // 작가 공간의 한 변 (0~100)
});
/** 작가 공간 좌표 → 월드 축 좌표 (x·z 공통) */
export const authorToWorldAxis = (a) => (a * 2 - WORLD_SCALE.AUTHOR_SPAN) * WORLD_SCALE.LAYOUT;
/** 월드 축 좌표 → 작가 공간 좌표 (위 식의 정확한 역함수) */
export const worldToAuthorAxis = (w) => (w / WORLD_SCALE.LAYOUT + WORLD_SCALE.AUTHOR_SPAN) / 2;

/* ══════════════════════════════════════════════════════════════════
   8.7 지도 편집 모드 (#15) — 계약 §7 "지도 편집 모드"
   오버레이는 2D 캔버스로 그리지만 색은 여기서만 온다 (P8).
   ══════════════════════════════════════════════════════════════════ */
export const BIOME_VOCAB = Object.freeze(['meadow', 'forest', 'rock', 'snow', 'water', 'mystic']);

export const MAPEDIT = Object.freeze({
  CAM_Y: 430,              // 탑다운 진입 고도
  CAM_MIN: 130, CAM_MAX: 980,
  CLOSE_PX: 15,            // 첫 점을 다시 짚으면 폴리곤이 닫힌다 (화면 픽셀)
  HANDLE_PX: 4.5,          // 폴리곤 점 손잡이 반지름
  MARKER_PX: 7,            // 장소 마커 반지름
  GRAB_PX: 13,             // 마커를 집는 판정 반경
  LINE_W: 2,
  MIN_POINTS: 3,           // 폴리곤 최소 점 수
  BRUSH_MIN: 2, BRUSH_MAX: 30, BRUSH_DEFAULT: 8, BRUSH_STEP: 1,   // 작가 공간 반경
  GRID_STEP: 10,           // 작가 공간 격자 간격 (0~100 을 10칸)
  COAST: lighten(P.ACCENT_CYAN, 0.22),
  COAST_FILL: P.ACCENT_CYAN,
  COAST_SEL: lighten(P.ACCENT_GOLD, 0.24),
  GRID: mix(P.NEUTRAL_BONE, P.BASE_WATER, 0.52),
  MARKER: P.ACCENT_GOLD,
  MARKER_MOVED: P.ACCENT_CYAN,
  BRUSH_RING: lighten(P.NEUTRAL_BONE, 0.20),
  DIRTY: P.ACCENT_CRIMSON,
  FILL_ALPHA: 0.10,
  GRID_ALPHA: 0.16,
});

/* ══════════════════════════════════════════════════════════════════
   8.8 대격변 (#16) — 계약 §1 cataclysm · §7 "대격변 렌더"
   지형 자체의 상태 변화다. 연출 시간·형상 수치도 토큰이며 색은 12색 파생이다.
   ══════════════════════════════════════════════════════════════════ */
export const CATACLYSM = Object.freeze({
  EFFECTS: Object.freeze(['shatter', 'sink', 'rise', 'scorch']),
  MS: 1000,                // 전환 0.8~1.2초 (계약) — 왕복 같은 속도
  THROTTLE_MS: 70,         // 빠른 스크럽 중 diff 최소 간격 (TIME.THROTTLE_MS 와 같은 규칙)
  RADIUS: 34,              // 장소 대상 일대 반경 (월드 단위)
  RADIUS_REGION: 66,       // 구역 대상은 넓다
  FIELD: 96,               // 지형 변형 필드 텍스처 한 변 (CPU 갱신)
  DONE: 0.004,             // 이 아래는 "아직 일어나지 않은 것"
  // 파편 (shatter)
  SHARD_MIN: 4, SHARD_MAX: 9,
  SHARD_DEPTH: 26,         // 절단면 층리 깊이 (디오라마 암반과 같은 언어)
  SHARD_TIP: 0.34,         // 하부 역원뿔 수렴 비율
  SHARD_LIFT: 15,          // 파편이 뜨는 최대 높이
  SHARD_SINK: 6,           // 일부 파편은 반대로 내려앉는다
  SHARD_TILT: 0.17,        // 최대 기울기 (라디안)
  SHARD_GAP: 0.955,        // 파편 사이 틈 (셀 수축 비율)
  // 지반
  SINK_DEPTH: 21,
  RISE_HEIGHT: 16,
  VOID_DEPTH: 27,          // 파편이 떠난 자리의 함몰
  MAX_DOWN: 30,            // 필드 R 채널의 최대 하강량 (셰이더 스케일)
  MAX_UP: 18,              // 필드 G 채널의 최대 상승량
  FLOOD: 0.34,             // 하강량 → 수심으로 읽는 계수
  // 초토 (scorch)
  SCORCH_MIX: 0.72,        // 지표색을 초토색으로 끌어가는 상한
  EMBER_PER_SITE: 24,
  EMBER_SIZE: 8,
  EMBER_RISE: 17,
  EMBER_OPACITY: 0.5,
  SCORCH: darken(mix(P.NEUTRAL_INK, P.SECOND_TIMBER, 0.30), 0.06),
  EMBER: lighten(P.ACCENT_CRIMSON, 0.30),
  // 융기(rise)의 물질화 발광 — 홀로그램과 같은 에지색을 쓴다 (하나의 언어, §3)
  RISE_GAIN: 1.9,
});

/* ══════════════════════════════════════════════════════════════════
   9. 자기 점검 — 토큰 수 (검증 스크립트가 읽는다)
   ══════════════════════════════════════════════════════════════════ */
export const ARTBIBLE_VERSION = '1.2.0';
