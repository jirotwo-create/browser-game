extends SceneTree
func _initialize(): call_deferred("run")
func run():
 var g=load("res://game.gd").new()
 root.add_child(g)
 root.size=Vector2i(1280,800)
 await process_frame
 await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("user://title.png")
 g.start_run(42)
 g.p=Vector2(640,450)
 g.invuln=100
 for i in range(120):
  await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("user://gameplay.png")
 quit()
