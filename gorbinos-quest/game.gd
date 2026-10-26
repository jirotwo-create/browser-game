extends Node
# Original fan interpretation. All textures, geometry, music and dialogue authored here.
const ROOT_SAVE = "user://null_dividend_v2.json"
const WORLD_SIZE = 140.0
var rng = RandomNumberGenerator.new()
var world: Node3D
var viewport: SubViewport
var screen: SubViewportContainer
var hud
var player: CharacterBody3D
var camera: Camera3D
var gun_root: Node3D
var gun_flash: MeshInstance3D
var yaw = 0.0
var pitch = 0.0
var state = "title"
var previous = "play"
var hp = 100.0
var max_hp = 100.0
var credits = 0
var kills = 0
var secrets = 0
var seals: Array = []
var freed: Array = []
var relays: Array = []
var memory_ids: Array = []
var collected: Array = []
var dead_ids: Array = []
var quests = {"main":0,"union":0,"courier":0,"broadcast":0,"arena":0,"fish":0,"memories":0}
var quest_names = {"main":"THE UNPAID DIVIDEND","union":"COLLECTIVE BARGAINING","courier":"A HEART IN TRANSIT","broadcast":"PIRATE RADIO THERAPY","arena":"PERFORMANCE REVIEW","fish":"THE LAST HONEST JOB","memories":"SOMEONE ELSE'S CHILDHOOD"}
var npcs: Array = []
var items: Array = []
var enemies: Array = []
var projectiles: Array = []
var effects: Array = []
var barrels: Array = []
var notices: Array = []
var mats: Array = []
var flat_mats: Dictionary = {}
var obstacles: Array = []
var astar = AStarGrid2D.new()
var time = 0.0
var fire_cd = 0.0
var reload_t = 0.0
var recoil = 0.0
var invuln = 0.0
var dash_cd = 0.0
var pulse_cd = 0.0
var pulse_t = 0.0
var hit_t = 0.0
var damage_flash = 0.0
var step_t = 0.0
var save_t = 0.0
var checkpoint = Vector3(0,2,96)
var equipped = 0
var owned: Array = [true,false,false,false,false]
var magazines: Array = [12,6,4,3,40]
var reserves: Array = [999,30,16,12,120]
var capacities: Array = [12,6,4,3,40]
var weapon_names = ["INVOICE // 10MM","MARROW // FLECHETTE","DIVIDEND // RAIL DRIVER","CYST // ORGAN MORTAR","DEBT COLLECTOR // SIPHON"]
var weapon_short = ["INVOICE","MARROW","DIVIDEND","CYST","DEBT COLLECTOR"]
var weapon_rates = [0.23,0.72,0.95,0.9,0.09]
var weapon_damage = [34.0,18.0,155.0,120.0,13.0]
var interact_target = -1
var arena_wave = 0
var arena_enemies: Array = []
var boss_started = false
var boss_dead = false
var ending = 0
var tracked = "main"
var fish_clock = 0.0
var fish_target = 0.0
var fish_caught = 0
var muted = false
var reduced = false
var sensitivity = 0.0021
var music: AudioStreamPlayer
var playback: AudioStreamGeneratorPlayback
var sample_clock = 0
var sound_left = 0.0
var sound_freq = 200.0
var test_mode = false
var metadata = {"deaths":0}
var regions = [
 {"name":"CIVIC WOUND / WELCOME HOME","pos":Vector2(0,75),"color":Color('#91f32d')},
 {"name":"THE FLESHWORKS","pos":Vector2(-88,-12),"color":Color('#f46498')},
 {"name":"GARDEN OF FUTURE RETURNS","pos":Vector2(83,0),"color":Color('#b6ef36')},
 {"name":"RESIDENTIAL ORGANISM","pos":Vector2(85,88),"color":Color('#29e7c6')},
 {"name":"THE FORGOTTEN CANAL","pos":Vector2(-86,91),"color":Color('#d498ff')},
 {"name":"GOD'S ACCOUNTS RECEIVABLE","pos":Vector2(0,-95),"color":Color('#ffcc2f')},
 {"name":"HUMAN PERFORMANCE ARCADE","pos":Vector2(90,-70),"color":Color('#ff569b')}
]
func _ready():
 rng.seed=712833
 test_mode="--test" in OS.get_cmdline_user_args()
 make_materials()
 make_viewport()
 build_world()
 build_navigation()
 make_player()
 hud=load("res://hud.gd").new()
 hud.g=self
 var layer=CanvasLayer.new();add_child(layer);layer.add_child(hud)
 setup_audio()
 load_preferences()
 Input.mouse_mode=Input.MOUSE_MODE_VISIBLE
 if "--smoke" in OS.get_cmdline_user_args(): new_game()
func make_materials():
 for i in range(6):
  var m=ShaderMaterial.new();m.shader=load("res://retro.gdshader")
  m.set_shader_parameter("tile",load("res://assets/tile%d.png"%i))
  mats.append(m)
 for i in range(6):
  var m=ShaderMaterial.new();m.shader=load("res://retro.gdshader")
  m.set_shader_parameter("tile",load("res://assets/face%d.png"%i));mats.append(m)
func material(index,tiling=Vector2.ONE):
 var m=mats[index].duplicate()
 m.set_shader_parameter("tiling",tiling)
 return m
func flat(c):
 var key=str(c)
 if flat_mats.has(key):return flat_mats[key]
 var m=StandardMaterial3D.new();m.albedo_color=c;m.shading_mode=BaseMaterial3D.SHADING_MODE_UNSHADED
 m.texture_filter=BaseMaterial3D.TEXTURE_FILTER_NEAREST
 flat_mats[key]=m
 return m
func make_viewport():
 screen=SubViewportContainer.new();screen.position=Vector2(24,30);screen.size=Vector2(1232,704)
 screen.stretch=true;screen.stretch_shrink=2
 screen.texture_filter=CanvasItem.TEXTURE_FILTER_NEAREST
 add_child(screen)
 viewport=SubViewport.new();viewport.size=Vector2i(616,352)
 viewport.render_target_update_mode=SubViewport.UPDATE_ALWAYS
 viewport.own_world_3d=true;screen.add_child(viewport)
 world=Node3D.new();viewport.add_child(world)
 var env=WorldEnvironment.new();var e=Environment.new()
 e.background_mode=Environment.BG_SKY
 var sky=Sky.new();var sm=PanoramaSkyMaterial.new();sm.panorama=load("res://assets/sky.png");sm.filter=false
 sky.sky_material=sm;e.sky=sky
 e.ambient_light_source=Environment.AMBIENT_SOURCE_COLOR;e.ambient_light_color=Color('#bda6d0');e.ambient_light_energy=0.9
 e.tonemap_mode=Environment.TONE_MAPPER_LINEAR
 env.environment=e;world.add_child(env)
 var light=DirectionalLight3D.new();light.rotation_degrees=Vector3(-50,-30,0);light.light_energy=0.8;world.add_child(light)
func cube(parent,pos,size,mat,solid=false,nav=true):
 var n=MeshInstance3D.new();var mesh=BoxMesh.new();mesh.size=size;n.mesh=mesh;n.material_override=mat
 if solid:
  var body=StaticBody3D.new();body.position=pos;body.collision_layer=1
  var shape=CollisionShape3D.new();var box=BoxShape3D.new();box.size=size;shape.shape=box
  body.add_child(shape);body.add_child(n);parent.add_child(body)
  if nav and pos.y-size.y/2<2.3 and pos.y+size.y/2>0.5:
   obstacles.append(Rect2(Vector2(pos.x-size.x/2,pos.z-size.z/2),Vector2(size.x,size.z)))
  return body
 n.position=pos;parent.add_child(n);return n
func sphere(parent,pos,r,mat,rings=5,segments=8):
 var n=MeshInstance3D.new();var mesh=SphereMesh.new();mesh.radius=r;mesh.height=r*2;mesh.radial_segments=segments;mesh.rings=rings
 n.mesh=mesh;n.position=pos;n.material_override=mat;parent.add_child(n);return n
func cylinder(parent,pos,r,height,mat):
 var n=MeshInstance3D.new();var m=CylinderMesh.new();m.top_radius=r*0.8;m.bottom_radius=r;m.height=height;m.radial_segments=7
 n.mesh=m;n.position=pos;n.material_override=mat;parent.add_child(n);return n
func sign_at(pos,text,color=Color('#eff93b'),font_size=48,pixel=0.015):
 var label=Label3D.new();label.text=text;label.font_size=font_size;label.pixel_size=pixel
 label.modulate=color;label.outline_size=10;label.outline_modulate=Color('#32133c');label.no_depth_test=false
 label.position=pos;label.texture_filter=BaseMaterial3D.TEXTURE_FILTER_NEAREST;world.add_child(label)
 return label
func building(pos,size,idx,word=""):
 cube(world,pos+Vector3(0,size.y/2,0),size,material(idx,Vector2(size.x/3,size.y/3)),true)
 # Flat recessed windows contrast with the textured facades.
 for x in range(int(size.x/3)):
  for y in range(1,int(size.y/3)):
   cube(world,pos+Vector3(-size.x/2+1.5+x*3,1+y*2.7,size.z/2+0.03),Vector3(1.4,1.5,0.09),flat(Color('#182b39') if (x+y)%3 else Color('#c5f556')))
 if word!="":sign_at(pos+Vector3(0,size.y-0.5,size.z/2+0.15),word,Color('#f9e660'),40,0.027)
func room(pos,size,idx,word):
 var w=size.x;var h=size.y;var d=size.z
 cube(world,pos+Vector3(0,-0.1,0),Vector3(w,0.2,d),material((idx+2)%6,Vector2(w/3,d/3)),true,false)
 cube(world,pos+Vector3(-w/2,h/2,0),Vector3(0.5,h,d),material(idx,Vector2(d/3,h/3)),true)
 cube(world,pos+Vector3(w/2,h/2,0),Vector3(0.5,h,d),material(idx,Vector2(d/3,h/3)),true)
 cube(world,pos+Vector3(0,h/2,-d/2),Vector3(w,h,0.5),material(idx,Vector2(w/3,h/3)),true)
 for side in [-1,1]:cube(world,pos+Vector3(side*(w/4+1.5),h/2,d/2),Vector3(w/2-3,h,0.5),material(idx,Vector2(w/6,h/3)),true)
 cube(world,pos+Vector3(0,h,0),Vector3(w+0.5,0.4,d+0.5),material(4,Vector2(w/3,d/3)),true,false)
 sign_at(pos+Vector3(0,h-1,d/2+0.4),word,Color('#f3ff61'),42,0.025)
 for side in [-1,1]:
  var at=pos+Vector3(side*(w/2-3),0,-d/4)
  cube(world,at+Vector3(0,0.65,0),Vector3(3,1.3,2),material(4),true)
  cube(world,at+Vector3(0,1.5,0),Vector3(1.1,0.8,0.2),material(3))
  cube(world,pos+Vector3(side*(w/2-0.35),h*0.6,0),Vector3(0.12,2.7,2),material(6+(idx+1)%6))
func ramp(pos,width,length,height,idx=4):
 var body=cube(world,pos+Vector3(0,height/2-0.08,0),Vector3(width,0.4,sqrt(length*length+(height+0.6)*(height+0.6))),material(idx,Vector2(width/2,length/2)),true,false)
 body.rotation.x=atan2(height+0.6,length)
func build_world():
 cube(world,Vector3(0,-0.6,0),Vector3(282,1,282),material(5,Vector2(94,94)),true,false)
 # Cross-city arterials: clear lanes, legible district silhouettes, many flanking routes.
 for x in [-48,0,48]:cube(world,Vector3(x,0.01,0),Vector3(12,0.1,274),material(4,Vector2(4,92)))
 for z in [-48,40,106]:cube(world,Vector3(0,0.02,z),Vector3(274,0.1,12),material(0,Vector2(92,4)))
 for z in range(-130,135,12):
  cube(world,Vector3(0,0.09,z),Vector3(0.3,0.04,4),flat(Color('#efff4d')))
 for side in [-1,1]:
  cube(world,Vector3(side*141,9,0),Vector3(2,20,284),material(3,Vector2(70,5)),true)
  cube(world,Vector3(0,9,side*141),Vector3(284,20,2),material(2,Vector2(70,5)),true)
 # Civic Wound: safe hub with clinic, union and contract office.
 room(Vector3(0,0,68),Vector3(24,7,16),1,"THE DEPARTMENT OF YOU")
 add_item("mother",Vector3(0,0.5,66),"MOTHER OF INVOICES","npc",0)
 room(Vector3(28,0,78),Vector3(16,6,16),2,"OPEN WOUND / CLINIC")
 add_item("doctor",Vector3(28,0.5,77),"DR. NIL / HEART COURIER","npc",2)
 add_item("clinic",Vector3(23,1,81),"REASSEMBLE / FREE HEAL + SAVE","clinic",2)
 room(Vector3(-28,0,78),Vector3(16,6,16),0,"UNION OF SPARE PARTS")
 add_item("union",Vector3(-28,0.5,78),"LOAN / UNION STEWARD","npc",1)
 add_item("hub_shop",Vector3(15,0.5,98),"VENDING ORGAN / 20 SCRIP","shop",3)
 sign_at(Vector3(0,9,78),"GORBINO'S QUEST\nNULL DIVIDEND",Color('#e1ff36'),48,0.022)
 # Three quest buildings form an open circuit around the city.
 room(Vector3(-91,0,-20),Vector3(28,9,25),1,"FLESHWORKS / CLAIMS PROCESSING")
 add_item("seal_flesh",Vector3(-91,1,-28),"OWNERSHIP SEAL / FLESHWORKS","seal",0)
 room(Vector3(90,0,0),Vector3(28,9,25),3,"THE GARDEN OF FUTURE RETURNS")
 add_item("seal_garden",Vector3(90,1,-7),"OWNERSHIP SEAL / GARDEN","seal",1)
 room(Vector3(89,0,88),Vector3(28,8,23),2,"RESIDENTIAL ORGANISM / LEASING")
 add_item("seal_housing",Vector3(89,1,81),"OWNERSHIP SEAL / HOUSING","seal",2)
 add_item("heart",Vector3(95,0.8,95),"TEMPERATURE-SENSITIVE HEART","heart",1)
 # Corporate tower: open ground-floor nave, enormous clock-eye, boss courtyard.
 room(Vector3(0,0,-101),Vector3(48,18,48),0,"GOD'S ACCOUNTS RECEIVABLE")
 building(Vector3(-34,0,-111),Vector3(14,43,24),3,"GOD")
 building(Vector3(34,0,-111),Vector3(14,55,24),2,"DEBT")
 sphere(world,Vector3(0,30,-119),9,material(1),6,10)
 sphere(world,Vector3(0,30,-110.8),4.4,flat(Color('#d5ed52')),4,8)
 sphere(world,Vector3(0,30,-107),2.1,flat(Color('#41133a')),4,7)
 add_item("tower",Vector3(0,1,-85),"THE FINAL AUDIT / THREE SEALS REQUIRED","tower",3)
 add_item("exit",Vector3(0,1,-119),"THE DIVIDEND ENGINE","ending",3)
 # Forgotten Canal: an organic marsh, fishing, pirate radio, elevated walkways.
 cube(world,Vector3(-90,0.06,106),Vector3(48,0.1,35),material(3,Vector2(20,12)))
 for x in [-116,-62]:cube(world,Vector3(x,0.5,98),Vector3(3,1,64),material(2,Vector2(2,22)),true)
 add_item("pirate",Vector3(-96,0.5,69),"RADIO ANGEL / PIRATE THERAPIST","npc",4)
 add_item("fish",Vector3(-78,0.5,111),"ANGLING / THE LAST HONEST JOB","fish",2)
 sign_at(Vector3(-88,7,74),"THE FORGOTTEN CANAL",Color('#ce83ff'),46,0.03)
 for k in range(3):
  var loc=Vector3(-108+k*20,0,87+(k%2)*15)
  cube(world,loc+Vector3(0,3,0),Vector3(9,6,9),material(4,Vector2(3,2)),true)
  ramp(loc+Vector3(0,0,12.5),4,16,6,2)
  cylinder(world,loc+Vector3(0,12,0),0.4,12,material(2))
  add_item("relay%d"%k,loc+Vector3(0,6.8,0),"PIRATE TRANSMITTER %d"%(k+1),"relay",3)
 # Human performance arcade: combat arena with a repeatable jump route above it.
 room(Vector3(93,0,-81),Vector3(44,10,38),0,"HUMAN PERFORMANCE ARCADE")
 add_item("arena",Vector3(89,1,-66),"ENTER PERFORMANCE REVIEW / 3 WAVES","arena",3)
 for i in range(4):cube(world,Vector3(78+i*10,1.5,-82),Vector3(2.5,3,2.5),material(1),true)
 # Workforce cells: visible interaction doors; freedom is a quest, not a pickup counter.
 for i in range(3):
  var loc=[Vector3(-111,0,25),Vector3(-68,0,-12),Vector3(-112,0,-52)][i]
  cube(world,loc+Vector3(0,0.1,0),Vector3(6,0.3,6),material(0),true,false)
  for n in range(6):cube(world,loc+Vector3(-2.5+n,1.8,-2.5),Vector3(0.15,3.5,0.15),flat(Color('#6bfa7c')))
  add_item("worker%d"%i,loc+Vector3(0,0.4,0),"INDENTURED WORKER / OPEN CONTRACT","worker",i)
 # Side lanes have cover, caches, interiors, grotesque street furniture.
 var blocks=[Vector3(-82,0,48),Vector3(-25,0,25),Vector3(26,0,23),Vector3(-24,0,-25),Vector3(26,0,-26),Vector3(-84,0,-76),Vector3(72,0,27),Vector3(120,0,43),Vector3(118,0,-20),Vector3(-121,0,5),Vector3(24,0,115),Vector3(-26,0,115),Vector3(69,0,119),Vector3(-124,0,120)]
 for i in range(blocks.size()):
  var loc=blocks[i];var size=Vector3(11+rng.randf()*7,10+rng.randf()*14,12+rng.randf()*8)
  building(loc,size,i%6,["EAT", "BECOME", "PAY", "LIVE", "EXCEL", "FORGET"][i%6])
  if i%2==0:add_item("cache%d"%i,loc+Vector3(0,0.6,size.z/2+2),"UNCLAIMED LUNCH / SUPPLIES","cache",4)
 # Public sculptures: off-balance, faceted lifeforms, faces inside flowers.
 for i in range(38):
  var loc=Vector3(rng.randf_range(-130,130),0,rng.randf_range(-120,125))
  if abs(loc.x)<10 or abs(loc.z-40)<9:continue
  var r=1.1+rng.randf()*1.6
  cylinder(world,loc+Vector3(0,2,0),0.35,4,material(2))
  sphere(world,loc+Vector3(0,4.5,0),r,material(1 if i%2 else 3),4,6)
  cube(world,loc+Vector3(0,4.5,r*0.85),Vector3(r*1.3,r*1.4,0.2),material(6+i%6))
 # Roof route and jump pads: real collision and vertical traversal.
 ramp(Vector3(48,0,66),5,26,10,0)
 cube(world,Vector3(48,10,47),Vector3(12,0.7,12),material(3,Vector2(4,4)),true,false)
 cube(world,Vector3(67,10,47),Vector3(28,0.5,4),material(4,Vector2(9,2)),true,false)
 add_item("jump1",Vector3(48,0.2,78),"PNEUMATIC ASCENSION / E TO LAUNCH","jump",2)
 add_item("roofgun",Vector3(72,10.8,47),"DIVIDEND RAIL DRIVER / PROTOTYPE","weapon",2)
 var memory_pos=[Vector3(-132,1,-5),Vector3(-91,1,-35),Vector3(110,1,0),Vector3(80,1,87),Vector3(-88,7,87),Vector3(48,11,47),Vector3(0,1,-56),Vector3(123,1,124)]
 for i in range(memory_pos.size()):add_item("memory%d"%i,memory_pos[i],"LOST MEMORY / FRAGMENT %d"%(i+1),"memory",3)
 # Authored encounters: guards, charging hounds, artillery growths, armoured clerks.
 var groups=[Vector3(-90,0,-18),Vector3(88,0,2),Vector3(88,0,86),Vector3(-96,0,25),Vector3(-70,0,-11),Vector3(-108,0,-47),Vector3(25,0,0),Vector3(-28,0,-45),Vector3(55,0,-35),Vector3(-65,0,54),Vector3(67,0,48)]
 for i in range(groups.size()):
  for j in range(3 if i<3 else 2):
   var loc=groups[i]+Vector3((j-1)*4,1,5+j*2)
   spawn_enemy(loc,(i+j)%4,"district_%d_%d"%[i,j])
 # Volatile organ tanks create optional chain reactions in authored encounters.
 for i in range(8):
  var pos=[Vector3(-84,0,-14),Vector3(98,0,6),Vector3(80,0,91),Vector3(-74,0,-6),Vector3(62,0,-32),Vector3(-92,0,39),Vector3(82,0,-85),Vector3(104,0,-78)][i]
  var body=cube(world,pos+Vector3.UP*0.8,Vector3(1.4,1.6,1.4),material(1),true)
  body.set_meta("barrel_index",barrels.size());barrels.append({"body":body,"alive":true,"home":pos+Vector3.UP*0.8})
  var tag=Label3D.new();tag.text="VOLATILE";tag.font_size=24;tag.pixel_size=0.012;tag.position.y=1.6;tag.billboard=BaseMaterial3D.BILLBOARD_ENABLED;tag.modulate=Color('#ecff65');body.add_child(tag)
 # More supplies reward exploring backstreets rather than staying on a single objective line.
 for i in range(5):
  add_item("street_cache%d"%i,[Vector3(-55,0.5,112),Vector3(54,0.5,-60),Vector3(-35,0.5,-88),Vector3(119,0.5,77),Vector3(-123,0.5,63)][i],"ABANDONED RATIONS / SUPPLIES","cache",4)
 add_item("canal_clinic",Vector3(-100,0.6,66),"CANAL TRIAGE / FREE HEAL + SAVE","clinic",1)
 # Central orientation pillars visible from all routes.
 for z in [-58,-8,40]:
  sign_at(Vector3(0,5,z),"NORTH / ACCOUNTS\nWEST / FLESH     EAST / GARDEN",Color('#fff86d'),30,0.028)
func humanoid(parent,idx=0,enemy=false,kind=0):
 var root=Node3D.new();parent.add_child(root)
 var shirt=material((idx+2)%6)
 cube(root,Vector3(0,1.15,0),Vector3(0.85,0.9,0.44),shirt)
 var head=cube(root,Vector3(0,1.96,0),Vector3(0.64,0.7,0.56),material(6+idx%6))
 head.rotation.z=0.12 if idx%2 else -0.1
 var limbs=[]
 for side in [-1,1]:
  var leg=cube(root,Vector3(side*0.22,0.42,0),Vector3(0.28,0.85,0.32),material(4));limbs.append(leg)
  var arm=cube(root,Vector3(side*0.58,1.15,0.08),Vector3(0.23,0.9,0.24),material(1));limbs.append(arm)
 if enemy:
  cube(root,Vector3(0.5,1.15,0.48),Vector3(0.2,0.25,0.85),flat(Color('#352047')))
 if kind==1:
  root.scale=Vector3(1.2,0.55,1.65)
 elif kind==2:
  sphere(root,Vector3(0,2.4,0),0.65,material(3),4,7)
 elif kind==3:
  root.scale=Vector3(1.5,1.2,1.2)
 return {"root":root,"limbs":limbs}
func add_item(id,pos,label,kind,idx=0):
 var node=Node3D.new();node.position=pos;world.add_child(node)
 if kind in ["npc","worker"]:
  humanoid(node,idx)
 else:
  var mesh=cube(node,Vector3(0,0.5,0),Vector3(0.9,0.85,0.7),material(idx%6))
  if kind=="memory":
   mesh.visible=false;sphere(node,Vector3(0,0.7,0),0.4,material(3),4,6)
  elif kind=="seal" or kind=="relay" or kind=="tower":
   cube(node,Vector3(0,1.15,-0.1),Vector3(1.3,0.7,0.18),material(0))
  elif kind=="clinic":sphere(node,Vector3(0,1,0),0.6,material(1),4,6)
 var tag=Label3D.new();tag.text=label;tag.font_size=26;tag.pixel_size=0.014;tag.position=Vector3(0,3.15,0)
 tag.billboard=BaseMaterial3D.BILLBOARD_ENABLED;tag.outline_size=8;tag.modulate=Color('#edfc73');tag.visibility_range_end=27
 node.add_child(tag)
 items.append({"id":id,"pos":pos,"label":label,"kind":kind,"index":idx,"node":node,"tag":tag,"done":false})
 return items.size()-1
func spawn_enemy(pos,kind,id,boss=false):
 var body=CharacterBody3D.new();body.position=pos;body.collision_layer=2;body.collision_mask=1|4
 var shape=CollisionShape3D.new();var cap=CapsuleShape3D.new();cap.radius=0.48 if not boss else 2.1;cap.height=2.3 if not boss else 6.5
 shape.shape=cap;shape.position.y=1.1 if not boss else 3.0;body.add_child(shape)
 body.set_meta("enemy_index",enemies.size());world.add_child(body)
 var visual=humanoid(body,kind,true,kind)
 if boss:visual.root.scale=Vector3(3.4,3.4,3.4)
 var health=65.0 if kind!=3 else 155.0
 if boss:health=1800.0
 var e={"body":body,"visual":visual,"kind":kind,"id":id,"hp":health,"max":health,"alive":true,"cd":rng.randf_range(0.4,1.5),"alert":false,"home":pos,"t":rng.randf()*5,"path":[],"path_t":0.0,"stun":0.0,"boss":boss}
 enemies.append(e)
 return enemies.size()-1
func build_navigation():
 astar.region=Rect2i(-141,-141,283,283);astar.cell_size=Vector2(1,1);astar.diagonal_mode=AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES;astar.update()
 for rect in obstacles:
  var low=Vector2i(floor((rect.position.x-0.7)),floor((rect.position.y-0.7)))
  var high=Vector2i(ceil((rect.end.x+0.7)),ceil((rect.end.y+0.7)))
  for x in range(low.x,high.x+1):
   for y in range(low.y,high.y+1):
    if astar.is_in_boundsv(Vector2i(x,y)) and rect.grow(0.5).has_point(Vector2(x,y)):astar.set_point_solid(Vector2i(x,y))
func make_player():
 player=CharacterBody3D.new();player.position=checkpoint;player.collision_layer=4;player.collision_mask=1|2;player.floor_max_angle=deg_to_rad(55)
 var shape=CollisionShape3D.new();var capsule=CapsuleShape3D.new();capsule.height=1.8;capsule.radius=0.35;shape.shape=capsule;shape.position.y=0.9
 player.add_child(shape);world.add_child(player)
 camera=Camera3D.new();camera.position.y=1.62;camera.fov=84;camera.near=0.06;camera.far=220
 player.add_child(camera);camera.current=true
 gun_root=Node3D.new();camera.add_child(gun_root)
 build_gun()
func build_gun():
 for n in gun_root.get_children():n.queue_free()
 var colors=[Color('#c3df50'),Color('#ff729d'),Color('#73d6e4'),Color('#e79d63'),Color('#be86f1')]
 var mat=flat(colors[equipped]);var dark=flat(Color('#33233f'))
 # Fully 3D viewmodel, flat shaded, with deliberately chunky anatomy and mechanisms.
 cube(gun_root,Vector3(0.3,-0.28,-0.55),Vector3(0.18,0.21,0.44),material(4 if equipped<3 else 1))
 cube(gun_root,Vector3(0.3,-0.41,-0.38),Vector3(0.12,0.27,0.16),material(1))
 cube(gun_root,Vector3(0.31,-0.34,-0.29),Vector3(0.21,0.17,0.24),material(1))
 cube(gun_root,Vector3(0.3,-0.16,-0.57),Vector3(0.14,0.04,0.48),dark)
 cube(gun_root,Vector3(0.3,-0.12,-0.74),Vector3(0.025,0.07,0.025),mat)
 for i in range(3):cube(gun_root,Vector3(0.398,-0.25,-0.42-i*0.11),Vector3(0.012,0.1,0.04),mat)
 var barrel=cylinder(gun_root,Vector3(0.3,-0.23,-0.91),0.052,0.4,dark);barrel.rotation.x=PI/2
 if equipped==1:
  var second=cylinder(gun_root,Vector3(0.4,-0.23,-0.91),0.052,0.6,dark);second.rotation.x=PI/2
  cube(gun_root,Vector3(0.35,-0.25,-0.62),Vector3(0.24,0.16,0.4),mat)
 elif equipped==2:
  cube(gun_root,Vector3(0.3,-0.22,-0.9),Vector3(0.15,0.13,0.9),mat)
  for i in range(4):cube(gun_root,Vector3(0.3,-0.15,-0.6-i*0.15),Vector3(0.22,0.05,0.05),flat(Color('#f4ea6d')))
 elif equipped==3:
  sphere(gun_root,Vector3(0.3,-0.24,-0.7),0.23,material(1),4,7)
  var n=cylinder(gun_root,Vector3(0.3,-0.21,-0.97),0.13,0.3,dark);n.rotation.x=PI/2
 elif equipped==4:
  for i in range(4):
   var n=cylinder(gun_root,Vector3(0.3+sin(i*TAU/4)*0.1,-0.23+cos(i*TAU/4)*0.1,-0.9),0.025,0.5,mat);n.rotation.x=PI/2
 gun_flash=sphere(gun_root,Vector3(0.3,-0.23,-1.16),0.12,flat(Color('#fffa8a')),3,5);gun_flash.visible=false
func new_game():
 hp=100;max_hp=100;credits=0;kills=0;secrets=0;seals=[];freed=[];relays=[];memory_ids=[];collected=[];dead_ids=[]
 quests={"main":0,"union":0,"courier":0,"broadcast":0,"arena":0,"fish":0,"memories":0}
 owned=[true,false,false,false,false];magazines=[12,6,4,3,40];reserves=[999,30,16,12,120]
 equipped=0;arena_wave=0;arena_enemies=[];boss_started=false;boss_dead=false;checkpoint=Vector3(0,2,96)
 player.position=checkpoint;yaw=0;pitch=0;player.rotation.y=0;camera.rotation.x=0
 for e in enemies:
  if e.boss or str(e.id).begins_with("arena"):
   e.alive=false;e.body.visible=false;e.body.collision_layer=0
  else:e.alive=true;e.hp=e.max;e.alert=false;e.body.position=e.home;e.body.visible=true;e.body.collision_layer=2
 for item in items:item.done=false;item.node.visible=true
 for b in barrels:b.alive=true;b.body.visible=true;b.body.collision_layer=1
 invuln=2;fire_cd=0;reload_t=0;pulse_cd=0;dash_cd=0
 build_gun();set_state("play");message("Find Mother of Invoices in the department ahead. [E] to speak.",Color('#d4ff54'))
 save_game()
func set_state(s):
 state=s
 Input.mouse_mode=Input.MOUSE_MODE_CAPTURED if s=="play" else Input.MOUSE_MODE_VISIBLE
func _input(event):
 if event is InputEventMouseMotion and state=="play":
  yaw-=event.relative.x*sensitivity;pitch=clamp(pitch-event.relative.y*sensitivity,-1.45,1.45)
  player.rotation.y=yaw;camera.rotation.x=pitch
 if event is InputEventKey and event.pressed and not event.echo:
  match event.keycode:
   KEY_ENTER:
    if state=="title":
     if FileAccess.file_exists(ROOT_SAVE):load_game()
     else:new_game()
    elif state=="dead":respawn()
    elif state=="pause":set_state("play")
    elif state=="won":set_state("title")
   KEY_N:
    if state=="title":new_game()
   KEY_ESCAPE:
    if state=="play":set_state("pause");save_game()
    elif state in ["pause","journal","map","help","fish"]:set_state("play")
    elif state=="dialogue":set_state("play")
   KEY_E:
    if state=="play" and interact_target>=0:interact(interact_target)
    elif state=="fish":fish_press()
    elif state=="dialogue":set_state("play")
   KEY_J:
    if state=="play":set_state("journal")
    elif state=="journal":set_state("play")
   KEY_TAB:
    if state=="play":set_state("map")
    elif state=="map":set_state("play")
   KEY_T:
    if state in ["play","journal","map"]:cycle_quest()
   KEY_R:
    if state=="play":reload_weapon()
   KEY_Q:
    if state=="play":pulse()
   KEY_F:
    if state=="play":dash()
   KEY_F1:
    if state=="play":set_state("help")
   KEY_F3:
    reduced=not reduced
    for m in mats:m.set_shader_parameter("snap",not reduced)
    # Materials are duplicated per mesh; the viewport resolution is the main effect toggle.
    screen.stretch_shrink=1 if reduced else 2
    save_preferences()
   KEY_F5:
    if state=="play":save_game();message("MEMORY COMMITTED / game saved")
   KEY_F9:
    if state=="play" or state=="pause":load_game()
   KEY_M:
    muted=not muted;save_preferences()
   KEY_F11:
    DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED if DisplayServer.window_get_mode()==DisplayServer.WINDOW_MODE_FULLSCREEN else DisplayServer.WINDOW_MODE_FULLSCREEN)
   KEY_1,KEY_2,KEY_3,KEY_4,KEY_5:
    if state=="play":equip(event.keycode-KEY_1)
    elif state=="ending" and event.keycode<=KEY_3:finish_game(event.keycode-KEY_1)
 if event is InputEventMouseButton and event.pressed:
  if event.button_index in [MOUSE_BUTTON_WHEEL_UP,MOUSE_BUTTON_WHEEL_DOWN] and state=="play":
   for i in range(1,6):
    var next=(equipped+i*(1 if event.button_index==MOUSE_BUTTON_WHEEL_DOWN else -1)+10)%5
    if owned[next]:equip(next);break
func _process(dt):
 dt=min(dt,0.05);time+=dt;fill_audio()
 recoil=move_toward(recoil,0,dt*5);hit_t=max(0,hit_t-dt);damage_flash=max(0,damage_flash-dt)
 for n in notices:n.t-=dt
 notices=notices.filter(func(n):return n.t>0)
 if state=="title":
  player.rotation.y=sin(time*0.12)*0.4;camera.rotation.x=-0.08
 if state=="fish":fish_clock+=dt
 for effect in effects:
  effect.t-=dt
  if effect.has("v"):effect.node.position+=effect.v*dt;effect.v.y-=dt*9
  if effect.t<=0:effect.node.queue_free()
 effects=effects.filter(func(e):return e.t>0)
 for item in items:
  if item.kind=="memory" and not item.done:item.node.rotation.y+=dt;item.node.position.y=item.pos.y+sin(time*2+item.index)*0.15
 hud.queue_redraw()
func _physics_process(dt):
 if state!="play":return
 invuln=max(0,invuln-dt);fire_cd=max(0,fire_cd-dt);dash_cd=max(0,dash_cd-dt);pulse_cd=max(0,pulse_cd-dt);pulse_t=max(0,pulse_t-dt)
 if reload_t>0:
  reload_t-=dt
  if reload_t<=0:
   var amount=min(capacities[equipped]-magazines[equipped],reserves[equipped])
   magazines[equipped]+=amount
   if equipped!=0:reserves[equipped]-=amount
 var movement=Vector2(float(key(KEY_D) or key(KEY_RIGHT))-float(key(KEY_A) or key(KEY_LEFT)),float(key(KEY_S) or key(KEY_DOWN))-float(key(KEY_W) or key(KEY_UP))).normalized()
 var dir=player.transform.basis*Vector3(movement.x,0,movement.y)
 var moving=movement.length()>0
 var move_speed=12.5 if key(KEY_SHIFT) else 8.5
 if key(KEY_CTRL):move_speed=4.2
 player.velocity.x=move_toward(player.velocity.x,dir.x*move_speed,dt*75)
 player.velocity.z=move_toward(player.velocity.z,dir.z*move_speed,dt*75)
 if not player.is_on_floor():player.velocity.y-=dt*24
 elif key(KEY_SPACE):player.velocity.y=10
 else:player.velocity.y=-0.8
 player.move_and_slide()
 if player.position.y< -10:respawn()
 var bob=sin(time*(13 if key(KEY_SHIFT) else 10))*0.045 if moving and player.is_on_floor() else 0
 camera.position.y=lerp(camera.position.y,1.05 if key(KEY_CTRL) else 1.62+bob,dt*12)
 var aim=Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT)
 camera.fov=lerp(camera.fov,62.0 if aim else 84.0,dt*10)
 gun_root.position=Vector3((-0.15 if aim else 0)+sin(time*6)*0.005,(-0.02 if moving else 0)+bob*0.4,recoil*0.15)
 gun_root.rotation.x=recoil*0.16
 gun_flash.visible=fire_cd>weapon_rates[equipped]-0.045
 if moving and player.is_on_floor():
  step_t-=dt
  if step_t<=0:step_t=0.29 if key(KEY_SHIFT) else 0.43;sound(65,0.025)
 if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):fire()
 update_enemies(dt)
 update_projectiles(dt)
 find_interaction()
 if quests.arena==1 and not arena_enemies.is_empty():
  if arena_enemies.all(func(i):return not enemies[i].alive):
   if arena_wave<3:spawn_arena_wave()
   else:
    quests.arena=2;credits+=70;unlock_weapon(4);message("PERFORMANCE REVIEW COMPLETE / +70 scrip. DEBT COLLECTOR unlocked.");save_game()
 save_t+=dt
 if save_t>25:save_t=0;save_game()
func key(code):return Input.is_physical_key_pressed(code)
func ray(from,to,mask=3,exclude=[]):
 var q=PhysicsRayQueryParameters3D.create(from,to,mask,exclude)
 return player.get_world_3d().direct_space_state.intersect_ray(q)
func equip(i):
 if not owned[i]:message("Not owned. Explore the city and finish side jobs.");return
 equipped=i;reload_t=0;build_gun();sound(210+i*80,0.09)
func reload_weapon():
 if reload_t>0 or magazines[equipped]>=capacities[equipped]:return
 if reserves[equipped]<=0 and equipped!=0:message("No reserve biomass. Loot caches or visit the vending organ.");return
 reload_t=1.15 if equipped!=1 else 1.6;sound(140,0.12)
func fire():
 if fire_cd>0 or reload_t>0:return
 if magazines[equipped]<=0:reload_weapon();return
 magazines[equipped]-=1;fire_cd=weapon_rates[equipped];recoil=1;sound([310,90,880,75,160][equipped],0.1)
 var origin=camera.global_position
 var direction=-camera.global_basis.z
 for e in enemies:
  if e.alive and e.body.position.distance_to(player.position)<35:e.alert=true
 if equipped==3:
  var node=sphere(world,origin+direction*0.9,0.23,material(1),4,6)
  projectiles.append({"node":node,"v":direction*25+Vector3.UP*4,"t":3.0,"enemy":false,"dmg":120.0})
  return
 var pellets=8 if equipped==1 else 1
 for i in range(pellets):
  var spread=0.06 if equipped==1 else (0.003 if equipped==0 else 0.0)
  var d=(direction+camera.global_basis.x*rng.randf_range(-spread,spread)+camera.global_basis.y*rng.randf_range(-spread,spread)).normalized()
  var reach=18 if equipped==4 else 155
  var start=origin;var exclude=[player.get_rid()]
  for pierce in range(4 if equipped==2 else 1):
   var result=ray(start,origin+d*reach,3,exclude)
   var end=origin+d*reach
   if not result.is_empty():end=result.position
   trail(origin+direction*0.6+camera.global_basis.x*0.2-camera.global_basis.y*0.2,end,Color('#c9f7ff') if equipped==2 else (Color('#c69cff') if equipped==4 else Color('#ffea52')),0.14 if equipped==2 else 0.055)
   if result.is_empty():break
   var collider=result.collider
   if collider.has_meta("enemy_index"):
    var ei=collider.get_meta("enemy_index");var e=enemies[ei]
    var dmg=weapon_damage[equipped]
    if result.position.y>e.body.position.y+(5.0 if e.boss else 1.65):dmg*=1.65
    damage_enemy(ei,dmg);hit_t=0.16
    if equipped==4:hp=min(max_hp,hp+2)
    exclude.append(collider.get_rid());start=end+d*0.1
   else:
    if collider.has_meta("barrel_index"):detonate_barrel(collider.get_meta("barrel_index"))
    else:spark(end,Color('#cfff5e'),3)
    break
func trail(a,b,color,life=0.08):
 var len=a.distance_to(b)
 if len<0.05:return
 var n=MeshInstance3D.new();var mesh=BoxMesh.new();mesh.size=Vector3(0.045,0.045,len);n.mesh=mesh;n.material_override=flat(color)
 world.add_child(n);n.position=(a+b)/2;n.look_at(b);effects.append({"node":n,"t":life})
func spark(pos,color,count=8):
 for i in range(count):
  var node=cube(world,pos,Vector3.ONE*rng.randf_range(0.06,0.17),flat(color))
  effects.append({"node":node,"t":rng.randf_range(0.18,0.5),"v":Vector3(rng.randf_range(-4,4),rng.randf_range(1,5),rng.randf_range(-4,4))})
func damage_enemy(index,amount):
 var e=enemies[index]
 if not e.alive:return
 e.hp-=amount;e.alert=true;e.stun=0.12
 spark(e.body.position+Vector3.UP*1.2,Color('#fb4ca3'),5)
 if e.hp<=0:
  e.alive=false;e.body.collision_layer=0;e.body.visible=false;kills+=1;credits+=4 if not e.boss else 100
  dead_ids.append(e.id)
  if rng.randf()<0.3:hp=min(max_hp,hp+4)
  if equipped!=0:reserves[equipped]+=1 if equipped!=4 else 4
  if e.boss:
   boss_dead=true;quests.main=3;message("THE FINAL BENEFICIARY HAS BEEN LIQUIDATED. The engine awaits your decision.",Color('#ddff6b'));save_game()
func has_los(from,to):
 return ray(from,to,1).is_empty()
func safe_cell(pos):
 var c=Vector2i(round(pos.x),round(pos.z))
 if astar.is_in_boundsv(c) and not astar.is_point_solid(c):return c
 for r in range(1,5):
  for x in range(-r,r+1):
   for y in range(-r,r+1):
    var n=c+Vector2i(x,y)
    if astar.is_in_boundsv(n) and not astar.is_point_solid(n):return n
 return Vector2i.ZERO
func update_enemies(dt):
 for i in range(enemies.size()):
  var e=enemies[i]
  if not e.alive:continue
  e.t+=dt;e.cd-=dt;e.path_t-=dt;e.stun=max(0,e.stun-dt)
  var body=e.body;var offset=player.position-body.position;var dist=offset.length()
  if dist>80:continue
  var eye=body.position+Vector3.UP*(3.8 if e.boss else 1.6)
  var visible=dist<55 and has_los(eye,camera.global_position)
  if visible and dist<(38 if not key(KEY_CTRL) else 17):e.alert=true
  if not e.alert:
   body.velocity.y-=24*dt;body.move_and_slide();continue
  var dir=Vector3(offset.x,0,offset.z).normalized()
  if e.stun<=0:
   var move_speed=[4.0,8.5,2.1,3.3][e.kind]
   if e.boss:move_speed=2.0
   if (dist>11 or not visible or e.kind==1) and not e.boss:
    if not visible:
     if e.path_t<=0:
      e.path_t=0.8;e.path=Array(astar.get_point_path(safe_cell(body.position),safe_cell(player.position)))
     while e.path.size()>0 and Vector2(body.position.x,body.position.z).distance_to(e.path[0])<1.6:e.path.pop_front()
     if e.path.size()>0:dir=(Vector3(e.path[0].x,body.position.y,e.path[0].y)-body.position).normalized()
    body.velocity.x=dir.x*move_speed;body.velocity.z=dir.z*move_speed
   else:body.velocity.x=0;body.velocity.z=0
   if dir.length()>0.01:e.visual.root.rotation.y=atan2(dir.x,dir.z)
   for n in range(e.visual.limbs.size()):e.visual.limbs[n].rotation.x=sin(e.t*9+n*PI)*0.35 if body.velocity.length()>1 else 0
  else:body.velocity.x=0;body.velocity.z=0
  if not body.is_on_floor():body.velocity.y-=24*dt
  else:body.velocity.y=-0.8
  body.move_and_slide()
  if dist<(4.0 if e.boss else 1.8) and e.cd<=0:
   hurt(25 if e.boss else 14);e.cd=1.0
  elif visible and e.cd<=0 and e.kind!=1:
   e.cd=[1.7,1.0,2.6,2.1][e.kind]
   if e.boss:
    e.cd=1.0
    for n in range(5):
     var dir_shot=(camera.global_position-eye).normalized().rotated(Vector3.UP,(n-2)*0.13)
     enemy_shot(eye,dir_shot,14,17)
    if int(e.t)%7==0:
     for n in range(12):enemy_shot(eye,Vector3(cos(n*TAU/12),0,sin(n*TAU/12)),11,14)
   elif e.kind==2:
    for n in range(3):enemy_shot(eye,(camera.global_position-eye).normalized().rotated(Vector3.UP,(n-1)*0.18),13,13)
   else:enemy_shot(eye,(camera.global_position-eye).normalized(),21,12 if e.kind==0 else 18)
func enemy_shot(origin,dir,speed,dmg):
 var node=sphere(world,origin+dir*0.8,0.15,flat(Color('#ff3da3')),3,6)
 projectiles.append({"node":node,"v":dir*speed,"t":5.0,"enemy":true,"dmg":dmg})
func update_projectiles(dt):
 for b in projectiles:
  b.t-=dt
  if b.t<=0:
   if not b.enemy:explode(b.node.position,b.dmg)
   b.node.queue_free();continue
  var pos=b.node.position
  var detonated=false
  if not b.enemy:b.v.y-=dt*14
  var next=pos+b.v*dt
  if b.enemy and next.distance_to(camera.global_position)<0.7:
   hurt(b.dmg);b.t=0
  var result=ray(pos,next,1)
  if not result.is_empty():
   if not b.enemy:explode(result.position,b.dmg);detonated=true
   b.t=0
  elif not b.enemy:
   for i in range(enemies.size()):
    var e=enemies[i]
    if e.alive and next.distance_to(e.body.position+Vector3.UP*1.1)<(3.0 if e.boss else 1.1):explode(next,b.dmg);detonated=true;b.t=0;break
  b.node.position=next
  if b.t<=0:
   if not b.enemy and not detonated:explode(next,b.dmg)
   b.node.queue_free()
 projectiles=projectiles.filter(func(b):return b.t>0)
func detonate_barrel(index):
 var b=barrels[index]
 if not b.alive:return
 b.alive=false;b.body.visible=false;b.body.collision_layer=0
 explode(b.body.position,150)
func explode(pos,dmg):
 sound(55,0.25);spark(pos,Color('#e6f961'),18)
 for i in range(barrels.size()):
  var b=barrels[i]
  if b.alive and b.body.position.distance_to(pos)<5:detonate_barrel(i)
 var n=sphere(world,pos,2.5,flat(Color('#f78c92')),4,8);effects.append({"node":n,"t":0.1})
 for i in range(enemies.size()):
  var e=enemies[i];var distance=e.body.position.distance_to(pos)
  if e.alive and distance<9 and has_los(pos+Vector3.UP*0.3,e.body.position+Vector3.UP):damage_enemy(i,dmg*(1-distance/12))
func hurt(amount):
 if invuln>0 or state!="play":return
 hp-=amount;damage_flash=0.35;invuln=0.38;sound(70,0.12)
 if hp<=0:hp=0;metadata.deaths+=1;set_state("dead")
func dash():
 if dash_cd>0:return
 var dir=-player.global_basis.z
 player.velocity+=dir*24;player.velocity.y=max(player.velocity.y,4);invuln=0.5;dash_cd=2.8
 spark(player.position+Vector3.UP,Color('#b3f44b'),6);sound(120,0.1)
 # A collision-safe burst. move_and_collide prevents teleporting through walls.
 player.move_and_collide(dir*2.8)
func pulse():
 if pulse_cd>0:return
 pulse_cd=12;pulse_t=5;sound(580,0.2)
 var count=0
 for e in enemies:
  if e.alive and e.body.position.distance_to(player.position)<17:e.stun=3.5;e.alert=true;count+=1
 for b in projectiles:
  if b.enemy and b.node.position.distance_to(player.position)<17:
   b.t=0;credits+=1
 message("AUDIT SIGHT / %d minds interrupted. Nearby bullets liquidated."%count,Color('#86f3cf'))
func message(text,color=Color('#e5f585')):
 notices.append({"text":text,"color":color,"t":6.0})
 if notices.size()>3:notices.pop_front()
func find_interaction():
 interact_target=-1
 var best_score=0.0
 for i in range(items.size()):
  var item=items[i]
  if item.done:continue
  var at=item.node.global_position+Vector3.UP
  var distance=camera.global_position.distance_to(at)
  if distance>4.8:continue
  var angle=(-camera.global_basis.z).dot((at-camera.global_position).normalized())
  var score=angle-distance*0.025
  if angle>0.75 and score>best_score and has_los(camera.global_position,at):best_score=score;interact_target=i
func nearby_threats(pos,radius=15):
 return enemies.filter(func(e):return e.alive and not e.boss and e.body.position.distance_to(pos)<radius).size()
func interact(index):
 var item=items[index]
 if item.done:return
 match item.kind:
  "npc":talk(item.id)
  "clinic":
   hp=max_hp;checkpoint=player.position+Vector3.UP*0.2;reserves[0]=999;magazines[0]=12
   save_game();message("RECONSTRUCTED. Flesh restored. Checkpoint established.");sound(630,0.2)
  "shop":
   if credits<20:message("20 scrip buys a full ammunition refill. You have %d."%credits)
   else:
    credits-=20
    for i in range(5):reserves[i]+=[999,24,12,9,80][i];magazines[i]=capacities[i]
    hp=min(max_hp,hp+25);message("REFILLED / +25 flesh. You remain a valued revenue source.");save_game()
  "seal":
   if quests.main==0:message("No contract. Speak to Mother of Invoices at the Civic Wound first.");return
   if nearby_threats(item.pos,20)>0:message("TERMINAL CONTESTED / clear nearby security first.",Color('#ff82b6'));return
   item.done=true;item.node.visible=false;seals.append(item.id);credits+=30;quests.main=2 if seals.size()==3 else 1
   message("OWNERSHIP SEAL %d / 3. +30 scrip. The tower is listening."%seals.size());save_game()
  "worker":
   if quests.union==0:message("This contract needs a union counter-signature. Find Loan at Civic Wound.");return
   item.done=true;item.node.visible=false;freed.append(item.id);message("CONTRACT VOIDED. %d / 3 workers freed."%freed.size())
   if freed.size()==3:quests.union=2;max_hp=125;hp=max_hp;credits+=40;unlock_weapon(1);message("COLLECTIVE BARGAINING COMPLETE / MARROW unlocked. Maximum flesh +25.")
   save_game()
  "heart":
   if quests.courier==0:message("A heart packed for someone else. Dr. Nil may know why.");return
   item.done=true;item.node.visible=false;quests.courier=2;message("HEART ACQUIRED / Return it to Dr. Nil at the clinic.");save_game()
  "relay":
   if quests.broadcast==0:message("No transmission. Find Radio Angel by the canal.");return
   item.done=true;relays.append(item.id);item.tag.text="TRANSMITTING / YOU ARE NOT A PRODUCT"
   message("PIRATE SIGNAL %d / 3. The city hears a new voice."%relays.size())
   if relays.size()==3:quests.broadcast=2;credits+=60;unlock_weapon(2);message("PIRATE RADIO THERAPY COMPLETE / DIVIDEND rail driver unlocked.")
   save_game()
  "arena":
   if quests.arena==2:message("The review is over. You exceeded their expectations.");return
   if quests.arena==1:message("REVIEW IN PROGRESS / WAVE %d OF 3"%arena_wave);return
   quests.arena=1;arena_wave=0;spawn_arena_wave();message("PERFORMANCE REVIEW STARTED / three waves. Survive, then claim the siphon.")
  "fish":
   if quests.fish==2:message("The fish have unionized. Your work here is done.");return
   quests.fish=1;fish_clock=0;fish_target=rng.randf_range(0.3,0.7);set_state("fish")
  "memory":
   item.done=true;item.node.visible=false;memory_ids.append(item.id);secrets=memory_ids.size();credits+=8;hp=min(max_hp,hp+10);quests.memories=1
   message("MEMORY %d / 8. Someone remembers how rain used to smell."%secrets,Color('#caa5ff'))
   if secrets>=6:quests.memories=2;unlock_weapon(4);message("SIX MEMORIES REASSEMBLED / hidden ending available. DEBT COLLECTOR unlocked.")
   save_game()
  "cache":
   item.done=true;item.node.visible=false;collected.append(item.id);credits+=10;hp=min(max_hp,hp+20)
   for i in range(1,5):reserves[i]+=[0,12,6,4,30][i]
   message("LUNCH RETRIEVED / +20 flesh, ammunition and 10 scrip.");save_game()
  "weapon":
   item.done=true;item.node.visible=false;collected.append(item.id);unlock_weapon(item.index);save_game()
  "jump":
   player.velocity.y=23;player.velocity.z=-10;player.position.y+=0.4;message("PNEUMATIC ASCENSION / aim your landing. The bridge holds a prototype.");sound(180,0.2)
  "tower":
   if seals.size()<3:message("ACCESS DENIED / acquire three ownership seals. Press TAB for the map.");return
   if boss_dead:message("The final beneficiary is dead. Use the engine at the far end of the nave.");return
   if not boss_started:
    boss_started=true;spawn_enemy(Vector3(0,1,-105),3,"final_beneficiary",true);message("FINAL AUDIT / THE BENEFICIARY HAS ARRIVED.",Color('#ff72a8'));save_game()
  "ending":
   if not boss_dead:message("The dividend engine refuses to answer while its owner lives.");return
   set_state("ending")
func talk(id):
 var text=""
 match id:
  "mother":
   if quests.main==0:
    quests.main=1;tracked="main";text="You are the dividend. The city has been spending you. Bring me the three ownership seals: Fleshworks, Garden, and Residential Organism. Then enter God's Accounts Receivable. Do not mistake employment for a reason to live."
   elif seals.size()<3:text="Three departments hold the city's ownership seals. Clear their security and use their terminals. Your map knows the addresses. Optional work pays in weapons."
   elif not boss_dead:text="You own three pieces of paper. They believe that makes you a person. Go north. Let us see what the beneficiary thinks."
   else:text="The engine will offer you its chair. You can take it, break it, or remember who was ground into it. Choose with care."
  "union":
   if quests.union==0:quests.union=1;tracked="union";text="They leased our bodies for a hundred years. Three workers are held around the Fleshworks. Open their contracts and I will give you something that negotiates in flechettes. We can win something small."
   elif quests.union==2:text="Three workers walk without permission. That is a real thing you did. The shotgun is yours."
   else:text="Three contract cells. West of the centre. Follow the U markers on your map. Get them home."
  "doctor":
   if quests.courier==0:quests.courier=1;tracked="courier";text="A patient ordered a replacement heart. It was delivered to Residential Organism, where the landlord mistook it for rent. Find the insulated package inside the leasing office. I can pay you in a rail driver."
   elif quests.courier==2:quests.courier=3;credits+=50;unlock_weapon(2);hp=max_hp;text="Still beating. Better than most deliveries. Here is the Dividend driver. It penetrates bodies, though architecture remains stubborn. Thank you for bringing something back alive."
   elif quests.courier==3:text="Your patient is well. I did not tell them what the heart cost."
   else:text="Residential Organism. The leasing office. The little warm box in the back. Bring it to me."
  "pirate":
   if quests.broadcast==0:quests.broadcast=1;tracked="broadcast";text="This city has forgotten silence because every thought is an advert. Climb the three canal transmitters and retune them. The ramps go to the rooftops. Let us put an unprofitable idea in the air."
   elif quests.broadcast==2:text="People are hearing their own thoughts again. Some of them are very strange. Good."
   else:text="Three transmitters on the canal towers. Climb the ramps. The signal belongs to whoever cares enough to change it."
 hud.dialogue_title={"mother":"MOTHER OF INVOICES","union":"LOAN / UNION STEWARD","doctor":"DR. NIL","pirate":"RADIO ANGEL"}.get(id,id)
 hud.dialogue_text=text
 set_state("dialogue");save_game()
func unlock_weapon(index):
 if owned[index]:reserves[index]+=capacities[index]*2;return
 owned[index]=true;reserves[index]+=capacities[index]*3
 message("WEAPON ACQUIRED / "+weapon_names[index]+" / press "+str(index+1),Color('#7dfbc7'));sound(760,0.25)
func spawn_arena_wave():
 arena_wave+=1;arena_enemies=[]
 for i in range(3+arena_wave):
  var pos=Vector3(79+(i%3)*10,1,-89+(i/3)*9)
  var index=spawn_enemy(pos,(i+arena_wave)%4,"arena_%d_%d"%[arena_wave,i]);enemies[index].alert=true;arena_enemies.append(index)
 message("PERFORMANCE REVIEW / WAVE %d OF 3"%arena_wave,Color('#ff87b5'))
func fish_press():
 var cursor=(sin(fish_clock*2.5)+1)/2
 if abs(cursor-fish_target)<0.15:
  fish_caught+=1;fish_target=rng.randf_range(0.2,0.8);sound(650,0.15)
  if fish_caught>=3:
   quests.fish=2;credits+=45;unlock_weapon(3);set_state("play");message("THREE IMPOSSIBLE FISH / CYST organ mortar acquired. Fishing remains honest.");save_game()
 else:sound(90,0.12);message("The fish rejects your timing. Try again.")
func respawn():
 hp=max_hp;credits=max(0,credits-10);player.position=checkpoint;player.velocity=Vector3.ZERO;invuln=3
 for b in projectiles:b.node.queue_free()
 projectiles.clear();set_state("play");message("REASSEMBLED / progress retained. 10 scrip reconstruction fee.");save_game()
func finish_game(choice):
 if choice==2 and (secrets<6 or freed.size()<3):message("This choice needs six memories and three freed workers.",Color('#ff82b0'));return
 ending=choice;quests.main=4;set_state("won");save_game()
func cycle_quest():
 var active=[]
 for id in quests:
  if quests[id]>0 and not quest_done(id):active.append(id)
 if active.is_empty():tracked="main";return
 var i=active.find(tracked);tracked=active[(i+1)%active.size()]
func quest_done(id):
 if id=="main":return quests.main>=4
 if id=="courier":return quests.courier>=3
 return quests[id]>=2
func quest_description(id):
 match id:
  "main":
   if quests.main==0:return "Speak with Mother of Invoices in Civic Wound."
   if seals.size()<3:return "Acquire the three ownership seals: %d / 3. Clear terminal security."%seals.size()
   if not boss_started:return "Enter God's Accounts Receivable. Activate the final audit."
   if not boss_dead:return "Defeat the Final Beneficiary in the northern tower."
   if quests.main<4:return "Use the Dividend Engine. Decide what winning means."
   return "The city has received your answer."
  "union":return "Free the three Fleshworks contract workers: %d / 3. Reward: MARROW +25 max flesh."%freed.size()
  "courier":return "Return the insulated heart to Dr. Nil." if quests.courier==2 else "Retrieve the heart inside Residential Organism. Reward: DIVIDEND rail driver."
  "broadcast":return "Climb and retune the three canal transmitters: %d / 3. Reward: DIVIDEND +60 scrip."%relays.size()
  "arena":return "Survive three arcade waves: %d / 3. Reward: DEBT COLLECTOR +70 scrip."%arena_wave
  "fish":return "Catch three fish at the canal: %d / 3. Reward: CYST organ mortar."%fish_caught
  "memories":return "Recover at least six memories: %d / 8. Reward: SIPHON and the hidden ending."%secrets
 return "Explore. Someone here needs something."
func objective_items():
 var ids=[]
 match tracked:
  "main":
   if quests.main==0:ids=["mother"]
   elif seals.size()<3:ids=["seal_flesh","seal_garden","seal_housing"]
   elif not boss_dead:ids=["tower"]
   else:ids=["exit"]
  "union":ids=["worker0","worker1","worker2"]
  "courier":ids=["doctor"] if quests.courier==2 else ["heart"]
  "broadcast":ids=["relay0","relay1","relay2"]
  "arena":ids=["arena"]
  "fish":ids=["fish"]
  "memories":
   for i in range(8):ids.append("memory%d"%i)
 return items.filter(func(item):return item.id in ids and not item.done)
func district():
 var p=Vector2(player.position.x,player.position.z);var best=regions[0];var distance=10000.0
 for r in regions:
  var d=p.distance_to(r.pos)
  if d<distance:best=r;distance=d
 return best
func save_game():
 if test_mode:return
 var data={"version":2,"position":[player.position.x,player.position.y,player.position.z],"checkpoint":[checkpoint.x,checkpoint.y,checkpoint.z],"yaw":yaw,"pitch":pitch,"hp":hp,"max_hp":max_hp,"credits":credits,"kills":kills,"seals":seals,"freed":freed,"relays":relays,"memory_ids":memory_ids,"collected":collected,"dead_ids":dead_ids,"quests":quests,"owned":owned,"magazines":magazines,"reserves":reserves,"boss_started":boss_started,"boss_dead":boss_dead,"fish_caught":fish_caught,"equipped":equipped,"metadata":metadata,"ending":ending}
 var f=FileAccess.open(ROOT_SAVE,FileAccess.WRITE)
 if f:f.store_string(JSON.stringify(data))
func load_game():
 if not FileAccess.file_exists(ROOT_SAVE):new_game();return
 var data=JSON.parse_string(FileAccess.get_file_as_string(ROOT_SAVE))
 if not data is Dictionary or data.get("version",0)!=2:message("Save unavailable. Starting a new dividend.");new_game();return
 new_game_from_data(data)
func new_game_from_data(d):
 hp=max(1,d.hp);max_hp=d.max_hp;credits=d.credits;kills=d.kills
 seals=d.seals;freed=d.freed;relays=d.relays;memory_ids=d.memory_ids;collected=d.collected;dead_ids=d.dead_ids
 secrets=memory_ids.size();quests=d.quests;owned=d.owned;magazines=d.magazines;reserves=d.reserves
 boss_started=d.boss_started;boss_dead=d.boss_dead;fish_caught=d.fish_caught;equipped=int(d.equipped);metadata=d.metadata;ending=int(d.ending)
 for b in projectiles:b.node.queue_free()
 projectiles.clear()
 checkpoint=Vector3(d.checkpoint[0],d.checkpoint[1],d.checkpoint[2]);player.position=Vector3(d.position[0],d.position[1]+0.2,d.position[2]);player.velocity=Vector3.ZERO
 yaw=d.yaw;pitch=d.pitch;player.rotation.y=yaw;camera.rotation.x=pitch
 for item in items:
  item.done=item.id in seals or item.id in freed or item.id in memory_ids or item.id in collected or item.id in relays or (item.id=="heart" and quests.courier>=2)
  item.node.visible=not item.done
 for e in enemies:
  e.alive=not e.id in dead_ids and not str(e.id).begins_with("arena_") and (not e.boss or (boss_started and not boss_dead))
  e.hp=e.max;e.body.visible=e.alive;e.body.collision_layer=2 if e.alive else 0;e.alert=false
 if boss_started and not boss_dead and not enemies.any(func(e):return e.boss and e.alive):spawn_enemy(Vector3(0,1,-105),3,"final_beneficiary",true)
 if quests.arena==1:arena_wave=0;spawn_arena_wave()
 build_gun();invuln=2;reload_t=0;fire_cd=0;set_state("play");message("DIVIDEND RESTORED / your city remembers you.")
func save_preferences():
 var cfg=ConfigFile.new();cfg.set_value("options","muted",muted);cfg.set_value("options","reduced",reduced);cfg.save("user://preferences.cfg")
func load_preferences():
 var cfg=ConfigFile.new()
 if cfg.load("user://preferences.cfg")==OK:muted=cfg.get_value("options","muted",false);reduced=cfg.get_value("options","reduced",false)
 screen.stretch_shrink=1 if reduced else 2
func setup_audio():
 music=AudioStreamPlayer.new();var stream=AudioStreamGenerator.new();stream.mix_rate=22050;stream.buffer_length=0.15;music.stream=stream;add_child(music);music.play();playback=music.get_stream_playback()
func sound(freq,duration=0.1):sound_freq=freq;sound_left=duration
func fill_audio():
 if not playback:return
 var available=playback.get_frames_available()
 for i in range(available):
  var t=float(sample_clock)/22050.0
  var sequence=[55.0,65.4,58.27,82.4,55.0,73.4,58.27,49.0]
  var beat=int(t*3.8);var f=sequence[(beat/2)%8]
  var saw=(fmod(t*f,1.0)*2-1)*0.021
  var pulse_wave=sin(t*f*TAU)*0.025
  var arp=sin(t*f*8*TAU)*exp(-fmod(t,1.0/3.8)*19)*0.025
  var drum=sin(t*(42+exp(-fmod(t,0.5263)*50)*90)*TAU)*exp(-fmod(t,0.5263)*17)*0.07
  var noise=sin(t*7121)*sin(t*4793)*exp(-fmod(t,0.26315)*80)*0.016
  var s=saw+pulse_wave+arp+drum+noise
  if sound_left>0:s+=sin(t*sound_freq*TAU)*min(1,sound_left*25)*0.11;sound_left-=1.0/22050
  if muted:s=0
  playback.push_frame(Vector2(s,s));sample_clock+=1
func _exit_tree():
 playback=null
 if is_instance_valid(music):music.stop()
