import * as THREE from '../vendor/three.module.js';

// Perspective interpolation of (uv*w, w), followed by division in the fragment
// shader, cancels the GPU's 1/w interpolation. The result is screen-linear UVs.
const vertexShader = `
uniform vec2 rasterSize;
uniform float vertexSnap;
uniform float repeatUV;
uniform vec3 tint;
uniform float unlit;
varying vec3 affineUV;
varying vec2 perspectiveUV;
varying vec4 affineColor;
varying float fogDepth;
varying vec3 surfaceView;
void main() {
  vec4 view = modelViewMatrix * vec4(position, 1.0);
  vec4 clip = projectionMatrix * view;
  vec3 n = normalize(mat3(modelMatrix) * normal);
  float diffuse = max(dot(n, normalize(vec3(-0.45, 0.85, 0.4))), 0.0);
  vec3 illumination = vec3(0.58, 0.58, 0.69) + diffuse * vec3(0.58, 0.49, 0.35);
  vec3 lit = color * tint * mix(illumination, vec3(1.0), unlit);
  affineColor = vec4(lit * clip.w, clip.w);
  affineUV = vec3(uv * repeatUV * clip.w, clip.w);
  perspectiveUV = uv * repeatUV;
  fogDepth = -view.z;
  surfaceView = view.xyz;
  if (vertexSnap > 0.5 && clip.w > 0.0) {
    vec2 raster = (clip.xy / clip.w * 0.5 + 0.5) * rasterSize;
    clip.xy = ((floor(raster) + 0.5) / rasterSize * 2.0 - 1.0) * clip.w;
  }
  gl_Position = clip;
}`;
const fragmentShader = `
uniform sampler2D tex;
uniform float affine;
uniform float debugUV;
uniform float groundRelief;
uniform vec3 fogColor;
uniform vec2 fogRange;
varying vec3 affineUV;
varying vec2 perspectiveUV;
varying vec4 affineColor;
varying float fogDepth;
varying vec3 surfaceView;
void main() {
  // Close pavement keeps a little swim, without the near-plane triangle smear.
  // Walls, enemies and distant ground retain the original full affine mapping.
  float groundWeight = mix(0.12, 1.0, smoothstep(2.0, 7.0, length(surfaceView)));
  float warp = affine * mix(1.0, groundWeight, groundRelief);
  vec2 uv = mix(perspectiveUV, affineUV.xy / affineUV.z, warp);
  if (debugUV > 0.5) { gl_FragColor = vec4(uv, 0.0, 1.0); return; }
  vec3 sampled = texture2D(tex, uv).rgb;
  vec3 lit = sampled * affineColor.rgb / affineColor.w;
  float fog = clamp((fogDepth - fogRange.x) / (fogRange.y - fogRange.x), 0.0, 1.0);
  gl_FragColor = vec4(mix(lit, fogColor, fog), 1.0);
}`;
const postFragment = `
uniform sampler2D frame;
uniform float dither;
varying vec2 vUv;
float psxDither(vec2 p) {
  int x = int(mod(p.x, 4.0)); int y = int(mod(p.y, 4.0));
  if (y == 0) { if (x == 0) return -4.; if (x == 1) return 0.; if (x == 2) return -3.; return 1.; }
  if (y == 1) { if (x == 0) return 2.; if (x == 1) return -2.; if (x == 2) return 3.; return -1.; }
  if (y == 2) { if (x == 0) return -3.; if (x == 1) return 1.; if (x == 2) return -4.; return 0.; }
  if (x == 0) return 3.; if (x == 1) return -1.; if (x == 2) return 2.; return -2.;
}
void main() {
  vec3 c = texture2D(frame, vUv).rgb;
  vec3 rgb5 = floor(clamp(c * 255.0 + psxDither(gl_FragCoord.xy) * dither, 0.0, 255.0) / 8.0) / 31.0;
  gl_FragColor = vec4(rgb5, 1.0);
}`;

export class PSXPipeline {
  constructor(canvas, { height = 240, ditherStrength = 1 } = {}) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(1);
    // Palette values are authored in display space, like the original 5-bit GPU.
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.height = height;this.ditherStrength=ditherStrength;
    this.options = { affine: true, vertexSnap: true, dither: true };
    this.size = new THREE.Vector2(320, height);
    this.materials = new Set();
    this.fogColor = new THREE.Color('#716578').convertLinearToSRGB();
    this.white = new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1); this.white.needsUpdate=true;
    this.target = new THREE.WebGLRenderTarget(320,height,{ minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:true,stencilBuffer:false });
    this.target.texture.generateMipmaps=false;
    this.processed=this.target.clone();this.processed.texture.generateMipmaps=false;
    this.outputSize=new THREE.Vector2(320,height);
    this.present=new THREE.Scene();this.presentCamera=new THREE.Camera();
    this.presentMaterial=new THREE.ShaderMaterial({uniforms:{frame:{value:this.processed.texture}},vertexShader:'varying vec2 uvOut;void main(){uvOut=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:'uniform sampler2D frame;varying vec2 uvOut;void main(){gl_FragColor=texture2D(frame,uvOut);}',depthTest:false,depthWrite:false});
    this.present.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.presentMaterial));
    this.post = new THREE.Scene();
    this.postCamera = new THREE.Camera();
    this.postMaterial = new THREE.ShaderMaterial({
      uniforms:{ frame:{value:this.target.texture},dither:{value:ditherStrength} },
      vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader:postFragment,depthTest:false,depthWrite:false,
    });
    this.post.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.postMaterial));
  }
  resize(width,height) {
    const w=Math.max(160,Math.round(this.height*width/height/8)*8);
    this.size.set(w,this.height); this.target.setSize(w,this.height);this.processed.setSize(w,this.height);
    this.outputSize.set(Math.max(1,Math.round(width)),Math.max(1,Math.round(height)));
    this.renderer.setSize(this.outputSize.x,this.outputSize.y,false);
    return w/this.height;
  }
  material(color=0xffffff,tex=this.white,repeat=1,unlit=0,extra={}) {
    const material=new THREE.ShaderMaterial({
      uniforms:{rasterSize:{value:this.size},vertexSnap:{value:Number(this.options.vertexSnap)},repeatUV:{value:repeat},tint:{value:new THREE.Color(color).convertLinearToSRGB()},unlit:{value:unlit},tex:{value:tex},affine:{value:Number(this.options.affine)},debugUV:{value:0},groundRelief:{value:0},fogColor:{value:this.fogColor},fogRange:{value:new THREE.Vector2(18,65)},...extra},
      vertexShader,fragmentShader,vertexColors:true,
    });
    this.materials.add(material);return material;
  }
  configure(changes) {
    Object.assign(this.options,changes);
    for(const m of this.materials){m.uniforms.affine.value=Number(this.options.affine);m.uniforms.vertexSnap.value=Number(this.options.vertexSnap)}
    this.postMaterial.uniforms.dither.value=Number(this.options.dither)*this.ditherStrength;
  }
  render(scene,camera,foreground,foregroundCamera) {
    const r=this.renderer;r.setRenderTarget(this.target);r.autoClear=true;r.render(scene,camera);
    // Quantize/dither at the original world raster, then nearest-upscale it.
    r.setRenderTarget(this.processed);r.render(this.post,this.postCamera);
    r.setRenderTarget(null);r.render(this.present,this.presentCamera);
    // Player anatomy and equipment are composited afterwards at native size.
    if(foreground){r.autoClear=false;r.clearDepth();r.render(foreground,foregroundCamera);r.autoClear=true;}
  }
  get diagnostics(){return {resolution:this.size.toArray(),gearResolution:this.outputSize.toArray(),gearPass:'native / perspective / unquantized',...this.options,colorDepth:'RGB555',filter:'nearest',interpolation:this.options.affine?'screen-space affine':'perspective-correct'}}
}
