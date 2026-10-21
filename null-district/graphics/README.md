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

`models.js` constructs angular meshes from chamfered and tapered eight-sided sections, independent flat-shaded triangles and face UVs. The SABLE patrolman has 784 triangles; the K09 and its modeled arms have 388. Buildings have tapered upper stories, polygonal tanks and ducts, awnings, rooftop antennae and shuttered shops. Paletted posters, worn metal, hazard paint and tiled pavement provide patterns that make affine distortion legible.

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

`tests/mission.cjs` exercises real-input combat, all three relay breaches and extraction. `tests/desktop.cjs` validates local packaged module loading, the affine comparison control, movement, mouse capture, firing, reloading, pause/restart, fullscreen, renderer isolation and offline operation. Set `NULL_DISTRICT_URL` to use another preview port; set `PLAYWRIGHT_MODULE` to use another Playwright installation.
