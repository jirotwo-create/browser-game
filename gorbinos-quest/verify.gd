extends SceneTree
var checks=0
var failures=[]
func verify(ok,label):
 checks+=1
 if not ok:failures.append(label);push_error("FAIL: "+label)
func item_index(g,id):
 for i in range(g.items.size()):
  if g.items[i].id==id:return i
 return -1
func use(g,id):g.interact(item_index(g,id))
func _initialize():call_deferred("run")
func run():
 var g=load("res://game.gd").new();root.add_child(g);g.test_mode=true
 g.set_process(false);g.set_physics_process(false)
 await physics_frame
 g.new_game()
 await physics_frame
 verify(g.player is CharacterBody3D and g.camera is Camera3D,"real 3D player and camera")
 verify(g.enemies.size()>=25,"authored encounters")
 verify(g.items.size()>=40,"populated world")
 verify(g.regions.size()==7,"seven connected districts")
 # Ground objectives must be reachable through the authored street and door network.
 var origin=g.safe_cell(g.checkpoint)
 for it in g.items:
  if it.pos.y>3 or it.kind in ["jump"]:continue
  var target=g.safe_cell(it.pos)
  var path=g.astar.get_id_path(origin,target)
  verify(not path.is_empty(),"navigation to "+it.id)
 # No quest item may be buried inside an obstacle; use the actual physics world.
 for it in g.items:
  var q=PhysicsPointQueryParameters3D.new();q.position=it.pos+Vector3.UP*0.6;q.collision_mask=1
  var hits=g.player.get_world_3d().direct_space_state.intersect_point(q)
  verify(hits.is_empty(),"quest item clear of static geometry: "+it.id)
 g.talk("mother");verify(g.quests.main==1,"main quest begins")
 g.talk("union");verify(g.quests.union==1,"union quest begins")
 for i in range(3):use(g,"worker%d"%i)
 verify(g.freed.size()==3 and g.quests.union==2 and g.owned[1] and g.max_hp==125,"union rewards shotgun and health")
 use(g,"worker0");verify(g.freed.size()==3,"workers cannot be freed twice")
 g.talk("doctor");use(g,"heart");verify(g.quests.courier==2,"heart acquired")
 g.talk("doctor");verify(g.quests.courier==3 and g.owned[2],"courier returns heart and rewards railgun")
 g.talk("pirate")
 for i in range(3):use(g,"relay%d"%i)
 verify(g.quests.broadcast==2 and g.relays.size()==3,"pirate transmission complete")
 g.set_state("play")
 for i in range(6):use(g,"memory%d"%i)
 verify(g.secrets==6 and g.quests.memories==2 and g.owned[4],"memory quest unlocks siphon and ending")
 var memory_count=g.secrets;use(g,"memory0");verify(g.secrets==memory_count,"memories single use")
 use(g,"fish")
 for i in range(3):g.fish_target=0.5;g.fish_clock=0;g.fish_press()
 verify(g.quests.fish==2 and g.fish_caught==3 and g.owned[3],"fishing rewards mortar")
 use(g,"arena")
 for wave in range(3):
  verify(g.arena_wave==wave+1,"arena wave progression")
  for ei in g.arena_enemies:g.damage_enemy(ei,9999)
  if wave<2:g.spawn_arena_wave()
  else:
   g.set_state("play");g._physics_process(0.016)
 verify(g.quests.arena==2,"arena completion")
 # Main terminals are contested until nearby guards are removed.
 var seal=item_index(g,"seal_flesh")
 g.seals=[];g.items[seal].done=false
 use(g,"seal_flesh");verify(g.seals.is_empty(),"terminal blocks while contested")
 for i in range(g.enemies.size()):g.damage_enemy(i,9999)
 for id in ["seal_flesh","seal_garden","seal_housing"]:use(g,id)
 verify(g.seals.size()==3 and g.quests.main==2,"all three seals unlock tower")
 use(g,"tower");verify(g.boss_started and g.enemies[-1].boss,"final audit starts")
 g.damage_enemy(g.enemies.size()-1,99999)
 verify(g.boss_dead and g.quests.main==3,"boss defeat unlocks engine")
 use(g,"exit");verify(g.state=="ending","engine opens ending selection")
 g.secrets=0;g.finish_game(2);verify(g.state=="ending","hidden ending requires memories")
 g.secrets=6;g.finish_game(2);verify(g.state=="won" and g.ending==2,"hidden ending completes")
 for i in range(2):g.set_state("ending");g.finish_game(i);verify(g.state=="won" and g.ending==i,"standard ending")
 # Real hitscan against a fresh physics collider.
 g.set_state("play");g.player.position=Vector3(0,1,30);g.yaw=0;g.pitch=0;g.player.rotation.y=0;g.camera.rotation.x=0
 var ei=g.spawn_enemy(Vector3(0,1,20),0,"test_hitscan")
 await physics_frame
 var initial=g.enemies[ei].hp
 g.equip(0);g.fire_cd=0;g.reload_t=0;g.magazines[0]=12;g.fire()
 verify(g.enemies[ei].hp<initial,"actual hitscan damages physics target")
 var spent=g.magazines[0]
 g.fire();verify(g.magazines[0]==spent,"fire rate limits shots")
 g.magazines[0]=0;g.reload_weapon();verify(g.reload_t>0,"reload starts")
 g._physics_process(2.0);verify(g.magazines[0]==12,"pistol reloads from infinite reserve")
 g.hp=100;g.invuln=0;g.hurt(10);verify(g.hp==90,"player damage")
 g.hurt(10);verify(g.hp==90,"damage invulnerability")
 g.pulse_cd=0;g.enemies[ei].alive=true;g.enemies[ei].hp=100;g.pulse()
 verify(g.enemies[ei].stun>=3,"audit sight stuns nearby guards")
 g.credits=0;use(g,"hub_shop");verify(g.credits==0,"shop cannot overspend")
 g.credits=30;g.hp=50;use(g,"hub_shop");verify(g.credits==10 and g.hp==75,"vending heals and refills")
 g.hp=1;use(g,"clinic");verify(g.hp==g.max_hp,"clinic restores flesh")
 g.invuln=0;g.hurt(999);verify(g.state=="dead","player death")
 g.respawn();verify(g.state=="play" and g.hp==g.max_hp,"checkpoint respawn")
 # Save / load round-trip through a real isolated user-data file.
 g.test_mode=false;g.credits=123;g.hp=77;g.save_game()
 g.credits=0;g.hp=1;g.owned[2]=false;g.load_game()
 verify(g.credits==123 and g.hp==77 and g.owned[2],"save and load restore progress")
 g.test_mode=true
 g.detonate_barrel(0);verify(not g.barrels[0].alive,"volatile tanks detonate")
 g.owned=[true,true,true,true,true]
 for i in range(5):g.equip(i);verify(g.equipped==i,"weapon selectable")
 print("CHECKS: ",checks," / FAILURES: ",failures.size())
 for fail in failures:print("FAILED: ",fail)
 g.free();quit(1 if not failures.is_empty() else 0)
