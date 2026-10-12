// Send event categories only. Never read keys, input contents, or page URLs.
let lastClick = 0, lastKey = 0;
function send(kind) {
  try { chrome.runtime.sendMessage({ type: 'BROWSE', kind })?.catch(() => {}); } catch { /* Extension reloaded. */ }
}
document.addEventListener('click', event => {
  if (!event.isTrusted) return;
  const now = Date.now();
  if (now - lastClick < 80) return;
  lastClick = now;
  send('click');
}, { capture: true, passive: true });
document.addEventListener('keydown', event => {
  if (!event.isTrusted || event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
  const target = event.composedPath()[0];
  // Sensitive input fields never contribute to the typing mechanic.
  if (target instanceof HTMLInputElement && ['password', 'email', 'tel', 'number'].includes(target.type)) return;
  if (target?.closest?.('[data-dreadwake-private]')) return;
  const autocomplete = target?.getAttribute?.('autocomplete') || '';
  if (/(?:password|one-time-code|cc-|email|tel|address|postal-code|bday)/i.test(autocomplete)) return;
  const now = Date.now();
  if (now - lastKey < 45) return;
  lastKey = now;
  send('type');
}, { capture: true, passive: true });
