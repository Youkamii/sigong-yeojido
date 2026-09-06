"""Report actual applicability separately from synthetic rule verification."""
import argparse
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'services'))
from geography_rules import assess
from validate import parse_claims_text


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--data',type=Path,default=ROOT/'data')
    ap.add_argument('--out',type=Path,required=True);args=ap.parse_args()
    claims=[]
    for path in sorted((args.data/'claims').rglob('*.md')):
        _,rows=parse_claims_text(path.read_text(encoding='utf-8'));claims.extend(rows)
    report={'claimsRead':len(claims),**assess(claims),'historicalInterpretationReviewed':False}
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))


if __name__=='__main__':main()
