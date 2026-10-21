import * as THREE from '../vendor/three.module.js';
import { organic, faceGeometry, polygonPrism } from './anatomy.js';

// Eight-sided cross-sections create actual chamfered silhouettes, not cube props.
export function loft(sections, axis='y') {
 const vertices=[],uvs=[],colors=[];const ring=(s)=>{const [level,w,d,c=.2]=s;return [[-w/2+c*w,-d/2],[w/2-c*w,-d/2],[w/2,-d/2+c*d],[w/2,d/2-c*d],[w/2-c*w,d/2],[-w/2+c*w,d/2],[-w/2,d/2-c*d],[-w/2,-d/2+c*d]].map(([x,z])=>axis==='y'?[x,level,z]:[x,z,level])};
 const rings=sections.map(ring);
 const triangle=(a,b,c,ta,tb,tc,shade)=>{if(axis==='z'){[b,c]=[c,b];[tb,tc]=[tc,tb]}for(const [p,t]of [[a,ta],[b,tb],[c,tc]]){vertices.push(...p);uvs.push(...t);colors.push(shade,shade,shade)}};
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<8;i++){const a=rings[j][i],b=rings[j][(i+1)%8],c=rings[j+1][(i+1)%8],d=rings[j+1][i],shade=[.85,.95,.72,.92,1,.86,.68,.82][i];triangle(a,c,b,[0,0],[1,1],[1,0],shade);triangle(a,d,c,[0,0],[0,1],[1,1],shade)}
 for(const [j,flip]of [[0,false],[rings.length-1,true]])for(let i=1;i<7;i++){const r=rings[j];const a=r[0],b=r[i],c=r[i+1];triangle(a,flip?c:b,flip?b:c,[0,0],[1,0],[.5,1],.85)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();
 // Independent triangles preserve the hard normals along authored facets.
 return g;
}
export function mesh(parent,geometry,material,x=0,y=0,z=0,scale){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);if(scale)m.scale.set(...scale);parent.add(m);return m}
export function plate(parent,material,w,h,d,x,y,z){return mesh(parent,loft([[-h/2,w,d],[h/2,w,d]]),material,x,y,z)}
export function cylinder(parent,material,radius,height,sides,x,y,z){return mesh(parent,new THREE.CylinderGeometry(radius,radius,height,sides,1),material,x,y,z)}
export function makeGuard(m,variant=0) {
 const g=new THREE.Group();g.name='human-sable-mercenary';
 const skin=[m.skin,m.skinDeep,m.skinPale][variant%3];const cloth=variant%2?m.dark:m.coat;
 const torso=new THREE.Group();g.add(torso);
 mesh(torso,organic([[.76,.18,.115],[.94,.19,.12],[1.13,.24,.145],[1.35,.285,.135],[1.46,.22,.12],[1.5,.13,.10]],10),cloth);
 mesh(torso,organic([[.74,.20,.13],[.84,.23,.14],[.96,.18,.115]],9),m.black);
 // Tailored coat tails / open lapels, without a robot chest plate.
 for(const side of [-1,1]){
  const tail=mesh(torso,polygonPrism([[side*.04,.88],[side*.22,.91],[side*.29,.49],[side*.09,.55]],.025),cloth);tail.position.z=-.10;
  const lapel=mesh(torso,polygonPrism([[side*.05,1.09],[side*.23,1.4],[side*.11,1.49]],.015),m.dark);lapel.position.z=.15;
 }
 mesh(g,organic([[1.45,.075,.075],[1.62,.065,.07]],8),skin);
 const head=new THREE.Group();g.add(head);head.name='exposed-human-head';
 const cranium=mesh(head,organic([[1.60,.065,.08],[1.70,.145,.125],[1.83,.14,.12],[1.91,.08,.07]],10),skin,0,0,-.04);cranium.name='human-skull';
 const face=mesh(head,faceGeometry(),skin);face.material=skin;face.name='human-face-nose-cheeks-chin';face.material.side=THREE.DoubleSide;
 for(const side of [-1,1]){
  mesh(head,new THREE.IcosahedronGeometry(.038,0),skin,side*.15,1.72,0,[.65,1,.55]);
  const eye=mesh(head,new THREE.IcosahedronGeometry(.034,0),m.eye,side*.067,1.744,.118,[1,.42,.32]);eye.name='human-eye';
  mesh(head,new THREE.IcosahedronGeometry(.018,0),m.black,side*.066,1.744,.131,[.5,.8,.2]);
  const brow=mesh(head,polygonPrism([[-.043,0],[.043,.004],[.028,.022],[-.035,.025]],.01,0),m.hair,side*.067,1.765,.12);brow.rotation.z=-side*.12;
 }
 mesh(head,polygonPrism([[-.047,0],[.047,0],[.026,.012],[-.025,.012]],.004,0),m.lip,0,1.627,.142);
 // Three recognizably human hairstyles: swept hair, shaved sides, or a ponytail.
 const hair=mesh(head,organic([[1.80,.147,.125],[1.89,.13,.115],[1.95,.065,.06,.02,-.01]],9),m.hair,0,0,-.045);hair.name='human-hair';
 if(variant%3===1){const crest=mesh(head,polygonPrism([[-.025,0],[.03,0],[.05,.18],[-.02,.12]],.21,.015),m.hair,0,1.88,-.04);crest.rotation.y=Math.PI/2}
 if(variant%3===2)mesh(head,organic([[1.53,.035,.04],[1.68,.055,.06],[1.86,.065,.075]],6),m.hair,0,0,-.18);
 const legs=[],knees=[],arms=[];
 for(const side of [-1,1]){
  const leg=new THREE.Group();g.add(leg);leg.position.set(side*.115,.83,0);legs.push(leg);
  mesh(leg,organic([[-.43,.067,.075,side*.025,.015],[-.26,.10,.105,side*.02,-.025],[0,.115,.12]],8),cloth);
  const knee=new THREE.Group();leg.add(knee);knee.position.set(side*.025,-.43,.015);knees.push(knee);
  mesh(knee,organic([[-.29,.045,.055,0,.01],[-.15,.075,.075,0,-.01],[0,.064,.075]],8),cloth);
  mesh(knee,organic([[-.36,.065,.14,0,.06],[-.28,.065,.105,0,.035],[-.22,.045,.055]],8),m.black);
  const arm=new THREE.Group();g.add(arm);arm.position.set(side*.28,1.4,0);arm.rotation.z=side*.12;arms.push(arm);
  mesh(arm,organic([[-.31,.055,.06],[-.14,.09,.095],[0,.11,.11]],8),cloth);
  const forearm=new THREE.Group();arm.add(forearm);forearm.position.y=-.3;forearm.rotation.x=-.5;arm.userData.forearm=forearm;
  mesh(forearm,organic([[-.28,.037,.044,0,.015],[-.15,.064,.065],[0,.05,.055]],8),skin);
  mesh(forearm,organic([[-.36,.048,.055,0,.02],[-.27,.043,.048]],7),skin);
  for(let i=0;i<3;i++)mesh(forearm,organic([[-.4,.011,.015],[-.33,.014,.018]],5),skin,(i-1)*.025,0,.025);
 }
 // A compact firearm held by an organic, elbowed arm, not a gun-arm attachment.
 mesh(arms[1].userData.forearm,organic([[-.08,.045,.05],[.18,.055,.055]],6),m.metal,0,-.33,.09).rotation.x=Math.PI/2+.5;
 g.userData.joints={torso,head,knees,arms};
 g.userData.asset={name:['Rook','Vale','Ash'][variant%3]+' / SABLE human mercenary',species:'human',triangles:countTriangles(g),features:['exposed face','modeled nose','eyes','hair','fingers','jointed knees']};
 return {g,legs,knees,arms,head,torso};
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
export function makeSword(m) {
 const g=new THREE.Group();g.name='MOURNFANG-cursed-greatsword';
 const outline=[[-.07,.055],[.07,.055],[.105,.36],[.064,.43],[.145,.65],[.055,.62],[.08,.86],[0,1.13],[-.08,.86],[-.055,.62],[-.145,.65],[-.064,.43],[-.105,.36]];
 const blade=mesh(g,polygonPrism(outline,.035,.045),m.obsidian);blade.name='serrated-faceted-obsidian-blade';
 // Cutting edges and a crimson fuller are actual thin raised polygon meshes.
 for(const side of [-1,1]){
  mesh(g,polygonPrism([[side*.065,.08],[side*.105,.36],[side*.064,.43],[side*.145,.65],[side*.055,.62],[side*.08,.86],[0,1.13],[side*.047,.83],[side*.031,.59],[side*.09,.63],[side*.034,.42],[side*.07,.35]],.009,.005),m.edge,0,0,.025);
  mesh(g,polygonPrism([[0,.12],[side*.018,.25],[side*.012,.8],[0,1.03]],.008,.008),m.crimson,0,0,.082);
  const guard=mesh(g,polygonPrism([[0,.04],[side*.13,.01],[side*.27,.1],[side*.30,.23],[side*.22,.15],[side*.13,.115],[0,.12]],.055,.035),m.obsidian);guard.name='horned-crossguard';
 }
 for(let i=0;i<6;i++){
  const y=.23+i*.098;mesh(g,polygonPrism([[-.014,y],[.012,y+.016],[-.004,y+.028],[.018,y+.047],[.003,y+.044],[-.018,y+.024],[0,y+.014]],.003,0),m.crimson,0,0,.095);
 }
 mesh(g,organic([[-.31,.035,.035],[-.1,.039,.039],[.015,.032,.032]],8),m.leather);
 for(let i=0;i<6;i++){const wrap=cylinder(g,m.edge,.038,.012,7,0,-.27+i*.042,0);wrap.rotation.z=.18}
 const skull=mesh(g,new THREE.IcosahedronGeometry(.069,0),m.edge,0,.065,.055,[1,1.1,.75]);skull.name='demon-skull-guard';
 for(const side of [-1,1]){mesh(g,new THREE.IcosahedronGeometry(.015,0),m.crimson,side*.024,.079,.111);const horn=mesh(g,new THREE.ConeGeometry(.025,.12,4),m.obsidian,side*.06,.15,.03);horn.rotation.z=-side*.45}
 mesh(g,new THREE.IcosahedronGeometry(.065,0),m.obsidian,0,-.35,0);mesh(g,new THREE.OctahedronGeometry(.038,0),m.crimson,0,-.35,.046);
 const hand=mesh(g,organic([[-.23,.05,.055],[-.13,.06,.065],[-.085,.045,.048]],8),m.skin,.025,0,.022);hand.name='sword-gripping-hand';
 for(let i=0;i<4;i++){const finger=mesh(g,organic([[-.035,.013,.017],[.032,.017,.022]],6),m.skin,.035,-.105-i*.029,.045);finger.rotation.z=Math.PI/2}
 const arm=mesh(g,organic([[-.59,.085,.10,.14,.09],[-.43,.073,.08,.08,.06],[-.23,.047,.054,0,.02]],9),m.coat,.025,0,.02);arm.name='sculpted-sword-forearm';
 g.userData.asset={name:'MOURNFANG / the Oath-Eater',triangles:countTriangles(g),type:'cursed fantasy sword',features:['serrated blade','faceted cutting edges','raised runes','demonic crossguard','ruby pommel','modeled gripping fingers']};
 return g;
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
