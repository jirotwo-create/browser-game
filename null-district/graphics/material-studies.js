// Offline high-resolution material studies. Smooth, correlated wear fields supply
// substance; scratches, cracks and seams carry sharp detail, rather than film grain.
const studies=new Map();
// Load the original generated scan atlas once, before any palette can be built.
const atlas=new Image();atlas.src=new URL('./materials/noir-atlas.png',import.meta.url).href;
await atlas.decode();
const photoKinds={'cathedral-floor':[0,0],'terminal-floor':[0,0],'roof-floor':[1,1],wall:[0,0],stone:[0,0],ceramic:[0,0],metal:[1,0],rust:[1,0],blade:[1,0],shutter:[1,0],drain:[1,0],brick:[0,1],road:[1,1]};
export const materialSource={name:'original noir material atlas',width:atlas.naturalWidth,height:atlas.naturalHeight,worldSize:512,characterSize:256};
export function photographicWear(canvas,kind,opacity=.35){
 const tile=photoKinds[kind];if(!tile)return;const x=canvas.getContext('2d'),s=atlas.naturalWidth/2;
 x.save();x.globalAlpha=opacity;x.globalCompositeOperation='multiply';x.drawImage(atlas,tile[0]*s,tile[1]*s,s,s,0,0,canvas.width,canvas.height);x.restore();
}
function settleTileEdges(c){
 const x=c.getContext('2d'),w=c.width,d=x.getImageData(0,0,w,w),a=d.data;
 // Only blend a narrow border, leaving the material detail in the tile intact.
 for(let y=0;y<w;y++)for(let k=0;k<12;k++)for(let ch=0;ch<3;ch++){const l=(y*w+k)*4+ch,r=(y*w+w-1-k)*4+ch,v=(a[l]+a[r])/2,t=(1-k/12)*.9;a[l]=a[l]*(1-t)+v*t;a[r]=a[r]*(1-t)+v*t;}
 for(let z=0;z<w;z++)for(let k=0;k<12;k++)for(let ch=0;ch<3;ch++){const l=(k*w+z)*4+ch,r=((w-1-k)*w+z)*4+ch,v=(a[l]+a[r])/2,t=(1-k/12)*.9;a[l]=a[l]*(1-t)+v*t;a[r]=a[r]*(1-t)+v*t;}
 x.putImageData(d,0,0);
}
const profiles={
 'cathedral-floor':[68,68,72],'terminal-floor':[87,89,85],'roof-floor':[49,54,59],
 wall:[101,103,98],stone:[105,103,96],brick:[105,79,70],ceramic:[151,157,145],road:[54,58,62],windows:[37,46,49],
 metal:[102,112,108],rust:[112,76,57],hazard:[170,155,83],shutter:[95,106,106],circuit:[31,51,43],poster:[153,143,121],drain:[65,76,77],puddle:[28,43,50],
 coat:[64,70,66],glove:[49,52,51],leather:[62,46,42],blade:[76,84,84],skin:[180,154,132],bone:[170,162,142],flesh:[114,66,72]
};
function randomFor(kind){let seed=Array.from(kind).reduce((n,c)=>Math.imul(n,31)+c.charCodeAt(0),1997)>>>0;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
// Periodic interpolated value fields: no hard tile border and no full-screen speckle.
function field(size,cells,rand){const grid=Float32Array.from({length:cells*cells},rand),out=new Float32Array(size*size);for(let y=0;y<size;y++){const v=y/size*cells,j=Math.floor(v),b=v-j,t=b*b*(3-2*b);for(let x=0;x<size;x++){const u=x/size*cells,i=Math.floor(u),a=u-i,s=a*a*(3-2*a),p=grid[j*cells+i],q=grid[j*cells+(i+1)%cells],r=grid[((j+1)%cells)*cells+i],z=grid[((j+1)%cells)*cells+(i+1)%cells];out[y*size+x]=(p+(q-p)*s)*(1-t)+(r+(z-r)*s)*t;}}return out;}
export function weatherSurface(canvas,kind,{strength=1,road=false}={}){
 const size=canvas.width,ctx=canvas.getContext('2d'),rand=randomFor(kind),broad=field(size,8,rand),medium=field(size,32,rand),fine=field(size,128,rand),im=ctx.getImageData(0,0,size,size),d=im.data;
 const fabric=/cloth|coat|robe|trousers|glove|boot|leather/.test(kind),metal=/steel|armor|metal|frame|blade|rust|shutter|drain/.test(kind),flesh=/skin|face|flesh|bone/.test(kind);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const p=y*size+x,i=p*4,w=broad[p],m=medium[p],f=fine[p];
  const dirt=Math.max(0,.47-w)*(road?24:metal?68:48)*strength,relief=(m-.5)*(road?5:15)*strength;
  const detail=(f-.5)*(road?2:flesh?6:metal?10:7)*strength;
  const weave=fabric?((x%4===0?-1.8:0)+(y%4===0?1.1:0))*strength:0;
  const oxide=metal?Math.max(0,.39-w)*90*strength:0;
  const pore=flesh&&f<.26?2.5*strength:0;
  const slope=(fine[p]-fine[y*size+(x+1)%size])*(road?3:metal?20:10)*strength;
  for(let k=0;k<3;k++)d[i+k]=Math.max(0,Math.min(255,d[i+k]-dirt+relief+detail+weave+slope-pore+(k===0?oxide*.65:k===1?-oxide*.22:-oxide*.7)));
 }
 ctx.putImageData(im,0,0);return canvas;
}
export function materialStudy(kind,size=512){
 const key=kind+size;if(studies.has(key))return studies.get(key);
 const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d'),r=randomFor(kind),base=profiles[kind]||profiles.metal,S=size/512;
 x.fillStyle=`rgb(${base.join(',')})`;x.fillRect(0,0,size,size);
 const ground=['road','cathedral-floor','terminal-floor','roof-floor'].includes(kind),photo=photoKinds[kind];if(photo){const half=atlas.naturalWidth/2;x.drawImage(atlas,photo[0]*half,photo[1]*half,half,half,0,0,size,size);
  if(ground){const im=x.getImageData(0,0,size,size);for(let i=0;i<im.data.length;i+=4)for(let k=0;k<3;k++)im.data[i+k]=base[k]+(im.data[i+k]-(kind==='road'||kind==='roof-floor'?64:110))*(kind==='road'?.22:.3);x.putImageData(im,0,0);}
  else if(kind==='ceramic'){x.fillStyle='#b8bda28c';x.fillRect(0,0,size,size);}
  else if(kind==='rust'){x.fillStyle='#ad603927';x.fillRect(0,0,size,size);}
 }else weatherSurface(c,kind,{road:kind==='road'});
 x.scale(S,S);
 const rect=(color,a,b,w,h)=>{x.fillStyle=color;x.fillRect(a,b,w,h);};
 const line=(points,color,width=1)=>{x.strokeStyle=color;x.lineWidth=width;x.beginPath();points.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.stroke();};
 const crack=(a,b,length,vertical=false)=>{const p=[[a,b]];for(let j=1;j<=9;j++)p.push([a+(vertical?(r()-.5)*12:j*length/9),b+(vertical?j*length/9:(r()-.5)*12)]);line(p,'#c4bca32b',3);line(p,'#14191dd0',1.15);for(const i of [3,6]){const q=p[i];line([q,[q[0]+(r()-.5)*30,q[1]+15+r()*22]],'#23272a90',.9);}};
 const drips=(count)=>{if(photo)return;for(let i=0;i<count;i++){const a=r()*512,b=r()*250,w=2+r()*16,h=40+r()*220,g=x.createLinearGradient(0,b,0,b+h);g.addColorStop(0,'#201d18aa');g.addColorStop(.5,'#28261c35');g.addColorStop(1,'#252a2000');x.fillStyle=g;x.fillRect(a,b,w,h);}};
 const bolts=()=>{for(const a of [22,490])for(const b of [24,488]){rect('#142022',a-5,b-5,10,10);rect('#bbc3b0',a-4,b-5,7,2);line([[a-2,b],[a+2,b]],'#434b46',2);}};
 if(kind==='cathedral-floor'||kind==='terminal-floor'){
  const step=kind==='terminal-floor'?128:256;
  for(let a=0;a<512;a+=step){rect('#10191dab',a,0,3,512);rect('#b0b1a042',a+3,0,1,512);rect('#111b20ab',0,a,512,3);rect('#d1c8ae39',0,a+3,512,1);}
  crack(78,0,321,true);crack(275,300,235);for(const [a,b]of [[65,132],[370,395]]){rect('#21272c65',a,b,30,12);rect('#92998c45',a,b,30,1);}
 }else if(kind==='roof-floor'){
  for(const a of [18,278]){rect('#101c2270',a,0,5,512);rect('#93978b35',a+5,0,1,512);}rect('#19232b65',0,391,512,5);rect('#77868030',0,396,512,1);
  x.fillStyle='#19232b68';x.beginPath();[[90,110],[211,110],[229,234],[81,249]].forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));x.closePath();x.fill();crack(0,412,512);
 }else if(kind==='road'){
  x.fillStyle='#292e3370';x.beginPath();[[32,62],[163,56],[195,104],[179,193],[39,187]].forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));x.closePath();x.fill();line([[32,62],[163,56],[195,104]],'#92938230',1);
  crack(0,302,512);crack(239,0,206,true);crack(409,416,100);
  // A few rubbed tire tracks and oil rings, not a dense contrast blanket.
  for(let k=0;k<3;k++)line([[310+k*7,0],[295+k*7,150],[325+k*7,410],[319+k*7,512]],'#121b2414',4);
  const g=x.createRadialGradient(380,160,4,380,160,75);g.addColorStop(0,'#171d2555');g.addColorStop(.65,'#242b3325');g.addColorStop(1,'#242b3300');x.fillStyle=g;x.fillRect(300,80,160,160);
 }else if(kind==='wall'||kind==='stone'){
  rect('#172024aa',0,0,512,5);rect('#d6ccb073',0,6,512,2);rect('#17202480',0,504,512,8);rect('#1e262a90',5,0,3,512);rect('#bab7a252',9,0,2,512);
  if(kind==='stone'){for(let row=0;row<4;row++){rect('#202223',0,row*128,512,4);rect('#b8b4a07a',0,row*128+5,512,2);for(let col=0;col<3;col++)rect('#262829',col*224+(row%2)*112,row*128,3,128);}}
  drips(22);crack(82,132,234,true);crack(338,203,130,true);
  for(let i=0;i<85;i++){const a=r()*512,b=r()*512;if(i%3&&a>80&&a<430)continue;rect('#2b32317a',a,b,4+r()*15,2+r()*6);rect('#d1c8ad70',a,b,3+r()*10,1);}
  for(const a of [28,469]){rect('#242c29',a,30,8,8);rect('#8f48298a',a+2,38,3,53);}
 }else if(kind==='brick'||kind==='ceramic'){
  const h=kind==='brick'?64:128,w=kind==='brick'?156:128;if(kind!=='brick'||!photo)for(let row=0;row<9;row++)for(let col=-1;col<5;col++){const a=col*w+(kind==='brick'?row%2*w/2:0),b=row*h;rect('#202829',a,b,w,4);rect('#b5ab9270',a,b+4,w,2);rect('#252a2bb0',a,b,4,h);rect('#d9ceaa50',a+4,b+4,2,h-4);
   if(r()>.6){x.fillStyle='#252b2890';x.beginPath();x.moveTo(a+7,b+7);x.lineTo(a+20+r()*16,b+6);x.lineTo(a+7,b+26+r()*20);x.fill();}}
  drips(15);crack(198,84,210,true);
 }else if(kind==='windows'){
  for(let row=0;row<2;row++)for(let col=0;col<3;col++){const a=col*170+12,b=row*256+14;rect('#101b20',a,b,146,223);const lit=(row+col)%4===0;const g=x.createLinearGradient(a,b,a+130,b+200);g.addColorStop(0,lit?'#a49a70':'#4b6666');g.addColorStop(.45,lit?'#7b815e':'#253c44');g.addColorStop(1,'#121e26');x.fillStyle=g;x.fillRect(a+5,b+5,133,206);rect('#1f2e31',a+67,b+4,5,208);rect('#253437',a+2,b+104,138,5);rect('#b2ad8c',a-3,b+222,152,5);line([[a+18,b+9],[a+54,b+130]],'#95a1a940',5);}
  drips(20);
 }else if(kind==='poster'){
  rect('#2b282b',0,0,512,512);for(const [a,b,w,h,col,word]of [[19,13,302,390,'#c5bc9b','MISSING'],[220,197,275,305,'#607e7e','NO FUTURE']]){rect('#151c22',a+5,b+7,w,h);rect(col,a,b,w,h);rect('#4b2534',a+10,b+10,w-20,62);x.fillStyle='#e0c9a4';x.font='900 36px serif';x.fillText(word,a+18,b+53,w-35);x.fillStyle='#2c343b';x.beginPath();x.ellipse(a+w*.5,b+140,43,59,0,0,Math.PI*2);x.fill();x.beginPath();x.moveTo(a+36,b+280);x.quadraticCurveTo(a+w*.5,b+146,a+w-28,b+280);x.fill();rect('#86413e',a+35,b+142,w-70,16);for(let j=0;j<7;j++)rect('#263139',a+19,b+h-74+j*8,w-40-(j%3)*26,2);}
  for(let i=0;i<42;i++){const a=r()*512,b=r()*512;line([[a,b],[a+6+r()*38,b-3]],'#ded4b399',1);}
 }else if(kind==='hazard'){
  x.fillStyle='#1a2428';for(let a=-512;a<1024;a+=180){x.beginPath();x.moveTo(a,0);x.lineTo(a+85,0);x.lineTo(a+597,512);x.lineTo(a+512,512);x.fill();}rect('#263031',0,0,512,22);rect('#bbc0a170',0,22,512,3);rect('#182326',0,485,512,27);bolts();
 }else if(kind==='drain'){
  rect('#111c20',0,0,512,512);for(let a=15;a<512;a+=57){rect('#6d7975',a,20,17,472);rect('#a9b1a0',a,20,3,472);rect('#262e30',a+14,20,5,472);}rect('#7f8b81',0,0,512,23);rect('#4e5b54',0,489,512,23);bolts();
 }else if(kind==='puddle'){
  for(let i=0;i<25;i++){const b=i*21;line([[0,b],[140,b+2],[320,b-1],[512,b+2]],i%3?'#8ca0a214':'#8f527f20',1.5);}line([[70,207],[310,205]],'#4f98aa50',2);line([[190,310],[450,308]],'#b34c7b40',2);
 }else if(kind==='shutter'){
  for(let b=0;b<512;b+=42){rect('#172428',0,b,512,5);rect('#a7b1a1',0,b+5,512,2);rect('#323e3c50',0,b+30,512,12);}drips(24);rect('#bbb79d',178,150,170,139);rect('#763f44',188,160,150,27);x.font='bold 19px DistrictJP';x.fillStyle='#eee1bb';x.fillText('立入禁止',194,180,135);x.fillStyle='#323c3d';x.font='bold 16px monospace';x.fillText('SEALED / 09',190,213);x.fillText('NO ENTRY',190,242);
 }else if(kind==='circuit'){
  rect('#111e20',24,24,464,400);for(let j=0;j<11;j++){rect(j%3?'#6b9779':'#c19b71',48,48+j*31,90+(j*83)%250,5);rect('#c05d6d',416,48+j*31,20,5);}rect('#7f8772',28,450,285,6);rect('#843c43',387,450,60,17);bolts();
 }else if(['metal','rust','blade'].includes(kind)){
  rect('#172325b0',0,0,512,12);rect('#c2c6b190',0,12,512,3);rect('#202c2bc0',494,0,18,512);rect('#b5b9a26a',491,0,3,512);rect('#1a252760',251,0,6,512);rect('#c2bba04a',258,0,2,512);bolts();drips(kind==='rust'?25:7);
  for(let i=0;i<130;i++){const a=r()*512,b=r()*512;if(a>45&&a<455&&b>40&&b<470&&r()>.2)continue;line([[a,b],[a+2+r()*22,b-1-r()*4]],i%3?'#c6c3a577':'#171d2588',.7+r());}
 }else if(kind==='flesh'||kind==='bone'){
  for(let i=0;i<18;i++){const a=r()*512,b=r()*512;line([[a,b],[a+20,b+30],[a+12,b+58],[a+39,b+90]],kind==='bone'?'#5a514e66':'#492e4990',1.4);line([[a+12,b+58],[a-4,b+74]],'#302d3b70',.8);}if(kind==='bone'){crack(120,22,270,true);crack(310,299,180,true);}
 }else if(kind==='skin'){
  for(let i=0;i<20;i++){const a=r()*512,b=r()*512;line([[a,b],[a+14,b+2],[a+27,b]],'#6d51413b',.8);}
 }else{
  // Sewn hems, rubbed leather edges and fabric folds replace flat color blocks.
  rect('#171d2b70',0,0,21,512);rect('#c2baa35a',23,0,2,512);rect('#141c2470',342,0,26,512);for(let b=8;b<512;b+=18){rect('#c6bda366',29,b,5,2);rect('#b8b19a55',380,b,5,2);}for(let i=0;i<9;i++)line([[64+i*48,0],[48+i*47,170],[82+i*45,340],[59+i*48,512]],'#151c241a',5);
 }
 // Weather over the graphic structure too, so seams, labels and plating belong together.
 x.setTransform(1,0,0,1,0,0);weatherSurface(c,kind+'-finish',{strength:ground?.12:photo?.18:.45,road:ground});settleTileEdges(c);
 studies.set(key,c);return c;
}
