extends SceneTree
func _initialize():call_deferred("run")
func run():
 var g=load("res://game.gd").new();root.add_child(g);root.size=Vector2i(1280,800)
 await process_frame
 for i in range(12):await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("user://3d-title.png")
 g.test_mode=true;g.new_game();g.invuln=1000
 for i in range(12):await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("user://3d-civic.png")
 g.player.position=Vector3(-80,1,5);g.yaw=0.3;g.player.rotation.y=g.yaw;g.pitch=0;g.camera.rotation.x=0
 for i in range(12):await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("user://3d-flesh.png")
 g.player.position=Vector3(0,1,-45);g.yaw=0;g.player.rotation.y=0
 g.owned[2]=true;g.equip(2)
 for i in range(12):await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("user://3d-tower.png")
 g.set_state("map")
 await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("user://3d-map.png")
 quit()
