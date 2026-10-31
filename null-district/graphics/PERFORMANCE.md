# 1.19 — rendering and update optimization

The release retains the current 480-line world raster, native-resolution gear, polygon counts, textures, affine interpolation, near-ground relief, ten-second UV intoxication and all combat/mission tuning.

## Changes

`rigid-batches.js` merges opaque leaf meshes sharing a material within the same rigid animation node. It preserves joints, attachment anchors, collision meshes, moving magazines/bolts, diagnostic barrel meshes, animated runes/gems and materials with local-position sheen. Geometry remains unindexed with the original position/UV/color data. Normals preserve the PSX shader's historical model-matrix convention and native equipment's inverse-transpose convention, including nonuniform scaling. No mesh simplification or texture reduction is performed. Existing enemy batching remains as before.

Only the selected weapon is mounted in the foreground scene. Hidden equipment receives neither detailed pose/IK work nor renderer matrix traversal. Its model, ammo and state remain available for immediate reattachment. Weapon clocks and gameplay cooldowns continue independently. Static architecture caches local matrices; texture-changing advertisements continue animating. Moving objectives, enemies and effects remain dynamic.

Wall raycasts reuse a chapter-local collider list; LOS, sword obstruction and projectile queries bound the ray to their actual relevant distance and reset the shared ray afterward. Bullet collision still uses original collider/enemy meshes. HUD and focus text is assigned only when the displayed value changes. The foreground projection matrix updates only on aspect changes.

Smoke uses one persistent 72-instance native foreground mesh, one geometry/material and per-instance fade values. Particle positions, curl, growth, rotation, lifetimes, emission timing and population cap remain. All smoke shares the same color and uses depth-disabled alpha compositing; the fade/motion still belongs to each particle. Clear/pause/restart sets the instance count to zero without repeated mesh/material allocation and disposal.

## Measurements

Chromium in the managed Linux environment, 1280×720, Chapter 01 spawn, all four equipment slots; twelve sampled frames per slot after startup. Raw samples: `tests/benchmarks/1.18.json` and `1.19.json`. `tests/performance.cjs` reproduces sampling and a short CPU profile. Representative whole-frame draw calls, including world/post/gear:

| Weapon | 1.18 | 1.19 | Reduction |
| --- | ---: | ---: | ---: |
| K-09 | 511 | 435 | 15% |
| Mournfang | 579 | 478 | 17% |
| Night Leaf | 492 | 430 | 13% |
| K-13 | 530 | 430 | 19% |

These are live-scene samples; visibility, enemy positions and smoke alter counts. CPU submission durations and profile samples are noisy in this environment and are not presented as a reliable FPS gain. Windows hardware performance has not been measured. Geometry can be culled at a different batch granularity; no authored polygons are removed.

## Verification

- `batches.cjs`: six world/native animated poses, same 612 rendered triangles, 54 to 14 draw calls; world frames byte-identical, native differences at most one raster-edge pixel. Independent prop transforms survive.
- `smoke-batch.cjs`: 72 live visible particles, one smoke draw (three total with presentation), more than 60,000 changed framebuffer pixels and exact restoration after clear; no shader errors.
- Existing checks cover all five chapter objective/exit routes and reloads, 38 mission tasks, ten enemy archetypes, 223 weapon poses, pistol reload/contact/art, blood/healing, affine/foreground separation, actual ten-second material UV motion and offline packaged desktop controls.
- A full real-input campaign soak was started and stopped in Chapter 01 in favor of focused route/mission/combat coverage; a complete campaign playthrough is not claimed for this release.
