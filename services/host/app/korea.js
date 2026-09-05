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
import { PALETTE, hexNum, mix } from './artbible.js';
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

function buildRivers(geo) {
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
        return new THREE.Vector3(x, LAND_DEPTH + 0.12, z);
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

function buildColumn(place, cand, index) {
  const color = STATUS_COLOR[place.status] || PALETTE.SECOND_SLATE;
  const [x, z] = toWorld(cand.lon, cand.lat);
  const primary = index === 0;
  const g = new THREE.Group();
  g.name = `place:${place.id}:${index}`;
  g.userData = { placeId: place.id, candIndex: index, primary, fanNodeId: place.id };
  g.position.set(x, LAND_DEPTH, z);

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

  if (primary) {
    const label = makeLabel(place.labelKo, color);
    label.position.y = COLUMN_H + 7;
    g.add(label);
    g.userData.label = label;
  }
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
  constructor(geo, places) {
    this.group = new THREE.Group();
    this.group.name = 'korea';
    this.places = places;
    this.byPlace = new Map();
    this.pickTargets = [];

    const land = buildLand(geo);
    this.maxRim = Math.max(land.rim, 60);
    this.group.add(land.group);
    this.group.add(buildRivers(geo));
    this.group.add(buildSea(this.maxRim));

    const marks = new THREE.Group();
    marks.name = 'places';
    for (const p of places) {
      if (!p.candidates?.length) continue;      // 미정은 세우지 않는다
      const cols = p.candidates.map((c, i) => {
        const col = buildColumn(p, c, i);
        marks.add(col);
        this.pickTargets.push(col.userData.head);
        return col;
      });
      if (cols.length > 1) {
        const color = STATUS_COLOR[p.status] || PALETTE.SECOND_SLATE;
        for (let i = 1; i < p.candidates.length; i++) {
          const a = toWorld(p.candidates[0].lon, p.candidates[0].lat);
          const b = toWorld(p.candidates[i].lon, p.candidates[i].lat);
          const link = buildDisputeLink(a, b, color);
          link.computeLineDistances();
          marks.add(link);
          cols.push(link);
        }
      }
      this.byPlace.set(p.id, cols);
    }
    this.group.add(marks);
    this.marks = marks;
  }

  /** 연대에 따라 살고 죽는다 — 2D 지도와 같은 규칙 */
  setYear(year) {
    for (const p of this.places) {
      const objs = this.byPlace.get(p.id);
      if (!objs) continue;
      const from = p.validFrom == null ? -9999 : p.validFrom;
      const to = p.validTo == null ? 9999 : p.validTo;
      const live = year >= from && year <= to;
      for (const o of objs) {
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
