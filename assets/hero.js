import * as T from './vendor/three.module.js';
import {mats,mesh,weapon} from './models.js';
// Original articulated low-poly hero: obsidian plate, crimson cape and a silver executioner's blade.
export function hero(){
 const root=new T.Group();root.name='The Unburnt';
 const body=new T.Group();body.position.y=1.15;root.add(body);
 const plate=(g,w,h,d,x,y,z,mat=mats.dark)=>mesh(g,new T.BoxGeometry(w,h,d),mat,x,y,z);
 const facet=(g,r,x,y,z,mat=mats.dark)=>mesh(g,new T.IcosahedronGeometry(r,0),mat,x,y,z);
 mesh(body,new T.CylinderGeometry(.39,.26,.72,6),mats.dark,0,.45,0);
 const chest=facet(body,.36,0,.57,.13);chest.scale.set(1,.85,.65);
 for(const side of [-1,1])plate(body,.035,.46,.04,side*.14,.47,.355,mats.edge).rotation.z=side*.27;
 facet(body,.085,0,.53,.38,mats.eye);plate(body,.62,.12,.43,0,.05,0,mats.iron);
 for(const side of [-1,1]){
  const leg=new T.Group();leg.position.set(side*.2,.02,0);root.add(leg);
  plate(leg,.23,.52,.25,0,.88,0);facet(leg,.15,0,.61,.07,mats.iron);
  plate(leg,.23,.43,.25,side*.025,.36,.02);plate(leg,.29,.2,.44,side*.035,.1,.11);
  for(let i=0;i<3;i++)plate(leg,.24,.035,.04,0,.23+i*.1,.16,mats.iron);
  root.userData[side<0?'leftLeg':'rightLeg']=leg;
  const skirt=plate(body,.24,.36,.08,side*.22,-.14,.22);skirt.rotation.z=side*.15;
 }
 const head=new T.Group();head.position.set(0,1.09,0);body.add(head);
 const helm=facet(head,.265,0,0,0);helm.scale.set(1,1.25,.9);
 plate(head,.39,.07,.07,0,.015,.225,mats.iron);plate(head,.32,.027,.025,0,.019,.267,mats.eye);
 const beak=mesh(head,new T.ConeGeometry(.16,.32,4),mats.dark,0,-.15,.14,Math.PI,0,0);
 for(const side of [-1,1])mesh(head,new T.ConeGeometry(.085,.42,4),mats.iron,side*.2,.28,-.04,0,0,-side*.45);
 const cape=new T.Group();cape.position.set(0,.82,-.21);body.add(cape);
 for(let i=0;i<5;i++){const strip=plate(cape,.19,1.35+(i%2)*.12,.04,(i-2)*.18,-.59,-.12,mats.blood);strip.rotation.x=-.15;strip.rotation.z=(i-2)*.05;}
 const arms=[];
 for(const side of [-1,1]){
  const arm=new T.Group();arm.position.set(side*.43,.78,0);body.add(arm);arms.push(arm);
  const shoulder=facet(arm,.255,side*.06,0,0);shoulder.scale.set(1.3,.65,1);
  for(let i=0;i<2;i++)mesh(arm,new T.ConeGeometry(.075,.26,4),mats.edge,side*(.08+i*.13),.2,0,0,0,-side*.5);
  plate(arm,.17,.36,.2,side*.09,-.24,0);facet(arm,.12,side*.1,-.46,.02,mats.iron);
  plate(arm,.2,.31,.23,side*.09,-.58,.04);facet(arm,.12,side*.09,-.79,.09,mats.iron);
 }
 const blade=weapon('thorn');blade.scale.setScalar(.68);blade.position.set(-.09,-.37,.17);blade.rotation.z=Math.PI+.16;arms[0].add(blade);
 root.userData={...root.userData,body,head,cape,swordArm:arms[0],castArm:arms[1],blade};
 return root;
}
