import * as THREE from '../vendor/three.module.js';
import {paintHumanSurface} from './human-surfaces.js';

import {materialStudy} from './material-studies.js';
// 512px layered grime studies, point sampled with discrete point mip levels.
// Mips reduce distant sparkle without bilinear blur; affine mapping is unchanged.
export function paintTexture(kind){
 const c=materialStudy(kind,512),t=new THREE.CanvasTexture(c);
 const ground=['road','cathedral-floor','terminal-floor','roof-floor'].includes(kind);
 t.magFilter=THREE.NearestFilter;t.minFilter=ground?THREE.NearestFilter:THREE.NearestMipmapNearestFilter;t.generateMipmaps=!ground;
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=1;t.name=`noir-512-${kind}`;return t;
}
export function makePalette(pipeline){
 // Only the pavement material opts into near-ground affine relief.
 pipeline.fogColor.set('#252b3b').convertLinearToSRGB();
 const textures=Object.fromEntries(['wall','windows','road','hazard','coat','shutter','circuit','metal','rust','skin','glove','blade','leather','brick','ceramic','poster','drain','puddle','stone','bone','flesh','cathedral-floor','terminal-floor','roof-floor'].map(k=>[k,paintTexture(k)]));
 for(const kind of ['face','skin','cloth','armor','robe'])textures['npc-'+kind]=paintHumanSurface(kind);
 const m=(color,texture,unlit=0)=>pipeline.material(color,textures[texture],1,unlit,{groundRelief:{value:['road','drain','puddle'].includes(texture)?1:0}});
 return {textures,materials:{npcCoat:m(0xb9c3cf,'npc-cloth'),npcDark:m(0x7d899b,'npc-cloth'),npcGlove:m(0x657186,'npc-cloth'),npcSkin:m(0xe1ccb6,'npc-skin'),npcSkinDeep:m(0xb6927b,'npc-skin'),npcSkinPale:m(0xeadcce,'npc-skin'),npcFace:m(0xe1ccb6,'npc-face'),npcFaceDeep:m(0xb6927b,'npc-face'),npcFacePale:m(0xeadcce,'npc-face'),npcMetal:m(0xb7c8d9,'npc-armor'),npcObsidian:m(0x66748a,'npc-armor'),npcRobe:m(0x9d5e86,'npc-robe'),npcLeather:m(0x86716c,'npc-cloth'),npcHair:pipeline.material(0x29313c),npcEye:pipeline.material(0xc9c4b9,undefined,1,.3),brick:m(0xc4b4b8,'brick'),ceramic:m(0xbccbd2,'ceramic'),poster:m(0xd5d2c3,'poster'),drain:m(0xabb9c8,'drain'),puddle:m(0x8ea4ba,'puddle'),neonCyan:m(0x21edff,undefined,1),neonPink:m(0xff298c,undefined,1),neonViolet:m(0x9d4dff,undefined,1),neonAmber:m(0xffa33d,undefined,1),neonGreen:m(0x69ffac,undefined,1),arcane:m(0xc04bff,undefined,1),stone:m(0xb1aaa0,'stone'),bone:m(0xd0c7a0,'bone'),robe:m(0x6b3153,'coat'),beast:m(0xc6949a,'flesh'),wall:m(0xc3c6d2,'wall'),windows:m(0xb2b4a0,'windows'),road:m(0xaab8ca,'road'),metal:m(0xc0c9d5,'metal'),rust:m(0xc9b1a4,'rust'),hazard:m(0xb5ad81,'hazard'),coat:m(0xb2b7a2,'coat'),glove:m(0xafb29f,'glove'),shutter:m(0xb8bca4,'shutter'),circuit:m(0xa8b893,'circuit',1),dark:m(0x7e8575,'coat'),black:m(0x6d766a,'glove'),skin:m(0xd2c7ad,'skin'),skinDeep:m(0x9c8b71,'skin'),skinPale:m(0xe0d5bd,'skin'),eye:pipeline.material(0x9e9f8c),lip:pipeline.material(0x655344),hair:m(0x555b4e,'coat'),obsidian:m(0x777f73,'blade'),edge:m(0xa2a98f,'metal'),crimson:pipeline.material(0x771b15,undefined,1,1),leather:m(0x96977e,'leather'),pink:pipeline.material(0xb19b85,undefined,1,1),cyan:pipeline.material(0x8c9c81,undefined,1,1),acid:pipeline.material(0xbcb286,undefined,1,1),red:pipeline.material(0xa94b30,undefined,1,1)}};
}
