#!/usr/bin/env python3
"""한반도 고도(지형+수심) 격자를 NOAA ETOPO 2022 에서 받아 JSON 으로 만든다 (3D 디오라마용).

표준 배치: scripts/fetch_elevation.py
실행:      python3 scripts/fetch_elevation.py [--step 0.02] [--refetch]
산출:      data/geo/korea-elevation.json
캐시:      data/bulk/etopo2022/*.ascii  (원본 응답. .gitignore 의 data/bulk/*/ 에 걸려 저장소엔 안 들어간다)

범위는 services/host/app/korea.js 의 BOX 와 같다 — lon 123.0~132.0, lat 33.0~43.5.

── 출처 · 라이선스 (2026-09-05 페이지에서 직접 확인) ──────────────────────────
  데이터   ETOPO 2022 Global Relief Model, 30 arc-second "Ice Surface" 격자 (NOAA NCEI)
           https://www.ncei.noaa.gov/products/etopo-global-relief-model
  접근     NCEI THREDDS OPeNDAP, ASCII 응답 (표준 라이브러리 urllib 만으로 받는다)
           https://www.ngdc.noaa.gov/thredds/dodsC/global/ETOPO2022/30s/30s_surface_elev_netcdf/
             ETOPO_2022_v1_30s_N90W180_surface.nc.ascii?z[lat0:1:lat1][lon0:1:lon1]
  라이선스 https://www.ncei.noaa.gov/metadata/geoportal/rest/metadata/item/gov.noaa.ngdc.mgg.dem:etopo_2022/html
           "produced by NOAA and are not subject to copyright protection in the United States.
            NOAA waives any potential copyright and related rights in these data worldwide through
            the Creative Commons Zero 1.0 Universal Public Domain Dedication (CC0-1.0)."
           "SPDX License: Creative Commons Zero v1.0 Universal (CC0-1.0)"
           사용 제한: "Not to be used for navigation." (항해용 아님 — 우리 용도와 무관)
  인용     NOAA National Centers for Environmental Information. 2022: ETOPO 2022 15 Arc-Second
           Global Relief Model. https://doi.org/10.25921/fd45-gt74

── 격자 규약 ────────────────────────────────────────────────────────────────
  원본은 셀 중심이 -180+1/240 부터 1/120° 간격 (lat 도 -90 에서 북쪽으로 오름차순 —
  DAS 의 GeoTransform 속성은 북→남이라고 적혀 있지만 실제 lat 배열은 남→북이다. 실측했다).
  목표 격자는 노드 기준: lon = lon0 + col*step, lat = lat0 + row*step. 양 끝을 포함한다.
  각 노드 값은 원본 셀 중심 4개의 쌍선형 보간 → 정수 m 로 반올림.
  heights[row*cols + col], row 0 = 남쪽(lat0), col 0 = 서쪽(lon0). heights[0] 이 남서 모서리.

── 결정론 ──────────────────────────────────────────────────────────────────
  키는 정렬해서 쓰고 인덱스 산술은 Fraction 으로 정확히 한다. fetchedAt 은 날짜만 적으므로
  같은 날 두 번 돌리면 바이트가 같다.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import math
import sys
import time
import urllib.request
from array import array
from datetime import datetime, timezone
from fractions import Fraction as F
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "geo" / "korea-elevation.json"
CACHE = ROOT / "data" / "bulk" / "etopo2022"
UA = "sigong-yeojido/0.1 (historical ontology research)"

# services/host/app/korea.js 의 BOX 와 같아야 한다
BOX = {"lon0": F("123.0"), "lon1": F("132.0"), "lat0": F("33.0"), "lat1": F("43.5")}

OPENDAP = (
    "https://www.ngdc.noaa.gov/thredds/dodsC/global/ETOPO2022/30s/"
    "30s_surface_elev_netcdf/ETOPO_2022_v1_30s_N90W180_surface.nc"
)
SRC_STEP = F(1, 120)                 # 30 arc-second
SRC_LON0 = F(-180) + SRC_STEP / 2    # 첫 셀 중심 (node_offset=1, 픽셀=면적)
SRC_LAT0 = F(-90) + SRC_STEP / 2     # lat 배열은 남→북 오름차순 (실측)
SRC_FILL = -99999.0
BAND_ROWS = 130                      # 한 요청에 담는 행 수 (실측: 130행x1082열 = 1.2MB, 2~3초)

LICENSE_URL = (
    "https://www.ncei.noaa.gov/metadata/geoportal/rest/metadata/item/"
    "gov.noaa.ngdc.mgg.dem:etopo_2022/html"
)
LICENSE_TEXT = (
    "CC0-1.0. NOAA NCEI: \"produced by NOAA and are not subject to copyright protection in the "
    "United States. NOAA waives any potential copyright and related rights in these data worldwide "
    "through the Creative Commons Zero 1.0 Universal Public Domain Dedication (CC0-1.0).\" "
    "Use limitation: \"Not to be used for navigation.\""
)
CITATION = (
    "NOAA National Centers for Environmental Information. 2022: ETOPO 2022 15 Arc-Second Global "
    "Relief Model. NOAA National Centers for Environmental Information. "
    "https://doi.org/10.25921/fd45-gt74"
)

# 표본 검증 지점 — 과제 DoD 그대로
SAMPLES = [
    ("Baekdu-san", 128.08, 42.00, 2500, 2800),
    ("Halla-san", 126.53, 33.36, 1700, 2000),
    ("Seoul", 126.98, 37.57, 0, 200),
    ("East Sea", 131.0, 38.0, None, -1),
]


def floor_div(f: F) -> int:
    return f.numerator // f.denominator


def src_index(coord: F, origin: F) -> tuple[int, F]:
    """좌표 → (셀 인덱스, 셀 중심에서의 비율 0<=t<1). 정확한 유리수 산술."""
    f = (coord - origin) / SRC_STEP
    i = floor_div(f)
    return i, f - i


# ── 내려받기 ───────────────────────────────────────────────────────────────

def fetch(url: str, timeout: int = 600) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def band_text(j0: int, j1: int, i0: int, i1: int, refetch: bool) -> str:
    """행 j0..j1, 열 i0..i1 (양 끝 포함) 의 OPeNDAP ASCII 응답. 캐시가 있으면 그것을 쓴다."""
    CACHE.mkdir(parents=True, exist_ok=True)
    cache = CACHE / f"z_{j0}-{j1}_{i0}-{i1}.ascii"
    if cache.exists() and not refetch:
        return cache.read_text(encoding="utf-8")
    url = f"{OPENDAP}.ascii?z[{j0}:1:{j1}][{i0}:1:{i1}]"
    t0 = time.time()
    blob = fetch(url)
    print(f"  GET rows {j0}-{j1}: {len(blob)} bytes, {time.time() - t0:.1f}s")
    cache.write_bytes(blob)
    return blob.decode("utf-8")


def parse_band(text: str, nrows: int, ncols: int):
    """OPeNDAP ASCII Grid 응답을 (값 배열, lat 목록, lon 목록) 으로 푼다.

    형식 (실측):
        z.z[130][1082]
        [0], -30.5, -31.25, ...
        ...
        z.lat[130]
        32.9958..., 33.0041..., ...
        z.lon[1082]
        122.9958..., ...
    """
    lines = text.splitlines()
    vals = array("d")
    lats: list[float] = []
    lons: list[float] = []
    mode = None
    for ln in lines:
        s = ln.strip()
        if not s:
            continue
        if s.startswith("z.z["):
            mode = "z"
            continue
        if s.startswith("z.lat["):
            mode = "lat"
            continue
        if s.startswith("z.lon["):
            mode = "lon"
            continue
        if mode == "z" and s.startswith("["):
            _, _, rest = s.partition(",")
            vals.extend(float(v) for v in rest.split(","))
        elif mode == "lat":
            lats.extend(float(v) for v in s.split(","))
        elif mode == "lon":
            lons.extend(float(v) for v in s.split(","))
    if len(vals) != nrows * ncols or len(lats) != nrows or len(lons) != ncols:
        raise SystemExit(
            f"parse mismatch: values={len(vals)} (want {nrows * ncols}), "
            f"lats={len(lats)} (want {nrows}), lons={len(lons)} (want {ncols})"
        )
    return vals, lats, lons


def check_axis(got: list[float], first_index: int, origin: F, what: str) -> None:
    """서버가 준 좌표 배열이 우리 인덱스 계산과 맞는지 — 속성을 믿지 않고 실제 값으로 확인."""
    for k, v in enumerate(got):
        want = float(origin + (first_index + k) * SRC_STEP)
        if abs(v - want) > 1e-6:
            raise SystemExit(f"{what} axis mismatch at {first_index + k}: got {v}, want {want}")


def download(refetch: bool):
    """범위를 덮는 원본 셀 블록을 받아 (flat 값, 행 수, 열 수, 첫 행 인덱스, 첫 열 인덱스) 로 준다."""
    i0, _ = src_index(BOX["lon0"], SRC_LON0)
    i1 = src_index(BOX["lon1"], SRC_LON0)[0] + 1
    j0, _ = src_index(BOX["lat0"], SRC_LAT0)
    j1 = src_index(BOX["lat1"], SRC_LAT0)[0] + 1
    ncols = i1 - i0 + 1
    nrows = j1 - j0 + 1
    print(f"source window: rows {j0}..{j1} ({nrows}), cols {i0}..{i1} ({ncols})")

    flat = array("d")
    for a in range(j0, j1 + 1, BAND_ROWS):
        b = min(a + BAND_ROWS - 1, j1)
        text = band_text(a, b, i0, i1, refetch)
        vals, lats, lons = parse_band(text, b - a + 1, ncols)
        check_axis(lats, a, SRC_LAT0, "lat")
        check_axis(lons, i0, SRC_LON0, "lon")
        if min(vals) <= SRC_FILL + 1:
            raise SystemExit("fill value in window — unexpected for this region")
        flat.extend(vals)
    if len(flat) != nrows * ncols:
        raise SystemExit(f"assembled {len(flat)} values, want {nrows * ncols}")
    return flat, nrows, ncols, j0, i0


# ── 재표본 ───────────────────────────────────────────────────────────────

def resample(flat, nrows: int, ncols: int, j0: int, i0: int, step: F):
    cols = floor_div((BOX["lon1"] - BOX["lon0"]) / step) + 1
    rows = floor_div((BOX["lat1"] - BOX["lat0"]) / step) + 1
    if BOX["lon0"] + (cols - 1) * step != BOX["lon1"] or BOX["lat0"] + (rows - 1) * step != BOX["lat1"]:
        raise SystemExit("step does not divide the box exactly")

    # 열·행마다 (원본 인덱스, 보간 비율) 을 미리 계산 — 정확한 유리수로
    cx = []
    for c in range(cols):
        i, t = src_index(BOX["lon0"] + c * step, SRC_LON0)
        i -= i0
        if not 0 <= i < ncols - 1:
            raise SystemExit(f"col {c} maps outside window ({i})")
        cx.append((i, float(t)))
    ry = []
    for r in range(rows):
        j, t = src_index(BOX["lat0"] + r * step, SRC_LAT0)
        j -= j0
        if not 0 <= j < nrows - 1:
            raise SystemExit(f"row {r} maps outside window ({j})")
        ry.append((j, float(t)))

    heights = array("i")
    for j, ty in ry:
        row0 = j * ncols
        row1 = row0 + ncols
        for i, tx in cx:
            a = flat[row0 + i]
            b = flat[row0 + i + 1]
            c_ = flat[row1 + i]
            d = flat[row1 + i + 1]
            v = (a * (1 - tx) + b * tx) * (1 - ty) + (c_ * (1 - tx) + d * tx) * ty
            heights.append(math.floor(v + 0.5))
    return heights, cols, rows


# ── 저장 ─────────────────────────────────────────────────────────────────

def write_json(path: Path, meta: dict, heights, cols: int) -> None:
    """키 정렬 + heights 는 한 행씩 한 줄. 두 번 돌리면 바이트가 같다."""
    doc = dict(meta)
    doc["heights"] = None
    keys = sorted(doc)
    with io.open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("{\n")
        for n, k in enumerate(keys):
            comma = "," if n < len(keys) - 1 else ""
            if k == "heights":
                f.write('"heights":[\n')
                nrows = len(heights) // cols
                for r in range(nrows):
                    row = heights[r * cols:(r + 1) * cols]
                    f.write(",".join(str(v) for v in row))
                    f.write(",\n" if r < nrows - 1 else "\n")
                f.write("]" + comma + "\n")
            else:
                f.write(json.dumps(k) + ":" + json.dumps(doc[k], ensure_ascii=False, sort_keys=True) + comma + "\n")
        f.write("}\n")


# ── 검증 ─────────────────────────────────────────────────────────────────

def node_lookup(heights, cols: int, rows: int, step: float, lon: float, lat: float) -> float:
    """산출 격자에서 (lon, lat) 값을 쌍선형으로 읽는다."""
    fx = (lon - float(BOX["lon0"])) / step
    fy = (lat - float(BOX["lat0"])) / step
    c = min(max(int(math.floor(fx)), 0), cols - 2)
    r = min(max(int(math.floor(fy)), 0), rows - 2)
    tx, ty = fx - c, fy - r
    g = lambda cc, rr: heights[rr * cols + cc]
    return (g(c, r) * (1 - tx) + g(c + 1, r) * tx) * (1 - ty) + (g(c, r + 1) * (1 - tx) + g(c + 1, r + 1) * tx) * ty


def neighborhood_max(heights, cols: int, rows: int, step: float, lon: float, lat: float, radius: float) -> int:
    c0 = max(int(math.floor((lon - radius - float(BOX["lon0"])) / step)), 0)
    c1 = min(int(math.ceil((lon + radius - float(BOX["lon0"])) / step)), cols - 1)
    r0 = max(int(math.floor((lat - radius - float(BOX["lat0"])) / step)), 0)
    r1 = min(int(math.ceil((lat + radius - float(BOX["lat0"])) / step)), rows - 1)
    return max(heights[r * cols + c] for r in range(r0, r1 + 1) for c in range(c0, c1 + 1))


def source_max(raw, lon: float, lat: float, radius: float) -> float:
    """원본 30s 셀 중 (lon, lat) 주변 ±radius 안의 최댓값 — 격자 근사가 얼마나 깎았는지 보는 기준."""
    flat, nrows, ncols, j0, i0 = raw
    ia = src_index(F(str(lon - radius)), SRC_LON0)[0] - i0
    ib = src_index(F(str(lon + radius)), SRC_LON0)[0] - i0
    ja = src_index(F(str(lat - radius)), SRC_LAT0)[0] - j0
    jb = src_index(F(str(lat + radius)), SRC_LAT0)[0] - j0
    ia, ib = max(ia, 0), min(ib, ncols - 1)
    ja, jb = max(ja, 0), min(jb, nrows - 1)
    return max(flat[j * ncols + i] for j in range(ja, jb + 1) for i in range(ia, ib + 1))


def verify(path: Path, raw=None) -> int:
    """산출 파일을 다시 읽어 검사한다. 종료 코드는 구조 검사(격자 크기)만 반영한다.

    표본 지점은 정보로 찍는다 — 2 km 격자에서 봉우리는 정상보다 낮게 나오는 것이 정상이며,
    raw 가 있으면 원본 30s 격자의 주변 최댓값을 같이 찍어 얼마나 깎였는지 보인다.
    """
    doc = json.loads(path.read_text(encoding="utf-8"))
    h = doc["heights"]
    cols, rows, step = doc["cols"], doc["rows"], doc["step"]
    ok = cols * rows == len(h)
    print(f"grid: cols={cols} rows={rows} step={step} len(heights)={len(h)} "
          f"cols*rows={cols * rows} -> {'OK' if ok else 'MISMATCH'}")
    sea = sum(1 for v in h if v < 0)
    print(f"sea (v<0): {sea}/{len(h)} = {100 * sea / len(h):.1f}%  min={min(h)} max={max(h)}")
    for name, lon, lat, lo, hi in SAMPLES:
        v = node_lookup(h, cols, rows, step, lon, lat)
        mx = neighborhood_max(h, cols, rows, step, lon, lat, 0.05)
        in_range = (lo is None or v >= lo) and v <= hi
        rng = f"{lo}..{hi}" if lo is not None else f"<= {hi}"
        extra = f"  src30s max within 0.05deg = {source_max(raw, lon, lat, 0.05):.1f}" if raw else ""
        print(f"  {name:11s} ({lon}, {lat}): {v:8.1f} m  want {rng:12s} {'OK ' if in_range else 'OUT'}"
              f"  grid max within 0.05deg = {mx}{extra}")
    size = path.stat().st_size
    print(f"file: {path.relative_to(ROOT).as_posix()} {size} bytes ({size / 1024 / 1024:.2f} MB)")
    print(f"sha256: {hashlib.sha256(path.read_bytes()).hexdigest()}")
    return 0 if ok else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n", 1)[0])
    ap.add_argument("--step", default="0.02", help="degrees per node (default 0.02; 0.03 if file > 3MB)")
    ap.add_argument("--refetch", action="store_true", help="ignore data/bulk/etopo2022 cache")
    ap.add_argument("--verify-only", action="store_true", help="only check the existing JSON")
    args = ap.parse_args()
    if args.verify_only:
        return verify(OUT)

    step = F(args.step)
    raw = download(args.refetch)
    flat, nrows, ncols, j0, i0 = raw
    heights, cols, rows = resample(flat, nrows, ncols, j0, i0, step)

    meta = {
        "lon0": float(BOX["lon0"]),
        "lon1": float(BOX["lon1"]),
        "lat0": float(BOX["lat0"]),
        "lat1": float(BOX["lat1"]),
        "cols": cols,
        "rows": rows,
        "step": float(step),
        "unit": "m",
        "verticalDatum": "EGM2008 geoid (approx. mean sea level); negative = below sea level",
        "order": (
            "row-major, south to north: heights[row*cols + col] is the node at "
            "(lon0 + col*step, lat0 + row*step). heights[0] = south-west corner (lon0, lat0), "
            "last = north-east corner (lon1, lat1). Both ends inclusive."
        ),
        "method": (
            "bilinear interpolation of the 4 nearest ETOPO 2022 30 arc-second cell centres at each "
            "node, rounded to integer metres. Peaks are lower than true summits (about 2 km grid)."
        ),
        "source": "NOAA NCEI ETOPO 2022 Global Relief Model, 30 arc-second ice-surface grid (v1)",
        "sourceUrl": OPENDAP,
        "sourceDoi": "10.25921/fd45-gt74",
        "citation": CITATION,
        "license": LICENSE_TEXT,
        "licenseUrl": LICENSE_URL,
        "fetchedAt": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "script": "scripts/fetch_elevation.py",
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    write_json(OUT, meta, heights, cols)
    print(f"wrote {OUT.relative_to(ROOT).as_posix()}")
    return verify(OUT, raw)


if __name__ == "__main__":
    sys.exit(main())
