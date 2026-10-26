extends Node2D
# All art, music, mechanics and text are original for this unofficial fan interpretation.
const W = 1280.0
const H = 800.0
const ARENA = Rect2(56, 130, 1168, 594)
const INK = Color('#0b111d')
const CREAM = Color('#eee8cd')
const GREEN = Color('#ccfc6b')
const PINK = Color('#ff638d')
const BLUE = Color('#77dce5')
const GOLD = Color('#ffc975')
var rng = RandomNumberGenerator.new()
var font = ThemeDB.fallback_font
var state = "title"
var previous_state = "play"
var p = Vector2(640, 470)
var aim = Vector2.RIGHT
var hp = 100.0
var maxhp = 100.0
var money = 0
var debt = 0
var freed_floors: Array = []
var popups: Array = []
var combo = 0
var combo_t = 0.0
var floor_no = 0
var room_no = 0
var phase = 0
var time = 0.0
var fire_cd = 0.0
var dash_cd = 0.0
var dash_t = 0.0
var dash_dir = Vector2.RIGHT
var invuln = 0.0
var shift_cd = 0.0
var shake = 0.0
var kills = 0
var absorbed = 0
var damage = 16.0
var shot_rate = 0.24
var speed = 235.0
var ricochet = 0
var leech = 0
var spread = 0
var orbit = 0
var organs: Array = []
var enemies: Array = []
var bullets: Array = []
var particles: Array = []
var pickups: Array = []
var walls: Array = []
var flowers: Array = []
var notices: Array = []
var choices: Array = []
var selection = 0
var cleared = false
var room_t = 0.0
var secrets = 0
var liberated = 0
var best = 0
var wins = 0
var muted = false
var reduced = false
var music: AudioStreamPlayer
var synth: AudioStreamGeneratorPlayback
var sample_clock = 0
var tone_left = 0.0
var tone_freq = 440.0
var title_buttons: Array = []
var run_seed = 0
var biome_names = ["THE COMFORT DEPARTMENT", "MUNICIPAL INTESTINE", "THE ORCHARD OF OWNERS", "MEMORY LIQUIDATION", "THE JOY REFINERY", "THE FINAL SHAREHOLDER"]
var whispers = ["Your joy has been approved. Please retain your receipt.","The walls remember being people. They prefer this.","Nothing here is free. Some things can be given.","You are not a customer. You are the product's dream.","An exit is a door that has forgotten its employer.","The dividend is you. It has always been you."]
var relics = [
 {"id":"bounce","name":"SECOND OPINION","desc":"Shots ricochet twice. Walls become accomplices.","cost":0},
 {"id":"spread","name":"FORKED INTENTION","desc":"Fire an additional pair of angled seeds.","cost":0},
 {"id":"leech","name":"KINDLY PARASITE","desc":"Every kill returns 3 flesh. A mutual arrangement.","cost":0},
 {"id":"speed","name":"UNEMPLOYED LEGS","desc":"Move 22% faster. Dash recovers sooner.","cost":0},
 {"id":"damage","name":"HOSTILE TAKEOVER","desc":"Seed damage +40%. Very persuasive.","cost":0},
 {"id":"orbit","name":"DEPENDENT MOON","desc":"A small moon circles you, hurting nearby creditors.","cost":0},
 {"id":"heart","name":"SPARE CHILDHOOD","desc":"Maximum flesh +30. Recover 35 flesh.","cost":0},
 {"id":"rate","name":"URGENT CORRESPONDENCE","desc":"Fire 25% faster. All complaints acknowledged.","cost":0}
]
func _ready():
 rng.randomize()
 load_meta()
 music = AudioStreamPlayer.new()
 var stream = AudioStreamGenerator.new()
 stream.mix_rate = 22050
 stream.buffer_length = 0.12
 music.stream = stream
 add_child(music)
 music.play()
 synth = music.get_stream_playback()
 for i in range(90):
  flowers.append(Vector3(rng.randf_range(0,W),rng.randf_range(0,H),rng.randf_range(2,6)))
 if "--smoke" in OS.get_cmdline_user_args():
  start_run(1234)
 queue_redraw()
func _exit_tree():
 synth=null
 if is_instance_valid(music):
  music.stop()
  music.stream=null
func load_meta():
 var f = ConfigFile.new()
 if f.load("user://dividends.cfg") == OK:
  best = f.get_value("record","best",0)
  wins = f.get_value("record","wins",0)
  muted = f.get_value("options","muted",false)
  reduced = f.get_value("options","reduced",false)
func save_meta():
 var f = ConfigFile.new()
 f.set_value("record","best",best)
 f.set_value("record","wins",wins)
 f.set_value("options","muted",muted)
 f.set_value("options","reduced",reduced)
 f.save("user://dividends.cfg")
func start_run(seed_value = 0):
 run_seed = seed_value if seed_value else randi()
 rng.seed = run_seed
 hp=100; maxhp=100; money=0; debt=0; floor_no=0; room_no=0; phase=0
 damage=16; shot_rate=0.24; speed=235; ricochet=0; leech=0; spread=0; orbit=0
 freed_floors.clear(); popups.clear(); combo=0; combo_t=0
 organs.clear(); kills=0; absorbed=0; secrets=0; liberated=0
 dash_cd=0; dash_t=0; invuln=1; shift_cd=0
 state="play"
 new_room()
 message("WELCOME, GORBINO. Clear both realities. Dash eats bullets. Q reveals the underprint.",GREEN)
func message(s, c = CREAM):
 notices.append({"s":s,"t":5.0,"c":c})
 if notices.size()>3: notices.pop_front()
func popup(pos,s,col=GOLD):
 popups.append({"p":pos,"s":s,"col":col,"life":0.85})
func sound(f=440.0, duration=0.08):
 tone_freq=f; tone_left=duration
func _input(e):
 if e is InputEventKey and e.pressed and not e.echo:
  match e.keycode:
   KEY_M:
    muted=not muted; save_meta()
   KEY_F3:
    reduced=not reduced; save_meta()
   KEY_F11:
    DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED if DisplayServer.window_get_mode()==DisplayServer.WINDOW_MODE_FULLSCREEN else DisplayServer.WINDOW_MODE_FULLSCREEN)
   KEY_ESCAPE:
    if state=="play": previous_state=state; state="pause"
    elif state=="pause": state=previous_state
    elif state=="codex": state="title"
   KEY_R:
    if state=="pause": start_run()
   KEY_ENTER:
    if state=="title" or state=="dead" or state=="won": start_run()
    elif state=="pause": state="play"
   KEY_C:
    if state=="title": state="codex"
   KEY_Q:
    if state=="play": shift_world()
   KEY_SPACE:
    if state=="play": dash()
   KEY_E:
    if state=="play": interact()
   KEY_1, KEY_2, KEY_3:
    if state=="choice" or state=="shop" or state=="ending": choose(e.keycode-KEY_1)
 if e is InputEventMouseButton and e.pressed and e.button_index==MOUSE_BUTTON_LEFT:
  var m=get_global_mouse_position()
  if state=="title":
   if Rect2(85,520,340,60).has_point(m): start_run()
   elif Rect2(85,594,340,45).has_point(m): state="codex"
  elif state in ["choice","shop","ending"]:
   for i in range(3):
    if Rect2(94+i*372,300,348,255).has_point(m): choose(i)
  elif state=="dead" or state=="won": start_run()
func shift_world():
 if shift_cd>0: return
 phase=1-phase; shift_cd=0.7
 # Same geometry across realities: changing layers can never embed the player.
 burst(p,BLUE if phase else GREEN,28)
 sound(180 if phase else 360,0.2)
 message("UNDERPRINT // Dash through bullets to turn them into money." if phase else "SURFACE // Find the heart hidden in each room's underprint.",BLUE if phase else GREEN)
func dash():
 if dash_cd>0: return
 dash_dir = move_input()
 if dash_dir.length()<0.1: dash_dir=aim
 dash_cd=1.2 if speed<280 else 0.8
 dash_t=0.19; invuln=max(invuln,0.25)
 sound(110,0.13)
func move_input():
 return Vector2(float(Input.is_physical_key_pressed(KEY_D) or Input.is_physical_key_pressed(KEY_RIGHT))-float(Input.is_physical_key_pressed(KEY_A) or Input.is_physical_key_pressed(KEY_LEFT)),float(Input.is_physical_key_pressed(KEY_S) or Input.is_physical_key_pressed(KEY_DOWN))-float(Input.is_physical_key_pressed(KEY_W) or Input.is_physical_key_pressed(KEY_UP))).normalized()
func new_room():
 enemies.clear(); bullets.clear(); pickups.clear(); walls.clear(); particles.clear(); popups.clear()
 p=Vector2(640,660); cleared=false; room_t=0
 if room_no==3:
  spawn_enemy(Vector2(640,295),3,phase)
  message("AUDIT IN PROGRESS // "+["THE REGIONAL MANAGER","THE DRAIN COMMISSIONER","THE ROOT OF ALL PROFIT","THE MEMORY TRUST","THE HAPPINESS ENGINE","THE LAST BENEFICIARY"][floor_no],PINK)
 else:
  var layouts = [
   [Rect2(330,310,95,54),Rect2(850,310,95,54),Rect2(330,505,95,54),Rect2(850,505,95,54)],
   [Rect2(280,290,220,40),Rect2(780,290,220,40),Rect2(500,490,280,40)],
   [Rect2(280,260,50,280),Rect2(950,260,50,280),Rect2(540,350,200,50)],
   [Rect2(200,365,160,80),Rect2(560,245,160,80),Rect2(920,365,160,80),Rect2(560,550,160,40)]
  ]
  walls.assign(layouts[(floor_no+room_no)%4])
  for i in range(4+floor_no*2+room_no):
   var pos=Vector2(rng.randf_range(120,1160),rng.randf_range(190,520))
   while blocked(pos,22): pos=Vector2(rng.randf_range(120,1160),rng.randf_range(190,520))
   spawn_enemy(pos,i%3,i%2)
  pickups.append({"p":Vector2(640,210),"type":"secret","phase":1,"alive":true})
 message(whispers[floor_no],CREAM)
func spawn_enemy(pos,kind,layer):
 enemies.append({"p":pos,"kind":kind,"phase":layer,"hp":(50+floor_no*14 if kind!=3 else 480+floor_no*100),"max":(50+floor_no*14 if kind!=3 else 480+floor_no*100),"cd":rng.randf_range(0.6,1.5),"t":rng.randf()*6,"hit":0.0,"alive":true})
func blocked(pos,r):
 if not ARENA.grow(-r).has_point(pos): return true
 for w in walls:
  if w.grow(r).has_point(pos): return true
 return false
func move_actor(pos,delta_pos,r):
 var out=pos
 if not blocked(out+Vector2(delta_pos.x,0),r): out.x+=delta_pos.x
 if not blocked(out+Vector2(0,delta_pos.y),r): out.y+=delta_pos.y
 return out
func shoot(pos,dir,enemy=false,layer=0,vel=620.0,dmg=16.0,bounces=0):
 bullets.append({"p":pos,"v":dir*vel,"enemy":enemy,"phase":layer,"life":3.0,"dmg":dmg,"bounce":bounces,"alive":true})
func burst(pos,col,n=10):
 for i in range(n):
  particles.append({"p":pos,"v":Vector2.from_angle(rng.randf()*TAU)*rng.randf_range(30,180),"life":rng.randf_range(0.2,0.65),"col":col})
func hurt(amount):
 if invuln>0: return
 hp-=amount; invuln=0.8; shake=8
 popup(p-Vector2(0,35),"-"+str(int(amount)),PINK)
 burst(p,PINK,16); sound(75,0.17)
 if hp<=0:
  hp=0; state="dead"; best=max(best,kills*10+money+floor_no*100); save_meta()
func _process(dt):
 dt=min(dt,0.035); time+=dt
 fill_audio()
 for n in notices: n.t-=dt
 for n in popups: n.p.y-=dt*42; n.life-=dt
 popups=popups.filter(func(n): return n.life>0)
 notices=notices.filter(func(n): return n.t>0)
 for b in particles:
  b.p+=b.v*dt; b.v*=0.94; b.life-=dt
 particles=particles.filter(func(b): return b.life>0)
 shake=max(0,shake-dt*35)
 if state=="play": update_game(dt)
 queue_redraw()
func update_game(dt):
 room_t+=dt
 combo_t=max(0,combo_t-dt)
 if combo_t==0: combo=0
 invuln=max(0,invuln-dt); fire_cd-=dt; dash_cd=max(0,dash_cd-dt); shift_cd=max(0,shift_cd-dt)
 aim=(get_global_mouse_position()-p).normalized()
 if aim==Vector2.ZERO: aim=Vector2.RIGHT
 if dash_t>0:
  dash_t-=dt; p=move_actor(p,dash_dir*790*dt,14)
  burst(p,BLUE,1)
 else: p=move_actor(p,move_input()*speed*dt,14)
 if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT) and fire_cd<=0:
  fire_cd=shot_rate
  shoot(p+aim*21,aim,false,phase,620,damage,ricochet)
  if spread>0:
   shoot(p+aim*21,aim.rotated(0.20),false,phase,620,damage*0.65,ricochet)
   shoot(p+aim*21,aim.rotated(-0.20),false,phase,620,damage*0.65,ricochet)
  sound(520+rng.randf()*120,0.025)
 for e in enemies:
  if not e.alive: continue
  e.t+=dt; e.hit=max(0,e.hit-dt); e.cd-=dt
  if e.phase!=phase and e.kind!=3: continue
  var toward=(p-e.p).normalized()
  if e.kind==0:
   e.p=move_actor(e.p,toward*(80+floor_no*7)*dt,18)
  elif e.kind==1:
   var dist=e.p.distance_to(p)
   e.p=move_actor(e.p,toward*(65 if dist>290 else -35)*dt,18)
  elif e.kind==2:
   e.p=move_actor(e.p,(toward.rotated(sin(e.t*2)*1.1))*110*dt,18)
  else:
   e.p=Vector2(640+sin(e.t*0.6)*310,310+sin(e.t)*80)
   if int(e.t*0.22)%2!=e.phase:
    e.phase=int(e.t*0.22)%2
  if e.p.distance_to(p)<(52 if e.kind==3 else 30): hurt(18)
  if orbit>0 and e.p.distance_to(p+Vector2.from_angle(time*3.5)*68)<40:
   e.hp-=45*dt; e.hit=0.08
   if e.hp<=0: kill_enemy(e)
  if e.cd<=0:
   e.cd=(1.7 if e.kind==1 else 2.5) - min(0.65,floor_no*0.1)
   if e.kind==3:
    e.cd=0.95
    var rays=10+floor_no*2
    for i in range(rays):
     var direction=Vector2.from_angle(i*TAU/rays+e.t*(0.3 if floor_no%2==0 else -0.4))
     shoot(e.p,direction,true,e.phase,135+floor_no*12,12)
    if floor_no%3==0:
     for j in range(3):shoot(e.p,toward.rotated((j-1)*0.22),true,phase,260,16)
    elif floor_no%3==1:
     for j in range(5):shoot(e.p+Vector2((j-2)*65,0),toward,true,phase,220,13)
    else:
     for j in range(8):shoot(e.p,Vector2.from_angle(j*TAU/8-e.t),true,1-e.phase,185,12)
   elif e.kind==1: shoot(e.p,toward,true,e.phase,230,13)
   elif e.kind==2:
    for i in range(5): shoot(e.p,Vector2.from_angle(i*TAU/5+e.t),true,e.phase,145,10)
 for b in bullets:
  if not b.alive: continue
  b.life-=dt
  var next=b.p+b.v*dt
  if blocked(next,4):
   if b.bounce>0:
    if blocked(b.p+Vector2(b.v.x*dt,0),4): b.v.x=-b.v.x
    if blocked(b.p+Vector2(0,b.v.y*dt),4): b.v.y=-b.v.y
    b.bounce-=1
   else: b.alive=false
  else: b.p=next
  if b.phase!=phase: continue
  if b.enemy:
   if b.p.distance_to(p)<(42 if dash_t>0 else 16):
    b.alive=false
    if dash_t>0:
     money+=2; absorbed+=1; combo+=1; combo_t=2.0; popup(b.p,"+2 / ABSORBED",GOLD); burst(b.p,GOLD,4); sound(820,0.04)
     if combo%5==0:
      hp=min(maxhp,hp+5); popup(p-Vector2(0,30),"FLOW / +5 FLESH",BLUE)
    else: hurt(b.dmg)
  else:
   for e in enemies:
    if not e.alive or (e.phase!=phase): continue
    if b.p.distance_to(e.p)<(49 if e.kind==3 else 23):
     b.alive=false; e.hp-=b.dmg; e.hit=0.12; burst(b.p,GREEN,3); popup(e.p-Vector2(0,20),str(int(b.dmg)),CREAM)
     if e.hp<=0: kill_enemy(e)
     break
 bullets=bullets.filter(func(b): return b.alive and b.life>0)
 for item in pickups:
  if not item.alive or item.phase!=phase: continue
  if p.distance_to(item.p)<30:
   if item.type=="secret":
    item.alive=false; secrets+=1; hp=min(maxhp,hp+8); money+=5
    message("A MEMORY THAT WAS NOT FOR SALE. +8 flesh / +5 scrip",BLUE); burst(item.p,BLUE,18)
   else:
    item.alive=false; money+=item.value; sound(720,0.035)
 if not cleared and enemies.filter(func(e): return e.alive).is_empty():
  cleared=true; money+=10+floor_no*2
  hp=min(maxhp,hp+5)
  message("RECEIPT ISSUED. +10 scrip / +5 flesh. [E] at the northern elevator.",GREEN)
  burst(Vector2(640,160),GOLD,30)
func kill_enemy(e):
 if not e.alive: return
 e.alive=false; kills+=1
 hp=min(maxhp,hp+leech*3)
 burst(e.p,PINK if e.phase==0 else BLUE,24 if e.kind==3 else 12)
 pickups.append({"p":e.p,"phase":e.phase,"type":"coin","value":25 if e.kind==3 else 3,"alive":true})
 sound(120,0.06)
func interact():
 if cleared and p.distance_to(Vector2(640,160))<90:
  bullets.clear()
  if room_no==3:
   if floor_no==5: state="ending"
   else:
    state="choice"; choices=relics.duplicate(); choices.shuffle(); choices=choices.slice(0,3)
  elif room_no==1:
   state="shop"; choices=relics.duplicate(); choices.shuffle(); choices=choices.slice(0,2)
  else:
   room_no+=1; new_room()
 elif phase==1 and p.distance_to(Vector2(1120,650))<70:
  if money>=12 and not floor_no in freed_floors:
   money-=12; liberated+=1; freed_floors.append(floor_no)
   message("You purchased a stranger's freedom. The ledger cannot explain this.",BLUE)
  elif floor_no in freed_floors: message("The stranger is gone. The empty chair feels warm.",BLUE)
  else: message("FREE A STRANGER: 12 scrip. Kindness is the only hidden currency.",BLUE)
func apply_relic(r):
 organs.append(r.name)
 match r.id:
  "bounce": ricochet+=2
  "spread": spread=1
  "leech": leech+=1
  "speed": speed*=1.22
  "damage": damage*=1.4
  "orbit": orbit+=1
  "heart": maxhp+=30; hp=min(maxhp,hp+35)
  "rate": shot_rate*=0.75
 message("GRAFT ACCEPTED // "+r.name,GREEN); sound(660,0.2)
func choose(i):
 if state=="ending":
  if i==2 and (secrets<9 or liberated<3):
   message("The third door needs 9 memories and 3 liberated strangers.",PINK); return
  wins+=1; best=max(best,kills*10+money+floor_no*100); selection=i; state="won"; save_meta(); return
 if state=="choice":
  apply_relic(choices[i]); floor_no+=1; room_no=0; state="play"; new_room()
 elif state=="shop":
  if i<2:
   if money<20:
    message("INSUFFICIENT SCRIP. You can leave with [3].",PINK); return
   money-=20; apply_relic(choices[i])
  else:
   hp=min(maxhp,hp+15)
  room_no+=1; state="play"; new_room()
func fill_audio():
 if not synth: return
 var count=synth.get_frames_available()
 for i in range(count):
  var t=float(sample_clock)/22050.0
  var beat=int(t*3.4)
  var notes=[110.0,130.81,164.81,146.83,110.0,196.0,164.81,98.0]
  var f=notes[(beat/2)%8]*(0.5 if phase else 1.0)
  var env=exp(-fmod(t,1.0/3.4)*10)
  var bass=sin(t*f*TAU)*0.055
  var arp=sin(t*f*4*TAU)*env*0.027
  var kick=sin(t*(46+exp(-fmod(t,0.588)*35)*90)*TAU)*exp(-fmod(t,0.588)*15)*0.07
  var s=bass+arp+kick
  if tone_left>0:
   s+=sin(t*tone_freq*TAU)*0.09*min(tone_left*20,1.0)
   tone_left-=1.0/22050
  if muted: s=0
  synth.push_frame(Vector2(s,s)); sample_clock+=1
func txt(s,pos,size=18,col=CREAM):
 draw_string(font,pos,str(s),HORIZONTAL_ALIGNMENT_LEFT,-1,size,col)
func center(s,y,size=24,col=CREAM):
 var width=font.get_string_size(str(s),HORIZONTAL_ALIGNMENT_LEFT,-1,size).x
 txt(s,Vector2((W-width)/2,y),size,col)
func box(rect,col,border=Color.TRANSPARENT):
 draw_style_box(panel(col,border),rect)
func panel(col,border):
 var style=StyleBoxFlat.new()
 style.bg_color=col; style.border_color=border
 style.set_border_width_all(1); style.set_corner_radius_all(5)
 return style
func _draw():
 draw_rect(Rect2(0,0,W,H),INK)
 if state=="title" or state=="codex":
  draw_title()
 else:
  draw_world()
  draw_hud()
  if state=="pause": draw_pause()
  elif state=="choice" or state=="shop" or state=="ending": draw_choices()
  elif state=="dead" or state=="won": draw_result()
 # A restrained CRT treatment. F3 disables scanlines and motion shake.
 if not reduced:
  for y in range(0,800,4): draw_line(Vector2(0,y),Vector2(W,y),Color(0,0,0,0.08))
 for i in range(notices.size()):
  var n=notices[i]
  box(Rect2(65,769-i*25,1150,24),Color('#111c27'))
  txt(n.s,Vector2(78,786-i*25),15,n.c)
func draw_title():
 for f in flowers:
  var pos=Vector2(f.x,f.y)+Vector2(sin(time*0.2+f.y)*12,0)
  draw_circle(pos,f.z,Color('#17282a'))
 for i in range(7):
  draw_arc(Vector2(970,390),100+i*33,0,TAU,100,Color('#304936'),1)
 draw_creature(Vector2(970,375),0,5.0)
 txt("A  M I N D - P U M P I N G  F A N  I N T E R P R E T A T I O N",Vector2(85,100),15,GREEN)
 txt("GORBINO'S",Vector2(80,230),88,CREAM)
 txt("QUEST",Vector2(80,325),110,GREEN)
 txt("THE DIVIDEND OF FLESH",Vector2(87,375),26,PINK)
 txt("A small creature. A very large economy.",Vector2(87,432),21,CREAM)
 txt("Descend through six departments of manufactured joy.",Vector2(87,467),18,Color('#a4b5b6'))
 box(Rect2(85,520,340,60),GREEN)
 txt("ENTER  /  BEGIN YOUR SHIFT",Vector2(107,558),21,INK)
 box(Rect2(85,594,340,45),Color('#172530'),Color('#39534d'))
 txt("C  /  EMPLOYEE HANDBOOK",Vector2(107,624),18,CREAM)
 txt("RECORD  "+str(best)+"     EXITS FOUND  "+str(wins),Vector2(87,699),15,BLUE)
 txt("M  sound   /   F11  fullscreen   /   F3  reduced effects",Vector2(87,737),15,Color('#93a3a5'))
 txt("Unofficial fan game. Original art, audio, story and mechanics.",Vector2(87,770),13,Color('#687e80'))
 if state=="codex":
  box(Rect2(60,75,1160,650),INK,GREEN)
  txt("EMPLOYEE HANDBOOK / YOU ARE ALLOWED TO HAVE FUN",Vector2(95,125),26,GREEN)
  var lines=["WASD / arrows     Move your small, valuable body.","MOUSE / hold LMB   Aim and fire seeds. Walls block shots.","SPACE             Dash. During a dash, enemy bullets become money.","Q                 Switch SURFACE / UNDERPRINT. Enemies live in both.","E                 Use the northern elevator after clearing both layers.","1 / 2 / 3         Choose grafts, purchases and your eventual ending.","ESC               Pause. M: mute. F11: fullscreen. F3: reduced effects.","", "Each department has three encounters and an audit boss.","After encounter two: buy a graft for 20 scrip, or leave and heal 15.","Every boss grants a free graft. Grafts combine and stack.","In the underprint: find blue memories; visit the chair at bottom right.","Nine memories and three freed strangers reveal the hidden ending.","No permanent power grind. Only your record and preferences are saved.","", "[ESC] Return.  Original interpretation; no promise of 500 actual hours."]
  for i in range(lines.size()): txt(lines[i],Vector2(95,170+i*31),18,CREAM if i<7 else BLUE)
func draw_creature(pos,kind,scale_value=1.0,hit=false):
 var col=GREEN if kind==0 else (PINK if kind==1 else BLUE)
 if hit: col=CREAM
 draw_circle(pos+Vector2(0,10)*scale_value,19*scale_value,Color(0,0,0,0.3))
 var pts=PackedVector2Array()
 for i in range(24):
  var a=i*TAU/24
  var r=(19+sin(a*3+time*3)*2)*scale_value
  pts.append(pos+Vector2(cos(a)*r,sin(a)*r))
 draw_colored_polygon(pts,col)
 draw_circle(pos+Vector2(-7,-3)*scale_value,6*scale_value,INK)
 draw_circle(pos+Vector2(7,-3)*scale_value,6*scale_value,INK)
 draw_circle(pos+Vector2(-6,-5)*scale_value,2*scale_value,CREAM)
 draw_circle(pos+Vector2(8,-5)*scale_value,2*scale_value,CREAM)
 draw_arc(pos+Vector2(0,4)*scale_value,8*scale_value,0.1,PI-0.1,12,INK,2*scale_value)
 draw_line(pos+Vector2(-10,15)*scale_value,pos+Vector2(-15,23+sin(time*10)*2)*scale_value,col,4*scale_value)
 draw_line(pos+Vector2(10,15)*scale_value,pos+Vector2(15,23-sin(time*10)*2)*scale_value,col,4*scale_value)
func draw_world():
 var offset=Vector2.ZERO if reduced else Vector2(sin(time*93),cos(time*81))*shake
 draw_set_transform(offset)
 var palette=[Color('#152426'),Color('#29202a'),Color('#1d2b25'),Color('#1b2334'),Color('#2f2420'),Color('#251e2d')]
 var bg=palette[floor_no] if phase==0 else palette[(floor_no+3)%6].darkened(0.12)
 var linecol=bg.lightened(0.075)
 box(ARENA,bg,Color('#4e6a55') if phase==0 else Color('#756293'))
 for x in range(64,1224,40): draw_line(Vector2(x,132),Vector2(x,722),linecol)
 for y in range(140,724,40): draw_line(Vector2(58,y),Vector2(1222,y),linecol)
 # Department insignia, grown into the tile work.
 var emblem=Vector2(640,423)
 var accent=Color(0.6,0.7,0.6,0.08)
 if floor_no==0:
  draw_arc(emblem,155,0,TAU,80,accent,10)
  draw_arc(emblem+Vector2(0,30),75,0,PI,30,accent,12)
  draw_circle(emblem+Vector2(-55,-40),14,accent); draw_circle(emblem+Vector2(55,-40),14,accent)
 elif floor_no==1:
  for j in range(5):
   var points=PackedVector2Array()
   for k in range(50): points.append(Vector2(180+k*19,270+j*65+sin(k*0.4+j)*25))
   draw_polyline(points,accent,8)
 elif floor_no==2:
  for j in range(7):
   var at=Vector2(200+j*145,410+sin(j*2)*80)
   draw_line(at+Vector2(0,100),at,accent,9)
   for k in range(5):draw_circle(at+Vector2.from_angle(k*TAU/5)*35,26,accent)
 elif floor_no==3:
  for j in range(4):
   var at=Vector2(280+j*230,370)
   draw_rect(Rect2(at,Vector2(125,150)),accent,false,4)
   for k in range(5): draw_line(at+Vector2(20,30+k*22),at+Vector2(100,30+k*22),accent,3)
 elif floor_no==4:
  for j in range(8):
   var a=j*TAU/8+time*0.04
   draw_line(emblem+Vector2.from_angle(a)*70,emblem+Vector2.from_angle(a)*200,accent,18)
  draw_arc(emblem,88,0,TAU,50,accent,10)
 else:
  for j in range(5):draw_arc(emblem,70+j*30,0,TAU,80,accent,3)
  draw_line(Vector2(440,520),Vector2(640,270),accent,8)
  draw_line(Vector2(640,270),Vector2(840,520),accent,8)
  draw_line(Vector2(840,520),Vector2(440,520),accent,8)
 for i in range(18):
  var v=Vector2(95+i*65,700)
  draw_line(v,v+Vector2(12,-9),linecol,2)
 for w in walls:
  box(w,Color('#365447') if phase==0 else Color('#514465'),Color('#66846b') if phase==0 else Color('#9376a7'))
  draw_circle(w.get_center(),11,INK)
  draw_circle(w.get_center()+Vector2(sin(time)*4,0),4,GOLD if phase==0 else BLUE)
 box(Rect2(592,132,96,44),GREEN if cleared else Color('#3c4847'))
 txt("ELEVATOR" if cleared else "LOCKED",Vector2(602,159),15,INK if cleared else CREAM)
 if phase==1:
  var chair=Vector2(1120,650)
  draw_rect(Rect2(chair-Vector2(16,20),Vector2(32,35)),Color('#756485'),false,3)
  txt("[E] FREE",chair+Vector2(-32,40),13,BLUE)
  if not floor_no in freed_floors:
   draw_creature(chair,2,0.65)
 for item in pickups:
  if not item.alive: continue
  var col=BLUE if item.type=="secret" else GOLD
  if item.phase!=phase: col.a=0.13
  var pos=item.p+Vector2(0,sin(time*4+item.p.x)*4)
  if item.type=="secret":
   draw_arc(pos,14+sin(time*3)*2,0,TAU,24,col,2)
   draw_line(pos-Vector2(6,0),pos+Vector2(6,0),col,3)
   draw_line(pos-Vector2(0,6),pos+Vector2(0,6),col,3)
  else: draw_circle(pos,7,col); draw_circle(pos,3,bg)
 for e in enemies:
  if not e.alive: continue
  if e.phase!=phase:
   draw_arc(e.p,24 if e.kind!=3 else 55,0,TAU,30,Color(0.5,0.6,0.7,0.16),1)
   continue
  if e.cd<0.35 and (e.kind==1 or e.kind==3):
   draw_line(e.p,p,Color(1,0.4,0.55,0.22),2)
   draw_arc(e.p,35,0,TAU,25,GOLD,2)
  if e.kind==3:
   for i in range(8):
    var a=i*TAU/8+time*0.5
    draw_line(e.p+Vector2.from_angle(a)*30,e.p+Vector2.from_angle(a+0.3)*70,PINK,7)
   draw_creature(e.p,1,2.2,e.hit>0)
   box(Rect2(380,187,520,12),INK)
   draw_rect(Rect2(380,187,520*max(0,e.hp)/e.max,12),PINK)
  else:
   draw_creature(e.p,1 if e.kind!=2 else 2,1.0,e.hit>0)
   if e.kind==1: draw_arc(e.p,29,-0.6,0.6,10,GOLD,3)
   if e.kind==2: draw_arc(e.p,28,time,time+PI,12,BLUE,2)
   if e.hp<e.max: draw_line(e.p+Vector2(-18,-30),e.p+Vector2(-18+36*e.hp/e.max,-30),PINK,3)
 for b in bullets:
  var col=PINK if b.enemy else GREEN
  if b.phase!=phase: col.a=0.12
  draw_line(b.p-b.v.normalized()*10,b.p,col,3 if b.enemy else 4)
  draw_circle(b.p,5 if b.enemy else 4,col)
 if invuln<=0 or int(time*15)%2==0: draw_creature(p,0,1.0)
 draw_line(p+aim*18,p+aim*31,CREAM,4)
 if dash_t>0: draw_arc(p,37,0,TAU,28,BLUE,3)
 if orbit>0:
  var moon=p+Vector2.from_angle(time*3.5)*68
  draw_arc(p,68,0,TAU,48,Color(0.7,0.8,1,0.12),1)
  draw_circle(moon,12,BLUE); draw_circle(moon+Vector2(4,-2),8,bg)
 for b in particles: draw_circle(b.p,2+b.life*4,b.col)
 for n in popups:
  var col=n.col; col.a=min(1,n.life*3)
  txt(n.s,n.p,14,col)
 var m=get_global_mouse_position()
 draw_arc(m,10,0,TAU,20,CREAM,1)
 draw_line(m-Vector2(15,0),m-Vector2(6,0),CREAM)
 draw_line(m+Vector2(6,0),m+Vector2(15,0),CREAM)
 draw_set_transform(Vector2.ZERO)
 if cleared:
  txt("ALL ACCOUNTS SETTLED.  [E] AT THE NORTHERN ELEVATOR",Vector2(350,700),17,GREEN)
func draw_hud():
 txt("GQ /",Vector2(57,43),24,GREEN)
 txt(biome_names[floor_no],Vector2(132,42),23,CREAM)
 txt("DEPT %02d / 06     RECEIPT %d / 4"%[floor_no+1,room_no+1],Vector2(58,73),14,Color('#91aaa4'))
 box(Rect2(58,91,250,14),Color('#2c2934'))
 draw_rect(Rect2(58,91,250*hp/maxhp,14),PINK)
 txt("FLESH %d / %d"%[hp,maxhp],Vector2(322,104),15,PINK)
 txt("SCRIP  %03d"%money,Vector2(510,103),18,GOLD)
 txt("MEMORIES %02d   FREED %d"%[secrets,liberated],Vector2(685,103),15,BLUE)
 box(Rect2(996,25,226,43),GREEN if phase==0 else BLUE)
 txt("SURFACE" if phase==0 else "UNDERPRINT",Vector2(1011,53),22,INK)
 txt("Q / CHANGE REALITY",Vector2(1009,92),14,CREAM)
 txt("DASH READY" if dash_cd<=0 else "DASH %.1fs"%dash_cd,Vector2(1061,113),13,GREEN if dash_cd<=0 else Color('#829b96'))
 var alive_here=enemies.filter(func(e): return e.alive and e.phase==phase).size()
 var alive_other=enemies.filter(func(e): return e.alive and e.phase!=phase).size()
 if combo>1: txt("FLOW x"+str(combo)+" / 5 ABSORBS = HEAL",Vector2(870,687),14,GOLD)
 txt("HOSTILES  %d HERE / %d OTHER SIDE"%[alive_here,alive_other],Vector2(63,716),12,Color('#8da39b'))
 if organs.size()>0: txt("GRAFTS "+str(organs.size())+"  /  "+organs[-1],Vector2(750,716),12,GOLD)
func draw_pause():
 draw_rect(Rect2(0,0,W,H),Color(0.02,0.04,0.07,0.9))
 center("YOUR BREAK IS UNPAID",300,42,GREEN)
 center("WASD move   /   MOUSE fire   /   SPACE absorb-dash",365,21)
 center("Q change reality   /   E interact   /   M sound",404,21)
 center("F3 reduced effects: "+("ON" if reduced else "OFF"),447,18,BLUE)
 center("ENTER or ESC / RETURN TO WORK    R / NEW RUN",520,23,GOLD)
 center("SEED DAMAGE %d   /   SHOTS %.1f/s   /   SPEED %d"%[damage,1.0/shot_rate,speed],566,17,BLUE)
 var names=""
 for i in range(organs.size()):
  names+=organs[i]+("  /  " if i<organs.size()-1 else "")
 wrapped(names,Vector2(160,616),960,15,CREAM)
func wrapped(s,pos,width,size,col):
 var words=s.split(" ")
 var line=""
 var y=pos.y
 for word in words:
  if font.get_string_size(line+word,HORIZONTAL_ALIGNMENT_LEFT,-1,size).x>width:
   txt(line,Vector2(pos.x,y),size,col); y+=size*1.55; line=""
  line+=word+" "
 txt(line,Vector2(pos.x,y),size,col)
func draw_choices():
 draw_rect(Rect2(0,0,W,H),Color(0.025,0.045,0.07,0.95))
 var heading="A COMPLIMENTARY REPLACEMENT ORGAN"
 var sub="One graft. No refunds. All combinations are legally binding."
 if state=="shop": heading="THE COMPANY STORE"; sub="20 scrip per graft. Or leave with 15 flesh. Your scrip: "+str(money)
 if state=="ending": heading="THE FINAL DIVIDEND"; sub="The machine asks what you want. For the first time, it waits for an answer."
 center(heading,199,35,GREEN); center(sub,246,18,CREAM)
 for i in range(3):
  var rect=Rect2(94+i*372,300,348,255)
  var hover=rect.has_point(get_global_mouse_position())
  box(rect,Color('#26362e') if hover else Color('#142129'),GREEN if hover else Color('#3a5550'))
  var title=""; var desc=""
  if state=="ending":
   title=["BECOME THE OWNER","BREAK THE MACHINE","GIVE IT ALL AWAY"][i]
   desc=["Keep the economy. Replace its face with your own. Nothing will ever hurt you again.","Destroy the engine of joy. The world will be difficult, and finally belong to no one.","Return every stolen memory. Free the people inside the walls. Requires 9 memories + 3 strangers."][i]
  elif state=="shop" and i==2:
   title="A MODEST LUNCH"; desc="Leave without buying. Heal 15 flesh and keep your savings. Sometimes enough is enough."
  else:
   title=choices[i].name; desc=choices[i].desc
  txt("0"+str(i+1)+" /",rect.position+Vector2(24,39),25,GOLD)
  wrapped(title,rect.position+Vector2(24,87),300,23,GREEN)
  wrapped(desc,rect.position+Vector2(24,155),296,17,CREAM)
 center("PRESS 1 / 2 / 3  OR CLICK A CARD",625,17,BLUE)
func draw_result():
 draw_rect(Rect2(0,0,W,H),Color(0.02,0.04,0.065,0.96))
 var title="YOUR POSITION HAS BEEN FILLED"
 var body="The company regrets the loss of its property. Somewhere, a new Gorbino opens its eyes."
 if state=="won":
  title=["THE NEW FACE OF JOY","THE FIRST QUIET MORNING","A WORLD WITHOUT OWNERS"][selection]
  body=["Your portrait replaces the old one. The doors still lock from the outside. You have won everything the machine knows how to give.","The engine stops. No one knows what to do. Then someone laughs, without being asked. It is a small and terrible beginning.","The walls unfold into people. Memories fall like rain. You give away your name last. Someone calls you friend. It fits better."][selection]
 center(title,260,38,GREEN if state=="won" else PINK)
 wrapped(body,Vector2(270,326),740,22,CREAM)
 center("DEPARTMENT %d   /   %d HOSTILES   /   %d BULLETS ABSORBED"%[floor_no+1,kills,absorbed],485,19,GOLD)
 center("%d MEMORIES   /   %d STRANGERS FREED   /   %d GRAFTS"%[secrets,liberated,organs.size()],525,19,BLUE)
 center("ENTER / CLICK TO BEGIN ANOTHER LIFE",627,23,GREEN)
 center("RUN SEED  "+str(run_seed),676,13,Color('#7c9791'))
