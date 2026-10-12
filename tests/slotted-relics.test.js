import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,reduce,migrate,stats,VERSION} from '../engine.js';
import {EXOTICS,NEW_EXOTICS,TESTAMENTS,activeRelics,hasExotic} from '../exotics.js';
const fight=(id,extra={})=>{let s={...fresh(),ownedExotics:[id],...extra};s=reduce(s,{type:'TOGGLE_EXOTIC',id});s.hp=stats(s).hp;s.focus=stats(s).focus;s=reduce(s,{type:'BEGIN'});s.battle.hp=s.battle.maxHp=5000;s.battle.attack=6;return s;};
const act=(s,move='attack')=>{const next=reduce(s,{type:'TURN',move});assert.ok(next.focus>=0&&next.focus<=stats(next).focus);assert.ok(next.hp>=0&&next.hp<=stats(next).hp);return next;};
const procced=(s,id)=>s.combatFx.relicAnimations?.some(e=>e.id===id)||false;
const bonus=(s,name)=>s.combatFx.events.find(e=>e.type==='exoticDamage'&&e.label===name)?.amount;

test('legacy gear and objects migrate into seven slots without losing ownership, coins, talents or combat turns',()=>{
 const old={...fresh(),version:4,owned:['rust','rags','fang','iron'],weapon:'fang',armor:'iron',ownedExotics:EXOTICS.slice(0,20).map(e=>e.id),equippedExotics:EXOTICS.slice(0,20).map(e=>e.id),coins:717,skills:{ward:2},log:['Keep this story']};delete old.standardLoadout;delete old.testament;
 const next=migrate(old);assert.equal(next.version,VERSION);assert.equal(next.weapon,'mouth');assert.equal(next.chest,'iron');assert.equal(next.arms,'sutures');assert.equal(next.testament,'tea');assert.deepEqual(next.ownedExotics,old.ownedExotics);assert.ok(old.owned.every(id=>next.owned.includes(id)));assert.equal(next.coins,717);assert.deepEqual(next.skills,old.skills);assert.deepEqual(next.log,old.log);assert.equal(next.standardLoadout.weapon,'fang');assert.equal(next.standardLoadout.chest,'iron');assert.deepEqual(next.equippedExotics,['mouth','halo','sutures','boots','moth','tea']);assert.deepEqual(migrate(next),next);const sparse={...old};delete sparse.skills;assert.deepEqual(migrate(sparse).skills,{});assert.equal(migrate(sparse).coins,717);
});
test('every converted Testament uses its own slot and every new exotic is a weapon or armor',()=>{
 assert.deepEqual(TESTAMENTS.map(e=>e.id),['tea','tax','bell','hourglass','miser','choir','typewriter']);assert.equal(NEW_EXOTICS.filter(e=>e.slot==='weapon').length,8);assert.equal(NEW_EXOTICS.filter(e=>e.slot!=='weapon'&&e.slot!=='testament').length,7);
 for(const e of EXOTICS){let s={...fresh(),ownedExotics:[e.id]};s=reduce(s,{type:'TOGGLE_EXOTIC',id:e.id});assert.equal(s[e.slot],e.id);assert.ok(hasExotic(s,e.id));assert.deepEqual(s.equippedExotics,[e.id]);}
});
test('standard and exotic gear replace the same slot; Testament swaps do not change gear; stored perks stay inactive',()=>{
 let s={...fresh(),owned:['rust','rags','fang'],ownedExotics:['cinder','storm','glass','tea','typewriter']};for(const id of ['cinder','glass','tea'])s=reduce(s,{type:'TOGGLE_EXOTIC',id});assert.deepEqual(activeRelics(s),['cinder','glass','tea']);
 s=reduce(s,{type:'TOGGLE_EXOTIC',id:'storm'});assert.equal(s.weapon,'storm');assert.ok(!hasExotic(s,'cinder'));s=reduce(s,{type:'TOGGLE_EXOTIC',id:'typewriter'});assert.equal(s.testament,'typewriter');assert.equal(s.weapon,'storm');assert.equal(s.chest,'glass');assert.ok(!hasExotic(s,'tea'));
 s=reduce(s,{type:'EQUIP',id:'fang'});assert.equal(s.weapon,'fang');assert.ok(!hasExotic(s,'storm'));s=reduce(s,{type:'TOGGLE_EXOTIC',id:'cinder'});s=reduce(s,{type:'TOGGLE_EXOTIC',id:'cinder'});assert.equal(s.weapon,'fang');assert.equal(s.ownedExotics.length,5);
 const forged=migrate({...s,weapon:'orbit',chest:'cinder',testament:'storm',equippedExotics:['storm','orbit','cinder']});assert.equal(forged.weapon,'fang');assert.equal(forged.chest,'rags');assert.equal(forged.testament,'oath');
});
test('Cinder Verdict counts Strikes, ignores Guard, and applies its second-cut eruption',()=>{
 let s=fight('cinder');s=act(s);assert.ok(!procced(s,'cinder'));s=act(s,'guard');assert.ok(!procced(s,'cinder'));s=act(s);assert.equal(bonus(s,'Guilty of Burning'),18);assert.equal(s.battle.effects.burn.damage,5);
});
test('Widow’s Last Dance consumes one Guard string and buffs only the next Strike',()=>{
 let s=fight('marionette');s=act(s,'guard');assert.equal(s.battle.exotic.redString,true);s=act(s);assert.equal(s.combatFx.events.find(e=>e.type==='damage').amount,Math.round(stats(s).attack*1.7));assert.equal(s.battle.exotic.redString,false);s=act(s);assert.equal(s.combatFx.events.find(e=>e.type==='damage').amount,stats(s).attack);assert.ok(!procced(s,'marionette'));
});
test('Gravetide opens a bone maw on every third Strike',()=>{
 let s=fight('maw');s=act(s);s=act(s);assert.ok(!procced(s,'maw'));s=act(s);assert.equal(bonus(s,'The Grave Has Jaws'),41);
});
test('needleblade maintains stronger wounds and bursts existing bleed on its third Strike',()=>{
 let s=fight('needle');s.battle.effects.bleed={damage:12,turns:5};s=act(s);assert.equal(s.battle.effects.bleed.damage,12);s=act(s);s=act(s);assert.equal(bonus(s,'A Small Cruelty'),20);assert.equal(s.battle.effects.bleed.damage,12);
});
test('thunder spear stores at most three spell charges and consumes them in one Strike',()=>{
 let s=fight('storm');for(let i=0;i<4;i++){s.focus=stats(s).focus;s=act(s,'spell');}assert.equal(s.battle.exotic.stormCharges,3);s=act(s);assert.equal(s.combatFx.events.find(e=>e.type==='damage').amount,stats(s).attack+36);assert.equal(s.battle.exotic.stormCharges,0);assert.equal(s.combatFx.relicAnimations.find(e=>e.id==='storm').count,3);
});
test('mirror cleaver copies half of actual primary damage only once each battle',()=>{
 let s=fight('mirror');s=act(s);assert.equal(bonus(s,'The Reflection Refuses'),Math.round(stats(s).attack*.5));s=act(s);assert.ok(!procced(s,'mirror'));
});
test('sawblade advances on damaging actions, ignores Guard, and restores exactly six focus',()=>{
 let s=fight('clockwork');for(let i=0;i<3;i++)s=act(s);s=act(s,'guard');assert.ok(!procced(s,'clockwork'));s.focus=12;s=act(s,'spell');assert.equal(bonus(s,'The Last Tooth'),32);assert.equal(s.focus,8);
});
test('hunting lantern releases five lights only on damaging spells',()=>{
 let s=fight('lantern',{skills:{spark:1,hex:1},loadout:['hex']});s=act(s,'hex');assert.ok(!procced(s,'lantern'));s=act(s,'spell');assert.equal(bonus(s,'Five Hungry Lights'),11);assert.equal(s.combatFx.relicAnimations.find(e=>e.id==='lantern').count,5);assert.equal(s.battle.effects.burn.damage,4);
});
test('raven crown attacks and curses when guarding',()=>{
 let s=act(fight('carrion'),'guard');assert.equal(bonus(s,'A Murder in Session'),14);assert.equal(s.battle.effects.curse.power,2);assert.equal(s.battle.effects.curse.amp,.1);
});
test('furnace armor erupts after a survived heavy blow, never on a normal blow',()=>{
 let s=fight('furnace');s=act(s);assert.ok(!procced(s,'furnace'));s.battle.turn=3;s.battle.attack=30;s=act(s);assert.equal(bonus(s,'No Rest for the Furnace'),20+stats(s).defense);assert.equal(s.battle.effects.burn.damage,6);assert.equal(s.combatFx.relicAnimations.find(e=>e.id==='furnace').phase,'reaction');
});
test('glass armor grants its ward on Guard and shatters only when incoming damage breaks it',()=>{
 let s=act(fight('glass'),'guard');assert.equal(s.combatFx.events.find(e=>e.type==='barrier').amount,16);s.battle.barrier=1;s=act(s);assert.equal(bonus(s,'Every Shard a Prayer'),28);assert.equal(s.combatFx.relicAnimations.find(e=>e.id==='glass').mode,'shatter');
});
test('shadow plate dodges each third enemy strike and readies one bonus cut',()=>{
 let s=fight('eclipseMail');s=act(s,'guard');s=act(s,'guard');s.battle.barrier=20;s=act(s,'guard');assert.ok(s.combatFx.events.some(e=>e.type==='dodge'));assert.equal(s.battle.barrier,20);assert.equal(s.battle.exotic.shadowEdge,true);s=act(s);assert.equal(s.combatFx.events.find(e=>e.type==='damage').amount,stats(s).attack+12);assert.equal(s.battle.exotic.shadowEdge,false);
});
test('rosary gauntlets ward a damaging spell before enemy retaliation',()=>{
 let s=act(fight('rosary'),'spell');assert.equal(s.combatFx.events.find(e=>e.type==='barrier').amount,8);assert.equal(s.battle.barrier,8-s.combatFx.events.find(e=>e.type==='absorb').amount);assert.ok(procced(s,'rosary'));
});
test('briar mantle stores actual wounds, caps at three, and consumes all thorns on Guard',()=>{
 let s=fight('thornsuit');for(let i=0;i<4;i++)s=act(s);assert.equal(s.battle.exotic.thornSeeds,3);s.hp=20;s=act(s,'guard');assert.equal(bonus(s,'Suffering Takes Root'),27);assert.equal(s.combatFx.events.find(e=>e.label==='Martyr’s Garden').amount,9);assert.equal(s.battle.exotic.thornSeeds,1); // Guard harvests, then the incoming wound grows one new thorn.
});
test('comet pauldrons shield and impact on each third damaging spell',()=>{
 let s=fight('orbit');s=act(s,'spell');s=act(s,'spell');assert.ok(!procced(s,'orbit'));s=act(s,'spell');assert.equal(bonus(s,'The Sky Attends'),26);assert.equal(s.combatFx.events.find(e=>e.type==='barrier').amount,20);assert.equal(s.battle.barrier,20-s.combatFx.events.find(e=>e.type==='absorb').amount);
});
test('stored new weapons never proc, killed targets never receive bonus chains, and visual records cannot deal damage',()=>{
 let s=fight('cinder');s.ownedExotics.push('lantern','maw');s=act(s);assert.ok(!procced(s,'lantern'));s.battle.hp=1;s=act(s);assert.equal(s.combatFx.victory,true);assert.ok(!procced(s,'cinder'));assert.equal(s.combatFx.enemyAttack,undefined);
 const copy=reduce(s,{type:'TURN',move:'attack'});assert.equal(copy.coins,s.coins);assert.equal(copy.kills,s.kills);
});

test('repeated health and focus cap swaps cannot heal a player at critically low resources',()=>{
 let s={...fresh(),ownedExotics:['miser','typewriter','furnace'],hp:3,focus:1};
 for(let i=0;i<20;i++)for(const id of ['miser','typewriter','furnace']){s=reduce(s,{type:'TOGGLE_EXOTIC',id});assert.equal(s.hp,3);assert.equal(s.focus,1);}
 s.hp=stats(s).hp;s.focus=stats(s).focus;s=reduce(s,{type:'TOGGLE_EXOTIC',id:'miser'});assert.ok(s.hp<=stats(s).hp);assert.ok(s.focus<=stats(s).focus);
});
