import * as T from '../vendor/three.module.js';
import {OPENING_TIMELINE,OPENING_DURATION,openingFrame} from '../systems/prologue-timeline.js';
import {SPEAKERS} from '../systems/prologue-script.js';
import {makePrologueSet} from './prologue-set.js';
const $=id=>document.getElementById(id);
export function createPrologue({pipeline,materials,textures,gear,onFinish}){
 let stage=null,status='idle',time=0,anchor=0,epoch=0,ctx=null,master=null,voice=null,lastLine='',muted=false,decoded=new Map(),failed=0,played=new Set(),tones=[],score=null,ready=false,launch=true,deferredPause=false,lastAccent=-1,lastBell='',fx=new Set(),analyser=null,samples=new Uint8Array(256);
 function stopVoice(){if(voice){try{voice.stop();}catch{}voice.disconnect();voice=null;}}
 function mute(value){muted=value;if(master)master.gain.setTargetAtTime(muted||status==='paused'?0:.8,ctx.currentTime,.04);$('opening-mute').textContent=muted?'AUDIO: OFF':'AUDIO: ON';}
 function stopSound(){stopVoice();for(const node of fx){try{node.stop();}catch{}node.disconnect();}fx.clear();for(const t of tones){try{t.stop();}catch{}t.disconnect();}tones=[];score?.disconnect();score=null;master?.disconnect();master=null;}
 function bed(){
  master=ctx.createGain();master.gain.value=muted?0:.8;master.connect(ctx.destination);score=ctx.createGain();score.gain.value=.035;score.connect(master);
  for(const [frequency,type]of [[41.2,'sine'],[82.4,'triangle'],[123.47,'sine']]){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=frequency;g.gain.value=type==='triangle'?.22:.42;o.connect(g);g.connect(score);o.start();tones.push(o);}
 }
 function note(frequency,length,gain,type='sine'){
  if(!master)return;const o=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime;o.type=type;o.frequency.value=frequency;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(gain,now+.025);g.gain.exponentialRampToValueAtTime(.0001,now+length);o.connect(g);g.connect(master);o.start();o.stop(now+length+.05);fx.add(o);o.onended=()=>{fx.delete(o);o.disconnect();g.disconnect();};
 }
 function speak(line,local){
  stopVoice();lastLine=line?.id||'';if(!line||!master)return;const b=decoded.get(line.id),offset=Math.max(0,local-line.at);if(!b||offset>=b.duration)return;
  voice=ctx.createBufferSource();voice.buffer=b;const gain=ctx.createGain();gain.gain.value=.85;analyser=ctx.createAnalyser();analyser.fftSize=256;voice.connect(analyser);analyser.connect(gain);gain.connect(master);voice.start(0,offset);played.add(line.id);
 }
 function apply(){
  if(!stage)return;const f=openingFrame(time),s=f.shot;stage.set(s.set);let level=0;if(analyser&&voice){analyser.getByteTimeDomainData(samples);for(const n of samples)level+=((n-128)/128)**2;level=Math.sqrt(level/samples.length);}stage.animate(time,f.line?.speaker,level,s.id);
  const lerp=(a,b)=>a+(b-a)*f.ease;
  stage.camera.position.set(...s.from.map((v,i)=>lerp(v,s.to[i])));stage.camera.lookAt(new T.Vector3(...s.lookFrom.map((v,i)=>lerp(v,s.lookTo[i]))));stage.camera.rotateZ(Math.sin(time*.25)*.006);stage.camera.fov=lerp(s.fov[0],s.fov[1]);stage.camera.aspect=pipeline.size.x/pipeline.size.y;stage.camera.updateProjectionMatrix();
  $('opening-location').textContent=s.location;$('opening-shot').textContent=s.title;$('opening-scene').textContent=String(s.index+1).padStart(2,'0')+' / '+String(OPENING_TIMELINE.length).padStart(2,'0');
  $('opening-shot-card').style.opacity=Math.max(0,Math.min(1,(3.8-f.local)*1.2));$('opening-progress').style.width=(time/OPENING_DURATION*100)+'%';
  const speaker=f.line?SPEAKERS[f.line.speaker]:null;$('opening-speaker').textContent=speaker?.name||'';$('opening-role').textContent=speaker?.role||'';$('opening-dialogue').textContent=f.line?.text||'';$('opening-caption').style.setProperty('--voice-color',speaker?.color||'#a1e1d1');
  $('opening-fade').style.opacity=status==='loading'?1:ready?0:f.fade;
  $('opening-wave').classList.toggle('speaking',!!f.line&&status==='playing');
  if(status==='playing'&&lastLine!==(f.line?.id||''))speak(f.line,f.local);
  if(score&&status==='playing'){
   if(lastAccent!==s.index){lastAccent=s.index;const root=[41.2,36.71,41.2,43.65,43.65,49,46.25,41.2,36.71,41.2][s.index];[root,root*2,root*3].forEach((f,i)=>tones[i]?.frequency.setTargetAtTime(f,ctx.currentTime,.6));note(root*2,.9,.045,'sine');}
   const beat=Math.floor(f.local/2.4),key=s.index+':'+beat;if(lastBell!==key){lastBell=key;note([329.63,293.66,246.94,220,196,164.81][(beat+s.index)%6],1.7,.018);}
   const pulse=.018+Math.pow(Math.max(0,Math.sin(time*2.4)),8)*.014;score.gain.setTargetAtTime(pulse,ctx.currentTime,.06);}
 }
 function pause(){if(status==='loading'){deferredPause=true;return;}if(status!=='playing')return;time=Math.min(OPENING_DURATION,(performance.now()-anchor)/1000);status='paused';stopVoice();if(master)master.gain.setTargetAtTime(0,ctx.currentTime,.04);if(score)score.gain.setTargetAtTime(0,ctx.currentTime,.04);$('opening-play').textContent='[ SPACE ] RESUME';$('opening-play').classList.remove('hidden');$('opening-wave').classList.remove('speaking');}
 function resume(){if(status!=='paused')return;ctx?.resume();anchor=performance.now()-time*1000;status='playing';mute(muted);lastLine='';$('opening-play').classList.add('hidden');apply();}
 function finish(){if(status==='idle')return;const deploy=launch;epoch++;stopSound();stage?.dispose();stage=null;status='idle';$('opening').classList.add('hidden');document.body.classList.remove('in-opening');onFinish(deploy);}
 async function start({audio,deploy=true}={}){
  epoch++;const token=epoch;ctx=audio;launch=deploy;ready=false;deferredPause=false;lastAccent=-1;lastBell='';time=0;lastLine='';failed=0;played.clear();status='loading';$('opening').classList.remove('hidden');document.body.classList.add('in-opening');$('opening-ready').classList.add('hidden');$('opening-play').classList.add('hidden');$('opening-skip').textContent=deploy?'SKIP / DEPLOY ↗':'RETURN TO MENU ↗';$('opening-loading').classList.remove('hidden');$('opening-caption').style.visibility='visible';
  stage=makePrologueSet(pipeline,materials,textures,gear);apply();
  if(ctx){await Promise.all(OPENING_TIMELINE.flatMap(s=>s.lines).map(async l=>{if(decoded.has(l.id))return;try{const response=await fetch(new URL('./audio/prologue/'+l.id+'.ogg',import.meta.url));if(!response.ok)throw Error('Voice '+response.status);const buffer=await response.arrayBuffer();decoded.set(l.id,await ctx.decodeAudioData(buffer));}catch{failed++;}}));}
  if(token!==epoch)return;$('opening-loading').classList.add('hidden');if(ctx)bed();anchor=performance.now();status='playing';if(deferredPause||document.hidden)pause();apply();
 }
 $('opening-skip').onclick=finish;$('opening-enter').onclick=finish;$('opening-play').onclick=resume;$('opening-mute').onclick=()=>mute(!muted);
 return {start,pause,resume,finish,handleKey(code){if(status==='idle')return false;if(code==='Escape'){finish();return true;}if(code==='Enter'){if(ready)finish();else if(status==='paused')resume();else finish();return true;}if(code==='Space'){status==='paused'?resume():pause();return true;}if(code==='KeyM'){mute(!muted);return true;}return true;},
  tick(){if(status==='paused'){apply();return;}if(status==='playing'){time=Math.min(OPENING_DURATION,(performance.now()-anchor)/1000);if(time>=OPENING_DURATION){ready=true;status='ready';stopSound();$('opening-ready').classList.remove('hidden');$('opening-caption').style.visibility='hidden';$('opening-enter').textContent=launch?'[ ENTER ] TAKE CONTROL ↗':'[ ENTER ] RETURN TO MENU ↗';}apply();}},
  get scene(){return stage?.scene;},get camera(){return stage?.camera;},get diagnostics(){return {status,time,duration:OPENING_DURATION,shot:openingFrame(time).shot.id,speaker:openingFrame(time).line?.speaker||null,line:openingFrame(time).line?.id||null,shots:OPENING_TIMELINE.length,voicesDecoded:decoded.size,voiceFailures:failed,linesPlayed:played.size,muted,...stage?.diagnostics};}
 };
}
