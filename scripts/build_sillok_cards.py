#!/usr/bin/env python3
"""실록 규칙표와 실제 추출 결과에서 판본별 Source 카드를 만든다 (#15)."""
import argparse
import json
from pathlib import Path

from fill_card_counts import build, START, END

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "services/ingestion/sillok-catalog.json"
PORTAL = "https://www.data.go.kr/data/15053647/fileData.do"


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--sources-dir", type=Path, default=ROOT / "data/sources")
    ap.add_argument("--report", type=Path, required=True)
    args = ap.parse_args()
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    report = json.loads(args.report.read_text(encoding="utf-8"))
    for prefix, (label, start, end, composed) in catalog["sources"].items():
        source = f"sillok-{prefix}"
        if source not in report["sourceCounts"]:
            raise ValueError(f"추출 결과에 없음: {source}")
        meta = {"type": "Source", "id": f"src-{source}", "label": label, "sourceKind": "관찬사서",
                "sourceGroup": "조선왕조실록", "composedYear": composed, "coversFrom": start, "coversTo": end,
                "originalLanguage": "hanmun", "defaultLens": False, "license": "open",
                "licenseDetail": "공공데이터포털 이용허락범위 제한 없음 (국사편찬위원회 벌크 XML)",
                "licenseVerifiedAt": "2026-09-06", "licenseVerifiedVia": PORTAL, "status": "draft",
                "verified": None}
        header = "\n".join(f"{k}: {json.dumps(v, ensure_ascii=False)}" for k, v in meta.items())
        text = f'''---
{header}
generated:
  by: codex
  at: 2026-09-06
sources:
  - id: datago-15053647
    resource: {PORTAL}
    provider: 국사편찬위원회
    file: 15053647.zip sha256 {report['bulkSha256']}
    license: 이용허락범위 제한 없음
---

# {label}

국사편찬위원회 실록원문 벌크 XML(2022-11-03)의 `{prefix}` 계열 파일을 모은 판본이다.
원문 사료와 수정·보완본을 별도 Source로 둔다. 원문을 합치거나 옳고 그름을 정하지 않는다.

## 연도 근거

[국가기록원 실록 일람표]({catalog['dateEvidence']})의 수록 기간 {start}~{end}, 편찬 연도 {composed}를 따른다.
XML에 실린 총서·부록의 모든 내용을 이 기간 안의 사건이라고 판정한 것은 아니다.
개별 기사의 연력은 XML `dateOccured`를 그대로 사용하고, 날짜가 없는 기사는 임의로 채우지 않는다.
숙종실록보궐정오는 같은 표의 숙종실록 부록 설명에 따라 1728을 쓴다.
광해군일기 두 판본의 연도도 해당 표의 중초본 1633·정초본 1653을 따른다.

## 담고 있는 것

{START}
{build(source, args.sources_dir)}
{END}

숫자는 `scripts/fill_card_counts.py --source {source}`와 같은 코드로 센다.
파일 루트가 level1 또는 level2인 경우를 모두 읽고, `<text>`를 가진 절·기사마다 한 조각으로 보존한다.
빈 본문 수는 위의 실제 집계로 확인한다. 제목만으로 기사의 존재 여부를 판단하지 않는다.
판본·책·면수는 `editionReferences`, 광해군 중초본의 교정 표시는 `proofreadings`에 남긴다.
산삭 등 교정 표시 안의 글자도 본문에 보존하므로 확정된 판독으로 취급하지 않는다.
주석은 본문과 분리하고, 원문의 유니코드 미지원 글자는 `〓`와 국편 코드로 보존한다.

## 이용과 재현

[공공데이터포털 데이터셋]({PORTAL})은 2026-09-06 확인 시 이용허락범위 제한 없음으로 표시되어 있다.
국편 웹페이지를 수집한 자료가 아니다. 벌크 ZIP과 생성 JSONL은 저장소 밖에서 관리한다.
재현 명령·전체 파일별 SHA256·XML 수 대조는 `docs/research/sillok-ingestion.md`에 적는다.
원문 링크는 `https://sillok.history.go.kr/id/{{levelId}}`다.
'''
        (args.sources_dir / f"{source}.md").write_text(text, encoding="utf-8", newline="\n")
    print(f"cards: {len(catalog['sources'])}")


if __name__ == "__main__":
    main()
