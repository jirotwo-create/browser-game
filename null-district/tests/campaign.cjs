const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'/workspace/dreadwake-tools/node_modules/playwright');const assert=require('node:assert/strict');
const BASE=process.env.NULL_DISTRICT_URL||'http://127.0.0.1:4180';
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await browser.newPage({viewport:{width:1440,height:900}});p.setDefaultTimeout(10000);const errors=[];p.on('pageerror',e=>{if(errors.length<5)console.error('Game error:',e.message);errors.push(e.message)});let watchdog=setTimeout(()=>{console.error('Campaign watchdog');browser.close().finally(()=>process.exit(1))},300000);
try{
 await p.bringToFront();await p.goto(BASE);await p.waitForFunction(()=>window.nullDistrict);await p.evaluate(()=>document.getElementById('game').requestPointerLock=()=>Promise.resolve());await p.click('#start');
 const state=()=>p.evaluate(()=>nullDistrict.state);
 async function look(yaw,pitch=0){const s=await state();let d=yaw-s.yaw;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;const dx=-d/.0024,dy=-(pitch-s.pitch)/.0024,n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/350));for(let i=0;i<n;i++){await p.mouse.move(720,450);await p.mouse.down({button:'right'});await p.mouse.move(720+dx/n,450+dy/n);await p.mouse.up({button:'right'})}}
 async function target(){return p.evaluate(async()=>{const T=await import('/vendor/three.module.js');const s=nullDistrict.state,origin=new T.Vector3(s.position.x,s.position.y,s.position.z),groups=[],walls=[];nullDistrict.scene.traverse(o=>{if(o.isMesh&&o.userData.enemy?.hp>0)groups.push(o);if(o.userData.collider)walls.push(o)});for(const t of [...s.targets].sort((a,b)=>Math.hypot(a.x-s.position.x,a.z-s.position.z)-Math.hypot(b.x-s.position.x,b.z-s.position.z))){const d=Math.hypot(t.x-s.position.x,t.z-s.position.z);if(d>18)continue;for(const height of t.type==='hound'?[.8,.6,1]:t.type==='gargoyle'?[1.7,1.4,2]:[1.23,1.65,.85]){const aim=new T.Vector3(t.x,height,t.z),ray=new T.Raycaster(origin,aim.clone().sub(origin).normalize()),hit=ray.intersectObjects([...groups,...walls],false)[0];if(hit?.object.userData.enemy?.id===t.id)return {...t,height}}}return null})}
 async function fight(){
  const t=await target();if(!t)return false;let s=await state();assert.equal(s.mode,'playing',JSON.stringify(s));
  if(s.ammo===0){await p.keyboard.down('KeyR');await p.waitForTimeout(80);await p.keyboard.up('KeyR');await p.waitForFunction(()=>nullDistrict.state.ammo===24).catch(async e=>{throw Error('Reload failed '+await p.locator('#weapon-status').textContent()+' '+JSON.stringify(await state()))});s=await state()}
  if(process.env.DEBUG_CAMPAIGN)console.log('Shot',t.id,t.type,'hp',t.hp,'player',s.health,'ammo',s.ammo);const dx=t.x-s.position.x,dz=t.z-s.position.z;await look(Math.atan2(-dx,-dz),Math.atan2(t.height-s.position.y,Math.hypot(dx,dz))-.0198);
  await p.mouse.down();await p.waitForTimeout(160);await p.mouse.up();return true;
 }
 async function route(x,z){
  for(let i=0;i<250;i++){
   let s=await state();assert.equal(s.mode,'playing',JSON.stringify(s));if(Math.hypot(x-s.position.x,z-s.position.z)<.48)return;
   if(await fight())continue;
   const path=await p.evaluate(({x,z})=>{
    const s=nullDistrict.state,n=nullDistrict.navigation(),step=.5,key=(x,z)=>x+','+z,valid=(x,z)=>Math.abs(x)<=n.bounds.x-.05&&z>=n.bounds.minZ+.05&&z<=n.bounds.maxZ-.05&&!n.solids.some(b=>Math.abs(x-b.x)<b.w/2+.37&&Math.abs(z-b.z)<b.d/2+.37);
    const start=[Math.round(s.position.x/step),Math.round(s.position.z/step)],goal=[Math.round(x/step),Math.round(z/step)],open=[start],from=new Map(),cost=new Map([[key(...start),0]]),visited=new Set();let end;
    for(let guard=0;open.length&&guard<15000;guard++){
     open.sort((a,b)=>(cost.get(key(...a))+Math.hypot(a[0]-goal[0],a[1]-goal[1]))-(cost.get(key(...b))+Math.hypot(b[0]-goal[0],b[1]-goal[1])));
     const u=open.shift(),k=key(...u);if(visited.has(k))continue;visited.add(k);
     if(Math.hypot(u[0]-goal[0],u[1]-goal[1])<1){end=u;break}
     for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const v=[u[0]+dx,u[1]+dz],vk=key(...v),g=cost.get(k)+Math.hypot(dx,dz);
      if(!valid(v[0]*step,v[1]*step)||!valid((u[0]+dx)*step,u[1]*step)||!valid(u[0]*step,(u[1]+dz)*step)||g>=(cost.get(vk)??Infinity))continue;
      cost.set(vk,g);from.set(vk,u);open.push(v);
     }
    }
    if(!end)return null;const path=[];while(key(...end)!==key(...start)){path.unshift({x:end[0]*step,z:end[1]*step});end=from.get(key(...end));}return path;
   },{x,z});
   assert.ok(path,'No traversable route '+x+','+z);const waypoint=path[Math.min(2,path.length-1)]||{x,z};s=await state();const distance=Math.hypot(waypoint.x-s.position.x,waypoint.z-s.position.z);await look(Math.atan2(-(waypoint.x-s.position.x),-(waypoint.z-s.position.z)));await p.keyboard.down('KeyW');await p.waitForTimeout(Math.min(180,Math.max(45,distance/4.5*850)));await p.keyboard.up('KeyW');
  }
  throw Error('Route timeout '+x+','+z+' '+JSON.stringify(await state()));
 }
 async function chapter(){
  const initial=await state();console.log('Chapter '+initial.level+' / '+initial.levelName);
  // Real combat and navigation; no enemy deletion, teleporting, health grants or forced objectives.
  for(const node of initial.nodes){
   const approach={x:node.x+(node.x<0?1.6:node.x>0?-1.6:1.6),z:node.z};
   await route(approach.x,approach.z);for(let i=0;i<100&&await fight();i++){}
   await p.keyboard.down('KeyE');await p.waitForTimeout(1500);await p.keyboard.up('KeyE');
   assert.equal((await state()).nodes.find(r=>r.x===node.x&&r.z===node.z).done,true,'Objective must complete through held E');console.log('Node',node.x,node.z,'HP',(await state()).health);
  }
  assert.equal((await state()).relays,3);await route(initial.exit.x,initial.exit.z);await p.keyboard.down('KeyE');await p.waitForFunction(()=>['intermission','won'].includes(nullDistrict.state.mode));await p.keyboard.up('KeyE');
 }
 await chapter();assert.equal((await state()).mode,'intermission');const kills=(await state()).kills;await p.click('#next-level');assert.equal((await state()).level,2);assert.equal((await state()).kills,kills);assert.deepEqual((await state()).inventory,['carbine','sword']);assert.equal((await state()).relays,0);
 await chapter();assert.equal((await state()).mode,'won');await p.screenshot({path:'/tmp/null14-campaign-victory.png'});assert.deepEqual(errors,[]);console.log('PASS: real-input combat, navigation, all 6 nodes, Chapter 01 -> 02 transition, carried inventory/kills and final cathedral victory.');
 // Restart and chapter select must dispose the old chapter and reset the current one.
 await p.click('#restart');let s=await state();assert.equal(s.level,2);assert.equal(s.relays,0);assert.equal(s.enemies,12);assert.equal(s.health,100);assert.equal(s.ammo,24);
 await p.keyboard.press('Escape');await p.click('#to-menu');await p.click('[data-level="0"]');await p.click('#start');s=await state();assert.equal(s.level,1);assert.equal(s.enemies,9);assert.equal(s.kills,0);assert.equal(s.projectiles.length,0);console.log('PASS: chapter restart and menu selection reset enemies, objectives, projectiles and campaign counters.');
}finally{clearTimeout(watchdog);await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
