"""Import saved era research only after checking each quotation against cached HTML."""
import argparse
from collections import Counter, defaultdict
from copy import deepcopy
from hashlib import sha256
import json
from pathlib import Path
import shutil
from import_location_research import markdown, write_same
from import_pyongyang_identity import Text


CORRECTIONS = {
    'ex-encykorea-daegaya-def': '후기 가야연맹체의 맹주국.',
    'ex-encykorea-husamguk-900': '견훤은 이를 이용하여 900년(효공왕 4) 전주에서 백제의 마지막 왕이었던 의자왕의 원한을 갚겠다고 선언하고, 백제왕을 칭했다.',
    'ex-encykorea-gwangmu-1012': '1897년 10월 11일에는 새 국호를 ‘대한(大韓)’으로 정하고, 다음날인 10월 12일에 환구단에서 황제 즉위식을 거행하였다.',
    'ex-encykorea-gwangmu-1013': '‘대한(大韓)’으로, 이 해를 광무 원년으로',
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--research', type=Path, required=True)
    ap.add_argument('--cache', type=Path, required=True)
    ap.add_argument('--data', type=Path, default=Path('data'))
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    run = json.loads((args.research/'run.json').read_text(encoding='utf-8'))
    assert 'claude-opus-5' in run['modelsObserved'] and run['effort'] == 'max'
    draft_bytes = (args.research/'result.json').read_bytes()
    draft = json.loads(draft_bytes)
    checks = {r['id']: r for r in json.loads((args.cache/'report.json').read_text(encoding='utf-8'))}
    claims = deepcopy(draft['claims'])
    used = {c['citesExcerpt'] for c in claims}
    chunks, sources, quote_changes = {}, {}, []
    for source in draft['sources']:
        excerpts = [deepcopy(e) for e in source['excerpts'] if e['id'] in used]
        if not excerpts:
            continue
        sid = source['id']
        check = checks[sid]
        assert check['robotsAllowed'] and check['status'] == 200 and check['url'] == source['url']
        payload = (args.cache/(sid+'.raw')).read_bytes()
        assert sha256(payload).hexdigest() == check['sha256']
        parser = Text(); parser.feed(payload.decode('utf-8'))
        text = ''.join(parser.parts)
        rows = []
        for ex in excerpts:
            old = ex['text']
            ex['text'] = CORRECTIONS.get(ex['id'], old)
            if ex['id'] == 'ex-encykorea-daegaya-562':
                ex['text'] = ex['text'].replace('異斯夫', '異斯夫')
            assert ex['text'] in text, (sid, ex['id'], 'quotation differs from HTML text')
            if old != ex['text']:
                quote_changes.append({'excerpt': ex['id'], 'originalDraftSha256': sha256(old.encode()).hexdigest(),
                                      'checkedText': ex['text']})
            row = {'id': 'chunk_era51_'+ex['id'].removeprefix('ex-'), 'sourceId': sid,
                   'text': ex['text'], 'permalink': source['url'], 'locator': ex['locator'],
                   'lang': 'ko', 'date': None, 'chunkType': 'excerpt', 'pageSha256': check['sha256']}
            rows.append(row); chunks[ex['id']] = row
        words = sum(len(r['text'].split()) for r in rows)
        assert words <= 25, (sid, words)
        sources[sid] = {'id': sid, 'title': source['title'], 'url': source['url'],
                        'publisher': source['publisher'], 'edition': source['edition'],
                        'sourceKind': source['sourceKind'], 'pageSha256': check['sha256'],
                        'quotedWords': words, 'chunks': rows}

    for claim in claims:
        exid = claim.pop('citesExcerpt')
        row = chunks[exid]
        claim['quote'] = row['text']
        claim['fromSource'] = claim.pop('sourceId')
        assert claim['fromSource'] == row['sourceId']
        claim['citesChunk'] = row['id']
        claim.pop('predicateStatus', None)
        claim.update(origin='ai', status='draft', generatedBy='claude-opus-5', generatedAt='2026-09-07')
        claim['note'] = claim.get('note', '').replace('★', '').strip()
        if claim['id'] == 'claim-encykorea-gojong-enthronement-1897':
            claim['object']['verbatim'] = row['text']
            claim['note'] += ' 원문은 1897년 10월 11일 국호 결정과 다음날 12일 즉위식을 한 문장에 적는다.'
        if claim['id'] == 'claim-encykorea-daehan-eraname':
            claim['object']['value'] = '광무'
            claim['note'] += ' 인용에 나온 한글 광무를 그대로 사용했다.'

    referenced = {c['subject'] for c in claims}
    referenced.update(c['object']['id'] for c in claims if c['object']['kind'] == 'entity')
    entities = [e for e in draft['entities'] if e['id'] in referenced]
    for entity in entities:
        fields = {k: v for k, v in entity.items() if k != 'note'}
        if fields['id'] == 'person-encykorea-isabu':
            fields['labelHanja'] = '異斯夫'
        write_same(args.data/'entities'/fields['type'].lower()/(fields['id']+'.md'),
                   markdown(fields, entity.get('note', '').replace('★', '').strip()).rstrip()+'\n')

    groups = defaultdict(list)
    for claim in claims:
        groups[claim['fromSource']].append(claim)
    for sid, source in sources.items():
        key = sid.removeprefix('src-')
        years = [v for c in groups[sid] for k, v in c['object'].items()
                 if k in ('year', 'earliest', 'latest') and isinstance(v, int)]
        write_same(args.data/'sources'/(key+'.md'), markdown({
            'type': 'Source', 'id': sid, 'label': source['title']+' · 시대별 뼈대 발췌',
            'sourceKind': source['sourceKind'], 'sourceGroup': '시대별 뼈대 · 기관 해설',
            'compiler': source['publisher'], 'edition': source['edition'], 'composedYear': None,
            'coversFrom': min(years) if years else None, 'coversTo': max(years) if years else None,
            'resource': source['url'], 'defaultLens': False, 'license': 'short-excerpt-only',
            'originalLanguage': 'ko', 'status': 'draft', 'verified': None,
            'accessed': '2026-09-07', 'pageSha256': source['pageSha256'],
        }, '기관 해설 또는 법령 표제 메타데이터의 짧은 발췌다. 당시 사료 원문과 구분한다.\n\n'
           '조사 Claude Opus 5 / Max. 세션 한도로 끝난 호출이 저장한 초안을 사용했으며, '
           'Codex가 각 인용을 원 HTML과 직접 대조하고 빠진 구절·글자를 바로잡았다. '
           '연도 미상·음력·세기 단위 표기는 그대로 보존한다. 사람의 역사 해석 검토는 없다.'))
        write_same(args.data/'sources'/key/'chunks.jsonl', ''.join(
            json.dumps(r, ensure_ascii=False, sort_keys=True)+'\n' for r in source['chunks']))
        by_chunk = defaultdict(list)
        for claim in groups[sid]: by_chunk[claim['citesChunk']].append(claim)
        for cid, rows in by_chunk.items():
            write_same(args.data/'claims'/key/(cid+'.md'), markdown({
                'type': 'Claims', 'source': sid, 'chunk': cid, 'status': 'draft', 'generated_by': 'claude-opus-5'
            }, '```claims-json\n'+json.dumps(rows, ensure_ascii=False, indent=2)+'\n```'))

    lens_path = args.data/'lenses.json'
    lenses = json.loads(lens_path.read_text(encoding='utf-8'))
    lens = {'id': 'era-spine', 'label': '시대별 뼈대 · 기관 해설',
            'description': '부여·가야·후삼국·조선·개항·임시정부·헌법·북한 관련 기관 해설의 발췌. 연도 미상과 재위·생몰을 구분한다.',
            'sources': sorted(sources)}
    lenses['lenses'] = [l for l in lenses['lenses'] if l['id'] != lens['id']] + [lens]
    lens_path.write_text(json.dumps(lenses, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    report = {'researchSession': run['sessionId'], 'researchExitCode': run['exitCode'],
              'researchIsError': run['isError'], 'partialSavedResultUsed': run['isError'],
              'draftSha256': sha256(draft_bytes).hexdigest(), 'allQuotesCheckedAgainstHtml': True,
              'sources': list(sources.values()), 'entities': len(entities), 'claims': len(claims),
              'chunks': len(chunks), 'claimsByEra': dict(Counter(c['era'] for c in claims)),
              'claimIds': [c['id'] for c in claims], 'quoteCorrections': quote_changes,
              'unclaimedEntitiesOmitted': [e['id'] for e in draft['entities'] if e['id'] not in referenced],
              'remainingByEra': [{'era': r['era'], 'items': r.get('stillOpen', [])} for r in draft['coverage']],
              'humanReviewed': False, 'fullHistoricalCoverage': False}
    saved = args.data/'research/era-spine-51'
    saved.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(args.research/'run.json', saved/'run.json')
    write_same(saved/'result.json', json.dumps(report, ensure_ascii=False, indent=2)+'\n')
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(f"sources={len(sources)} entities={len(entities)} claims={len(claims)} chunks={len(chunks)}")


if __name__ == '__main__':
    main()
