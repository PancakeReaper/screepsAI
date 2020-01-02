
module.exports = {

    run: function(creep) {

        if (creep.memory.container == undefined) {
            // Find a container has a source adjacent, have no other creep ontop, and is not full
            const container = creep.pos.findClosestByPath(FIND_STRUCTURES,
                {filter: (s) => s.structureType == STRUCTURE_CONTAINER &&
                                (creep.pos.isEqualTo(s) || !s.pos.lookFor(LOOK_CREEPS).length) &&
                                s.pos.findInRange(FIND_SOURCES, 2).length > 0 &&
                                s.store.getUsedCapacity() < s.store.getCapacity()});
            if (container != undefined)
                creep.memory.container = container.id;
            else {
                creep.say("NO CONTAINER");
                return;
            }
        }
        const container = Game.getObjectById(creep.memory.container);

        if (!creep.pos.isEqualTo(container.pos)) {
            creep.signaledMove(container);
            // Resolves container conflicts between other quarries
            //delete creep.memory.container;  // <- there should be a better way to do this
        } else {
            const energy_source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
            if (creep.harvest(energy_source) == ERR_NOT_IN_RANGE) {
                creep.say("Out of range");
            }
            if (container.store.getUsedCapacity() < container.store.getCapacity()) {
                creep.room.visual.text(container.store.getUsedCapacity() +
                    "/" +
                    container.store.getCapacity(), creep.pos);
            } else {
                let dropped = creep.pos.lookFor(LOOK_ENERGY);
                if (dropped.length)
                    creep.room.visual.text("+" + dropped[0].amount, creep.pos, {color: 'green'});
            }
        }
    }
};
