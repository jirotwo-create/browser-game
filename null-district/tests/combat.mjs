import assert from 'node:assert/strict';
import {stepEnemy,segmentHitsPlayer,playerHitDistance} from '../systems/combat.js';
function fixture(role='melee'){
 const calls={hurt:[],shot:[],projectile:[],tell:0};
 const p={x:0,z:0,set(x,y,z){this.x=x;this.z=z}};
 const enemy={g:{position:p,rotation:{y:0}},type:'test',info:{role,range:2,windup:.6,cooldown:2,speed:2,damage:10},shot:0,attack:null,alert:false,phase:0};
 const ctx={player:{x:0,y:1.65,z:1.5},time:0,canSee:()=>true,move:(p,x,z)=>{p.x+=x;p.z+=z},hurt:d=>calls.hurt.push(d),shot:(...a)=>calls.shot.push(a),projectile:(...a)=>calls.projectile.push(a),tell:()=>calls.tell++};
 return {e:enemy,c:ctx,calls};
}
{
 const{e,c,calls}=fixture();stepEnemy(e,.01,c);assert.equal(calls.tell,1);assert.equal(calls.hurt.length,0);stepEnemy(e,.3,c);assert.equal(calls.hurt.length,0,'Wind-up cannot deal early damage');stepEnemy(e,.31,c);assert.deepEqual(calls.hurt,[10]);stepEnemy(e,.1,c);assert.equal(calls.tell,1,'Cooldown prevents repeated attacks');
}
for(const dodge of ['range','behind','cover']){
 const{e,c,calls}=fixture();stepEnemy(e,.01,c);if(dodge==='range')c.player.z=5;if(dodge==='behind')c.player.z=-1.5;if(dodge==='cover')c.canSee=()=>false;stepEnemy(e,.61,c);assert.deepEqual(calls.hurt,[],dodge+' must evade melee');
}
{
 const{e,c,calls}=fixture('rifle');stepEnemy(e,.01,c);c.player.x=2;stepEnemy(e,.61,c);assert.equal(calls.shot[0][2],false,'Strafing evades a locked rifle shot');
}
{
 const{e,c,calls}=fixture('burst');stepEnemy(e,.01,c);stepEnemy(e,.61,c);assert.equal(calls.shot[0][2],true,'Holding position inside the firing cone is dangerous');
}
for(const role of ['bolt','orb']){
 const{e,c,calls}=fixture(role);stepEnemy(e,.01,c);c.player.x=1;stepEnemy(e,.61,c);assert.equal(calls.projectile.length,1);assert.equal(calls.projectile[0][1].x,0,'Spell/bolt aim locks during wind-up');assert.deepEqual(calls.hurt,[],'Projectiles deal damage on collision, not at launch');
}
{
 const{e,c,calls}=fixture('orb');c.canSee=()=>false;stepEnemy(e,1,c);assert.equal(e.attack,null);assert.equal(calls.projectile.length,0,'Cover blocks acquisition');
}
assert.ok(segmentHitsPlayer({x:0,y:1.3,z:-8},{x:0,y:1.3,z:8},{x:0,y:1.65,z:0}),'Fast swept projectile hits');
assert.ok(!segmentHitsPlayer({x:1,y:1.3,z:-8},{x:1,y:1.3,z:8},{x:0,y:1.65,z:0}),'Strafed projectile misses');
assert.ok(!segmentHitsPlayer({x:0,y:4,z:-8},{x:0,y:4,z:8},{x:0,y:1.65,z:0}),'Vertical miss');
assert.equal(playerHitDistance({x:0,y:1.3,z:-2},{x:0,y:1.3,z:2},{x:0,y:1.65,z:0},.5),1.5);
console.log('PASS: attack wind-up/cooldown, melee range/facing/cover, locked firearm aim, dodgeable spells/bolts, LOS acquisition and swept projectile collision.');
