extends Node2D
var g
var font=ThemeDB.fallback_font
var dialogue_title=""
var dialogue_text=""
const LIME=Color('#dcf52d')
const PINK=Color('#ff78a7')
const INK=Color('#241130')
const WHITE=Color('#fff3c6')
func _ready():texture_filter=CanvasItem.TEXTURE_FILTER_NEAREST
func text(s,pos,size=18,col=WHITE):draw_string(font,pos,str(s),HORIZONTAL_ALIGNMENT_LEFT,-1,size,col)
func center(s,y,size=24,col=WHITE):
 var w=font.get_string_size(str(s),HORIZONTAL_ALIGNMENT_LEFT,-1,size).x;text(s,Vector2((1280-w)/2,y),size,col)
func rect(at,size,col):draw_rect(Rect2(at,size),col)
func panel(r,col=INK,border=LIME):draw_rect(r,col);draw_rect(r,border,false,3)
func draw_wrapped(s,pos,width,size=20,col=WHITE):
 var line="";var y=pos.y
 for word in str(s).split(" "):
  if font.get_string_size(line+word,HORIZONTAL_ALIGNMENT_LEFT,-1,size).x>width:
   text(line,Vector2(pos.x,y),size,col);line="";y+=size*1.48
  line+=word+" "
 text(line,Vector2(pos.x,y),size,col)
 return y
func _input(e):
 if e is InputEventMouseButton and e.pressed and e.button_index==MOUSE_BUTTON_LEFT:
  handle_tap(get_global_mouse_position())
func handle_tap(m):
  if g.state=="title":
   if Rect2(95,565,380,60).has_point(m):
    if FileAccess.file_exists(g.ROOT_SAVE):g.load_game()
    else:g.new_game()
   elif Rect2(95,640,380,45).has_point(m):g.new_game()
  elif g.state=="ending":
   for i in range(3):
    if Rect2(76+i*386,300,355,265).has_point(m):g.finish_game(i)
func _draw():
 draw_frame()
 if g.state=="title":draw_title();return
 draw_play()
 match g.state:
  "pause":draw_pause()
  "map":draw_map()
  "journal":draw_journal()
  "dialogue":draw_dialogue()
  "fish":draw_fish()
  "ending":draw_ending()
  "dead":draw_dead()
  "won":draw_won()
  "help":draw_help()
 if g.damage_flash>0 and g.state=="play":
  draw_rect(Rect2(24,30,1232,704),Color(1,0.05,0.25,g.damage_flash*0.5))
 for i in range(g.notices.size()):
  var n=g.notices[i]
  var at=Vector2(360,270-i*28) if g.mobile_enabled else Vector2(250,675-i*28)
  panel(Rect2(at,Vector2(680 if g.mobile_enabled else 780,26)),Color('#332039'),Color('#653e6f'))
  text(n.text,at+Vector2(10,18),14,n.color)
func draw_frame():
 var tex=load("res://assets/tile1.png")
 draw_texture_rect(tex,Rect2(0,0,1280,30),true)
 draw_texture_rect(tex,Rect2(0,734,1280,66),true)
 draw_texture_rect(tex,Rect2(0,30,24,704),true)
 draw_texture_rect(tex,Rect2(1256,30,24,704),true)
 draw_rect(Rect2(22,28,1236,708),Color('#ccea41'),false,3)
 for i in range(15):
  var x=i*91+13
  draw_circle(Vector2(x,14),8,INK);draw_circle(Vector2(x,14),3,LIME)
  draw_line(Vector2(x,749),Vector2(x+25,790),Color('#57294e'),5)
 text("GORBINO'S QUEST // NULL DIVIDEND // EMPLOYEE-OWNED SUFFERING",Vector2(35,20),13,Color('#f6ff98'))
 draw_rect(Rect2(27,739,1226,55),Color(0.15,0.04,0.19,0.9))
 if g.mobile_enabled:
  text("TOUCH EDITION / JOYSTICK MOVE / SWIPE LOOK / USE TO TALK",Vector2(32,759),15,WHITE)
 else:
  text("WASD MOVE / MOUSE FIRE / SPACE JUMP / SHIFT SPRINT / F DASH / Q AUDIT / E USE",Vector2(32,759),14,WHITE)
  text("TAB CITY MAP / J QUESTS / T TRACK / R RELOAD / 1-5 WEAPONS / F1 HELP / ESC PAUSE",Vector2(32,785),14,LIME)
func draw_title():
 draw_rect(Rect2(24,30,1232,704),Color(0.17,0.02,0.23,0.65))
 panel(Rect2(64,72,730,643),Color(0.17,0.04,0.23,0.92),PINK)
 text("CONSUMER NOTICE: YOU HAVE BEEN RECALLED",Vector2(94,115),18,LIME)
 text("GORBINO'S",Vector2(88,221),84,LIME)
 text("QUEST",Vector2(91,315),100,PINK)
 panel(Rect2(95,350,650,48),Color('#98bc25'),Color('#f1f349'))
 text("N U L L   D I V I D E N D   /   3 D",Vector2(111,382),27,INK)
 draw_wrapped("A living city. A missing childhood. A divine error in the accounts. You have come to collect.",Vector2(95,446),610,25,WHITE)
 text("FIRST-PERSON / OPEN DISTRICT / QUESTS / SIDE JOBS",Vector2(95,537),17,PINK)
 panel(Rect2(95,565,380,60),LIME,PINK)
 text(("TAP / " if g.mobile_enabled else "ENTER / ")+("CONTINUE" if FileAccess.file_exists(g.ROOT_SAVE) else "BECOME EMPLOYABLE"),Vector2(114,603),23,INK)
 panel(Rect2(95,640,380,45),Color('#6a235a'),PINK)
 text("NEW GAME" if g.mobile_enabled else "N / NEW GAME",Vector2(114,670),21,WHITE)
 # Asymmetric ad-face, fabricated from low resolution texture rather than polished vector art.
 draw_texture_rect(load("res://assets/face3.png"),Rect2(878,205,270,315),false)
 panel(Rect2(848,543,325,94),Color('#e6ed52'),PINK)
 draw_wrapped("YOUR BODY IS YOUR RECEIPT. PLEASE DO NOT DISCARD.",Vector2(867,573),290,20,INK)
 text("Unofficial fan interpretation / original art, world and systems",Vector2(823,697),12,WHITE)
func draw_play():
 # Lumpy biopunk health gland. Readable information sits inside an ugly interface.
 var points=PackedVector2Array()
 for i in range(32):
  var a=i*TAU/32;var r=61+sin(i*1.7)*7
  points.append(Vector2(88,108)+Vector2(cos(a)*r,sin(a)*r*0.77))
 draw_colored_polygon(points,Color('#a3ce3e'));draw_polyline(points,Color('#fa87a1'),5)
 text(str(int(g.hp)),Vector2(57,119),40,INK)
 text("FLESH / "+str(int(g.max_hp)),Vector2(45,144),12,INK)
 panel(Rect2(1051,48,177,78),Color('#30193f'),PINK)
 text("%02d / %s"%[g.magazines[g.equipped],"∞" if g.equipped==0 else str(g.reserves[g.equipped])],Vector2(1068,88),29,LIME)
 text("RELOADING" if g.reload_t>0 else g.weapon_short[g.equipped],Vector2(1068,112),14,PINK)
 panel(Rect2(337,44,600,64),Color(0.14,0.07,0.2,0.9),Color('#9e658e'))
 text(g.quest_names[g.tracked]+(" / COMPLETE" if g.quest_done(g.tracked) else ""),Vector2(350,65),15,LIME)
 draw_wrapped(g.quest_description(g.tracked),Vector2(350,87),568,14,WHITE)
 var reg=g.district()
 text(reg.name,Vector2(43,303) if g.mobile_enabled else Vector2(43,717),16,reg.color)
 text("SCRIP %03d    MEMORIES %d/8    FREED %d/3"%[g.credits,g.secrets,g.freed.size()],Vector2(43,263) if g.mobile_enabled else Vector2(820,717),14,LIME)
 var centerpoint=Vector2(640,382)
 var crosscol=PINK if g.hit_t>0 else LIME
 draw_line(centerpoint-Vector2(12,0),centerpoint-Vector2(4,0),crosscol,2)
 draw_line(centerpoint+Vector2(4,0),centerpoint+Vector2(12,0),crosscol,2)
 draw_line(centerpoint-Vector2(0,12),centerpoint-Vector2(0,4),crosscol,2)
 draw_line(centerpoint+Vector2(0,4),centerpoint+Vector2(0,12),crosscol,2)
 draw_circle(centerpoint,1.5,crosscol)
 if g.hit_t>0:
  for side in [-1,1]:
   draw_line(centerpoint+Vector2(side*5,5),centerpoint+Vector2(side*10,10),PINK,2)
   draw_line(centerpoint+Vector2(side*5,-5),centerpoint+Vector2(side*10,-10),PINK,2)
 if g.interact_target>=0 and g.state=="play":
  var item=g.items[g.interact_target]
  panel(Rect2(330,550,620,56),Color(0.16,0.04,0.2,0.92),LIME)
  center(("USE / " if g.mobile_enabled else "[E] ")+item.label,585,19,LIME)
 if g.pulse_t>0:
  draw_rect(Rect2(27,33,1226,698),Color('#7be9d0'),false,3)
  for e in g.enemies:
   if e.alive and not g.camera.is_position_behind(e.body.position):
    var pos=project(e.body.position+Vector3.UP*2.5)
    if Rect2(30,35,1220,690).has_point(pos):text("×",pos,25,PINK)
  for item in g.items:
   if item.kind=="memory" and not item.done and not g.camera.is_position_behind(item.pos):
    var pos=project(item.pos+Vector3.UP)
    if Rect2(30,35,1220,690).has_point(pos):text("MEMORY",pos,14,Color('#d9a2ff'))
 for item in g.objective_items():
  var point=item.node.global_position+Vector3.UP*4
  if g.camera.is_position_behind(point):continue
  var pos=project(point)
  if Rect2(75,165,1130,400).has_point(pos):
   draw_polyline(PackedVector2Array([pos+Vector2(0,-6),pos+Vector2(6,0),pos+Vector2(0,6),pos+Vector2(-6,0),pos+Vector2(0,-6)]),LIME,2)
   text(str(int(g.player.position.distance_to(point)))+"m",pos+Vector2(10,5),13,LIME)
 if not g.mobile_enabled:
  text("AUDIT READY" if g.pulse_cd<=0 else "AUDIT %.0fs"%g.pulse_cd,Vector2(48,192),13,Color('#81fbd0'))
  text("DASH READY" if g.dash_cd<=0 else "DASH %.1fs"%g.dash_cd,Vector2(48,213),13,LIME)
 for e in g.enemies:
  if e.boss and e.alive:
   panel(Rect2(380,125,520,26),INK,PINK)
   draw_rect(Rect2(383,128,514*max(0,e.hp/e.max),20),PINK)
   text("THE FINAL BENEFICIARY",Vector2(504,171),17,LIME)
 draw_compass()
func project(pos):
 return g.screen.position+g.camera.unproject_position(pos)*(g.screen.size/Vector2(g.viewport.size))
func draw_compass():
 var heading=fposmod(rad_to_deg(-g.yaw),360)
 text("N" if heading<45 or heading>315 else ("E" if heading<135 else ("S" if heading<225 else "W")),Vector2(630,136),17,LIME)
func overlay(title,sub=""):
 draw_rect(Rect2(24,30,1232,704),Color(0.1,0.015,0.15,0.93))
 center(title,116,36,LIME)
 if sub!="":center(sub,152,17,PINK)
func draw_pause():
 overlay("YOUR BREAK HAS BEEN MONETIZED","Progress saved. You can leave the game and continue later.")
 if g.mobile_enabled:return
 center("ENTER / ESC — RETURN TO THE CITY",303,27,WHITE)
 center("F9 — RESTORE LAST SAVE",358,23,PINK)
 center("M — SOUND "+("OFF" if g.muted else "ON"),412,21,LIME)
 center("F3 — REDUCED EFFECTS "+("ON" if g.reduced else "OFF"),456,21,LIME)
 center("F11 — FULLSCREEN    /    F1 IN GAME — HANDBOOK",510,20,WHITE)
 center("REASSEMBLIES %d   /   HOSTILES %d   /   SCRIP %d"%[g.metadata.deaths,g.kills,g.credits],610,18,PINK)
func draw_dialogue():
 draw_rect(Rect2(24,30,1232,704),Color(0.05,0.01,0.08,0.45))
 panel(Rect2(70,388,1140,268),Color('#321d3d'),PINK)
 draw_texture_rect(load("res://assets/face2.png"),Rect2(89,409,156,191),false)
 text(dialogue_title,Vector2(270,435),26,LIME)
 draw_wrapped(dialogue_text,Vector2(270,477),897,23,WHITE)
 text("TAP TO CLOSE — QUEST JOURNAL UPDATED" if g.mobile_enabled else "[E] / [ESC] CLOSE — QUEST JOURNAL UPDATED",Vector2(270,632),16,PINK)
func draw_map():
 overlay("NULL DIVIDEND / CIVIC ANATOMY","NORTH UP / BACK closes / TRACK NEXT JOB changes markers" if g.mobile_enabled else "NORTH UP / TAB or ESC close / T cycle tracked quest")
 var origin=Vector2(605,428);var scale_value=1.8
 var area=Rect2(origin-Vector2(252,252),Vector2(504,504))
 panel(area,Color('#281a3d'),PINK)
 for r in g.obstacles:
  var box=Rect2(origin+r.position*scale_value,r.size*scale_value)
  draw_rect(box,Color('#68556a'))
 for x in [-48,0,48]:draw_line(origin+Vector2(x,-137)*scale_value,origin+Vector2(x,137)*scale_value,Color('#7a8f52'),5)
 for z in [-48,40,106]:draw_line(origin+Vector2(-137,z)*scale_value,origin+Vector2(137,z)*scale_value,Color('#7a8f52'),5)
 for r in g.regions:
  var pos=origin+r.pos*scale_value
  draw_circle(pos,4,r.color)
  draw_wrapped(r.name,pos+Vector2(-55,-17),132,11,r.color)
 for item in g.items:
  if item.done:continue
  if item.kind in ["npc","clinic","fish","arena","jump"]:
   var pos=origin+Vector2(item.pos.x,item.pos.z)*scale_value
   text({"npc":"?","clinic":"+","fish":"F","arena":"A","jump":"↑"}[item.kind],pos,18,Color('#87e0db'))
 for item in g.objective_items():
  var pos=origin+Vector2(item.pos.x,item.pos.z)*scale_value
  draw_circle(pos,7,LIME);draw_circle(pos,3,INK)
 var p=origin+Vector2(g.player.position.x,g.player.position.z)*scale_value
 draw_circle(p,7,PINK)
 draw_line(p,p+Vector2(-sin(g.yaw),-cos(g.yaw))*16,PINK,3)
 text("YOU",p+Vector2(8,0),13,PINK)
 draw_wrapped(g.quest_names[g.tracked],Vector2(882,250),290,24,LIME)
 draw_wrapped(g.quest_description(g.tracked),Vector2(882,333),290,20,WHITE)
 draw_wrapped("? PEOPLE / + CLINIC / F FISH / A ARENA / ↑ JUMP PAD / ● TRACKED OBJECTIVE",Vector2(882,493),290,17,PINK)
 text("N",origin+Vector2(-5,-261),20,LIME)
func draw_journal():
 overlay("QUEST LEDGER / UNREALIZED LIABILITIES","TAP A DISCOVERED JOB TO TRACK IT / BACK closes" if g.mobile_enabled else "J or ESC close / T change tracked quest / TAB opens city map")
 var index=0
 for id in g.quests:
  var done=g.quest_done(id);var discovered=g.quests[id]>0
  var y=185+index*69
  panel(Rect2(100,y,1080,61),Color('#33203b'),LIME if id==g.tracked else Color('#713f71'))
  text(("✓ " if done else ("► " if id==g.tracked else "○ "))+g.quest_names[id],Vector2(117,y+24),18,LIME if discovered else Color('#9a7c9a'))
  desc_line(g.quest_description(id) if discovered or id=="main" else undiscovered_hint(id),Vector2(140,y+47),15,WHITE if discovered else Color('#be9eb8'))
  index+=1
func desc_line(s,pos,size,col):text(s,pos,size,col)
func undiscovered_hint(id):
 match id:
  "union":return "A steward in Civic Wound is trying to renegotiate the human condition."
  "courier":return "Dr. Nil's clinic is waiting for a delivery."
  "broadcast":return "A voice beside the canal wants to use the air without permission."
  "arena":return "The northern arcade is conducting a performance review."
  "fish":return "There is still water in the Forgotten Canal. Something lives in it."
 return "Small impossible objects remember the people this city consumed."
func draw_fish():
 overlay("THE LAST HONEST JOB","Tap when the needle enters the pink target. Three catches unlock the CYST mortar." if g.mobile_enabled else "Press E when the moving needle enters the pink target. Three catches unlock the CYST mortar.")
 center("IMPOSSIBLE FISH %d / 3"%g.fish_caught,280,30,LIME)
 var rect=Rect2(250,360,780,65)
 panel(rect,Color('#3c284e'),LIME)
 var target_x=rect.position.x+g.fish_target*rect.size.x
 draw_rect(Rect2(target_x-rect.size.x*0.15,363,rect.size.x*0.3,59),PINK)
 var cursor=(sin(g.fish_clock*2.5)+1)/2
 draw_line(Vector2(rect.position.x+cursor*780,345),Vector2(rect.position.x+cursor*780,440),LIME,6)
 center("TAP TO REEL IN" if g.mobile_enabled else "E / REEL IN",504,26,LIME)
 center("BACK / LEAVE THE WATER" if g.mobile_enabled else "ESC / LEAVE THE WATER",562,18,WHITE)
func draw_ending():
 overlay("THE ENGINE HAS A QUESTION","For the first time, it does not offer a recommended answer.")
 var titles=["BECOME THE OWNER","BREAK THE MACHINE","RETURN THE WORLD"]
 var descriptions=["Take the chair. Own the city and everything it can feel. The system survives wearing your face.","End the divine accounting. Tomorrow will be difficult, uncertain, and finally unsponsored.","Return the stolen memories and free the people inside the system. Needs six memories and three freed workers."]
 for i in range(3):
  var rect=Rect2(76+i*386,300,355,265)
  panel(rect,Color('#452045'),PINK)
  text("0"+str(i+1),rect.position+Vector2(24,42),32,LIME)
  draw_wrapped(titles[i],rect.position+Vector2(24,90),310,25,LIME)
  draw_wrapped(descriptions[i],rect.position+Vector2(24,155),310,19,WHITE)
 center("TAP A CARD" if g.mobile_enabled else "1 / 2 / 3 OR CLICK A CARD",635,20,PINK)
func draw_dead():
 overlay("YOUR BODY HAS BEEN REPOSSESSED","The city regrets the inconvenience to its accounts.")
 center("TAP TO REASSEMBLE AT YOUR LAST CLINIC" if g.mobile_enabled else "ENTER / REASSEMBLE AT YOUR LAST CLINIC",340,28,PINK)
 center("All quests and discoveries retained. Reconstruction costs 10 scrip.",420,21,WHITE)
 center("COVER MATTERS. AUDIT SIGHT STUNS NEARBY ENEMIES. HEADSHOTS HIT HARDER.",535,16,LIME)
func draw_won():
 var titles=["THE SAME CITY, A NEW OWNER","AN UNSPONSORED TOMORROW","NO ONE LEFT INSIDE THE WALLS"]
 var endings=["Your portrait appears above every terminal. For a moment, nobody notices the difference. You have won everything the city knows how to give.","The engine stops. A thousand doors unlock. Nobody knows what to do next. Then someone laughs without being asked. It is a small and terrible beginning.","The city unfolds into people. Memories fall like rain. You give away your name last. Someone calls you friend. It fits better."]
 overlay(titles[g.ending],"THE DIVIDEND HAS BEEN PAID")
 draw_wrapped(endings[g.ending],Vector2(260,284),760,27,WHITE)
 center("%d HOSTILES / %d MEMORIES / %d FREED WORKERS"%[g.kills,g.secrets,g.freed.size()],520,22,PINK)
 var complete=0
 for id in g.quests:
  if g.quest_done(id):complete+=1
 center("QUESTS COMPLETE %d / 7"%complete,567,22,LIME)
 center("TAP TO RETURN TO TITLE" if g.mobile_enabled else "ENTER / RETURN TO TITLE",650,22,WHITE)
func draw_help():
 overlay("THE DEPARTMENT OF BASIC FUNCTION","BACK returns to the city." if g.mobile_enabled else "F1 opened this handbook. ESC returns to the city.")
 if g.mobile_enabled:
  var lines=["Drag the left joystick to move. Swipe the right side to look around.","Hold FIRE to shoot. Drag on FIRE to adjust aim while firing. AIM toggles focus.","JUMP is held. RUN and DUCK toggle. DASH crosses a short distance safely.","USE talks to people, operates terminals, collects items and opens clinics.","LOAD reloads. The < and > buttons cycle your unlocked weapons.","AUDIT stuns nearby enemies, reveals memories and erases bullets into scrip.","MAP opens the city plan. JOBS opens the journal; tap a discovered job to track it.","The pause menu saves, restores, changes detail, sound and look speed.","Android Back pauses the game or closes a menu. Backgrounding pauses and saves.","Start with Mother of Invoices in the building ahead. Side jobs unlock weapons.","Clinics heal for free and set your respawn point. The pistol has infinite reserves."]
  for i in range(lines.size()):text(lines[i],Vector2(90,223+i*38),20,WHITE if i%2==0 else LIME)
  return
 var lines=["WASD / arrows — move. Mouse — look. Hold LMB — fire. RMB — focus aim.","SPACE — jump. SHIFT — sprint. CTRL — crouch for slower, quieter movement.","F — short collision-safe dash. Q — audit sight: stun minds, erase nearby bullets, reveal memories.","E — interact with NPCs, terminals, supplies, clinics and quest objects.","R — reload. 1–5 / mouse wheel — change weapons. The pistol has infinite reserve ammo.","TAB — city map. J — quest journal. T — cycle active quest and map markers.","F5 — save now. F9 — restore. Clinics heal for free and set your respawn location.","M — mute. F11 — fullscreen. F3 — higher resolution / reduced effects.","Main job: talk to Mother, recover 3 seals, defeat the Beneficiary, use the engine.","Side jobs reward powerful weapons. Look for people, rooftop ramps, the arcade and canal.","Headshots multiply damage. The rail driver penetrates bodies. The siphon steals flesh.","Progress autosaves. A new game overwrites the current save. Death retains completed objectives."]
 for i in range(lines.size()):text(lines[i],Vector2(96,220+i*36),18,WHITE if i%2==0 else LIME)
