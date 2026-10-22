const { _electron } = require(process.env.PLAYWRIGHT_MODULE || '/workspace/dreadwake-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const args = [process.env.NULL_DISTRICT_APP || path.resolve(__dirname, '..')];
  if (process.platform === 'linux') args.push('--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader');
  const app = await _electron.launch({
    executablePath: process.env.ELECTRON_EXECUTABLE || require('electron'),
    args, timeout: 30000,
    env: { ...process.env, XDG_CACHE_HOME: '/tmp/null-desktop-cache', XDG_CONFIG_HOME: '/tmp/null-desktop-config' },
  });
  try {
    const page = await app.firstWindow();
    const errors = [], remote = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/^https?:/.test(request.url())) remote.push(request.url()); });
    await page.waitForFunction(() => !!window.nullDistrict);
    assert.equal(new URL(page.url()).protocol, 'null-district:');
    const graphics = await page.evaluate(() => nullDistrict.graphics());
    assert.equal(graphics.interpolation, 'screen-space affine');
    assert.equal(graphics.colorDepth, 'RGB555');
    assert.equal(graphics.guard.species, 'human');
    assert.ok(graphics.sword.triangles > 300);
    assert.deepEqual(await page.evaluate(() => nullDistrict.state.inventory), ['carbine','sword']);
    assert.equal(graphics.resolution[1], 240);assert.ok(graphics.gearResolution[1]>graphics.resolution[1]);assert.equal(graphics.gearPass,'native / perspective / unquantized');
    assert.ok(graphics.guard.triangles > 100 && graphics.guard.triangles < 14000);
    await page.keyboard.press('F6');
    assert.equal(await page.evaluate(() => nullDistrict.graphics().affine), false);
    await page.keyboard.press('F6');
    assert.equal(await page.evaluate(() => nullDistrict.graphics().affine), true);

    assert.equal(await page.evaluate(async () => { const r = await fetch('null-district://game/'); return r.ok && (await r.text()).includes('NULL DISTRICT'); }), true, 'Root navigation must load the game');
    assert.equal(await page.evaluate(() => typeof require), 'undefined', 'Renderer must not expose Node.js');
    await page.click('#start');
    await page.waitForFunction(() => !!document.pointerLockElement);
    await page.keyboard.press('Digit2');
    assert.equal(await page.evaluate(() => nullDistrict.state.weapon), 'sword');
    await page.mouse.click(650, 400);
    await page.waitForFunction(() => nullDistrict.state.meleeStrikes > 0);
    assert.equal(await page.evaluate(() => nullDistrict.state.ammo), 24);
    await page.keyboard.press('Digit1');
    const initial = await page.evaluate(() => nullDistrict.state.position.z);
    await page.keyboard.down('KeyW');
    await page.waitForFunction(z => nullDistrict.state.position.z < z, initial, { timeout: 15000 });
    await page.keyboard.up('KeyW');
    assert.ok(await page.evaluate(z => nullDistrict.state.position.z < z, initial));
    await page.mouse.click(650, 400);
    await page.waitForFunction(() => nullDistrict.state.ammo < 24);
    await page.keyboard.press('KeyR');
    await page.waitForFunction(() => nullDistrict.state.ammo === 24);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => nullDistrict.state.mode === 'paused');
    await page.click('#restart');
    await page.waitForFunction(() => nullDistrict.state.mode === 'playing');
    assert.equal(await page.evaluate(() => nullDistrict.state.relays), 0);
    await page.keyboard.press('Escape');
    await page.click('#to-menu');
    await page.click('[data-level="1"]');
    await page.click('#start');
    const chapter2 = await page.evaluate(() => nullDistrict.state);
    assert.equal(chapter2.level, 2);
    assert.equal(chapter2.enemies, 12);
    assert.equal(chapter2.relays, 0);
    assert.deepEqual(chapter2.inventory, ['carbine', 'sword']);
    assert.ok(chapter2.targets.some(e => e.type === 'gargoyle'));
    assert.ok(chapter2.targets.some(e => e.type === 'revenant'));
    assert.equal(await page.evaluate(() => nullDistrict.graphics().roster.length), 10);
    assert.ok(await page.evaluate(() => nullDistrict.graphics().neonInstallations > 20));
    await page.keyboard.press('Digit2');
    await page.mouse.click(650, 400);
    await page.waitForFunction(() => nullDistrict.state.meleeStrikes > 0);
    await page.keyboard.press('Escape');
    await page.click('#restart');
    assert.equal(await page.evaluate(() => nullDistrict.state.level), 2);
    assert.equal(await page.evaluate(() => nullDistrict.state.enemies), 12);
    // CDP keyboard events bypass Electron's native before-input-event hook.
    await app.evaluate(({ BrowserWindow }) => {
      const contents = BrowserWindow.getAllWindows()[0].webContents;
      contents.sendInputEvent({ type: 'keyDown', keyCode: 'F11' });
      contents.sendInputEvent({ type: 'keyUp', keyCode: 'F11' });
    });
    for (let tries = 0; tries < 20; tries++) {
      if (await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isFullScreen())) break;
      await page.waitForTimeout(250);
    }
    assert.equal(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isFullScreen()), true);
    assert.deepEqual(errors, []);
    assert.deepEqual(remote, [], 'Desktop play must not depend on a remote server');
    const security = await app.evaluate(({ BrowserWindow }) => {
      const prefs = BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences();
      return { sandbox: prefs.sandbox, nodeIntegration: prefs.nodeIntegration, contextIsolation: prefs.contextIsolation };
    });
    assert.deepEqual(security, { sandbox: true, nodeIntegration: false, contextIsolation: true });
    await page.screenshot({path:'/tmp/null-desktop-psx.png'});
    console.log('PASS: affine toggle/retro graphics, standalone desktop launch, local modules/WebGL, pointer capture, movement, shooting, reload, pause/restart, fullscreen, isolated renderer, no remote requests.');
  } finally { await app.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
