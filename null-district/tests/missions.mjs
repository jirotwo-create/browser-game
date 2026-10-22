import assert from 'node:assert/strict';
import {createMission,LENGTH_SCALE} from '../systems/missions.js';
let completed=0,spawned=0;
for(let index=0;index<5;index++){
 const hostiles=[],mission=createMission(index,{spawnWave:(n,types)=>types.map(type=>{spawned++;const e={hp:3,type,g:{position:{x:n.x+8,z:n.z}}};hostiles.push(e);return e;}),onComplete:()=>completed++});
 const player={x:0,z:0};const step=(dt=1,use=false)=>mission.tick(dt,player,use,hostiles);
 assert.equal(mission.hit(mission.nodes[1],99,'sword'),false,'Dependencies prevent skipping ahead');
 let guard=0;
 while(!mission.complete){
  assert.ok(guard++<600,'Mission must remain completable');
  const n=mission.nodes.find(mission.active);assert.ok(n,'No dependency dead end');
  Object.assign(player,{x:n.x,z:n.z});
  if(n.kind==='slash'){
   const hp=n.hp;assert.equal(mission.hit(n,5,'carbine'),false);assert.equal(n.hp,hp,'Bullets cannot cut a blood seal');
   mission.hit(n,3,'sword');assert.equal(n.done,false);mission.hit(n,3,'sword');
  }else if(n.kind==='destroy'){
   mission.hit(n,1,'carbine');assert.equal(n.done,false);mission.hit(n,4,'carbine');
  }else if(n.kind==='hold'){
   step(.2);const progress=n.progress;player.x+=10;step(2);assert.equal(n.progress,progress,'Leaving the zone pauses the timer');player.x=n.x;
   step(n.duration);assert.equal(n.done,false,'A timer cannot bypass living reinforcements');
   hostiles.forEach(e=>e.hp=0);step(.1);
  }else if(n.kind==='escort'){
   const start=n.z;step(1,false);assert.equal(n.z,start,'Courier requires ignition');step(.1,true);const paused=n.z;
   // Nearby hostiles and a distant player both pause movement.
   hostiles.forEach(e=>e.hp=0);const blocker={hp:1,g:{position:{x:n.x+1,z:n.z}}};hostiles.push(blocker);step(1);assert.equal(n.z,paused);blocker.hp=0;
   player.x+=10;step(1);assert.equal(n.z,paused);player.x=n.x;
   while(!n.done){player.z=n.z;hostiles.forEach(e=>e.hp=0);step(1);}
   assert.equal(n.z,n.endZ);assert.equal(n.wave,3);
  }else if(n.kind==='purge'){
   step(.1);assert.equal(n.done,false);hostiles.forEach(e=>e.hp=0);step(.1);
  }else{
   const blocker={hp:1,g:{position:{x:n.x+1,z:n.z}}};hostiles.push(blocker);step(2,true);assert.equal(n.done,false,'Guarded pickups/consoles must require combat');blocker.hp=0;step(2,true);
  }
 }
 assert.equal(mission.nodes.every(n=>n.done),true);
 const replay=createMission(index,{spawnWave:()=>[]});assert.ok(replay.nodes.every(n=>!n.done&&!n.started&&!n.progress),'Restart resets all mission state');
 console.log('PASS mission '+(index+1)+': '+mission.nodes.map(n=>n.kind).join(' → '));
}
assert.equal(completed,38);assert.ok(spawned>=30);assert.equal(LENGTH_SCALE,1.65);
console.log(`PASS: ${completed} tasks, ${spawned} reinforcements, dependencies, weapon checks, zone/escort pauses, final-wave clearance and fresh restarts.`);
