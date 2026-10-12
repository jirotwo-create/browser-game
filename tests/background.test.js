import test from 'node:test';
import assert from 'node:assert/strict';

test('background serializes multi-tab rewards, persists progress, and rejects page combat commands',async()=>{
 let listener,store={},behavior;
 globalThis.chrome={
  sidePanel:{setPanelBehavior:async x=>{behavior=x;}},
  runtime:{onMessage:{addListener:fn=>{listener=fn;}}},
  storage:{local:{get:async()=>{await new Promise(r=>setTimeout(r,1));return structuredClone(store);},set:async data=>{store=structuredClone(data);}}}
 };
 await import('../background.js?initial');
 const send=(message,sender={})=>new Promise(resolve=>{const keep=listener(message,sender,resolve);if(!keep)resolve(undefined);});
 const first=await send({type:'GET'});assert.equal(first.state.coins,12);assert.deepEqual(behavior,{openPanelOnActionClick:true});
 await Promise.all(Array.from({length:50},(_,i)=>send({type:'BROWSE',kind:'click'},{tab:{id:i%3}})));
 assert.equal(store.dreadwake.coins,62);assert.equal(store.dreadwake.clicks,50);
 assert.equal(await send({type:'BUY',id:'fang'},{tab:{id:1}}),undefined);assert.equal(store.dreadwake.weapon,'rust');
 await send({type:'BUY',id:'fang'});assert.equal(store.dreadwake.weapon,'fang');assert.equal(store.dreadwake.coins,27);
 await import('../background.js?restart');
 assert.equal((await send({type:'GET'})).state.weapon,'fang');
 assert.equal(await send({type:'BROWSE',kind:'click'}),undefined);
 delete globalThis.chrome;
});
