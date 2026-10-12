import * as T from './vendor/three.module.js';
import {weapon} from './models.js';
import {slotModel} from './slot-models.js';
import {exoticModel} from './exotic-models.js';
import {relicFor} from '../exotics.js';
import {EQUIPMENT_SLOTS} from '../equipment.js';
const dispose=g=>g?.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
const grips={probate:[-.23,-.3325,0],echoBlade:[-.16,-.6789,.1],meteor:[0,-.8,0]};
export class HeroLoadout{
 constructor(hero){this.hero=hero;this.key='';this.parts=[];}
 sync(state){
  const key=EQUIPMENT_SLOTS.map(slot=>state[slot]).join('|');if(key===this.key)return;this.key=key;
  const rig=this.hero.userData,old=rig.blade;old?.removeFromParent();dispose(old);
  const exotic=relicFor(state.weapon),blade=exotic?exoticModel(state.weapon):weapon(state.weapon),scale=exotic?.id==='probate'?.6:.68;
  const grip=grips[state.weapon]||[0,state.weapon==='reaper'?-.35:-.73,0];blade.scale.setScalar(scale);blade.position.fromArray(grip).multiplyScalar(-scale);blade.userData.grip=grip;rig.swordArm.userData.hand.add(blade);rig.swordArm.userData.hand.userData.weapon=blade;rig.blade=blade;
  for(const part of this.parts){part.removeFromParent();dispose(part);}this.parts=[];
  const attach=(model,parent,slot,x,y,z,scale=1)=>{model.name='Equipped '+slot;model.userData.equipmentSlot=slot;model.position.set(x,y,z);model.scale.setScalar(scale);parent.add(model);this.parts.push(model);};
  const modelFor=id=>relicFor(id)?exoticModel(id):slotModel(id);
  rig.head.children.filter(o=>o.isMesh).forEach(o=>o.visible=true);rig.cape.visible=true;
  for(const slot of EQUIPMENT_SLOTS.filter(slot=>slot!=='weapon')){
   const id=state[slot];if(!id)continue;const model=modelFor(id);
   if(slot==='helmet'){
    const crown=['rats','sun','carrion','halo'].includes(id);if(!crown)rig.head.children.filter(o=>o.isMesh).forEach(o=>o.visible=false);
    if(id==='halo')model.rotation.x=Math.PI/2;attach(model,rig.head,slot,0,crown?.28:0,0,id==='halo'?.65:crown?.58:.72);
   }else if(slot==='arms'){
    if(id==='pallbearer'){attach(model,rig.castArm.userData.elbow,slot,.06,-.16,.2,.58);}
    else{
     for(const [i,arm]of [rig.swordArm,rig.castArm].entries()){
      const side=i?1:-1,glove=new T.Group();glove.rotation.z=Math.PI;attach(glove,arm.userData.elbow,slot,0,-.13,.04,.65);
      for(const part of [...model.children])if(part.position.x*side>.08){model.remove(part);part.position.x-=side*.28;glove.add(part);}
     }dispose(model);
    }
   }else if(slot==='legs'){attach(model,this.hero,slot,0,id==='boots'?.29:.4,0,id==='boots'?.7:.83);}
   else if(slot==='accessory'){rig.cape.visible=false;attach(model,rig.body,slot,0,.2,-.29,.95);}
   else if(slot==='chest'){
    // A chest item must not supply another cloak or pair of arm pieces.
    const bodies=[];model.traverse(o=>{if(o.userData.bodyArmor)bodies.push(o);});for(const body of bodies)for(const part of [...body.children])if(part.name==='cape'||Math.abs(part.position.x)>.4){body.remove(part);dispose(part);}
    attach(model,rig.body,slot,0,id==='orbit'?.72:.34,.04,id==='orbit'?.95:.83);
   }else if(slot==='testament'){model.rotation.y=-.4;attach(model,this.hero,slot,.83,1.55,-.1,.28);}
  }
 }
}
