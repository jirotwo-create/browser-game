import * as THREE from '../vendor/three.module.js';

// 64px scans / paint studies: soot, concrete, oily gunmetal and worn fabric.
// Nearest-filtered paint; close pavement receives the pipeline's ground-only relief.
export function paintTexture(kind) {
 const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
 let seed=[...kind].reduce((n,a)=>Math.imul(n,31)+a.charCodeAt(0),743)>>>0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const base={wall:'#71766d',windows:'#444b45',road:'#373d38',hazard:'#9a9167',coat:'#343a35',shutter:'#565e55',circuit:'#263b31',metal:'#626b62',rust:'#5b5b4e',skin:'#c2b49b',glove:'#3d3e36',blade:'#515953',leather:'#39372f'}[kind]||'#555b52';
 const rect=(color,a,b,w,h)=>{x.fillStyle=color;x.fillRect(a,b,w,h)};
 rect(base,0,0,64,64);
 // Large stains first, followed by grain and chipped edges: the low-resolution
 // result keeps tonal detail instead of the previous clean cartoon panels.
 for(let i=0;i<95;i++){const dark=random()>.3;rect(dark?'#09100c18':'#c8c6ae0d',random()*64,random()*64,3+random()*19,2+random()*12)}
 for(let i=0;i<1300;i++){const v=random()>.5?'#11171025':'#e0dcc823';rect(v,Math.floor(random()*64),Math.floor(random()*64),random()>.8?2:1,1)}
 const drip=(amount,color)=>{for(let i=0;i<amount;i++)rect(color,Math.floor(random()*64),random()*35,1+random()*3,6+random()*26)};
 const scratch=(amount,color)=>{for(let i=0;i<amount;i++){const a=random()*64,b=random()*64;rect(color,a,b,2+random()*10,1)}};
 if(kind==='wall'){
  rect('#343c3280',0,0,64,7);rect('#a1a58b65',0,8,64,1);rect('#28322a55',0,59,64,5);
  drip(16,'#1d2a224d');scratch(28,'#b2b29840');
  for(const [a,b]of [[13,15],[48,39]]){rect('#283127',a,b,2,9);rect('#30382d',a+2,b+8,7,2);rect('#777260',a+5,b+10,1,12)}
  rect('#89907a',26,21,17,22);rect('#4d5547',28,24,13,2);rect('#4d5547',28,29,8,1);rect('#4a2422',28,34,12,4);rect('#4a4d3f',26,42,5,3);
 }else if(kind==='road'){
  // Patched tarmac, not regular cobblestone or a fantasy tile grid.
  x.fillStyle='#1b2421';x.beginPath();x.moveTo(0,41);x.lineTo(17,36);x.lineTo(31,41);x.lineTo(64,32);x.lineTo(64,34);x.lineTo(31,43);x.lineTo(17,38);x.lineTo(0,43);x.fill();
  for(let i=0;i<10;i++){rect('#101d1a35',random()*64,random()*64,7+random()*18,2+random()*4)}
  rect('#171e19',42,5,15,9);for(let i=0;i<6;i++)rect('#727968',43+i*2,6,1,7);
  scratch(20,'#8c8b6d33');rect('#7c765647',1,50,15,2);
 }else if(kind==='windows'){
  for(let j=0;j<2;j++)for(let i=0;i<3;i++){const a=i*21+3,b=j*32+3;rect('#202a23',a-1,b-1,17,26);rect('#111c18',a,b,14,22);rect((i+j)%3?'#283b30':'#a7a17a',a+1,b+1,12,18);rect('#89947850',a+2,b+1,2,14);rect('#383f32',a+6,b,2,22);rect('#3d4435',a,b+11,14,2);rect('#80816b',a-2,b+24,19,2)}
  drip(25,'#17261b75');
 }else if(kind==='hazard'){
  x.fillStyle='#262d26';for(let i=-64;i<128;i+=26){x.beginPath();x.moveTo(i,0);x.lineTo(i+12,0);x.lineTo(i+76,64);x.lineTo(i+64,64);x.fill()}
  for(let i=0;i<240;i++)rect(random()>.5?'#3f4138':'#6b6c54',random()*64,random()*64,1+random()*4,1+random()*2);
  rect('#3b4137',0,0,64,4);rect('#232e24',0,59,64,5);drip(10,'#1b261d65');
 }else if(kind==='coat'||kind==='glove'||kind==='leather'){
  rect('#151f1a88',0,0,4,64);rect('#7e81623f',5,0,1,64);rect('#111d164f',29,0,3,64);
  for(let i=0;i<14;i++){rect('#9c9a752d',6,i*5,2,1);rect('#aaa17c17',35+i%3,i*5,12,1)}
  rect('#202b2180',38,19,19,22);rect('#86846a39',39,18,17,1);scratch(65,'#97967a1f');drip(6,'#101b1555');
 }else if(kind==='shutter'){
  for(let j=0;j<8;j++){rect('#1c291f',0,j*8,64,2);rect('#8b927849',0,j*8+2,64,1)}
  drip(20,'#1a2a1e80');rect('#959482',21,17,24,24);rect('#4a2320',23,19,20,4);rect('#323c2b',24,26,16,2);rect('#323c2b',24,31,13,1);rect('#505945',21,39,8,3);rect('#505945',41,17,4,5);scratch(25,'#b1ad8a40');
 }else if(kind==='circuit'){
  rect('#101e16',4,4,56,48);for(let j=0;j<7;j++){rect('#738b65',8,j*6+8,10+(j*11)%34,1);rect('#a8a37c',48,j*6+8,3,1)}rect('#3e4f38',6,55,33,2);rect('#7e3325',49,55,5,2);drip(10,'#07170c6e');
 }else if(kind==='skin'){
  // Desaturated flesh with stubble, dirt and small scars; no flat peach blocks.
  for(let i=0;i<160;i++)rect('#503f2e20',random()*64,random()*64,1,1);
  rect('#62513a30',0,42,64,22);scratch(15,'#dcc5a11c');drip(3,'#62503c24');
 }else{
  rect('#19271d88',0,0,64,4);rect('#a4aa8b67',1,4,62,1);rect('#19261b80',0,59,64,5);rect('#2836269a',31,0,2,64);rect('#999c7e4a',34,5,1,48);
  for(const a of [5,55])for(const b of [10,49]){rect('#18251a',a,b,3,3);rect('#8b9175',a,b,2,1)}
  for(let i=0;i<70;i++){const a=random()*64,b=random()*64;rect(kind==='blade'?'#49312880':'#613d2780',a,b,1+random()*4,1+random()*3)}
  scratch(80,kind==='blade'?'#c5c3aa72':'#c1bea14f');drip(16,'#14231958');
  if(kind==='blade'){rect('#1b2520',24,0,5,64);rect('#9b9d8170',45,0,1,64);scratch(20,'#3d141687')}
 }
 const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=1;t.name=`grunge-64-${kind}`;return t;
}
export function makePalette(pipeline){
 // Only the pavement material opts into near-ground affine relief.
 pipeline.fogColor.set('#252b3b').convertLinearToSRGB();
 const textures=Object.fromEntries(['wall','windows','road','hazard','coat','shutter','circuit','metal','rust','skin','glove','blade','leather'].map(k=>[k,paintTexture(k)]));
 const m=(color,texture,unlit=0)=>pipeline.material(color,textures[texture],1,unlit,{groundRelief:{value:texture==='road'?1:0}});
 return {textures,materials:{neonCyan:m(0x21edff,undefined,1),neonPink:m(0xff298c,undefined,1),neonViolet:m(0x9d4dff,undefined,1),neonAmber:m(0xffa33d,undefined,1),neonGreen:m(0x69ffac,undefined,1),arcane:m(0xc04bff,undefined,1),stone:m(0x99958e,'wall'),bone:m(0xd0c7a0,'skin'),robe:m(0x6b3153,'coat'),beast:m(0x773c53,'leather'),wall:m(0xc8c9b7,'wall'),windows:m(0xb2b4a0,'windows'),road:m(0xc0c3af,'road'),metal:m(0xc3c4ad,'metal'),rust:m(0xb6a88b,'rust'),hazard:m(0xb5ad81,'hazard'),coat:m(0xb2b7a2,'coat'),glove:m(0xafb29f,'glove'),shutter:m(0xb8bca4,'shutter'),circuit:m(0xa8b893,'circuit',1),dark:m(0x7e8575,'coat'),black:m(0x6d766a,'glove'),skin:m(0xd2c7ad,'skin'),skinDeep:m(0x9c8b71,'skin'),skinPale:m(0xe0d5bd,'skin'),eye:pipeline.material(0x9e9f8c),lip:pipeline.material(0x655344),hair:m(0x555b4e,'coat'),obsidian:m(0x777f73,'blade'),edge:m(0xa2a98f,'metal'),crimson:pipeline.material(0x771b15,undefined,1,1),leather:m(0x96977e,'leather'),pink:pipeline.material(0xb19b85,undefined,1,1),cyan:pipeline.material(0x8c9c81,undefined,1,1),acid:pipeline.material(0xbcb286,undefined,1,1),red:pipeline.material(0xa94b30,undefined,1,1)}};
}
