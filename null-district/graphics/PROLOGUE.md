# Chrome & Ash — opening prologue

An original 133.069-second in-engine opening, with ten moving-camera shots, four speaking characters and 21 bundled neural voice clips. The screenplay connects the five existing chapters without changing their objective chains.

## Story and cast

In 2097, Sable owns the city's infrastructure and has signed a contract with the Ashen Court beyond the Veil. Dead citizens' memories power its network; death does not cancel a debt. At midnight, the Rainline array will transfer the souls named on its blacklist to the Court, including Courier 09. Erasing the list and severing the broadcast stops this shipment.

**Courier 09** is an armed delivery runner in patched dark streetwear and a maroon scarf. Sable restored the courier's body after a crash and promised to clear the restoration debt for one last delivery. Its receipt reveals the courier actually died in the crash. Vesper secretly placed Mournfang in the package, choosing a courier able to cross Sable checkpoints; opening it becomes the first act of defiance. **Vesper**, a murdered network engineer whose mind remains trapped in the infrastructure, appears as a cyan wireframe hologram and offers a way out. **Sable Customer Care** speaks through municipal announcements: composed, transactional and indifferent. **The Ash Regent** is the crowned, armored sovereign who claims ownership of everything that dies.

Mournfang was forged by the dead to break their binding oaths. Vesper guides the courier to steal the rift key in Neon Schism, sever the cathedral covenant, recover the master blacklist from Kabuki's broker, ride Shin-Kuro's sealed cargo route into Rainline and erase the names before severing the transmission. Each location now supplies a concrete part of that plan. The final campaign completion text now reflects freeing the names and ending the shift.

## Sequence

1. Rain-soaked city approach and Sable's afterlife advertisement.
2. Descent into the cathedral, the Court's contract and the Regent's claim.
3. A continuity-processing room: six captives, cages, cables and animated soul transfers.
4. The courier's deceased-account receipt.
5. Vesper's intercepted signal and the midnight deadline.
6. Mournfang's reveal, moving silver sheen and hanging chain charms.
7. The night market and stolen blacklist.
8. The dead-line terminal and the courier's route to Rainline.
9. The Ash Regent at the broadcast array, flanked by corporate guards.
10. Return to the lower stacks and the Chrome & Ash title / Take Control prompt.

The film uses the existing PSX raster, affine materials, neon architecture and refined character geometry. Captions and speaker labels are rendered clearly over letterbox bars. Original procedural low-frequency drones, pulse accents and sparse bell notes accompany the dialogue. Character mouth openings follow the actual voice amplitude; breathing, head movement, gestures, hologram drift, rain and soul motion add activity to the staged scenes.

## Playback and input

- The first deployment into Chapter 01 plays the opening once per application session. Restarts, resumes and subsequent chapter starts enter gameplay directly.
- **Watch Opening** on the menu replays it without changing the chosen starting chapter. A replay returns to the menu.
- **Space** pauses/resumes. Losing focus or hiding the application pauses playback; loading honors a pause requested during preparation. **M** toggles audio. The visible buttons expose the same actions.
- **Enter**, **Esc**, or Skip leaves early. Natural completion holds the final title until the player selects Take Control; the click/key gesture captures the mouse and starts Chapter 01.
- Gameplay controls, AI, damage, objectives and mission timers are frozen during the opening. The player's health, equipment and ammunition start fresh on handoff.

The controller uses a monotonic cinematic clock, rather than the gameplay frame-delta clamp, so voiced clips and captions remain synchronized under variable rendering load. Late frames start a voice at the appropriate offset. Pause/resume also respects the current offset. All audio is decoded from local Ogg assets; it does not depend on Windows speech services, a browser connection or a remote API. Captions remain available if audio is disabled.

## Files and ownership

`systems/prologue-script.js` is the screenplay and camera plan. `prologue-voices.js` contains actual encoded clip lengths. `prologue-timeline.js` computes non-overlapping shots/cues. `graphics/prologue.js` manages playback, captions, voices and score. `prologue-set.js` creates seven isolated sets and their cast. They reuse the five environment builders and base palettes without mutating gameplay objects. Temporary geometry, text maps, stage materials, audio sources and signage are disposed on exit; shared player/world materials and textures remain protected.

The dialogue is original. Version 1.20 replaces all Flite speech with Kokoro neural synthesis: four stock voices, clear conversational phrasing, natural timing and light character-specific EQ/reverb. Courier and Vesper retain full speech detail; Customer Care stays composed, and the Regent speaks deliberately without an artificial pitch drop. These are synthetic performances, not recordings by human actors. No named person's voice is cloned. [Build setup, cast and provenance](NEURAL-VOICES.md).

## Verification

The prologue test checks timeline boundaries, all four characters and 21 decoded offline clips, input/AI freeze, pause/resume/mute, skipping, resource cleanup, restart bypass and chapter-preserving replay. Full playback checks every shot, all 21 actual voice starts and the natural final-title state. Desktop verification also plays the first bundled voice inside the packaged custom protocol, then checks normal movement, equipment, reload, pause/restart and fullscreen. Other checks cover menu bounds, all five chapter routes, pistol combat and blood/healing smoke. Windows is cross-built and its embedded payload checked; execution tests run on Linux.
