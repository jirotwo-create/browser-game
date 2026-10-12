import {addRelicAnimation,updateRelicNode} from './relic-animations.js';
import * as T from './vendor/three.module.js';
const colors={blood:0xff4260,bone:0xc9f4ac,void:0xb07bff};
const slashMoves=['attack','rend','feast','riposte','rage'];
export const HERO_POS=new T.Vector3(-1.23,0,.65),ENEMY_POS=new T.Vector3(1.12,0,-.59);
const wave=(t,a,b)=>t<a||t>b?0:Math.sin((t-a)/(b-a)*Math.PI);
export function rigMonster(model){
 if(model.userData.arms)return model;
 // Pivot existing original mesh pieces without changing their resting silhouette.
 const arms=[];model.updateMatrixWorld(true);
 for(const side of [-1,1]){
  const pivot=new T.Group();pivot.position.set(side*.48,1.8,0);model.add(pivot);model.updateMatrixWorld(true);
  for(const part of [...model.children])if(part!==pivot&&part.position.x*side>.4&&part.position.y>.65&&part.position.y<2.7)pivot.attach(part);
  arms.push(pivot);
 }
 model.userData.arms=arms;return model;
}
function resetArm(arm){
 arm.rotation.set(0,0,0);if(arm.userData.elbow)arm.userData.elbow.rotation.set(-.3,0,0);if(arm.userData.hand)arm.userData.hand.rotation.set(.7,0,0);
}
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function swingWeapon(arm,time,start=.06,end=.8,heavy=false){
 if(!arm.userData.elbow||time<start||time>end)return;
 const p=(time-start)/(end-start),ready=smooth(p/.34),strike=smooth((p-.34)/.24),recover=smooth((p-.58)/.42),weight=1-recover;
 arm.rotation.x=(-2.2*ready+1.05*strike)*weight;
 arm.rotation.z=(-.25*ready+.55*strike)*weight;
 arm.userData.elbow.rotation.x=-.3+(-.5*ready+.6*strike)*weight;
 arm.userData.hand.rotation.x=.7+(.9*ready+1.1*strike)*weight;
 arm.userData.hand.rotation.z=(heavy?-.25:-.12)*ready*weight;
}
export class BattleAnimation{
 constructor(world){this.world=world;this.fx=null;this.visuals=new T.Group();this.visuals.name='Combat spell effects';world.add(this.visuals);this.nodes=[];}
 clear(){this.visuals.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});this.visuals.clear();this.nodes=[];this.fx=null;}
 add(geometry,color,position,scale=1,tag='burst',delay=.38){
  const m=new T.Mesh(geometry,new T.MeshBasicMaterial({color,transparent:true,opacity:.85,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}));m.position.copy(position);m.scale.setScalar(scale);m.userData={tag,delay,scale,origin:position.clone()};this.visuals.add(m);this.nodes.push(m);return m;
 }
 ring(at,color,radius=1,tag='ring',delay=.38){const r=this.add(new T.TorusGeometry(radius,.035,3,24),color,at,1,tag,delay);r.rotation.x=Math.PI/2;return r;}
 start(fx,now){
  this.clear();if(!fx)return;this.fx=fx;this.startTime=now;
  const color=colors[fx.tree]||colors.void,enemy=ENEMY_POS.clone().add(new T.Vector3(0,1.25,0)),player=HERO_POS.clone().add(new T.Vector3(0,1.1,0));
  if(slashMoves.includes(fx.move)){
   const count=fx.move==='rend'?3:fx.move==='rage'?2:1;
   for(let i=0;i<count;i++){const arc=this.add(new T.TorusGeometry(.68,.055,3,18,Math.PI*1.25),color,enemy.clone().add(new T.Vector3(0,i*.12,0)),1,'slash',.28+i*.09);arc.rotation.set(.2,.5,-.6+i*.5);}
  }else if(['guard','bastion','reprisal'].includes(fx.move)){
   const shield=this.add(new T.IcosahedronGeometry(1,1),colors.bone,player,1,'shield',.12);shield.scale.set(.65,1.1,.65);shield.userData.baseScale=shield.scale.clone();shield.material.wireframe=true;
   this.ring(HERO_POS.clone().add(new T.Vector3(0,.07,0)),colors.bone,.85,'ring',.1);
   if(fx.move==='reprisal')this.ring(enemy,color,1,'burst',.4);
  }else if(fx.move==='mend'){
   for(let i=0;i<3;i++)this.ring(HERO_POS.clone().add(new T.Vector3(0,.15+i*.5,0)),colors.bone,.65,'heal',.15+i*.1);
  }else if(fx.move==='hex'){
   this.ring(ENEMY_POS.clone().add(new T.Vector3(0,.1,0)),color,1,'sigil',.25);
   for(let i=0;i<5;i++){const shard=this.add(new T.OctahedronGeometry(.13),color,enemy.clone().add(new T.Vector3(Math.sin(i*1.256)*.65,.65,Math.cos(i*1.256)*.65)),1,'curse',.25);shard.scale.y=2;}
  }else if(fx.move==='eclipse'){
   const orb=this.add(new T.IcosahedronGeometry(.6,1),0x241037,enemy,1,'eclipse',.25);orb.material.blending=T.NormalBlending;
   const halo=this.add(new T.TorusGeometry(.67,.065,3,24),color,enemy,1,'eclipse',.25);halo.rotation.y=.5;
   this.ring(ENEMY_POS.clone().add(new T.Vector3(0,.08,0)),color,1.1,'burst',.45);
  }else if(fx.move==='nova'){
   for(let i=0;i<3;i++)this.ring(enemy.clone().add(new T.Vector3(0,(i-1)*.25,0)),color,.45+i*.2,'nova',.25+i*.08);
   for(let i=0;i<12;i++)this.add(new T.ConeGeometry(.07,.4,4),color,enemy.clone().add(new T.Vector3(Math.sin(i)*.5,Math.cos(i)*.5,0)),1,'ember',.35);
  }else{
   for(let i=0;i<(fx.move==='drain'?5:3);i++)this.add(new T.IcosahedronGeometry(.11,0),color,player,1,fx.move==='drain'?'drain':'projectile',.15+i*.045);
   this.ring(enemy,color,.5,'burst',.42);
  }
  if(fx.move==='feast')for(let i=0;i<4;i++)this.add(new T.IcosahedronGeometry(.07),colors.blood,enemy,1,'drain',.46+i*.04);
  if(fx.events.some(e=>e.type==='heal')&&fx.move!=='mend')this.ring(HERO_POS.clone().add(new T.Vector3(0,.1,0)),colors.bone,.65,'heal',.55);
  if(fx.events.some(e=>e.type==='counter')){const arc=this.add(new T.TorusGeometry(.8,.065,3,20,Math.PI),0xffce78,enemy,1,'slash',1.35);arc.rotation.z=.7;}
  const damaged=fx.events.some(e=>['damage','counter','exoticDamage','bleed','burn','reflect'].includes(e.type));
  if(damaged)for(let i=0;i<9;i++){const p=this.add(new T.OctahedronGeometry(.055),color,enemy,1,'impact',.42);p.userData.velocity=new T.Vector3(Math.sin(i*2.4)*1.5,(i%3)*.6+.2,Math.cos(i*2.4)*1.5);}
  if(fx.enemyAttack&&fx.enemyKind==='keeper')for(let i=0;i<3;i++)this.add(new T.IcosahedronGeometry(.1,0),0xff9847,enemy,1,'enemyProjectile',.82+i*.05);
  if(fx.enemyAttack){const arc=this.add(new T.TorusGeometry(.6,.06,3,14,Math.PI),fx.enemyAttack==='heavy'?0xff9a4b:0xff465c,player,1,'slash',1.05);arc.rotation.set(.25,.4,-.8);}
  if(fx.events.some(e=>e.type==='absorb'))this.ring(player,colors.bone,.65,'burst',1.1);
  if(fx.events.some(e=>e.type==='dodge'))this.ring(player,0x8bceff,.75,'burst',1.1);
  if(fx.events.some(e=>e.type==='revive'))this.ring(player,0xffdc87,1,'heal',1.35);
  for(const record of (fx.relicAnimations||[]).slice(0,8))addRelicAnimation(this,record,HERO_POS,ENEMY_POS);
 }
 update(now,hero,enemy,reduced=false){
  if(!hero||!enemy)return false;
  const t=this.fx?(now-this.startTime)/1000:0,fx=this.fx;
  hero.position.copy(HERO_POS);enemy.position.copy(ENEMY_POS);hero.rotation.set(0,Math.atan2(ENEMY_POS.x-HERO_POS.x,ENEMY_POS.z-HERO_POS.z),0);enemy.rotation.set(0,Math.atan2(HERO_POS.x-ENEMY_POS.x,HERO_POS.z-ENEMY_POS.z),0);for(const arm of enemy.userData.arms||[])resetArm(arm);
  const rig=hero.userData;rig.body.position.y=1.15;rig.body.rotation.set(0,0,0);resetArm(rig.swordArm);resetArm(rig.castArm);rig.cape.rotation.x=0;
  if(!reduced){
   const breath=Math.sin(now*.0018);rig.body.position.y=1.15+breath*.018;rig.cape.rotation.x=.07+Math.sin(now*.002)*.04;enemy.position.y=Math.sin(now*.0015)*.018;
  }
  if(!fx)return false;
  if(t>1.9){this.clear();return false;}
  if(!reduced){
   const lunge=wave(t,.06,.8),swing=wave(t,.15,.65),retaliate=fx.enemyAttack?wave(t,.85,1.55):0;
   if(slashMoves.includes(fx.move)){hero.position.addScaledVector(ENEMY_POS.clone().sub(HERO_POS),lunge*.28);swingWeapon(rig.swordArm,t,.06,.8,fx.move==='rage');if(['storm','lantern'].includes(rig.blade.userData.asset)){rig.swordArm.rotation.x=-swing*.95;rig.swordArm.userData.elbow.rotation.x=-.3+swing*.15;rig.swordArm.userData.hand.rotation.x=.7+swing*1.8;}rig.body.rotation.y=-swing*.45;rig.cape.rotation.x+=lunge*.35;}
   else{rig.castArm.rotation.x=-wave(t,.08,.85)*1.6;rig.body.rotation.x=-wave(t,.08,.85)*.07;}
   if(fx.move==='guard'||fx.move==='bastion'){const brace=wave(t,.15,1.6);rig.swordArm.rotation.x=-brace*.9;rig.swordArm.userData.elbow.rotation.x=-.3-brace*.5;rig.swordArm.userData.hand.rotation.x=.7+brace*.4;}
   const hit=wave(t,.4,.74);if(fx.events.some(e=>e.amount>0&&['damage','exoticDamage','bleed','burn'].includes(e.type))){enemy.rotation.z=-hit*.18;enemy.position.addScaledVector(ENEMY_POS.clone().sub(HERO_POS),hit*.055);}
   enemy.position.addScaledVector(HERO_POS.clone().sub(ENEMY_POS),retaliate*(fx.enemyAttack==='heavy'?.3:.19));enemy.rotation.x=retaliate*(fx.enemyKind==='wing'?.5:.22);
   for(const [i,arm]of (enemy.userData.arms||[]).entries()){
    if(fx.enemyAttack&&arm.userData.hand?.userData.weapon&&fx.enemyKind!=='keeper')swingWeapon(arm,t,.85,1.55,fx.enemyAttack==='heavy');
    else{arm.rotation.x=-retaliate*(fx.enemyKind==='keeper'?1.1:1.4);arm.rotation.z=retaliate*(i?-.25:.25);}
   }
   if(fx.enemyKind==='wing')enemy.position.y+=retaliate*.38;
   if(fx.events.some(e=>e.type==='counter'))swingWeapon(rig.swordArm,t,1.15,1.8);
   if(fx.events.some(e=>e.type==='hurt'))rig.body.rotation.z=wave(t,1.1,1.5)*.16;
   if(fx.events.some(e=>e.type==='dodge'))hero.position.z+=wave(t,.95,1.5)*.5;
   if(fx.victory){const collapse=Math.max(0,Math.min(1,(t-(fx.enemyAttack ? 1.25 : fx.ratAttack?.damage > 0 ? .95 : .65))/.6));enemy.rotation.z=-collapse*1.35;enemy.position.y-=collapse*.4;}
   if(fx.defeat)rig.body.rotation.z=Math.max(0,Math.min(1,(t-1.2)/.4))*.65;
  }
  for(const m of this.nodes){
   const {tag,delay,scale,origin}=m.userData,age=t-delay;
   m.visible=reduced?t<1.2:age>=0&&age<.8;if(!m.visible)continue;
   const a=reduced?.2:age;m.material.opacity=reduced?.65:Math.max(0,.9*(1-a/.8));
   m.position.copy(origin);
   if(tag==='projectile'||tag==='drain'||tag==='enemyProjectile'){
    const progress=reduced?.5:Math.min(1,a/.35),from=tag==='projectile'?HERO_POS:ENEMY_POS,to=tag==='projectile'?ENEMY_POS:HERO_POS;m.position.copy(from).lerp(to,progress);m.position.y+=1.35+Math.sin(progress*Math.PI)*.25;
   }else if(tag==='impact')m.position.addScaledVector(m.userData.velocity,a);
   else if(tag==='heal'||tag==='ember')m.position.y+=a*.9;
   updateRelicNode(m,a,reduced);
   if(!reduced){if(['ring','burst','nova','sigil'].includes(tag))m.scale.setScalar(scale*(.65+a*2.3));if(tag==='slash')m.rotation.z+=.035;if(tag==='curse')m.rotation.y+=.05;}
  }
  return true;
 }
}
