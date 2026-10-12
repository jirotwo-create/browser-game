// Equipment type and rarity are independent. Every slot is available from the start.
export const EQUIPMENT_SLOTS=['weapon','helmet','chest','arms','legs','accessory','testament'];
export const ARMOR_SLOTS=['helmet','chest','arms','legs','accessory'];
export const DEFAULT_LOADOUT={weapon:'rust',helmet:'ashhood',chest:'rags',arms:'bindings',legs:'pilgrimboots',accessory:'torncape',testament:'oath'};
export const SLOT_LABELS={weapon:'Weapon',helmet:'Helmet',chest:'Chest',arms:'Arms',legs:'Legs',accessory:'Accessory',testament:'Testament'};
export const GEAR=[
 {id:'rust',name:'Graveborn Blade',slot:'weapon',tier:1,cost:0,power:0,rarity:'Worn',desc:'Even rust remembers the taste of blood.'},
 {id:'rags',name:'Pilgrim’s Shroud',slot:'chest',tier:1,cost:0,power:0,rarity:'Worn',desc:'A burial cloth. Not yet your own.'},
 {id:'fang',name:'Widow’s Fang',slot:'weapon',tier:1,cost:35,power:5,rarity:'Uncommon',desc:'A serrated edge, hungry for the living.'},
 {id:'iron',name:'Blackiron Cuirass',slot:'chest',tier:1,cost:30,power:3,hp:3,rarity:'Uncommon',desc:'Forged beneath a sun that never rose.'},
 {id:'reaper',name:'Ashen Reaper',slot:'weapon',tier:2,cost:90,power:12,rarity:'Rare',desc:'The harvest is always late in the Hollow.'},
 {id:'mantle',name:'Wraithskin Mantle',slot:'accessory',tier:2,cost:80,power:2,focus:4,rarity:'Rare',desc:'The dead whisper between its stitches.'},
 {id:'thorn',name:'Thorn of the Eclipse',slot:'weapon',tier:3,cost:180,power:22,rarity:'Epic',desc:'A splinter from the crown of a fallen god.'},
 {id:'cathedral',name:'Cathedral Plate',slot:'chest',tier:3,cost:165,power:8,hp:9,rarity:'Epic',desc:'Wear the last walls of a ruined sanctuary.'},
 {id:'god',name:'Godsunder',slot:'weapon',tier:4,cost:340,power:34,rarity:'Legendary',desc:'No prayer can turn aside this blade.'},
 {id:'night',name:'Sovereign of Night',slot:'chest',tier:4,cost:310,power:12,hp:12,rarity:'Legendary',desc:'The darkness kneels to its rightful heir.'},
 {id:'ashhood',name:'Ashen Pilgrim Hood',slot:'helmet',tier:1,cost:0,power:0,rarity:'Worn',desc:'A hood pulled against the ashes of the world.'},
 {id:'bindings',name:'Oathbound Wraps',slot:'arms',tier:1,cost:0,power:0,rarity:'Worn',desc:'Keep your hands steady. The oath never will.'},
 {id:'pilgrimboots',name:'Graveway Greaves',slot:'legs',tier:1,cost:0,power:0,rarity:'Worn',desc:'Every road eventually finds the grave.'},
 {id:'torncape',name:'Cinder-Torn Cape',slot:'accessory',tier:1,cost:0,power:0,rarity:'Worn',desc:'The fire spared just enough to follow you.'},
 {id:'oath',name:'Oath of the Unburnt',slot:'testament',tier:1,cost:0,power:0,rarity:'Worn',desc:'An unwritten oath. A place for something terrible to grow.'},
 ...[1,2,3,4].map(tier=>({id:`testament${tier}`,name:['Cinder Covenant','Sepulcher Verses','Martyr’s Testament','Last Scripture'][tier-1],slot:'testament',tier,cost:[30,75,150,280][tier-1],power:0,focus:[3,5,7,10][tier-1],hp:[0,5,8,12][tier-1],rarity:['Uncommon','Rare','Epic','Legendary'][tier-1],desc:'An oath bound in ashes and ink. Its strength comes from the words you keep.'})),
 {id:'wraithplate',name:'Wraithforged Vest',slot:'chest',tier:2,cost:80,power:5,hp:6,rarity:'Rare',desc:'Cold iron remembers a warmer body.'},
 ...['helmet','arms','legs','accessory'].flatMap(slot=>[1,2,3,4].map(tier=>{
  const names={helmet:['Blackiron Visage','Sepulcher Helm','Vesper’s Horns','Crown of the Last Watch'],arms:['Blackiron Gauntlets','Gravehand Grips','Martyr’s Claws','Godchain Gauntlets'],legs:['Blackiron Greaves','Wraithstep Sabatons','Gravewarden Legs','Sovereign’s Treads'],accessory:['Oathkeeper Cape','Wraithskin Mantle','Eclipse Drape','Shroud of the Last Star']};
  const extra=slot==='helmet'?{focus:tier}:slot==='arms'?{attack:tier}:slot==='legs'?{hp:tier*3}:{focus:tier*2};
  return {id:`${slot}${tier}`,name:names[slot][tier-1],slot,tier,cost:[25,65,135,250][tier-1],power:tier,rarity:['Uncommon','Rare','Epic','Legendary'][tier-1],desc:['Forged for a pilgrimage with no return.','The dead left their marks in its seams.','An oath carved into the bones of a saint.','Something ancient bows to its wearer.'][tier-1],...extra};
 })).filter(g=>!(g.slot==='accessory'&&g.tier===2))
];
export function gearBonuses(s){const total={attack:0,defense:0,hp:0,focus:0};for(const slot of EQUIPMENT_SLOTS){const g=GEAR.find(g=>g.id===s[slot]&&g.slot===slot);if(!g)continue;total[slot==='weapon'?'attack':'defense']+=g.power;for(const stat of Object.keys(total))total[stat]+=g[stat]||0;}return total;}
export const defenseReduction=defense=>Math.min(.75,Math.max(0,defense)/(Math.max(0,defense)+35));
