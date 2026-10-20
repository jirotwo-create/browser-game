# NULL DISTRICT — Blackout Protocol

A standalone cyberpunk FPS prototype built from scratch. It lives in its own `null-district/` folder and does not modify or replace Dreadwake.

## Play

Requires a desktop browser with WebGL and a keyboard/mouse. No installation, API keys, CDN, or build required.

```sh
cd null-district
python3 -m http.server 4180
```

After extracting `null-district.zip` or cloning this branch, run the commands above from the folder containing `null-district/`. On Windows, use `py -m http.server 4180` if `python3` is unavailable. If Node.js is installed, `npm start` inside the game folder also starts the server.

Open **http://localhost:4180** in your browser. Serve the game over HTTP; opening `index.html` directly from disk will not load the JavaScript modules.

The server uses port **4180**, separate from Dreadwake's port 4173. Open the served index in a browser and select **Enter the district**. Pointer capture enables mouse aim; if capture is unavailable, hold the right mouse button and drag to look. Arrow keys also turn and move.

- **WASD** move, **mouse** aim, **left click / hold** shoot.
- **Shift** sprint, **Space** jump, **R** reload, **Escape** pause.
- Clear the red-visored sentries. Blue squares on the minimap mark data relays. Approach a relay, clear nearby guards, and **hold E** to breach it.
- Extract all three relays, return to the lime uplink at the starting end of the avenue, and press **E** to finish.
- Rotating cross-marked crates restore 40 health when walked over. Ammunition reserves are unlimited; magazines hold 24 rounds.
- The pause and end screens let you restart. Progress lasts for the current run only.

## Rendering

Original procedural 64×64 textures, low-poly meshes, nearest-neighbor sampling, a low-resolution framebuffer, quantized color/dithering, vertex snapping, distance fog, rain and optional CRT overlays. The custom shader cancels perspective correction for UV interpolation (`uv * clip.w`, divided by interpolated `clip.w`) to produce affine texture warping. All graphics and synthesized audio work offline. Three.js 0.180.0 is bundled under its MIT license in `vendor/`.

## Validate

```sh
npm run check
node tests/smoke.cjs
node tests/mission.cjs
```

Start the server first. Browser tests use the environment's `/usr/bin/chromium` and Playwright from `/workspace/dreadwake-tools`. They exercise startup, controls, firing, reloading, pause and reset. The mission test plays through combat, relay breaches and extraction using real keyboard/mouse events; it reads diagnostics without changing game state. Set `PLAYWRIGHT_MODULE` to another Playwright installation if needed. The prototype is one handcrafted mission, not a full campaign; touch controls and multiplayer are not implemented.
