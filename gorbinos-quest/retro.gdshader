shader_type spatial;
render_mode unshaded, cull_disabled;
uniform sampler2D tile : source_color, filter_nearest, repeat_enable;
uniform vec4 tint : source_color = vec4(1.0);
uniform vec2 tiling = vec2(1.0);
uniform bool snap = true;
uniform vec3 fog_color = vec3(0.36,0.13,0.39);
varying float distance_to_eye;
void vertex() {
 vec4 clip = PROJECTION_MATRIX * MODELVIEW_MATRIX * vec4(VERTEX, 1.0);
 distance_to_eye = length((MODELVIEW_MATRIX*vec4(VERTEX,1.0)).xyz);
 if (snap && clip.w > 0.0) {
  clip.xy = floor(clip.xy / clip.w * vec2(320.0,180.0)+0.5) / vec2(320.0,180.0) * clip.w;
 }
 POSITION=clip;
}
void fragment() {
 vec3 c=texture(tile,UV*tiling).rgb*tint.rgb;
 float shade=0.75+0.25*abs(dot(normalize(NORMAL),normalize(vec3(0.3,0.8,0.4))));
 c=floor(c*shade*31.0)/31.0;
 ALBEDO=mix(c,fog_color,clamp((distance_to_eye-45.0)/145.0,0.0,0.82));
}
