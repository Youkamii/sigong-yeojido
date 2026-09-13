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
        for level in (-1,99,'unknown'):
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

    def test_event_point_requires_both_coordinate_and_date_sources(self):
        feature=self.feature('event','src-a',1919,1919)
        feature['geometry']={'type':'Point','coordinates':[126.89,37.12]}
        feature['properties']['requiredSources']=['src-a','src-date']
        (self.data/'maps/khs-events.geojson.gz').write_bytes(gzip.compress(json.dumps({'features':[feature]}).encode()))
        self.assertEqual(self.ids(level=4,year=1919),['event'])
        self.assertEqual(self.ids(level=4,year=1920),[])
        self.assertEqual(self.ids(level=4,sources={'src-a'}),[])
        self.assertEqual(self.ids(level=4,sources={'src-a','src-date'}),['event'])
        self.assertEqual(self.ids(level=4,origin='human'),[])

    def test_optional_polity_gap_catalog_uses_existing_cache_and_filters(self):
        self.assertEqual(self.ids(level=0,year=1920),[])
        path=self.data/'maps/polity-gap-1911-1947.geojson.gz'
        feature=self.feature('reference','src-hgis-admin-1910-1945',1911,1944)
        path.write_bytes(gzip.compress(json.dumps({'features':[feature]}).encode()))
        self.assertEqual(self.ids(level=0,year=1920),['reference'])
        self.assertEqual(self.ids(level=0,year=1920,origin='human'),[])
        self.assertEqual(self.ids(level=0,year=1920,sources={'src-clio'}),[])
        path.write_bytes(gzip.compress(json.dumps({'features':[]}).encode()))
        self.assertEqual(self.ids(level=0,year=1920),[])
        path.unlink()
        self.assertEqual(self.ids(level=0,year=500),['polity-ce'])

    def test_route_keeps_disconnected_lines_and_both_required_sources(self):
        self.assertEqual(self.ids(level=5),[])
        feature=self.feature('synthetic-route','src-a',1890,1895)
        feature['geometry']={'type':'MultiLineString','coordinates':[
            [[126,36],[126.5,36]],[[127,37],[127.5,37]]]}
        feature['properties']['requiredSources']=['src-a','src-date']
        (self.data/'maps/historical-routes.geojson.gz').write_bytes(gzip.compress(json.dumps({'features':[feature]}).encode()))
        for year in (1890,1895):
            self.assertEqual(historical_features(self.data,level=5,year=year)['features'],[feature])
        for year in (1889,1896):self.assertEqual(self.ids(level=5,year=year),[])
        self.assertEqual(self.ids(level=5,sources={'src-a'}),[])
        self.assertEqual(self.ids(level=5,sources={'src-a','src-date'}),['synthetic-route'])
        self.assertEqual(self.ids(level=5,origin='human'),[])
        self.assertEqual(self.ids(level=1),['province'])


class PublishedPolityGapTests(unittest.TestCase):
    data=Path(__file__).resolve().parents[1]/'data'

    def features(self,year,**kwargs):
        return historical_features(self.data,level=0,year=year,**kwargs)['features']

    def test_period_transitions_preserve_original_polities(self):
        expected={
            1910:{'Korean Empire'},
            1911:{'Korea under Japanese rule'},
            1920:{'Korea under Japanese rule'},
            1944:{'Korea under Japanese rule'},
            1945:{'US Army Military Government in Korea','Soviet Civil Administration'},
            1946:{'US Army Military Government in Korea','Soviet Civil Administration'},
            1947:{'US Army Military Government in Korea','Soviet Civil Administration'},
            1948:{'Republic of Korea',"Democratic People's Republic of Korea"},
        }
        for year,names in expected.items():
            with self.subTest(year=year):
                features=self.features(year)
                self.assertEqual(len(features),len(names))
                self.assertEqual({f['properties']['sourceRecord']['Name'] for f in features},names)

    def test_military_reference_polygons_meet_at_38_degrees(self):
        features=self.features(1946)
        self.assertEqual(len(features),2)
        for feature in features:
            geometry=feature['geometry']
            polygons=[geometry['coordinates']] if geometry['type']=='Polygon' else geometry['coordinates']
            latitudes=[point[1] for polygon in polygons for ring in polygon for point in ring]
            with self.subTest(feature=feature['id']):
                if feature['id']=='polity-gap-usamgik-1945-1947':
                    self.assertLess(min(latitudes),38.0)
                    self.assertEqual(max(latitudes),38.0)
                else:
                    self.assertEqual(feature['id'],'polity-gap-soviet-1945-1947')
                    self.assertEqual(min(latitudes),38.0)
                    self.assertGreater(max(latitudes),38.0)

    def test_hgis_source_filter_removes_all_reference_polygons(self):
        sources={'src-cliopatria-korea-v013'}
        for year in (1911,1920,1945,1946,1947):
            with self.subTest(year=year):
                self.assertEqual(self.features(year,sources=sources),[])
                self.assertEqual(self.features(year,origin='human'),[])
        for year in (1910,1948):
            self.assertEqual(self.features(year,sources=sources),self.features(year))
        self.assertEqual(len(self.features(1946,sources={'src-hgis-admin-1910-1945'})),2)
