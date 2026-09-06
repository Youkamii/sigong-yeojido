"""국편 Source 카드와 추출 보고서의 공통 출력 형식."""
import json
from pathlib import Path
import sys

from extract_nikh_xml import sha256_of

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from fill_card_counts import build, START, END


def write_card(output, source, meta, body, dataset, bulk_sha):
    portal = f"https://www.data.go.kr/data/{dataset}/fileData.do"
    fields = {"type": "Source", "id": f"src-{source}", **meta,
              "defaultLens": False, "license": "open", "licenseDetail": "공공데이터포털 이용허락범위 제한 없음 (국편 벌크 XML)",
              "licenseVerifiedAt": "2026-09-06", "licenseVerifiedVia": portal, "status": "draft", "verified": None}
    header = "\n".join(f"{k}: {json.dumps(v, ensure_ascii=False)}" for k, v in fields.items())
    card = f'''---
{header}
generated:
  by: codex
  at: 2026-09-06
sources:
  - id: datago-{dataset}
    resource: {portal}
    provider: 국사편찬위원회
    file: {dataset}.zip sha256 {bulk_sha}
    license: 이용허락범위 제한 없음
---

# {meta['label']}

{body}

## 담고 있는 것

{START}
{build(source, output)}
{END}

[공공데이터포털]({portal})의 이용허락범위 제한 없음 표시를 2026-09-06 확인했다.
국편 웹 원문을 수집하지 않고 벌크 XML을 사용했다. 위 수치는 `scripts/fill_card_counts.py`와 같은 코드로 센다.
'''
    (output / f"{source}.md").write_text(card, encoding="utf-8", newline="\n")


def output_hashes(writer):
    return {p.relative_to(writer.directory).as_posix(): {"bytes": p.stat().st_size, "sha256": sha256_of(p)}
            for p in sorted(writer.paths)}
