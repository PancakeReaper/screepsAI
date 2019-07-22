
module.exports = {

    run: function(creep) {
        // Updates creep's memory variables
        creep.update();

        if (!creep.memory.working) {
            if (creep.memory.minerals == undefined) {
                const minerals = creep.room.find(FIND_MINERALS, {filter: (m) => m.mineralAmount > 0});
                if (minerals.length > 0)
                    creep.memory.minerals = minerals[0].id;
            }

            if (creep.memory.minerals != undefined) {
                const minerals = Game.getObjectById(creep.memory.minerals);
                if (creep.harvest(minerals) == ERR_NOT_IN_RANGE)
                    creep.signaledMove(minerals);
            }
        } else {
            // Deposit minerals in storage
            if (creep.memory.storage == undefined) {
                const storage = creep.room.storage;
                if (storage != undefined)
                    creep.memory.storage = storage.id;
            }

            // Transfer energy to the target specified in memory, afterwards get new target
            const target = Game.getObjectById(creep.memory.storage);
            for (const resourceType in creep.carry) {
                if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                    creep.signaledMove(target);
                }
            }
        }
    }
};
