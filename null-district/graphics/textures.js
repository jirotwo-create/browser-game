import * as THREE from '../vendor/three.module.js';

// Pixel-painted surfaces use a deliberately small, shared industrial palette.
const palette={ink:'#242636',shadow:'#414051',purple:'#62596c',stone:'#99918c',light:'#c2b5a0',rust:'#865d49',gold:'#bc8c52',yellow:'#dcc16b',teal:'#527c7b',cyan:'#95b9ab',red:'#ad5c59'};
export function paintTexture(kind) {
 const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
 const rect=(color,a,b,w,h)=>{x.fillStyle=palette[color]||color;x.fillRect(a,b,w,h)};
 rect(kind==='road'?'shadow':kind==='coat'?'teal':kind==='rust'?'rust':'stone',0,0,64,64);
 // No photo noise: broad brushy pixel clusters, seams and hand-placed wear.
 for(let i=0;i<90;i++){const a=(i*23+7)%64,b=(i*37+11)%64;rect(i%3?'#ffffff0b':'#15122216',a,b,2+i%4,1+i%2)}
 if(kind==='wall'){
  for(let j=0;j<4;j++){rect('shadow',0,j*16,64,1);for(let i=0;i<4;i++){const a=i*16+(j%2?8:0);rect('shadow',a,j*16,1,16);rect('light',a+2,j*16+2,12,1);rect('purple',a+2,j*16+13,11,2)}}
  rect('rust',39,1,3,26);rect('rust',9,33,2,14);rect('shadow',24,27,7,2);
 } else if(kind==='windows'){
  rect('purple',0,0,64,64);for(let j=0;j<2;j++)for(let i=0;i<3;i++){const a=i*21+3,b=j*32+3;rect('ink',a,b,16,25);rect('shadow',a+1,b+1,14,23);rect((i+j)%3?'teal':'yellow',a+2,b+3,11,17);rect('cyan',a+3,b+3,3,12);rect('ink',a+7,b+1,2,23);rect('ink',a+1,b+14,14,2);rect('light',a-1,b+26,18,2)}
 } else if(kind==='road'){
  for(let j=0;j<4;j++)for(let i=0;i<4;i++){const a=i*16+(j%2?8:0);rect('ink',a,j*16,16,1);rect('ink',a,j*16,1,16);rect('purple',a+2,j*16+2,12,1)}
  rect('stone',3,23,12,2);rect('ink',40,48,16,8);for(let i=0;i<6;i++)rect('purple',41+i*2,49,1,6);
 } else if(kind==='hazard'){
  rect('yellow',0,0,64,64);x.fillStyle=palette.ink;for(let i=-64;i<128;i+=24){x.beginPath();x.moveTo(i,0);x.lineTo(i+12,0);x.lineTo(i+76,64);x.lineTo(i+64,64);x.fill()}
  rect('stone',0,0,64,3);rect('shadow',0,59,64,5);for(const a of [4,57])for(const b of [5,54]){rect('ink',a,b,3,3);rect('light',a,b,2,1)}
 } else if(kind==='coat'){
  rect('shadow',0,0,5,64);rect('cyan',7,0,2,64);rect('ink',31,0,2,64);rect('shadow',39,17,19,26);rect('cyan',41,18,15,2);rect('ink',40,41,17,2);rect('gold',13,9,10,13);rect('yellow',15,11,6,3);rect('shadow',3,54,60,5);
 } else if(kind==='shutter'){
  rect('teal',0,0,64,64);for(let j=0;j<8;j++){rect('ink',0,j*8,64,2);rect('cyan',0,j*8+2,64,1)}rect('rust',8,10,4,36);rect('rust',49,20,3,31);
  rect('light',19,19,27,22);rect('red',21,21,23,4);rect('shadow',22,28,20,2);rect('shadow',22,33,15,2);
 } else if(kind==='circuit'){
  rect('ink',0,0,64,64);rect('teal',4,4,56,56);rect('ink',7,7,50,43);for(let j=0;j<6;j++){rect('cyan',10,j*6+11,14+(j*11)%29,2);rect('yellow',49,j*6+11,4,2)}rect('light',9,54,30,2);rect('red',48,54,6,3);
 } else {
  // Armor / machinery: painted plate borders, bolts, stamped numerals and chips.
  rect('shadow',0,0,64,4);rect('light',2,5,60,2);rect('shadow',0,58,64,6);rect('ink',30,0,3,64);rect('light',34,6,1,48);
  for(const a of [5,55])for(const b of [10,49]){rect('ink',a,b,4,4);rect('light',a,b,3,2)}
  rect('gold',8,20,18,23);rect('yellow',10,22,14,2);rect('ink',12,26,3,11);rect('ink',19,26,3,11);rect('ink',13,25,8,2);rect('ink',13,36,8,2);
  for(let i=0;i<10;i++)rect('light',(i*17)%60,8+(i*11)%45,3,1);
 }
 const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=1;t.name=`painted-64-${kind}`;return t;
}
export function makePalette(pipeline) {
 const textures=Object.fromEntries(['wall','windows','road','hazard','coat','shutter','circuit','metal','rust'].map(k=>[k,paintTexture(k)]));
 const m=(color,texture,unlit=0)=>pipeline.material(color,textures[texture],1,unlit);
 return {textures,materials:{wall:m(0xc2b2a0,'wall'),windows:m(0xc4b4aa,'windows'),road:m(0xafa5ae,'road'),metal:m(0xb9a9a1,'metal'),rust:m(0xbda58a,'rust'),hazard:m(0xc4b78f,'hazard'),coat:m(0xbac4bc,'coat'),shutter:m(0xa5b9ad,'shutter'),circuit:m(0xc8dfc1,'circuit',1),dark:pipeline.material(0x4c475b),black:pipeline.material(0x33323e),skin:pipeline.material(0xc99b7c),pink:pipeline.material(0xdc898f,undefined,1,1),cyan:pipeline.material(0x9dbeb1,undefined,1,1),acid:pipeline.material(0xe4ca81,undefined,1,1),red:pipeline.material(0xe77e65,undefined,1,1)}};
}
