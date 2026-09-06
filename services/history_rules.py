"""Internal consistency checks, scoped to one source; unknown dates stay unknown."""
from collections import defaultdict
from geography_rules import assess as assess_geography

CHILD_TO_PARENT={'syj:descendantOf','syj:childOf','syj:hasParent'}
PARENT_TO_CHILD={'syj:parentOf','syj:fatherOf','syj:motherOf'}
TIME_PREDICATES={'syj:bornIn','syj:diedIn','syj:appearsIn','syj:occurredIn','syj:occurredAt','syj:foundedIn','syj:accededIn'}


def bounds(obj):
    if obj.get('kind')=='year':
        year=obj.get('value')
        return (year,year) if isinstance(year,int) and not isinstance(year,bool) and year!=0 else (None,None)
    if obj.get('kind')=='time':
        return obj.get('earliest',obj.get('year')),obj.get('latest',obj.get('year'))
    return None,None


def alternatives(values):
    if not values:return None,None
    return (None if any(lo is None for lo,_ in values) else min(lo for lo,_ in values),
            None if any(hi is None for _,hi in values) else max(hi for _,hi in values))


def cycles(edges):
    """Iterative DFS: report actual back-edge cycles without recursion depth limits."""
    adjacency=defaultdict(list)
    for start,end,claim in edges:adjacency[start].append((end,claim))
    color={};found=set()
    for start in list(adjacency):
        if color.get(start):continue
        color[start]=1
        stack=[(start,iter(adjacency[start]))]
        path_nodes=[start];path_edges=[];positions={start:0}
        while stack:
            node,iterator=stack[-1]
            target,claim=next(iterator,(None,None))
            if target is None:
                color[node]=2;stack.pop();positions.pop(node);path_nodes.pop()
                if path_edges:path_edges.pop()
            elif color.get(target)==1:
                found.add(claim)
                found.update(path_edges[positions[target]:])
            elif not color.get(target):
                color[target]=1;positions[target]=len(path_nodes)
                path_nodes.append(target);path_edges.append(claim)
                stack.append((target,iter(adjacency[target])))
    return found


def check(records):
    """Return (code, claim id, message). Citation/shape validation runs before this."""
    records=list(records);grouped=defaultdict(list)
    for claim in records:grouped[claim['fromSource']].append(claim)
    failures=[]
    for source,claims in grouped.items():
        def fail(code,cid,message):failures.append((code,cid,source+': '+message))
        ancestry=[];ordering=[]
        conversions=defaultdict(list)
        for claim in claims:
            if claim['predicate']=='syj:convertsTo':conversions[claim['subject']].append(bounds(claim['object']))
        timeline=defaultdict(list);life=defaultdict(lambda:defaultdict(list))
        for claim in claims:
            predicate=claim['predicate'];obj=claim['object'];subject=claim['subject'];cid=claim['id']
            if predicate in CHILD_TO_PARENT|PARENT_TO_CHILD|{'syj:before','syj:after'}:
                if obj['kind']!='entity':
                    fail('history-shape',cid,'genealogy and before/after require an entity reference')
                    continue
                target=obj['id']
                if predicate in CHILD_TO_PARENT:ancestry.append((subject,target,cid))
                elif predicate in PARENT_TO_CHILD:ancestry.append((target,subject,cid))
                elif predicate=='syj:before':ordering.append((subject,target,cid))
                else:ordering.append((target,subject,cid))
            if predicate in TIME_PREDICATES:
                if obj['kind'] not in ('time','year'):
                    fail('history-shape',cid,'dated occurrence requires a time or year object')
                    continue
                values=[]
                direct=bounds(obj)
                if direct!=(None,None):values.append(direct)
                if obj['kind']=='time':values+=conversions.get(obj['id'],[])
                dated=alternatives(values)
                timeline[subject].append(dated)
                if obj['kind']=='time':timeline[obj['id']].append(dated)
                if predicate in ('syj:bornIn','syj:diedIn','syj:appearsIn'):
                    life[subject][predicate].append((dated,cid))
        for cid in cycles(ancestry):fail('history-genealogy-cycle',cid,'ancestry forms a cycle inside this source')
        for cid in cycles(ordering):fail('history-order-cycle',cid,'before/after forms a cycle inside this source')
        dates={subject:alternatives(values) for subject,values in timeline.items()}
        for start,end,cid in ordering:
            lo=dates.get(start,(None,None))[0];hi=dates.get(end,(None,None))[1]
            if lo is not None and hi is not None and lo>hi:
                fail('history-order',cid,'the earliest possible earlier event is later than the latest possible later event')
        for subject,dated in life.items():
            birth=alternatives([value for value,_ in dated['syj:bornIn']])
            death=alternatives([value for value,_ in dated['syj:diedIn']])
            if birth[0] is not None and death[1] is not None and birth[0]>death[1]:
                for _,cid in dated['syj:bornIn']:fail('history-life-order',cid,'birth is later than every possible death year')
            for appearance,cid in dated['syj:appearsIn']:
                if appearance[0] is not None and death[1] is not None and appearance[0]>death[1]:
                    fail('history-after-death',cid,'a dated living appearance is after every possible death year')
                if appearance[1] is not None and birth[0] is not None and appearance[1]<birth[0]:
                    fail('history-before-birth',cid,'a dated living appearance is before every possible birth year')
    for result in assess_geography(records)['checks']:
        if result['status']=='FAIL':
            failures.append(('history-geography',result['claim'],result['source']+': '+
                f"{result['availableHours']:g} hours available, but cited travel requires at least {result['minimumHours']:g} hours"))
        elif result['status']=='MALFORMED':
            failures.append(('history-geography-shape',result['claim'],result['source']+': '+result['reason']))
    return sorted(failures)
