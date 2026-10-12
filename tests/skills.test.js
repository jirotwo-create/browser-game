import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,reduce,stats,migrate} from '../engine.js';
import {SKILLS,RUNES,PRESETS,moveReady,treePoints,focusCost} from '../skills.js';
const train=(ids,extra={})=>{let s={...fresh(),points:250,...extra};for(const id of ids){const k=SKILLS.find(k=>k.id===id);for(let i=0;i<k.max;i++)s=reduce(s,{type:'LEARN',id});}return s;};
const battle=s=>{s=reduce(s,{type:'BEGIN'});s.battle.hp=s.battle.maxHp=1000;s.battle.attack=12;return s;};
const turn=(s,move)=>reduce(s,{type:'TURN',move});

test('30 unique talents, 11 active skills and rune families are connected to valid prerequisites',()=>{
 assert.equal(SKILLS.length,30);assert.equal(new Set(SKILLS.map(k=>k.id)).size,30);assert.equal(SKILLS.filter(k=>k.active).length,11);
 for(const k of SKILLS){assert.ok(!k.parent||SKILLS.some(p=>p.id===k.parent&&p.tree===k.tree));assert.ok(!k.active||RUNES[k.id]?.length===2);}
});
test('one foundation rank opens branches; capstones require eight spent points',()=>{
 let s={...fresh(),points:30};s=reduce(s,{type:'LEARN',id:'edge'});s=reduce(s,{type:'LEARN',id:'rend'});assert.equal(s.skills.rend,1);
 s=reduce(s,{type:'LEARN',id:'rage'});assert.equal(s.skills.rage,undefined);
 s=train(['edge','rend','leech']);assert.ok(treePoints(s,'blood')>=8);s=reduce(s,{type:'LEARN',id:'rage'});assert.equal(s.skills.rage,1);
});
test('exactly three active slots, swaps do not duplicate abilities, empty slots keep their positions',()=>{
 let s=train(['edge','rend','leech','feast','execute','riposte','rage']);assert.equal(s.loadout.length,3);
 s=reduce(s,{type:'SLOT',slot:1,id:'rage'});assert.equal(s.loadout[1],'rage');
 s=reduce(s,{type:'SLOT',slot:2,id:'rage'});assert.equal(s.loadout[1],null);assert.equal(s.loadout[2],'rage');
 s=reduce(s,{type:'SLOT',slot:0,id:null});s=reduce(s,{type:'SET_FX',mode:'full'});assert.equal(s.loadout[0],null);assert.equal(s.loadout[2],'rage');
 s=battle(s);assert.match(moveReady(s,'rend'),/Equip/);assert.equal(moveReady(s,'rage'),'');
});
test('rune variants require rank two; changing a rune never changes talent points',()=>{
 let s={...fresh(),points:10};s=reduce(s,{type:'LEARN',id:'edge'});s=reduce(s,{type:'LEARN',id:'rend'});
 s=reduce(s,{type:'SET_RUNE',id:'rend',rune:'deep'});assert.equal(s.runes.rend,undefined);
 s=reduce(s,{type:'LEARN',id:'rend'});const points=s.points;s=reduce(s,{type:'SET_RUNE',id:'rend',rune:'deep'});assert.equal(s.runes.rend,'deep');assert.equal(s.points,points);
 s=reduce(s,{type:'SET_RUNE',id:'rend',rune:'rupture'});assert.equal(s.runes.rend,'rupture');
});
test('bleed lasts the documented number of next turns and powers life-steal',()=>{
 let s=battle(train(['edge','rend','leech','feast','hemorrhage']));s.hp=40;s=turn(s,'rend');assert.equal(s.battle.effects.bleed.turns,3);
 const damage=s.battle.effects.bleed.damage,health=s.hp;s=turn(s,'feast');assert.ok(s.hp>health);assert.equal(s.battle.effects.bleed.turns,2);assert.ok(s.combatFx.events.some(e=>e.type==='bleed'&&e.amount===damage));
 s=turn(s,'guard');s=turn(s,'guard');assert.equal(s.battle.effects.bleed,undefined);
});
test('lingering wounds extend bleed and rupture consumes it for burst damage',()=>{
 let s=train(['edge','rend']);s=reduce(s,{type:'SET_RUNE',id:'rend',rune:'deep'});s=battle(s);s=turn(s,'rend');assert.equal(s.battle.effects.bleed.turns,5);
 let q=train(['edge','rend']);q=reduce(q,{type:'SET_RUNE',id:'rend',rune:'rupture'});q=battle(q);q.battle.effects.bleed={damage:12,turns:3};q=turn(q,'rend');assert.equal(q.battle.effects.bleed,undefined);assert.ok(q.combatFx.events.find(e=>e.type==='damage').amount>=60);
});
test('barrier absorbs damage and reprisal converts the remaining barrier into damage',()=>{
 let s=battle(train(['ward','bastion','shelter','reprisal']));const hp=s.hp;s=turn(s,'bastion');assert.equal(s.hp,hp);assert.ok(s.battle.barrier>0);assert.ok(s.combatFx.events.some(e=>e.type==='absorb'));
 const remaining=s.battle.barrier;s=turn(s,'reprisal');assert.equal(s.battle.barrier,0);assert.ok(s.combatFx.events.some(e=>e.type==='shatter'&&e.amount===remaining));
});
test('guard-based barriers and thorns form a distinct retaliatory build',()=>{
 let s=battle(train(['ward','bastion','thorns','fortress']));const before=s.battle.hp;s=turn(s,'guard');assert.ok(s.battle.barrier>0);assert.ok(s.battle.hp<before);assert.ok(s.combatFx.events.some(e=>e.type==='reflect'));
});
test('regeneration is delayed, persists for exactly three turns, and respects maximum health',()=>{
 let s=battle(train(['ward','shelter','mend']));s.hp=20;s=turn(s,'mend');assert.equal(s.battle.regen.turns,3);
 for(let i=0;i<3;i++)s=turn(s,'guard');assert.equal(s.battle.regen,undefined);assert.ok(s.hp<=stats(s).hp);
});
test('curse increases spell damage, lowers enemy damage, and expires after three strikes',()=>{
 let s=battle(train(['spark','hex']));s=turn(s,'hex');assert.equal(s.battle.effects.curse.turns,2);
 const uncursed=structuredClone(s);delete uncursed.battle.effects.curse;
 const cursed=turn(s,'spell'),plain=turn(uncursed,'spell');assert.ok(cursed.battle.hp<plain.battle.hp);assert.ok(cursed.hp>plain.hp);
 s=turn(cursed,'guard');assert.equal(s.battle.effects.curse,undefined);
});
test('silence suppresses telegraphed heavy blows',()=>{
 let s=train(['spark','hex']);s=reduce(s,{type:'SET_RUNE',id:'hex',rune:'silence'});s=battle(s);s.battle.turn=3;const before=s.hp;s=turn(s,'hex');assert.ok(before-s.hp<=s.battle.attack);assert.equal(s.battle.effects.curse.silence,true);
});
test('ghostfire stacks with bleed, and nova consumes the burn instead of silently keeping it',()=>{
 let s=train(['edge','rend','spark','hex','kindle','echo','omen','nova']);s=reduce(s,{type:'SLOT',slot:2,id:'nova'});s=battle(s);s.focus=45;
 s=turn(s,'rend');s=turn(s,'spell');assert.ok(s.battle.effects.bleed&&s.battle.effects.burn);
 s=turn(s,'nova');assert.equal(s.battle.effects.burn,undefined);assert.ok(s.combatFx.events.some(e=>e.type==='nova'));
});
test('spell resonance stacks up to three and a non-spell action resets it',()=>{
 let s=battle(train(['spark','hex','kindle','resonance']));s.focus=200;
 let damages=[];for(let i=0;i<4;i++){s=turn(s,'spell');damages.push(s.combatFx.events.find(e=>e.type==='damage').amount);}
 assert.ok(damages[1]>damages[0]);assert.equal(s.battle.resonance,3);s=turn(s,'guard');assert.equal(s.battle.resonance,0);
});
test('cooldowns require the stated number of other turns, rejected moves do not tick status effects',()=>{
 let s=battle(train(['edge','rend']));s=turn(s,'rend');assert.equal(s.battle.cooldowns.rend,2);const b=structuredClone(s.battle),focus=s.focus;
 s=turn(s,'rend');assert.deepEqual(s.battle,b);assert.equal(s.focus,focus);
 s=turn(s,'guard');assert.match(moveReady(s,'rend'),/1 turn/);s=turn(s,'guard');assert.equal(moveReady(s,'rend'),'');
});
test('a damage-over-time kill awards loot once without spending the selected spell cost',()=>{
 let s=battle(fresh());s.battle.hp=2;s.battle.effects.bleed={damage:3,turns:2};const coins=s.coins,focus=s.focus;
 s=turn(s,'spell');assert.equal(s.battle,null);assert.equal(s.focus,focus);assert.ok(s.coins>coins);const victories=s.kills;s=turn(s,'spell');assert.equal(s.kills,victories);
});
test('build changes are frozen in combat; respec refunds exactly all invested points',()=>{
 let s=train(['edge','rend','leech']);const original=s.points,refund=treePoints(s,'blood');const fighting=battle(s);
 for(const action of [{type:'RESPEC'},{type:'SLOT',slot:0,id:null},{type:'LEARN',id:'feast'},{type:'SET_RUNE',id:'rend',rune:'deep'},{type:'PRESET',id:'fortress'}]){const next=reduce(fighting,action);assert.deepEqual(next.skills,fighting.skills);assert.deepEqual(next.loadout,fighting.loadout);}
 s=reduce(s,{type:'RESPEC'});assert.equal(s.points,original+refund);assert.deepEqual(s.skills,{});assert.deepEqual(s.loadout,[]);
});
test('starter builds never overspend and can be replaced with another build without point loss',()=>{
 for(const id of Object.keys(PRESETS)){let s=reduce(fresh(),{type:'PRESET',id});assert.equal(s.points,0);assert.equal(Object.values(s.skills).reduce((a,b)=>a+b,0),2);assert.equal(s.loadout.length,1);s=reduce(s,{type:'PRESET',id:'fortress'});assert.equal(s.points,0);assert.equal(s.skills.ward,1);assert.equal(s.skills.bastion,1);}
});
test('old saves retain progression and existing capstones are equipped during migration',()=>{
 const s={...fresh(),version:1,coins:88,stage:8,skills:{edge:3,rage:1,eclipse:1}};delete s.loadout;delete s.runes;
 const next=migrate(s);assert.deepEqual(next.loadout,['rage','eclipse']);assert.equal(next.coins,88);assert.equal(next.stage,8);assert.equal(next.skills.edge,3);assert.equal(next.version,5);
});
test('every active skill and both of its rune variants can execute without negative resources',()=>{
 let master={...fresh(),points:500};for(const k of SKILLS)for(let i=0;i<k.max;i++)master=reduce(master,{type:'LEARN',id:k.id});
 for(const k of SKILLS.filter(k=>k.active))for(const rune of RUNES[k.id]){
  let s=reduce(master,{type:'SLOT',slot:0,id:k.id});s=reduce(s,{type:'SET_RUNE',id:k.id,rune:rune.id});assert.equal(s.runes[k.id],rune.id);s=battle(s);s.hp=80;s.battle.barrier=35;s.battle.effects.bleed={damage:8,turns:3};s.battle.effects.burn={damage:6,turns:2};
  assert.equal(moveReady(s,k.id),'');s=turn(s,k.id);assert.equal(s.combatFx.move,k.id);assert.ok(s.hp>0);assert.ok(s.focus>=0);assert.ok(s.focus<=stats(s).focus);assert.ok(s.hp<=stats(s).hp);assert.ok(s.battle.cooldowns[k.id]);
 }
});

test('respec and relearning stat talents cannot generate free healing or focus',()=>{
 let s={...fresh(),points:10,hp:40,focus:5};
 for(let i=0;i<3;i++){s=reduce(s,{type:'LEARN',id:'ward'});s=reduce(s,{type:'LEARN',id:'spark'});s=reduce(s,{type:'RESPEC'});assert.equal(s.hp,40);assert.equal(s.focus,5);}
});
