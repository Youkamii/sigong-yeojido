const variants=new WeakMap(),originals=new WeakMap(),meshStates=new WeakMap();
const sceneryMaterials=new Map();

export const isEstimatedSite=site=>site?.estimated===true&&site.documented!==true&&site.kind!=='urban';

export function inEstimatedSite(x,z,sites){
  const inside=site=>Math.hypot(x-site.x,z-site.z)<=site.radius;
  return !sites.some(site=>(site.documented===true||site.kind==='urban')&&inside(site))
    &&sites.some(site=>isEstimatedSite(site)&&inside(site));
}

// Scenery factories use the same family presets, without per-scene time uniforms.
export function sharedSceneryMaterial(material){
  const patch=material.userData.fanPatch;
  if(!patch)return material;
  const key=material.type+'|'+material.customProgramCacheKey();
  if(!sceneryMaterials.has(key)){material.userData.sceneryShared=true;sceneryMaterials.set(key,material);}
  const shared=sceneryMaterials.get(key);
  if(shared!==material)material.dispose();
  return shared;
}

// Transform the combined material, vertex and instance color once, before lighting.
export function dimmedMaterialFor(material,on,opaque=false){
  const base=originals.get(material)||material;
  if(!on||base.visible===false)return base;
  let cached=variants.get(base);
  if(!cached){
    cached=new Map();variants.set(base,cached);
    base.addEventListener('dispose',()=>{for(const dim of cached.values())dim.dispose();cached.clear();});
  }
  if(!cached.has(opaque)){
    const dim=base.clone(),compile=base.onBeforeCompile,key=base.customProgramCacheKey();
    dim.opacity=opaque?1:.55;dim.transparent=!opaque;dim.depthWrite=opaque;dim.forceSinglePass=true;
    dim.onBeforeCompile=function(shader,renderer){
      compile.call(this,shader,renderer);
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        float estimatedGray = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
        diffuseColor.rgb = mix(mix(diffuseColor.rgb, vec3(estimatedGray), 0.45), vec3(1.0), 0.08);
      `);
    };
    dim.customProgramCacheKey=()=>key+'|estimated-dim-v1';
    originals.set(dim,base);cached.set(opaque,dim);
  }
  return cached.get(opaque);
}

export function setEstimatedMesh(mesh,on){
  if(!mesh.isMesh)return;
  let state=meshStates.get(mesh);
  if(!state){state={material:mesh.material,castShadow:mesh.castShadow};meshStates.set(mesh,state);}
  const dim=!!on&&mesh.userData.estimatedBackground===true;
  const material=m=>dimmedMaterialFor(m,dim,mesh.userData.estimatedOpaque===true);
  mesh.material=Array.isArray(state.material)?state.material.map(material):material(state.material);
  mesh.castShadow=dim?false:state.castShadow;
}

export function markEstimatedGroup(group,estimated,on){
  if(!group.userData.sceneryMaterialsShared){
    const shared=new Map();
    group.traverse(mesh=>{if(mesh.isMesh){
      const material=m=>{if(!shared.has(m))shared.set(m,sharedSceneryMaterial(m));return shared.get(m);};
      mesh.material=Array.isArray(mesh.material)?mesh.material.map(material):material(mesh.material);
    }});
    group.userData.sceneryMaterialsShared=true;
  }
  group.traverse(mesh=>{if(mesh.isMesh){mesh.userData.estimatedBackground=estimated;setEstimatedMesh(mesh,on);}});
}

export function originalEstimatedMaterial(material){return originals.get(material)||material;}
