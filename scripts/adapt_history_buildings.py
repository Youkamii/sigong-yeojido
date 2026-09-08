"""Add symbolic timber buildings using the existing Fantology part language."""
import json
from pathlib import Path

root=Path(__file__).resolve().parents[1]
path=root/'services/host/app/history-asset-catalog.json'
data=json.loads(path.read_text(encoding='utf8'))
def part(k,tag,m,c,**values):return {'k':k,**values,'m':m,'c':c,'tag':tag}
data['blueprints']['korean_hall']={'h':7.4,'rad':6.5,'p':[
    part('box','base','stone','base',w=11,h=.35,d=7.8,y=.175),
    part('box','base','stone','bodyMid',w=10,h=.6,d=7,y=.65),
    part('box','base','stone','body',w=3.4,h=.25,d=1.3,y=.25,z=4),
    part('box','body','timber','timberLt',w=8,h=2.7,d=4.6,y=2.25),
    part('cyl','body','timber','roof',r=.2,h=3,y=2.4,z=2.6,seg=8,rep={'n':6,'dx':1.6}),
    part('cyl','body','timber','roof',r=.2,h=3,y=2.4,z=-2.6,seg=8,rep={'n':6,'dx':1.6}),
    part('box','body','timber','timber',w=.12,h=2.1,d=.15,y=2.3,z=2.34,rep={'n':14,'dx':.53}),
    part('box','roof','timber','canopyLow',w=10.1,h=.22,d=6.6,y=3.88),
    part('gable','roof','timber','iron',w=10.8,h=1.1,d=7.4,y=4.52),
    part('box','body','timber','timberLt',w=6.6,h=1.05,d=3.6,y=5.17),
    part('box','body','timber','roof',w=.17,h=1.2,d=3.8,y=5.15,rep={'n':5,'dx':1.6}),
    part('box','roof','timber','canopyLow',w=8.1,h=.2,d=5.1,y=5.7),
    part('gable','roof','timber','iron',w=8.8,h=1.1,d=5.9,y=6.33),
    part('box','top','timber','bodyMid',w=8.6,h=.12,d=.2,y=6.95),
]}
house=json.loads(json.dumps(data['blueprints']['house']))
house['p']=[p for p in house['p'] if p.get('tag')!='top']
roof=next(p for p in house['p'] if p['k']=='gable');roof.update(w=4.5,d=3.9,h=.8,y=2.98,c='iron')
house['p'].append(part('box','roof','timber','timber',w=4.25,h=.14,d=3.65,y=2.57))
house.update(h=3.5,rad=3)
data['blueprints']['korean_house']=house
for entry in ['korean_hall|목조 도읍 건물 모형','korean_house|옛 가옥 모형']:
    if entry not in data['categories']['buildings']['cores']:data['categories']['buildings']['cores'].append(entry)
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
