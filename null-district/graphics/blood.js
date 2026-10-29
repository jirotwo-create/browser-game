import * as T from '../vendor/three.module.js';
// World geometry uses the existing affine / snapped / RGB555 pipeline.
export function createBlood(world,solids,materials,random=Math.random){
 const drops=[],stains=[];let sprays=0;
 const droplet=new T.IcosahedronGeometry(1,0),ray=new T.Raycaster();
 function remove(mesh){world.remove(mesh);if(mesh.geometry!==droplet)mesh.geometry.dispose();}
 function stain(point,normal,radius){
  const vertices=[],uv=[],colors=[],count=13;
  const outline=Array.from({length:count},(_,i)=>{const a=i/count*Math.PI*2,r=radius*(.58+random()*.55);return [Math.cos(a)*r,Math.sin(a)*r,0]});
  for(let i=0;i<count;i++)for(const v of [[0,0,0],outline[i],outline[(i+1)%count]]){vertices.push(...v);uv.push(.5+v[0]/(radius*3),.5+v[1]/(radius*3));const c=.55+random()*.35;colors.push(c,c,c);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();
  const mesh=new T.Mesh(g,materials.bloodPool);mesh.name='persistent-blood-splatter';mesh.position.copy(point).addScaledVector(normal,.015+random()*.006);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),normal);world.add(mesh);stains.push({mesh,ttl:120});
  if(stains.length>128)remove(stains.shift().mesh);
 }
 function spray(point,direction,{sword=false,killed=false}={}){
  sprays++;const count=(sword?18:10)+(killed?8:0);
  for(let i=0;i<count;i++){
   const mesh=new T.Mesh(droplet,materials.crimson);mesh.name='airborne-blood';mesh.position.copy(point);mesh.scale.set(.022+random()*.035,.04+random()*.08,.02+random()*.03);world.add(mesh);
   drops.push({mesh,velocity:new T.Vector3((random()-.5)*3.8,1+random()*2.2,(random()-.5)*3.8).addScaledVector(direction,1+random()*2),ttl:2});
   if(drops.length>96)remove(drops.shift().mesh);
  }
  ray.set(point.clone().addScaledVector(direction,.08),direction);const hit=ray.intersectObjects(solids.map(s=>s.mesh),true).find(h=>h.distance<3.5);
  if(hit?.face){const normal=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);if(normal.dot(direction)>0)normal.negate();stain(hit.point,normal,sword?.48:.3);}
  if(killed)stain(new T.Vector3(point.x,.025,point.z),new T.Vector3(0,1,0),.6);
 }
 function tick(dt){
  for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.ttl-=dt;d.velocity.y-=dt*9.8;d.mesh.position.addScaledVector(d.velocity,dt);d.mesh.rotation.x+=dt*4;
   if(d.mesh.position.y<.04){stain(new T.Vector3(d.mesh.position.x,.025,d.mesh.position.z),new T.Vector3(0,1,0),.06+random()*.1);d.ttl=0;}
   if(d.ttl<=0){remove(d.mesh);drops.splice(i,1);}
  }
  for(let i=stains.length-1;i>=0;i--){const s=stains[i];s.ttl-=dt;if(s.ttl<15)s.mesh.scale.setScalar(Math.max(0,s.ttl/15));if(s.ttl<=0){remove(s.mesh);stains.splice(i,1);}}
 }
 return {spray,tick,dispose(){for(const d of drops)remove(d.mesh);for(const s of stains)remove(s.mesh);drops.length=stains.length=0;droplet.dispose();},get diagnostics(){return {sprays,droplets:drops.length,stains:stains.length,maxDroplets:96,maxStains:128}}};
}
