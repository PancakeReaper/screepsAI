
module.exports = {

    run: function(creep) {

        if (creep.room.name != creep.memory.target) {

//            const healerFlag = Game.flags.healerFlag;
//            if (healerFlag != undefined) {
//                creep.signaledMove(healerFlag);
//                return;
//            }
            const exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByPath(exit));
        } else {

            const healerFlag = Game.flags.healerFlag;
            if (healerFlag != undefined) {
                creep.signaledMove(healerFlag);
            }
            // Repair anything thats not a wall or rampart to max
            const hurtAllies = creep.pos.findClosestByPath(FIND_MY_CREEPS,
                {filter: (s) => s.hits < s.hitsMax
            });
            const enemy = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

            if (hurtAllies != undefined) {
                if (creep.heal(hurtAllies) == ERR_NOT_IN_RANGE) {
                    creep.signaledMove(hurtAllies);
                }
            } else if (creep.pos.getRangeTo(enemy) < 3) {
                creep.moveAway(enemy);
            } else {
                const allies = creep.pos.findClosestByPath(FIND_MY_CREEPS,
                    {filter: (c) => c.memory.role == 'attacker' ||
                                    c.memory.role == 'attackerRanged'});
                creep.moveTo(allies);
            }
        }
    }
};
