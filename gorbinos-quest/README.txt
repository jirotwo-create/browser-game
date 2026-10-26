GORBINO'S QUEST: THE DIVIDEND OF FLESH / v1.0
Unofficial native desktop fan interpretation.

PLAY
Windows 10/11 x86-64: double-click GorbinosQuest.exe.
Standalone executable; no installation, browser, engine, account or network.
Linux x86-64: chmod +x GorbinosQuest.x86_64, then launch it.
Needs a desktop display and OpenGL 3.3 graphics. Executables are unsigned.

CONTROLS
WASD / arrows: move. Mouse: aim. Hold left click: fire.
Space: dash THROUGH bullets to absorb them as money.
Q: switch between SURFACE and UNDERPRINT.
E: interact. 1 / 2 / 3 or click: choose a card.
Esc: pause. Enter: begin/retry/resume. R while paused: new run.
M: mute. F11: fullscreen. F3: reduced effects. C at title: handbook.
Close the window to quit.

YOUR FIRST MINUTE
Clear enemies in BOTH realities. Inactive enemies appear as faint outlines.
When the elevator turns green, approach the north door and press E.
Dash into pink bullets: they become scrip. Five chained absorptions heal 5.
A shop appears after encounter two. A graft costs 20 scrip; leaving heals 15.
Bosses award free grafts. Grafts combine; damage, rate, health, speed, leech
and ricochet upgrades stack. Spread and orbit effects unlock once.
Visit the occupied underprint chair to free a stranger for 12 scrip, once per
floor. Blue memories heal 8 and award 5 scrip. The hidden ending needs nine
memories and three freed strangers. Upgrading yourself competes with kindness.

CONTENT
Six departments / 24 encounters / six escalating audit bosses / four cover
layouts / six department palettes and insignias / two realities / eight graft
types / shops / secrets / three endings / original procedural music and sounds.
A run is intended to take roughly 20–40 minutes; human balance testing has
not established the actual average. Best score, ending count and preferences
persist. There is no mid-run save or permanent upgrade grind.

RESEARCH AND INTERPRETATION
Gorbino's Quest is the fictional in-world game referenced in Cruelty Squad.
Prior familiarity with the absurd playtime and “mind pumping” premise informed
this project; these details were not verified against a primary source here.
The two fan wiki addresses below were attempted but blocked by the session's
network policy. GitHub searches did not yield reliable canonical material.
This is an original interpretation, not a recreation of established gameplay,
visual design or plot, and does not claim 500 actual hours of content.
Reference targets, not successfully retrieved:
https://crueltysquad.wiki.gg/wiki/Gorbino%27s_Quest
https://crueltysquad.fandom.com/wiki/Gorbino%27s_Quest

DESIGN
A cute creature explores the machinery behind compulsory happiness. The
surface is the company's promise; the underprint is its concealed cost.
Movement and aiming anchor combat. Absorption rewards entering danger.
Grafts ask how you want to play. The economy asks who should get the money.
Three endings ask what winning means inside that economy.
All art, code, music, mechanics and dialogue were made for this fan project.
Cruelty Squad and its fictional Gorbino's Quest belong to their creators.
No affiliation or endorsement is claimed. Godot uses the included MIT license.

VALIDATION
Godot 4.6.3. The packaged Linux executable ran in a virtual X11 display with
OpenGL compatibility graphics. Title and gameplay screenshots were inspected.
291 automated checks cover all 24 rooms and three endings, actual projectile
hits, phase isolation, ricochets, movement collision, dash absorption, damage
immunity, graft effects, shop economy and single-use secrets. Progression tests
clear rooms programmatically, so they do not prove human completion or balance.
Windows PE x86-64 export checked, but execution on Windows is untested.
A Godot ObjectDB cleanup warning occurs on automated exit; no gameplay script
errors were observed. No network access or telemetry is used by the game.

SOURCE
The source ZIP contains an editable Godot project, verification and capture
scripts. Open project.godot in Godot 4.6.3.
Checks: godot --headless --path path/to/project --script verify.gd
Export presets reference custom build-template paths. Replace these with your
matching templates when rebuilding. MIT license applies to original code;
third-party names and referenced game properties remain with their owners.
