"""Serve published historical geometry with source, year and authorship filters."""
from functools import lru_cache
import gzip
import json


@lru_cache(maxsize=1)
def _catalog(path,mtime,size):
    with gzip.open(path,'rt',encoding='utf-8') as stream:return json.load(stream)


def historical_features(data,sources=None,origin='all',year=None):
    if origin not in ('all','human','ai'):raise ValueError('origin must be all, human or ai')
    year=None if year is None else int(year)
    out={'type':'FeatureCollection','features':[],'periodRule':'overlaps-selected-year'}
    if sources is not None and not sources:return out
    path=data/'maps/hgis-provinces-1910-1945.geojson.gz'
    if not path.exists():return out
    stat=path.stat();catalog=_catalog(path,stat.st_mtime_ns,stat.st_size)
    for feature in catalog['features']:
        p=feature['properties']
        if sources is not None and p['fromSource'] not in sources:continue
        if origin!='all' and p['origin']!=origin:continue
        if year is not None and not p['validFrom']<=year<=p['validTo']:continue
        out['features'].append(feature)
    return out
