// Send event categories only. Coordinates remain local; no keys, input contents, or URLs are sent.
(() => {
 let lastClick=0,lastKey=0;
 const fx=new globalThis.DreadwakeEffects();
 async function send(kind,origin){
  try{const response=await chrome.runtime.sendMessage({type:'BROWSE',kind});if(response?.feedback)fx.feedback(response.feedback,origin);}catch{/* Extension reloaded or disconnected: do not show unearned rewards. */}
 }
 document.addEventListener('click',event=>{
  if(!event.isTrusted)return;const now=Date.now();if(now-lastClick<80)return;lastClick=now;
  send('click',{x:event.clientX,y:event.clientY});
 },{capture:true,passive:true});
 document.addEventListener('keydown',event=>{
  if(!event.isTrusted||event.repeat||event.ctrlKey||event.metaKey||event.altKey||event.key.length!==1)return;
  const target=event.composedPath()[0];
  if(target instanceof HTMLInputElement&&['password','email','tel','number'].includes(target.type))return;
  if(target?.closest?.('[data-dreadwake-private]'))return;
  const autocomplete=target?.getAttribute?.('autocomplete')||'';
  if(/(?:password|one-time-code|cc-|email|tel|address|postal-code|bday)/i.test(autocomplete))return;
  const now=Date.now();if(now-lastKey<45)return;lastKey=now;send('type');
 },{capture:true,passive:true});
})();
