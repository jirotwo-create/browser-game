import * as THREE from './vendor/three.module.js';
import { createSmoking } from './systems/smoking.js';
import { makeBlunt, createSmoke } from './graphics/blunt.js';
import { createBlood } from './graphics/blood.js';
import { poseSmoking } from './graphics/weapon-rig.js';
import { makeGearPalette } from './graphics/gear-materials.js';
import { PSXPipeline } from './graphics/psx-renderer.js';
import { makePalette } from './graphics/textures.js';
import { loft, mesh, plate, makeCarbine, makeSword } from './graphics/models.js';
import { createSignSystem, prepareSignFonts } from './graphics/signage.js';
import { LEVELS, buildLevel } from './graphics/levels.js';
import { ENEMY_TYPES, makeEnemy, animateEnemy } from './graphics/enemies.js';
import { sigil } from './graphics/neon.js';
import { createMission, LENGTH_SCALE } from './systems/missions.js';
import { stepEnemy, playerHitDistance } from './systems/combat.js';
import { poseCarbine, poseSword, gripDiagnostics } from './graphics/weapon-rig.js';
const $=id=>document.getElementById(id);
const pipeline=new PSXPipeline($('game'));
const renderer=pipeline.renderer;
const scene=new THREE.Scene();scene.background=pipeline.fogColor;
const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.08,95);
function resize(){camera.aspect=pipeline.resize(innerWidth,innerHeight);camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
let seed=923;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
const {materials,textures}=makePalette(pipeline);
materials.bloodPool=pipeline.material(0x66101c,undefined,1,.3);
let blood;
function mat(color=0xffffff,tex,repeat=1,glow=0){return pipeline.material(color,tex,repeat,glow)}
const world=new THREE.Group();scene.add(world);const solids=[];const geometry=new THREE.BoxGeometry(1,1,1);
function box(w,h,d,x,y,z,m,solid=false,parent=world){const b=new THREE.Mesh(geometry,m);b.scale.set(w,h,d);b.position.set(x,y,z);parent.add(b);if(solid)solids.push({x,z,w,d,mesh:b});return b}
await prepareSignFonts();
const signage=createSignSystem(pipeline,world);const sign=signage.sign;
let district={},levelIndex=0,selectedLevel=0,campaignKillsAtStart=0;
let mission;const relays=[],medkits=[],projectiles=[];let extraction,gate;
const level=()=>LEVELS[levelIndex];
function buildObjectives(){
 mission=createMission(levelIndex,{spawnWave:(n,types)=>{
  return types.map((type,i)=>{
   let point;
   // Search real collision space; reinforcements arrive outside the player's body.
   for(let radius=7;radius<=18&&!point;radius+=2)for(let j=0;j<24;j++){
    const angle=(j+i*7)*Math.PI/12,x=n.x+Math.sin(angle)*radius,z=n.z+Math.cos(angle)*radius;
    if(!blocked(x,z,.65)&&Math.hypot(x-player.x,z-player.z)>5&&!enemies.some(e=>e.hp>0&&Math.hypot(x-e.g.position.x,z-e.g.position.z)<1.5)){point={x,z};break;}
   }
   if(!point)throw Error('No safe reinforcement spawn for '+n.id);
   const e=spawn(type,point.x,point.z);e.alert=true;return e;
  });
 },onComplete:n=>{player.hp=Math.min(100,player.hp+12);notify(n.label.toUpperCase()+' / COMPLETE · VITALS +12');sound(880,.3,'triangle');updateHUD();}});
 for(const [i,n]of mission.nodes.entries()){
  const {x,z}=n,g=new THREE.Group();g.position.set(x,0,z);world.add(g);
  const combat=['destroy','slash'].includes(n.kind),pickup=n.kind==='pickup';
  if(n.kind==='slash'){
   mesh(g,new THREE.OctahedronGeometry(.5,0),materials.obsidian,0,1.4,0);
   for(const side of [-1,1]){const horn=mesh(g,new THREE.ConeGeometry(.2,1.4,5),materials.bone,side*.6,1.1,0);horn.rotation.z=side*-.4;}
  }else if(n.kind==='destroy'){
   mesh(g,loft([[0,1.1,.9],[.3,1.4,1.1],[1.5,.8,.8],[1.9,.5,.5]]),materials.rust);
   mesh(g,new THREE.OctahedronGeometry(.38,0),materials.neonAmber,0,1.5,.4);
  }else if(pickup){mesh(g,new THREE.OctahedronGeometry(.33,0),materials.neonGreen,0,1.1,0);plate(g,materials.metal,.7,.12,.5,0,.5,0);}
  else if(n.kind==='escort'){
   mesh(g,loft([[0,1.3,1.7],[.8,1.1,1.5]]),materials.metal);plate(g,materials.neonCyan,1,.12,1.6,0,.45,0);
   for(const dx of [-.6,.6])mesh(g,new THREE.OctahedronGeometry(.25,0),materials.neonPink,dx,.25,.5);
  }else if(['hold','purge'].includes(n.kind)){
   const ring=mesh(g,new THREE.RingGeometry(3.8,4,24),materials.arcane,0,.035,0);ring.rotation.x=-Math.PI/2;
  }else{
   mesh(g,loft([[0,1.1,.8],[1.5,1,.7],[1.8,.7,.5]]),materials.rust);plate(g,materials.circuit,.8,.6,.04,0,1.3,.4);
  }
  // Interactions do not obstruct routes. Damageable cores stop bullets, like cover.
  if(combat)g.traverse(o=>{if(o.isMesh)o.userData.missionNode=n;});
  const screen=sign(`${String(i+1).padStart(2,'0')} / ${n.kind.toUpperCase()}`,x,2.7,z,'#26efff',2.8,.5);
  const halo=sigil(world,n.kind==='slash'?materials.arcane:materials.neonCyan,x,2.1,z,.27);
  Object.assign(n,{g,screen,halo});relays.push(n);
 }
 $('mission-list').replaceChildren(...relays.map((n,i)=>{const el=document.createElement('span');el.id='relay'+i;el.textContent=String(i+1).padStart(2,'0')+' ';const b=document.createElement('b');b.textContent=n.label;el.append(b);return el;}));
 const {x,z}=level().exit;
 extraction=box(4,.025,4,x,.03,z,materials.dark);
 for(const dx of [-2,2])box(.1,.04,4,x+dx,.06,z,materials.neonCyan);
 for(const dz of [-2,2])box(4,.04,.1,x,.06,z+dz,materials.neonPink);
 gate=sigil(world,materials.arcane,x,2.5,z+.7,1.85);gate.visible=false;
 sign(level().exitPrompt,x,4.8,z+.8,'#ff4da6',5,.75,levelIndex===0?Math.PI:0);
 for(const [x,z]of level().medkits){const g=new THREE.Group();g.position.set(x,.45,z);world.add(g);mesh(g,loft([[-.25,.5,.5],[0,.65,.6],[.25,.5,.5]]),materials.coat);box(.36,.12,.02,0,0,.31,materials.neonGreen,false,g);box(.12,.35,.02,0,0,.32,materials.neonGreen,false,g);medkits.push({g,taken:false})}
}
// Rain rendered as low resolution streaks.
const rainPoints=[];for(let i=0;i<350;i++){const x=(rand()-.5)*50,y=rand()*19,z=(rand()-.5)*68;rainPoints.push(x,y,z,x-.05,y-.5,z)}
const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.Float32BufferAttribute(rainPoints,3));const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0x7d9aad,transparent:true,opacity:.22}));scene.add(rain);
// Player equipment uses the independent native-resolution foreground pass.
const gearMaterials=makeGearPalette();const gunScene=new THREE.Scene();const gun=makeCarbine(gearMaterials);gunScene.add(gun);
const sword=makeSword(gearMaterials);sword.visible=false;gunScene.add(sword);
const blunt=makeBlunt(gearMaterials);blunt.visible=false;gunScene.add(blunt);
const smoking=createSmoking(),smoke=createSmoke(gunScene);
const inventory=['carbine','sword','blunt'];
const cycleGear=(direction=1)=>chooseWeapon(inventory[(inventory.indexOf(selectedWeapon)+direction+inventory.length)%inventory.length]);
const flash=new THREE.Mesh(new THREE.ConeGeometry(.12,.3,5),gearMaterials.acid);flash.rotation.x=-Math.PI/2;flash.position.set(0,0,-.06);flash.visible=false;gun.userData.rig.muzzle.add(flash);
const gunCamera=new THREE.PerspectiveCamera(72,camera.aspect,.01,5);
const player={x:0,z:22,y:1.65,vy:0,yaw:0,pitch:0,hp:100,ammo:24,kills:0};
let mode='menu',firing=false,looking=false,reloadTime=0,shotTime=0,recoil=0,damageTimer=0,hitTimer=0,noticeTimer=0,elapsed=0,missionTime=0,step=0,audio;
let selectedWeapon='carbine',meleeCooldown=0,swordAttack=null,meleeStrikes=0,meleeHits=0,weaponTime=0;
const keys=new Set(),enemies=[],effects=[];let enemyId=0;
function sound(freq=.1,duration=.1,type='sawtooth',volume=.035){if(!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(20,freq*.24),audio.currentTime+duration);g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}
function notify(text){$('notice').textContent=text;noticeTimer=3}
function spawn(type,x,z){
 const rig=makeEnemy(materials,type,enemyId),info=ENEMY_TYPES[type];world.add(rig.g);rig.g.position.set(x,0,z);
 const enemy={...rig,id:++enemyId,type,info,hp:info.hp,shot:1+rand()*2,attack:null,alert:false,phase:rand()*10};
 rig.g.traverse(o=>{if(o.isMesh)o.userData.enemy=enemy});
 const tell=new THREE.Mesh(new THREE.RingGeometry(.47,.53,10),info.role==='melee'?materials.neonAmber:materials.neonPink);tell.rotation.x=-Math.PI/2;tell.visible=false;world.add(tell);enemy.tell=tell;
 enemies.push(enemy);return enemy;
}
function disposeLevel(){
 blood?.dispose();
 const geometries=new Set(),ownedMaterials=new Set(),baseMaterials=new Set(Object.values(materials)),baseTextures=new Set([...Object.values(textures),pipeline.white]);
 world.traverse(o=>{if(o.geometry&&o.geometry!==geometry)geometries.add(o.geometry);if(o.material&&!baseMaterials.has(o.material))ownedMaterials.add(o.material)});
 geometries.forEach(g=>g.dispose());
 const ownedTextures=new Set();ownedMaterials.forEach(m=>{if(m.uniforms?.tex?.value&&!baseTextures.has(m.uniforms.tex.value))ownedTextures.add(m.uniforms.tex.value);pipeline.materials.delete(m);m.dispose()});ownedTextures.forEach(t=>t.dispose());
 world.clear();signage.reset();solids.length=relays.length=medkits.length=enemies.length=effects.length=projectiles.length=0;
}
function loadLevel(index,{carry=false}={}){
 const kills=carry?player.kills:0,time=carry?missionTime:0,cooldown=carry?smoking.state.cooldown:0;disposeLevel();levelIndex=index;enemyId=0;seed=923+index*49;
 pipeline.fogColor.set(level().fog).convertLinearToSRGB();
 district=buildLevel(index,world,materials,solids,sign);
 // Lengthen the authored routes and sight lines without stretching characters or gear.
 const architecture=new THREE.Group();architecture.name='extended-chapter-architecture';architecture.add(...world.children.slice());architecture.scale.z=LENGTH_SCALE;world.add(architecture);
 for(const s of solids){s.z*=LENGTH_SCALE;s.d*=LENGTH_SCALE;}world.updateMatrixWorld(true);buildObjectives();
 for(const [type,x,z]of level().enemies)spawn(type,x,z);
 Object.assign(player,{...level().spawn,y:1.65,vy:0,yaw:0,pitch:0,hp:100,ammo:24,kills});campaignKillsAtStart=kills;
 selectedWeapon='carbine';gun.visible=true;sword.visible=blunt.visible=false;swordAttack=null;flash.visible=false;smoking.reset(cooldown);smoke.clear();
 blood=createBlood(world,solids,materials,rand);
 meleeCooldown=meleeStrikes=meleeHits=weaponTime=reloadTime=shotTime=damageTimer=hitTimer=recoil=step=0;missionTime=time;
 keys.clear();firing=false;looking=false;$('damage').style.opacity=0;$('killfeed').textContent='';$('prompt').style.display='none';$('enemy-focus').classList.add('hidden');
 camera.position.set(player.x,player.y,player.z);camera.rotation.set(0,0,0);camera.updateMatrixWorld();
 $('chapter-tag').textContent=`CHAPTER / 0${index+1} OF ${String(LEVELS.length).padStart(2,'0')}`;$('mission-title').textContent=level().title;$('sector-name').textContent=level().sector;
 $('restart').textContent='RESTART CHAPTER';$('next-level').classList.add('hidden');updateHUD();drawMap();
}
function blocked(x,z,r=.32){const b=level().bounds;return Math.abs(x)>b.x||z<b.minZ||z>b.maxZ||solids.some(b=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r)}
function move(entity,dx,dz,r=.32){if(!blocked(entity.x+dx,entity.z,r))entity.x+=dx;if(!blocked(entity.x,entity.z+dz,r))entity.z+=dz}
const ray=new THREE.Raycaster();const rayOrigin=new THREE.Vector3(),rayDirection=new THREE.Vector3();
function canSee(a,b){rayOrigin.set(a.x,1.25,a.z);rayDirection.set(b.x-a.x,.25,b.z-a.z);const dist=rayDirection.length();ray.set(rayOrigin,rayDirection.normalize());return !ray.intersectObjects(solids.map(s=>s.mesh),true).some(h=>h.distance<dist-.5)}
function tracer(from,to,color=0xe4ca81){const geo=new THREE.BufferGeometry().setFromPoints([from,to]);const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color}));world.add(line);effects.push({mesh:line,ttl:.07})}
function hurt(damage){
 if(mode!=='playing')return;player.hp=Math.max(0,player.hp-damage);damageTimer=.35;sound(65,.15,'sawtooth',.03);updateHUD();if(player.hp<=0)end(false);
}
function launchProjectile(e,target){
 const origin=new THREE.Vector3(e.g.position.x,e.type==='hound'?.8:1.35,e.g.position.z),direction=new THREE.Vector3(target.x,target.y,target.z).sub(origin).normalize();
 const orb=e.info.role==='orb';const material=new THREE.MeshBasicMaterial({color:e.info.color});
 const object=new THREE.Mesh(orb?new THREE.OctahedronGeometry(.16,0):new THREE.ConeGeometry(.05,.45,5),material);
 object.position.copy(origin);object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);world.add(object);
 projectiles.push({mesh:object,velocity:direction.multiplyScalar(e.info.projectileSpeed),damage:e.info.damage,ttl:6,type:e.type});sound(orb?160:340,.16,'triangle',.025);
}
function tickProjectiles(dt){
 for(let i=projectiles.length-1;i>=0;i--){
  const p=projectiles[i],a=p.mesh.position.clone(),b=a.clone().addScaledVector(p.velocity,dt),delta=b.clone().sub(a),distance=delta.length();
  ray.set(a,delta.normalize());const wall=ray.intersectObjects(solids.map(s=>s.mesh),true)[0];
  p.ttl-=dt;
  const hit=playerHitDistance(a,b,player);
  if(hit!==null&&(!wall||hit<wall.distance)){hurt(p.damage);p.ttl=0;}else if(wall&&wall.distance<=distance){p.ttl=0;}
  if(p.ttl<=0){world.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();projectiles.splice(i,1)}else{p.mesh.position.copy(b);p.mesh.rotation.z+=dt*3;}
 }
}
const combatContext={player,canSee,move,get time(){return elapsed},hurt,
 tell:e=>sound(e.info.role==='melee'?110:420,.13,'triangle',.014),
 shot:(e,target,hit)=>{const p=e.g.position;tracer(new THREE.Vector3(p.x,1.35,p.z),new THREE.Vector3(target.x,target.y,target.z),e.info.color);if(e.info.role==='burst')for(const side of [-1,1])tracer(new THREE.Vector3(p.x+side*.08,1.35,p.z),new THREE.Vector3(target.x+side*.18,target.y,target.z),e.info.color);if(hit)hurt(e.info.damage);},projectile:launchProjectile};
function updateFocus(){
 ray.setFromCamera(new THREE.Vector2(),camera);const hit=ray.intersectObjects([...enemies.filter(e=>e.hp>0).map(e=>e.g),...solids.map(s=>s.mesh)],true)[0];const enemy=hit?.object.userData.enemy;
 $('enemy-focus').classList.toggle('hidden',!enemy);
 if(enemy){$('enemy-name').textContent=enemy.info.name;$('enemy-faction').textContent=enemy.info.faction+(enemy.attack?' / ATTACK INCOMING':'');$('enemy-health').style.width=enemy.hp/enemy.info.hp*100+'%';}
}
function reload(){if(selectedWeapon!=='carbine'||reloadTime||player.ammo===24||mode!=='playing')return;reloadTime=1.5;sound(220,.18,'triangle');$('weapon-status').textContent='RELOADING…'}
function hitEnemy(e,damage,source,point){
 if(e.hp<=0)return;e.hp=Math.max(0,e.hp-damage);e.alert=true;hitTimer=.18;$('hitmarker').style.opacity=1;
 sound(source==='sword'?85:460,.08,source==='sword'?'sawtooth':'square',.025);
 const impact=point?.clone()||new THREE.Vector3(e.g.position.x,e.type==='hound'?.65:1.2,e.g.position.z);
 const direction=impact.clone().sub(new THREE.Vector3(player.x,player.y,player.z)).normalize();
 blood.spray(impact,direction,{sword:source==='sword',killed:e.hp<=0});
 if(e.hp<=0){e.attack=null;e.tell.visible=false;player.kills++;e.g.rotation.z=(e.id%2?1:-1)*Math.PI/2;e.g.position.y=.35;$('killfeed').textContent=`${e.g.userData.asset.name.split(' / ')[0].toUpperCase()} / DOWN · ${source==='sword'?'MOURNFANG':'K-09'}`;setTimeout(()=>{$('killfeed').textContent=''},2200)}
 updateHUD();
}
function chooseWeapon(weapon){
 if(mode!=='playing'||selectedWeapon===weapon)return;
 if(!inventory.includes(weapon))return;selectedWeapon=weapon;firing=false;reloadTime=0;swordAttack=null;flash.visible=false;smoking.cancel();
 gun.visible=weapon==='carbine';sword.visible=weapon==='sword';blunt.visible=weapon==='blunt';
 sound(weapon==='sword'?130:240,.12,'triangle',.025);updateHUD();
}
function swingSword(){
 if(mode!=='playing'||meleeCooldown>0)return;
 swordAttack={elapsed:0,hit:false,combo:meleeStrikes%2};meleeCooldown=.95;meleeStrikes++;
 sound(170,.22,'sawtooth',.035);updateHUD();
}
function resolveSwordHit(){
 camera.position.set(player.x,player.y,player.z);camera.rotation.set(player.pitch,player.yaw,0);camera.updateMatrixWorld();
 const forward=new THREE.Vector3();camera.getWorldDirection(forward);
 for(const enemy of enemies){
  if(enemy.hp<=0)continue;
  const to=new THREE.Vector3(enemy.g.position.x,1.18,enemy.g.position.z).sub(camera.position),distance=to.length();
  if(distance>2.8||to.clone().normalize().dot(forward)<.66)continue;
  ray.set(camera.position,to.clone().normalize());
  if(ray.intersectObjects(solids.map(s=>s.mesh),true).some(h=>h.distance<distance-.12))continue;
  meleeHits++;hitEnemy(enemy,3,'sword');
 }
 strikeObjectives();
}
function strikeObjectives(){
 const forward=new THREE.Vector3();camera.getWorldDirection(forward);
 for(const n of relays){if(!mission.active(n)||!['destroy','slash'].includes(n.kind))continue;
  const to=new THREE.Vector3(n.x,1.4,n.z).sub(camera.position),distance=to.length();
  if(distance>2.8||to.clone().normalize().dot(forward)<.66)continue;
  ray.set(camera.position,to.clone().normalize());if(ray.intersectObjects(solids.map(s=>s.mesh),true).some(h=>h.distance<distance-.2))continue;
  if(mission.hit(n,3,'sword')){hitTimer=.18;sound(90,.1,'sawtooth');updateHUD();}
 }
}
function fire(){
 if(mode!=='playing')return;
 if(selectedWeapon==='blunt'){
  firing=false;
  if(smoking.start()){sound(180,.45,'triangle',.008);notify('NIGHT LEAF / INHALE…');}
  else notify(`NIGHT LEAF / READY IN ${Math.ceil(smoking.state.cooldown)}S`);
  updateHUD();return;
 }
 if(selectedWeapon==='sword'){swingSword();return}
 if(mode!=='playing'||shotTime>0||reloadTime>0)return;
 if(player.ammo<=0){reload();return}
 player.ammo--;shotTime=.14;recoil=.09;flash.visible=true;sound(105,.13,'sawtooth',.055);
 camera.rotation.set(player.pitch+recoil*.22,player.yaw,0);camera.updateMatrixWorld();ray.setFromCamera(new THREE.Vector2(0,0),camera);
 const hits=ray.intersectObjects([...enemies.filter(e=>e.hp>0).map(e=>e.g),...solids.map(s=>s.mesh),...relays.filter(n=>mission.active(n)&&['destroy','slash'].includes(n.kind)).map(n=>n.g)],true);
 let end=camera.position.clone().add(ray.ray.direction.clone().multiplyScalar(55));
 if(hits.length){end=hits[0].point;const e=hits[0].object.userData.enemy;if(e)hitEnemy(e,1,'carbine',hits[0].point);const n=hits[0].object.userData.missionNode;if(n){if(mission.hit(n,1,'carbine')){hitTimer=.18;updateHUD()}else notify('BLOOD SEAL / USE MOURNFANG');}}
 poseCarbine(gun,{time:weaponTime,walk:step,recoil,reload:reloadTime});const from=gun.userData.rig.muzzle.getWorldPosition(new THREE.Vector3()).applyMatrix4(camera.matrixWorld);tracer(from,end);updateHUD();
}
function animateSword(dt){
 weaponTime+=dt;
 const previousCooldown=meleeCooldown;meleeCooldown=Math.max(0,meleeCooldown-dt);if(previousCooldown>0&&meleeCooldown===0)updateHUD();
 if(swordAttack){
  swordAttack.elapsed+=dt;
  if(swordAttack.elapsed>=.32&&!swordAttack.hit){swordAttack.hit=true;resolveSwordHit()}
  if(swordAttack.elapsed>=.90)swordAttack=null;
 }
 poseSword(sword,{time:weaponTime,attack:swordAttack?.elapsed||0,attacking:!!swordAttack,combo:swordAttack?.combo||0});
}
function updateHUD(){
 $('health').textContent=Math.max(0,Math.ceil(player.hp));$('healthbar').style.width=player.hp+'%';$('healthbar').style.background=player.hp<30?'#ff5a55':'#38e9ed';
 const puff=smoking.state;
 $('ammo').textContent=selectedWeapon==='blunt'?(puff.cooldown>0?String(Math.ceil(puff.cooldown)).padStart(2,'0'):'RDY'):selectedWeapon==='sword'?'∞':String(player.ammo).padStart(2,'0');
 $('weapon-name').textContent=selectedWeapon==='blunt'?'03 // NIGHT LEAF · MARIJUANA BLUNT':selectedWeapon==='sword'?'02 // MOURNFANG · THE OATH-EATER':'01 // K-09 PULSE CARBINE';
 $('ammo-reserve').textContent=selectedWeapon==='blunt'?(puff.cooldown>0?' SEC':' / PUFF'):selectedWeapon==='sword'?' / MELEE':' / ∞';
 $('weapon-status').textContent=selectedWeapon==='blunt'?(puff.phase!==null?(puff.phase<1.45?'INHALING…':'EXHALING…'):puff.cooldown>0?'COOLING DOWN · +25 HP WHEN READY':'CLICK TO SMOKE · +25 HP · 12S COOLDOWN'):selectedWeapon==='sword'?(meleeCooldown>0?'RECOVERING…':'CURSED EDGE · 2.8M REACH'):(reloadTime>0?'RELOADING…':'AUTO · 9MM ION');
 for(const item of inventory)$('slot-'+item).classList.toggle('active',selectedWeapon===item);
 $('blunt-cooldown').textContent=puff.cooldown>0?`NIGHT LEAF / ${Math.ceil(puff.cooldown)}S`:'[3] NIGHT LEAF / READY · +25 HP';
 for(const [i,r]of relays.entries()){const el=$('relay'+i);el.classList.toggle('done',r.done);el.classList.toggle('active',mission.active(r));el.querySelector('b').textContent=(r.done?'✓ ':mission.active(r)?'› ':'')+r.label;}
 const n=relays.filter(r=>r.done).length,active=relays.filter(r=>mission.active(r));
 $('objective').textContent=mission.complete?level().returnText:`${n}/${relays.length} · ${active.map(r=>r.label).join(' / ')}`;
 if(gate)gate.visible=mission.complete;
}
function end(win){
 smoking.cancel();smoke.clear();swordAttack=null;firing=false;keys.clear();document.exitPointerLock?.();
 const next=win&&levelIndex<LEVELS.length-1;mode=next?'intermission':win?'won':'dead';
 $('end-tag').textContent=next?`CHAPTER 0${levelIndex+1} / COMPLETE`:win?'NETWORK SILENCED':'NEURAL LINK TERMINATED';
 $('end-title').textContent=next?level().transitionTitle:win?'CHROME & ASH':'FLATLINED';
 $('end-copy').textContent=next?level().transition:win?`The broadcasts fall silent. All five chapters complete. ${player.kills} hostiles defeated. ${Math.floor(missionTime/60)}m ${Math.floor(missionTime%60)}s. The gate is sealed.`:'The city and the court keep their secrets. Restart this chapter and try another approach.';
 $('resume').classList.add('hidden');$('next-level').textContent=`ENTER CHAPTER 0${levelIndex+2} ↗`;$('next-level').classList.toggle('hidden',!next);$('pause').classList.remove('hidden');sound(win?660:90,.6,'triangle',.08);
}
function capture(){try{const p=$('game').requestPointerLock?.();p?.catch(()=>notify('MOUSE CAPTURE UNAVAILABLE · HOLD RIGHT MOUSE TO LOOK'))}catch{notify('HOLD RIGHT MOUSE TO LOOK')}}
function start(){
 if(!audio){try{audio=new (window.AudioContext||window.webkitAudioContext)()}catch{}}audio?.resume();mode='playing';$('menu').classList.add('hidden');$('pause').classList.add('hidden');$('hud').classList.remove('hidden');capture();notify(level().name+' / '+level().objective.toUpperCase());updateHUD();
}
function pause(){if(mode!=='playing')return;smoking.cancel();smoke.clear();swordAttack=null;mode='paused';keys.clear();firing=false;$('end-tag').textContent=`CHAPTER 0${levelIndex+1} / PAUSED`;$('end-title').textContent='SIGNAL PAUSED';$('end-copy').textContent=level().objective;$('resume').classList.remove('hidden');$('next-level').classList.add('hidden');$('pause').classList.remove('hidden');document.exitPointerLock?.()}
function restart(){const priorKills=campaignKillsAtStart;loadLevel(levelIndex);player.kills=priorKills;campaignKillsAtStart=priorKills;start()}
$('start').onclick=()=>{loadLevel(selectedLevel);start()};
$('resume').onclick=()=>{mode='playing';$('pause').classList.add('hidden');capture()};$('restart').onclick=restart;
$('next-level').onclick=()=>{if(mode!=='intermission')return;loadLevel(levelIndex+1,{carry:true});start()};
$('to-menu').onclick=()=>{mode='menu';firing=false;keys.clear();$('pause').classList.add('hidden');$('hud').classList.add('hidden');$('menu').classList.remove('hidden');document.exitPointerLock?.();};
for(const [index,entry]of LEVELS.entries()){
 const button=document.createElement('button');button.dataset.level=index;button.classList.toggle('selected',index===0);button.textContent=String(index+1).padStart(2,'0');const label=document.createElement('span');label.textContent=entry.name;button.append(label);$('chapter-select').append(button);
}
for(const button of document.querySelectorAll('[data-level]'))button.onclick=()=>{
 selectedLevel=Number(button.dataset.level);loadLevel(selectedLevel);for(const b of document.querySelectorAll('[data-level]'))b.classList.toggle('selected',b===button);
 $('menu-chapter').textContent=`0${selectedLevel+1} / ${level().name}`;$('menu-mission').textContent=level().objective;
};
$('settings').onclick=()=>{document.body.classList.toggle('no-crt');$('settings').textContent=document.body.classList.contains('no-crt')?'CRT: OFF':'CRT: ON'};
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='F6'||e.code==='F7'||e.code==='F8'){e.preventDefault();const option={F6:'affine',F7:'vertexSnap',F8:'dither'}[e.code];pipeline.configure({[option]:!pipeline.options[option]});updateGraphics();return}if(e.code==='Escape'){pause();return}if(mode!=='playing')return;keys.add(e.code);if(!e.repeat&&['Digit1','Numpad1','Digit2','Numpad2','Digit3','Numpad3','KeyQ'].includes(e.code)){if(e.code==='KeyQ')cycleGear();else chooseWeapon(inventory[Number(e.code.at(-1))-1]);return}if(e.code==='KeyR')reload();if(e.code==='Space'&&player.y<=1.651){player.vy=5;sound(140,.08,'triangle',.02)}});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{keys.clear();firing=false;pause()});
addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&mode==='playing')pause()});
$('game').addEventListener('mousedown',e=>{if(mode!=='playing')return;if(e.button===0){firing=true;fire()}if(e.button===2)looking=true});addEventListener('mouseup',()=>{firing=false;looking=false});addEventListener('contextmenu',e=>e.preventDefault());
$('game').addEventListener('wheel',e=>{if(mode==='playing'&&e.deltaY){e.preventDefault();cycleGear(e.deltaY>0?1:-1)}},{passive:false});
addEventListener('mousemove',e=>{if(mode==='playing'&&(document.pointerLockElement||looking)){player.yaw-=e.movementX*.0024;player.pitch=Math.max(-1.3,Math.min(1.3,player.pitch-e.movementY*.0024))}});
const map=$('map').getContext('2d');function drawMap(){
 map.clearRect(0,0,140,140);map.strokeStyle='#35444e';for(let i=0;i<140;i+=14){map.beginPath();map.moveTo(i,0);map.lineTo(i,140);map.moveTo(0,i);map.lineTo(140,i);map.stroke()}
 const bounds=level().bounds,sx=60/bounds.x,sz=126/(bounds.maxZ-bounds.minZ),mx=x=>70+x*sx,mz=z=>7+(z-bounds.minZ)*sz;
 map.fillStyle='#40525e';for(const b of solids)map.fillRect(mx(b.x-b.w/2),mz(b.z-b.d/2),b.w*sx,b.d*sz);
 for(const r of relays){map.fillStyle=r.done?'#d8f36a':mission.active(r)?'#26eeff':'#454b5f';map.fillRect(mx(r.x)-2,mz(r.z)-2,4,4)}
 map.strokeStyle=relays.every(r=>r.done)?'#f43cba':'#667787';map.strokeRect(mx(level().exit.x)-5,mz(level().exit.z)-4,10,8);
 for(const e of enemies){if(e.hp<=0)continue;map.fillStyle=e.info.species==='human'?'#ff625d':'#c64aff';map.fillRect(mx(e.g.position.x)-1.5,mz(e.g.position.z)-1.5,3,3)}
 map.save();map.translate(mx(player.x),mz(player.z));map.rotate(-player.yaw);map.fillStyle='#e9f7dc';map.beginPath();map.moveTo(0,-5);map.lineTo(-3,3);map.lineTo(3,3);map.fill();map.restore();$('pos').textContent=`${Math.round(player.x).toString().padStart(2,'0')} : ${Math.round(player.z).toString().padStart(2,'0')}`;
}
function tick(dt){elapsed+=dt;signage.update(elapsed);for(let i=effects.length-1;i>=0;i--){effects[i].ttl-=dt;if(effects[i].velocity){effects[i].mesh.position.addScaledVector(effects[i].velocity,dt);effects[i].velocity.y-=dt*5}if(effects[i].ttl<=0){(effects[i].parent||world).remove(effects[i].mesh);effects[i].mesh.geometry.dispose();effects[i].mesh.material.dispose();effects.splice(i,1)}}
 const rainPos=rain.geometry.attributes.position;for(let i=0;i<rainPos.count;i+=2){let y=rainPos.getY(i)-dt*13;if(y<0)y=19;rainPos.setY(i,y);rainPos.setY(i+1,y-.5)}rainPos.needsUpdate=true;
 for(const m of medkits)if(!m.taken)m.g.rotation.y=elapsed;
 for(const r of relays){const active=mission.active(r);r.halo.visible=active&&Math.sin(elapsed*3)>-.6;r.g.visible=active;r.screen.visible=active;r.g.position.z=r.z;r.halo.position.z=r.z;r.screen.position.z=r.z;
  if(r.kind==='pickup')r.g.rotation.y=elapsed;
 }
 if(mode==='menu'){camera.position.set(3+Math.sin(elapsed*.12)*2,3,20);camera.lookAt(-1,4,-18);return}
 if(mode!=='playing')return;
 const restored=smoking.tick(dt,player);if(restored>0){notify(`NIGHT LEAF / +${restored} HP`);sound(380,.2,'sine',.018);}
 poseSmoking(blunt,{time:weaponTime,phase:smoking.state.phase});smoke.tick(dt,blunt,smoking.state.phase,selectedWeapon==='blunt');blood.tick(dt);
 missionTime+=dt;shotTime=Math.max(0,shotTime-dt);recoil=Math.max(0,recoil-dt*.8);flash.visible=selectedWeapon==='carbine'&&shotTime>.095;animateSword(dt);
 if(reloadTime>0){reloadTime=Math.max(0,reloadTime-dt);if(reloadTime===0){player.ammo=24;$('weapon-status').textContent='AUTO · 9MM ION';sound(340,.1,'square',.02);updateHUD()}}
 if(firing)fire();
 const forward=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'));const strafe=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));if(keys.has('ArrowLeft'))player.yaw+=dt*1.7;if(keys.has('ArrowRight'))player.yaw-=dt*1.7;
 const norm=Math.max(1,Math.hypot(forward,strafe)),speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')?7:4.5)*dt/norm;move(player,(-Math.sin(player.yaw)*forward+Math.cos(player.yaw)*strafe)*speed,(-Math.cos(player.yaw)*forward-Math.sin(player.yaw)*strafe)*speed);
 player.vy-=dt*15;player.y=Math.max(1.65,player.y+player.vy*dt);if(player.y<=1.65)player.vy=0;step+=(Math.abs(forward)+Math.abs(strafe))*dt*9;
 camera.position.set(player.x,player.y+Math.sin(step)*.035*(!!forward||!!strafe),player.z);camera.rotation.order='YXZ';camera.rotation.set(player.pitch+recoil*.22,player.yaw,0);poseCarbine(gun,{time:weaponTime,walk:step,recoil,reload:reloadTime});
 for(const e of enemies){
  if(e.hp<=0)continue;const moving=stepEnemy(e,dt,combatContext);animateEnemy(e,elapsed,moving);
  e.tell.visible=!!e.attack;e.tell.position.set(e.g.position.x,.025,e.g.position.z);e.tell.scale.setScalar(1+(e.attack?e.attack.elapsed/e.info.windup:0));
  if(mode!=='playing')return;
 }
 tickProjectiles(dt);if(mode!=='playing')return;updateFocus();
 for(const m of medkits)if(!m.taken&&player.hp<100&&Math.hypot(player.x-m.g.position.x,player.z-m.g.position.z)<1.3){m.taken=true;m.g.visible=false;player.hp=Math.min(100,player.hp+40);notify('MED PATCH +40 / VITAL SYSTEMS RESTORED');sound(720,.2,'sine');updateHUD()}
 let prompt=mission.tick(dt,player,keys.has('KeyE'),enemies);updateHUD();
 if(mission.complete&&Math.hypot(player.x-level().exit.x,player.z-level().exit.z)<2.7){prompt=`[ E ] ${level().exitPrompt}${levelIndex<LEVELS.length-1?' / NEXT CHAPTER':' / FINISH CAMPAIGN'}`;if(keys.has('KeyE'))end(true)}$('prompt').textContent=prompt;$('prompt').style.display=prompt?'block':'none';damageTimer=Math.max(0,damageTimer-dt);$('damage').style.opacity=damageTimer*1.8;hitTimer=Math.max(0,hitTimer-dt);$('hitmarker').style.opacity=hitTimer>0?1:0;noticeTimer-=dt;if(noticeTimer<=0)$('notice').textContent='';drawMap();}
function updateGraphics(){const s=pipeline.options;const el=$('graphics-status');if(el)el.textContent=`F6 AFFINE: ${s.affine?'ON':'OFF'}  /  F7 VERTEX SNAP: ${s.vertexSnap?'ON':'OFF'}  /  F8 DITHER: ${s.dither?'ON':'OFF'}`}
loadLevel(0);updateGraphics();
let last=performance.now();function frame(now){requestAnimationFrame(frame);const dt=Math.min(.1,(now-last)/1000);last=now;tick(dt);gunCamera.aspect=innerWidth/innerHeight;gunCamera.updateProjectionMatrix();pipeline.render(scene,camera,mode==='menu'?null:gunScene,gunCamera)}requestAnimationFrame(frame);
// Read-only diagnostics for smoke tests and renderer inspection.
window.nullDistrict={get state(){return {mode,level:levelIndex+1,levelId:level().id,levelName:level().name,exit:{...level().exit},nodes:relays.map(r=>({id:r.id,label:r.label,kind:r.kind,x:r.x,z:r.z,endZ:r.endZ,done:r.done,active:mission.active(r),progress:r.progress,hp:r.hp,started:r.started,wave:r.wave,guards:r.guards.filter(e=>e.hp>0).map(e=>e.id)})),missionComplete:mission.complete,health:player.hp,ammo:player.ammo,weapon:selectedWeapon,inventory:[...inventory],smoking:{...smoking.state},blood:{...blood.diagnostics},smoke:{...smoke.diagnostics},meleeStrikes,meleeHits,meleeCooldown,swingPhase:swordAttack?.elapsed||0,kills:player.kills,position:{x:player.x,z:player.z,y:player.y},yaw:player.yaw,pitch:player.pitch,targets:enemies.filter(e=>e.hp>0).map(e=>({id:e.id,x:e.g.position.x,z:e.g.position.z,hp:e.hp,species:e.g.userData.asset.species,type:e.type,name:e.info.name,maxHp:e.info.hp,attack:e.attack?{elapsed:e.attack.elapsed,windup:e.info.windup}:null})),relays:relays.filter(r=>r.done).length,enemies:enemies.filter(e=>e.hp>0).length,projectiles:projectiles.map(p=>({type:p.type,x:p.mesh.position.x,y:p.mesh.position.y,z:p.mesh.position.z}))}},navigation:()=>({bounds:{...level().bounds},solids:solids.map(({x,z,w,d})=>({x,z,w,d}))}),renderer,scene,pipeline,grips:()=>({carbine:gripDiagnostics(gun),sword:gripDiagnostics(sword)}),graphics:()=>({...pipeline.diagnostics,...district,chapter:level().name,chapters:LEVELS.map(l=>({id:l.id,name:l.name})),...signage.diagnostics(),roster:Object.entries(ENEMY_TYPES).map(([type,info])=>({type,...info})),guard:enemies[0]?.g.userData.asset,weapon:gun.userData.asset,sword:sword.userData.asset,blunt:blunt.userData.asset})};
