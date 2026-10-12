import * as T from './vendor/three.module.js';
import {mats,mesh,weapon,armor} from './models.js';
export const NEW_RELIC_IDS=['cinder','marionette','maw','needle','storm','mirror','clockwork','lantern','carrion','furnace','glass','eclipseMail','rosary','thornsuit','orbit'];
const box=(g,m,x,y,z,w,h,d)=>mesh(g,new T.BoxGeometry(w,h,d),m,x,y,z);
const orb=(g,m,x,y,z,r)=>mesh(g,new T.IcosahedronGeometry(r,0),m,x,y,z);
const cone=(g,m,x,y,z,r,h,rz=0)=>mesh(g,new T.ConeGeometry(r,h,4),m,x,y,z,0,0,rz);
const ring=(g,m,x,y,z,r,t=.035,rx=0)=>mesh(g,new T.TorusGeometry(r,t,3,16),m,x,y,z,rx);
const add=(g,o)=>{g.add(o);return o;};
const hilt=g=>{box(g,mats.dark,0,-.72,0,.11,.53,.11);box(g,mats.gold,0,-.44,0,.63,.09,.16);orb(g,mats.blood,0,-1.02,0,.1);};
export function newRelicModel(id){
 const g=new T.Group();g.userData.asset=id;
 if(id==='cinder'){
  add(g,weapon('god'));for(let i=0;i<6;i++){box(g,mats.eye,Math.sin(i*2)*.09,-.15+i*.21,.07,.045,.17,.025);for(const side of [-1,1])cone(g,mats.rust,side*.35,.06+i*.15,0,.06,.19,-side*Math.PI/2);}
  orb(g,mats.eye,0,-.43,.16,.12);
 }else if(id==='marionette'){
  const blade=add(g,weapon('fang'));blade.scale.x=.65;cone(g,mats.blood,.16,1.1,0,.1,.3,-Math.PI/2);
  for(const side of [-1,1]){const string=box(g,mats.blood,side*.18,.27,.1,.018,1.2,.018);string.rotation.z=-side*.2;}ring(g,mats.gold,0,-.72,.04,.21,.025);
 }else if(id==='maw'){
  hilt(g);box(g,mats.dark,0,-.08,0,.12,.95,.12);const jaw=ring(g,mats.bone,0,.68,0,.51,.13);jaw.scale.y=.72;
  box(g,mats.dark,0,.68,.015,.7,.26,.15);for(let i=0;i<6;i++){const x=(i-2.5)*.14;cone(g,mats.bone,x,.45,.13,.075,.26);cone(g,mats.bone,x,.88,.13,.07,.2,Math.PI);}orb(g,mats.eye,-.4,.76,.13,.065);orb(g,mats.eye,.4,.76,.13,.065);
 }else if(id==='needle'){
  const blade=add(g,weapon('fang'));blade.scale.x=.33;for(let i=0;i<7;i++){const pin=box(g,mats.edge,Math.sin(i)*.085,.03+i*.15,.025,.025,.33,.025);pin.rotation.z=(i%2?1:-1)*.3;}orb(g,mats.blood,0,-.43,.13,.09);
 }else if(id==='storm'){
  box(g,mats.dark,0,0,0,.095,2.5,.095);cone(g,mats.edge,0,1.5,0,.16,.62);for(const side of [-1,1]){cone(g,mats.gold,side*.18,1.24,0,.065,.42,-side*.45);box(g,mats.cyan,side*.07,.3,0,.035,.65,.03);}orb(g,mats.cyan,0,1.13,.1,.12);
 }else if(id==='mirror'){
  hilt(g);box(g,mats.edge,0,.3,0,.43,1.43,.08);cone(g,mats.edge,0,1.16,0,.22,.32);
  for(let i=0;i<4;i++){const shard=mesh(g,new T.OctahedronGeometry(.22,0),i%2?mats.cyan:mats.violet,(i%2?-.08:.08),-.08+i*.3,.09);shard.scale.set(.6,1.3,.15);}ring(g,mats.violet,0,-.43,.13,.16,.025);
 }else if(id==='clockwork'){
  hilt(g);box(g,mats.iron,0,.35,0,.26,1.64,.15);for(let i=0;i<10;i++)for(const side of [-1,1])cone(g,mats.gold,side*.2,-.32+i*.17,0,.065,.22,-side*Math.PI/2);
  ring(g,mats.gold,0,-.38,.11,.25,.065);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const tooth=box(g,mats.edge,Math.sin(a)*.27,-.38+Math.cos(a)*.27,.12,.07,.14,.06);tooth.rotation.z=-a;}
 }else if(id==='lantern'){
  box(g,mats.dark,0,-.16,0,.09,2.1,.09);for(const x of [-.22,.22])for(const z of [-.2,.2])box(g,mats.gold,x,.7,z,.045,.6,.045);
  box(g,mats.dark,0,.4,0,.51,.07,.48);cone(g,mats.dark,0,1.07,0,.34,.27);ring(g,mats.gold,0,1.29,0,.13,.025);
  for(let i=0;i<5;i++)orb(g,i%2?mats.cyan:mats.violet,Math.sin(i*2.4)*.14,.6+(i%3)*.1,Math.cos(i*2.4)*.14,.065);
 }else if(id==='carrion'){
  mesh(g,new T.CylinderGeometry(.5,.46,.2,8,true),mats.dark,0,-.08,0);
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7;cone(g,mats.edge,Math.sin(a)*.46,.2,Math.cos(a)*.46,.07,.48);}
  for(const side of [-1,1])for(let i=0;i<4;i++){const feather=mesh(g,new T.OctahedronGeometry(.22,0),mats.dark,side*(.49+i*.08),.02+i*.07,0);feather.scale.set(.5,1.4,.3);feather.rotation.z=-side*.7;}orb(g,mats.violet,0,-.05,.48,.09);
 }else if(id==='furnace'){
  add(g,armor('night'));box(g,mats.rust,0,.17,.34,.47,.53,.14);box(g,mats.eye,0,.17,.42,.34,.38,.035);
  for(let i=0;i<4;i++)box(g,mats.dark,(i-1.5)*.1,.17,.45,.045,.48,.03);for(const side of [-1,1]){mesh(g,new T.CylinderGeometry(.12,.12,.37,5),mats.dark,side*.4,.65,-.1);orb(g,mats.eye,side*.4,.83,-.1,.07);}
 }else if(id==='glass'){
  add(g,armor('iron'));for(let i=0;i<9;i++){const shard=mesh(g,new T.OctahedronGeometry(.23,0),i%2?mats.cyan:mats.edge,(i%3-1)*.26,.35-Math.floor(i/3)*.22,.32);shard.scale.set(.7,1.3,.3);shard.rotation.z=(i%2?1:-1)*.35;}
  for(const side of [-1,1])for(let i=0;i<3;i++)cone(g,mats.cyan,side*(.43+i*.1),.65,.02,.07,.47,-side*.35);
 }else if(id==='eclipseMail'){
  add(g,armor('night'));orb(g,mats.dark,0,.23,.39,.22);ring(g,mats.violet,0,.23,.42,.23,.027);
  for(const side of [-1,1])for(let i=0;i<4;i++){const seam=box(g,mats.violet,side*.23,.3-i*.16,.34,.035,.17,.02);seam.rotation.z=side*.55;}
 }else if(id==='rosary'){
  for(const side of [-1,1]){box(g,mats.dark,side*.27,-.12,0,.3,.46,.17);for(let i=0;i<4;i++)box(g,mats.edge,side*.27+(i-1.5)*.075,.22,0,.055,.26,.1);for(let i=0;i<8;i++){const a=i*Math.PI/4;orb(g,mats.gold,side*.27+Math.sin(a)*.16,Math.cos(a)*.16,.14,.04);}ring(g,mats.gold,side*.27,-.36,0,.18,.025,Math.PI/2);}
  orb(g,mats.eye,0,0,.12,.07);
 }else if(id==='thornsuit'){
  add(g,armor('mantle'));for(const side of [-1,1])for(let i=0;i<6;i++)cone(g,mats.bone,side*(.29+i%2*.11),.55-i*.19,.27,.055,.3,-side*.65);
  for(let i=0;i<5;i++){const vine=box(g,mats.gold,Math.sin(i*2)*.18,.45-i*.17,.32,.035,.3,.025);vine.rotation.z=Math.sin(i)*.7;}orb(g,mats.blood,0,.26,.39,.1);
 }else if(id==='orbit'){
  for(const side of [-1,1]){const plate=orb(g,mats.dark,side*.4,.15,0,.29);plate.scale.set(1.2,.7,1);ring(g,mats.cyan,side*.4,.18,.02,.33,.027,Math.PI/3);ring(g,mats.gold,side*.4,.18,.02,.35,.02,-Math.PI/3);orb(g,mats.cyan,side*.7,.18,.03,.08);}box(g,mats.dark,0,.07,0,.75,.12,.16);cone(g,mats.edge,0,-.15,.03,.17,.43,Math.PI);
 }
 return g;
}
