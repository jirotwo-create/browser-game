import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,reduce,stats,migrate,VERSION} from '../engine.js';
import {moveReady} from '../skills.js';
import {existsSync} from 'node:fs';
import {EXOTICS,shopStock,exoticOffers,exoticBonuses,mergeEffect,HOUR_MS,hourSlot,nextShopRotation} from '../exotics.js';
const relics=(ids,extra={})=>({...fresh(),ownedExotics:[...ids],equippedExotics:[...ids],...extra});
const fight=s=>{s=reduce(s,{type:'BEGIN'});s.battle.hp=s.battle.maxHp=10000;s.battle.attack=10;return s;};
const turn=(s,move='attack')=>reduce(s,{type:'TURN',move});
const procs=s=>s.combatFx.exotics||[];

test('20 unique exotics have distinct perks, valid models, additive stats, and no equip cap',()=>{
 assert.equal(EXOTICS.length,20);assert.equal(new Set(EXOTICS.map(e=>e.id)).size,20);assert.equal(new Set(EXOTICS.map(e=>e.perk)).size,20);
 for(const e of EXOTICS)assert.ok(existsSync(new URL(`../assets/renders/gear-${e.id}.png`,import.meta.url)));
 const all=relics(EXOTICS.map(e=>e.id)),clean=migrate(all);assert.equal(clean.equippedExotics.length,20);
 const totals=exoticBonuses(clean),base=stats(fresh()),full=stats(clean);for(const key of Object.keys(totals))assert.equal(full[key],base[key]+totals[key]);
});
test('one hourly offer persists across reloads and uses randomized eligible pools',()=>{
 const now=Date.UTC(2026,9,12,13,30),s=fresh(now),initial=shopStock(s).map(e=>e.id);assert.equal(initial.length,1);assert.deepEqual(shopStock(migrate(s,now+1000)).map(e=>e.id),initial);assert.equal(shopStock(s)[0].tier,1);
 const discovered=new Set();for(let seed=1;seed<=40;seed++)for(const e of exoticOffers({...s,exoticShop:{seed}},now))discovered.add(e.id);assert.ok(discovered.size>=6);
});
test('purchase stores exactly one exotic, does not equip it, and leaves the claimed offer until the next hour',()=>{
 const now=Date.UTC(2026,9,12,13,30);let s={...fresh(now),coins:10000};const e=shopStock(s)[0],coins=s.coins;
 s=reduce(s,{type:'BUY_EXOTIC',id:e.id},now);assert.equal(s.coins,coins-e.cost);assert.ok(s.ownedExotics.includes(e.id));assert.deepEqual(s.equippedExotics,[]);assert.equal(shopStock(s)[0].id,e.id);
 const paid=s.coins;s=reduce(s,{type:'BUY_EXOTIC',id:e.id},now);assert.equal(s.coins,paid);
 const hidden=EXOTICS.find(x=>x.id!==e.id);s=reduce(s,{type:'BUY_EXOTIC',id:hidden.id},now);assert.equal(s.coins,paid);
 s=reduce(s,{type:'TOGGLE_EXOTIC',id:e.id},now);assert.deepEqual(s.equippedExotics,[e.id]);
 const broke={...fresh(now),coins:0};assert.equal(reduce(broke,{type:'BUY_EXOTIC',id:shopStock(broke)[0].id},now).ownedExotics.length,0);
});
test('manual rerolls are removed and cannot alter stock or spend coins',()=>{
 const s={...fresh(),coins:100};const next=reduce(s,{type:'REROLL_EXOTICS'});assert.equal(next.coins,100);assert.deepEqual(next.exoticShop,s.exoticShop);
});
test('equip toggles pause perks, reject unowned IDs, freeze in combat, and cannot generate health or focus',()=>{
 let s=relics(['miser','typewriter'],{hp:40,focus:8});s=reduce(s,{type:'TOGGLE_EXOTIC',id:'miser'});assert.equal(s.hp,30);s=reduce(s,{type:'TOGGLE_EXOTIC',id:'miser'});assert.equal(s.hp,40);
 s=reduce(s,{type:'TOGGLE_EXOTIC',id:'typewriter'});assert.equal(s.focus,3);s=reduce(s,{type:'TOGGLE_EXOTIC',id:'typewriter'});assert.equal(s.focus,8);
 s=reduce(s,{type:'TOGGLE_EXOTIC',id:'bell'});assert.equal(s.equippedExotics.includes('bell'),false);s=fight(s);assert.deepEqual(reduce(s,{type:'TOGGLE_EXOTIC',id:'miser'}).equippedExotics,s.equippedExotics);
});
test('cathedral sword bites every third Strike, applies bleed, and shows its perk',()=>{
 let s=fight(relics(['mouth']));s=turn(s);s=turn(s);assert.equal(procs(s).includes('mouth'),false);s=turn(s);assert.ok(procs(s).includes('mouth'));assert.equal(s.battle.effects.bleed.damage,6);assert.equal(s.battle.effects.bleed.turns,3);
});
test('probate and unpaid invoice stack victory bonuses without changing hourly stock',()=>{
 let s=fight(relics(['probate','tax']));s.battle.hp=1;s.battle.effects.bleed={damage:1,turns:1};s.battle.effects.burn={damage:1,turns:1};s.battle.effects.curse={power:1,amp:.1,turns:1};const coins=s.coins,loot=s.battle.coins,stock=structuredClone(s.exoticShop);
 s=turn(s);assert.equal(s.coins,coins+loot+Math.floor(loot*.35)+18);assert.deepEqual(s.exoticShop,stock);assert.equal(s.kills,1);assert.equal(s.combatFx.coins,loot+Math.floor(loot*.35)+18);const saved=s.coins;s=turn(s);assert.equal(s.coins,saved);
});
test('yesterday sword echoes only previous primary damage and never echoes a previous echo',()=>{
 let s=fight(relics(['echoBlade']));s=turn(s);const primary=s.battle.exotic.previousDamage;s=turn(s,'guard');assert.ok(s.combatFx.events.some(e=>e.label==='You Already Bled'&&e.amount===Math.round(primary*.3)));s=turn(s,'guard');assert.equal(procs(s).includes('echoBlade'),false);
});
test('tea brews on Guard, buffs exactly the next damaging action, and heals',()=>{
 let s=fight(relics(['tea']));s.hp=50;s=turn(s,'guard');assert.equal(s.battle.exotic.tea,true);const brewed=turn(s),plain=turn({...s,equippedExotics:[]});assert.ok(brewed.combatFx.events.find(e=>e.type==='damage').amount>plain.combatFx.events.find(e=>e.type==='damage').amount);assert.equal(brewed.battle.exotic.tea,false);assert.ok(procs(brewed).includes('tea'));
});
test('meteor counts damaging actions only and applies a burn on the third',()=>{
 let s=fight(relics(['meteor']));s=turn(s);s=turn(s,'guard');s=turn(s);assert.equal(procs(s).includes('meteor'),false);s=turn(s);assert.ok(procs(s).includes('meteor'));assert.equal(s.battle.effects.burn.damage,7);
});
test('actual healing stores stitches up to 60, next Strike consumes them once',()=>{
 let s=fight(relics(['sutures'],{skills:{leech:3}}));s.hp=25;s=turn(s,'guard');assert.equal(s.battle.exotic.stitches,2);s=turn(s);assert.ok(procs(s).includes('sutures'));assert.equal(s.battle.exotic.stitches,3); // Current Strike's leech creates new stitches, after consuming the old ones.
 s.battle.exotic.stitches=60;s=turn(s,'guard');assert.ok(s.battle.exotic.stitches<=60);
});
test('moths kindle spells and restore health at low focus; stronger burns are preserved',()=>{
 let s=fight(relics(['moth']));s.focus=10;s.hp=35;s=turn(s,'spell');assert.ok(procs(s).includes('moth'));assert.equal(s.battle.effects.burn.damage,4);assert.ok(s.combatFx.events.some(e=>e.label==='Mothlight'));
 const b={effects:{burn:{damage:12,turns:5}}};mergeEffect(b,'burn',{damage:4,turns:2});assert.equal(b.effects.burn.damage,12);assert.equal(b.effects.burn.turns,5);
});
test('winter halo suppresses heavy strikes without downgrading stronger curses',()=>{
 let s=fight(relics(['halo']));s.battle.turn=3;s.battle.effects.curse={power:8,amp:.35,turns:4};s=turn(s,'guard');assert.equal(s.battle.effects.curse.power,8);assert.equal(s.battle.effects.curse.amp,.35);assert.equal(s.battle.effects.curse.silence,true);assert.ok(procs(s).includes('halo'));
});
test('rat parliament grows on Guard, caps at twelve, and attacks on accepted actions only',()=>{
 let s=fight(relics(['rats']));assert.equal(s.battle.exotic.rats,3);s=turn(s,'guard');assert.equal(s.battle.exotic.rats,4);assert.ok(s.combatFx.events.some(e=>e.label==='Parliament of Rats'&&e.amount===4));
 for(let i=0;i<15;i++)s=turn(s,'guard');assert.equal(s.battle.exotic.rats,12);const before=s.battle.hp;s=reduce(s,{type:'BROWSE',kind:'click'});assert.equal(s.battle.hp,before);
});
test('the ninth toll deals maximum-health-based doom exactly every ninth accepted action',()=>{
 let s=fight(relics(['bell']));for(let i=0;i<8;i++)s=turn(s,'guard');assert.equal(procs(s).includes('bell'),false);s=turn(s,'guard');assert.ok(s.combatFx.events.some(e=>e.label==='The Ninth Toll'&&e.amount===3000));
});
test('hourglass resets the first active skill cooldown and Guard gives an additional reduction',()=>{
 let s=fight(relics(['hourglass'],{skills:{edge:1,rend:1},loadout:['rend']}));s=turn(s,'rend');assert.equal(s.battle.cooldowns.rend,0);s=turn(s,'rend');assert.equal(s.battle.cooldowns.rend,2);s=turn(s,'guard');assert.equal(s.battle.cooldowns.rend,0);
});
test('impossible boots completely dodge the fourth enemy strike, leaving barriers intact',()=>{
 let s=fight(relics(['boots']));for(let i=0;i<3;i++)s=turn(s,'guard');s.battle.barrier=20;const hp=s.hp;s=turn(s);assert.equal(s.hp,hp);assert.equal(s.battle.barrier,20);assert.ok(s.combatFx.events.some(e=>e.type==='dodge'));
});
test('pallbearer begins with a barrier and retaliates exactly when incoming damage breaks it',()=>{
 let s=fight(relics(['pallbearer']));assert.equal(s.battle.barrier,15);s.battle.barrier=1;s=turn(s);assert.ok(procs(s).includes('pallbearer'));assert.equal(s.battle.barrier,0);
});
test('sun crown modifies cursed damaging spells and heals from damage actually dealt',()=>{
 let s=fight(relics(['sun']));s.hp=20;s.battle.effects.curse={power:1,amp:.2,turns:3};const buffed=turn(s,'spell'),plain=turn({...s,equippedExotics:[]},'spell');assert.ok(buffed.battle.hp<plain.battle.hp);assert.ok(buffed.hp>plain.hp);assert.ok(procs(buffed).includes('sun'));
});
test('cash ring rescues once after Last Rites, requires sufficient coins, and cannot run twice',()=>{
 let s=fight(relics(['miser'],{coins:100,skills:{revenant:1}}));s.hp=1;s=turn(s);assert.equal(s.hp,15);assert.equal(s.coins,100);s.hp=1;s=turn(s);assert.equal(s.hp,25);assert.equal(s.coins,80);assert.equal(s.battle.exotic.bribed,true);s.hp=1;s=turn(s);assert.equal(s.battle,null);
 let poor=fight(relics(['miser'],{coins:19}));poor.hp=1;poor=turn(poor);assert.equal(poor.battle,null);
});
test('teeth choir triggers on the third damaging spell, not Guard or non-damaging curses',()=>{
 let s=fight(relics(['choir'],{focus:100}));s=turn(s,'spell');s=turn(s,'guard');s.focus=100;s=turn(s,'spell');assert.equal(procs(s).includes('choir'),false);s.focus=100;s=turn(s,'spell');assert.ok(s.combatFx.events.some(e=>e.label==='A Cappella Calamity'&&e.amount===19));
});
test('the understudy replays spells every third Guard without focus cost or damage-trigger recursion',()=>{
 let s=fight(relics(['understudy','meteor']));s=turn(s,'spell');const damage=s.battle.exotic.lastSpell;s=turn(s,'guard');s=turn(s,'guard');const damaging=s.battle.exotic.damaging;s=turn(s,'guard');assert.ok(s.combatFx.events.some(e=>e.label==='One More Performance'&&e.amount===Math.round(damage*.5)));assert.equal(s.battle.exotic.damaging,damaging);assert.equal(procs(s).includes('meteor'),false);
});
test('typewriter stores typing ink with a five-charge cap and consumes one per damaging spell',()=>{
 let s=relics(['typewriter']);for(let i=0;i<140;i++)s=reduce(s,{type:'BROWSE',kind:'type'},10000+i*100);assert.equal(s.exoticResources.ink,5);s=fight(s);s=turn(s,'spell');assert.equal(s.exoticResources.ink,4);assert.ok(procs(s).includes('typewriter'));assert.equal(s.battle.effects.burn.damage,3);
 s=reduce(s,{type:'FLEE'});s=reduce(s,{type:'TOGGLE_EXOTIC',id:'typewriter'});const ink=s.exoticResources.ink;for(let i=0;i<20;i++)s=reduce(s,{type:'BROWSE',kind:'type'},50000+i*100);assert.equal(s.exoticResources.ink,ink);
});
test('receipt gloves grant exactly twelve bonus coins per twenty-five equipped clicks',()=>{
 let s=relics(['receipts']);const initial=s.coins;for(let i=0;i<25;i++)s=reduce(s,{type:'BROWSE',kind:'click'});assert.equal(s.coins,initial+25+12);assert.equal(s.exoticResources.receipts,0);
 s=reduce(s,{type:'TOGGLE_EXOTIC',id:'receipts'});for(let i=0;i<20;i++)s=reduce(s,{type:'BROWSE',kind:'click'});assert.equal(s.exoticResources.receipts,0);
});
test('all twenty exotics coexist with talents and runes; proc chains terminate and resources remain bounded',()=>{
 let s=fight(relics(EXOTICS.map(e=>e.id),{coins:1000,skills:{ward:3,spark:3,kindle:3,leech:3,thorns:3,fortress:2,echo:3,rend:3,bastion:3,hex:3},runes:{rend:'deep',bastion:'aegis',hex:'frailty'},loadout:['rend','bastion','hex'],focus:60}));s.exoticResources.ink=5;
 for(let i=0;i<40&&s.battle;i++){const planned=['hex','rend','bastion','spell','guard','attack'][i%6];s=turn(s,moveReady(s,planned)?'guard':planned);assert.ok(s.hp>0&&s.hp<=stats(s).hp);assert.ok(s.focus>=0&&s.focus<=stats(s).focus);assert.ok(s.combatFx.events.length<70);}
 assert.equal(s.battle,null);assert.equal(s.kills,1);assert.equal(s.equippedExotics.length,20);
});
test('old saves acquire stable shop metadata and no surprise purchases during migration',()=>{
 const old={...fresh(),version:2,coins:93,stage:9};delete old.ownedExotics;delete old.equippedExotics;delete old.exoticResources;delete old.exoticShop;
 const s=migrate(old);assert.equal(s.version,VERSION);assert.equal(s.coins,93);assert.equal(s.stage,9);assert.deepEqual(s.equippedExotics,[]);assert.deepEqual(shopStock(migrate(s)).map(e=>e.id),shopStock(s).map(e=>e.id));
});

test('the real hourly purchase path can stockpile and equip all twenty without replacing old possessions',()=>{
 let now=Date.UTC(2026,9,12,13,30),s={...fresh(now),stage:7,coins:100000};
 for(let i=0;i<20;i++){
  now+=HOUR_MS;s=migrate(s,now);const e=shopStock(s)[0];assert.ok(e);s=reduce(s,{type:'BUY_EXOTIC',id:e.id},now);s=reduce(s,{type:'TOGGLE_EXOTIC',id:e.id},now);
 }
 assert.equal(s.ownedExotics.length,20);assert.equal(s.equippedExotics.length,20);
});
test('rotation happens at xx:00 exactly, catches up missed hours, and leaves combat untouched',()=>{
 const before=Date.UTC(2026,9,12,13,59,59,999),s=fresh(before),old=shopStock(s)[0].id;
 assert.equal(nextShopRotation(before),Date.UTC(2026,9,12,14));assert.equal(hourSlot(before+1),hourSlot(before)+1);
 assert.equal(shopStock(migrate(s,before))[0].id,old);const rotated=migrate(s,before+1);assert.notEqual(shopStock(rotated)[0].id,old);
 const fighting={...s,battle:{...fight(s).battle}};const caught=migrate(fighting,before+HOUR_MS*5);assert.equal(caught.exoticShop.hour,hourSlot(before+HOUR_MS*5));assert.deepEqual(caught.battle,fighting.battle);assert.equal(caught.coins,s.coins);
});
test('mid-hour ownership, browsing, and forge-tier changes cannot replace the current offer',()=>{
 const now=Date.UTC(2026,9,12,13,5);let s=fresh(now);const id=shopStock(s)[0].id;s.stage=10;s.ownedExotics=[id];s=reduce(s,{type:'BROWSE',kind:'click'},now+5000);assert.equal(shopStock(s)[0].id,id);
});
