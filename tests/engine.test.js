import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, reduce, stats, shopTier, xpNeeded, SKILLS } from '../engine.js';

test('page clicks grant one coin without mutating the prior save',()=>{
 const s=fresh(),next=reduce(s,{type:'BROWSE',kind:'click'});
 assert.equal(next.coins,s.coins+1);assert.equal(next.clicks,1);assert.equal(s.clicks,0);
});
test('20 rhythmic keys grant coins and focus, while pauses reset a chain',()=>{
 let s={...fresh(),focus:0};
 for(let i=0;i<19;i++)s=reduce(s,{type:'BROWSE',kind:'type'},10000+i*100);
 assert.equal(s.coins,12);assert.equal(s.combo,19);
 s=reduce(s,{type:'BROWSE',kind:'type'},12000);
 assert.equal(s.coins,17);assert.equal(s.focus,8);assert.equal(s.combo,0);assert.equal(s.bursts,1);
 s=reduce(s,{type:'BROWSE',kind:'type'},13000);
 s=reduce(s,{type:'BROWSE',kind:'type'},16000);assert.equal(s.combo,1);
});
test('equipment requires funds and progression, equips once, and cannot double charge',()=>{
 let s=fresh();s=reduce(s,{type:'BUY',id:'fang'});assert.equal(s.weapon,'rust');
 s.coins=1000;s=reduce(s,{type:'BUY',id:'god'});assert.equal(s.weapon,'rust');
 s=reduce(s,{type:'BUY',id:'fang'});assert.equal(s.weapon,'fang');assert.equal(s.coins,965);assert.equal(stats(s).attack,17);
 s=reduce(s,{type:'BUY',id:'fang'});assert.equal(s.coins,965);
 s=reduce(s,{type:'EQUIP',id:'rust'});assert.equal(s.weapon,'rust');
 assert.equal(shopTier({...s,stage:4}),2);assert.equal(shopTier({...s,stage:7}),3);assert.equal(shopTier({...s,stage:10}),4);
});
test('skill branches require a fully ranked parent and charge the correct points',()=>{
 let s={...fresh(),points:30};s=reduce(s,{type:'LEARN',id:'leech'});assert.equal(s.skills.leech,undefined);
 for(let i=0;i<3;i++)s=reduce(s,{type:'LEARN',id:'edge'});
 assert.equal(stats(s).attack,21);assert.equal(s.points,27);
 s=reduce(s,{type:'LEARN',id:'edge'});assert.equal(s.points,27);
 s=reduce(s,{type:'LEARN',id:'leech'});assert.equal(s.skills.leech,1);assert.equal(s.points,26);
});
test('victory grants loot, advances the world, and level-ups refill resources',()=>{
 let s=reduce(fresh(),{type:'BEGIN'});const loot=s.battle.coins;s.battle.hp=1;s.xp=49;
 s=reduce(s,{type:'TURN',move:'attack'});
 assert.equal(s.battle,null);assert.equal(s.stage,2);assert.equal(s.kills,1);assert.equal(s.coins,12+loot);
 assert.equal(s.level,2);assert.equal(s.points,4);assert.equal(s.hp,stats(s).hp);assert.equal(s.xp,29);
});
test('spells require focus and locked capstones cannot be used',()=>{
 let s=reduce({...fresh(),focus:0},{type:'BEGIN'});const b=structuredClone(s.battle);
 s=reduce(s,{type:'TURN',move:'spell'});assert.deepEqual(s.battle,b);
 s.focus=30;s=reduce(s,{type:'TURN',move:'eclipse'});assert.deepEqual(s.battle,b);
 s=reduce(s,{type:'TURN',move:'rite'});assert.deepEqual(s.battle,b);
});
test('guard mitigates the telegraphed heavy attack',()=>{
 let s=reduce({...fresh(),hp:50},{type:'BEGIN'});s.battle.turn=3;
 const guarded=reduce(s,{type:'TURN',move:'guard'}),strike=reduce(s,{type:'TURN',move:'attack'});
 assert.ok(guarded.hp>strike.hp);assert.equal(guarded.battle.turn,4);
});
test('defeat, retreat, and rest leave progression recoverable',()=>{
 let s=reduce(fresh(),{type:'BEGIN'});s.hp=1;s=reduce(s,{type:'TURN',move:'attack'});
 assert.equal(s.battle,null);assert.equal(s.stage,1);assert.equal(s.hp,50);assert.equal(s.coins,4);
 s.coins=20;s=reduce(s,{type:'REST'});assert.equal(s.hp,100);assert.equal(s.coins,10);
 s=reduce(s,{type:'BEGIN'});const during=reduce(s,{type:'REST'});assert.equal(during.coins,s.coins);
 s=reduce(s,{type:'FLEE'});assert.equal(s.battle,null);assert.equal(s.coins,5);
});
test('Last Rites triggers once per fight',()=>{
 let s=reduce({...fresh(),skills:{revenant:1}},{type:'BEGIN'});s.hp=1;
 s=reduce(s,{type:'TURN',move:'attack'});assert.equal(s.hp,15);assert.equal(s.battle.revived,true);
 s.hp=1;s=reduce(s,{type:'TURN',move:'attack'});assert.equal(s.battle,null);assert.equal(s.hp,50);
});
test('typing focus and vitality never exceed their current stat caps',()=>{
 let s=fresh();for(let i=0;i<100;i++)s=reduce(s,{type:'BROWSE',kind:'type'},10000+i*100);
 assert.equal(s.focus,stats(s).focus);
 s.points=3;s=reduce(s,{type:'LEARN',id:'ward'});assert.equal(s.hp,stats(s).hp);
});
test('every skill tree is reachable and its capstone acts in combat',()=>{
 let s={...fresh(),points:100,coins:1000};
 for(const sk of SKILLS)for(let i=0;i<sk.max;i++)s=reduce(s,{type:'LEARN',id:sk.id});
 assert.equal(s.skills.eclipse,1);assert.equal(s.skills.rage,1);assert.equal(s.skills.revenant,1);
 s.stage=10;s=reduce(s,{type:'BUY',id:'god'});s=reduce(s,{type:'BEGIN'});
 const hp=s.battle.hp;s=reduce(s,{type:'TURN',move:'eclipse'});assert.ok(s.battle.hp<hp);assert.equal(s.focus,25);
 s=reduce(s,{type:'TURN',move:'rite'});assert.ok(s.hp>0);
});
test('many battles progress across all forge tiers without negative resources',()=>{
 let s={...fresh(),coins:10000,weapon:'god',armor:'night',owned:['rust','rags','god','night'],skills:{edge:3,ward:3,leech:3}};
 for(let battle=0;battle<12;battle++){
  s=reduce(s,{type:'REST'});s=reduce(s,{type:'BEGIN'});
  let turns=0;while(s.battle&&turns++<100)s=reduce(s,{type:'TURN',move:'attack'});
  assert.ok(turns<100);assert.ok(s.hp>0);assert.ok(s.coins>=0);assert.ok(s.focus>=0);
 }
 assert.equal(s.stage,13);assert.equal(shopTier(s),4);assert.equal(s.kills,12);assert.ok(s.level>1);assert.ok(s.xp<xpNeeded(s));
});

test('visual-effect preferences persist without changing gameplay or accepting invalid modes',()=>{
 const initial=fresh();const muted=reduce(initial,{type:'SET_FX',mode:'off'});
 assert.equal(muted.fx,'off');assert.equal(muted.coins,initial.coins);assert.equal(muted.hp,initial.hp);
 assert.equal(reduce(muted,{type:'SET_FX',mode:'invalid'}).fx,'off');
 assert.equal(reduce(muted,{type:'SET_FX',mode:'subtle'}).fx,'subtle');
});
