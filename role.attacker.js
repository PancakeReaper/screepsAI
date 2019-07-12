
module.exports = {
    run: function(creep) {
        if (creep.room.name != creep.memory.target) {
            const exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByPath(exit));
        } else {
            const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (target != undefined) {
                if (creep.attack(target) == ERR_NOT_IN_RANGE)
                    creep.signaledMove(target);
            } else {
                const structure = creep.pos.findClosestByPath(FIND_STRUCTURES,
                    {filter: (s) => s.structureType == STRUCTURE_SPAWN ||
                        s.structureType == STRUCTURE_EXTENSION});
                if (creep.attack(structure) == ERR_NOT_IN_RANGE)
                    creep.signaledMove(structure);
            }
        }
    }
};
