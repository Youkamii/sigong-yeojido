"""Add a decorative tiger, without adding a historical entity or location claim."""
import json,math
from pathlib import Path

path=Path(__file__).resolve().parents[1]/'services/host/app/history-asset-catalog.json'
data=json.loads(path.read_text(encoding='utf8'))
def part(k,tag,c,**values):return {'k':k,**values,'m':'leather','c':'gold' if c=='roofAlt' else c,'tag':tag}
parts=[part('rcyl','body','roofAlt',r=.4,h=1.45,y=.89,rx=math.pi/2,seg=10),
    part('sph','body','snow',r=.51,y=.66,z=.2,sx=.65,sy=.54,sz=1.1),
    part('cyl','limb','roofAlt',r=.13,h=.64,y=.4,x=.31,z=.58,seg=8,rep={'mir':'x'}),
    part('cyl','limb','roofAlt',r=.15,h=.64,y=.4,x=.31,z=-.58,seg=8,rep={'mir':'x'}),
    part('box','base','roofAlt',w=.26,h=.16,d=.34,y=.1,x=.31,z=.67,rep={'mir':'x'}),
    part('box','base','roofAlt',w=.26,h=.16,d=.34,y=.1,x=.31,z=-.5,rep={'mir':'x'}),
    part('sph','top','roofAlt',r=.38,y=1.15,z=.93,sx=1.1,sy=.94),
    part('sph','top','snow',r=.17,y=1.02,z=1.21,sx=1.3,sy=.7),
    part('sph','top','iron',r=.055,y=1.08,z=1.37,sy=.7),
    part('sph','top','gold',r=.049,y=1.24,z=1.22,x=.16,rep={'mir':'x'}),
    part('sph','top','iron',r=.023,y=1.245,z=1.258,x=.16,rep={'mir':'x'}),
    part('sph','top','iron',r=.13,y=1.45,z=.88,x=.24,sz=.5,rep={'mir':'x'}),
    part('sph','top','roofAlt',r=.075,y=1.46,z=.93,x=.24,sz=.5,rep={'mir':'x'}),
    part('rcyl','limb','roofAlt',r=.07,h=.8,y=1.01,z=-1.12,rx=-1.15,seg=8),
    part('rcyl','limb','iron',r=.069,h=.3,y=1.24,z=-1.59,rx=-.72,seg=8),
    part('rcyl','body','iron',r=.407,h=.065,y=.89,rx=math.pi/2,seg=10,rep={'n':5,'dz':.26}),
    part('sph','top','iron',r=.065,y=1.18,z=1.18,x=.26,sx=.35,sy=1.25,sz=.3,rep={'mir':'x'})]
data['blueprints']['tiger']={'h':1.7,'rad':1.9,'p':parts}
data['categories']['wildlife']={'label':'풍경 동물','family':'ecology','forms':['natural|자연'], 'cores':['tiger|호랑이 모형']}
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
