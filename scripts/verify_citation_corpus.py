"""Compare citation samples with an independently available full corpus."""
import argparse
import hashlib
import json
from pathlib import Path


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--samples',type=Path,required=True)
    ap.add_argument('--data',type=Path,default=Path('data'));ap.add_argument('--out',type=Path,required=True);args=ap.parse_args()
    samples=[json.loads(line) for line in args.samples.read_text(encoding='utf-8').splitlines() if line.strip()]
    wanted={row['id']:row for row in samples};assert len(wanted)==len(samples)
    matched=[];by_source={}
    for sid in sorted({row['sourceId'] for row in samples}):
        file=args.data/'sources'/sid.removeprefix('src-')/'chunks.jsonl';assert file.is_file(),file
        count=0
        with file.open(encoding='utf-8') as stream:
            for line in stream:
                if not line.strip():continue
                row=json.loads(line)
                if row['id'] in wanted:
                    assert row==wanted[row['id']],row['id'];matched.append(row['id']);count+=1
        by_source[sid]=count
    assert set(matched)==set(wanted),set(wanted)-set(matched)
    report={'fullRecordEquality':True,'chunks':len(matched),'bySource':by_source,
            'samplesSha256':hashlib.sha256(args.samples.read_bytes()).hexdigest(),
            'method':'Full JSON object equality, including text, dates, annotations and provenance.'}
    args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(report))


if __name__=='__main__':main()
