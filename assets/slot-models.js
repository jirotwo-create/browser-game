import * as T from './vendor/three.module.js';
import {GEAR} from '../equipment.js';
import {mats,mesh,armor} from './models.js';
const box=(g,m,x,y,z,w,h,d)=>mesh(g,new T.BoxGeometry(w,h,d),m,x,y,z);
const orb=(g,m,x,y,z,r)=>mesh(g,new T.IcosahedronGeometry(r,0),m,x,y,z);
const cone=(g,m,x,y,z,r,h,rz=0)=>mesh(g,new T.ConeGeometry(r,h,4),m,x,y,z,0,0,rz);
const cache=new Map();
function surface(slot,tier){
 const key=slot+tier;if(cache.has(key))return cache.get(key);
 const c=document.createElement('canvas');c.width=c.height=32;const ctx=c.getContext('2d');
 const colors=['#40373b','#505563','#454456','#402d42','#252d3d'],base=new T.Color(colors[tier]).convertLinearToSRGB();
 for(let y=0;y<32;y++)for(let x=0;x<32;x++){const grain=((x*17+y*31+tier*13)%19)-9;ctx.fillStyle=`rgb(${Math.max(0,base.r*255+grain)},${Math.max(0,base.g*255+grain)},${Math.max(0,base.b*255+grain)})`;ctx.fillRect(x,y,1,1);}
 // Pixel-etched seams and a sharp rune, shared by inventory art and worn gear.
 ctx.fillStyle=tier>=3?'#af9462':'#83828c';ctx.fillRect(2,2,1,28);ctx.fillRect(29,2,1,28);ctx.fillRect(15,8,2,17);for(let i=0;i<9;i++){ctx.fillRect(8+i,10+i,2,1);ctx.fillRect(22-i,10+i,2,1);}
 const texture=new T.CanvasTexture(c);texture.magFilter=texture.minFilter=T.NearestFilter;texture.colorSpace=T.SRGBColorSpace;
 const material=new T.MeshStandardMaterial({map:texture,flatShading:true,roughness:slot==='accessory'?.95:.8,metalness:slot==='accessory'?0:.35});cache.set(key,material);return material;
}
export function slotModel(id){
 const item=GEAR.find(g=>g.id===id);if(!item)return new T.Group();const g=new T.Group();g.userData.asset=id;g.userData.slot=item.slot;
 const tier=item.cost?item.tier:0,plate=surface(item.slot,tier),trim=tier>=3?mats.gold:mats.iron;
 if(item.slot==='helmet'){
  const helm=orb(g,plate,0,0,0,.37);helm.scale.set(1,1.22,.86);box(g,mats.dark,0,.02,.3,.55,.13,.1);box(g,tier>=3?mats.eye:mats.cyan,0,.04,.365,.4,.025,.025);cone(g,plate,0,-.28,.1,.2,.35,Math.PI);
  for(const side of [-1,1]){cone(g,trim,side*.29,.38,-.08,.09,.48+Math.max(0,tier-1)*.1,-side*.4);box(g,trim,side*.22,-.12,.3,.035,.25,.04);}
 }else if(item.slot==='arms'){
  for(const side of [-1,1]){box(g,plate,side*.28,-.07,0,.31,.43,.2);for(let i=0;i<4;i++)box(g,plate,side*.28+(i-1.5)*.07,.24,.01,.054,.28,.11);box(g,trim,side*.28,-.31,0,.35,.07,.23);for(let i=0;i<tier;i++)cone(g,trim,side*.28+(i-(tier-1)/2)*.07,-.02,.16,.035,.16,Math.PI/2);}
 }else if(item.slot==='legs'){
  for(const side of [-1,1]){box(g,plate,side*.25,.12,0,.29,.78,.29);const knee=orb(g,trim,side*.25,.42,.07,.19);knee.scale.set(1,.7,.5);box(g,plate,side*.25,-.36,.17,.32,.23,.54);box(g,trim,side*.25,-.12,.17,.26,.035,.04);}
 }else if(item.slot==='accessory'){
  const shape=new T.Shape();[[-.47,.6],[.47,.6],[.67,-.96],[.3,-.86],[.13,-1.13],[-.12,-.91],[-.46,-1.08],[-.66,-.87]].forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();mesh(g,new T.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false}),plate);
  for(const side of [-1,1]){box(g,trim,side*.38,.49,.06,.035,.2,.04);orb(g,trim,side*.35,.57,.04,.07);}if(tier>=3)for(let i=0;i<5;i++)cone(g,mats.bone,(i-2)*.14,-.85,.04,.035,.18,Math.PI);
 }else if(item.slot==='testament'){
  box(g,plate,0,0,0,.72,.96,.17);box(g,mats.bone,.02,0,.095,.57,.83,.025);box(g,trim,-.32,0,0,.08,1,.2);for(let i=0;i<4;i++)box(g,mats.blood,0,.28-i*.14,.12,.36-(i%2)*.12,.024,.01);
  mesh(g,new T.TorusGeometry(.18,.026,3,12),tier>=3?mats.violet:mats.gold,0,-.16,.14);if(tier===4)for(const side of [-1,1])cone(g,mats.gold,side*.32,.56,0,.055,.24,-side*.25);
 }else if(item.slot==='chest'){
  const body=armor(id==='wraithplate'?'iron':id);body.traverse(o=>{if(o.isMesh&&o.material===mats.iron)o.material=plate;});for(const part of [...body.children])if(part.name==='cape'||Math.abs(part.position.x)>.4){body.remove(part);part.traverse(o=>{if(o.isMesh)o.geometry.dispose();});}g.add(body);
 }
 return g;
}
