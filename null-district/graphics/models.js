import * as THREE from '../vendor/three.module.js';

// Eight-sided cross-sections create actual chamfered silhouettes, not cube props.
export function loft(sections, axis='y') {
 const vertices=[],uvs=[],colors=[];const ring=(s)=>{const [level,w,d,c=.2]=s;return [[-w/2+c*w,-d/2],[w/2-c*w,-d/2],[w/2,-d/2+c*d],[w/2,d/2-c*d],[w/2-c*w,d/2],[-w/2+c*w,d/2],[-w/2,d/2-c*d],[-w/2,-d/2+c*d]].map(([x,z])=>axis==='y'?[x,level,z]:[x,z,level])};
 const rings=sections.map(ring);
 const triangle=(a,b,c,ta,tb,tc,shade)=>{if(axis==='z'){[b,c]=[c,b];[tb,tc]=[tc,tb]}for(const [p,t]of [[a,ta],[b,tb],[c,tc]]){vertices.push(...p);uvs.push(...t);colors.push(shade,shade,shade)}};
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<8;i++){const a=rings[j][i],b=rings[j][(i+1)%8],c=rings[j+1][(i+1)%8],d=rings[j+1][i],shade=[.85,.95,.72,.92,1,.86,.68,.82][i];triangle(a,c,b,[0,0],[1,1],[1,0],shade);triangle(a,d,c,[0,0],[0,1],[1,1],shade)}
 for(const [j,flip]of [[0,false],[rings.length-1,true]])for(let i=1;i<7;i++){const r=rings[j];const a=r[0],b=r[i],c=r[i+1];triangle(a,flip?c:b,flip?b:c,[0,0],[1,0],[.5,1],.85)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();
 // Explicit two-sided retro meshes keep every authored cap visible.
 return g;
}
export function mesh(parent,geometry,material,x=0,y=0,z=0,scale){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);if(scale)m.scale.set(...scale);parent.add(m);return m}
export function plate(parent,material,w,h,d,x,y,z){return mesh(parent,loft([[-h/2,w,d],[h/2,w,d]]),material,x,y,z)}
export function cylinder(parent,material,radius,height,sides,x,y,z){return mesh(parent,new THREE.CylinderGeometry(radius,radius,height,sides,1),material,x,y,z)}
export function makeGuard(m) {
 const g=new THREE.Group();g.name='faceted-corporate-enforcer';
 mesh(g,loft([[.72,.45,.35],[1.12,.67,.4],[1.48,.78,.4],[1.57,.42,.3]]),m.coat);
 plate(g,m.rust,.57,.26,.18,0,1.31,.23);plate(g,m.hazard,.4,.12,.05,0,1.35,.34);
 mesh(g,loft([[1.53,.35,.34],[1.78,.52,.47],[1.97,.36,.36]]),m.metal);
 plate(g,m.black,.46,.17,.12,0,1.77,.24);plate(g,m.red,.38,.065,.04,0,1.79,.315);
 mesh(g,loft([[1.52,.2,.13],[1.66,.28,.2]]),m.skin,0,0,.18);
 // Collar, respirator and an offset antenna break up the silhouette.
 plate(g,m.dark,.42,.12,.36,0,1.52,0);plate(g,m.black,.17,.12,.12,0,1.57,.32);
 cylinder(g,m.rust,.025,.36,4,.24,2,0);
 for(const side of [-1,1]){
  const shoulder=mesh(g,loft([[0,.24,.35],[.17,.4,.43],[.33,.27,.32]]),side===-1?m.hazard:m.rust,side*.47,1.25,0);shoulder.rotation.z=side*.22;
  const arm=plate(g,m.coat,.21,.5,.22,side*.48,1.02,.04);arm.rotation.x=-.25;
  plate(g,m.black,.22,.15,.25,side*.5,.77,.12);
 }
 const legs=[];for(const side of [-1,1]){const leg=new THREE.Group();g.add(leg);leg.position.set(side*.2,.83,0);mesh(leg,loft([[-.67,.18,.21],[-.33,.23,.24],[0,.25,.29]]),m.coat);plate(leg,m.metal,.25,.25,.25,0,-.38,.04);plate(leg,m.black,.27,.17,.43,0,-.74,.08);legs.push(leg)}
 const weapon=mesh(g,loft([[-.3,.16,.17],[.3,.2,.2],[.5,.1,.1]],'z'),m.rust,.49,.9,.37);weapon.rotation.x=.05;
 cylinder(g,m.black,.055,.28,6,.49,.92,.96).rotation.x=Math.PI/2;
 g.userData.asset={name:'SABLE patrolman',triangles:countTriangles(g)};return {g,legs};
}
export function makeCarbine(m) {
 const g=new THREE.Group();g.name='K09-angular-carbine';
 mesh(g,loft([[-.95,.12,.12],[-.82,.29,.23],[-.4,.27,.27],[-.26,.19,.18]],'z'),m.rust,.28,-.3,0);
 plate(g,m.metal,.12,.12,.42,.28,-.24,-.7);plate(g,m.hazard,.23,.085,.29,.28,-.18,-.56);
 plate(g,m.black,.06,.11,.075,.28,-.115,-.54);plate(g,m.red,.035,.025,.02,.28,-.06,-.5);
 const barrel=cylinder(g,m.metal,.068,.32,6,.28,-.3,-1.04);barrel.rotation.x=Math.PI/2;
 const muzzle=cylinder(g,m.black,.086,.11,6,.28,-.3,-1.23);muzzle.rotation.x=Math.PI/2;
 const grip=plate(g,m.coat,.12,.3,.15,.3,-.48,-.37);grip.rotation.x=-.25;
 const mag=plate(g,m.dark,.13,.23,.22,.28,-.49,-.63);mag.rotation.x=.2;
 mesh(g,loft([[-.65,.15,.17],[-.45,.22,.22]],'z'),m.skin,.31,-.51,.28);
 const sleeve=plate(g,m.coat,.22,.21,.37,.43,-.59,-.16);sleeve.rotation.z=-.25;
 plate(g,m.metal,.24,.09,.22,.34,-.54,-.23);
 // A second forearm supports the barrel, visibly modeled rather than a gun box.
 const support=mesh(g,loft([[-.65,.15,.17],[-.3,.2,.2]],'z'),m.coat,.14,-.46,-.14);support.rotation.y=-.36;
 g.userData.asset={name:'K09 bevelled carbine',triangles:countTriangles(g)};return g;
}
export function makeCrate(m,w=2,h=1.4,d=2){const g=new THREE.Group();mesh(g,loft([[0,w*.88,d*.9],[.2,w,d],[h-.2,w,d],[h,w*.88,d*.9]]),m.rust);plate(g,m.hazard,w*.8,.28,.04,0,h*.62,d/2+.025);for(const s of [-1,1])plate(g,m.metal,.15,h*.8,d*.88,s*w*.36,h/2,0);return g}
export function countTriangles(group){let n=0;group.traverse(o=>{if(o.isMesh)n+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3});return n}

// Merge static painted meshes by material. Colliders and animated rigs remain
// separate, so batching cannot invalidate raycasts or gameplay transforms.
export function batchStatic(root) {
 root.updateMatrixWorld(true);const batches=new Map();
 for(const child of [...root.children])if(child.isMesh&&!child.userData.collider){const g=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone();g.applyMatrix4(child.matrixWorld);const key=child.material;let b=batches.get(key);if(!b){b={position:[],normal:[],uv:[],color:[]};batches.set(key,b)}const n=g.attributes.position.count;for(let i=0;i<n;i++){b.position.push(g.attributes.position.getX(i),g.attributes.position.getY(i),g.attributes.position.getZ(i));b.normal.push(g.attributes.normal?.getX(i)||0,g.attributes.normal?.getY(i)??1,g.attributes.normal?.getZ(i)||0);b.uv.push(g.attributes.uv?.getX(i)||0,g.attributes.uv?.getY(i)||0);b.color.push(g.attributes.color?.getX(i)??1,g.attributes.color?.getY(i)??1,g.attributes.color?.getZ(i)??1)}g.dispose();root.remove(child)}
 for(const [material,b]of batches){const g=new THREE.BufferGeometry();for(const [key,array]of Object.entries(b))g.setAttribute(key,new THREE.Float32BufferAttribute(array,key==='uv'?2:3));g.computeBoundingSphere();const object=new THREE.Mesh(g,material);object.name='batched-painted-district';root.add(object)}
}
