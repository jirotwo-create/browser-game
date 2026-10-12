import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,reduce} from '../engine.js';
test('3D animation events identify the actual monster and only animate resolved retaliations',()=>{
 const base=reduce(fresh(),{type:'BEGIN'});base.battle.hp=base.battle.maxHp=1000;
 const normal=reduce(base,{type:'TURN',move:'attack'});assert.equal(normal.combatFx.enemyKind,base.battle.kind);assert.equal(normal.combatFx.enemyAttack,'normal');assert.equal(base.combatFx,null);
 const heavy=reduce({...base,battle:{...base.battle,turn:3}},{type:'TURN',move:'guard'});assert.equal(heavy.combatFx.enemyAttack,'heavy');
 const silent=reduce({...base,battle:{...base.battle,turn:3,effects:{curse:{power:0,amp:0,turns:2,silence:true}}}},{type:'TURN',move:'guard'});assert.equal(silent.combatFx.enemyAttack,'normal');
 const killing=reduce({...base,battle:{...base.battle,hp:1}},{type:'TURN',move:'attack'});assert.equal(killing.combatFx.victory,true);assert.equal(killing.combatFx.enemyKind,base.battle.kind);assert.equal(killing.combatFx.enemyAttack,undefined);
 const rejected=reduce(base,{type:'TURN',move:'eclipse'});assert.equal(rejected.combatFx,null);
});
