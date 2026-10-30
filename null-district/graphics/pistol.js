import * as T from '../vendor/three.module.js';
import {mesh,plate,cylinder,loft} from './models.js';
import {organic,polygonPrism} from './anatomy.js';
import {createHeldRig,solveHeldRig} from './weapon-rig.js';
export const PISTOL={capacity:12,damage:2,interval:.32,reload:1.7};
export function makePistol(m){
 const root=createHeldRig(m),r=root.userData.rig,t=r.tool;root.name='K13-IRON-WITNESS-pistol';
 const slide=new T.Group();t.add(slide);r.slide=slide;
 mesh(slide,loft([[-.38,.074,.066],[-.32,.10,.078],[.07,.10,.078],[.11,.07,.06]],'z'),m.pistolSteel,0,.17,0);
 mesh(t,loft([[-.29,.066,.055],[.06,.08,.055],[.10,.06,.055]],'z'),m.pistolFrame,0,.105,0);
 const grip=mesh(t,organic([[-.17,.031,.039,0,.05],[-.12,.037,.043,0,.035],[-.03,.037,.043],[.065,.033,.041]],8),m.glove);grip.name='raked-pistol-grip';
 const mag=mesh(t,loft([[-.19,.076,.085],[-.168,.072,.078]]),m.pistolFrame,0,0,.05);r.magazine=mag;
 cylinder(t,m.black,.028,.075,9,0,.17,-.389).rotation.x=Math.PI/2;
 cylinder(t,m.edge,.034,.014,9,0,.17,-.423).rotation.x=Math.PI/2;
 const bore=cylinder(t,m.black,.021,.017,9,0,.17,-.433);bore.rotation.x=Math.PI/2;
 // Recessed ejection port, chamber block and exposed side mechanism.
 plate(slide,m.black,.008,.036,.089,.052,.184,-.05);plate(slide,m.edge,.009,.024,.052,.056,.18,-.06);
 for(const side of [-1,1]){
  for(let i=0;i<6;i++){const s=plate(slide,m.black,.008,.047,.008,side*.052,.17,.025-i*.012);s.rotation.x=.13;}
  plate(slide,m.edge,.006,.011,.29,side*.050,.204,-.15);
  const cheek=mesh(t,polygonPrism([[-.027,-.14],[.027,-.14],[.035,.025],[-.025,.028]],.008,.004),m.pistolFrame,side*.037,0,.015);cheek.rotation.y=side*Math.PI/2;
  for(const y of [-.13,-.045]){const pin=cylinder(t,m.edge,.006,.008,6,side*.045,y,.035);pin.rotation.z=Math.PI/2;}
 }
 // Rear slide plate, fasteners and a painted maker's serial label.
 plate(slide,m.pistolFrame,.056,.046,.012,0,.17,.115);
 for(const x of [-.02,.02]){const screw=cylinder(slide,m.edge,.005,.008,6,x,.181,.127);screw.rotation.x=Math.PI/2;}
 mesh(slide,new T.PlaneGeometry(.045,.022),m.pistolSerial,0,.154,.129);
 plate(slide,m.black,.022,.014,.021,0,.207,.10);
 // A deliberate purple rear sight and thin pale front blade echo the reference's contrast.
 for(const x of [-.034,.034])plate(slide,m.pistolSight,.012,.014,.018,x,.215,.05);
 plate(slide,m.pistolSight,.027,.007,.014,0,.212,.055);plate(slide,m.bone,.010,.032,.016,0,.226,-.325);
 for(const [a,b]of [[[.0,.08,-.085],[.0,.08,-.17]],[[.0,.08,-.17],[.0,-.005,-.155]],[[.0,-.005,-.155],[.0,-.02,-.035]]]){const d=new T.Vector3(...b).sub(new T.Vector3(...a)),tube=cylinder(t,m.pistolFrame,.008,d.length(),6,...new T.Vector3(...a).addScaledVector(d,.5).toArray());tube.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
 const trigger=cylinder(t,m.edge,.007,.035,6,.012,.065,-.14);trigger.rotation.x=-.25;
 r.trigger=new T.Object3D();r.trigger.position.set(.018,.065,-.14);t.add(r.trigger);
 r.muzzle=new T.Object3D();r.muzzle.position.set(0,.17,-.45);t.add(r.muzzle);
 // Project each face coherently: no repeated triangle atlas on the slide's end cap.
 slide.traverse(o=>{if(!o.isMesh)return;const g=o.geometry,p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;if(!u||o.material===m.pistolSerial)return;g.computeBoundingBox();const b=g.boundingBox,size=b.getSize(new T.Vector3());
  for(let i=0;i<p.count;i++){const x=(p.getX(i)-b.min.x)/Math.max(.001,size.x),y=(p.getY(i)-b.min.y)/Math.max(.001,size.y),z=(p.getZ(i)-b.min.z)/Math.max(.001,size.z);
   if(Math.abs(n.getZ(i))>.7)u.setXY(i,.78+x*.2,.02+y*.12);else if(Math.abs(n.getY(i))>.7)u.setXY(i,z,x);else u.setXY(i,z,y);
  }u.needsUpdate=true;
 });
 root.userData.asset={name:'K-13 / IRON WITNESS',style:'painted PSX steel / angular slide / magenta sight',capacity:12,damage:2,features:['point-filtered painted metal','beveled slide','open muzzle','ejection port','slide lock','serrated rear grip','two-handed support','animated magazine']};posePistol(root);return root;
}
export function posePistol(root,{time=0,walk=0,recoil=0,reload=0,empty=false}={}){
 const r=root.userData.rig,progress=reload>0?1-reload/PISTOL.reload:0,reach=reload>0?Math.sin(progress*Math.PI):0;
 r.grip.position.set(.145+Math.sin(walk*.5)*.004,-.24-Math.abs(Math.cos(walk))*.004-reach*.025,-.40+recoil*.5);
 r.grip.rotation.set(-.04-recoil*1.6,.045,-.02-reach*.2);
 r.support.position.set(-reach*.01,-.018-reach*.3,.035+reach*.02);r.support.rotation.set(0,reach*.5,-reach*.25);
 r.slide.position.z=empty&&(!reload||progress<.85)?.045:Math.max(0,recoil*.31);
 r.magazine.position.y=-reach*.15;r.mode=reload>0?'reload':empty?'slide-locked':'ready';solveHeldRig(root);
}
