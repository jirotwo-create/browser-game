import * as T from '../vendor/three.module.js';
import {gearSurface} from './gear-materials.js';
// Dedicated weapon paint. The reference's dominant reading is cold white steel
// broken by dark ink-like scratches, with a single block of violet on the sight.
function paintChrome(){
 const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.scale(4,4);x.fillStyle='#b5c4d0';x.fillRect(0,0,64,64);
 let seed=1999;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const rect=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
 // Swept stains and irregular chips are painted into the steel, not added as spikes.
 for(let j=0;j<28;j++){
  const a=rand()*64,b=rand()*64;x.strokeStyle=j%3?'#effbff':'#1b3045';x.lineWidth=j%3?1.5:1.1;x.beginPath();
  x.moveTo(a,b);x.lineTo(a+4,b-3);x.lineTo(a+9,b-2);x.lineTo(a+12,b-7);x.lineTo(a+18,b-6);x.stroke();
  if(j%2)rect('#436783',a+3,b+1,4,1);
 }
 for(let i=0;i<75;i++){const a=Math.floor(rand()*64),b=Math.floor(rand()*64);rect(i%4?'#f3fbff':'#10273a',a,b,1+Math.floor(rand()*4),1);}
 // Stable light/dark panel seams give the tiny texture the reference's hard contrast.
 rect('#1e3448',0,0,64,3);rect('#f4ffff',0,3,64,1);rect('#57748b',0,58,64,2);rect('#e6faff',0,60,64,2);
 for(const a of [1,29,61]){rect('#294255',a,7,1,46);rect('#f4feff',a+1,8,1,44);}
 const t=new T.CanvasTexture(c);t.magFilter=t.minFilter=T.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=T.RepeatWrapping;t.name='K13-cold-chrome-256';return t;
}
export function pistolSurfaces(){
 const chrome=gearSurface(0xe6f1ff,{metallic:.12,polish:.5,texture:paintChrome()});chrome.name='K13-reference-cold-silver';
 return {chrome,edge:gearSurface(0xe8faff,{metallic:.12,polish:.7}),dark:gearSurface(0x10212e,{metallic:.15}),barrel:gearSurface(0x2b4257,{metallic:.25,polish:.3}),violet:gearSurface(0x9b29d1,{emission:1}),bore:gearSurface(0x02060a),grip:gearSurface(0x11181e)};
}
