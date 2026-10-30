import {PROLOGUE_SHOTS} from './prologue-script.js';
import {VOICE_DURATIONS} from './prologue-voices.js';
let clock=0;
export const OPENING_TIMELINE=PROLOGUE_SHOTS.map((shot,index)=>{
 let at=.9;const lines=shot.lines.map(line=>{const length=VOICE_DURATIONS[line.id];if(!Number.isFinite(length))throw Error('Missing voice timing: '+line.id);const v={...line,at,length};at+=length+.4;return v;});
 const duration=Math.max(6.5,at+.8),v={...shot,index,start:clock,duration,lines};clock+=duration;return v;
});
export const OPENING_DURATION=clock;
export function openingFrame(time){
 const t=Math.max(0,Math.min(OPENING_DURATION,time)),shot=OPENING_TIMELINE.find(s=>t<s.start+s.duration)||OPENING_TIMELINE.at(-1),local=t-shot.start;
 const line=shot.lines.find(l=>local>=l.at&&local<l.at+l.length+.25)||null;
 const progress=Math.min(1,Math.max(0,local/shot.duration)),ease=progress*progress*(3-2*progress);
 return {shot,line,local,progress,ease,finished:t>=OPENING_DURATION,fade:Math.max(0,1-local/.7,1-(shot.duration-local)/.6)};
}
