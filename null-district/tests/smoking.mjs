import assert from 'node:assert/strict';
import {createSmoking,SMOKE_COOLDOWN} from '../systems/smoking.js';
const s=createSmoking(),player={hp:40};
assert.ok(s.start());assert.equal(s.start(),false);s.tick(1.4,player);assert.equal(player.hp,40,'Health arrives on exhale, never on clicking');s.tick(.1,player);assert.equal(player.hp,65);s.tick(1.5,player);assert.equal(player.hp,65,'Each puff heals once');assert.equal(s.state.phase,null);assert.equal(s.start(),false,'Cooldown survives animation completion');
s.cancel();assert.equal(s.start(),false,'Holstering does not erase cooldown');s.tick(20,player);assert.ok(s.start());s.cancel();s.tick(2,player);assert.equal(player.hp,65,'Canceled inhale does not grant health');assert.equal(s.start(),false);
s.reset();player.hp=95;s.start();s.tick(1.5,player);assert.equal(player.hp,100,'Health caps at 100');s.tick(20,player);assert.ok(s.start(),'Cosmetic puff remains usable at full health');s.tick(1.5,player);assert.equal(player.hp,100);
s.reset();player.hp=0;s.start();s.tick(2,player);assert.equal(player.hp,0,'No resurrection');s.reset(SMOKE_COOLDOWN/2);assert.equal(s.state.cooldown,6);assert.equal(s.state.puffs,0);s.tick(6,player);assert.ok(s.start());
console.log('PASS: heal timing, one heal per puff, 12-second cooldown, canceled use, holster persistence, health cap, cosmetic puff, no resurrection, carry/reset.');
