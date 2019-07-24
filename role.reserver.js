
module.exports = {

    run: function(creep) {

        if (creep.room.name != creep.memory.target) {
            // Find and move toward the exit to target room
            const exit = creep.room.findExitTo(creep.memory.target);
            creep.signaledMove(creep.pos.findClosestByPath(exit));
        } else {
            if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE)
                creep.signaledMove(creep.room.controller);
        }
    }

};
