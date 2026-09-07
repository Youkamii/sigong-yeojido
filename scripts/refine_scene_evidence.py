"""Keep each fortress's residents separate in the imported scene claims."""
import json,re
from pathlib import Path

root=Path(__file__).resolve().parents[1]
draft=json.loads((root/'data/research/scenes-101/invasion_events/result.json').read_text(encoding='utf-8'))
groups={s['eventId']:{'id':'polity-residents-'+s['eventId'].removeprefix('event-'),'label':s['place']['label']+' 주민'}
        for s in draft['scenes'] if any(p['entityId']=='polity-imjin-fortress-people' for p in s['participants'])}
changes=[]
for path in (root/'data/claims').glob('*/scenes-101/*.md'):
    original=path.read_text(encoding='utf-8')
    block=re.search(r'```claims-json\s*(.*?)```',original,re.S)
    claims=json.loads(block[1]);changed=False
    for claim in claims:
        if claim['object'].get('id')=='polity-imjin-fortress-people':
            group=groups[claim['subject']]
            changes.append({'claim':claim['id'],'original':'polity-imjin-fortress-people','replacement':group['id']})
            claim['object']['id']=group['id'];changed=True
    if changed:path.write_text(original[:block.start()]+ '```claims-json\n'+json.dumps(claims,ensure_ascii=False,indent=2)+'\n```'+original[block.end():],encoding='utf-8')
for group in groups.values():
    (root/'data/entities/polity'/ (group['id']+'.md')).write_text(
        '---\nid: '+json.dumps(group['id'])+'\ntype: "Polity"\nlabel: '+json.dumps(group['label'],ensure_ascii=False)+'\n---\n',encoding='utf-8')
report=root/'data/research/scenes-101/integration-adjustments.json'
if changes:report.write_text(json.dumps({'reason':'A shared civilian role does not identify one group across different fortresses.','changes':changes},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'separateResidentGroups':len(groups),'claimsChanged':len(changes)}))
