// A local, bounded, pointer-transparent overlay. No webpage text or key values enter this renderer.
(() => {
 class DreadwakeEffects {
  constructor(){this.particles=[];this.frame=0;this.last=0;this.mode='full';this.motion=matchMedia('(prefers-reduced-motion: reduce)');}
  init(){
   if(this.host?.isConnected)return;
   this.host=document.createElement('div');this.host.setAttribute('data-dreadwake-effects','');this.host.setAttribute('aria-hidden','true');
   // Inline !important styles prevent website styles from intercepting clicks or changing layout.
   this.host.style.cssText='all:initial!important;position:fixed!important;inset:0!important;pointer-events:none!important;z-index:2147483647!important;display:block!important;contain:strict!important;';
   const shadow=this.host.attachShadow({mode:'closed'});this.shadow=shadow;
   const art=globalThis.DreadwakeHellscriptAssets;
   if(!this.fontPromise&&typeof FontFace==='function'){const font=new FontFace('DreadwakeMetal',`url("${art.font}")`);this.fontPromise=font.load().then(loaded=>document.fonts.add(loaded)).catch(()=>{});}
   shadow.innerHTML=`<style>:host{pointer-events:none}*{box-sizing:border-box;pointer-events:none}canvas{position:absolute;inset:0;width:100%;height:100%}.hud{position:absolute;bottom:26px;right:22px;width:286px;padding:16px 17px;background:radial-gradient(ellipse at top right,#7b17233b,transparent 70%),linear-gradient(140deg,#220b10f5,#10090df5);border:1px solid #aa3b47;box-shadow:0 0 26px #b7173038,inset 0 0 24px #5d152140;opacity:0;transform:translateY(8px);transition:opacity .2s,transform .2s;color:#f3d1b1;font:10px Georgia,serif;letter-spacing:1px;clip-path:polygon(9px 0,calc(100% - 9px) 0,100% 9px,100% calc(100% - 9px),calc(100% - 9px) 100%,9px 100%,0 calc(100% - 9px),0 9px)}.hud.visible{opacity:1;transform:translateY(0)}.hud:after{content:'';position:absolute;inset:4px;border:1px solid #8e354334;z-index:-1}.top{display:flex;gap:12px;align-items:center;margin-bottom:13px}.hud .hellscript-seal{width:46px;height:46px;color:#e75b54;filter:drop-shadow(0 0 6px #ed442f66);flex-shrink:0}.top>div{flex:1}.top span{display:block;font:bold 20px Georgia,serif;letter-spacing:2px;color:#ffe5c9;text-shadow:0 0 12px #e83b2866}.top em{display:block;font:7px Georgia,serif;letter-spacing:1.8px;color:#bc6c68;font-style:normal;margin-top:5px}.top b{font:14px Georgia,serif;color:#eca98b;white-space:nowrap}.track{height:10px;background:#3a121a;border:1px solid #783039;position:relative}.track:after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0,transparent calc(5% - 2px),#240b13 calc(5% - 2px),#240b13 5%)}.fill{height:100%;background:linear-gradient(90deg,#b32b41,#f05b39,#ffcc79);box-shadow:0 0 14px #ff512477;width:0;transition:width .08s}.hint{margin-top:9px;color:#b88271;font-size:7px;letter-spacing:1px}.hud.charged{border-color:#f7b65d;box-shadow:0 0 35px #f7662944}.banner{position:absolute;left:50%;top:32%;transform:translate(-50%,-50%);text-align:center;opacity:0;width:min(480px,calc(100% - 32px));padding:19px 26px 22px;background:radial-gradient(ellipse,#44101fe8,#15070eeb 70%);border-top:1px solid #f09153;border-bottom:1px solid #d9453a;box-shadow:0 0 55px #dd2b2740;clip-path:polygon(18px 0,calc(100% - 18px) 0,100% 18px,100% calc(100% - 18px),calc(100% - 18px) 100%,18px 100%,0 calc(100% - 18px),0 18px)}.banner .hellscript-seal{height:83px;width:83px;color:#ff9860;filter:drop-shadow(0 0 13px #e44324aa)}.banner em{display:block;font:8px Georgia,serif;letter-spacing:4px;color:#e08869;margin:4px 0 10px;font-style:normal}.banner strong{display:block;color:#ffecd2;font:bold 29px Georgia,serif;letter-spacing:3px;text-shadow:0 0 17px #e84034,2px 2px #220711}.banner small{display:block;color:#ffd087;font:12px Georgia,serif;letter-spacing:1.6px;margin-top:13px}.banner.run{animation:infernal-announce 1.65s ease-out both}@keyframes infernal-announce{0%{opacity:0;transform:translate(-50%,-50%) scale(.7)}18%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}35%,75%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-65%) scale(.95)}}@media(max-width:500px){.banner strong{font-size:22px;letter-spacing:1px}.banner small{font-size:9px;letter-spacing:1px}.banner .hellscript-seal{height:70px;width:70px}.hud{bottom:16px;right:16px;width:258px;padding:14px}.top span{font-size:17px}.top b{font-size:12px}.hud .hellscript-seal{width:39px;height:39px}}@media(prefers-reduced-motion:reduce){.hud{transform:none;transition:none}.fill{transition:none}.banner.run{animation:none;opacity:1}}
@font-face{font-family:DreadwakeMetal;src:url('${art.font}') format('truetype');font-display:swap}
.hud,.banner{clip-path:none;border:5px ridge #998167;border-radius:2px;background-image:linear-gradient(#23040bb8,#0c070bea),url('${art.materials}');background-size:auto,200% 200%;background-position:center,100% 0;box-shadow:inset 0 0 22px #000b,0 7px 22px #0009,0 0 19px #a92b2222;color:#ffe2b9;text-shadow:0 1px 2px #000}
.hud{width:min(330px,calc(100% - 24px));padding:16px;letter-spacing:.5px}.hud:after{inset:4px;border:1px solid #d9ac6a44;z-index:auto;pointer-events:none}.top{gap:10px}.top>div{min-width:0}.top span{font:29px DreadwakeMetal,Georgia,serif;letter-spacing:1px;color:#ffe6b3;animation:hellscript-magma 5.8s ease-in-out infinite}.top em{font:9px Georgia,serif;letter-spacing:.7px;color:#e3c5a2;line-height:1.5}.top b{font:14px Georgia,serif;color:#ffe0ae;background:#10090c;border:2px inset #8a7051;padding:7px 6px}.hellscript-seal{display:block;background-size:200% 200%;background-position:100% 100%;border:2px ridge #a48a65;box-shadow:0 2px 7px #0009,inset 0 0 7px #0008;flex-shrink:0}.hud .hellscript-seal{width:55px;height:61px;filter:none}.track{height:17px;border:3px inset #8e7356;background:#0b070a;box-shadow:0 1px #efc48a22}.track:after{background:repeating-linear-gradient(90deg,transparent 0,transparent calc(5% - 2px),#170810 calc(5% - 2px),#170810 5%)}.fill{background:linear-gradient(#ffe4a4,#ed8e48 20%,#b33428 65%,#f7ad59);box-shadow:0 0 13px #ef4d2788,inset 0 1px #fff3}.hint{font-size:10px;color:#e2bd99;letter-spacing:.5px;line-height:1.5}.hud.charged{border-color:#e3b676;box-shadow:inset 0 0 25px #b82e2433,0 0 24px #db4c3555}
.banner{width:min(500px,calc(100% - 24px));padding:20px 18px 23px;border-width:7px;background-image:linear-gradient(#09090c88,#09090ce8),url('${art.iron}');background-size:auto,300px 300px;background-position:center,0 0}.banner .hellscript-seal{height:112px;width:112px;filter:none;margin:0 auto 13px}.banner em{font-size:10px;letter-spacing:2.5px;color:#efbd91;line-height:1.5}.banner strong{font:38px DreadwakeMetal,Georgia,serif;letter-spacing:1.5px;color:#ffe6b3;animation:hellscript-magma 5.8s ease-in-out infinite}.banner small{font:bold 15px Georgia,serif;letter-spacing:1px;color:#ffe2a9;margin-top:15px;padding:12px 6px;border:3px inset #8c7254;background:#16080e;line-height:1.5}.banner.run{animation:infernal-announce 1.65s ease-out both}
.top{display:grid;grid-template-columns:55px minmax(0,1fr);gap:4px 10px}.hud .hellscript-seal{grid-row:span 2;align-self:center}.top b{grid-column:2;justify-self:start;padding:3px 7px}.top span{font-size:29px}.top em{font-size:9px}@media(max-width:500px){.top{grid-template-columns:45px minmax(0,1fr)}.top span{font-size:28px}.top b{font-size:12px;padding:3px 6px}}
@keyframes hellscript-magma{0%,100%{text-shadow:0 2px 2px #000,0 0 3px #ed813b88,0 0 9px #db441b55}50%{text-shadow:0 2px 2px #000,0 0 4px #ffb55abb,0 0 13px #ee542b88,0 0 21px #a4211833}}
@media(max-width:500px){.hud{bottom:16px;right:12px;padding:12px}.top span{font-size:26px}.top em{font-size:8px}.top b{font-size:12px;padding:6px 4px}.hud .hellscript-seal{width:45px;height:51px}.hint{font-size:9px}.banner{padding:16px 12px 18px}.banner strong{font-size:30px;letter-spacing:.7px}.banner small{font-size:12px;letter-spacing:.5px}.banner em{font-size:9px;letter-spacing:1.5px}.banner .hellscript-seal{width:92px;height:92px}}
@media(prefers-reduced-motion:reduce){.top span,.banner strong{animation:none;text-shadow:0 2px 2px #000,0 0 8px #db441b66}.hud{transition:none;transform:none}.fill{transition:none}.banner.run{animation:none;opacity:1}}
</style><canvas></canvas><div class="hud"><div class="top">${globalThis.DreadwakeHellscript}<div><span>HELLSCRIPT</span><em>FEED THE INFERNAL SEAL</em></div><b>0 / 100</b></div><div class="track"><div class="fill"></div></div><div class="hint">100 KEYSTROKES · ONE INFERNAL ERUPTION</div></div><div class="banner">${globalThis.DreadwakeHellscript}<em>THE SEAL IS BROKEN</em><strong>HELLSCRIPT IGNITED</strong><small></small></div>`;
   this.canvas=shadow.querySelector('canvas');this.ctx=this.canvas.getContext('2d');this.hud=shadow.querySelector('.hud');this.banner=shadow.querySelector('.banner');
   document.documentElement.append(this.host);this.resize();
   this.resizeHandler=()=>this.resize();addEventListener('resize',this.resizeHandler,{passive:true});
  }
  resize(){const dpr=Math.min(devicePixelRatio||1,1.5);this.width=innerWidth;this.height=innerHeight;this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);}
  add(p){if(this.particles.length<120)this.particles.push({...p,start:performance.now()});}
  feedback(data,origin={}){
   if(!data)return;this.mode=data.fx||'full';
   if(this.mode==='off'){this.clear();return;}
   this.init();
   const x=Math.max(24,Math.min(this.width-24,origin.x??this.width*.5));const y=Math.max(30,Math.min(this.height-30,origin.y??this.height*.5));
   const restrained=this.motion.matches||this.mode==='subtle';
   if(data.kind==='click'&&data.coinsEarned){
    this.add({type:'coin',x,y,life:restrained?500:800,reduced:restrained,text:`+${data.coinsEarned}`});
    if(!restrained){this.add({type:'ring',x,y,life:450,color:'#ecca8b',size:42});this.sparks(x,y,6,'#e8bc66',45);}
   }
   if(data.kind==='type'){
    clearTimeout(this.hudTimer);this.hud.classList.add('visible');this.hud.classList.remove('charged');this.shadow.querySelector('.top b').textContent=`${data.combo} / 100`;this.shadow.querySelector('.fill').style.width=`${data.combo}%`;
    this.hudTimer=setTimeout(()=>{this.hud.classList.remove('visible');},2500);
    if(!restrained)this.add({type:'spark',x:this.width-42-data.combo*1.4,y:this.height-61,dx:(Math.random()-.5)*20,dy:-20,life:400,color:'#f96b43'});
   }
   if(data.burst){
    this.shadow.querySelector('.fill').style.width='100%';this.shadow.querySelector('.top b').textContent='100 / 100';this.hud.classList.add('charged');
    this.banner.querySelector('small').textContent=`+${data.coinsEarned} COINS  ·  +${data.focusEarned} FOCUS`;
    this.banner.classList.remove('run');void this.banner.offsetWidth;this.banner.classList.add('run');clearTimeout(this.bannerTimer);this.bannerTimer=setTimeout(()=>this.banner.classList.remove('run'),1750);
    if(!restrained){
     const cx=this.width*.5,cy=this.height*.32;
     this.add({type:'infernalSeal',x:cx,y:cy,dy:0,life:1600,color:'#f15e45',size:Math.min(180,this.width*.34)});this.add({type:'ring',x:cx,y:cy,life:1300,dy:0,color:'#f45235',size:Math.min(380,this.width*.65)});
     this.add({type:'ring',x:cx,y:cy,life:1000,dy:0,color:'#ffbe6d',size:180});this.sparks(cx,cy,34,'#ef443b',240);this.sparks(cx,cy,16,'#ffd080',180);
     for(let i=0;i<18;i++)this.add({type:'flame',x:cx+(Math.random()-.5)*220,y:cy+110,dy:-130-Math.random()*150,dx:(Math.random()-.5)*50,life:1200+Math.random()*450,color:i%2?'#ffae54':'#f34a36'});
     for(let i=0;i<6;i++)this.add({type:'coin',x:cx+(Math.random()-.5)*100,y:cy+40,life:1000+i*50,dx:(Math.random()-.5)*120,dy:-80-Math.random()*80,text:'',reduced:false});
    }
   }
   if(!this.frame)this.frame=requestAnimationFrame(t=>this.draw(t));
  }
  sparks(x,y,n,color,speed){for(let i=0;i<n;i++){const a=Math.PI*2*i/n;this.add({type:'spark',x,y,dx:Math.cos(a)*speed*(.5+Math.random()),dy:Math.sin(a)*speed*(.5+Math.random()),life:650+Math.random()*350,color});}}
  draw(time){
   this.frame=0;const c=this.ctx;if(!c)return;c.clearRect(0,0,this.width,this.height);
   this.particles=this.particles.filter(p=>time-p.start<p.life);
   for(const p of this.particles){
    const t=Math.max(0,(time-p.start)/p.life),ease=1-(1-t)**3;c.save();c.globalAlpha=Math.min(1,(1-t)*2);c.translate(p.x+(p.dx||0)*ease,p.y+(p.dy??(p.reduced?-14:-60))*ease);
    if(p.type==='coin'){
     const squash=p.reduced?1:Math.max(.16,Math.abs(Math.cos(t*Math.PI*3)));c.save();c.scale(squash,1);
     const grad=c.createLinearGradient(-9,-10,9,10);grad.addColorStop(0,'#fff0bb');grad.addColorStop(.4,'#e7b04c');grad.addColorStop(1,'#6b3918');c.fillStyle=grad;c.strokeStyle='#ffdfa0';c.lineWidth=1.5;
     c.beginPath();for(let i=0;i<8;i++){const a=i/8*Math.PI*2;c.lineTo(Math.cos(a)*9,Math.sin(a)*11);}c.closePath();c.fill();c.stroke();c.strokeStyle='#6c411d';c.beginPath();c.moveTo(0,-6);c.lineTo(4,0);c.lineTo(0,6);c.lineTo(-4,0);c.closePath();c.stroke();c.restore();
     c.fillStyle='#fff0bd';c.font='bold 16px Georgia';c.textAlign='center';c.shadowColor='#38220e';c.shadowBlur=4;c.fillText(p.text,0,-17);
    }else if(p.type==='spark'){
     c.fillStyle=p.color;c.shadowColor=p.color;c.shadowBlur=8;c.rotate(t*3);c.fillRect(-2,-2,4,4);
    }else if(p.type==='ring'){
     c.strokeStyle=p.color;c.lineWidth=(1-t)*3;c.shadowColor=p.color;c.shadowBlur=14;c.beginPath();c.arc(0,0,Math.max(1,p.size*ease),0,Math.PI*2);c.stroke();
    }else if(p.type==='infernalSeal'){
     c.rotate(t*.18);c.strokeStyle=p.color;c.lineWidth=1.8;c.shadowColor=p.color;c.shadowBlur=16;
     c.beginPath();c.arc(0,0,p.size*(.8+ease*.2),0,Math.PI*2);c.stroke();c.beginPath();
     for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI*4/5;c.lineTo(Math.cos(a)*p.size*.86,Math.sin(a)*p.size*.86);}c.stroke();
     for(let i=0;i<12;i++){c.save();c.rotate(i*Math.PI/6);c.beginPath();c.moveTo(0,-p.size*.95);c.lineTo(-5,-p.size*1.09);c.lineTo(5,-p.size*1.03);c.lineTo(0,-p.size*.95);c.stroke();c.restore();}
    }else if(p.type==='flame'){
     c.fillStyle=p.color;c.shadowColor=p.color;c.shadowBlur=15;c.rotate(Math.sin(t*5)*.2);c.beginPath();c.moveTo(0,-18*(1-t));c.quadraticCurveTo(12,-1,0,8);c.quadraticCurveTo(-10,-1,0,-18*(1-t));c.fill();
    }c.restore();
   }
   if(this.particles.length)this.frame=requestAnimationFrame(t=>this.draw(t));
  }
  clear(){cancelAnimationFrame(this.frame);this.frame=0;this.particles=[];clearTimeout(this.hudTimer);clearTimeout(this.bannerTimer);this.hud?.classList.remove('visible');this.banner?.classList.remove('run');this.ctx?.clearRect(0,0,this.width,this.height);}
 }
 globalThis.DreadwakeEffects=DreadwakeEffects;
})();
