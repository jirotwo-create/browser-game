import * as THREE from './vendor/three.module.js';
import { PSXPipeline } from './graphics/psx-renderer.js';
import { makePalette } from './graphics/textures.js';
import { loft, mesh, plate, makeGuard, makeCarbine, makeSword } from './graphics/models.js';
import { buildDistrict } from './graphics/district.js';
const $=id=>document.getElementById(id);
const pipeline=new PSXPipeline($('game'));
const renderer=pipeline.renderer;
const scene=new THREE.Scene();scene.background=pipeline.fogColor;
const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.08,95);
function resize(){camera.aspect=pipeline.resize(innerWidth,innerHeight);camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
let seed=923;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
const {materials,textures}=makePalette(pipeline);
function mat(color=0xffffff,tex,repeat=1,glow=0){return pipeline.material(color,tex,repeat,glow)}
const world=new THREE.Group();scene.add(world);const solids=[];const geometry=new THREE.BoxGeometry(1,1,1);
function box(w,h,d,x,y,z,m,solid=false,parent=world){const b=new THREE.Mesh(geometry,m);b.scale.set(w,h,d);b.position.set(x,y,z);parent.add(b);if(solid)solids.push({x,z,w,d,mesh:b});return b}
function sign(text,x,y,z,color,w=4,h=1.3,rotation=0){const c=document.createElement('canvas');c.width=128;c.height=32;const ctx=c.getContext('2d');ctx.fillStyle='#33323e';ctx.fillRect(0,0,128,32);ctx.strokeStyle=color;ctx.strokeRect(1,1,126,30);ctx.fillStyle=color;ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText(text,64,22);const tex=new THREE.CanvasTexture(c);tex.magFilter=tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat(0xffffff,tex,1,1));m.position.set(x,y,z);m.rotation.y=rotation;world.add(m);return m}
const district=buildDistrict(world,materials,solids,sign);
const relays=[];
for(const [i,p]of [[0,[-6,-6]],[1,[6,-17]],[2,[-5,-27]]]){const [x,z]=p;const g=new THREE.Group();g.name='polygonal-data-relay';g.position.set(x,0,z);world.add(g);mesh(g,loft([[0,1.2,.9],[.2,1.1,.8],[1.7,1.1,.7],[2.1,.8,.55]]),materials.rust);plate(g,materials.circuit,.8,.7,.04,0,1.5,.4);plate(g,materials.hazard,1,.2,.05,0,.4,.45);solids.push({x,z,w:1.1,d:.8,mesh:g});const screen=sign(`0${i+1} / LINK`,x,2.6,z,'#b7c7b1',2,.5);const halo=box(.08,.3,.08,x,2.22,z,materials.cyan);relays.push({x,z,g,screen,halo,done:false,progress:0});}
const extraction=box(4,.025,4,0,.03,26,materials.dark);for(const x of [-2,2])box(.1,.04,4,x,.06,26,materials.acid);for(const z of [24,28])box(4,.04,.1,0,.06,z,materials.acid);
const medkits=[];for(const [x,z] of [[5,18],[-6,-13],[6,-28]]){const g=new THREE.Group();g.position.set(x,.45,z);world.add(g);mesh(g,loft([[-.25,.5,.5],[0,.65,.6],[.25,.5,.5]]),materials.coat);box(.36,.12,.02,0,0,.31,materials.acid,false,g);box(.12,.35,.02,0,0,.32,materials.acid,false,g);medkits.push({g,taken:false})}
// Rain rendered as low resolution streaks.
const rainPoints=[];for(let i=0;i<350;i++){const x=(rand()-.5)*50,y=rand()*19,z=(rand()-.5)*68;rainPoints.push(x,y,z,x-.05,y-.5,z)}
const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.Float32BufferAttribute(rainPoints,3));const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0x7d9aad,transparent:true,opacity:.22}));scene.add(rain);
// Authored faceted carbine and gloved arms share the same retro render target.
const gunScene=new THREE.Scene();const gun=makeCarbine(materials);gunScene.add(gun);
const sword=makeSword(materials);sword.visible=false;sword.position.set(.38,-.4,-1.02);sword.rotation.z=-.22;gunScene.add(sword);
const flash=new THREE.Mesh(new THREE.ConeGeometry(.12,.3,5),materials.acid);flash.rotation.x=-Math.PI/2;flash.position.set(.28,-.3,-1.4);flash.visible=false;gun.add(flash);
const gunCamera=new THREE.PerspectiveCamera(72,camera.aspect,.01,5);
const player={x:0,z:22,y:1.65,vy:0,yaw:0,pitch:0,hp:100,ammo:24,kills:0};
let mode='menu',firing=false,looking=false,reloadTime=0,shotTime=0,recoil=0,damageTimer=0,hitTimer=0,noticeTimer=0,elapsed=0,missionTime=0,step=0,audio;
let selectedWeapon='carbine',meleeCooldown=0,swordAttack=null,meleeStrikes=0,meleeHits=0;
const keys=new Set(),enemies=[],effects=[];let enemyId=0;
function sound(freq=.1,duration=.1,type='sawtooth',volume=.035){if(!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(20,freq*.24),audio.currentTime+duration);g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}
function notify(text){$('notice').textContent=text;noticeTimer=3}
function spawn(x,z){const {g,legs,knees,arms,head,torso}=makeGuard(materials,enemyId);world.add(g);g.position.set(x,0,z);const enemy={id:++enemyId,g,hp:3,legs,knees,arms,head,torso,shot:1+rand()*2,alert:false,phase:rand()*10};g.traverse(o=>{if(o.isMesh)o.userData.enemy=enemy});enemies.push(enemy);}
function populate(){for(const e of enemies){world.remove(e.g);e.g.traverse(o=>{if(o.isMesh)o.geometry.dispose()})}enemies.length=0;for(const [x,z]of [[-3,9],[4,0],[-4,-10],[3,-20],[0,-27],[5,-9],[-4,-23]])spawn(x,z)}populate();
function blocked(x,z,r=.32){return Math.abs(x)>8.3||z< -30||z>30||solids.some(b=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r)}
function move(entity,dx,dz,r=.32){if(!blocked(entity.x+dx,entity.z,r))entity.x+=dx;if(!blocked(entity.x,entity.z+dz,r))entity.z+=dz}
const ray=new THREE.Raycaster();const rayOrigin=new THREE.Vector3(),rayDirection=new THREE.Vector3();
function canSee(a,b){rayOrigin.set(a.x,1.25,a.z);rayDirection.set(b.x-a.x,.25,b.z-a.z);const dist=rayDirection.length();ray.set(rayOrigin,rayDirection.normalize());return !ray.intersectObjects(solids.map(s=>s.mesh),true).some(h=>h.distance<dist-.5)}
function tracer(from,to,color=0xe4ca81){const geo=new THREE.BufferGeometry().setFromPoints([from,to]);const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color}));world.add(line);effects.push({mesh:line,ttl:.07})}
function reload(){if(selectedWeapon!=='carbine'||reloadTime||player.ammo===24||mode!=='playing')return;reloadTime=1.5;sound(220,.18,'triangle');$('weapon-status').textContent='RELOADING…'}
function hitEnemy(e,damage,source){
 if(e.hp<=0)return;e.hp=Math.max(0,e.hp-damage);e.alert=true;hitTimer=.18;$('hitmarker').style.opacity=1;
 sound(source==='sword'?85:460,.08,source==='sword'?'sawtooth':'square',.025);
 for(let i=0;i<(source==='sword'?6:3);i++){
  const particle=new THREE.Mesh(new THREE.TetrahedronGeometry(.035+rand()*.025),materials.crimson.clone());
  particle.position.set(e.g.position.x,1.2+rand()*.3,e.g.position.z);world.add(particle);
  effects.push({mesh:particle,ttl:.28+rand()*.2,velocity:new THREE.Vector3((rand()-.5)*2,rand()*2,(rand()-.5)*2)});
 }
 if(e.hp<=0){player.kills++;e.g.rotation.z=(e.id%2?1:-1)*Math.PI/2;e.g.position.y=.35;$('killfeed').textContent=`${e.g.userData.asset.name.split(' / ')[0].toUpperCase()} / DOWN · ${source==='sword'?'MOURNFANG':'K-09'}`;setTimeout(()=>{$('killfeed').textContent=''},2200)}
 updateHUD();
}
function chooseWeapon(weapon){
 if(mode!=='playing'||selectedWeapon===weapon)return;
 selectedWeapon=weapon;firing=false;reloadTime=0;swordAttack=null;flash.visible=false;
 gun.visible=weapon==='carbine';sword.visible=weapon==='sword';
 sound(weapon==='sword'?130:240,.12,'triangle',.025);updateHUD();
}
function swingSword(){
 if(mode!=='playing'||meleeCooldown>0)return;
 swordAttack={elapsed:0,hit:false};meleeCooldown=.78;meleeStrikes++;
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
}
function fire(){
 if(selectedWeapon==='sword'){swingSword();return}
 if(mode!=='playing'||shotTime>0||reloadTime>0)return;
 if(player.ammo<=0){reload();return}
 player.ammo--;shotTime=.14;recoil=.09;flash.visible=true;sound(105,.13,'sawtooth',.055);
 camera.rotation.set(player.pitch+recoil*.22,player.yaw,0);camera.updateMatrixWorld();ray.setFromCamera(new THREE.Vector2(0,0),camera);
 const hits=ray.intersectObjects([...enemies.filter(e=>e.hp>0).map(e=>e.g),...solids.map(s=>s.mesh)],true);
 let end=camera.position.clone().add(ray.ray.direction.clone().multiplyScalar(55));
 if(hits.length){end=hits[0].point;const e=hits[0].object.userData.enemy;if(e)hitEnemy(e,1,'carbine')}
 const from=new THREE.Vector3(.28,-.25,-1.4).applyMatrix4(camera.matrixWorld);tracer(from,end);updateHUD();
}
function animateSword(dt){
 const previousCooldown=meleeCooldown;meleeCooldown=Math.max(0,meleeCooldown-dt);if(previousCooldown>0&&meleeCooldown===0)updateHUD();
 let t=0;if(swordAttack){swordAttack.elapsed+=dt;t=swordAttack.elapsed;
  if(t>=.18&&!swordAttack.hit){swordAttack.hit=true;resolveSwordHit()}
  if(t>=.70)swordAttack=null;
 }
 let slash=0,wind=0,recover=0;
 if(swordAttack){if(t<.13)wind=t/.13;else if(t<.38){wind=1;slash=Math.sin((t-.13)/.25*Math.PI/2)}else{recover=(t-.38)/.32;wind=1-recover;slash=1-recover}}
 sword.position.set(.38-slash*.73+wind*.1,-.4+wind*.08-slash*.1,-1.02+wind*.04+slash*.16);
 sword.rotation.set(-wind*.3+slash*.6,slash*-.65,-.22-wind*.35+slash*1.65);
 if(swordAttack&&t>.13&&t<.35){const segment=new THREE.Mesh(new THREE.PlaneGeometry(.018,.35),materials.crimson.clone());segment.position.set(.06+slash*.5,.2,-1.1);segment.rotation.z=.8+slash;gunScene.add(segment);effects.push({mesh:segment,ttl:.09,parent:gunScene})}
}
function updateHUD(){$('health').textContent=Math.max(0,Math.ceil(player.hp));$('healthbar').style.width=player.hp+'%';$('healthbar').style.background=player.hp<30?'#ff5a55':'#d8f36a';$('ammo').textContent=selectedWeapon==='sword'?'∞':String(player.ammo).padStart(2,'0');$('weapon-name').textContent=selectedWeapon==='sword'?'02 // MOURNFANG · THE OATH-EATER':'01 // K-09 PULSE CARBINE';$('ammo-reserve').textContent=selectedWeapon==='sword'?' / MELEE':' / ∞';$('weapon-status').textContent=selectedWeapon==='sword'?(meleeCooldown>0?'RECOVERING…':'CURSED EDGE · 2.8M REACH'):(reloadTime>0?'RELOADING…':'AUTO · 9MM ION');$('slot-carbine').classList.toggle('active',selectedWeapon==='carbine');$('slot-sword').classList.toggle('active',selectedWeapon==='sword');for(const [i,r]of relays.entries()){$('relay'+i).classList.toggle('done',r.done);$('relay'+i).querySelector('b').textContent=r.done?'STOLEN':'LOCKED'}const n=relays.filter(r=>r.done).length;$('objective').textContent=n===3?'Signal stolen. Return to the uplink at spawn.':`${n}/3 relays breached · ${enemies.filter(e=>e.hp>0).length} mercenaries active`}
function end(win){swordAttack=null;mode=win?'won':'dead';firing=false;keys.clear();$('end-tag').textContent=win?'CONTRACT COMPLETE':'NEURAL LINK TERMINATED';$('end-title').textContent=win?'GHOST IN THE GRID':'FLATLINED';$('end-copy').textContent=win?`Three relays extracted. ${player.kills} sentries erased. ${Math.floor(missionTime/60)}m ${Math.floor(missionTime%60)}s. You were never here.`:'The city keeps its secrets. Reboot and try another approach.';$('resume').classList.add('hidden');$('pause').classList.remove('hidden');document.exitPointerLock?.();sound(win?660:90,.6,'triangle',.08)}
function capture(){try{const p=$('game').requestPointerLock?.();p?.catch(()=>notify('MOUSE CAPTURE UNAVAILABLE · HOLD RIGHT MOUSE TO LOOK'))}catch{notify('HOLD RIGHT MOUSE TO LOOK')}}
function start(){if(!audio){try{audio=new (window.AudioContext||window.webkitAudioContext)()}catch{}}audio?.resume();mode='playing';$('menu').classList.add('hidden');$('pause').classList.add('hidden');$('hud').classList.remove('hidden');capture();notify('FIND THE THREE RELAYS. HOLD E TO EXTRACT.');updateHUD()}
function pause(){if(mode!=='playing')return;swordAttack=null;mode='paused';keys.clear();firing=false;$('end-tag').textContent='CONNECTION SUSPENDED';$('end-title').textContent='SIGNAL PAUSED';$('end-copy').textContent='Take a breath. The district can wait.';$('resume').classList.remove('hidden');$('pause').classList.remove('hidden');document.exitPointerLock?.()}
function restart(){Object.assign(player,{x:0,z:22,y:1.65,vy:0,yaw:0,pitch:0,hp:100,ammo:24,kills:0});for(const r of relays){r.done=false;r.progress=0;r.halo.material=materials.cyan}for(const m of medkits){m.taken=false;m.g.visible=true}populate();selectedWeapon='carbine';gun.visible=true;sword.visible=false;swordAttack=null;meleeCooldown=meleeStrikes=meleeHits=0;reloadTime=shotTime=damageTimer=hitTimer=recoil=missionTime=0;keys.clear();$('damage').style.opacity=0;start()}
$('start').onclick=start;$('resume').onclick=()=>{mode='playing';$('pause').classList.add('hidden');capture()};$('restart').onclick=restart;$('settings').onclick=()=>{document.body.classList.toggle('no-crt');$('settings').textContent=document.body.classList.contains('no-crt')?'CRT: OFF':'CRT: ON'};
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='F6'||e.code==='F7'||e.code==='F8'){e.preventDefault();const option={F6:'affine',F7:'vertexSnap',F8:'dither'}[e.code];pipeline.configure({[option]:!pipeline.options[option]});updateGraphics();return}if(e.code==='Escape'){pause();return}if(mode!=='playing')return;keys.add(e.code);if(!e.repeat&&['Digit1','Numpad1','Digit2','Numpad2','KeyQ'].includes(e.code)){chooseWeapon(e.code==='KeyQ'?(selectedWeapon==='carbine'?'sword':'carbine'):(e.code.endsWith('2')?'sword':'carbine'));return}if(e.code==='KeyR')reload();if(e.code==='Space'&&player.y<=1.651){player.vy=5;sound(140,.08,'triangle',.02)}});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{keys.clear();firing=false;pause()});
addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&mode==='playing')pause()});
$('game').addEventListener('mousedown',e=>{if(mode!=='playing')return;if(e.button===0){firing=true;fire()}if(e.button===2)looking=true});addEventListener('mouseup',()=>{firing=false;looking=false});addEventListener('contextmenu',e=>e.preventDefault());
$('game').addEventListener('wheel',e=>{if(mode==='playing'&&e.deltaY){e.preventDefault();chooseWeapon(selectedWeapon==='carbine'?'sword':'carbine')}},{passive:false});
addEventListener('mousemove',e=>{if(mode==='playing'&&(document.pointerLockElement||looking)){player.yaw-=e.movementX*.0024;player.pitch=Math.max(-1.3,Math.min(1.3,player.pitch-e.movementY*.0024))}});
const map=$('map').getContext('2d');function drawMap(){map.clearRect(0,0,140,140);map.strokeStyle='#35444e';for(let i=0;i<140;i+=14){map.beginPath();map.moveTo(i,0);map.lineTo(i,140);map.moveTo(0,i);map.lineTo(140,i);map.stroke()}const mx=x=>70+x*4,mz=z=>70+z*1.9;map.fillStyle='#40525e';for(const b of solids)map.fillRect(mx(b.x-b.w/2),mz(b.z-b.d/2),b.w*4,b.d*1.9);for(const r of relays){map.fillStyle=r.done?'#d8f36a':'#56ddd7';map.fillRect(mx(r.x)-2,mz(r.z)-2,4,4)}map.strokeStyle='#d8f36a';map.strokeRect(62,mz(24),16,8);for(const e of enemies){if(e.hp<=0)continue;map.fillStyle='#ff625d';map.fillRect(mx(e.g.position.x)-1.5,mz(e.g.position.z)-1.5,3,3)}map.save();map.translate(mx(player.x),mz(player.z));map.rotate(-player.yaw);map.fillStyle='#e9f7dc';map.beginPath();map.moveTo(0,-5);map.lineTo(-3,3);map.lineTo(3,3);map.fill();map.restore();$('pos').textContent=`${Math.round(player.x).toString().padStart(2,'0')} : ${Math.round(player.z).toString().padStart(2,'0')}`}
function tick(dt){elapsed+=dt;for(let i=effects.length-1;i>=0;i--){effects[i].ttl-=dt;if(effects[i].velocity){effects[i].mesh.position.addScaledVector(effects[i].velocity,dt);effects[i].velocity.y-=dt*5}if(effects[i].ttl<=0){(effects[i].parent||world).remove(effects[i].mesh);effects[i].mesh.geometry.dispose();effects[i].mesh.material.dispose();effects.splice(i,1)}}
 const rainPos=rain.geometry.attributes.position;for(let i=0;i<rainPos.count;i+=2){let y=rainPos.getY(i)-dt*13;if(y<0)y=19;rainPos.setY(i,y);rainPos.setY(i+1,y-.5)}rainPos.needsUpdate=true;
 for(const m of medkits)if(!m.taken)m.g.rotation.y=elapsed;
 for(const r of relays){r.halo.visible=!r.done&&Math.sin(elapsed*3)>-.6}
 if(mode==='menu'){camera.position.set(4+Math.sin(elapsed*.12)*2,3,23);camera.lookAt(-1,3,-14);return}
 if(mode!=='playing')return;missionTime+=dt;shotTime=Math.max(0,shotTime-dt);recoil=Math.max(0,recoil-dt*.8);flash.visible=selectedWeapon==='carbine'&&shotTime>.095;animateSword(dt);
 if(reloadTime>0){reloadTime-=dt;if(reloadTime<=0){player.ammo=24;$('weapon-status').textContent='AUTO · 9MM ION';sound(340,.1,'square',.02);updateHUD()}}
 if(firing)fire();
 const forward=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'));const strafe=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));if(keys.has('ArrowLeft'))player.yaw+=dt*1.7;if(keys.has('ArrowRight'))player.yaw-=dt*1.7;
 const norm=Math.max(1,Math.hypot(forward,strafe)),speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')?7:4.5)*dt/norm;move(player,(-Math.sin(player.yaw)*forward+Math.cos(player.yaw)*strafe)*speed,(-Math.cos(player.yaw)*forward-Math.sin(player.yaw)*strafe)*speed);
 player.vy-=dt*15;player.y=Math.max(1.65,player.y+player.vy*dt);if(player.y<=1.65)player.vy=0;step+=(Math.abs(forward)+Math.abs(strafe))*dt*9;
 camera.position.set(player.x,player.y+Math.sin(step)*.035*(!!forward||!!strafe),player.z);camera.rotation.order='YXZ';camera.rotation.set(player.pitch+recoil*.22,player.yaw,0);gun.position.set(Math.sin(step*.5)*.015,-Math.abs(Math.cos(step))*.01-(reloadTime>0?Math.sin(reloadTime/1.5*Math.PI)*.3:0),recoil);gun.rotation.z=reloadTime>0?-.4*Math.sin(reloadTime/1.5*Math.PI):0;
 for(const e of enemies){if(e.hp<=0)continue;const pos=e.g.position,dist=Math.hypot(player.x-pos.x,player.z-pos.z);e.g.rotation.y=Math.atan2(player.x-pos.x,player.z-pos.z);const sight=dist<30&&canSee(pos,player);if(sight)e.alert=true;if(e.alert&&dist>4){const direction=Math.atan2(player.x-pos.x,player.z-pos.z);let p={x:pos.x,z:pos.z};const sway=Math.sin(elapsed+e.phase)*.5;move(p,Math.sin(direction+sway)*dt*1.6,Math.cos(direction+sway)*dt*1.6,.4);if(Math.hypot(p.x-player.x,p.z-player.z)>1.4)pos.set(p.x,0,p.z);e.legs[0].rotation.x=Math.sin(elapsed*7+e.phase)*.4;e.legs[1].rotation.x=-e.legs[0].rotation.x;e.knees[0].rotation.x=Math.max(0,Math.sin(elapsed*7+e.phase))*.55;e.knees[1].rotation.x=Math.max(0,-Math.sin(elapsed*7+e.phase))*.55;e.torso.rotation.z=Math.sin(elapsed*7+e.phase)*.025;}e.shot-=dt;if(e.shot<=0&&sight){e.shot=1.8+rand()*.7;tracer(new THREE.Vector3(pos.x,1.3,pos.z),camera.position.clone(),0xff564c);player.hp=Math.max(0,player.hp-(keys.has('ShiftLeft')?4:7));damageTimer=.35;sound(65,.15,'sawtooth',.03);updateHUD();if(player.hp<=0){end(false);return}}}
 for(const m of medkits)if(!m.taken&&player.hp<100&&Math.hypot(player.x-m.g.position.x,player.z-m.g.position.z)<1.3){m.taken=true;m.g.visible=false;player.hp=Math.min(100,player.hp+40);notify('MED PATCH +40 / VITAL SYSTEMS RESTORED');sound(720,.2,'sine');updateHUD()}
 let prompt='';for(const r of relays){if(r.done)continue;const close=Math.hypot(player.x-r.x,player.z-r.z)<2.7;if(close){const danger=enemies.some(e=>e.hp>0&&Math.hypot(e.g.position.x-r.x,e.g.position.z-r.z)<6);prompt=danger?'RELAY GUARDED / CLEAR NEARBY MERCENARIES':`HOLD [ E ] TO BREACH RELAY ${Math.floor(r.progress*100)}%`;if(keys.has('KeyE')&&!danger){r.progress+=dt/1.3;if(r.progress>=1){r.done=true;r.halo.visible=false;sound(880,.3,'triangle');notify('RELAY EXTRACTED / '+relays.filter(r=>r.done).length+' OF 3');updateHUD()}}else r.progress=Math.max(0,r.progress-dt*.5)}else r.progress=0}
 if(relays.every(r=>r.done)&&Math.hypot(player.x,player.z-26)<2.7){prompt='[ E ] EXTRACT / CLOSE THE CONNECTION';if(keys.has('KeyE'))end(true)}$('prompt').textContent=prompt;$('prompt').style.display=prompt?'block':'none';damageTimer=Math.max(0,damageTimer-dt);$('damage').style.opacity=damageTimer*1.8;hitTimer=Math.max(0,hitTimer-dt);$('hitmarker').style.opacity=hitTimer>0?1:0;noticeTimer-=dt;if(noticeTimer<=0)$('notice').textContent='';drawMap();}
function updateGraphics(){const s=pipeline.options;const el=$('graphics-status');if(el)el.textContent=`F6 AFFINE: ${s.affine?'ON':'OFF'}  /  F7 VERTEX SNAP: ${s.vertexSnap?'ON':'OFF'}  /  F8 DITHER: ${s.dither?'ON':'OFF'}`}
updateGraphics();
let last=performance.now();function frame(now){requestAnimationFrame(frame);const dt=Math.min(.1,(now-last)/1000);last=now;tick(dt);gunCamera.aspect=camera.aspect;gunCamera.updateProjectionMatrix();pipeline.render(scene,camera,mode==='menu'?null:gunScene,gunCamera)}requestAnimationFrame(frame);
// Read-only diagnostics for smoke tests and renderer inspection.
window.nullDistrict={get state(){return {mode,health:player.hp,ammo:player.ammo,weapon:selectedWeapon,inventory:['carbine','sword'],meleeStrikes,meleeHits,meleeCooldown,swingPhase:swordAttack?.elapsed||0,kills:player.kills,position:{x:player.x,z:player.z,y:player.y},yaw:player.yaw,pitch:player.pitch,targets:enemies.filter(e=>e.hp>0).map(e=>({id:e.id,x:e.g.position.x,z:e.g.position.z,hp:e.hp,species:e.g.userData.asset.species})),relays:relays.filter(r=>r.done).length,enemies:enemies.filter(e=>e.hp>0).length}},renderer,scene,pipeline,graphics:()=>({...pipeline.diagnostics,...district,guard:enemies[0]?.g.userData.asset,weapon:gun.userData.asset,sword:sword.userData.asset})};
