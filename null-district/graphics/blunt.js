import * as T from '../vendor/three.module.js';
import {createSmokingRig,poseSmoking} from './weapon-rig.js';
import {gearSurface} from './gear-materials.js';
import {organic} from './anatomy.js';
export function makeBlunt(materials){
 const root=createSmokingRig(materials),r=root.userData.smokingRig;root.name='permanent-marijuana-blunt';
 const leaf=gearSurface(0x70432a,{polish:.1}),ash=gearSurface(0x4b4944),emberMat=gearSurface(0xff5a16,{emission:1});
 const roll=new T.Mesh(organic([[-.09,.010,.011],[-.075,.014,.013],[-.03,.013,.014],[.025,.012,.013],[.08,.011,.012],[.09,.009,.009]],9),leaf);roll.rotation.x=Math.PI/2;roll.position.set(0,.086,-.065);r.tool.add(roll);
 // Raised spiral leaf seam and fine creases retain their silhouette at native size.
 const seamPoints=[];for(let i=0;i<60;i++){const t=i/59,a=t*Math.PI*7;seamPoints.push(new T.Vector3(Math.cos(a)*.013,.086+Math.sin(a)*.013,-.15+t*.17));}
 const seam=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(seamPoints),60,.00065,3,false),gearSurface(0x382719));r.tool.add(seam);
 const ashTip=new T.Mesh(new T.CylinderGeometry(.011,.013,.018,9),ash);ashTip.rotation.x=Math.PI/2;ashTip.position.set(0,.086,-.159);r.tool.add(ashTip);
 const ember=new T.Mesh(new T.IcosahedronGeometry(.014,1),emberMat);ember.scale.set(1,1,.4);ember.position.set(0,.086,-.17);r.tool.add(ember);root.userData.ember=ember;
 const tip=new T.Object3D();tip.position.set(0,.086,-.174);r.tool.add(tip);root.userData.smokeTip=tip;
 root.userData.asset={name:'NIGHT LEAF / marijuana blunt',permanent:true,features:['rolled tobacco-leaf wrapper','spiral leaf seam','charred ash','animated ember','pinched fingers','fixed-length arm']};poseSmoking(root);return root;
}
// Soft procedural smoke, composited with player gear at native resolution.
export function createSmoke(scene){
 const geometry=new T.PlaneGeometry(1,1),particles=[];let emitted=0,accumulator=0,exhaleAccumulator=0;
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,uniforms:{opacity:{value:1}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float opacity;void main(){vec2 p=(v-.5)*2.;float r=length(p);float curl=sin(p.x*8.+p.y*9.)*.04;float a=pow(max(0.,1.-r+curl),2.)*.22*opacity;gl_FragColor=vec4(.68,.75,.77,a);}'});
 function emit(point,exhale){
  const mesh=new T.Mesh(geometry,material.clone());mesh.position.copy(point);mesh.rotation.z=emitted*2.4;mesh.scale.setScalar(exhale?.065:.025);scene.add(mesh);
  particles.push({mesh,age:0,life:exhale?2.2:1.4,size:exhale?.065:.025,exhale,velocity:new T.Vector3(Math.sin(emitted*2.3)*.035,exhale?.055:.09,exhale?-.27:-.025)});emitted++;
  if(particles.length>72){const p=particles.shift();scene.remove(p.mesh);p.mesh.material.dispose();}
 }
 return {
  tick(dt,blunt,phase,visible){
   accumulator+=dt;
   if(visible&&accumulator>.08){accumulator=0;blunt.updateMatrixWorld(true);emit(blunt.userData.smokeTip.getWorldPosition(new T.Vector3()),false);}
   if(phase!==null&&phase>=1.45&&phase<2.5){exhaleAccumulator+=dt;while(exhaleAccumulator>=.035){exhaleAccumulator-=.035;emit(new T.Vector3((Math.random()-.5)*.045,-.06,-.13),true);}}else exhaleAccumulator=0;
   for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.age+=dt;p.mesh.position.addScaledVector(p.velocity,dt);p.velocity.x+=Math.sin(p.age*4+i)*dt*.03;p.mesh.rotation.z+=dt*.12;p.mesh.scale.setScalar(p.size+p.age*(p.exhale?.18:.06));p.mesh.material.uniforms.opacity.value=Math.max(0,1-p.age/p.life);if(p.age>=p.life){scene.remove(p.mesh);p.mesh.material.dispose();particles.splice(i,1);}}
  },
  clear(){for(const p of particles){scene.remove(p.mesh);p.mesh.material.dispose();}particles.length=0;accumulator=exhaleAccumulator=0;},
  get diagnostics(){return {particles:particles.length,emitted,nativeResolution:true};}
 };
}
