"""Small background buildings, separate from named historical scenes."""
import json
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'services/host/app/history-asset-catalog.json'
d=json.loads(p.read_text(encoding='utf8'))
def part(k,c,tag='body',**kw):return dict(k=k,c=c,m='timber',tag=tag,**kw)
def define(name,label,parts,h,rad):
 d['blueprints'][name]={'h':h,'rad':rad,'p':parts}
 entries=d['categories']['buildings']['cores']
 if not any(x.split('|')[0]==name for x in entries):entries.append(name+'|'+label)
define('rural_cottage','작은 초가',[
 part('box','base','base',w=5,h=.18,d=3.7,y=.09),part('box','body',w=4.4,h=1.8,d=3,y=1.08),
 part('gable','timberLt','roof',w=5.4,h=1.2,d=4,y=1.98),part('box','timber',w=.72,h=1.45,d=.06,x=-.65,y=.92,z=1.53),
 part('box','iron',w=.6,h=.6,d=.07,x=1,y=1.3,z=1.53),part('box','timberLt',w=.07,h=.67,d=.09,x=1,y=1.3,z=1.59),
 part('cyl','timber','ornament',r=.25,h=.45,x=-1.9,y=.3,z=2.1,seg=8)],3.2,3.2)
define('rural_store','작은 곡식 창고',[
 part('box','timber',w=.2,h=.8,d=.2,y=.4,x=1.3,z=.8,rep={'mir':'x'}),part('box','timber',w=.2,h=.8,d=.2,y=.4,x=1.3,z=-.8,rep={'mir':'x'}),
 part('box','timberLt',w=3,h=1.4,d=2,y=1.35),part('gable','timber','roof',w=3.8,h=.8,d=2.7,y=2.05),
 part('box','timber',w=.75,h=1.1,d=.06,y=1.3,z=1.04)],2.85,2.3)
define('rural_hut','낮은 움막',[
 part('cyl','bodyMid',r=1.8,h=.75,y=.375,seg=9),part('cone','timberLt','roof',r=2.3,h=1.9,y=1.7,seg=9),
 part('box','iron',w=.55,h=.85,d=.06,y=.48,z=1.75)],2.65,2.5)
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
