import * as T from '../vendor/three.module.js';

export const ADVERTS={
 market:{jp:'闇市',en:'NIGHT MARKET',offer:'24H',color:'#ff3b9b',background:'#19091d',icon:'eye'},
 memory:{jp:'記憶',en:'MEMORY BANK',offer:'¥980',color:'#33ffff',background:'#051c25',icon:'eye'},
 mods:{jp:'改造',en:'BODY MODS',offer:'24H',color:'#e6ff38',background:'#18200a',icon:'hand'},
 ramen:{jp:'夜食',en:'LATE BITES',offer:'¥380',color:'#ffb543',background:'#271009',icon:'bowl'},
 optics:{jp:'義眼',en:'CHROME OPTICS',offer:'NEW',color:'#f75aff',background:'#210c2c',icon:'eye'},
 power:{jp:'充電',en:'FULL CHARGE',offer:'¥100',color:'#56ffb2',background:'#061d17',icon:'bolt'},
 cyber:{jp:'電脳',en:'NEURAL LINK',offer:'ONLINE',color:'#25edff',background:'#07162a',icon:'eye'},
 launch:{jp:'新発売',en:'SYNTH / ZERO',offer:'¥500',color:'#ff6b47',background:'#261019',icon:'bolt'},
 train:{jp:'終電',en:'LAST TRAIN',offer:'03',color:'#ffcc55',background:'#211b0a',icon:'arrow'},
 exit:{jp:'出口',en:'EXIT',offer:'→',color:'#8cffa4',background:'#082219',icon:'arrow'},
 transfer:{jp:'乗換',en:'TRANSFER',offer:'02 →',color:'#3df2ff',background:'#081c28',icon:'arrow'},
 stopped:{jp:'運行停止',en:'SERVICE CLOSED',offer:'03',color:'#ff694b',background:'#260c10',icon:'arrow'},
 danger:{jp:'立入禁止',en:'KEEP OUT',offer:'×',color:'#ff555b',background:'#240b14',icon:'bolt'},
 broadcast:{jp:'中央放送',en:'RAINLINE TV',offer:'LIVE',color:'#ff52cb',background:'#230e2b',icon:'eye'},
 rain:{jp:'雨の街',en:'RAIN CITY',offer:'24H',color:'#4cf6ff',background:'#0b202c',icon:'eye'},
 signal:{jp:'信号',en:'TAKE CONTROL',offer:'ON AIR',color:'#eaff4d',background:'#1a210a',icon:'bolt'},
 arcade:{jp:'ネオン',en:'AFTER HOURS',offer:'OPEN',color:'#a68aff',background:'#130d28',icon:'bolt'}
};
export async function prepareSignFonts(){
 const face=new FontFace('DistrictJP',`url(${new URL('./fonts/DistrictJP.woff',import.meta.url).href})`,{weight:'700'});
 await face.load();document.fonts.add(face);
}
export function paintAdvert(ad,phase=0,ratio=2){
 const canvas=document.createElement('canvas'),portrait=ratio<1;canvas.width=portrait?256:Math.round(256*ratio);canvas.height=portrait?Math.round(256/ratio):256;const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 c.fillStyle=ad.background;c.fillRect(0,0,w,h);c.strokeStyle=ad.color;c.lineWidth=8;c.strokeRect(6,6,w-12,h-12);
 c.fillStyle=phase?ad.color:'#23303a';c.fillRect(18,18,w-36,8);c.fillRect(18,h-21,w-36,5);
 c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff5dd';
 if(portrait){
  // Real stacked Japanese typography on portrait panels; never stretch a
  // landscape texture into a tall board and deform the characters.
  const chars=[...ad.jp];
  if(chars.length===2){c.font='700 88px DistrictJP';chars.forEach((char,i)=>c.fillText(char,128,80+i*108));}
  else if(chars.length===3){c.font='700 68px DistrictJP';chars.forEach((char,i)=>c.fillText(char,128,59+i*73));}
  else{c.font='700 82px DistrictJP';chars.forEach((char,i)=>c.fillText(char,76+(i%2)*104,83+Math.floor(i/2)*100));}
  c.fillStyle=ad.color;c.font='700 22px DistrictJP';const size=Math.min(22,22*220/c.measureText(ad.en).width);c.font=`700 ${size}px DistrictJP`;c.fillText(ad.en,128,h-(h>400?104:78));
  c.fillStyle=phase?'#ffffff':ad.color;c.font='700 40px DistrictJP';c.fillText(ad.offer,128,h-34);return canvas;
 }
 const headlineSize=Math.min(ad.jp.length<=2?112:ad.jp.length===3?99:84,(w-48)/ad.jp.length);
 c.font=`700 ${headlineSize}px DistrictJP`;c.fillText(ad.jp,w/2,93);
 c.fillStyle=ad.color;c.font='700 38px DistrictJP';const englishSize=Math.min(38,38*(w-48)/c.measureText(ad.en).width);c.font=`700 ${englishSize}px DistrictJP`;c.fillText(ad.en,w/2,168);
 c.fillStyle=phase?'#ffffff':ad.color;c.font='700 43px DistrictJP';c.fillText(ad.offer,w/2,218);
 // Small authored pictograms occupy the margin, never replace the large copy.
 c.strokeStyle=ad.color;c.lineWidth=3;c.beginPath();
 if(ad.icon==='eye'){c.ellipse(51,213,23,12,0,0,Math.PI*2);c.stroke();c.beginPath();c.arc(51,213,phase?5:8,0,Math.PI*2);c.stroke();}
 if(ad.icon==='bowl'){c.arc(51,201,22,0,Math.PI);c.stroke();for(let i=0;i<3;i++){c.beginPath();c.moveTo(40+i*10,201);c.lineTo(46+i*10,181);c.stroke();}}
 if(ad.icon==='bolt'||ad.icon==='hand'){c.moveTo(57,185);c.lineTo(36,215);c.lineTo(51,212);c.lineTo(44,231);c.lineTo(67,200);c.lineTo(52,203);c.stroke();}
 if(ad.icon==='arrow'){c.moveTo(28,213);c.lineTo(74,213);c.lineTo(62,201);c.moveTo(74,213);c.lineTo(62,225);c.stroke();}
 return canvas;
}
function texture(canvas){const t=new T.CanvasTexture(canvas);t.magFilter=t.minFilter=T.NearestFilter;t.generateMipmaps=false;return t;}
export function createSignSystem(pipeline,root){
 const adverts=new Map(),ownedTextures=new Set();let panels=0,legacyPanels=0;
 const sign=(text,x,y,z,color,w=4,h=1.3,rotation=0)=>{
  let material;
  if(typeof text==='object'){
   const ad=typeof text.ad==='string'?ADVERTS[text.ad]:text.ad,key=JSON.stringify([ad,w/h]);
   let item=adverts.get(key);
   if(!item){const frames=[0,1].map(p=>texture(paintAdvert(ad,p,w/h)));frames.forEach(t=>ownedTextures.add(t));material=pipeline.material(0xffffff,frames[0],1,1);item={material,frames,ad,frame:0};adverts.set(key,item);}
   material=item.material;panels++;
  }else{
   const c=document.createElement('canvas');c.width=128;c.height=32;const ctx=c.getContext('2d');ctx.fillStyle='#33323e';ctx.fillRect(0,0,128,32);ctx.strokeStyle=color;ctx.strokeRect(1,1,126,30);ctx.fillStyle=color;ctx.font='700 14px DistrictJP';ctx.textAlign='center';ctx.fillText(text,64,22,118);const t=texture(c);ownedTextures.add(t);material=pipeline.material(0xffffff,t,1,1);legacyPanels++;
  }
  const mesh=new T.Mesh(new T.PlaneGeometry(w,h),material);mesh.position.set(x,y,z);mesh.rotation.y=rotation;root.add(mesh);return mesh;
 };
 return {sign,update(time){let i=0;for(const item of adverts.values()){const frame=Math.floor(time/1.6+i++*.19)%2;if(frame!==item.frame){item.frame=frame;item.material.uniforms.tex.value=item.frames[frame];}}},
  reset(){for(const t of ownedTextures)t.dispose();ownedTextures.clear();adverts.clear();panels=legacyPanels=0;},
  diagnostics(){return{animatedAdvertisements:panels,legacySigns:legacyPanels,advertCopy:[...adverts.values()].map(({ad,frame})=>({jp:ad.jp,en:ad.en,offer:ad.offer,frame})),signFontReady:document.fonts.check('700 48px DistrictJP')};}};
}
