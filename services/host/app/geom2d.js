// app/geom2d.js — 평면 기하 (의존 0)
//
// 지도 편집(#15)·지형의 해안선 마스크·대격변 파편(#16)이 같은 판정을 써야 한다.
// 세 곳에 같은 코드를 흩어 두면 "작가가 안이라고 본 곳"과 "지형이 뭍이라고 본 곳"이 갈라진다.
// 그래서 판정은 여기 한 곳에만 있다. **three 도 artbible 도 import 하지 않는다** —
// 색이나 비례가 아니라 순수한 수학이고, 그래야 브라우저 밖에서도 그대로 검증할 수 있다.

/** 점-선분 거리의 제곱 */
export function segDist2(px, pz, ax, az, bx, bz) {
  const vx = bx - ax, vz = bz - az;
  const wx = px - ax, wz = pz - az;
  const L2 = vx * vx + vz * vz;
  let t = L2 > 1e-9 ? (wx * vx + wz * vz) / L2 : 0;
  t = t < 0 ? 0 : (t > 1 ? 1 : t);
  const dx = wx - vx * t, dz = wz - vz * t;
  return dx * dx + dz * dz;
}

/**
 * 짝홀(even-odd) 규칙 point-in-polygon.
 * 폴리곤 배열을 통째로 넘기면 안쪽 폴리곤이 자연히 구멍(내해·호수)이 된다.
 * @param polys [[x,y],...] 하나 또는 그 배열
 */
export function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, k = poly.length - 1; i < poly.length; k = i++) {
    const a = poly[i], b = poly[k];
    if (((a[1] > y) !== (b[1] > y))
      && (x < (b[0] - a[0]) * (y - a[1]) / ((b[1] - a[1]) || 1e-9) + a[0])) inside = !inside;
  }
  return inside;
}

/** 여러 폴리곤에 대한 짝홀 판정 (겹친 폴리곤은 구멍이 된다) */
export function pointInPolys(x, y, polys) {
  let inside = false;
  for (const poly of polys) if (pointInPoly(x, y, poly)) inside = !inside;
  return inside;
}

/** 볼록 다각형을 반평면으로 자른다 (Sutherland–Hodgman). d 방향의 반대쪽만 남는다. */
export function clipHalfPlane(poly, dx, dz, mx, mz) {
  const side = (p) => (p[0] - mx) * dx + (p[1] - mz) * dz;
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = side(a), db = side(b);
    if (da <= 0) out.push(a);
    if ((da <= 0) !== (db <= 0)) {
      const t = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

/** 씨앗 i 의 보로노이 셀 — 경계 다각형을 모든 수직이등분선으로 자른다 */
export function voronoiCell(seeds, i, boundary) {
  let poly = boundary.slice();
  const s = seeds[i];
  for (let j = 0; j < seeds.length; j++) {
    if (j === i) continue;
    const t = seeds[j];
    poly = clipHalfPlane(poly, t[0] - s[0], t[1] - s[1], (s[0] + t[0]) / 2, (s[1] + t[1]) / 2);
    if (poly.length < 3) return null;
  }
  return poly;
}

/* ── 변 색인 (거리장 굽기 전용) ──────────────────────────────────────────
   변을 균일 격자 버킷에 담아 두면 "이 점에서 가장 가까운 변"을 전 변을 훑지 않고 찾는다.
   버킷은 CSR(시작 색인 + 항목 배열) 한 쌍이라 변이 수십만 개여도 할당이 두 번뿐이다. */
const BIN_AXIS_MAX = 64;      // 축당 버킷 수 상한
const BIN_SPREAD_MAX = 48;    // 이보다 많은 버킷에 걸치는 긴 변은 담지 않고 **항상** 본다

const clampBin = (v, B) => (v < 0 ? 0 : (v > B - 1 ? B - 1 : v));

/** 변 e 의 버킷 범위를 out[0..3] 에 담고, 걸치는 버킷 수를 돌려준다 */
function edgeBinRange(edges, e, ext, cell, B, out) {
  const o = e * 4;
  const ax = edges[o], az = edges[o + 1], bx = edges[o + 2], bz = edges[o + 3];
  out[0] = clampBin(Math.floor(((ax < bx ? ax : bx) + ext) / cell), B);
  out[1] = clampBin(Math.floor(((ax < bx ? bx : ax) + ext) / cell), B);
  out[2] = clampBin(Math.floor(((az < bz ? az : bz) + ext) / cell), B);
  out[3] = clampBin(Math.floor(((az < bz ? bz : az) + ext) / cell), B);
  return (out[1] - out[0] + 1) * (out[3] - out[2] + 1);
}

function buildEdgeBins(edges, E, ext, size) {
  const B = Math.max(1, Math.min(BIN_AXIS_MAX, Math.round(Math.sqrt(E / 2)) || 1));
  const cell = size / B;
  const counts = new Int32Array(B * B + 1);
  const far = [];
  const range = [0, 0, 0, 0];
  for (let e = 0; e < E; e++) {
    if (edgeBinRange(edges, e, ext, cell, B, range) > BIN_SPREAD_MAX) { far.push(e); continue; }
    for (let j = range[2]; j <= range[3]; j++) {
      for (let i = range[0]; i <= range[1]; i++) counts[j * B + i + 1]++;
    }
  }
  for (let b = 0; b < B * B; b++) counts[b + 1] += counts[b];
  const starts = counts;                       // 누적합 = 각 버킷의 시작 색인
  const items = new Int32Array(starts[B * B]);
  const fill = new Int32Array(B * B);
  for (let e = 0; e < E; e++) {
    if (edgeBinRange(edges, e, ext, cell, B, range) > BIN_SPREAD_MAX) continue;
    for (let j = range[2]; j <= range[3]; j++) {
      for (let i = range[0]; i <= range[1]; i++) {
        const b = j * B + i;
        items[starts[b] + fill[b]++] = e;
      }
    }
  }
  return { B, cell, ext, starts, items, far };
}

/** 이 점에서 가장 가까운 변까지의 **거리 제곱** — 가까운 링부터 보고 하한으로 잘라낸다 */
function nearestEdgeDist2(x, z, edges, bins) {
  const { B, cell, ext, starts, items, far } = bins;
  let best = Infinity;
  for (let k = 0; k < far.length; k++) {
    const o = far[k] * 4;
    const dd = segDist2(x, z, edges[o], edges[o + 1], edges[o + 2], edges[o + 3]);
    if (dd < best) best = dd;
  }
  const bi = clampBin(Math.floor((x + ext) / cell), B);
  const bj = clampBin(Math.floor((z + ext) / cell), B);
  const maxR = Math.max(bi, B - 1 - bi, bj, B - 1 - bj);
  for (let r = 0; r <= maxR; r++) {
    // 링 r 의 버킷은 최소 (r-1)*cell 만큼 떨어져 있다 — 이미 그보다 가까우면 볼 것이 없다
    if (r > 0) {
      const bound = (r - 1) * cell;
      if (best <= bound * bound) break;
    }
    const i0 = bi - r, i1 = bi + r, j0 = bj - r, j1 = bj + r;
    for (let j = j0; j <= j1; j++) {
      if (j < 0 || j >= B) continue;
      const full = (j === j0 || j === j1);            // 위·아래 줄만 가로로 다 훑는다
      const step = full ? 1 : (i1 - i0 || 1);
      for (let i = i0; i <= i1; i += step) {
        if (i < 0 || i >= B) continue;
        const b = j * B + i;
        for (let p = starts[b], end = starts[b + 1]; p < end; p++) {
          const o = items[p] * 4;
          const dd = segDist2(x, z, edges[o], edges[o + 1], edges[o + 2], edges[o + 3]);
          if (dd < best) best = dd;
        }
      }
    }
  }
  return best;
}

/**
 * 해안선 거리장 — **point-in-polygon + 경계 거리 감쇠**를 한 번만 구워 두고 쌍선형으로 읽는다.
 * 지형의 heightAt 은 수만 번 불리므로 매번 전 변을 훑을 수는 없다 (그래서 격자 한 장).
 * 폴리곤이 여러 개면 짝홀 규칙이라 안쪽 폴리곤은 자연히 호수·내해가 된다.
 *
 * 굽는 비용 — 예전에는 격자 셀마다 **모든 변**을 훑었다(O(격자²×변)). 계약 §1 이 허용하는
 * 지도(폴리곤 64 × 점 4000)에서는 그것만으로 메인 스레드가 십수 초 멈춘다. 굽기는 부팅뿐
 * 아니라 **지도를 저장할 때마다**(rematerialize) 다시 도니 편집 자체가 불가능해진다.
 * 그래서 두 가지를 바꿨다. 결과 값은 예전과 같다(같은 짝홀 규칙·같은 거리):
 *   ① 변을 균일 격자 버킷에 담고 가까운 링부터 훑는다 — 링 밖은 거리 하한으로 잘라낸다.
 *   ② 안팎 판정은 행마다 교차점을 한 번만 모아 정렬해 스캔한다 (셀마다 전 변을 다시 훑지 않는다).
 */
export class SignedDistanceGrid {
  /**
   * @param polys  [[ [x,z], ... ], ...] 월드 XZ 폴리곤들
   * @param margin 격자가 폴리곤 밖으로 더 덮는 폭
   * @param grid   격자 한 변 (변이 많으면 자동으로 낮춘다)
   */
  constructor(polys, margin = 30, grid = 176) {
    this.polys = polys;
    let rad = 0;
    const edges = [];
    for (const poly of polys) {
      for (const p of poly) rad = Math.max(rad, Math.hypot(p[0], p[1]));
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length];
        edges.push(a[0], a[1], b[0], b[1]);
      }
    }
    this.radius = rad;
    const ext = Math.max(48, rad + margin);
    this.ext = ext;
    this.size = ext * 2;
    const E = edges.length / 4;
    // 변이 아주 많은 지도에서는 격자를 낮춘다 — 굽는 시간이 부팅을 잡아먹지 않게
    const G = E > 420 ? 112 : grid;
    this.G = G;
    this.d = new Float32Array(G * G);
    if (!E) { this.d.fill(-1000); return; }         // 그릴 해안선이 없다 = 전부 바다

    const bins = buildEdgeBins(edges, E, ext, this.size);
    const cross = new Float64Array(E);              // 이 행의 교차점 (행마다 다시 채운다)
    for (let j = 0; j < G; j++) {
      const z = (j / (G - 1)) * this.size - ext;
      // ── 안팎: 이 행과 만나는 변의 x 교차점을 한 번만 모아 정렬한다 (pointInPolys 와 같은 짝홀)
      let m = 0;
      for (let e = 0; e < E; e++) {
        const o = e * 4;
        const az = edges[o + 1], bz = edges[o + 3];
        if ((az > z) !== (bz > z)) {
          cross[m++] = (edges[o + 2] - edges[o]) * (z - az) / ((bz - az) || 1e-9) + edges[o];
        }
      }
      const row = cross.subarray(0, m);
      row.sort();                                   // 오름차순 (수치 배열이라 사전식 문제 없음)
      let seen = 0;                                 // x 이하 교차점 수 — x 가 커지므로 앞으로만 간다
      for (let i = 0; i < G; i++) {
        const x = (i / (G - 1)) * this.size - ext;
        while (seen < m && row[seen] <= x) seen++;
        const inside = ((m - seen) & 1) === 1;       // "x 보다 큰 교차점이 홀수 개" = 안쪽
        const dist = Math.sqrt(nearestEdgeDist2(x, z, edges, bins));
        this.d[j * G + i] = inside ? dist : -dist;
      }
    }
  }

  /** 폴리곤 안쪽인가 (격자를 거치지 않는 정확한 판정) */
  contains(x, z) { return pointInPolys(x, z, this.polys); }

  /** 해안선까지의 부호 있는 거리 (양수 = 뭍). 격자 밖은 먼 바다다. */
  distAt(x, z) {
    const G = this.G;
    const fx = ((x + this.ext) / this.size) * (G - 1);
    const fz = ((z + this.ext) / this.size) * (G - 1);
    if (!(fx >= 0 && fx <= G - 1 && fz >= 0 && fz <= G - 1)) return -1000;
    const i0 = Math.floor(fx), j0 = Math.floor(fz);
    const i1 = Math.min(G - 1, i0 + 1), j1 = Math.min(G - 1, j0 + 1);
    const tx = fx - i0, tz = fz - j0;
    const d = this.d;
    const a0 = d[j0 * G + i0], a1 = d[j0 * G + i1];
    const b0 = d[j1 * G + i0], b1 = d[j1 * G + i1];
    const a = a0 + (a1 - a0) * tx;
    const b = b0 + (b1 - b0) * tx;
    return a + (b - a) * tz;
  }
}
