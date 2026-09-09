"""Illustrative story motifs; these props do not assert archaeological locations."""
import json
from pathlib import Path
path=Path(__file__).resolve().parents[1]/'services/host/app/history-asset-catalog.json'
d=json.loads(path.read_text(encoding='utf8'))
def sphere(c,r,x=0,y=0,z=0,**scale):return dict(k='sph',c=c,m='stone',r=r,x=x,y=y,z=z,tag='body',**scale)
definitions={
 'story_egg':('강림 전승의 알 모형',2.3,1.5,[sphere('snow',1,y=1.2,sx=.8,sy=1.15,sz=.8)]),
 'story_rock':('바위 전승 모형',3,3,[sphere('stone',2,y=1.1,sx=1.3,sy=.7,sz=1),sphere('stone',1.3,x=1.2,y=.55,z=.5,sy=.5)]),
 'standing_stone':('망부석 전승 모형',4.5,1.5,[sphere('stone',1.3,y=2.1,sx=.7,sy=1.7,sz=.6)]),
 'story_hollows':('삼성혈 전승 모형',.4,3,[sphere('stone',1,x=x,y=.15,z=z,sx=1.1,sy=.15,sz=.8) for x,z in [(0,-1.4),(-1.3,1),(1.3,1)]]),
}
for key,(label,h,rad,parts) in definitions.items():
 d['blueprints'][key]={'h':h,'rad':rad,'p':parts}
 cores=d['categories']['props']['cores']
 if not any(c.startswith(key+'|') for c in cores):cores.append(key+'|'+label)
path.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
