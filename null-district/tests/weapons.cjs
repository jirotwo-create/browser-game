const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'/workspace/dreadwake-tools/node_modules/playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(process.env.NULL_DISTRICT_URL||'http://127.0.0.1:4180');await p.waitForFunction(()=>window.nullDistrict);
  await p.evaluate(()=>document.getElementById('game').requestPointerLock=()=>Promise.resolve());await p.click('#start');
  const state=()=>p.evaluate(()=>nullDistrict.state);
  assert.deepEqual((await state()).inventory,['carbine','sword']);assert.ok((await state()).targets.every(t=>t.species==='human'));
  await p.keyboard.press('Digit2');assert.equal((await state()).weapon,'sword');
  await p.mouse.click(720,450);await p.waitForFunction(()=>nullDistrict.state.meleeStrikes===1);await p.waitForFunction(()=>nullDistrict.state.meleeCooldown===0);
  assert.equal((await state()).meleeHits,0,'Distant enemies must not take melee damage');assert.equal((await state()).ammo,24);
  await p.keyboard.press('KeyQ');assert.equal((await state()).weapon,'carbine');
  await p.mouse.click(720,450);await p.waitForFunction(()=>nullDistrict.state.ammo===23);await p.keyboard.press('KeyR');await p.keyboard.press('Digit2');
  await p.waitForTimeout(1600);assert.equal((await state()).ammo,23,'Switching cancels reload without creating ammo');await p.keyboard.press('KeyR');await p.waitForTimeout(100);assert.equal((await state()).ammo,23,'Sword cannot reload');
  await p.keyboard.press('Digit1');await p.keyboard.press('KeyR');await p.waitForFunction(()=>nullDistrict.state.ammo===24);await p.keyboard.press('Digit2');
  async function look(yaw,pitch){const s=await state();let d=yaw-s.yaw;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;const dx=-d/.0024,dy=-(pitch-s.pitch)/.0024,n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/250));for(let i=0;i<n;i++){await p.mouse.move(720,450);await p.mouse.down({button:'right'});await p.mouse.move(720+dx/n,450+dy/n);await p.mouse.up({button:'right'})}}
  for(let step=0;step<100;step++){
   const s=await state();assert.equal(s.mode,'playing');const target=s.targets.sort((a,b)=>Math.hypot(a.x-s.position.x,a.z-s.position.z)-Math.hypot(b.x-s.position.x,b.z-s.position.z))[0];
   const dx=target.x-s.position.x,dz=target.z-s.position.z,d=Math.hypot(dx,dz);await look(Math.atan2(-dx,-dz),Math.atan2(1.18-s.position.y,d));
   if(d<2.45)break;
   await p.keyboard.down('KeyW');await p.keyboard.down('ShiftLeft');await p.waitForTimeout(100);await p.keyboard.up('KeyW');await p.keyboard.up('ShiftLeft');
   if(step===99)throw Error('Unable to approach melee target');
  }
  const before=await state();await p.mouse.click(720,450);await p.mouse.click(720,450);await p.mouse.click(720,450);
  await p.waitForFunction(n=>nullDistrict.state.kills>n,before.kills);const after=await state();
  assert.equal(after.meleeStrikes,before.meleeStrikes+1,'Cooldown must reject repeated clicks');assert.equal(after.meleeHits,before.meleeHits+1,'Swing must resolve once');assert.equal(after.ammo,before.ammo,'Melee must preserve bullets');
  await p.waitForFunction(()=>nullDistrict.state.meleeCooldown===0);assert.match(await p.locator('#weapon-status').textContent(),/CURSED EDGE/);
  await p.keyboard.press('Escape');await p.click('#restart');const restarted=await state();assert.equal(restarted.weapon,'carbine');assert.equal(restarted.meleeStrikes,0);assert.equal(restarted.meleeHits,0);assert.deepEqual(restarted.inventory,['carbine','sword']);
  assert.deepEqual(errors,[]);console.log('PASS: both starting weapons, human enemies, key/Q switching, out-of-range miss, delayed melee kill, one hit per swing, cooldown, ammo conservation, reload cancellation and clean restart.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
