"""Render the actual period figure blueprints in headless Chrome (no history API fixtures)."""
import argparse
import json
import mimetypes
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--browser',default=r'C:\Program Files\Google\Chrome\Application\chrome.exe')
p.add_argument('--out',type=Path,required=True)
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
root=Path(__file__).resolve().parents[1]/'services/host'
html='''<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#d9ded8;font:15px sans-serif}canvas{display:block}.labels{position:absolute;inset:0;display:grid;grid-template-columns:repeat(6,1fr);pointer-events:none}.labels div{padding:8px;text-align:center}</style><script type="importmap">{"imports":{"three":"/vendor/three.module.min.js"}}</script><div class="labels"></div><script type="module">
import * as THREE from 'three';
import {Assembly,bakePart} from '/app/landmarks.js';
import {buildFromBlueprint} from '/app/assetblueprint.js';
import {extendFigureCatalog,figureRoles,figureEras,figureArchetype} from '/app/period-figures.js';
const raw=await fetch('/app/history-asset-catalog.json').then(r=>r.json()),catalog=extendFigureCatalog(raw),height=figureEras.length*240,renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1440,height);renderer.setClearColor('#d9ded8');document.body.append(renderer.domElement);renderer.setScissorTest(true);document.querySelector('.labels').style.gridTemplateRows=`repeat(${figureEras.length},1fr)`;window.results=[];
for(let r=0;r<figureEras.length;r++)for(let c=0;c<figureRoles.length;c++){
 const era=figureEras[r],role=figureRoles[c],id=figureArchetype(role,Math.max(era.from,-1000)),bp=catalog.blueprints[id],b=new Assembly(()=>.5,'A');buildFromBlueprint(b,1,bp,{category:'humanoids',form:'civilian',seed:id});
 const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x666666,2));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(-3,6,8);scene.add(sun);
 for(const part of b.parts){const geometry=bakePart(part);scene.add(new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({vertexColors:true})));}
 const camera=new THREE.PerspectiveCamera(35,1,.01,100);camera.position.set(3.6,2.7,6.5);camera.lookAt(0,1.4,0);renderer.setViewport(c*240,height-(r+1)*240,240,240);renderer.setScissor(c*240,height-(r+1)*240,240,240);renderer.render(scene,camera);
 const label=document.createElement('div');label.textContent=era.label+' · '+role;document.querySelector('.labels').append(label);window.results.push({id,parts:b.parts.length,vertices:b.parts.reduce((n,p)=>n+p.geo.attributes.position.count,0)});
}window.previewHeight=height;window.ready=true;
</script>'''
report={'scope':'Actual blueprint assembly and WebGL preview; not full scene integration','errors':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=a.browser)
 page=b.new_page(viewport={'width':1440,'height':1200})
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 def serve(route,request):
  path=urlparse(request.url).path
  if path=='/':route.fulfill(content_type='text/html',body=html);return
  file=root/path.lstrip('/')
  if file.is_file():route.fulfill(content_type='application/javascript' if path.endswith('.js') else mimetypes.guess_type(file)[0] or 'application/octet-stream',body=file.read_bytes())
  else:route.fulfill(status=404)
 page.route('http://figure-preview.test/**',serve)
 page.goto('http://figure-preview.test/',wait_until='domcontentloaded')
 page.wait_for_function('window.ready',timeout=60000)
 page.set_viewport_size({'width':1440,'height':page.evaluate('window.previewHeight')})
 report['figures']=page.evaluate('window.results')
 page.screenshot(path=str(a.out/'figures.png'),full_page=True)
 b.close()
(a.out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
assert not report['errors'],report['errors']
assert all(f['parts']>10 and f['vertices']>100 for f in report['figures'])
print('PASS:',len(report['figures']),'assembled figures rendered; screenshot:',a.out/'figures.png')
