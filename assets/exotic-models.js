import {NEW_RELIC_IDS,newRelicModel} from './new-relic-models.js';
import * as T from './vendor/three.module.js';
import {mats,mesh,weapon,armor,talent} from './models.js';
const box=(g,m,x,y,z,w,h,d,rz=0)=>mesh(g,new T.BoxGeometry(w,h,d),m,x,y,z,0,0,rz);
const orb=(g,m,x,y,z,r,sx=1,sy=1,sz=1)=>{const o=mesh(g,new T.IcosahedronGeometry(r,0),m,x,y,z);o.scale.set(sx,sy,sz);return o;};
const cone=(g,m,x,y,z,r,h,rz=0)=>mesh(g,new T.ConeGeometry(r,h,5),m,x,y,z,0,0,rz);
const ring=(g,m,x,y,z,r,t=.035,rx=0,ry=0,rz=0)=>mesh(g,new T.TorusGeometry(r,t,4,12),m,x,y,z,rx,ry,rz);
const skull=(g,x,y,z,size=.6)=>{const s=talent('resolve');s.scale.setScalar(size);s.position.set(x,y,z);g.add(s);return s;};
const add=(g,o,x=0,y=0,z=0,scale=1)=>{o.position.set(x,y,z);o.scale.setScalar(scale);g.add(o);return o;};
const chain=(g,x,y,z,n=7)=>{for(let i=0;i<n;i++)ring(g,mats.gold,x,y-i*.085,z,.055,.012,i%2?Math.PI/2:0);};
function crown(g,mat=mats.gold){mesh(g,new T.CylinderGeometry(.55,.49,.19,10,true),mat,0,-.15,0);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;cone(g,mat,Math.sin(a)*.51,.09,Math.cos(a)*.51,.11,.43);}}
function glove(g,x,mat=mats.iron){box(g,mat,x,-.08,0,.28,.45,.16);for(let i=0;i<4;i++)box(g,mat,x-.11+i*.075,.27,.02,.055,.34-(i===3?.07:0),.09);box(g,mat,x-.23,-.02,.03,.09,.28,.1,-.5);box(g,mats.gold,x,-.32,0,.34,.12,.21);}
function parchment(g,x=0,y=0,z=0){box(g,mats.bone,x,y,z,.7,.91,.035);for(let i=0;i<5;i++)box(g,mats.blood,x-.025,y+.28-i*.12,z+.025,.47-(i%2)*.12,.024,.015);}
export function exoticModel(id){
 if(NEW_RELIC_IDS.includes(id))return newRelicModel(id);
 const g=new T.Group();g.userData.asset=id;
 if(id==='mouth'){
  const w=weapon('god');g.add(w);for(let side of [-1,1])for(let i=0;i<5;i++)cone(g,mats.bone,side*.35,-.1+i*.21,.035,.055,.2,side*Math.PI/2);
  box(g,mats.dark,0,.38,.14,.34,.65,.12);for(const x of [-.22,.22]){box(g,mats.dark,x,.26,.06,.15,.55,.19);cone(g,mats.gold,x,.66,.06,.14,.38);}orb(g,mats.eye,0,.42,.24,.075);
 }else if(id==='probate'){
  add(g,weapon('reaper'),-.23,0,0,.95);parchment(g,.17,-.19,.07);chain(g,.4,.45,.12);orb(g,mats.eye,.38,-.12,.14,.075);
 }else if(id==='echoBlade'){
  const a=add(g,weapon('thorn'),-.16,0,.1,.93);a.rotation.z=-.12;const b=add(g,weapon('fang'),.16,0,-.14,.93);b.rotation.z=.12;
  for(let i=0;i<5;i++)orb(g,mats.violet,-.35+i*.16,.56-i*.12,.2,.04);
 }else if(id==='tea'){
  orb(g,mats.iron,0,-.1,0,.51,1,.8,1);mesh(g,new T.CylinderGeometry(.24,.35,.09,8),mats.gold,0,.28,0);orb(g,mats.bone,0,.37,0,.07);
  mesh(g,new T.CylinderGeometry(.11,.22,.61,6),mats.gold,-.49,.05,0,0,0,-.85);ring(g,mats.dark,.52,.06,0,.28,.065);
  for(const x of [-.16,.16])orb(g,mats.violet,x,-.08,.44,.08,.7,.65,.25);
  for(let i=0;i<4;i++)orb(g,mats.cyan,(i%2?-.08:.08),.5+i*.16,0,.07,.7,1.4,.7);
 }else if(id==='meteor'){
  box(g,mats.dark,0,-.42,0,.13,1.48,.13);orb(g,mats.gold,0,-1.12,0,.12);orb(g,mats.rust,0,.45,0,.51);orb(g,mats.eye,0,.45,.38,.19);
  for(let i=0;i<7;i++){const a=i*6.28/7;cone(g,mats.dark,Math.sin(a)*.47,.45+Math.cos(a)*.37,0,.1,.38,-a);}chain(g,-.24,.33,.22,9);
 }else if(id==='sutures'){
  glove(g,-.27,mats.bone);glove(g,.27,mats.blood);for(let i=0;i<5;i++){box(g,mats.dark,-.27,-.18+i*.075,.095,.23,.017,.02,.2);box(g,mats.gold,.27,-.18+i*.075,.095,.23,.017,.02,-.2);}ring(g,mats.eye,0,.1,.03,.1,.02);
 }else if(id==='moth'){
  for(const side of [-1,1]){orb(g,mats.cloth,side*.35,.14,0,.45,1,1.45,.18);orb(g,mats.blood,side*.25,-.4,0,.3,1,1.25,.18);for(let i=0;i<3;i++)orb(g,mats.violet,side*(.22+i*.13),.35-i*.16,.1,.05);}box(g,mats.dark,0,.03,0,.14,.95,.13);cone(g,mats.bone,-.08,.63,0,.03,.26,-.4);cone(g,mats.bone,.08,.63,0,.03,.26,.4);
 }else if(id==='halo'){
  ring(g,mats.cyan,0,0,0,.56,.065);for(let i=0;i<8;i++){const a=i*6.28/8;const p=mesh(g,new T.OctahedronGeometry(.16,0),mats.edge,Math.sin(a)*.58,Math.cos(a)*.58,0);p.scale.set(.55,1.4,.6);p.rotation.z=-a;}skull(g,0,-.03,-.09,.45);
 }else if(id==='rats'){
  crown(g,mats.dark);for(let i=0;i<5;i++){const a=i*6.28/5;const rat=new T.Group();orb(rat,mats.rust,0,0,0,.16,1.2,.8,.8);orb(rat,mats.bone,.17,.03,0,.1,.9,.7,.6);orb(rat,mats.eye,.19,.055,.07,.025);cone(rat,mats.rust,-.24,-.015,0,.018,.24,Math.PI/2);rat.position.set(Math.sin(a)*.53,.13,Math.cos(a)*.53);rat.rotation.y=-a;g.add(rat);}orb(g,mats.gold,0,0,.5,.075);
 }else if(id==='tax'){
  parchment(g);chain(g,-.36,.5,.06,10);orb(g,mats.blood,.14,-.28,.07,.14,.9,1,.3);skull(g,.14,-.28,.1,.19);cone(g,mats.dark,.5,0,0,.04,1.15,-.2);
 }else if(id==='bell'){
  mesh(g,new T.CylinderGeometry(.22,.62,.85,9,true),mats.gold,0,.05,0);ring(g,mats.gold,0,-.38,0,.61,.045,Math.PI/2);box(g,mats.dark,0,.47,0,.6,.1,.12);ring(g,mats.dark,0,.66,0,.2,.05);orb(g,mats.eye,0,-.45,0,.1);skull(g,0,.06,.36,.27);chain(g,-.21,.37,.2,8);
 }else if(id==='hourglass'){
  for(const y of [-.64,.64])mesh(g,new T.CylinderGeometry(.38,.38,.1,8),mats.gold,0,y,0);
  for(const x of [-.3,.3])for(const z of [-.16,.16])box(g,mats.dark,x,0,z,.065,1.24,.065);
  mesh(g,new T.ConeGeometry(.26,.57,8),mats.cloth,0,.28,0,0,0,Math.PI);mesh(g,new T.ConeGeometry(.26,.57,8),mats.cloth,0,-.28,0);
  for(let i=0;i<5;i++)orb(g,mats.violet,0,-.4+i*.17,.06,.035);skull(g,0,-.34,.16,.18);
 }else if(id==='boots'){
  for(const side of [-1,1]){box(g,mats.dark,side*.27,.08,0,.31,.6,.3);box(g,mats.iron,side*.27,-.29,.16,.34,.22,.64);orb(g,mats.cyan,side*.27,-.15,.36,.06);for(let i=0;i<3;i++)box(g,mats.gold,side*.27,.28-i*.14,.17,.25,.025,.02);}ring(g,mats.cyan,.27,-.36,.17,.24,.02,Math.PI/2);
 }else if(id==='pallbearer'){
  box(g,mats.dark,0,0,0,.69,1.25,.22);for(const x of [-.32,.32])box(g,mats.gold,x,0,.13,.035,1.23,.025);for(const y of [-.59,.59])box(g,mats.gold,0,y,.13,.68,.035,.025);skull(g,0,.11,.16,.62);box(g,mats.bone,0,-.33,.19,.25,.055,.04);for(let i=0;i<4;i++)box(g,mats.dark,(i-1.5)*.06,-.32,.22,.015,.075,.02);
 }else if(id==='sun'){
  crown(g);orb(g,mats.dark,0,.22,.39,.3);ring(g,mats.eye,0,.22,.44,.31,.045);for(let i=0;i<9;i++){const a=i*6.28/9;cone(g,mats.gold,Math.sin(a)*.41,.22+Math.cos(a)*.41,.44,.045,.23,-a);}
 }else if(id==='miser'){
  ring(g,mats.gold,0,-.05,0,.38,.08,Math.PI/2);orb(g,mats.bone,0,.13,.04,.27,1,1,.45);orb(g,mats.gold,0,.13,.17,.19,1,1,.2);box(g,mats.dark,0,.13,.22,.09,.25,.025);chain(g,-.13,.12,.15,5);
 }else if(id==='choir'){
  for(let i=0;i<5;i++){const s=skull(g,(i-2)*.23,(i%2)*.1,0,.22);s.rotation.z=(i-2)*-.13;}box(g,mats.bone,0,-.28,0,1.15,.09,.14);for(let i=0;i<8;i++)cone(g,mats.bone,(i-3.5)*.13,-.38,.05,.05,.21,Math.PI);ring(g,mats.violet,0,.15,-.1,.48,.024);
 }else if(id==='understudy'){
  const cloak=armor('mantle');cloak.scale.setScalar(.8);g.add(cloak);orb(g,mats.bone,.23,.3,.36,.23,.8,1.2,.25);orb(g,mats.dark,.23,.31,.42,.07,1,.5,.2);orb(g,mats.dark,.23,.13,.42,.055,1,.4,.2);orb(g,mats.blood,-.23,.19,.34,.23,.8,1.2,.25);orb(g,mats.eye,-.23,.19,.42,.055,1,.45,.2);
 }else if(id==='typewriter'){
  box(g,mats.dark,0,-.23,0,1.03,.3,.64);box(g,mats.iron,0,-.07,-.14,1.03,.23,.29);box(g,mats.blood,0,.09,-.23,.8,.12,.18);
  for(let row=0;row<3;row++)for(let col=0;col<7;col++)box(g,mats.bone,(col-3)*.117,-.015+row*.025,.23-row*.095,.075,.045,.06);
  box(g,mats.bone,0,.51,-.23,.66,.79,.025);for(let i=0;i<4;i++)box(g,mats.blood,0,.73-i*.12,-.205,.45-i*.05,.016,.015);orb(g,mats.violet,-.48,.05,.01,.065);orb(g,mats.violet,.48,.05,.01,.065);
 }else if(id==='receipts'){
  glove(g,-.27);glove(g,.27);parchment(g,0,-.55,.17);for(let i=0;i<4;i++)orb(g,mats.gold,(i-1.5)*.13,.42,.15,.065,1,1,.23);
 }
 return g;
}
