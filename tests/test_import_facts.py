import copy
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / 'tests/fixtures/facts-ingest'
JOB = 'goguryeo_early'
COLLECTION = 'facts-ancient'
MOVE = 'chunk_samguksagi_sg_018_0060_0100'
HOUSEHOLDS = 'chunk_samguksagi_sg_026_0050_0190'


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def claims_in(path):
    return json.loads(re.search(r'```claims-json\n(.*?)\n```', path.read_text(encoding='utf-8'), re.S)[1])


class FactsIngestTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='.tmp-', dir=FIXTURES)
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.data = self.root / 'data'
        self.job = self.root / 'input' / JOB
        shutil.copytree(FIXTURES / JOB, self.job)
        # The importer writes UTF-8/LF; keep the copied input independent of checkout line endings.
        draft_path = self.job / 'result.json'
        draft_path.write_text(draft_path.read_text(encoding='utf-8'), encoding='utf-8', newline='\n')
        source = self.data / 'sources/samguksagi'
        source.mkdir(parents=True)
        shutil.copy2(ROOT / 'data/sources/samguksagi/chunks.jsonl', source / 'chunks.jsonl')
        shutil.copy2(ROOT / 'data/sources/samguksagi.md', source.parent / 'samguksagi.md')
        (self.data / 'claims').mkdir()
        self.draft = read_json(self.job / 'result.json')
        self.source_path = source / 'chunks.jsonl'
        self.source_digest = hashlib.sha256(self.source_path.read_bytes()).hexdigest()

    def run_script(self, script, *args, success=True):
        env = dict(os.environ, PYTHONIOENCODING='utf-8', PYTHONDONTWRITEBYTECODE='1')
        result = subprocess.run([sys.executable, '-S', '-B', str(ROOT / 'scripts' / script), *map(str, args)],
                                cwd=self.root, env=env, capture_output=True, text=True, encoding='utf-8')
        if success:
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        else:
            self.assertNotEqual(result.returncode, 0, result.stdout)
        return result

    def import_job(self, collection=COLLECTION, success=True, extra=()):
        return self.run_script('import_period_research.py', '--research', self.job, '--data', self.data,
                               '--collection', collection, '--out', self.root / 'report.json', *extra, success=success)

    def claim_path(self, chunk=MOVE):
        return self.data / 'claims/samguksagi' / COLLECTION / (chunk + '.md')

    def saved_root(self):
        return self.data / 'research' / COLLECTION

    def summarize(self, success=True):
        return self.run_script('summarize_facts.py', self.saved_root(), '--out', self.saved_root() / 'summary', success=success)

    def test_pipeline_preserves_scene_fields_and_facts_without_scene(self):
        result = self.import_job()
        report = read_json(self.root / 'report.json')
        self.assertEqual((report['chunkClaims'], report['excerptClaims'], report['facts']), (3, 0, 3))
        self.assertEqual(report['factsByCategory'], {'administration':2, 'settlement':1})
        self.assertEqual(hashlib.sha256(self.source_path.read_bytes()).hexdigest(), self.source_digest)
        saved = self.saved_root() / JOB / 'result.json'
        self.assertEqual(saved.read_bytes(), (self.job / 'result.json').read_bytes())
        claims = claims_in(self.claim_path())
        self.assertEqual(len(claims), 2)
        self.assertEqual(claims[1]['quote'], '移都平壤')
        self.assertEqual(claims[0]['object']['id'], 'ts-facts-ancient-goguryeo_early-move-time')
        self.assertEqual(claims_in(self.claim_path(HOUSEHOLDS))[0]['object']['value'], '900')
        output = self.root / 'scenes.json'
        build = self.run_script('build_history_scenes.py', '--research', self.saved_root(), '--collection', COLLECTION,
                                '--job', JOB, '--data', self.data, '--out', output)
        scene = read_json(output)['scenes'][0]
        expected = copy.deepcopy(self.draft['scenes'][0])
        prefix = 'claim-facts-ancient-goguryeo_early-'
        for key in ('category', 'region', 'decade', 'sceneFunction'):
            self.assertEqual(scene[key], expected[key])
        expected['participantGroups'][0]['claimIds'] = [prefix + 'move-place']
        expected['persistence']['basisClaimIds'] = [prefix + 'move-time', prefix + 'move-place']
        self.assertEqual(scene['participantGroupsNote'], 'count 는 화면 표현값이며 사료의 인원수가 아니다')
        expected['participantGroups'][0].update(
            entityId=None, role='ruler', stance='bystander', side='a', count=1,
            sourceRole='천도 주체', sourceStance='neutral', sourceSide='goguryeo',
            basis='조사 장면의 집단(원문 역할: 천도 주체, 자세: neutral, 편: goguryeo) — count 는 표현값')
        self.assertEqual(scene['participantGroups'], expected['participantGroups'])
        self.assertEqual(scene['persistence'], expected['persistence'])
        self.assertEqual(scene['kind'], 'migration')
        summary = self.summarize()
        folder = self.saved_root() / 'summary'
        merged = read_json(folder / 'facts-merged.json')
        self.assertEqual(len(merged), 3)
        self.assertNotIn('sceneId', merged[2])
        self.assertEqual(merged[2]['job'], JOB)
        self.assertEqual(read_json(folder / 'density.json'), [{
            'placeLabel':'신라', 'lon':None, 'lat':None, 'year':521, 'households':900,
            'population':None, 'unit':'戶', 'claimIds':[prefix + 'households'], 'job':JOB}])
        self.assertEqual(read_json(folder / 'administrative.json'), [{
            'placeLabel':'평양', 'lon':None, 'lat':None, 'from':427, 'to':None, 'kind':'city',
            'what':'고구려가 평양으로 도읍을 옮겼다.', 'claimIds':[prefix + 'move-place']}])
        self.assertEqual(read_json(folder / 'coverage.json'), {
            'categoryByDecade':{'administration':{'420':2}, 'settlement':{'520':1}},
            'regionByDecade':{'north':{'420':2}, 'south':{'520':1}}})
        if os.environ.get('FACTS_INGEST_EVIDENCE') == '1':
            print('FIXTURE IMPORT\n' + result.stdout, end='')
            print('GENERATED CLAIM FILE\n' + self.claim_path().read_text(encoding='utf-8'), end='')
            print('BUILD\n' + build.stdout + 'SUMMARY\n' + summary.stdout, end='')

    def test_reimport_merges_same_chunk_and_preserves_frontmatter_across_collections(self):
        original = copy.deepcopy(self.draft)
        self.draft['claims'] = [original['claims'][0]]
        write_json(self.job / 'result.json', self.draft)
        self.import_job()
        path = self.claim_path()
        text = path.read_text(encoding='utf-8').replace('status: "draft"', 'status: "reviewed"\nreviewer: "fixture"')
        text += '\n기존 검토 메모를 보존한다.\n'
        path.write_text(text, encoding='utf-8')
        self.draft['claims'] = [original['claims'][1]]
        write_json(self.job / 'result.json', self.draft)
        self.import_job(collection='facts-next')
        self.assertEqual(len(claims_in(path)), 2)
        merged = path.read_text(encoding='utf-8')
        self.assertEqual(merged.split('```claims-json')[0], text.split('```claims-json')[0])
        self.assertTrue(merged.endswith('\n기존 검토 메모를 보존한다.\n'))
        self.assertFalse((self.data / 'claims/samguksagi/facts-next' / (MOVE + '.md')).exists())
        self.draft['claims'][0]['note'] = '같은 ID의 수정된 메모'
        write_json(self.job / 'result.json', self.draft)
        self.import_job(collection='facts-next')
        self.assertEqual(len(claims_in(path)), 2)
        self.assertEqual(claims_in(path)[1]['note'], '같은 ID의 수정된 메모')
        self.assertEqual(hashlib.sha256(self.source_path.read_bytes()).hexdigest(), self.source_digest)

    def test_rejects_bad_local_evidence_before_writing(self):
        cases = [('quote', '없는 원문', 'quote mismatch'), ('sourceId', 'src-wrong', 'sourceId mismatch'),
                 ('citesChunk', 'chunk-missing', 'missing local chunk')]
        for key, value, message in cases:
            with self.subTest(key=key):
                draft = copy.deepcopy(self.draft)
                draft['claims'][0][key] = value
                write_json(self.job / 'result.json', draft)
                result = self.import_job(success=False)
                self.assertIn(message, result.stderr)
                self.assertFalse(self.claim_path().exists())
                self.assertFalse(self.saved_root().exists())
        for key in ('year', 'earliest', 'latest'):
            with self.subTest(key=key):
                draft = copy.deepcopy(self.draft)
                draft['claims'][0]['object'][key] = 428
                write_json(self.job / 'result.json', draft)
                self.assertIn('chunk year mismatch', self.import_job(success=False).stderr)

    def test_time_verbatim_must_also_be_in_quote(self):
        self.draft['claims'][0]['quote'] = '移都平壤'
        write_json(self.job / 'result.json', self.draft)
        self.assertIn('verbatim mismatch', self.import_job(success=False).stderr)

    def test_whitespace_normalization(self):
        self.draft['claims'][0]['quote'] = '十 五\u3000年,\n移 都 平 壤.'
        self.draft['claims'][0]['object']['verbatim'] = '十\t五 年'
        write_json(self.job / 'result.json', self.draft)
        self.import_job()
        self.assertEqual(claims_in(self.claim_path())[0]['quote'], self.draft['claims'][0]['quote'])

    def test_signed_year_and_missing_date(self):
        rows = [json.loads(line) for line in self.source_path.read_text(encoding='utf-8').splitlines()]
        row = next(row for row in rows if row['id'] == MOVE)
        for raw, year in [('-0037-99-99L0', -37), ('+0427-99-99L0', 427), (None, 777)]:
            with self.subTest(raw=raw):
                row['date'] = {'raw':raw} if raw else None
                self.source_path.write_text(''.join(json.dumps(r) + '\n' for r in rows), encoding='utf-8')
                for key in ('year', 'earliest', 'latest'):
                    self.draft['claims'][0]['object'][key] = year
                write_json(self.job / 'result.json', self.draft)
                self.import_job()
                self.assertEqual(claims_in(self.claim_path())[0]['object']['year'], year)

    def test_run_workflow_and_legacy_conditions(self):
        original = read_json(self.job / 'run.json')
        for change in ({'effort':'low'}, {'sessionId':''}, {'sessionId':'  '}, {'sessionId':123},
                       {'modelsObserved':['other']}, {'exitCode':1}, {'isError':True}):
            with self.subTest(change=change):
                write_json(self.job / 'run.json', {**original, **change})
                self.import_job(success=False)
        write_json(self.job / 'run.json', {**original, 'effort':'max'})
        self.import_job()
        legacy = {k:v for k,v in original.items() if k != 'runner'}
        write_json(self.job / 'run.json', legacy)
        self.import_job(success=False)
        write_json(self.job / 'run.json', {**legacy, 'effort':'max'})
        self.import_job()

    def test_check_only_does_not_import(self):
        self.import_job(extra=('--check-only',))
        self.assertFalse(self.claim_path().exists())
        self.assertFalse(self.saved_root().exists())
        self.assertTrue(read_json(self.root / 'report.json')['checkOnly'])

    def test_scene_optional_fields_stay_absent_and_merge_keeps_other_scene(self):
        for key in ('category', 'region', 'decade', 'sceneFunction', 'participantGroups', 'participantGroupsNote', 'persistence'):
            self.draft['scenes'][0].pop(key)
        write_json(self.job / 'result.json', self.draft)
        self.import_job()
        output = self.root / 'scenes.json'
        write_json(output, {'scenes':[{'id':'existing', 'place':None}], 'sources':[], 'missing':[]})
        self.run_script('build_history_scenes.py', '--research', self.saved_root(), '--collection', COLLECTION,
                        '--job', JOB, '--data', self.data, '--out', output, '--merge')
        scenes = read_json(output)['scenes']
        self.assertEqual(scenes[0]['id'], 'existing')
        self.assertNotIn('participantGroups', scenes[1])
        self.assertNotIn('persistence', scenes[1])

    def test_build_omits_empty_groups_and_preserves_nonfacts_vocabulary(self):
        self.import_job()
        output = self.root / 'scenes.json'
        self.run_script('build_history_scenes.py', '--research', self.saved_root(), '--collection', 'scenes-fixture',
                        '--job', JOB, '--data', self.data, '--out', output)
        group = read_json(output)['scenes'][0]['participantGroups'][0]
        self.assertEqual((group['role'], group['stance'], group['side'], group['count']),
                         ('천도 주체', 'neutral', 'goguryeo', None))
        self.assertNotIn('sourceRole', group)
        self.draft['scenes'][0]['participantGroups'] = []
        write_json(self.saved_root() / JOB / 'result.json', self.draft)
        self.run_script('build_history_scenes.py', '--research', self.saved_root(), '--collection', COLLECTION,
                        '--job', JOB, '--data', self.data, '--out', output)
        scene = read_json(output)['scenes'][0]
        self.assertNotIn('participantGroups', scene)
        self.assertNotIn('participantGroupsNote', scene)

    def test_build_portrait_and_heritage_and_reject_invalid_kind(self):
        self.import_job()
        saved = self.saved_root() / JOB / 'result.json'
        output = self.root / 'scene-kinds.json'
        for kind, heritage_type in [('portrait', None), ('heritage', 'pagoda'), ('heritage', None),
                                    ('heritage', 'castle'), ('unknown', None)]:
            draft = copy.deepcopy(self.draft)
            draft['scenes'][0]['kind'] = kind
            if heritage_type:
                draft['scenes'][0].update(heritageType=heritage_type, heritageFloors=5)
            write_json(saved, draft)
            valid = kind == 'portrait' or heritage_type == 'pagoda'
            result = self.run_script('build_history_scenes.py', '--research', self.saved_root(),
                                    '--collection', COLLECTION, '--job', JOB, '--data', self.data,
                                    '--out', output, success=valid)
            if valid:
                scene = read_json(output)['scenes'][0]
                self.assertEqual(scene['kind'], kind)
                if heritage_type:
                    self.assertEqual((scene['heritageType'], scene['heritageFloors']), ('pagoda', 5))
            else:
                self.assertIn('heritageType' if kind == 'heritage' else 'kind', result.stderr)

    def test_summary_rejects_strings_booleans_and_nonfinite_numbers(self):
        self.import_job()
        path = self.saved_root() / JOB / 'result.json'
        cases = [('lon', '126.1'), ('lat', True), ('year', '427'), ('decade', 420.0), ('lon', float('inf'))]
        for key, value in cases:
            with self.subTest(key=key, value=value):
                draft = copy.deepcopy(self.draft)
                draft['facts'][0][key] = value
                write_json(path, draft)
                self.assertIn('expected', self.summarize(success=False).stderr)
                self.assertFalse((self.saved_root() / 'summary').exists())
        for field, key, value, index in [('density', 'households', '900', 2), ('density', 'population', False, 2),
                                          ('persistence', 'from', '427', 1), ('persistence', 'to', '500', 1)]:
            with self.subTest(field=field, key=key):
                draft = copy.deepcopy(self.draft)
                draft['facts'][index][field][key] = value
                write_json(path, draft)
                self.assertIn('expected', self.summarize(success=False).stderr)

    def test_summary_multiple_jobs_negative_decades_and_numeric_coordinates(self):
        self.import_job()
        extra = copy.deepcopy(self.draft)
        extra['job'] = 'second'
        for fact in extra['facts']:
            fact.update(year=-37, decade=-40, lon=126.19, lat=41.13, coordinateBasis='test-only numeric input')
        extra['facts'][2]['density']['population'] = 1800
        extra['facts'][1]['persistence'].update({'from':-37, 'to':-1})
        write_json(self.saved_root() / 'second/result.json', extra)
        self.summarize()
        folder = self.saved_root() / 'summary'
        self.assertEqual(len(read_json(folder / 'facts-merged.json')), 6)
        item = read_json(folder / 'density.json')[1]
        self.assertEqual((item['lon'], item['lat'], item['year'], item['population']), (126.19, 41.13, -37, 1800))
        self.assertEqual(item['claimIds'], ['claim-facts-ancient-second-households'])
        self.assertEqual(read_json(folder / 'coverage.json')['categoryByDecade']['administration'], {'-40':2, '420':2})

    def test_web_excerpt_path_still_imports_and_checks_years(self):
        raw = b'<p>Town founded in 1400.</p>'
        (self.job / 'raw').mkdir()
        (self.job / 'raw/page.html').write_bytes(raw)
        source = {'id':'src-fixture-web', 'title':'Fixture', 'publisher':'Fixture', 'url':'https://example.org/fixture',
                  'rawFile':'raw/page.html', 'sha256':hashlib.sha256(raw).hexdigest(), 'httpStatus':200,
                  'byteLength':len(raw), 'fetchedUtc':'2026-09-13T00:00:00Z', 'license':'fixture',
                  'excerpts':[{'id':'ex-town', 'text':'Town founded in 1400.', 'locator':'p'}]}
        self.draft['sources'] = [source]
        self.draft['claims'] = [{'id':'claim-web', 'subject':'event-pyeongyang-move-427', 'predicate':'syj:foundedIn',
                                 'object':{'kind':'year', 'value':1400}, 'sourceId':source['id'], 'citesExcerpt':'ex-town'}]
        write_json(self.job / 'result.json', self.draft)
        write_json(self.job / 'manifest.json', [source])
        self.import_job()
        report = read_json(self.root / 'report.json')
        self.assertEqual((report['chunkClaims'], report['excerptClaims']), (0, 1))
        chunk = read_json(self.data / 'sources/fixture-web/chunks.jsonl')
        self.assertEqual(chunk['text'], source['excerpts'][0]['text'])
        self.import_job()
        self.assertEqual(len((self.data / 'sources/fixture-web/chunks.jsonl').read_text().splitlines()), 1)
        self.draft['claims'][0]['object']['value'] = 1401
        write_json(self.job / 'result.json', self.draft)
        self.assertIn('numeric year absent', self.import_job(success=False).stderr)


if __name__ == '__main__':
    unittest.main()
