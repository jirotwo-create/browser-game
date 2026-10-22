import * as T from '../vendor/three.module.js';
import { makeGuard, mesh, plate, cylinder, countTriangles } from './models.js';
import { chiselCharacter } from './sculpt.js';
import { organic, polygonPrism } from './anatomy.js';

// Combat tuning lives beside the authored silhouettes: a type is more than a recolor.
export const ENEMY_TYPES=Object.freeze({
 sable:{name:'SABLE rifleman',faction:'Corporate',species:'human',role:'rifle',hp:3,speed:1.5,range:12,damage:5,windup:.65,cooldown:2.7,color:0x37e6ff},
 razor:{name:'Razor street runner',faction:'Street syndicate',species:'human',role:'melee',hp:3,speed:3.5,range:1.65,damage:9,windup:.55,cooldown:1.8,color:0xff3c99},
 netrunner:{name:'HEX netrunner',faction:'Street syndicate',species:'human',role:'bolt',hp:3,speed:1.4,range:13,damage:8,windup:.85,cooldown:2.8,projectileSpeed:8,color:0x32ffff},
 riot:{name:'Bastion riot officer',faction:'Corporate',species:'human',role:'burst',hp:6,speed:.95,range:11,damage:8,windup:.9,cooldown:3.3,color:0xffb14d},
 knight:{name:'Ashbound black knight',faction:'Ashen court',species:'human',role:'melee',hp:6,speed:1.9,range:2.25,damage:14,windup:.85,cooldown:2.5,color:0xff713e},
 arbalist:{name:'Thorn oath arbalist',faction:'Ashen court',species:'human',role:'bolt',hp:3,speed:1.3,range:14,damage:10,windup:.9,cooldown:3,projectileSpeed:11,color:0xafd85d},
 warlock:{name:'Veil blood warlock',faction:'Veiled covenant',species:'human',role:'orb',hp:4,speed:1.1,range:13,damage:11,windup:1.1,cooldown:3.4,projectileSpeed:6,color:0xbb5cff},
 hound:{name:'Rift hound',faction:'Breachborn',species:'rift beast',role:'melee',hp:3,speed:4.1,range:1.8,damage:10,windup:.6,cooldown:1.9,color:0xff3964},
 revenant:{name:'Ossuary revenant',faction:'Breachborn',species:'undead',role:'melee',hp:4,speed:1.6,range:2.2,damage:12,windup:.8,cooldown:2.6,color:0x64ffb0},
 gargoyle:{name:'Cathedral winged sentinel',faction:'Breachborn',species:'stone demon',role:'orb',hp:9,speed:.8,range:15,damage:14,windup:1.2,cooldown:3.7,projectileSpeed:6.5,color:0xff753f}
});
function spike(parent,m,a,b,r=.045){const d=new T.Vector3(...b).sub(new T.Vector3(...a));const o=mesh(parent,new T.ConeGeometry(r,d.length(),5),m,...new T.Vector3(...a).addScaledVector(d,.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o}
function rod(parent,m,a,b,r=.035){const d=new T.Vector3(...b).sub(new T.Vector3(...a));const o=mesh(parent,new T.CylinderGeometry(r*.8,r,d.length(),6),m,...new T.Vector3(...a).addScaledVector(d,.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o}
function blade(parent,m,length=.7){const g=new T.Group();parent.add(g);mesh(g,polygonPrism([[-.035,0],[.045,0],[.045,length*.7],[0,length],[-.04,length*.75]],.025,.018),m.edge);plate(g,m.obsidian,.24,.04,.055,0,-.015,0);cylinder(g,m.leather,.028,.16,6,0,-.1,0);return g}
function human(m,type,variant){
 const info=ENEMY_TYPES[type],fantasy=['knight','arbalist','warlock'].includes(type);
 const rig=makeGuard(m,variant),{g,head,torso,arms}=rig;
 // Remove the standard pistol before authoring the archetype's held equipment.
 const fore=arms[1].userData.forearm,oldWeapon=fore.children.at(-1);fore.remove(oldWeapon);oldWeapon.geometry.dispose();
 const accent=type==='razor'?m.neonPink:type==='riot'?m.neonAmber:fantasy?m.arcane:m.neonCyan;
 const props=[];
 if(!fantasy){
  for(const side of [-1,1]){plate(torso,accent,.025,.24,.018,side*.14,1.26,.15);plate(head,accent,.045,.025,.025,side*.12,1.74,.10)}
  plate(torso,m.black,.16,.17,.04,0,1.22,.17);
 }
 if(type==='sable'||type==='riot'){
  const rifle=mesh(fore,organic([[-.12,.045,.055],[.35,.052,.065]],6),m.metal,0,-.31,.18);rifle.rotation.x=Math.PI/2+.5;
  if(type==='riot'){
   mesh(torso,organic([[.94,.22,.16],[1.27,.29,.19],[1.46,.24,.14]],8),m.metal);
   const shield=mesh(arms[0],polygonPrism([[-.24,-.5],[.22,-.5],[.25,.42],[0,.57],[-.25,.42]],.045,.025),m.black,0,-.3,.19);props.push(shield);
   plate(shield,m.neonAmber,.29,.06,.025,0,.15,.045);
   mesh(head,organic([[1.80,.16,.145],[1.95,.12,.115],[2.01,.06,.07]],8),m.metal,0,0,-.04);
  }
 }
 if(type==='razor'){
  const machete=blade(fore,m,.5);machete.position.set(0,-.33,.12);machete.rotation.x=-1.5;props.push(machete);
  for(const side of [-1,1])for(let i=0;i<3;i++)spike(torso,m.metal,[side*.22,1.42,-.04+i*.055],[side*.35,1.60,-.04+i*.055],.025);
  mesh(head,organic([[1.88,.035,.11],[2.13,.015,.04]],5),m.neonPink,0,0,-.04);
 }
 if(type==='netrunner'){
  mesh(torso,organic([[.49,.26,.16],[.98,.20,.13],[1.4,.25,.14]],8),m.coat,0,0,-.06);
  for(let i=0;i<3;i++)plate(fore,m.neonCyan,.1,.027,.04,0,-.22-i*.045,.08);
  const halo=mesh(head,new T.TorusGeometry(.21,.012,3,9),m.neonCyan,0,1.78,-.17);props.push(halo);
  plate(head,m.black,.09,.07,.04,.06,1.74,.16);plate(head,m.neonCyan,.075,.015,.02,.06,1.75,.185);
 }
 if(type==='knight'){
  mesh(head,organic([[1.81,.16,.14],[1.96,.13,.13],[2.04,.045,.065]],8),m.metal,0,0,-.05);
  for(const leg of rig.legs)mesh(leg,organic([[-.38,.072,.09],[-.2,.105,.12],[0,.115,.13]],7),m.metal,0,0,.035);
  for(const arm of arms)mesh(arm.userData.forearm,organic([[-.26,.048,.06],[-.04,.065,.065]],7),m.metal);
  mesh(torso,polygonPrism([[-.2,1.43],[.2,1.43],[.28,.33],[0,.42],[-.28,.33]],.018,.005),m.robe,0,0,-.19);
  mesh(torso,organic([[.84,.20,.15],[1.08,.24,.18],[1.35,.29,.19],[1.48,.20,.13]],9),m.obsidian);
  for(const side of [-1,1]){mesh(torso,new T.IcosahedronGeometry(.17,0),m.metal,side*.3,1.42,0,[1,.7,1]);spike(torso,m.obsidian,[side*.3,1.47,0],[side*.4,1.72,-.03]);spike(head,m.obsidian,[side*.11,1.87,-.05],[side*.24,2.15,-.1]);}
  const sword=blade(fore,m,.95);sword.position.set(0,-.36,.1);sword.rotation.x=-1.1;props.push(sword);
  const shield=mesh(arms[0],polygonPrism([[-.23,.30],[.23,.30],[.22,-.21],[0,-.5],[-.22,-.21]],.035,.04),m.metal,0,-.35,.16);props.push(shield);
  mesh(shield,polygonPrism([[0,-.27],[-.075,0],[0,.19],[.075,0]],.005,.01),m.neonAmber,0,0,.065);
 }
 if(type==='arbalist'){
  mesh(torso,polygonPrism([[-.19,1.44],[.19,1.44],[.29,.47],[0,.35],[-.29,.47]],.02,.005),m.leather,0,0,-.18);
  for(const side of [-1,1])rod(torso,m.leather,[side*.22,1.38,.12],[-side*.15,.94,.16],.028);
  mesh(head,organic([[1.77,.18,.16],[2,.06,.09]],7),m.leather,0,0,-.055);
  const bow=new T.Group();fore.add(bow);bow.position.set(0,-.32,.22);bow.rotation.x=-.8;
  plate(bow,m.leather,.065,.09,.45,0,0,0);rod(bow,m.bone,[-.32,0,.12],[0,.03,.23]);rod(bow,m.bone,[0,.03,.23],[.32,0,.12]);rod(bow,m.metal,[-.32,0,.12],[.32,0,.12],.006);spike(bow,m.edge,[0,0,0],[0,0,.5],.015);props.push(bow);
  for(let i=0;i<3;i++)rod(torso,m.leather,[-.1+i*.08,1,-.2],[-.1+i*.08,1.73,-.2]);
 }
 if(type==='warlock'){
  for(const side of [-1,1])mesh(head,organic([[1.54,.055,.12],[1.76,.06,.14],[1.94,.045,.09]],6),m.robe,side*.13,0,-.03);
  for(const arm of arms)mesh(arm.userData.forearm,organic([[-.27,.075,.07],[-.12,.09,.08],[0,.06,.06]],7),m.robe);
  mesh(torso,organic([[.08,.28,.2],[.38,.26,.16],[1.1,.19,.12],[1.44,.24,.14]],9),m.robe);
  mesh(head,organic([[1.68,.18,.17],[1.87,.16,.16],[2.06,.035,.08]],7),m.robe,0,0,-.07);
  const staff=new T.Group();fore.add(staff);staff.position.set(0,-.34,.13);staff.rotation.x=.5;
  cylinder(staff,m.leather,.025,1.6,6,0,.28,0);mesh(staff,new T.OctahedronGeometry(.12,0),m.arcane,0,1.14,0);
  for(const side of [-1,1])spike(staff,m.bone,[side*.02,.88,0],[side*.15,1.21,0]);props.push(staff);
  for(let i=0;i<3;i++)plate(torso,m.arcane,.025,.10,.01,(i-1)*.085,.7,.18);
 }
 return {...rig,props};
}
function monster(m,type){
 const g=new T.Group(),torso=new T.Group(),head=new T.Group();g.add(torso,head);const legs=[],knees=[],arms=[],props=[];
 if(type==='hound'){
  mesh(torso,organic([[0,.24,.32],[.32,.29,.45],[.55,.17,.35]],8),m.beast,0,.38,-.1).rotation.x=.45;
  mesh(head,organic([[0,.16,.19],[.28,.20,.25],[.43,.12,.13]],7),m.beast,0,.7,.42).rotation.x=.9;
  mesh(head,organic([[0,.11,.14],[.35,.10,.10]],6),m.bone,0,.73,.62).rotation.x=Math.PI/2;
  for(const side of [-1,1]){mesh(head,new T.OctahedronGeometry(.045,0),m.neonPink,side*.15,.91,.58);spike(head,m.bone,[side*.15,.93,.42],[side*.24,1.24,.24]);for(let i=0;i<3;i++)spike(head,m.bone,[side*.08,.78,.73+i*.07],[side*.07,.66,.74+i*.07],.025);}
  for(const side of [-1,1])for(const z of [-.4,.42]){const leg=new T.Group();leg.position.set(side*.24,.61,z);g.add(leg);legs.push(leg);mesh(leg,organic([[-.3,.055,.065],[0,.095,.11]],6),m.beast);const knee=new T.Group();knee.position.set(0,-.28,0);leg.add(knee);knees.push(knee);mesh(knee,organic([[-.29,.05,.075],[0,.05,.055]],6),m.beast);spike(knee,m.bone,[0,-.28,.01],[0,-.29,.16],.05);}
  for(let i=0;i<5;i++)spike(torso,m.obsidian,[0,.9,-.55+i*.15],[0,1.16-i*.02,-.62+i*.15],.055);
  const tail=new T.Group();tail.position.set(0,.65,-.48);g.add(tail);rod(tail,m.beast,[0,0,0],[0,.15,-.7],.055);spike(tail,m.bone,[0,.15,-.65],[0,.27,-.9],.07);props.push(tail);
 }else{
  const demon=type==='gargoyle',skin=demon?m.stone:m.bone;
  mesh(torso,organic([[.7,.16,.1],[1,.16,.14],[1.3,.30,.16],[1.5,.24,.13]],9),skin);
  // Open rib cage and glowing cavity make the undead visibly skeletal.
  for(let i=0;i<5;i++){const ring=mesh(torso,new T.TorusGeometry(.15-i*.009,.018,3,7,Math.PI*1.7),skin,0,1.04+i*.075,.015);ring.rotation.y=Math.PI/2;ring.scale.set(1,1.4,1);}
  mesh(torso,new T.OctahedronGeometry(.08,0),demon?m.neonAmber:m.neonGreen,0,1.28,.17);
  mesh(head,organic([[1.52,.07,.075],[1.65,.14,.13],[1.85,.13,.13],[1.94,.08,.08]],8),skin);
  for(const side of [-1,1]){mesh(head,new T.IcosahedronGeometry(.047,0),m.black,side*.067,1.77,.11,[1,.75,.4]);mesh(head,new T.OctahedronGeometry(.021,0),demon?m.neonAmber:m.neonGreen,side*.067,1.77,.14);if(demon)spike(head,m.obsidian,[side*.1,1.91,0],[side*.31,2.22,-.12],.065);}
  for(let i=0;i<5;i++)spike(head,m.bone,[(i-2)*.025,1.63,.1],[(i-2)*.025,1.57,.14],.012);
  for(const side of [-1,1]){
   const leg=new T.Group();leg.position.set(side*.15,.79,0);g.add(leg);legs.push(leg);rod(leg,skin,[0,0,0],[side*.03,-.37,0],.055);const knee=new T.Group();knee.position.set(side*.03,-.37,0);leg.add(knee);knees.push(knee);rod(knee,skin,[0,0,0],[0,-.35,.06],.043);mesh(knee,new T.IcosahedronGeometry(.08,0),skin,0,-.33,.08,[.8,.55,1.7]);
   const arm=new T.Group();arm.position.set(side*.29,1.42,0);g.add(arm);arms.push(arm);rod(arm,skin,[0,0,0],[side*.10,-.32,.01],.055);rod(arm,skin,[side*.10,-.32,.01],[side*.10,-.64,.16],.04);for(let i=0;i<3;i++)spike(arm,m.bone,[side*.10+(i-1)*.025,-.62,.16],[side*.10+(i-1)*.04,-.78,.24],.016);
   if(demon){const wing=new T.Group();wing.position.set(side*.18,1.38,-.08);g.add(wing);mesh(wing,polygonPrism([[0,0],[side*.52,.55],[side*1.11,.22],[side*.81,-.12],[side*.65,.08],[side*.40,-.23],[side*.22,-.08]],.02,.015),m.robe);for(const [x,y]of [[.52,.55],[1.11,.22],[.65,.08]])rod(wing,m.obsidian,[0,0,0],[side*x,y,-.015],.025);props.push(wing);}
  }
  if(demon)g.scale.setScalar(1.28);
 }
 return {g,torso,head,legs,knees,arms,props};
}
export function makeEnemy(m,type='sable',variant=0){
 const info=ENEMY_TYPES[type];if(!info)throw Error('Unknown enemy archetype '+type);
 const rig=info.species==='human'?human(m,type,variant):monster(m,type);
 for(const prop of rig.props)prop.userData.independentPose=true;
 chiselCharacter(rig.g);rig.g.name=type+'-enemy';rig.g.userData.asset={...info,type,triangles:countTriangles(rig.g)};
 return rig;
}
export function animateEnemy(e,time,moving){
 const phase=time*(e.type==='hound'?11:7)+e.phase,wind=e.attack?Math.sin(Math.min(1,e.attack.elapsed/e.info.windup)*Math.PI/2):0;
 e.legs.forEach((leg,i)=>{leg.rotation.x=moving?Math.sin(phase+i*Math.PI)*.42:0});
 e.knees.forEach((k,i)=>{k.rotation.x=moving?Math.max(0,Math.sin(phase+i*Math.PI))*.55:0});
 e.arms.forEach((a,i)=>{a.rotation.x=-wind*(e.info.role==='melee'?1.7:.7)+(moving?Math.sin(phase+i*Math.PI)*.09:0)});
 e.torso.rotation.z=(moving?Math.sin(phase)*.025:0)+Math.sin(time*1.5+e.phase)*.015;
 if(e.type==='gargoyle')e.props.forEach((w,i)=>{w.rotation.y=(i?1:-1)*(.25+Math.sin(time*2)*.1+wind*.2)});
 if(e.type==='hound'&&e.props[0])e.props[0].rotation.y=Math.sin(time*3)*.22;
 if(e.type==='netrunner'&&e.props[0])e.props[0].rotation.z=time*.7;
}
