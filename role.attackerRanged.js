
module.exports = {

    run: function(creep) {
        if (creep.room.name != creep.memory.target) {
            const exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByPath(exit));
        } else {
            const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            //const temp = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.hits < 100});
            if (target != undefined) {
                //creep.rangedAttack(temp);
                creep.rangedAttack(target);

                if (creep.pos.getRangeTo(target) < 3) {
                    creep.moveAway(target);
                } else if (creep.pos.getRangeTo(target) > 3) {
                    creep.signaledMove(target);
                }
            } else {
                const structure = creep.pos.findClosestByPath(FIND_STRUCTURES,
                    {filter: (s) => s.structureType == STRUCTURE_SPAWN});
                if (creep.rangedAttack(structure) == ERR_NOT_IN_RANGE)
                    creep.signaledMove(structure);
                else if (creep.pos.getRangeTo(structure) < 3)
                    creep.moveAway(structure);
            }
        }
    }
};
