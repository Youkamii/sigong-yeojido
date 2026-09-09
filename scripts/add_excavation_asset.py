"""Small symbolic excavation grid; not a reconstruction of an excavated house."""
import json
from pathlib import Path

path=Path(__file__).resolve().parents[1]/'services/host/app/history-asset-catalog.json'
d=json.loads(path.read_text(encoding='utf8'))
def box(c,w,h,depth,x=0,y=0,z=0):
    return dict(k='box',c=c,m='stone',w=w,h=h,d=depth,x=x,y=y,z=z,tag='body')
parts=[box('bodyMid',8,.12,6,y=.06),box('earth',6.8,.08,4.8,y=.14)]
for x in [-3.9,3.9]:parts.append(box('body',.25,.5,6,x=x,y=.25))
for z in [-2.9,2.9]:parts.append(box('body',8,.5,.25,y=.25,z=z))
for x in [-2,0,2]:parts.append(box('snow',.035,.02,5.6,x=x,y=.52))
for z in [-1.4,0,1.4]:parts.append(box('snow',7.6,.02,.035,y=.52,z=z))
parts += [box('stone',.6,.2,.3,x=-1.2,y=.25,z=.7),box('stone',.3,.15,.5,x=.9,y=.23,z=-.6)]
d['blueprints']['dig_site']={'h':.6,'rad':5,'p':parts}
d['blueprints']['fort_wall_side']={'h':4.6,'rad':5,'p':[
    box('stone',1.6,3.8,10,y=1.9),box('stoneLt',1.9,.25,10.2,y=3.925),
    *[box('stone',1.7,.7,1.5,y=4.4,z=z) for z in [-4,-1.3,1.3,4]],
]}
cores=d['categories']['props']['cores']
if not any(c.startswith('dig_site|') for c in cores):cores.append('dig_site|발굴 조사 구역')
if not any(c.startswith('fort_wall_side|') for c in cores):cores.append('fort_wall_side|성벽 측면')
path.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
