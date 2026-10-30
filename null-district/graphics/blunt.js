import * as T from '../vendor/three.module.js';
import {createSmokingRig,poseSmoking} from './weapon-rig.js';
import {gearSurface} from './gear-materials.js';
import {paintGearTexture} from './painted-surfaces.js';
import {organic,polygonPrism} from './anatomy.js';
export function makeBlunt(materials){
 const root=createSmokingRig(materials),r=root.userData.smokingRig;root.name='permanent-marijuana-blunt';
 const leaf=gearSurface(0x8a7040,{polish:.06,texture:paintGearTexture('leaf')}),ash=gearSurface(0x77766a),emberMat=gearSurface(0xff5a16,{emission:1});
 // Full, uneven hand roll: broad burning end, packed middle, pinched mouth end.
 const roll=new T.Mesh(organic([[-.087,.019,.020],[-.068,.021,.022,-.001,0],[-.025,.023,.022,.001,-.001],[.025,.019,.018,-.002,0],[.064,.013,.014],[.083,.010,.010],[.094,.005,.006,.002,0]],11),leaf);roll.name='fat-hand-rolled-cannabis-blunt';roll.rotation.x=Math.PI/2;roll.position.set(0,.086,-.065);r.tool.add(roll);
 const seamPoints=[];for(let i=0;i<70;i++){const t=i/69,a=t*Math.PI*5,rad=.020-.008*t;seamPoints.push(new T.Vector3(Math.cos(a)*rad,.086+Math.sin(a)*rad,-.148+t*.17));}
 const seam=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(seamPoints),70,.001,3,false),gearSurface(0x42391c));r.tool.add(seam);
 // Ragged ash collar with irregular charred leaf teeth, rather than a cigar cap.
 const char=gearSurface(0x24271e),green=gearSurface(0x55712f),purple=gearSurface(0x53405c),resin=gearSurface(0x9b7535);
 const ashTip=new T.Mesh(organic([[-.010,.019,.019],[0,.022,.020,.001,0],[.012,.020,.021,-.001,.001]],11),ash);ashTip.rotation.x=Math.PI/2;ashTip.position.set(0,.086,-.16);r.tool.add(ashTip);
 for(let i=0;i<13;i++){const a=i/13*Math.PI*2,chip=new T.Mesh(new T.IcosahedronGeometry(.005+(i%3)*.001,0),i%3===0?ash:char);chip.position.set(Math.cos(a)*.019,.086+Math.sin(a)*.019,-.164-(i%4)*.002);chip.scale.z=.65;r.tool.add(chip);}
 const ember=new T.Mesh(new T.IcosahedronGeometry(.019,1),emberMat);ember.scale.set(1,1,.25);ember.position.set(0,.086,-.174);r.tool.add(ember);root.userData.ember=ember;
 for(let i=0;i<17;i++){const a=i*2.4,rad=.014*Math.sqrt((i+1)/18),bud=new T.Mesh(new T.IcosahedronGeometry(.004+(i%3)*.001,0),[green,purple,resin,char][i%4]);bud.position.set(Math.cos(a)*rad,.086+Math.sin(a)*rad,-.178-(i%2)*.001);bud.scale.set(1,.8,.55);r.tool.add(bud);}
 // Small seven-finger green leaf stamp, embossed on the upward-facing wrapper.
 const badge=new T.Group();badge.name='seven-finger-cannabis-leaf-stamp';badge.position.set(0,.111,-.105);badge.rotation.x=-Math.PI/2;badge.scale.setScalar(1.2);r.tool.add(badge);
 const leafInk=gearSurface(0x62a63c,{emission:.2});for(let i=0;i<7;i++){const angle=(i-3)*.38,len=.012-Math.abs(i-3)*.0015,g=new T.Mesh(polygonPrism([[0,0],[-.0025,len*.38],[-.0018,len*.62],[-.0025,len*.67],[0,len],[.0025,len*.67],[.0018,len*.62],[.0025,len*.38]],.0002,0),leafInk);g.rotation.z=angle;badge.add(g);}
 const stem=new T.Mesh(new T.BoxGeometry(.0015,.008,.0003),leafInk);stem.position.y=-.003;badge.add(stem);
 const tip=new T.Object3D();tip.position.set(0,.086,-.184);r.tool.add(tip);root.userData.smokeTip=tip;
 root.userData.asset={name:'NIGHT LEAF / hand-rolled cannabis blunt',permanent:true,features:['fat uneven cone silhouette','pinched twisted mouth end','olive-brown veined tobacco leaf','raised hand-rolled seam','ragged charcoal ash','green-purple packed flower','seven-finger cannabis leaf stamp','animated ember','pinched fingers','fixed-length arm']};poseSmoking(root);return root;
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
