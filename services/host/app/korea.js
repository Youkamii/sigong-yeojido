import { activeAt, candActive } from './place-state.js';
// app/korea.js — 실제 한반도를 판톨로지 아트 바이블의 언어로 세운다.
//
// 판톨로지의 terrain.js 는 절차 생성 판타지 대륙이다. 우리는 지형이 실측이므로
// 그 자리만 갈아끼우고, 렌더링 코어(engine · artbible · materials · style)는 그대로 쓴다.
//
// 정본: fantology docs/03-art-bible.md
//   §1.1 제한 팔레트 — BASE_STONE 이 면적 최대 지분, ACCENT 는 5% 이하
//   §1.3 재질은 색이 아니라 빛 반응으로 구분 (MeshPhysicalMaterial)
//   ACCENT_CYAN   홀로그램 · 선택
//   ACCENT_CRIMSON 판본 충돌  ← 우리의 "비정이 갈림"이 정확히 이것이다
//
// 시공여지도 규약: 위치가 미정인 지명은 세우지 않는다 (docs/02-schema.md §9).
// 모르는 자리에 기둥을 꽂으면 그게 판정이다.

import * as THREE from 'three';
import { PALETTE, WHITE, hexNum, mix } from './artbible.js';
import { makeMaterial } from './materials.js';
import { makeGlow } from './style.js';
import { canvasTexture } from './util.js';

/* ── 디오라마 범위 — 한반도 + 지안(국내성) + 일본 서안 한 자락 ── */
export const BOX = { lon0: 123.0, lon1: 132.0, lat0: 33.0, lat1: 43.5 };

const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const rad = (lon) => (lon * Math.PI) / 180;

const MX0 = rad(BOX.lon0), MX1 = rad(BOX.lon1);
const MY0 = merc(BOX.lat0), MY1 = merc(BOX.lat1);
const CX = (MX0 + MX1) / 2, CY = (MY0 + MY1) / 2;

/** 월드 반경 ±100 에 맞춘 배율 — 아트 바이블의 layout 공간과 같은 눈금 */
const SCALE = 200 / Math.max(MX1 - MX0, MY1 - MY0);

/** 경위도 → 월드 (x, z). 북쪽이 -z */
export function toWorld(lon, lat) {
  return [(rad(lon) - CX) * SCALE, -(merc(lat) - CY) * SCALE];
}

const LAND_DEPTH = 7;       // 부유 디오라마의 두께
const SEA_Y = 2.2;   // 물이 해안선을 적신다

/* ══════════════════════════════════════════════════════════════════
   지형
   ══════════════════════════════════════════════════════════════════ */

function ringToShape(ring, Shape) {
  const s = new Shape();
  ring.forEach((pt, i) => {
    const [x, z] = toWorld(pt[0], pt[1]);
    // Shape 은 XY 평면. rotateX(-90°) 가 y 를 -z 로 보내므로 여기에는 +z 를 넣는다.
    i ? s.lineTo(x, z) : s.moveTo(x, z);
  });
  return s;
}

/* ── 박스로 잘라내기 (Sutherland–Hodgman) ──────────────────────────────
 * 겹치는지만 보고 통과시키면 아시아 대륙 폴리곤이 통째로 들어와 월드가 수천 단위로
 * 뻗는다(실제로 반경 1883이 나왔다). 디오라마는 틀에서 잘려야 한다. */
const EDGES = [
  { inside: (p) => p[0] >= BOX.lon0, at: (a, b) => cutX(a, b, BOX.lon0) },
  { inside: (p) => p[0] <= BOX.lon1, at: (a, b) => cutX(a, b, BOX.lon1) },
  { inside: (p) => p[1] >= BOX.lat0, at: (a, b) => cutY(a, b, BOX.lat0) },
  { inside: (p) => p[1] <= BOX.lat1, at: (a, b) => cutY(a, b, BOX.lat1) },
];
function cutX(a, b, x) {
  const t = (x - a[0]) / (b[0] - a[0]);
  return [x, a[1] + t * (b[1] - a[1])];
}
function cutY(a, b, y) {
  const t = (y - a[1]) / (b[1] - a[1]);
  return [a[0] + t * (b[0] - a[0]), y];
}

/** 링을 박스로 자른다. 완전히 밖이면 빈 배열. */
function clipRing(ring) {
  let out = ring;
  for (const e of EDGES) {
    const src = out;
    out = [];
    if (!src.length) break;
    for (let i = 0; i < src.length; i++) {
      const cur = src[i];
      const prev = src[(i + src.length - 1) % src.length];
      const cin = e.inside(cur), pin = e.inside(prev);
      if (cin) {
        if (!pin) out.push(e.at(prev, cur));
        out.push(cur);
      } else if (pin) {
        out.push(e.at(prev, cur));
      }
    }
  }
  return out;
}

/** 라인(하천)을 박스 안 구간들로 쪼갠다. */
function clipLine(line) {
  const inBoxPt = (p) =>
    p[0] >= BOX.lon0 && p[0] <= BOX.lon1 && p[1] >= BOX.lat0 && p[1] <= BOX.lat1;
  const segs = [];
  let cur = [];
  for (const p of line) {
    if (inBoxPt(p)) cur.push(p);
    else if (cur.length) { segs.push(cur); cur = []; }
  }
  if (cur.length) segs.push(cur);
  return segs.filter((s) => s.length > 1);
}

function buildLand(geo) {
  const group = new THREE.Group();
  group.name = 'land';

  // §1.1 — 지면은 BASE_STONE/EARTH 가 면적을 갖는다. 채도는 억제.
  const top = makeMaterial('MAT_STONE', {
    color: mix(PALETTE.BASE_STONE, PALETTE.BASE_VERDANT, 0.38),
    roughness: 0.9,
    metalness: 0.0,
  });
  const side = makeMaterial('MAT_STONE', {
    color: PALETTE.NEUTRAL_INK,
    roughness: 0.99,
    metalness: 0.0,
  });

  let rim = 0;
  for (const f of geo.features) {
    if (f.properties?.kind !== 'land') continue;
    const g = f.geometry;
    if (!g?.coordinates) continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;

    for (const poly of polys) {
      if (!poly[0] || poly[0].length < 4) continue;
      const outer = clipRing(poly[0]);
      if (outer.length < 4) continue;
      const shape = ringToShape(outer, THREE.Shape);
      for (let i = 1; i < poly.length; i++) {
        const hole = clipRing(poly[i]);
        if (hole.length < 4) continue;
        shape.holes.push(ringToShape(hole, THREE.Path));
      }
      const geom = new THREE.ExtrudeGeometry(shape, {
        depth: LAND_DEPTH,
        bevelEnabled: true,
        bevelThickness: 0.55,
        bevelSize: 0.45,
        bevelSegments: 1,
      });
      geom.rotateX(-Math.PI / 2);
      geom.computeBoundingSphere();
      const bs = geom.boundingSphere;
      if (bs) rim = Math.max(rim, bs.center.length() + bs.radius);

      const mesh = new THREE.Mesh(geom, [top, side]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
  }
  return { group, rim };
}

function buildRivers(geo, heightAt = null) {
  const group = new THREE.Group();
  group.name = 'rivers';
  const mat = new THREE.LineBasicMaterial({
    color: hexNum(PALETTE.BASE_WATER),
    transparent: true,
    opacity: 0.55,
  });
  for (const f of geo.features) {
    if (f.properties?.kind !== 'river') continue;
    const g = f.geometry;
    if (!g?.coordinates) continue;
    const raw = g.type === 'LineString' ? [g.coordinates] : g.coordinates;
    const lines = raw.flatMap(clipLine);
    for (const line of lines) {
      const pts = line.map((pt) => {
        const [x, z] = toWorld(pt[0], pt[1]);
        const y = heightAt ? terrainY(Math.max(0, heightAt(pt[0], pt[1]))) + 0.15 : LAND_DEPTH + 0.12;
        return new THREE.Vector3(x, y, z);
      });
      if (pts.length > 1) group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }
  }
  return group;
}

function buildSea(rim) {
  const r = rim * 1.9;
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(r, 96),
    // 판톨로지 MAT_WATER 는 transmission 0.6 — 밑에 지형이 있을 때의 설정이다.
    // 우리 디오라마 밑은 허공이라 투과하면 검게 보이므로 끈다. 반사·거칠기는 프리셋을 따른다.
    makeMaterial('MAT_WATER', {
      color: PALETTE.BASE_WATER, transmission: 0,
      roughness: 0.42, envMapIntensity: 0.7,          // 거울면(0.06)은 위에서 볼 때 검은 환경만 비춘다
      emissive: '#0a161c', emissiveIntensity: 0.35,   // 어떤 각도에서도 허공처럼 죽지 않게
      // MAT_WATER 프리셋엔 bumpScale 이 없다 → makeMaterial 이 undefined 를 넣는다.
      // three 는 uniform 캐시가 비어 있을 땐 업로드를 건너뛰지만, 같은 프로그램을 쓰는 다른 재질
      // (MAT_STONE 등)이 먼저 숫자를 올린 뒤엔 undefined → NaN 으로 올라가 바다 전체가 NaN(검정)이 된다.
      // 바다 위에 놓인 라벨이 흰 막대로 깨진 것도 이 NaN 을 물려받은 것. 값을 명시해서 막는다.
      bumpScale: 0.02,
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = SEA_Y;
  mesh.receiveShadow = true;
  mesh.name = 'sea';
  return mesh;
}

/* ══════════════════════════════════════════════════════════════════
   지형 — 실측 고도 격자 (NOAA ETOPO 2022 CC0 · data/geo/korea-elevation.json, #9)
   폴리곤 클리핑 판 대신 격자로 땅을 세운다. 해수면(0 m)이 BASE_Y, 산은 그 위로 솟고
   해저는 판 두께 안으로 눌러 넣는다. 디오라마는 BOX 에서 잘려 치마(skirt)로 막는다.
   ══════════════════════════════════════════════════════════════════ */
const BASE_Y = LAND_DEPTH;          // 해수면의 월드 높이 — 기존 부유판 두께와 같은 눈금
const H_LAND = 10 / 2446;           // 백두산(격자값 2,446 m) → 10 유닛. 디오라마 과장
const H_SEA = 0.0012;               // 해저 3,000 m → 3.6 유닛 아래. 판 두께 안에서만
const SEABED_MIN_Y = 0.8;
const SEABED_DROP = 0.3;              // 해저는 수면보다 최소 이만큼 아래 — 서해 갯벌(-1~-20 m)이 수면 위로 삐져나오지 않게
const SEA_SURFACE_Y = BASE_Y - 0.02;

/** 격자 쌍선형 보간 — (lon, lat) → 고도 m. 박스 밖은 0 */
export function makeHeightAt(elev) {
  const { cols, rows, lon0, lat0, step, heights } = elev;
  return (lon, lat) => {
    const fx = (lon - lon0) / step, fy = (lat - lat0) / step;
    if (!(fx >= 0 && fy >= 0 && fx <= cols - 1 && fy <= rows - 1)) return 0;
    const x0 = Math.min(cols - 2, Math.floor(fx)), y0 = Math.min(rows - 2, Math.floor(fy));
    const tx = fx - x0, ty = fy - y0;
    const h00 = heights[y0 * cols + x0], h10 = heights[y0 * cols + x0 + 1];
    const h01 = heights[(y0 + 1) * cols + x0], h11 = heights[(y0 + 1) * cols + x0 + 1];
    return (h00 * (1 - tx) + h10 * tx) * (1 - ty) + (h01 * (1 - tx) + h11 * tx) * ty;
  };
}

/** 고도 m → 월드 y */
export function terrainY(h) {
  return h > 0 ? BASE_Y + h * H_LAND : Math.max(SEABED_MIN_Y, BASE_Y - SEABED_DROP + h * H_SEA);
}

// 고도별 정점색 — 전부 팔레트 혼합 (§1.1). 저지대는 식생 쪽, 산지는 흙·암반, 고봉은 밝은 뼈색.
const C_SEABED = new THREE.Color(mix(PALETTE.NEUTRAL_INK, PALETTE.BASE_WATER, 0.35));
const C_LOW = new THREE.Color(mix(PALETTE.BASE_STONE, PALETTE.BASE_VERDANT, 0.55));
const C_MID = new THREE.Color(mix(PALETTE.BASE_STONE, PALETTE.BASE_VERDANT, 0.30));
const C_HIGH = new THREE.Color(mix(PALETTE.BASE_STONE, PALETTE.BASE_EARTH, 0.40));
const C_PEAK = new THREE.Color(mix(PALETTE.BASE_STONE, PALETTE.NEUTRAL_BONE, 0.45));
function landColor(h, out) {
  if (h <= 0) return out.copy(C_SEABED);
  if (h < 150) return out.copy(C_LOW).lerp(C_MID, h / 150);
  if (h < 700) return out.copy(C_MID).lerp(C_HIGH, (h - 150) / 550);
  return out.copy(C_HIGH).lerp(C_PEAK, Math.min(1, (h - 700) / 1200));
}

/**
 * 격자 → 지형 메시 + 치마 + 바닥 + 바다면. sub 는 격자 솎음(1 = 전부, 3 = 1/3).
 * 반환 { group, rim } — rim 은 박스 모서리 거리(카메라 프레이밍용).
 */
function buildTerrain(elev, sub = 1) {
  const group = new THREE.Group();
  group.name = 'terrain';
  const { cols, rows, step, lon0, lat0 } = elev;
  sub = Math.max(1, Math.floor(sub));
  const nx = Math.floor((cols - 1) / sub) + 1, nz = Math.floor((rows - 1) / sub) + 1;
  const pos = new Float32Array(nx * nz * 3);
  const col = new Float32Array(nx * nz * 3);
  const uv = new Float32Array(nx * nz * 2);
  const c = new THREE.Color();
  for (let j = 0; j < nz; j++) {                    // j: 남 → 북
    const r = Math.min(rows - 1, j * sub);
    const lat = lat0 + r * step;
    for (let i = 0; i < nx; i++) {
      const ci = Math.min(cols - 1, i * sub);
      const lon = lon0 + ci * step;
      const h = elev.heights[r * cols + ci];
      const [x, z] = toWorld(lon, lat);
      const k = j * nx + i;
      pos[k * 3] = x; pos[k * 3 + 1] = terrainY(h); pos[k * 3 + 2] = z;
      landColor(h, c); col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
      uv[k * 2] = x / 20; uv[k * 2 + 1] = z / 20;   // 디테일 범프 — 월드 20 유닛마다 한 바퀴
    }
  }
  // 위에서 봤을 때 반시계(법선 +y) — 북쪽이 -z 이므로 (a, b, c)·(b, d, c)
  const idx = new Uint32Array((nx - 1) * (nz - 1) * 6);
  let q = 0;
  for (let j = 0; j < nz - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i, b = a + 1, cc = a + nx, d = cc + 1;
      idx[q++] = a; idx[q++] = b; idx[q++] = cc;
      idx[q++] = b; idx[q++] = d; idx[q++] = cc;
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geom.setIndex(new THREE.BufferAttribute(idx, 1));
  geom.computeVertexNormals();
  geom.computeBoundingSphere();

  // §1.1 — 땅은 MAT_STONE. 정점색이 고도를 말하므로 재질색은 항등원(WHITE).
  const land = new THREE.Mesh(
    geom,
    makeMaterial('MAT_STONE', { color: WHITE, vertexColors: true, roughness: 0.92, metalness: 0.0 })
  );
  land.name = 'land';
  land.receiveShadow = true;
  land.userData.fanGround = true;           // 받기만 한다 (engine._tagShadows)
  group.add(land);

  // 치마 — 박스 네 변을 y=0 까지 내려 막는다. 바닥도 덮는다.
  const ring = [];
  for (let i = 0; i < nx; i++) ring.push(0 * nx + i);                    // 남변 서→동
  for (let j = 1; j < nz; j++) ring.push(j * nx + (nx - 1));             // 동변 남→북
  for (let i = nx - 2; i >= 0; i--) ring.push((nz - 1) * nx + i);        // 북변 동→서
  for (let j = nz - 2; j >= 1; j--) ring.push(j * nx + 0);               // 서변 북→남
  const n = ring.length;
  const spos = new Float32Array(n * 2 * 3);
  for (let t = 0; t < n; t++) {
    const k = ring[t];
    spos[(t * 2) * 3] = pos[k * 3]; spos[(t * 2) * 3 + 1] = pos[k * 3 + 1]; spos[(t * 2) * 3 + 2] = pos[k * 3 + 2];
    spos[(t * 2 + 1) * 3] = pos[k * 3]; spos[(t * 2 + 1) * 3 + 1] = 0; spos[(t * 2 + 1) * 3 + 2] = pos[k * 3 + 2];
  }
  const sidx = new Uint32Array(n * 6);
  q = 0;
  for (let t = 0; t < n; t++) {
    const a = t * 2, b = ((t + 1) % n) * 2;
    sidx[q++] = a; sidx[q++] = b; sidx[q++] = a + 1;
    sidx[q++] = b; sidx[q++] = b + 1; sidx[q++] = a + 1;
  }
  const sgeom = new THREE.BufferGeometry();
  sgeom.setAttribute('position', new THREE.BufferAttribute(spos, 3));
  sgeom.setIndex(new THREE.BufferAttribute(sidx, 1));
  sgeom.computeVertexNormals();
  const skirtMat = makeMaterial('MAT_STONE', {
    color: PALETTE.NEUTRAL_INK, roughness: 0.99, metalness: 0.0, side: THREE.DoubleSide, detail: false,
  });
  const skirt = new THREE.Mesh(sgeom, skirtMat);
  skirt.name = 'skirt';
  skirt.userData.fanNoShadow = true;
  group.add(skirt);

  // 바닥 (아래에서 올려다볼 때만 보인다)
  const [wx0, wz0] = toWorld(elev.lon0, elev.lat1 != null ? elev.lat1 : lat0 + (rows - 1) * step);
  const [wx1, wz1] = toWorld(elev.lon1 != null ? elev.lon1 : lon0 + (cols - 1) * step, lat0);
  const bw = wx1 - wx0, bh = wz1 - wz0;
  const bottom = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), skirtMat);
  bottom.rotation.x = Math.PI / 2;          // 법선 -y
  bottom.position.set((wx0 + wx1) / 2, 0, (wz0 + wz1) / 2);
  bottom.name = 'bottom';
  bottom.userData.fanNoShadow = true;
  group.add(bottom);

  // 바다면 — 박스 안에서만. 해수면 0 m 자리에서 해안선이 생긴다.
  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(bw, bh, 1, 1),
    makeMaterial('MAT_WATER', {
      color: PALETTE.BASE_WATER, transmission: 0,
      roughness: 0.42, envMapIntensity: 0.7,
      emissive: '#0a161c', emissiveIntensity: 0.35,
      bumpScale: 0.02,                          // 프리셋에 없다 → undefined 면 NaN (buildSea 참고)
    })
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.set((wx0 + wx1) / 2, SEA_SURFACE_Y, (wz0 + wz1) / 2);
  sea.receiveShadow = true;
  sea.name = 'sea';
  group.add(sea);

  const rim = Math.max(Math.hypot(wx0, wz0), Math.hypot(wx1, wz1), Math.hypot(wx0, wz1), Math.hypot(wx1, wz0));
  return { group, rim };
}


/* ══════════════════════════════════════════════════════════════════
   지명 — 홀로그램 광주
   ══════════════════════════════════════════════════════════════════ */

/** 상태별 강조색. 판본이 갈리는 곳은 아트 바이블의 '판본 충돌' 색을 그대로 쓴다. */
export const STATUS_COLOR = {
  established: PALETTE.ACCENT_CYAN,
  majority: PALETTE.BASE_VERDANT,
  disputed: PALETTE.ACCENT_CRIMSON,
  unlocated: PALETTE.SECOND_SLATE,
};

const COLUMN_H = 30;
const LABEL_BUDGET = 24;   // 한 번에 보이는 라벨 수 — 60개가 넘으면 글자가 서로를 가린다. 나머지는 고르면 보인다

function buildColumn(place, cand, index, heightAt = null) {
  const color = STATUS_COLOR[place.status] || PALETTE.SECOND_SLATE;
  const [x, z] = toWorld(cand.lon, cand.lat);
  const primary = index === 0;
  const g = new THREE.Group();
  g.name = `place:${place.id}:${index}`;
  g.userData = { placeId: place.id, candIndex: index, primary, fanNodeId: place.id, cand };
  g.position.set(x, heightAt ? terrainY(Math.max(0, heightAt(cand.lon, cand.lat))) : LAND_DEPTH, z);

  // 광주 — MAT_HOLO 로 세운다 (§홀로그램 물질화)
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(primary ? 0.62 : 0.44, primary ? 0.9 : 0.66, COLUMN_H, 12, 1, true),
    makeMaterial('MAT_HOLO', { color, opacity: primary ? 0.5 : 0.3 })
  );
  shaft.position.y = COLUMN_H / 2;
  g.add(shaft);

  // 바닥 고리 — 자리를 땅에 못박는다
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(primary ? 2.0 : 1.4, primary ? 2.7 : 1.9, 40),
    makeGlow(color, primary ? 0.5 : 0.28)
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.18;
  g.add(ring);

  // 머리 — 선택·피킹 대상
  const head = new THREE.Mesh(
    new THREE.OctahedronGeometry(primary ? 2.1 : 1.5, 0),
    makeMaterial('MAT_GLASS_ARCANE', { color, emissive: color })
  );
  head.position.y = COLUMN_H;
  head.userData = { placeId: place.id, fanNodeId: place.id };
  g.add(head);
  g.userData.head = head;
  g.userData.shaft = shaft;
  g.userData.ring = ring;

  // 라벨은 후보마다 두되 _applyLive 가 그 연도에 유효한 첫 후보에만 켠다 (도읍이 옮겨 가면 라벨도 따라간다)
  const label = makeLabel(place.labelKo, color);
  label.position.y = COLUMN_H + 7;
  label.visible = primary;
  g.add(label);
  g.userData.label = label;
  return g;
}

/* ── 라벨 — 도트 UI 계열(§4)에 맞춰 각진 판에 얹는다 ── */
function makeLabel(text, color) {
  const pad = 16, fs = 40;
  const tex = canvasTexture(512, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.font = `500 ${fs}px "Noto Sans KR", sans-serif`;
    const tw = ctx.measureText(text).width;
    const bw = Math.min(w - 4, tw + pad * 2), bh = fs + pad;
    const bx = (w - bw) / 2, by = (h - bh) / 2;
    ctx.fillStyle = 'rgba(12,10,8,.78)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = color;
    ctx.fillRect(bx, by + bh - 3, bw, 3);
    ctx.fillStyle = '#e6dcc8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);
  });
  const sp = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
  );
  sp.scale.set(30, 7.5, 1);
  sp.renderOrder = 10;
  return sp;
}

/** 후보가 갈리는 지명은 후보끼리 실선으로 잇는다 — 하나를 고르지 않았다는 표시 */
function buildDisputeLink(a, b, color) {
  const geom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(a[0], LAND_DEPTH + COLUMN_H, a[1]),
    new THREE.Vector3(b[0], LAND_DEPTH + COLUMN_H, b[1]),
  ]);
  return new THREE.Line(
    geom,
    new THREE.LineDashedMaterial({
      color: hexNum(color),
      dashSize: 2.4,
      gapSize: 2.0,
      transparent: true,
      opacity: 0.6,
    })
  );
}

/* ══════════════════════════════════════════════════════════════════
   조립
   ══════════════════════════════════════════════════════════════════ */

export class KoreaWorld {
  /**
   * @param geo    Natural Earth 육지·하천 (하천은 지형 위에 얹는다; 육지 폴리곤은 고도 격자가 없을 때만)
   * @param places 지명
   * @param opts   { elev: data/geo/korea-elevation.json 내용, sub: 격자 솎음(1|2|3) }
   */
  constructor(geo, places, opts = {}) {
    this.group = new THREE.Group();
    this.group.name = 'korea';
    this.places = places;
    this.byPlace = new Map();
    this.pickTargets = [];

    const elev = opts.elev && Array.isArray(opts.elev.heights) ? opts.elev : null;
    this.heightAt = elev ? makeHeightAt(elev) : null;
    if (elev) {
      const t = buildTerrain(elev, opts.sub || 1);
      this.maxRim = Math.max(t.rim, 60);
      this.group.add(t.group);
    } else {
      // 고도 격자가 없으면 예전 폴리곤 판 (클리핑 부산물이 남는다)
      const land = buildLand(geo);
      this.maxRim = Math.max(land.rim, 60);
      this.group.add(land.group);
      this.group.add(buildSea(this.maxRim));
    }
    this.group.add(buildRivers(geo, this.heightAt));

    const marks = new THREE.Group();
    marks.name = 'places';
    // 디오라마 틀(BOX) 밖의 후보는 세우지 않는다 — 허공에 뜬 기둥은 거짓 위치처럼 읽힌다.
    // 2D 지도와 근거 패널에는 그대로 나온다. 몇 개를 숨겼는지는 hiddenOutside 에 남긴다.
    const inBox = (c) => c.lon >= BOX.lon0 && c.lon <= BOX.lon1 && c.lat >= BOX.lat0 && c.lat <= BOX.lat1;
    this.hiddenOutside = [];
    for (const p of places) {
      if (!p.candidates?.length) continue;      // 미정은 세우지 않는다
      const cands = p.candidates.filter(inBox);
      if (cands.length < p.candidates.length) this.hiddenOutside.push([p.id, p.candidates.length - cands.length]);
      if (!cands.length) continue;
      const cols = cands.map((c, i) => {
        const col = buildColumn(p, c, i, this.heightAt);
        marks.add(col);
        this.pickTargets.push(col.userData.head);
        return col;
      });
      if (cols.length > 1) {
        const color = STATUS_COLOR[p.status] || PALETTE.SECOND_SLATE;
        for (let i = 1; i < cands.length; i++) {
          const a = toWorld(cands[0].lon, cands[0].lat);
          const b = toWorld(cands[i].lon, cands[i].lat);
          const link = buildDisputeLink(a, b, color);
          link.computeLineDistances();
          link.userData = { placeId: p.id, linkCands: [cands[0], cands[i]] };
          marks.add(link);
          cols.push(link);
        }
      }
      this.byPlace.set(p.id, cols);
    }
    this.group.add(marks);
    this.marks = marks;
    if (this.hiddenOutside.length) console.info("[korea] 틀 밖이라 세우지 않은 후보:", this.hiddenOutside);
  }

  /** 연대에 따라 살고 죽는다 — 2D 지도와 같은 규칙 */
  setYear(year) {
    this._year = year;
    this._applyLive();
  }

  /** 켜진 사료 집합 — 그 지명을 말하는 사료(mentions)가 전부 꺼지면 지명도 흐려진다 */
  setSourcesOn(on) {
    this._on = on ? new Set(on) : null;
    this._applyLive();
  }

  _isLive(p) {
    return activeAt(p, this._year ?? 0, this._on ?? null);
  }

  _candActive(c) {
    return candActive(c, this._year ?? 0);
  }

  /** 라벨을 줄 지명 — 선택된 것 먼저, 그다음 사료에서 많이 언급된 순으로 LABEL_BUDGET 개 */
  _labelBudget() {
    const score = (p) => Object.values(p.mentions || {}).reduce((n, v) => n + (+v || 0), 0);
    const live = this.places.filter((p) => this.byPlace.has(p.id) && this._isLive(p));
    live.sort((a, b) => (b.id === this._selected) - (a.id === this._selected) || score(b) - score(a) || a.id.localeCompare(b.id));
    return new Set(live.slice(0, LABEL_BUDGET).map((p) => p.id));
  }

  _applyLive() {
    const budget = this._labelBudget();
    for (const p of this.places) {
      const objs = this.byPlace.get(p.id);
      if (!objs) continue;
      const placeLive = this._isLive(p);
      let labelShown = false;
      for (const o of objs) {
        let live = placeLive;
        if (o.userData?.cand) live = placeLive && this._candActive(o.userData.cand);
        else if (o.userData?.linkCands) live = placeLive && o.userData.linkCands.every((c) => this._candActive(c));
        if (o.userData?.label) {
          o.userData.label.visible = live && !labelShown && budget.has(p.id);
          if (live) labelShown = true;
        }
        o.traverse((m) => {
          if (!m.material) return;
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          for (const mat of mats) {
            if (mat.userData.__baseOpacity == null) {
              mat.userData.__baseOpacity = mat.opacity != null ? mat.opacity : 1;
            }
            mat.transparent = true;
            mat.opacity = live ? mat.userData.__baseOpacity : mat.userData.__baseOpacity * 0.12;
          }
        });
      }
    }
  }

  setSelected(placeId) {
    this._selected = placeId;
    this._applyLive();          // 선택된 지명은 라벨 예산과 상관없이 보인다
    for (const [id, objs] of this.byPlace) {
      const on = id === placeId;
      for (const o of objs) {
        if (o.userData?.head) o.userData.head.scale.setScalar(on ? 1.5 : 1);
        if (o.userData?.ring) o.userData.ring.scale.setScalar(on ? 1.35 : 1);
      }
    }
  }

  /** 광주가 천천히 돈다 — 살아 있다는 신호. 시간이 흐르면 세계도 움직인다. */
  update(t) {
    for (const objs of this.byPlace.values()) {
      for (const o of objs) {
        const h = o.userData?.head;
        if (h) {
          h.rotation.y = t * 0.35;
          h.position.y = 30 + Math.sin(t * 1.1 + o.position.x * 0.05) * 0.5;
        }
      }
    }
  }
}
