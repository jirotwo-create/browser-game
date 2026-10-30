import * as T from '../vendor/three.module.js';
import {mesh,plate,cylinder,loft,makeSword} from './models.js';
import {buildLevel,LEVELS} from './levels.js';
import {makeHuman} from './human-npcs.js';
import {makeEnemy} from './enemies.js';
import {createSignSystem} from './signage.js';
import {neonTube,sigil} from './neon.js';
import {gearClock} from './gear-materials.js';

export function makePrologueSet(pipeline,m,textures,gear){
 const scene=new T.Scene();scene.background=pipeline.fogColor;
 const camera=new T.PerspectiveCamera(55,1,.08,95),sets=new Map(),signs=[],actors=[],souls=[];
 const baseMaterials=new Set([...Object.values(m),...Object.values(gear)]),baseTextures=new Set([...Object.values(textures),pipeline.white]);
 for(const mat of baseMaterials)for(const u of Object.values(mat.uniforms||{}))if(u.value?.isTexture)baseTextures.add(u.value);
 const createdMaterials=new Set(),createdTextures=new Set();
 const ownMaterial=mat=>{createdMaterials.add(mat);return mat;};
 const stage=name=>{const root=new T.Group();root.name='opening-set-'+name;root.visible=false;scene.add(root);sets.set(name,root);return root;};
 const ground=(g,material,w=25,d=45)=>{const p=mesh(g,new T.PlaneGeometry(w,d),material,0,-.02,-5);p.rotation.x=-Math.PI/2;};
 const text=(root,lines,x,y,z,w=4,h=2,color='#9ef0d9')=>{
  const c=document.createElement('canvas');c.width=1024;c.height=512;const a=c.getContext('2d');a.fillStyle='#101923';a.fillRect(0,0,1024,512);a.strokeStyle=color;a.lineWidth=6;a.strokeRect(8,8,1008,496);a.fillStyle=color;a.font='bold 44px monospace';lines.forEach((line,i)=>a.fillText(line,42,87+i*76,940));const t=new T.CanvasTexture(c);t.magFilter=t.minFilter=T.NearestFilter;t.generateMipmaps=false;createdTextures.add(t);const mat=ownMaterial(pipeline.material(0xffffff,t,1,1));mat.side=T.DoubleSide;return mesh(root,new T.PlaneGeometry(w,h),mat,x,y,z);
 };
 const humanPalette={...m,coat:m.npcCoat,dark:m.npcDark,glove:m.npcGlove,skin:m.npcSkin,skinDeep:m.npcSkinDeep,skinPale:m.npcSkinPale,face:m.npcFace,faceDeep:m.npcFaceDeep,facePale:m.npcFacePale,metal:m.npcMetal,obsidian:m.npcObsidian,robe:m.npcRobe,leather:m.npcLeather,hair:m.npcHair,eye:m.npcEye};
 const character=(g,person,x,z,variant=0,ghost=false)=>{
  let palette=person==='courier'?{...humanPalette,coat:m.npcDark}:humanPalette;
  if(ghost){const h=ownMaterial(pipeline.material(0x63f3ff,undefined,1,1));h.wireframe=true;palette=Object.fromEntries(Object.keys(humanPalette).map(k=>[k,h]));}
  const rig=makeHuman(palette,variant);g.add(rig.g);rig.g.position.set(x,0,z);
  if(person==='courier'){const scarf=mesh(rig.torso,new T.TorusGeometry(.078,.025,4,9),m.npcRobe,0,1.49,0);scarf.rotation.x=Math.PI/2;plate(rig.torso,m.npcRobe,.075,.23,.024,-.04,1.35,.153);const strap=plate(rig.torso,m.npcGlove,.045,.44,.02,.03,1.2,.18);strap.rotation.z=-.48;plate(rig.torso,m.npcGlove,.34,.09,.05,0,1.43,.12);plate(rig.torso,m.neonPink,.1,.02,.01,.07,1.43,.152);}
  const mouth=plate(rig.head,ghost?m.neonCyan:m.black,.035,.005,.006,0,1.704,.145);
  actors.push({person,rig,root:g,mouth,ghost});return rig;
 };
 const floorMaterial=key=>ownMaterial(pipeline.material(0xb6bfca,textures[key],1,0,{groundRelief:{value:1}}));
 for(const [name,index]of [['city',0],['court',1],['market',2],['train',3],['roof',4]]){
  const root=stage(name),ss=createSignSystem(pipeline,root);signs.push(ss);
  const palette={...m,road:floorMaterial(index===1?'cathedral-floor':index===3?'terminal-floor':index===4?'roof-floor':'road')};
  buildLevel(index,root,palette,[],ss.sign);root.userData.fog=LEVELS[index].fog;
 }
 const city=sets.get('city');text(city,['SABLE CONTINUITY','YOUR AFTERLIFE','IS OUR BUSINESS.'],0,9,-20,13,6,'#feb293');
 character(city,'courier',1,11,1);
 // Separate rain volumes keep the other sets quiet; streaks never become a screen overlay.
 const rainPoints=[];for(let i=0;i<230;i++){const x=(i*13.37%42)-21,z=(i*7.93%60)-30,y=i*3.17%20;rainPoints.push(x,y,z,x-.03,y-.6,z);}
 const rainGeometry=new T.BufferGeometry();rainGeometry.setAttribute('position',new T.Float32BufferAttribute(rainPoints,3));const rainMaterial=ownMaterial(new T.LineBasicMaterial({color:0x86a1b7,transparent:true,opacity:.28})),rain=new T.LineSegments(rainGeometry,rainMaterial);city.add(rain);
 const court=sets.get('court');plate(court,m.obsidian,4,.5,3,0,.25,-29);const king=makeEnemy(m,'knight',1);court.add(king.g);king.g.position.set(0,.5,-29);king.g.scale.setScalar(1.6);actors.push({person:'regent',rig:king,root:court});
 const harvest=stage('harvest');harvest.userData.fog='#101d2c';ground(harvest,m.metal,20,24);plate(harvest,m.wall,20,9,1,0,4,-8);
 for(const side of [-1,1])plate(harvest,m.wall,.5,7,18,side*9,3.5,-2);
 for(const z of [3,-2,-6]){plate(harvest,m.metal,18,.22,.28,0,6.1,z);neonTube(harvest,m.neonCyan,[-7,5.95,z],[7,5.95,z],.025);}
 for(const side of [-1,1])for(let i=0;i<3;i++){
  const x=side*3.4,z=2-i*3.2;plate(harvest,m.metal,1.6,.2,1.6,x,.1,z);plate(harvest,m.metal,1.6,.2,1.6,x,2.6,z);
  for(const dx of [-.7,.7])for(const dz of [-.7,.7])neonTube(harvest,m.dark,[x+dx,.1,z+dz],[x+dx,2.6,z+dz],.035);
  const captive=character(harvest,'captive',x,z,i);captive.head.rotation.x=.16;neonTube(harvest,m.neonCyan,[x,2.5,z],[0,3.8,z-1.3],.023);
  const orb=mesh(harvest,new T.OctahedronGeometry(.16,0),m.neonCyan);souls.push({orb,start:new T.Vector3(x,2.1,z),end:new T.Vector3(0,3.5,-5),phase:i*.21+(side>0?.12:0)});
 }
 sigil(harvest,m.arcane,0,3.5,-6.8,2.2);text(harvest,['CONTINUITY / 24 HOUR','CONSCIOUSNESS: LEASED','SHIFT STATUS: ETERNAL'],0,6.3,-7.4,7,2.2,'#ffb2d2');
 const exchange=stage('exchange');exchange.userData.fog='#131723';ground(exchange,m.road,16,20);plate(exchange,m.wall,14,6,1,0,3,-4);
 for(const x of [-5,5]){plate(exchange,m.metal,1,3,.7,x,1.5,-2);for(let j=0;j<6;j++)plate(exchange,m.neonCyan,.5,.025,.02,x,.5+j*.4,-1.63);}
 plate(exchange,m.metal,3,.8,1,0,.4,-1);character(exchange,'courier',0,-1.9,1);
 text(exchange,['SABLE / DELIVERY 00009','COURIER: 09','ACCOUNT: DECEASED','SERVICE: STILL ACTIVE'],-.95,1.25,-.65,1.35,.68,'#efb18e');
 const vesper=character(exchange,'vesper',-2,-2.4,2,true);vesper.g.position.y=.1;const ring=mesh(exchange,new T.TorusGeometry(.7,.012,3,24),m.neonCyan,-2,.1,-2.4);ring.rotation.x=Math.PI/2;
 text(exchange,['VESPER / ENGINEERING','DATE OF DEATH: 2089','SOURCE: INSIDE THE WIRE'], -2,2.85,-3,2.6,.9,'#8ee9ff');
 const swordRig=makeSword(gear),sword=swordRig.userData.rig.tool;sword.removeFromParent();exchange.add(sword);sword.position.set(1.4,1.05,-1.7);sword.rotation.y=-.17;
 plate(exchange,m.obsidian,1,.45,1,1.4,.225,-1.7);sigil(exchange,m.arcane,1.4,1.3,-2.1,.75);text(exchange,['MOURNFANG','THE DEAD REMEMBER'],1.4,2.9,-3,2.6,.8,'#e398c5');
 const roof=sets.get('roof'),regent=makeEnemy(m,'knight',2);roof.add(regent.g);regent.g.position.set(0,0,-12);regent.g.scale.setScalar(1.4);actors.push({person:'regent',rig:regent,root:roof});
 for(const side of [-1,1]){const guard=makeEnemy(m,'riot',0);roof.add(guard.g);guard.g.position.set(side*2,0,-13.5);}
 text(roof,['RAINLINE / SOUL TRANSFER','MIDNIGHT COLLECTION','AUTHORITY: THE ASH REGENT'],0,5.1,-15,8,3,'#f5a4d0');
 let active='';
 return {scene,camera,set(name){if(active===name)return;active=name;for(const [n,r]of sets)r.visible=n===name;pipeline.fogColor.set(sets.get(name).userData.fog).convertLinearToSRGB();},
  animate(time,person,level=0,shotId=''){
   gearClock.value=time;for(const ss of signs)ss.update(time);
   const p=rainGeometry.attributes.position;for(let i=0;i<p.count;i+=2){const y=(rainPoints[i*3+1]-time*9)%20;p.setY(i,y<0?y+20:y);p.setY(i+1,(y<0?y+20:y)-.6);}p.needsUpdate=true;
   for(const a of actors){if(!a.root.visible)continue;const talk=a.person===person,wave=Math.min(1,level*9);a.rig.torso.rotation.z=Math.sin(time*1.4)*.008;a.rig.head.rotation.y=Math.sin(time*.6)*.08;
    if(a.mouth)a.mouth.scale.y=talk?1+wave*4:1;
    if(a.ghost)a.rig.g.position.y=.1+Math.sin(time*1.6)*.05;
    a.rig.arms.forEach((arm,i)=>{arm.rotation.x=talk?-.15-Math.sin(time*1.7+i)*.12:0;arm.rotation.z=0;});
    if(a.person==='courier'&&a.root===exchange){a.rig.head.rotation.y+=(shotId==='vesper'?-.5:shotId==='sword'?.45:0);a.rig.head.rotation.x=shotId==='receipt'?.12:0;if(shotId==='sword')a.rig.arms[1].rotation.z=.45;}

   }
   for(const o of souls){const t=(time*.13+o.phase)%1;o.orb.position.lerpVectors(o.start,o.end,t);o.orb.position.y+=Math.sin(t*Math.PI)*.45;o.orb.rotation.y=time*2;}
   const relic=swordRig.userData.relic;relic.ruby.rotation.y=time*.5;for(let i=0;i<relic.links.length;i++)relic.links[i].rotation.z=Math.sin(time*1.7+i*.4)*.1;
  },
  dispose(){
   const geos=new Set();scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material&&!baseMaterials.has(o.material))createdMaterials.add(o.material);});geos.forEach(g=>g.dispose());
   for(const mat of createdMaterials){for(const u of Object.values(mat.uniforms||{}))if(u.value?.isTexture&&!baseTextures.has(u.value))createdTextures.add(u.value);pipeline.materials.delete(mat);mat.dispose();}createdTextures.forEach(t=>t.dispose());for(const ss of signs)ss.reset();scene.clear();
  },get diagnostics(){return {sets:sets.size,actors:actors.length,soulTransfers:souls.length,activeSet:active};}
 };
}
