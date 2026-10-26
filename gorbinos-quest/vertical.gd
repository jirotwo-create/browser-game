extends SceneTree
func _initialize():call_deferred("run")
func walk(g,from,to,speed=5.0):
 g.player.position=from;g.player.velocity=Vector3.ZERO
 await physics_frame
 var steps=0
 while Vector2(g.player.position.x,g.player.position.z).distance_to(Vector2(to.x,to.z))>0.4 and steps<500:
  var dir=(to-g.player.position);dir.y=0;dir=dir.normalized()
  g.player.velocity.x=dir.x*speed;g.player.velocity.z=dir.z*speed
  g.player.velocity.y-=24.0/60.0
  g.player.move_and_slide()
  await physics_frame
  steps+=1
 return steps<500 and g.player.position.y>to.y-0.8
func run():
 var g=load("res://game.gd").new();root.add_child(g);g.test_mode=true;g.set_process(false);g.set_physics_process(false)
 await physics_frame
 for e in g.enemies:e.body.collision_layer=0
 var passed=0
 for k in range(3):
  var loc=Vector3(-108+k*20,0,87+(k%2)*15)
  var ok=await walk(g,loc+Vector3(0,1,23),loc+Vector3(0,6,0))
  print("TRANSMITTER ",k+1,": ",ok," at ",g.player.position)
  if ok:passed+=1
 var ok=await walk(g,Vector3(48,1,80),Vector3(48,10,47))
 print("ROOF RAMP: ",ok," at ",g.player.position)
 if ok:passed+=1
 ok=await walk(g,g.player.position,Vector3(72,10,47))
 print("SKYBRIDGE: ",ok," at ",g.player.position)
 if ok:passed+=1
 print("VERTICAL TRAVERSAL ",passed,"/5")
 g.free();quit(0 if passed==5 else 1)
