// The same data powers prerequisites, readable tooltips, loadouts, icons, and combat.
export const TREES={
 blood:{name:'The Bloodbound',role:'Bleed • life-steal • execution',description:'Open wounds, feed on them, then finish the hunt.',color:'#e17479',icon:'drop'},
 bone:{name:'The Deathless',role:'Barrier • regeneration • retaliation',description:'Build a wall of bone. Turn every blow against your enemy.',color:'#adc783',icon:'bone'},
 void:{name:'The Voidcaller',role:'Burn • curse • spell combinations',description:'Weave curses and ghostfire. Make every spell feed the next.',color:'#b499ef',icon:'moon'}
};
function skill(id,tree,name,tier,max,cost,parent,desc,extra={}){return{id,tree,name,tier,max,cost,parent,desc,icon:tree==='blood'?'drop':tree==='bone'?'bone':'rune',...extra};}
export const SKILLS=[
 skill('edge','blood','Bloodletting',0,3,1,null,'Gain 3 attack per rank.'),
 skill('leech','blood','Crimson Tithe',1,3,1,'edge','Strike restores 2 health per rank.'),
 skill('rend','blood','Rend',1,3,1,'edge','Cut for 90% attack + 4 per rank. Apply bleed: 4 + 2 per rank damage for 3 turns.',{active:true,focus:6,cooldown:2,effect:'bleed'}),
 skill('execute','blood','Death Sentence',2,2,2,'leech','Deal 25% more direct damage per rank to enemies below half health.'),
 skill('feast','blood','Sanguine Feast',2,3,1,'leech','Deal 60% attack + 5 per rank. Heal 10 + 4 per rank; double healing against bleeding foes.',{active:true,focus:10,cooldown:3,effect:'leech'}),
 skill('hemorrhage','blood','Open Wounds',2,3,1,'rend','Bleed deals 2 more damage per rank. It also weakens enemy attacks by 1 per rank.'),
 skill('frenzy','blood','Red Frenzy',3,2,2,'hemorrhage','Strike gains 12% damage per rank for every bleed turn remaining (up to 3).'),
 skill('riposte','blood','Crimson Riposte',3,2,2,'execute','Brace: take 50% less damage this turn. Counter for 80% attack + 5 per rank.',{active:true,focus:8,cooldown:3,effect:'counter'}),
 skill('carnage','blood','Blood Harvest',3,2,2,'feast','Winning a hunt heals 8 health and restores 4 focus per rank.'),
 skill('rage','blood','Blood Sovereign',4,1,3,'edge','Unlock Blood Rite: deal 230% attack. Costs 12 health instead of focus.',{active:true,focus:0,health:12,cooldown:3,effect:'blood',gate:8}),
 skill('ward','bone','Ossuary',0,3,1,null,'Gain 2 defense and 8 maximum health per rank.'),
 skill('shelter','bone','Grave Shelter',1,3,1,'ward','Guard heals 4 additional health per rank.'),
 skill('bastion','bone','Bone Bastion',1,3,1,'ward','Gain a barrier absorbing 20 + 8 per rank damage. It lasts until broken or the battle ends.',{active:true,focus:8,cooldown:3,effect:'barrier'}),
 skill('resolve','bone','Unburied',2,2,2,'shelter','Restore 8 health per rank when a battle begins.'),
 skill('mend','bone','Gravebloom',2,3,1,'shelter','Heal 16 + 8 per rank. Regenerate 4 + 2 per rank health on your next 3 turns.',{active:true,focus:12,cooldown:4,effect:'heal'}),
 skill('thorns','bone','Splinter Crown',2,3,1,'bastion','After an enemy strike, reflect 2 damage per rank. Reflect double while a barrier protects you.'),
 skill('fortress','bone','Living Ossuary',3,2,2,'thorns','Guard also builds a 6-point barrier per rank. Barriers from all sources grow 20% per rank.'),
 skill('reprisal','bone','Grave Reprisal',3,2,2,'shelter','Deal 70% attack + 6 per rank. Consume your barrier to add its remaining strength as damage.',{active:true,focus:8,cooldown:3,effect:'shatter'}),
 skill('unyielding','bone','Unyielding',3,2,2,'resolve','Below 35% health, reduce incoming damage by 15% per rank.'),
 skill('revenant','bone','Last Rites',4,1,3,'ward','Survive one fatal blow per battle and rise with 15 health.',{gate:8,effect:'revive'}),
 skill('spark','void','Cinder Script',0,3,1,null,'Gain 5 maximum focus and 4 spell damage per rank.'),
 skill('echo','void','Keyboard Hex',1,3,1,'spark','Webpage typing bursts restore 2 additional focus per rank.'),
 skill('hex','void','Withering Hex',1,3,1,'spark','Curse the enemy for 3 turns: it deals 2 + 2 per rank less damage and takes 20% more direct damage.',{active:true,focus:8,cooldown:3,effect:'curse'}),
 skill('omen','void','Dark Omen',2,2,2,'echo','Soulfire and Eclipse weaken the enemy’s next strike by 3 damage per rank.'),
 skill('drain','void','Soul Siphon',2,3,1,'echo','Deal 8 + 5 per rank + spell power. Restore 6 + 2 per rank focus and heal half the damage dealt.',{active:true,focus:4,cooldown:3,effect:'siphon'}),
 skill('kindle','void','Ghostfire',2,3,1,'hex','Soulfire applies burn: 3 damage per rank for 2 turns. Burn and bleed can coexist.'),
 skill('resonance','void','Forbidden Resonance',3,2,2,'kindle','Every consecutive damaging spell gains 15% spell damage per rank, stacking up to 3 times. Non-spell turns reset it.'),
 skill('nova','void','Soul Nova',3,2,2,'omen','Deal 22 + 10 per rank + spell power. Consume burn for an additional 3 times its per-turn damage.',{active:true,focus:18,cooldown:4,effect:'nova'}),
 skill('conduit','void','Night Conduit',3,2,2,'echo','All spells cost 1 less focus per rank (minimum 1). Guard restores 2 additional focus per rank.'),
 skill('eclipse','void','Total Eclipse',4,1,3,'spark','Deal 40 + 6 per Cinder rank + 3 per level. Heal 16 health.',{active:true,focus:20,cooldown:4,effect:'eclipse',gate:8})
];
export const RUNES={
 rend:[{id:'deep',name:'Lingering Wound',desc:'Bleed lasts 5 turns instead of 3.'},{id:'rupture',name:'Rupture',desc:'Consume an existing bleed for 5 times its per-turn damage. Applies no new bleed.'}],
 feast:[{id:'gorge',name:'Scarlet Communion',desc:'Heal 50% more health.'},{id:'essence',name:'Blood into Ink',desc:'Halve the healing; restore 8 focus.'}],
 riposte:[{id:'duelist',name:'Duelist',desc:'Counter deals 40% more damage.'},{id:'patient',name:'Patient Hunter',desc:'Take 70% less damage instead of 50%.'}],
 rage:[{id:'ravenous',name:'Ravenous',desc:'Heal for 20% of damage dealt.'},{id:'sacrifice',name:'Final Sacrifice',desc:'Costs 20 health; deal 300% attack.'}],
 bastion:[{id:'aegis',name:'Cathedral Aegis',desc:'Barrier strength increases by 40%.'},{id:'spikes',name:'Barbed Bastion',desc:'Gain 8 additional reflected damage for 2 enemy strikes.'}],
 mend:[{id:'renewal',name:'Evergreen',desc:'Regeneration lasts 5 turns instead of 3.'},{id:'surge',name:'Life Surge',desc:'Double the immediate heal, but grant no regeneration.'}],
 reprisal:[{id:'fracture',name:'Cataclysm',desc:'Each barrier point adds 1.5 damage instead of 1.'},{id:'keeper',name:'Gravekeeper',desc:'Only consume half of your barrier; add only the consumed amount as damage.'}],
 hex:[{id:'frailty',name:'Frailty',desc:'Enemy takes 35% more direct damage instead of 20%.'},{id:'silence',name:'Dread Silence',desc:'Curse suppresses heavy blows; enemy uses a normal attack instead.'}],
 drain:[{id:'hunger',name:'Soul Hunger',desc:'Heal for 100% of damage dealt instead of 50%.'},{id:'font',name:'Endless Font',desc:'Restore 6 additional focus.'}],
 nova:[{id:'detonate',name:'Detonation',desc:'Consumed burn adds 5 times its damage instead of 3.'},{id:'collapse',name:'Event Horizon',desc:'Consume no burn; apply a 2-turn curse with +20% damage taken and −4 enemy damage.'}],
 eclipse:[{id:'umbra',name:'Umbra',desc:'Apply a 3-turn curse: +20% damage taken and −5 enemy damage.'},{id:'dawn',name:'Black Dawn',desc:'Restore 32 health instead of 16.'}]
};
export const rank=(s,id)=>s.skills?.[id]||0;
export const treePoints=(s,tree)=>SKILLS.filter(k=>k.tree===tree).reduce((n,k)=>n+rank(s,k.id)*k.cost,0);
export function requirements(s,k){
 if(k.parent&&!rank(s,k.parent))return `Learn ${SKILLS.find(x=>x.id===k.parent).name} first (rank 1).`;
 if(k.gate&&treePoints(s,k.tree)<k.gate)return `Spend ${k.gate} points in ${k.tree} (${treePoints(s,k.tree)}/${k.gate}).`;
 return '';
}
export function runeUnlocked(s,k){return k.max===1?treePoints(s,k.tree)>=12:rank(s,k.id)>=2;}
export const runeFor=(s,id)=>RUNES[id]?.find(r=>r.id===s.runes?.[id]);
export function focusCost(s,k){return Math.max(k.focus?1:0,(k.focus||0)-(k.tree==='void'?rank(s,'conduit'):0));}
export function moveSkill(move){return SKILLS.find(k=>k.active&&k.id===({rite:'rage'}[move]||move));}
export function moveReady(s,move){
 if(!s.battle)return 'Begin a hunt first.';
 const k=moveSkill(move);
 if(!k){if(!['attack','guard','spell'].includes(move))return 'Unknown ability.';if(move==='spell'&&s.focus<Math.max(1,10-rank(s,'conduit')))return 'Not enough focus.';return '';}
 if(!rank(s,k.id))return 'Learn this skill first.';
 if(!s.loadout?.includes(k.id))return 'Equip this skill at the bonfire.';
 if(s.battle.cooldowns?.[k.id])return `${s.battle.cooldowns[k.id]} turn cooldown.`;
 if(s.focus<focusCost(s,k))return 'Not enough focus.';
 const hp=k.id==='rage'&&s.runes?.rage==='sacrifice'?20:k.health||0;
 if(s.hp<=hp)return 'Not enough health.';
 return '';
}
export const PRESETS={
 bleed:{name:'Bleed & feed',desc:'Rend → Feast → Blood Rite. Open wounds, steal life, execute.',path:['edge','rend','leech','feast','hemorrhage','execute','frenzy','carnage','rage'],loadout:['rend','feast','rage']},
 fortress:{name:'Bone fortress',desc:'Bastion → Gravebloom → Reprisal. Build a barrier, heal, shatter it.',path:['ward','bastion','shelter','mend','thorns','fortress','reprisal','resolve','unyielding','revenant'],loadout:['bastion','mend','reprisal']},
 hexweaver:{name:'Hexweaver',desc:'Hex → Soulfire → Nova. Curse, burn, detonate.',path:['spark','hex','echo','omen','kindle','nova','resonance','conduit','eclipse'],loadout:['hex','nova','eclipse']}
};
export function skillPower(s,k,st,n){
 const attack=st.attack,power=rank(s,'spark')*4;
 const effects={
  edge:`+${n*3} attack`,leech:`Strike heals ${n*2} health`,execute:`+${n*25}% damage below half enemy health`,
  rend:`${Math.round(attack*.9+n*4)} direct damage; ${4+n*2+rank(s,'hemorrhage')*2} bleed damage for 3 turns`,
  feast:`${Math.round(attack*.6+n*5)} damage; heal ${10+n*4} (${(10+n*4)*2} if bleeding)`,
  hemorrhage:`+${n*2} bleed damage; bleeding enemy deals ${n} less damage`,frenzy:`+${n*12}% Strike damage per bleed turn (up to +${n*36}%)`,
  riposte:`Counter for ${Math.round(attack*.8+n*5)} damage; take 50% less damage`,carnage:`Victory restores ${n*8} health and ${n*4} focus`,rage:`${Math.round(attack*2.3)} damage for 12 health`,
  ward:`+${n*2} defense and +${n*8} maximum health`,shelter:`Guard restores ${4+n*4} health`,bastion:`${Math.round((20+n*8)*(1+rank(s,'fortress')*.2))}-point barrier`,resolve:`Heal ${n*8} when the hunt starts`,
  mend:`Heal ${16+n*8} now, then ${4+n*2} on each of the next 3 turns`,thorns:`Reflect ${n*2} damage (${n*4} if shielded)`,fortress:`Guard grants ${n*6} base barrier; +${n*20}% to all barriers`,
  reprisal:`${Math.round(attack*.7+n*6)} damage plus remaining barrier`,unyielding:`Take ${n*15}% less damage below 35% health`,revenant:'Survive one fatal blow per battle with 15 health',
  spark:`+${n*5} maximum focus and +${n*4} spell damage`,echo:`Typing bursts restore ${8+n*2} focus`,hex:`−${2+n*2} enemy damage; +20% damage taken for 3 strikes`,omen:`Soulfire and Eclipse weaken the next strike by ${n*3} damage`,
  drain:`${8+n*5+power} damage; restore ${6+n*2} focus; heal half of damage`,kindle:`Soulfire applies ${n*3} burn damage for 2 turns`,resonance:`+${n*15}% spell damage per chain step (up to +${n*45}%)`,
  nova:`${22+n*10+power} damage; consume burn for +3× its per-turn damage`,conduit:`Spells cost ${n} less focus; Guard grants ${6+n*2} focus`,eclipse:`${40+rank(s,'spark')*6+s.level*3} damage and 16 healing`
 };
 return effects[k.id];
}
