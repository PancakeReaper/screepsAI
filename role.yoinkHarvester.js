
module.exports = {

    run: function(creep) {
        // Updates creep's memory variables
        creep.update();

        if (!creep.memory.working) {
            // If in target room gather energy, otherwise move to target room
            if (creep.room.name == creep.memory.target) {
                let target = creep.pos.findClosestByPath(FIND_STRUCTURES,
                    {filter: (s) => ((s.structureType == STRUCTURE_CONTAINER ||
                                     s.structureType == STRUCTURE_STORAGE) &&
                                     s.store[RESOURCE_ENERGY] > creep.carryCapacity) ||
                                    (s.structureType == STRUCTURE_EXTENSION ||
                                     s.structureType == STRUCTURE_SPAWN) &&
                                     s.energy > 10});

                if (target != undefined) {
                    if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.signaledMove(target);
                    } else {
                        creep.say("YOINK");
                    }
                }
            } else {
                let exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(creep.pos.findClosestByPath(exit));
            }
        } else {
            // If in home room then supply, otherwise move to home room
            if (creep.room.name == creep.memory.home) {
                // Find closest structure that can hold onto ALL the energy
                const target = creep.pos.findClosestByPath(FIND_STRUCTURES,
                    {filter: (s) => ((s.structureType == STRUCTURE_EXTENSION ||
                                    s.structureType == STRUCTURE_SPAWN) &&
                                    s.energy + _.sum(creep.carry) < s.energyCapacity) ||
                                    ((s.structureType == STRUCTURE_CONTAINER ||
                                    s.structureType == STRUCTURE_STORAGE) &&
                                    s.store[RESOURCE_ENERGY] > 0)});

                if (target != undefined) {
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.signaledMove(target);
                    }
                }
            } else {
                let exit = creep.room.findExitTo(creep.memory.home);
                creep.moveTo(creep.pos.findClosestByPath(exit));
            }
        }
    }
};
