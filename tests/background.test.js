import test from 'node:test';
import assert from 'node:assert/strict';

test('background serializes multi-tab rewards, persists progress, and rejects page combat commands',async()=>{
 let listener,store={},behavior;
 globalThis.chrome={
  alarms:{create:async()=>{},onAlarm:{addListener:()=>{}}},
  sidePanel:{setPanelBehavior:async x=>{behavior=x;}},
  runtime:{onMessage:{addListener:fn=>{listener=fn;}},onStartup:{addListener:()=>{}},onInstalled:{addListener:()=>{}}},
  storage:{local:{get:async()=>{await new Promise(r=>setTimeout(r,1));return structuredClone(store);},set:async data=>{store=structuredClone(data);}}}
 };
 await import('../background.js?initial');
 const send=(message,sender={})=>new Promise(resolve=>{const keep=listener(message,sender,resolve);if(!keep)resolve(undefined);});
 const first=await send({type:'GET'});assert.equal(first.state.coins,12);assert.deepEqual(behavior,{openPanelOnActionClick:true});
 const rewards=await Promise.all(Array.from({length:50},(_,i)=>send({type:'BROWSE',kind:'click'},{tab:{id:i%3}})));
 assert.equal(rewards[0].state,undefined);assert.deepEqual(rewards[0].feedback,{kind:'click',combo:0,burst:false,coinsEarned:1,focusEarned:0,fx:'full'});
 assert.equal(store.dreadwake.coins,62);assert.equal(store.dreadwake.clicks,50);
 assert.equal(await send({type:'BUY',id:'fang'},{tab:{id:1}}),undefined);assert.equal(store.dreadwake.weapon,'rust');
 await send({type:'BUY',id:'fang'});assert.ok(store.dreadwake.owned.includes('fang'));assert.equal(store.dreadwake.weapon,'rust');await send({type:'EQUIP',id:'fang'});assert.equal(store.dreadwake.weapon,'fang');assert.equal(store.dreadwake.coins,27);
 await import('../background.js?restart');
 assert.equal((await send({type:'GET'})).state.weapon,'fang');
 assert.equal(await send({type:'BROWSE',kind:'click'}),undefined);
 await send({type:'SET_FX',mode:'off'});
 const muted=await send({type:'BROWSE',kind:'click'},{tab:{id:1}});assert.equal(muted.feedback.fx,'off');
 store.dreadwake.focus=0;
 let burst;for(let i=0;i<20;i++)burst=await send({type:'BROWSE',kind:'type'},{tab:{id:2}});
 assert.equal(burst.feedback.burst,true);assert.equal(burst.feedback.combo,0);assert.equal(burst.feedback.coinsEarned,5);assert.equal(burst.feedback.focusEarned,8);
 assert.equal(burst.state,undefined);
 delete globalThis.chrome;
});
