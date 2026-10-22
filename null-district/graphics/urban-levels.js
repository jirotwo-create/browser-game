import * as T from '../vendor/three.module.js';
import { mesh, plate, cylinder, loft, batchStatic, makeCrate } from './models.js';
import { neonTube, lightPool, sigil } from './neon.js';

export const URBAN_LEVELS=[
 {id:'kabuki-aftermarket',name:'KABUKI AFTERMARKET',sector:'12 / THE NIGHT MARKET',title:'STEAL THE BLACKLIST',objective:'Crack three market caches. Follow the signal to the station.',node:'CACHE',verb:'CRACK CACHE',doneLabel:'CRACKED',complete:'BLACKLIST STOLEN',exitPrompt:'BOARD THE LAST TRAIN',transitionTitle:'FOLLOW THE SIGNAL',transition:'The blacklist traces the illegal broadcasts to a closed rail terminal. Follow the dead line through Shin-Kuro.',bounds:{x:13.8,minZ:-34,maxZ:24},spawn:{x:0,z:21},exit:{x:0,z:-31},fog:'#261b30',
  relays:[[-10,4],[10,-12],[0,-26]],medkits:[[-11,17],[10,7],[-10,-16],[5,-27]],
  enemies:[['sable',-2,12],['razor',3,5],['netrunner',-9,-2],['riot',9,-6],['hound',0,-9],['sable',-9,-14],['arbalist',8,-20],['warlock',-10,-24],['knight',2,-27],['razor',10,15],['revenant',-3,-27]]},
 {id:'shin-kuro-terminal',name:'SHIN-KURO TERMINAL',sector:'03 / LAST TRAIN',title:'RESTORE THE DEAD LINE',objective:'Bridge three station circuits. Reach the north service gate.',node:'CIRCUIT',verb:'BRIDGE CIRCUIT',doneLabel:'BRIDGED',complete:'DEAD LINE RESTORED',exitPrompt:'ASCEND TO RAINLINE',transitionTitle:'THE FEED NEVER SLEEPS',transition:'The dead line carries one last transmission to the rooftop broadcast array. Take the maintenance lift. Cut the citywide feed at its source.',bounds:{x:15.5,minZ:-38,maxZ:26},spawn:{x:-10.5,z:22},exit:{x:8,z:-34},fog:'#18272d',
  relays:[[-11,4],[10,-12],[-9,-29]],medkits:[[-11,17],[11,6],[-10,-14],[11,-29],[4,-30]],
  enemies:[['sable',-10,12],['razor',-4,0],['riot',9,11],['netrunner',-10,-9],['hound',6,-6],['sable',10,-19],['revenant',-5,-24],['arbalist',7,-28],['warlock',-11,-31],['knight',3,-31],['razor',12,-2]]},
 {id:'rainline-broadcast',name:'RAINLINE BROADCAST',sector:'88 / THE ADVERTISEMENT SKY',title:'CUT THE FEED',objective:'Jam three uplinks. Silence the central broadcast array.',node:'UPLINK',verb:'JAM UPLINK',doneLabel:'JAMMED',complete:'FEEDS CUT',exitPrompt:'SILENCE THE NETWORK',bounds:{x:16.5,minZ:-42,maxZ:26},spawn:{x:0,z:22},exit:{x:0,z:-38},fog:'#251c32',
  relays:[[-12,0],[12,-15],[0,-30]],medkits:[[-11,17],[11,9],[-12,-16],[7,-29],[0,-34]],
  enemies:[['sable',-3,12],['riot',10,8],['razor',-10,6],['netrunner',-11,-8],['sable',9,-12],['hound',0,-12],['warlock',-8,-22],['arbalist',11,-26],['revenant',4,-28],['knight',-4,-30],['netrunner',12,-31],['gargoyle',0,-35]]}
];

export function buildUrbanLevel(index,root,m,solids,sign){
 const config=URBAN_LEVELS[index],styles=[m.neonPink,m.neonCyan,m.neonViolet,m.neonAmber];let panels=0;
 const collide=(x,z,w,d,h=5)=>{const o=mesh(root,new T.BoxGeometry(w,h,d),m.black,x,h/2,z);o.visible=false;o.userData.collider=true;solids.push({x,z,w,d,mesh:o})};
 const ad=(key,x,y,z,w=5,h=2.5,rot=0)=>{
  const frame=new T.Group();frame.position.set(x,y,z);frame.rotation.y=rot;root.add(frame);
  plate(frame,m.black,w+.28,h+.28,.16,0,0,-.11);plate(frame,m.metal,w+.42,.10,.26,0,-h/2-.16,-.08);
  sign({ad:key},x,y,z,undefined,w,h,rot);panels++;
 };
 const propCrate=(x,z,w=2,d=2)=>{const g=makeCrate(m,w,1.2,d);g.position.set(x,0,z);root.add(g);collide(x,z,w,d,1.2)};
 const floor=(material=m.road)=>{for(let x=-24;x<24;x+=4)for(let z=-48;z<32;z+=4){const p=mesh(root,new T.PlaneGeometry(4,4),material,x+2,-.035,z+2);p.rotation.x=-Math.PI/2;}};
 const lamp=(x,z,color=m.neonPink)=>{cylinder(root,m.metal,.09,5.5,6,x,2.75,z);plate(root,m.black,1.2,.12,.4,x,5.5,z);plate(root,color,1,.04,.3,x,5.41,z);};
 const walls=(width,height=15)=>{
  for(const side of [-1,1])for(let i=0;i<8;i++){
   const z=23-i*9,h=height+(i%3)*3,x=side*(width+3);
   mesh(root,loft([[0,5.5,8.8],[3,5.9,8.8],[h,5,8.5]]),m.wall,x,0,z);collide(x,z,5.5,8.8,h);
   const windows=mesh(root,new T.PlaneGeometry(7.8,h*.48),m.windows,side*(width+.20),h*.55,z);windows.rotation.y=-side*Math.PI/2;
   for(let j=0;j<2;j++){const pipe=cylinder(root,j?m.metal:m.rust,.09,8.7,6,side*(width-.10-j*.2),3+j*.6,z);pipe.rotation.x=Math.PI/2;}
   const shutter=mesh(root,new T.PlaneGeometry(6.8,2.4),m.shutter,side*(width+.15),1.3,z);shutter.rotation.y=-side*Math.PI/2;
   neonTube(root,styles[i%4],[side*(width-.1),3.2,z-3.6],[side*(width-.1),3.2,z+3.6],.045);
  }
  plate(root,m.wall,width*2+8,14,2,0,7,config.bounds.minZ-3);collide(0,config.bounds.minZ-3,width*2+8,2,14);
  plate(root,m.wall,width*2+8,10,2,0,8,config.bounds.maxZ+3);collide(0,config.bounds.maxZ+3,width*2+8,2,14);
 };
 floor();
 if(index===0){
  walls(14.4,19);
  // Covered market: a central spine with two outer shopping lanes and gaps
  // between stalls, not a reskin of the original narrow avenue.
  for(const side of [-1,1])for(let i=0;i<4;i++){
   const x=side*5.5,z=14-i*12;
   mesh(root,loft([[0,2.8,3.9],[1.25,2.8,3.9],[1.4,2.4,3.6]]),i%2?m.rust:m.coat,x,0,z);collide(x,z,2.8,3.9,1.4);
   const roof=mesh(root,loft([[0,4.3,5.3],[.22,4,5.0]]),i%2?m.robe:m.coat,x,3.3,z);roof.rotation.z=side*.06;
   for(const dx of [-1.8,1.8])cylinder(root,m.metal,.05,3.2,5,x+dx,1.6,z+2.2);
   const keys=side<0?['ramen','mods','memory','danger']:['optics','power','arcade','cyber'];
   ad(keys[i],x,2.45,z+2.1,3.7,1.75,side*.08);
   for(let j=0;j<4;j++){cylinder(root,m.rust,.14,.35,6,x-.8+j*.5,1.6,z+1);plate(root,styles[(i+j)%4],.18,.08,.02,x-.8+j*.5,1.65,z+1.15);}
   lightPool(root,side<0?0xff258d:0x19edff,x-side*2.5,z+2,2.7,3);
   ad(keys[(i+1)%4],side*13.7,5.5,z-1,5.2,3,-side*Math.PI/2);
   ad(i%2?'launch':'market',side*10.8,8.5,z+3,3.2,5.4,-side*.15);
  }
  for(const z of [10,-5,-24]){plate(root,m.rust,28,.35,.4,0,6.1,z);neonTube(root,m.neonPink,[-13,6,z],[13,6,z],.045);ad(z===10?'market':z===-5?'memory':'cyber',0,5.1,z,8,2.6);}
  // Crumpled service bins, oil drums and a small court relic in the back lane.
  for(const [x,z]of [[-11,11],[10,0],[-11,-8],[11,-23]]){cylinder(root,m.rust,.5,1.2,8,x,.6,z);cylinder(root,m.metal,.52,.08,8,x,1.24,z);lamp(x+1,z+1,m.neonAmber);}
  for(const x of [-2.5,2.5])propCrate(x,-18,1.4,1.4);
  mesh(root,new T.ConeGeometry(.65,3,5),m.obsidian,0,1.5,-22);collide(0,-22,1.4,1.4,3);sigil(root,m.arcane,0,3,-22,1);
  ad('exit',0,4.4,-33.4,6,2.8);ad('rain',-9,11,-33.5,8,6);ad('launch',9,11,-33.5,8,6);
 }else if(index===1){
  walls(16.5,12);
  // Flat traversable platforms; rails and train cars define the routes.
  for(const side of [-1,1]){
   for(const x of [side*2.5,side*3.2])plate(root,m.metal,.075,.055,65,x,.015,-5);
   plate(root,m.hazard,.30,.025,64,side*4,.01,-5);
   for(let i=0;i<7;i++){const z=21-i*9;cylinder(root,m.metal,.32,8.5,8,side*7.4,4.25,z);collide(side*7.4,z,.8,.8,8.5);plate(root,m.rust,1.3,.25,1.3,side*7.4,8.5,z);ad(['train','transfer','optics','memory','stopped','danger','exit'][i],side*16.1,4.6,z,6,3,-side*Math.PI/2);}
   for(const z of [16,-4,-25]){neonTube(root,m.metal,[side*15,7,z],[0,10,z],.24);neonTube(root,m.neonCyan,[side*15,6.7,z],[0,9.7,z],.045);}
  }
  for(const [z,length]of [[8,12],[-14,15]]){
   const train=mesh(root,loft([[0,3.4,length-1],[.4,3.8,length],[2.8,3.8,length],[3.35,2.9,length-.7]]),m.rust,0,0,z);collide(0,z,3.8,length,3.4);
   for(const side of [-1,1]){
    for(let j=0;j<4;j++){const wz=z-length/2+2+j*(length-3)/4;const window=mesh(root,new T.PlaneGeometry(1.45,1.2),m.windows,side*1.92,2.1,wz);window.rotation.y=side*Math.PI/2;}
    neonTube(root,m.neonAmber,[side*1.94,1,z-length/2+.5],[side*1.94,1,z+length/2-.5],.035);
    ad(z>0?'ramen':'cyber',side*1.96,2.1,z,2.3,1.5,side*Math.PI/2);
   }
   for(const dx of [-.95,.95])mesh(root,new T.IcosahedronGeometry(.18,0),m.neonAmber,dx,.9,z+length/2+.03);
  }
  // Departure boards are intentionally broad enough to read in a 240-line raster.
  ad('train',-7,5.3,14,8,3);ad('stopped',7,5.3,3,8,3);ad('transfer',-7,5.4,-13,8,3);ad('exit',8,4.8,-36,7,3);
  for(const [x,z]of [[-12,9],[12,1],[-12,-20],[12,-26]]){propCrate(x,z,1.5,1.5);ad('power',x,2.8,z-.9,2.4,1.8);lamp(x,z+1,m.neonCyan);}
  for(let i=0;i<8;i++){const z=24-i*9;plate(root,m.dark,32,.16,.4,0,9.6,z);plate(root,m.neonAmber,3,.03,.15,0,9.48,z);}
  ad('danger',-7,6,-39.3,9,3.5);ad('broadcast',7,10,-39.3,11,5);
 }else{
  // Open rooftop plaza with low parapets, service blocks and a wall of ads.
  for(const side of [-1,1]){plate(root,m.wall,1.2,1.4,72,side*17.3,.7,-7);collide(side*17.3,-7,1.2,72,2);}
  for(let i=0;i<6;i++)for(const side of [-1,1]){
   const z=22-i*12,x=side*(22+(i%2)*3),height=16+(i%3)*7;
   mesh(root,loft([[0,7,9],[height*.7,7,9],[height,5,8]]),m.wall,x,0,z);
   ad(['broadcast','rain','cyber','optics','memory','signal'][(i+(side>0?2:0))%6],side*18.5,10+(i%2)*3,z,8,11,-side*.35);
   neonTube(root,styles[i%4],[side*16.7,.4,z-5],[side*16.7,.4,z+5],.065);lightPool(root,side<0?0xff269d:0x10dfff,side*12,z,5,4);
   lamp(side*14.4,z+4,styles[i%4]);
  }
  for(const side of [-1,1])for(const z of [9,-8]){
   mesh(root,loft([[0,3.2,5],[2.3,3.2,5],[2.7,2.7,4.6]]),m.metal,side*6,0,z);collide(side*6,z,3.2,5,2.7);
   for(let j=0;j<3;j++){const fan=cylinder(root,m.black,.55,.12,8,side*6,2.75,z-1.4+j*1.3);for(let k=0;k<3;k++){const vane=plate(root,m.metal,.8,.05,.09,side*6,2.85,z-1.4+j*1.3);vane.rotation.y=k*Math.PI/3;}}
   ad(side<0?'mods':'launch',side*6,4.3,z+2.6,4.5,2.7);
  }
  for(const side of [-1,1]){
   cylinder(root,m.rust,.2,5,8,side*11,2.5,-27);const dish=mesh(root,new T.ConeGeometry(2.3,.6,10,1,true),m.metal,side*11,5,-27);dish.rotation.z=side*.48;neonTube(root,m.neonCyan,[side*11,5,-27],[side*10,7,-27],.04);
   mesh(root,loft([[0,3,3],[9,1.8,1.8],[18,.4,.4]]),m.obsidian,side*3.6,0,-40);collide(side*3.6,-40,2.5,2.5,10);
   neonTube(root,m.arcane,[side*3.6,.3,-38.6],[side*3.6,14,-39.7],.06);
  }
  ad('broadcast',0,11,-43.4,15,6);ad('signal',-11,6,-43.3,10,4);ad('cyber',11,6,-43.3,10,4);
  for(const z of [12,-1,-23]){plate(root,m.rust,32,.4,.5,0,8,z);neonTube(root,m.neonPink,[-16,7.7,z],[16,7.7,z],.05);ad(z===12?'rain':z===-1?'signal':'broadcast',0,6.3,z,9,3);}
  sigil(root,m.arcane,0,4,-40,2.3);plate(root,m.wall,36,5,2,0,2.5,-44);collide(0,-44,36,2,8);
 }
 batchStatic(root);
 return {staticBatches:root.children.filter(o=>o.name==='batched-painted-district').length,neonInstallations:panels*2,riftSigils:index===0?1:index===2?1:0};
}
