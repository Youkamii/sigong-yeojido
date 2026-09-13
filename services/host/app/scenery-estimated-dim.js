const variants=new WeakMap(),originals=new WeakMap();

export const isEstimatedSite=site=>site?.estimated===true;

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
  mesh.userData.castShadowBase??=mesh.castShadow;
  const dim=!!on&&mesh.userData.estimatedBackground===true;
  const material=m=>dimmedMaterialFor(m,dim,mesh.userData.estimatedOpaque===true);
  mesh.material=Array.isArray(mesh.material)?mesh.material.map(material):material(mesh.material);
  mesh.castShadow=dim?false:mesh.userData.castShadowBase;
}

export function markEstimatedGroup(group,estimated,on){
  group.traverse(mesh=>{if(mesh.isMesh){mesh.userData.estimatedBackground=estimated;setEstimatedMesh(mesh,on);}});
}

export function originalEstimatedMaterial(material){return originals.get(material)||material;}
