import copy
import json
import math
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from scene_supersede import supersede_scenes


def packet(id, *, item=False, year=553, end=None, meters=0, kind='construction', title=None, **extra):
    return {'id': id, 'title': title or '황룡사 창건 ' + id, 'kind': kind, 'startYear': year, 'endYear': year if end is None else end,
            'place': {'lon': 0, 'lat': math.degrees(meters / 6371000)},
            **({'itemId': 'hs-' + id} if item else {}), **extra}


class SceneSupersedeTests(unittest.TestCase):
    def test_year_distance_and_kind_boundaries(self):
        for year in (551, 552, 553, 554, 555):
            for meters in (0, 499.99, 500, 500.01):
                for kind in ('construction', 'heritage', 'court'):
                    with self.subTest(year=year, meters=meters, kind=kind):
                        old = packet('old')
                        pairs = supersede_scenes([old, packet('new', item=True, year=year, meters=meters, kind=kind)])
                        self.assertEqual(bool(pairs), abs(year - 553) <= 1 and meters < 500 and kind != 'court')

    def test_span_title_and_narrative_rules(self):
        # 끝 연도는 보지 않는다: 황룡사 창건 공사(553~566)를 항목 황룡사(553)가 대체한다.
        self.assertTrue(supersede_scenes([packet('old', end=566), packet('new', item=True)]))
        self.assertFalse(supersede_scenes([packet('old'), packet('new', item=True, title='혼천의')]))
        self.assertTrue(supersede_scenes([packet('old', title='광개토왕릉비를 세우다 (414)'), packet('new', item=True, title='광개토대왕릉비')]))
        self.assertTrue(supersede_scenes([packet('old', title='형평사 창립총회 — 진주 대안동 (1923)'), packet('new', item=True, title='형평 운동')]))
        self.assertFalse(supersede_scenes([packet('old', title='인조반정 — 홍제원 집결 (1623)'), packet('new', item=True, title='붕당 정치의 전개', end=1800)]))
        self.assertTrue(supersede_scenes([packet('old', title='사비성 포위와 백제의 항복 (660)'), packet('new', item=True, title='백제 멸망')]))
        self.assertTrue(supersede_scenes([packet('old', title='감은사 창건 — 경주 양북 (682)'), packet('new', item=True, title='감은사지 삼층석탑')]))
        self.assertFalse(supersede_scenes([packet('old', title='자격루 제작 — 경복궁 (1434)'), packet('new', item=True, title='혼천의 제작')]))
        self.assertFalse(supersede_scenes([packet('old', title='6·10 만세운동 (1926)'), packet('new', item=True, title='신간회 창립', end=1931)]))
        self.assertFalse(supersede_scenes([packet('old', narrativeType='tradition'), packet('new', item=True)]))
        self.assertFalse(supersede_scenes([packet('old'), packet('new', item=True, narrativeType='tradition')]))
        between = packet('old', place={'lon': 0, 'lat': 0, 'settlement': {'scope': 'between-records'}})
        self.assertFalse(supersede_scenes([between, packet('new', item=True)]))

    def test_nearest_and_stable_tie_break_and_no_item_changes(self):
        items = [packet('z', item=True, meters=100), packet('a', item=True, meters=100),
                 packet('far', item=True, meters=200)]
        before = copy.deepcopy(items)
        old = packet('old')
        pairs = supersede_scenes([old, *items])
        self.assertEqual(old['supersededBy'], 'a')
        self.assertEqual(pairs, supersede_scenes([*reversed(items), old]))
        self.assertEqual(items, before)
        self.assertEqual(supersede_scenes(items), [])

    def test_missing_coordinates_and_stale_marks(self):
        old = {**packet('old'), 'supersededBy': 'removed'}
        other = {**packet('other'), 'place': None}
        self.assertEqual(supersede_scenes([old, other, {**packet('new', item=True), 'place': None}]), [])
        self.assertNotIn('supersededBy', old)

    def test_cli_preserves_claims_sources_and_is_reproducible(self):
        with tempfile.TemporaryDirectory(dir=ROOT / 'tests') as folder:
            out = Path(folder) / 'scenes.json'
            report = Path(folder) / 'pairs.json'
            original = {'scenes': [packet('old'), packet('new', item=True)],
                        'sources': [{'id': 'source'}], 'claims': [{'id': 'claim'}], 'custom': 'unchanged'}
            out.write_text(json.dumps(original), encoding='utf8')
            command = [sys.executable, '-B', str(ROOT / 'scripts/build_history_scenes.py'),
                       '--supersede-only', '--out', str(out), '--supersede-report', str(report)]
            result = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            first = out.read_bytes(), report.read_bytes()
            result = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertEqual(first, (out.read_bytes(), report.read_bytes()))
            updated = json.loads(out.read_text(encoding='utf8'))
            self.assertEqual(updated['scenes'][0].pop('supersededBy'), 'new')
            self.assertEqual(updated, original)


if __name__ == '__main__':
    unittest.main()
