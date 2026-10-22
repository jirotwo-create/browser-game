import * as T from '../vendor/three.module.js';
// Raised triangular planes describe form; all original boundaries and UVs stay
// joined. Applied only to character/gear meshes, never to the environment.
export function chisel(geometry,depth=.055){
 const g=geometry.index?geometry.toNonIndexed():geometry.clone(),p=g.attributes.position,uv=g.attributes.uv,col=g.attributes.color;
 const positions=[],uvs=[],colors=[],a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();
 for(let i=0;i<p.count;i+=3){
  a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);
  const n=b.clone().sub(a).cross(c.clone().sub(a)).normalize(),amount=Math.min(.018,a.distanceTo(b)*depth,b.distanceTo(c)*depth,c.distanceTo(a)*depth);
  const center=a.clone().add(b).add(c).multiplyScalar(1/3).addScaledVector(n,amount);
  const tex=[0,0],shade=[0,0,0];for(let j=0;j<3;j++){tex[0]+=(uv?.getX(i+j)||0)/3;tex[1]+=(uv?.getY(i+j)||0)/3;for(let k=0;k<3;k++)shade[k]+=(col?col.array[(i+j)*3+k]:1)/3;}
  for(let edge=0;edge<3;edge++)for(const index of [edge,(edge+1)%3,-1]){
   const v=index<0?center:[a,b,c][index];positions.push(v.x,v.y,v.z);uvs.push(index<0?tex[0]:uv?.getX(i+index)||0,index<0?tex[1]:uv?.getY(i+index)||0);
   for(let k=0;k<3;k++)colors.push((index<0?shade[k]:col?col.array[(i+index)*3+k]:1)*[.82,1,.91][edge]);
  }
 }
 g.dispose();const result=new T.BufferGeometry();result.setAttribute('position',new T.Float32BufferAttribute(positions,3));result.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));result.setAttribute('color',new T.Float32BufferAttribute(colors,3));result.computeVertexNormals();return result;
}
export function chiselCharacter(root){
 root.traverse(o=>{if(!o.isMesh)return;const original=o.geometry;o.geometry=chisel(original);original.dispose();});
 // Merge only siblings sharing a material. Joint and prop transforms survive.
 root.traverse(group=>{
  const batches=new Map();for(const child of [...group.children])if(child.isMesh&&!child.userData.independentPose){let batch=batches.get(child.material);if(!batch)batches.set(child.material,batch=[]);batch.push(child);}
  for(const [material,objects]of batches){if(objects.length<2)continue;const arrays={position:[],normal:[],uv:[],color:[]};
   for(const o of objects){o.updateMatrix();const geo=o.geometry.clone().applyMatrix4(o.matrix);for(const key of Object.keys(arrays))arrays[key].push(...geo.attributes[key].array);geo.dispose();o.geometry.dispose();group.remove(o);}
   const geometry=new T.BufferGeometry();for(const[key,values]of Object.entries(arrays))geometry.setAttribute(key,new T.Float32BufferAttribute(values,key==='uv'?2:3));geometry.computeBoundingSphere();const m=new T.Mesh(geometry,material);m.name='sculpted-triangular-character-planes';group.add(m);
  }
 });
}
export function blackBladeGeometry(){
 // A traditional symmetrical, double-edged diamond section: ricasso, distal
 // taper and acute point. Four long bevels catch the moving polished sheen.
 const rings=[[.20,.067,.018],[.32,.067,.027],[.40,.080,.032],[.80,.064,.027],[1.02,.043,.020],[1.19,0,0]],p=[],uv=[];
 const ring=([y,w,d])=>[[-w,y,0],[0,y,d],[w,y,0],[0,y,-d]];
 for(let i=0;i<rings.length-1;i++){const a=ring(rings[i]),b=ring(rings[i+1]);for(let k=0;k<4;k++){const j=(k+1)%4;for(const v of [a[k],a[j],b[j],a[k],b[j],b[k]]){p.push(...v);uv.push(v[0]*4+.5,v[1]);}}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
