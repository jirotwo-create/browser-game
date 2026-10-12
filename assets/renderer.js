import {exoticModel} from './exotic-models.js';
import {EXOTICS} from '../exotics.js';
import * as T from './vendor/three.module.js';
import {monster,cathedral,weapon,armor,talent} from './models.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer,world,camera,actor,current,canvas,drag=0,last=0,failed=false,frame=0;
const cameraPosition=[4.3,2.7,6.5];
function setup(){
 renderer=new T.WebGLRenderer({antialias:false,alpha:false,powerPreference:'low-power',preserveDrawingBuffer:true});
 renderer.setPixelRatio(1);renderer.setSize(384,256,false);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 canvas=renderer.domElement;canvas.className='world-art real-3d';canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Interactive low-poly 3D monster inside a ruined cathedral. Drag to rotate.');
 world=new T.Scene();world.background=new T.Color('#17121e');world.fog=new T.FogExp2('#21182b',.065);world.add(cathedral());
 world.add(new T.HemisphereLight(0xc0c3ee,0x4a2235,2));
 const key=new T.DirectionalLight(0xffd1a4,3.4);key.position.set(-3,5,4);world.add(key);
 const rim=new T.DirectionalLight(0x9175ff,3);rim.position.set(3,2,-2);world.add(rim);
 camera=new T.PerspectiveCamera(38,1.5,.1,40);camera.position.set(...cameraPosition);camera.lookAt(0,1.45,0);
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
 if(actor){actor.rotation.y=drag+(reduced.matches?0:Math.sin(time*.00035)*.16);actor.position.y=reduced.matches?0:Math.sin(time*.0015)*.026;}
 if(aura&&!reduced.matches)aura.rotation.y=time*.00065;
 renderer.render(world,camera);
}
function loop(time=0){frame=0;if(document.hidden||!canvas?.isConnected||failed)return;draw(time,reduced.matches);if(!reduced.matches)frame=requestAnimationFrame(loop);}
reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;loop(performance.now());});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!frame)loop();});
export function mount3D(root=document){
 const host=root.querySelector('[data-monster]');
 if(!host){cancelAnimationFrame(frame);frame=0;return;}
 const kind=host.dataset.monster;
 if(failed){host.querySelector('.viewport-label').textContent='3D RENDER · WEBGL UNAVAILABLE';return;}
 try{
  if(!renderer)setup();
  if(current!==kind){if(actor){world.remove(actor);dispose(actor);}actor=monster(kind);world.add(actor);current=kind;drag=-.25;}
  host.append(canvas);draw(performance.now(),true);if(!frame)loop();
 }catch(error){failed=true;host.querySelector('.viewport-label').textContent='3D RENDER · WEBGL UNAVAILABLE';console.warn('3D viewport unavailable; displaying bundled 3D render.',error);}
}
export function combatImpact(move){
 if(!actor||!canvas?.isConnected)return;
 canvas.classList.remove('impact','cast');void canvas.offsetWidth;canvas.classList.add(move==='spell'||move==='eclipse'?'cast':'impact');
 setTimeout(()=>canvas?.classList.remove('impact','cast'),400);
}
// This renderer is also used by the asset baking script: the PNG fallback is a render of the same meshes.
export function assetRender(kind,id,width=384,height=256){
 const r=new T.WebGLRenderer({antialias:false,alpha:kind!=='monster',preserveDrawingBuffer:true});r.setSize(width,height,false);r.setPixelRatio(1);r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.35;
 const s=new T.Scene();s.add(new T.HemisphereLight(0xc8c9ed,0x522633,2));
 const key=new T.DirectionalLight(0xffdab0,3.4);key.position.set(-3,5,4);s.add(key);const rim=new T.DirectionalLight(0x956bff,3);rim.position.set(3,2,-2);s.add(rim);
 let model,c;
 if(kind!=='monster'){
  model=kind==='skill'?talent(id):EXOTICS.some(e=>e.id===id)?exoticModel(id):['rust','fang','reaper','thorn','god'].includes(id)?weapon(id):armor(id);model.rotation.set(.12,-.52,-.15);s.add(model);
  const isWeapon=kind==='gear'&&['rust','fang','reaper','thorn','god','mouth','probate','echoBlade','meteor'].includes(id);c=new T.PerspectiveCamera(33,width/height,.1,30);c.position.set(0,.05,kind==='skill'?4:isWeapon?5:4.3);c.lookAt(isWeapon&&id==='reaper'?.3:0,0,0);
 }else{
  s.background=new T.Color('#17121e');s.fog=new T.FogExp2('#21182b',.065);s.add(cathedral());model=monster(id);model.rotation.y=-.25;s.add(model);c=new T.PerspectiveCamera(38,width/height,.1,40);c.position.set(...cameraPosition);c.lookAt(0,1.45,0);
 }
 r.render(s,c);const data=r.domElement.toDataURL('image/png');dispose(model);r.dispose();r.forceContextLoss();return data;
}
let aura,auraKey='';
export function setCombatAura(b){
 if(!world)return;
 const types=[...(Object.keys(b?.effects||{})),...(b?.barrier?['barrier']:[]),...(b?.regen?['regen']:[])];const signature=types.sort().join(',');
 if(signature===auraKey)return;auraKey=signature;
 if(aura){world.remove(aura);aura.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});aura=null;}
 if(!types.length)return;aura=new T.Group();world.add(aura);
 const material=(color,opacity=.8,wireframe=false)=>new T.MeshBasicMaterial({color,transparent:true,opacity,wireframe,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
 for(const type of types){
  if(type==='barrier'){const shield=new T.Mesh(new T.IcosahedronGeometry(1,1),material(0xb0e985,.2,true));shield.position.y=1.5;shield.scale.set(1.1,1.7,1.1);aura.add(shield);}
  if(type==='curse'){const ring=new T.Mesh(new T.TorusGeometry(.75,.035,3,7),material(0xab6cff));ring.rotation.x=Math.PI/2;ring.position.y=2.7;aura.add(ring);}
  if(type==='regen'){const ring=new T.Mesh(new T.TorusGeometry(.75,.025,3,12),material(0xb4fa8e));ring.rotation.x=Math.PI/2;ring.position.y=.1;aura.add(ring);}
  if(type==='burn'||type==='bleed')for(let i=0;i<7;i++){
   const p=new T.Mesh(type==='burn'?new T.ConeGeometry(.055,.24,4):new T.IcosahedronGeometry(.05,0),material(type==='burn'?0xbc72ff:0xec4167));const angle=i*Math.PI*2/7;p.position.set(Math.sin(angle)*.62,type==='burn'?.28:.6+(i%3)*.55,Math.cos(angle)*.62);aura.add(p);
  }
 }
 draw(performance.now(),true);
}
