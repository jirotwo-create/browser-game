import * as T from '../vendor/three.module.js';
import {paintGearTexture} from './painted-surfaces.js';
const white=new T.DataTexture(new Uint8Array([255,255,255,255]),1,1);white.needsUpdate=true;
// Full-resolution equipment surfaces. Ordinary perspective interpolation, no
// raster snapping, affine varyings, fog or RGB555 pass. Authored paint uses point sampling.
export const gearClock={value:0};
const vertex=`varying vec3 surfaceNormal; varying vec3 surfacePosition; varying vec3 localPosition;varying vec2 paintedUV;
void main(){vec4 p=modelViewMatrix*vec4(position,1.);surfacePosition=p.xyz;surfaceNormal=normalMatrix*normal;localPosition=position;paintedUV=uv;gl_Position=projectionMatrix*p;}`;
const fragment=`uniform vec3 tint;uniform float time;uniform float metallic;uniform float polish;uniform float emission;uniform float sheen;uniform sampler2D paint;uniform float painted;
varying vec3 surfaceNormal;varying vec3 surfacePosition;varying vec3 localPosition;varying vec2 paintedUV;
void main(){
 vec3 n=normalize(surfaceNormal),v=normalize(-surfacePosition),r=reflect(-v,n);
 float diffuse=.24+.72*max(0.,dot(n,normalize(vec3(-.45,.8,.8))));
 float rim=pow(1.-max(0.,dot(n,v)),3.);
 float strip=pow(max(0.,dot(r,normalize(vec3(-.4,.8,1.)))),mix(12.,150.,polish));
 float second=pow(max(0.,dot(r,normalize(vec3(.8,-.1,.8)))),64.);
 vec3 reflected=mix(vec3(.018,.023,.036),vec3(.055,.085,.13),smoothstep(-.65,.65,r.y));
 reflected+=vec3(.10,.18,.27)*pow(max(0.,1.-abs(r.y-.15)*8.),4.);
 reflected+=vec3(.36,.08,.21)*pow(max(0.,r.x),8.);
 float band=pow(max(0.,1.-abs(localPosition.y-(fract(time*.23)*1.5-.2))/.075),3.);
 vec3 base=mix(tint*diffuse,tint*.36+reflected*.65,metallic);
 base+=strip*mix(.08,1.2,metallic)*vec3(.84,.94,1.)+second*metallic*vec3(.18,.45,.6)+rim*vec3(.06,.11,.16)*metallic;
 base+=band*sheen*(.2+.8*max(0.,n.z))*vec3(.7,.88,1.);
 vec3 pigment=texture2D(paint,paintedUV).rgb;
 base=mix(base,base*mix(vec3(.28),vec3(1.4),pigment),painted);
 gl_FragColor=vec4(mix(base,tint,emission),1.);
}`;
export function gearSurface(color,{metallic=0,polish=.4,emission=0,sheen=0,texture=null}={}){
 const m=new T.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{tint:{value:new T.Color(color).convertLinearToSRGB()},time:gearClock,metallic:{value:metallic},polish:{value:polish},emission:{value:emission},sheen:{value:sheen},paint:{value:texture||white},painted:{value:texture?1:0}},side:T.DoubleSide});m.name='native-resolution-gear';return m;
}
export function makeGearPalette(){
 const painted=(kind,color,options={})=>gearSurface(color,{...options,texture:paintGearTexture(kind)});
 const steel=gearSurface(0x090d15,{metallic:1,polish:.93,sheen:.85});steel.name='polished-black-steel-animated-sheen';
 const metal=gearSurface(0x293644,{metallic:.95,polish:.8});
 return {steel,metal,edge:gearSurface(0xb3bfca,{metallic:1,polish:.95}),obsidian:steel,
 black:gearSurface(0x090d13,{metallic:.65}),dark:gearSurface(0x121a25),coat:painted('coat',0x646070),glove:painted('glove',0x454b58),leather:gearSurface(0x1f0c16),
 skin:painted('skin',0xc4a18b),skinDeep:painted('skin',0x94715e),skinPale:painted('skin',0xd7bca3),
 pistolSerial:painted('serial',0xffffff),pistolSight:gearSurface(0xb447be,{emission:.65}),pistolSteel:painted('steel',0xb3bdcc,{metallic:.6,polish:.4}),pistolFrame:painted('frame',0x737f93,{metallic:.35,polish:.35}),trousers:painted('trousers',0x655467),boot:painted('boot',0x454c5b),
 crimson:gearSurface(0xb80826,{emission:1}),acid:gearSurface(0xffc86a,{emission:1}),red:gearSurface(0xff3159,{emission:1}),
 gold:gearSurface(0x866842,{metallic:1,polish:.9}),ruby:gearSurface(0x73051b,{metallic:.55,polish:1}),bone:gearSurface(0xd3bf9a,{polish:.3}),cyan:gearSurface(0x2de9f7,{emission:1})};
}
