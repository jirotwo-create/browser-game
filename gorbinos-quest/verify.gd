extends SceneTree
var checks=0
func check(ok,label):
 checks+=1
 if not ok:
  push_error("FAIL: "+label)
  quit(1)
  assert(ok,label)
func _initialize():
 call_deferred("run")
func run():
 var g=load("res://game.gd").new()
 root.add_child(g)
 g.set_process(false)
 g.start_run(12345)
 check(g.enemies.size()==4,"initial enemies")
 check(not g.blocked(g.p,14),"spawn clear")
 g.phase=0;g.shift_cd=0;g.shift_world();check(g.phase==1,"reality shift")
 g.invuln=0;g.hurt(20);check(g.hp==80,"damage")
 g.hurt(20);check(g.hp==80,"invulnerability")
 g.dash_cd=0;g.dash();check(g.dash_t>0,"dash active")
 var m=g.money
 g.shoot(g.p,Vector2.ZERO,true,g.phase,0,10)
 g.update_game(0.01)
 check(g.absorbed==1 and g.money==m+2,"dash absorbs bullets into scrip")
 for r in g.relics: g.apply_relic(r)
 check(g.ricochet==2 and g.spread==1 and g.leech==1 and g.orbit==1,"graft effects")
 check(g.damage>16 and g.speed>235 and g.maxhp==130 and g.shot_rate<0.24,"graft scaling")
 # Real projectile impact, phase isolation, walls, economy, and one-time secrets.
 g.enemies.clear();g.bullets.clear();g.phase=0;g.p=Vector2(640,600)
 g.spawn_enemy(Vector2(640,400),0,0)
 var target=g.enemies[0]
 target.hp=1;g.shoot(target.p,Vector2.ZERO,false,0,0,20)
 g.update_game(0.01);check(not target.alive,"projectile kills enemy")
 g.enemies.clear();g.bullets.clear();g.cleared=false
 g.spawn_enemy(Vector2(640,400),0,1)
 target=g.enemies[0]
 var initial_hp=target.hp
 g.shoot(target.p,Vector2.ZERO,false,0,0,20)
 g.update_game(0.01);check(target.hp==initial_hp,"opposite reality is protected")
 g.bullets.clear();g.walls=[Rect2(300,300,100,100)]
 g.shoot(Vector2(285,350),Vector2.RIGHT,false,0,620,10,2)
 g.update_game(0.02);check(g.bullets[0].v.x<0 and g.bullets[0].bounce==1,"wall ricochet")
 check(g.move_actor(Vector2(280,350),Vector2(30,0),14).x==280,"movement blocks walls")
 g.phase=1;g.p=Vector2(1120,650);g.money=100;g.cleared=false
 g.interact();check(g.liberated==1 and g.money==88,"free stranger")
 g.interact();check(g.liberated==1 and g.money==88,"stranger cannot be bought twice")
 g.state="shop";g.choices=g.relics.slice(0,2);g.money=0
 g.choose(0);check(g.state=="shop" and g.money==0,"cannot overspend")
 g.pickups=[{"p":g.p,"phase":1,"type":"secret","alive":true}]
 var memory_count=g.secrets
 g.update_game(0.01);g.update_game(0.01)
 check(g.secrets==memory_count+1,"memory collected once")
 for f in range(6):
  for r in range(4):
   g.floor_no=f;g.room_no=r;g.new_room()
   check(not g.blocked(g.p,14),"spawn is valid")
   for e in g.enemies:
    check(not g.blocked(e.p,18),"enemy spawn valid")
   # Exercise AI, patterns, bullets, collision and rendering state for each room.
   g.invuln=1000
   for step in range(90): g.update_game(0.016)
   for e in g.enemies: g.kill_enemy(e)
   g.update_game(0.016)
   check(g.cleared,"room clears")
   g.p=Vector2(640,160);g.interact()
   if r==3:
    if f==5:check(g.state=="ending","final ending gate")
    else:
     check(g.state=="choice","boss grants graft")
     g.choose(0);check(g.floor_no==f+1 and g.room_no==0,"floor advance")
   elif r==1:
    check(g.state=="shop","shop appears")
    g.choose(2);check(g.room_no==2 and g.state=="play","free shop exit")
   else:check(g.room_no==r+1,"room advance")
 g.state="ending";g.secrets=0;g.liberated=0;g.choose(2)
 check(g.state=="ending","secret ending locked")
 g.secrets=9;g.liberated=3;g.choose(2)
 check(g.state=="won" and g.selection==2,"secret ending unlock")
 for i in range(2):
  g.state="ending";g.choose(i);check(g.state=="won","standard ending")
 g.start_run(12345);g.invuln=0;g.hurt(999)
 check(g.state=="dead","death")
 print("PASS: ",checks," gameplay checks, all 24 rooms, 3 endings")
 g.free()
 quit()
