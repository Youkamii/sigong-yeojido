"""Read the public ITKC Gowundang Pilgi XML with the shared text renderer."""
import argparse
from collections import Counter
import json
from pathlib import Path
import sys
import zipfile
from xml.etree import ElementTree as ET
from extract_nikh_xml import ROOT, Article, TextBuilder, OutputWriter, plain, is_hanja, sha256_of
sys.path.insert(0, str(ROOT/'scripts'))
from fill_card_counts import START, END, build
from import_location_research import markdown

SOURCE = 'itkc-gowundang-pilgi'
PORTAL = 'https://www.data.go.kr/data/15022432/fileData.do'
TAGS = {'단락': 'paragraph', '단락제목': 'pTitle', '표': 'tableGroup', 'kh.table': 'table',
        'kh.tr': 'tr', 'kh.td': 'td', '고유명사': 'index', 'imghj': 'newChar', '페이지': 'image',
        '원주': 'annotation', '주석': 'emph', '문자효과': 'point'}


def converted(element, notes):
    node = ET.Element(TAGS.get(element.tag, element.tag), dict(element.attrib))
    node.text, node.tail = element.text, element.tail
    if element.tag == '원주': node.set('type', '원주')
    if element.tag == '문자효과': node.set('originalTag', element.tag)
    for child in element: node.append(converted(child, notes))
    if element.tag == '주석':
        note = notes[element.get('id')]
        annotation = ET.SubElement(node, 'annotation', {'id': element.get('id'), 'type': note.get('type', '교감주')})
        content = note.find('주석내용')
        assert content is not None
        body = converted(content, notes); body.tag = 'noteContent'; body.tail = None
        annotation.append(body)
    return node


def extract_record(level, filename, volume):
    notes = {n.get('id'): n for n in level.findall('주석정보/주석항목')}
    assert len(notes) == len(level.findall('주석정보/주석항목'))
    content = level.find('본문정보/내용'); assert content is not None
    art, text = Article(), TextBuilder()
    text.text(content.text)
    for original in content:
        node = converted(original, notes)
        if node.tag == 'paragraph': art.render(node, text, None)
        else: art.render_element(node, text, None)
        text.newline(); text.text(node.tail)
    body = text.result(); assert not art.unknown_tags, dict(art.unknown_tags)
    lid = level.get('id'); assert lid
    title = plain(level.find('메타정보/제목정보/제목'))
    metadata = level.tag == '해설'
    row = {'id': 'chunk_'+SOURCE+'_'+lid, 'sourceId': 'src-'+SOURCE,
           'levelId': lid, 'level': 0 if metadata else 3, 'chunkType': 'source-metadata' if metadata else 'article',
           'title': title, 'locator': filename+' › '+volume+' › '+title+' ('+lid+')',
           'permalink': PORTAL, 'lang': 'ko' if metadata else 'hanmun', 'text': body,
           'date': None, 'charCount': len(body), 'hanjaCount': sum(is_hanja(c) for c in body),
           'annotations': art.annotations, 'indexTerms': art.index_terms, 'newChars': art.new_chars,
           'subjectClasses': [], 'translation': None, 'translationSource': None,
           'translationLinks': [dict(e.attrib) for e in level.findall('연계정보/연계항목')],
           'pageMarkers': [dict(e.attrib) for e in content.iter('페이지')],
           'sourceAttributes': dict(level.attrib),
           'editorialNotes': [{'id': k, 'type': n.get('type'), 'lemma': plain(n.find('주석명')),
                              'text': plain(n.find('주석내용'))} for k, n in notes.items()]}
    if art.document_markup: row['documentMarkup'] = art.document_markup
    return row


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--bulk', type=Path, required=True)
    ap.add_argument('--download-meta', type=Path, required=True)
    ap.add_argument('--out', type=Path, required=True)
    ap.add_argument('--report', type=Path, required=True)
    args = ap.parse_args()
    meta = json.loads(args.download_meta.read_text(encoding='utf-8'))
    assert meta['dataset'] == '15022432' and meta['sha256'] == sha256_of(args.bulk)
    assert meta['licenseOnPage'] == '이용허락범위 제한 없음'
    seen, stats, volumes, bibliography = set(), Counter(), [], {}
    with OutputWriter(args.out) as writer, zipfile.ZipFile(args.bulk) as z:
        for name in sorted(z.namelist()):
            if not name.endswith('.xml'): continue
            raw = z.read(name); root = ET.fromstring(raw); stats['xmlFiles'] += 1
            if name == 'ITKC_GP_1550A.xml':
                book = root.find('레벨1'); assert book is not None
                bibliography = {'bookId': book.get('id'), 'metadataXml': ET.tostring(book.find('메타정보'), encoding='unicode'),
                                'originalPublicationYear': int(book.find('메타정보/간행정보/원문간행년').get('서기년'))}
            volume = plain(root.find('.//레벨2/메타정보/제목정보/제목'))
            if volume: volumes.append(volume)
            expected = [e for e in root.iter() if e.find('본문정보/내용') is not None]
            for level in expected:
                row = extract_record(level, name, volume)
                assert row['id'] not in seen; seen.add(row['id'])
                writer(row)
                stats[row['chunkType']] += 1; stats['empty'] += not row['text']
                stats['annotations'] += len(row['annotations']); stats['indexTerms'] += len(row['indexTerms'])
                stats['newChars'] += len(row['newChars']); stats['translationLinks'] += len(row['translationLinks'])
                stats['editorialNotes'] += len(row['editorialNotes'])
    assert bibliography and stats['article'] == 254 and stats['source-metadata'] == 1 and len(volumes) == 6
    fields = {'type': 'Source', 'id': 'src-'+SOURCE, 'label': '고운당필기 · 고전번역원 공개 XML',
              'sourceKind': '조선 후기 필기 · 현대 교감표점본', 'sourceGroup': '고전번역원 공개 원문',
              'compiler': '유득공 · 한국고전번역원 교감표점', 'composedYear': bibliography['originalPublicationYear'],
              'coversFrom': None, 'coversTo': None, 'resource': PORTAL, 'originalLanguage': 'hanmun',
              'defaultLens': False, 'license': 'open', 'licenseDetail': meta['licenseOnPage'],
              'licenseVerifiedAt': '2026-09-07', 'licenseVerifiedVia': PORTAL,
              'status': 'draft', 'verified': None, 'bulkSha256': meta['sha256']}
    body = f'''공개 ZIP의 실제 내용은 고운당필기 6권, 본문 254편과 현대 범례 1개다.
고전 원문 전체를 제공하는 파일이 아니다. 경국대전·일성록·신증동국여지승람은 이 ZIP에 없다.
XML 서지의 원문간행년 1780과 현대 교감표점본 간행년 2020, 자료생성일 2021-11-30을 구분한다.
범례는 총 295편 가운데 41편을 확인하지 못해 254편을 수록했다고 설명한다.

원주는 본문과 분리하고, 교감주가 감싼 본문 글자는 그대로 보존한다.
교감 설명은 주석 필드에 연결한다. 3개 미지원 글자는 자리표시와 KC 코드를 보존한다.
번역 링크 254개는 원 XML의 참조일 뿐 번역문을 내려받은 것이 아니다.
고유명사 태그에 종류가 비어 있으면 임의로 인물·지명으로 분류하지 않는다.

제공: 한국고전번역원. [공공데이터포털]({PORTAL}) 이용허락범위 제한 없음.
수정: 본문별 JSONL 분할, 주석·색인·페이지 표시 분리. 원문 글자를 교체하지 않았다.

{START}
{build(SOURCE, args.out)}
{END}'''
    (args.out/(SOURCE+'.md')).write_text(markdown(fields, body), encoding='utf-8', newline='\n')
    report = {'download': meta, 'stats': dict(stats), 'volumes': volumes, 'bibliography': bibliography,
              'sourceCounts': dict(writer.counts), 'missingTextInEdition': 41,
              'translationTextFetched': False, 'unknownTags': {},
              'outputs': {p.relative_to(args.out).as_posix(): {'bytes': p.stat().st_size, 'sha256': sha256_of(p)} for p in sorted(writer.paths)}}
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(report['stats'], ensure_ascii=False))


if __name__ == '__main__': main()
