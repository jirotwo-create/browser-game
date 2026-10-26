extends SceneTree
func _initialize():call_deferred("run")
func aim(g,at):
 g.camera.look_at(at)
func run():
 var g=load("res://game.gd").new();root.add_child(g);g.test_mode=true;g.set_process(false);g.set_physics_process(false)
 g.new_game();g.owned=[true,true,true,true,true]
 for e in g.enemies:e.body.collision_layer=0;e.alive=false;e.body.visible=false
 g.player.position=Vector3(0,0.05,30);g.player.rotation.y=0
 var passed=0
 for weapon in [0,1,2,4]:
  var ei=g.spawn_enemy(Vector3(0,0.05,20),3,"weapon_test_%d"%weapon)
  g.enemies[ei].hp=1000;g.enemies[ei].max=1000
  await physics_frame
  aim(g,g.enemies[ei].body.position+Vector3.UP*1.5)
  g.equip(weapon);g.fire_cd=0;g.reload_t=0;g.hp=50;g.fire()
  var hurt=g.enemies[ei].hp<1000
  var healed=g.hp>50 if weapon==4 else true
  print(g.weapon_short[weapon]," ACTUAL HIT: ",hurt," HEAL: ",healed)
  if hurt and healed:passed+=1
  g.enemies[ei].alive=false;g.enemies[ei].body.collision_layer=0
 # Piercing rail: two separate colliders along the ray.
 var a=g.spawn_enemy(Vector3(0,0.05,20),3,"pierce_front")
 var b=g.spawn_enemy(Vector3(0,0.05,15),3,"pierce_back")
 await physics_frame
 aim(g,g.enemies[a].body.position+Vector3.UP*1.5)
 g.equip(2);g.fire_cd=0;g.fire()
 var pierced=g.enemies[a].hp<g.enemies[a].max and g.enemies[b].hp<g.enemies[b].max
 print("RAIL PIERCES TWO BODIES: ",pierced)
 if pierced:passed+=1
 g.enemies[a].alive=false;g.enemies[a].body.collision_layer=0;g.enemies[b].alive=false;g.enemies[b].body.collision_layer=0
 var e=g.spawn_enemy(Vector3(0,0.05,20),3,"mortar_test")
 await physics_frame
 aim(g,g.enemies[e].body.position+Vector3.UP*0.7)
 g.equip(3);g.fire_cd=0;g.fire()
 for i in range(100):
  g.update_projectiles(0.016)
  await physics_frame
 var mortar=g.enemies[e].hp<g.enemies[e].max
 print("MORTAR PROJECTILE + SPLASH: ",mortar)
 if mortar:passed+=1
 # A hostile projectile crossing the camera must deal damage.
 g.hp=100;g.invuln=0;g.set_state("play")
 g.enemy_shot(g.camera.global_position+Vector3(0,0,-3),Vector3(0,0,1),15,12)
 for i in range(15):g.update_projectiles(0.016);await physics_frame
 var hit=g.hp<100
 print("HOSTILE PROJECTILE HIT: ",hit)
 if hit:passed+=1
 print("LIVE COMBAT ",passed,"/7")
 g.free();quit(0 if passed==7 else 1)
