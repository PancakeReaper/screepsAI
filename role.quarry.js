var cb = require("controlBoard");

module.exports = {

    run: function(creep) {
        if (cb.speakYourRole) creep.say(creep.memory.role);

        // Find a container has a source adjacent, have no other creep ontop, and is not full
        const container = creep.pos.findClosestByPath(FIND_STRUCTURES,
            {filter: (s) => s.structureType == STRUCTURE_CONTAINER &&
                            (creep.pos.isEqualTo(s) || !s.pos.lookFor(LOOK_CREEPS).length) &&
                            s.pos.findInRange(FIND_SOURCES, 2) != undefined &&
                            _.sum(s.store) < s.storeCapacity});
        const energy_source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);

        if (container == undefined)
            creep.say("No available container found");
        else if (!creep.pos.isEqualTo(container.pos))
            creep.signaledMove(container);
        else if (energy_source != undefined) {
            if (creep.harvest(energy_source) == ERR_NOT_IN_RANGE) {
                creep.say("Source out");
            } else {
                creep.room.visual.text(_.sum(container.store) + "/" + container.storeCapacity, creep.pos);
            }
        }
    }
};
