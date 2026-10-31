import * as T from '../vendor/three.module.js';
// Merge only rigid, opaque leaf meshes within the same animation node.
// Joint groups, attachment nodes and explicitly animated props remain intact.
export function batchRigidParts(root,{exclude=[]}={}){
 const protectedParts=new Set(exclude);
 const nodes=[];root.traverse(o=>nodes.push(o));let removed=0;
 for(const node of nodes){
  const groups=new Map();
  for(const child of node.children){
   if(!child.isMesh||child.children.length||child.userData.independentPose||child.userData.collider||protectedParts.has(child)||child.name.includes('tapered')||child.material?.uniforms?.sheen?.value>0||!child.visible||Array.isArray(child.material)||child.material.transparent)continue;
   let group=groups.get(child.material);if(!group){group=[];groups.set(child.material,group);}group.push(child);
  }
  for(const [material,parts] of groups){
   if(parts.length<2)continue;
   const attributes={position:[],normal:[],uv:[],color:[]};
   for(const part of parts){
    part.updateMatrix();const g=part.geometry.index?part.geometry.toNonIndexed():part.geometry.clone();g.applyMatrix4(part.matrix);
    // PSX lighting historically uses mat3(modelMatrix), while native gear uses
    // the inverse-transpose. Preserve each pass's authored normal convention.
    if(material.uniforms?.affine){const original=part.geometry.attributes.normal,a=g.attributes.normal,normal=new T.Matrix3().setFromMatrix4(part.matrix),v=new T.Vector3();for(let i=0;i<a.count;i++){const source=part.geometry.index?part.geometry.index.getX(i):i;v.fromBufferAttribute(original,source).applyMatrix3(normal).normalize();a.setXYZ(i,v.x,v.y,v.z);}}
    const count=g.attributes.position.count;
    for(const [name,out]of Object.entries(attributes)){const size=name==='uv'?2:3,a=g.attributes[name];for(let i=0;i<count;i++)for(let j=0;j<size;j++)out.push(a?a.array[i*a.itemSize+j]:name==='color'?1:0);}
    g.dispose();node.remove(part);
   }
   const g=new T.BufferGeometry();for(const [name,array]of Object.entries(attributes))g.setAttribute(name,new T.Float32BufferAttribute(array,name==='uv'?2:3));g.computeBoundingSphere();
   const mesh=new T.Mesh(g,material);mesh.name='rigid-parts-batch';node.add(mesh);removed+=parts.length-1;
   // Source geometry has not been uploaded yet. Let shared CPU sources be
   // collected naturally; disposing one could invalidate another attachment.
  }
 }
 return removed;
}
