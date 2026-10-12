import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,reduce,migrate,stats,GEAR,defenseReduction} from '../engine.js';
import {EQUIPMENT_SLOTS,DEFAULT_LOADOUT,ARMOR_SLOTS} from '../equipment.js';
import {EXOTICS,TESTAMENTS,activeRelics} from '../exotics.js';

test('seven slots and starter items are available immediately; Testament type supports every rarity',()=>{
 const s=fresh();assert.deepEqual(EQUIPMENT_SLOTS,['weapon','helmet','chest','arms','legs','accessory','testament']);for(const slot of EQUIPMENT_SLOTS){assert.equal(s[slot],DEFAULT_LOADOUT[slot]);assert.ok(s.owned.includes(s[slot]));assert.equal(GEAR.find(g=>g.id===s[slot]).slot,slot);}
 assert.deepEqual(stats(s),{hp:100,focus:30,attack:12,defense:2});assert.ok(TESTAMENTS.every(e=>e.rarity==='Exotic'));assert.equal(TESTAMENTS.length,7);assert.deepEqual(GEAR.filter(g=>g.slot==='testament').map(g=>g.rarity),['Worn','Uncommon','Rare','Epic','Legendary']);
});
test('v5 armor saves route worn gear to the correct body part and keep the same stored collection and hour',()=>{
 for(const oldArmor of ['rats','sutures','boots','moth','glass','iron','mantle','pallbearer']){
  const old={...fresh(),version:5,weapon:'cinder',armor:oldArmor,testament:'typewriter',owned:['rust','rags','iron','mantle'],ownedExotics:['cinder','typewriter',oldArmor].filter(id=>EXOTICS.some(e=>e.id===id)),standardLoadout:{weapon:'rust',armor:'iron'},coins:981,xp:31};
  const actual=migrate(old),item=EXOTICS.find(e=>e.id===oldArmor)||GEAR.find(g=>g.id===oldArmor);assert.equal(actual[item.slot],oldArmor);assert.equal(actual.weapon,'cinder');assert.equal(actual.testament,'typewriter');assert.equal(actual.coins,981);assert.equal(actual.xp,31);assert.deepEqual(actual.exoticShop,old.exoticShop);assert.ok(old.owned.every(id=>actual.owned.includes(id)));assert.deepEqual(actual.ownedExotics,old.ownedExotics);assert.equal(actual.armor,undefined);assert.deepEqual(migrate(actual),actual);
 }
});
test('seven independent exotic types can coexist and swapping one slot leaves the other six untouched',()=>{
 const ids=['storm','rats','glass','sutures','boots','understudy','typewriter'];let s={...fresh(),ownedExotics:[...ids,'cinder']};for(const id of ids)s=reduce(s,{type:'TOGGLE_EXOTIC',id});assert.deepEqual(activeRelics(s),ids);const before=structuredClone(s);s=reduce(s,{type:'TOGGLE_EXOTIC',id:'cinder'});assert.equal(s.weapon,'cinder');for(const slot of EQUIPMENT_SLOTS.slice(1))assert.equal(s[slot],before[slot]);assert.ok(!s.equippedExotics.includes('storm'));assert.ok(s.ownedExotics.includes('storm'));
});
test('wrong-type and unowned slot assignments are rejected; no duplicated item can grant repeated bonuses',()=>{
 const bad={...fresh(),ownedExotics:['cinder'],weapon:'cinder',helmet:'cinder',chest:'cinder',testament:'storm',equippedExotics:['cinder','cinder','storm']};const s=migrate(bad);assert.deepEqual(activeRelics(s),['cinder']);assert.equal(s.helmet,'ashhood');assert.equal(s.chest,'rags');assert.equal(s.testament,'oath');assert.equal(stats(s).attack,27);
});
test('standard armor has a complete upgrade path for every body slot and seven-slot stats add once',()=>{
 for(const slot of EQUIPMENT_SLOTS)for(const tier of [1,2,3,4])assert.ok(GEAR.some(g=>g.slot===slot&&g.tier===tier&&g.cost>0),`${slot} tier ${tier}`);
 let s={...fresh(),owned:GEAR.map(g=>g.id)};for(const [slot,id]of Object.entries({weapon:'god',helmet:'helmet4',chest:'night',arms:'arms4',legs:'legs4',accessory:'accessory4',testament:'testament4'}))s=reduce(s,{type:'EQUIP',id});assert.deepEqual(stats(s),{attack:50,defense:30,hp:136,focus:52});assert.equal(s.hp,100);assert.equal(s.focus,30);
});
test('armor reduction has diminishing returns and a hard cap, keeping heavy blows meaningful',()=>{
 assert.equal(defenseReduction(0),0);assert.ok(defenseReduction(70)-defenseReduction(35)<defenseReduction(35)-defenseReduction(0));assert.equal(defenseReduction(1000000),.75);
 let s={...fresh(),owned:GEAR.map(g=>g.id)};for(const slot of ARMOR_SLOTS){const g=GEAR.filter(g=>g.slot===slot&&g.tier===4)[0];s=reduce(s,{type:'EQUIP',id:g.id});}s=reduce(s,{type:'BEGIN'});s.battle.hp=10000;s.battle.attack=100;const normal=reduce(s,{type:'TURN',move:'attack'});const heavy=reduce({...s,battle:{...s.battle,turn:3}},{type:'TURN',move:'attack'});assert.ok(normal.combatFx.events.find(e=>e.type==='hurt').amount>0);assert.ok(heavy.combatFx.events.find(e=>e.type==='hurt').amount>normal.combatFx.events.find(e=>e.type==='hurt').amount);
});
test('seven-slot perk chains remain bounded with rats, stitches, barriers, dodges, echoes and stored ink',()=>{
 let s={...fresh(),ownedExotics:['storm','rats','glass','sutures','boots','understudy','typewriter']};for(const id of s.ownedExotics)s=reduce(s,{type:'TOGGLE_EXOTIC',id});s=reduce(s,{type:'BEGIN'});s.battle.hp=s.battle.maxHp=50000;s.battle.attack=8;s.exoticResources.ink=5;
 for(let i=0;i<45;i++){s=reduce(s,{type:'TURN',move:['guard','spell','attack'][i%3]});assert.ok(s.battle);assert.ok(s.focus>=0&&s.focus<=stats(s).focus);assert.ok(s.hp>0&&s.hp<=stats(s).hp);assert.ok(s.combatFx.events.length<70);assert.ok((s.combatFx.relicAnimations||[]).length<=8);assert.ok(s.battle.exotic.rats<=12);assert.ok((s.battle.exotic.stormCharges||0)<=3);assert.equal(s.equippedExotics.length,7);}
});
test('migration during combat changes equipment metadata without advancing the battle or its counters',()=>{
 let old=reduce(fresh(),{type:'BEGIN'});old.version=5;old.armor='glass';old.ownedExotics=['glass'];old.equippedExotics=['glass'];old.battle.exotic.turns=17;const b=structuredClone(old.battle),coins=old.coins,rev=old.rev;const next=migrate(old);assert.deepEqual(next.battle,b);assert.equal(next.coins,coins);assert.equal(next.rev,rev);assert.equal(next.chest,'glass');
});
