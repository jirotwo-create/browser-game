export const SMOKE_COOLDOWN=12;
export const SMOKE_HEAL=25;
export const SMOKE_DURATION=2.8;
// Gameplay time only: holstering cannot reset the cooldown or duplicate a heal.
export function createSmoking(){
 let cooldown=0,phase=null,healed=false,puffs=0,heals=0;
 return {
  start(){if(cooldown>0||phase!==null)return false;cooldown=SMOKE_COOLDOWN;phase=0;healed=false;puffs++;return true;},
  cancel(){phase=null;healed=false;},
  reset(remaining=0){cooldown=remaining;phase=null;healed=false;puffs=heals=0;},
  tick(dt,player){
   cooldown=Math.max(0,cooldown-dt);let restored=0;
   if(phase!==null){phase+=dt;if(phase>=1.45&&!healed){healed=true;if(player.hp>0){restored=Math.min(SMOKE_HEAL,100-player.hp);player.hp+=restored;if(restored>0)heals++;}}if(phase>=SMOKE_DURATION)phase=null;}
   return restored;
  },
  get state(){return {cooldown,phase,puffs,heals,healAmount:SMOKE_HEAL,cooldownDuration:SMOKE_COOLDOWN};}
 };
}
