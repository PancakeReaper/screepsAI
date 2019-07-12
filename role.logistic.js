
module.exports = {

    run: function(creep) {
        // Updates creep's memory variables
        creep.update();

        if (!creep.memory.working) {
            // Only get energy from containers that are close to being full
            const container = creep.pos.findClosestByPath(FIND_STRUCTURES,
                {filter: (s) => s.structureType == STRUCTURE_CONTAINER &&
                            s.store[RESOURCE_ENERGY] / s.storeCapacity > 0.75});

            if (container != undefined) {
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.signaledMove(container);
                }
            }
        } else {
            // Store energy in the room's storage
            const target = creep.room.storage;

            if (target != undefined) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.signaledMove(target);
                }
            }
        }
    }
};
