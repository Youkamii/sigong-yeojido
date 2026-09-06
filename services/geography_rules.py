"""Check explicitly cited travel-time bounds; never invent a historical speed."""
from datetime import datetime,timezone
import math

PRESENCE='syj:physicallyPresentAt'
TRAVEL='syj:minimumTravelHours'


def number(value):
    try:return isinstance(value,(int,float)) and not isinstance(value,bool) and math.isfinite(value)
    except OverflowError:return False


def presence(claim):
    obj=claim['object'];window=obj.get('presence')
    if obj.get('kind')!='location':raise ValueError('physical presence requires a location object')
    if window is None:return None
    if not isinstance(window,dict):raise ValueError('presence must be an object')
    if any(window.get(key) is None for key in ('earliest','latest','radiusKm')):return None
    radius=window['radiusKm']
    if not number(radius) or radius<0:raise ValueError('radiusKm must be a finite nonnegative number')
    if not all(number(obj.get(key)) for key in ('lat','lon')) or not -90<=obj['lat']<=90 or not -180<=obj['lon']<=180:
        raise ValueError('physical presence needs finite WGS84 coordinates in range')
    dates=[]
    for key in ('earliest','latest'):
        value=window[key]
        if not isinstance(value,str) or 'T' not in value:raise ValueError('presence times need explicit date, time and UTC offset')
        try:date=datetime.fromisoformat(value)
        except ValueError:raise ValueError('unsupported presence timestamp') from None
        if date.tzinfo is None:raise ValueError('presence timestamp needs a UTC offset')
        try:dates.append(date.astimezone(timezone.utc))
        except OverflowError:raise ValueError('unsupported presence timestamp') from None
    if dates[0]>dates[1]:raise ValueError('presence time window is reversed')
    return (*dates,radius,obj['lat'],obj['lon'])


def separated(a,b):
    lat1,lat2=map(math.radians,(a[3],b[3]));delta=math.radians(b[4]-a[4])
    angle=2*math.asin(min(1,math.sqrt(math.sin((lat2-lat1)/2)**2+math.cos(lat1)*math.cos(lat2)*math.sin(delta/2)**2)))
    # Below WGS84's minimum curvature radius, giving a conservative distance bound.
    return 6335*angle-a[2]-b[2]>1e-6


def assess(records):
    records=list(records);by_id={c['id']:c for c in records};windows={};checks=[]
    for claim in records:
        if claim['predicate']!=PRESENCE or claim['status']=='deprecated':continue
        try:windows[claim['id']]=presence(claim)
        except ValueError as exc:
            checks.append({'claim':claim['id'],'source':claim['fromSource'],'status':'MALFORMED','reason':str(exc)})
    for claim in records:
        if claim['predicate']!=TRAVEL or claim['status']=='deprecated':continue
        result={'claim':claim['id'],'source':claim['fromSource'],'status':'UNASSESSED'};checks.append(result)
        obj=claim['object'];refs=[obj.get('fromPresence'),obj.get('toPresence')];hours=obj.get('hours')
        if obj.get('kind')!='literal' or not number(hours) or hours<=0 or any(not isinstance(cid,str) or not cid for cid in refs):
            result.update(status='MALFORMED',reason='travel bound needs literal value, positive hours and two presence claim IDs');continue
        if refs[0]==refs[1] or any(cid not in by_id or by_id[cid]['predicate']!=PRESENCE for cid in refs):
            result.update(status='MALFORMED',reason='travel bound references must identify two distinct physical presences');continue
        related=[by_id[cid] for cid in refs]
        if any(c['fromSource']!=claim['fromSource'] or c['subject']!=claim['subject'] for c in related):
            result['reason']='different source or subject';continue
        if any(c['status']=='deprecated' for c in related):result['reason']='deprecated presence';continue
        if obj.get('uncertaintyIncluded') is not True:
            result['reason']='travel-time lower bound does not explicitly cover the position uncertainty';continue
        a,b=(windows.get(cid) for cid in refs)
        if a is None or b is None:result['reason']='missing supported time bounds or position error';continue
        if a[1]>=b[0]:result['reason']='presence windows overlap or are not in the stated order';continue
        if not separated(a,b):result['reason']='position uncertainty regions may overlap';continue
        available=(b[1]-a[0]).total_seconds()/3600
        result.update(status='FAIL' if available<hours else 'PASS',fromPresence=refs[0],toPresence=refs[1],
                      availableHours=available,minimumHours=hours,
                      reason='maximum available time compared with the cited minimum travel time')
    return {'presenceClaims':sum(c['predicate']==PRESENCE for c in records),'travelClaims':sum(c['predicate']==TRAVEL for c in records),
            'assessed':sum(c['status'] in ('PASS','FAIL') for c in checks),'checks':checks}
