import * as T from '../vendor/three.module.js';
import {mesh,plate,cylinder,loft,batchStatic} from './models.js';
import {neonTube} from './neon.js';
export function refineEnvironment(index,world,m,solids,level){
 const root=new T.Group();root.name='authored-street-infrastructure';world.add(root);let fixtures=0,posters=0,drains=0;
 const floor=(material,w,d,x,z)=>{const p=mesh(root,material===m.puddle?new T.CircleGeometry(.5,9):new T.PlaneGeometry(w,d),material,x,.016,z);p.rotation.x=-Math.PI/2;if(material===m.puddle)p.scale.set(w,d,1);return p;};
 const collider=(x,z,w,d,h)=>{const o=mesh(root,new T.BoxGeometry(w,h,d),m.black,x,h/2,z);o.visible=false;o.userData.collider=true;solids.push({x,z,w,d,mesh:o});};
 const facade=index===1?m.brick:index===3?m.ceramic:m.wall;
 for(const side of [-1,1])for(let row=0,z=level.bounds.maxZ-12;z>level.bounds.minZ+8;z-=15,row++){
  const wallX=side*(level.bounds.x-.07),panel=new T.Group();panel.position.set(wallX,0,z);panel.rotation.y=-side*Math.PI/2;root.add(panel);
  // Material transitions and silhouette detail anchor the machinery to its wall.
  plate(panel,facade,3.6,1.15,.08,0,.62,-.04);plate(panel,m.rust,3.7,.075,.16,0,1.23,.015);
  if(row%2===0){
   mesh(panel,loft([[0,.82,.25],[1.6,.82,.25],[1.68,.72,.22]]),m.metal,0,.35,.09);
   plate(panel,m.black,.66,1.29,.02,0,1.18,.23);plate(panel,m.hazard,.62,.15,.023,0,1.78,.25);
   for(let k=0;k<5;k++){plate(panel,m.rust,.49,.075,.035,0,.72+k*.13,.25);plate(panel,m.edge,.45,.012,.04,0,.76+k*.13,.27);}
   for(const x of [-.31,.31])for(const y of [.48,1.82]){const bolt=cylinder(panel,m.edge,.026,.035,6,x,y,.25);bolt.rotation.x=Math.PI/2;}
   plate(panel,m.neonGreen,.055,.09,.025,.23,1.65,.27);plate(panel,m.black,.12,.22,.06,.48,1.05,.12);
   for(const x of [-.5,.50]){
    neonTube(panel,m.metal,[x,.15,.08],[x,2.8,.08],.043);
    for(const y of [.3,1.2,2.3])plate(panel,m.edge,.13,.06,.12,x,y,.08);
   }
   // Only the actual cabinet footprint changes collision; existing routes stay clear.
   collider(wallX-side*.11,z,.37,.86,2.05);fixtures++;
  }else{
   const paper=mesh(panel,new T.PlaneGeometry(1.7,2.0),m.poster,-.25,1.55,.045);paper.rotation.z=side*.06;
   const overlay=mesh(panel,new T.PlaneGeometry(.75,.8),m.poster,.6,.87,.06);overlay.rotation.z=-side*.13;posters+=2;
   const vent=plate(panel,m.black,.65,.65,.12,1.1,2.25,.04);
   for(let i=0;i<7;i++)plate(panel,m.metal,.59,.035,.15,1.1,2.0+i*.075,.11);
  }
  // Gutters, metal drain slots and cast curb seams make the ground legible up close.
  floor(m.drain,.48,2.1,side*(level.bounds.x-1.1),z+2.8);drains++;
  if(index!==1){floor(m.puddle,1.2,2.7,side*(level.bounds.x-2.6),z-2.7);}
  for(let k=0;k<3;k++)plate(root,m.metal,.035,.018,.45,side*(level.bounds.x-1),.03,z+4+k*.55);
  // Bundled overhead wiring ends in polygonal attachment brackets.
  if(row%2===0){
   const curve=new T.CatmullRomCurve3([new T.Vector3(-level.bounds.x,5.8,z),new T.Vector3(0,4.9,z+.45),new T.Vector3(level.bounds.x,5.8,z)]);
   mesh(root,new T.TubeGeometry(curve,14,.035,5,false),m.black);
   if(index===1){for(const x of [-1,1]){const candle=cylinder(panel,m.bone,.055,.38,6,x,.35,.4);mesh(panel,new T.OctahedronGeometry(.07),m.arcane,x,.61,.4);}}
  }
 }
 // Different ground markings make the platform and service roof read differently from streets.
 for(let z=level.bounds.maxZ-6;z>level.bounds.minZ+5;z-=18){
  if(index===3){for(const side of [-1,1]){floor(m.hazard,.16,3.2,side*4.3,z);floor(m.ceramic,.8,.45,side*10,z);}}
  else if(index===4){for(const x of [-1.7,1.7])floor(m.hazard,.09,2.3,x,z);}
  else if(index!==1){floor(m.rust,.65,.055,.05,z);floor(m.rust,.055,.6,-.25,z);}
 }
 // Flatten rigid props into material batches while keeping independent collider meshes.
 root.updateMatrixWorld(true);const pieces=[];root.traverse(o=>{if(o.isMesh&&!o.userData.collider)pieces.push(o);});for(const o of pieces)root.attach(o);
 for(const o of [...root.children])if(!o.isMesh)root.remove(o);batchStatic(root);
 return {refinedFixtures:fixtures,layeredPosters:posters,groundDrains:drains,dressingBatches:root.children.filter(o=>o.name==='batched-painted-district').length};
}
