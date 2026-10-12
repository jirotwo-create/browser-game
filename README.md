# Dreadwake — The Hollow Pilgrimage

A self-contained Manifest V3 Chromium side-panel RPG. Original realtime low-polygon 3D monsters, textured 3D equipment and talent renders, a bundled jagged display font, turn-based encounters, browsing rewards, persistent equipment, and three branching skill trees. No backend, API keys, build step, or package installation. Three.js 0.180.0 is bundled locally; the extension needs no CDN.

## Install in Chrome, Edge, Brave, or another Chromium browser

1. Open your browser's extension management page (`chrome://extensions` in Chrome, `edge://extensions` in Edge).
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this repository folder (the folder containing `manifest.json`). If using the ZIP, extract it first.
4. Pin **Dreadwake**, then click its toolbar icon to open the side panel.
5. Refresh existing webpages after installing so the reward listener loads. Browse an ordinary HTTP or HTTPS webpage with the panel open or closed; progress accumulates either way.

Requires Chromium's Side Panel API (Chrome 114+; use a current version of your chosen browser). Protected browser pages, the Chrome Web Store, PDFs handled by browser viewers, and some embedded content cannot run extension scripts. Local `file://` pages are intentionally excluded. Incognito access is off unless enabled in browser settings.

## Play

- **Click a webpage:** earn one coin with a spinning coin pickup, sparks, and a floating +1 at the click location. An 80 ms click debounce rejects accidental duplicate input.
- **Keyboard Hex:** type printable keys on webpages, keeping gaps under 2.5 seconds. Every 20 eligible keys grants 5–15 coins and 8 focus (more with the Keyboard Hex talent). A live gauge appears on the webpage. Completing a hex releases an occult sigil, expanding rings, violet/gold sparks, a coin shower, and a banner showing the actual earned rewards. Holding a key and modifier shortcuts do not count. A 45 ms debounce rejects duplicate events.
- **The Hunt:** fight one turn at a time. Strike recovers focus; Guard heals, restores focus, and reduces incoming damage. Soulfire spends focus. Every third enemy turn is a telegraphed heavy attack.
- **Black Forge:** buy and equip weapons and armor. Forge tiers unlock at stages 4, 7, and 10. Owned gear can be re-equipped without charge.
- **Forbidden Arts:** two starting skill points, two more each level. Fully rank a node to unlock the next. Blood enhances melee and life-steal; Bone enhances survival; Void strengthens spells and typing rewards. Each tree has a special capstone. Skill choices are permanent.
- **Bonfire:** outside combat, spend 10 coins to fully restore health and focus. Retreat costs up to 5 coins. Defeat costs up to 8 coins and restores half of health and focus without losing stage progress.
- **Chronicle:** review recent combat and progression events; choose Full ritual, Subtle, or Off for webpage effects. Reduced-motion preferences automatically reduce effects. Visual settings do not change rewards.

### Privacy

All game data stays in `chrome.storage.local`; browser-preview data uses `localStorage`. There is no network telemetry. The webpage listener sends only `click` or `type` event categories. It never sends or saves typed characters, page contents, URLs, or browsing history. It ignores password, email, telephone, number, and sensitive autocomplete fields. Sites may additionally exclude typing rewards within `[data-dreadwake-private]`. Fonts and artwork are bundled, so the extension works offline.

Chromium asks for website access because the content script must observe clicks and keyboard event categories. You can limit site access in the browser's extension settings. Rewards will only work on allowed sites. Removing the extension deletes its local save. Preview and installed-extension saves are separate.

## Develop and test

Use the existing checkout; an additional Git worktree is unnecessary.

```sh
cd /workspace/browser-game
npm run check
npm test
npm start
```

`npm start` serves a standalone preview on port 4173 using Python 3. Open the served site in your development browser. The preview includes a coin-harvest button and a real typing field for exercising the mechanics. Actual rewards from arbitrary webpages require installing the extension. No `npm install` is required.

Reload the extension from its management page after editing its background script or manifest; refresh test webpages after changing `content.js`. The side panel loads `panel.html`; the standalone preview loads `index.html`. Both share the same UI, engine, and assets. The extension's service worker serializes state updates to avoid lost rewards from multiple tabs.

`npm test` runs 14 Node.js tests covering rewards, rhythm expiry, equipment gates, skill prerequisites, combat, heavy attacks, leveling, defeat recovery, capstones, and progression across every forge tier. Live WebGL rendering and rotation, browser UI, and webpage-listener/reward-effect smoke checks were also performed in Chromium during implementation. This cloud machine’s administrator policy prohibits loading unpacked extensions, so end-to-end installation in its actual side panel could not be verified here. The background storage/message flow is tested with mocked Chromium APIs; install locally to check your browser’s side-panel integration.

## Project structure

- `engine.js`: deterministic game rules, equipment, monsters, talents.
- `background.js`: persistent save and message handling.
- `content.js`: privacy-preserving webpage event listener.
- `effects.js`: bounded canvas particles and a Shadow DOM typing gauge. The overlay does not intercept pointer events or change page layout; coordinates are used locally and never sent to the background worker. Rewards display only after a confirmed save.
- `panel.js`, `panel.html`, `index.html`, `style.css`: responsive game interface and browser preview.
- `assets/models.js`: original low-poly 3D meshes for five monsters, ten equipment items, twelve talents, and a ruined cathedral; deterministic 32×32 texture generation.
- `assets/renderer.js`: a reusable 384×256 WebGL viewport, nearest-neighbor scaling, flat-shaded lighting, drag rotation, and an asset baker. Rendering pauses when the hunt is hidden or the document is in the background.
- `assets/renders/`: 27 bundled PNGs rendered from the same 3D meshes. Equipment and talents use these renders; monster renders also provide a fallback if WebGL is unavailable.
- `assets/vendor/`: locally bundled Three.js 0.180.0 and its MIT license.
- `assets/art.js`: interface icon helpers and markup for rendered assets.
- `assets/MetalMania-Regular.ttf`: Metal Mania by Patrick David, licensed under the SIL Open Font License; see `assets/MetalMania-OFL.txt`.

This is an unpacked extension; it has not been submitted to browser extension stores.

## Optional graphics development

The extension is ready to load without rebuilding. To regenerate the 27 bundled renders after changing the meshes, start the development server, install Playwright into a separate tools directory, then run:

```sh
npm install --prefix /tmp/dreadwake-tools --cache /tmp/dreadwake-npm-cache playwright
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/bake-assets.cjs
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/smoke-browser.cjs
```

These scripts use `/usr/bin/chromium` by default; set `DREADWAKE_CHROMIUM` to another Chromium executable if needed. They require a local server on port 4173 (`npm start`). The browser smoke test covers live 3D rotation, asset loading, combat, preferences, typing rewards, confirmed webpage effects, input privacy, reduced motion, and failure handling. It uses a mock extension transport because this environment blocks unpacked extension installation.

## Updating an existing installation

Download and extract the updated GitHub ZIP. Replace your old extension files with the new files, retaining the same unpacked directory. Click **Reload** on Dreadwake's card in the browser's extension management page, close and reopen its side panel, then refresh the webpages you want to reward. Existing local progression is preserved; no save reset is required. The version displayed in extension settings should be **1.1.0**.
