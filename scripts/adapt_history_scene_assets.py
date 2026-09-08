"""Refine symbolic period silhouettes without changing the Fantology generator."""
import copy,json,math
from pathlib import Path
from adapt_history_buildings import part

path=Path(__file__).resolve().parents[1]/'services/host/app/history-asset-catalog.json'
data=json.loads(path.read_text(encoding='utf8'));bp=data['blueprints']
def define(name,label,category,parts,h,rad):
    bp[name]={'h':h,'rad':rad,'p':parts}
    entries=data['categories'][category]['cores']
    if not any(entry.split('|')[0]==name for entry in entries):entries.append(name+'|'+label)

def figure(color):
    return [part('box','base','leather','iron',w=.24,h=.14,d=.38,y=.07,x=.19,rep={'mir':'x'}),
        part('cyl','body','leather',color,r=.43,r1=.28,h=.85,y=.62,seg=10),
        part('box','body','leather',color,w=.64,h=.73,d=.4,y=1.38),
        part('box','body','leather','iron',w=.68,h=.11,d=.43,y=1.05),
        part('rcyl','limb','leather',color,r=.17,h=.8,y=1.33,x=.43,rz=.16,seg=8,rep={'mir':'x'}),
        part('sph','limb','leather','timberLt',r=.11,y=.95,x=.48,rep={'mir':'x'}),
        part('cyl','body','leather','timberLt',r=.1,h=.16,y=1.83,seg=8),
        part('sph','top','leather','timberLt',r=.23,y=2.07,sy=1.12),
        part('sph','top','leather','iron',r=.024,y=2.12,z=.212,x=.085,rep={'mir':'x'}),
        part('box','top','leather','timberLt',w=.07,h=.07,d=.08,y=2.035,z=.23),
        part('box','body','leather','snow',w=.07,h=.57,d=.05,y=1.5,z=.225,rz=.25)]

common=figure('snow')
common+=[part('sph','top','leather','iron',r=.235,y=2.21,sy=.5),part('sph','top','leather','iron',r=.075,y=2.36)]
define('period_figure','옛 인물 모형','humanoids',common,2.45,.66)
scholar=figure('snow')+[part('cyl','top','leather','iron',r=.43,h=.045,y=2.3,seg=16),
    part('cyl','top','leather','iron',r=.22,r1=.18,h=.34,y=2.47,seg=12),
    part('box','ornament','timber','timberLt',w=.28,h=.4,d=.07,y=1.05,x=.47,z=.11)]
define('period_scholar','문인·관리 모형','humanoids',scholar,2.7,.75)
commander=figure('deepWater')+[part('box','body','iron','steel',w=.59,h=.67,d=.12,y=1.42,z=.22),
    part('box','body','iron','iron',w=.045,h=.65,d=.035,y=1.42,z=.3,rep={'n':7,'dx':.08}),
    part('box','body','iron','iron',w=.58,h=.025,d=.035,y=1.2,z=.3,rep={'n':4,'dy':.15}),
    part('box','body','iron','steel',w=.32,h=.16,d=.48,y=1.74,x=.4,rep={'mir':'x'}),
    part('sph','top','iron','steel',r=.265,y=2.24,sy=.8),part('cyl','top','iron','gold',r=.25,h=.045,y=2.23,seg=12),
    part('cone','top','leather','roof',r=.075,h=.43,y=2.64,seg=6),
    part('rcyl','ornament','leather','iron',r=.048,h=.83,y=.69,x=.5,z=-.04,rz=-.18,seg=6),
    part('box','ornament','iron','gold',w=.22,h=.045,d=.1,y=1.11,x=.45)]
define('period_commander','무장·지휘관 모형','humanoids',commander,2.9,.8)
ruler=figure('roof')+[part('cyl','top','leather','iron',r=.245,h=.3,y=2.4,seg=10),
    part('box','top','leather','iron',w=.32,h=.15,d=.09,y=2.42,x=.35,rz=.18,rep={'mir':'x'}),
    part('cyl','ornament','leather','gold',r=.13,h=.035,y=1.47,z=.235,rx=math.pi/2,seg=12)]
define('period_ruler','군주 모형','humanoids',ruler,2.65,.75)
monk=figure('bodyMid')+[part('box','body','leather','timber',w=.2,h=1.03,d=.06,y=1.26,z=.25,rz=.35)]
define('period_monk','승려 모형','humanoids',monk,2.35,.7)
modern=figure('iron')
modern=[p for p in modern if not(p['k']=='cyl' and p.get('h')==.85)]
modern+=[part('box','limb','leather','iron',w=.24,h=.8,d=.28,y=.53,x=.19,rep={'mir':'x'}),
    part('box','body','leather','snow',w=.17,h=.47,d=.035,y=1.54,z=.23),
    part('box','body','leather','trunk',w=.055,h=.36,d=.025,y=1.51,z=.26),
    part('sph','top','leather','iron',r=.235,y=2.21,sy=.5)]
define('modern_figure','근현대 인물 모형','humanoids',modern,2.4,.7)

# Fix floating roofs, add visible rafters, upturned eave edges and roof courses.
bp['korean_house']['p']= [p for p in bp['korean_house']['p'] if not p.get('detail116')]
for p in bp['korean_house']['p']:
    if p['k']=='gable':p['y']=2.66
for p in bp['korean_hall']['p']:
    if p['k']=='gable':p['y']=4 if p['w']>10 else 5.8
for name in ['korean_hall','korean_house']:
    target=bp[name];target['p']=[p for p in target['p'] if not p.get('detail116')]
    for roof in [p for p in target['p'] if p['k']=='gable']:
        w,h,d,y=roof['w'],roof['h'],roof['d'],roof['y']
        for sign in [-1,1]:
            target['p'].append(part('box','roof','timber','iron',w=w+.22,h=.11,d=.55,y=y+.04,z=sign*(d/2-.06),rx=-sign*.15,detail116=True))
            target['p'].append(part('rcyl','roof','timber','steel',r=.027,h=math.hypot(h,d/2),y=y+h/2+.027,z=sign*d/4,
                rx=-sign*math.atan2(d/2,h),seg=5,rep={'n':14,'dx':w/14},detail116=True))
            target['p'].append(part('box','body','timber','timber',w=.1,h=.13,d=.75,y=y-.11,z=sign*(d/2-.3),rep={'n':12,'dx':w/13},detail116=True))

gate=[part('box','base','stone','base',w=9,h=.35,d=4.6,y=.175),
    part('box','body','stone','bodyMid',w=2.8,h=3.6,d=3.4,y=2.1,x=3,rep={'mir':'x'}),
    part('box','body','stone','bodyMid',w=3.3,h=1.1,d=3.4,y=3.35),
    part('box','body','timber','timber',w=2.7,h=2.8,d=.15,y=1.65,z=-1.1),
    part('box','body','timber','roof',w=.23,h=1.6,d=2.7,y=4.7,rep={'n':6,'dx':1.4}),
    part('box','body','timber','canopyLow',w=8.2,h=.3,d=3.8,y=5.43),
    part('gable','roof','timber','iron',w=9.4,h=1.1,d=4.9,y=5.58),
    part('box','top','stone','body',w=9.1,h=.12,d=.17,y=6.73)]
define('korean_gate','목조 성문 모형','buildings',gate,6.9,5.2)
for original,name,label in [('academy_hall','korean_academy','목조 학당 모형'),('courtyard_house','korean_courtyard','마당집 모형')]:
    clone=copy.deepcopy(bp[original]);clone['p']=[p for p in clone['p'] if p['k']!='flag' and p.get('m')!='crystal']
    for p in clone['p']:
        if p.get('tag')=='roof':p['c']='iron';p['y']-=.4
        if p.get('tag')=='body' and p['k'] in ['cyl','rcyl']:p.update(m='timber',c='roof')
    define(name,label,'buildings',clone['p'],clone['h'],clone['rad'])
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
