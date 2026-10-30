import * as T from '../vendor/three.module.js';
import {organic,faceGeometry,polygonPrism} from './anatomy.js';
import {mesh,plate,cylinder} from './models.js';
function finger(parent,m,a,b,r=.011){const d=new T.Vector3(...b).sub(new T.Vector3(...a)),o=mesh(parent,organic([[0,r,r],[1,r*.8,r*.85]],6),m,...a);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());o.scale.y=d.length();}
function hand(parent,m){
 const palm=mesh(parent,organic([[-.055,.034,.032],[0,.04,.036],[.05,.03,.029]],10),m.glove,0,-.315,.017);palm.name='articulated-human-hand';
 for(let i=0;i<4;i++){
  const a=(i-1.5)*.018,y=-.35;finger(parent,m.skin,[a,y,.03],[a,y-.032,.044]);finger(parent,m.skin,[a,y-.032,.044],[a,y-.055,.026],.009);finger(parent,m.skin,[a,y-.055,.026],[a,y-.057,.004],.008);
 }
 finger(parent,m.skin,[.032,-.3,.028],[.05,-.334,.054],.013);finger(parent,m.skin,[.05,-.334,.054],[.024,-.35,.064],.011);
}
export function makeHuman(m,variant=0){
 const g=new T.Group(),torso=new T.Group(),head=new T.Group(),legs=[],knees=[],arms=[];g.add(torso,head);head.scale.set(.84,.84,1);head.position.y=.256;
 const skin=[m.skin,m.skinDeep,m.skinPale][variant%3],face=[m.face,m.faceDeep,m.facePale][variant%3],cloth=variant%2?m.dark:m.coat;
 mesh(torso,organic([[.87,.14,.09],[.95,.165,.105],[1.08,.135,.09],[1.20,.16,.105],[1.32,.195,.12],[1.43,.20,.105],[1.49,.155,.085],[1.52,.09,.065]],14),cloth);
 mesh(torso,organic([[.84,.16,.10],[.93,.175,.11],[1.02,.14,.095]],12),m.black);
 for(const side of [-1,1]){
  mesh(torso,polygonPrism([[side*.025,1.11],[side*.17,1.43],[side*.085,1.50]],.012,.004),m.dark,0,0,.119);
  const pouch=mesh(torso,organic([[-.07,.043,.03],[.07,.043,.03]],8),m.glove,side*.105,.92,.11);plate(pouch,m.metal,.05,.012,.012,0,.02,.034);
  for(let i=0;i<3;i++)plate(torso,m.bone,.006,.008,.007,side*.16,1.22+i*.032,.105);
  const tail=mesh(torso,polygonPrism([[side*.025,.94],[side*.16,.97],[side*.195,.65],[side*.065,.67]],.012,.003),cloth,0,0,-.086);
 }
 plate(torso,m.metal,.045,.035,.018,0,.935,.122);
 mesh(g,organic([[1.48,.055,.055],[1.65,.05,.055]],10),skin);
 mesh(head,organic([[1.62,.048,.065],[1.70,.11,.10],[1.82,.122,.11],[1.91,.105,.094],[1.955,.06,.065]],16),skin,0,0,-.035);
 const fg=faceGeometry();fg.scale(.80,1,.90);fg.translate(0,.035,0);
 for(let i=0;i<fg.attributes.position.count;i++)if(fg.attributes.position.getY(i)<1.64)fg.attributes.position.setY(i,1.64);fg.computeVertexNormals();mesh(head,fg,face);
 mesh(head,organic([[1.638,.054,.044,0,.053],[1.675,.083,.063,0,.035],[1.725,.103,.076,0,.015]],12),skin);
 for(const side of [-1,1]){
  mesh(head,new T.IcosahedronGeometry(.027,1),skin,side*.124,1.76,-.006,[.55,1,.55]);
  mesh(head,new T.IcosahedronGeometry(.018,0),m.eye,side*.043,1.779,.139,[1,.45,.35]);
  mesh(head,new T.IcosahedronGeometry(.009,0),m.black,side*.043,1.779,.148,[.7,1,.3]);
  mesh(head,polygonPrism([[-.031,0],[.031,.003],[.023,.013],[-.028,.015]],.004,.001),m.hair,side*.043,1.800,.14);
 }
 mesh(head,organic([[1.85,.124,.109],[1.92,.101,.095],[1.98,.065,.061]],14),m.hair,0,0,-.038);
 if(variant%3===2){const part=mesh(head,polygonPrism([[-.09,0],[.08,.03],[.035,.085],[-.07,.07]],.035,.006),m.hair,0,1.90,.018);part.rotation.z=-.12;}
 if(variant%3===1)for(const side of [-1,1])mesh(head,organic([[1.72,.018,.04],[1.9,.02,.055]],6),m.hair,side*.107,0,-.04);
 for(const side of [-1,1]){
  const leg=new T.Group();leg.position.set(side*.09,.9,0);g.add(leg);legs.push(leg);
  mesh(leg,organic([[-.43,.052,.059,side*.008,0],[-.32,.072,.078],[-.16,.088,.089],[0,.088,.085]],12),cloth);
  const knee=new T.Group();knee.position.set(side*.008,-.43,0);leg.add(knee);knees.push(knee);
  mesh(knee,organic([[-.34,.033,.044,0,.01],[-.24,.044,.057],[-.10,.057,.063],[0,.052,.06]],10),cloth);
  mesh(knee,organic([[-.46,.049,.105,0,.05],[-.39,.054,.115,0,.045],[-.33,.036,.05]],10),m.black);
  for(let k=0;k<3;k++)plate(knee,m.metal,.06,.007,.016,0,-.37-k*.015,.109-k*.008);
  const arm=new T.Group();arm.position.set(side*.205,1.45,0);arm.rotation.z=side*.07;g.add(arm);arms.push(arm);
  mesh(arm,organic([[-.30,.039,.043],[-.23,.055,.059],[-.12,.071,.073],[-.04,.074,.068],[0,.065,.059]],12),cloth);
  const fore=new T.Group();fore.position.y=-.30;fore.rotation.x=-.5;arm.add(fore);arm.userData.forearm=fore;
  mesh(fore,organic([[-.285,.025,.032],[-.22,.037,.043],[-.12,.048,.049],[0,.039,.041]],10),cloth);
  mesh(fore,organic([[-.29,.030,.036],[-.265,.032,.038]],10),m.glove);hand(fore,{...m,skin});
 }
 g.userData.asset={redesignedHuman:true,features:['slim anatomical torso','defined jaw and cheek planes','painted facial features','modeled ears and eyes','jointed finger segments','tailored clothing','belt hardware','segmented boots']};
 return {g,torso,head,legs,knees,arms};
}
