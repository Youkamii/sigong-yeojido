import copy
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / 'tests/fixtures/fact-layers'


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False) + '\n', encoding='utf-8')


class BuildFactLayersTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory(prefix='.tmp-', dir=FIXTURES)
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.summary = self.root / 'fixture-collection/summary'
        shutil.copytree(FIXTURES / 'fixture-collection/summary', self.summary)
        self.output = self.root / 'app/fact-layers.json'

    def run_builder(self, *extra, success=True):
        result = subprocess.run([sys.executable, '-B', str(ROOT / 'scripts/build_fact_layers.py'),
                                 '--summary', str(self.summary), '--out', str(self.output), *extra],
                                cwd=self.root, capture_output=True, text=True, encoding='utf-8',
                                env=dict(os.environ, PYTHONIOENCODING='utf-8', PYTHONDONTWRITEBYTECODE='1'))
        if success:
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        else:
            self.assertNotEqual(result.returncode, 0)
        return result

    def test_generate_preserves_values_and_reports_missing_coordinates(self):
        report = json.loads(self.run_builder().stdout)
        self.assertEqual(report, {'density': 2, 'administrative': 3,
                                  'excludedMissingCoordinates': {'density': 1, 'administrative': 1}})
        layers = read_json(self.output)
        self.assertEqual(set(layers), {'version', 'generatedFrom', 'density', 'administrative'})
        self.assertEqual(layers['version'], 1)
        self.assertEqual(layers['generatedFrom'], ['fixture-collection'])
        self.assertEqual(layers['density'][0], {'lon': 127, 'lat': 37, 'year': 521, 'households': 900,
                                              'population': None, 'unit': '戶', 'label': '시험 마을',
                                              'claimIds': ['claim-fixture-households']})
        self.assertEqual(layers['density'][1]['year'], -37)
        self.assertEqual(layers['administrative'][0], {'lon': 127, 'lat': 37, 'from': 427, 'to': None,
                                                     'kind': 'city', 'label': '시험 도읍',
                                                     'what': '자동 검사용 가상 도읍 기록', 'claimIds': ['claim-fixture-city']})
        self.assertEqual(layers['administrative'][2]['kind'], 'facility')

    def test_merge_replaces_label_time_keeps_other_rows_and_deduplicates_collections(self):
        self.run_builder()
        density = read_json(self.summary / 'density.json')[:1]
        density[0].update(households=10000, lon=127.01, claimIds=['claim-updated'])
        density.append({**density[0], 'year': 522})
        admin = read_json(self.summary / 'administrative.json')[:1]
        admin[0]['to'] = 700
        self.summary = self.root / 'second-collection/summary'
        self.summary.mkdir(parents=True)
        write_json(self.summary / 'density.json', density)
        write_json(self.summary / 'administrative.json', admin)
        self.run_builder('--merge')
        layers = read_json(self.output)
        self.assertEqual(layers['generatedFrom'], ['fixture-collection', 'second-collection'])
        self.assertEqual(len(layers['density']), 3)
        self.assertEqual(len(layers['administrative']), 3)
        self.assertEqual(layers['density'][0]['households'], 10000)
        self.assertEqual(layers['density'][0]['claimIds'], ['claim-updated'])
        self.assertEqual(layers['density'][0]['lon'], 127.01)
        self.assertEqual(layers['administrative'][0]['to'], 700)
        before = self.output.read_bytes()
        self.run_builder('--merge')
        self.assertEqual(self.output.read_bytes(), before)
        self.run_builder()
        self.assertEqual(read_json(self.output)['generatedFrom'], ['second-collection'])
        self.assertEqual(len(read_json(self.output)['administrative']), 1)

    def test_merge_without_existing_output(self):
        self.run_builder('--merge')
        self.assertEqual(len(read_json(self.output)['density']), 2)

    def test_rejects_nonnumeric_values_before_replacing_output(self):
        self.run_builder()
        before = self.output.read_bytes()
        for kind, key, value in [('density', 'households', '900'), ('density', 'population', True),
                                 ('density', 'lon', float('inf')), ('density', 'lat', float('nan')),
                                 ('density', 'year', '521'), ('administrative', 'from', False),
                                 ('administrative', 'to', '700')]:
            with self.subTest(kind=kind, key=key):
                path = self.summary / f'{kind}.json'
                original = read_json(path)
                rows = copy.deepcopy(original)
                rows[0][key] = value
                write_json(path, rows)
                self.assertIn('expected', self.run_builder(success=False).stderr)
                self.assertEqual(self.output.read_bytes(), before)
                write_json(path, original)


if __name__ == '__main__':
    unittest.main()
