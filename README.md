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
- **Hourly exotic offering:** exactly one Exotic equipment item of any type is on offer at a time. It changes at the top of each clock hour, with a visible countdown. Victories, purchases, browsing, and forge-tier unlocks do not reset the timer or replace the current offer. Bought offers stay claimed until the next hour. Manual rerolls have been removed.
- **Inventory / The Reliquary:** all owned standard gear and exotics live in a dedicated tab. Search by item name or perk, filter by each of the seven equipment types, all armor, Exotic rarity, or equipped items, and sort by rarity, name, or equipped status. Compare standard item stats before equipping. Equip, swap, or unequip exotics outside battle; your other possessions remain stored. Purchases are stored first and must be equipped from the inventory.
- **Seven-slot equipment:** weapon, helmet, chest, arms, legs, accessory (capes/cloaks) and Testament. All seven slots and seven Worn starter items are available immediately. There is one item per slot; inventory storage remains unlimited. Exotic is a rarity, while Testament is an equipment type. All 35 exotic relics retain Exotic rarity, including the seven exotic Testaments. Standard Testaments range from Worn through Legendary. Extra Testament slot unlocks remain for a future patch.
- **Armor balance:** all five worn armor types contribute to defense. Reduction is `defense / (defense + 35)`, capped at 75%, before curses, weak effects and Guard. The player card shows the resulting percentage. Armor and exotic stat budgets have been redistributed by body slot; helmets and capes favor focus, arms can add attack, and chest/leg gear favors vitality. Swapping gear never refills health or focus.
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

`npm test` runs 96 Node.js tests covering rewards, rhythm expiry, equipment gates, skill prerequisites, combat, heavy attacks, leveling, defeat recovery, capstones, all 22 rune variants, loadout validation, bleed/burn/curse/regen timing, cooldowns, barrier synergies, respec refunds, old-save migration, and progression across every forge tier. Live WebGL rendering and rotation, browser UI, and webpage-listener/reward-effect smoke checks were also performed in Chromium during implementation. This cloud machine’s administrator policy prohibits loading unpacked extensions, so end-to-end installation in its actual side panel could not be verified here. The background storage/message flow is tested with mocked Chromium APIs; install locally to check your browser’s side-panel integration.

## Project structure

- `equipment.js`: seven slot definitions, starter loadout, 35 standard items, stat aggregation and diminishing armor reduction.
- `assets/slot-models.js`: helmets, gauntlets, greaves, cloaks and scriptures with original 32×32 pixel-etched textures.
- `engine.js`: deterministic game rules, equipment, monsters, status resolution, save migration, and build changes.
- `exotics.js`: the 35-item exotic/Testament catalog, deterministic persistent hourly offerings, perk helpers, additive stats, and safe effect merging.
- `assets/exotic-models.js`: the original twenty low-poly 3D relic models; no new external assets are required.
- `relic-perks.js`: bounded trigger hooks for fifteen new weapon/armor perks.
- `assets/new-relic-models.js`: fifteen distinct original low-poly item models.
- `assets/relic-animations.js`: fifteen custom proc animations and reduced-motion poses.
- `assets/loadout-models.js`: equipped weapon grips, worn armor and floating Testament models.
- `skills.js`: 30 talents, 22 rune choices, starter builds, requirements, cost/readiness checks, and numerical upgrade previews.
- `combat-effects.js`: distinct combat animations, combat feedback, and readable status badges.
- `background.js`: persistent save and message handling.
- `content.js`: privacy-preserving webpage event listener.
- `effects.js`: bounded canvas particles and a Shadow DOM typing gauge. The overlay does not intercept pointer events or change page layout; coordinates are used locally and never sent to the background worker. Rewards display only after a confirmed save.
- `panel.js`, `panel.html`, `index.html`, `style.css`: responsive game interface and browser preview.
- `assets/models.js`: original low-poly 3D meshes for five monsters and the original equipment items, twelve talents, and a ruined cathedral; deterministic 32×32 texture generation.
- `assets/hero.js`: original articulated obsidian-armored hero with a crimson cape, ember visor and executioner blade.
- `assets/battle-animation.js`: mesh poses and disposable 3D spell effects driven by accepted combat events.
- `assets/renderer.js`: a reusable 384×256 WebGL viewport, nearest-neighbor scaling, flat-shaded lighting, drag rotation, and an asset baker. Rendering pauses when the hunt is hidden or the document is in the background.
- `assets/renders/`: 88 bundled PNGs rendered from the original 3D meshes. Equipment uses these renders; monster renders also provide a fallback if WebGL is unavailable. Earlier model-rendered talent icons remain as development assets.
- `assets/skill-atlas.png`: 30 original painted fantasy ability icons, one per talent, used as a CSS sprite atlas. These are original generated assets, not copied game icons.
- `assets/vendor/`: locally bundled Three.js 0.180.0 and its MIT license.
- `assets/art.js`: interface icon helpers and markup for rendered assets.
- `assets/MetalMania-Regular.ttf`: Metal Mania by Patrick David, licensed under the SIL Open Font License; see `assets/MetalMania-OFL.txt`.

This is an unpacked extension; it has not been submitted to browser extension stores.

## Optional graphics development

The extension is ready to load without rebuilding. To regenerate the 88 bundled renders after changing the meshes, start the development server, install Playwright into a separate tools directory, then run:

```sh
npm install --prefix /tmp/dreadwake-tools --cache /tmp/dreadwake-npm-cache playwright
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/bake-assets.cjs
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/smoke-browser.cjs
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/smoke-skills.cjs
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/smoke-exotics.cjs
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/smoke-inventory.cjs
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/smoke-combat-3d.cjs
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/smoke-rats.cjs
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/smoke-slotted-relics.cjs
DREADWAKE_PLAYWRIGHT=/tmp/dreadwake-tools/node_modules/playwright node scripts/smoke-seven-slots.cjs
```

These scripts use `/usr/bin/chromium` by default; set `DREADWAKE_CHROMIUM` to another Chromium executable if needed. They require a local server on port 4173 (`npm start`). The browser smoke test covers live 3D rotation, asset loading, combat, preferences, typing rewards, confirmed webpage effects, input privacy, reduced motion, and failure handling. It uses a mock extension transport because this environment blocks unpacked extension installation.

## Updating an existing installation

Download and extract the updated GitHub ZIP. Replace your old extension files with the new files, retaining the same unpacked directory. Click **Reload** on Dreadwake's card in the browser's extension management page, close and reopen its side panel, then refresh the webpages you want to reward. Existing local progression is preserved; no save reset is required. The version displayed in extension settings should be **1.8.0**.

## Build examples

| Build | Active slots | What to do |
| --- | --- | --- |
| Bleed & Feed | Rend, Sanguine Feast, Blood Sovereign | Apply bleed, double Feast healing, finish with Blood Rite. Choose Lingering Wound for sustain or Rupture for burst damage. |
| Bone Fortress | Bone Bastion, Gravebloom, Grave Reprisal | Build a barrier, regenerate, then turn your remaining barrier into damage. Cathedral Aegis and Cataclysm combine for a harder hit; Gravekeeper keeps part of your protection. |
| Hexweaver | Withering Hex, Soul Nova, Total Eclipse | Curse, cast Soulfire to apply Ghostfire, then detonate it with Nova. Dread Silence suppresses heavy strikes; Frailty makes your attacks hit harder. |

Suggested builds spend only available points, respecting all prerequisites. They also refund your current build first. Select any talent to see its requirements, rank, current and next numerical effects, focus/health cost, cooldown and rune options. A mix of talents from all three trees is allowed.

Existing saves migrate automatically. Previously learned talents and progression stay intact; existing Blood Sovereign and Total Eclipse abilities are placed in your loadout when migrating an old save. Skill choices are now reversible.

## Exotics and Testaments

The exotic collection contains 35 items, including seven with Testament equipment type, all with original 3D art and named perks. Exactly one hourly offering selects from the combined eligible pool. New forge tiers expand the pool on the next hourly rotation. Relics are bought from the shop; they currently do not drop from monsters.

A loadout contains one weapon, helmet, chest, arms, legs, accessory and Testament. Up to seven Exotics can coexist, one per equipment type. Stat bonuses and perks apply only to equipped items. Crowns and halos use Helmet; gloves and shields use Arms; boots use Legs; mantles and capes use Accessory; plates and pauldrons use Chest. The teapot, contract, bell, hourglass, soul ring, jawbone reliquary and typewriter use Testament, with Exotic rarity. No extra Testament slots are unlocked in this patch.

### Fifteen new exotic weapons and armor

| Item | Equipment type | Unique effect |
| --- | --- | --- |
| Cinder Verdict | Weapon | Every second Strike erupts for 18 damage and applies 5 burn for 2 turns. |
| The Widow’s Last Dance | Weapon | Guard readies a red string. Your next Strike deals 70% more primary damage, then consumes it. |
| Gravetide | Weapon | Every third Strike summons a bone maw for 40 + your level damage. |
| Saint of a Thousand Cuts | Weapon | Each Strike applies 3 + your level bleed for 2 turns. Every third Strike bursts an existing bleed for 20 extra damage. |
| Nail of the Black Storm | Weapon | Damaging spells store 1 storm charge, up to 3. Your next Strike consumes all charges for 12 damage each. |
| Mercy’s Other Face | Weapon | Your first Strike each battle delivers a second cut for 50% of its actual primary damage. The reflection cannot copy itself. |
| Seven Minutes to Midnight | Weapon | Every fourth damaging action tears for 32 extra damage and restores 6 focus. Guard does not advance the saw. |
| The Lantern That Hunts | Weapon | Each damaging spell releases five hunting lights for 10 + your level extra damage and applies 4 burn for 2 turns. |
| The Carrion Regent | Helmet | Guard releases a raven volley for 14 damage and applies a 2-turn curse: −2 enemy damage and +10% damage taken. |
| Furnace of the Unburied | Chest | Surviving a heavy enemy attack erupts for 20 + defense damage and applies 6 burn for 2 turns. |
| Thousand-Pain Saint | Chest | Guard grants a 16-point barrier. When an incoming attack breaks your barrier, launch 28 damage of glass shards. |
| A Night Without Witness | Chest | Dodge every third enemy strike completely. That dodge readies 12 bonus damage for your next Strike. |
| The Kneeling Engine | Arms | Each damaging spell grants an 8-point barrier before the enemy retaliates. |
| Garden of the Last Martyr | Accessory | Actual incoming health damage stores 1 thorn, up to 3. Guard consumes all thorns for 9 damage and 3 healing each. |
| Funeral for a Falling Star | Chest | Every third damaging spell calls a comet for 24 + 2 per level damage and grants a 20-point barrier. |

### Original collection, reclassified

| Item | Equipment type | Perk |
| --- | --- | --- |
| The Cathedral Has Teeth | Weapon | Sermon of Hunger |
| Widow’s Probate | Weapon | The Dead Owe Interest |
| An Argument with Yesterday | Weapon | You Already Bled |
| A Perfectly Normal Teapot | Testament | Do Not Drink the Moon |
| Small Apology to the Sky | Weapon | Extinction, Politely |
| The Saint’s Bad Stitching | Arms | Pain Is Thread |
| Moth-Eaten Eternity | Accessory | Hungry for Lanterns |
| The Saint Who Froze Hell | Helmet | Winter Has Jurisdiction |
| Parliament of Rats | Helmet | Motion to Devour |
| God’s Unpaid Invoice | Testament | Sin Is Deductible |
| The Ninth Toll | Testament | The End Keeps Time |
| Yesterday’s Funeral | Testament | Time Was a Mistake |
| Boots That Never Arrive | Legs | Wrong Address |
| The Laughing Pallbearer | Arms | A Cracking Good Joke |
| The Sun’s Last Tenant | Helmet | Eviction Notice |
| Miser’s Last Breath | Testament | Death Accepts Cash |
| Choir of Loose Teeth | Testament | A Cappella Calamity |
| Understudy of the End | Accessory | One More Performance |
| The Damned Typewriter | Testament | Final Draft |
| Hands of Infinite Receipts | Arms | Thank You for Your Damnation |

Exotic procs are deliberately bounded: they never execute an additional combat turn or recursively activate damage-trigger counters. Equipped slot stat bonuses add together; stored items never grant stats. Stronger existing wounds and curses are preserved when an exotic applies a weaker version. Every accepted combat action can activate the perks of your equipped relics across seven slots, and the combat HUD names them. Counters reset each battle, except typewriter ink and receipt progress, which persist; unequipping pauses those browsing perks.

Use `node scripts/bake-assets.cjs --exotics` (with the same optional Playwright configuration above) to regenerate only exotic renders.

## Hourly shop and inventory patch

The extension now requests Chromium's `alarms` permission to schedule the next clock-hour boundary and maintain hourly updates while the panel is closed. State updates from alarms, startup, browsing, and combat use one serialized queue. If the browser is asleep or closed, the next startup or game read catches up to the current hour rather than presenting expired stock. The standalone preview checks the boundary once per second and catches up on focus/reload. Clock-aligned rotations never advance combat, consume coins, or change a loadout.

The hourly offering selects an eligible unowned exotic and stays fixed for that hour. With more than one eligible choice, consecutive hours do not offer the same item. A claimed item remains visible until the next hour; if all exotics are owned, the shop shows collection completion. Old four-offer saves migrate to the hourly format while preserving every owned item and current equipment.

Inventory has no capacity limit. Each named item is unique; buying an already-owned item never charges you twice. The current loadout has seven equipment slots. Exotic gear uses the same slots as standard gear; all other possessions remain stored. Inventory changes are locked during battle, but you can still browse your possessions.

## Hellscript visual patch

The browsing typing ritual is now **Hellscript**. Its linked talent is **Hellscript Covenant**. Names, preview controls, event messages, and progress labels use the new theme. Existing saves, skill IDs, typing privacy, and exotic ink charges are preserved.

`hellscript-art.js` provides an original horned demonic seal shared by the panel and isolated webpage overlay. The full eruption uses a bounded particle pool with flaming embers and infernal rings. Subtle and Off settings still apply; reduced motion skips animated particles and displays a static reward notice. No remote fonts, assets, new website access, or telemetry are needed.

Hellscript now requires 100 rhythmic keys per eruption and grants a fixed 35 coins. Focus rewards are unchanged.

## Hero and 3D combat patch

The Unburnt now stands beside every monster in the cathedral. The camera retains its original perspective, with a slightly wider view for both combatants. The hero’s base design has faceted black plate, silver spikes, an ember visor, a torn crimson cape and a jagged blade. Equipped weapon models, armor ornaments and the active Testament now appear on the hero. Equipment stats come from your loadout.

Accepted turns animate the hero first, then the monster when the rules actually resolve a retaliation. Weapon arts lunge and slash; Soulfire travels between combatants; Feast and Drain siphon energy; Bone wards surround the hero; Mend raises healing rings; Hex surrounds the monster with a curse sigil; Nova erupts outward; Eclipse summons a dark orb. Monsters swing articulated mesh arms, recoil, dive or cast, and collapse when defeated. Damage, healing and absorption feedback follows the corresponding animation phase. Existing rune mechanics and exotic proc announcements remain active.

Animations are visual and never resolve extra turns or grant rewards. A newer turn replaces unfinished effects. Temporary geometry and materials are disposed after the sequence. Navigation and hidden documents pause rendering. Reduced motion keeps characters still and displays static spell indicators. All five bundled fallback images now show the hero alongside the monster; WebGL fallback remains static. Regenerate these with `node scripts/bake-assets.cjs --monsters`.

`smoke-combat-3d.cjs` checks all fourteen base/active moves against five monster rigs, visible effects, attack poses, retaliation, cleanup, unchanged combat events, reduced motion and real panel turns at a narrow viewport.

## Weapon grip and swing correction

Swords attach at their handle centers to actual hand joints. The hero, knight and king now have articulated shoulders, elbows and wrists; the king and knight carry their shields on their forearms. The revenant grips its scythe shaft, and the Bellkeeper grips a single connected staff. All combatants face one another. Weapon attacks now wind up, extend through the target and recover instead of rotating a weapon offset from the hand. Counterattacks reuse the same articulated swing. Reduced motion preserves the resting grip, and defeated monsters do not play a retaliation. Grip regression checks sample the weapon-to-hand alignment throughout the attack sequence. The five static combat renders were regenerated with corrected grips.

## Parliament of Rats companions

Equipping Parliament of Rats in the helmet slot adds three original low-poly rat companions to the cathedral. Their tails sway while idle; triggered attacks send the rats scurrying to the monster with animated feet, a biting leap and a return to the hero. Guard recruits one visible rat, matching the combat counter up to twelve. The animation reads an explicit rat damage event, so it does not attack after a primary hit has already killed the monster. Rat damage labels appear during the bite phase. Reloading or browsing does not replay a previous swarm attack. Unequipping removes the visible swarm.

`assets/rat-swarm.js` reuses a pool of at most twelve models. Reduced motion keeps the rats still. When WebGL is unavailable, static renders of the rats appear with the correct equipped count; regenerate their original transparent asset with `node scripts/bake-assets.cjs --companions`. `scripts/smoke-rats.cjs` checks actual Guard recruitment, damage, approach/bite/return poses, capped pooling, reduced motion, duplicate-event handling, unequip and fallback asset loading. Combat balance and save format are unchanged.

## Custom relic animations

Schema 6 preserves owned items, currency, talents, skills and progression while migrating equipment by body type. Your last standard item in each slot is remembered for unequip. Active combat and counters remain saved; migration never takes a combat turn. Resources are capped to the new loadout, and gear swaps never refill health or focus.

The fifteen new items have unique proc records and 3D effects: cinder pillars, puppet strings, bone jaws, needle volleys, forked lightning, mirror cuts, rotating saw teeth, five hunting lights, raven wings, a furnace eruption, glass shields/shrapnel, shadow silhouettes, rosary beads, briars and a falling comet with orbital wards. Reactions animate after the enemy phase. Temporary meshes are disposed when the sequence finishes or is replaced. Reduced motion keeps effects still. Equipped weapons grip the hero’s hand by their actual handle point; crowns, gloves, boots, mantles and plates attach to the corresponding body region. The active Testament floats beside the hero. Static WebGL fallback shows the representative hero and monster render; dynamic worn gear and proc meshes require WebGL.

`tests/slotted-relics.test.js` covers migration, actual slot replacement, all fifteen perks, bounded counters, stored-item inactivity and lethal-hit short circuits. `scripts/smoke-slotted-relics.cjs` triggers every new perk through a real panel action, checks custom animation movement and reduced-motion stability, weapon grips, cleanup, model loading, all equipment slots, inventory filters and narrow layouts.

## Seven equipment types (v1.8.0)

Testament is now an equipment type, with rarity tracked independently. The seven formerly converted items are Exotic again. There are seven starting equipment slots: Weapon, Helmet, Chest, Arms, Legs, Accessory and Testament. Every slot gets Worn starter gear, including the Oath of the Unburnt. The forge now contains 35 standard items, with upgrades for each type at every forge tier. Together with 35 Exotics, the full inventory can hold 70 distinct items. The hourly merchant still offers exactly one Exotic and preserves the current offer through updates and purchases.

Schema 6 migrates the former Armor item by its actual type. A crown moves to Helmet, a mantle to Accessory, gauntlets or a shield to Arms, boots to Legs and plates to Chest. Existing weapon, Testament, ownership, currency, talents, progression and saved combat counters are preserved. Missing starting slots receive free Worn items. Previously stored gear remains stored; old unlimited-relic saves choose the first previously active item per equipment type. A slot swap replaces only that slot and is blocked during combat.

Armor budgets are split across five body types. Ordinary helmets/capes add focus, arms can add attack, and chest/leg items add health. Full Legendary standard equipment at level 1 gives 50 attack, 30 defense, 136 maximum health and 52 maximum focus before skills. Defense uses diminishing reduction, capped at 75%, so heavy attacks remain stronger than normal ones. Existing skills and perk conditions remain active; smaller worn relic stat budgets prevent the old single-armor bonuses from multiplying fivefold. Proc hooks remain bounded under seven simultaneous Exotics.

New helmets, gauntlets, greaves, capes and scriptures use original nearest-filtered 32×32 seam/rune textures. They attach to the correct hero joints. Helmets replace the base helmet mesh, gloves follow both forearms, chest models omit duplicate arms/capes, and the chosen accessory supplies the cloak. Every new piece has a locally baked 3D inventory image. Inventory and forge support equipment-type filters; the Exotic filter includes exotic Testaments. Stat comparisons show attack, defense, health and focus changes rather than treating every type as generic armor.

`tests/seven-slots.test.js` checks starter slots, independent rarity/type, v5 migration, seven simultaneous Exotics, correct stat aggregation, wrong-slot rejection, armor scaling and bounded combined perks. `scripts/smoke-seven-slots.cjs` checks all seven UI slots and type filters, mixed worn meshes, grips, swap cleanup, simultaneous rat/ward effects, persistence, combat locks and narrow layouts. Additional Testament unlocks remain deferred.

### v1.9 — The Obsidian Court

A complete infernal baroque interface theme across the Hunt, Forge, Reliquary, Forbidden Arts and Chronicle: original horned scrollwork, obsidian marble, Greek-key friezes, fluted borders, aged gold, blood lacquer controls and jagged headings. All art is bundled locally. Keyboard focus, reduced motion and layouts down to 320px are preserved. Existing saves and game balance are unchanged.

### v1.10 — Prerendered infernal interface

The interface now uses bundled photorealistic material artwork: blackened iron, charcoal cathedral stone, oxblood leather and a sculpted horned demon relief. Heavy beveled frames, recessed equipment sockets, jewel-like resource bars and tactile pressed controls draw on mid-to-late 1990s PC game menus, with a stylish gothic action-game atmosphere. Text remains live and searchable; keyboard focus, reduced motion and 320px panel layouts remain supported. Combat models retain their existing retro 3D style. Save data and gameplay rules are unchanged.

### v1.10.1 — Magma lettering

Brighter ivory text, larger descriptions and stats, clearer labels and slow ember pulses through headings and item names. Text keeps a steady bright core. Reduced-motion preferences disable the pulse while retaining a static glow.

### v1.11 — Hellscript reliquary

Hellscript now shares the photoreal cast-metal demon relief, oxblood leather, beveled iron frames and pulsing magma text across the side panel, webpage typing gauge and ignition reward popup. The popup uses the bundled jagged font and respects reduced motion. Its full gauge correctly reads 100 / 100; rewards remain 35 coins and the existing focus bonus. Only the three decorative images/font resources are exposed for webpage overlays.

### v1.11.1 — Compact Hellscript splash

Smaller side-panel and webpage Hellscript gauges. Ignition is now a brief transparent splash of jagged, black-edged molten lettering, with a compact ember burst instead of a large framed card and screen-sized rings. The splash fades in 1.35 seconds; reduced motion keeps it static. The 100-key requirement, 35-coin reward and focus bonus are unchanged.
