extends SceneTree
func _initialize():call_deferred("run")
func run():
 var g=load("res://game.gd").new();root.add_child(g);g.test_mode=true;g.set_process(false);g.set_physics_process(false);g.new_game()
 await physics_frame
 for e in g.enemies:e.body.collision_layer=0
 var passed=0
 for id in ["mother","doctor","union","seal_flesh","seal_garden","heart","tower","exit","pirate","arena"]:
  var target
  for item in g.items:
   if item.id==id:target=item;break
  var path=g.astar.get_point_path(g.safe_cell(g.player.position),g.safe_cell(target.pos))
  var blocked=false
  for point in path:
   var dest=Vector3(point.x,g.player.position.y,point.y)
   var steps=0
   while Vector2(g.player.position.x,g.player.position.z).distance_to(point)>0.45 and steps<80:
    var delta=(dest-g.player.position);delta.y=0;delta=delta.normalized()*0.24
    var result=g.player.move_and_collide(delta)
    if result:
     var slide=delta.slide(result.get_normal())
     g.player.move_and_collide(slide)
    g.player.velocity=Vector3(0,-2,0);g.player.move_and_slide()
    steps+=1
    await physics_frame
   if steps>=80:blocked=true;break
  var near=g.player.position.distance_to(target.pos)<5
  print(id,": ","PASS" if not blocked and near else "BLOCKED", " at ",g.player.position," target ",target.pos)
  if not blocked and near:passed+=1
 print("TRAVERSAL ",passed,"/10 objectives reached through physical movement")
 g.free();quit(0 if passed==10 else 1)
