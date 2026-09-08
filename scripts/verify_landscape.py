"""Compare scenery grounding with actual terrain raycasts and inspect woods/paths."""
import argparse,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--base',required=True);p.add_argument('--browser',required=True);p.add_argument('--out',type=Path,required=True)
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True);report={'base':a.base,'checks':[],'errors':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=a.browser);page=b.new_page(viewport={'width':1920,'height':1080});page.set_default_timeout(120000)
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 def check(name,ok,detail=None):
  row={'name':name,'pass':bool(ok),'detail':detail};report['checks'].append(row);print(json.dumps(row),flush=True);assert ok,row
 try:
  start=time.monotonic();page.goto(a.base,wait_until='domcontentloaded');page.locator('#enter').click()
  page.wait_for_function('window.__sigong?.chronicleScene.assets?.scenery.stats.ready&&!window.__sigong.chronicleScene.chronicle.loading')
  report['readySeconds']=round(time.monotonic()-start,3)
  result=page.evaluate('''async()=>{
    const T=await import('three'),{world:w,chronicleScene:c}=window.__sigong,s=c.assets.scenery,mesh=w.land.getObjectByName('peninsula-surface');mesh.updateWorldMatrix(true,false);
    const samples=s.cells.flatMap(c=>c.models?.map(p=>[p.x,p.z])||[[c.site.x,c.site.z]]);
    for(const p of c.assets.forestPositions.filter((p,i)=>i%53===0))samples.push([p.x,p.z]);
    for(const {a,b} of w.ridgeSegments)for(const d of [-5,0,5])samples.push([(a[0]+b[0])/2+d,(a[1]+b[1])/2]);
    for(const island of w.islandRings)samples.push(w.toWorld(island.island.lon,island.island.lat));
    const pos=mesh.geometry.attributes.position;
    for(let i=0;i<pos.count;i+=Math.max(3,Math.floor(pos.count/900)*3))samples.push([(pos.getX(i)+pos.getX(i+1)+pos.getX(i+2))/3,(pos.getZ(i)+pos.getZ(i+1)+pos.getZ(i+2))/3]);
    const ray=new T.Raycaster(),errors=[];let hits=0,misses=0,maxError=0;
    for(const [x,z] of samples){ray.set(new T.Vector3(x,200,z),new T.Vector3(0,-1,0));const hit=ray.intersectObject(mesh,false)[0];if(!hit){misses++;continue;}hits++;const delta=Math.abs(hit.point.y-w.surfaceAt(x,z));maxError=Math.max(maxError,delta);if(delta>.001)errors.push({x,z,delta});}
    const routes=s.paths.routes.filter(r=>r.active),positions=c.assets.forestPositions;
    return {terrain:{samples:samples.length,hits,misses,maxError,errors},trees:positions.length,routes:routes.length,roadVertices:s.paths.mesh.geometry.attributes.position?.count||0,
      roadsOnLand:routes.every(r=>r.points.every(p=>w.contains(p.x,p.z,1))),roadsOutsideHistory:routes.every(r=>r.points.every(p=>s.occupied.every(o=>Math.hypot(p.x-o.x,p.z-o.z)>o.radius+1))),
      treesOutsidePaths:positions.every(p=>!s.nearPath(p.x,p.z,.65)),forestMeshes:c.assets.forest.children.map(o=>({instanced:o.isInstancedMesh,count:o.count})),
      sceneryShadows:s.cells.every(cell=>{let ok=true;cell.group.traverse(o=>{if(o.isMesh&&o.material.visible&&!o.userData.fanGround&&!o.castShadow)ok=false;});return ok;}),
      ridges:w.geography.data.ridges.length,islands:w.geography.data.islands.map(i=>i.label)};
  }''')
  report['landscape']=result
  check('Rendered terrain raycasts agree with small scenery heights',result['terrain']['hits']>300 and result['terrain']['maxError']<.001,result['terrain'])
  check('Woods remain instanced with a bounded tree count',4000<result['trees']<21000 and all(m['instanced'] for m in result['forestMeshes']),{'trees':result['trees'],'meshes':len(result['forestMeshes'])})
  check('Footpaths join villages on land outside active historical scenes',result['routes']>=10 and result['roadsOnLand'] and result['roadsOutsideHistory'],{'routes':result['routes'],'vertices':result['roadVertices']})
  check('Forest does not cover the footpath network',result['treesOutsidePaths'])
  check('Buildings and wildlife cast shadows after asynchronous loading',result['sceneryShadows'])
  check('Eight ridges and the offshore islands are retained',result['ridges']==8 and len(result['islands'])>=3,result['islands'])
  page.evaluate('''()=>{const {world:w,engine:e,chronicleScene:c}=window.__sigong,r=c.assets.scenery.paths.routes.find(r=>r.active),p=r.points[Math.floor(r.points.length/2)];e.flyTo(w.center.clone().set(p.x,p.y,p.z),160,400);}''')
  page.wait_for_function('!window.__sigong.engine.fly');page.screenshot(path=str(a.out/'village-path.png'))
  page.evaluate('''()=>{const {world:w,engine:e}=window.__sigong,m=w.geography.markers.find(m=>m.row.label.includes('태백'));e.flyTo(m.position.clone(),250,400);}''')
  page.wait_for_function('!window.__sigong.engine.fly');page.screenshot(path=str(a.out/'mountain-woods.png'))
  page.locator('#mapDisplay summary').click();page.locator('[data-map-display=paths]').uncheck()
  check('The path checkbox hides both local lanes and connecting footpaths',page.evaluate('''()=>{let ok=true;window.__sigong.chronicleScene.assets.scenery.group.traverse(o=>{if(o.name==='scenery-lanes'&&o.visible)ok=false;});return ok;}'''))
  page.locator('[data-map-display=paths]').check();page.locator('#mapDisplay summary').click()
  page.evaluate('window.__sigong.world.frame(window.__sigong.engine)');page.wait_for_function('!window.__sigong.engine.fly');page.screenshot(path=str(a.out/'overview.png'))
  check('The overview retains every visible village as a merged shape',page.evaluate('''()=>window.__sigong.chronicleScene.assets.scenery.cells.filter(c=>c.site.id&&c.group.visible).every(c=>c.overview.visible&&!c.detail.visible&&c.overview.geometry.attributes.position.count>0)'''))
  check('No browser errors',not report['errors'],report['errors'])
 finally:
  (a.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8');b.close()
