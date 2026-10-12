import {nextShopRotation} from './exotics.js';
import { fresh, reduce, migrate } from './engine.js';
let queue = Promise.resolve();
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
chrome.runtime.onMessage.addListener((message, sender, respond) => {
 const page = sender.tab !== undefined;
 if (page && (message?.type !== 'BROWSE' || !['click', 'type'].includes(message.kind))) return;
 if (!page && !['GET','BUY','EQUIP','LEARN','REST','BEGIN','FLEE','TURN','SET_FX','SLOT','SET_RUNE','RESPEC','PRESET','BUY_EXOTIC','TOGGLE_EXOTIC'].includes(message?.type)) return;
 queue = queue.then(async () => {
  const stored = await chrome.storage.local.get('dreadwake');
  const state = stored.dreadwake ? migrate(stored.dreadwake) : fresh();
  const next = message.type === 'GET' ? state : reduce(state,message);
  if (!stored.dreadwake || stored.dreadwake.version !== state.version || stored.dreadwake.exoticShop?.hour !== state.exoticShop.hour || message.type !== 'GET') await chrome.storage.local.set({dreadwake:next});
  if(page){
   respond({feedback:{kind:message.kind,combo:next.combo,burst:next.bursts>state.bursts,coinsEarned:next.coins-state.coins,focusEarned:next.focus-state.focus,fx:next.fx||'full'}});
  }else respond({state:next});
 }).catch(error => { console.error(error); respond({error:'The Hollow lost its connection. Try again.'}); });
 return true;
});

// Align alarms to the next clock-hour boundary. All mutations share the same queue as browsing and combat.
const SHOP_ALARM='dreadwake-hourly-shop';
async function scheduleShop(){await chrome.alarms.create(SHOP_ALARM,{when:nextShopRotation(Date.now()),periodInMinutes:60});}
async function refreshShopSave(){
 const stored=await chrome.storage.local.get('dreadwake');
 if(stored.dreadwake){const next=migrate(stored.dreadwake);if(next.exoticShop.hour!==stored.dreadwake.exoticShop?.hour||next.version!==stored.dreadwake.version)await chrome.storage.local.set({dreadwake:next});}
}
chrome.alarms.onAlarm.addListener(alarm=>{if(alarm.name!==SHOP_ALARM)return;queue=queue.then(refreshShopSave).then(scheduleShop).catch(console.error);return queue;});
chrome.runtime.onStartup.addListener(()=>{queue=queue.then(refreshShopSave).then(scheduleShop).catch(console.error);return queue;});
chrome.runtime.onInstalled.addListener(()=>{queue=queue.then(refreshShopSave).then(scheduleShop).catch(console.error);return queue;});
scheduleShop().catch(console.error);
