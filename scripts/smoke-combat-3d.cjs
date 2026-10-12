const assert=require('node:assert/strict');
const {chromium}=require(process.env.DREADWAKE_PLAYWRIGHT||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.DREADWAKE_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173');await page.waitForSelector('canvas.real-3d');
 const checks=await page.evaluate(async()=>{
  const T=await import('/assets/vendor/three.module.js'),{hero}=await import('/assets/hero.js'),{monster}=await import('/assets/models.js'),{BattleAnimation,rigMonster,HERO_POS,ENEMY_POS}=await import('/assets/battle-animation.js');
  const world=new T.Scene(),h=hero(),animation=new BattleAnimation(world);world.add(h);const results=[];
  const moves=['attack','guard','spell','rend','feast','riposte','rage','bastion','mend','reprisal','hex','drain','nova','eclipse'];
  for(const kind of ['knight','wretch','keeper','wing','king']){
   const e=rigMonster(monster(kind));world.add(e);
   for(const move of moves){const fx={id:1,move,tree:['guard','bastion','mend','reprisal'].includes(move)?'bone':['spell','hex','drain','nova','eclipse'].includes(move)?'void':'blood',enemyKind:kind,enemyAttack:'heavy',events:[{type:'damage',amount:12},{type:'hurt',amount:5},{type:'absorb',amount:2}]};
    const before=JSON.stringify(fx);animation.start(fx,0);animation.update(350,h,e);const playerMoves=Math.abs(h.userData.swordArm.rotation.x)+Math.abs(h.userData.castArm.rotation.x)>0;
    const visible=animation.nodes.some(m=>m.visible);animation.update(1150,h,e);const enemyMoves=e.userData.arms.some(a=>Math.abs(a.rotation.x)>.1);
    animation.update(1200,h,e,true);const still=h.position.equals(HERO_POS)&&e.position.equals(ENEMY_POS)&&h.userData.castArm.rotation.x===0&&e.userData.arms.every(a=>a.rotation.x===0);
    animation.update(2100,h,e);results.push({kind,move,playerMoves,visible,enemyMoves,still,cleared:animation.nodes.length===0,unchanged:before===JSON.stringify(fx)});
   }
   world.remove(e);
  }
  return results;
 });
 assert.equal(checks.length,70);for(const c of checks)for(const key of ['playerMoves','visible','enemyMoves','still','cleared','unchanged'])assert.ok(c[key],`${c.kind}/${c.move}: ${key}`);
 await page.getByRole('button',{name:'Begin the hunt'}).click();await page.locator('[data-move="attack"]').click();await page.waitForTimeout(330);assert.equal(await page.locator('.combat-visual.has-3d').count(),1);assert.equal(await page.locator('.ability-symbol').isVisible(),false);await page.locator('.scene').screenshot({path:'/tmp/dreadwake-hero-combat.png'});
 await page.waitForTimeout(2300);assert.equal(await page.locator('.combat-visual').count(),0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-move="guard"]').click();await page.waitForTimeout(2200);assert.equal(await page.locator('canvas.real-3d').count(),1);
 assert.deepEqual(errors,[]);await browser.close();console.log('3D combat: all 14 moves against 5 monster rigs, player poses, enemy retaliation, visible effects, immutable events, reduced motion, cleanup, mobile layout, and actual panel turns passed.');
})().catch(e=>{console.error(e);process.exit(1)});
