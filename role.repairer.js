
var roleBuilder = require("role.builder");

module.exports = {

    run: function(creep) {


        // Updates creep's memory variables
        creep.update();
        if (!creep.memory.working) {
            // Sends creep to gather energy (no storage)
             creep.getEnergy(true, true, false);
        } else {
            // Move to target room before doing anything
            if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
                const exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(creep.pos.findClosestByPath(exit));
                return;
            }

            // Repair anything thats not a wall or rampart to max
            const structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) =>
                (s.structureType != STRUCTURE_WALL &&
                s.structureType != STRUCTURE_RAMPART &&
                s.hits < s.hitsMax) ||
                (s.structureType == STRUCTURE_CONTAINER &&
                s.hits < s.hitsMax)
            });
//            console.log(structure);
            if (structure != undefined) {
                if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                    creep.signaledMove(structure);
                }
            } else {
                roleBuilder.run(creep);
            }
        }
    }
};
