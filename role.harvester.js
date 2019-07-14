var roleBuilder = require("role.builder");

module.exports = {

    run: function(creep) {
        // Updates creep's memory variables
        creep.update();

        if (!creep.memory.working) {
            // Sends creep to gather enerygy
            creep.getEnergy(true, true, true);
        } else {
            // Make sure spawner and all extensions are filled before considering Towers
            const extension = creep.pos.findClosestByPath(FIND_MY_STRUCTURES,
                {filter: (s) => (s.structureType == STRUCTURE_EXTENSION ||
                                s.structureType == STRUCTURE_SPAWN) &&
                                s.energy < s.energyCapacity});
            if (extension != undefined) {
                if (creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.signaledMove(extension);
                }
                return;
            }

            // Find all Spawners and Towers in the room
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES,
                {filter: (s) => s.structureType != STRUCTURE_LINK &&
                                s.energy < s.energyCapacity});

            if (target != undefined) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.signaledMove(target);
                }
            } else {
                roleBuilder.run(creep);
            }
        }
    }
};
