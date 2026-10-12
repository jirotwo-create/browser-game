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
  const grips=[];
  for(const kind of ['knight','keeper','wing','king']){
   const e=rigMonster(monster(kind));world.add(e);animation.start({move:'attack',tree:'blood',enemyKind:kind,enemyAttack:'heavy',events:[{type:'damage',amount:1}]},0);
   let maxGap=0;const points=[];
   for(const ms of [0,150,300,430,600,1000,1150,1300,1450]){
    animation.update(ms,h,e);world.updateMatrixWorld(true);
    for(const arm of [h.userData.swordArm,...e.userData.arms]){
     const hand=arm.userData.hand,item=hand?.userData.weapon;if(!item)continue;
     const handle=['thorn','god'].includes(item.userData.asset)?-.73:item.userData.asset==='reaper'?-.35:0;
     maxGap=Math.max(maxGap,item.localToWorld(new T.Vector3(0,handle,0)).distanceTo(hand.getWorldPosition(new T.Vector3())));
    }
    points.push(h.userData.blade.localToWorld(new T.Vector3(0,1.25,0)).toArray());
   }
   const idle=new T.Vector3(...points[0]),motion=Math.max(...points.map(p=>idle.distanceTo(new T.Vector3(...p))));
   animation.start({move:'attack',tree:'blood',enemyKind:kind,events:[],victory:true},0);animation.update(1100,h,e);
   const noRetaliation=e.userData.arms.every(a=>a.rotation.x===0&&a.userData.elbow.rotation.x===-.3);
   const toward=ENEMY_POS.clone().sub(HERO_POS).normalize(),forward=new T.Vector3(0,0,1).applyQuaternion(h.quaternion);grips.push({kind,maxGap,motion,noRetaliation,facing:forward.dot(toward)});world.remove(e);
  }
  return {results,grips};
 });
 assert.equal(checks.results.length,70);for(const c of checks.results)for(const key of ['playerMoves','visible','enemyMoves','still','cleared','unchanged'])assert.ok(c[key],`${c.kind}/${c.move}: ${key}`);
 for(const c of checks.grips){assert.ok(c.maxGap<1e-6,`${c.kind}: grip slips from hand`);assert.ok(c.motion>1,`${c.kind}: blade does not sweep`);assert.ok(c.noRetaliation,`${c.kind}: defeated enemy attacks`);assert.ok(c.facing>.999,`${c.kind}: hero faces away from target`);}
 await page.getByRole('button',{name:'Begin the hunt'}).click();await page.locator('[data-move="attack"]').click();await page.waitForTimeout(330);assert.equal(await page.locator('.combat-visual.has-3d').count(),1);assert.equal(await page.locator('.ability-symbol').isVisible(),false);await page.locator('.scene').screenshot({path:'/tmp/dreadwake-hero-combat.png'});
 await page.waitForTimeout(2300);assert.equal(await page.locator('.combat-visual').count(),0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-move="guard"]').click();await page.waitForTimeout(2200);assert.equal(await page.locator('canvas.real-3d').count(),1);
 assert.deepEqual(errors,[]);await browser.close();console.log('3D combat: all 14 moves against 5 monster rigs, player poses, enemy retaliation, visible effects, immutable events, reduced motion, cleanup, mobile layout, and actual panel turns passed.');
})().catch(e=>{console.error(e);process.exit(1)});
