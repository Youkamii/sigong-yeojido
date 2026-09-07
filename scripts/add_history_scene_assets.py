"""Select original Fantology assemblies for event scenes without copying the full catalog."""
import argparse,json
from copy import deepcopy
from hashlib import sha256
from pathlib import Path

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source',type=Path,required=True)
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
path=root/'services/host/app/history-asset-catalog.json'
target=json.loads(path.read_text(encoding='utf-8'));source=json.loads(args.source.read_text(encoding='utf-8'))
selected={'ship','boat','wall','banner','table','book','handcart','palace','market','boat_slip'}
for key,category in source['categories'].items():
    rows=[row for row in category['cores'] if row.split('|')[0] in selected]
    if not rows:continue
    if key not in target['categories']:
        target['categories'][key]=deepcopy(category);target['categories'][key]['cores']=[]
    for row in rows:
        name=row.split('|')[0]
        if row not in target['categories'][key]['cores']:target['categories'][key]['cores'].append(row)
        target['blueprints'][name]=deepcopy(source['blueprints'][name])
        if name in source.get('coreOverrides',{}):target['coreOverrides'][name]=deepcopy(source['coreOverrides'][name])
path.write_text(json.dumps(target,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
record={'source':'fantology/services/host/app/asset-catalog.json','sourceSha256':sha256(args.source.read_bytes()).hexdigest(),
        'selectedCores':sorted(selected),'blueprints':'Copied without modification; symbolic assemblies, not reconstructed historical vessels or buildings.'}
(root/'docs/research/event-assets-101.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'selected':len(selected)}))
