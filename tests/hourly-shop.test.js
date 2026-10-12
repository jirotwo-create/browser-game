import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,reduce,migrate} from '../engine.js';
import {HOUR_MS,nextShopRotation,shopStock,hourSlot} from '../exotics.js';

test('legacy four-item shop migrates to exactly one hourly offer without altering possessions',()=>{
 const now=Date.UTC(2026,9,12,10,44);const old={...fresh(now),version:3,owned:['rust','rags','fang','iron'],weapon:'fang',armor:'iron',ownedExotics:['tea','rats'],equippedExotics:['tea'],exoticShop:{seed:4321,rotation:100,stock:['mouth','probate','sutures','receipts']}};
 const s=migrate(old,now);assert.equal(s.exoticShop.stock.length,1);assert.equal(s.exoticShop.hour,hourSlot(now));assert.equal(s.exoticShop.rotation,undefined);assert.ok(old.owned.every(id=>s.owned.includes(id)));assert.deepEqual(s.ownedExotics,old.ownedExotics);assert.deepEqual(s.equippedExotics,['tea']);assert.equal(s.weapon,'fang');assert.equal(s.chest,'iron');
});
test('a stale purchase is rejected at the hour boundary and the new offer is authoritative',()=>{
 const now=Date.UTC(2026,9,12,10,59,59,999);let s={...fresh(now),coins:9999};const stale=shopStock(s)[0].id;s=reduce(s,{type:'BUY_EXOTIC',id:stale},now+1);assert.equal(s.coins,9999);assert.equal(s.ownedExotics.length,0);assert.notEqual(shopStock(s)[0].id,stale);
});
test('inventory retains previously purchased weapons and armor through repeated swaps and cannot equip unowned gear',()=>{
 let s={...fresh(),coins:500};for(const id of ['fang','iron'])s=reduce(s,{type:'BUY',id});assert.equal(s.weapon,'rust');assert.equal(s.chest,'rags');assert.ok(s.owned.includes('fang')&&s.owned.includes('iron'));
 s=reduce(s,{type:'EQUIP',id:'fang'});s=reduce(s,{type:'EQUIP',id:'iron'});s=reduce(s,{type:'EQUIP',id:'rust'});assert.ok(['rust','rags','fang','iron'].every(id=>s.owned.includes(id)));assert.equal(s.owned.length,9);assert.equal(s.weapon,'rust');assert.equal(s.chest,'iron');s=reduce(s,{type:'EQUIP',id:'god'});assert.equal(s.weapon,'rust');
});
test('hour-aligned alarm and GET catch-up both persist stock, preserve saves, and serialize browsing updates',async t=>{
 let now=Date.UTC(2026,9,12,10,59,55),message,alarm,startup;const scheduled=[];let store={dreadwake:{...fresh(now),coins:100,owned:['rust','rags','fang'],weapon:'fang'}};
 t.mock.method(Date,'now',()=>now);
 globalThis.chrome={
  sidePanel:{setPanelBehavior:async()=>{}},
  runtime:{onMessage:{addListener:f=>message=f},onStartup:{addListener:f=>startup=f},onInstalled:{addListener:()=>{}}},
  alarms:{create:async(name,options)=>scheduled.push({name,...options}),onAlarm:{addListener:f=>alarm=f}},
  storage:{local:{get:async()=>structuredClone(store),set:async x=>{store=structuredClone(x);}}}
 };
 t.after(()=>{delete globalThis.chrome;});await import('../background.js?hourly-test');await Promise.resolve();assert.equal(scheduled[0].when,nextShopRotation(now));assert.equal(scheduled[0].periodInMinutes,60);
 const send=(msg,sender={})=>new Promise(resolve=>{const keep=message(msg,sender,resolve);if(!keep)resolve(undefined);});
 const initial=store.dreadwake.exoticShop.stock[0];now=nextShopRotation(now);
 await Promise.all([alarm({name:'dreadwake-hourly-shop'}),...Array.from({length:20},()=>send({type:'BROWSE',kind:'click'},{tab:{id:1}}))]);
 assert.equal(store.dreadwake.coins,120);assert.equal(store.dreadwake.exoticShop.hour,hourSlot(now));assert.notEqual(store.dreadwake.exoticShop.stock[0],initial);assert.equal(store.dreadwake.weapon,'fang');
 now+=HOUR_MS*4;await send({type:'GET'});assert.equal(store.dreadwake.exoticShop.hour,hourSlot(now));
 now+=HOUR_MS;await startup();assert.equal(store.dreadwake.exoticShop.hour,hourSlot(now));assert.equal(scheduled.at(-1).when,nextShopRotation(now));
 assert.equal(await send({type:'REROLL_EXOTICS'}),undefined);
});
