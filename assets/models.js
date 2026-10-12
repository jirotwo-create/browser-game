import * as T from './vendor/three.module.js';
// Original mesh assets. Small texture atlases and faceted geometry deliberately echo 1997 hardware.
let seed=2718;
const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
function texture(base,grain=28){
 const c=document.createElement('canvas');c.width=c.height=32;const ctx=c.getContext('2d'),color=new T.Color(base).convertLinearToSRGB();
 for(let y=0;y<32;y++)for(let x=0;x<32;x++){
  const n=(rand()-.5)*grain;ctx.fillStyle=`rgb(${Math.max(0,color.r*255+n)},${Math.max(0,color.g*255+n)},${Math.max(0,color.b*255+n)})`;ctx.fillRect(x,y,1,1);
 }
 const t=new T.CanvasTexture(c);t.magFilter=T.NearestFilter;t.minFilter=T.NearestFilter;t.colorSpace=T.SRGBColorSpace;return t;
}
const material=(color,extra={})=>new T.MeshStandardMaterial({color:0xffffff,map:texture(color),roughness:.87,metalness:.35,flatShading:true,...extra});
export const mats={iron:material('#737986'),dark:material('#252831'),edge:material('#b8bbc2'),rust:material('#765b4b'),blood:material('#4e1426'),cloth:material('#251c31',{metalness:0}),bone:material('#b5a583',{metalness:0}),gold:material('#a58848'),stone:material('#42414a',{metalness:0}),eye:new T.MeshBasicMaterial({color:0xff7a37}),violet:new T.MeshBasicMaterial({color:0xaf63ff}),cyan:new T.MeshBasicMaterial({color:0x77dcde})};
export function mesh(parent,geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
const box=(g,m,x,y,z,w,h,d,rz=0)=>mesh(g,new T.BoxGeometry(w,h,d),m,x,y,z,0,0,rz);
const orb=(g,m,x,y,z,r,sx=1,sy=1,sz=1)=>{const p=mesh(g,new T.IcosahedronGeometry(r,0),m,x,y,z);p.scale.set(sx,sy,sz);return p;};
function spike(g,m,x,y,z,length=.45,tilt=0){return mesh(g,new T.ConeGeometry(.1,length,4),m,x,y,z,0,0,tilt);}
function slab(g,points,depth,mat,x=0,y=0,z=0){const shape=new T.Shape();points.forEach(([a,b],i)=>i?shape.lineTo(a,b):shape.moveTo(a,b));shape.closePath();return mesh(g,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),mat,x,y,z-depth/2);}
function bone(g,a,b,r=.065){const d=new T.Vector3(...b).sub(new T.Vector3(...a));const m=mesh(g,new T.CylinderGeometry(r*.8,r,d.length(),5),mats.bone,...a);m.position.addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
function skull(g,x,y,z,scale=1){const h=new T.Group();h.position.set(x,y,z);h.scale.setScalar(scale);g.add(h);orb(h,mats.bone,0,0,0,.23,1,1.22,.85);box(h,mats.dark,-.08,.025,.17,.095,.072,.025);box(h,mats.dark,.08,.025,.17,.095,.072,.025);spike(h,mats.dark,0,-.055,.18,.07,Math.PI);box(h,mats.bone,0,-.17,.035,.25,.105,.19);for(let i=-2;i<=2;i++)box(h,mats.dark,i*.041,-.15,.14,.016,.035,.02);return h;}
function cape(g,color=mats.blood,wide=.75){const cloth=slab(g,[[-wide,0],[-wide*1.25,-1.3],[-.6,-1.25],[-.35,-1.5],[0,-1.3],[.35,-1.5],[.65,-1.2],[wide*1.25,-1.35],[wide,0]],.045,color,0,2.2,-.27);cloth.name='cape';return cloth;}
export function weapon(id='rust'){
 const g=new T.Group(),epic=['thorn','god'].includes(id),steel=id==='rust'?mats.rust:mats.edge;
 if(id==='reaper'){
  box(g,mats.dark,0,0,0,.09,2.5,.09);orb(g,mats.gold,0,1.1,0,.12);
  slab(g,[[0,1.16],[.43,1.28],[.94,1.06],[1.14,.58],[.73,.94],[.34,1.05],[0,1]],.09,steel);skull(g,.13,.9,.07,.65);
 }else{
  box(g,mats.dark,0,-.73,0,.11,.47,.11);orb(g,epic?mats.gold:mats.iron,0,-1.01,0,.105);
  const w=id==='god'?.36:id==='fang'?.13:.19;
  const points=id==='fang'?[[-w,-.43],[-w,.1],[-.24,.22],[-w,.32],[-.24,.47],[-w,.57],[-.2,.75],[0,1.18],[w,.7],[w,-.43]]:[[-w,-.43],[-w,.73],[0,1.25],[w,.73],[w,-.43]];
  slab(g,points,.095,steel);slab(g,[[0,-.44],[-.045,.7],[0,1.18],[.045,.7]],.1,epic?mats.gold:mats.iron,0,0,.05);
  slab(g,[[-.44,-.42],[-.34,-.3],[-.18,-.42],[.18,-.42],[.34,-.3],[.44,-.42],[.18,-.55],[-.18,-.55]],.16,epic?mats.gold:mats.dark);
  if(epic){orb(g,id==='god'?mats.eye:mats.violet,0,-.43,.13,.09);for(const side of [-1,1])for(let i=0;i<3;i++)spike(g,mats.dark,side*(w+.045),.05+i*.22,0,.25,side*-.65);}
 }
 g.userData.asset=id;return g;
}
export function armor(id='iron'){
 const g=new T.Group(),tier={rags:0,iron:1,mantle:2,cathedral:3,night:4}[id]||1;
 g.userData.bodyArmor=true;
 const main=tier===2?mats.cloth:tier===4?mats.dark:mats.iron;
 mesh(g,new T.CylinderGeometry(.4,.3,.82,6),main,0,.1,0);orb(g,main,0,.28,.12,.43,1,.7,.75);
 for(const side of [-1,1]){
  orb(g,main,side*.47,.45,0,.24,1.3,.7,1.1);box(g,main,side*.55,.02,0,.16,.45,.2,side*.14);
  if(tier>=3)for(let i=0;i<3;i++)spike(g,tier===4?mats.gold:mats.edge,side*(.44+i*.08),.62+i*.03,0,.22+i*.04,side*-.4);
 }
 box(g,mats.dark,0,-.34,0,.64,.12,.47);orb(g,tier>=3?mats.gold:mats.edge,0,-.33,.255,.065);
 for(const side of [-1,1])slab(g,[[0,0],[side*.28,-.04],[side*.34,-.55],[0,-.45]],.065,main,side*.04,-.35,.18);
 if(tier>=2){const c=cape(g,tier===4?mats.blood:mats.cloth,.55);c.position.y= .49;c.scale.y=.9;}
 if(tier>=3){skull(g,0,.17,.34,.8);for(const side of [-1,1])bone(g,[side*.09,.32,.39],[side*.26,.14,.35],.04);}
 if(id==='rags'){g.clear();cape(g,mats.cloth,.52).position.y=.9;mesh(g,new T.CylinderGeometry(.34,.4,.7,5),mats.cloth,0,.3,0);}
 return g;
}
// All held assets are positioned by their handle, never by the blade's mesh origin.
export function holdWeapon(hand,id,scale=1){
 const item=weapon(id);item.scale.setScalar(scale);item.position.y=(id==='reaper'?.35:.73)*scale;hand.add(item);hand.userData.weapon=item;return item;
}
function armRig(g,side,y,upper=.5,lower=.4,mat=mats.iron,skeletal=false){
 const arm=new T.Group();arm.position.set(side*(skeletal?.4:.58),y,0);g.add(arm);
 const elbow=new T.Group();elbow.position.set(side*.08,-upper,0);arm.add(elbow);
 const hand=new T.Group();hand.position.set(0,-lower,.07);elbow.add(hand);
 if(skeletal){bone(arm,[0,0,0],[side*.08,-upper,0],.075);bone(elbow,[0,0,0],[0,-lower,.07],.06);for(let i=0;i<3;i++)bone(hand,[(i-1)*.06,0,0],[(i-1)*.075,-.2,.15],.025);}
 else{orb(arm,mat,0,0,0,.24,1.3,.7,1.1);box(arm,mat,side*.04,-upper/2,0,.19,upper,.23);orb(elbow,mats.dark,0,0,0,.12);box(elbow,mat,0,-lower/2,.04,.2,lower,.23);orb(hand,mats.iron,0,0,0,.125);}
 arm.userData={elbow,hand};elbow.rotation.x=-.3;hand.rotation.x=.7;return arm;
}
function knight(kind){
 const g=new T.Group(),royal=kind==='king';
 cape(g,royal?mats.blood:mats.cloth,royal?.72:.63);
 mesh(g,new T.CylinderGeometry(.43,.29,.78,5),royal?mats.dark:mats.iron,0,1.72,0);
 orb(g,mats.iron,0,1.91,.07,.4,1,.7,.65);box(g,mats.dark,0,1.29,0,.66,.12,.45);
 for(const side of [-1,1]){
  orb(g,royal?mats.gold:mats.iron,side*.58,2.08,0,.28,1.4,.75,1.2);
  for(let i=0;i<3;i++)spike(g,royal?mats.gold:mats.edge,side*(.5+i*.12),2.3,.025,.34+i*.07,side*-.5);
  box(g,mats.iron,side*.22,.99,0,.23,.51,.29,side*-.07);orb(g,mats.edge,side*.24,.72,.09,.15);
  box(g,mats.dark,side*.26,.44,.04,.23,.46,.25);box(g,mats.iron,side*.27,.15,.13,.3,.22,.49);
  slab(g,[[0,0],[side*.26,-.06],[side*.31,-.5],[0,-.43]],.07,mats.iron,side*.035,1.24,.24);
 }
 orb(g,mats.iron,0,2.52,0,.28,1,1.35,.9);slab(g,[[-.23,.15],[0,.22],[.23,.15],[.17,-.18],[0,-.35],[-.17,-.18]],.065,mats.dark,0,2.54,.235);
 for(const side of [-1,1]){box(g,mats.eye,side*.095,2.56,.278,.11,.025,.02,side*.13);spike(g,royal?mats.gold:mats.edge,side*.27,2.82,-.04,.5,side*-.45);}
 if(royal){mesh(g,new T.CylinderGeometry(.31,.28,.15,8,true),mats.gold,0,2.84,0);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;spike(g,mats.gold,Math.sin(a)*.28,3.02,Math.cos(a)*.28,.35);}}
 skull(g,0,1.79,.31,.55);
 const arms=[armRig(g,-1,2.08),armRig(g,1,2.08)];g.userData.arms=arms;
 holdWeapon(arms[0].userData.hand,royal?'god':'thorn',royal?.82:.72);
 const shield=new T.Group();slab(shield,[[0,.49],[-.34,.31],[-.29,-.34],[0,-.62],[.29,-.34],[.34,.31]],.13,mats.dark);slab(shield,[[0,.38],[-.21,.23],[-.18,-.26],[0,-.43],[.18,-.26],[.21,.23]],.14,royal?mats.gold:mats.iron,0,0,.07);skull(shield,0,.02,.19,.63);shield.position.set(.08,-.14,.2);arms[1].userData.elbow.add(shield);
 return g;
}
function wretch(){
 const g=new T.Group();cape(g,mats.cloth,.47).position.y=1.6;
 for(const side of [-1,1]){
  bone(g,[side*.18,.99,0],[side*.32,.56,.11],.1);bone(g,[side*.32,.56,.11],[side*.24,.14,.2],.075);box(g,mats.bone,side*.24,.11,.27,.16,.15,.42);
  for(let i=0;i<5;i++){const rib=mesh(g,new T.TorusGeometry(.25+i*.018,.031,3,8,Math.PI*.78),mats.bone,side*.06,1.55-i*.095,.025,0,side*Math.PI/2,Math.PI*.1);rib.scale.y=.75;}
 }
 bone(g,[0,.9,0],[0,1.71,-.08],.065);orb(g,mats.bone,0,.95,0,.22,1.4,.65,.6);skull(g,0,1.9,.22,1.2);
 for(const side of [-1,1])orb(g,mats.cyan,side*.085,1.924,.424,.038);for(let i=0;i<5;i++)spike(g,mats.bone,0,1.5+i*.075,-.21,.23,Math.PI*.52);
 g.userData.arms=[armRig(g,-1,1.71,.58,.5,mats.bone,true),armRig(g,1,1.71,.58,.5,mats.bone,true)];g.rotation.x=.08;return g;
}
function keeper(){
 const g=new T.Group();mesh(g,new T.CylinderGeometry(.23,.72,1.8,7),mats.cloth,0,1.07,0);cape(g,mats.dark,.62);
 orb(g,mats.dark,0,2.19,0,.4,1,1.2,.85);orb(g,mats.dark,0,2.17,.28,.26);box(g,mats.eye,-.085,2.19,.52,.04,.025,.02);box(g,mats.eye,.085,2.19,.52,.04,.025,.02);
 const arms=[armRig(g,-1,1.85,.4,.35,mats.cloth),armRig(g,1,1.85,.4,.35,mats.cloth)];g.userData.arms=arms;
 for(let i=0;i<8;i++){const a=i*.45;orb(g,mats.gold,Math.sin(a)*.31,1.87-i*.035,.3,.036);}
 const staff=new T.Group();box(staff,mats.dark,0,.2,0,.075,2.7,.075);slab(staff,[[-.08,0],[.13,.12],[.43,.08],[.45,0],[.15,.04]],.08,mats.gold,0,1.55,0);arms[0].userData.hand.add(staff);arms[0].userData.hand.userData.weapon=staff;
 mesh(g,new T.CylinderGeometry(.15,.38,.48,8,true),mats.gold,-.33,2.36,.09);mesh(g,new T.TorusGeometry(.36,.035,4,8),mats.gold,-.33,2.12,.09,Math.PI/2);orb(g,mats.dark,-.33,2.14,.09,.08);return g;
}
function wing(){
 const g=wretch();g.scale.setScalar(1.13);g.rotation.x=0;
 for(const side of [-1,1]){
  slab(g,[[side*.2,1.5],[side*.75,2.4],[side*1.8,2.85],[side*1.54,1.83],[side*1.08,1.32],[side*.82,1.44],[side*.52,1.17]],.055,mats.blood,0,0,-.22);
  bone(g,[side*.24,1.61,-.18],[side*.73,2.36,-.18]);bone(g,[side*.73,2.36,-.18],[side*1.8,2.85,-.18],.05);bone(g,[side*.73,2.36,-.18],[side*1.54,1.83,-.18],.04);bone(g,[side*.73,2.36,-.18],[side*1.08,1.32,-.18],.035);
  spike(g,mats.dark,side*.19,2.32,.12,.62,side*-.5);
 }
 holdWeapon(g.userData.arms[0].userData.hand,'reaper',.7);return g;
}
export function monster(kind){const g=kind==='wretch'?wretch():kind==='keeper'?keeper():kind==='wing'?wing():knight(kind);g.userData.kind=kind;return g;}
export function cathedral(){
 const world=new T.Group();
 box(world,mats.stone,0,-.19,0,15,.3,16);
 for(let z=-4;z<3;z+=1.3)for(const side of [-1,1]){
  mesh(world,new T.CylinderGeometry(.2,.32,4.8,6),mats.stone,side*3.3,2.35,z);box(world,mats.stone,side*3.3,4.7,z,.8,.35,.8);box(world,mats.dark,side*3.3,.06,z,.9,.25,.9);
 }
 for(const side of [-1,1]){box(world,mats.stone,side*2.6,2,-4.8,1.2,4,.8);spike(world,mats.stone,side*2.6,5.5,-4.8,3);}
 // Broken gothic arch, built from separate voussoir stones.
 for(let i=0;i<11;i++){
  const a=Math.PI*i/10;const m=box(world,mats.stone,Math.cos(a)*1.7,2.8+Math.sin(a)*2,-4.6,.55,.58,.7);m.rotation.z=a-Math.PI/2;
 }
 const portal=new T.Mesh(new T.PlaneGeometry(3,4),new T.MeshBasicMaterial({color:0x190f2a}));portal.position.set(0,1.8,-4.65);world.add(portal);
 for(const side of [-1,1]){
  box(world,mats.dark,side*2,0,-1.5,.4,.2,.4);box(world,mats.dark,side*2,.65,-1.5,.09,1.3,.09);orb(world,mats.eye,side*2,1.38,-1.5,.13,.65,1.7,.65);
  const light=new T.PointLight(0xff743e,9,5,2);light.position.set(side*2,1.65,-1.4);world.add(light);
 }
 for(let i=0;i<26;i++){const x=(rand()-.5)*9,z=(rand()-.5)*8;orb(world,mats.stone,x,-.01,z,.11+rand()*.18,1.7,.7,1.3);}
 // Decorative tile seams establish perspective at a PS1-friendly resolution.
 for(let i=-5;i<=5;i++)box(world,mats.dark,i*.75,-.025,0,.025,.01,12);
 for(let i=-6;i<=6;i++)box(world,mats.dark,0,-.02,i*.75,12,.01,.025);
 return world;
}
export function talent(id){
 if(id==='edge')return weapon('fang');if(id==='ward')return armor('iron');
 const g=new T.Group();
 if(['leech','execute','resolve','revenant','rage','shelter'].includes(id)){
  skull(g,0,0,.2,2.2);
  if(['execute','rage'].includes(id))for(const side of [-1,1]){const w=weapon('thorn');w.scale.setScalar(.55);w.rotation.z=side*.65;w.position.set(side*.24,-.1,-.14);g.add(w);}
  if(['revenant','rage'].includes(id))for(let i=0;i<5;i++)spike(g,id==='rage'?mats.blood:mats.gold,(i-2)*.14,.66,0,.38);
  if(id==='leech'){orb(g,mats.eye,0,-.5,.1,.18,.7,1.6,.7);spike(g,mats.blood,0,-.28,.1,.4);}
  if(id==='resolve')for(const side of [-1,1])bone(g,[side*.5,-.45,-.15],[-side*.5,.5,-.15],.09);
  if(id==='shelter')slab(g,[[0,.8],[-.65,.4],[-.5,-.5],[0,-.85],[.5,-.5],[.65,.4]],.18,mats.iron,0,0,-.35);
 }else if(id==='spark'){
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const shard=mesh(g,new T.OctahedronGeometry(.35,0),i%2?mats.eye:mats.gold,Math.sin(a)*.3,Math.cos(a)*.25,0);shard.scale.set(.45,1.5,.45);shard.rotation.z=-a*.4;}
 }else if(id==='echo'){
  box(g,mats.stone,0,0,0,.9,1.25,.18);for(const rz of [0,Math.PI/3,-Math.PI/3])box(g,mats.violet,0,0,.15,.055,.83,.07,rz);orb(g,mats.violet,0,.59,.08,.09);
 }else if(id==='omen'){
  const eye=mesh(g,new T.TorusGeometry(.47,.09,4,12),mats.gold);eye.scale.y=.57;orb(g,mats.dark,0,0,0,.28);orb(g,mats.violet,0,0,.22,.14,.5,1,1);
 }else if(id==='eclipse'){
  orb(g,mats.dark,0,0,0,.5);mesh(g,new T.TorusGeometry(.51,.065,4,16,Math.PI*1.7),mats.violet,0,0,.05,0,0,.48);for(let i=0;i<5;i++)orb(g,mats.gold,Math.sin(i)*.72,Math.cos(i)*.72,0,.045);
 }
 return g;
}
