extends Node2D
# Each finger keeps its owner until lifted; movement, looking and firing are independent.
var g
var fingers: Dictionary = {}
var move = Vector2.ZERO
var held = {"fire":false,"jump":false}
var sprint = false
var crouch = false
var aiming = false
var sensitivity_scale = 1
var joystick_center = Vector2(155,580)
const JOYSTICK_RADIUS = 97.0
var buttons = {
 "fire":{"p":Vector2(1125,475),"r":61.0,"label":"FIRE"},
 "use":{"p":Vector2(1130,620),"r":46.0,"label":"USE"},
 "jump":{"p":Vector2(1003,643),"r":44.0,"label":"JUMP"},
 "reload":{"p":Vector2(1007,533),"r":37.0,"label":"LOAD"},
 "audit":{"p":Vector2(894,591),"r":40.0,"label":"AUDIT"},
 "dash":{"p":Vector2(365,580),"r":39.0,"label":"DASH"},
 "sprint":{"p":Vector2(320,691),"r":34.0,"label":"RUN"},
 "crouch":{"p":Vector2(407,691),"r":34.0,"label":"DUCK"},
 "aim":{"p":Vector2(1125,337),"r":34.0,"label":"AIM"},
 "previous":{"p":Vector2(1035,711),"r":29.0,"label":"<"},
 "next":{"p":Vector2(1200,711),"r":29.0,"label":">"},
 "map":{"p":Vector2(215,186),"r":34.0,"label":"MAP"},
 "journal":{"p":Vector2(300,186),"r":34.0,"label":"JOBS"},
 "pause":{"p":Vector2(1200,182),"r":34.0,"label":"II"}
}
func _ready():
 texture_filter=CanvasItem.TEXTURE_FILTER_NEAREST
func _input(e):
 if not g.mobile_enabled:return
 if e is InputEventScreenTouch:
  handle_touch(e.index,e.position,e.pressed)
  get_viewport().set_input_as_handled()
 elif e is InputEventScreenDrag:
  handle_drag(e.index,e.position,e.relative)
  get_viewport().set_input_as_handled()
func handle_touch(index,pos,pressed):
 if not pressed:
  release_finger(index)
  return
 if g.state!="play":
  menu_tap(pos)
  return
 for action in buttons:
  var b=buttons[action]
  if pos.distance_to(b.p)<=b.r+7:
   fingers[index]={"owner":action,"pos":pos}
   if action=="fire" or action=="jump":held[action]=true
   else:activate(action)
   return
 if pos.x<510 and pos.y>310:
  if fingers.values().any(func(f):return f.owner=="move"):return
  fingers[index]={"owner":"move","pos":pos}
  update_move(pos)
 elif pos.x>480:
  fingers[index]={"owner":"look","pos":pos}
func handle_drag(index,pos,relative):
 if not fingers.has(index) or g.state!="play":return
 var f=fingers[index];f.pos=pos
 if f.owner=="move":update_move(pos)
 elif f.owner in ["look","fire"]:
  var scales=[0.0030,0.0045,0.0060]
  var amount=relative*scales[sensitivity_scale]*(0.6 if aiming else 1.0)
  g.yaw-=amount.x;g.pitch=clamp(g.pitch-amount.y,-1.45,1.45)
  g.player.rotation.y=g.yaw;g.camera.rotation.x=g.pitch
func update_move(pos):
 move=(pos-joystick_center)/JOYSTICK_RADIUS
 if move.length()<0.12:move=Vector2.ZERO
 elif move.length()>1:move=move.normalized()
func release_finger(index):
 if not fingers.has(index):return
 var owner=fingers[index].owner;fingers.erase(index)
 if owner=="move":move=Vector2.ZERO
 if owner in ["fire","jump"]:
  held[owner]=fingers.values().any(func(f):return f.owner==owner)
func reset():
 fingers.clear();move=Vector2.ZERO;held.fire=false;held.jump=false
func activate(action):
 match action:
  "use":
   if g.interact_target>=0:g.interact(g.interact_target)
  "reload":g.reload_weapon()
  "audit":g.pulse()
  "dash":g.dash()
  "sprint":sprint=not sprint;crouch=false
  "crouch":crouch=not crouch;sprint=false
  "aim":aiming=not aiming
  "previous":cycle_weapon(-1)
  "next":cycle_weapon(1)
  "map":g.set_state("map")
  "journal":g.set_state("journal")
  "pause":g.set_state("pause");g.save_game()
func cycle_weapon(direction):
 for i in range(1,6):
  var next=fposmod(g.equipped+i*direction,5)
  if g.owned[int(next)]:g.equip(int(next));return
func back():
 if g.state=="play":g.save_game();g.set_state("pause")
 elif g.state=="dead":g.respawn()
 elif g.state=="won":g.set_state("title")
 elif g.state!="title":g.set_state("play")
func menu_tap(pos):
 match g.state:
  "title","ending":g.hud.handle_tap(pos)
  "dialogue":g.set_state("play")
  "dead":g.respawn()
  "won":g.set_state("title")
  "map","journal","help","fish":
   if Rect2(1135,120,105,80).has_point(pos):g.set_state("play");return
   if g.state=="fish":
    if Rect2(240,300,800,260).has_point(pos):g.fish_press()
   elif g.state=="map":
    if Rect2(885,580,310,75).has_point(pos):g.cycle_quest()
   elif g.state=="journal":
    var row=int((pos.y-185)/69)
    if pos.y>=185 and row>=0 and row<g.quests.size():
     var id=g.quests.keys()[row]
     if g.quests[id]>0 or id=="main":g.tracked=id
  "pause":
   if Rect2(280,256,720,67).has_point(pos):g.set_state("play")
   elif Rect2(280,335,720,63).has_point(pos):g.save_game();g.message("GAME SAVED / your city remembers you.")
   elif Rect2(280,411,720,63).has_point(pos):g.load_game()
   elif Rect2(280,490,340,57).has_point(pos):g.muted=not g.muted;g.save_preferences()
   elif Rect2(650,490,350,57).has_point(pos):g.toggle_quality()
   elif Rect2(280,564,340,57).has_point(pos):g.set_state("help")
   elif Rect2(650,564,350,57).has_point(pos):g.save_game();g.set_state("title")
   elif Rect2(420,637,440,55).has_point(pos):
    sensitivity_scale=(sensitivity_scale+1)%3;g.save_preferences()
func _process(_dt):queue_redraw()
func _draw():
 if not g.mobile_enabled:return
 var font=ThemeDB.fallback_font
 if g.state=="play":
  draw_circle(joystick_center,JOYSTICK_RADIUS,Color(0.12,0.03,0.2,0.56))
  draw_arc(joystick_center,JOYSTICK_RADIUS,0,TAU,40,Color(0.8,0.96,0.25,0.65),3)
  draw_circle(joystick_center+move*JOYSTICK_RADIUS*0.67,35,Color(0.8,0.96,0.25,0.6))
  draw_string(font,joystick_center+Vector2(-26,5),"MOVE",HORIZONTAL_ALIGNMENT_LEFT,-1,17,Color('#f9ffc0'))
  for action in buttons:
   var b=buttons[action]
   var active=(action in held and held[action]) or (action=="sprint" and sprint) or (action=="crouch" and crouch) or (action=="aim" and aiming)
   draw_circle(b.p,b.r,Color(0.68,0.2,0.47,0.82) if active else Color(0.15,0.04,0.22,0.64))
   draw_arc(b.p,b.r,0,TAU,32,Color('#f3e541') if action=="fire" else Color(0.94,0.49,0.68,0.85),2)
   var label=b.label
   if action=="audit" and g.pulse_cd>0:label=str(int(ceil(g.pulse_cd)))+"s"
   elif action=="dash" and g.dash_cd>0:label="%.1f"%g.dash_cd
   var size=21 if action=="fire" else 16
   var width=font.get_string_size(label,HORIZONTAL_ALIGNMENT_LEFT,-1,size).x
   draw_string(font,b.p+Vector2(-width/2,6),label,HORIZONTAL_ALIGNMENT_LEFT,-1,size,Color('#edff9a'))
  draw_string(font,Vector2(545,780),"SWIPE THE RIGHT SIDE TO LOOK",HORIZONTAL_ALIGNMENT_LEFT,-1,16,Color('#e5ed8a'))
 elif g.state in ["map","journal","help","fish"]:
  button_rect(Rect2(1135,120,105,80),"BACK")
  if g.state=="map":button_rect(Rect2(885,580,310,75),"TRACK NEXT JOB")
  elif g.state=="journal":
   draw_string(font,Vector2(380,710),"TAP A DISCOVERED JOB TO TRACK IT",HORIZONTAL_ALIGNMENT_LEFT,-1,20,Color('#e5ed8a'))
 elif g.state=="pause":
  button_rect(Rect2(280,256,720,67),"RESUME")
  button_rect(Rect2(280,335,720,63),"SAVE GAME")
  button_rect(Rect2(280,411,720,63),"RESTORE SAVE")
  button_rect(Rect2(280,490,340,57),"SOUND "+("OFF" if g.muted else "ON"))
  button_rect(Rect2(650,490,350,57),"DETAIL "+("HIGH" if g.reduced else "LOW"))
  button_rect(Rect2(280,564,340,57),"HOW TO PLAY")
  button_rect(Rect2(650,564,350,57),"TITLE SCREEN")
  button_rect(Rect2(420,637,440,55),"LOOK SPEED: "+["LOW","NORMAL","HIGH"][sensitivity_scale])
func button_rect(rect,label):
 var font=ThemeDB.fallback_font
 draw_rect(rect,Color('#3c1c43'));draw_rect(rect,Color('#f193b2'),false,2)
 var width=font.get_string_size(label,HORIZONTAL_ALIGNMENT_LEFT,-1,22).x
 draw_string(font,rect.get_center()+Vector2(-width/2,8),label,HORIZONTAL_ALIGNMENT_LEFT,-1,22,Color('#edff76'))
