// Original screenplay. Camera vectors are local to the named cinematic set.
export const SPEAKERS={
 care:{name:'SABLE / CUSTOMER CARE',role:'Municipal consciousness services',color:'#efae87'},
 courier:{name:'COURIER 09',role:'Delivery runner / account deceased',color:'#cce6a1'},
 vesper:{name:'VESPER',role:'Network engineer / deceased',color:'#7eeaff'},
 regent:{name:'THE ASH REGENT',role:'Sovereign of the licensed dead',color:'#eaa0d7'}
};
export const PROLOGUE_SHOTS=[
 {id:'city',set:'city',location:'NULL DISTRICT / 23:47',title:'AFTERLIFE, INCORPORATED',from:[4,13,24],to:[-2,6,11],lookFrom:[0,7,-18],lookTo:[0,5,-16],fov:[62,55],lines:[
  {id:'city-care',speaker:'care',text:'Welcome to Null District. Your life is valuable. Your afterlife is billable.'},
  {id:'city-courier',speaker:'courier',text:'Sable bought the city. Then they found a way to keep collecting after we died.'}]},
 {id:'court',set:'court',location:'BENEATH THE CITY / THE VEIL',title:'THE CONTRACT',from:[8,3,19],to:[2,5,8],lookFrom:[0,8,-24],lookTo:[0,9,-30],fov:[60,52],lines:[
  {id:'court-vesper',speaker:'vesper',text:'They opened the Veil. The Ashen Court sold them the dead. Every memory became fuel.'},
  {id:'court-regent',speaker:'regent',text:'A soul is a kingdom. A kingdom must pay its due.'}]},
 {id:'harvest',set:'harvest',location:'SABLE / CONTINUITY DIVISION',title:'NO ONE IS OFF THE CLOCK',from:[-5,2.4,7],to:[3,2.1,5],lookFrom:[0,1.7,-3],lookTo:[0,1.6,-4],fov:[56,48],lines:[
  {id:'harvest-care',speaker:'care',text:'Death does not terminate your contract. Thank you for your continued service.'},
  {id:'harvest-courier',speaker:'courier',text:'I was a courier. One sealed delivery. Enough money to disappear.'}]},
 {id:'receipt',set:'exchange',location:'A DELIVERY WITH YOUR NAME ON IT',title:'ACCOUNT 00009',from:[1.8,2.2,3.1],to:[.1,1.9,1.7],lookFrom:[0,1.5,-.7],lookTo:[0,1.6,-.9],fov:[49,43],lines:[
  {id:'receipt-courier',speaker:'courier',text:'The receipt said I was already dead.'},
  {id:'receipt-vesper',speaker:'vesper',text:'You are. So am I. I built their network. They buried me inside it.'}]},
 {id:'vesper',set:'exchange',location:'ILLEGAL SIGNAL / VESPER',title:'A VOICE IN THE WIRE',from:[-2.8,1.8,.6],to:[-2.1,1.65,-.2],lookFrom:[-2,1.65,-2.4],lookTo:[-2,1.7,-2.4],fov:[47,42],lines:[
  {id:'vesper-plan',speaker:'vesper',text:'At midnight, Rainline broadcasts every name in the district to the Court. We cut the feed first.'},
  {id:'vesper-courier',speaker:'courier',text:'And the sword in my delivery?'}]},
 {id:'sword',set:'exchange',location:'MOURNFANG / UNREGISTERED RELIC',title:'THE DEAD REMEMBER',from:[2.5,1.9,.4],to:[1.9,1.8,.3],lookFrom:[1.4,1.65,-1.6],lookTo:[1.4,1.6,-1.7],fov:[48,40],lines:[
  {id:'sword-vesper',speaker:'vesper',text:'Mournfang. The dead forged it to break their oaths. It can cut the covenant holding us here.'},
  {id:'sword-courier',speaker:'courier',text:'Fine. Where do I start?'}]},
 {id:'market',set:'market',location:'KABUKI AFTERMARKET / STOLEN MEMORIES',title:'FIND THE NAMES',from:[-5,3.4,16],to:[-1,2.3,5],lookFrom:[0,3,-9],lookTo:[2,2,-11],fov:[60,55],lines:[
  {id:'market-vesper',speaker:'vesper',text:'Steal the rift key. Break the cathedral seals. Kabuki has the blacklist: every soul they plan to sell.'}]},
 {id:'train',set:'train',location:'SHIN-KURO / THE DEAD LINE',title:'CARRY THE TRUTH',from:[9,2.8,20],to:[9,2.4,8],lookFrom:[2,2,-3],lookTo:[0,2,-18],fov:[62,57],lines:[
  {id:'train-vesper',speaker:'vesper',text:'Hijack the dead line. Get the evidence to Rainline before the signal goes live.'},
  {id:'train-care',speaker:'care',text:'Interference with collection is punishable by permanent employment.'}]},
 {id:'regent',set:'roof',location:'RAINLINE / BROADCAST T-MINUS 13 MINUTES',title:'VOID THE CONTRACT',from:[3.8,3.1,-4],to:[1.2,2.5,-8.2],lookFrom:[0,2.5,-12],lookTo:[0,2.4,-12],fov:[58,48],lines:[
  {id:'regent-warning',speaker:'regent',text:'Everything that dies belongs to me.'},
  {id:'regent-courier',speaker:'courier',text:'Then you can come and collect.'}]},
 {id:'deployment',set:'city',location:'THE LOWER STACKS / YOUR SHIFT BEGINS',title:'CHROME & ASH',from:[0,3.1,27],to:[0,1.65,22],lookFrom:[0,2,-8],lookTo:[0,1.65,-12],fov:[54,72],lines:[
  {id:'deploy-vesper',speaker:'vesper',text:'First, the rift key. I will keep the channel open.'},
  {id:'deploy-courier',speaker:'courier',text:'No more names. No more shifts.'}]}
];
