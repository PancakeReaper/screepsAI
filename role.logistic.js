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
            if (creep.checkForDroppedResources(50, true))
                return;
            if (creep.memory.container == undefined) {
                // Only get energy from containers that are close to being full
                const container = creep.pos.findClosestByPath(FIND_STRUCTURES,
                    {filter: (s) => s.structureType == STRUCTURE_CONTAINER &&
                                    _.sum(s.store) / s.storeCapacity > 0.6});
                if (container != undefined)
                    creep.memory.container = container.id;
            }

            if (creep.memory.container != undefined) {
                const container = Game.getObjectById(creep.memory.container);
                    for (const resourceType in container.store) {
                        if (creep.withdraw(container, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.signaledMove(container);
                        } else {
                            delete creep.memory.container;
                        }
                    }
            } else if (creep.room.storage != undefined && creep.room.terminal != undefined) {
                for (const resourceType in creep.room.storage.store) {
                    if (resourceType != RESOURCE_ENERGY) {
                        if (creep.withdraw(creep.room.storage, resourceType) == ERR_NOT_IN_RANGE)
                            creep.signaledMove(creep.room.storage);
                        else
                            creep.memory.storage = creep.room.terminal.id;
                    }
                }
            }
        } else {
            if (creep.memory.storage == undefined) {
                // Store energy in the room's storage
                const storage = creep.room.storage;
                const terminal = creep.room.terminal;
                if (terminal != undefined && storage != undefined) {
                    if (_.sum(storage.store) / storage.storeCapacity < _.sum(terminal.store) / terminal.storeCapacity)
                        creep.memory.storage = storage.id;
                    else
                        creep.memory.storage = terminal.id;
                } else if (storage != undefined) {
                    creep.memory.storage = storage.id;
                } else if (terminal != undefined) {
                    creep.memory.storage = terminal.id;
                }

            }

            if (creep.memory.storage != undefined) {
                const target = Game.getObjectById(creep.memory.storage);
                for (const resourceType in creep.carry) {
                    if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.signaledMove(target);
                    } else {
                        delete creep.memory.storage;
                    }
                }
            }
        }
    }
};
