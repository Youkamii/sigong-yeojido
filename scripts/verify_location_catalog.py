"""Compare actual map candidate IDs and metadata with the generated RDF (#49)."""
import argparse
import io
import json
from pathlib import Path
import sys
import tempfile

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'services'))
import build_ttl as B
import ttl_check as T
from places import load_places,with_locations


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--data',type=Path,default=ROOT/'data');ap.add_argument('--out',type=Path,required=True)
    args=ap.parse_args()
    with tempfile.TemporaryDirectory(prefix='sigong-location-check-') as tmp:
        ttl=Path(tmp)/'graph.ttl'
        code,result=B.build(args.data,ttl,out=io.StringIO())
        assert code==0,result.failures
        idx=T.Index(T.check_text(ttl.read_text(encoding='utf-8')).graph)
        inputs=B.V.load_inputs(args.data)
        shells=B.load_shells(args.data/'entities',[])
        entities=[{'id':s.id,'type':s.cls,'label':s.label,'labelHanja':s.label_hanja} for s in shells.values()]
        catalog=with_locations(load_places(args.data),[c for d in inputs.docs for c in d.claims],entities)
        candidates={c['id']:(p,c) for p in catalog['places'] for c in p.get('candidates',[])}
        rdf=set(idx.of_type(B.NS+'Location'))
        assert {B.NS+cid for cid in candidates}==rdf,{'missing':sorted({B.NS+cid for cid in candidates}-rdf),'extra':sorted(rdf-{B.NS+cid for cid in candidates})}
        for cid,(place,candidate) in candidates.items():
            node=B.NS+cid
            assert idx.objects(node,B.NS+'candidateOf')==[B.NS+place['id']],cid
            for key in ('lat','lon'):
                assert abs(float(idx.value(node,B.NS+key))-candidate[key])<1e-8,(cid,key)
            for key in ('validFrom','validTo'):
                value=idx.value(node,B.NS+key)
                expected=candidate.get(key,place.get(key))
                assert (int(value) if value is not None else None)==expected,(cid,key,value,expected)
            source=candidate.get('fromSource') or candidate.get('sourceId') or place.get('sourceId')
            if source:assert idx.objects(node,B.NS+'fromSource')==[B.NS+source],cid
    report={'placesInViewer':len(catalog['places']),'rdfPlaceNodes':result.stats['byClass']['Place'],
            'candidateCount':len(candidates),'locatedAtClaims':sum(c['predicate']=='syj:locatedAt' for d in inputs.docs for c in d.claims),
            'checks':{'exact_candidate_id_set':True,'coordinates':True,'source_provenance':True,'valid_periods':True},
            'warnings':result.warnings,'environment':'built from this checkout; live Fuseki comparison is a separate deployment check'}
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))


if __name__=='__main__':main()
