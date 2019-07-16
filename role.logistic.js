const roleHarvester = require("role.harvester");

module.exports = {

    run: function(creep) {
        // Updates creep's memory variables
        creep.update();

        const energy = creep.room.find(FIND_STRUCTURES,
            {filter: (s) => (s.structureType == STRUCTURE_EXTENSION ||
                            s.structureType == STRUCTURE_SPAWN) &&
                            s.energy < s.energyCapacity});

        if (energy.length > 0) {
            roleHarvester.run(creep);
            return;
        }

        if (!creep.memory.working) {
            if (creep.memory.container == undefined) {
                // Only get energy from containers that are close to being full
                const container = creep.pos.findClosestByPath(FIND_STRUCTURES,
                    {filter: (s) => s.structureType == STRUCTURE_CONTAINER &&
                                    s.store[RESOURCE_ENERGY] / s.storeCapacity > 0.75});
                if (container != undefined)
                    creep.memory.container = container.id;
            }

            if (creep.memory.container != undefined) {
                const container = Game.getObjectById(creep.memory.container);
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.signaledMove(container);
                } else {
                    delete creep.memory.container;
                }
            }
        } else {
            if (creep.memory.storage == undefined) {
                // Store energy in the room's storage
                const storage = creep.pos.findClosestByPath(FIND_STRUCTURES,
                    {filter: (s) => (s.structureType == STRUCTURE_EXTENSION &&
                                    s.energy < s.energyCapacity) ||
                                    s.structureType == STRUCTURE_STORAGE});
                if (storage != undefined)
                    creep.memory.storage = storage.id;
            }

            if (creep.memory.storage != undefined) {
                const target = Game.getObjectById(creep.memory.storage);
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.signaledMove(target);
                } else {
                    delete creep.memory.storage;
                }
            }
        }
    }
};
