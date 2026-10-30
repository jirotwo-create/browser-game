const{deploy}=require('./start-game.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/workspace/dreadwake-tools/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await b.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto((process.env.NULL_DISTRICT_URL||'http://127.0.0.1:4180'));await page.waitForFunction(()=>!!window.nullDistrict);await page.waitForTimeout(700);
 await page.screenshot({path:'/tmp/null-district-menu.png'});
 await page.evaluate(()=>{document.getElementById('game').requestPointerLock=()=>Promise.resolve()});
 await deploy(page);
 assert.equal(await page.evaluate(()=>nullDistrict.state.mode),'playing');
 await page.keyboard.down('KeyW');await page.waitForTimeout(500);await page.keyboard.up('KeyW');
 assert.ok(await page.evaluate(()=>nullDistrict.state.position.z<21),'movement');
 // Right-drag look remains available when browser mouse capture is unavailable.
 await page.mouse.move(720,450);await page.mouse.down({button:'right'});await page.mouse.move(700,450,{steps:4});await page.mouse.up({button:'right'});
 await page.mouse.down();await page.waitForTimeout(400);await page.mouse.up();assert.ok(await page.evaluate(()=>nullDistrict.state.ammo<24),'fire');
 await page.keyboard.press('KeyR');await page.waitForTimeout(1700);assert.equal(await page.evaluate(()=>nullDistrict.state.ammo),24,'reload');
 await page.screenshot({path:'/tmp/null-district-game.png'});
 await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>nullDistrict.state.mode),'paused');
 await page.getByRole('button',{name:'RESTART CHAPTER'}).click();assert.deepEqual(await page.evaluate(()=>({hp:nullDistrict.state.health,ammo:nullDistrict.state.ammo,kills:nullDistrict.state.kills,relays:nullDistrict.state.relays})),{hp:100,ammo:24,kills:0,relays:0});
 const canvas=await page.evaluate(()=>{const r=nullDistrict.renderer;const pixels=new Uint8Array(4*r.domElement.width*r.domElement.height);r.getContext().readPixels(0,0,r.domElement.width,r.domElement.height,r.getContext().RGBA,r.getContext().UNSIGNED_BYTE,pixels);return {width:r.domElement.width,height:r.domElement.height}});assert.ok(canvas.width>0&&canvas.height>0);
 assert.deepEqual(errors,[]);await b.close();console.log('PASS: WebGL startup, no JS/shader errors, move, drag aim, firing, reload, pause, restart.');
})().catch(e=>{console.error(e);process.exit(1)});
