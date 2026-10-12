export function icon(name, cls='') {
 const paths={
 sword:'<path d="m19 3 2 2-9 11-3-3z"/><path d="m5 12 7 7M8 16l-5 5m1-3 2 2"/>',
 armor:'<path d="m8 3-5 4 3 5v8l6 2 6-2v-8l3-5-5-4-4 3z"/><path d="m8 8 4 3 4-3m-4 3v8"/>',
 scythe:'<path d="M8 3v19M4 5c9-6 16 0 16 8-4-5-8-6-12-6"/>',
 skull:'<path d="M6 15c-7-11 3-16 9-11 5 3 5 10 2 12v5H7v-5z"/><path d="m7 10 3 1m4 0 3-1m-6 10v-3m3 3v-3m-2-4v2"/>',
 drop:'<path d="M12 2c-2 5-8 9-8 14a8 8 0 0 0 16 0c0-5-6-9-8-14z"/><path d="m7 16 2 3"/>',
 bone:'<path d="M6 8C0 8 3 0 7 4c3-3 6 0 3 3l7 7c3-3 6 0 3 3 4 4-4 7-4 1L8 10z"/>',
 shield:'<path d="m12 2 9 4-2 12-7 5-7-5L3 6z"/><path d="M12 6v12M7 10h10"/>',
 crown:'<path d="m3 5 5 6 4-8 4 8 5-6-3 14H6z"/><path d="M6 22h12"/>',
 flame:'<path d="M12 2c4 7-3 7 3 12l3-5c8 14-10 18-13 9-2-6 5-8 7-16z"/><path d="M12 15c-7 9 7 9 0 0"/>',
 rune:'<path d="M12 2v20m-7-6 14-8M5 8l14 8M5 3v5m14 8v5"/>',
 eye:'<path d="M2 12s8-13 20 0c-12 13-20 0-20 0z"/><path d="m12 7 3 5-3 5-3-5z"/>',
 moon:'<path d="M17 3C1-3-3 18 11 22c5 1 9-2 11-6C10 19 6 9 17 3z"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="m12 6 4 6-4 6-4-6z"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 book:'<path d="M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2zm0 0v16"/>',
 fire:'<path d="M12 2c4 7-3 7 3 12l3-5c8 14-10 18-13 9-2-6 5-8 7-16z"/>',
 plus:'<path d="M12 4v16M4 12h16"/>',
 check:'<path d="m5 12 4 4L20 5"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
 sound:'<path d="m4 9 4 0 5-5v16l-5-5H4zm13-2c4 2 4 8 0 10"/>'
 };
 return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.rune}</svg>`;
}
export function scene(kind='knight') {
 return `<div class="world-viewport" data-monster="${kind}"><img class="world-art baked-3d" src="assets/renders/monster-${kind}.png" alt="Low-poly 3D ${kind} rendered in a ruined gothic cathedral"><span class="viewport-label">REALTIME 3D · DRAG TO ROTATE</span></div>`;
}
export function gearArt(id,name='Equipment') {
 return `<img class="gear-render" src="assets/renders/gear-${id}.png" alt="${name}, a textured low-poly 3D model" loading="lazy">`;
}
export function skillArt(id,name='Talent') {
 return `<img class="skill-render" src="assets/renders/skill-${id}.png" alt="${name} talent icon" loading="lazy">`;
}
