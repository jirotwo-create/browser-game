import {EXOTICS} from './exotics.js';
import {gearArt} from './assets/art.js';
const colors={blood:'#e74c6d',bone:'#b9ed98',void:'#b68aff'};
let played,first=true;
export function combatEffects(fx){
 if(first){first=false;played=fx?.id;return;}
 if(!fx||fx.id===played)return;played=fx.id;
 const scene=document.querySelector('.scene');if(!scene)return;
 const old=scene.querySelector('.combat-visual');old?.remove();
 const layer=document.createElement('div');layer.className=`combat-visual effect-${fx.move}`;if(scene.querySelector('canvas.real-3d')?.style.visibility!=='hidden'&&scene.querySelector('canvas.real-3d'))layer.classList.add('has-3d');layer.style.setProperty('--spell-color',colors[fx.tree]);
 const title=document.createElement('div');title.className='combat-announcement';title.textContent=fx.victory?'SOUL VANQUISHED':fx.defeat?'THE HOLLOW CLAIMS YOU':fx.title;layer.append(title);
 const symbol=document.createElement('div');symbol.className='ability-symbol';symbol.textContent={attack:'╱',guard:'◇',spell:'✦',rend:'╱╱╱',feast:'◈',riposte:'⚔',rage:'♛',bastion:'⬡',mend:'✚',reprisal:'◇',hex:'⛧',drain:'◎',nova:'✹',eclipse:'◐'}[fx.move]||'✦';layer.append(symbol);
 const events=fx.victory?[{type:'reward',amount:fx.coins,label:'COINS'},...fx.events.filter(e=>['heal','revive'].includes(e.type))]:fx.events.filter(e=>e.amount>0);
 for(const [i,e]of events.slice(0,7).entries()){
  const text=document.createElement('span');text.className=`combat-number number-${e.type}`;text.style.setProperty('--delay',`${(e.label==='Parliament of Rats'?850:['hurt','absorb','revive'].includes(e.type)?1000:400)+i*40}ms`);
  text.textContent=['damage','bleed','burn','counter','reflect','hurt','exoticDamage'].includes(e.type)?`−${e.amount}`:`+${e.amount}`;
  const label=document.createElement('small');label.textContent=e.label||{heal:'HEAL',barrier:'BARRIER',absorb:'ABSORBED',focus:'FOCUS',hurt:'YOUR HEALTH',shatter:'SHATTER',revive:'LAST RITES',reward:'COINS'}[e.type]||e.type.toUpperCase();text.append(label);
  text.style.left=['heal','hurt','focus','barrier','absorb','revive'].includes(e.type)?`${18+i%2*6}%`:`${58+i%2*8}%`;text.style.top=`${34+(i%3)*11}%`;layer.append(text);
 }
 if(fx.events.some(e=>e.type==='revive'))layer.classList.add('reviving');
 if(fx.exotics?.length){const special=['meteor','bell','mouth','choir','pallbearer','understudy','typewriter','rats','tea','miser','sun','echoBlade'].find(id=>fx.exotics.includes(id))||fx.exotics[0];const apparition=document.createElement('img');apparition.className=`relic-apparition relic-${special}`;apparition.src=`assets/renders/gear-${special}.png`;apparition.alt='';layer.append(apparition);const procs=document.createElement('div');procs.className='exotic-procs';for(const id of fx.exotics.slice(0,6)){const e=EXOTICS.find(e=>e.id===id);const tag=document.createElement('div');tag.innerHTML=gearArt(e.id,e.name);const label=document.createElement('span');label.textContent=e.perk;tag.append(label);procs.append(tag);}if(fx.exotics.length>6){const extra=document.createElement('small');extra.textContent=`+${fx.exotics.length-6} MORE EXOTIC EFFECTS`;procs.append(extra);}layer.append(procs);}
 scene.append(layer);setTimeout(()=>layer.remove(),2600);
}
export function statusHTML(b,icon){
 if(!b)return '';
 const chips=[];
 for(const [name,e]of Object.entries(b.effects||{})){
  const desc=name==='curse'?`Enemy takes ${Math.round(e.amp*100)}% more damage and deals ${e.power} less damage.${e.silence?' Heavy attacks suppressed.':''}`:`Deals ${e.damage} damage at the start of your next ${e.turns} turns.`;
  chips.push(`<span class="status-chip status-${name}" title="${desc}">${icon(name==='bleed'?'drop':name==='burn'?'flame':'eye')} ${name.toUpperCase()} <b>${e.turns}t</b></span>`);
 }
 if(b.barrier)chips.push(`<span class="status-chip status-barrier" title="Absorbs the next ${b.barrier} damage you would take.">${icon('shield')} BARRIER <b>${b.barrier}</b></span>`);
 if(b.regen)chips.push(`<span class="status-chip status-regen" title="Restore ${b.regen.heal} health at the start of your next ${b.regen.turns} turns.">${icon('plus')} REGEN <b>${b.regen.turns}t</b></span>`);
 if(b.resonance)chips.push(`<span class="status-chip status-curse" title="Consecutive damaging spell chain. Non-spell turns reset this.">${icon('rune')} RESONANCE <b>×${b.resonance}</b></span>`);
 return `<div class="status-strip">${chips.length?chips.join(''):'<span class="no-status">NO ACTIVE EFFECTS</span>'}</div>`;
}
