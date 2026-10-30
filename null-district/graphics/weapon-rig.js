import * as THREE from '../vendor/three.module.js';
import { gearClock } from './gear-materials.js';
import { organic } from './anatomy.js';
const Y=new THREE.Vector3(0,1,0);
const add=(parent,geo,material)=>{const m=new THREE.Mesh(geo,material);parent.add(m);return m};
const anchor=(parent,name,p)=>{const o=new THREE.Object3D();o.name=name;o.position.set(...p);parent.add(o);return o};

function phalanx(parent,a,b,r,material){
 const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),d=to.clone().sub(from);
 const mesh=add(parent,organic([[0,r,r*.9],[.6,r*.91,r*.82],[1,r*.78,r*.75]],8),material);
 mesh.position.copy(from);mesh.quaternion.setFromUnitVectors(Y,d.clone().normalize());mesh.scale.y=d.length();return mesh;
}
export function makeGripHand(materials,{trigger=false,name='hand',handedness='right'}={}){
 const hand=new THREE.Group();hand.name=name;hand.userData.handedness=handedness;
 const anatomy=new THREE.Group();anatomy.scale.x=handedness==='left'?-1:1;hand.add(anatomy);
 const palm=add(anatomy,organic([[-.085,.032,.035,.055,.025],[-.045,.046,.055,.06,.025],[.045,.043,.051,.06,.018],[.07,.031,.038,.06,.012]],12),materials.glove);palm.name='palm-around-grip';
 const tips=[];
 for(let i=0;i<4;i++){
  const y=.047-i*.033;
  const path=trigger&&i===0?[[.079,y+.018,.004],[.078,.068,-.07],[.065,.065,-.121],[.018,.065,-.14]]:
    [[.060,y,-.002],[.038,y,-.040],[.006,y,-.048],[-.026,y,-.031]];
  for(let k=0;k<3;k++)phalanx(anatomy,path[k],path[k+1],i===3?.010:.012,materials.skin);
  tips.push(anchor(anatomy,i===0?'index-fingertip':`finger-${i}-tip`,path.at(-1)));
 }
 const thumb=[[.075,.048,.062],[.027,.09,.052],[-.029,.073,.023],[-.043,.033,.002]];
 for(let k=0;k<3;k++)phalanx(anatomy,thumb[k],thumb[k+1],.016,materials.skin);
 // Raised knuckle shells, wrist reinforcement and sewn edge tabs.
 for(let i=0;i<3;i++){const shell=add(anatomy,new THREE.IcosahedronGeometry(.016,0),materials.metal);shell.position.set(.096,.033-i*.033,.023);shell.scale.set(.45,1,.85);}
 const cuff=add(anatomy,organic([[-.108,.034,.043,.06,.025],[-.09,.036,.046,.06,.025],[-.077,.034,.04,.06,.025]],10),materials.glove);cuff.name='reinforced-cuff';
 for(const y of [-.10,-.083]){const stitch=add(anatomy,new THREE.BoxGeometry(.004,.003,.045),materials.bone);stitch.position.set(.093,y,.025);}
 const wrist=anchor(anatomy,'wrist-contact',[.06,-.089,.033]);
 hand.userData.contacts={wrist,tips,palm:anchor(anatomy,'palm-contact',[.06,-.02,.018]),thumb:anchor(anatomy,'thumb-tip',thumb.at(-1))};return hand;
}
function makeArm(root,side,materials){
 const shoulder=new THREE.Vector3(side*.21,-.22,.01);
 const upper=add(root,organic([[0,.060,.064],[.12,.065,.068],[.35,.068,.065],[.52,.061,.062],[.7,.055,.055],[1,.046,.050]],10),materials.coat);
 const fore=add(root,organic([[0,.046,.050],[.15,.049,.052],[.36,.053,.055],[.55,.046,.05],[.72,.041,.043],[.9,.034,.037],[1,.030,.034]],10),materials.coat);
 upper.name=(side>0?'right':'left')+'-upper-arm';fore.name=(side>0?'right':'left')+'-forearm';
 const shoulderNode=anchor(root,side>0?'right-shoulder':'left-shoulder',shoulder.toArray());
 const elbowNode=anchor(root,side>0?'right-elbow':'left-elbow',[0,0,0]);
 const wristNode=anchor(root,side>0?'right-wrist':'left-wrist',[0,0,0]);
 return {shoulder,upper,fore,shoulderNode,elbowNode,wristNode,side,upperLength:.37,foreLength:.37};
}
function pointSegment(mesh,from,to){const delta=to.clone().sub(from);mesh.position.copy(from);mesh.scale.y=delta.length();mesh.quaternion.setFromUnitVectors(Y,delta.normalize())}
function solveArm(arm,target){
 const direction=target.clone().sub(arm.shoulder),distance=direction.length();direction.normalize();
 const along=(arm.upperLength**2-arm.foreLength**2+distance**2)/(2*Math.max(.001,distance));
 const pole=new THREE.Vector3(arm.side*.65,-1,.1);pole.addScaledVector(direction,-pole.dot(direction)).normalize();
 const elbow=arm.shoulder.clone().addScaledVector(direction,along).addScaledVector(pole,Math.sqrt(Math.max(0,arm.upperLength**2-along**2)));
 pointSegment(arm.upper,arm.shoulder,elbow);pointSegment(arm.fore,elbow,target);
 arm.elbowNode.position.copy(elbow);arm.wristNode.position.copy(target);
 arm.reach=distance;
}
export function createHeldRig(materials,{sword=false}={}){
 const root=new THREE.Group(),grip=new THREE.Group(),tool=new THREE.Group();root.add(grip);grip.add(tool);
 grip.name='dominant-grip-frame';tool.name='weapon-anchored-to-grip';
 const rightHand=makeGripHand(materials,{trigger:!sword,name:'right-gripping-hand'});grip.add(rightHand);
 const support=new THREE.Group();support.name='left-support-grip-frame';grip.add(support);
 const leftHand=makeGripHand(materials,{name:'left-support-hand',handedness:'left'});support.add(leftHand);
 const rightArm=makeArm(root,1,materials),leftArm=makeArm(root,-1,materials);
 root.userData.rig={grip,tool,rightHand,leftHand,support,rightArm,leftArm,sword,mode:'ready'};
 return root;
}
export function solveHeldRig(root){
 const rig=root.userData.rig;
 // Keep the closed two-hand chain inside both arm reach spheres. The weapon
 // moves with the hands; neither the wrists nor the forearms are stretched.
 for(let pass=0;pass<8;pass++){
  let adjusted=false;root.updateMatrixWorld(true);
  for(const [arm,hand]of [[rig.rightArm,rig.rightHand],[rig.leftArm,rig.leftHand]]){
   const wrist=root.worldToLocal(hand.userData.contacts.wrist.getWorldPosition(new THREE.Vector3()));
   const d=wrist.clone().sub(arm.shoulder),limit=arm.upperLength+arm.foreLength-.004;
   if(d.length()>limit){const shift=arm.shoulder.clone().add(d.setLength(limit)).sub(wrist);rig.grip.position.add(shift);root.updateMatrixWorld(true);adjusted=true}
  }
  if(!adjusted)break;
 }
 root.updateMatrixWorld(true);
 for(const [arm,hand]of [[rig.rightArm,rig.rightHand],[rig.leftArm,rig.leftHand]]){
  const wrist=root.worldToLocal(hand.userData.contacts.wrist.getWorldPosition(new THREE.Vector3()));solveArm(arm,wrist);
 }
 root.updateMatrixWorld(true);
}
export function gripDiagnostics(root){
 root.updateMatrixWorld(true);const r=root.userData.rig;
 const arms=[r.rightArm,r.leftArm].map((arm,i)=>{
  const hand=i===0?r.rightHand:r.leftHand;
  const wrist=hand.userData.contacts.wrist.getWorldPosition(new THREE.Vector3());
  const s=arm.shoulderNode.getWorldPosition(new THREE.Vector3()),e=arm.elbowNode.getWorldPosition(new THREE.Vector3()),w=arm.wristNode.getWorldPosition(new THREE.Vector3());
  return {side:i===0?'right':'left',upperLength:s.distanceTo(e),foreLength:e.distanceTo(w),wristGap:w.distanceTo(wrist),reach:s.distanceTo(w)};
 });
 const fingers=[r.rightHand,r.leftHand].map(hand=>hand.userData.contacts.tips.map(p=>{
  const local=hand.worldToLocal(p.getWorldPosition(new THREE.Vector3()));return {radius:Math.hypot(local.x,local.z),y:local.y};
 }));
 const index=r.rightHand.userData.contacts.tips[0].getWorldPosition(new THREE.Vector3());
 return {arms,fingers,triggerGap:r.trigger?index.distanceTo(r.trigger.getWorldPosition(new THREE.Vector3())):null,mode:r.mode};
}
const supportOrientation=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,-1),new THREE.Vector3(-1,0,0)));
const magazineOrientation=new THREE.Quaternion();
export function poseCarbine(root,{time=0,walk=0,recoil=0,reload=0}={}){
 const r=root.userData.rig,loading=reload>0,progress=loading?1-reload/1.5:0;
 const reach=loading?Math.sin(progress*Math.PI):0;
 r.grip.position.set(.16+Math.sin(walk*.5)*.006,-.255-Math.abs(Math.cos(walk))*.004-loading*.025,-.43+recoil*.65);
 r.grip.rotation.set(-.055-recoil*.55, .07, -.025-loading*.07);
 r.support.position.set(-.03,.11-reach*.28,-.24+reach*.12);
 r.support.quaternion.copy(supportOrientation).slerp(magazineOrientation,reach*.9);
 if(r.bolt)r.bolt.position.z=.025+recoil*.35;
 if(r.magazine)r.magazine.position.y=-.03-reach*.14;
 r.mode=loading?'reload':'ready';solveHeldRig(root);
}
export function poseSword(root,{time=0,attack=0,attacking=false,combo=0}={}){
 const r=root.userData.rig;gearClock.value=time;
 let wind=0,slash=0;
 if(attacking){if(attack<.22)wind=attack/.22;else if(attack<.48){wind=1;slash=Math.sin((attack-.22)/.26*Math.PI/2)}else{const t=Math.max(0,1-(attack-.48)/.42);wind=t;slash=t}}
 const reverse=combo%2===1?-.5:1;
 r.grip.position.set(.16+wind*.10-slash*.37*reverse,-.18+wind*.075-slash*.08,-.62+wind*.05-slash*.055);
 r.grip.rotation.set(-.56-wind*.25+slash*.67,-.12+wind*.20-slash*.40*reverse,-.18-wind*.30*reverse+slash*1.55*reverse);
 r.grip.position.y+=Math.sin(time*1.7)*.005;
 r.support.position.set(0,-.16,0);r.support.quaternion.identity();
 r.mode=attacking?'attack':'ready';
 const a=root.userData.relic;
 if(a){
  const pulse=.72+.22*Math.sin(time*3.4)+slash*.28;
  a.core.uniforms.tint.value.setRGB(.48*pulse,.025*pulse,.018*pulse);
  a.ruby.rotation.y=time*.48;a.ruby.rotation.z=Math.sin(time*.8)*.16;
  for(let i=0;i<a.fangs.length;i++){const p=a.fangs[i];p.rotation.z=p.userData.rest+(Math.sin(time*2+i*.8)*.08+slash*.2)*p.userData.side}
  for(let i=0;i<a.glyphs.length;i++){const p=a.glyphs[i];p.position.y=p.userData.baseY+Math.sin(time*2.5-i)*.008;p.scale.setScalar(.9+.12*Math.sin(time*3-i));}
  for(let i=0;i<a.links.length;i++){a.links[i].rotation.z=Math.sin(time*1.8+i*.45)*(.07+(i%9)*.015)+slash*.12;}
 }
 solveHeldRig(root);
 if(a){
  const active=attacking&&attack>.22&&attack<.50;
  if(active){
   const tip=root.worldToLocal(r.tip.getWorldPosition(new THREE.Vector3()));
   const base=root.worldToLocal(r.tool.localToWorld(new THREE.Vector3(0,.28,0)));
   if(a.previousTip){const points=[a.previousBase,a.previousTip,tip,a.previousBase,tip,base];const attr=a.trail.geometry.attributes.position;points.forEach((v,i)=>attr.setXYZ(i,v.x,v.y,v.z));attr.needsUpdate=true;a.trail.visible=true;}
   a.previousTip=tip;a.previousBase=base;
  }else{a.trail.visible=false;a.previousTip=null;a.previousBase=null;}
 }
}

// A relaxed index/middle-finger pinch, with the wrist driving a fixed-length arm.
export function createSmokingRig(materials){
 const root=new THREE.Group(),grip=new THREE.Group(),tool=new THREE.Group(),hand=new THREE.Group();root.add(grip);grip.add(hand,tool);
 add(hand,organic([[-.08,.035,.035,.06,.03],[-.025,.045,.055,.06,.025],[.03,.04,.048,.06,.02]],10),materials.glove);
 const paths=[[[.09,.02,.015],[.075,.085,-.01],[.02,.105,-.035],[-.006,.088,-.038]],[[.085,.0,.015],[.07,.065,-.015],[.02,.069,-.039],[-.009,.066,-.03]],[[.08,-.025,.01],[.056,-.005,-.035],[.02,-.024,-.04],[.025,-.044,-.01]],[[.076,-.05,.012],[.05,-.036,-.03],[.025,-.055,-.027],[.035,-.07,-.008]],[[.08,.02,.065],[.025,.03,.07],[-.005,.01,.04]]];
 for(const path of paths)for(let j=0;j<path.length-1;j++)phalanx(hand,path[j],path[j+1],.011,materials.skin);
 const wrist=anchor(hand,'smoking-hand-wrist',[.06,-.10,.04]);
 root.userData.smokingRig={grip,tool,hand,wrist,arm:makeArm(root,1,materials)};return root;
}
export function poseSmoking(root,{time=0,phase=null}={}){
 const r=root.userData.smokingRig;
 const lift=phase===null?0:phase<.55?Math.sin(phase/.55*Math.PI/2):phase<1.35?1:Math.max(0,1-(phase-1.35)/.55);
 r.grip.position.set(.24*(1-lift)+.025*lift,-.27+lift*.14+Math.sin(time*1.9)*.003,-.48+lift*.32);
 r.grip.rotation.set(-.08+lift*.08,-.16+lift*.16,-.15+lift*.15);
 root.updateMatrixWorld(true);solveArm(r.arm,root.worldToLocal(r.wrist.getWorldPosition(new THREE.Vector3())));root.updateMatrixWorld(true);
 if(root.userData.ember)root.userData.ember.material.uniforms.tint.value.setRGB(.85+lift*.15,.09+lift*.35,.015+lift*.04);
}
