# PSX graphics pipeline

`PSXPipeline` renders the world, weather, tracers and first-person weapon through the same low-resolution render target. The output is enlarged with nearest-neighbor sampling. At a 4:3 aspect ratio the target is 320×240; widescreen preserves 240 vertical pixels and adds horizontal pixels rather than stretching the camera.

## Raster stages

1. Transform low-poly geometry and calculate directional Gouraud lighting at vertices. Flat vertex normals and painted vertex shade values preserve the facets. Textures are display-space 64×64 pixel paintings with a limited shared palette.
2. Quantize projected vertex positions to whole internal raster pixels. Camera movement produces discrete vertex wobble; there is no animated displacement noise.
3. Interpolate UVs affinely in screen space. Encode `(u*w, v*w, w)` as vertex varyings, then divide the interpolated first two components by the third in the fragment shader. This cancels the GPU's normal perspective correction. Each quad is two triangles, so painted features visibly shear across its diagonal at oblique viewing angles.
4. Sample textures with nearest-neighbor filtering, no mipmaps and no anisotropic filtering. Apply the prelit vertex colors and distance fog.
5. Composite the weapon into the same color target after clearing depth. Apply the PS1 4×4 signed dither matrix and truncate the completed scene to 5 bits per RGB channel (RGB555). CSS scanlines are an independently switchable display overlay.

Depth testing and near-plane clipping use the GPU. This is a renderer designed around PS1 visual constraints, rather than a cycle-accurate hardware emulator.

## Art

`anatomy.js` creates anatomical oval cross-sections with independently positioned rings, plus explicit facial topology and beveled polygon prisms. `models.js` uses those shapes for the human skull, modeled nose/cheeks/chin, eyes, eyebrows, hair, hands/fingers, tailored torso and jointed limbs. There is no robot helmet or visor. MOURNFANG has a chipped, hooked blackened blade, moving fangs, raised rune geometry, a hollow skull crossguard with teeth/horns, a rotating ruby and a nested linked chain. Buildings retain tapered upper stories, polygonal tanks and ducts, awnings, rooftop antennae and shuttered shops.

`textures.js` paints deterministic 64×64 grime maps: mottled concrete with drips and cracks, oily broken asphalt, rusted steel, stained shutters, worn leather/cloth and dirty skin. Charcoal, grey, olive and rusty brown replace the earlier bright fantasy palette; the blade core uses dark blood red. Nearest-neighbor sampling, affine interpolation, vertex snapping and RGB555 remain unchanged. Fog uses the new art palette through the existing uniform.

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

The browser test draws a depth-varying triangle through the actual GPU shaders. It reads back raw UV-encoded pixels and compares them with CPU-computed screen-space barycentric interpolation, then repeats with perspective correction and snapped raster vertices. In the test scene, the sampled U coordinate is approximately **0.333 affine** versus **0.157 perspective-correct**. It also verifies that dithering changes framebuffer pixels and that every final color channel belongs to the 32-level RGB555 palette.

`tests/grips.cjs` samples 223 reload/recoil and alternating attack poses. It checks real joint positions and contact gaps, fixed arm lengths, wrapped fingers, the trigger fingertip, mirrored hand anatomy, idle framing and actual changes in the blade’s animated parts.

`tests/weapons.cjs` verifies both starting weapons, human enemies, switching, melee range and damage, cooldown, ammunition, reload cancellation and restart. `tests/assets.html` is a model review scene using the same renderer and actual game models.

`tests/mission.cjs` runs the two-chapter campaign playthrough, including all six objectives and both exits. `tests/desktop.cjs` validates local packaged module loading, the affine comparison control, movement, mouse capture, firing, reloading, pause/restart, fullscreen, renderer isolation and offline operation. Set `NULL_DISTRICT_URL` to use another preview port; set `PLAYWRIGHT_MODULE` to use another Playwright installation.


## Chrome & Ash / chapter content

Version 1.4 leaves `psx-renderer.js` unchanged. `neon.js` builds cyan/magenta/violet tube installations, polygonal pavement light pools and dimensional sigils. The pools blend vertex-painted geometry into the same low-resolution target; there is no bloom pass or replacement of the affine shader. `levels.js` defines both chapters' bounds, objectives, supplies, exits and enemy placements, and builds the independent Gothic cathedral map. The district retains its grungy painted surfaces beneath neon shops and conduits.

`enemies.js` authors four modern/cyberpunk humans, three fantasy humans and three monsters. Equipment, clothing and topology distinguish the humans; the quadruped hound, open-ribbed revenant and winged stone demon have separate anatomy. Actual archetype geometry ranges from 526 to 1,788 triangles. Walking joints, attack wind-ups, the hound tail, netrunner halo and sentinel wings animate in-game.

`systems/combat.js` separates combat decisions from rendering: range/LOS acquisition, locked aim, wind-up, cooldown, melee facing, firearm cones and projectile launch. The game handles moving projectiles with segment/sphere and solid-cover intersections. Level teardown disposes old geometry, owned materials and sign textures before rebuilding, while retaining shared weapon/texture resources. `nullDistrict.navigation()` and `state` provide read-only diagnostics for navigation and playthrough tests.

`tests/combat.mjs`, `tests/roster.cjs` and `tests/campaign.cjs` cover the new attack mechanics, actual models and complete two-chapter progression. `tests/roster.html` renders a hostile archive with the exact game factories and pipeline. Legacy rendering and grip tests remain applicable.
