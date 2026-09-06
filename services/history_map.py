"""Serve published historical geometry with source, year and authorship filters."""
from functools import lru_cache
import gzip
import json


CATALOGS={0:'cliopatria-korea-v013',1:'hgis-provinces-1910-1945',2:'hgis-districts-1910-1945',3:'hgis-townships-1883-1945'}


@lru_cache(maxsize=4)
def _catalog(path,mtime,size):
    with gzip.open(path,'rt',encoding='utf-8') as stream:return json.load(stream)


def historical_features(data,sources=None,origin='all',year=None,level=1):
    if origin not in ('all','human','ai'):raise ValueError('origin must be all, human or ai')
    level=int(level)
    if level not in CATALOGS:raise ValueError('level must be 0 (polity), 1 (province), 2 (district) or 3 (township)')
    year=None if year is None else int(year)
    out={'type':'FeatureCollection','features':[],'level':level,'periodRule':'overlaps-selected-year'}
    if sources is not None and not sources:return out
    path=data/f'maps/{CATALOGS[level]}.geojson.gz'
    if not path.exists():return out
    stat=path.stat();catalog=_catalog(path,stat.st_mtime_ns,stat.st_size)
    for feature in catalog['features']:
        p=feature['properties']
        if sources is not None and p['fromSource'] not in sources:continue
        if origin!='all' and p['origin']!=origin:continue
        if year is not None and not p['validFrom']<=year<=p['validTo']:continue
        out['features'].append(feature)
    return out
