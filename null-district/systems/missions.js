// Coordinates use each chapter's original layout; the world builder lengthens Z.
const task=(id,label,kind,x,z,requires=[],extra={})=>({id,label,kind,x,z,requires,...extra});
export const MISSION_PLANS=[
 [task('tap','Tap the street surveillance','interact',-6,14),
  task('power-a','Shoot west grid transformer','destroy',-6,-6,['tap']),
  task('power-b','Shoot east grid transformer','destroy',6,-17,['tap']),
  task('key','Steal the rift key','pickup',-5,-27,['power-a','power-b']),
  task('ambush','Break the retrieval squad','purge',0,-23,['key'],{waves:[['riot','razor','sable']]}),
  task('deliver','Carry key to the gate socket','deliver',-5,22,['ambush']),
  task('charge','Defend the charging rift','hold',0,26,['deliver'],{duration:14,waves:[['hound','sable'],['netrunner','razor']]})],
 [task('relic','Recover the profane reliquary','pickup',8,14),
  task('seal-a','Cut the west blood seal with Mournfang','slash',-9,-6,['relic']),
  task('seal-b','Cut the east blood seal with Mournfang','slash',9,-18,['relic']),
  task('offering','Bring the relic to the nave altar','deliver',0,7,['seal-a','seal-b']),
  task('ritual','Stand in the ritual circle; repel the court','hold',0,-17,['offering'],{duration:16,waves:[['revenant','hound'],['warlock','knight']]}),
  task('heart','Shatter the exposed covenant heart','destroy',0,-31,['ritual']),
  task('warden','Slay the awakened apse warden','purge',0,-34,['heart'],{waves:[['gargoyle','arbalist']]})],
 [task('manifest','Lift the market shipment manifest','interact',-10,17),
  task('cache-a','Steal the west memory case','pickup',-10,4,['manifest']),
  task('cache-b','Steal the east memory case','pickup',10,-12,['manifest']),
  task('cache-c','Steal the shrine memory case','pickup',0,-26,['manifest']),
  task('delivery','Deliver all three cases to the fence','deliver',10,18,['cache-a','cache-b','cache-c']),
  task('auction','Protect the fence during decryption','hold',10,18,['delivery'],{duration:18,waves:[['razor','sable'],['riot','netrunner']]}),
  task('uplink','Destroy the cartel tracking uplink','destroy',-10,-24,['auction']),
  task('blacklist','Recover the decrypted blacklist','pickup',10,18,['uplink'])],
 [task('dispatch','Override the south dispatch booth','interact',-11,17),
  task('brake-a','Destroy the south train brake relay','destroy',-4,8,['dispatch']),
  task('brake-b','Destroy the north train brake relay','destroy',4,-14,['dispatch']),
  task('battery','Take the courier ignition cell','pickup',-9,-29,['brake-a','brake-b']),
  task('ignition','Install the cell in the courier','deliver',10,18,['battery']),
  task('courier','Escort the courier along the east platform','escort',10,18,['ignition'],{endZ:-30,duration:0,waves:[['razor','sable'],['riot','hound'],['netrunner','arbalist']]}),
  task('freight','Collect the courier freight core','pickup',10,-30,['courier']),
  task('depart','Authorize the north departure gate','deliver',-9,-29,['freight'])],
 [task('access','Steal the rooftop service access card','pickup',-12,17),
  task('jammer-a','Destroy the west signal jammer','destroy',-12,0,['access']),
  task('jammer-b','Destroy the east signal jammer','destroy',12,-15,['access']),
  task('routing','Route the stolen signal at the south console','interact',11,18,['jammer-a','jammer-b']),
  task('upload','Hold the broadcast zone through the upload','hold',0,-30,['routing'],{duration:24,waves:[['sable','netrunner'],['warlock','revenant']]}),
  task('regent','Defeat the broadcast regent and its guard','purge',0,-35,['upload'],{waves:[['gargoyle','knight','riot']]}),
  task('antenna','Cut the exposed demonic antenna with Mournfang','slash',0,-35,['regent']),
  task('shutdown','Send the final citywide shutdown','interact',12,-31,['antenna'])]
];
export const LENGTH_SCALE=1.65;
export function createMission(index,{spawnWave,onComplete=()=>{}}={}){
 const nodes=MISSION_PLANS[index].map(t=>({...t,z:t.z*LENGTH_SCALE,endZ:t.endZ===undefined?undefined:t.endZ*LENGTH_SCALE,done:false,progress:0,hp:t.kind==='slash'?6:5,started:false,wave:0,guards:[]}));
 const active=n=>!n.done&&n.requires.every(id=>nodes.find(t=>t.id===id).done);
 function wave(n){if(n.wave<(n.waves?.length||0)){n.guards.push(...spawnWave(n,n.waves[n.wave]));n.wave++;}}
 function complete(n){n.done=true;n.progress=1;onComplete(n);}
 function hit(n,damage,weapon){if(!active(n)||!['destroy','slash'].includes(n.kind))return false;if(n.kind==='slash'&&weapon!=='sword')return false;n.hp=Math.max(0,n.hp-damage);if(!n.hp)complete(n);return true;}
 function tick(dt,player,use,hostiles){
  let prompt='';
  for(const n of nodes.filter(active)){
   const distance=Math.hypot(player.x-n.x,player.z-n.z),close=distance<2.7;
   const danger=hostiles.some(e=>e.hp>0&&Math.hypot(e.g.position.x-n.x,e.g.position.z-n.z)<5);
   if(['destroy','slash'].includes(n.kind)){if(distance<8)prompt=n.kind==='slash'?'MOURNFANG ONLY / CUT THE BLOOD SEAL':'SHOOT OR SLASH THE POWER CORE';continue;}
   if(n.kind==='purge'){
    if(!n.started){n.started=true;wave(n);}if(n.guards.every(e=>e.hp<=0))complete(n);continue;
   }
   if(n.kind==='hold'){
    if(distance<4.5){if(!n.started){n.started=true;wave(n);}n.progress=Math.min(1,n.progress+dt/n.duration);prompt=`DEFEND THE MARKED ZONE / ${Math.floor(n.progress*100)}%`;}
    if(n.started&&n.progress>=.5&&n.wave===1)wave(n);
    if(n.progress>=1&&n.guards.every(e=>e.hp<=0))complete(n);
    else if(n.progress>=1&&distance<4.5)prompt='UPLOAD READY / DEFEAT REMAINING REINFORCEMENTS';
    continue;
   }
   if(n.kind==='escort'){
    if(!n.started&&close){prompt='[ E ] START COURIER / STAY WITHIN 5M';if(use){n.started=true;wave(n);}}
    if(n.started){
     if(distance<5&&!danger){n.z=Math.max(n.endZ,n.z-dt*2.6);n.progress=(18*LENGTH_SCALE-n.z)/(18*LENGTH_SCALE-n.endZ);}
     if(n.progress>.35&&n.wave===1)wave(n);if(n.progress>.7&&n.wave===2)wave(n);
     prompt=distance>=5?'COURIER PAUSED / RETURN TO ITS SIGNAL':danger?'COURIER BLOCKED / CLEAR THE PLATFORM':`ESCORT COURIER / ${Math.floor(n.progress*100)}%`;
     if(n.z===n.endZ&&n.guards.every(e=>e.hp<=0))complete(n);
    }continue;
   }
   if(close){
    prompt=danger?'OBJECTIVE GUARDED / CLEAR NEARBY HOSTILES':`HOLD [ E ] / ${n.label.toUpperCase()} / ${Math.floor(n.progress*100)}%`;
    if(use&&!danger){n.progress+=dt/(n.kind==='pickup'?.35:1.1);if(n.progress>=1)complete(n);}else n.progress=Math.max(0,n.progress-dt*.4);
   }else n.progress=0;
  }
  return prompt;
 }
 return {nodes,active,hit,tick,get complete(){return nodes.every(n=>n.done)}};
}
