import {mergeEffect,relicFor} from './exotics.js';
// Each hook runs once in an accepted turn. Bonus hits never re-enter these hooks.
export function beforeRelicStrike(c,damage){
 const {b,marks,move,spell,damaging,ex,proc,barrier}=c;
 if(move==='attack')marks.weaponStrikes=(marks.weaponStrikes||0)+1;
 if(ex('marionette')){
  if(move==='guard'){marks.redString=true;proc('marionette','The red string is ready.','cast',{mode:'ready'});}
  if(move==='attack'&&marks.redString){marks.redString=false;damage*=1.7;proc('marionette','The red string pulls your blade.','cast',{mode:'cut'});}
 }
 if(ex('storm')){
  if(spell&&damaging){marks.stormCharges=Math.min(3,(marks.stormCharges||0)+1);proc('storm',`${marks.stormCharges}/3 storm charges.`, 'cast',{mode:'charge',count:marks.stormCharges});}
  if(move==='attack'&&marks.stormCharges){const count=marks.stormCharges;damage+=count*12;marks.stormCharges=0;proc('storm',`${count} storm charges released.`,'cast',{mode:'strike',count});}
 }
 if(ex('eclipseMail')&&move==='attack'&&marks.shadowEdge){marks.shadowEdge=false;damage+=12;proc('eclipseMail','The unseen blade adds 12 damage.','cast',{mode:'cut'});}
 if(ex('glass')&&move==='guard'){barrier(16,'Glass Prayer');proc('glass','Sixteen prayers form a barrier.','cast',{mode:'guard'});}
 if(ex('rosary')&&spell&&damaging){barrier(8,'Prayer Is a Machine');proc('rosary','The rosary turns a spell into shelter.');}
 marks.needleBurst=ex('needle')&&move==='attack'&&marks.weaponStrikes%3===0&&!!b.effects.bleed;
 return damage;
}
export function afterRelicStrike(c){
 const {s,b,marks,move,spell,damaging,dealt,st,ex,proc,hit,heal,barrier,gainFocus}=c;
 if(b.hp<=0)return;
 const bonus=(id,n,note,extra={})=>{proc(id,note,'cast',extra);return hit(n,'exoticDamage',relicFor(id).perk);};
 if(ex('cinder')&&move==='attack'&&marks.weaponStrikes%2===0){bonus('cinder',18,'The verdict erupts.');if(b.hp>0)mergeEffect(b,'burn',{damage:5,turns:2});}
 if(b.hp>0&&ex('maw')&&move==='attack'&&marks.weaponStrikes%3===0)bonus('maw',40+s.level,'The grave opens its jaws.');
 if(b.hp>0&&ex('needle')&&move==='attack'){proc('needle','A small cruelty opens the wound.','cast',{mode:marks.needleBurst?'burst':'needle'});if(marks.needleBurst)hit(20,'exoticDamage','A Small Cruelty');if(b.hp>0)mergeEffect(b,'bleed',{damage:3+s.level,turns:2});}
 if(b.hp>0&&ex('mirror')&&move==='attack'&&!marks.mirrored){marks.mirrored=true;bonus('mirror',dealt*.5,'The reflection delivers its one returning cut.');}
 if(b.hp>0&&ex('clockwork')&&damaging&&marks.damaging%4===0){bonus('clockwork',32,'The fourth tooth tears loose.');gainFocus(6);}
 if(b.hp>0&&ex('lantern')&&spell&&damaging){bonus('lantern',10+s.level,'Five hungry lights find their quarry.',{count:5});if(b.hp>0)mergeEffect(b,'burn',{damage:4,turns:2});}
 if(b.hp>0&&ex('carrion')&&move==='guard'){bonus('carrion',14,'The murder votes in favor.');if(b.hp>0)mergeEffect(b,'curse',{power:2,amp:.1,turns:2});}
 if(b.hp>0&&ex('thornsuit')&&move==='guard'&&marks.thornSeeds){const count=marks.thornSeeds;marks.thornSeeds=0;bonus('thornsuit',count*9,`${count} thorns harvested.`,{mode:'harvest',count});heal(count*3,'Martyr’s Garden');}
 if(b.hp>0&&ex('orbit')&&spell&&damaging&&marks.spells%3===0){bonus('orbit',24+s.level*2,'The sky sends its mourner.');barrier(20,'Comet Shelter');}
}
export function relicDodge(c){
 const {marks,ex,proc}=c;
 if(ex('eclipseMail')&&marks.strikes%3===0){marks.shadowEdge=true;proc('eclipseMail','Your shadow takes the blow.','reaction',{mode:'dodge'});return true;}
 return false;
}
export function afterRelicRetaliation(c){
 const {s,b,marks,heavy,shattered,actual,st,ex,hit,proc}=c;
 if(s.hp<=0)return;
 if(ex('thornsuit')&&actual>0){marks.thornSeeds=Math.min(3,(marks.thornSeeds||0)+1);proc('thornsuit',`${marks.thornSeeds}/3 thorns rooted.`,'reaction',{mode:'grow',count:marks.thornSeeds});}
 if(b.hp>0&&ex('glass')&&shattered){proc('glass','Every shard answers.','reaction',{mode:'shatter'});hit(28,'exoticDamage','Every Shard a Prayer');}
 if(b.hp>0&&ex('furnace')&&heavy){proc('furnace','Hell opens the door in your chest.','reaction');hit(20+st.defense,'exoticDamage','No Rest for the Furnace');if(b.hp>0)mergeEffect(b,'burn',{damage:6,turns:2});}
}
