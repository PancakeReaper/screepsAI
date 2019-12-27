var roleBuilder = require("role.builder");

module.exports = {

    run: function(creep) {
        // Updates creep's memory variables
        creep.update();

        if (!creep.memory.working) {
            // Sends creep to gather enerygy
            creep.getEnergy(true, true, true);
        } else {
            // Selecting the target to fill up
            if (creep.memory.energy == undefined) {
                // Make sure spawner and all extensions are filled before considering Towers
                const extension = creep.pos.findClosestByPath(FIND_MY_STRUCTURES,
                    {filter: (s) => (s.structureType == STRUCTURE_EXTENSION ||
                                    s.structureType == STRUCTURE_SPAWN) &&
                                    s.store[RESOURCE_ENERGY] < s.store.getCapacity([RESOURCE_ENERGY])});
                if (extension != undefined)
                    creep.memory.energy = extension.id;

                // If all extensions/spawns are filled then find other structures
                else {
                    let structures = creep.room.find(FIND_MY_STRUCTURES,
                        {filter: (s) => s.structureType != STRUCTURE_LINK &&
                                        s.store != undefined && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY)});
                    structures = _.sortBy(structures, (s) => s.store[RESOURCE_ENERGY] / s.store.getCapacity(RESOURCE_ENERGY));
                    if (structures != undefined && structures.length > 0)
                        creep.memory.energy = structures[0].id;
                    else
                        roleBuilder.run(creep);
                }
            }

            // Transfer energy to the target specified in memory, afterwards get new target
            const target = Game.getObjectById(creep.memory.energy);
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.signaledMove(target);
            } else {
                delete creep.memory.energy;
            }
        }
    }
};
