
var roleBuilder = require("role.builder");
var cb = require("controlBoard");

module.exports = {

    run: function(creep) {
        // Updates creep's memory variables
        creep.update();

        if (!creep.memory.working) {
            // Sends creep to gather energy
            creep.getEnergy(true, true, true);
        } else {
            // Repair ramparts to cb.repairWallsTo and anything other non-walls to max
            const structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) =>
                (s.structureType != STRUCTURE_WALL &&
                s.hits < s.hitsMax) ||
                (s.structureType != STRUCTURE_RAMPART &&
                s.hits < cb.repairWallsTo)
            });
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
