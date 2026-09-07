# Issue #97 — Korean mountain ranges, Ulleungdo and Dokdo

Collection run for *Sigong Yeojido*. Everything below was actually downloaded into
`raw/` during this session and recorded in `manifest.json` (url, fetchedUtc,
httpStatus, byteLength, sha256). No coordinate in `geography.json` was typed from
memory: each one is either quoted verbatim from an authoritative page or read out
of a downloaded data file.

Network collection was stopped part-way by the integration lead after the Overpass
API mirrors stalled behind the environment's HTTP proxy. The deliverables were then
rebuilt from the files already on disk. **The northern ranges are therefore
incomplete, and that is recorded explicitly rather than filled in.**

## Files

| file | what it is |
|---|---|
| `geography.json` | the deliverable: `sources`, `ridges`, `peaks`, `islands`, `missing` |
| `manifest.json` | 192 fetch records — url, fetchedUtc, httpStatus, byteLength, sha256 |
| `progress.json` | run status counters |
| `report.md` | this file |
| `raw/` | 177 files, 21.5 MB of exact response bytes |

Scripts kept for auditability: `fetch.py` (downloader, robots-aware),
`extract.py`, `resolve.py` (name → coordinate index), `ridge_tools.py`
(stitch + Ramer–Douglas–Peucker), `ridges_spec.py`, `sources.py`, `excerpts.py`,
`build.py`, `validate.py`.

## What was collected

**Authoritative text sources**

- 국토지리정보원 **대한민국 국가지도집**: 산지 지형 (`page_3805`), 산 (`page_3781`),
  독도 (`page_1824`), 대한민국의 영토와 영해 (`page_1804`)
- 한국학중앙연구원 **한국민족문화대백과사전**: 산맥, 태백산맥, 소백산맥, 함경산맥,
  낭림산맥, 마천령산맥, 적유령산맥, 강남산맥, 백두대간 (공공누리/KOGL)
- **울릉군청** 일반현황 › 위치/면적 (official extreme-point table, page updated 2026-03-31)
- 한국학중앙연구원 **디지털울릉문화대전** 울릉도

**Open geographic data**

- **OpenStreetMap relation 9439787 «백두대간»** (route=hiking) — 267 member ways,
  29,919 vertices, downloaded in full. ODbL, © OpenStreetMap contributors.
- **OpenStreetMap named peak/saddle/pass nodes** — 2 of 11 planned bbox tiles
  completed before the run was stopped (2,425 nodes, 37.5–40.4 °N / 126.5–130.9 °E).
- **ko/en Wikipedia** articles for individually named peaks and passes (CC BY-SA 4.0),
  used only as a coordinate source and always labelled as such.

## Access rules honoured

- `download.geonames.org` — `robots.txt` is `Disallow: /`. **Not fetched**; the three
  refusals are recorded in `manifest.json` with `"blocked": "robots.txt disallow"`.
- `nominatim.openstreetmap.org/search`, `api.openstreetmap.org/api/`,
  `query.wikidata.org/sparql`, `wikidata.org/w/api.php`, `overpass-api.de/api/`,
  `knps.or.kr` — all robots-disallowed, so unused.
- `geonames.nga.mil` (NGA GNS) and `intodokdo.go.kr` present certificate chains that
  neither the system store nor `certifi` can verify. TLS verification was **not**
  weakened, so these were left uncollected.
- `overpass.osm.ch` and `maps.mail.ru` answered but hold regional extracts only
  (verified: Matterhorn 1 hit, 지리산 0 hits) — their empty responses were discarded.
- Geofabrik `.shp.zip` extracts failed at the environment's Squid proxy (502).

## How a coordinate had to earn its place

A candidate was accepted only if it could be **verified**:

1. an OSM node whose `ele` matches the elevation the citing article states —
   peaks ±30 m, saddles/passes ±25 % (pass heights are quoted at different points);
2. a Wikipedia article whose own infobox elevation matches the cited elevation;
3. for names the sources use only once, a single unambiguous article/node.

Anything else was treated as a **name collision and discarded**, with the reason
written into `geography.json.missing`. Collisions actually caught include:

- **황룡산** — the only OSM node of that name is a 130 m hill; 태백산맥's is 1,268 m.
- **두타산** — OSM `ele=1394` against the cited 1,353 m.
- **소백산** — the only downloaded article is the South Korean 1,439 m mountain,
  while 낭림산맥 cites 2,184 m and 마천령산맥 2,174 m. Discarded from both, so the
  South Korean peak is not dragged 400 km north.
- **주왕산** — ko says 129.147 °E, en says 127.163 °E; the en point falls outside the
  range window derived from 설악산/오대산/태백산 and was rejected.
- **형제봉, 비로봉, 연화봉, 도솔봉, 문수봉, 대덕산, 백운산, 관모봉, 두류산(함경), 대암산,
  천마산, 온정령** — same-name OSM nodes exist but all sit in the wrong tile at the
  wrong height.

## Ridges produced

| id | basis | vertices | notes |
|---|---|---|---|
| `baekdudaegan` | **published geometry** | 160 | real OSM route line |
| `taebaek-sanmaek` | generalized cited peaks | 13 | N→S |
| `sobaek-sanmaek` | generalized cited peaks | 13 | NE→SW |
| `nangnim-sanmaek` | generalized cited peaks | 3 | below the 4-point target |
| `hamgyeong-sanmaek` | generalized cited peaks | — | `geometry: null`, 1 verified point |
| `macheollyeong-sanmaek` | generalized cited peaks | — | `geometry: null`, 1 verified point |
| `jeogyuryeong-sanmaek` | generalized cited peaks | — | `geometry: null`, 0 verified points |
| `gangnam-sanmaek` | generalized cited peaks | — | `geometry: null`, 0 verified points |

`baekdudaegan` is the only line that is **published geometry**. It is the OSM
백두대간 hiking route, 29,919 original vertices simplified to 160 for display; it
covers 지리산 천왕봉 (35.337 °N) to 진부령 (38.266 °N) only, the relation carries
`fixme=incomplete`, and one ~2.4 km gap north of 속리산 was bridged with a straight
segment. Its northern endpoint independently matches the 진부령 node verified from a
separate query (OSM `ele=520` vs the cited 520 m).

Every other line is a **DERIVED / GENERALIZED display ridge, not a surveyed
boundary**, built by joining only the peaks and passes the cited article names, in
the order or along the axis that article states. Each carries that wording in its
`accuracyNote`.

Ranges with fewer than two verified points get `geometry: null` rather than a
degenerate line. Their verified point is still listed so nothing is thrown away.

## Peaks

24 peaks with cited elevations and verified coordinates, spanning both halves of the
peninsula: 백두산 2,744 m, 와갈봉 2,262, 만탑산 2,205, 낭림산 2,014, 묘향산, 추애산
1,530, 두류산 1,324, 금강산 1,636, 향로봉 1,296 in the north; 한라산 1,947, 지리산
1,915, 설악산 1,708, 반야봉 1,734, 덕유산 1,614, 태백산 1,567, 오대산 1,563, 노고단
1,507, 민주지산 1,242, 팔공산 1,192, 보현산 1,124, 주흘산 1,106, 속리산 1,058, 성인봉
984, 주왕산 720 in the south. Each entry carries an `accuracyNote` naming the
verification route.

## Islands

**독도 동도** `131.869556, 37.240778` and **독도 서도** `131.865167, 37.241833` —
국가지도집 states these as each islet's highest point in DMS
("동도가 북위 37도 14분 26.8초, 동경 131도 52분 10.4초이고, 서도가 북위 37도 14분
30.6초, 동경 131도 51분 54.6초이다."), converted to decimal at the original 0.1″
(≈3 m) precision. They agree with 울릉군청's official extreme points
(동도 동단 131° 52′ 20″, 동도 남단 37° 14′ 14″). No aggregate Dokdo entry is emitted.

Scale for drawing the two islets: shortest coast-to-coast distance 151 m; the strait
between them is 110–160 m wide and about 330 m long; whole-group area 187,554 m².
Dokdo lies **87.4 km east of Ulleungdo** — it must not be pulled toward the mainland.

**울릉도** keeps `lon`/`lat` as `null`: no official centre coordinate was obtainable,
so Codex should use the display centre derived from its existing HGIS coastal
polygon. Recorded instead: area 72.558826 km², coastline 56.5 km, summit 성인봉 984 m
(its own coordinate is in `peaks`), and the two official 울릉군청 extremes that belong
to the island itself — west 130° 47′ 37″ E, north 37° 33′ 01″ N.

Two traps documented in the data rather than silently inherited:

- 울릉군청's "동서간 96.3 km / 남북간 34.8 km" is the **county** extent including
  Dokdo, not the island's size, so `extentKm` is `null`.
- 디지털울릉문화대전's body text gives 울릉도 as "동경 131°52′" — the same longitude as
  Dokdo, and about 1° east of where the island is. Treated as a typo in the source
  and not used.

All `islands[].geometry` are `null`: no openly licensed coastline polygon was
obtained. Draw a symbolic landform at the true position.

제주도 was not collected — the brief says the map already has it.

## Concretely missing

`geography.json.missing` holds 76 entries, each with the name, the cited elevation,
the source that names it, and why it could not be placed.

- **64 ridge points**: 낭림산맥 18, 마천령산맥 12, 소백산맥 9, 함경산맥 8, 적유령산맥 8,
  강남산맥 6, 태백산맥 3.
- **9 peaks**: 관모봉 2,541 m, 남포태산 2,495, 대연지봉 2,360, 북포태산 2,289,
  숭적산 1,970, 연덕산 1,730, 두타산 1,353, 황룡산 1,268, 일월산 1,219.
- **백두대간 north of 진부령** — the OSM relation stops there; no open line data for
  the North Korean section to 백두산.
- **coastlines** for 울릉도 and 독도 동도·서도.
- **individual areas** of 동도 and 서도 — 국가지도집 publishes only the 187,554 m² total.

Root cause for most of these: the 9 unfinished OSM bbox tiles. `n5`/`n6`
(40.5–43.5 °N) hold 함경산맥, 마천령산맥 and 관모봉; `n1`/`n4` (124.0–126.5 °E) hold
적유령산맥 and 강남산맥; `s1`–`s4` hold the South Korean peaks that had to fall back to
Wikipedia. Korean Wikipedia has no article for 48 of the northern peaks (all 404,
logged in `manifest.json`), so it could not substitute. Re-running `get_tiles.py`
with smaller boxes on a working network would close most of the gap.

## Verification

`python validate.py` re-checks the deliverable and passes: every excerpt is exact in
the whitespace-normalised source text, no webpage is quoted for more than 25
whitespace-delimited words, every `LineString` has ≥2 points and lies inside the
peninsula, every `sourceId` resolves, and every `sha256` matches the bytes on disk.
The two `geometry: null` ranges are reported as warnings, by design.
