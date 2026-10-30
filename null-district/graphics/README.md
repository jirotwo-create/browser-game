# PSX graphics pipeline

`PSXPipeline` renders the world, enemies, weather and world-space tracers through the same low-resolution render target. Player arms and gear are composited afterwards at native window resolution. The world output is enlarged with nearest-neighbor sampling. At a 4:3 aspect ratio the target is 320×240; widescreen preserves 240 vertical pixels and adds horizontal pixels rather than stretching the camera.

## Raster stages

1. Transform low-poly geometry and calculate directional Gouraud lighting at vertices. Flat vertex normals and painted vertex shade values preserve the facets. Textures are display-space 64×64 pixel paintings with a limited shared palette.
2. Quantize projected vertex positions to whole internal raster pixels. Camera movement produces discrete vertex wobble; there is no animated displacement noise.
3. Interpolate UVs affinely in screen space. Encode `(u*w, v*w, w)` as vertex varyings, then divide the interpolated first two components by the third in the fragment shader. This cancels the GPU's normal perspective correction. Each quad is two triangles, so painted features visibly shear across its diagonal at oblique viewing angles.
4. Sample textures with nearest-neighbor filtering, no mipmaps and no anisotropic filtering. Apply the prelit vertex colors and distance fog.
5. Apply the PS1 4×4 signed dither matrix and RGB555 quantization into a second target at the same internal resolution. Nearest-upscale that completed world image to the native window framebuffer.
6. Clear depth and render the player’s arms, gear and attached effects at native window resolution, after world quantization. Gear uses ordinary perspective interpolation and continuous colors, without pixel textures, vertex snapping or affine UVs. Default-framebuffer antialiasing only smooths the native pass; both world targets remain unsampled 240-line rasters. CSS scanlines are an independently switchable display overlay.

Depth testing and near-plane clipping use the GPU. This is a renderer designed around PS1 visual constraints, rather than a cycle-accurate hardware emulator.

## Art

`anatomy.js` creates anatomical oval cross-sections with independently positioned rings, plus explicit facial topology and beveled polygon prisms. `models.js` uses those shapes for the human skull, modeled nose/cheeks/chin, eyes, eyebrows, hair, hands/fingers, tailored torso and jointed limbs. There is no robot helmet or visor. MOURNFANG has a traditional symmetrical polished black-steel blade, an animated sheen, etched runes, a sculpted death-mask crossguard, moving talons, a horn crown, faceted gems and twin articulated charm chains. Buildings retain tapered upper stories, polygonal tanks and ducts, awnings, rooftop antennae and shuttered shops.

`textures.js` paints deterministic 64×64 grime maps: mottled concrete with drips and cracks, oily broken asphalt, rusted steel, stained shutters, worn leather/cloth and dirty skin. Charcoal, grey, olive and rusty brown replace the earlier bright fantasy palette; the blade core uses dark blood red. Nearest-neighbor sampling, affine interpolation, vertex snapping and RGB555 remain unchanged for the world and enemies. Fog uses the new art palette through the existing uniform.

`weapon-rig.js` anchors weapon and gripping fingers to the same transform. Left hands have mirrored anatomical geometry and opposed thumbs. A two-bone solver keeps each 0.37m upper arm/forearm attached to its wrist and constrains the grip to both shoulders' reachable volume. The carbine has trigger contact, fore-end support and a magazine reach during reload. The sword has a two-handed grip and alternating attacks. Moving fangs, glyphs, ruby, core tint and nested chain animate independently at rest; the slash trail uses the blade's measured path and reuses a fixed buffer.

`district.js` batches static painted geometry by material. Animated rigs and explicitly marked collision meshes remain separate. Rendering changes preserve the mission's traversable road and cover positions.

## Compare and verify

- **F6**: affine mapping / perspective-correct mapping.
- **F7**: projected vertex snapping on / off.
- **F8**: ordered dithering on / off. RGB555 quantization remains active.

These options are enabled by default in the game and desktop builds.

With the development preview running:

```sh
node tests/render.cjs
```

The browser test draws a depth-varying triangle through the actual GPU shaders. It reads back raw UV-encoded pixels and compares them with CPU-computed screen-space barycentric interpolation, then repeats with perspective correction and snapped raster vertices. In the test scene, the sampled U coordinate is approximately **0.333 affine** versus **0.157 perspective-correct**. It also verifies that dithering changes framebuffer pixels and that every world color channel belongs to the 32-level RGB555 palette.

`tests/grips.cjs` samples 223 reload/recoil and alternating attack poses. It checks real joint positions and contact gaps, fixed arm lengths, wrapped fingers, the trigger fingertip, mirrored hand anatomy, idle framing and actual changes in the blade’s animated parts.

`tests/weapons.cjs` verifies both starting weapons, the mixed enemy roster, switching, melee range and damage, cooldown, ammunition, reload cancellation and restart. `tests/assets.html` is a model review scene using the same renderer and actual game models.

`tests/mission.cjs` runs the two-chapter campaign playthrough, including all six objectives and both exits. `tests/desktop.cjs` validates local packaged module loading, the affine comparison control, movement, mouse capture, firing, reloading, pause/restart, fullscreen, renderer isolation and offline operation. Set `NULL_DISTRICT_URL` to use another preview port; set `PLAYWRIGHT_MODULE` to use another Playwright installation.


## Chrome & Ash / chapter content

Version 1.4 leaves `psx-renderer.js` unchanged. `neon.js` builds cyan/magenta/violet tube installations, polygonal pavement light pools and dimensional sigils. The pools blend vertex-painted geometry into the same low-resolution target; there is no bloom pass or replacement of the affine shader. `levels.js` defines both chapters' bounds, objectives, supplies, exits and enemy placements, and builds the independent Gothic cathedral map. The district retains its grungy painted surfaces beneath neon shops and conduits.

`enemies.js` authors four modern/cyberpunk humans, three fantasy humans and three monsters. Equipment, clothing and topology distinguish the humans; the quadruped hound, open-ribbed revenant and winged stone demon have separate anatomy. Current archetype geometry ranges from 1,578 to 6,468 triangles. Walking joints, attack wind-ups, the hound tail, netrunner halo and sentinel wings animate in-game.

`systems/combat.js` separates combat decisions from rendering: range/LOS acquisition, locked aim, wind-up, cooldown, melee facing, firearm cones and projectile launch. The game handles moving projectiles with segment/sphere and solid-cover intersections. Level teardown disposes old geometry, owned materials and sign textures before rebuilding, while retaining shared weapon/texture resources. `nullDistrict.navigation()` and `state` provide read-only diagnostics for navigation and playthrough tests.

`tests/combat.mjs`, `tests/roster.cjs` and `tests/campaign.cjs` cover the new attack mechanics, actual models and complete two-chapter progression. `tests/roster.html` renders a hostile archive with the exact game factories and pipeline. Legacy rendering and grip tests remain applicable.


## Version 1.5 / native gear and sculpted characters

The three original world shaders are byte-for-byte unchanged. Only composition/output sizing changes: `target` holds the raw world raster; `processed` holds the world’s RGB555/dither result; `present` nearest-upscales it; the foreground scene then renders on the full-size framebuffer. Diagnostics distinguish `resolution` from `gearResolution` and report `gearPass`. GPU readback tests in `tests/composite.cjs` verify world pixel blocks, native color gradients, toggle isolation and actual sheen animation. `tests/render.cjs` still produces the original affine/perspective UV samples and RGB555 results.

`gear-materials.js` supplies independent perspective-correct equipment shaders. Flat geometric normals produce visible polygonal reflections, a Fresnel rim, narrow specular strips, cool/warm reflection bands and a time-driven sheen. These materials never register with world retro controls. The polished black-steel blade has four main diamond-section bevels, a ricasso, distal taper and a traditional symmetrical point. Additional ornament meshes preserve independent talon, rune, gem and chain animation. No low-resolution world texture maps are used on the player’s gear.

`sculpt.js` adds raised triangular planes to enemies and carbine surfaces without moving the original mesh boundaries or UV seams. Human limbs/torso also gain additional authored anatomical sections. Character meshes are then merged only among siblings with the same material: joint groups and animated props survive. The new world-rendered enemy budgets are 1,578–6,468 triangles. Environment mesh factories and textures are untouched.


## Version 1.6 / Japanese neon districts

`urban-levels.js` adds three independent maps: the covered market's central/outer shopping lanes, the terminal's divided platforms and wrecked trains, and the open broadcast plaza's service blocks and advertisement skyline. `levels.js` supplies per-chapter interaction verbs, completion copy, transitions and exits. The menu and progression use the chapter array rather than a hard-coded two-level limit. Player gear, original world shaders, enemy models and combat tuning are unchanged.

`signage.js` loads a local OpenType/WOFF font through `FontFace` before painting any signs. `graphics/fonts/DistrictJP.woff` is a renamed, subsetted Noto Sans CJK JP Bold with its OFL notice alongside it. Rebuild with `python tools/subset-sign-font.py /path/to/NotoSansCJK-Bold.ttc` after adding new Japanese characters; fontTools is only a development dependency. The desktop local protocol permits the bundled font; no external font request is needed.

Seventeen authored bilingual ad designs use short Japanese headlines, large English copy, offers and geometric pictograms. Two frames change illuminated accents while preserving the headline. Text is drawn at uniform font scale, never horizontally squeezed. Textures match panel aspect ratios; portrait panels use stacked/grid Japanese layouts, not stretched landscape art. All ads use the world material and share its affine mapping, pixelation and fog. Eighty billboard instances can reuse materials by design and panel aspect. Animation switches cached texture uniforms instead of repainting or allocating GPU textures every frame. Teardown disposes all frame textures, including inactive ones.

`tests/signage.cjs` checks font availability, headline/English/offer bounds, aspect matching and persistent copy during animation. `tests/chapters.cjs` checks new chapter spawns, flood-fills actual collider rectangles to every node/exit, checks animated world signs and exercises restart. `tests/campaign.cjs` navigates and fights through all five chapters with real inputs and validates all fifteen objectives and sequential transitions. `tests/desktop.cjs` loads the bundled font and new chapters through the packaged offline protocol.

### Near-ground relief (1.7)

The road material alone opts into `groundRelief`. A perspective-interpolated view-space position gives the actual per-fragment camera distance, including when looking down. Affine UV strength is 0.12 up to two meters, smoothly returns to 1.0 at seven meters, and always multiplies the global affine toggle. Large pavement triangles therefore retain mild swim at the player’s feet without extreme shearing. Wall and enemy materials default to zero relief. Pixelation, vertex snapping and the native gear pass do not change. The GPU UV test samples near, intermediate and distant triangles, verifies the 12% close blend and full distant affine mapping, and checks unchanged RGB555 output.

### Blood and smoking equipment (1.8)

Blood droplets and irregular triangle-fan ground/wall stains use the world’s existing material pipeline, so they retain affine interpolation, raster snapping and RGB555. Raycasts place wall marks behind impact points; falling droplets leave ground spots. Counts are capped at 96 droplets and 128 stains, with 120-second stain lifetimes and explicit chapter cleanup.

NIGHT LEAF uses a separate smoking hand with an index/middle-finger pinch and the same fixed-length arm solver as the weapons. Its leaf wrapper, spiral seam, ash and animated ember render in the native gear pass. Procedural, translucent smoke planes also render in that pass; time-based emission and a 72-particle cap bound their cost. The gameplay controller handles a 2.8-second puff, one heal at 1.45 seconds, and a 12-second cooldown that cannot be erased by holstering.

### Courier / pistol / environment refinement (1.9)

`painted-surfaces.js` supplies 64px point-filtered gear maps with broad painted shadows, steel edges, fasteners, wear, stitching and knuckle creases. The gear shader samples these with perspective interpolation in the existing native-resolution pass. Unpainted black steel retains its specular sheen. The K-13 uses coherent planar UVs per slide face, avoiding repeated triangular patterns on the end cap, and a dedicated two-handed pistol pose using the existing IK solver.

`player-body.js` supplies a headless first-person courier torso, utility belt, trouser legs, knee plates and armored boots. Its inverse pitch keeps the body below the player when looking down; hip/knee animation follows the walking cycle. Reinforced hands and additional sleeve cross-sections share the same materials and wrist constraints across all held items.

World surface maps expand to 128px for environment materials while retaining nearest filtering; broad stains receive a finer layer of aggregate/chips. `set-dressing.js` adds rigid cabinets, pipes, grilles, paper layers and ground detail, flattens them and batches by material. Solid cabinet footprints participate in collision and cover. Route tests flood every chapter and verify that all objectives, exits, spawns and the full courier corridor remain clear.

### Clarity / human anatomy / pistol framing (1.10)

The game selects a 360-line world target; reusable pipeline fixtures retain their 240-line default. RGB555, affine interpolation, vertex snapping and nearest upscaling are unchanged. The game starts with ordered dithering disabled and a zero-opacity film-grain layer. F8 enables a quarter-strength dither; scanlines remain faint. Floor paint replaces stacked random grain with sparse designed seams and patches. `clarity.cjs` measures road-texture high-frequency contrast and verifies that structure remains, rather than accepting a blank texture.

`human-npcs.js` builds new anatomical humans with narrower torsos, shoulders, limbs and heads, modeled facial parts and segmented hands. `human-surfaces.js` supplies clear 128px face, skin, cloth, robe and armor maps. Human chisel depth/contrast are reduced to keep clean planes; monsters retain their previous sculpt settings. The seven human meshes contain roughly 10,500–11,300 triangles after joint-preserving batching. Roster tests verify actual proportions, independent props, articulation and geometry budgets.

Pistol ready grip shifts from (.145, -.24, -.40) to (.16, -.345, -.57) before idle motion and IK. GPU/model tests verify that its top remains below the center of the view, that it sits farther from the camera, and that wrist/trigger contacts and arm lengths survive 36 recoil/reload/empty poses.

## 1.11 — salvaged K-13 and employee terminal

The K-13 retains its native foreground pass and low, distant ready pose. Its authored flat polygons now include jagged slide cheeks, five cut-steel teeth per side, a chamfered front shroud, exposed recoil housing and hooked hammer. New pieces belong to the animated slide or tool as appropriate; wrist and trigger IK targets are unchanged. Steel/frame tints use duller olive-gray pigment and reduced polish. No world renderer or texture-warp parameters changed.

`dystopia.css` skins the title, pause and HUD without replacing gameplay control IDs. Original inline SVG effigy art and static conic/stripe patterns are bundled offline. Corner windows keep center view clear; responsive rules retain all five chapter choices. `tests/ui.cjs` checks actual viewport bounds and menu transitions; `tests/pistol-art.cjs` still checks native isolation, aim clearance and 36 IK/slide/reload poses.

## 1.12 — full material pass and biomechanical interface

See [Art direction, source notes and verification](ART-DIRECTION.md). The image atlas is loaded once as a local ES-module dependency before any material palette can be created; the custom desktop protocol explicitly allows local PNG assets. 512px world / 256px character and gear maps carry the new material detail. The actual game renders at 480 lines; `PSXPipeline`'s default and its affine/color shader are unchanged. Palette-owned chapter floor maps survive level disposal and are selected on each load/restart.

The portable build retains only Electron's English application locale to offset the bundled photographic atlas size. The game's Japanese font and all signs remain packaged locally; this does not change in-game Japanese text.

## 1.13 — reference-led K-13 rebuild

`pistol.js` replaces the previous short, dark, toothed slide with a long exposed six-sided barrel, tapered silver receiver, dark mechanical recesses and a large violet rear sight. Hidden construction is inferred from the partial reference. `pistol-surfaces.js` authors a dedicated 256px blue-white distressed steel map; the receiver's UVs are projected in assembled slide coordinates so adjacent pieces share paint scale. No camera-facing serial sticker remains. Barrel and grip stay fixed while the receiver slides, and the existing trigger/wrist targets are retained. The native foreground pass remains unchanged.

The framebuffer test now also requires visible cold-silver pixels and a visible violet sight, alongside the existing 36-pose IK/clearance and native-isolation checks. The three-angle study and in-game captures show the actual runtime geometry/material, not concept art.

## 1.14 — Chrome & Ash prologue

See [screenplay, playback, resources and verification](PROLOGUE.md). The ten-shot timeline uses actual lengths from nineteen bundled Ogg voice clips. Seven isolated staged sets reuse the existing architecture and character assets; shared material/texture ownership is protected on exit. The custom desktop protocol now serves local Ogg audio. Main gameplay enters an explicit intro state, freezes combat/objectives/input, and resumes only from a user gesture so mouse capture remains reliable. The first Chapter 01 deployment plays once per session, with independent menu replay.

## 1.15 — Night Leaf presentation and firearm rebuild

See [effect lifecycle, firearm geometry and verification](EXHALE-GUNMETAL.md). The drug effect lives in the world presentation shader, before native equipment compositing; zero strength uses the original exact sampling path. It does not alter the affine UV shader or camera. `createSmoking` owns its timed, exhale-only envelope. Both firearms share the distressed finish from `pistol-surfaces.js`; their actual six-sided barrel meshes taper and shift toward their muzzles.

Version 1.16: [ten-second peripheral smoke spirals](PERIPHERAL-HIGH.md), with a protected aim area and native foreground.

Version 1.17: [actual material UV spirals](SURFACE-HIGH.md) replace screen-image distortion.

Version 1.18: [refined Mournfang and hand-rolled Night Leaf](RELIC-LEAF.md).
