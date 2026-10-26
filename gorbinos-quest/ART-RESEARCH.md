# Visual research for the 3D remake

## Sources actually consulted

1. [Cruelty Squad — official Steam page](https://store.steampowered.com/app/1388770/Cruelty_Squad/): official presentation, screenshots, open mission structure, weapons, NPC interaction and side systems.
2. [Ville Kallio interview, Game Developer](https://www.gamedeveloper.com/design/examining-amoral-world-big-business-cruelty-squad): the creator describes the visual direction as a continuation of his earlier artwork, explains his preference for powerful weapons and predictable enemies, and discusses side activities and economic world-building.
3. [Cruelty Squad review, PC Gamer](https://www.pcgamer.com/cruelty-squad-review/): useful secondary description of low-resolution surfaces, polygonal spaces and grotesque visual coherence.
4. [Community dialogue transcription](https://steamcommunity.com/sharedfiles/filedetails/?id=2532255970): a secondary transcription with references to Gorbino's Quest in mall and workplace conversations. It supplies context for the fictional in-world title, not a specification for its gameplay.

The search also returned an image attributed to a different Steam app ID. It was not treated as authoritative reference. There is no claim that the fictional Gorbino's Quest has a documented, canonical 3D appearance matching this fan game.

## What changed in the remake

The old clean 2D circles and muted grid arenas were replaced entirely. The new game is a real first-person 3D world, rendered at a low internal resolution with nearest-neighbor scaling. A custom spatial shader snaps projected vertices to a coarse grid and quantizes color. This is an approximation of retro visual artifacts, not exact PlayStation hardware emulation or true affine texture mapping.

Original 64×64 surfaces combine acid-green checks, purple masonry, flesh-colored waves, eye wallpaper, riveted metal and scratched ground. The sky is an original 256×128 banded panorama. NPC faces use asymmetrical original 32×32 textures on angular heads. Flat-shaded low-segment meshes, exaggerated bodies and mismatched architecture support the biopunk mood.

The HUD uses an original patterned flesh frame, a lumpy health gland, saturated text, and asymmetric information boxes. Information essential to play stays readable even when decorative surfaces clash. F3 increases rendering resolution; motion and audio settings are accessible without leaving the game.

Instead of treating the look as a decorative filter, the city makes familiar places wrong: a clinic becomes a reconstruction counter, offices process bodies, rooftop broadcast towers offer a pirate side mission, and a divine accounting tower holds the owner of the city. Original dialogue ties optional acts of solidarity and memory recovery into the ending.

## Asset provenance

`assets/tile*.png`, `face*.png` and `sky.png` were generated offline from original patterns and pixel drawing instructions. `tools/make_textures.py` reproduces them. Geometry and viewmodels are built by the project's Godot code. Music and sound effects are synthesized in the game. No copyrighted textures, character models, dialogue passages, or audio recordings from Cruelty Squad are included.
