#!/usr/bin/env python3
"""조사 규칙표와 독립 XML 검증 결과로 대용량 후대 사료 카드를 만든다 (#38)."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def build_cards(directory, report, audit, dataset):
    catalog = json.loads((ROOT/'services/ingestion/later-catalog.json').read_text(encoding='utf-8'))
    for name, source in catalog['sources'].items():
        if source['dataset'] != dataset:
            continue
        stats = audit['sources'][name]
        if report['sourceCounts'][name] != stats['chunks']:
            raise ValueError(f'chunk 수 불일치: {name}')
        if stats['yearRange'] != [source['coversFrom'], source['coversTo']]:
            raise ValueError(f'연도 범위 확인 필요: {name}: {stats["yearRange"]}')
        portal = f'https://www.data.go.kr/data/{dataset}/fileData.do'
        meta = {'type': 'Source', 'id': f'src-{name}', 'label': source['label'],
                'compiler': source['compiler'],
                'sourceKind': source['sourceKind'], 'sourceGroup': source['sourceGroup'],
                'composedYear': source['composedYear'], 'coversFrom': source['coversFrom'], 'coversTo': source['coversTo'],
                'originalLanguage': 'hanmun', 'defaultLens': False, 'license': 'open',
                'licenseDetail': '공공데이터포털 이용허락범위 제한 없음 (국편 벌크 XML)',
                'licenseVerifiedAt': catalog['checkedAt'], 'licenseVerifiedVia': portal,
                'status': 'draft', 'verified': None}
        header = '\n'.join(f'{k}: {json.dumps(v, ensure_ascii=False)}' for k, v in meta.items())
        notes = '\n\n'.join(source['notes'])
        evidence = '\n'.join(f'- [{title}]({url})' for title, url in source['evidence'])
        gaps = ', '.join(str(y) for y in stats['yearsMissingInsideRange']) or '없음'
        metadata_line = f"| 서지·해제 | {stats['types']['source-metadata']:,} |\n" if stats['types'].get('source-metadata') else ''
        text = f'''---
{header}
generated:
  by: codex
  at: {catalog['checkedAt']}
sources:
  - id: datago-{dataset}
    resource: {portal}
    provider: 국사편찬위원회
    file: {dataset}.zip sha256 {report['bulkSha256']}
    license: 이용허락범위 제한 없음
---

# {source['label']}

기록·편찬 기관: {source['compiler']}.

{notes}

## 실제 수록량

<!-- counts:start -->
| 항목 | 수 |
|---|---:|
| 전체 조각 | {stats['chunks']:,} |
| 기사·좌목 등 말단 본문 | {stats['types'].get('article', 0):,} |
| 상위 절 본문 | {stats['types'].get('section', 0):,} |
{metadata_line}| 날짜 raw 있음 | {stats['dated']:,} |
| 상위 날짜 연결 | {stats['dateInherited']:,} |
| 빈 본문 | {stats['empty']:,} |
| 본문 글자 | {stats['characters']:,} |
| 주석 | {stats['annotations']:,} |
| 색인어 | {stats['indexTerms']:,} |
<!-- counts:end -->

XML 날짜에서 읽은 연도 범위는 {stats['yearRange'][0]}~{stats['yearRange'][1]}이다.
이 범위 안에서 날짜가 있는 조각이 한 건도 없는 연도: {gaps}.
연도에 기록이 있다는 사실은 해당 연도의 모든 날·사건을 담았다는 뜻이 아니다.
원문 결락, 미상 날짜, 현대 입력의 범위를 구별하며 빈 곳을 추측해서 채우지 않는다.

## 출처·재현

{evidence}
- [공공데이터포털 벌크 XML]({portal})

원문 웹페이지를 수집한 자료가 아니다. ZIP과 생성 JSONL은 c2의 Git 밖에 두고,
추출 명령·파일별 SHA256·독립 XML 수 대조는 `docs/research/{name}-ingestion.md`에 기록한다.
라이선스 확인은 이 데이터셋 배포본에 관한 것으로 다른 웹 서비스 전체에 적용하지 않는다.
'''
        (directory/f'{name}.md').write_text(text, encoding='utf-8', newline='\n')
        print(f'{name}: {stats["chunks"]}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sources-dir', type=Path, required=True)
    parser.add_argument('--report', type=Path, required=True)
    parser.add_argument('--audit', type=Path, required=True)
    parser.add_argument('--dataset', required=True)
    args = parser.parse_args()
    build_cards(args.sources_dir, json.loads(args.report.read_text(encoding='utf-8')),
                json.loads(args.audit.read_text(encoding='utf-8')), args.dataset)
