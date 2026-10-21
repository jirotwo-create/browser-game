import * as THREE from '../vendor/three.module.js';
import { loft, mesh, plate, cylinder, makeCrate, batchStatic } from './models.js';

export function buildDistrict(world,m,solids,sign) {
 let seed=2097;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const addCollider=(x,z,w,d,h=5)=>{const c=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial());c.position.set(x,h/2,z);c.visible=false;c.userData.collider=true;world.add(c);solids.push({x,z,w,d,mesh:c});return c};
 // Each pavement panel is only two triangles. Oblique views visibly shear its
 // painted texels along that diagonal, as on real affine-mapped geometry.
 for(let z=-34;z<34;z+=4)for(let x=-14;x<14;x+=4){const p=mesh(world,new THREE.PlaneGeometry(4,4),m.road,x+2,-.035,z+2);p.rotation.x=-Math.PI/2}
 for(const s of [-1,1]){
  for(let z=-30;z<32;z+=4){plate(world,m.wall,1.8,.25,3.96,s*7.75,.05,z);plate(world,m.hazard,.16,.3,3.96,s*6.83,.03,z)}
  for(let j=0;j<7;j++){
   const z=27-j*9,h=10+rand()*14,x=s*(12.5+rand()*1.5);
   mesh(world,loft([[0,8,7.5],[3,8.6,8],[h*.7,7.8,7.4],[h,6.8,6.8]]),m.wall,x,0,z);addCollider(x,z,8,8,h);
   mesh(world,loft([[0,8.5,8],[.4,8.1,7.5]]),m.rust,x,h*.7,z);
   const windows=mesh(world,new THREE.PlaneGeometry(6,h*.52),m.windows,s*8.7,h*.5+2,z);windows.rotation.y=-s*Math.PI/2;windows.geometry.attributes.uv.array.forEach((v,i,a)=>{a[i]=v*(i%2?3:2)});
   // Recessed shop shutters, projecting polygonal awnings and angular supports.
   const shutter=mesh(world,new THREE.PlaneGeometry(5.3,2.9),m.shutter,s*8.25,1.5,z-1.3);shutter.rotation.y=-s*Math.PI/2;
   const awning=mesh(world,loft([[0,2.4,5.8],[.3,2,5.5]]),j%2?m.rust:m.coat,s*8.1,3.1,z-1.3);awning.rotation.z=s*.13;
   for(const dz of [-3.5,.7]){const brace=plate(world,m.rust,.2,3.1,.22,s*7.12,1.5,z+dz);brace.rotation.z=s*.12}
   // Narrow vending cabinet retains the original traversable road footprint.
   mesh(world,loft([[0,1.3,1.1],[2.4,1.5,1.2],[2.9,1.1,.9]]),m.rust,s*7.3,.1,z+2);addCollider(s*7.3,z+2,1.5,1.2,3);
   const display=mesh(world,new THREE.PlaneGeometry(.8,1.3),m.circuit,s*7.3,1.7,z+2.62);
   plate(world,m.black,.9,.2,.15,s*7.3,.65,z+2.62);
   if(j%2===0){const signpost=plate(world,m.metal,.18,5.8,.18,s*6.6,2.9,z+3);signpost.rotation.z=s*.04;sign(j%4?'メモリ / MEMORY':'SABLE SECURITY',s*6.4,4.8,z+3,'#d6b178',2.7,.85,s*.22)}
   // Faceted water tanks, ventilation stacks and roof antennae.
   cylinder(world,m.rust,1.1,2,7,x,h+1,z);cylinder(world,m.metal,.22,3,5,x+1.6,h+1.3,z-1);
   plate(world,m.dark,.1,4,.1,x-1.8,h+2,z);plate(world,m.rust,2,.07,.07,x-1.8,h+3.7,z);
  }
  for(let j=0;j<10;j++){const x=s*(23+rand()*8),z=34-j*9,h=23+rand()*18;mesh(world,loft([[0,9,7],[h*.7,9,7],[h,6,6]]),m.dark,x,0,z)}
  // Octagonal service pipes replace perfectly thin neon rails.
  for(let j=0;j<2;j++){const pipe=cylinder(world,j?m.coat:m.rust,.13,61,6,s*(7.4+j*.35),5.2+j*.3,0);pipe.rotation.x=Math.PI/2}
 }
 // Heavy two-level gantry and triangular cross bracing.
 plate(world,m.wall,28,15,3,0,7.5,-32);addCollider(0,-32,28,3,15);
 plate(world,m.wall,28,9,3,0,10,33);addCollider(0,33,28,3,16);
 plate(world,m.rust,18,.7,2,0,8,-18);plate(world,m.hazard,16,.3,.08,0,7.9,-16.94);
 for(const side of [-1,1]){const brace=plate(world,m.metal,.28,5.5,.3,side*5.1,8.5,-17);brace.rotation.z=side*.8}
 for(let j=0;j<9;j++){plate(world,m.acid,.13,.025,1.5,0,0,26-j*7)}
 for(const [x,z,w,d]of [[-4,14,2,2],[4,7,2.7,1.5],[-3,-2,2.5,2],[3,-12,2.5,2],[-3,-20,2,2],[5,-25,2,2]]){const crate=makeCrate(m,w,1.4,d);crate.position.set(x,0,z);world.add(crate);addCollider(x,z,w,d,1.4)}
 // Recognizable scene props: pressure drums, wall fans, discarded CRTs.
 for(const [x,z]of [[-5,20],[5,12],[-5,-15],[6,-22]]){cylinder(world,m.rust,.48,1.2,8,x,.6,z);cylinder(world,m.hazard,.5,.3,8,x,.7,z);const lid=cylinder(world,m.metal,.42,.07,8,x,1.24,z);lid.rotation.z=.03}
 for(const side of [-1,1])for(const z of [17,-8,-26]){const fan=cylinder(world,m.dark,.7,.3,8,side*8.1,4.2,z);fan.rotation.z=Math.PI/2;for(let i=0;i<4;i++){const blade=plate(world,m.metal,.12,1.1,.08,side*7.9,4.2,z);blade.rotation.x=i*Math.PI/4}}
 sign('NO SIGNAL',0,5,-30.4,'#e2c388',10,2);
 sign('KOBRA / 電脳',-7.4,5.6,6,'#b7c7b1',4,1.3,.3);
 sign('眠 / SLEEP CLINIC',7.5,4.6,-11,'#e0b0a4',4.6,1.2,-.35);
 sign('UPLINK',0,3.8,30.9,'#e4ca81',5,1.2,Math.PI);
 // Graphic wall mural: designed as a tiny palette-limited poster, not a photo.
 const c=document.createElement('canvas');c.width=64;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#bc8c52';ctx.fillRect(0,0,64,96);ctx.fillStyle='#414051';ctx.beginPath();ctx.moveTo(14,80);ctx.lineTo(4,96);ctx.lineTo(60,96);ctx.lineTo(48,72);ctx.lineTo(45,26);ctx.lineTo(37,12);ctx.lineTo(21,12);ctx.lineTo(13,26);ctx.fill();ctx.fillStyle='#99918c';ctx.beginPath();ctx.moveTo(16,30);ctx.lineTo(37,24);ctx.lineTo(43,57);ctx.lineTo(30,73);ctx.lineTo(16,54);ctx.fill();ctx.fillStyle='#ad5c59';ctx.fillRect(10,37,39,8);ctx.fillStyle='#e4ca81';ctx.font='bold 8px monospace';ctx.fillText('SABLE',18,88);const t=new THREE.CanvasTexture(c);t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;const mural=mesh(world,new THREE.PlaneGeometry(2.4,3.6),m.wall.clone(),-7,3,17);mural.material.uniforms={...m.wall.uniforms,tex:{value:t},unlit:{value:.6},repeatUV:{value:1}};mural.rotation.y=.4;
 batchStatic(world);
 return {staticBatches:world.children.filter(o=>o.name==='batched-painted-district').length};
}
