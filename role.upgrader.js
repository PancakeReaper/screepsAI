
module.exports = {

    run: function(creep) {
        // Updates creep's memory variables
        creep.update();

        if (!creep.memory.working) {
            // Sends creep to gather Engery
            creep.getEnergy(true, true, true);
        } else {
            creep.signaledMove(creep.room.controller);
            creep.upgradeController(creep.room.controller);
        }
    }
};
