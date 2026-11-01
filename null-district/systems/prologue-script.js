// Original screenplay. Camera vectors are local to the named cinematic set.
export const SPEAKERS={
 care:{name:'SABLE / CUSTOMER CARE',role:'Municipal consciousness services',color:'#efae87'},
 courier:{name:'COURIER 09',role:'Delivery runner / debt outstanding',color:'#cce6a1'},
 vesper:{name:'VESPER',role:'Network engineer / deceased',color:'#7eeaff'},
 regent:{name:'THE ASH REGENT',role:'Sovereign of the licensed dead',color:'#eaa0d7'}
};
export const PROLOGUE_SHOTS=[
 {id:'city',set:'city',location:'NULL DISTRICT / 23:47',title:'AFTERLIFE, INCORPORATED',from:[4,13,24],to:[-2,6,11],lookFrom:[0,7,-18],lookTo:[0,5,-16],fov:[62,55],lines:[
  {id:'city-care',speaker:'care',text:"Welcome to Null District. Your afterlife is in safe hands."},
  {id:'city-courier',speaker:'courier',text:"Sable owns the city. Die owing them money, and they put you straight back to work."}]},
 {id:'court',set:'court',location:'BENEATH THE CITY / THE VEIL',title:'THE CONTRACT',from:[8,3,19],to:[2,5,8],lookFrom:[0,8,-24],lookTo:[0,9,-30],fov:[60,52],lines:[
  {id:'court-vesper',speaker:'vesper',text:"I helped build their soul network. The Ashen Court supplies the dead. Sable works them until nothing is left."},
  {id:'court-regent',speaker:'regent',text:"You may spend their memories. Their souls remain mine."}]},
 {id:'harvest',set:'harvest',location:'SABLE / CONTINUITY DIVISION',title:'NO ONE IS OFF THE CLOCK',from:[-5,2.4,7],to:[3,2.1,5],lookFrom:[0,1.7,-3],lookTo:[0,1.6,-4],fov:[56,48],lines:[
  {id:'harvest-care',speaker:'care',text:"Your service continues after death. Please remain at your assigned station."},
  {id:'harvest-courier',speaker:'courier',text:"After the crash, Sable put me back to work. They said one last delivery would clear my debt."}]},
 {id:'receipt',set:'exchange',location:'A DELIVERY WITH YOUR NAME ON IT',title:'ACCOUNT 00009',from:[1.8,2.2,3.1],to:[.1,1.9,1.7],lookFrom:[0,1.5,-.7],lookTo:[0,1.6,-.9],fov:[49,43],lines:[
  {id:'receipt-courier',speaker:'courier',text:"My name. Date of death. So I never made it out."},
  {id:'receipt-vesper',speaker:'vesper',text:"They brought your body back. Your soul is still under contract. Just like mine."}]},
 {id:'vesper',set:'exchange',location:'ILLEGAL SIGNAL / VESPER',title:'A VOICE IN THE WIRE',from:[-2.8,1.8,.6],to:[-2.1,1.65,-.2],lookFrom:[-2,1.65,-2.4],lookTo:[-2,1.7,-2.4],fov:[47,42],lines:[
  {id:'vesper-plan',speaker:'vesper',text:"I tried to shut the network down. They killed me and trapped me inside it. Your name is on tonight's blacklist."},
  {id:'vesper-courier',speaker:'courier',text:"Blacklist? What happens to the people on it?"},
  {id:'vesper-transfer',speaker:'vesper',text:"At midnight, Rainline sends their souls to the Court. We erase the list and sever the broadcast. No names, no transfer."}]},
 {id:'sword',set:'exchange',location:'MOURNFANG / UNREGISTERED RELIC',title:'THE DEAD REMEMBER',from:[2.5,1.9,.4],to:[1.9,1.8,.3],lookFrom:[1.4,1.65,-1.6],lookTo:[1.4,1.6,-1.7],fov:[48,40],lines:[
  {id:'sword-vesper',speaker:'vesper',text:"Mournfang cuts the bindings that hold a soul. We need it to break the cathedral seals."},
  {id:'sword-courier',speaker:'courier',text:"You put this in my delivery. Why me?"},
  {id:'sword-choice',speaker:'vesper',text:"You can move through their checkpoints. I can't leave the wire. And you're the first courier who opened the package."}]},
 {id:'market',set:'market',location:'KABUKI AFTERMARKET / STOLEN MEMORIES',title:'FIND THE NAMES',from:[-5,3.4,16],to:[-1,2.3,5],lookFrom:[0,3,-9],lookTo:[2,2,-11],fov:[60,55],lines:[
  {id:'market-vesper',speaker:'vesper',text:"First, steal a rift key to get below the city. Break the cathedral seals, then recover the blacklist from the Kabuki broker."}]},
 {id:'train',set:'train',location:'SHIN-KURO / THE DEAD LINE',title:'REACH THE TRANSMITTER',from:[9,2.8,20],to:[9,2.4,8],lookFrom:[2,2,-3],lookTo:[0,2,-18],fov:[62,57],lines:[
  {id:'train-vesper',speaker:'vesper',text:"The dead line carries sealed cargo to Rainline. Take the blacklist aboard. It will let us erase the names before the transfer."},
  {id:'train-care',speaker:'care',text:"Unauthorized passengers will be returned to processing. Thank you for your cooperation."}]},
 {id:'regent',set:'roof',location:'RAINLINE / BROADCAST T-MINUS 13 MINUTES',title:'VOID THE CONTRACT',from:[3.8,3.1,-4],to:[1.2,2.5,-8.2],lookFrom:[0,2.5,-12],lookTo:[0,2.4,-12],fov:[58,48],lines:[
  {id:'regent-warning',speaker:'regent',text:"Break your contract, courier, and I will take the district in your place."},
  {id:'regent-courier',speaker:'courier',text:"You don't get them either. We're ending this."}]},
 {id:'deployment',set:'city',location:'THE LOWER STACKS / YOUR SHIFT BEGINS',title:'CHROME & ASH',from:[0,3.1,27],to:[0,1.65,22],lookFrom:[0,2,-8],lookTo:[0,1.65,-12],fov:[54,72],lines:[
  {id:'deploy-vesper',speaker:'vesper',text:"There's a surveillance terminal ahead. It can lead you to the rift key. I'll stay with you."},
  {id:'deploy-courier',speaker:'courier',text:"Keep that channel open. We get everyone off that list."}]}
];
