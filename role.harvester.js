var roleBuilder = require("role.builder");

module.exports = {

    run: function(creep) {
        // Updates creep's memory variables
        creep.update();

        if (!creep.memory.working) {
            // Sends creep to gather enerygy
            creep.getEnergy(true, true, true);
        } else {
            // Make sure all extensions are filled before considering Spawners/Towers
            const extension = creep.pos.findClosestByPath(FIND_MY_STRUCTURES,
                {filter: (s) => (s.structureType == STRUCTURE_EXTENSION &&
                                s.energy < s.energyCapacity)});
            if (extension != undefined) {
                if (creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.signaledMove(extension);
                }
                return;
            }

            // Find all Spawners and Towers in the room
            let targets = creep.room.find(FIND_MY_STRUCTURES,
                {filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
                                 s.structureType == STRUCTURE_TOWER)});
            // Priority is givven to the ones the least full
            targets = _.sortBy(targets, (t) => t.energy/t.energyCapacity);

            if (targets.length > 0 && targets[0].energy != targets[0].energyCapacity) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.signaledMove(targets[0]);
                }
            } else {
                roleBuilder.run(creep);
            }
        }
    }
};
