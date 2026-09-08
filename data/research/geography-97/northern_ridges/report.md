# Issue #97 — northern mountain ridges (함경·마천령·적유령·강남, plus 낭림)

Continuation run after the reboot. The earlier collection left four northern ranges
with `geometry: null` and 낭림산맥 with a 3-point stub; this run closes all five.
No raw file from the earlier run survives in this folder, so **every source cited in
`geography.json` was downloaded again here**: 90 responses, 2.4 MB, each recorded in
`manifest.json` with url, fetchedUtc, httpStatus, byteLength and sha256.

`geography.json` contains only what changed: 5 ridges, 29 peaks, 10 sources and 22
explicit `missing` entries. `islands` is an empty array — Ulleungdo/Dokdo were
already verified and were not touched.

## What was missing and what closed it

The blocker was never the range descriptions — it was coordinates for North Korean
peaks. The earlier run tried OSM/Overpass bbox tiles and Korean Wikipedia; 9 of 11
tiles never completed and ko-wiki has no article for most northern peaks (three more
404s logged here: 남포태산, 북포태산, 두류산 (함경남도)).

The route that worked is the **GeoNames full-text search page**, which returns name,
alternate names, feature class, elevation, province and decimal coordinates for
KP place names. It is a different host from the `download.geonames.org` that the
earlier run correctly refused: `www.geonames.org/robots.txt` disallows only
`/dump/`, `/maps/`, `/servlet/`, `/kml/`, `/v3/` and URLs containing `:`.
Data licence is CC BY 4.0 (`raw/geonames_about.html`).

68 name queries were run, one raw file each.

## How a coordinate earned its place

A gazetteer record was accepted only when it could be checked against the citing
encyclopaedia article:

1. **elevation-verified** — the article's height and the GeoNames height agree
   (peaks ±30 m, passes ±25 %). 36 of the 58 accepted vertices.
2. **name+region only** — GeoNames carries no height for that record, but the name is
   the only candidate inside the province window the article states, the feature class
   is peak/mountain/pass, and its position keeps the order the article gives.
   20 vertices, each flagged in `points[].confidence`.
3. **name-unique, elevation conflict** — 남포태산 and 피난덕산 only. Used for position,
   with the conflict written into the point note and into `missing`.

Everything else was discarded as a name collision, including 관모봉's 342 m / 1,243 m /
2,171 m namesakes, 용연산 (950 m against a cited 1,598 m) and 백사봉's four other records.

Two collisions the earlier run got stuck on are now resolved by elevation:
**천마산** (평안북도, 1,169 m — not the 141/810/57/762 m OSM nodes) and
**온정령** (평안북도, 566 m — not the 금강산 pass). **차일봉** (1,742 m) likewise.

Cross-checks that came out clean: GeoNames 만탑산 41.29778/129.08172 (2,204 m) against
the earlier run's en-wiki point 41.29861/129.08167 (~100 m apart); 백두산, 와갈봉 and
추애산 against their earlier coordinates (0.6 km or less); ko-wiki 관모봉 for the
2,541 m height and 함경산맥 membership (that article carries no coordinate).

## Ridges produced

| id | vertices | length | axis stated by the source | longest unsupported segment |
|---|---|---|---|---|
| `hamgyeong-sanmaek` | 11 | 180 km | 북동∼남서 | 29 km |
| `macheollyeong-sanmaek` | 18 | 196 km | 백두산 → 성진 부근 (N→S) | 39 km |
| `jeogyuryeong-sanmaek` | 7 | 176 km | 동북동∼서남서 | 54 km |
| `gangnam-sanmaek` | 4 | 183 km | 북동 → 남서 | **96 km** |
| `nangnim-sanmaek` | 18 | 329 km | 남북 | 60 km |

All five are **DERIVED / GENERALIZED display ridges, not surveyed ridge lines**, and
each `accuracyNote` says so. They join only the peaks and passes the citing article
names, in the order or along the axis that article states; no intermediate vertex was
invented. `gangnam-sanmaek` in particular is a four-point sketch — the straight
96 km between 연덕산 and 비래봉 is not a surveyed course, and the note says that.

Two independent order checks fell out of the data rather than being imposed:

- 마천령산맥 — the article's enumeration 백두산·대정봉·대연지봉·소연지봉·선오산·간백산·소백산
  is exactly the latitude order of the matching GeoNames records (41.994 → 41.864).
  That is what decided the two 대연지봉 candidates and the two 소백산 candidates.
- 낭림산맥 — the article's three sections (국경 부근∼사랑봉 / 사랑봉∼사수산 / 사수산∼추가령)
  line up with the accepted vertices in latitude order.

두류산 appears on two ridges (함경 2,309 m at 41.165 and 낭림 1,324 m at 39.191) and
황봉 on two (마천령 2,047 m, 낭림 1,736 m). These are different mountains and are kept
as separate points and separate peak ids (`peak-두류산-함경`, `peak-황봉-마천령`,
`peak-황봉-낭림`); they must not be merged by name.

## Disagreements kept, not smoothed

- **천마산** — encykorea puts it on 강남산맥; ko-wiki (글로벌 세계대백과사전 기반) puts it on
  적유령산맥. Recorded as a `dispute` entry; the point sits on 강남산맥 only, and is not
  duplicated onto the other line.
- **강남산맥 extent** — ko-wiki gives the range a representative coordinate of
  41.085 N / 126.500 E, north-east of the span encykorea's named peaks imply. The two
  readings were not averaged; only encykorea's named points are drawn.
- **소백산 (낭림)** — the single GeoNames record 40.35220/126.91451 (2,186 m) answers to
  both 낭림산 and 소백산 and coincides with the 낭림산 point the earlier run already placed.
  Since encykorea says "실제 낭림산(2,014m)은 이 묘향산맥 상에 있다", they are two mountains,
  and one record cannot serve as both. Left unplaced.

## Concretely missing

`geography.json.missing` holds 22 entries, each with the name, the cited elevation,
the citing source, why it failed and a `nextStep`. Summary:

- **no gazetteer record at all** (4): 회와산 1,354 m, 황야봉 1,874 m, 대홍산 2,152 m,
  and 추가령 586 m (only a populated place of that name exists, and a settlement
  coordinate was not substituted for a pass).
- **elevation mismatch** (6): 용연산 1,598↔950, 희색봉 2,185↔2,022, 민색봉 1,688↔1,846,
  향라봉 1,987↔1,905/1,724, 향내봉 1,365 (no in-window match), 전지산 1,623↔1,582
  (41 m — a borderline case deliberately not waved through).
- **ambiguous between two valid candidates** (2): 월기봉 (1,214 m and 1,222 m records
  18 km apart, both inside ±30 m) and 백암산 (2.8 km from 숭적산, and claimed by two
  different ranges).
- **outside the range window** (2): 백산 1,875 m (적유령), 단목산 1,817 m.
- **verification still open** (3): 남포태산 2,495 vs 2,428 m; 피난덕산 1,963 vs 1,317 m;
  ten passes whose GeoNames records carry no elevation (차유령·무산령·허항령·남설령·마천령·
  적유령·구현령·거차령·기린령·마식령) — name, feature class and province match only.
- **inherited, untouched** (2): 백두대간 north of 진부령 still has no open line data —
  the 낭림/마천령 lines built here are *not* a substitute for it; and the South Korean
  gaps (황룡산, 두타산, 일월산, 소백산맥 9 points) are outside this task. Those last ones
  should fall to the same method with `country=KR`, which is the cheapest next step.

## Access rules honoured

- `download.geofabrik.de/robots.txt` disallows `*.osm.pbf`, `*.osm.bz2`, `*.shp.zip` —
  the North Korea extract was **not** downloaded.
- `download.openstreetmap.fr` disallows `/*.pbf$` — not downloaded.
- `overpass-api.de/robots.txt` disallows `/api/`. One mirror without a robots.txt
  (`overpass.private.coffee`) was tried once and timed out twice at 15 s; per the brief
  no further Overpass attempts were made.
- `www.geonames.org` search pages are outside its robots disallow list; the disallowed
  `download.geonames.org` was not touched. GeoNames *detail* pages
  (`/2043039/kwanmo-bong.html`) were fetched for ten records and turned out to be
  client-rendered shells with identical bytes and no data — they are in `raw/` and in
  `manifest.json`, and nothing was read from them.
- All requests: 15 s timeout, at most one retry, 1.2 s between GeoNames queries.

## Files

| file | what it is |
|---|---|
| `geography.json` | the deliverable — `sources`, `ridges`, `peaks`, `islands` (empty), `missing` |
| `manifest.json` | 94 fetch records (90 successful, 3 × HTTP 404, 1 timeout) |
| `candidates.json` | every parsed gazetteer candidate, accepted or not |
| `progress.json` | run counters |

Two of the 29 peak entries update coordinates the catalogue already holds:
`peak-와갈봉` moves 0.6 km (ko-wiki point → elevation-verified gazetteer point, 2,270 vs
cited 2,262 m) and `peak-만탑산` moves ~100 m. `peak-두류산-함경` (2,309 m) is a **new**
id deliberately kept apart from the catalogue's `peak-두류산` (낭림, 1,324 m).
| `raw/` | 90 files, 2.4 MB of exact response bytes |
| `fetch.py`, `extract.py`, `resolve.py`, `match.py`, `build.py`, `validate.py` | the run, kept for audit |

`python validate.py` passes: every sha256 matches the bytes on disk, every excerpt is
an exact substring of its normalised page, no page is quoted for more than 25
whitespace-delimited words, every ridge has ≥4 distinct vertices inside the peninsula,
and every `sourceId` resolves.
