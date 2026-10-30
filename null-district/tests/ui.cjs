const{deploy}=require('./start-game.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/workspace/dreadwake-tools/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.NULL_DISTRICT_URL||'http://127.0.0.1:4180');await p.waitForFunction(()=>window.nullDistrict);
 for(const [width,height]of [[1440,900],[960,640],[800,600],[390,844]]){
  await p.setViewportSize({width,height});
  for(const selector of ['#start','#chapter-select button:first-child','#chapter-select button:last-child','#settings']){
   const box=await p.locator(selector).boundingBox();assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=width&&box.y+box.height<=height,`${selector} must stay on screen at ${width}x${height}`);
  }
  const overlaps=await p.evaluate(()=>{const a=document.querySelector('#start').getBoundingClientRect(),b=document.querySelector('.menu-bottom').getBoundingClientRect();return a.bottom>b.top});assert.equal(overlaps,false,'Start action must not collide with footer');
 }
 await p.setViewportSize({width:1440,height:900});
 for(let i=0;i<5;i++){await p.click(`[data-level="${i}"]`);assert.equal(await p.locator('#chapter-select .selected').getAttribute('data-level'),String(i));assert.ok((await p.locator('#menu-chapter').textContent()).startsWith(`0${i+1}`));}
 await p.click('[data-level="0"]');await deploy(p);await p.keyboard.press('Digit4');assert.equal(await p.evaluate(()=>nullDistrict.state.weapon),'pistol');assert.equal(await p.locator('#hud').isVisible(),true);
 const hud=await p.evaluate(()=>{const a=document.querySelector('.mission').getBoundingClientRect(),b=document.querySelector('.coordinates').getBoundingClientRect(),c=document.querySelector('.vital').getBoundingClientRect(),d=document.querySelector('.weapon-info').getBoundingClientRect();return a.right<b.left&&c.right<d.left&&a.bottom<innerHeight/2&&c.top>innerHeight/2});assert.ok(hud,'HUD panels must leave center view clear');
 await p.keyboard.press('Escape');assert.ok(await p.locator('#pause').isVisible());await p.click('#to-menu');assert.ok(await p.locator('#menu').isVisible());assert.deepEqual(errors,[]);console.log('PASS: title controls fit four viewport sizes, five chapter choices work, HUD center stays clear, pistol selection and pause/menu navigation work without errors.');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
