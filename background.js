import { fresh, reduce } from './engine.js';
let queue = Promise.resolve();
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
chrome.runtime.onMessage.addListener((message, sender, respond) => {
 const page = sender.tab !== undefined;
 if (page && (message?.type !== 'BROWSE' || !['click', 'type'].includes(message.kind))) return;
 if (!page && !['GET','BUY','EQUIP','LEARN','REST','BEGIN','FLEE','TURN'].includes(message?.type)) return;
 queue = queue.then(async () => {
  const stored = await chrome.storage.local.get('dreadwake');
  const state = stored.dreadwake || fresh();
  const next = message.type === 'GET' ? state : reduce(state,message);
  if (!stored.dreadwake || message.type !== 'GET') await chrome.storage.local.set({dreadwake:next});
  respond({state:next});
 }).catch(error => { console.error(error); respond({error:'The Hollow lost its connection. Try again.'}); });
 return true;
});
