import {HeroLoadout} from './loadout-models.js';
import {RatSwarm,ratModel} from './rat-swarm.js';
import {hero} from './hero.js';
import {BattleAnimation,rigMonster,HERO_POS,ENEMY_POS} from './battle-animation.js';
import {exoticModel} from './exotic-models.js';
import {EXOTICS} from '../exotics.js';
import * as T from './vendor/three.module.js';
import {monster,cathedral,weapon,armor,talent} from './models.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer,world,camera,actor,player,arena,animation,swarm,loadout,current,requestedKind,canvas,drag=0,last=0,failed=false,frame=0,played,initialized=false;
const cameraPosition=[4.3,2.7,6.5];
function setup(){
 renderer=new T.WebGLRenderer({antialias:false,alpha:false,powerPreference:'low-power',preserveDrawingBuffer:true});
 renderer.setPixelRatio(1);renderer.setSize(384,256,false);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 canvas=renderer.domElement;canvas.className='world-art real-3d';canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Interactive low-poly 3D monster and black-armored hero inside a ruined cathedral. Drag to rotate.');
 world=new T.Scene();world.background=new T.Color('#17121e');world.fog=new T.FogExp2('#21182b',.065);world.add(cathedral());arena=new T.Group();world.add(arena);player=hero();loadout=new HeroLoadout(player);player.scale.setScalar(.82);arena.add(player);animation=new BattleAnimation(arena);swarm=new RatSwarm(arena);
 world.add(new T.HemisphereLight(0xc0c3ee,0x4a2235,2));
 const key=new T.DirectionalLight(0xffd1a4,3.4);key.position.set(-3,5,4);world.add(key);
 const rim=new T.DirectionalLight(0x9175ff,3);rim.position.set(3,2,-2);world.add(rim);
 camera=new T.PerspectiveCamera(38,1.5,.1,40);camera.position.set(...cameraPosition.map(v=>v*1.2));camera.lookAt(0,1.25,0);
 let pointer;
 canvas.addEventListener('pointerdown',e=>{pointer=e.clientX;canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(pointer!==undefined){drag+=(e.clientX-pointer)*.014;pointer=e.clientX;draw(performance.now(),true);}});
 const release=()=>{pointer=undefined;};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);failed=true;canvas.style.visibility='hidden';if(canvas.parentElement)canvas.parentElement.querySelector('.viewport-label').textContent='3D RENDER · WEBGL UNAVAILABLE';});
 canvas.addEventListener('webglcontextrestored',()=>{failed=false;canvas.style.visibility='visible';if(canvas.parentElement)canvas.parentElement.querySelector('.viewport-label').textContent='REALTIME 3D · DRAG TO ROTATE';loop();});
 loop();
}
function dispose(g){g?.traverse(o=>{if(o.isMesh)o.geometry.dispose();});}
function draw(time,force=false){
 if(!canvas?.isConnected||document.hidden||failed||(!force&&time-last<33))return;last=time;
 arena.rotation.y=drag;const wasAnimating=!!animation.fx;animation.update(time,player,actor,reduced.matches);swarm.update(time,reduced.matches);
 if(wasAnimating&&!animation.fx&&requestedKind!==current)replaceMonster(requestedKind);
 if(aura&&!reduced.matches)for(const ring of aura.children)if(ring.userData.spin)ring.rotation.y=time*.00065;
 renderer.render(world,camera);
}
function loop(time=0){frame=0;if(document.hidden||!canvas?.isConnected||failed)return;draw(time,reduced.matches);if(!reduced.matches||animation?.fx)frame=requestAnimationFrame(loop);}
reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;loop(performance.now());});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!frame)loop();});
function replaceMonster(kind){if(actor){arena.remove(actor);dispose(actor);}actor=rigMonster(monster(kind));actor.scale.multiplyScalar(.78);actor.name='Enemy '+kind;actor.position.copy(ENEMY_POS);actor.rotation.y=Math.atan2(HERO_POS.x-ENEMY_POS.x,HERO_POS.z-ENEMY_POS.z);arena.add(actor);current=kind;}
export function mount3D(root=document){
 const host=root.querySelector('[data-monster]');
 if(!host){cancelAnimationFrame(frame);frame=0;return;}
 const kind=host.dataset.monster;requestedKind=kind;
 if(failed){host.querySelector('.viewport-label').textContent='3D RENDER · WEBGL UNAVAILABLE';return;}
 try{
  if(!renderer)setup();
  if(current!==kind&&!animation.fx){replaceMonster(kind);drag=0;}
  host.append(canvas);draw(performance.now(),true);if(!frame)loop();
 }catch(error){failed=true;host.querySelector('.viewport-label').textContent='3D RENDER · WEBGL UNAVAILABLE';console.warn('3D viewport unavailable; displaying bundled 3D render.',error);}
}
export function setHeroLoadout(state){if(loadout){loadout.sync(state);draw(performance.now(),true);}}
export function setCompanions(state){
 const count=state.equippedExotics?.includes('rats')?Math.max(0,Math.min(12,Math.floor(state.battle?.exotic?.rats||state.combatFx?.ratCount||3))):0;
 const host=document.querySelector('[data-monster]');
 if(host&&count){const fallback=document.createElement('div');fallback.className='rat-fallback';fallback.setAttribute('role','img');fallback.setAttribute('aria-label',`${count} Parliament of Rats companions`);for(let i=0;i<count;i++){const image=document.createElement('img');image.src='assets/renders/companion-rat.png';image.alt='';fallback.append(image);}host.querySelector('.rat-fallback')?.remove();host.append(fallback);}
 else host?.querySelector('.rat-fallback')?.remove();
 if(!swarm)return;
 swarm.sync(count);canvas.setAttribute('aria-label',`Interactive low-poly 3D monster and black-armored hero${count?' with '+count+' rat companions':''} inside a ruined cathedral. Drag to rotate.`);draw(performance.now(),true);
}
export function playCombat(fx){
 if(!initialized){initialized=true;played=fx?.id;if(swarm)swarm.played=fx?.id;return;}
 if(!fx){played=undefined;swarm?.play(null,performance.now());animation?.clear();if(actor&&requestedKind!==current)replaceMonster(requestedKind);draw(performance.now(),true);return;}
 if(fx.id===played)return;played=fx.id;
 if(!animation||!canvas?.isConnected||failed)return;
 if(fx.enemyKind&&fx.enemyKind!==current)replaceMonster(fx.enemyKind);
 swarm.play(fx,performance.now());animation.start(fx,performance.now());draw(performance.now(),true);if(!frame)loop();
}
// This renderer is also used by the asset baking script: the PNG fallback is a render of the same meshes.
export function assetRender(kind,id,width=384,height=256){
 const r=new T.WebGLRenderer({antialias:false,alpha:kind!=='monster',preserveDrawingBuffer:true});r.setSize(width,height,false);r.setPixelRatio(1);r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.35;
 const s=new T.Scene();s.add(new T.HemisphereLight(0xc8c9ed,0x522633,2));
 const key=new T.DirectionalLight(0xffdab0,3.4);key.position.set(-3,5,4);s.add(key);const rim=new T.DirectionalLight(0x956bff,3);rim.position.set(3,2,-2);s.add(rim);
 let model,c;
 if(kind!=='monster'){
  model=kind==='companion'?ratModel():kind==='skill'?talent(id):EXOTICS.some(e=>e.id===id)?exoticModel(id):['rust','fang','reaper','thorn','god'].includes(id)?weapon(id):armor(id);model.rotation.set(.12,-.52,-.15);s.add(model);
  const isWeapon=kind==='gear'&&(['rust','fang','reaper','thorn','god'].includes(id)||EXOTICS.find(e=>e.id===id)?.slot==='weapon');c=new T.PerspectiveCamera(33,width/height,.1,30);c.position.set(0,.05,kind==='skill'?4:isWeapon?5:4.3);c.lookAt(isWeapon&&id==='reaper'?.3:0,0,0);if(kind==='companion'){model.rotation.set(0,-.6,0);c.position.set(1,.65,1.5);c.lookAt(0,.18,0);}
 }else{
  s.background=new T.Color('#17121e');s.fog=new T.FogExp2('#21182b',.065);s.add(cathedral());model=monster(id);model.scale.multiplyScalar(.78);model.position.copy(ENEMY_POS);model.rotation.y=Math.atan2(HERO_POS.x-ENEMY_POS.x,HERO_POS.z-ENEMY_POS.z);s.add(model);const h=hero();h.scale.setScalar(.82);h.position.copy(HERO_POS);h.rotation.y=Math.atan2(ENEMY_POS.x-HERO_POS.x,ENEMY_POS.z-HERO_POS.z);s.add(h);c=new T.PerspectiveCamera(38,width/height,.1,40);c.position.set(...cameraPosition.map(v=>v*1.2));c.lookAt(0,1.25,0);
 }
 r.render(s,c);const data=r.domElement.toDataURL('image/png');dispose(model);r.dispose();r.forceContextLoss();return data;
}
let aura,auraKey='';
export function setCombatAura(b){
 if(!world)return;
 const types=[...(Object.keys(b?.effects||{})),...(b?.barrier?['barrier']:[]),...(b?.regen?['regen']:[])];const signature=types.sort().join(',');
 if(signature===auraKey)return;auraKey=signature;
 if(aura){arena.remove(aura);aura.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});aura=null;}
 if(!types.length)return;aura=new T.Group();arena.add(aura);
 const material=(color,opacity=.8,wireframe=false)=>new T.MeshBasicMaterial({color,transparent:true,opacity,wireframe,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
 for(const type of types){
  if(type==='barrier'){const shield=new T.Mesh(new T.IcosahedronGeometry(1,1),material(0xb0e985,.2,true));shield.position.y=1.5;shield.scale.set(1.1,1.7,1.1);shield.position.add(HERO_POS);aura.add(shield);}
  if(type==='curse'){const ring=new T.Mesh(new T.TorusGeometry(.75,.035,3,7),material(0xab6cff));ring.rotation.x=Math.PI/2;ring.position.copy(ENEMY_POS).y=2.35;aura.add(ring);}
  if(type==='regen'){const ring=new T.Mesh(new T.TorusGeometry(.75,.025,3,12),material(0xb4fa8e));ring.rotation.x=Math.PI/2;ring.position.copy(HERO_POS).y=.1;aura.add(ring);}
  if(type==='burn'||type==='bleed')for(let i=0;i<7;i++){
   const p=new T.Mesh(type==='burn'?new T.ConeGeometry(.055,.24,4):new T.IcosahedronGeometry(.05,0),material(type==='burn'?0xbc72ff:0xec4167));const angle=i*Math.PI*2/7;p.position.set(Math.sin(angle)*.62,type==='burn'?.28:.6+(i%3)*.55,Math.cos(angle)*.62);p.position.add(ENEMY_POS);aura.add(p);
  }
 }
 draw(performance.now(),true);
}
