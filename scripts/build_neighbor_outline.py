"""Tile stored Natural Earth land around the detailed Korean coastline."""
import json
from hashlib import sha256
from pathlib import Path
from shapely import make_valid,union_all
from shapely.geometry import shape,mapping,box

root=Path(__file__).resolve().parents[1]
source=root/'data/geo/east-asia.geojson'
korea_file=root/'services/host/app/korea-outline.json'
data=json.loads(source.read_text(encoding='utf8'))
bounds=[115,25,146,49]
land=union_all([make_valid(shape(f['geometry'])) for f in data['features'] if f['properties'].get('kind')=='land']).intersection(box(*bounds))
korea=shape(json.loads(korea_file.read_text(encoding='utf8'))['geometry'])
# Replace the coarse Korean coast, retaining inland connections at its northern edge.
# The narrow transition is display geometry, never a historical border claim.
transition=.15
neighbors=make_valid(land.difference(korea.buffer(transition)).union(
    land.buffer(-transition).intersection(korea.buffer(transition))).difference(korea))
# The transition must not erase the stored mainland at the Tumen estuary.
tumen_bounds=[130.5,42.2,131,42.6]
neighbors=make_valid(neighbors.union(land.intersection(box(*tumen_bounds)).difference(korea)))
features=[]
for west in range(bounds[0],bounds[2],4):
    for south in range(bounds[1],bounds[3],4):
        tile=neighbors.intersection(box(west,south,min(west+4,bounds[2]),min(south+4,bounds[3])))
        polygons=[p for p in getattr(tile,'geoms',[tile]) if p.geom_type=='Polygon' and p.area>.00001]
        for i,polygon in enumerate(polygons):
            features.append({'type':'Feature','id':f'land-{west}-{south}-{i}','properties':{'kind':'land'},'geometry':mapping(polygon)})
output={'type':'FeatureCollection','properties':{'bounds':bounds,'coordinateSystem':'WGS84',
    'purpose':'Physical neighboring land, not historical political borders. Korea retains its detailed outline.',
    'source':str(source.relative_to(root)).replace('\\','/'),'sha256':sha256(source.read_bytes()).hexdigest(),
    'sourceAttribution':'Natural Earth (stored repository coastline; README.md)',
    'koreaSha256':sha256(korea_file.read_bytes()).hexdigest(),'tileDegrees':4,'coastTransitionDegrees':transition,
    'restoredStoredLandBounds':tumen_bounds},'features':features}
(root/'services/host/app/neighbor-outline.json').write_text(json.dumps(output,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
print(json.dumps({'tiles':len(features),'bounds':bounds,'areaDegrees2':neighbors.area}))
