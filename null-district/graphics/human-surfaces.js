import * as T from '../vendor/three.module.js';
export function paintHumanSurface(kind){
 const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),rect=(color,a,b,w,h)=>{x.fillStyle=color;x.fillRect(a,b,w,h);};
 if(kind==='face'){
  rect('#cbb6a1',0,0,128,128);
  x.fillStyle='#a28d7e';for(const p of [[[0,0],[23,0],[17,62],[27,100],[0,128]],[[128,0],[108,0],[114,61],[102,103],[128,128]]]){x.beginPath();p.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath();x.fill();}
  rect('#dcd0b7',39,10,52,18);rect('#b2a08d',45,33,40,5);
  for(const a of [43,85]){rect('#72675f',a-10,40,22,3);rect('#62595a',a-7,46,16,4);rect('#b4a18b',a-9,52,20,3);rect('#ddd1b9',a-5,47,10,1);}
  x.fillStyle='#dfc8ac';x.beginPath();x.moveTo(61,46);x.lineTo(73,76);x.lineTo(58,80);x.fill();rect('#8e776b',57,80,19,3);
  rect('#947567',48,100,34,3);rect('#d0ae98',51,104,28,2);rect('#e0cab0',49,114,30,3);
  rect('#8b6360',99,53,2,20);rect('#dcc2ad',101,53,1,20);
 }else if(kind==='skin'){
  rect('#cdb8a2',0,0,128,128);rect('#a38d7b',0,0,14,128);rect('#dfcbb2',23,0,12,128);
  for(const b of [30,64,99]){rect('#ac9580',20,b,60,2);rect('#dcc2a6',22,b+2,54,1);}
 }else if(kind==='armor'){
  rect('#677583',0,0,128,128);rect('#a3b1bb',2,4,124,3);rect('#283745',0,104,128,24);
  for(const a of [6,113])for(const b of [12,92]){rect('#26323f',a,b,8,8);rect('#b4bdc0',a,b,6,2);}
  rect('#314352',18,20,92,2);rect('#8a99a3',18,23,92,1);rect('#9da8ab',14,100,102,2);
  rect('#bdbca9',39,46,49,22);rect('#3a4652',44,50,38,3);rect('#3a4652',44,57,24,2);rect('#98365e',44,62,19,2);
 }else{
  rect(kind==='robe'?'#756579':'#697484',0,0,128,128);rect('#36424f',0,0,13,128);rect('#9d9e99',14,0,2,128);rect('#414c5c',87,0,10,128);
  x.fillStyle='#454d5e';x.beginPath();x.moveTo(29,0);x.lineTo(58,38);x.lineTo(45,81);x.lineTo(57,128);x.lineTo(34,128);x.lineTo(36,80);x.lineTo(44,39);x.fill();
  rect('#a6a8a4',27,47,45,2);rect('#333f4f',27,49,46,36);rect('#5a6573',30,53,39,27);
  for(let b=5;b<125;b+=8){rect('#bab8a8',17,b,3,1);rect('#b0aea3',101,b,3,1);}
  rect('#b3b7b3',25,12,48,16);rect('#4b5665',30,16,38,3);rect('#9b3e68',30,22,20,2);
 }
 const t=new T.CanvasTexture(c);t.magFilter=t.minFilter=T.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=T.RepeatWrapping;t.name='refined-human-'+kind;return t;
}
