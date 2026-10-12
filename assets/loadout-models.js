import * as T from './vendor/three.module.js';
import {weapon,armor} from './models.js';
import {exoticModel} from './exotic-models.js';
import {relicFor} from '../exotics.js';
const dispose=g=>g?.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
const grips={probate:[-.23,-.3325,0],echoBlade:[-.16,-.6789,.1],meteor:[0,-.8,0]};
export class HeroLoadout{
 constructor(hero){this.hero=hero;this.key='';this.armor=null;this.testament=null;}
 sync(state){
  const key=[state.weapon,state.armor,state.testament].join('|');if(key===this.key)return;this.key=key;
  const rig=this.hero.userData,old=rig.blade;old?.removeFromParent();dispose(old);
  const exotic=relicFor(state.weapon),blade=exotic?exoticModel(state.weapon):weapon(state.weapon),scale=exotic?.id==='probate'?.6:.68;
  const grip=grips[state.weapon]||[0,state.weapon==='reaper'?-.35:-.73,0];blade.scale.setScalar(scale);blade.position.fromArray(grip).multiplyScalar(-scale);blade.userData.grip=grip;rig.swordArm.userData.hand.add(blade);rig.swordArm.userData.hand.userData.weapon=blade;rig.blade=blade;
  for(const glove of this.armor?.userData.gloves||[]){glove.removeFromParent();dispose(glove);}
  this.armor?.removeFromParent();dispose(this.armor);this.armor=new T.Group();this.armor.name='Equipped '+state.armor;
  const e=relicFor(state.armor),id=state.armor;
  if(['rats','sun','carrion','halo'].includes(id)){
   const model=exoticModel(id);model.scale.setScalar(id==='halo'?.65:.58);if(id==='halo')model.rotation.x=Math.PI/2;this.armor.add(model);this.armor.position.y=.28;rig.head.add(this.armor);
  }else if(['sutures','receipts','rosary'].includes(id)){
   rig.body.add(this.armor);const source=exoticModel(id);
   for(const [i,arm]of [rig.swordArm,rig.castArm].entries()){
    const side=i?1:-1,glove=new T.Group();glove.position.set(0,-.13,.04);glove.scale.setScalar(.65);glove.rotation.z=Math.PI;arm.userData.elbow.add(glove);this.armor.userData.gloves??=[];this.armor.userData.gloves.push(glove);
    for(const part of [...source.children])if(part.position.x*side>.08){source.remove(part);part.position.x-=side*.27;glove.add(part);}
   }
   dispose(source);
  }else if(id==='boots'){
   const model=exoticModel(id);model.scale.setScalar(.7);this.armor.add(model);this.armor.position.y=.29;this.hero.add(this.armor);
  }else if(id!=='rags'){
   const model=e?exoticModel(id):armor(id);model.scale.setScalar(id==='orbit'?.95:.83);this.armor.add(model);this.armor.position.set(0,id==='orbit'?.72:.34,['moth','understudy','thornsuit'].includes(id)?-.15:.04);rig.body.add(this.armor);
  }
  this.testament?.removeFromParent();dispose(this.testament);this.testament=null;
  if(relicFor(state.testament)?.slot==='testament'){this.testament=exoticModel(state.testament);this.testament.name='Equipped Testament';this.testament.scale.setScalar(.28);this.testament.position.set(.83,1.55,-.1);this.testament.rotation.y=-.4;this.hero.add(this.testament);}
 }
}
