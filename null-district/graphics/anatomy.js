import * as THREE from '../vendor/three.module.js';

// Anatomical cross-sections: an oval contour with independent centers/radii at
// each level. Unlike a bevelled box, every ring defines a different silhouette.
export function organic(rings, sides=9) {
  const p=[],uv=[],colors=[];
  const vertices=rings.map(([y,rx,rz,cx=0,cz=0])=>Array.from({length:sides},(_,i)=>{
    const a=i/sides*Math.PI*2;return [cx+Math.sin(a)*rx,y,cz+Math.cos(a)*rz];
  }));
  function tri(a,b,c,ta,tb,tc,shade=1){for(const [v,t]of [[a,ta],[b,tb],[c,tc]]){p.push(...v);uv.push(...t);colors.push(shade,shade,shade)}}
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<sides;i++){
    const k=(i+1)%sides,a=vertices[j][i],b=vertices[j][k],c=vertices[j+1][k],d=vertices[j+1][i];
    const lo=i/sides,hi=(i+1)/sides,v=j/(rings.length-1),w=(j+1)/(rings.length-1);
    const shade=.88+((i+j*3)%5)*.03;
    tri(a,b,c,[lo,v],[hi,v],[hi,w],shade);tri(a,c,d,[lo,v],[hi,w],[lo,w],shade);
  }
  for(const end of [0,rings.length-1]){const r=vertices[end],c=[rings[end][3]||0,rings[end][0],rings[end][4]||0];for(let i=0;i<sides;i++){
    const a=r[i],b=r[(i+1)%sides];if(end===0)tri(c,b,a,[.5,.5],[1,0],[0,0]);else tri(c,a,b,[.5,.5],[0,0],[1,0]);
  }}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
}
export function polygonPrism(outline,depth=.04,ridge=.03){
  const points=outline.map(([x,y])=>new THREE.Vector2(x,y));const triangles=THREE.ShapeUtils.triangulateShape(points,[]),p=[],uv=[],color=[];
  const maxY=Math.max(...outline.map(v=>v[1])),minY=Math.min(...outline.map(v=>v[1]));
  const put=(v,shade)=>{p.push(...v);uv.push(v[0]*2+.5,(v[1]-minY)/Math.max(.01,maxY-minY));color.push(shade,shade,shade)};
  for(const [a,b,c]of triangles){for(const side of [1,-1]){const indices=side===1?[a,b,c]:[c,b,a];const center=indices.reduce((s,i)=>[s[0]+outline[i][0]/3,s[1]+outline[i][1]/3],[0,0]);for(let j=0;j<3;j++){
    const v=outline[indices[j]],w=outline[indices[(j+1)%3]];put([v[0],v[1],side*depth/2],.82);put([w[0],w[1],side*depth/2],.95);put([center[0],center[1],side*(depth/2+ridge)],1);
  }}}
  for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length];for(const v of [[...a,-depth/2],[...b,-depth/2],[...b,depth/2],[...a,-depth/2],[...b,depth/2],[...a,depth/2]])put(v,.65)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(color,3));g.computeVertexNormals();return g;
}
export function faceGeometry(){
  // Eyebrows, nasal bridge, cheek bones, lips and chin are actual vertices.
  const vertices=[[-.12,1.84,.06],[.12,1.84,.06],[-.155,1.76,.065],[.155,1.76,.065],[-.13,1.67,.09],[.13,1.67,.09],[-.075,1.59,.085],[.075,1.59,.085],[0,1.575,.12],[0,1.83,.115],[0,1.735,.155],[0,1.68,.205],[-.036,1.675,.155],[.036,1.675,.155],[0,1.635,.135],[0,1.605,.125],[-.07,1.705,.135],[.07,1.705,.135],[-.15,1.72,-.02],[.15,1.72,-.02],[-.1,1.61,-.01],[.1,1.61,-.01]];
  const indices=[[0,9,2],[9,10,2],[9,1,10],[1,3,10],[2,10,16],[3,17,10],[10,11,12],[10,13,11],[10,12,16],[10,17,13],[16,12,4],[17,5,13],[12,11,14],[11,13,14],[4,12,14],[13,5,14],[4,14,6],[14,15,6],[14,5,7],[14,7,15],[6,15,8],[15,7,8],[2,16,4],[3,5,17],[18,2,4],[18,4,20],[20,4,6],[20,6,8],[19,5,3],[19,21,5],[21,7,5],[21,8,7]];
  const p=[],uv=[],colors=[];for(const [j,t]of indices.entries())for(const i of [t[0],t[2],t[1]]){const v=vertices[i];p.push(...v);uv.push((v[0]+.16)/.32,(v[1]-1.57)/.28);const s=j%4===0?.88:1;colors.push(s,s,s)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
}
