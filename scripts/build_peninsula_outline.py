"""Dissolve stored HGIS provinces into the fixed 3D map coastline."""
import gzip,json
from hashlib import sha256
from pathlib import Path
from shapely.geometry import shape,mapping
from shapely import make_valid,union_all

root=Path(__file__).resolve().parents[1]
source=root/'data/maps/hgis-provinces-1910-1945.geojson.gz'
features=json.load(gzip.open(source))['features']
selected=[f for f in features if f['properties']['validFrom']<=1940<=f['properties']['validTo']]
geography=union_all([make_valid(shape(f['geometry'])) for f in selected])
# Stored province lines were simplified separately; close their tiny internal seams.
geography=geography.buffer(.0005).buffer(-.0005).simplify(.0005,preserve_topology=True)
polygons=[p for p in getattr(geography,'geoms',[geography]) if p.geom_type=='Polygon' and p.area>.0005]
from shapely.geometry import MultiPolygon
outline={'type':'Feature','geometry':mapping(MultiPolygon(polygons)),
         'properties':{'purpose':'Fixed geographical canvas, not the selected year’s borders.',
          'source':'data/maps/hgis-provinces-1910-1945.geojson.gz','sha256':sha256(source.read_bytes()).hexdigest(),
          'url':'https://hgis.history.go.kr/pro_g1/dataset.do','referenceYear':1940,
          'simplificationDegrees':.0005,'seamClosingDegrees':.0005,'provinceFeatures':[f['id'] for f in selected]}}
(root/'services/host/app/korea-outline.json').write_text(json.dumps(outline,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
print(json.dumps({'provinces':len(selected),'polygons':len(polygons),'vertices':sum(len(p.exterior.coords) for p in polygons)}))
