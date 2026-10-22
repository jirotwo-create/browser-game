import * as T from '../vendor/three.module.js';
import { mesh, plate, cylinder, loft, batchStatic, makeCrate } from './models.js';
import { buildDistrict } from './district.js';
import { neonTube, lightPool, sigil } from './neon.js';

export const LEVELS=[
 {id:'neon-schism',name:'NEON SCHISM',sector:'09 / THE LOWER STACKS',title:'STEAL THE RIFT KEY',objective:'Breach the three relays. Return to the neon gate.',node:'RELAY',complete:'RELAYS STOLEN',bounds:{x:8.3,minZ:-30,maxZ:30},spawn:{x:0,z:22},exit:{x:0,z:26},fog:'#252b3b',
  relays:[[-6,-6],[6,-17],[-5,-27]],medkits:[[5,18],[-6,-13],[6,-28],[5,-2]],
  enemies:[['sable',-3,9],['razor',4,0],['netrunner',-4,-10],['riot',3,-20],['sable',0,-27],['arbalist',5,-9],['warlock',-4,-23],['hound',0,-15],['knight',5,-27]]},
 {id:'cathedral-of-static',name:'CATHEDRAL OF STATIC',sector:'VOID / THE ASHEN COURT',title:'SEVER THE COVENANT',objective:'Unbind three seals. Reach the cathedral heart.',node:'SEAL',complete:'SEALS UNBOUND',bounds:{x:12.2,minZ:-40,maxZ:25},spawn:{x:0,z:21},exit:{x:0,z:-37},fog:'#282333',
  relays:[[-9,-6],[9,-18],[0,-31]],medkits:[[-8,16],[8,0],[-8,-22],[5,-32]],
  enemies:[['hound',-3,9],['revenant',4,4],['knight',-7,-6],['arbalist',8,-8],['warlock',-6,-18],['netrunner',7,-19],['riot',-8,6],['razor',8,14],['revenant',3,-24],['hound',-5,-26],['arbalist',7,-29],['gargoyle',0,-34]]}
];
function buildCathedral(world,m,solids,sign){
 const collider=(x,z,w,d,h=5)=>{const o=mesh(world,new T.BoxGeometry(w,h,d),m.black,x,h/2,z);o.visible=false;o.userData.collider=true;solids.push({x,z,w,d,mesh:o});};
 for(let x=-20;x<20;x+=4)for(let z=-44;z<32;z+=4){const o=mesh(world,new T.PlaneGeometry(4,4),m.road,x+2,0,z+2);o.rotation.x=-Math.PI/2;}
 // A wide ruined nave, side chapels and a broken apse; not the street layout.
 for(const side of [-1,1]){
  for(let i=0;i<7;i++){
   const z=20-i*9,x=side*14.5,h=11+(i%3)*2;
   mesh(world,loft([[0,4.6,8],[h,4.1,7.5]]),m.stone,x,0,z);collider(x,z,4.6,8,h);
   // Pointed Gothic windows with a neon pixel-stained rose above them.
   const window=sign(i%2?'VEIL / 祈':'ASHEN COURT',side*12.05,5.9,z,'#b74bff',3.6,2.2,-side*Math.PI/2);
   for(const dz of [-3.2,3.2]){const b=plate(world,m.stone,.6,8,1.1,side*10.9,4,z+dz);b.rotation.z=side*.13;collider(side*11,z+dz,.8,1.1,8);}
   neonTube(world,i%2?m.neonPink:m.neonCyan,[side*11.7,.45,z-3.9],[side*11.7,.45,z+3.9],.06);
   neonTube(world,m.arcane,[side*12.0,2,z],[side*12.0,8,z],.05);
   lightPool(world,i%2?0xc62aff:0x12bfff,side*9,z,3,3.7);
   // Server stacks and dangling cable runs physically collide with the ruins.
   if(i%2===0){for(let k=0;k<3;k++){const rack=mesh(world,loft([[0,1.1,.9],[2.8,1.1,.9]]),m.metal,side*(8.2+k*.7),0,z+1);plate(rack,m.circuit,.75,1.9,.04,0,1.6,.49);}collider(side*8.9,z+1,2.5,1,2.8);}
   const column=mesh(world,organicColumn(8+i%2),m.stone,side*5.8,0,z-1);collider(side*5.8,z-1,.95,.95,8);
   const crown=mesh(world,new T.ConeGeometry(.85,1.6,5),m.obsidian,side*5.8,8.6,z-1);
   neonTube(world,m.neonCyan,[side*5.8,.4,z-.45],[side*5.8,6.8,z-.45],.028);
   // Flying buttresses terminate above head height, leaving the aisle traversable.
   neonTube(world,m.stone,[side*5.8,6.8,z-1],[side*12.8,10.8,z-1],.28);
  }
  for(let i=0;i<4;i++){const z=14-i*12;sign(i%2?'SACRAMENT.EXE':'PRAY / UPLOAD',side*9,3.6,z,side<0?'#2af6ff':'#ff3299',3,.75,-side*.3);}
 }
 // Broken transept arches define a different skyline from the district gantries.
 for(const z of [14,-12,-29])for(const side of [-1,1]){
  neonTube(world,m.stone,[side*5.8,7,z],[0,11.5,z],.32);neonTube(world,m.arcane,[side*5.6,7.1,z+.1],[0,11.3,z+.1],.035);
 }
 for(const [x,z]of [[-3,13],[3,1],[-3,-11],[3,-23]]){
  const tomb=mesh(world,loft([[0,1.7,3.0],[.6,1.5,2.7],[.8,1.3,2.4]]),m.stone,x,0,z);collider(x,z,1.7,3,.8);sigil(world,m.arcane,x,1.65,z,.48);
 }
 // Far apse: spires, fractured rose window, altar and the final dimensional gate.
 plate(world,m.stone,31,15,2,0,7.5,-42);collider(0,-42,31,2,15);
 for(const x of [-10,-5,5,10]){mesh(world,new T.ConeGeometry(1.6,10,5),m.obsidian,x,18,-42);plate(world,m.stone,1.8,13,1.8,x,8,-40.7);}
 const rose=sigil(world,m.arcane,0,9,-40.7,3.2);sigil(world,m.neonCyan,0,9,-40.5,2.3);for(let i=0;i<12;i++){const a=i*Math.PI/6;neonTube(world,m.neonPink,[Math.sin(a)*.7,9+Math.cos(a)*.7,-40.4],[Math.sin(a)*3.0,9+Math.cos(a)*3,-40.4],.04);}
 sign('CATHEDRAL / OF / STATIC',0,5.3,-40.5,'#f048cc',11,1.2);
 for(const side of [-1,1]){mesh(world,new T.ConeGeometry(.7,4,5),m.obsidian,side*3.1,2,-37);neonTube(world,m.arcane,[side*3,.1,-36.9],[side*3,4,-36.9],.06);}
 for(const z of [19,7,-5,-17,-29]){neonTube(world,m.neonCyan,[-.6,.022,z],[-.6,.022,z-3],.025);neonTube(world,m.neonPink,[.6,.022,z],[.6,.022,z-3],.025);lightPool(world,0x8a2aff,0,z,2.5,2);}
 plate(world,m.stone,29,9,2,0,6.5,28);collider(0,28,29,2,12);
 batchStatic(world);return {staticBatches:world.children.filter(o=>o.name==='batched-painted-district').length,neonInstallations:26,riftSigils:9};
}
function organicColumn(h){return loft([[0,1.25,1.25],[.4,.8,.8],[h-.6,.75,.75],[h,.95,.95]])}
export function buildLevel(index,world,materials,solids,sign){return index===0?buildDistrict(world,materials,solids,sign):buildCathedral(world,materials,solids,sign)}
