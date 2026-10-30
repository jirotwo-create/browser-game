import * as T from '../vendor/three.module.js';
import {weatherSurface,photographicWear} from './material-studies.js';
import {gearSurface} from './gear-materials.js';
// Shared distressed gunmetal for both firearms: oily recesses, oxidized paint
// and sparse worn edges, with the pistol retaining its violet sight.
function paintGunmetal(){
 const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.scale(4,4);x.fillStyle='#69727a';x.fillRect(0,0,64,64);
 let seed=1999;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const rect=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
 // Swept stains and irregular chips are painted into the steel, not added as spikes.
 for(let j=0;j<28;j++){
  const a=rand()*64,b=rand()*64;x.strokeStyle=j%3?'#a2afb6':'#18232b';x.lineWidth=j%3?1.5:1.1;x.beginPath();
  x.moveTo(a,b);x.lineTo(a+4,b-3);x.lineTo(a+9,b-2);x.lineTo(a+12,b-7);x.lineTo(a+18,b-6);x.stroke();
  if(j%2)rect('#314451',a+3,b+1,4,1);
 }
 for(let i=0;i<75;i++){const a=Math.floor(rand()*64),b=Math.floor(rand()*64);rect(i%4?'#8797a2':'#10273a',a,b,1+Math.floor(rand()*4),1);}
 // Stable light/dark panel seams give the tiny texture the reference's hard contrast.
 rect('#1e3448',0,0,64,3);rect('#b5bcb6',0,3,64,1);rect('#57748b',0,58,64,2);rect('#919d9f',0,60,64,2);
 for(const a of [1,29,61]){rect('#294255',a,7,1,46);rect('#adb7b5',a+1,8,1,44);}
 x.setTransform(1,0,0,1,0,0);weatherSurface(c,'weathered-gunmetal',{strength:1.2});photographicWear(c,'metal',.24);
 const t=new T.CanvasTexture(c);t.magFilter=t.minFilter=T.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=T.RepeatWrapping;t.name='weathered-firearm-256';return t;
}
export function pistolSurfaces(){
 const chrome=gearSurface(0x8795a3,{metallic:.28,polish:.24,texture:paintGunmetal()});chrome.name='weathered-firearm-gunmetal';
 return {chrome,edge:gearSurface(0x8d9ca7,{metallic:.35,polish:.35}),dark:gearSurface(0x10212e,{metallic:.15}),barrel:gearSurface(0x2b4257,{metallic:.25,polish:.3}),violet:gearSurface(0x9b29d1,{emission:1}),bore:gearSurface(0x02060a),grip:gearSurface(0x11181e)};
}
// Coherent receiver paint in assembled tool coordinates, with no per-triangle atlas.
export function projectFirearmPaint(root,material){
 root.updateMatrixWorld(true);const inv=root.matrixWorld.clone().invert();root.traverse(o=>{if(!o.isMesh||o.material!==material)return;const g=o.geometry,p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;if(!u)return;const transform=inv.clone().multiply(o.matrixWorld),normal=new T.Matrix3().getNormalMatrix(transform);for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(transform),a=new T.Vector3().fromBufferAttribute(n,i).applyMatrix3(normal);if(Math.abs(a.z)>.7)u.setXY(i,v.x/.16+.5,(v.y-.04)/.22);else if(Math.abs(a.y)>.7)u.setXY(i,(v.z+.6)/.75,v.x/.16+.5);else u.setXY(i,(v.z+.6)/.75,(v.y-.04)/.22);}u.needsUpdate=true;});
}
