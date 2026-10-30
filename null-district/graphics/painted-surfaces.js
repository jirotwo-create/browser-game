import * as T from '../vendor/three.module.js';
// Authored, palette-limited paint: broad panel shadows first, chips and marks last.
// Sharp point filtering supplies PSX texels without lowering the gear silhouette resolution.
export function paintGearTexture(kind){
 const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');let seed=1997;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const rect=(color,a,b,w,h)=>{x.fillStyle=color;x.fillRect(a,b,w,h);};
 const bases={steel:'#8997a8',frame:'#27303e',coat:'#575667',glove:'#535862',skin:'#d6b298',trousers:'#625566',boot:'#474b54'};
 rect(bases[kind]||bases.steel,0,0,64,64);
 if(kind==='serial'){
  rect('#c2c7bb',0,0,64,64);rect('#253144',2,2,60,60);rect('#c2c7bb',4,4,56,56);
  x.fillStyle='#253144';x.font='bold 18px monospace';x.fillText('K-13',6,25);x.font='bold 9px monospace';x.fillText('IRON',7,40);x.fillText('WITNESS',7,52);
 }else if(kind==='steel'||kind==='frame'){
  rect('#151f33',0,0,64,8);rect('#d4dbe2',0,8,64,2);rect('#45566d',0,11,64,7);rect('#a9b8c7',0,18,64,2);
  rect('#222a3d',0,48,64,16);rect('#c6d0da',0,46,64,2);
  for(let i=0;i<5;i++){rect('#26374b',5+i*12,23,3,19);rect('#c0cad3',8+i*12,23,1,16);}
  for(const a of [3,55])for(const b of [3,53]){rect('#101823',a,b,5,5);rect('#c7cbd2',a,b,4,1);rect('#5f6f84',a+2,b+1,1,3);}
  rect('#d3c8a0',23,30,27,10);rect('#273242',25,32,23,2);rect('#273242',25,36,12,2);
  rect('#bd407f',3,38,13,5);rect('#e5aac5',3,38,13,1);
  for(let i=0;i<42;i++){const a=Math.floor(rand()*64),b=Math.floor(rand()*64);rect(i%3?'#e1e1d1':'#20283b',a,b,1+Math.floor(rand()*4),1);}
  if(kind==='frame'){x.fillStyle='#131a3190';x.fillRect(0,0,64,64);}
 }else if(kind==='coat'||kind==='trousers'){
  rect('#272d40',0,0,8,64);rect('#9a9b9e',8,0,1,64);rect('#303044',42,0,6,64);
  rect('#85838d',48,0,1,64);rect('#272d3c',16,22,22,27);rect('#a5a0a0',16,21,22,1);rect('#303548',20,25,13,20);
  for(let i=0;i<16;i++){rect('#bbb4a2',10,i*4,2,1);rect('#bbb4a2',50,i*4,2,1);}
  x.fillStyle='#98919a';x.beginPath();x.moveTo(12,3);x.lineTo(36,14);x.lineTo(27,16);x.fill();
  x.fillStyle='#252736';x.beginPath();x.moveTo(32,43);x.lineTo(60,55);x.lineTo(47,53);x.fill();
  rect('#b3b1aa',18,5,21,10);rect('#373746',20,7,17,2);rect('#992b5e',20,11,10,2);
 }else if(kind==='glove'||kind==='boot'){
  rect('#232a39',0,0,8,64);rect('#93949a',9,0,1,64);
  for(let i=0;i<4;i++){rect('#252d3c',15+i*11,8,8,19);rect('#9a9b99',15+i*11,8,8,2);rect('#727781',15+i*11,11,2,12);}
  rect('#242936',14,35,42,20);rect('#7f8487',16,36,38,2);rect('#8c3c60',18,44,17,5);
  for(let i=0;i<12;i++){rect('#a8a99b',16+i*3,57,1,2);}
 }else{
  // Painted knuckle highlights, dirt in creases and small healed abrasions.
  rect('#937160',0,0,6,64);rect('#ead0aa',11,0,5,64);rect('#aa806a',29,0,2,64);
  for(const y of [12,29,47]){rect('#896557',3,y,38,2);rect('#e0b996',3,y+2,33,2);}
  rect('#985b5a',42,20,2,13);rect('#e0bfaa',44,20,1,13);
 }
 for(let i=0;i<180;i++)rect(i%3?'#090e1a18':'#e5dfd217',Math.floor(rand()*64),Math.floor(rand()*64),1,1);
 const t=new T.CanvasTexture(c);t.magFilter=t.minFilter=T.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=T.RepeatWrapping;t.name='painted-psx-'+kind;return t;
}
