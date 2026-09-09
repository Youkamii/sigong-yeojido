"""Anonymous rural silhouettes; no named village or building reconstruction."""
import copy,json,math
from pathlib import Path

path=Path(__file__).resolve().parents[1]/'services/host/app/history-asset-catalog.json'
data=json.loads(path.read_text(encoding='utf8'))
def part(k,c,tag='body',**fields):return dict(k=k,c=c,tag=tag,m='timber',**fields)
def define(name,label,category,parts,h,rad):
 data['blueprints'][name]=dict(h=h,rad=rad,p=parts)
 cores=data['categories'][category]['cores']
 if not any(c.split('|')[0]==name for c in cores):cores.append(name+'|'+label)

define('rural_tiled','낮은 기와 농가','buildings',[
 part('box','base','base',w=5.8,h=.25,d=4.3,y=.125),
 part('box','body',w=5.1,h=2.2,d=3.5,y=1.35),
 part('gable','iron','roof',w=6.1,h=1.1,d=4.6,y=2.45),
 part('box','timber',w=.8,h=1.8,d=.06,x=-1,y=1.15,z=1.8),
 part('box','deepWater',w=1.1,h=.8,d=.06,x=1,y=1.6,z=1.8),
 part('box','timberLt',w=.07,h=.84,d=.08,x=1,y=1.6,z=1.86),
 part('box','bodyMid',w=1.4,h=.4,d=.7,x=-1,y=.2,z=2.1),
],3.6,3.8)
define('rural_metal','작은 판지붕 농가','buildings',[
 part('box','base','base',w=6.5,h=.25,d=3.8,y=.125),
 part('box','body',w=5.8,h=2.2,d=3.2,y=1.35),
 part('gable','deepWater','roof',w=6.6,h=.6,d=3.9,y=2.45),
 part('box','deepWater','roof',w=.055,h=.05,d=3.8,y=2.62,rep={'n':14,'dx':.44}),
 part('box','iron',w=.8,h=1.8,d=.06,x=1.2,y=1.15,z=1.65),
 part('box','steel',w=1.5,h=.75,d=.06,x=-1.2,y=1.65,z=1.65),
 part('box','timber',w=.1,h=1.9,d=.1,x=2.5,y=1,z=2.7,rep={'mir':'x'}),
 part('box','deepWater','roof',w=5.3,h=.13,d=1.1,y=2.02,z=2.3),
],3.1,4)
define('rural_flat','작은 평지붕 농가','buildings',[
 part('box','base','base',w=5.1,h=.2,d=4.6,y=.1),
 part('box','body',w=4.8,h=2.6,d=4.2,y=1.5),
 part('box','steel','roof',w=5.1,h=.18,d=4.5,y=2.89),
 part('box','bodyMid','roof',w=5.1,h=.35,d=.13,y=3.13,z=-2.19),
 part('box','bodyMid','roof',w=.13,h=.35,d=4.5,y=3.13,x=2.49,rep={'mir':'x'}),
 part('box','iron',w=.9,h=1.9,d=.06,x=-1.3,y=1.16,z=2.14),
 part('box','deepWater',w=1.8,h=1,d=.06,x=.9,y=1.8,z=2.14),
 part('box','snow',w=.06,h=1,d=.08,x=.9,y=1.8,z=2.18),
],3.35,3.5)

for name,color,label in [('rural_figure','timberLt','이름 없는 생활 인물'),('field_worker','deepWater','농촌 생활 인물')]:
 parts=[part('box','iron','base',w=.24,h=.13,d=.36,y=.065,x=.18,rep={'mir':'x'}),
  part('box',color,'limb',w=.24,h=.78,d=.3,y=.52,x=.18,rep={'mir':'x'}),
  part('box','body','body',w=.68,h=.8,d=.42,y=1.3),
  part('rcyl','body','limb',r=.14,h=.8,y=1.25,x=.43,rz=.12,seg=8,rep={'mir':'x'}),
  part('sph','timberLt','limb',r=.11,y=.86,x=.47,rep={'mir':'x'}),
  part('sph','timberLt','top',r=.24,y=1.98,sy=1.1),
  part('sph','iron','top',r=.245,y=2.1,sy=.45)]
 if name=='field_worker':parts += [part('cyl','timberLt','top',r=.42,h=.035,y=2.15,seg=12),part('cyl','timberLt','top',r=.24,r1=.17,h=.17,y=2.25,seg=10)]
 define(name,label,'humanoids',parts,2.4,.7)

tractor=[part('box','deepWater',w=1.3,h=.65,d=2.9,y=.95),
 part('box','canopyLow',w=1.1,h=.75,d=1.25,y=1.45,z=.68),
 part('box','iron',w=.7,h=.55,d=.15,y=1.8,z=-.6),
 part('box','iron',w=.7,h=.15,d=.55,y=1.5,z=-.4),
 part('rcyl','iron',r=.06,h=.8,y=2,z=.8,x=.4,seg=6),
 part('box','steel',w=.7,h=.43,d=.06,y=1.47,z=1.33)]
for z,r in [(-.8,.68),(1,.43)]:
 tractor += [part('cyl','iron','base',r=r,h=.3,x=.78,y=r,z=z,rz=math.pi/2,seg=10,rep={'mir':'x'}),
  part('cyl','steel','base',r=r*.43,h=.32,x=.78,y=r,z=z,rz=math.pi/2,seg=10,rep={'mir':'x'})]
define('farm_tractor','농기계 상징 모형','vehicles',tractor,2.5,2)
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
