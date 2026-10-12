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
   shadow.innerHTML=`<style>:host{pointer-events:none}*{box-sizing:border-box;pointer-events:none}canvas{position:absolute;inset:0;width:100%;height:100%}.hud{position:absolute;bottom:28px;right:24px;width:204px;padding:13px 15px;background:linear-gradient(135deg,#1b0d2ef2,#100d19ee);border:1px solid #8e58c9;box-shadow:0 0 25px #7e35c139;opacity:0;transform:translateY(8px);transition:opacity .2s,transform .2s;color:#e8d4ff;font:10px Georgia,serif;letter-spacing:1.4px}.hud.visible{opacity:1;transform:translateY(0)}.top{display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:9px}.top span{font-size:8px;letter-spacing:.7px;white-space:nowrap}.top b{color:#dcbc8b;font:9px Georgia,serif;letter-spacing:0;white-space:nowrap}.track{height:4px;background:#3c224d}.fill{height:100%;background:linear-gradient(90deg,#9545e5,#eeb8ff);box-shadow:0 0 10px #bd64fb;width:0;transition:width .08s}.hint{margin-top:7px;color:#a88cae;font-size:8px;letter-spacing:.6px}.banner{position:absolute;left:50%;top:26%;transform:translate(-50%,-50%);text-align:center;white-space:nowrap;opacity:0;padding:18px 24px;background:linear-gradient(90deg,transparent,#1a0925ed 12%,#1a0925ed 88%,transparent);border-top:1px solid #a767ed88;border-bottom:1px solid #a767ed88;}.banner strong{display:block;color:#f6dcff;font:bold 30px Georgia,serif;letter-spacing:5px;text-shadow:0 0 15px #b565ff,2px 2px #22122b}.banner small{display:block;color:#edca91;font:13px Georgia,serif;letter-spacing:2px;margin-top:12px}.banner.run{animation:announce 1.25s ease-out both}@keyframes announce{0%{opacity:0;transform:translate(-50%,-50%) scale(.8)}18%{opacity:1;transform:translate(-50%,-50%) scale(1.04)}40%,70%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-70%) scale(1)}}@media(max-width:500px){.banner strong{font-size:21px;letter-spacing:2px}.banner small{font-size:10px}.hud{bottom:16px;right:16px;width:200px}}@media(prefers-reduced-motion:reduce){.hud{transform:none;transition:none}.banner.run{animation:none;opacity:1}}</style><canvas></canvas><div class="hud"><div class="top"><span>✦ KEYBOARD HEX</span><b>0 / 20</b></div><div class="track"><div class="fill"></div></div><div class="hint">KEEP THE RHYTHM · CLAIM THE BURST</div></div><div class="banner"><strong>HEX UNLEASHED</strong><small></small></div>`;
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
    clearTimeout(this.hudTimer);this.hud.classList.add('visible');this.shadow.querySelector('.top b').textContent=`${data.combo} / 20`;this.shadow.querySelector('.fill').style.width=`${data.combo*5}%`;
    this.hudTimer=setTimeout(()=>{this.hud.classList.remove('visible');},2500);
    if(!restrained)this.add({type:'spark',x:this.width-42-data.combo*7,y:this.height-61,dx:(Math.random()-.5)*20,dy:-20,life:400,color:'#bb78ff'});
   }
   if(data.burst){
    this.shadow.querySelector('.fill').style.width='100%';this.shadow.querySelector('.top b').textContent='HEX COMPLETE';
    this.banner.querySelector('small').textContent=`+${data.coinsEarned} COINS  ·  +${data.focusEarned} FOCUS`;
    this.banner.classList.remove('run');void this.banner.offsetWidth;this.banner.classList.add('run');clearTimeout(this.bannerTimer);this.bannerTimer=setTimeout(()=>this.banner.classList.remove('run'),1300);
    if(!restrained){
     const cx=this.width*.5,cy=this.height*.3;
     this.add({type:'rune',x:cx,y:cy,life:1100,color:'#c58aff',size:110});this.add({type:'ring',x:cx,y:cy,life:950,color:'#cf96ff',size:Math.min(380,this.width*.65)});
     this.add({type:'ring',x:cx,y:cy,life:700,color:'#ffcf8a',size:180});this.sparks(cx,cy,36,'#ce8bff',220);this.sparks(cx,cy,12,'#efbd70',150);
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
    }else if(p.type==='rune'){
     c.rotate(t*.4);c.strokeStyle=p.color;c.lineWidth=1.4;c.shadowColor=p.color;c.shadowBlur=10;
     for(let j=0;j<2;j++){c.beginPath();for(let i=0;i<7;i++){const a=Math.PI*2*i/6+j*.52;c.lineTo(Math.cos(a)*p.size*(j?.72:1),Math.sin(a)*p.size*(j?.72:1));}c.stroke();}
     c.beginPath();c.moveTo(0,-70);c.lineTo(0,70);c.moveTo(-55,-35);c.lineTo(55,35);c.moveTo(-55,35);c.lineTo(55,-35);c.stroke();
    }c.restore();
   }
   if(this.particles.length)this.frame=requestAnimationFrame(t=>this.draw(t));
  }
  clear(){cancelAnimationFrame(this.frame);this.frame=0;this.particles=[];clearTimeout(this.hudTimer);clearTimeout(this.bannerTimer);this.hud?.classList.remove('visible');this.banner?.classList.remove('run');this.ctx?.clearRect(0,0,this.width,this.height);}
 }
 globalThis.DreadwakeEffects=DreadwakeEffects;
})();
