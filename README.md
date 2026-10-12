# Dreadwake — The Hollow Pilgrimage

A self-contained Manifest V3 Chromium side-panel RPG. Original realtime low-polygon 3D hero and monsters, textured 3D equipment and talent renders, a bundled jagged display font, turn-based encounters, browsing rewards, persistent equipment, and three branching skill trees with 30 talents, eleven active skills, and rune customization. No backend, API keys, build step, or package installation. Three.js 0.180.0 is bundled locally; the extension needs no CDN.

## Install in Chrome, Edge, Brave, or another Chromium browser

1. Open your browser's extension management page (`chrome://extensions` in Chrome, `edge://extensions` in Edge).
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this repository folder (the folder containing `manifest.json`). If using the ZIP, extract it first.
4. Pin **Dreadwake**, then click its toolbar icon to open the side panel.
5. Refresh existing webpages after installing so the reward listener loads. Browse an ordinary HTTP or HTTPS webpage with the panel open or closed; progress accumulates either way.

Requires Chromium's Side Panel API (Chrome 114+; use a current version of your chosen browser). Protected browser pages, the Chrome Web Store, PDFs handled by browser viewers, and some embedded content cannot run extension scripts. Local `file://` pages are intentionally excluded. Incognito access is off unless enabled in browser settings.

## Play

- **Click a webpage:** earn one coin with a spinning coin pickup, sparks, and a floating +1 at the click location. An 80 ms click debounce rejects accidental duplicate input.
- **Hellscript:** type printable keys on webpages, keeping gaps under 2.5 seconds. Every 100 eligible keys grants 35 coins and 8 focus (more with Hellscript Covenant). A live gauge appears on the webpage. Igniting Hellscript breaks a horned infernal seal: scarlet and gold rings erupt, flames and embers rise, coins scatter, and a demonic reward banner shows the actual spoils. Both the panel and webpage gauge have ember-lit segmented progress and a demonic seal. Holding a key and modifier shortcuts do not count. A 45 ms debounce rejects duplicate events.
- **The Hunt:** fight one turn at a time. Strike recovers focus; Guard heals, restores focus, and reduces incoming damage. Soulfire spends focus. Every third enemy turn is a telegraphed heavy attack.
- **Black Forge:** buy standard weapons and armor into your inventory. Forge tiers unlock at stages 4, 7, and 10. Purchases do not replace equipped gear.
- **Hourly exotic offering:** exactly one exotic is on offer at a time. It changes at the top of each clock hour, with a visible countdown. Victories, purchases, browsing, and forge-tier unlocks do not reset the timer or replace the current offer. Bought offers stay claimed until the next hour. Manual rerolls have been removed.
- **Inventory / The Reliquary:** all owned standard gear and exotics live in a dedicated tab. Search by item name or perk, filter weapons/armor/exotics/equipped items, and sort by rarity, name, or equipped status. Compare standard item stats before equipping. Equip, swap, or unequip exotics outside battle; your other possessions remain stored. Purchases are stored first and must be equipped from the inventory.
- **Exotic collection:** twenty original one-of-a-kind weapons, armor pieces, and oddities. Equip any number at once, including multiple weapons, crowns, and accessories; every stat bonus and perk stacks. Exotic items supplement your standard weapon/armor and never consume skill slots. Unequip and re-equip freely outside combat. Nothing expires or disappears from your collection.
- **Forbidden Arts:** 30 talents across Blood, Bone, and Void. Spend two starting points, then earn two more each level. Learning one rank of a parent unlocks its branches; capstones need eight points invested in their tree. Passives always work. Choose three learned active skills for your combat loadout; Strike, Guard, and Soulfire remain available too.
- **Runes:** each of the eleven active skills has two alternative rune effects. Most unlock at rank 2; capstone runes need 12 invested tree points. Use one rune per ability or keep it unmodified. Switch freely outside combat.
- **Builds:** mix talents across trees, customize slots and runes, or apply a suggested Bleed & Feed, Bone Fortress, or Hexweaver starter build. Reset talents for free outside combat to refund every spent skill point. Your level, coins, equipment, and stage remain. Builds and equipment cannot change mid-battle.
- **Combat effects:** distinct ability animations, floating damage/heal/absorption numbers, 3D status auras, and readable status badges. The combat viewport stays visible while you use the action bar. Bleed and burn tick on your next accepted turns; curses weaken enemies and amplify direct damage; barriers absorb damage; regeneration heals next turns; consecutive damaging spells build resonance. Cooldowns count other accepted combat actions, never webpage clicks. Every spell displays its focus cost, rune and remaining cooldown.
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

`npm test` runs 68 Node.js tests covering rewards, rhythm expiry, equipment gates, skill prerequisites, combat, heavy attacks, leveling, defeat recovery, capstones, all 22 rune variants, loadout validation, bleed/burn/curse/regen timing, cooldowns, barrier synergies, respec refunds, old-save migration, and progression across every forge tier. Live WebGL rendering and rotation, browser UI, and webpage-listener/reward-effect smoke checks were also performed in Chromium during implementation. This cloud machine’s administrator policy prohibits loading unpacked extensions, so end-to-end installation in its actual side panel could not be verified here. The background storage/message flow is tested with mocked Chromium APIs; install locally to check your browser’s side-panel integration.

## Project structure

- `engine.js`: deterministic game rules, equipment, monsters, status resolution, save migration, and build changes.
- `exotics.js`: the twenty-item exotic catalog, deterministic persistent hourly offerings, perk helpers, additive stats, and safe effect merging.
- `assets/exotic-models.js`: twenty original low-poly 3D exotic models; no new external assets are required.
- `skills.js`: 30 talents, 22 rune choices, starter builds, requirements, cost/readiness checks, and numerical upgrade previews.
- `combat-effects.js`: distinct combat animations, combat feedback, and readable status badges.
- `background.js`: persistent save and message handling.
- `content.js`: privacy-preserving webpage event listener.
- `effects.js`: bounded canvas particles and a Shadow DOM typing gauge. The overlay does not intercept pointer events or change page layout; coordinates are used locally and never sent to the background worker. Rewards display only after a confirmed save.
- `panel.js`, `panel.html`, `index.html`, `style.css`: responsive game interface and browser preview.
- `assets/models.js`: original low-poly 3D meshes for five monsters, ten equipment items, twelve talents, and a ruined cathedral; deterministic 32×32 texture generation.
- `assets/hero.js`: original articulated obsidian-armored hero with a crimson cape, ember visor and executioner blade.
- `assets/battle-animation.js`: mesh poses and disposable 3D spell effects driven by accepted combat events.
- `assets/renderer.js`: a reusable 384×256 WebGL viewport, nearest-neighbor scaling, flat-shaded lighting, drag rotation, and an asset baker. Rendering pauses when the hunt is hidden or the document is in the background.
- `assets/renders/`: 47 bundled PNGs rendered from the original 3D meshes. Equipment uses these renders; monster renders also provide a fallback if WebGL is unavailable. Earlier model-rendered talent icons remain as development assets.
- `assets/skill-atlas.png`: 30 original painted fantasy ability icons, one per talent, used as a CSS sprite atlas. These are original generated assets, not copied game icons.
- `assets/vendor/`: locally bundled Three.js 0.180.0 and its MIT license.
- `assets/art.js`: interface icon helpers and markup for rendered assets.
- `assets/MetalMania-Regular.ttf`: Metal Mania by Patrick David, licensed under the SIL Open Font License; see `assets/MetalMania-OFL.txt`.

This is an unpacked extension; it has not been submitted to browser extension stores.

## Optional graphics development

The extension is ready to load without rebuilding. To regenerate the 47 bundled renders after changing the meshes, start the development server, install Playwright into a separate tools directory, then run:

```sh
npm install --prefix /tmp/dreadwake-tools --cache /tmp/dreadwake-npm-cache playwright
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/bake-assets.cjs
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/smoke-browser.cjs
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/smoke-skills.cjs
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/smoke-exotics.cjs
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/smoke-inventory.cjs
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/smoke-combat-3d.cjs
```

These scripts use `/usr/bin/chromium` by default; set `DREADWAKE_CHROMIUM` to another Chromium executable if needed. They require a local server on port 4173 (`npm start`). The browser smoke test covers live 3D rotation, asset loading, combat, preferences, typing rewards, confirmed webpage effects, input privacy, reduced motion, and failure handling. It uses a mock extension transport because this environment blocks unpacked extension installation.

## Updating an existing installation

Download and extract the updated GitHub ZIP. Replace your old extension files with the new files, retaining the same unpacked directory. Click **Reload** on Dreadwake's card in the browser's extension management page, close and reopen its side panel, then refresh the webpages you want to reward. Existing local progression is preserved; no save reset is required. The version displayed in extension settings should be **1.6.1**.

## Build examples

| Build | Active slots | What to do |
| --- | --- | --- |
| Bleed & Feed | Rend, Sanguine Feast, Blood Sovereign | Apply bleed, double Feast healing, finish with Blood Rite. Choose Lingering Wound for sustain or Rupture for burst damage. |
| Bone Fortress | Bone Bastion, Gravebloom, Grave Reprisal | Build a barrier, regenerate, then turn your remaining barrier into damage. Cathedral Aegis and Cataclysm combine for a harder hit; Gravekeeper keeps part of your protection. |
| Hexweaver | Withering Hex, Soul Nova, Total Eclipse | Curse, cast Soulfire to apply Ghostfire, then detonate it with Nova. Dread Silence suppresses heavy strikes; Frailty makes your attacks hit harder. |

Suggested builds spend only available points, respecting all prerequisites. They also refund your current build first. Select any talent to see its requirements, rank, current and next numerical effects, focus/health cost, cooldown and rune options. A mix of talents from all three trees is allowed.

Existing saves migrate automatically. Previously learned talents and progression stay intact; existing Blood Sovereign and Total Eclipse abilities are placed in your loadout when migrating an old save. Skill choices are now reversible.

## Impossible exotics

All twenty items have original 3D inventory art, readable named perks, combat proc notices, and persistent ownership. There is no exotic equip limit or restriction by item kind. The first hourly offering opens immediately; more exotics enter the eligible pool at forge tiers 2 and 3. Eligibility is evaluated only when a new hourly offering is selected. The collection is currently purchased from the hourly shop rather than dropped by monsters.

| Item | What makes it impossible |
| --- | --- |
| The Cathedral Has Teeth | Every third Strike makes the living blade bite and cause bleeding. |
| Widow’s Probate | The dead pay 35% more coins; nearly dead enemies take more direct damage. |
| An Argument with Yesterday | Your last turn's primary wound repeats at 30% damage. Echoes never copy echoes. |
| A Perfectly Normal Teapot | Guard brews suspicious moon tea for your next damaging action. |
| Small Apology to the Sky | Every third damaging action drops a meteor and starts a burn. |
| The Saint’s Bad Stitching | Healing becomes stored surgical thread; Strike cashes it in as damage. |
| Moth-Eaten Eternity | Moths ignite your spells and heal you when your focus runs low. |
| The Saint Who Froze Hell | Guard curses enemies and suppresses heavy attacks without weakening stronger curses. |
| Parliament of Rats | A growing rat legislature attacks after your actions. Guard recruits new members. |
| God’s Unpaid Invoice | Bleed, burn, and curses become six-coin tax deductions on victory. |
| The Ninth Toll | Every ninth accepted action deals doom equal to 30% of enemy maximum health. |
| Yesterday’s Funeral | Your first active skill has no cooldown; Guard rewinds other cooldowns faster. |
| Boots That Never Arrive | Every fourth enemy strike misses completely. |
| The Laughing Pallbearer | Start shielded; a broken barrier delivers a very damaging coffin joke. |
| The Sun’s Last Tenant | Spells feed on curses for extra damage and life-steal. |
| Miser’s Last Breath | Bribe death once per battle for 20 coins; Last Rites gets first refusal. |
| Choir of Loose Teeth | Every third damaging spell launches a singing volley of teeth. |
| Understudy of the End | Every third Guard replays half of your last damaging spell for free. |
| The Damned Typewriter | Typing bursts stock up to five ink charges; spells spend them for damage and burning. |
| Hands of Infinite Receipts | Twenty-five equipped webpage clicks print twelve bonus coins. |

Exotic procs are deliberately bounded: they never execute an additional combat turn or recursively activate damage-trigger counters. Purchased stat bonuses add together. Stronger existing wounds and curses are preserved when an exotic applies a weaker version. Every accepted combat action can activate several equipped perks, and the combat HUD names them. Counters reset each battle, except typewriter ink and receipt progress, which persist; unequipping pauses those browsing perks.

Use `node scripts/bake-assets.cjs --exotics` (with the same optional Playwright configuration above) to regenerate only exotic renders.

## Hourly shop and inventory patch

The extension now requests Chromium's `alarms` permission to schedule the next clock-hour boundary and maintain hourly updates while the panel is closed. State updates from alarms, startup, browsing, and combat use one serialized queue. If the browser is asleep or closed, the next startup or game read catches up to the current hour rather than presenting expired stock. The standalone preview checks the boundary once per second and catches up on focus/reload. Clock-aligned rotations never advance combat, consume coins, or change a loadout.

The hourly offering selects an eligible unowned exotic and stays fixed for that hour. With more than one eligible choice, consecutive hours do not offer the same item. A claimed item remains visible until the next hour; if all exotics are owned, the shop shows collection completion. Old four-offer saves migrate to the hourly format while preserving every owned item and current equipment.

Inventory has no capacity limit. Each named item is unique; buying an already-owned item never charges you twice. The standard loadout still has one weapon and one armor piece, while all purchased exotics can be equipped at the same time. Inventory changes are locked during battle, but you can still browse your possessions.

## Hellscript visual patch

The browsing typing ritual is now **Hellscript**. Its linked talent is **Hellscript Covenant**. Names, preview controls, event messages, and progress labels use the new theme. Existing saves, skill IDs, typing privacy, and exotic ink charges are preserved.

`hellscript-art.js` provides an original horned demonic seal shared by the panel and isolated webpage overlay. The full eruption uses a bounded particle pool with flaming embers and infernal rings. Subtle and Off settings still apply; reduced motion skips animated particles and displays a static reward notice. No remote fonts, assets, new website access, or telemetry are needed.

Hellscript now requires 100 rhythmic keys per eruption and grants a fixed 35 coins. Focus rewards are unchanged.

## Hero and 3D combat patch

The Unburnt now stands beside every monster in the cathedral. The camera retains its original perspective, with a slightly wider view for both combatants. The hero has a fixed cosmetic design: faceted black plate, silver spikes, an ember visor, a torn crimson cape and a jagged blade. Equipment stats continue to come from your loadout.

Accepted turns animate the hero first, then the monster when the rules actually resolve a retaliation. Weapon arts lunge and slash; Soulfire travels between combatants; Feast and Drain siphon energy; Bone wards surround the hero; Mend raises healing rings; Hex surrounds the monster with a curse sigil; Nova erupts outward; Eclipse summons a dark orb. Monsters swing articulated mesh arms, recoil, dive or cast, and collapse when defeated. Damage, healing and absorption feedback follows the corresponding animation phase. Existing rune mechanics and exotic proc announcements remain active.

Animations are visual and never resolve extra turns or grant rewards. A newer turn replaces unfinished effects. Temporary geometry and materials are disposed after the sequence. Navigation and hidden documents pause rendering. Reduced motion keeps characters still and displays static spell indicators. All five bundled fallback images now show the hero alongside the monster; WebGL fallback remains static. Regenerate these with `node scripts/bake-assets.cjs --monsters`.

`smoke-combat-3d.cjs` checks all fourteen base/active moves against five monster rigs, visible effects, attack poses, retaliation, cleanup, unchanged combat events, reduced motion and real panel turns at a narrow viewport.

## Weapon grip and swing correction

Swords attach at their handle centers to actual hand joints. The hero, knight and king now have articulated shoulders, elbows and wrists; the king and knight carry their shields on their forearms. The revenant grips its scythe shaft, and the Bellkeeper grips a single connected staff. All combatants face one another. Weapon attacks now wind up, extend through the target and recover instead of rotating a weapon offset from the hand. Counterattacks reuse the same articulated swing. Reduced motion preserves the resting grip, and defeated monsters do not play a retaliation. Grip regression checks sample the weapon-to-hand alignment throughout the attack sequence. The five static combat renders were regenerated with corrected grips.
