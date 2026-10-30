# Chrome & Ash — noir materials / biotech interface

The user's brief combines original Max Payne-style urban decay with cyberpunk neon, dark fantasy and the existing PSX presentation. Version 1.12 changes material art across the five chapters, humans, monsters and equipment. The layouts, objective chains and combat tuning remain.

## Material treatment

The original generated `materials/noir-atlas.png` contains four photographic-style base studies: spalled concrete, corroded metal, damp brick and dark asphalt. It is 1254×1254; the four regions supply actual image detail, not just upscaled old paint. No commercial game's textures are included.

`material-studies.js` composes the studies into 512px world maps with casting seams, mortar, rust, damage, wetness, warning labels, patchwork and narrow edge blending. A cached canvas per material avoids regenerating these maps on chapter changes. Correlated multiscale wear supplies broad dirt and baked relief; independent high-contrast white speckles are avoided. Asphalt contrast is deliberately restrained. The cathedral receives cracked stone slabs, the terminal receives worn tile, and the roofs receive bitumen repair seams.

Faces, skin, cloth and armor use 256px maps. Skin pores/creases, fabric weave, pitting, stitches and wear respect the existing slim anatomy and joint hierarchy. Gear also uses 256px maps; steel/frame paint incorporates the photographic corrosion study. Mournfang remains black polished steel with its animated sheen; the new subtle scratch map does not replace its moving specular effect or existing regalia. Night Leaf gains a detailed leaf wrapper.

World/enemies retain RGB555, flat polygonal geometry, vertex snapping and the exact existing affine UV shader and close-ground relief. The actual game raster is 480 lines, a sharper retro presentation in the spirit of PS1 interlaced output, without simulating field flicker. The reusable renderer/test fixtures retain their default 240-line setting. Ground uses direct nearest sampling; most other world/actor maps use nearest sampling and discrete nearest mip levels for distance stability. There is no bilinear blur. Equipment/body/smoke remain in the native-resolution, perspective, unquantized pass. Film grain and default dithering remain off.

Legacy signs now render their real typography at 512×128 rather than 128×32. The large Sable mural is a 512×768 layered censored portrait bulletin. The animated Japanese advertisement system and bundled Japanese font remain intact.

## Interface references and original artwork

The previous terminal-card layout was replaced with a biomechanical perimeter, glossy swollen health shapes, a skull-like ammunition seal, warped green serif title, curved irregular buttons and an original four-eyed cable-bound idol. The center of the gameplay view stays clear, and information remains selectable/readable. Patterns are static: no flashing or strobing is used.

Research included accessible community implementations and their screenshots. These are **community interpretations**, not claimed to be direct captures of Cruelty Squad:

- [Cruelty Squad HUD archive](https://github.com/TF2HUDsArchive/Cruelty-Squad-HUD): reviewed the `screenshots` branch's Life/Death examples for organic screen rims, sculptural green health forms and serif counters.
- [CrueltySquadHUD](https://github.com/Yrrry/CrueltySquadHUD): community HUD reference.
- [Cruelty Squad VR modloader](https://github.com/teddybear082/CrueltySquadVR-Modloader): community project/context. Its externally hosted screenshots were inaccessible.
- [Cruelty Squad Steam page](https://store.steampowered.com/app/1388770/Cruelty_Squad/): attempted official reference; this environment's outbound policy blocked access.

All shipped UI drawings (`ui/bio-frame.svg`, `ui/idol.svg`, `ui/ammo-seal.svg`) are original SVG artwork. Reference screenshots and third-party game art are not included in the runtime. Decorative surface filtering is limited to the artwork and does not add noise to the game world.

## Verification

GPU fixtures check actual affine interpolation, RGB555, vertex snapping, near-ground relief, foreground isolation and animated sword sheen. Browser checks cover the larger material maps, restrained pavement contrast, all five chapter routes and floor assignments, ten enemy types, pistol animation/contact, blood/healing smoke, and title/menu bounds at four viewport sizes. The packaged Linux desktop build is tested with local modules/assets, pointer capture, all four equipment slots, reload, pause/restart and fullscreen. Windows is cross-packaged and its portable payload verified; it is not run on a Windows machine here.
