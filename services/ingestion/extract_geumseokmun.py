#!/usr/bin/env python3
"""한국고대금석문 벌크 XML을 금석문별 Source와 판독·해석·개관 조각으로 나눈다 (#16)."""
import argparse
import collections
import json
from pathlib import Path
import re
import zipfile
from xml.etree import ElementTree as ET

from extract_nikh_xml import ROOT, OutputWriter, ExtractError, extract_article, level_title, plain, sha256_of
from source_cards import output_hashes, write_card

DATASET = "15053630"
SECTION_TYPES = {"개관": "overview", "판독문": "reading", "해석문": "translation", "참고문헌": "bibliography"}


def date_bounds(raw):
    if not isinstance(raw, str) or raw.startswith("9999"):
        return None, None, None
    m = re.match(r"^(-?)(\d{3,4})(?:-|$)", raw)
    if m:
        year = int(m.group(1) + m.group(2))
        return year, year, year
    m = re.match(r"^(\d{2})##(?:-|$)", raw)
    if m:
        start = int(m.group(1)) * 100
        return None, start, start + 99
    return None, None, None


def extract(bulk, output):
    records, seen = {}, set()
    stats, unknown, sections = collections.Counter(), collections.Counter(), collections.Counter()
    bulk_sha = sha256_of(bulk)

    def metadata(level, labels):
        bd = level.find("front/biblioData")
        date = bd.find("date/dateOccured")
        return {"levelId": level.get("id"), "label": level_title(level), "labelHanja": plain(bd.find("title/alternative")),
                "polity": labels[0], "locator": " › ".join(labels),
                "date": {"raw": date.get("date"), "label": plain(date)} if date is not None else None,
                "findPlace": plain(bd.find("publication/place")), "owner": plain(bd.find("holdings/owner")),
                "size": plain(bd.find("physicalDescription/originSize")), "script": plain(bd.find("physicalDescription/originForm")),
                "frontXml": ET.tostring(level.find("front"), encoding="unicode"), "sections": []}

    def walk(level, path, owner, writer):
        labels = path + [level_title(level)]
        kids = [k for k in level if k.tag.startswith("level")]
        if kids and all(k.find("text") is not None for k in kids):
            if owner is not None:
                raise ExtractError(f"겹친 금석문: {level.get('id')}")
            owner = metadata(level, labels)
            if owner["levelId"] in records:
                raise ExtractError(f"금석문 id 중복: {owner['levelId']}")
            records[owner["levelId"]] = owner
        if level.find("text") is not None:
            if owner is None or kids:
                raise ExtractError(f"금석문 밖의 본문: {level.get('id')}")
            source = f"geumseok-{owner['levelId']}"
            chunk, art = extract_article(level, source, labels)
            kind = level.find("front/biblioData").get("type")
            section = SECTION_TYPES.get(kind, "other")
            chunk.update(inscriptionId=owner["levelId"], sectionType=section, sectionTypeRaw=kind,
                         reader=plain(level.find("front/biblioData/creator/author/name")) or None)
            hangul = sum(0xAC00 <= ord(ch) <= 0xD7A3 for ch in chunk["text"])
            chunk["lang"] = "ko" if hangul > chunk["hanjaCount"] else "hanmun"
            if chunk["date"] is None and section == "reading" and owner["date"]:
                chunk["date"] = dict(owner["date"], inheritedFrom=owner["levelId"])
            for term in chunk["indexTerms"]:
                term["text"] = term["text"].replace("\n", "")
            if chunk["id"] in seen:
                raise ExtractError(f"chunk id 중복: {chunk['id']}")
            seen.add(chunk["id"])
            owner["sections"].append({"chunkId": chunk["id"], "title": chunk["title"], "type": section, "reader": chunk["reader"]})
            writer(chunk)
            sections[section] += 1
            stats["chunks"] += 1
            stats["empty"] += not chunk["text"]
            stats["annotations"] += len(art.annotations)
            stats["indexTerms"] += len(art.index_terms)
            unknown.update(art.unknown_tags)
        for kid in kids:
            walk(kid, labels, owner, writer)

    with OutputWriter(output) as writer, zipfile.ZipFile(bulk) as z:
        for name in sorted(z.namelist()):
            if not name.endswith(".xml"):
                continue
            root = ET.fromstring(z.read(name))
            stats["xmlFiles"] += 1
            stats["xmlTexts"] += sum(1 for x in root.iter() if x.tag.startswith("level") and x.find("text") is not None)
            for level in root.iter("level1"):
                walk(level, [], None, writer)
    if stats["chunks"] != stats["xmlTexts"] or unknown:
        raise ExtractError(f"본문 대조 실패/미확인 태그: {dict(stats)} {dict(unknown)}")
    for lid, rec in records.items():
        source = f"geumseok-{lid}"
        raw = (rec["date"] or {}).get("raw")
        year, start, end = date_bounds(raw)
        meta = {"label": rec["label"], "labelHanja": rec["labelHanja"], "sourceKind": "금석문",
                "sourceGroup": f"금석문 · {rec['polity']}", "composedYear": year, "coversFrom": start, "coversTo": end,
                "originalLanguage": "mixed", "sourceLevelId": lid}
        body = f'''국편 한국고대금석문 벌크의 `{lid}`. 경로: {rec['locator']}.
금석문 하나를 Source로 두고 판독문·해석문·개관·참고문헌을 별도 조각으로 보존한다.
각 절의 종류는 XML `biblioData.type`에서, 판독자 표기는 XML 저자 이름에서 가져온다.
절 제목이 다르다는 이유만으로 사람 이름이나 판독문이라고 추정하지 않는다.

## 연도와 출처

XML 날짜: `{raw}` — {(rec['date'] or {}).get('label') or '표기 없음'}.
정확한 연도가 있으면 제작 연도와 수록 시점에 같은 값을 쓴다. `05##` 같은 세기 표기는 범위만 쓰고 점은 찍지 않는다.
9999·빈값·해석하지 못한 표기는 미상으로 남긴다. 판독문에만 금석문의 날짜를 상속한다.
현대 해제·해석·참고문헌을 그 해에 쓰인 기사로 연력에 넣지 않는다.

출토·소재지 원표기: {rec['findPlace'] or '없음'}. 소장처: {rec['owner'] or '없음'}.
크기: {rec['size'] or '없음'}. 서체: {rec['script'] or '없음'}.
[국편 항목](https://db.history.go.kr/id/{lid})의 id를 연결 정보로 보존했다.

주석은 본문에서 분리하고 `newChar`는 〓와 코드로 남긴다. 줄바꿈이 들어간 색인어는 이름 안의 줄바꿈만 제거한다.
추출·두 번 실행 대조·기사 수·빈 조각의 사유는 `docs/research/geumseokmun-ingestion.md`에 기록한다.
'''
        if lid == "gskh_001_0010_0010":
            body += "\n기존 `src-gwanggaeto`(위키문헌 판독)와 같은 광개토왕릉비를 다루지만 판본을 합치지 않는다.\n국편에 실린 판독자별 조각과 기존 42개 조각을 별도로 검색·인용한다.\n"
        write_card(output, source, meta, body, DATASET, bulk_sha)
    report = {"bulkSha256": bulk_sha, "stats": dict(stats), "sourceCount": len(records), "sectionTypes": dict(sections),
              "unknownTags": dict(unknown), "outputs": output_hashes(writer), "sources": records}
    return report


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--bulk", type=Path, default=ROOT / f"data/bulk/{DATASET}.zip")
    ap.add_argument("--out", type=Path, default=ROOT / "data/sources")
    ap.add_argument("--report", type=Path, required=True)
    a = ap.parse_args()
    result = extract(a.bulk, a.out)
    a.report.write_text(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in result.items() if k not in ("outputs", "sources")}, ensure_ascii=False))
