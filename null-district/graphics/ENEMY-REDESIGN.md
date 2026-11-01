# 1.21 — heroic enemy silhouettes and angular heads

Seven combat humans now use `enemy-anatomy.js` instead of the civilian body helper. The direction combines exaggerated fantasy shoulder/waist ratios and enlarged hands/boots with the flat planes of PS1/early-PS2 characters. These are original authored meshes, not World of Warcraft assets. The existing grime maps, neon accents, PSX world pass and actual material UV warping remain.

`angularShell` joins bevelled rectangular cross-sections. It supplies flat skull crowns, temple walls, cheek ledges, square mandibles and angular boot soles. A separate sculpted face defines the brow, bridge, projecting nose, cheeks, lips and chin. Side strips join the facial planes into the skull so the side silhouette is continuous. Eyes sit under substantial brows, and ears/hair are angular rather than round primitives. Helmets and hoods have new bevelled/pointed shells; the Ashbound knight has a closed ridged faceplate.

## Roles

- Sable: broad tactical torso, hard shoulder/collar planes and reinforced boots.
- Razor: narrower waist, exposed polygonal arms, pink crest and shoulder spikes.
- Netrunner: leaner frame, long coat and distinct cybernetic eye/halo.
- Bastion: wider body, deep armored vest, enlarged shoulder shells and amber slit visor.
- Knight: powerful frame, black underlayers, angular plate shoulders, horns and pointed face armor.
- Arbalist: leather layers, hood and a narrower ranged-combat frame.
- Warlock: gaunt/taller build, pale skin, continuous dark robes and a peaked cowl.
- Hound: planar skull, long upper/lower bone jaws, angular body and broad clawed paws.
- Revenant: hollow angular skull, brow sockets, nasal opening, squared jaw and long hands.
- Gargoyle: heavier stone chest/shoulders, angular head, enlarged hands/claws and planar feet; articulated wings remain.

The civilian helper used by Courier/Vesper/captives remains separate. Cinematic enemies, including the Regent, use the redesigned combat models. The 1.20 screenplay and neural voices are unchanged. Player gear and body models are unchanged.

## Animation and gameplay

Existing leg/knee/arm groups and forearm attachment anchors survive. Held enemy weapons/shields/staffs remain attached to the same animated forearms, while chains/halos/wings keep their independent transforms. Per-role scale profiles differentiate builds without replacing the rig. Combat health, damage, speed, windups, projectile tuning and objective logic are unchanged. Bullet and sword hits still test the actual rendered enemy meshes. Movement uses the existing collision rules.

The character chisel/batching step still preserves articulated joints and independent props. Human models remain about 9.3–10.5k triangles, and monsters about 2.6–3.9k, below the existing 14k budget. No world texture/raster degradation is used to accommodate the new art.

## Checks

The roster test renders all ten real models, checks distinct geometry, explicit angular skull meshes, heroic shoulder frames, silhouette limits, triangle budgets, animated legs and attached props. Front/three-quarter/side portrait captures check the facial profiles. Existing tests cover actual pistol hits/blood, smoking/healing, all five chapter routes/restarts, cutscene loading/controls and packaged offline desktop gameplay. Windows is cross-built and its archive checked; desktop execution tests run on Linux.
