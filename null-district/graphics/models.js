import * as THREE from '../vendor/three.module.js';
import { organic, faceGeometry, polygonPrism } from './anatomy.js';
import { createHeldRig, poseCarbine, poseSword } from './weapon-rig.js';

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
 const g=createHeldRig(m);g.name='K09-two-handed-carbine';const r=g.userData.rig,t=r.tool;
 mesh(t,loft([[-.43,.10,.12],[-.32,.14,.15],[.12,.13,.18],[.24,.085,.13]],'z'),m.metal,0,.17,0);
 mesh(t,organic([[-.105,.031,.037],[.03,.037,.044],[.105,.033,.041]],8),m.glove);
 const fore=mesh(t,loft([[-.54,.09,.09],[-.47,.125,.13],[-.20,.12,.12]],'z'),m.black,0,.15,0);fore.name='fore-end-under-support-hand';
 cylinder(t,m.metal,.032,.29,7,0,.17,-.65).rotation.x=Math.PI/2;
 cylinder(t,m.black,.049,.085,7,0,.17,-.84).rotation.x=Math.PI/2;
 for(let i=0;i<4;i++)plate(t,m.metal,.13,.015,.022,0,.235,-.26-i*.05);
 plate(t,m.black,.025,.055,.028,0,.275,-.69);
 // Open rear sight, stock running back toward the player's right shoulder.
 for(const x of [-.027,.027])plate(t,m.black,.018,.045,.025,x,.275,.09);
 mesh(t,loft([[.18,.06,.055],[.42,.06,.06]],'z'),m.black,0,.15,0);
 plate(t,m.glove,.105,.20,.04,0,.11,.42);
 const mag=mesh(t,organic([[-.17,.042,.063],[-.025,.049,.07],[.08,.043,.065]],6),m.metal,0,-.03,-.18);mag.rotation.x=.11;r.magazine=mag;
 for(const [a,b]of [[[0,.11,-.09],[0,.11,-.19]],[[0,.11,-.19],[0,.01,-.18]],[[0,.01,-.18],[0,.01,-.04]]]){
  const d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const tube=cylinder(t,m.black,.007,d.length(),5,...new THREE.Vector3(...a).addScaledVector(d,.5).toArray());tube.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
 }
 const trigger=cylinder(t,m.metal,.007,.035,5,.012,.065,-.14);trigger.rotation.x=-.35;
 r.trigger=new THREE.Object3D();r.trigger.name='trigger-contact';r.trigger.position.set(.018,.065,-.14);t.add(r.trigger);
 r.muzzle=new THREE.Object3D();r.muzzle.name='actual-muzzle';r.muzzle.position.set(0,.17,-.89);t.add(r.muzzle);
 g.userData.asset={name:'K09 / shouldered two-hand carbine',triangles:countTriangles(g),features:['trigger finger on trigger','opposed thumb','support hand around fore-end','shoulder elbow wrist IK','physical muzzle']};
 poseCarbine(g);return g;
}
export function makeSword(m) {
 const g=createHeldRig(m,{sword:true});g.name='MOURNFANG-living-relic';const r=g.userData.rig,t=r.tool;
 const bladeRoot=new THREE.Group();bladeRoot.position.y=.145;t.add(bladeRoot);
 // Chipped, asymmetrical blackened steel with a hooked back edge and a narrow
 // stabbing tip. Highlights come from worn metal textures, not pastel facets.
 const outline=[[-.065,0],[.085,.02],[.105,.24],[.065,.30],[.14,.52],[.055,.48],[.085,.72],[.02,1.02],[-.04,.88],[-.105,.68],[-.065,.62],[-.145,.43],[-.09,.46],[-.115,.24],[-.06,.28]];
 const blade=mesh(bladeRoot,polygonPrism(outline,.032,.025),m.obsidian);blade.name='blackened-hooked-blade';
 mesh(bladeRoot,polygonPrism([[.065,.02],[.085,.24],[.049,.3],[.12,.51],[.042,.47],[.068,.71],[.02,1.02],[.045,.70],[.017,.45],[.079,.49],[.025,.29],[.06,.23]],.006,.002),m.edge,0,0,.024);
 const core=m.crimson.clone();core.uniforms.tint.value.setRGB(.36,.022,.016);
 const glyphs=[],fangs=[],links=[];
 mesh(bladeRoot,polygonPrism([[-.012,.05],[.014,.1],[-.004,.26],[.019,.38],[.002,.55],[.018,.69],[.008,.85],[-.003,.70],[-.014,.56],[0,.39],[-.021,.25]],.004,0),core,0,0,.05);
 for(let i=0;i<7;i++){const y=.09+i*.104;const rune=mesh(bladeRoot,polygonPrism([[-.021,0],[.014,.01],[-.008,.024],[.017,.041],[.003,.039],[-.025,.02],[-.007,.01]],.003,0),core,0,y,.055);rune.userData.baseY=y;glyphs.push(rune)}
 for(const side of [-1,1]){
  const wing=mesh(t,polygonPrism([[0,.11],[side*.12,.07],[side*.25,.14],[side*.29,.29],[side*.21,.21],[side*.11,.19],[0,.22]],.035,.014),m.obsidian);wing.name='forged-demonic-crossguard';
  for(let i=0;i<3;i++){const hinge=new THREE.Group();hinge.position.set(side*(.072+i*.005),.37+i*.18,.005);t.add(hinge);const fang=mesh(hinge,polygonPrism([[0,0],[side*.07,.035],[side*.035,.13],[side*.016,.049]],.015,.006),m.edge);hinge.userData={side,rest:side*.1};hinge.rotation.z=hinge.userData.rest;fang.name='articulated-blade-fang';fangs.push(hinge)}
 }
 mesh(t,organic([[-.34,.028,.03],[-.19,.033,.034],[.10,.034,.035],[.15,.025,.027]],8),m.leather);
 for(let i=0;i<10;i++){const wrap=cylinder(t,m.black,.035,.011,8,0,-.30+i*.041,0);wrap.rotation.z=.15}
 // A hollow-eyed iron skull with cheek bones, a nasal cavity and exposed fangs.
 mesh(t,polygonPrism([[-.055,.115],[-.065,.185],[-.04,.225],[.04,.225],[.065,.185],[.055,.115],[.025,.09],[-.025,.09]],.035,.015),m.edge,0,0,.04);
 for(const side of [-1,1]){mesh(t,polygonPrism([[0,0],[side*.031,.006],[side*.024,.027],[side*.003,.022]],.003,0),m.black,side*.008,.165,.086);mesh(t,new THREE.IcosahedronGeometry(.009,0),core,side*.025,.178,.091);const horn=mesh(t,new THREE.ConeGeometry(.018,.13,4),m.obsidian,side*.059,.257,.028);horn.rotation.z=-side*.5}
 mesh(t,polygonPrism([[0,.145],[-.012,.123],[.012,.123]],.004,0),m.black,0,0,.089);
 for(const x of [-.03,-.015,0,.015,.03]){const tooth=mesh(t,new THREE.ConeGeometry(.007,.035,3),m.edge,x,.108,.077);tooth.rotation.z=Math.PI}
 mesh(t,new THREE.IcosahedronGeometry(.047,0),m.obsidian,0,-.375,0);
 const ruby=mesh(t,new THREE.OctahedronGeometry(.026,0),core,0,-.378,.04);
 let chain=t;for(let i=0;i<5;i++){const link=new THREE.Group();link.position.set(i===0?-.225:0,i===0?.13:-.046,.02);chain.add(link);const ring=mesh(link,new THREE.TorusGeometry(.022,.005,3,6),m.edge);ring.rotation.y=i%2?Math.PI/2:0;links.push(link);chain=link}
 mesh(chain,new THREE.ConeGeometry(.016,.065,4),m.obsidian,0,-.055,0).rotation.z=Math.PI;
 r.tip=new THREE.Object3D();r.tip.position.set(.02,1.165,0);t.add(r.tip);
 const ribbon=new THREE.BufferGeometry();ribbon.setAttribute('position',new THREE.BufferAttribute(new Float32Array(18),3));
 const trail=mesh(g,ribbon,new THREE.MeshBasicMaterial({color:0x68221a,transparent:true,opacity:.24,side:THREE.DoubleSide,depthWrite:false}));trail.frustumCulled=false;trail.visible=false;
 g.userData.relic={core,ruby,glyphs,fangs,links,trail,previousTip:null,previousBase:null};
 g.userData.asset={name:'MOURNFANG / living Oath-Eater',triangles:countTriangles(g),type:'animated cursed greatsword',features:['two-handed anatomical grip','chipped hooked steel','articulated blade fangs','flowing blood runes','pulsing hollow skull','spiked hanging chain','rotating ruby','swept physical blade trail']};
 poseSword(g);return g;
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
