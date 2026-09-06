#!/usr/bin/env python3
"""한국고대사료집성 벌크를 원 사서별 Source로 나누어 적재한다 (#17)."""
import argparse
import collections
import json
from pathlib import Path
import re
import zipfile
from xml.etree import ElementTree as ET

from extract_nikh_xml import ROOT, OutputWriter, ExtractError, extract_article, level_title, plain, sha256_of
from source_cards import output_hashes, write_card

DATASET = "15053631"


def issued_year(raw):
    """단일 연도·정확한 날짜만 옮긴다. 세기·추정·초간·저자 생몰년은 원표기로 남긴다."""
    m = re.fullmatch(r"(B\.C\.)?(-?\d{1,4})(?:년)?", raw.strip())
    if m:
        year = int(m[2])
        return -year if m[1] else year
    m = re.fullmatch(r"(\d{4})-\d{2}-\d{2}", raw.strip())
    return int(m[1]) if m else None


def extract(bulk, output):
    records, seen = {}, set()
    stats, unknown = collections.Counter(), collections.Counter()
    bulk_sha = sha256_of(bulk)

    def walk(level, labels, source, writer):
        path = labels + [level_title(level)]
        kids = [x for x in level if x.tag.startswith("level")]
        if level.find("text") is not None:
            chunk, art = extract_article(level, source, path, "section" if kids else "article")
            if chunk["id"] in seen:
                raise ExtractError(f"chunk id 중복: {chunk['id']}")
            seen.add(chunk["id"])
            writer(chunk)
            stats["chunks"] += 1
            stats["empty"] += not chunk["text"]
            stats["annotations"] += len(art.annotations)
            stats["indexTerms"] += len(art.index_terms)
            raw = (chunk["date"] or {}).get("raw") or ""
            m = re.match(r"^(-?\d{4})(?:-|$)", raw)
            if m and int(m[1]) < 9999:
                records[source]["datedYears"].append(int(m[1]))
            stats["dated"] += bool(chunk["date"])
            unknown.update(art.unknown_tags)
        for kid in kids:
            walk(kid, path, source, writer)

    with OutputWriter(output) as writer, zipfile.ZipFile(bulk) as z:
        for name in sorted(z.namelist()):
            if not name.endswith(".xml"):
                continue
            root = ET.fromstring(z.read(name))
            stats["xmlFiles"] += 1
            stats["xmlTexts"] += sum(1 for x in root.iter() if x.tag.startswith("level") and x.find("text") is not None)
            for level in root.iter("level1"):
                source = f"jipseong-{level.get('id')}"
                if source in records:
                    raise ExtractError(f"사서 중복: {source}")
                explanation = level.find("front/description/biblioExplanation")
                korean_title = explanation.get("name") if explanation is not None else None
                issued = level.find("front/biblioData/source/dateIssued")
                records[source] = {"levelId": level.get("id"), "labelHanja": level_title(level),
                    "label": level_title(level), "explanationNameRaw": korean_title, "description": plain(explanation),
                    "authorRaw": plain(level.find("front/biblioData/creator/author")),
                    "dateIssued": dict(issued.attrib, text=plain(issued)) if issued is not None else None,
                    "frontXml": ET.tostring(level.find("front"), encoding="unicode"), "datedYears": []}
                walk(level, [], source, writer)
    if stats["chunks"] != stats["xmlTexts"] or unknown:
        raise ExtractError(f"본문 대조 실패/미확인 태그: {dict(stats)} {dict(unknown)}")
    for source, rec in records.items():
        years = rec.pop("datedYears")
        rec["coversFrom"] = min(years) if years else None
        rec["coversTo"] = max(years) if years else None
        issued = rec["dateIssued"]
        issued_raw = (issued or {}).get("date") or (issued or {}).get("text") or ""
        composed = issued_year(issued_raw)
        rec["composedYear"] = composed
        meta = {"label": rec["label"], "labelHanja": rec["labelHanja"], "sourceKind": "사료집성 발췌",
                "sourceGroup": "한국고대사료집성", "composedYear": composed,
                "coversFrom": rec["coversFrom"], "coversTo": rec["coversTo"], "originalLanguage": "hanmun",
                "sourceLevelId": rec["levelId"]}
        body = f'''국편 한국고대사료집성 중국편에 실린 『{rec['labelHanja']}』의 한국사 관련 발췌다.
사서 전체 원문을 수록한 것으로 표시하지 않는다. 국편 사서 id `{rec['levelId']}`를 Source 이름에 쓴다.
같은 한글 이름을 가진 다른 사서도 id가 달라 합쳐지지 않는다.

## 연도 근거와 한계

편찬 시점은 XML의 `source/dateIssued`에서 단일 연도나 정확한 날짜를 옮긴 값이다. 원표기: `{issued_raw or '빈값'}`.
역사적 편찬 연도를 별도 문헌으로 확정한 값은 아니다. 빈값·세기·추정·초간 연도·저자 생몰년이면 점을 찍지 않는다.
현대 자료집의 간행 연도 2006을 고대 사서의 편찬 시점으로 쓰지 않는다.
수록 기간은 이 발췌에서 XML `dateOccured`에 정확한 연도가 붙은 조각들의 최솟값·최댓값이다.
현재 범위: {rec['coversFrom']}~{rec['coversTo']}. 날짜가 전혀 없으면 막대도 미상이다.
이 범위는 사서 전체의 범위나 인물의 생몰년이 아니다. 저자 원표기 `{rec['authorRaw']}`도 XML의 서지 정보로만 보존한다.
표제는 `mainTitle`을 쓴다. 설명 요소의 name 속성에는 다른 책 이름을 복사한 흔적이 있어 표제로 쓰지 않는다.

## 국편 서지 설명

{rec['description'] or 'XML에 서지 설명이 없다.'}

## 재현

`services/ingestion/extract_jipseong.py`와 `docs/research/jipseong-ingestion.md`를 따른다.
벌크 설명과 실제 XML의 사서 수 차이도 그 문서에 남겼다. 서지 머리말 원문은 추출 보고서 `frontXml`로 보존한다.
'''
        write_card(output, source, meta, body, DATASET, bulk_sha)
    return {"bulkSha256": bulk_sha, "stats": dict(stats), "sourceCount": len(records), "unknownTags": dict(unknown),
            "outputs": output_hashes(writer), "sources": records}


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--bulk", type=Path, default=ROOT / f"data/bulk/{DATASET}.zip")
    ap.add_argument("--out", type=Path, default=ROOT / "data/sources")
    ap.add_argument("--report", type=Path, required=True)
    a = ap.parse_args()
    result = extract(a.bulk, a.out)
    a.report.write_text(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in result.items() if k not in ("outputs", "sources")}, ensure_ascii=False))
