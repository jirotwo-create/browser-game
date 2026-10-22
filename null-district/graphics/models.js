import * as THREE from '../vendor/three.module.js';
import { organic, faceGeometry, polygonPrism } from './anatomy.js';
import { blackBladeGeometry, chisel } from './sculpt.js';
import { gearSurface, gearClock } from './gear-materials.js';
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
 mesh(torso,organic([[.76,.18,.115],[.88,.20,.13],[1.01,.18,.125],[1.15,.245,.15],[1.28,.29,.165],[1.38,.28,.14],[1.46,.20,.12],[1.5,.13,.10]],12),cloth);
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
  mesh(leg,organic([[-.43,.067,.075,side*.025,.015],[-.36,.083,.09,side*.03,0],[-.22,.105,.11,side*.025,-.025],[-.08,.12,.12,side*.01,-.01],[0,.115,.12]],10),cloth);
  const knee=new THREE.Group();leg.add(knee);knee.position.set(side*.025,-.43,.015);knees.push(knee);
  mesh(knee,organic([[-.29,.045,.055,0,.01],[-.23,.053,.067],[-.12,.08,.083,0,-.015],[0,.064,.075]],10),cloth);
  mesh(knee,organic([[-.36,.065,.14,0,.06],[-.28,.065,.105,0,.035],[-.22,.045,.055]],8),m.black);
  const arm=new THREE.Group();g.add(arm);arm.position.set(side*.28,1.4,0);arm.rotation.z=side*.12;arms.push(arm);
  mesh(arm,organic([[-.31,.055,.06],[-.23,.077,.079],[-.13,.103,.10],[0,.11,.11]],10),cloth);
  const forearm=new THREE.Group();arm.add(forearm);forearm.position.y=-.3;forearm.rotation.x=-.5;arm.userData.forearm=forearm;
  mesh(forearm,organic([[-.28,.037,.044,0,.015],[-.21,.048,.055],[-.11,.070,.069],[0,.05,.055]],10),skin);
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
 mesh(t,loft([[-.43,.10,.12],[-.32,.14,.15],[.06,.12,.14],[.10,.07,.09]],'z'),m.metal,0,.17,0);
 mesh(t,organic([[-.105,.031,.037],[.03,.037,.044],[.105,.033,.041]],8),m.glove);
 const fore=mesh(t,loft([[-.54,.09,.09],[-.47,.125,.13],[-.20,.12,.12]],'z'),m.black,0,.15,0);fore.name='fore-end-under-support-hand';
 cylinder(t,m.metal,.032,.29,7,0,.17,-.65).rotation.x=Math.PI/2;
 cylinder(t,m.black,.049,.085,7,0,.17,-.84).rotation.x=Math.PI/2;
 for(let i=0;i<4;i++)plate(t,m.metal,.13,.015,.022,0,.235,-.26-i*.05);
 plate(t,m.black,.025,.075,.028,0,.235,-.69);
 plate(t,m.black,.085,.07,.045,0,.237,.09);
 // Open rear sight, stock running back toward the player's right shoulder.
 for(const x of [-.027,.027])plate(t,m.black,.018,.032,.025,x,.26,.09);
 mesh(t,organic([[.10,.025,.03],[.20,.028,.035,.12,0],[.35,.03,.04,.32,0]],8),m.black,0,.15,0).rotation.x=Math.PI/2;
 plate(t,m.glove,.07,.17,.035,.32,.13,.35);
 const mag=mesh(t,organic([[-.17,.042,.063],[-.025,.049,.07],[.08,.043,.065]],6),m.metal,0,-.03,-.18);mag.rotation.x=.11;r.magazine=mag;
 for(const [a,b]of [[[0,.11,-.09],[0,.11,-.19]],[[0,.11,-.19],[0,.01,-.18]],[[0,.01,-.18],[0,.01,-.04]]]){
  const d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const tube=cylinder(t,m.black,.007,d.length(),5,...new THREE.Vector3(...a).addScaledVector(d,.5).toArray());tube.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
 }
 const trigger=cylinder(t,m.metal,.007,.035,5,.012,.065,-.14);trigger.rotation.x=-.35;
 r.trigger=new THREE.Object3D();r.trigger.name='trigger-contact';r.trigger.position.set(.018,.065,-.14);t.add(r.trigger);
 r.muzzle=new THREE.Object3D();r.muzzle.name='actual-muzzle';r.muzzle.position.set(0,.17,-.89);t.add(r.muzzle);
 for(let i=0;i<7;i++){const vent=plate(t,m.black,.025,.058,.035,0,.207,-.43+i*.034);vent.rotation.z=.22;plate(t,m.edge,.014,.009,.030,.054,.23,-.43+i*.034);}
 for(const side of [-1,1]){
  mesh(t,polygonPrism([[0,0],[.1,.015],[.17,.075],[.05,.085]],.007,.004),m.edge,side*.071,.10,-.08).rotation.y=side*Math.PI/2;
  for(const z of [-.26,.07])cylinder(t,m.edge,.012,.014,10,side*.077,.17,z).rotation.z=Math.PI/2;
 }
 for(const z of [-.77,-.81])cylinder(t,m.edge,.038,.009,12,0,.17,z).rotation.x=Math.PI/2;
 plate(t,m.cyan||m.red,.009,.012,.22,.059,.23,-.33);
 r.bolt=plate(t,m.edge,.035,.025,.13,.077,.185,.025);
 t.traverse(o=>{if(o.isMesh){const original=o.geometry;o.geometry=chisel(original,.025);original.dispose()}});
 g.userData.asset={name:'K09 / shouldered two-hand carbine',triangles:countTriangles(g),features:['trigger finger on trigger','opposed thumb','support hand around fore-end','shoulder elbow wrist IK','physical muzzle']};
 poseCarbine(g);return g;
}
export function makeSword(m) {
 const g=createHeldRig(m,{sword:true});g.name='MOURNFANG-black-steel-regalia';const r=g.userData.rig,t=r.tool;
 const steel=m.steel||gearSurface(0x090d15,{metallic:1,polish:.93,sheen:.85}),gold=m.gold||m.edge;
 const core=m.crimson.clone();core.uniforms.tint.value.setRGB(.48,.008,.025);core.uniforms.time=gearClock;
 const glyphs=[],fangs=[],links=[],seals=[];
 const blade=mesh(t,blackBladeGeometry(),steel);blade.name='traditional-double-edged-polished-black-steel';
 // Thin raised channels and gilded etching follow the diamond section, leaving
 // the long black bevels and symmetrical cutting edges clearly readable.
 for(const side of [-1,1]){
  mesh(t,polygonPrism([[side*.042,.35],[side*.049,.41],[side*.035,.82],[side*.018,1.03],[side*.026,.81]],.002,0),m.edge,0,0,.014);
  mesh(t,polygonPrism([[side*.025,.39],[side*.033,.46],[side*.021,.70],[side*.029,.64],[side*.011,.91],[side*.014,.63]],.002,0),gold,0,0,.029);
 }
 for(let i=0;i<10;i++){const y=.35+i*.064;const rune=mesh(t,polygonPrism([[-.009,0],[.01,.007],[-.004,.013],[.009,.024],[.002,.021],[-.012,.01]],.001,0),core,0,y,.035);rune.userData.baseY=y;glyphs.push(rune)}
 // Layered bat-wing quillons, black horns, silver talons and gold wirework.
 for(const side of [-1,1]){
  mesh(t,polygonPrism([[0,.12],[side*.12,.09],[side*.28,.15],[side*.36,.30],[side*.29,.28],[side*.23,.20],[side*.12,.23],[0,.24]],.045,.025),steel);
  mesh(t,polygonPrism([[side*.09,.13],[side*.22,.16],[side*.31,.26],[side*.23,.20],[side*.12,.19]],.008,.007),gold,0,0,.052);
  for(let i=0;i<3;i++){
   const hinge=new THREE.Group();hinge.position.set(side*(.15+i*.059),.18+i*.025,.012);t.add(hinge);
   mesh(hinge,polygonPrism([[0,0],[side*.035,.025],[side*.045,.12],[side*.014,.081]],.022,.012),i%2?gold:m.edge);
   hinge.userData={side,rest:side*(.1+i*.14)};fangs.push(hinge);
  }
  for(let i=0;i<4;i++){const setting=mesh(t,new THREE.IcosahedronGeometry(.018,0),gold,side*(.09+i*.045),.19+i*.007,.066);mesh(t,new THREE.OctahedronGeometry(.010,0),core,setting.position.x,setting.position.y,.083);}
 }
 mesh(t,organic([[-.34,.028,.032],[-.29,.033,.034],[-.1,.033,.035],[.08,.035,.037],[.13,.027,.030]],12),m.leather);
 for(let i=0;i<15;i++){const wrap=cylinder(t,i%3===0?gold:m.black,.035,.008,12,0,-.315+i*.028,0);wrap.rotation.z=.22;}
 // Sculpted iron death mask: separate brow, cheek planes, hollow sockets,
 // fanged jaw, horn crown and a faceted blood gem mounted in a gold setting.
 mesh(t,organic([[.09,.024,.035],[.13,.055,.055],[.19,.075,.048],[.23,.062,.04],[.26,.033,.035]],10),m.edge,0,0,.056);
 for(const side of [-1,1]){
  mesh(t,polygonPrism([[0,0],[side*.041,.002],[side*.032,.030],[side*.008,.022]],.008,.005),m.black,side*.007,.17,.105);
  mesh(t,polygonPrism([[0,0],[side*.026,.005],[side*.018,.013]],.004,0),core,side*.016,.18,.119);
  mesh(t,polygonPrism([[0,0],[side*.028,.002],[side*.035,.026],[side*.01,.035]],.012,.01),gold,side*.033,.13,.10);
  const horn=mesh(t,organic([[0,.021,.022],[.07,.017,.018,side*.017,-.009],[.14,.009,.012,side*.035,-.028],[.19,.001,.002,side*.045,-.055]],7),steel,side*.057,.23,.047);horn.rotation.z=-side*.17;
  const jaw=mesh(t,new THREE.ConeGeometry(.014,.08,5),m.edge,side*.043,.106,.103);jaw.rotation.z=side*.2;
 }
 mesh(t,polygonPrism([[0,.172],[-.014,.144],[.014,.144]],.006,0),m.black,0,0,.121);
 for(let i=0;i<7;i++)mesh(t,new THREE.ConeGeometry(.006,.026+(i%2)*.008,4),m.edge,(i-3)*.011,.114,.109).rotation.z=Math.PI;
 mesh(t,new THREE.OctahedronGeometry(.033,0),gold,0,.248,.087,[1,1.2,.7]);
 const ruby=mesh(t,new THREE.OctahedronGeometry(.022,1),m.ruby||core,0,.249,.114,[1,1.2,.65]);
 // Crowned pommel, relic rings, thorn finial and two articulated charm chains.
 mesh(t,new THREE.IcosahedronGeometry(.050,1),steel,0,-.378,0,[1,1.1,.9]);
 for(const y of [-.35,-.408])cylinder(t,gold,.045,.012,12,0,y,0);
 mesh(t,new THREE.OctahedronGeometry(.026,0),core,0,-.378,.047);
 mesh(t,new THREE.ConeGeometry(.035,.13,7),steel,0,-.46,0).rotation.z=Math.PI;
 for(const side of [-1,1]){
  let chain=t;
  for(let i=0;i<9;i++){const link=new THREE.Group();link.position.set(i===0?side*.25:0,i===0?.16:-.031,i===0?.05:0);chain.add(link);mesh(link,new THREE.TorusGeometry(.016,.0035,5,10),i%3===0?gold:m.edge).rotation.y=i%2?Math.PI/2:0;link.userData.side=side;links.push(link);chain=link;}
  const seal=new THREE.Group();chain.add(seal);seal.position.y=-.04;mesh(seal,new THREE.OctahedronGeometry(.035,0),gold,0,0,0,[.8,1.2,.35]);mesh(seal,new THREE.OctahedronGeometry(.021,0),core,0,0,.014,[.8,1.2,.4]);mesh(seal,new THREE.ConeGeometry(.014,.07,5),m.bone||m.edge,0,-.065,0).rotation.z=Math.PI;seals.push(seal);
 }
 r.tip=new THREE.Object3D();r.tip.position.set(0,1.19,0);t.add(r.tip);
 const ribbon=new THREE.BufferGeometry();ribbon.setAttribute('position',new THREE.BufferAttribute(new Float32Array(18),3));
 const trail=mesh(g,ribbon,new THREE.MeshBasicMaterial({color:0xce284b,transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false}));trail.frustumCulled=false;trail.visible=false;
 g.userData.relic={steel,core,ruby,glyphs,fangs,links,seals,trail,previousTip:null,previousBase:null};
 g.userData.asset={name:'MOURNFANG / black-steel sovereign',triangles:countTriangles(g),type:'traditional demonic black-steel longsword',features:['native-resolution polished steel','animated specular sheen','symmetrical diamond-section blade','engraved blood runes','sculpted death-mask guard','articulated silver talons','horn crown','gilded filigree','twin linked charm chains','faceted blood gems','thorn pommel','two-handed anatomical grip']};
 poseSword(g);return g;
}
export function makeCrate(m,w=2,h=1.4,d=2){const g=new THREE.Group();mesh(g,loft([[0,w*.88,d*.9],[.2,w,d],[h-.2,w,d],[h,w*.88,d*.9]]),m.rust);plate(g,m.hazard,w*.8,.28,.04,0,h*.62,d/2+.025);for(const s of [-1,1])plate(g,m.metal,.15,h*.8,d*.88,s*w*.36,h/2,0);return g}
export function countTriangles(group){let n=0;group.traverse(o=>{if(o.isMesh)n+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3});return n}

// Merge static painted meshes by material. Colliders and animated rigs remain
// separate, so batching cannot invalidate raycasts or gameplay transforms.
export function batchStatic(root) {
 root.updateMatrixWorld(true);const batches=new Map();
 for(const child of [...root.children])if(child.isMesh&&!child.userData.collider){const g=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone();g.applyMatrix4(child.matrixWorld);const key=child.material;let b=batches.get(key);if(!b){b={position:[],normal:[],uv:[],color:[]};batches.set(key,b)}const n=g.attributes.position.count;for(let i=0;i<n;i++){b.position.push(g.attributes.position.getX(i),g.attributes.position.getY(i),g.attributes.position.getZ(i));b.normal.push(g.attributes.normal?.getX(i)||0,g.attributes.normal?.getY(i)??1,g.attributes.normal?.getZ(i)||0);b.uv.push(g.attributes.uv?.getX(i)||0,g.attributes.uv?.getY(i)||0);b.color.push(g.attributes.color?.getX(i)??1,g.attributes.color?.getY(i)??1,g.attributes.color?.getZ(i)??1)}g.dispose();child.geometry.dispose();root.remove(child)}
 for(const [material,b]of batches){const g=new THREE.BufferGeometry();for(const [key,array]of Object.entries(b))g.setAttribute(key,new THREE.Float32BufferAttribute(array,key==='uv'?2:3));g.computeBoundingSphere();const object=new THREE.Mesh(g,material);object.name='batched-painted-district';root.add(object)}
}
