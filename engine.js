import {EXOTICS,hasExotic,exoticBonuses,shopStock,refreshHourlyShop,mergeEffect} from './exotics.js';
import {SKILLS,RUNES,rank,requirements,runeUnlocked,focusCost,moveSkill,moveReady,treePoints,PRESETS} from './skills.js';
export {SKILLS} from './skills.js';
export const VERSION = 4;
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
export const MONSTERS = [
 {name:'The Hollow Knight',kind:'knight',tag:'An oath left to rot',hp:48,attack:9,xp:30,coins:14},
 {name:'Catacomb Wretch',kind:'wretch',tag:'Hunger without a body',hp:62,attack:11,xp:38,coins:18},
 {name:'The Bellkeeper',kind:'keeper',tag:'It tolls only for you',hp:76,attack:13,xp:46,coins:23},
 {name:'Ashwing Revenant',kind:'wing',tag:'A saint stripped of grace',hp:90,attack:15,xp:55,coins:28},
 {name:'Vesper, the Uncrowned',kind:'king',tag:'The throne demands a sacrifice',hp:130,attack:19,xp:85,coins:42}
];
export function fresh(now=Date.now()) {
 const save={version:VERSION,fx:'full',coins:12,xp:0,level:1,points:2,hp:100,focus:30,stage:1,kills:0,ownedExotics:[],equippedExotics:[],exoticResources:{ink:0,receipts:0},exoticShop:{seed:Math.floor(Math.random()*4294967295)||1,hour:null,stock:null},skills:{},loadout:[],runes:{},combatFx:null,owned:['rust','rags'],weapon:'rust',armor:'rags',battle:null,log:['You awaken at the gates of the Hollow.'],combo:0,lastType:0,bursts:0,clicks:0,keys:0,rev:0};refreshHourlyShop(save,now);return save;
}
export function stats(s) {
 const r=id=>s.skills[id]||0,ex=exoticBonuses(s);
 return {hp:100+(s.level-1)*10+r('ward')*8+ex.hp,focus:30+r('spark')*5+ex.focus,attack:12+(s.level-1)*2+(GEAR.find(g=>g.id===s.weapon)?.power||0)+r('edge')*3+ex.attack,defense:2+(GEAR.find(g=>g.id===s.armor)?.power||0)+r('ward')*2+ex.defense};
}
export const xpNeeded=s=>50+(s.level-1)*30;
export const shopTier=s=>Math.min(4,1+Math.floor((s.stage-1)/3));
export function enemy(s) {
 const base=MONSTERS[(s.stage-1)%5], scale=1+Math.floor((s.stage-1)/5)*0.55;
 return {...base,hp:Math.round(base.hp*scale),maxHp:Math.round(base.hp*scale),attack:Math.round(base.attack*scale),xp:Math.round(base.xp*scale),coins:Math.round(base.coins*scale),boss:s.stage%5===0,turn:1,guard:false,revived:false};
}
function log(s,t) {s.log=[t,...s.log].slice(0,30);}
function earn(s,n) {s.xp+=n;while(s.xp>=xpNeeded(s)){s.xp-=xpNeeded(s);s.level++;s.points+=2;s.hp=stats(s).hp;s.focus=stats(s).focus;log(s,`Level ${s.level}. Two skill points earned. Your wounds close.`);}}
export function migrate(state,now=Date.now()){
 const s=structuredClone(state);
 s.ownedExotics=[...new Set(s.ownedExotics||[])].filter(id=>EXOTICS.some(e=>e.id===id));
 s.equippedExotics=[...new Set(s.equippedExotics||[])].filter(id=>s.ownedExotics.includes(id));
 s.exoticResources??={ink:0,receipts:0};s.exoticResources.ink=Math.max(0,Math.min(5,s.exoticResources.ink||0));s.exoticResources.receipts=Math.max(0,Math.min(24,s.exoticResources.receipts||0));
 s.exoticShop??={seed:((s.stage||1)*2654435761^(s.clicks||0))>>>0||1,hour:null};
 refreshHourlyShop(s,now);
 s.skills??={};s.runes??={};
 if(!Array.isArray(s.loadout))s.loadout=['rage','eclipse'].filter(id=>rank(s,id));
 s.loadout=s.loadout.map(id=>SKILLS.some(k=>k.id===id&&k.active)&&rank(s,id)?id:null).slice(0,3);
 s.version=VERSION;
 if(s.battle){s.battle.effects??={};s.battle.cooldowns??={};s.battle.barrier??=0;s.battle.resonance??=0;s.battle.exotic??={};}
 return s;
}
export function reduce(state, action, now=Date.now()) {
 const s=migrate(state,now), r=id=>rank(s,id), ex=id=>hasExotic(s,id);let st=stats(s);
 switch(action.type) {
 case 'SET_FX': if(['full','subtle','off'].includes(action.mode))s.fx=action.mode;break;
 case 'BROWSE':
  if(action.kind==='click'){s.coins++;s.clicks++;if(ex('receipts')&&++s.exoticResources.receipts>=25){s.exoticResources.receipts=0;s.coins+=12;log(s,'Hands of Infinite Receipts: +12 bonus coins. No refunds.');}}
  else if(action.kind==='type'){
   s.keys++;s.combo=now-s.lastType<2500?s.combo+1:1;s.lastType=now;
   if(s.combo>=20){s.combo=0;s.bursts++;const reward=5+Math.min(10,Math.floor(s.bursts/5));s.coins+=reward;s.focus=Math.min(st.focus,s.focus+8+r('echo')*2);if(ex('typewriter')){s.exoticResources.ink=Math.min(5,s.exoticResources.ink+1);log(s,`The Damned Typewriter stores ink (${s.exoticResources.ink}/5).`);}log(s,`Hellscript ignited! +${reward} coins. Your focus rekindles.`);}
  }break;
 case 'BUY': {const g=GEAR.find(x=>x.id===action.id);if(s.battle||!g||s.owned.includes(g.id)||g.tier>shopTier(s)||s.coins<g.cost)break;s.coins-=g.cost;s.owned.push(g.id);log(s,`${g.name} stored in your inventory.`);break;}
 case 'EQUIP': {const g=GEAR.find(x=>x.id===action.id);if(!s.battle&&g&&s.owned.includes(g.id)){s[g.slot]=g.id;log(s,`${g.name} equipped.`);}break;}
 case 'BUY_EXOTIC': {
  const e=shopStock(s).find(e=>e.id===action.id);if(s.battle||!e||s.coins<e.cost||s.ownedExotics.includes(e.id))break;
  s.coins-=e.cost;s.ownedExotics.push(e.id);log(s,`${e.name} stored in your inventory. Equip it to activate ${e.perk}.`);break;
 }
 case 'TOGGLE_EXOTIC': {
  if(s.battle||!s.ownedExotics.includes(action.id))break;
  const before=stats(s);if(ex(action.id))s.equippedExotics=s.equippedExotics.filter(id=>id!==action.id);else s.equippedExotics.push(action.id);
  const after=stats(s);s.hp=Math.max(1,Math.min(after.hp,s.hp+after.hp-before.hp));s.focus=Math.max(0,Math.min(after.focus,s.focus+after.focus-before.focus));break;
 }
 case 'LEARN': {
  const k=SKILLS.find(x=>x.id===action.id);if(s.battle||!k||r(k.id)>=k.max||s.points<k.cost||requirements(s,k))break;
  s.points-=k.cost;s.skills[k.id]=r(k.id)+1;st=stats(s);s.hp=Math.min(st.hp,s.hp+(k.id==='ward'?8:0));s.focus=Math.min(st.focus,s.focus+(k.id==='spark'?5:0));
  if(k.active&&!s.loadout.includes(k.id)){const empty=s.loadout.findIndex(id=>!id);if(empty>=0)s.loadout[empty]=k.id;else if(s.loadout.length<3)s.loadout.push(k.id);}
  log(s,`${k.name} learned at rank ${r(k.id)}.${k.active?' Equip it in your three-slot loadout.':''}`);break;
 }
 case 'SLOT': {
  if(s.battle||!Number.isInteger(action.slot)||action.slot<0||action.slot>2)break;
  if(action.id===null){s.loadout[action.slot]=null;break;}
  const k=SKILLS.find(x=>x.id===action.id);if(!k?.active||!r(k.id))break;
  s.loadout=s.loadout.map(id=>id===k.id?null:id);s.loadout[action.slot]=k.id;break;
 }
 case 'SET_RUNE': {
  const k=SKILLS.find(x=>x.id===action.id);if(s.battle||!k||!r(k.id)||!runeUnlocked(s,k))break;
  if(action.rune===null)delete s.runes[k.id];else if(RUNES[k.id]?.some(x=>x.id===action.rune))s.runes[k.id]=action.rune;break;
 }
 case 'RESPEC': {
  if(s.battle)break;
  const previousStats=stats(s);const refund=SKILLS.reduce((sum,k)=>sum+r(k.id)*k.cost,0);s.points+=refund;s.skills={};s.runes={};s.loadout=[];
  st=stats(s);s.hp=Math.max(1,Math.min(st.hp,s.hp-(previousStats.hp-st.hp)));s.focus=Math.max(0,Math.min(st.focus,s.focus-(previousStats.focus-st.focus)));log(s,`Talents reset. ${refund} points returned. Your pilgrimage remains.`);break;
 }
 case 'PRESET': {
  const preset=PRESETS[action.id];if(s.battle||!preset)break;
  let next=reduce(s,{type:'RESPEC'},now);
  // Learn foundations first, then deepen them; prerequisites and available points remain authoritative.
  for(let pass=0;pass<3;pass++)for(const id of preset.path)next=reduce(next,{type:'LEARN',id},now);
  const selected=preset.loadout.filter(id=>rank(next,id));next.loadout=[...selected,...next.loadout.filter(id=>id&&!selected.includes(id))].slice(0,3);
  log(next,`${preset.name} build applied. Unspent points remain yours.`);return next;
 }
 case 'REST': if(!s.battle&&s.coins>=10){s.coins-=10;s.hp=st.hp;s.focus=st.focus;log(s,'At the bonfire, even the damned find respite. −10 coins.');}break;
 case 'BEGIN': if(!s.battle&&s.hp>0){s.battle={...enemy(s),effects:{},cooldowns:{},barrier:ex('pallbearer')?15:0,resonance:0,exotic:{rats:ex('rats')?3:0,turns:0,strikes:0,guards:0,damaging:0,spells:0,slashes:0,stitches:0}};s.hp=Math.min(st.hp,s.hp+r('resolve')*8);s.combatFx=null;log(s,`${s.battle.name} emerges from the mist.`);}break;
 case 'FLEE': if(s.battle){s.battle=null;s.combatFx=null;s.coins=Math.max(0,s.coins-5);log(s,'You retreat into the fog. −5 coins.');}break;
 case 'TURN': {
  const b=s.battle,move=action.move;if(!b||s.hp<=0||moveReady(s,move))break;
  const k=moveSkill(move),id=k?.id||move,rune=s.runes[id];
  const fx={id:s.rev+1,move:id,title:k?.name||{attack:'Strike',guard:'Guard',spell:'Soulfire'}[move],tree:k?.tree||(move==='spell'?'void':move==='guard'?'bone':'blood'),events:[],enemyName:b.name};s.combatFx=fx;
  const event=(type,amount=0,label='')=>fx.events.push({type,amount,label});
  const proc=(id,note='')=>{const e=EXOTICS.find(x=>x.id===id);event('exotic',0,e.perk);fx.exotics??=[];if(!fx.exotics.includes(id))fx.exotics.push(id);log(s,`${e.name}: ${note||e.perk}`);};
  const marks=b.exotic;b.exotic.turns=(b.exotic.turns||0)+1;
  const taxedStatuses=new Set(Object.keys(b.effects).filter(name=>['bleed','burn','curse'].includes(name)));
  const heal=(n,label='Healing')=>{const gained=Math.min(st.hp-s.hp,Math.round(n));s.hp+=gained;if(gained&&ex('sutures'))marks.stitches=Math.min(60,(marks.stitches||0)+Math.floor(gained/2));if(gained){event('heal',gained,label);log(s,`${label} restores ${gained} health.`);}return gained;};
  const gainFocus=n=>{const gain=Math.min(st.focus-s.focus,n);s.focus+=gain;if(gain)event('focus',gain);};
  const hit=(n,type='damage',label=fx.title)=>{const amount=Math.min(b.hp,Math.max(0,Math.round(n)));b.hp-=amount;if(amount){event(type,amount,label);log(s,`${label} deals ${amount} damage.`);}return amount;};
  const barrier=(n,label='Barrier')=>{const added=Math.round(n*(1+r('fortress')*.2));b.barrier=Math.max(b.barrier,added);event('barrier',added,label);log(s,`${label} absorbs up to ${added} damage.`);};
  const status=(name,data)=>{b.effects[name]=data;event(name,0);};
  const victory=()=>{s.kills++;s.stage++;const bonus=(ex('probate')?Math.floor(b.coins*.35):0)+(ex('tax')?taxedStatuses.size*6:0);s.coins+=b.coins+bonus;fx.victory=true;fx.coins=b.coins+bonus;fx.xp=b.xp;heal(r('carnage')*8,'Blood Harvest');gainFocus(r('carnage')*4);if(bonus)log(s,`Exotic inheritance: +${bonus} bonus coins.`);log(s,`${b.name} vanquished. +${b.coins+bonus} coins · +${b.xp} XP.`);s.battle=null;earn(s,b.xp);};
  // Ongoing wounds tick at the beginning of the next player turn, exactly once per accepted action.
  for(const type of ['bleed','burn']){const effect=b.effects[type];if(effect){hit(effect.damage,type,type==='bleed'?'Bleeding':'Ghostfire');if(--effect.turns<=0)delete b.effects[type];if(b.hp<=0)break;}}
  if(b.hp>0&&ex('echoBlade')&&marks.previousDamage){proc('echoBlade','Yesterday’s wound opens again.');hit(marks.previousDamage*.3,'exoticDamage','You Already Bled');}
  if(b.hp<=0){victory();break;}
  if(b.regen){heal(b.regen.heal,'Gravebloom');if(--b.regen.turns<=0)delete b.regen;}
  for(const ability of Object.keys(b.cooldowns))b.cooldowns[ability]=Math.max(0,b.cooldowns[ability]-1);
  let damage=0,guard=1,weak=0,counter=0,leech=0,spell=false;
  if(k){s.focus-=focusCost(s,k);b.cooldowns[id]=k.cooldown;if(ex('hourglass')&&!marks.firstActive){marks.firstActive=true;b.cooldowns[id]=0;proc('hourglass','The first active skill has no cooldown.');}}
  if(move==='attack'){
   damage=st.attack*(1+r('frenzy')*.12*Math.min(3,b.effects.bleed?.turns||0));
   if(ex('mouth'))marks.slashes=(marks.slashes||0)+1;
   if(ex('sutures')&&marks.stitches){damage+=marks.stitches;proc('sutures',`${marks.stitches} stitches cut loose.`);marks.stitches=0;}
   heal(r('leech')*2,'Crimson Tithe');gainFocus(3);
  }
  if(move==='guard'){guard=.35;heal(4+r('shelter')*4,'Grave Shelter');gainFocus(6+r('conduit')*2);if(r('fortress'))barrier(r('fortress')*6,'Living Ossuary');event('guard');marks.guards=(marks.guards||0)+1;if(ex('tea')){marks.tea=true;proc('tea','The kettle is ready for your next damaging action.');}if(ex('rats'))marks.rats=Math.min(12,(marks.rats||3)+1);if(ex('halo')){mergeEffect(b,'curse',{power:3,amp:.1,turns:2,silence:true});proc('halo','A winter curse silences heavy attacks.');}if(ex('hourglass')){for(const key of Object.keys(b.cooldowns))b.cooldowns[key]=Math.max(0,b.cooldowns[key]-1);proc('hourglass','Guard winds cooldowns back one extra turn.');}}
  if(move==='spell'){spell=true;s.focus-=Math.max(1,10-r('conduit'));damage=20+r('spark')*4+s.level*2;weak=r('omen')*3;if(r('kindle'))status('burn',{damage:r('kindle')*3,turns:2});}
  if(id==='rend'){
   damage=st.attack*.9+r('rend')*4;
   if(rune==='rupture'){damage+=(b.effects.bleed?.damage||0)*5;delete b.effects.bleed;event('rupture');}
   else status('bleed',{damage:4+r('rend')*2+r('hemorrhage')*2,turns:rune==='deep'?5:3});
  }
  if(id==='feast'){damage=st.attack*.6+r('feast')*5;let amount=(10+r('feast')*4)*(b.effects.bleed?2:1);if(rune==='gorge')amount*=1.5;if(rune==='essence'){amount*=.5;gainFocus(8);}heal(amount,'Sanguine Feast');event('leech');}
  if(id==='riposte'){guard=rune==='patient'?.3:.5;counter=(st.attack*.8+r('riposte')*5)*(rune==='duelist'?1.4:1);event('counter');}
  if(id==='rage'){s.hp-=rune==='sacrifice'?20:12;damage=st.attack*(rune==='sacrifice'?3:2.3);if(rune==='ravenous')leech=.2;event('blood');}
  if(id==='bastion'){barrier((20+r('bastion')*8)*(rune==='aegis'?1.4:1),'Bone Bastion');if(rune==='spikes')b.spikes=2;}
  if(id==='mend'){heal((16+r('mend')*8)*(rune==='surge'?2:1),'Gravebloom');if(rune!=='surge')b.regen={heal:4+r('mend')*2,turns:rune==='renewal'?5:3};}
  if(id==='reprisal'){const consumed=rune==='keeper'?Math.ceil(b.barrier/2):b.barrier;damage=st.attack*.7+r('reprisal')*6+consumed*(rune==='fracture'?1.5:1);b.barrier-=consumed;event('shatter',consumed);}
  if(id==='hex'){spell=true;status('curse',{power:2+r('hex')*2,amp:rune==='frailty'?.35:.2,turns:3,silence:rune==='silence'});}
  if(id==='drain'){spell=true;damage=8+r('drain')*5+r('spark')*4;leech=rune==='hunger'?1:.5;gainFocus(6+r('drain')*2+(rune==='font'?6:0));event('siphon');}
  if(id==='nova'){spell=true;damage=22+r('nova')*10+r('spark')*4;if(rune==='collapse')status('curse',{power:4,amp:.2,turns:2});else{damage+=(b.effects.burn?.damage||0)*(rune==='detonate'?5:3);delete b.effects.burn;}event('nova');}
  if(id==='eclipse'){spell=true;damage=40+r('spark')*6+s.level*3;heal(rune==='dawn'?32:16,'Eclipse');weak=r('omen')*3;if(rune==='umbra')status('curse',{power:5,amp:.2,turns:3});event('eclipse');}
  if(spell&&damage){damage*=1+r('resonance')*.15*Math.min(3,b.resonance);b.resonance=Math.min(3,b.resonance+1);if(r('resonance'))event('resonance',b.resonance);}else if(!spell)b.resonance=0;
  const damaging=damage>0;
  if(damaging){
   marks.damaging=(marks.damaging||0)+1;
   if(marks.tea&&ex('tea')){damage*=1.25;marks.tea=false;heal(6,'Moon Tea');proc('tea','A very suspicious cup adds 25% damage.');}
   if(ex('probate')&&b.hp<b.maxHp*.3)damage*=1.2;
   if(spell){
    marks.spells=(marks.spells||0)+1;
    if(ex('moth')){mergeEffect(b,'burn',{damage:4,turns:2});if(s.focus<st.focus*.25)heal(8,'Mothlight');proc('moth','Moths kindle ghostfire.');}
    if(ex('typewriter')&&s.exoticResources.ink){s.exoticResources.ink--;damage+=12;mergeEffect(b,'burn',{damage:(b.effects.burn?.damage||0)+3,turns:2});proc('typewriter',`Ink spent. ${s.exoticResources.ink}/5 remains.`);}
    if(ex('sun')&&b.effects.curse){damage*=1.25;leech+=.3;proc('sun','The sun feeds on the curse.');}
   }
  }
  for(const name of Object.keys(b.effects))if(['bleed','burn','curse'].includes(name))taxedStatuses.add(name);
  if(b.hp<b.maxHp/2)damage*=1+r('execute')*.25;
  if(b.effects.curse)damage*=1+b.effects.curse.amp;
  const dealt=hit(damage);marks.previousDamage=dealt;if(spell&&damaging)marks.lastSpell=dealt;
  if(leech)heal(dealt*leech,id==='drain'?'Soul Siphon':'Ravenous');
  if(b.hp<=0){victory();break;}
  if(ex('mouth')&&move==='attack'&&marks.slashes%3===0){proc('mouth','The cathedral bites.');hit(st.attack*.6,'exoticDamage','Sermon of Hunger');mergeEffect(b,'bleed',{damage:6,turns:3});taxedStatuses.add('bleed');}
  if(b.hp>0&&ex('meteor')&&damaging&&marks.damaging%3===0){proc('meteor','An apology falls from orbit.');hit(35+s.level*2,'exoticDamage','Extinction, Politely');mergeEffect(b,'burn',{damage:7,turns:2});taxedStatuses.add('burn');}
  if(b.hp>0&&ex('choir')&&spell&&damaging&&marks.spells%3===0){proc('choir','The choir releases a volley of teeth.');hit(18+s.level,'exoticDamage','A Cappella Calamity');}
  if(b.hp>0&&ex('understudy')&&move==='guard'&&marks.guards%3===0&&marks.lastSpell){proc('understudy','The understudy repeats your spell.');hit(marks.lastSpell*.5,'exoticDamage','One More Performance');}
  if(b.hp>0&&ex('rats')){proc('rats',`${marks.rats||3} rats vote to devour.`);hit(marks.rats||3,'exoticDamage','Parliament of Rats');}
  if(b.hp>0&&ex('bell')&&marks.turns%9===0){proc('bell','The ninth toll ends the conversation.');hit(b.maxHp*.3,'exoticDamage','The Ninth Toll');}
  if(b.hp<=0){victory();break;}
  const cursed=b.effects.curse,heavy=b.turn%3===0&&!cursed?.silence;
  const lowHealth=s.hp<st.hp*.35?1-r('unyielding')*.15:1;
  marks.strikes=(marks.strikes||0)+1;const dodged=ex('boots')&&marks.strikes%4===0;
  let incoming=Math.max(1,Math.round((b.attack*(heavy?1.8:1)-st.defense-weak-(cursed?.power||0)-(b.effects.bleed?r('hemorrhage'):0))*guard*lowHealth));
  if(dodged){incoming=0;proc('boots','The enemy swings at the wrong address.');event('dodge');}
  const protectedByBarrier=b.barrier>0,absorbed=Math.min(incoming,b.barrier);b.barrier-=absorbed;
  const shattered=protectedByBarrier&&b.barrier===0&&absorbed>0;
  if(absorbed)event('absorb',absorbed);
  const actual=incoming-absorbed;s.hp=Math.max(0,s.hp-actual);if(actual)event('hurt',actual);log(s,`${b.name} ${heavy?'unleashes a crushing blow':'strikes'} for ${actual}.${absorbed?' Barrier absorbs '+absorbed+'.':''}`);
  if(s.hp<=0&&r('revenant')&&!b.revived){s.hp=15;b.revived=true;event('revive',15);log(s,'Last Rites denies the grave. You rise with 15 health.');}
  if(s.hp<=0&&ex('miser')&&!marks.bribed&&s.coins>=20){marks.bribed=true;s.coins-=20;s.hp=Math.min(st.hp,25);event('revive',s.hp,'Death Accepts Cash');proc('miser','Death accepts 20 coins. You rise with 25 health.');}
  if(s.hp<=0){fx.defeat=true;s.battle=null;s.coins=Math.max(0,s.coins-8);s.hp=Math.round(st.hp*.5);s.focus=Math.round(st.focus*.5);log(s,'The Hollow claims you. You awaken wounded. −8 coins.');break;}
  if(shattered&&ex('pallbearer')){proc('pallbearer','The coffin cracks a joke.');hit(20+st.defense,'exoticDamage','A Cracking Good Joke');}
  const reflected=r('thorns')*2*(protectedByBarrier?2:1)+(b.spikes?8:0);
  if(reflected)hit(reflected,'reflect','Splinter Crown');if(b.spikes)b.spikes--;
  if(counter)hit(counter*(b.hp<b.maxHp/2?1+r('execute')*.25:1)*(1+(b.effects.curse?.amp||0)),'counter','Crimson Riposte');
  if(cursed&&--cursed.turns<=0)delete b.effects.curse;
  b.turn++;
  if(b.hp<=0)victory();
  break;
 }
 default:return state;
 }
 s.rev++;return s;
}
