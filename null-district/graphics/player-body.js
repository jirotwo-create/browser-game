import * as T from '../vendor/three.module.js';
import {batchRigidParts} from './rigid-batches.js';
import {organic} from './anatomy.js';
import {mesh,plate,loft,cylinder} from './models.js';
export function makePlayerBody(m){
 const root=new T.Group();root.name='courier-09-first-person-body';root.userData.boots=[];
 // Coordinates are relative to the standing eye. No head or duplicate viewmodel arms.
 const torso=mesh(root,organic([[-.86,.19,.12,0,.13],[-.73,.20,.13,0,.16],[-.62,.20,.12,0,.18],[-.54,.19,.11,0,.20]],12),m.coat);
 const tg=torso.geometry;for(let i=0;i<tg.attributes.position.count;i++)if(Math.abs(tg.attributes.normal.getY(i))>.9)tg.attributes.uv.setXY(i,tg.attributes.position.getX(i)/.4+.5,(tg.attributes.position.getZ(i)-.07)/.26);

 const belt=mesh(root,organic([[-.86,.21,.14,0,.13],[-.80,.215,.145,0,.13]],10),m.leather);
 plate(root,m.metal,.075,.055,.018,0,-.825,-.024);plate(root,m.edge,.04,.033,.021,0,-.825,-.034);
 for(const side of [-1,1]){
  const strap=plate(root,m.glove,.043,.22,.018,side*.13,-.67,.025);strap.rotation.z=side*.12;strap.rotation.x=.4;
  for(const y of [-.61,-.74])plate(root,m.edge,.049,.022,.023,side*.13,y,.025+(y+.67)*.4-.012);
  const pouch=mesh(root,loft([[-.11,.1,.065],[.10,.1,.065]]),m.glove,side*.17,-.8,.00);plate(pouch,m.metal,.065,.025,.012,0,.055,-.038);
 }
 const legs=[];
 for(const side of [-1,1]){
  const leg=new T.Group();leg.position.set(side*.105,-.86,.10);root.add(leg);legs.push(leg);
  mesh(leg,organic([[-.38,.072,.085,0,-.14],[-.29,.086,.096,0,-.10],[.0,.11,.105]],10),m.trousers);
  const knee=new T.Group();knee.position.set(0,-.38,-.14);leg.add(knee);
  mesh(knee,organic([[-.30,.046,.062],[-.19,.062,.075],[-.08,.07,.083],[0,.069,.083]],10),m.trousers);
  mesh(knee,loft([[-.07,.104,.03],[.055,.115,.035]]),m.metal,0,0,-.078);
  for(const y of [-.08,.07])plate(knee,m.glove,.15,.024,.02,0,y,-.05);
  const boot=new T.Group();boot.name='courier-armored-boot';knee.add(boot);root.userData.boots.push(boot);
  mesh(boot,organic([[-.39,.073,.14,0,-.06],[-.32,.077,.16,0,-.062],[-.25,.06,.10,0,-.01],[-.17,.046,.065]],10),m.boot);
  mesh(boot,loft([[-.392,.16,.28],[-.365,.16,.28]]),m.black,0,0,-.06);
  mesh(boot,loft([[-.33,.14,.11],[-.29,.13,.10]]),m.metal,0,0,-.15);
  for(let i=0;i<5;i++){const lace=plate(boot,m.bone,.077,.006,.012,0,-.245-i*.017,-.10+i*.005);lace.rotation.z=(i%2?1:-1)*.15;}
  leg.userData.knee=knee;
 }
 batchRigidParts(root);root.userData.legs=legs;root.userData.asset={name:'Courier 09 / patched ballistic streetwear',features:['headless first-person torso','stitched jacket','buckled harness','utility belt','cargo trousers','articulated knees','plated lace-up boots'],nativeResolution:true};return root;
}
export function posePlayerBody(root,{pitch=0,walk=0,moving=false,pistol=false}={}){
 root.rotation.x=-pitch;const stride=moving?.28:0;
 root.userData.legs.forEach((leg,i)=>{leg.rotation.x=Math.sin(walk*.5+i*Math.PI)*stride;leg.userData.knee.rotation.x=Math.max(0,-Math.sin(walk*.5+i*Math.PI))*(moving?.28:0);});
}
