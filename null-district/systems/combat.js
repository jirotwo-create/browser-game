// Plain-data combat state; rendering and collision are supplied by the game.
export function stepEnemy(e,dt,c){
 const p=e.g.position,dx=c.player.x-p.x,dz=c.player.z-p.z,dist=Math.hypot(dx,dz);
 const sight=dist<29&&c.canSee(p,c.player),info=e.info;
 if(sight)e.alert=true;
 e.shot=Math.max(0,e.shot-dt);
 let moving=false;
 if(e.attack){
  e.attack.elapsed+=dt;
  if(e.attack.elapsed>=info.windup){
   const a=e.attack;e.attack=null;e.shot=info.cooldown;
   const current=Math.hypot(c.player.x-p.x,c.player.z-p.z);
   if(c.canSee(p,c.player)){
    if(info.role==='melee'){
     const facing=Math.sin(a.yaw)*(c.player.x-p.x)+Math.cos(a.yaw)*(c.player.z-p.z);
     if(current<info.range+.35&&facing/Math.max(.01,current)>.4)c.hurt(info.damage);
    }else if(info.role==='rifle'||info.role==='burst'){
     // Aim locks during the tell. Strafing and cover both evade the shot.
     const angle=Math.abs(Math.atan2(Math.sin(Math.atan2(c.player.x-p.x,c.player.z-p.z)-a.yaw),Math.cos(Math.atan2(c.player.x-p.x,c.player.z-p.z)-a.yaw)));
     c.shot(e,a.target,angle<.11&&current<29);
    }else c.projectile(e,a.target);
   }
  }
 }else{
  e.g.rotation.y=Math.atan2(dx,dz);
  const desired=info.role==='melee'?info.range*.78:info.range*.8;
  if(e.alert&&dist>desired){
   const angle=Math.atan2(dx,dz)+(info.role==='melee'?0:Math.sin(c.time*.8+e.phase)*.35);
   const next={x:p.x,z:p.z};c.move(next,Math.sin(angle)*dt*info.speed,Math.cos(angle)*dt*info.speed,e.type==='gargoyle'?.55:.32);
   if(Math.hypot(next.x-c.player.x,next.z-c.player.z)>1){moving=Math.hypot(next.x-p.x,next.z-p.z)>.001;p.set(next.x,0,next.z)}
  }else if(e.alert&&info.role!=='melee'&&dist<4){
   const next={x:p.x,z:p.z};c.move(next,-dx/Math.max(.1,dist)*dt*info.speed,-dz/Math.max(.1,dist)*dt*info.speed);p.set(next.x,0,next.z);moving=true;
  }
  if(sight&&dist<info.range&&e.shot===0){
   e.attack={elapsed:0,yaw:e.g.rotation.y,target:{x:c.player.x,y:c.player.y-.35,z:c.player.z}};
   c.tell(e);
  }
 }
 return moving;
}
// Segment/sphere intersection prevents fast projectiles tunneling through the player.
export function playerHitDistance(a,b,p,r=.38){
 const vx=b.x-a.x,vy=b.y-a.y,vz=b.z-a.z,ox=a.x-p.x,oy=a.y-(p.y-.35),oz=a.z-p.z;
 const length2=vx*vx+vy*vy+vz*vz,c=ox*ox+oy*oy+oz*oz-r*r;
 if(c<=0)return 0;if(length2===0)return null;
 const dot=ox*vx+oy*vy+oz*vz,discriminant=dot*dot-length2*c;
 if(discriminant<0)return null;const t=(-dot-Math.sqrt(discriminant))/length2;
 return t>=0&&t<=1?t*Math.sqrt(length2):null;
}
export function segmentHitsPlayer(a,b,p,r=.38){return playerHitDistance(a,b,p,r)!==null}
