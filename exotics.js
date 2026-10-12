// Slotted relics. Perks resolve once per accepted trigger and cannot recursively take turns.
export const EXOTICS=[
 {id:'mouth',name:'The Cathedral Has Teeth',kind:'Living greatsword',cost:240,tier:1,attack:4,perk:'Sermon of Hunger',desc:'A cathedral compressed into a blade. The stained glass is enamel.',effect:'Every third Strike bites for 60% attack and applies 6 bleed damage for 3 turns.',color:'#e97488'},
 {id:'probate',name:'Widow’s Probate',kind:'Funeral scythe',cost:280,tier:1,attack:3,perk:'The Dead Owe Interest',desc:'Your inheritance is everyone else’s problem.',effect:'Victory grants 35% extra coins. Direct attacks deal 20% more damage below 30% enemy health.',color:'#d2b16e'},
 {id:'echoBlade',name:'An Argument with Yesterday',kind:'Time-split sword',cost:330,tier:2,attack:4,perk:'You Already Bled',desc:'Two blades. One wound. A very persuasive disagreement.',effect:'At the start of each turn, echo 30% of your previous turn’s primary damage. Echoes never copy themselves.',color:'#ada0ee'},
 {id:'tea',name:'A Perfectly Normal Teapot',kind:'Witch’s kettle',cost:220,tier:1,perk:'Do Not Drink the Moon',desc:'The lid rattles when something in the sky dies.',effect:'Guard brews tea. Your next damaging action deals 25% more damage and heals 6 health.',color:'#a7d4a0'},
 {id:'meteor',name:'Small Apology to the Sky',kind:'Meteor hammer',cost:380,tier:2,attack:5,perk:'Extinction, Politely',desc:'The note attached reads: sorry about your kingdom.',effect:'Every third damaging action drops a meteor for 35 + 2 per level damage and applies 7 burn for 2 turns.',color:'#e6a06c'},
 {id:'sutures',name:'The Saint’s Bad Stitching',kind:'Surgical gauntlets',cost:260,tier:1,defense:1,perk:'Pain Is Thread',desc:'The left glove says “do no harm.” The right says “unless.”',effect:'Store half of actual healing as stitches (up to 60). Your next Strike consumes them as bonus damage.',color:'#e8b0a6'},
 {id:'moth',name:'Moth-Eaten Eternity',kind:'Mothwing mantle',cost:290,tier:2,defense:2,perk:'Hungry for Lanterns',desc:'A thousand tiny wings have eaten the lining of forever.',effect:'Damaging spells apply 4 burn for 2 turns. If the cast leaves you below 25% focus, heal 8 health.',color:'#bf9de6'},
 {id:'halo',name:'The Saint Who Froze Hell',kind:'Frozen halo',cost:320,tier:2,defense:2,perk:'Winter Has Jurisdiction',desc:'Hell is still appealing the verdict.',effect:'Guard applies a 2-strike curse: −3 enemy damage, +10% damage taken, and no heavy blows. Stronger curses keep their power.',color:'#98dce7'},
 {id:'rats',name:'Parliament of Rats',kind:'Rat-king crown',cost:210,tier:1,perk:'Motion to Devour',desc:'Twelve votes in favor. No surviving opposition.',effect:'Start with 3 rats. Guard recruits 1 more (up to 12). After each action, rats deal 1 damage each.',color:'#a9c680'},
 {id:'tax',name:'God’s Unpaid Invoice',kind:'Infernal contract',cost:300,tier:2,perk:'Sin Is Deductible',desc:'Someone has to balance the books of the apocalypse.',effect:'Victory grants 6 extra coins for each bleed, burn, or curse active that turn, even if the final tick expires it.',color:'#d8c384'},
 {id:'bell',name:'The Ninth Toll',kind:'Doom bell',cost:480,tier:3,perk:'The End Keeps Time',desc:'Eight warnings. One extremely final conversation.',effect:'On every ninth accepted combat action, the bell deals 30% of the enemy’s maximum health as doom damage.',color:'#d4b79a'},
 {id:'hourglass',name:'Yesterday’s Funeral',kind:'Unwound hourglass',cost:400,tier:3,perk:'Time Was a Mistake',desc:'The mourners arrived before you were born.',effect:'The first active skill each battle has no cooldown. Guard reduces every active cooldown by 1 additional turn.',color:'#aca2e1'},
 {id:'boots',name:'Boots That Never Arrive',kind:'Impossible boots',cost:360,tier:2,defense:1,perk:'Wrong Address',desc:'An enemy can’t hit someone who is technically elsewhere.',effect:'Completely dodge every fourth enemy strike. Dodging still lets counters and rat attacks work.',color:'#93c5db'},
 {id:'pallbearer',name:'The Laughing Pallbearer',kind:'Coffin shield',cost:310,tier:2,defense:3,perk:'A Cracking Good Joke',desc:'Every funeral is a surprise party if you’re sufficiently unwell.',effect:'Begin with a 15-point barrier. When incoming damage breaks a barrier, retaliate for 20 + defense damage.',color:'#c5d992'},
 {id:'sun',name:'The Sun’s Last Tenant',kind:'Eclipse crown',cost:450,tier:3,focus:5,perk:'Eviction Notice',desc:'The rent is due. The star is missing.',effect:'Damaging spells against cursed enemies deal 25% more damage and heal for 30% of damage dealt.',color:'#e8ba7b'},
 {id:'miser',name:'Miser’s Last Breath',kind:'Soul-coin ring',cost:350,tier:2,hp:10,perk:'Death Accepts Cash',desc:'The afterlife has a truly appalling cancellation fee.',effect:'Once per battle, a fatal strike consumes 20 coins and restores 25 health. Last Rites activates first if learned.',color:'#e0cc7b'},
 {id:'choir',name:'Choir of Loose Teeth',kind:'Jawbone reliquary',cost:370,tier:3,focus:5,perk:'A Cappella Calamity',desc:'No lungs. No tongue. Impeccable harmonies.',effect:'Every third damaging spell launches a volley of teeth for 18 + your level damage.',color:'#c1abd9'},
 {id:'understudy',name:'Understudy of the End',kind:'Theatre shroud',cost:430,tier:3,defense:2,perk:'One More Performance',desc:'The apocalypse has been delayed. Its replacement is eager.',effect:'Every third Guard replays 50% of your last damaging spell, without spending focus. Replays cannot charge other damage triggers.',color:'#ba9acb'},
 {id:'typewriter',name:'The Damned Typewriter',kind:'Occult writing machine',cost:250,tier:1,focus:5,perk:'Final Draft',desc:'The ribbon is an artery. The return key is a tombstone.',effect:'Hellscript eruptions store 1 ink (up to 5). Each damaging spell spends 1 ink for +12 damage and +3 burn damage.',color:'#c4a0ea'},
 {id:'receipts',name:'Hands of Infinite Receipts',kind:'Merchant’s gloves',cost:200,tier:1,perk:'Thank You for Your Damnation',desc:'Your soul is nonrefundable. Would you like a bag?',effect:'Every 25 webpage clicks while equipped grants 12 bonus coins. The counter pauses when unequipped.',color:'#d8be79'}
,
 {id:'cinder',slot:'weapon',name:'Cinder Verdict',kind:'Executioner greatsword',cost:420,tier:2,attack:15,perk:'Guilty of Burning',desc:'The verdict is written in the ashes of the accused.',effect:'Every second Strike erupts for 18 damage and applies 5 burn for 2 turns.',color:'#ff8050'},
 {id:'marionette',slot:'weapon',name:'The Widow’s Last Dance',kind:'Hooked rapier',cost:390,tier:2,attack:12,perk:'Pull the Red String',desc:'A dance partner who never learned to stop bleeding.',effect:'Guard readies a red string. Your next Strike deals 70% more primary damage, then consumes it.',color:'#f583b7'},
 {id:'maw',slot:'weapon',name:'Gravetide',kind:'Ossuary axe',cost:620,tier:3,attack:24,perk:'The Grave Has Jaws',desc:'Something enormous learned to swim beneath the cemetery.',effect:'Every third Strike summons a bone maw for 40 + your level damage.',color:'#ddd3a8'},
 {id:'needle',slot:'weapon',name:'Saint of a Thousand Cuts',kind:'Barbed needleblade',cost:300,tier:1,attack:10,perk:'A Small Cruelty',desc:'The saint was patient. The wounds were not.',effect:'Each Strike applies 3 + your level bleed for 2 turns. Every third Strike bursts an existing bleed for 20 extra damage.',color:'#ff647d'},
 {id:'storm',slot:'weapon',name:'Nail of the Black Storm',kind:'Thunder spear',cost:610,tier:3,attack:22,perk:'Lightning Remembers',desc:'A nail driven through the heart of a storm.',effect:'Damaging spells store 1 storm charge, up to 3. Your next Strike consumes all charges for 12 damage each.',color:'#82dfff'},
 {id:'mirror',slot:'weapon',name:'Mercy’s Other Face',kind:'Mirror cleaver',cost:510,tier:2,attack:18,perk:'The Reflection Refuses',desc:'The reflection raises its blade a heartbeat after you.',effect:'Your first Strike each battle delivers a second cut for 50% of its actual primary damage. The reflection cannot copy itself.',color:'#c1aaff'},
 {id:'clockwork',slot:'weapon',name:'Seven Minutes to Midnight',kind:'Chained sawblade',cost:690,tier:3,attack:26,perk:'The Last Tooth',desc:'The clock has teeth. It is running out of patience.',effect:'Every fourth damaging action tears for 32 extra damage and restores 6 focus. Guard does not advance the saw.',color:'#e8b36d'},
 {id:'lantern',slot:'weapon',name:'The Lantern That Hunts',kind:'Soul-lantern staff',cost:480,tier:2,attack:14,focus:8,perk:'Five Hungry Lights',desc:'The souls inside mistake every heartbeat for a doorway.',effect:'Each damaging spell releases five hunting lights for 10 + your level extra damage and applies 4 burn for 2 turns.',color:'#9cffc7'},
 {id:'carrion',slot:'armor',name:'The Carrion Regent',kind:'Raven crown',cost:410,tier:2,defense:6,hp:12,perk:'A Murder in Session',desc:'Its subjects arrive before the body is cold.',effect:'Guard releases a raven volley for 14 damage and applies a 2-turn curse: −2 enemy damage and +10% damage taken.',color:'#b898e5'},
 {id:'furnace',slot:'armor',name:'Furnace of the Unburied',kind:'Infernal breastplate',cost:590,tier:3,defense:9,hp:18,perk:'No Rest for the Furnace',desc:'There is a door in your chest. Hell has the key.',effect:'Surviving a heavy enemy attack erupts for 20 + defense damage and applies 6 burn for 2 turns.',color:'#ffa55d'},
 {id:'glass',slot:'armor',name:'Thousand-Pain Saint',kind:'Shattered glass plate',cost:430,tier:2,defense:5,focus:8,perk:'Every Shard a Prayer',desc:'A thousand stained-glass saints, all facing inward.',effect:'Guard grants a 16-point barrier. When an incoming attack breaks your barrier, launch 28 damage of glass shards.',color:'#9ce6ef'},
 {id:'eclipseMail',slot:'armor',name:'A Night Without Witness',kind:'Shadow plate',cost:560,tier:3,defense:8,focus:6,perk:'You Saw Nothing',desc:'The darkness has agreed to an alibi.',effect:'Dodge every third enemy strike completely. That dodge readies 12 bonus damage for your next Strike.',color:'#ba9dff'},
 {id:'rosary',slot:'armor',name:'The Kneeling Engine',kind:'Rosary gauntlets',cost:320,tier:1,defense:4,perk:'Prayer Is a Machine',desc:'Every forbidden word turns another tooth in the mechanism.',effect:'Each damaging spell grants an 8-point barrier before the enemy retaliates.',color:'#ead7a0'},
 {id:'thornsuit',slot:'armor',name:'Garden of the Last Martyr',kind:'Briar mantle',cost:470,tier:2,defense:7,hp:10,perk:'Suffering Takes Root',desc:'They buried the martyr. The garden disagreed.',effect:'Actual incoming health damage stores 1 thorn, up to 3. Guard consumes all thorns for 9 damage and 3 healing each.',color:'#abda84'},
 {id:'orbit',slot:'armor',name:'Funeral for a Falling Star',kind:'Comet pauldrons',cost:660,tier:3,defense:10,focus:10,perk:'The Sky Attends',desc:'Even a dying star can bring flowers to its own funeral.',effect:'Every third damaging spell calls a comet for 24 + 2 per level damage and grants a 20-point barrier.',color:'#a9cbff'}
].map(e=>{
 const weapons=['mouth','probate','echoBlade','meteor'];
 const armor=['sutures','moth','halo','rats','boots','pallbearer','sun','understudy','receipts'];
 const slot=e.slot||(weapons.includes(e.id)?'weapon':armor.includes(e.id)?'armor':'testament');
 return {...e,slot,rarity:slot==='testament'?'Testament':'Exotic'};
});
export const NEW_EXOTICS=EXOTICS.slice(20);
export const TESTAMENTS=EXOTICS.filter(e=>e.slot==='testament');
export const relicFor=id=>EXOTICS.find(e=>e.id===id);
export const activeRelics=s=>[s.weapon,s.armor,s.testament].filter(id=>relicFor(id));
export const hasExotic=(s,id)=>activeRelics(s).includes(id);
export function exoticBonuses(s){const total={attack:0,defense:0,hp:0,focus:0};for(const id of activeRelics(s)){const e=relicFor(id);if(e)for(const stat of Object.keys(total))total[stat]+=e[stat]||0;}return total;}
function random(seed){let x=seed>>>0;return()=>{x=(x+0x6D2B79F5)>>>0;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
export const exoticTier=s=>Math.min(4,1+Math.floor((s.stage-1)/3));
export const HOUR_MS=60*60*1000;
export const hourSlot=now=>Math.floor(now/HOUR_MS);
export const nextShopRotation=now=>(hourSlot(now)+1)*HOUR_MS;
export function exoticOffers(s,now=Date.now()){
 const pool=EXOTICS.filter(e=>e.tier<=exoticTier(s)&&!s.ownedExotics?.includes(e.id));
 if(!pool.length)return [];
 const next=random((s.exoticShop?.seed||1)^Math.imul(hourSlot(now),2654435761));
 let selected=Math.floor(next()*pool.length);
 if(pool.length>1&&pool[selected].id===s.exoticShop?.stock?.[0])selected=(selected+1)%pool.length;
 return [pool[selected]];
}
export function refreshHourlyShop(s,now=Date.now()){
 const hour=hourSlot(now);
 if(s.exoticShop?.hour===hour&&Array.isArray(s.exoticShop.stock)&&s.exoticShop.stock.length<=1)return false;
 s.exoticShop??={seed:1};s.exoticShop.stock=exoticOffers(s,now).map(e=>e.id);s.exoticShop.hour=hour;
 delete s.exoticShop.rotation;
 return true;
}
export function shopStock(s){return (s.exoticShop?.stock||[]).map(id=>EXOTICS.find(e=>e.id===id)).filter(Boolean);}
export function mergeEffect(b,name,e){
 const old=b.effects[name];b.effects[name]={...e,damage:Math.max(old?.damage||0,e.damage||0),power:Math.max(old?.power||0,e.power||0),amp:Math.max(old?.amp||0,e.amp||0),turns:Math.max(old?.turns||0,e.turns||0),silence:!!(old?.silence||e.silence)};
}
