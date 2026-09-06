"""Shared place catalog for the viewer and RDF builder (#49)."""
import json
import logging
from pathlib import Path


def place_names(p: dict) -> list[str]:
    names = [p.get("label")] + list(p.get("aliases") or [])
    return [n for n in names if isinstance(n, str) and n]



def load_places(data_dir: Path) -> dict:
    """data/places.json(손질한 것) + data/places-candidates.json(#11 조사, 후보마다 validFrom/validTo).

    같은 id·이름은 후보를 합친다. 이름이 다르면 조사본에 파일명 접미사를 붙여 별개로 보존한다.
    notAPlace 항목은 뺀다. variantOf 항목(이체자·이표기)은 원 항목의 aliases 로 접는다.
    """
    pj = data_dir / "places.json"
    base = json.loads(pj.read_text(encoding="utf-8")) if pj.exists() else {"places": []}
    places: list[dict] = list(base.get("places", []))
    by_id = {pl["id"]: pl for pl in places}
    extra: list[dict] = []
    for cj in sorted(data_dir.glob("places-candidates*.json")):   # #11 1라운드 + 사료별 2라운드 파일들
        cand = json.loads(cj.read_text(encoding="utf-8"))
        extra += [dict(pl, _from=cj.name) for pl in cand.get("places", []) if not pl.get("notAPlace")]
    if extra:
        renamed = {}
        used_ids = set(by_id) | {pl["id"] for pl in extra}
        labels = {key: pl.get("label") for key, pl in by_id.items()}
        known_names = {key: set(place_names(pl)) for key, pl in by_id.items()}
        for pl in extra:
            if pl.get("variantOf"):
                continue
            old_id = pl["id"]
            if old_id in known_names and not known_names[old_id].intersection(place_names(pl)):
                new_id = f"{old_id}-{Path(pl['_from']).stem}"
                suffix = 2
                while new_id in used_ids:
                    new_id = f"{old_id}-{Path(pl['_from']).stem}-{suffix}"
                    suffix += 1
                logging.warning("place id collision: %s (%s / %s); keeping %s as %s",
                                old_id, labels[old_id], pl.get("label"), pl["_from"], new_id)
                renamed[(pl["_from"], old_id)] = new_id
                pl["id"] = new_id
                used_ids.add(new_id)
            labels[pl["id"]] = pl.get("label")
            known_names.setdefault(pl["id"], set()).update(place_names(pl))
        for pl in extra:
            if pl.get("variantOf"):
                pl["variantOf"] = renamed.get((pl["_from"], pl["variantOf"]), pl["variantOf"])
            if pl.get("relatedTo"):
                pl["relatedTo"] = [renamed.get((pl["_from"], pid), pid) for pid in pl["relatedTo"]]
        variants = [pl for pl in extra if pl.get("variantOf")]
        for pl in extra:
            if pl.get("variantOf"):
                continue
            if pl["id"] in by_id:
                target = by_id[pl["id"]]
                for candidate in pl.get("candidates", []):
                    if candidate not in target.setdefault("candidates", []):
                        recorded = dict(candidate, origin="ai", **{"from": pl["_from"]})
                        if recorded not in target["candidates"]:
                            target["candidates"].append(recorded)
                for name in pl.get("aliases", []):
                    if name != target.get("label") and name not in target.setdefault("aliases", []):
                        target["aliases"].append(name)
                continue
            rec = {k: pl[k] for k in ("id", "label", "labelKo", "kind", "status", "candidates", "note", "confidence", "count", "indexType", "relatedTo", "references", "validFrom", "validTo", "sourceId", "evidence") if k in pl}
            rec["origin"] = "ai"          # 조사 에이전트가 모아 검증자가 대조한 것 — 사람이 확인한 연결 아님
            rec["from"] = pl.get("_from")
            rec["aliases"] = list(pl.get("aliases") or [])
            places.append(rec)
            by_id[rec["id"]] = rec
        for v in variants:
            tgt = by_id.get(v["variantOf"])
            if tgt is not None:
                al = tgt.setdefault("aliases", [])
                for name in [v.get("label")] + list(v.get("aliases") or []):
                    if name and name != tgt.get("label") and name not in al:
                        al.append(name)
                # 이표기 항목이 제 좌표 후보를 따로 들고 있어도 원 항목의 후보로 합치지 않는다 — 같은 자리라는 판정은 Claim 몫
    out = dict(base)
    out["places"] = places
    for place in places:
        for index,candidate in enumerate(place.get('candidates') or [],1):
            candidate.setdefault('id',f"loc-{place['id']}-{index}")
            for key in ('validFrom','validTo','origin'):
                if key in place:candidate.setdefault(key,place[key])
            if place.get('sourceId'):candidate.setdefault('sourceId',place['sourceId'])
            candidate.setdefault('grounded',False)
    return out


def with_locations(data, claims, entities):
    """Materialize cited points and explicitly marked region representative points."""
    claims=[claim for claim in claims if isinstance(claim,dict)
            and all(isinstance(claim.get(key),str) for key in ('id','subject','predicate','fromSource','origin','status','citesChunk','quote'))
            and isinstance(claim.get('object'),dict)]
    shells={entity['id']:entity for entity in entities}
    by_id={place['id']:place for place in data['places']}
    located={}
    def ensure(eid):
        if eid not in by_id and shells.get(eid,{}).get('type')=='Place':
            shell=shells[eid]
            by_id[eid]={'id':eid,'label':shell.get('labelHanja') or shell.get('label') or eid,
                        'labelKo':shell.get('label'),'candidates':[],'aliases':[],'kind':'place','status':'disputed'}
            data['places'].append(by_id[eid])
        return by_id.get(eid)
    for claim in sorted(claims,key=lambda c:c['id']):
        obj=claim.get('object',{})
        if claim.get('predicate')!='syj:locatedAt' or obj.get('kind')!='location':continue
        place=ensure(claim['subject'])
        if place is None:continue
        candidate={**obj,'id':'loc-'+claim['id'],'claimId':claim['id'],'grounded':True,
                   'fromSource':claim['fromSource'],'origin':claim['origin'],'status':claim['status'],
                   'citesChunk':claim['citesChunk'],'quote':claim['quote'],
                   'validFrom':claim.get('validFrom'),'validTo':claim.get('validTo'),
                   'basis':obj.get('basis') or claim.get('note') or claim['quote']}
        place['candidates'].append(candidate)
        located.setdefault(claim['subject'],[]).append((claim,candidate))
    for claim in sorted(claims,key=lambda c:c['id']):
        obj=claim.get('object',{})
        relation=claim.get('predicate')
        if relation not in ('syj:locatedIn','syj:northOf','syj:southeastOf') or obj.get('kind')!='entity':continue
        place=ensure(claim['subject'])
        if place is None:continue
        for coordinate,candidate in located.get(obj['id'],[]):
            if 'representative' not in candidate.get('precision',''):continue
            region=shells.get(obj['id'],{}).get('label',obj['id'])
            direction={'syj:northOf':'북쪽','syj:southeastOf':'동남쪽'}.get(relation)
            basis=(f'{region}의 {direction}이라는 주장. 점은 방향을 읽는 기준 지역의 현대 대표점이며, 역사 지점의 위치가 아니다. '
                   if direction else f'{region} 범위의 현대 대표점. 유적의 정확한 위치가 아니다. ')
            place['candidates'].append({**candidate,'id':f"loc-{claim['id']}-{coordinate['id']}",
                'claimId':claim['id'],'coordinateClaimId':coordinate['id'],'grounded':False,'derived':True,
                'coordinateChunkId':coordinate['citesChunk'],
                'origin':'ai','fromSource':claim['fromSource'],
                'requiredSources':sorted({claim['fromSource'],coordinate['fromSource']}),
                'validFrom':claim.get('validFrom'),'validTo':claim.get('validTo'),
                'citesChunk':claim['citesChunk'],'quote':claim['quote'],
                'precision':'direction-reference-point' if direction else 'region-representative-point',
                'basis':basis+claim['quote']})
    return data

