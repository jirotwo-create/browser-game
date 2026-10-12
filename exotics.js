// Every relic has one explicit, bounded trigger. They coexist; there is no exotic-slot limit.
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
 {id:'typewriter',name:'The Damned Typewriter',kind:'Occult writing machine',cost:250,tier:1,focus:5,perk:'Final Draft',desc:'The ribbon is an artery. The return key is a tombstone.',effect:'Webpage typing bursts store 1 ink (up to 5). Each damaging spell spends 1 ink for +12 damage and +3 burn damage.',color:'#c4a0ea'},
 {id:'receipts',name:'Hands of Infinite Receipts',kind:'Merchant’s gloves',cost:200,tier:1,perk:'Thank You for Your Damnation',desc:'Your soul is nonrefundable. Would you like a bag?',effect:'Every 25 webpage clicks while equipped grants 12 bonus coins. The counter pauses when unequipped.',color:'#d8be79'}
].map(e=>({...e,rarity:'Exotic'}));
export const hasExotic=(s,id)=>s.equippedExotics?.includes(id)||false;
export function exoticBonuses(s){const total={attack:0,defense:0,hp:0,focus:0};for(const id of new Set(s.equippedExotics||[])){const e=EXOTICS.find(x=>x.id===id);if(e)for(const stat of Object.keys(total))total[stat]+=e[stat]||0;}return total;}
function random(seed){let x=seed>>>0;return()=>{x=(x+0x6D2B79F5)>>>0;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
export const exoticTier=s=>Math.min(4,1+Math.floor((s.stage-1)/3));
export function exoticOffers(s){
 const pool=EXOTICS.filter(e=>e.tier<=exoticTier(s)&&!s.ownedExotics?.includes(e.id));const next=random((s.exoticShop?.seed||1)^Math.imul(s.exoticShop?.rotation||0,2654435761));
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 return pool.slice(0,4);
}
export function mergeEffect(b,name,e){
 const old=b.effects[name];b.effects[name]={...e,damage:Math.max(old?.damage||0,e.damage||0),power:Math.max(old?.power||0,e.power||0),amp:Math.max(old?.amp||0,e.amp||0),turns:Math.max(old?.turns||0,e.turns||0),silence:!!(old?.silence||e.silence)};
}
export function shopStock(s){
 if(Array.isArray(s.exoticShop?.stock))return s.exoticShop.stock.map(id=>EXOTICS.find(e=>e.id===id)).filter(e=>e&&e.tier<=exoticTier(s)&&!s.ownedExotics?.includes(e.id));
 return exoticOffers(s);
}
export function rotateShop(s){
 const old=new Set(s.exoticShop.stock||[]);s.exoticShop.rotation++;
 const drawn=exoticOffers(s);if(drawn.length&&drawn.every(e=>old.has(e.id))){const other=EXOTICS.find(e=>e.tier<=exoticTier(s)&&!s.ownedExotics.includes(e.id)&&!old.has(e.id));if(other)drawn[drawn.length-1]=other;}
 s.exoticShop.stock=drawn.map(e=>e.id);
}
export function canRerollShop(s){const shown=new Set(shopStock(s).map(e=>e.id));return EXOTICS.some(e=>e.tier<=exoticTier(s)&&!s.ownedExotics.includes(e.id)&&!shown.has(e.id));}
