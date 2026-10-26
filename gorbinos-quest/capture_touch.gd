extends SceneTree
func _initialize():call_deferred("run")
func run():
 var g=load("res://game.gd").new();root.add_child(g);root.size=Vector2i(1280,800);g.test_mode=true
 g.new_game();g.invuln=1000
 for i in range(12):await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("user://android-touch.png")
 g.set_state("pause")
 await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png("user://android-pause.png")
 quit()
