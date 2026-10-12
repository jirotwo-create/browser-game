import * as T from './vendor/three.module.js';
import {mats,mesh} from './models.js';
import {HERO_POS,ENEMY_POS} from './battle-animation.js';
export function ratModel(index=0){
 const rat=new T.Group();rat.name=`Parliament rat ${index+1}`;
 const body=mesh(rat,new T.IcosahedronGeometry(.2,0),index%2?mats.iron:mats.bone,0,.19,0);body.scale.set(.85,.8,1.45);
 const head=mesh(rat,new T.ConeGeometry(.13,.3,5),mats.iron,0,.21,.29,Math.PI/2);head.scale.y=1.1;
 for(const side of [-1,1]){
  const ear=mesh(rat,new T.IcosahedronGeometry(.08,0),mats.blood,side*.105,.34,.17);ear.scale.z=.35;
  mesh(rat,new T.IcosahedronGeometry(.025,0),mats.eye,side*.075,.26,.31);
 }
 mesh(rat,new T.IcosahedronGeometry(.04,0),mats.blood,0,.21,.45);
 const feet=[];
 for(const side of [-1,1])for(const z of [-.15,.16]){const foot=mesh(rat,new T.BoxGeometry(.065,.07,.14),mats.dark,side*.14,.07,z);feet.push(foot);}
 const tail=new T.Group();tail.position.set(0,.13,-.23);rat.add(tail);
 for(let i=0;i<4;i++)mesh(tail,new T.CylinderGeometry(.018-i*.003,.022-i*.003,.13,4),mats.blood,i*.04,0,-.05-i*.11,Math.PI/2,0,-.2);
 rat.userData={tail,feet};return rat;
}
export class RatSwarm{
 constructor(arena){this.root=new T.Group();this.root.name='Parliament of Rats companions';arena.add(this.root);this.rats=[];this.count=0;this.attack=null;this.played=undefined;}
 sync(count){
  this.count=Math.max(0,Math.min(12,Math.floor(count)||0));
  while(this.rats.length<this.count){const rat=ratModel(this.rats.length);this.rats.push(rat);this.root.add(rat);}
  this.rats.forEach((r,i)=>r.visible=i<this.count);
  if(!this.count)this.attack=null;
 }
 play(fx,now){
  if(!fx){this.played=undefined;this.attack=null;return;}
  if(fx.id===this.played)return;this.played=fx.id;this.attack=null;
  if(this.count&&fx.ratAttack?.damage>0){this.sync(fx.ratAttack.count);this.attack={start:now,damage:fx.ratAttack.damage};}
 }
 update(now,reduced=false){
  const elapsed=this.attack?(now-this.attack.start)/1000:0;
  if(this.attack&&elapsed>1.9)this.attack=null;
  for(let i=0;i<this.count;i++){
   const rat=this.rats[i],angle=i*2.399,home=HERO_POS.clone().add(new T.Vector3(Math.sin(angle)*(.56+(i%3)*.13),0,Math.cos(angle)*.5+.42));
   const target=ENEMY_POS.clone().add(new T.Vector3(Math.sin(angle)*.44,0,Math.cos(angle)*.36+.1));
   const t=elapsed-i*.018;let travel=0,bite=0;
   if(this.attack&&!reduced){if(t>.5&&t<.85)travel=(t-.5)/.35;else if(t>=.85&&t<1.12){travel=1;bite=Math.sin((t-.85)/.27*Math.PI);}else if(t>=1.12&&t<1.6)travel=1-(t-1.12)/.48;}
   travel=Math.max(0,Math.min(1,travel));rat.position.copy(home).lerp(target,travel);
   const moving=travel>0&&travel<1,scurry=!reduced&&moving?Math.sin(now*.035+i*2):0;
   rat.position.y=!reduced?Math.abs(scurry)*.055+bite*.22:0;
   const direction=(travel&&t>1.12?home.clone().sub(target):target.clone().sub(home));rat.rotation.set(!reduced?-bite*.3:0,Math.atan2(direction.x,direction.z),0);
   rat.userData.tail.rotation.y=reduced?0:Math.sin(now*.007+i)*.2;
   rat.userData.feet.forEach((foot,j)=>{foot.rotation.x=reduced?0:scurry*(j%2?-.5:.5);});
  }
 }
 dispose(){this.root.traverse(o=>{if(o.isMesh)o.geometry.dispose();});this.root.removeFromParent();this.rats=[];this.count=0;}
}
