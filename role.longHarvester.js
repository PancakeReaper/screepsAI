var roleHarvester = require("role.harvester");

module.exports = {

    /**
     * A distance harvester for gather energy from different rooms
     */
    run: function(creep) {
        // Updates creep's memory variables
        creep.update();

        if (!creep.memory.working) {
            // If in target room gather energy, otherwise move to target room
            if (creep.room.name == creep.memory.target) {
                // Sends creep to gather enerygy
                creep.getEnergy(true, true, true);
            } else {
                const exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(creep.pos.findClosestByPath(exit));
            }
        } else {
            // If in home room then supply, otherwise move to home room
            if (creep.room.name == creep.memory.home) {
                // Store energy in the closest container or storage
                const target = creep.pos.findClosestByPath(FIND_STRUCTURES,
                    {filter: (s) => (s.structureType == STRUCTURE_CONTAINER ||
                                    s.structureType == STRUCTURE_STORAGE) &&
                                    s.store.getUsedCapacity() < s.store.getCapacity()});

                if (target != undefined) {
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.signaledMove(target);
                    }
                } else {
                    roleHarvester.run(creep);
                }
            } else {
                const exit = creep.room.findExitTo(creep.memory.home);
                creep.moveTo(creep.pos.findClosestByPath(exit));
            }
        }
    }
};
