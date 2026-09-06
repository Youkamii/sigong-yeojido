import copy
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from prepare_place_research import prepare
from check_place_research import check_document, earth_points, matches_point


class PlaceResearchTests(unittest.TestCase):
    def test_index_occurrences_are_not_distinct_terms_or_country_names(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            entries = [{'type': '지명', 'text': '平壤', 'chunkId': 'chunk_$1'}] * 2
            entries += [{'type': '국명', 'text': '漢', 'chunkId': 'chunk_$1'},
                        {'type': '지명', 'text': '漢城', 'chunkId': 'chunk_2'}]
            chunks = [{'id': 'chunk_$1', 'sourceId': 'src-test', 'text': '王幸平壤.'},
                      {'id': 'chunk_2', 'sourceId': 'src-test', 'text': '別名見主釋'}]
            (folder/'index-terms.jsonl').write_text('\n'.join(map(json.dumps, entries)), encoding='utf-8')
            (folder/'chunks.jsonl').write_text('\n'.join(map(json.dumps, chunks)), encoding='utf-8')
            result = prepare(folder, 2)
            self.assertEqual((result['distinctTerms'], result['occurrences']), (2, 3))
            self.assertEqual([t['text'] for t in result['terms']], ['平壤', '漢城'])
            self.assertEqual(len(result['terms'][0]['samples']), 1)
            self.assertFalse(result['terms'][1]['samples'][0]['termInBody'])
            sample = result['terms'][0]['samples'][0]
            self.assertEqual(sample['quote'], chunks[0]['text'][sample['quoteStart']:sample['quoteEnd']])
            (folder/'chunks.jsonl').write_text('', encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'Missing source chunks'):
                prepare(folder)

    def fixture(self):
        sample = {'chunkId': 'chunk_1', 'quote': '幸西京.'}
        term = {'text': '西京', 'rank': 1, 'count': 2, 'samples': [sample]}
        index = {'source': 'goryeosa', 'terms': [term]}
        chunks = {'chunk_1': {'sourceId': 'src-goryeosa', 'text': '壬申 幸西京.'}}
        place = {'id': 'place-goryeosa-001', 'label': '西京', 'labelKo': '서경',
                 'sourceId': 'src-goryeosa', 'indexType': '지명', 'count': 2, 'note': '위치 근거 미확인',
                 'status': 'unlocated', 'confidence': 'unverified', 'evidence': [sample], 'candidates': []}
        return {'places': [place]}, index, chunks

    def test_unlocated_still_requires_exact_original_evidence(self):
        document, index, chunks = self.fixture()
        self.assertEqual(check_document(document, index, chunks), [])
        changed = copy.deepcopy(document)
        changed['places'][0]['evidence'][0]['quote'] = '왕은 평양으로 갔다.'
        self.assertTrue(any('verbatim' in e for e in check_document(changed, index, chunks)))
        self.assertTrue(any('missing assigned' in e for e in check_document({'places': []}, index, chunks)))
        duplicate = {'places': document['places'] * 2}
        self.assertTrue(any('duplicate label' in e for e in check_document(duplicate, index, chunks)))

    def test_wikidata_point_is_not_a_different_location_or_globe(self):
        def statement(lat, lon, globe='Q2', rank='normal'):
            return {'rank': rank, 'mainsnak': {'datavalue': {'value': {
                'latitude': lat, 'longitude': lon, 'globe': 'http://www.wikidata.org/entity/' + globe}}}}
        entity = {'claims': {'P625': [statement(39, 125), statement(1, 2, 'Q111'),
                                     statement(3, 4, rank='deprecated')]}}
        points = earth_points(entity)
        self.assertEqual(len(points), 1)
        self.assertTrue(matches_point({'lat': 39.0000001, 'lon': 125}, points))
        self.assertFalse(matches_point({'lat': 39.1, 'lon': 125}, points))

    def test_review_can_expand_a_quote_within_its_original_chunk(self):
        document, index, chunks = self.fixture()
        item = document['places'][0]['evidence'][0]
        item.update(quote='壬申 幸西京.', quoteStart=0, quoteEnd=7)
        self.assertEqual(check_document(document, index, chunks), [])
        item['quoteEnd'] = 6
        self.assertTrue(any('offsets' in e for e in check_document(document, index, chunks)))

    def test_bad_coordinate_and_reversed_period_are_rejected(self):
        document, index, chunks = self.fixture()
        place = document['places'][0]
        place.update(status='majority', validFrom=1000, validTo=900)
        place['candidates'] = [{'lat': float('nan'), 'lon': 181, 'precision': 'region',
                                'sourceUrl': 'https://example.org/history', 'basis': 'basis', 'view': 'source',
                                'coordSourceUrl': 'https://www.wikidata.org/wiki/Q1', 'confidence': 'probable'}]
        errors = check_document(document, index, chunks)
        self.assertTrue(any('invalid lat' in e for e in errors))
        self.assertTrue(any('invalid lon' in e for e in errors))
        self.assertTrue(any('invalid place period' in e for e in errors))


if __name__ == '__main__':
    unittest.main()
