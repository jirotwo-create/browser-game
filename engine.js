export const VERSION = 1;
export const GEAR = [
 {id:'rust',name:'Graveborn Blade',slot:'weapon',tier:1,cost:0,power:0,icon:'sword',rarity:'Worn',desc:'Even rust remembers the taste of blood.'},
 {id:'rags',name:'Pilgrim’s Shroud',slot:'armor',tier:1,cost:0,power:0,icon:'armor',rarity:'Worn',desc:'A burial cloth. Not yet your own.'},
 {id:'fang',name:'Widow’s Fang',slot:'weapon',tier:1,cost:35,power:5,icon:'sword',rarity:'Uncommon',desc:'A serrated edge, hungry for the living.'},
 {id:'iron',name:'Blackiron Cuirass',slot:'armor',tier:1,cost:30,power:3,icon:'armor',rarity:'Uncommon',desc:'Forged beneath a sun that never rose.'},
 {id:'reaper',name:'Ashen Reaper',slot:'weapon',tier:2,cost:90,power:12,icon:'scythe',rarity:'Rare',desc:'The harvest is always late in the Hollow.'},
 {id:'mantle',name:'Wraithskin Mantle',slot:'armor',tier:2,cost:80,power:7,icon:'armor',rarity:'Rare',desc:'The dead whisper between its stitches.'},
 {id:'thorn',name:'Thorn of the Eclipse',slot:'weapon',tier:3,cost:180,power:22,icon:'sword',rarity:'Epic',desc:'A splinter from the crown of a fallen god.'},
 {id:'cathedral',name:'Cathedral Plate',slot:'armor',tier:3,cost:165,power:12,icon:'armor',rarity:'Epic',desc:'Wear the last walls of a ruined sanctuary.'},
 {id:'god',name:'Godsunder',slot:'weapon',tier:4,cost:340,power:34,icon:'sword',rarity:'Legendary',desc:'No prayer can turn aside this blade.'},
 {id:'night',name:'Sovereign of Night',slot:'armor',tier:4,cost:310,power:18,icon:'armor',rarity:'Legendary',desc:'The darkness kneels to its rightful heir.'}
];
export const SKILLS = [
 {id:'edge',tree:'blood',name:'Bloodletting',icon:'sword',max:3,cost:1,desc:'+3 attack per rank. Steel opens the way.'},
 {id:'leech',tree:'blood',name:'Crimson Tithe',icon:'drop',max:3,cost:1,parent:'edge',desc:'Basic attacks restore 2 health per rank.'},
 {id:'execute',tree:'blood',name:'Death Sentence',icon:'skull',max:2,cost:2,parent:'leech',desc:'+25% damage per rank against foes below half health.'},
 {id:'rage',tree:'blood',name:'Blood Sovereign',icon:'crown',max:1,cost:3,parent:'execute',desc:'Unlock Blood Rite: a devastating strike paid for with health.'},
 {id:'ward',tree:'bone',name:'Ossuary',icon:'bone',max:3,cost:1,desc:'+2 defense and +8 maximum health per rank.'},
 {id:'shelter',tree:'bone',name:'Grave Shelter',icon:'shield',max:3,cost:1,parent:'ward',desc:'Guard heals an additional 4 health per rank.'},
 {id:'resolve',tree:'bone',name:'Unburied',icon:'skull',max:2,cost:2,parent:'shelter',desc:'Restore 8 health per rank when a battle begins.'},
 {id:'revenant',tree:'bone',name:'Last Rites',icon:'crown',max:1,cost:3,parent:'resolve',desc:'Survive one fatal blow per battle with 15 health.'},
 {id:'spark',tree:'void',name:'Cinder Script',icon:'flame',max:3,cost:1,desc:'+5 maximum focus and +4 spell damage per rank.'},
 {id:'echo',tree:'void',name:'Keyboard Hex',icon:'rune',max:3,cost:1,parent:'spark',desc:'Typing bursts grant +2 focus per rank.'},
 {id:'omen',tree:'void',name:'Dark Omen',icon:'eye',max:2,cost:2,parent:'echo',desc:'Soulfire weakens the enemy’s next attack by 3 per rank.'},
 {id:'eclipse',tree:'void',name:'Total Eclipse',icon:'moon',max:1,cost:3,parent:'omen',desc:'Unlock Eclipse: a powerful spell that restores health.'}
];
export const MONSTERS = [
 {name:'The Hollow Knight',kind:'knight',tag:'An oath left to rot',hp:48,attack:9,xp:30,coins:14},
 {name:'Catacomb Wretch',kind:'wretch',tag:'Hunger without a body',hp:62,attack:11,xp:38,coins:18},
 {name:'The Bellkeeper',kind:'keeper',tag:'It tolls only for you',hp:76,attack:13,xp:46,coins:23},
 {name:'Ashwing Revenant',kind:'wing',tag:'A saint stripped of grace',hp:90,attack:15,xp:55,coins:28},
 {name:'Vesper, the Uncrowned',kind:'king',tag:'The throne demands a sacrifice',hp:130,attack:19,xp:85,coins:42}
];
export function fresh() {
 return {version:VERSION,fx:'full',coins:12,xp:0,level:1,points:2,hp:100,focus:30,stage:1,kills:0,skills:{},owned:['rust','rags'],weapon:'rust',armor:'rags',battle:null,log:['You awaken at the gates of the Hollow.'],combo:0,lastType:0,bursts:0,clicks:0,keys:0,rev:0};
}
export function stats(s) {
 const r=id=>s.skills[id]||0;
 return {hp:100+(s.level-1)*10+r('ward')*8,focus:30+r('spark')*5,attack:12+(s.level-1)*2+(GEAR.find(g=>g.id===s.weapon)?.power||0)+r('edge')*3,defense:2+(GEAR.find(g=>g.id===s.armor)?.power||0)+r('ward')*2};
}
export const xpNeeded=s=>50+(s.level-1)*30;
export const shopTier=s=>Math.min(4,1+Math.floor((s.stage-1)/3));
export function enemy(s) {
 const base=MONSTERS[(s.stage-1)%5], scale=1+Math.floor((s.stage-1)/5)*0.55;
 return {...base,hp:Math.round(base.hp*scale),maxHp:Math.round(base.hp*scale),attack:Math.round(base.attack*scale),xp:Math.round(base.xp*scale),coins:Math.round(base.coins*scale),boss:s.stage%5===0,turn:1,guard:false,revived:false};
}
function log(s,t) {s.log=[t,...s.log].slice(0,30);}
function earn(s,n) {s.xp+=n;while(s.xp>=xpNeeded(s)){s.xp-=xpNeeded(s);s.level++;s.points+=2;s.hp=stats(s).hp;s.focus=stats(s).focus;log(s,`Level ${s.level}. Two skill points earned. Your wounds close.`);}}
export function reduce(state, action, now=Date.now()) {
 const s=structuredClone(state), r=id=>s.skills[id]||0;
 let st=stats(s);
 switch(action.type) {
 case 'SET_FX': if(['full','subtle','off'].includes(action.mode))s.fx=action.mode;break;
 case 'BROWSE':
  if(action.kind==='click'){s.coins++;s.clicks++;}
  else if(action.kind==='type'){
   s.keys++;s.combo=now-s.lastType<2500?s.combo+1:1;s.lastType=now;
   if(s.combo>=20){s.combo=0;s.bursts++;const reward=5+Math.min(10,Math.floor(s.bursts/5));s.coins+=reward;s.focus=Math.min(st.focus,s.focus+8+r('echo')*2);log(s,`Hex burst! +${reward} coins. Your focus rekindles.`);}
  }
  break;
 case 'BUY': {const g=GEAR.find(x=>x.id===action.id);if(!g||s.owned.includes(g.id)||g.tier>shopTier(s)||s.coins<g.cost)break;s.coins-=g.cost;s.owned.push(g.id);s[g.slot]=g.id;log(s,`${g.name} acquired and equipped.`);break;}
 case 'EQUIP': {const g=GEAR.find(x=>x.id===action.id);if(g&&s.owned.includes(g.id)){s[g.slot]=g.id;log(s,`${g.name} equipped.`);}break;}
 case 'LEARN': {const sk=SKILLS.find(x=>x.id===action.id);if(!sk||r(sk.id)>=sk.max||s.points<sk.cost||(sk.parent&&r(sk.parent)<SKILLS.find(x=>x.id===sk.parent).max))break;s.points-=sk.cost;s.skills[sk.id]=r(sk.id)+1;st=stats(s);s.hp=Math.min(st.hp,s.hp+(sk.id==='ward'?8:0));s.focus=Math.min(st.focus,s.focus+(sk.id==='spark'?5:0));log(s,`${sk.name} strengthened to rank ${r(sk.id)}.`);break;}
 case 'REST': if(!s.battle&&s.coins>=10){s.coins-=10;s.hp=st.hp;s.focus=st.focus;log(s,'At the bonfire, even the damned find respite. −10 coins.');}break;
 case 'BEGIN': if(!s.battle&&s.hp>0){s.battle=enemy(s);s.hp=Math.min(st.hp,s.hp+r('resolve')*8);log(s,`${s.battle.name} emerges from the mist.`);}break;
 case 'FLEE': if(s.battle){s.battle=null;s.coins=Math.max(0,s.coins-5);log(s,'You retreat into the fog. −5 coins.');}break;
 case 'TURN': {
  const b=s.battle;if(!b||s.hp<=0)break;const move=action.move;
  if(!['attack','guard','spell','rite','eclipse'].includes(move))break;
  if((move==='spell'&&s.focus<10)||(move==='eclipse'&&(!r('eclipse')||s.focus<20))||(move==='rite'&&(!r('rage')||s.hp<=12)))break;
  let damage=0,guard=false,weak=0;
  if(move==='attack'){damage=st.attack;s.hp=Math.min(st.hp,s.hp+r('leech')*2);s.focus=Math.min(st.focus,s.focus+3);}
  if(move==='guard'){guard=true;s.hp=Math.min(st.hp,s.hp+4+r('shelter')*4);s.focus=Math.min(st.focus,s.focus+6);log(s,'You brace behind your blade. Health and focus restored.');}
  if(move==='spell'){s.focus-=10;damage=20+r('spark')*4+s.level*2;weak=r('omen')*3;}
  if(move==='rite'){s.hp-=12;damage=Math.round(st.attack*2.3);}
  if(move==='eclipse'){s.focus-=20;damage=40+r('spark')*6+s.level*3;s.hp=Math.min(st.hp,s.hp+16);weak=r('omen')*3;}
  if(b.hp<b.maxHp/2)damage=Math.round(damage*(1+r('execute')*.25));
  const telegraph=b.turn%3===0;
  if(damage){b.hp=Math.max(0,b.hp-damage);log(s,`${move==='attack'?'Your blade':move==='spell'?'Soulfire':move==='rite'?'Blood Rite':'Eclipse'} deals ${damage} damage.`);}
  if(b.hp<=0){s.kills++;s.stage++;s.coins+=b.coins;log(s,`${b.name} vanquished. +${b.coins} coins · +${b.xp} XP.`);s.battle=null;earn(s,b.xp);break;}
  const incoming=Math.max(1,Math.round((b.attack*(telegraph?1.8:1)-st.defense-weak)*(guard?.35:1)));
  s.hp=Math.max(0,s.hp-incoming);log(s,`${b.name} ${telegraph?'unleashes a crushing blow':'strikes'} for ${incoming}.`);b.turn++;
  if(s.hp<=0&&r('revenant')&&!b.revived){s.hp=15;b.revived=true;log(s,'Last Rites denies the grave. You rise with 15 health.');}
  if(s.hp<=0){s.battle=null;s.coins=Math.max(0,s.coins-8);s.hp=Math.round(st.hp*.5);s.focus=Math.round(st.focus*.5);log(s,'The Hollow claims you. You awaken wounded. −8 coins.');}
  break;
 }
 default:return state;
 }
 s.rev++;return s;
}
