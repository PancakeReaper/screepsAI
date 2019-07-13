const roleBuilder = require("role.builder");

module.exports = {

    run: function(creep) {

        if (creep.room.name != creep.memory.target) {
            // Find and move toward the exit to target room
            const exit = creep.room.findExitTo(creep.memory.target);
            creep.signaledMove(creep.pos.findClosestByPath(exit));
        } else {
            if (!creep.room.controller.my) {
                creep.signaledMove(creep.room.controller);
                if (creep.room.controller.owner != undefined)
                    creep.attackController(creep.room.controller);
                else
                    creep.claimController(creep.room.controller);
            } else {
                roleBuilder.run(creep);
            }
        }
    }

};
