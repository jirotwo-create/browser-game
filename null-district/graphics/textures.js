import * as THREE from '../vendor/three.module.js';

// 128px environment paint studies; 64px character cloth and skin. Point-filtered throughout.
// Nearest-filtered paint; close pavement receives the pipeline's ground-only relief.
export function paintTexture(kind) {
 const size=['wall','windows','road','hazard','shutter','metal','rust','brick','ceramic','poster','drain','puddle'].includes(kind)?128:64;
 const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');x.scale(size/64,size/64);
 let seed=[...kind].reduce((n,a)=>Math.imul(n,31)+a.charCodeAt(0),743)>>>0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const base={wall:'#666a73',windows:'#424b59',road:'#2c3039',hazard:'#9a9167',coat:'#343a35',shutter:'#535e6b',circuit:'#263b31',metal:'#657182',rust:'#785444',skin:'#c2b49b',glove:'#3d3e36',blade:'#515953',leather:'#39372f'}[kind]||'#555b52';
 const rect=(color,a,b,w,h)=>{x.fillStyle=color;x.fillRect(a,b,w,h)};
 rect(base,0,0,64,64);
 // Large stains first, followed by grain and chipped edges: the low-resolution
 // result keeps tonal detail instead of the previous clean cartoon panels.
 for(let i=0;i<95;i++){const dark=random()>.3;rect(dark?'#09100c18':'#c8c6ae0d',random()*64,random()*64,3+random()*19,2+random()*12)}
 for(let i=0;i<1300;i++){const v=random()>.5?'#11171025':'#e0dcc823';rect(v,Math.floor(random()*64),Math.floor(random()*64),random()>.8?2:1,1)}
 const drip=(amount,color)=>{for(let i=0;i<amount;i++)rect(color,Math.floor(random()*64),random()*35,1+random()*3,6+random()*26)};
 const scratch=(amount,color)=>{for(let i=0;i<amount;i++){const a=random()*64,b=random()*64;rect(color,a,b,2+random()*10,1)}};
 if(kind==='brick'||kind==='ceramic'){
  rect(kind==='brick'?'#292a32':'#303b46',0,0,64,64);
  const h=kind==='brick'?10:16,w=kind==='brick'?25:16;
  for(let row=0;row<7;row++)for(let col=-1;col<5;col++){const a=col*w+(row%2)*w/2,b=row*h;rect(kind==='brick'?(row%2?'#6e5555':'#776462'):'#8c9ba5',a+1,b+1,w-2,h-2);rect('#c4b6a142',a+1,b+1,w-3,1);rect('#111c2d88',a+w-2,b+2,1,h-2);}
  drip(10,'#171b3480');scratch(35,'#d1d2c755');rect('#171b3066',0,50,64,14);
 }else if(kind==='poster'){
  rect('#292b3a',0,0,64,64);rect('#cabfa7',3,2,39,51);rect('#b63f76',4,3,37,13);rect('#28263b',7,8,28,3);
  x.fillStyle='#51465b';x.beginPath();x.moveTo(14,37);x.lineTo(22,20);x.lineTo(33,37);x.fill();rect('#d1c4a7',19,29,8,2);
  for(let i=0;i<4;i++)rect('#343744',7,41+i*3,20-i*3,1);
  rect('#4e7384',29,23,31,39);rect('#adbab5',32,26,25,5);rect('#202e40',34,35,18,17);rect('#d0be8a',37,40,12,2);
  for(let i=0;i<19;i++)rect('#172235a0',Math.floor(random()*64),Math.floor(random()*64),2+random()*7,1);
  rect('#a59e87',4,2,7,3);rect('#a59e87',51,57,9,3);
 }else if(kind==='drain'){
  rect('#18222d',0,0,64,64);rect('#879294',0,0,64,5);rect('#4d5b67',0,59,64,5);
  for(let i=0;i<8;i++){rect('#060e1b',6+i*7,7,4,49);rect('#7f8a8b',5+i*7,7,1,49);rect('#283744',9+i*7,8,1,47);}
  scratch(35,'#ab9e8160');
 }else if(kind==='puddle'){
  rect('#121e2a',0,0,64,64);for(let i=0;i<16;i++){const b=7+i*3;rect(i%2?'#284350':'#383547',random()*20,b,20+random()*40,1);}
  rect('#195261',12,24,31,1);rect('#5a2b4a',26,38,35,2);
 }else if(kind==='wall'){
  rect('#343c3280',0,0,64,7);rect('#a1a58b65',0,8,64,1);rect('#28322a55',0,59,64,5);
  drip(16,'#1d2a224d');scratch(28,'#b2b29840');
  for(const [a,b]of [[13,15],[48,39]]){rect('#283127',a,b,2,9);rect('#30382d',a+2,b+8,7,2);rect('#777260',a+5,b+10,1,12)}
  rect('#89907a',26,21,17,22);rect('#4d5547',28,24,13,2);rect('#4d5547',28,29,8,1);rect('#4a2422',28,34,12,4);rect('#4a4d3f',26,42,5,3);
  // Concrete casting seams, exposed aggregate and rebar bleed, rather than uniform noise.
  rect('#283444',2,0,1,64);rect('#9b9c98',3,0,1,64);rect('#323d4c',0,48,64,2);
  for(let i=0;i<7;i++){const a=6+i*8;rect('#a49e8d',a,49,3,1);rect('#8b5140',a,51,1,5+i%3);}
  for(const [a,b]of [[6,11],[51,23],[20,52]]){rect('#333c46',a,b,7,5);rect('#b3afa0',a,b,6,1);rect('#73787b',a+1,b+2,3,1);}

 }else if(kind==='road'){
  // Patched tarmac, not regular cobblestone or a fantasy tile grid.
  x.fillStyle='#1b2421';x.beginPath();x.moveTo(0,41);x.lineTo(17,36);x.lineTo(31,41);x.lineTo(64,32);x.lineTo(64,34);x.lineTo(31,43);x.lineTo(17,38);x.lineTo(0,43);x.fill();
  for(let i=0;i<10;i++){rect('#101d1a35',random()*64,random()*64,7+random()*18,2+random()*4)}
  rect('#171e19',42,5,15,9);for(let i=0;i<6;i++)rect('#727968',43+i*2,6,1,7);
  scratch(20,'#8c8b6d33');rect('#7c765647',1,50,15,2);
  rect('#1a2432',3,4,22,16);rect('#54606a',3,4,22,1);rect('#192532',3,19,22,1);
  x.strokeStyle='#6a6c6b';x.lineWidth=1;x.beginPath();x.moveTo(28,2);x.lineTo(32,14);x.lineTo(26,23);x.lineTo(33,28);x.stroke();
  for(let i=0;i<45;i++)rect(i%4?'#76808355':'#afb2a361',random()*64,random()*64,1,1);

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
 // Fine aggregate sits over the broad painted structure at the actual texture resolution.
 // This improves close surfaces without turning every pixel into uniform noise.
 if(size===128){x.setTransform(1,0,0,1,0,0);for(let i=0;i<900;i++){x.fillStyle=i%4?'#d3d4cb2d':'#07102155';x.fillRect(Math.floor(random()*128),Math.floor(random()*128),1,1);}
  if(kind==='road'){x.strokeStyle='#707b8645';x.lineWidth=1;for(let i=0;i<12;i++){const a=random()*128,b=random()*128;x.beginPath();x.moveTo(a,b);x.lineTo(a+4,b+1);x.lineTo(a+6,b+4);x.stroke();}}
 }
 const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=1;t.name=`grunge-${size}-${kind}`;return t;
}
export function makePalette(pipeline){
 // Only the pavement material opts into near-ground affine relief.
 pipeline.fogColor.set('#252b3b').convertLinearToSRGB();
 const textures=Object.fromEntries(['wall','windows','road','hazard','coat','shutter','circuit','metal','rust','skin','glove','blade','leather','brick','ceramic','poster','drain','puddle'].map(k=>[k,paintTexture(k)]));
 const m=(color,texture,unlit=0)=>pipeline.material(color,textures[texture],1,unlit,{groundRelief:{value:['road','drain','puddle'].includes(texture)?1:0}});
 return {textures,materials:{brick:m(0xc4b4b8,'brick'),ceramic:m(0xbccbd2,'ceramic'),poster:m(0xd5d2c3,'poster'),drain:m(0xabb9c8,'drain'),puddle:m(0x8ea4ba,'puddle'),neonCyan:m(0x21edff,undefined,1),neonPink:m(0xff298c,undefined,1),neonViolet:m(0x9d4dff,undefined,1),neonAmber:m(0xffa33d,undefined,1),neonGreen:m(0x69ffac,undefined,1),arcane:m(0xc04bff,undefined,1),stone:m(0x99958e,'wall'),bone:m(0xd0c7a0,'skin'),robe:m(0x6b3153,'coat'),beast:m(0x773c53,'leather'),wall:m(0xc3c6d2,'wall'),windows:m(0xb2b4a0,'windows'),road:m(0xaab8ca,'road'),metal:m(0xc0c9d5,'metal'),rust:m(0xc9b1a4,'rust'),hazard:m(0xb5ad81,'hazard'),coat:m(0xb2b7a2,'coat'),glove:m(0xafb29f,'glove'),shutter:m(0xb8bca4,'shutter'),circuit:m(0xa8b893,'circuit',1),dark:m(0x7e8575,'coat'),black:m(0x6d766a,'glove'),skin:m(0xd2c7ad,'skin'),skinDeep:m(0x9c8b71,'skin'),skinPale:m(0xe0d5bd,'skin'),eye:pipeline.material(0x9e9f8c),lip:pipeline.material(0x655344),hair:m(0x555b4e,'coat'),obsidian:m(0x777f73,'blade'),edge:m(0xa2a98f,'metal'),crimson:pipeline.material(0x771b15,undefined,1,1),leather:m(0x96977e,'leather'),pink:pipeline.material(0xb19b85,undefined,1,1),cyan:pipeline.material(0x8c9c81,undefined,1,1),acid:pipeline.material(0xbcb286,undefined,1,1),red:pipeline.material(0xa94b30,undefined,1,1)}};
}
