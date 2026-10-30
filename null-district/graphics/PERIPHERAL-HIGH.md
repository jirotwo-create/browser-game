# 1.16 — Night Leaf peripheral spirals

A completed exhale starts ten seconds of world distortion, including puffs at full health. The existing 25-HP heal, 1.45-second exhale point, 2.8-second use animation and twelve-second cooldown remain. Interrupted inhales do not trigger it; dead players receive neither healing nor the effect.

Strength eases in over 0.35 seconds, stays at full intensity through 8.5 seconds, then fades over the final 1.5 seconds. The timer uses gameplay time. Holstering preserves it, pause freezes and hides it, and chapter/restart resets clear it.

The world presentation shader uses aspect-correct polar coordinates. Two independently timed angular waves create peripheral vortices; a traveling radial wave makes surfaces breathe, with an additional cross-axis ripple and small color separation. No camera input is required. A smooth radial mask rises from 0.16 to 0.60 screen-height units from the crosshair; angular displacement uses its square to protect the middle. The focus region receives only a subpixel ripple and the innermost crosshair area is unchanged. Peripheral samples move tens of pixels instead of the previous two-pixel effect. Outer UVs reflect to avoid stretched border streaks.

The normal PSX affine interpolation, near-ground relief, raster resolution and RGB555 pass remain. Distortion runs on the world image before native hands/body/gear/smoke and the HUD. The effect follows screen position: enemies near the crosshair stay readable, while enemies at the edge share the stronger peripheral distortion. Camera, aim ray, FOV, movement, AI and damage remain unchanged. Zero strength restores the original output exactly.

`tests/firearm-high.cjs` checks ten-second timing, sustained strength/fade, healing lifecycle, actual GPU animation with a stationary camera, protected center/native gear, large peripheral displacement and exact restoration. Its coordinate probe temporarily bypasses RGB555 only in the fixture to measure source sample distance without color quantization error. Gameplay checks cover full-health puffs, holstering, steady aim/ammo and pause/resume. Desktop smoke tests check the packaged effect as well.
