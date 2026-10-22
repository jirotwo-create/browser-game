import * as T from '../vendor/three.module.js';
import { mesh, plate, cylinder } from './models.js';

export function neonTube(root,material,a,b,width=.045){
 const d=new T.Vector3(...b).sub(new T.Vector3(...a));const o=cylinder(root,material,width,d.length(),5,...new T.Vector3(...a).addScaledVector(d,.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;
}
export function lightPool(root,color,x,z,sx=2,sz=3){
 const material=new T.MeshBasicMaterial({color,vertexColors:true,transparent:true,opacity:.3,depthWrite:false,blending:T.AdditiveBlending});
 const geo=new T.CircleGeometry(1,8).toNonIndexed(),p=geo.attributes.position,colors=[];
 for(let i=0;i<p.count;i++){const fade=Math.max(0,1-Math.hypot(p.getX(i),p.getY(i)));colors.push(fade,fade,fade)}
 geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));const o=mesh(root,geo,material,x,.012,z,[sx,sz,1]);o.rotation.x=-Math.PI/2;return o;
}
export function sigil(root,m,x,y,z,r=1){
 const g=new T.Group();g.position.set(x,y,z);root.add(g);
 mesh(g,new T.TorusGeometry(r,.028,3,12),m);
 for(let i=0;i<6;i++){const a=i*Math.PI/3,b=a+Math.PI*2/3;neonTube(g,m,[Math.sin(a)*r*.82,Math.cos(a)*r*.82,0],[Math.sin(b)*r*.82,Math.cos(b)*r*.82,0],.018)}
 return g;
}
export function addNeonDistrict(world,m,sign){
 const colors=[m.neonCyan,m.neonPink,m.neonViolet];
 for(const side of [-1,1])for(let i=0;i<7;i++){
  const z=27-i*9,neon=colors[(i+(side>0?1:0))%3];
  neonTube(world,neon,[side*8.05,3.5,z-3.7],[side*8.05,3.5,z+2.7],.065);
  neonTube(world,neon,[side*8.1,3.5,z-3.7],[side*8.1,7+i%3,z-3.7],.06);
  const label=['VOID / RAMEN','BODY MODS','HEX / NETWORK','AFTERLIFE','MEMORY / 24H','SYNTH MARKET','CHROME + ASH'][i];
  sign(label,side*7,4.4+(i%2)*1.1,z+1,side<0?'#26f1ff':'#ff388f',3.2,.9,-side*.23);
  sign(['開 24H','夢 DREAM','BYTE / 99'][i%3],side*7.6,8,z-2,side<0?'#ff388f':'#9a5fff',1.2,2.8,-side*.14);
  for(let n=0;n<4;n++)plate(world,neon,.08,.14,.6,side*7.1,.22,z-1+n*.6);
  lightPool(world,side<0?0x13ddff:0xff2080,side*5.8,z,2.7,2.7);
  for(let row=0;row<3;row++)plate(world,neon,.035,.09,4.6,side*8.65,11+row*2,z);
 }
 for(const z of [14,-5,-22]){neonTube(world,m.neonPink,[-8,7,z],[8,7,z],.035);neonTube(world,m.neonCyan,[-8,7.2,z],[8,7.2,z],.025);}
 sign('THE VEIL IS OPEN',0,6.1,-30.3,'#ff3f9b',11,1.1);
 sigil(world,m.arcane,0,3.7,-30.1,1.65);
 for(const side of [-1,1]){const shard=mesh(world,new T.ConeGeometry(.5,4.5,5),m.obsidian,side*5.8,2,-28);shard.rotation.z=side*.23;neonTube(world,m.arcane,[side*5.8,.4,-27.8],[side*5.3,4,-27.8],.035);}
 return {neonInstallations:14,riftSigils:1};
}
