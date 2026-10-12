import * as T from './vendor/three.module.js';
// Fifteen distinct, bounded mesh effects. These consume proc records, never game actions.
export const RELIC_ANIMATIONS={cinder:'Cinder eruption',marionette:'Red puppet strings',maw:'Biting bone jaws',needle:'Needle storm',storm:'Forked lightning',mirror:'Returning mirror blade',clockwork:'Turning saw teeth',lantern:'Five hunting lights',carrion:'Raven murder',furnace:'Infernal chest eruption',glass:'Glass prayer and shrapnel',eclipseMail:'Unseen shadow',rosary:'Turning rosary beads',thornsuit:'Growing and harvested briars',orbit:'Falling comet and orbital ward'};
export function addRelicAnimation(seq,event,hero,enemy){
 if(!RELIC_ANIMATIONS[event.id])return;
 const from=hero.clone().add(new T.Vector3(0,1.35,0)),to=enemy.clone().add(new T.Vector3(0,1.2,0)),delay=event.phase==='reaction'?1.08:.34,begin=seq.nodes.length;
 const node=(geo,color,at,style,extra={},when=delay)=>{const m=seq.add(geo,color,at,1,'relic',when);m.userData.relic={style,from:from.clone(),to:to.clone(),...extra};return m;};
 const ring=(color,at,r,style='expand',when=delay)=>{const m=node(new T.TorusGeometry(r,.04,3,24),color,at,style,{},when);m.rotation.x=Math.PI/2;return m;};
 const dart=(color,i,count,style='dart',when=delay)=>{const m=node(new T.OctahedronGeometry(.12,0),color,from,style,{i,count},when);m.scale.set(.4,1.8,.4);return m;};
 switch(event.id){
 case 'cinder':
  ring(0xff703e,enemy.clone().setY(.12),.6);for(let i=0;i<9;i++){const a=i*Math.PI*2/9;const flame=node(new T.ConeGeometry(.12,.7,4),i%2?0xffb64d:0xff443d,to.clone().add(new T.Vector3(Math.sin(a)*.45,-.8,Math.cos(a)*.45)),'flame',{i});flame.rotation.z=Math.sin(a)*.25;}break;
 case 'marionette':
  for(let i=0;i<5;i++){const endpoint=to.clone().add(new T.Vector3((i-2)*.16,.25,0)),a=event.mode==='ready'?from.clone().add(new T.Vector3(0,1.4,0)):from,vec=endpoint.clone().sub(a);const line=node(new T.CylinderGeometry(.013,.013,vec.length(),4),0xff668c,a.clone().addScaledVector(vec,.5),'string',{i});line.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vec.normalize());}break;
 case 'maw':
  for(const sign of [-1,1]){const jaw=node(new T.TorusGeometry(.62,.12,4,16,Math.PI),0xe0d5b0,to,'jaw',{sign});jaw.rotation.z=sign<0?Math.PI:0;for(let i=0;i<6;i++){const fang=node(new T.ConeGeometry(.075,.25,4),0xffecd0,to.clone().add(new T.Vector3((i-2.5)*.18,0,.09)),'jaw',{sign});fang.rotation.z=sign>0?Math.PI:0;}}
  break;
 case 'needle':
  for(let i=0;i<7;i++){const pin=dart(i%2?0xff627e:0xf1d8ca,i,7,'needle',delay+i*.025);pin.scale.set(.12,2.6,.12);}break;
 case 'storm':
  if(event.mode==='charge'){for(let i=0;i<(event.count||1);i++)node(new T.OctahedronGeometry(.13),0x9be5ff,from,'orbit',{i,count:event.count||1,radius:.55});}
  else for(let branch=0;branch<3;branch++)for(let i=0;i<5;i++){const a=from.clone().lerp(to,i/5),b=from.clone().lerp(to,(i+1)/5);a.y+=Math.sin(i*3+branch)*.13;b.y+=Math.sin((i+1)*3+branch)*.13;const vector=b.clone().sub(a),bolt=node(new T.CylinderGeometry(.025,.025,vector.length(),4),branch?0x967cff:0xdbfcff,a.clone().addScaledVector(vector,.5),'bolt',{i});bolt.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vector.normalize());}break;
 case 'mirror':
  for(let i=0;i<2;i++){const blade=node(new T.BoxGeometry(.2,1.3,.055),i?0xb892ff:0xbce9ff,to.clone().add(new T.Vector3((i-.5)*.38,.1,.2)),'mirror',{i},delay+i*.1);blade.rotation.z=-.65;}break;
 case 'clockwork':
  ring(0xf0bd69,to,.52,'saw');for(let i=0;i<12;i++){const a=i*Math.PI/6;const tooth=node(new T.ConeGeometry(.085,.2,3),0xffdc8a,to,'tooth',{i,radius:.55});tooth.rotation.z=-a;}break;
 case 'lantern':
  for(let i=0;i<5;i++){const light=node(new T.IcosahedronGeometry(.13,0),i%2?0xbd92ff:0x91ffd0,from,'light',{i,count:5},delay+i*.035);light.scale.set(.8,1.3,.8);}break;
 case 'carrion':
  for(let i=0;i<5;i++){
   const bird=node(new T.OctahedronGeometry(.15),0x504263,from,'raven',{i,part:0},delay+i*.035);bird.material.blending=T.NormalBlending;bird.scale.set(.55,.55,1.2);
   for(const sign of [-1,1]){const wing=node(new T.BoxGeometry(.35,.045,.16),0xa783c8,from,'raven',{i,part:sign},delay+i*.035);wing.rotation.z=sign*.3;}
  }break;
 case 'furnace':
  ring(0xff7144,hero.clone().setY(.15),.55);for(let i=0;i<12;i++){const a=i*Math.PI/6;const shard=node(new T.ConeGeometry(.07,.6,4),i%2?0xffb461:0xff493c,from,'furnace',{i,angle:a});shard.rotation.z=a;}break;
 case 'glass':
  if(event.mode==='guard'){for(let i=0;i<8;i++){const a=i*Math.PI/4;const shard=node(new T.OctahedronGeometry(.28),i%2?0x9cecff:0xdebcff,from.clone().add(new T.Vector3(Math.sin(a)*.7,Math.cos(a)*.5,.1)),'glass',{i},.12);shard.scale.set(.5,1.2,.22);}}
  else for(let i=0;i<12;i++)dart(i%2?0xceefff:0x9ed5ff,i,12,'shard',delay+i*.01);break;
 case 'eclipseMail':
  for(let i=0;i<3;i++){const at=event.mode==='cut'?to:from;const shade=node(new T.OctahedronGeometry(.38),0x7954b6,at,'shadow',{i,mode:event.mode});shade.scale.set(.7,1.8,.45);}break;
 case 'rosary':
  for(let i=0;i<16;i++)node(new T.IcosahedronGeometry(.055,0),0xf5d58a,from,'rosary',{i,count:16});ring(0xebd0aa,hero.clone().setY(.1),.7,'expand',.12);break;
 case 'thornsuit':
  if(event.mode==='grow')for(let i=0;i<(event.count||1);i++){const a=i*Math.PI*2/3;const thorn=node(new T.ConeGeometry(.08,.45,4),0xb4df91,hero.clone().add(new T.Vector3(Math.sin(a)*.5,.2,Math.cos(a)*.5)),'thornGrow',{i});thorn.rotation.z=Math.sin(a)*.4;}
  else for(let i=0;i<(event.count||1)*3;i++)dart(i%2?0xff6c83:0xb7e589,i,9,'thorn',delay+i*.018);break;
 case 'orbit':
  for(let i=0;i<7;i++){const comet=node(new T.OctahedronGeometry(i?.1:.26,0),i?0x8fadff:0xe3faff,to,'comet',{i});comet.scale.y=i?2:1.3;}ring(0x9ecaff,from,.7,'ward',.4);ring(0xf4d8a0,from,.85,'ward',.4);break;
 }
 for(const mesh of seq.nodes.slice(begin)){const r=mesh.userData.relic;r.rotation=mesh.rotation.clone();r.scale=mesh.scale.clone();}
}
export function updateRelicNode(mesh,age,reduced){
 const r=mesh.userData.relic;if(!r)return;
 const a=reduced?.25:age,p=reduced?.5:Math.max(0,Math.min(1,a/.42));mesh.rotation.copy(r.rotation);mesh.scale.copy(r.scale);
 switch(r.style){
 case 'expand':mesh.scale.multiplyScalar(.65+(reduced?.4:a)*2.5);break;
 case 'flame':mesh.position.y+=reduced?0:a*1.5;mesh.scale.y*=reduced?1:1+Math.sin(a*5+r.i)*.2;break;
 case 'string':mesh.scale.x*=reduced?1:1+Math.sin(a*8+r.i)*.15;mesh.position.x+=reduced?0:Math.sin(a*5+r.i)*.05;break;
 case 'jaw':mesh.position.y+=r.sign*(reduced?.15:.08+Math.sin(Math.min(1,a/.5)*Math.PI)*.32);break;
 case 'needle':case 'dart':case 'shard':case 'thorn':
  mesh.position.copy(r.from).lerp(r.to,p);mesh.position.x+=Math.sin(r.i*2.4)*.3*(1-p);mesh.position.y+=Math.cos(r.i*2.4)*.35*(1-p);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),r.to.clone().sub(r.from).normalize());break;
 case 'orbit':case 'rosary':{
  const angle=r.i*Math.PI*2/r.count+(reduced?0:a*3),radius=r.radius||.8;mesh.position.x+=Math.sin(angle)*radius;mesh.position.z+=Math.cos(angle)*radius;mesh.position.y+=r.style==='rosary'?Math.cos(angle)*.22:0;break;}
 case 'bolt':mesh.material.opacity=reduced?.65:Math.max(0,1-a);mesh.position.y+=reduced?0:Math.sin(a*25+r.i)*.018;break;
 case 'mirror':mesh.rotation.z+=reduced?0:a*2.3;mesh.position.x+=(r.i?1:-1)*(reduced?0:a*.35);break;
 case 'saw':mesh.rotation.z+=reduced?0:a*7;break;
 case 'tooth':{const angle=r.i*Math.PI/6+(reduced?0:a*7);mesh.position.x+=Math.sin(angle)*r.radius;mesh.position.y+=Math.cos(angle)*r.radius;mesh.rotation.z=-angle;break;}
 case 'light':mesh.position.copy(r.from).lerp(r.to,p);mesh.position.x+=Math.sin(r.i*1.25+(reduced?0:a*9))*.25;mesh.position.y+=Math.cos(r.i*1.25+(reduced?0:a*9))*.25;break;
 case 'raven':mesh.position.copy(r.from).lerp(r.to,p);mesh.position.y+=.3+Math.sin(p*Math.PI)*.45;mesh.position.x+=Math.sin(r.i*2.4)*.32;mesh.position.z+=Math.cos(r.i*2.4)*.18;if(r.part){mesh.position.x+=r.part*.2;mesh.rotation.z=reduced?r.part*.3:r.part*Math.sin(a*18)*.7;}break;
 case 'furnace':mesh.position.x+=Math.sin(r.angle)*a*2;mesh.position.z+=Math.cos(r.angle)*a*2;mesh.position.y+=a*.4;break;
 case 'glass':mesh.rotation.z+=reduced?0:a*.3;break;
 case 'shadow':mesh.position.x+=(r.i-1)*.3;mesh.position.z+=reduced?0:a*.5;mesh.material.opacity*=.55;break;
 case 'thornGrow':mesh.scale.y*=reduced?1:Math.min(1,a*5);break;
 case 'comet':mesh.position.y+=reduced?.2:Math.max(0,2.8-a*7)+r.i*.15;mesh.position.x+=reduced?0:(.3-a*.8);break;
 case 'ward':mesh.rotation.x=Math.PI/2;mesh.rotation.z+=reduced?0:a*2;break;
 }
}
