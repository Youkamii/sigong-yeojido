import gzip
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'services'))
from history_map import historical_features


class HistoricalMapTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.data=Path(self.temp.name);(self.data/'maps').mkdir()
        (self.data/'maps/cliopatria-korea-v013.geojson.gz').write_bytes(gzip.compress(json.dumps({'features':[
            self.feature('polity-bce','src-clio',-197,-92),self.feature('polity-ce','src-clio',378,533)
        ]}).encode()))
        self.write('provinces',[self.feature('province','src-a',1910,1945)])
        self.write('districts',[self.feature('district-before','src-a',1910,1914),
                                self.feature('district-after','src-a',1914,1945),
                                self.feature('human-district','src-b',1920,1930,'human')])
        self.write('townships',[self.feature('early-settlement','src-a',1883,1914),
                                self.feature('later-township','src-a',1914,1945)])

    def feature(self,id,source,start,end,origin='ai'):
        return {'type':'Feature','id':id,'geometry':{'type':'Polygon','coordinates':[]},
                'properties':{'fromSource':source,'origin':origin,'validFrom':start,'validTo':end}}

    def write(self,name,features):
        period='1883-1945' if name=='townships' else '1910-1945'
        path=self.data/f'maps/hgis-{name}-{period}.geojson.gz'
        path.write_bytes(gzip.compress(json.dumps({'features':features}).encode()))

    def ids(self,**kwargs):
        return [f['id'] for f in historical_features(self.data,**kwargs)['features']]

    def test_default_provinces_and_explicit_districts_stay_separate(self):
        self.assertEqual(self.ids(),['province'])
        self.assertEqual(self.ids(level=2),['district-before','district-after','human-district'])
        self.assertEqual(self.ids(),['province'])
        self.assertEqual(historical_features(self.data,level='2')['level'],2)

    def test_same_year_change_keeps_both_records_and_original_intervals(self):
        self.assertEqual(self.ids(level=2,year=1914),['district-before','district-after'])
        self.assertEqual(self.ids(level=2,year=1915),['district-after'])
        for year in (1909,1946):self.assertEqual(self.ids(level=2,year=year),[])

    def test_source_and_authorship_filters_apply_to_each_level(self):
        for level in (0,1,2,3):self.assertEqual(self.ids(level=level,sources=set()),[])
        self.assertEqual(self.ids(level=2,sources={'src-b'},origin='human'),['human-district'])
        self.assertEqual(self.ids(level=2,sources={'src-b'},origin='ai'),[])
        self.assertEqual(self.ids(level=1,origin='human'),[])

    def test_updated_layer_is_read_and_unknown_level_is_rejected(self):
        self.ids(level=2)
        self.write('districts',[self.feature('replacement-record','src-a',1911,1912)])
        self.assertEqual(self.ids(level=2),['replacement-record'])
        for level in (-1,4,'unknown'):
            with self.assertRaises(ValueError):self.ids(level=level)

    def test_townships_keep_earlier_dates_and_do_not_replace_other_levels(self):
        self.assertEqual(self.ids(level=3,year=1883),['early-settlement'])
        self.assertEqual(self.ids(level=3,year=1882),[])
        self.assertEqual(self.ids(level=3,year=1914),['early-settlement','later-township'])
        self.assertEqual(self.ids(level=3,origin='human'),[])
        self.assertEqual(self.ids(level=3,sources={'src-b'}),[])
        self.assertEqual(self.ids(level=1),['province'])
        self.assertEqual(len(self.ids(level=2)),3)

    def test_polity_records_keep_published_bce_ce_bounds_and_separate_sources(self):
        for year in (-197,-92):self.assertEqual(self.ids(level=0,year=year),['polity-bce'])
        self.assertEqual(self.ids(level=0,year=-91),[])
        self.assertEqual(self.ids(level=0,year=500),['polity-ce'])
        self.assertEqual(self.ids(level=0,year=500,sources={'src-a'}),[])
        self.assertEqual(self.ids(level=0,year=500,origin='human'),[])
        self.assertEqual(self.ids(),['province'])
