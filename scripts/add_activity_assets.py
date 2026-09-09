"""Symbolic activity props; silhouettes are not replicas or historical counts."""
import json
from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'services/host/app/history-asset-catalog.json'
data = json.loads(path.read_text(encoding='utf8'))

def part(k, c, tag='body', **fields):
    return dict(k=k, c=c, m='timber', tag=tag, **fields)

def define(name, label, category, parts, h, rad):
    data['blueprints'][name] = dict(h=h, rad=rad, p=parts)
    cores = data['categories'][category]['cores']
    if not any(c.split('|')[0] == name for c in cores):
        cores.append(name + '|' + label)

define('string_instrument', '현악기 모형', 'props', [
    part('box', 'timber', w=3.8, h=.22, d=.78, y=.49),
    part('box', 'timberLt', w=3.6, h=.08, d=.7, y=.64),
    part('box', 'iron', 'base', w=.18, h=.38, d=.62, x=1.4, y=.19, rep={'mir':'x'}),
    part('box', 'timber', w=.08, h=.12, d=.69, x=-1.6, y=.72),
    part('box', 'snow', 'ornament', w=3.4, h=.018, d=.012, y=.77, rep={'n':6,'dz':.1}),
    part('box', 'timber', w=.05, h=.13, d=.58, x=.1, y=.73),
], .8, 2)

define('grain_stack', '곡식 자루 모형', 'props', [
    part('box', 'timber', 'base', w=2.8, h=.12, d=1.8, y=.06),
    part('sph', 'timberLt', r=.63, sx=.7, sy=.65, sz=1.25, x=-.8, y=.48),
    part('sph', 'timberLt', r=.63, sx=.7, sy=.65, sz=1.25, x=.12, y=.48),
    part('sph', 'timberLt', r=.63, sx=.7, sy=.65, sz=1.25, x=1, y=.48),
    part('sph', 'bodyMid', r=.6, sx=.75, sy=.65, sz=1.2, x=-.3, y=1.1, rz=.12),
    part('box', 'timber', w=.03, h=.025, d=1.3, x=-.3, y=1.48),
], 1.55, 1.8)

define('groundbreaking', '첫 삽 모형', 'props', [
    part('sph', 'bodyMid', 'base', r=2.8, sy=.22, sz=.75, y=.2),
    part('box', 'iron', w=.5, h=.62, d=.09, x=-.6, y=.75, rz=-.2),
    part('rcyl', 'timber', r=.06, h=1.7, x=-.4, y=1.83, rz=-.2, seg=6),
    part('box', 'timber', w=.5, h=.09, d=.1, x=-.23, y=2.65),
    part('box', 'iron', w=.48, h=.6, d=.09, x=.8, y=.72, rz=.12),
    part('rcyl', 'timber', r=.06, h=1.7, x=.69, y=1.8, rz=.12, seg=6),
    part('box', 'timber', w=.5, h=.09, d=.1, x=.58, y=2.6),
], 2.75, 3)

frame = [part('box', 'base', 'base', w=10, h=.35, d=6, y=.175)]
for z in [-2.4, 2.4]:
    for x in [-4, 0, 4]:
        frame.append(part('box', 'steel', w=.16, h=4, d=.16, x=x, y=2.3, z=z))
    frame.append(part('box', 'steel', w=8.4, h=.16, d=.16, y=4.3, z=z))
frame += [part('box', 'steel', w=.16, h=.16, d=4.8, x=x, y=4.3) for x in [-4, 0, 4]]
define('building_frame', '공사 중인 골조', 'infrastructure', frame, 4.5, 6)

define('power_facility', '발전 시설 상징 모형', 'infrastructure', [
    part('box', 'base', 'base', w=11, h=.3, d=7, y=.15),
    part('box', 'body', w=9.5, h=3.3, d=5.8, y=1.95),
    part('gable', 'steel', 'roof', w=10.2, h=.8, d=6.4, y=3.6),
    part('box', 'deepWater', w=1.1, h=.65, d=.04, y=2.7, z=2.94, rep={'n':5,'dx':1.6}),
    part('box', 'iron', w=1.8, h=2.1, d=.05, y=1.35, z=2.95),
    part('box', 'steel', w=.15, h=3, d=.15, x=6, y=1.5, z=-1, rep={'n':3,'dz':1}),
    part('box', 'steel', w=.15, h=.15, d=3.4, x=6, y=2.8),
], 4.5, 7)

path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
