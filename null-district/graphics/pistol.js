import * as T from '../vendor/three.module.js';
import {mesh,plate,cylinder,loft} from './models.js';
import {organic,polygonPrism} from './anatomy.js';
import {createHeldRig,solveHeldRig} from './weapon-rig.js';
import {pistolSurfaces} from './pistol-surfaces.js';
export const PISTOL={capacity:12,damage:2,interval:.32,reload:1.7};
export function makePistol(m){
 const root=createHeldRig(m),r=root.userData.rig,t=r.tool,s=pistolSurfaces();root.name='K13-weathered-tapered-pistol';
 const slide=new T.Group();slide.name='weathered-offset-receiver';t.add(slide);r.slide=slide;
 // A long exposed six-sided barrel emerging from a broad, faceted gunmetal body.
 // The rear is deliberately heavy and close in the first-person projection.
 const receiver=mesh(slide,loft([[-.285,.069,.058,.3],[-.235,.100,.078,.25],[-.06,.112,.088,.23],[.075,.126,.095,.25],[.125,.096,.078,.24]],'z'),s.chrome,0,.153,0);receiver.name='weathered-asymmetric-receiver';
 const rp=receiver.geometry.attributes.position;for(let i=0;i<rp.count;i++)if(rp.getX(i)>0&&rp.getY(i)>0)rp.setY(i,rp.getY(i)-rp.getX(i)*.13);receiver.geometry.computeVertexNormals();
 mesh(t,loft([[-.255,.066,.04,.25],[-.19,.084,.054,.3],[.09,.086,.058,.25],[.13,.056,.04,.28]],'z'),s.dark,0,.092,0);
 const barrel=mesh(t,loft([[-.66,.017,.021,.36],[-.57,.023,.029,.35],[-.39,.037,.044,.35],[-.235,.061,.058,.3]],'z'),s.barrel,0,.158,0);barrel.name='asymmetric-tapered-pistol-barrel';
 const bp=barrel.geometry.attributes.position;for(let i=0;i<bp.count;i++)bp.setX(i,bp.getX(i)+.008*(-.235-bp.getZ(i))/.425);barrel.geometry.computeVertexNormals();
 const collar=cylinder(t,s.chrome,.018,.032,6,.00636,.158,-.573);collar.rotation.x=Math.PI/2;collar.name='silver-front-barrel-collar';
 const rim=cylinder(t,s.edge,.0115,.012,6,.008,.158,-.667);rim.rotation.x=Math.PI/2;
 const bore=cylinder(t,s.bore,.0075,.013,7,.008,.158,-.675);bore.rotation.x=Math.PI/2;
 // Barrel ribs are part of the original mechanical silhouette, with no saw teeth.
 for(const z of [-.535,-.495]){const ring=cylinder(t,s.dark,z===-.535?.0145:.017,.009,6,.008*(-.235-z)/.425,.158,z);ring.rotation.x=Math.PI/2;}
 plate(t,s.chrome,.017,.034,.019,.0063,.193,-.566).name='tall-pale-front-post';
 plate(t,s.dark,.010,.012,.012,.0063,.215,-.566);
 // Broad receiver cheeks, ink-dark recesses and bright hard polygon edges.
 for(const side of [-1,1]){
  const cheek=mesh(slide,polygonPrism([[-.235,.117],[-.218,.181],[-.105,.195],[.073,.194],[.118,.169],[.10,.116],[-.04,.107]],.006,.002),s.chrome,side*.057,0,0);cheek.rotation.y=-Math.PI/2;cheek.name='weathered-receiver-cheek';
  for(let i=0;i<5;i++){const rib=plate(slide,s.dark,.009,.051,.009,side*.061,.156,.065-i*.02);rib.rotation.x=-.22;plate(slide,s.edge,.01,.04,.003,side*.063,.158,.069-i*.02);}
  plate(slide,s.edge,.005,.009,.245,side*.057,.198,-.065);
  for(const z of [-.16,.075]){const pin=cylinder(slide,s.edge,.006,.008,6,side*.063,.141,z);pin.rotation.z=Math.PI/2;}
 }
 plate(slide,s.dark,.007,.027,.082,.060,.177,-.13);plate(slide,s.chrome,.009,.013,.041,.064,.179,-.14);
 plate(t,s.dark,.022,.025,.23,-.061,.10,-.105);plate(slide,s.chrome,.026,.027,.045,.069,.181,.025);
 // Rear cap carries the same oxidized gunmetal; no large label facing the camera.
 plate(slide,s.chrome,.089,.069,.012,0,.153,.13);
 plate(slide,s.dark,.046,.013,.014,0,.169,.139);
 for(const x of [-.033,.033]){const screw=cylinder(slide,s.dark,.005,.007,6,x,.133,.139);screw.rotation.x=Math.PI/2;}
 // One conspicuous, solid violet rear sight is the reference's color anchor.
 const sight=mesh(slide,loft([[-.018,.060,.028,.18],[.016,.047,.025,.18]]),s.violet,0,.215,-.11);sight.name='prominent-violet-rear-sight';
 plate(slide,s.dark,.014,.017,.03,0,.225,-.11);
 mesh(t,organic([[-.17,.030,.038,0,.05],[-.12,.036,.042,0,.035],[-.03,.035,.042],[.065,.032,.04]],8),s.grip).name='dark-raked-grip';
 for(const side of [-1,1]){for(let i=0;i<6;i++)plate(t,s.barrel,.006,.008,.052,side*.036,-.12+i*.022,.034-i*.004);}
 const mag=mesh(t,loft([[-.19,.075,.081],[-.169,.068,.076]]),s.dark,0,0,.05);r.magazine=mag;
 // The closed trigger guard and exact trigger contact preserve the two-hand grip.
 for(const [a,b]of [[[0,.08,-.085],[0,.08,-.17]],[[0,.08,-.17],[0,-.005,-.155]],[[0,-.005,-.155],[0,-.02,-.035]]]){const d=new T.Vector3(...b).sub(new T.Vector3(...a)),tube=cylinder(t,s.chrome,.007,d.length(),5,...new T.Vector3(...a).addScaledVector(d,.5).toArray());tube.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
 const trigger=cylinder(t,s.dark,.007,.035,6,.012,.065,-.14);trigger.rotation.x=-.25;
 r.trigger=new T.Object3D();r.trigger.position.set(.018,.065,-.14);t.add(r.trigger);
 r.muzzle=new T.Object3D();r.muzzle.position.set(.008,.158,-.686);t.add(r.muzzle);
 // Project the painted receiver once in assembled coordinates, not once per tiny rib.
 slide.updateMatrixWorld(true);const inv=slide.matrixWorld.clone().invert();
 slide.traverse(o=>{if(!o.isMesh||o.material!==s.chrome)return;const g=o.geometry,p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;if(!u)return;const transform=inv.clone().multiply(o.matrixWorld),normal=new T.Matrix3().getNormalMatrix(transform);
  for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(transform),a=new T.Vector3().fromBufferAttribute(n,i).applyMatrix3(normal);if(Math.abs(a.z)>.7)u.setXY(i,v.x/.13+.5,(v.y-.10)/.11);else if(Math.abs(a.y)>.7)u.setXY(i,(v.z+.285)/.41,v.x/.13+.5);else u.setXY(i,(v.z+.285)/.41,(v.y-.10)/.11);}u.needsUpdate=true;
 });
 root.userData.asset={name:'K-13 / IRON WITNESS',style:'dark weathered PSX gunmetal / tapered asymmetric barrel / violet sight',capacity:12,damage:2,features:['slim tapered six-sided barrel','asymmetric sloped receiver','dark oxidized gunmetal paint','prominent violet sight','dark grip','open muzzle','ejection port','slide lock','two-handed support','animated magazine']};posePistol(root);return root;
}
export function posePistol(root,{time=0,walk=0,recoil=0,reload=0,empty=false}={}){
 const r=root.userData.rig,progress=reload>0?1-reload/PISTOL.reload:0,reach=reload>0?Math.sin(progress*Math.PI):0;
 r.grip.position.set(.27+Math.sin(walk*.5)*.004,-.38-Math.abs(Math.cos(walk))*.004-reach*.025,-.56+recoil*.5);
 r.grip.rotation.set(-.02-recoil*1.6,.08,-.035-reach*.2);
 r.support.position.set(-reach*.01,-.018-reach*.3,.035+reach*.02);r.support.rotation.set(0,reach*.5,-reach*.25);
 r.slide.position.z=empty&&(!reload||progress<.85)?.045:Math.max(0,recoil*.31);
 r.magazine.position.y=-reach*.15;r.mode=reload>0?'reload':empty?'slide-locked':'ready';solveHeldRig(root);
}
