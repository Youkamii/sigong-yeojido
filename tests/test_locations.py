import copy
from pathlib import Path
import sys
import unittest

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'services'))
from places import with_locations


class LocationMaterializationTests(unittest.TestCase):
    def test_cited_point_and_region_reference_keep_different_meanings(self):
        entities=[{'id':eid,'type':'Place','label':eid} for eid in ('ancient','region')]
        common={'origin':'ai','status':'draft','quote':'quoted','citesChunk':'chunk-a'}
        coordinate=dict(common,id='cl-point',subject='region',predicate='syj:locatedAt',fromSource='src-coordinate',
                        object={'kind':'location','lat':40,'lon':126,'precision':'admin-region-representative-point'})
        relation=dict(common,id='cl-region',subject='ancient',predicate='syj:locatedIn',fromSource='src-history',object={'kind':'entity','id':'region'})
        data=with_locations({'places':[]},[coordinate,relation],entities)
        places={p['id']:p for p in data['places']}
        direct=places['region']['candidates'][0]
        derived=places['ancient']['candidates'][0]
        self.assertTrue(direct['grounded'])
        self.assertFalse(derived['grounded'])
        self.assertTrue(derived['derived'])
        self.assertEqual(derived['requiredSources'],['src-coordinate','src-history'])
        self.assertEqual(derived['coordinateClaimId'],'cl-point')
        self.assertEqual(derived['claimId'],'cl-region')
        self.assertIsNone(derived['validTo'])
        relation['predicate']='syj:northOf'
        directional=with_locations({'places':[]},[coordinate,relation],entities)
        point=next(p for p in directional['places'] if p['id']=='ancient')['candidates'][0]
        self.assertEqual(point['precision'],'direction-reference-point')
        self.assertIn('기준 지역',point['basis'])
        self.assertFalse(point['grounded'])
        # Ordinary point claims are never silently used as the center of a region.
        coordinate['object']['precision']='site-point'
        data=with_locations({'places':[]},[coordinate,relation],entities)
        ancient=next(p for p in data['places'] if p['id']=='ancient')
        self.assertEqual(ancient['candidates'],[])

    def test_invalid_draft_is_left_for_validator_instead_of_crashing_builder(self):
        self.assertEqual(with_locations({'places':[]},[{},None,{'id':'bad'}],[]),{'places':[]})


if __name__=='__main__':unittest.main()
