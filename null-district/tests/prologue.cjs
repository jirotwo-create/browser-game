const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/workspace/dreadwake-tools/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const {OPENING_TIMELINE:shots,OPENING_DURATION:duration,openingFrame}=await import('../systems/prologue-timeline.js');
 assert.equal(shots.length,10);assert.ok(duration>85&&duration<120);assert.equal(new Set(shots.flatMap(s=>s.lines.map(l=>l.speaker))).size,4);
 for(const s of shots){assert.equal(openingFrame(s.start+.8).shot.id,s.id);for(const l of s.lines){assert.ok(l.at+l.length<s.duration);assert.equal(openingFrame(s.start+l.at+.1).line.id,l.id);}}
 assert.equal(openingFrame(duration).finished,true);
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
  const p=await b.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.NULL_DISTRICT_URL||'http://127.0.0.1:4180');await p.waitForFunction(()=>window.nullDistrict);
  const baseline=await p.evaluate(()=>({materials:nullDistrict.pipeline.materials.size,targets:JSON.stringify(nullDistrict.state.targets),position:nullDistrict.state.position}));
  await p.click('#start');await p.waitForFunction(()=>nullDistrict.cinematic().status==='playing',null,{timeout:30000});
  assert.equal(await p.evaluate(()=>nullDistrict.state.mode),'intro');const d=await p.evaluate(()=>nullDistrict.cinematic());assert.equal(d.voicesDecoded,19);assert.equal(d.voiceFailures,0);assert.equal(d.sets,7);assert.ok(d.actors>=10);assert.ok(await p.locator('#opening-skip').isVisible());
  await p.keyboard.press('Digit4');await p.keyboard.press('KeyW');await p.mouse.click(700,400);assert.equal(await p.evaluate(()=>nullDistrict.state.weapon),'carbine');assert.equal(await p.evaluate(()=>nullDistrict.state.ammo),24);
  await p.keyboard.press('Space');await p.waitForFunction(()=>nullDistrict.cinematic().status==='paused');const paused=await p.evaluate(()=>nullDistrict.cinematic().time);await p.waitForTimeout(500);assert.equal(await p.evaluate(()=>nullDistrict.cinematic().time),paused);
  await p.keyboard.press('KeyM');assert.equal(await p.evaluate(()=>nullDistrict.cinematic().muted),true);await p.keyboard.press('KeyM');await p.click('#opening-play');await p.waitForFunction(()=>nullDistrict.cinematic().status==='playing');
  assert.equal(await p.evaluate(()=>JSON.stringify(nullDistrict.state.targets)),baseline.targets);assert.equal(await p.evaluate(()=>nullDistrict.state.health),100);
  await p.click('#opening-skip');await p.waitForFunction(()=>nullDistrict.state.mode==='playing');assert.equal(await p.evaluate(()=>nullDistrict.pipeline.materials.size),baseline.materials);assert.equal(await p.evaluate(()=>nullDistrict.cinematic().status),'idle');assert.equal(await p.evaluate(()=>nullDistrict.state.health),100);assert.ok(await p.locator('#hud').isVisible());assert.ok(await p.evaluate(()=>!document.body.classList.contains('in-opening')));
  await p.keyboard.press('Escape');await p.click('#restart');assert.equal(await p.evaluate(()=>nullDistrict.state.mode),'playing');
  await p.keyboard.press('Escape');await p.click('#to-menu');await p.click('[data-level="3"]');await p.click('#watch-opening');await p.waitForFunction(()=>nullDistrict.cinematic().status==='playing');
  if(process.env.NULL_PROLOGUE_FULL==='1'){
   for(const s of shots){await p.waitForFunction(({id,start})=>{const d=nullDistrict.cinematic();return d.shot===id&&d.time>start+2.1;},{id:s.id,start:s.start},{timeout:20000});assert.equal(await p.evaluate(()=>nullDistrict.state.mode),'intro');await p.screenshot({path:'/tmp/null114-'+s.id+'.png'});console.log('REVIEW '+s.id+': '+await p.locator('#opening-dialogue').textContent());}
   await p.waitForFunction(()=>nullDistrict.cinematic().status==='ready',null,{timeout:20000});const end=await p.evaluate(()=>nullDistrict.cinematic());assert.equal(end.linesPlayed,19);assert.equal(end.voiceFailures,0);assert.ok(await p.locator('#opening-enter').isVisible());await p.screenshot({path:'/tmp/null114-ready.png'});await p.keyboard.press('Enter');
  }else await p.keyboard.press('Escape');
  assert.equal(await p.evaluate(()=>nullDistrict.state.mode),'menu');assert.equal(await p.evaluate(()=>nullDistrict.state.level),4);assert.equal(await p.locator('#chapter-select .selected').getAttribute('data-level'),'3');
  await p.click('#start');assert.equal(await p.evaluate(()=>nullDistrict.state.mode),'playing');assert.equal(await p.evaluate(()=>nullDistrict.state.level),4);assert.deepEqual(errors,[]);
  console.log('PASS: ten-shot screenplay, four characters, nineteen offline voice clips, input/AI freeze, pause/resume/mute, skip and gameplay handoff, resource cleanup, restart bypass and replay preserving chapter selection'+(process.env.NULL_PROLOGUE_FULL==='1'?', plus full natural playback to the final title.':'.'));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
